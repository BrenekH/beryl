import { BrowserWindow, Menu, MenuItem } from "electron";
const path = require("path");

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow;

	private static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose() {
        // Dereference the window object. 
        Main.mainWindow = null;
    }

    private static onReady() {
        Main.mainWindow = new Main.BrowserWindow({
			title: "Beryl",
			webPreferences: {
				show: false, // Don't show before maximizing to prevent a jarring flash.
				preload: path.join(__dirname, 'preload.js')
			}
		});

		Main.mainWindow.maximize();
		Main.mainWindow.show();

        Main.mainWindow.loadURL('file://' + __dirname + '/index.html');
        Main.mainWindow.on('closed', Main.onClose);

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
			click: () => { Main.mainWindow.webContents.openDevTools(); }
			}]
		}));
		Menu.setApplicationMenu(menu);
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
    }
}
