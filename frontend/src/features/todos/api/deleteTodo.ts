import { api, createTypedQuery } from "~/lib/client";

export const deleteTodoMutation = createTypedQuery<"/todos", "DELETE">((options) => {
  return api.delete("/todos", options)
}, "/todos")
