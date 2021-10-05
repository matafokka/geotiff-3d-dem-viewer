import "./IconButton.sass";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface IconButtonProps extends React.AllHTMLAttributes<HTMLDivElement> {
	icon: any
}

export default function IconButton (props: IconButtonProps) {
	let {icon, ...other} = props;
	return (
		<div {...other as React.AllHTMLAttributes<HTMLDivElement>} className={"button icon-button " + (props.className || "")}>
			<FontAwesomeIcon icon={icon} fixedWidth={true} />
		</div>
	);
}