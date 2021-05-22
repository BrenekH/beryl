import * as util from "./util"
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

window.api.receive("toRender", (event: IPC) => {
	switch (event.type) {
		case "updateStages":
			if (event.data !== null && typeof event.data !== "string") timer.updateStages(event.data)
			break
		case "setIframeContent":
			if (typeof event.data !== "string") break
			util.createPluginIFrame()
			util.shoveTimingContainerToTop()
			util.setIframeContent(event.data)
			break
		case "clearIframe":
			util.destroyPluginIFrame()
			util.returnTimingContainerToCenter()
			break
		case "startTimer":
			timer.start()
			break
		case "pauseTimer":
			timer.pause()
			break
		case "stopTimer":
			timer.stop()
			break
		default:
			console.error(`Unrecognized event type: '${event.type}'`)
			break
	}
})

const timer = new Timer()
timer.init()
