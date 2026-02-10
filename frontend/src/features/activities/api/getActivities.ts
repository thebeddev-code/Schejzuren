import { createTypedQuery } from "~/lib/client";
import { ACTIVITY_QUERY_KEYS } from "../lib/constants";

export const getActivities = createTypedQuery<"/activities", "GET">(
	async (options, api) => {
		const activities = await api.get("/activities", options);
		return activities ?? [];
	},
	ACTIVITY_QUERY_KEYS.activities,
);
