/* @refresh reload */

import { Route, Router, useNavigate } from "@solidjs/router";
import { render } from "solid-js/web";
import "./index.css";
import { applyTheme } from "./lib/utils/theme.ts";
import ActivitiesAll from "./routes/dashboard/activities/all.tsx";
import ActivitiesCalendar from "./routes/dashboard/activities/calendar.tsx";
import ActivitiesToday from "./routes/dashboard/activities/today.tsx";
import DashboardLayout from "./routes/dashboard/layout.tsx";
import Settings from "./routes/dashboard/settings.tsx";

applyTheme();
render(
	() => (
		<Router
			root={function Home(props) {
				const navigate = useNavigate();
				navigate("/dashboard/activities/today");
				return <>{props.children}</>;
			}}
		>
			<Route path="/dashboard" component={DashboardLayout}>
				<Route path="/activities" component={ActivitiesAll} />
				<Route path="/activities/today" component={ActivitiesToday} />
				<Route path="/activities/calendar" component={ActivitiesCalendar} />
				<Route path="/settings" component={Settings} />
			</Route>
		</Router>
	),
	document.getElementById("root") as HTMLElement,
);
