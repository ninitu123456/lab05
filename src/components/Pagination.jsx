import { useMemo } from 'react';
import { useAppState, useAppDispatch } from '../context/useAppContext.js';
import { ActionTypes } from '../context/appReducer.js';
import { filterByTag } from '../utils/evidence.js';
import { getPageWindow } from '../utils/paginate.js';

export default function Pagination() {
  const { evidenceList, evidenceStatus, filterTag, currentPage, pageSize } = useAppState();
  const dispatch = useAppDispatch();

  // Derived during render — totalPages is NEVER stored in state
  const totalItems = useMemo(
    () => filterByTag(evidenceList, filterTag).length,
    [evidenceList, filterTag],
  );
  const { totalPages, page, start } = getPageWindow(totalItems, currentPage, pageSize);

  if (evidenceStatus !== 'success' || totalItems === 0) return null;

  const goTo = (target) => dispatch({ type: ActionTypes.SET_PAGE, payload: target });
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const lastShown = Math.min(start + pageSize, totalItems);

  return (
    <nav className="pagination" aria-label="Evidence pages">
      <p className="pagination__summary" role="status">
        Showing {start + 1}–{lastShown} of {totalItems}
      </p>
      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__btn"
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          ‹
        </button>
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            className="pagination__btn"
            aria-current={n === page ? 'page' : undefined}
            aria-label={`Page ${n}`}
            onClick={() => goTo(n)}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className="pagination__btn"
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </nav>
  );
}