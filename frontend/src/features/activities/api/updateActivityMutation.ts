import { revalidate } from "@solidjs/router";
import { createTypedQuery } from "~/lib/client";
import { ACTIVITY_QUERY_KEYS } from "../lib/constants";

export const updateActivityMutation = createTypedQuery<
	"/activities/[id]",
	"PATCH"
>(async (options, api) => {
	await api.update(`/activities/${options.id}`, options);
	revalidate(ACTIVITY_QUERY_KEYS.activities);
}, ACTIVITY_QUERY_KEYS.activities);
