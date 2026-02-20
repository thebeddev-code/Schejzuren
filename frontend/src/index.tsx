/* @refresh reload */

import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import "./index.css";
import { applyTheme } from "./lib/utils/theme.ts";
import ActivitiesAll from "./routes/dashboard/activities/all.tsx";
import ActivitiesCalendar from "./routes/dashboard/activities/calendar.tsx";
import ActivitiesToday from "./routes/dashboard/activities/today.tsx";
import DashboardLayout from "./routes/layout.tsx";
import Settings from "./routes/settings.tsx";

applyTheme();
render(
	() => (
		<Router root={DashboardLayout}>
			<Route path="/dashboard/activities" component={ActivitiesAll} />
			<Route path="/dashboard/activities/today" component={ActivitiesToday} />
			<Route
				path="/dashboard/activities/calendar"
				component={ActivitiesCalendar}
			/>
			<Route path="/dashboard/settings" component={Settings} />
		</Router>
	),
	document.getElementById("root") as HTMLElement,
);
