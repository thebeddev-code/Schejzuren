import type { Activity } from "~/lib/types";
import { updateActivityMutation } from "./updateActivityMutation";

export const completeActivityMutation = (
	update: Pick<Activity, "id" | "completedAt" | "status">,
) =>
	updateActivityMutation({
		id: update.id,
		body: update,
	});
