import { TextField } from "@kobalte/core/text-field";
import { createEffect, createSignal } from "solid-js";
import type { ActivityQuery } from "~/lib/types";

interface Props {
	onSearch: (query: ActivityQuery) => void;
}
export function ActivitySearch({ onSearch }: Props) {
	const [searchQuery, setSearchQuery] = createSignal("");
	let timerId: number | undefined;
	createEffect(() => {
		clearTimeout(timerId);
		timerId = setTimeout(() => {
			onSearch({
				title: {
					contains: searchQuery(),
				},
			});
		}, 200);
	});

	return (
		<>
			<TextField
				name="title"
				class="w-min flex flex-col gap-1 md:col-span-2"
				value={searchQuery()}
				onChange={(s) => setSearchQuery(s)}
			>
				<TextField.Label class="text-sm font-medium text-foreground/60">
					Title
				</TextField.Label>
				<TextField.Input
					placeholder="Search activity"
					class="px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-(--focus-ring) transition-all"
				/>
			</TextField>
		</>
	);
}
