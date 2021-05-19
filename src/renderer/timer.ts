export default class Timer {
	running: boolean;
	startDate: number;
	value: number;

	time: number;

	intervalID: NodeJS.Timeout;

	constructor() {
		this.running = false;
		this.value = 0;
		this.startDate = dateNowSec();

		this.time = 120;

		this.intervalID = setTimeout(() => {}, 1);
	}

	start(): void {
		document.addEventListener("keyup", (ev: KeyboardEvent) => {
			if (ev.code == "Space") {
				this.running = !this.running;
				if (this.running) {
					this.startDate = dateNowSec();
				}
			}
		});

		setInterval(() => {
			if (this.running) {
				this.value = this.time - Math.floor(dateNowSec() - this.startDate);
				if (this.value <= 0) {
					this.running = false;
					this.setTimeRemainingDisplay("OFF");
					return;
				}
				this.setTimeRemainingDisplay(this.value.toString());
			} else {
				this.setTimeRemainingDisplay("OFF");
			}
		}, 50);
	}

	setTimeRemainingDisplay(s: string) {
		const timeRemaining = document.getElementById("time-remaining");
		if (timeRemaining) {
			if (timeRemaining.innerText !== s) {
				timeRemaining.innerText = s;
			}
		}
	}
}

function dateNowSec(): number {
	return Date.now() / 1000;
}
