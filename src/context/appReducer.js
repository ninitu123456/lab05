// Pure reducer — Lab 5 Exercise 0.1
// Rules: no fetch, no DOM, no localStorage, no mutation. Same input → same output.

export const ActionTypes = Object.freeze({
  TOGGLE_THEME: 'theme/toggled',
  SET_THEME: 'theme/set',
  SET_ACTIVE_TAB: 'tab/set',
});

export const THEMES = Object.freeze(['dark', 'light']);
export const TABS = Object.freeze(['reels', 'evidence', 'chat']);

export const initialState = Object.freeze({
  theme: 'dark',
  activeTab: 'reels',
});

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

    default:
      throw new Error(`appReducer: unknown action type "${action.type}"`);
  }
}