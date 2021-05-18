// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
function getBlobURL(code, type) {
	const blob = new Blob([code], { type })
	return URL.createObjectURL(blob)
}

// let num = 0;
// let blob = getBlobURL(`<html><body>${num}</body></html>`, "text/html");
// console.log(blob);
// document.getElementById("intFrame").src = blob;

// setInterval(() => {
// 	let blob = getBlobURL(`<html><head></head><body>${num}</body></html>`, "text/html");
// 	console.log(blob);
// 	document.getElementById("intFrame").src = blob;
// 	num++;
// }, 1000);
