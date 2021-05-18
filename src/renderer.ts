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
