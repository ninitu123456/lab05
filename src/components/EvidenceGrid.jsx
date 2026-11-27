import { useMemo } from 'react';
import { useAppState } from '../context/useAppContext.js';
import { getPageWindow } from '../utils/paginate.js';
import EvidenceCard from './EvidenceCard.jsx';

export default function EvidenceGrid() {
  const { evidenceList, evidenceStatus, evidenceError, filterTag, currentPage, pageSize } = useAppState();

  // ===== Pure derived pagination: ZERO secondary useEffect, ZERO local useState =====
  const filtered = useMemo(
    () => (filterTag ? evidenceList.filter((e) => e.tag === filterTag) : evidenceList),
    [evidenceList, filterTag],
  );

  const { start, end } = getPageWindow(filtered.length, currentPage, pageSize);

  const paginated = useMemo(() => filtered.slice(start, end), [filtered, start, end]);

  // Hooks above, early returns below (Rules of Hooks)
  if (evidenceStatus === 'idle' || evidenceStatus === 'loading') {
    return <p role="status" className="evidence-status">Loading evidence…</p>;
  }
  if (evidenceStatus === 'error') {
    return (
      <p role="alert" className="evidence-status evidence-status--error">
        Could not load evidence: {evidenceError}
      </p>
    );
  }
  if (filtered.length === 0) {
    return <p role="status" className="evidence-status">No evidence matches this filter.</p>;
  }

  return (
    <div className="evidence-container">
      <div className="evidence-grid">
        {paginated.map((item) => (
          <EvidenceCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}