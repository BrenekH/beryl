import { BrowserWindow, ipcMain, IpcMainEvent, Menu, MenuItem } from "electron";
const path = require("path");

export default class Main {
    static mainWindow: Electron.BrowserWindow | null;
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
				nodeIntegration: true, // Fixes CommonJS errors when renderer.ts is compiled.
				preload: path.join(__dirname, 'preload.js')
			}
		});

		if (Main.mainWindow === null) { // Typescript being a dumb-dumb.
			return
		}

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
			click: () => { if (Main.mainWindow !== null) { Main.mainWindow.webContents.openDevTools(); } }
			}]
		}));
		Menu.setApplicationMenu(menu);

		Main.mainWindow.webContents.on("did-finish-load", () => {
			if (Main.mainWindow === null) {
				return
			}
			Main.mainWindow.webContents.send("test", "Hello Renderer!");
		});
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;

        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);

		ipcMain.on("test", (event: IpcMainEvent, args: any[]) => {
			console.log(args);
		});
    }
}
