declare module "sound-play" {
	interface Sound {
		play(path: string, volume?: number): Promise<any>;
	}

	var sound: Sound;

	export = sound
}
