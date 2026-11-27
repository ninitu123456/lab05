import { createContext } from 'react';

// Read-only state channel: consumers re-render when state changes
export const AppStateContext = createContext(null);
AppStateContext.displayName = 'AppStateContext';

// Dispatch-only channel: dispatch identity is stable → consumers NEVER re-render on data updates
export const AppDispatchContext = createContext(null);
AppDispatchContext.displayName = 'AppDispatchContext';