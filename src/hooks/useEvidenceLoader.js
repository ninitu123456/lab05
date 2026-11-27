import { ActionTypes } from '../context/appReducer.js';
import { useJsonLoader } from './useJsonLoader.js';

const DEFAULT_URL = `${import.meta.env.BASE_URL}data/evidence.json`;

export function useEvidenceLoader(url = DEFAULT_URL) {
  useJsonLoader(
    url,
    ActionTypes.EVIDENCE_LOAD_START,
    ActionTypes.EVIDENCE_LOAD_SUCCESS,
    ActionTypes.EVIDENCE_LOAD_FAILURE,
  );
}