import { Plus } from "lucide-solid";
import { type Accessor, For } from "solid-js";
import { Button } from "~/lib/components/ui/button";
import type { Todo } from "~/lib/types";
import { TodoItem } from "./TodoItem";
import { openTodoForm } from "./todoFormStore";

export function TodoList({ todos }: { todos: Accessor<Todo[]> }) {
	return (
		<section class="flex h-dvh w-full flex-col gap-2 overflow-y-auto rounded-lg bg-gray-50 p-4 border border-gray-200">
			<ul>
				<For each={todos()}>
					{(item) => (
						<li
							onClick={(e) => {
								e.stopPropagation();
								openTodoForm("update", item);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									openTodoForm("update", item);
								}
							}}
						>
							<TodoItem todo={item} />
						</li>
					)}
				</For>
			</ul>

			<div class="flex justify-center">
				<Button
					variant="secondary"
					class="w-30 border hover:border-blue-500"
					onClick={() => openTodoForm("create")}
				>
					<Plus class="text-slate-800" />
				</Button>
			</div>
		</section>
	);
}
