import { ActionTypes } from '../context/appReducer.js';
import { useJsonLoader } from './useJsonLoader.js';

const DEFAULT_URL = `${import.meta.env.BASE_URL}data/reels.json`;

export function useReelsLoader(url = DEFAULT_URL) {
  useJsonLoader(
    url,
    ActionTypes.REELS_LOAD_START,
    ActionTypes.REELS_LOAD_SUCCESS,
    ActionTypes.REELS_LOAD_FAILURE,
  );
}