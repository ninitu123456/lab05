# Exercise 0.2 — Zero-Effect Pagination & Container Queries Verification

**Build:** `npm run dev` (React 19.3, Vite 8) · Dataset: `public/data/evidence.json` (14 items, 4 tags)

## Challenge B — Zero-Effect Filter & Pagination
| Criterion | Result |
|-----------|--------|
| No secondary `useEffect` for filter/pagination | ✅ Only 2 effects in `src/`: `AppProvider` (DOM theme sync) and `useEvidenceLoader` (network) |
| Filter + slice derived via `useMemo` in render | ✅ `EvidenceGrid.jsx`, `Pagination.jsx` via pure `filterByTag` + `getPageWindow` |
| Stable keys | ✅ `key={item._id}` on every `EvidenceCard` |
| Zero console key warnings | ✅ |

Command used:
```powershell
Get-ChildItem src -Recurse -Include *.js,*.jsx | Select-String "useEffect\("
```

## Derived-state behaviour
| Action | Expected | Result |
|--------|----------|--------|
| Page 3 → filter `replay` | Page resets to 1 inside reducer (no effect) | ✅ |
| Per page 6 → 3 | 5 pages, back to page 1 | ✅ |
| Out-of-range page | Clamped at render by `getPageWindow` | ✅ |

## AbortController teardown
StrictMode mount → unmount → mount shows one **(canceled)** + one **200** request.

![Network abort](./ex0.2-network-abort.png)

## Render isolation (Profiler, page 1 → 2)
`App`, `ThemeToggle`, `EvidencePanel`: **did not render**.

![Profiler page change](./ex0.2-profiler-page.png)

## Responsive (container queries)
| Container width | Columns |
|-----------------|---------|
| < 34rem | 1 |
| ≥ 34rem | 2 |
| ≥ 54rem | 3 |

No fixed-width container; `100dvh` shell; all controls ≥ 44×44px.

![Mobile layout](./ex0.2-mobile.png)