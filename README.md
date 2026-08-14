# Effect + Effect Atom + React

A small Vite application showing one complete data-fetching flow. It deliberately avoids request-related React state and
`useEffect` calls so each library's responsibility is visible.

```text
React event / render
        |
Effect Atom (state, dependencies, execution, cache, refresh)
        |
Effect service (HTTP policy, schema decoding, typed errors)
```

## Run it

Install dependencies and start the Vite development server:

```sh
pnpm install
pnpm dev
```

Open the URL printed by Vite. For a production build:

```sh
pnpm build
```

## What to try

1. Reload the page to see the initial `Initial + waiting` state.
2. Press **Refresh**. Existing todos remain visible as `Success + waiting` while the new request runs.
3. Enable **Use broken endpoint**. The request becomes a typed `TodoApiError`, while `AsyncResult` retains and displays
   the previous successful todos.
4. Press **Try again**. Changing the writable endpoint atom automatically invalidates the dependent request atom.
5. Change the todo filter. The filter and counts are derived atoms; they do not trigger another HTTP request.

## Where each concern lives

| File                               | Responsibility                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`src/api.ts`](src/api.ts)         | An Effect service with a fetch client, status handling, transient retries, schema decoding, and a typed error. |
| [`src/state.ts`](src/state.ts)     | Writable UI atoms, the Effect runtime, the request atom, and derived atoms.                                    |
| [`src/App.tsx`](src/App.tsx)       | React subscriptions and explicit rendering of loading, refreshing, failure, stale-data, and success states.    |
| [`src/main.tsx`](src/main.tsx)     | A `RegistryProvider` that scopes Atom state and Effect resources to the React tree.                            |
| [`vite.config.ts`](vite.config.ts) | Rolldown tree shaking, Oxc minification, and React Fast Refresh.                                               |

The key distinction is that `AsyncResult` does not collapse every request into `loading | error | data`. Its `waiting`
flag is independent of `Initial`, `Success`, and `Failure`, and a failure can retain its previous success. This makes
background refresh and stale-data error handling explicit without coordinating several React state variables.
