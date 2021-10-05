import React, {Fragment, useEffect, useRef} from "react";
import * as Cesium from "cesium";
import {Viewer, CesiumComponentRef} from "resium";
import Menu from "./components/Menu";
import ReactDOM from "react-dom";
import manager from "./etc/GeoTIFFManager";
import About from "./components/About";
import {ModalImagesSelector} from "./components/ModalImagesSelector";
import LoadingWindow from "./components/LoadingWindow";
import ConfirmRemovalWindow from "./components/ConfirmRemovalWindow";
import ReadingErrorWindow from "./components/ReadingErrorWindow";

// Only default datasets here. Just get your own token, duh.
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYzU3YTBlOS0yMDQ2LTQwYmYtODgyMy0xNDE3NTk5MjI5ODIiLCJpZCI6NjkyOTUsImlhdCI6MTYzMzM3NTA2MH0.DLePjLG_HAwKijwBbkQ18JFblYzTneLFGm94E8xN6Po";

const dummyContainer = document.createElement("div");

function App() {
	let cesiumRef = useRef<CesiumComponentRef<Cesium.Viewer>>(null);
	let imageSelector = useRef<ModalImagesSelector>(null);
	let loadingWindow = useRef<LoadingWindow>(null);
	let confirmWindow = useRef<ConfirmRemovalWindow>(null);
	let errorWindow = useRef<ReadingErrorWindow>(null);

	useEffect(() => {
		if (!cesiumRef?.current?.cesiumElement)
			return;

		const viewer = cesiumRef.current.cesiumElement;

		manager.viewer = viewer;
		manager.imageSelector = imageSelector.current;
		manager.loadingWindow = loadingWindow.current;

		// Fix camera behavior
		const globe = viewer.scene.globe,
			camera = viewer.scene.camera;

		let scratchNormal = new Cesium.Cartesian3(),
			previousPosition = new Cesium.Cartesian3(),
			previousDirection = new Cesium.Cartesian3(),
			previousUp = new Cesium.Cartesian3(),
			previousRight = new Cesium.Cartesian3();

		viewer.scene.postUpdate.addEventListener(function () {
			let normal = globe.ellipsoid.geodeticSurfaceNormal(
				camera.position,
				scratchNormal
			);

			let dotProduct = Cesium.Cartesian3.dot(camera.direction, normal);

			if (dotProduct >= -0.3) {
				camera.position = Cesium.Cartesian3.clone(previousPosition, camera.position);
				camera.direction = Cesium.Cartesian3.clone(previousDirection, camera.direction);
				camera.up = Cesium.Cartesian3.clone(previousUp, camera.up);
				camera.right = Cesium.Cartesian3.clone(previousRight, camera.right);
			} else {
				previousPosition = Cesium.Cartesian3.clone(camera.position, previousPosition);
				previousDirection = Cesium.Cartesian3.clone(camera.direction, previousDirection);
				previousUp = Cesium.Cartesian3.clone(camera.up, previousUp);
				previousRight = Cesium.Cartesian3.clone(camera.right, previousRight);
			}
		});

		// Add menu
		let toolbar = viewer.container.getElementsByClassName("cesium-viewer-toolbar")[0];
		let menuContainer = document.createElement("div");
		menuContainer.className = "menu-container";
		toolbar.appendChild(menuContainer);
		let menu = React.createElement(Menu, {
			confirmWindow: confirmWindow.current as ConfirmRemovalWindow,
			errorWindow: errorWindow.current as ReadingErrorWindow,
		});
		ReactDOM.render(menu, menuContainer);

		// Add about section
		let containerNames = ["cesium-click-navigation-help", "cesium-touch-navigation-help"];
		for (let name of containerNames) {
			let helpContainer = toolbar.getElementsByClassName(name)[0];
			let aboutWrapper = document.createElement("div");
			aboutWrapper.className = "about-wrapper";
			let about = React.createElement(About);
			helpContainer.appendChild(aboutWrapper);
			ReactDOM.render(about, aboutWrapper);
		}

		// Add grid
		if (process.env.NODE_ENV !== "production")
			viewer.scene.imageryLayers.addImageryProvider(new Cesium.TileCoordinatesImageryProvider({}));

	}, [cesiumRef, imageSelector, loadingWindow, confirmWindow, errorWindow])

	return (
		<Fragment>
			<Viewer full ref={cesiumRef} terrainProvider={manager.terrainProvider as any} timeline={false} sceneModePicker={false} animation={false} creditContainer={dummyContainer} terrainProviderViewModels={[]} />
			<ModalImagesSelector ref={imageSelector}/>
			<LoadingWindow ref={loadingWindow}/>
			<ConfirmRemovalWindow ref={confirmWindow}/>
			<ReadingErrorWindow ref={errorWindow}/>
		</Fragment>
	);
}

export default App;
