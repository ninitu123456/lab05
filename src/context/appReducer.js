// Pure reducer — Lab 5 Exercises 0.1, 0.2 & 1.1
// Rules: no fetch, no DOM, no localStorage, no mutation. Same input → same output.

export const ActionTypes = Object.freeze({
  // Exercise 0.1
  TOGGLE_THEME: 'theme/toggled',
  SET_THEME: 'theme/set',
  SET_ACTIVE_TAB: 'tab/set',
  // Exercise 0.2
  EVIDENCE_LOAD_START: 'evidence/loadStart',
  EVIDENCE_LOAD_SUCCESS: 'evidence/loadSuccess',
  EVIDENCE_LOAD_FAILURE: 'evidence/loadFailure',
  SET_FILTER_TAG: 'evidence/filterTagSet',
  SET_PAGE: 'evidence/pageSet',
  SET_PAGE_SIZE: 'evidence/pageSizeSet',
  // Exercise 1.1
  REELS_LOAD_START: 'reels/loadStart',
  REELS_LOAD_SUCCESS: 'reels/loadSuccess',
  REELS_LOAD_FAILURE: 'reels/loadFailure',
});

export const THEMES = Object.freeze(['dark', 'light']);
export const TABS = Object.freeze(['reels', 'evidence', 'chat']);
export const PAGE_SIZES = Object.freeze([3, 6, 9, 12]);

export const initialState = Object.freeze({
  // Exercise 0.1
  theme: 'dark',
  activeTab: 'reels',
  // Exercise 0.2 — legacy React 8 bug fix: arrays start as [], never useState('')
  evidenceList: [],
  evidenceStatus: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  evidenceError: null,
  filterTag: '', // '' = all tags
  currentPage: 1,
  pageSize: 6,
  // Exercise 1.1
  reelList: [],
  reelStatus: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  reelError: null,
});

const isPositiveInt = (n) => Number.isInteger(n) && n > 0;

export function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_THEME:
      // Legacy bug fix: theme derived from STATE, not read/mutated from document.dataset
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };

    case ActionTypes.SET_THEME:
      if (!THEMES.includes(action.payload) || action.payload === state.theme) return state;
      return { ...state, theme: action.payload };

    case ActionTypes.SET_ACTIVE_TAB:
      // Same tab or invalid tab → return the SAME reference → React bails out, zero re-render
      if (!TABS.includes(action.payload) || action.payload === state.activeTab) return state;
      return { ...state, activeTab: action.payload };

    case ActionTypes.EVIDENCE_LOAD_START:
      return { ...state, evidenceStatus: 'loading', evidenceError: null };

    case ActionTypes.EVIDENCE_LOAD_SUCCESS:
      if (!Array.isArray(action.payload)) return state;
      return { ...state, evidenceList: action.payload, evidenceStatus: 'success', evidenceError: null };

    case ActionTypes.EVIDENCE_LOAD_FAILURE:
      return { ...state, evidenceStatus: 'error', evidenceError: String(action.payload ?? 'Unknown error') };

    case ActionTypes.SET_FILTER_TAG:
      if (typeof action.payload !== 'string' || action.payload === state.filterTag) return state;
      // New filter → back to page 1 (handled here, NOT in a useEffect)
      return { ...state, filterTag: action.payload, currentPage: 1 };

    case ActionTypes.SET_PAGE:
      if (!isPositiveInt(action.payload) || action.payload === state.currentPage) return state;
      return { ...state, currentPage: action.payload };

    case ActionTypes.SET_PAGE_SIZE:
      if (!PAGE_SIZES.includes(action.payload) || action.payload === state.pageSize) return state;
      return { ...state, pageSize: action.payload, currentPage: 1 };

    case ActionTypes.REELS_LOAD_START:
      return { ...state, reelStatus: 'loading', reelError: null };

    case ActionTypes.REELS_LOAD_SUCCESS:
      if (!Array.isArray(action.payload)) return state;
      return { ...state, reelList: action.payload, reelStatus: 'success', reelError: null };

    case ActionTypes.REELS_LOAD_FAILURE:
      return { ...state, reelStatus: 'error', reelError: String(action.payload ?? 'Unknown error') };

    default:
      throw new Error(`appReducer: unknown action type "${action.type}"`);
  }
}