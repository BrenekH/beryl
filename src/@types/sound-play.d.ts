declare module "sound-play" {
	interface Sound {
		play(path: string, volume?: number): Promise<unknown>;
	}

	var sound: Sound;

	export = sound
}
