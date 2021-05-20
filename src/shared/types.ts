export interface Profile {
	stages: Stage[],
	plugins: string[],
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
