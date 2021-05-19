import { BrowserWindow, Menu, MenuItem } from "electron";

export function createMenu(browserWindow: BrowserWindow) : Menu {
	const menu = new Menu();

	menu.append(new MenuItem({
		label: "View",
		submenu: [{
			accelerator: "F11",
			role: "togglefullscreen"
		}]
	}));

	menu.append(new MenuItem({
		label: "About",
		submenu: [{
			label: "Show DevTools",
			accelerator: 'CommandOrControl+Shift+I',
			click: () => { browserWindow.webContents.openDevTools(); }
		}]
	}));

	return menu;
}
