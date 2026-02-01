import { CreateTodo, GetTodos } from "~/go/services/TodoService";
import { Todo } from "../types/index";

export async function createTodo({ body }: { body: Todo }) {
  console.log(body)
  console.log(await CreateTodo(body))
}

export async function getTodos() {
  return GetTodos()
}

export function updateTodo() {

}

export function deleteTodo() {

}
