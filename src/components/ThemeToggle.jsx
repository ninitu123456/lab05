import { memo } from 'react';
import { useAppDispatch } from '../context/useAppContext.js';
import { ActionTypes } from '../context/appReducer.js';

/**
 * Dispatch-only consumer (Exercise 0.1).
 * - Reads NO state → never re-renders when theme/activeTab/data change.
 * - Icon is swapped by CSS via [data-theme], not by React state.
 * - memo() blocks re-renders caused by the PARENT re-rendering.
 * Legacy fixes: class= → className; no direct dataset.theme mutation in the click handler.
 */
function ThemeToggle() {
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle color theme"
      title="Toggle color theme"
      onClick={() => dispatch({ type: ActionTypes.TOGGLE_THEME })}
    >
      <span className="theme-toggle__icon" aria-hidden="true" />
    </button>
  );
}

export default memo(ThemeToggle);