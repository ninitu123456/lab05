# Exercise 1.1 — 60fps Vertical Reels & IntersectionObserver Verification

**Build:** `npm run dev` (React 19.3, Vite 8) · Dataset: `public/data/reels.json` (4 reels, H.264 540×960)

## Contract checklist (Slide 24)
| Requirement | Implementation | Result |
|-------------|----------------|--------|
| `100dvh` viewport container | `.reel-feed`, `.reel-card { block-size: 100dvh }` | ✅ |
| `scroll-snap-type: y mandatory` | `.reel-feed` + `scroll-snap-stop: always` | ✅ |
| `object-fit: cover`, 100%/100% | `.reel-card__video` absolutely positioned | ✅ |
| `IntersectionObserver({ threshold: 0.75 })` | `ReelCard.jsx` | ✅ |
| `video.play().catch()` + muted fallback | `ReelCard.jsx` | ✅ |
| Pause offscreen | `video.pause()` when `!isIntersecting` | ✅ |
| `observer.disconnect()` teardown | effect cleanup | ✅ |
| `aria-pressed` playback toggle | "Toggle reel playback" button | ✅ |
| GPU ticker via `translate3d` | `@keyframes marquee` in `ticker.css` | ✅ |
| `prefers-reduced-motion` stops ticker | `animation: none; transform: none` | ✅ |
| No dead deps (`react-ticker`, MUI v4) | `package.json` has only react, react-dom | ✅ |

## A. Rapid scroll — exactly one playing video
```js
[...document.querySelectorAll('video')].map((v) => (v.paused ? 'paused' : 'PLAYING'))
// → ['paused', 'PLAYING', 'paused', 'paused']
```
![Rapid scroll](./ex1.1-rapid-scroll.png)

## B. Frame rate
Performance panel while scrolling 4 reels: frames ≈ 16.7 ms, no long tasks on main thread.

![Performance](./ex1.1-performance.png)

## C. Cumulative Layout Shift
Lighthouse (mobile): **CLS = 0** — fixed `100dvh` boxes + `width`/`height` attributes on `<video>`.

![Lighthouse CLS](./ex1.1-lighthouse-cls.png)

## D. Teardown
Switching Reels → Evidence: `document.querySelectorAll('video').length === 0`, observers disconnected, fetch aborted.