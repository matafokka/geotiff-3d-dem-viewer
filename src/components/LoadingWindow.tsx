import "./LoadingWindow.css"
import React from "react";
import Modal from "./Modal";

const loadingTexts = [
	"Bombing the Earth to recreate your images",
	"Wasting your time",
	"Sending your images to the special agencies",
	"<- Shuffling pixels",
	"Drinking beer",
	"Training Skynet using your images",
	"Eating your RAM (really, check usage)"
]

interface LoadingWindowProps {
	isOpen: boolean,
}

export default class LoadingWindow extends React.Component<{}, LoadingWindowProps> {
	constructor(props: {}) {
		super(props);
		this.state = {
			isOpen: false
		}
	}

	show () {
		this.setState({isOpen: true})
	}

	hide () {
		this.setState({isOpen: false})
	}

	render() {
		return (
			<Modal isOpen={this.state.isOpen} enableOk={false} enableCancel={false}>
				<div className="display-row loading-row">
					<div className="sk-cube-grid">
						<div className="sk-cube sk-cube1" />
						<div className="sk-cube sk-cube2" />
						<div className="sk-cube sk-cube3" />
						<div className="sk-cube sk-cube4" />
						<div className="sk-cube sk-cube5" />
						<div className="sk-cube sk-cube6" />
						<div className="sk-cube sk-cube7" />
						<div className="sk-cube sk-cube8" />
						<div className="sk-cube sk-cube9" />
					</div>
					<div className="loading-text">{loadingTexts[Math.round(Math.random() * (loadingTexts.length - 1))] + ", please, wait..."}</div>
				</div>
			</Modal>
		);
	}
}