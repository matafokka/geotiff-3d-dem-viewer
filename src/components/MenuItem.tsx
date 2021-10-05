import React, {useState} from "react";
import "./MenuItem.sass";
import manager, {FileData} from "../etc/GeoTIFFManager";
import {Collapse} from "react-collapse";
import {faTrash, faInfo, faExpand} from "@fortawesome/free-solid-svg-icons";
import IconButton from "./IconButton";
import Input from "./Input";

interface MenuItemProps {
	data: FileData,
	onDelete: (name: string) => void,
	onHeightMultiplierChange: (fileName: string, multiplier: number) => void
}

interface MenuItemDataEntryProps {
	label: string,
	value: any
}

function MenuItemDataEntry(props: MenuItemDataEntryProps) {
	return (
		<div
			className="menu-item-data-entry">
			<div className="menu-item-data-entry-label">{props.label}:</div>
			<div className="menu-item-data-entry-value">{props.value}</div>
		</div>
	)
}

export default function MenuItem(props: MenuItemProps) {

	let [isOpened, setIsOpened] = useState(false);

	let onZoom = () => {
		manager.viewer?.scene.camera.flyTo({
			destination: props.data.rectangle
		});
	}

	return (
		<div className="menu-item">
			<div className="display-row menu-item-row">
				<div className="shortened-text menu-item-label">{props.data.name}</div>
				<IconButton icon={faTrash} onClick={() => props.onDelete(props.data.name)} />
				<IconButton icon={faExpand} onClick={onZoom} />
				<IconButton icon={faInfo} onClick={() => setIsOpened(!isOpened)} />
			</div>
			<Collapse
				isOpened={isOpened}>
				<div className="menu-item-data">
					<MenuItemDataEntry label="Min" value={props.data.min}/>
					<MenuItemDataEntry label="Max" value={props.data.max}/>
					<MenuItemDataEntry label="Mean" value={props.data.mean}/>
					<p>Sometimes heights might be so small so they make DEM almost invisible. Multiply heights by following value to see the DEM better:</p>
					<Input type="number" defaultValue={1} min={1} max={1000} step={100} expand={true} onChange={(e) => {
						// @ts-ignore
						props.onHeightMultiplierChange(props.data.name, e.target.value);
					}} />
				</div>
			</Collapse>
		</div>
	);

}