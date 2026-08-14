import * as AtomReact from "@effect/atom-react/Hooks"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import {
  filterAtom,
  type TodoFilter,
  todosAtom,
  todoStatsAtom,
  useBrokenEndpointAtom,
  visibleTodosAtom
} from "./state.ts"

const filters: ReadonlyArray<{ readonly value: TodoFilter; readonly label: string }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "done", label: "Done" }
]

export function App() {
  const result = AtomReact.useAtomValue(visibleTodosAtom)
  const statsResult = AtomReact.useAtomValue(todoStatsAtom)
  const [filter, setFilter] = AtomReact.useAtom(filterAtom)
  const [useBrokenEndpoint, setUseBrokenEndpoint] = AtomReact.useAtom(useBrokenEndpointAtom)
  const refresh = AtomReact.useAtomRefresh(todosAtom)

  const todos = AsyncResult.getOrElse(result, () => [])
  const stats = AsyncResult.getOrElse(statsResult, () => ({ all: 0, open: 0, done: 0 }))
  const errorMessage = AsyncResult.matchWithError(result, {
    onInitial: () => undefined,
    onError: (error) => error.message,
    onDefect: () => "An unexpected defect occurred while running the Effect.",
    onSuccess: () => undefined
  })
  const isInitialLoading = result._tag === "Initial" && result.waiting
  const hasPreviousData = result._tag === "Failure" && todos.length > 0

  const retry = () => {
    if (useBrokenEndpoint) {
      setUseBrokenEndpoint(false)
    } else {
      refresh()
    }
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Effect data lab / 01</p>
          <h1>
            One request.<br />Every state accounted for.
          </h1>
        </div>
        <p className="intro">
          Effect describes a typed HTTP program. Atom runs and shares it. React renders the resulting state without a
          request <code>useEffect</code> or a pile of booleans.
        </p>
      </header>

      <section className="flow" aria-label="Data flow">
        <div>
          <span>01</span>
          <strong>Effect</strong>
          <small>fetch + decode + typed error</small>
        </div>
        <div>
          <span>02</span>
          <strong>Atom</strong>
          <small>run + cache + refresh</small>
        </div>
        <div>
          <span>03</span>
          <strong>React</strong>
          <small>subscribe + render</small>
        </div>
      </section>

      <section className="workspace">
        <aside className="controls">
          <div className="control-block">
            <p className="label">AsyncResult</p>
            <div className="result-readout">
              <strong>{result._tag}</strong>
              <span className={result.waiting ? "pulse" : ""}>
                waiting: {String(result.waiting)}
              </span>
            </div>
            <p className="hint">
              <code>waiting</code> stays independent from success or failure, so refreshes do not erase useful data.
            </p>
          </div>

          <div className="control-block">
            <p className="label">Failure switch</p>
            <label className="switch-row">
              <input
                type="checkbox"
                checked={useBrokenEndpoint}
                onChange={(event) => setUseBrokenEndpoint(event.target.checked)}
              />
              <span className="switch" aria-hidden="true" />
              <span>Use broken endpoint</span>
            </label>
            <p className="hint">
              Change this after data loads. Atom keeps the previous success while exposing the typed failure.
            </p>
          </div>

          <div className="control-block file-map">
            <p className="label">Where to look</p>
            <p>
              <code>api.ts</code>
              <span>Effect</span>
            </p>
            <p>
              <code>state.ts</code>
              <span>Atom</span>
            </p>
            <p>
              <code>App.tsx</code>
              <span>React</span>
            </p>
          </div>
        </aside>

        <div className="data-panel">
          <div className="toolbar">
            <div className="filters" aria-label="Filter todos">
              {filters.map((item) => (
                <button
                  type="button"
                  className={filter === item.value ? "active" : ""}
                  aria-pressed={filter === item.value}
                  onClick={() => setFilter(item.value)}
                  key={item.value}
                >
                  {item.label}
                  <sup>{stats[item.value]}</sup>
                </button>
              ))}
            </div>
            <button type="button" className="refresh" onClick={refresh} disabled={result.waiting}>
              {result.waiting ? "Fetching..." : "Refresh"}
            </button>
          </div>

          {errorMessage !== undefined && (
            <div className="error-panel" role="alert">
              <div>
                <strong>{hasPreviousData ? "Refresh failed; showing cached data." : "Could not load todos."}</strong>
                <p>{errorMessage}</p>
              </div>
              <button type="button" onClick={retry}>Try again</button>
            </div>
          )}

          {isInitialLoading ?
            (
              <div className="loading-state" aria-live="polite">
                <span className="loader" />
                <div>
                  <strong>Running the Effect</strong>
                  <p>The first request has no previous value, so the atom is Initial + waiting.</p>
                </div>
              </div>
            ) :
            todos.length === 0 && errorMessage === undefined ?
            <div className="empty-state">No todos match this filter.</div> :
            (
              <ol className={result.waiting ? "todo-list refreshing" : "todo-list"}>
                {todos.map((todo) => (
                  <li key={todo.id}>
                    <span
                      className={todo.completed ? "check done" : "check"}
                      aria-label={todo.completed ? "Done" : "Open"}
                    />
                    <span>{todo.title}</span>
                    <small>#{String(todo.id).padStart(3, "0")}</small>
                  </li>
                ))}
              </ol>
            )}
        </div>
      </section>

      <footer>
        Data from{" "}
        <a href="https://jsonplaceholder.typicode.com/" target="_blank" rel="noreferrer">JSONPlaceholder</a>. Schema
        decoding means invalid JSON becomes a typed failure too.
      </footer>
    </main>
  )
}
