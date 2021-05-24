import * as fs from "fs"
import * as path from "path"
import { BrowserWindow, dialog, Menu } from "electron"
import PluginManager from "./plugins/manager"
import { createMenu } from "./menu"
import { Profile, ProfilePluginDef, Stage } from "../shared/types"
import { ImportBIPA } from "./plugins/importer"

export default class Main {
	static mainWindow: Electron.BrowserWindow | null
	static application: Electron.App
	static BrowserWindow: any
	static pluginManager: PluginManager
	static loadComplete: boolean
	static mainFunc: () => void

	private static onWindowAllClosed() {
		if (process.platform !== 'darwin') {
			Main.application.quit()
		}
	}

	private static onClose() {
		Main.pluginManager?.unload()

		// Dereference the window object.
		Main.mainWindow = null
	}

	private static onReady() {
		Main.mainWindow = new Main.BrowserWindow({
			title: "Beryl",
			webPreferences: {
				show: false, // Don't show before maximizing to prevent a jarring flash.
				preload: path.resolve(__dirname, "preload.js")
			}
		})

		if (Main.mainWindow === null) { // Typescript being a dumb-dumb.
			return
		}

		Main.mainWindow.maximize()

		Main.mainWindow.loadURL("file://" + __dirname + "/index.html")
		Main.mainWindow.on("closed", Main.onClose)

		Main.mainWindow?.webContents.on("did-finish-load", () => {
			Main.mainWindow?.show()
			Main.loadComplete = true

			// Just in case an error is thrown in main before mainFunc is defined
			if (typeof Main.mainFunc === "function") Main.mainFunc()
		})

		Menu.setApplicationMenu(createMenu(Main.mainWindow))
	}

	static main(app: Electron.App, browserWindow: typeof BrowserWindow, startProfile: string | null, installPlugin: string | null) {
		Main.BrowserWindow = browserWindow
		Main.application = app

		Main.application.on('window-all-closed', Main.onWindowAllClosed)
		Main.application.on('ready', Main.onReady)

		if (installPlugin !== null) ImportBIPA(installPlugin)

		Main.pluginManager = new PluginManager()

		Main.mainFunc = () => {
			Main.pluginManager.setMainWindow(Main.mainWindow as BrowserWindow)

			if (startProfile !== null) this.loadProfile(startProfile)
		}
	}

	static loadProfile(filePath: string) {
		fs.readFile(filePath, (err, data) => {
			if (err !== null) {
				return
			}

			let profile: Profile
			try {
				profile = JSON.parse(data as unknown as string)
			} catch (err: any) {
				console.error(err)
				dialog.showErrorBox("Error Loading Profile", `File ${filePath} is not a valid Beryl profile.`)
				return
			}

			const stages: Stage[] = profile.stages
			const plugins: ProfilePluginDef[] = profile.plugins

			if (stages === undefined) {
				console.error(`Stages was undefined loading ${filePath}`)
				dialog.showErrorBox("Error Loading Profile", `File ${filePath} does not provide a valid stages key.`)
				return
			}

			if (plugins === undefined) {
				console.error(`Plugins was undefined loading ${filePath}`)
				dialog.showErrorBox("Error Loading Profile", `File ${filePath} does not provide a valid profiles key.`)
				return
			}

			// Verify any sounds and color values
			stages.forEach((stage: Stage) => {
				// Stat sound files
				if (stage.begin_stage_sound !== null) {
					fs.stat(stage.begin_stage_sound, (err: any | null) => {
						if (err !== null) {
							dialog.showErrorBox("Error finding file", `Could not stat ${stage.begin_stage_sound}`)
						}
					})
				}
				if (stage.end_stage_sound !== null) {
					fs.stat(stage.end_stage_sound, (err: any | null) => {
						if (err !== null) {
							dialog.showErrorBox("Error finding file", `Could not stat ${stage.end_stage_sound}`)
						}
					})
				}

				// Verify color values (matches #000000 or #000 format)
				if (!validColorString(stage.foreground_color)) {
					dialog.showErrorBox("Incorrect color value", `'${stage.foreground_color}' is not a valid hexadecimal color value.`)
				}
				if (!validColorString(stage.background_color)) {
					dialog.showErrorBox("Incorrect color value", `'${stage.background_color}' is not a valid hexadecimal color value.`)
				}
			})

			Main.pluginManager.unload()

			Main.mainWindow?.webContents.send("toRender", {type: "updateStages", data: stages})

			Main.mainWindow?.setTitle(`Beryl - ${path.basename(filePath)}`)

			Main.pluginManager.load(plugins)
		})
	}
}

function validColorString(s: string): boolean {
	if (!s.startsWith("#")) return false

	if (s.length !== 4 && s.length !== 7) return false

	// I was going to use a parseInt trick to validate the hexadecimal, but it
	// doesn't work when the string starts with 0. For example, 000000 which is a valid color code becomes 0.
	const re = /#([\da-f]{3}){1,2}/i
	if (!re.test(s)) return false

	return true
}
