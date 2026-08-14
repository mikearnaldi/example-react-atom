import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import * as Atom from "effect/unstable/reactivity/Atom"
import { TodoApi } from "./api.ts"

export type TodoFilter = "all" | "open" | "done"

export const filterAtom = Atom.make<TodoFilter>("all")
export const useBrokenEndpointAtom = Atom.make(false)

const runtime = Atom.runtime(TodoApi.layer)

export const todosAtom = runtime.atom((get) => TodoApi.use((api) => api.getTodos(get(useBrokenEndpointAtom))))

export const visibleTodosAtom = Atom.make((get) => {
  const filter = get(filterAtom)
  return AsyncResult.map(get(todosAtom), (todos) => {
    switch (filter) {
      case "open":
        return todos.filter((todo) => !todo.completed)
      case "done":
        return todos.filter((todo) => todo.completed)
      case "all":
        return todos
    }
  })
})

export const todoStatsAtom = Atom.make((get) =>
  AsyncResult.map(get(todosAtom), (todos) => ({
    all: todos.length,
    open: todos.filter((todo) => !todo.completed).length,
    done: todos.filter((todo) => todo.completed).length
  }))
)
