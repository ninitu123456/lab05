import { useEffect } from 'react';
import { useAppDispatch } from '../context/useAppContext.js';
import { ActionTypes } from '../context/appReducer.js';

const DEFAULT_URL = `${import.meta.env.BASE_URL}data/evidence.json`;

/**
 * Loads evidence into the global reducer.
 * - Dispatch-only: this hook reads NO state → never causes its host to re-render on data changes.
 * - Legitimate effect: syncing with an external system (network).
 * - AbortController teardown: unmount / url change cancels the in-flight request,
 *   and no dispatch happens after abort (no "update on unmounted component" race).
 */
export function useEvidenceLoader(url = DEFAULT_URL) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      dispatch({ type: ActionTypes.EVIDENCE_LOAD_START });
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Evidence payload must be an array');
        dispatch({ type: ActionTypes.EVIDENCE_LOAD_SUCCESS, payload: data });
      } catch (err) {
        if (controller.signal.aborted) return; // aborted on purpose → stay silent
        dispatch({ type: ActionTypes.EVIDENCE_LOAD_FAILURE, payload: err.message });
      }
    }

    load();
    return () => controller.abort();
  }, [url, dispatch]);
}