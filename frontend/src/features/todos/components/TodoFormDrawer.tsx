import { Show } from "solid-js";
import { closeTodoForm, todoFormStore } from "./todoFormStore";
import { TodoForm } from "./TodoForm";
import { cn } from "~/lib/utils/cn";

export function TodoFormDrawer() {
	return (
		<div
			onClick={closeTodoForm}
			class={cn(
				"right-0 min-w-dvw min-h-dvh bg-black/20 fixed opacity-100 z-50 backdrop-blur-sm transition-colors duration-400 ease-in-out",
				{
					"-z-10 opacity-0 bg-transparent": !todoFormStore.formType,
				},
			)}
		>
			<div onClick={(e) => e.stopPropagation()} class="relative left-full">
				<div
					class={cn(
						"max-h-dvh w-1/2 overflow-y-scroll transform",
						"transition-transform duration-400 ease-in-out bg-white dark:bg-gray-900",
						{
							"translate-x-0": !todoFormStore.formType,
							"-translate-x-full": todoFormStore.formType,
						},
					)}
				>
					<Show when={todoFormStore.formType}>
						<TodoForm />
					</Show>
				</div>
			</div>
		</div>
	);
}
