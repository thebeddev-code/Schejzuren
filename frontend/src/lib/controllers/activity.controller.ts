import z from "zod";
import {
	CreateActivity,
	DeleteActivity,
	GetActivities,
	UpdateActivity,
} from "~/go/services/ActivityService";
import { activityPayloadSchema } from "../schemas/activity.schema";
import type { Activity } from "../types/index";

export async function createActivity({ body }: { body: Activity }) {
	try {
		const data = activityPayloadSchema.parse(body);
		await CreateActivity(data as Activity);
	} catch (e) {
		console.error("Bug in createActivity controller", e);
		throw new Error("Invalid activity data");
	}
}

export async function getActivities() {
	return GetActivities();
}

export async function updateActivity({
	id,
	body,
}: {
	id: number;
	body: Partial<Activity>;
}) {
	return UpdateActivity(id, body as Activity);
}

export function deleteActivity({ id }: { id: number }) {
	z.number().min(0).parse(id);
	DeleteActivity(id);
}
