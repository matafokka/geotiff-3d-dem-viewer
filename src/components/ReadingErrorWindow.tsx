import "./ReadingErrorWindow.sass";
import React from "react";
import Modal from "./Modal";

interface ReadingErrorWindowState {
	fileErrors: React.ReactElement[],
	isOpen: boolean,
}

/**
 * Maps filename to reading error text
 */
export type ReadingErrors = {[fileName: string]: string}

export default class ReadingErrorWindow extends React.Component<{}, ReadingErrorWindowState>{

	constructor (props: {}) {
		super(props);
		this.state = {
			fileErrors: [],
			isOpen: false,
		}
	}

	show = (fileErrors: ReadingErrors) => {
		let newFileErrors = [];
		let key = 0;
		for (let id in fileErrors) {
			if (!fileErrors.hasOwnProperty(id))
				continue;
			newFileErrors.push(
				<div className="error-item" key={key}>
					<b>{id}:</b> <span className="error-item-description">{fileErrors[id]}</span>
				</div>
			);
			key++;
		}

		this.setState({
			fileErrors: newFileErrors,
			isOpen: true
		});
	}

	render() {
		return (
			<Modal
				isOpen={this.state.isOpen}
				setIsOpen={(isOpen => this.setState({isOpen}))}
				enableCancel={false}
				header={"Error reading files"}
			>
				<p>Following errors have occurred while reading your files:</p>
				{this.state.fileErrors}
			</Modal>
		);
	}

}