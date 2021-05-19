function getBlobURL(code, type) {
	const blob = new Blob([code], { type })
	return URL.createObjectURL(blob)
}

// @ts-ignore
window.api.receive("toRender", (args: any[]) => {
	console.log(args);
});

// @ts-ignore
window.api.send("toMain", "Hello Main!");
