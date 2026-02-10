import { Activity } from "~/lib/types";

export type VisualizableItem = Pick<Activity, "startsAt" | "due" | "color">;

export type Drawable = {
	startTimeHours: number;
	endTimeHours: number;
	color: string;
};
