# Task Decomposition — Lab 5

Status: ⬜ todo · 🟨 in progress · ✅ done

## Exercise 0.1 — Pure useReducer & Split Context
| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1 | Scaffold Vite + React 19, gitignore `.env` | `npm run dev` works; `.env` ignored | ✅ |
| 2 | Governance docs | rules, decomposition, AI audit committed | ✅ |
| 3 | Pure `appReducer` | No side effects; returns new state; unknown action throws | ✅ |
| 4 | `AppProvider` split context | State & dispatch in separate providers; `dataset.theme` synced in `useEffect([state.theme])` | ✅ |
| 5 | `ThemeToggle` | Dispatch-only consumer; `className` used; theme toggles correctly dark ⇄ light | ✅ |
| 6 | `TabBar` + read-only consumers | `activeTab` switches `reels`/`evidence`/`chat` | ✅ |
| 7 | Profiler verification | ThemeToggle does not re-render on tab change | ✅ |

## Exercise 0.2 — Zero-Effect Pagination & Container Queries
| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1 | Extend `appReducer` with evidence state | `evidenceList` starts as `[]`; filter/page-size change resets page to 1 inside reducer | ✅ |
| 2 | Mock data + `useEvidenceLoader` | Fetch uses `AbortController`; aborted on unmount; no state update after unmount | ✅ |
| 3 | `EvidenceCard` + `EvidenceGrid` | Filter + slice derived via `useMemo` in render; zero secondary `useEffect`; `key={item._id}` | ✅ |
| 4 | `FilterBar` + `Pagination` | Tags & `totalPages` derived; out-of-range page clamped at render; 44px targets | ✅ |
| 5 | Responsive layout | `@container` queries, `100dvh`, `clamp()`; no fixed 800px container | ⬜ |
| 6 | Integration + verification | Evidence tab works; Challenge B criteria met; zero console key warnings | ⬜ |