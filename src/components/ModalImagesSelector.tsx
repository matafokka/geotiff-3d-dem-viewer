import Modal from "./Modal";
import React, {FormEvent} from "react";
import Checkbox from "./Checkbox";
import Input from "./Input";
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import "./ModalImageSelector.sass";

interface ModalImagesSelectorState {
	checkboxValues: boolean[]
	isOpen: boolean,
	fileName: string,
	maskText: string,
	isInputMaskValid: boolean,
	useMask: boolean,
	enableOk: boolean
}


/**
 * Allowed characters in mask
 */
const numbers: string[] = [];
for (let i = 0; i <= 9; i++)
	numbers.push(i.toString());

export class ModalImagesSelector extends React.Component<{}, ModalImagesSelectorState> {

	private userFinishedSelection: boolean = false;

	constructor(props: {}) {
		super(props);
		this.state = {
			checkboxValues: [],
			isOpen: false,
			fileName: "",
			maskText: "",
			isInputMaskValid: true,
			useMask: false,
			enableOk: true,
		}
	}

	async getImagesToUse(imageCount: number, fileName: string): Promise<Iterable<number>> {
		let checkboxValues: boolean[] = [];
		for (let i = 0; i < imageCount; i++)
			checkboxValues.push(true);

		this.setState({
			fileName, checkboxValues,
			isOpen: true
		});

		while (!this.userFinishedSelection)
			await new Promise(resolve => {
				setTimeout(resolve, 0);
			});

		this.userFinishedSelection = false;

		if (this.state.useMask) {
			return this.parseMask(this.state.maskText) as Set<number>;
		}

		let images = [];
		for (let i = 0; i < this.state.checkboxValues.length; i++) {
			if (this.state.checkboxValues[i])
				images.push(i);
		}

		return images;
	}

	setAll = (isSelected: boolean) => {
		let checkboxValues = this.state.checkboxValues.map(() => isSelected)
		this.setState({checkboxValues});
	}

	parseMask = (value: string): Set<number> | null => {
		let indices = new Set<number>(), ranges = value.split(","), maxValue = this.state.checkboxValues.length - 1;

		for (let range of ranges) {
			if (range[range.length - 1] === "-")
				return null;

			let rangeArr = range.split("-");

			if (rangeArr.length > 2)
				return null;

			let [firstStr, lastStr] = rangeArr;
			firstStr = firstStr.trim();

			if (!lastStr)
				lastStr = "";
			else
				lastStr = lastStr.trim();

			for (let char of firstStr + lastStr) {
				if (numbers.indexOf(char) === -1)
					return null;
			}

			let first = parseInt(firstStr), last = parseInt(lastStr);

			if (isNaN(first) || (lastStr !== "" && isNaN(last)) || first > last)
				return null;

			first--;
			if (isNaN(last))
				last = first;
			else
				last--;

			if (first > maxValue || last > maxValue || first <= -1)
				return null;

			for (let i = first; i <= last; i++)
				indices.add(i);
		}
		return indices;
	}

	onMaskInput = (e: FormEvent<HTMLInputElement>) => {
		// @ts-ignore
		let maskText = e.target.value;
		let isInputMaskValid = (this.parseMask(maskText) !== null);
		let enableOk = isInputMaskValid && maskText.trim() !== "";
		this.setState({isInputMaskValid, maskText, enableOk});
	}

	onOk = () => {
		if (this.state.useMask && !this.state.enableOk)
			return;

		this.userFinishedSelection = true;
		this.setState({isOpen: false});
	}

	render() {
		return (
			<Modal
				isOpen={this.state.isOpen}
				onOk={this.onOk}
				enableCancel={false}
				header={`Images for file "${this.state.fileName}"`}
				className="image-selector"
			>
				<div className="image-selector-description">
					<p>File "{this.state.fileName}" contains multiple images. These images might overlap. In this case, last overlapping image will take precedence.</p>

					<p>Please, select images to display by checking boxes or by using mask.</p>
				</div>
				<Tabs onSelect={(i) => this.setState({useMask: i === 1})}>
					<TabList>
						<Tab className="button">Use boxes</Tab>
						<Tab className="button">Use mask</Tab>
					</TabList>

					<TabPanel>

						<div className="display-row image-selector-buttons">
							<Input type="button" expand={true} value="Select All" onClick={() => this.setAll(true)}/>
							<Input type="button" value="Deselect All" onClick={() =>  this.setAll(false)}/>
						</div>

						<div className="display-row image-selector-checkboxes">
							{this.state.checkboxValues.map((value, i) => (
								<Checkbox
									label={"Image " + (i + 1)}
									onClick={isSelected => {
										let checkboxValues = [...this.state.checkboxValues];
										checkboxValues[i] = isSelected;
										this.setState({checkboxValues});
									}}
									isSelected={value}
									key={i}
								/>)
							)}
						</div>
					</TabPanel>


					<TabPanel>
						<div>
							<p>Use image number to select it. Separate images by comma. Use minus symbol (-) to select range of images.</p>
							<p>For example, select images 1, 2, from 4 to 10 (including both 4 and 10) and 13: <code>1, 2, 4-10, 13</code></p>
							<p>Number of images: {this.state.checkboxValues.length}</p>
						</div>
						<Input
							type="text"
							className={"pre " + (this.state.isInputMaskValid ? "" : "invalid")}
							placeholder="Your image mask..."
							expand={true}
							onChange={e => this.onMaskInput(e)}
						/>
					</TabPanel>
				</Tabs>

			</Modal>
		)
	}
}