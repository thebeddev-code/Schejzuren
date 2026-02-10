import { addHours, formatDate, set } from "date-fns";
import {
	type Accessor,
	createEffect,
	createMemo,
	createSignal,
	type JSXElement,
} from "solid-js";
import type { ClickEvent } from "~/lib/types";
import { cn } from "~/lib/utils";
import { DEGREES_PER_HOUR } from "../utils/constants";
import { getCurrentTimeInDegrees, getMouseAngleInDegrees } from "../utils/math";
import { ClockHandleTools } from "./ClockHandleTools";

const HANDLE_BUTTON_SIZE_PX = 21;
const ROTATION_ANIMATION_SPEED_MS = 700;

export type AngleValue = {
	currentAngle: number;
	totalAngle: number;
};

interface Props {
	containerClassName?: string;
	children?: JSXElement;
	clockGraphRadius: number;
	value: Accessor<AngleValue>;
	resetValue?: (v: AngleValue) => void;
	// TODO: rewrite to accept an object instead
	onChange: (delta: number, total?: number) => void;
	variant?: "minimal" | "full";
	followMouse?: boolean;
	shouldUpdateTime?: boolean;
	controlled?: boolean;
}

export function ClockHandle({
	children,
	containerClassName = "",
	clockGraphRadius,
	value,
	onChange,
	followMouse = false,
	variant = "full",
	resetValue,
	controlled = true,
}: Props) {
	const [handleDegrees, setHandleDegrees] = createSignal({
		mouse: value().totalAngle % 360,
		total: value().totalAngle,
	});
	const [mouseDown, setMouseDown] = createSignal(followMouse);
	const [mouseEnter, setMouseEnter] = createSignal(followMouse);
	const time = createMemo(() => {
		const t = controlled ? value().totalAngle : handleDegrees().total;
		return formatDate(
			addHours(
				set(new Date(), { hours: 0, minutes: 0, seconds: 0 }),
				t / DEGREES_PER_HOUR,
			),
			"p",
		);
	});
	const showTooltip = true;
	// Handle resetting the last raw angle after clock handle reset

	let lastRawAngle: number | null = null;
	let handleRef: HTMLDivElement | undefined;
	const handleMouseMove = (e: ClickEvent<HTMLDivElement>) => {
		if (!mouseDown()) return;

		const mouseDegrees = getMouseAngleInDegrees(e);
		if (lastRawAngle == null) {
			lastRawAngle = mouseDegrees;
			return;
		}

		let delta = mouseDegrees - lastRawAngle;
		//Fix wrap at 0/360
		if (delta > 180) delta -= 360;
		if (delta < -180) delta += 360;

		lastRawAngle = mouseDegrees;

		const newTotal = handleDegrees().total + delta;
		if (!controlled) {
			setHandleDegrees({
				mouse: mouseDegrees,
				total: newTotal,
			});
		}
		onChange?.(delta, newTotal);
	};
	let hasUsedQuickSwitch = false;
	createEffect(() => {
		const intervalId = setInterval(() => {
			if (mouseDown() || hasUsedQuickSwitch) return;
			// onChange(DEGREES_PER_HOUR / 3600);
		}, 1000);
		return () => clearInterval(intervalId);
	});

	let timerId: number | null = null;
	function handleQuickTimeSwitchClick({
		index = 1,
		event,
		resetClockHandle,
	}: {
		index?: number;
		event: ClickEvent<HTMLButtonElement>;
		resetClockHandle?: boolean;
	}) {
		event.stopPropagation();

		const currentTimeDegrees = getCurrentTimeInDegrees();
		const newTotalAngle = resetClockHandle ? currentTimeDegrees : 180 * index;
		const offset = DEGREES_PER_HOUR * (1 / 60 / 60);

		// This is used to control the animation rotation speed.
		// If next jump degrees close move fast or if far move slow
		const multiplier = Math.abs((value().totalAngle - newTotalAngle) / 360);

		if (timerId) clearTimeout(timerId);
		if (handleRef) {
			handleRef.style.transitionDuration = `${multiplier * ROTATION_ANIMATION_SPEED_MS}ms`;
			// Reset the duration, so that if user were to drag the handle
			// No transition would apply
			timerId = setTimeout(() => {
				handleRef.style.transitionDuration = "0ms";
			}, ROTATION_ANIMATION_SPEED_MS);
		}

		// Reset the clock handle rotation to current time
		if (resetClockHandle) {
			resetValue?.({
				currentAngle: currentTimeDegrees % 360,
				totalAngle: currentTimeDegrees,
			});
			// Resetting the last raw angle, very important
			lastRawAngle = null;
			hasUsedQuickSwitch = false;
			return;
		}

		// rotateBy(finishingRotationDegrees)
		// Small offset to correctly calculate part of the day
		resetValue?.({
			currentAngle: newTotalAngle % 360,
			totalAngle: newTotalAngle + offset,
		});
		// Do not increase the clock handle angle with time passage
		hasUsedQuickSwitch = true;
	}

	const displayAngle = () =>
		controlled ? value().totalAngle : handleDegrees().total;
	const clockHandleStyles = createMemo(() => ({
		transform: `rotate(${displayAngle() + 90}deg)`,
		"transform-origin": "50% 50%",
		width: `${clockGraphRadius * 2 + HANDLE_BUTTON_SIZE_PX}px`,
	}));

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: Clock handle must be interactive to adjust the visible activies time window
		// biome-ignore lint/a11y/useKeyWithClickEvents: This isn't supposed to be interacted with keys
		<div
			class={cn(
				"relative flex justify-center items-center",
				containerClassName,
			)}
			onMouseUp={() => {
				if (!followMouse) setMouseDown(false);
			}}
			onMouseLeave={() => {
				if (!followMouse) setMouseDown(false);
			}}
			onMouseMove={handleMouseMove}
		>
			{/* ===== Handle ===== */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: Clock handle must be interactive to adjust the visible activies time window */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: This isn't supposed to be interacted with keys */}
			<div
				ref={handleRef}
				style={clockHandleStyles()}
				class={cn(
					"z-10 absolute flex justify-start items-center transition-transform duration-0",
				)}
			>
				{/* biome-ignore lint/a11y/noStaticElementInteractions: Clock handle must be interactive to adjust the visible activies time window */}
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: This isn't supposed to be interacted with keys */}
				<div
					onMouseDown={() => setMouseDown(true)}
					onMouseEnter={() => setMouseEnter(true)}
					onMouseLeave={() => setMouseEnter(false)}
					style={{
						width: `${HANDLE_BUTTON_SIZE_PX}px`,
						height: `${HANDLE_BUTTON_SIZE_PX}px`,
					}}
					// Handle
					class={cn(
						"absolute flex justify-center items-center bg-accent/60 rounded-full  -left-2.75",
						{
							"cursor-grab": variant === "full",
						},
					)}
				>
					<div
						class={cn({
							"relative bg-background/70 h-1 w-1 rounded-full":
								variant === "full",
						})}
					>
						{/* <AnimatePresence> */}
						{showTooltip && (
							<div
								// initial={{ opacity: 0, y: 4, scale: 0.95 }}
								// animate={{ opacity: 1, y: 0, scale: 1 }}
								// exit={{ opacity: 0, y: 4, scale: 0.95 }}
								// transition={{ type: "spring", stiffness: 260, damping: 20 }}
								class="absolute -translate-x-20 select-none
                     bg-muted px-3 py-1 rounded-full "
								style={{
									rotate: `-${Math.round(displayAngle() + 90)}deg`,
									"transform-origin": "center center",
								}}
							>
								<span class="whitespace-nowrap text-xs text-foreground/80 font-medium">
									{time()}
								</span>
							</div>
						)}
						{/* </AnimatePresence> */}
					</div>
				</div>

				{/* Diameter line */}
				<div
					class={cn("border-foreground/50 border h-[50%] w-[50%]", {
						"border-dotted w-full": variant === "full",
					})}
				/>
				{/* <div class="bg-slate-900 h-2 w-2 rounded-full cursor-grab" /> */}
			</div>
			{children}
			{variant === "full" && (
				<ClockHandleTools onQuickTimeSwitchClick={handleQuickTimeSwitchClick} />
			)}
		</div>
	);
}
