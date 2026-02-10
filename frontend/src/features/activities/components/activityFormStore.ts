import { createStore } from "solid-js/store";
import type { Activity } from "~/lib/types";

const CREATE_ACTIVITY_DEFAULT_DATA = {
	title: "",
	isRecurring: false,
	tags: [],
	createdAt: new Date().toISOString(),
	description: "",
	priority: "low",
	status: "pending",
	updatedAt: new Date().toISOString(),
	due: new Date().toISOString(),
	startsAt: new Date().toISOString(),
	recurrenceRule: "",
	monthlyDate: new Date().toString(),
	color: "rgb(0, 120, 255)",
};

export type FormTypes = "create" | "update" | null;

export type ActivityFormStore = {
	formType: FormTypes;
	activityData?: Partial<Activity> | null;
};

export const [activityFormStore, setActivityFormStore] =
	createStore<ActivityFormStore>({
		formType: null,
	});

export const openActivityForm = (
	formType: FormTypes,
	activity?: Partial<Activity>,
) => {
	if (formType === "create") {
		return setActivityFormStore({
			formType,
			activityData: activity
				? structuredClone({ ...CREATE_ACTIVITY_DEFAULT_DATA, ...activity })
				: structuredClone(CREATE_ACTIVITY_DEFAULT_DATA),
		});
	}
	if (formType === "update" && activity) {
		return setActivityFormStore({
			formType,
			activityData: structuredClone(activity),
		});
	}
};

export const closeActivityForm = () =>
	setActivityFormStore({
		formType: null,
		activityData: structuredClone(CREATE_ACTIVITY_DEFAULT_DATA),
	});
