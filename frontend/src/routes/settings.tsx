import { toggleTheme } from "~/lib/utils/theme";

export default function Settings() {
	return (
		<>
			<button type="button" onClick={toggleTheme}>
				Change theme
			</button>
		</>
	);
}
