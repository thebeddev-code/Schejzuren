import { Moon, RotateCcw, Sun, Sunrise, Sunset } from "lucide-solid";
import type { ClickEvent } from "~/lib/types";
import { cn } from "~/lib/utils";

interface Props {
	onQuickTimeSwitchClick: (args: {
		index?: number;
		event: ClickEvent<HTMLButtonElement>;
		resetClockHandle?: boolean;
	}) => void;
}
export function ClockHandleTools({ onQuickTimeSwitchClick }: Props) {
	return (
		<div class="absolute">
			<div class="z-20 relative flex items-center justify-center w-28 h-28 mx-auto rounded-full">
				<button
					type="button"
					class={cn(
						`absolute 
                    w-8 h-8 flex items-center justify-center text-gray-500 hover:text-slate-500
                    bg-white/40 rounded-full border transition-colors duration-300`,
					)}
					onClick={(e) =>
						onQuickTimeSwitchClick({
							resetClockHandle: true,
							event: e,
						})
					}
					title="Reset clock"
				>
					<RotateCcw />
				</button>
				<button
					type="button"
					class="absolute translate-x-7 -translate-y-7 opacity-40 hover:opacity-100
                    w-8 h-8 flex items-center justify-center text-gray-500 hover:text-slate-500
                    bg-white/40 rounded-full border transition-colors duration-300"
					onClick={(e) =>
						onQuickTimeSwitchClick({
							index: 1,
							event: e,
						})
					}
					title="Morning"
				>
					<Sunrise />
				</button>

				<button
					type="button"
					class="absolute translate-7 opacity-40 hover:opacity-100
                    w-8 h-8 flex items-center justify-center text-gray-500 hover:text-yellow-500
                    bg-white/40 rounded-full border transition-colors duration-300"
					onClick={(e) =>
						onQuickTimeSwitchClick({
							index: 2,
							event: e,
						})
					}
					title="Day"
				>
					<Sun />
				</button>

				<button
					type="button"
					class="absolute -translate-x-7 translate-y-7 opacity-40 hover:opacity-100
                    w-8 h-8 flex items-center justify-center text-gray-500 hover:text-purple-500
                    bg-white/40 rounded-full border transition-colors duration-300"
					onClick={(e) =>
						onQuickTimeSwitchClick({
							index: 3,
							event: e,
						})
					}
					title="Evening"
				>
					<Sunset />
				</button>

				<button
					type="button"
					class="absolute -translate-7 opacity-40 hover:opacity-100
                    w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800
                    bg-white/40 rounded-full border transition-colors duration-300"
					onClick={(e) =>
						onQuickTimeSwitchClick({
							index: 0,
							event: e,
						})
					}
					title="Night"
				>
					<Moon />
				</button>
			</div>
		</div>
	);
}
