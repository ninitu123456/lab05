import { memo } from 'react';

/**
 * Zero-dependency telemetry ticker (replaces dead `react-ticker` — Slide 29 #04).
 * - Pure CSS @keyframes marquee with translate3d → runs on the GPU compositor, 0 JS per frame.
 * - Content rendered twice; animating to -50% makes the loop seamless.
 * - Screen readers get ONE static copy; the moving duplicate track is aria-hidden.
 * - `running` follows the reel's playback → pausing the reel pauses the ticker
 *   (WCAG 2.2.2 Pause, Stop, Hide: moving content must be pausable).
 */
function TelemetryTicker({ items, running }) {
  if (!items?.length) return null;

  // Longer content → longer loop, so reading speed stays constant
  const duration = `${Math.max(8, items.length * 3)}s`;

  return (
    <div
      className={`ticker${running ? '' : ' ticker--paused'}`}
      style={{ '--ticker-duration': duration }}
    >
      <p className="visually-hidden">Telemetry: {items.join(', ')}</p>

      <div className="ticker__track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <ul className="ticker__list" key={copy}>
            {items.map((item) => (
              <li className="ticker__item" key={item}>{item}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default memo(TelemetryTicker);