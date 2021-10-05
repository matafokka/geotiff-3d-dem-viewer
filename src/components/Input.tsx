import React, {FormEvent, Fragment} from "react";
import "./Input.sass";
import generateID from "../etc/GenerateID";

interface InputProps extends React.AllHTMLAttributes<HTMLInputElement> {
	expand?: boolean
}

export default function Input(props: InputProps) {

	const isFile = props.type === "file";
	const {expand, onChange, ...newProps} = props;
	const elementClassName = `button ${props.expand ? "button-expanded" : ""}`;
	const id = generateID();

	let onInputChange = isFile ? (e: FormEvent<HTMLInputElement>) => {
		if (onChange)
			onChange(e);

		// Clear file input
		// @ts-ignore
		e.target.type = "";
		// @ts-ignore
		e.target.type = "file";
	} : onChange;

	let input = (<input {...newProps} className={(isFile ? "hidden" : elementClassName) + " " + (props.className || "")} id={id} onChange={onInputChange} />);

	if (!isFile)
		return input;

	const label = props.label || `Select ${(input.props.multiple) ? "files" : "file"}...`;
	return (
		<Fragment>
			{input}
			<label className={elementClassName} htmlFor={id}>{label}</label>
		</Fragment>
	);
}