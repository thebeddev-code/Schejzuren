import { createTypedQuery } from "~/lib/client";
import { ACTIVITY_QUERY_KEYS } from "../lib/constants";

export const createGetActivityQuery = (activityId: number) =>
	createTypedQuery<"/activities/[id]", "GET">(async (_, api) => {
		return await api.get(`/activities/${activityId}`);
	}, ACTIVITY_QUERY_KEYS.activity(activityId));
