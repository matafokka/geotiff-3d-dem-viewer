import * as geokeysToProj4 from "geotiff-geokeys-to-proj4";
import proj4 from "proj4";
import {Cartesian3, Color, CustomHeightmapTerrainProvider, GeographicTilingScheme, Rectangle, Viewer} from "cesium";
import {polygon} from "@turf/helpers";
import {ModalImagesSelector} from "../components/ModalImagesSelector";
import LoadingWindow from "../components/LoadingWindow";
import bbox from "@turf/bbox";

const tilingScheme = new GeographicTilingScheme();

/**
 * File statistics and bounding rectangle
 */
export interface FileData {
	name: string,
	min: number,
	max: number,
	mean: number,

	/**
	 * Bounding rectangle of all images in this file. Use it to zoom to the file.
	 */
	rectangle: Rectangle
}

interface FileEntries {
	[id: string]: {
		proj4projection: proj4.Converter,
		originX: number, originY: number,
		imageData: Array<number>,
		boundingRect: Rectangle,
		rightX: number, bottomY: number, width: number, height: number,
		heightMultiplier: number,
	}[]
}

/**
 * Manages GeoTIFF files. Use its exported instance.
 */
class GeoTIFFManager {
	private readonly size = 32;
	private readonly width = this.size;
	private readonly height = this.size;
	private readonly fileEntries: FileEntries;
	public readonly terrainProvider: CustomHeightmapTerrainProvider;
	public viewer: Viewer | undefined
	public imageSelector: ModalImagesSelector | null = null;
	public loadingWindow: LoadingWindow | null = null;

	constructor() {
		this.fileEntries = {};
		this.terrainProvider = new CustomHeightmapTerrainProvider({
			width: this.width,
			height: this.height,
			tilingScheme,
			callback: (x, y, level) => {
				return this.getTerrainData(x, y, level);
			}
		});
	}

	/**
	 * Reads the file and adds it to the {@link GeoTIFFManager#fileEntries}
	 * @param file A file to add
	 * @param geoTiff GeoTIFF instance
	 * @param indices Image indices to add
	 * @throws {Error} When image is not georeferenced
	 * @return Data to pass to the menu item
	 */
	addFile = async (file: File, geoTiff: any, indices: Iterable<number>): Promise<FileData> => {

		let min = +Infinity,
			max = -Infinity,
			mean = 0,
			pixelCount = 0,
			rectangle: Rectangle | null = null,
			images = [];

		for (let i of indices) {
			const image = await geoTiff.getImage(i);

			const projectionParameters = geokeysToProj4.toProj4(image.getGeoKeys()), // Convert geokeys to proj4 string
				proj4projection = proj4(projectionParameters.proj4, "WGS84"); // Get projection to WGS84

			// Get dimensions to determine pixel position in source CRS
			let [originX, originY] = image.getOrigin(),
				width = image.getWidth(),
				height = image.getHeight(),
				[xSize, ySize, zScale] = image.getResolution(),
				nodata = image.getGDALNoData();

			// Fix missing Z scale
			if (zScale === 0)
				zScale = 1;

			// Rest of the coordinates for the top and left sides. Needed to determine pixel position.
			const rightX = originX + width * xSize, bottomY = originY + height * ySize;

			// Build bounding rect, image polygon and data for further math

			// Original image rectangle
			const origPoints = [
				[originX, originY],
				[rightX, originY],
				[originX + width * xSize, originY + height * ySize],
				[originX, bottomY],
				[originX, originY],
			];

			// Projected image rectangle
			let projPoints = [];
			for (let point of origPoints)
				projPoints.push(proj4projection.forward(point));

			// Bounding rect to detect whether image should be read later
			const boundingRect = Rectangle.fromDegrees(...bbox(polygon([projPoints])));

			if (rectangle === null)
				rectangle = boundingRect;
			else
				Rectangle.union(rectangle, boundingRect, rectangle);

			// Output useful data and show image outline in dev mode.
			if (process.env.NODE_ENV !== "production") {
				console.log(projectionParameters);

				const pts = [...projPoints.slice(0, projPoints.length - 1)];
				const newPts = [];
				for (let pt of pts) {
					for (let c of pt)
						newPts.push(c);
				}

				this.viewer?.entities.add({
					polygon: {
						// @ts-ignore
						hierarchy: Cartesian3.fromDegreesArray(newPts),
						height: 1000,
						material: Color.RED.withAlpha(0.5),
						outline: true,
						outlineColor: Color.RED
					}
				});
			}

			// Read image and get optimal TypedArray instance to save some RAM
			const imageData = new ((await image.readRasters([0, 1, 0, 1]))[0]).constructor(width * height);

			// Convert image to grayscale and collect statistics
			for (let y = 0; y < height; y++) {
				// Read one row of pixels. Easier to deal with coordinates, takes less RAM.
				const rasters = await image.readRasters({window: [0, y, width, y + 1]});
				let rasterLength = rasters[0].length;

				for (let x = 0; x < rasterLength; x++) {
					// Convert pixel to grayscale
					let pixel = 0;
					for (let raster of rasters)
						pixel += raster[x];
					pixel = (pixel === nodata) ? 0 : pixel / rasters.length;
					imageData.set([pixel], y * width + x);

					// Calculate statistics
					if (pixel < min)
						min = pixel;
					if (pixel > max)
						max = pixel;
					mean += pixel;

					pixelCount++;
				}
			}

			images.push({
				proj4projection,
				imageData,
				boundingRect,
				rightX,
				bottomY,
				originX,
				originY,
				width,
				height,
				heightMultiplier: 1,
			});

		}

		this.fileEntries[file.name] = images;
		return {
			name: file.name,
			min,
			max,
			mean: mean / pixelCount,
			rectangle: rectangle as Rectangle,
		}
	}

	getTerrainData = (tileX: number, tileY: number, level: number): Float32Array => {
		const tileRect = tilingScheme.tileXYToRectangle(tileX, tileY, level); // Tile rectangle to detect whether image should be read

		// Get tile rect coordinates for coordinate conversion and to find how much degrees is in tile pixel for X and Y
		const {west, east, north, south} = tileRect,
			toDeg = 180 / Math.PI,
			topLeftX = west * toDeg,
			topLeftY = north * toDeg,
			bottomRightX = east * toDeg,
			bottomRightY = south * toDeg,
			degInPxX = Math.abs(bottomRightX - topLeftX) / this.width,
			degInPxY = Math.abs(bottomRightY - topLeftY) / this.height,
			buffer = new Float32Array(this.width * this.height); // Buffer to return to Cesium

		// For each GeoTIFF file and each image in it
		for (let id in this.fileEntries) {
			let entry = this.fileEntries[id];

			for (let img of entry) {
				// Optimize performance by not reading files outside of tile
				if (!Rectangle.simpleIntersection(tileRect, img.boundingRect))
					continue;

				// Read current image
				for (let x = 0; x < this.width; x++) {
					for (let y = 0; y < this.height; y++) {

						// Convert pixel position to lon lat and project it to the image CRS
						const globalX = topLeftX + x * degInPxX, globalY = topLeftY - y * degInPxY,
							[projX, projY] = img.proj4projection.inverse([globalX, globalY]);

						// Get pixel position by finding at which % of the side lies current position. Then multiply it by image width/height to convert % to px.
						const imageX = Math.floor(img.width * (projX - img.originX) / (img.rightX - img.originX)),
							imageY = Math.floor(img.height * (projY - img.originY) / (img.bottomY - img.originY));

						// Some debug data in case something will go wrong
						// if (level === 12 && tileX === 2635 && tileY === 944)
						// 	console.log(imageX, imageY, projX, projY);

						// Don't add points outside of image
						if (imageX < 0 || imageX >= img.width || imageY < 0 || imageY >= img.height)
							continue;

						// Set pixel value. Both Cesium and our program uses row-major order.
						buffer.set([img.imageData[imageY * img.width + imageX] * img.heightMultiplier], y * this.width + x);
					}

				}
			}
		}
		return buffer;
	}

	/**
	 * Removes a file with given name from the manager
	 * @param name Filename to remove
	 */
	removeFile = (name: string) => {
		delete this.fileEntries[name];
	}

	/**
	 * Sets a height multiplier for a given file name
	 * @param fileName
	 * @param multiplier
	 */
	setHeightMultiplier = (fileName: string, multiplier: number) => {
		if (multiplier < 1)
			multiplier = 1;
		else if (multiplier > 1000)
			multiplier = 1000;

		let entries = this.fileEntries[fileName];
		for (let entry of entries)
			entry.heightMultiplier = multiplier;
	}
}

/**
 * Manager singleton
 */
export default new GeoTIFFManager();