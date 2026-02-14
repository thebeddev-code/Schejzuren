import {
	DAY_PART_HOURS,
	HOURS_PER_DAY,
	VISUALIZABLE_ARC_WIDTH,
} from "./constants.ts";
import { calcDegreesFrom, calcRadiansFrom } from "./math.ts";
import type { Drawable, VisualizableItem } from "./types";

interface VisualizableToDrawable {
	visualizableItems: VisualizableItem[];
	currentlySetHours: number;
	now?: Date;
}

export function visualizableToDrawable({
	visualizableItems,
	now = new Date(),
	currentlySetHours,
}: VisualizableToDrawable): Drawable[] {
	return (
		visualizableItems

			// Filter all visualizable items
			.filter((v) => v.startsAt && v.due)
			.map((v) => {
				// Convert strings to actual dates
				const startsAt = new Date(v.startsAt as string);
				const endsAt = new Date(v.due as string);

				// Convert dates to hours
				let beginHours =
					startsAt.getHours() +
					startsAt.getMinutes() / 60 +
					startsAt.getSeconds() / 3600;

				let endHours =
					endsAt.getHours() +
					endsAt.getMinutes() / 60 +
					endsAt.getSeconds() / 3600;

				// Check if item spans between days
				const isSpanning = beginHours > endHours;

				// Handle offsetting in case item has ["everyday"] recurrence and is not spanning between days
				const applyOffset = !isSpanning && v.tags?.includes("everyday");

				// Rethrow item to the next day when out of the visible time window
				if (currentlySetHours > endHours + DAY_PART_HOURS && applyOffset) {
					beginHours += HOURS_PER_DAY;
					endHours += HOURS_PER_DAY;
				}

				// Rethrow item to the prev day when out of the visible time window
				if (currentlySetHours + DAY_PART_HOURS < beginHours && applyOffset) {
					beginHours -= HOURS_PER_DAY;
					endHours -= HOURS_PER_DAY;
				}

				// Special case where item spans between days
				if (isSpanning) {
					// Rethrow item to next day only if it's outside visible time window
					const isPatternStart = currentlySetHours < endHours + DAY_PART_HOURS;
					if (isPatternStart) beginHours -= HOURS_PER_DAY;
					if (!isPatternStart) endHours += HOURS_PER_DAY;
				}
				//
				// if (!skipOffset) {
				// 	// Offset start time hours, in case item spans within the next or previous day
				// 	beginHours +=
				// 		HOURS_PER_DAY * clamp(differenceInCalendarDays(startsAt, now), -1, 1);
				//
				// 	// Offset end time hours, in case item spans within the next or previous day
				// 	endHours +=
				// 		HOURS_PER_DAY * clamp(differenceInCalendarDays(endsAt, now), -1, 1);
				// }
				//

				return {
					...v,
					startTimeHours: beginHours,
					endTimeHours: endHours,
					color: v.color ?? "black",
				};
			})
	);
}

interface DrawDrawableItems {
	canvas: HTMLCanvasElement;
	drawableItems: Drawable[];
	x?: number;
	y?: number;
	radius?: number;
	viewHours: {
		start: number;
		end: number;
	};
}

export function drawDrawableItems({
	canvas,
	drawableItems,
	x,
	y,
	radius,
	viewHours,
}: DrawDrawableItems) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const rect = canvas.getBoundingClientRect();

	const drawItem = (
		drawRadiansStart: number,
		drawRadiansEnd: number,
		offset: number,
		color: string,
	) => {
		if (!ctx) return;
		ctx.beginPath();
		ctx.arc(
			x ?? rect.width / 2,
			y ?? rect.height / 2,
			radius ?? 200,
			drawRadiansStart - offset,
			drawRadiansEnd - offset,
		);
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		ctx.lineWidth = VISUALIZABLE_ARC_WIDTH;
		ctx.stroke();
	};

	for (const {
		startTimeHours,
		endTimeHours: endHours,
		color,
	} of drawableItems) {
		const drawDegreesStart = calcDegreesFrom(
			Math.max(startTimeHours, viewHours.start),
			"hours",
		);
		const drawDegreesEnd = calcDegreesFrom(
			Math.min(endHours, viewHours.end),
			"hours",
		);

		const drawRadiansStart = calcRadiansFrom(drawDegreesStart);
		const drawRadiansEnd = calcRadiansFrom(drawDegreesEnd);
		if (viewHours.start <= endHours && viewHours.end >= startTimeHours)
			drawItem(
				drawRadiansStart,
				drawRadiansEnd,
				calcRadiansFrom(90),
				color ?? "magenta",
			);
	}
}
