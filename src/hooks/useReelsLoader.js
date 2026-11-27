import { ActionTypes } from '../context/appReducer.js';
import { apiUrl } from '../config/api.js';
import { useJsonLoader } from './useJsonLoader.js';

// Sprint 2: reels now come from Express 5 + MongoDB (reels.json is only the seed source)
const DEFAULT_URL = apiUrl('/api/v2/reels');

export function useReelsLoader(url = DEFAULT_URL) {
  useJsonLoader(
    url,
    ActionTypes.REELS_LOAD_START,
    ActionTypes.REELS_LOAD_SUCCESS,
    ActionTypes.REELS_LOAD_FAILURE,
  );
}