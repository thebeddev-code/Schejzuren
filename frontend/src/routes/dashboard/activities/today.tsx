import { createAsync } from "@solidjs/router";
import { addDays, set } from "date-fns";
import { createMemo, createSignal, Show } from "solid-js";
import { getActivities } from "~/features/activities/api/getActivities";
import { ActivitiesList } from "~/features/activities/components/ActivitiesList";
import { ActivityFormDrawer } from "~/features/activities/components/ActivityFormDrawer";
import {
	activityFormStore,
	openActivityForm,
} from "~/features/activities/components/activityFormStore";
import { DayVisualizer } from "~/features/visualizer/components/DayVisualizer";
import type { VisualizableItem } from "~/features/visualizer/utils/types";

export default function ActivitiesToday() {
	const activitiesQueryResult = createAsync(() =>
		getActivities({
			where: {
				recurrenceRule: {
					contains: "everyday",
				},
				OR: [
					{
						recurrenceRule: {
							contains: "thur",
						},
					},
				],
			},
		}),
	);
	const [currentDate, setCurrentDate] = createSignal(new Date());
	const activities = createMemo(() => activitiesQueryResult() ?? []);

	return (
		<main class="w-full">
			<main class="flex-1 h-dvh grid grid-cols-2">
				{/* {status === "success" && activities && ( */}
				<Show when={activitiesQueryResult()}>
					<DayVisualizer
						visualizableItems={createMemo(() => {
							const a = activitiesQueryResult() ?? [];
							return [
								...a,
								activityFormStore.activityData ?? {},
							] as VisualizableItem[];
						})}
						currentDate={currentDate}
						onMoveDate={(days) => {
							let date = set(currentDate(), {
								hours: 0,
								minutes: 5,
								seconds: 0,
							});
							if (days < 0) {
								date = set(currentDate(), {
									hours: 23,
									minutes: 55,
									seconds: 0,
								});
							}
							setCurrentDate(addDays(date, days));
						}}
						onFormOpen={(activity) => {
							openActivityForm("create", activity);
						}}
					/>
					<ActivitiesList activities={activities} />
				</Show>
				{/* )} */}
				{/* {status === "success" && activities && <ActivityList activities={activities} />} */}
				<ActivityFormDrawer />
			</main>
		</main>
	);
}
