import { revalidate } from "@solidjs/router";
import { createTypedQuery } from "~/lib/client";
import { ACTIVITY_QUERY_KEYS } from "../lib/constants";

export const deleteActivityMutation = createTypedQuery<
	"/activities/[id]",
	"DELETE"
>(async (options, api) => {
	await api.delete(`/activities/${options.id}`);
	revalidate(ACTIVITY_QUERY_KEYS.activities);
}, ACTIVITY_QUERY_KEYS.activities);
