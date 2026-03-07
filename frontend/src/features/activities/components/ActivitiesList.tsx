import clsx from "clsx";
import { Plus } from "lucide-solid";
import { type Accessor, For } from "solid-js";
import { Button } from "~/lib/components/ui/button";
import type { Activity } from "~/lib/types";
import { ActivityItem } from "./ActivityItem";
import { openActivityForm } from "./activityFormStore";

interface Props {
	className?: string;
	activities: Accessor<Activity[]>;
}
export function ActivitiesList({ className, activities }: Props) {
	return (
		<section
			class={clsx("h-dvh w-full overflow-y-auto bg-background p-4", className)}
		>
			<div class="flex justify-center mb-4">
				<Button
					variant="secondary"
					class="transition-colors duration-200 w-30 border hover:bg-(--accent-hover) bg-muted border-border 
					text-foreground hover:border-accent hover:text-background shadow-none"
					onClick={() => openActivityForm("create")}
				>
					<Plus />
				</Button>
			</div>

			<ul class="flex flex-col gap-4">
				<For each={activities()}>
					{(item) => (
						<li
							onClick={(e) => {
								e.stopPropagation();
								openActivityForm("update", item);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									openActivityForm("update", item);
								}
							}}
						>
							<ActivityItem activity={item} />
						</li>
					)}
				</For>
			</ul>
		</section>
	);
}
