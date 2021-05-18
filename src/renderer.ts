import { ipcRenderer, IpcRendererEvent } from "electron"

function getBlobURL(code, type) {
	const blob = new Blob([code], { type })
	return URL.createObjectURL(blob)
}

ipcRenderer.on("test", (event: IpcRendererEvent, args: any[]) => {
	console.log(args);
});

ipcRenderer.send("test", "Hello Main!");
