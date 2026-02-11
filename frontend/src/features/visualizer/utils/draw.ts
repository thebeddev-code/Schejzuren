import { differenceInCalendarDays } from "date-fns";
import { VISUALIZABLE_ARC_WIDTH } from "./constants.ts";
import { calcDegreesFrom, calcRadiansFrom, clamp } from "./math.ts";
import type { Drawable, VisualizableItem } from "./types";

export function visualizableToDrawable({
	visualizableItems,
	now = new Date(),
}: {
	visualizableItems: VisualizableItem[];
	now?: Date;
}): Drawable[] {
	return (
		visualizableItems

			// Filter all visualizable items
			.filter((v) => v.startsAt && v.due)
			.map((v) => {
				// Convert strings to dates
				const startsAt = new Date(v.startsAt as string);
				const endsAt = new Date(v.due as string);

				// Convert start date to hours
				let startTimeHours =
					startsAt.getHours() +
					startsAt.getMinutes() / 60 +
					startsAt.getSeconds() / 3600;

				// Offset start time hours, in case item spans within the next or previous day
				startTimeHours +=
					24 * clamp(differenceInCalendarDays(startsAt, now), -1, 1);

				// Convert end date to hours
				let endTimeHours =
					endsAt.getHours() +
					endsAt.getMinutes() / 60 +
					endsAt.getSeconds() / 3600;

				// Offset end time hours, in case item spans within the next or previous day
				endTimeHours +=
					24 * clamp(differenceInCalendarDays(endsAt, now), -1, 1);

				return {
					...v,
					startTimeHours,
					endTimeHours,
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

	for (const { startTimeHours, endTimeHours, color } of drawableItems) {
		const drawDegreesStart = calcDegreesFrom(
			Math.max(startTimeHours, viewHours.start),
			"hours",
		);
		const drawDegreesEnd = calcDegreesFrom(
			Math.min(endTimeHours, viewHours.end),
			"hours",
		);

		const drawRadiansStart = calcRadiansFrom(drawDegreesStart);
		const drawRadiansEnd = calcRadiansFrom(drawDegreesEnd);
		if (viewHours.start <= endTimeHours && viewHours.end >= startTimeHours)
			drawItem(
				drawRadiansStart,
				drawRadiansEnd,
				calcRadiansFrom(90),
				color ?? "magenta",
			);
	}
}
