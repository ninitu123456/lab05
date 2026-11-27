import { useEvidenceLoader } from '../hooks/useEvidenceLoader.js';
import FilterBar from './FilterBar.jsx';
import EvidenceGrid from './EvidenceGrid.jsx';
import Pagination from './Pagination.jsx';

/**
 * Composition root of the Evidence tab.
 * - Reads NO state → never re-renders on data/filter/page changes; only its leaf consumers do.
 * - Owns the loader lifecycle: mounting the tab fetches, leaving the tab aborts (AbortController).
 */
export default function EvidencePanel() {
  useEvidenceLoader();

  return (
    <>
      <FilterBar />
      <EvidenceGrid />
      <Pagination />
    </>
  );
}