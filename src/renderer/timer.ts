import { Stage } from "../shared/types"

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

	start(): void {
		document.addEventListener("keyup", (ev: KeyboardEvent) => {
			if (ev.code == "Space") {
				this.running = !this.running
				if (this.running) {
					if (this.stages.length === 0) {
						this.running = false
					} else {
						this.currentStageIndex = 0
						this.time = this.stages[this.currentStageIndex].length
						this.startDate = dateNowSec()

						if (this.stages[this.currentStageIndex].begin_stage_sound !== null) {
							new Audio(`file://${this.stages[this.currentStageIndex].begin_stage_sound}`).play()
						}
					}
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
					} else {
						this.time = this.stages[this.currentStageIndex].length
						this.value = this.time
						this.startDate = dateNowSec()

						if (this.stages[this.currentStageIndex].begin_stage_sound !== null) {
							new Audio(`file://${this.stages[this.currentStageIndex].begin_stage_sound}`).play()
						}
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
			this.setStageText(this.stages[this.currentStageIndex].text)
			this.setTimeRemaining((this.value + this.stages[this.currentStageIndex].offset).toString())
		} else {
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
}

function dateNowSec(): number {
	return Date.now() / 1000
}