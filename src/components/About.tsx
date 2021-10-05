import "./About.sass";

export default function About() {
	return (
		<div className="about">
			<div className="about-header"><b>About this app</b></div>
			<div>
				This app enables you to view GeoTIFF Digital Elevation Models in 3D.
			</div>
			<div>
				It's different from other apps because it uses <a href="https://github.com/matafokka/geotiff-geokeys-to-proj4">this library</a> which allows to support almost any projection which other apps doesn't do (for now). In fact, this app is demo for that library.
			</div>
			<div>
				Love the idea? Check out <a href="https://github.com/matafokka/geotiff-3d-dem-viewer">the source code</a>!
			</div>
		</div>
	)
}