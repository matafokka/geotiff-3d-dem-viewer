import "./Menu.sass";
import React, {ChangeEvent, useState} from "react";
import {useDetectClickOutside} from "react-detect-click-outside";
import CesiumToolbarButton from "./CesiumToolbarButton";
import Input from "./Input";
import MenuItem from "./MenuItem";
import manager, {FileData} from "../etc/GeoTIFFManager";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import {fromBlob} from "geotiff";
import ConfirmRemovalWindow from "./ConfirmRemovalWindow";
import ReadingErrorWindow
, {ReadingErrors} from "./ReadingErrorWindow";

interface MenuProps {
	confirmWindow: ConfirmRemovalWindow,
	errorWindow: ReadingErrorWindow,
}

export default function Menu(props: MenuProps) {
	let menuRef = useDetectClickOutside({onTriggered: () => setMenuOpen(false)});

	let [menuOpen, setMenuOpen] = useState(false);
	let [openFiles, setOpenFiles] = useState<FileData[]>([]);

	let addFiles = async (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0)
			return;

		let newNames: FileData[] = [], newFiles: {file: File, geoTiff: any, indices: Iterable<number>}[] = [];

		// Get images to add in case multi-image file

		let errors: ReadingErrors = {}, errorOccurred = false;

		for (let file of e.target.files) {
			let geoTiff
			try {
				geoTiff = await fromBlob(file);
			} catch (e) {
				errorOccurred = true;
				errors[file.name] = "file is not valid TIFF image";
				continue;
			}

			let imageCount = await geoTiff.getImageCount();

			let indices;
			if (imageCount > 1)
				indices = await manager.imageSelector?.getImagesToUse(imageCount, file.name);

			// It won't happen in case above, but leave it here just to make TS shut up
			if (!indices)
				indices = [0];

			newFiles.push({file, geoTiff, indices});
		}

		manager.loadingWindow?.show();

		// Actually add files
		for (let f of newFiles) {
			try {
				let data = await manager.addFile(f.file, f.geoTiff, f.indices);
				newNames.push(data);
			} catch (e: any) {
				errorOccurred = true;
				if (e.message === "not_georeferenced")
					errors[f.file.name] = "file is not georeferenced";
				else
					console.log(e);
			}
		}

		setOpenFiles(openFiles => [...openFiles, ...newNames]);
		manager.loadingWindow?.hide();

		if (errorOccurred)
			props.errorWindow.show(errors);
	}

	let deleteFile = (name: string) => {
		props.confirmWindow.confirm(name, (isYes) => {
			if (!isYes)
				return;
			manager.removeFile(name);
			setOpenFiles(openFiles.filter(value => value.name !== name));
		});
	}

	let setHeightMultiplier = (fileName: string, multiplier: number) => {
		manager.setHeightMultiplier(fileName, multiplier);
	}

	return (
		<div className="menu-wrapper" ref={menuRef}>
			<CesiumToolbarButton icon={faBars} className="menu-button" onClick={() => setMenuOpen(!menuOpen)} />
			<div className={`cesium-baseLayerPicker-dropDown ${menuOpen ? "cesium-baseLayerPicker-dropDown-visible" : ""}`} >

				<Input type="file" multiple={true} accept=".tiff, .tif, .geotiff, .geotif" label="Add GeoTIFFs!" expand={true} onChange={addFiles}/>

				{openFiles.map((data, i) => (
					<MenuItem data={data} onDelete={deleteFile} onHeightMultiplierChange={setHeightMultiplier} key={i}/>
				))}

			</div>
		</div>
	);

}