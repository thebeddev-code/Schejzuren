import { type Accessor, createSignal, type ParentProps } from "solid-js";
import type { ClickEventType } from "~/lib/types";
import { cn } from "~/lib/utils/cn";
import { DEGREES_PER_HOUR } from "../utils/constants";
import {
	calcDegreesFrom,
	getMouseAngleInDegrees,
	getMousePosition,
} from "../utils/math";
import type { Drawable, Vector2 } from "../utils/types";

interface Props {
	handleDegrees: Accessor<number>;
	drawableItems: Drawable[];
	visualizableArcWidth: number;
}
export function VisualizableItemsTooltip({
	handleDegrees,
	drawableItems,
	children,
	visualizableArcWidth,
}: Props & ParentProps) {
	const [tooltipPos, setTooltipPos] = createSignal<Vector2 | null>(null);
	let containerRef: HTMLDivElement | undefined;

	function handleMouseMove(e: ClickEventType) {
		// Get mouse angle relative to center (in degrees)
		const mouseDegrees = getMouseAngleInDegrees(e);

		// Get mouse coordinates relative to container center
		const mousePos = getMousePosition(e);

		// Calculate distance from center to mouse
		const distFromCenter = Math.hypot(mousePos.x, mousePos.y);

		// Get container dimensions and compute radius
		const rect = e.currentTarget.getBoundingClientRect();
		const radius = rect.width / 2;

		// Check if mouse is within the radial range of the arc
		const isInRadialRange =
			distFromCenter >= radius - visualizableArcWidth - 30 &&
			distFromCenter <= radius + 30;

		// Exit early if mouse is outside interactive arc zone
		if (!isInRadialRange) return setTooltipPos(null);

		// Calculate visible arc span in hours based on handle rotation
		const startHours = (handleDegrees() - 180) / DEGREES_PER_HOUR;
		const endHours = (handleDegrees() + 180) / DEGREES_PER_HOUR;

		// Filter items that overlap with the currently visible items
		const filtered = drawableItems.filter(
			({ startTimeHours, endTimeHours }) => {
				return !(endTimeHours <= startHours || startTimeHours >= endHours);
			},
		);

		// Find the item under the cursor based on angular position
		const hoveredItem = filtered.find(({ startTimeHours, endTimeHours }) => {
			const sDeg =
				calcDegreesFrom(Math.max(startHours, startTimeHours), "hours") % 360;
			const eDeg =
				calcDegreesFrom(Math.min(endHours, endTimeHours), "hours") % 360;

			// Handle cases where arc crosses 0° (e.g., 350° to 10°)
			if (sDeg > eDeg) {
				return mouseDegrees >= sDeg || mouseDegrees <= eDeg;
			}
			// Normal case: check if mouse angle is within [start, end]
			return mouseDegrees >= sDeg && mouseDegrees <= eDeg;
		});

		// Hide tooltip if no item is hovered
		if (!hoveredItem) return setTooltipPos(null);

		// Position tooltip near the mouse, offset slightly for visibility
		setTooltipPos({
			x: mousePos.x + rect.width / 2 + 20,
			y: mousePos.y + rect.height / 2 + 20,
		});
	}

	return (
		<div
			class="relative"
			ref={containerRef}
			aria-hidden="true"
			onMouseMove={handleMouseMove}
			onMouseLeave={() => setTooltipPos(null)}
		>
			{/* Tooltip element */}
			<span
				class={cn(
					"absolute z-50 bg-accent text-foreground transition-transform duration-300 ease-in-out",
					{ "opacity-0 scale-0": !tooltipPos() },
				)}
				style={{
					top: `${tooltipPos()?.y}px`,
					left: `${tooltipPos()?.x}px`,
				}}
			>
				Tooltip
			</span>
			{children}
		</div>
	);
}
