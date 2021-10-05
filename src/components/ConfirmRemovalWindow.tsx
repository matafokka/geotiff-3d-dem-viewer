import React from "react";
import Modal from "./Modal";

interface ConfirmRemovalWindowState {
	isOpen: boolean,
	fileName: string,
	onConfirm: (isYes: boolean) => void
}

export default class ConfirmRemovalWindow extends React.Component<{}, ConfirmRemovalWindowState> {

	constructor(props: {}) {
		super(props);
		this.state = {
			isOpen: false,
			fileName: "",
			onConfirm: () => {}
		}
	}

	confirm = (fileName: string, onConfirm: (isYes: boolean) => void) => {
		this.setState({isOpen: true, fileName, onConfirm});
	}

	private onClick = (isYes: boolean) => {
		this.setState({isOpen: false});
		this.state.onConfirm(isYes);
	}

	render() {
		return (
			<Modal
				header={`Remove image "${this.state.fileName}"?`}
				okText="Yes"
				cancelText="No"
				isOpen={this.state.isOpen}
				setIsOpen={(isOpen => this.setState({isOpen}))}
				onCancel={() => this.onClick(false)}
				onOk={() => this.onClick(true)}
			>
				<div>Are you sure you want to remove image "${this.state.fileName}"?</div>
			</Modal>
		);
	}
}