import * as path from "path"
import { app, BrowserWindow } from "electron"
import { argv } from "process"
import Main from "./main"

let lastArg = argv[argv.length - 1]

switch (path.extname(lastArg)) {
	case ".bipa":
		Main.main(app, BrowserWindow, null, lastArg)
		break
	case ".berylprof":
	case ".json":
		Main.main(app, BrowserWindow, lastArg, null)
		break
	default:
		Main.main(app, BrowserWindow, null, null)
		break
}
