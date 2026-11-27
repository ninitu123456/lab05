# AI Failure Audit — Lab 5

> **Audit Protocol (Slide 29):** Any occurrence of the patterns below must be
> immediately logged with **root cause**, **failure prompt**, and **corrected diff**.

## Reference: Top 5 Lab 5 AI Hallucinations

| ID | Pattern | Category | Approved S3T Standard |
|----|---------|----------|------------------------|
| 01 | `useEffect(..., [..., messages])` around socket subscription | Reactive Loop WebSocket | `useEffect(..., [roomId, dispatch])` + `channel.unbind_all()` teardown |
| 02 | `firebase.initializeApp()`, `firebase.auth().currentUser` | Legacy SDK Collapse (Firebase v8) | Modular `initializeApp()` + `getAuth(app)` (Firebase v10+) |
| 03 | `Reel.findById(id, (err, res) => ...)`, `{ useNewUrlParser, useUnifiedTopology }` | Async Runtime Error (Mongoose callbacks) | `await Reel.findById(id)` + native async error handling |
| 04 | `react-ticker`, `react-virtualized-legacy`, `@material-ui/core` | Package Deprecation Bloat | Native CSS/HTML5 (`@keyframes marquee` + hardware acceleration) |
| 05 | `navigator.modelContext` tool mutating data without consent | Zero-Consent Mutation Exploit | `await client.requestUserInteraction({ reason })` before mutation |

---

## Log Entries

<!--
Copy this template for each incident:

### [AF-XXX] <short title>
- **Date:** YYYY-MM-DD
- **Exercise:** x.x
- **Pattern ID:** 01–05 (or "Other")
- **Tool / Model:** <AI tool used>
- **Failure Prompt:**
  > <exact prompt given to the AI>
- **AI Output (broken):**
  ```js
  // snippet
  ```
- **Root Cause:** <why the AI produced it — e.g. trained on pre-2023 tutorials>
- **Corrected Diff:**
  ```diff
  - broken line
  + fixed line
  ```
- **Verification:** <how the fix was verified>
-->

### [AF-001] Constant exported from a component module breaks Fast Refresh
- **Date:** 2026-11-27
- **Exercise:** 0.1 (Step 6 — TabBar/TabPanel)
- **Pattern ID:** Other (not in Slide 29 Top 5)
- **Tool / Model:** Claude (chat assistant)
- **Failure Prompt:**
  > Build an accessible TabBar and a read-only TabPanel that share tab labels.
- **AI Output (broken):**
  ```jsx
  // src/components/TabBar.jsx
  export const TAB_LABELS = Object.freeze({ reels: 'Reels', evidence: 'Evidence', chat: 'Chat' });
  export default function TabBar() { /* ... */ }
  ```
- **Root Cause:** The model co-located a shared constant with a component for convenience,
  ignoring Vite's Fast Refresh rule that a `.jsx` module must export only components
  (otherwise HMR falls back to full reload and resets reducer state).
- **Corrected Diff:**
  ```diff
  - // src/components/TabBar.jsx
  - export const TAB_LABELS = Object.freeze({ ... });
  + // src/constants/tabs.js
  + export const TAB_LABELS = Object.freeze({ ... });

  - import { TAB_LABELS } from './TabBar.jsx';
  + import { TAB_LABELS } from '../constants/tabs.js';
  ```
- **Verification:** `npm run lint` → `react(only-export-components)` warning gone; `npm run build` passes.