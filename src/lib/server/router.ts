import createRouteMatcher from '@tscircuit/routematch'
import { handleGetTodos } from './controllers/todo.controller';

export type Options = Record<string, unknown>
const routerConfig = {
  "/todos": {
    GET: handleGetTodos
  }
}
type Routes = keyof typeof routerConfig;

const routeMatcher = createRouteMatcher(Object.keys(routerConfig))

export function handleRequest(method: string, route: string, options?: Options) {
  const result = routeMatcher(route);
  if (!result) {
    throw new Error(`Route [${route}] is not implemented`)
  }
  const handler = routerConfig[result.matchedRoute as Routes][method];
  if (!handler) {
    throw new Error(`Method [${method}] is not implemented for [${route}] Route`)
  }
  return handler(options);
}

