// Require main.css so that Webpack will copy it to the dist folder
require("./main.css");

export {} // Allow for us to declare on global

interface api {
	send(channel: string, ...args: any[]): void
	receive(channel: string, listener: (...args: any) => void): void
}

declare global {
    interface Window { api: api; }
}

function getBlobURL(code: string, type: string) {
	const blob = new Blob([code], { type })
	return URL.createObjectURL(blob)
}

window.api.receive("toRender", (args: any) => {
	if (args === "pluginDisplay") {
		createPluginIFrame();
		shoveTimingContainerToTop();
	} else {
		console.error(`Unrecognized option: '${args}'`);
	}
});

function createPluginIFrame(): void {
	const iframeContainer = document.getElementById("iframe-container");
	if (iframeContainer !== null && iframeContainer !== undefined) {
		// iframeContainer.innerHTML = `<iframe class="plugin-display" frameborder="0"></iframe>`;
		iframeContainer.innerHTML = `<iframe class="plugin-display"></iframe>`;
	}
}

function shoveTimingContainerToTop(): void {
	const timingContainer = document.getElementById("timing-container");
	if (timingContainer !== null && timingContainer !== undefined) {
		timingContainer.style.marginBottom = "auto";
	}
}
