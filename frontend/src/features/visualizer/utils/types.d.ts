import { Todo } from "~/lib/types";

export type VisualizableItem = Pick<Todo, "startsAt" | "due" | "color">;

export type Drawable = {
	startTimeHours: number;
	endTimeHours: number;
	color: string;
};
