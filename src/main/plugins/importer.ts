import * as path from "path"
import extract = require("extract-zip")
import { mkdirSync } from "fs"
import { tmpdir } from "os"
import { platform, env } from "process"

const tempDir = tmpdir()
const pluginStorageDir = getOSPluginStorageDir()

export function ImportBIPA(fileLocation: string) {
	extract(fileLocation, { dir: path.resolve(tempDir, path.basename(fileLocation)) }).then(() => {
		console.log("Extract complete")
		// TODO: Move extracted files to pluginStorageDir
	}).catch((err: any) => {
		console.error(err)
	})
}

function getOSPluginStorageDir(): string {
	let pluginStorageDir
	if (platform === "win32") {
		pluginStorageDir = `${env.LOCALAPPDATA}/Beryl/installedPlugins`
	} else {
		pluginStorageDir = `${env.HOME}/.beryl/installedPlugins`
	}

	try {
		mkdirSync(pluginStorageDir)
	} catch (e: any) {}

	return pluginStorageDir
}
