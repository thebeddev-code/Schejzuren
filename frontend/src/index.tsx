/* @refresh reload */

import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import "./index.css";
import Dashboard from "./routes/Dashboard.tsx";
import DashboardLayout from "./routes/dashboard/layout.tsx";

render(
	() => (
		<Router root={DashboardLayout}>
			<Route path="/" component={Dashboard} />
			<Route path="/calendar" />
		</Router>
	),
	document.getElementById("root") as HTMLElement,
);
