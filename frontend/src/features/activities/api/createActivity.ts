import { revalidate } from "@solidjs/router";
import { createTypedQuery } from "~/lib/client";
import { ACTIVITY_QUERY_KEYS } from "../lib/constants";

export const createActivity = createTypedQuery<"/activities", "POST">(
	async (options, api) => {
		await api.create("/activities", options);
		revalidate(ACTIVITY_QUERY_KEYS.activities);
	},
	ACTIVITY_QUERY_KEYS.activities,
);
