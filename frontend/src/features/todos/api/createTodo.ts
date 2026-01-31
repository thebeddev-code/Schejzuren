import { api, createTypedQuery } from "~/lib/client";

export const createTodo = createTypedQuery<"/todos", "POST">((options) => {
  return api.create("/todos", options)
}, "/todos")
