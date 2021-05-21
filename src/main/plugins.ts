import { BrowserWindow } from "electron"

export default class PluginManager {
	activatePluginDisplay: boolean
	mainWindow: BrowserWindow | null

	constructor() {
		this.activatePluginDisplay = false
		this.mainWindow = null
	}

	load(toLoad: string[]) {
		const filePath = `${toLoad[0]}`
		let plugin = require(/* webpackIgnore: true */ filePath)
		console.log(new plugin.default(new InjectToPlugin()).activate())
	}

	setMainWindow(window: BrowserWindow) {
		this.mainWindow = window
	}

	unload(): void {

	}
}

class InjectToPlugin {
	onTimerChange(callback: (event: any) => void) {console.log(callback)}

	onStageChange(callback: (event: any) => void) {console.log(callback)}

	setHTML(htmlString: string) {console.log(htmlString)}

	play() {}

	pause() {}

	stop() {}

	current() {}
}
