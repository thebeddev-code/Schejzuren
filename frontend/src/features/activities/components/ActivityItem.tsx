import { format } from "date-fns";
import { X as Close, SquarePen } from "lucide-solid";
import { Button } from "~/lib/components/ui/button";
import type { Activity, ClickEvent } from "~/lib/types";
import { completeActivityMutation } from "../api/completeActivityMutation";
import { deleteActivityMutation } from "../api/deleteActivityMutation";
import { openActivityForm } from "./activityFormStore";

type Props = {
	activity: Activity;
};
export function ActivityItem({ activity }: Props) {
	function handleEditActivity() {
		openActivityForm("update", activity);
	}
	function handleCompleteActivity() {
		if (activity.status === "completed") {
			completeActivityMutation({
				id: activity.id,
				completedAt: "",
				status: "pending",
			});
		} else {
			completeActivityMutation({
				id: activity.id,
				completedAt: new Date().toISOString(),
				status: "completed",
			});
		}
	}
	function handleDeleteActivity() {
		deleteActivityMutation({ id: activity.id });
	}

	const { title, due, priority, status, isRecurring, startsAt, color } =
		activity;
	const isCompleted = status === "completed";

	return (
		<div class="overflow-hidden relative bg-background rounded-md border border-border hover:border-(--accent-hover)/40 transition cursor-pointer">
			<div
				class="absolute h-40 w-40 rounded-full -top-10 -left-8"
				style={{
					background: `radial-gradient(ellipse at center, ${color}, transparent, transparent)`,
					opacity: "0.2",
				}}
			/>
			<div class="relative z-10 flex items-center justify-between gap-3 bg-transparent px-3 py-2 text-sm">
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						handleCompleteActivity();
					}}
					class={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
						isCompleted
							? "border-(--success) bg-(--success) text-foreground"
							: "border-gray-300 bg-white text-transparent"
					}`}
					aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
				>
					✓
				</button>

				<div class="flex min-w-0 flex-1 flex-col font-bold">
					<h3
						class={`truncate text-sm text-foreground ${isCompleted && "line-through"}`}
					>
						{title}
					</h3>

					<div class="mt-0.5 flex items-center gap-2 text-[12px] text-foreground/50">
						{due && <span>{`${format(due, "MM/dd/yyyy")}`}</span>}
						{startsAt && due && (
							<span>
								{format(startsAt, "hh:mm")} - {format(due, "hh:mm")}
							</span>
						)}
						{priority && (
							<span
								class={
									priority === "high"
										? "text-red-400"
										: priority === "medium"
											? "text-amber-400"
											: "text-emerald-400"
								}
							>
								{priority}
							</span>
						)}
						{isRecurring && (
							<span class=" tracking-wide text-[12px]">recurring</span>
						)}
					</div>
				</div>

				<Button
					variant="outline"
					aria-label="Delete activity"
					title="Delete activity"
					size={"icon"}
					class="h-6 w-6 p-1 text-foreground border-border/50 shadow-none hover:bg-background hover:border-border hover:text-(--error) transition-colors"
					onClick={(e: ClickEvent<HTMLButtonElement>) => {
						e.stopPropagation();
						handleDeleteActivity();
					}}
				>
					<Close size={16} />
				</Button>
				<Button
					variant="outline"
					aria-label="Edit activity"
					title="Edit activity"
					size={"icon"}
					class="h-6 w-6 p-1 text-foreground border-border/50 shadow-none hover:bg-background hover:border-border hover:text-accent transition-colors"
					onClick={(e: ClickEvent<HTMLButtonElement>) => {
						e.stopPropagation();
						handleEditActivity();
					}}
				>
					<SquarePen />
				</Button>
			</div>
		</div>
	);
}
