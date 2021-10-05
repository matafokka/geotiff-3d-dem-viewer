import React, {useEffect, useState} from "react";
import "./Checkbox.sass";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import IconButton from "./IconButton";

interface CheckboxProps {
	label: string,
	isSelected?: boolean
	onClick?: (isSelected: boolean) => void
}

export default function Checkbox(props: CheckboxProps) {
	let [isSelected, setIsSelected] = useState(false);

	useEffect(() => {
		setIsSelected(!!props.isSelected)
	}, [props.isSelected])

	let onClick = () => {
		const newSelected = !isSelected;
		setIsSelected(newSelected);
		if (props.onClick)
			props.onClick(newSelected);
	}

	return (
		<div className="display-row checkbox-container" onClick={onClick}>
			<IconButton icon={faCheck} className={"checkbox-icon-container " + (isSelected ? "" : "not-selected")}/>
			<div className="checkbox-label">{props.label}</div>
		</div>
	)
}