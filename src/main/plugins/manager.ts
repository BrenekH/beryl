import * as fs from "fs"
import * as path from "path"
import { BrowserWindow, dialog, ipcMain } from "electron"
import { ToPluginsIPC, ToPluginsIPCType, TimerStatus, ProfilePluginDef } from "../../shared/types"

export default class PluginManager {
	activatePluginDisplay: boolean
	mainWindow: BrowserWindow | null
	activePlugins: Plugin[]
	statusHandlers: ((event: TimerStatus) => void)[]
	stageHandlers: ((event: any) => void)[]

	timerCurrentStatus: TimerStatus

	constructor() {
		this.activatePluginDisplay = false
		this.mainWindow = null
		this.activePlugins = []
		this.statusHandlers = []
		this.stageHandlers = []

		this.timerCurrentStatus = TimerStatus.stopped

		ipcMain.on("toPlugins", (_, args: ToPluginsIPC) => {
			switch (args.type) {
				case ToPluginsIPCType.statusChange:
					this.triggerStatusChange(args.data)
					break
				case ToPluginsIPCType.stageChange:
					this.triggerStageChange(args.data)
					break
				default:
					console.error(`Unrecognized To Plugins IPC Type: ${args.type}`)
					break
			}
		})
	}

	load(toLoad: ProfilePluginDef[]) {
		toLoad.forEach((jsonPlugin: ProfilePluginDef) => {
			// jsonPlugin.plugin should be the location of a valid npm package folder with a package.json
			// TODO: Allow jsonPlugin.plugin to be a simple string that maps to a previously installed plugin
			const packageJSONPath = path.resolve(jsonPlugin.plugin, "package.json")

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

				const pluginPath = path.resolve(jsonPlugin.plugin, packageJSON.main)
				let plugin: any
				try {
					plugin = require(/* webpackIgnore: true */ pluginPath)
				} catch (e: any) {
					dialog.showErrorBox("Plugin Error While Importing", e)
					return
				}

				// Remove plugin module from require cache (eval is used to prevent webpack from messing with the line)
				eval("delete require.cache[require.resolve(pluginPath)]")

				let instantiatedPlugin: Plugin
				try {
					instantiatedPlugin = new plugin.default(new PluginAPI(this), jsonPlugin.config)
				} catch (e: any) {
					dialog.showErrorBox("Plugin Error While Instantiating", e)
					return
				}

				try {
					instantiatedPlugin.activate()
				} catch (e: any) {
					dialog.showErrorBox("Plugin Error While Activating", e)
					return
				}

				this.activePlugins.push(instantiatedPlugin)
			})
		})
	}

	setMainWindow(window: BrowserWindow) {
		this.mainWindow = window
	}

	unload(): void {
		const pluginAmount = this.activePlugins.length
		for (let i = 0; i < pluginAmount; i++) {
			const plugin = this.activePlugins.pop();
			try {
				plugin?.deactivate()
			} catch(e: any) {
				dialog.showErrorBox("Plugin Error While Deactivating", e)
			}
		}

		this.statusHandlers = []
		this.stageHandlers = []

		// This can throw an error when shutting down the application
		try {
			this.mainWindow?.webContents.send("toRender", {type: "clearIframe"})
		} catch (e: any) {
			console.error(e)
		}
	}

	triggerStatusChange(newStatus: TimerStatus): void {
		this.statusHandlers.forEach(
			// A function is used here instead of an arrow function for the added security benefits that come with a redefined this keyword.
			function(handler: (event: TimerStatus) => void) {
				try {
					handler(newStatus)
				} catch(e: any) {
					dialog.showErrorBox("Plugin Error While Calling Status Change Handler", e)
				}
			}
		)
	}

	triggerStageChange(stageInfo: any): void {
		this.stageHandlers.forEach(
			// A function is used here instead of an arrow function for the added security benefits that come with a redefined this keyword.
			function(handler: (event: any) => void) {
				try {
					handler(stageInfo)
				} catch(e: any) {
					dialog.showErrorBox("Plugin Error While Calling Stage Change Handler", e)
				}
			}
		)
	}

	registerStatusChangeHandler(handler: (event: TimerStatus) => void) {
		this.statusHandlers.push(handler)
	}

	registerStageChangeHandler(handler: (event: any) => void) {
		this.stageHandlers.push(handler)
	}
}

class PluginAPI {
	private _parent: PluginManager

	constructor(parent: PluginManager) {
		this._parent = parent
	}

	// Registers a handler for when the Timer Status changes
	onStatusChange(callback: (event: TimerStatus) => void) {
		this._parent.registerStatusChangeHandler(callback)
	}

	// Registers a handler for when the Timer Stage changes
	onStageChange(callback: (event: any) => void) {
		this._parent.registerStageChangeHandler(callback)
	}

	// Sets the plugin html to the provided string
	setHTML(htmlString: string) {
		this._parent.mainWindow?.webContents.send("toRender", {type: "setIframeContent", data: htmlString})
	}

	// Clears the plugin html and removes the iframe from the DOM
	clearHTML() {
		this._parent.mainWindow?.webContents.send("toRender", {type: "clearIframe"})
	}

	// Starts the timer
	start() {
		this._parent.mainWindow?.webContents.send("toRender", {type: "startTimer"})
	}

	// Pauses the timer
	pause() {
		// This isn't something I'm exposing to plugins yet since it's not even an implemented timer feature
		return
		this._parent.mainWindow?.webContents.send("toRender", {type: "pauseTimer"})
	}

	// Stops the timer
	stop() {
		this._parent.mainWindow?.webContents.send("toRender", {type: "stopTimer"})
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
