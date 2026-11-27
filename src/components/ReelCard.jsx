import { memo, useEffect, useRef, useState } from 'react';
import TelemetryTicker from './TelemetryTicker.jsx';

const VISIBLE_THRESHOLD = 0.75; // play only when ≥ 75% of the reel is on screen

/**
 * Exercise 1.1 — 60fps vertical reel (contract: Slide 24).
 * - IntersectionObserver auto-play / auto-pause (frees the hardware decoder offscreen).
 * - play().catch(): browsers reject autoplay with sound → fall back to muted.
 * - observer.disconnect() teardown → zero observer leaks.
 * - isPlaying is driven by the <video> element's own play/pause EVENTS, not by an effect.
 */
function ReelCard({ reel }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true); // autoplay policy: start muted

  // ===== Viewport auto-play engine & observer lifecycle =====
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;

        if (entry.isIntersecting) {
          // Trap browser autoplay block rejection (unhandled promise = console error)
          video.play().catch((err) => {
            console.debug('Autoplay blocked', err);
            setMuted(true);
          });
        } else {
          // Free hardware decoder when out of viewport
          video.pause();
        }
      },
      { threshold: VISIBLE_THRESHOLD },
    );

    observer.observe(container);
    // Explicit teardown prevents observer memory leaks
    return () => observer.disconnect();
  }, []); // refs + state setter are stable → run once per mount

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch((err) => console.debug('Play rejected', err));
    } else {
      video.pause();
    }
  };

  return (
    <article ref={containerRef} className="reel-card" aria-label={reel.title}>
      <video
        ref={videoRef}
        className="reel-card__video"
        src={reel.src}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        width={540}
        height={960}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Ticker pauses together with the reel (WCAG 2.2.2) */}
      <TelemetryTicker items={reel.telemetry} running={isPlaying} />

      <div className="reel-card__overlay">
        <div className="reel-card__info">
          <h3 className="reel-card__title">{reel.title}</h3>
          <p className="reel-card__player">@{reel.player}</p>
        </div>

        {/* WCAG 2.2 AA accessible playback control contract */}
        <div className="reel-card__actions">
          <button
            type="button"
            className="reel-card__btn"
            aria-pressed={isPlaying}
            aria-label="Toggle reel playback"
            onClick={togglePlayback}
          >
            <span aria-hidden="true">{isPlaying ? '❚❚' : '▶'}</span>
          </button>
          <button
            type="button"
            className="reel-card__btn"
            aria-pressed={!muted}
            aria-label="Toggle reel sound"
            onClick={() => setMuted((m) => !m)}
          >
            <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

// memo: other reels' state/props changes never re-render this card
export default memo(ReelCard);