import { useContext } from 'react';
import { AppStateContext, AppDispatchContext } from './contexts.js';

export function useAppState() {
  const state = useContext(AppStateContext);
  if (state === null) throw new Error('useAppState must be used inside <AppProvider>');
  return state;
}

export function useAppDispatch() {
  const dispatch = useContext(AppDispatchContext);
  if (dispatch === null) throw new Error('useAppDispatch must be used inside <AppProvider>');
  return dispatch;
}