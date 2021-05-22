export interface Profile {
	stages: Stage[],
	plugins: ProfilePluginDef[],
}

export interface ProfilePluginDef {
	plugin: string,
	config: any,
}

export interface Stage {
	text: string,
	foreground_color: string,
	background_color: string,
	length: number,
	offset: number,
	begin_stage_sound: string | null,
	end_stage_sound: string | null,
}

export interface ToRenderIPC {
	type: string,
	data: null | Stage[] | string,
}

export interface ToPluginsIPC {
	type: ToPluginsIPCType,
	data: any,
}

export enum ToPluginsIPCType {
	statusChange = "statusChange",
	stageChange = "stageChange",
}

export enum TimerStatus {
	started = "started",
	stopped = "stopped",
	paused = "paused",
}
