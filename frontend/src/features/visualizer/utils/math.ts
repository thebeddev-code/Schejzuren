import type { ClickEvent } from "~/lib/types";
import { DEGREES_PER_HOUR } from "./constants";

export function calcRadiansFrom(
	value: number,
	type: "hours" | "degrees" = "degrees",
) {
	let degrees = value;
	if (type === "hours") degrees = value * DEGREES_PER_HOUR;
	// 360/2*Math.Pi = degrees/x
	// using cross multiplication to solve the proportion
	return (degrees * Math.PI) / 180;
}

export function calcDegreesFrom(
	value: number,
	type: "hours" | "radians" = "radians",
) {
	if (type === "hours") return value * DEGREES_PER_HOUR;
	return (value * 180) / Math.PI;
}

export function getElementCenter(e: HTMLDivElement) {
	const rect = e.getBoundingClientRect();
	const x = rect.left + rect.width / 2;
	const y = rect.top + rect.height / 2;
	return {
		x,
		y,
	};
}

export function getMousePosition(e: ClickEvent<HTMLDivElement>) {
	const x = e.clientX - getElementCenter(e.currentTarget).x;
	const y = e.clientY - getElementCenter(e.currentTarget).y;
	return {
		x,
		y,
	};
}

export function getMouseAngleInDegrees(e: ClickEvent<HTMLDivElement>) {
	const { x, y } = getMousePosition(e);
	const angleRadians = Math.atan2(x, -y);
	let angle = calcDegreesFrom(angleRadians, "radians");
	if (angle < 0) angle += 360;
	return angle;
}

export function getCurrentTimeInDegrees(overrideDate = new Date()) {
	const today = overrideDate;
	const currentTime = {
		hours: today.getHours(),
		minutes: today.getMinutes(),
		seconds: today.getSeconds(),
	};
	const currentTimeDegrees =
		calcDegreesFrom(currentTime.hours, "hours") +
		calcDegreesFrom(currentTime.minutes / 60, "hours") +
		calcDegreesFrom(currentTime.seconds / 3600, "hours");
	return currentTimeDegrees;
}

export function snapToStep(val: number, step: number) {
	return Math.round(val / step) * step;
}

export function clamp(val: number, min: number, max: number) {
	return Math.min(Math.max(val, min), max);
}
