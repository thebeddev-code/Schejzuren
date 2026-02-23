import { createAsync } from "@solidjs/router";
import { createMemo } from "solid-js";
import { ActivitiesList } from "~/features/activities/components/ActivitiesList";
import { getActivities } from "~/lib/controllers/activity.controller";

export default function ActivitiesAll() {
	const activitiesQueryResult = createAsync(() => getActivities({}));
	const activities = createMemo(() => {
		return activitiesQueryResult() ?? [];
	});
	return (
		<main class="flex justify-center w-full">
			<ActivitiesList activities={activities} />
		</main>
	);
}
