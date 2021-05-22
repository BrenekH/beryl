import * as fs from "fs"
import * as path from "path"
import { BrowserWindow } from "electron"

export default class PluginManager {
	activatePluginDisplay: boolean
	mainWindow: BrowserWindow | null
	activePlugins: Array<Plugin>

	timerCurrentStatus: TimerStatus

	constructor() {
		this.activatePluginDisplay = false
		this.mainWindow = null
		this.activePlugins = []

		this.timerCurrentStatus = TimerStatus.stopped
	}

	load(toLoad: string[]) {
		toLoad.forEach((folderPath: string) => {
			// folderPath should be the location of a valid npm package folder with a package.json
			const packageJSONPath = path.resolve(folderPath, "package.json")

			fs.readFile(packageJSONPath, (err: any, data: Buffer) => {
				if (err) {
					console.error(err)
					return
				}

				let packageJSON: PackageJSON
				try {
					packageJSON = JSON.parse(data as unknown as string)
				} catch (e: any) {
					console.error(e)
					return
				}

				if (packageJSON.main === undefined) {
					console.error("package.json didn't define a main field")
					return
				}

				const pluginPath = path.resolve(folderPath, packageJSON.main)
				const plugin = require(/* webpackIgnore: true */ pluginPath)

				// Remove plugin module from require cache (eval is used to prevent webpack from messing with the line)
				eval("delete require.cache[require.resolve(pluginPath)]")

				const instantiatedPlugin: Plugin = new plugin.default(new PluginAPI(this))

				instantiatedPlugin.activate()

				this.activePlugins.push(instantiatedPlugin)
			})

		})
	}

	setMainWindow(window: BrowserWindow) {
		this.mainWindow = window
	}

	unload(): void {
		// Deactivate plugins
		const pluginAmount = this.activePlugins.length
		for (let i = 0; i < pluginAmount; i++) {
			const plugin = this.activePlugins.pop();
			plugin?.deactivate()
		}

		// TODO: Remove status and stage change callback functions
	}

	triggerStatusChange(newStatus: TimerStatus): void {
		console.log(newStatus)
	}

	triggerStageChange(stageInfo: any): void {
		console.log(stageInfo)
	}
}

class PluginAPI {
	private _parent: PluginManager

	constructor(parent: PluginManager) {
		this._parent = parent
	}

	// Registers a handler for when the Timer Status changes
	onStatusChange(callback: (event: any) => void) {console.log(callback)}

	// Registers a handler for when the Timer Stage changes
	onStageChange(callback: (event: any) => void) {console.log(callback)}

	// Sets the plugin html to the provided string
	setHTML(htmlString: string) {
		this._parent.mainWindow?.webContents.send("toRenderer", {type: "setIframeContent", data: htmlString})
	}

	// Clears the plugin html and removes the iframe from the DOM
	clearHTML() {
		this._parent.mainWindow?.webContents.send("toRenderer", {type: "clearIframe"})
	}

	// Starts the timer
	start() {
		this._parent.mainWindow?.webContents.send("toRenderer", {type: "startTimer"})
	}

	// Pauses the timer
	pause() {
		this._parent.mainWindow?.webContents.send("toRenderer", {type: "pauseTimer"})
	}

	// Stops the timer
	stop() {
		this._parent.mainWindow?.webContents.send("toRenderer", {type: "stopTimer"})
	}

	// Returns the timer's current status
	current(): TimerStatus {
		return this._parent.timerCurrentStatus
	}
}

interface Plugin {
	activate(): void
	deactivate(): void
}

interface PackageJSON {
	main: string
}

enum TimerStatus {
	started = "started",
	stopped = "stopped",
	paused = "paused",
}
