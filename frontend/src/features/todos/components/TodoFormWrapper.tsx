import { Show } from "solid-js"
import { setTodoFormStore, todoFormStore } from "./todoFormStore"
import { TodoForm } from "./TodoForm"
import { cn } from "~/lib/utils/cn"

export function TodoFormWrapper() {
  return (<div onClick={() => setTodoFormStore((s) => ({ ...s, formType: null }))} class={cn("min-w-dvw min-h-dvh absolute z-50 left-full hidden bg-black", {
    "flex left-0": todoFormStore.formType
  })} >
    <Show when={Boolean(todoFormStore.formType)}>
      <TodoForm />
    </Show>
  </div >)
}
