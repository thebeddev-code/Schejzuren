import { addHours, format, set } from "date-fns";
import { DEGREES_PER_HOUR } from "./constants";

export function degreesToDate(degrees: number, startDate = new Date()) {
	return addHours(
		set(startDate, { hours: 0, minutes: 0, seconds: 0 }),
		degrees / DEGREES_PER_HOUR,
	);
}

export function formatTimeToAmPm(
	hours: number,
	minutes: number = 0,
	seconds: number = 0,
): string {
	const date = new Date();
	date.setHours(hours, minutes, seconds, 0);
	return format(date, "h:mm a");
}
