import { useAppState } from '../context/useAppContext.js';
import ReelCard from './ReelCard.jsx';

/**
 * Vertical snap-scrolling reel feed.
 * - Read-only consumer of reels state (loading/error/empty handled here).
 * - Each ReelCard owns its own IntersectionObserver → feed has ZERO effects.
 * - tabIndex={0}: scrollable region must be keyboard-focusable (↑/↓/PageDown scroll it).
 */
export default function ReelFeed() {
  const { reelList, reelStatus, reelError } = useAppState();

  if (reelStatus === 'idle' || reelStatus === 'loading') {
    return <p role="status" className="reel-status">Loading reels…</p>;
  }
  if (reelStatus === 'error') {
    return (
      <p role="alert" className="reel-status reel-status--error">
        Could not load reels: {reelError}
      </p>
    );
  }
  if (reelList.length === 0) {
    return <p role="status" className="reel-status">No reels yet.</p>;
  }

  return (
    <section className="reel-feed" aria-label="Evidence reels" tabIndex={0}>
      {reelList.map((reel) => (
        <ReelCard key={reel._id} reel={reel} />
      ))}
    </section>
  );
}