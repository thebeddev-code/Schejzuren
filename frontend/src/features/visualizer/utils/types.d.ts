import { Activity } from "~/lib/types";

export type VisualizableItem = Activity;

export type Drawable = {
	startTimeHours: number;
	endTimeHours: number;
	color: string;
} & Omit<Activity, "startsAt" | "due" | "color">;

export type Vector2 = {
	x: number;
	y: number;
};
