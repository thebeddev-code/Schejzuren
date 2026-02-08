import { formatDate } from "date-fns";
import { ChevronUp, Moon, Sun, Sunrise, Sunset } from "lucide-solid";
import {
	type Accessor,
	createEffect,
	createMemo,
	createSignal,
	Show,
} from "solid-js";
import type { ClickEvent } from "~/lib/types";
import { DEGREES_PER_HOUR } from "../utils/constants";
import { degreesToDate } from "../utils/date";
import { calcClosestDistToClockHandle } from "../utils/distToClockHandle";
import { drawDrawableItems, visualizableToDrawable } from "../utils/draw";
import {
	calcDegreesFrom,
	getCurrentTimeInDegrees,
	snapToStep,
} from "../utils/math";
import type { VisualizableItem } from "../utils/types";
import { Clock } from "./Clock";
import { ClockHandle } from "./ClockHandle";
import { ColorWheel } from "./ColorWheel";

const RADIUS = 170;
const MAX_LAST_CLICK_DIFF_MS = 300;
const VIEW_HOURS = 6;
// once it's reached we can set the date to next
const MAX_TOTAL_DEGREES = 360 * 2;

interface Props {
	visualizableItems: Accessor<VisualizableItem[]>;
	onFormOpen?: (data: VisualizableItem) => void;
	onMoveDate?: (days: number) => void;
	currentDate?: Accessor<Date>;
}

export function DayVisualizer({
	visualizableItems,
	onFormOpen,
	onMoveDate,
	currentDate,
}: Props) {
	const currentTimeInDegrees = getCurrentTimeInDegrees(currentDate?.());
	let canvasRef!: HTMLCanvasElement;
	let lastClickTimeRef: number = 0;
	const [clockHandleDegrees, setClockHandleDegrees] = createSignal({
		currentAngle: currentTimeInDegrees % 360,
		totalAngle: currentTimeInDegrees,
	});
	const [newVisualizableItemDegrees, setNewVisualizableItemDegrees] =
		createSignal<{
			start: null | number;
			end: null | number;
		}>({
			start: null,
			end: null,
		});

	const newVisualizableItem = createMemo<VisualizableItem | null>(() => {
		const { start, end } = newVisualizableItemDegrees();
		if (!start || !end) return null;
		return {
			startsAt: degreesToDate(start).toString(),
			due: degreesToDate(end).toString(),
			color: "#6F456E",
		};
	});

	createEffect(() => {
		const canvas = canvasRef;
		if (!canvas) {
			console.warn("Missing ref to clock canvas");
			return;
		}
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			console.log("Failed to get clock canvas context");
			return;
		}
		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		// Set internal resolution
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.scale(dpr, dpr);

		const viewHoursStart = clockHandleDegrees().totalAngle / DEGREES_PER_HOUR;
		const copyVisualizableItems = [...visualizableItems()];
		if (newVisualizableItem())
			copyVisualizableItems.push(newVisualizableItem() as VisualizableItem);
		const drawableItems = visualizableToDrawable({
			visualizableItems: copyVisualizableItems,
		});
		drawDrawableItems({
			canvas,
			drawableItems,
			radius: RADIUS,
			viewHours: {
				start: viewHoursStart - VIEW_HOURS,
				end: viewHoursStart + VIEW_HOURS,
			},
		});
	});

	function handleMoveDateClick(days: number) {
		const isMoveForward = days > 0;
		const offset = (DEGREES_PER_HOUR / 60) * 5; // 5 min offset
		if (isMoveForward) {
			setClockHandleDegrees({
				currentAngle: offset,
				totalAngle: offset,
			});
			onMoveDate?.(1);
		}
		if (!isMoveForward) {
			setClockHandleDegrees({
				currentAngle: (MAX_TOTAL_DEGREES % 360) - offset,
				totalAngle: MAX_TOTAL_DEGREES - offset,
			});
			onMoveDate?.(-1);
		}
	}

	function handleCreateVisualizableClick(e: ClickEvent<HTMLDivElement>) {
		// On the second double click we open the form and pass down the data
		if (
			typeof newVisualizableItemDegrees().start === "number" &&
			typeof newVisualizableItemDegrees().end === "number" &&
			newVisualizableItem()
		) {
			const hours = (newVisualizableItemDegrees().end ?? 0) / DEGREES_PER_HOUR;
			const step = 15 / 60;
			// FIXME: doesn't take in calculation the currently set date
			onFormOpen?.({
				startsAt: new Date(
					newVisualizableItem()?.startsAt as string,
				).toISOString(),
				due: degreesToDate(
					calcDegreesFrom(snapToStep(hours, step), "hours"),
				).toISOString(),
				color: "#4A90E2",
			});
			setNewVisualizableItemDegrees({ start: null, end: null });
			return;
		}

		const lastClickTime = lastClickTimeRef;
		const currentClickTime = Date.now();
		if (currentClickTime - lastClickTime < MAX_LAST_CLICK_DIFF_MS) {
			const offset = calcClosestDistToClockHandle({
				clickEvent: e,
				clockHandleDegrees: clockHandleDegrees().totalAngle,
			});
			const hours =
				(clockHandleDegrees().totalAngle + offset) / DEGREES_PER_HOUR;
			const step = 15 / 60; // 15 minutes
			setNewVisualizableItemDegrees({
				start: calcDegreesFrom(snapToStep(hours, step), "hours"),
				end: null,
			});
		}
		lastClickTimeRef = currentClickTime;
	}

	const colorWheelDegrees = createMemo(() =>
		clockHandleDegrees().totalAngle > 360 * 2
			? 0
			: clockHandleDegrees().totalAngle,
	);

	return (
		<div class="select-none mt-20 bg-background flex-col flex justify-center items-center">
			{/* Tried to replace with btn but it was unsuccessful and lead to render errors */}
			{/* Logically, people who suffer from blindess aren't supposed to create activity through the visualizer at all */}
			{/* Since it's a tool primary for convenience */}
			{/* It should however be feasible to make it a11y compliant */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: The visualizer needs to be interactive  */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: This isn't supposed to be interacted with keys */}
			<div
				class="relative rounded-full"
				onClick={handleCreateVisualizableClick}
			>
				{/* Date switching */}
				<div class="flex flex-row items-center gap-4 absolute -top-20 left-1/2 -translate-x-1/2">
					<button
						type="button"
						onClick={() => handleMoveDateClick(-1)}
						class="text-center h-5 w-5 rounded-full bg-muted text-xs font-medium text-muted-foreground select-none"
					>
						<ChevronUp class="-rotate-90" size={16} />
					</button>
					<div class="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground select-none">
						{formatDate(currentDate?.() ?? new Date(), "PP")}
					</div>
					<button
						type="button"
						onClick={() => handleMoveDateClick(1)}
						class="text-center h-5 w-5 rounded-full bg-muted text-xs font-medium text-muted-foreground select-none"
					>
						<ChevronUp class="rotate-90" size={16} />
					</button>
				</div>

				<ClockHandle
					value={clockHandleDegrees}
					onChange={(delta) => {
						const { totalAngle } = clockHandleDegrees();
						const newTotalAngle = totalAngle + delta;
						// Move to the next day
						if (newTotalAngle > MAX_TOTAL_DEGREES) {
							handleMoveDateClick(1);
							return;
						}
						// Move to the previous day
						if (newTotalAngle < 0) {
							handleMoveDateClick(-1);
							return;
						}
						setClockHandleDegrees(({ currentAngle, totalAngle }) => ({
							currentAngle: (currentAngle + delta) % 360,
							totalAngle: totalAngle + delta,
						}));
					}}
					resetValue={(v) => setClockHandleDegrees(v)}
					clockGraphRadius={RADIUS}
				>
					<Show when={typeof newVisualizableItemDegrees().start === "number"}>
						<ClockHandle
							value={createMemo(() => ({
								currentAngle: newVisualizableItemDegrees().start as number,
								totalAngle: newVisualizableItemDegrees().start ?? 0,
							}))}
							clockGraphRadius={RADIUS}
							onChange={(_, total) => {
								if (!total) return;
								if (!newVisualizableItemDegrees().start) return;
								// if (total < newVisualizableItemDegrees().start ?? 0) return;
								setNewVisualizableItemDegrees(({ start }) => ({
									start,
									end: total,
								}));
							}}
							followMouse={true}
							variant="minimal"
							controlled={false}
						>
							<Clock ref={canvasRef} />
						</ClockHandle>
					</Show>
					<Show when={typeof newVisualizableItemDegrees().start !== "number"}>
						<Clock ref={canvasRef} />
					</Show>
				</ClockHandle>

				{/* Wheel indicator time of the day	 */}
				<ColorWheel
					degrees={
						// Normalizing degrees to avoid an edge case of unmatched value
						colorWheelDegrees
					}
					config={{
						// Night
						[180 * 1]: {
							color: "#191970",
							icon: (
								<Moon
									class=" text-white bg-[#191970] rounded-full shadow-sm h-8 w-8 p-1"
									style={{
										"will-change": "transform",
									}}
								/>
							),
						},
						// Morning
						[180 * 2]: {
							color: "#FFD700",
							icon: (
								<Sunrise
									class="text-white border border-white  bg-linear-to-br bg-[#FFD700] rounded-full shadow-sm h-8 w-8 p-1"
									size={20}
									style={{
										"will-change": "transform",
									}}
								/>
							),
						},
						// Day
						[180 * 3]: {
							color: "#87CEEB",
							icon: (
								<Sun
									class="text-amber-500 bg-white rounded-full shadow-sm h-8 w-8 p-1"
									style={{
										"will-change": "transform",
									}}
								/>
							),
						},
						// Evening
						[180 * 4]: {
							color: "#FF7F50",
							icon: (
								<Sunset
									class="text-white bg-linear-to-br from-[#FF7F50] to-[#87CEEB] rounded-full shadow-sm h-8 w-8 p-1"
									size={20}
									style={{
										"will-change": "transform",
									}}
								/>
							),
						},
					}}
				/>
			</div>
		</div>
	);
}
