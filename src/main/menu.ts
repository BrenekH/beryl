import { BrowserWindow, dialog, Menu, MenuItem } from "electron"
import { OpenDialogReturnValue } from "electron/main"
import Main from "./main"

export function createMenu(browserWindow: BrowserWindow) : Menu {
	const menu = new Menu()

	menu.append(new MenuItem({
		label: "File",
		submenu: [{
			label: "Open Profile",
			accelerator: "CommandOrControl+O",
			click: () => {
				dialog.showOpenDialog(browserWindow, {
					title: "Open Profile",
					buttonLabel: "Open",
					filters :[
						{name: "JSON", extensions: ["json"]},
						{name: "All Files", extensions: ["*"]}
					   ],
					properties: ["openFile"]
				}).then((dialogReturn: OpenDialogReturnValue) => {
					if (!dialogReturn.canceled) {
						Main.loadProfile(dialogReturn.filePaths[0])
					}
				})
			},
		}]
	}))

	menu.append(new MenuItem({
		label: "View",
		submenu: [{
			accelerator: "F11",
			role: "togglefullscreen"
		}]
	}))

	menu.append(new MenuItem({
		label: "About",
		submenu: [{
			label: "Show DevTools",
			accelerator: 'CommandOrControl+Shift+I',
			click: () => { browserWindow.webContents.openDevTools() }
		}]
	}))

	return menu
}
