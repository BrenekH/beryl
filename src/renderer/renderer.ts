import Timer from "./timer"
import { IPC } from "../shared/types"

// Require main.css so that Webpack will copy it to the dist folder
require("./main.css")

export {} // Allow for us to declare on global

interface api {
	send(channel: string, ...args: any[]): void
	receive(channel: string, listener: (...args: any) => void): void
}

declare global {
    interface Window { api: api }
}

function getBlobURL(code: string, type: string) {
	const blob = new Blob([code], { type })
	return URL.createObjectURL(blob)
}

window.api.receive("toRender", (event: IPC) => {
	switch (event.type) {
		case "updateStages":
			if (event.data !== null && typeof event.data !== "string") timer.updateStages(event.data)
			break
		case "setIframeContent":
			if (typeof event.data !== "string") break
			createPluginIFrame()
			shoveTimingContainerToTop()
			setIframeContent(event.data)
			break
		case "clearIframe":
			destroyPluginIFrame()
			returnTimingContainerToCenter()
			break
		case "startTimer":
			break
		case "pauseTimer":
			break
		case "stopTimer":
			break
		default:
			console.error(`Unrecognized event type: '${event.type}'`)
			break
	}
})

function createPluginIFrame(): void {
	const iframeContainer = document.getElementById("iframe-container")
	if (iframeContainer !== null && iframeContainer !== undefined) {
		// iframeContainer.innerHTML = `<iframe class="plugin-display" frameborder="0"></iframe>`
		iframeContainer.innerHTML = `<iframe id="plugin-iframe" class="plugin-display"></iframe>`
	}
}

function destroyPluginIFrame() {
	const iframeContainer = document.getElementById("iframe-container")
	if (iframeContainer !== null && iframeContainer !== undefined) {
		iframeContainer.innerHTML = ""
	}
}

function setIframeContent(s: string): void {
	const iframe = document.getElementById("plugin-iframe") as HTMLIFrameElement | null
	if (iframe !== null && iframe !== undefined) {
		iframe.src = getBlobURL(s, "text/html")
	}
}

function shoveTimingContainerToTop(): void {
	const timingContainer = document.getElementById("timing-container")
	if (timingContainer !== null && timingContainer !== undefined) {
		timingContainer.style.marginBottom = "auto"
	}
}

function returnTimingContainerToCenter(): void {
	const timingContainer = document.getElementById("timing-container")
	if (timingContainer !== null && timingContainer !== undefined) {
		timingContainer.style.marginBottom = ""
	}
}

const timer = new Timer()
timer.start()
