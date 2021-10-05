import React from "react";
import IconButton from "./IconButton";

/**
 * A toolbar button. Pass an SVG icon as an only child (see example).
 *
 * @example
 *
 * import React from "react"; // React imports
 * import CesiumToolbarButton from "./CesiumToolbarButton"; // Import this button
 * import {ReactComponent as MyIcon} from "./icon.svg"; // Import SVG icon
 *
 * export default function MyComponent () {
 *     return (
 *         <CesiumToolbarButton onClick={() => {setMenuOpen(!menuOpen);}}>
 *             <MenuIcon className="cesium-svgPath-svg"/>
 *         </CesiumToolbarButton>
 *     )
 * }
 *
 * @param props HTMlButtonElement properties
 * @constructor
 */
export default function CesiumToolbarButton(props: any) {
	return (
		<IconButton icon={props.icon} {...props} className={"cesium-button cesium-toolbar-button " + (props.className || "")} />
	)
}