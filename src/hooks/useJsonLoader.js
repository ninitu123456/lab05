import { useEffect } from 'react';
import { useAppDispatch } from '../context/useAppContext.js';

/**
 * Generic AbortController-guarded JSON collection loader → global reducer.
 * - Action types are passed as PRIMITIVE strings → stable deps, no re-run loop.
 * - Dispatch-only: host component never re-renders because of the loaded data.
 * - Teardown aborts the in-flight request; no dispatch after abort.
 */
export function useJsonLoader(url, startType, successType, failureType) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      dispatch({ type: startType });
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Payload must be an array');
        dispatch({ type: successType, payload: data });
      } catch (err) {
        if (controller.signal.aborted) return; // aborted on purpose → stay silent
        dispatch({ type: failureType, payload: err.message });
      }
    }

    load();
    return () => controller.abort();
  }, [url, startType, successType, failureType, dispatch]);
}