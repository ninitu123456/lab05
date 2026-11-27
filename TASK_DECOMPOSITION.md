# Task Decomposition — Lab 5

Status: ⬜ todo · 🟨 in progress · ✅ done

## Exercise 0.1 — Pure useReducer & Split Context
| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1 | Scaffold Vite + React 19, gitignore `.env` | `npm run dev` works; `.env` ignored | ✅ |
| 2 | Governance docs | rules, decomposition, AI audit committed | ✅ |
| 3 | Pure `appReducer` | No side effects; returns new state; unknown action throws | ⬜ |
| 4 | `AppProvider` split context | State & dispatch in separate providers; `dataset.theme` synced in `useEffect([state.theme])` | ⬜ |
| 5 | `ThemeToggle` | Dispatch-only consumer; `className` used; theme toggles correctly dark ⇄ light | ⬜ |
| 6 | `TabBar` + read-only consumers | `activeTab` switches `reels`/`evidence`/`chat` | ⬜ |
| 7 | Profiler verification | ThemeToggle does not re-render on tab change | ⬜ |

## Exercise 0.2 — Zero-Effect Pagination & Container Queries
_(to be decomposed)_