export const ACTIVITY_QUERY_KEYS = {
	activities: "/activities",
	activity(activityId: number) {
		return `${this.activities}/${activityId}`;
	},
};

export const WEEKDAYS = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
];

export const DEFAULT_TAGS = [...WEEKDAYS, "everyday", "monthly", "weekly"];
