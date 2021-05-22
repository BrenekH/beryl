export function getBlobURL(code: string, type: string) {
	const blob = new Blob([code], { type })
	return URL.createObjectURL(blob)
}

export function createPluginIFrame(): void {
	const iframeContainer = document.getElementById("iframe-container")
	if (iframeContainer !== null && iframeContainer !== undefined) {
		// iframeContainer.innerHTML = `<iframe class="plugin-display" frameborder="0"></iframe>`
		iframeContainer.innerHTML = `<iframe id="plugin-iframe" class="plugin-display"></iframe>`
	}
}

export function destroyPluginIFrame() {
	const iframeContainer = document.getElementById("iframe-container")
	if (iframeContainer !== null && iframeContainer !== undefined) {
		iframeContainer.innerHTML = ""
	}
}

export function setIframeContent(s: string): void {
	const iframe = document.getElementById("plugin-iframe") as HTMLIFrameElement | null
	if (iframe !== null && iframe !== undefined) {
		iframe.src = getBlobURL(s, "text/html")
	}
}

export function shoveTimingContainerToTop(): void {
	const timingContainer = document.getElementById("timing-container")
	if (timingContainer !== null && timingContainer !== undefined) {
		timingContainer.style.marginBottom = "auto"
	}
}

export function returnTimingContainerToCenter(): void {
	const timingContainer = document.getElementById("timing-container")
	if (timingContainer !== null && timingContainer !== undefined) {
		timingContainer.style.marginBottom = ""
	}
}
