export default class Plugins {
	activatePluginDisplay: boolean

	constructor() {
		this.activatePluginDisplay = false
	}

	load(toLoad: string[]) {
		const filePath = `${toLoad[0]}`
		let plugin = require(/* webpackIgnore: true */ filePath)
		console.log(new plugin.default(new InjectToPlugin()).activate())
	}

	unload(): void {

	}
}

class InjectToPlugin {
	onTimerChange(callback: (event: any) => void) {console.log(callback)}

	onStageChange(callback: (event: any) => void) {console.log(callback)}

	setHTML(htmlString: string) {console.log(htmlString)}

	play() {}

	pause() {}

	stop() {}

	current() {}
}
