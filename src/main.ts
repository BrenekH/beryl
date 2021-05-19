import { BrowserWindow, Menu } from "electron";
import * as path from "path";
import Plugins from "./plugins";
import { createMenu } from "./menu";

// Require main.css so that Webpack will copy it to the dist folder
require("./main.css");

export default class Main {
    static mainWindow: Electron.BrowserWindow | null;
    static application: Electron.App;
    static BrowserWindow;
	static plugins: Plugins;

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
				preload: path.resolve(__dirname, "preload.js")
			}
		});

		if (Main.mainWindow === null) { // Typescript being a dumb-dumb.
			return
		}

		Main.mainWindow.maximize();
		Main.mainWindow.show();

        Main.mainWindow.loadURL('file://' + __dirname + '/index.html');
        Main.mainWindow.on('closed', Main.onClose);

		Menu.setApplicationMenu(createMenu(Main.mainWindow));

		Main.mainWindow.webContents.on("did-finish-load", () => {
			if (Main.mainWindow === null) {
				return
			}
			Main.mainWindow.webContents.send("toRender", "Hello Renderer!");
		});
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;

        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);

		Main.plugins = new Plugins();
    }
}
