/* @refresh reload */

import { Route, Router, useNavigate } from "@solidjs/router";
import { render } from "solid-js/web";
import "./index.css";
import { applyTheme } from "./lib/utils/theme.ts";
import ActivitiesToday from "./routes/dashboard/activities/today.tsx";
import DashboardLayout from "./routes/dashboard/layout.tsx";

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
				<Route path="/activities/today" component={ActivitiesToday} />
			</Route>
		</Router>
	),
	document.getElementById("root") as HTMLElement,
);
