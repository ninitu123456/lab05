# S3T Engineering Rules — Lab 5

## Stack
- React 19 + Vite 8 (frontend), Express 5 + Mongoose 8 (backend, from Exercise 1.2)
- Firebase v10+ Modular SDK only; Pusher Channels for real-time

## State & Rendering
- Global state = one pure `appReducer(state, action)` via `useReducer`.
- Split Context: `AppStateContext` (read-only state) and `AppDispatchContext` (dispatch only).
- Reducers are pure: no fetch, no DOM access, no localStorage, no mutation; always return a new object.
- Zero redundant `useEffect`: derived values (pagination, filters, totals) are computed during render (`useMemo` if costly).
- `useEffect` is only for syncing with external systems (DOM attributes, sockets, observers) and must return a cleanup.
- List keys use stable `item._id`, never the array index.
- JSX uses `className`, never `class`.

## Real-Time
- Socket effects depend on `[roomId, dispatch]` only; teardown calls `channel.unbind_all()` + unsubscribe/disconnect.

## Backend
- Mongoose 8: `async/await` only; no callbacks; no `useNewUrlParser` / `useUnifiedTopology`.
- Counters use atomic `$inc`.

## Security
- Never commit `.env`; client keys use the `VITE_` prefix; document keys in `.env.example`.
- Every mutating WebMCP tool must `await client.requestUserInteraction({ reason })` before executing.

## Dependencies
- Forbidden: `react-ticker`, `react-virtualized-legacy`, `@material-ui/core` (MUI v4), Firebase v8 namespaced API.
- Prefer native CSS/HTML5 (`@keyframes`, `scroll-snap`, `@container`, `100dvh`).

## Git
- Atomic commits, Conventional Commits format: `type(scope): summary`.
- Max 12 commits per exercise.

## AI Usage
- "Generate with AI. Verify with Engineering."
- Any AI output matching a pattern in `AI_FAILURE_AUDIT.md` is logged there immediately.