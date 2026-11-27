import { useMemo } from 'react';
import { useAppState, useAppDispatch } from '../context/useAppContext.js';
import { ActionTypes, PAGE_SIZES } from '../context/appReducer.js';
import { countByTag } from '../utils/evidence.js';

export default function FilterBar() {
  const { evidenceList, evidenceStatus, filterTag, pageSize } = useAppState();
  const dispatch = useAppDispatch();

  // Derived: tag list + counts recomputed only when the data changes
  const tagCounts = useMemo(() => countByTag(evidenceList), [evidenceList]);

  if (evidenceStatus !== 'success') return null;

  const options = [['', evidenceList.length], ...tagCounts];

  return (
    <div className="filter-bar">
      <div className="filter-bar__tags" role="group" aria-label="Filter evidence by tag">
        {options.map(([tag, count]) => (
          <button
            key={tag || 'all'}
            type="button"
            className="filter-bar__chip"
            aria-pressed={tag === filterTag}
            onClick={() => dispatch({ type: ActionTypes.SET_FILTER_TAG, payload: tag })}
          >
            {tag || 'all'} <span className="filter-bar__count">({count})</span>
          </button>
        ))}
      </div>

      <label className="filter-bar__size">
        Per page
        <select
          value={pageSize}
          onChange={(e) => dispatch({ type: ActionTypes.SET_PAGE_SIZE, payload: Number(e.target.value) })}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </label>
    </div>
  );
}