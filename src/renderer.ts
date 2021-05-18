function getBlobURL(code, type) {
	const blob = new Blob([code], { type })
	return URL.createObjectURL(blob)
}

// @ts-ignore
window.api.receive("test", (event, args: any[]) => {
	console.log(args);
});

// @ts-ignore
window.api.send("test", "Hello Main!");

console.log("Hi");
