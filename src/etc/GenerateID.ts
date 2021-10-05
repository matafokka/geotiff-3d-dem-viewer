/**
 * @return Unique ID for your elements
 */
export default function generateID () {
	return "_" + Math.random() + "_" + Date.now();
}