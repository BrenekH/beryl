import * as path from "path"
import extract = require("extract-zip")
import { move, mkdirpSync, statSync, readFile } from "fs-extra"
import { tmpdir } from "os"
import { platform, env } from "process"
import { dialog } from "electron"

import { PackageJSON } from "./manager"

const tempDir = tmpdir()
const pluginStorageDir = getOSPluginStorageDir()

export function ImportBIPA(fileLocation: string) {
	const tmpPluginDir = path.resolve(tempDir, path.basename(fileLocation))
	extract(fileLocation, { dir: tmpPluginDir }).then(() => {
		if (!statSync(`${tmpPluginDir}/package.json`)) {
			dialog.showErrorBox("Error Importing Plugin", `Could not stat stat package.json for ${fileLocation}`)
			return
		}

		readFile(`${tmpPluginDir}/package.json`, (err: any, data: Buffer) => {
			if (err) {
				dialog.showErrorBox("Error Importing Plugin", err)
				return
			}

			let packageJSON: PackageJSON
			try {
				packageJSON = JSON.parse(data as unknown as string)
			} catch (e: any) {
				dialog.showErrorBox("Error Importing Plugin", `Error parsing package.json: ${e}`)
				return
			}

			move(tmpPluginDir, path.resolve(pluginStorageDir, packageJSON.name))
		})
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
		mkdirpSync(pluginStorageDir)
	} catch (e: any) {}

	return pluginStorageDir
}
