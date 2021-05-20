import * as fs from "fs";
import * as path from "path";
import { BrowserWindow, dialog, Menu } from "electron";
import Plugins from "./plugins";
import { createMenu } from "./menu";
import { Profile, Stage } from "../shared/types";

export default class Main {
    static mainWindow: Electron.BrowserWindow | null;
    static application: Electron.App;
    static BrowserWindow: any;
	static plugins: Plugins;
	static loadComplete: boolean;
	static mainFunc: () => void;

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

        Main.mainWindow.loadURL("file://" + __dirname + "/index.html");
        Main.mainWindow.on("closed", Main.onClose);

		Main.mainWindow?.webContents.on("did-finish-load", () => {
			Main.mainWindow?.show();
			Main.loadComplete = true;

			Main.mainFunc();
		});

		Menu.setApplicationMenu(createMenu(Main.mainWindow));
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
		Main.BrowserWindow = browserWindow;
        Main.application = app;

        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);

		Main.plugins = new Plugins();
		Main.plugins.load([]);

		Main.mainFunc = () => {
			if (Main.plugins.activatePluginDisplay) Main.mainWindow?.webContents.send("toRender", "pluginDisplay");
		};
    }

	static loadProfile(filePath: string) {
		fs.readFile(filePath, (err, data) => {
			if (err !== null) {
				return;
			}

			let profile: Profile;
			try {
				profile = JSON.parse(data as unknown as string);
			} catch (err: any) {
				console.error(err);
				dialog.showErrorBox("Error Loading Profile", `File ${filePath} is not a valid Beryl profile.`);
				return;
			}

			const stages: Stage[] = profile.stages;
			const plugins: string[] = profile.plugins;

			if (stages === undefined) {
				console.error(`Stages was undefined loading ${filePath}`);
				dialog.showErrorBox("Error Loading Profile", `File ${filePath} does not provide a valid stages key.`);
				return;
			}

			if (plugins === undefined) {
				console.error(`Plugins was undefined loading ${filePath}`);
				dialog.showErrorBox("Error Loading Profile", `File ${filePath} does not provide a valid profiles key.`);
				return;
			}

			Main.plugins.unload();

			// TODO: Send new stage information to renderer.

			Main.plugins.load(plugins);
		});

	}
}
