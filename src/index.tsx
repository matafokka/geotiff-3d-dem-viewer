import "react-app-polyfill/stable";
import React from "react";
import ReactDOM from "react-dom";
import "./index.sass";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

// Detect user browser
const ua = window.navigator.userAgent.toLowerCase(),
	mobiles = ["android", "iphone", "ipod", "opera mini", "windows phone", "bb", "blackberry", "tablet", "ipad", "playbook", "silk"];
let isMobile = false;
for (let device of mobiles) {
	if (ua.indexOf(device) !== -1) {
		isMobile = true;
		break;
	}
}
document.body.classList.add(isMobile ? "mobile" : "not-mobile");

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root")
);

serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
