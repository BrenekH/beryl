import { Stage, ToPluginsIPCType, TimerStatus } from "../shared/types"

export default class Timer {
	running: boolean
	startDate: number
	value: number
	time: number
	intervalID: NodeJS.Timeout

	stages: Stage[]
	currentStageIndex: number

	constructor() {
		this.running = false
		this.value = 0
		this.startDate = dateNowSec()
		this.time = 0

		// Instantiate and destroy intervalID to avoid Typescript complaints.
		this.intervalID = setTimeout(() => {}, 1)
		clearTimeout(this.intervalID)

		this.stages = []
		this.currentStageIndex = 0
	}

	init(): void {
		document.addEventListener("keyup", (ev: KeyboardEvent) => {
			if (ev.code == "Space") {
				if (!this.running) {
					this.start()
				} else {
					this.stop()
				}
			}
		})

		setInterval(() => {
			if (this.running) {
				this.value = this.time - Math.floor(dateNowSec() - this.startDate)
				if (this.value <= 0) {
					if (this.stages[this.currentStageIndex].end_stage_sound !== null) {
						new Audio(`file://${this.stages[this.currentStageIndex].end_stage_sound}`).play()
					}

					this.currentStageIndex++
					if (this.currentStageIndex >= this.stages.length) {
						this.running = false

						window.api.send("toPlugins", {type: ToPluginsIPCType.statusChange, data: TimerStatus.stopped})
					} else {
						this.time = this.stages[this.currentStageIndex].length
						this.value = this.time
						this.startDate = dateNowSec()

						if (this.stages[this.currentStageIndex].begin_stage_sound !== null) {
							new Audio(`file://${this.stages[this.currentStageIndex].begin_stage_sound}`).play()
						}

						window.api.send("toPlugins", {type: ToPluginsIPCType.stageChange, data: this.stages[this.currentStageIndex]})
					}
				}
			}

			this.render()
		}, 50)
	}

	dispose(): void {
		clearInterval(this.intervalID)
	}

	render(): void {
		if (this.running) {
			setColors(this.stages[this.currentStageIndex])
			this.setStageText(this.stages[this.currentStageIndex].text)
			this.setTimeRemaining((this.value + this.stages[this.currentStageIndex].offset).toString())
		} else {
			resetColors()
			this.setStageText("OFF")
			this.setTimeRemaining("0")
		}
	}

	updateStages(stages: Stage[]): void {
		this.stages = stages
		this.currentStageIndex = 0
	}

	setTimeRemaining(s: string) {
		const timeRemaining = document.getElementById("time-remaining")
		if (timeRemaining) {
			if (timeRemaining.innerText !== s) {
				timeRemaining.innerText = s
			}
		}
	}

	setStageText(s: string) {
		const stageText = document.getElementById("stage-text")
		if (stageText) {
			if (stageText.innerText !== s) {
				stageText.innerText = s
			}
		}
	}

	start() {
		if (this.running) {
			// Don't do anything to a running timer
			return
		}

		this.running = true

		if (this.stages.length === 0) {
			this.running = false
		} else {
			this.currentStageIndex = 0
			this.time = this.stages[this.currentStageIndex].length
			this.startDate = dateNowSec()

			if (this.stages[this.currentStageIndex].begin_stage_sound !== null) {
				new Audio(`file://${this.stages[this.currentStageIndex].begin_stage_sound}`).play()
			}

			window.api.send("toPlugins", {type: ToPluginsIPCType.stageChange, data: this.stages[this.currentStageIndex]})
			window.api.send("toPlugins", {type: ToPluginsIPCType.statusChange, data: TimerStatus.started})
		}
	}

	pause() {
		// TODO: Implement
		window.api.send("toPlugins", {type: ToPluginsIPCType.statusChange, data: TimerStatus.paused})
	}

	stop() {
		this.running = false
		window.api.send("toPlugins", {type: ToPluginsIPCType.statusChange, data: TimerStatus.stopped})
	}
}

function dateNowSec(): number {
	return Date.now() / 1000
}

function setColors(stage: Stage) {
	document.body.style.backgroundColor = stage.background_color
	document.body.style.color = stage.foreground_color
}

function resetColors() {
	document.body.style.backgroundColor = "#333"
	document.body.style.color = "#cacaca"
}
