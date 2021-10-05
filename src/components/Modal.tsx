import React
	from "react";
import Input
	from "./Input";
import "./Modal.sass";

interface ModalProps extends React.ComponentProps<any> {
	header?: string,
	enableOk?: boolean,
	enableCancel?: boolean,
	cancelText?: string,
	okText?: string,
	onCancel?: () => void,
	onOk?: () => void,
	isOpen: boolean,
	setIsOpen?: (isOpen: boolean) => void,
	className?: string,
}

export default function Modal(props: ModalProps) {
	let onClose = (isOk: boolean) => {
		if (props.setIsOpen)
			props.setIsOpen(false);

		const propName = "on" + (isOk ? "Ok" : "Cancel");
		if (props[propName])
			props[propName]();
	}

	return (
		<div className={"modal-backdrop " + (props.isOpen ? "" : "modal-hidden")}>
			<div className="cesium-baseLayerPicker-dropDown cesium-baseLayerPicker-dropDown-visible modal">
				{props.header ? <div className="shortened-text modal-header">{props.header}</div> : null}
				<div className={"modal-content " + (props.className || "")}>
					{props.children}
				</div>
				<div className="modal-buttons">
					<div className="modal-buttons-wrapper">
						{(props.enableCancel === undefined || props.enableCancel) ?
							<Input type="button" value={props.cancelText ? props.cancelText : "Cancel"} onClick={() => onClose(false)} />
							: null}
						{(props.enableOk === undefined || props.enableOk) ?
							<Input type="button" value={props.okText ? props.okText : "OK"} onClick={() => onClose(true)} />
							: null}
					</div>
				</div>
			</div>
		</div>
	);
}