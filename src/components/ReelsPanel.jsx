import { useReelsLoader } from '../hooks/useReelsLoader.js';
import ReelFeed from './ReelFeed.jsx';

/**
 * Composition root of the Reels tab (same pattern as EvidencePanel).
 * - Reads NO state → never re-renders when reels load.
 * - Mount = fetch reels; leaving the tab = abort request + every ReelCard
 *   disconnects its IntersectionObserver and its <video> is removed (decoder freed).
 */
export default function ReelsPanel() {
  useReelsLoader();
  return <ReelFeed />;
}