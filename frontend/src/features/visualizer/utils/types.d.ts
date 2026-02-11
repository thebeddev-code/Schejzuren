import { Activity } from "~/lib/types";

export type VisualizableItem = Partial<Activity>;

export type Drawable = {
	startTimeHours: number;
	endTimeHours: number;
	color: string;
} & Partial<Omit<Activity, "startsAt" | "due" | "color">>;

export type Vector2 = {
	x: number;
	y: number;
};
