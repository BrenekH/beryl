import * as fs from "fs"
import * as path from "path"
import { BrowserWindow } from "electron"

export default class PluginManager {
	activatePluginDisplay: boolean
	mainWindow: BrowserWindow | null
	activePlugins: Array<Plugin>

	constructor() {
		this.activatePluginDisplay = false
		this.mainWindow = null
		this.activePlugins = []
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

				const instantiatedPlugin: Plugin = new plugin.default(new InjectToPlugin())

				instantiatedPlugin.activate()

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
			plugin?.deactivate()
		}
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

interface Plugin {
	activate(): void
	deactivate(): void
}

interface PackageJSON {
	main: string
}
