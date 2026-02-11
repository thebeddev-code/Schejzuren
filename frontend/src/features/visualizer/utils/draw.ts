import { differenceInCalendarDays } from "date-fns";
import { VISUALIZABLE_ARC_WIDTH } from "./constants.ts";
import { calcDegreesFrom, calcRadiansFrom } from "./math.ts";
import type { Drawable, VisualizableItem } from "./types";

export function visualizableToDrawable({
	visualizableItems,
	now = new Date(),
}: {
	visualizableItems: VisualizableItem[];
	now?: Date;
}): Drawable[] {
	return visualizableItems
		.filter((v) => v.startsAt && v.due)
		.map((v) => {
			const startsAt = new Date(v.startsAt as string);
			const endsAt = new Date(v.due as string);
			// Converting the time to hour
			// Since 1 hours is 60 minutes, we divide by 60
			// Same for seconds
			// FIXME: Broken offsetting. Needs fixing
			let startTime =
				startsAt.getHours() +
				startsAt.getMinutes() / 60 +
				startsAt.getSeconds() / 3600;
			startTime += 24 * differenceInCalendarDays(startsAt, now);

			let endTime =
				endsAt.getHours() +
				endsAt.getMinutes() / 60 +
				endsAt.getSeconds() / 3600;
			// In item spans today and the next day
			endTime += 24 * differenceInCalendarDays(endsAt, now);

			return {
				...v,
				startTimeHours: startTime,
				endTimeHours: endTime,
				color: v.color ?? "black",
			};
		});
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
