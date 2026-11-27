import { useEffect, useReducer } from 'react';
import { appReducer, initialState } from './appReducer.js';
import { AppStateContext, AppDispatchContext } from './contexts.js';

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // dataset.theme sync: the ONLY place that touches the DOM.
  // Legitimate effect = syncing React state to an external system (the <html> element).
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}