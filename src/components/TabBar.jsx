import { TABS, ActionTypes } from '../context/appReducer.js';
import { TAB_LABELS } from '../constants/tabs.js';
import { useAppState, useAppDispatch } from '../context/useAppContext.js';

export default function TabBar() {
  const { activeTab } = useAppState();
  const dispatch = useAppDispatch();

  const selectTab = (tab) => dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tab });

  // WAI-ARIA Tabs pattern: ←/→ moves between tabs
  const handleKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const nextIndex = (TABS.indexOf(activeTab) + step + TABS.length) % TABS.length;
    const nextTab = TABS[nextIndex];
    selectTab(nextTab);
    document.getElementById(`tab-${nextTab}`)?.focus();
  };

  return (
    <nav className="tab-bar" role="tablist" aria-label="Main sections" onKeyDown={handleKeyDown}>
      {TABS.map((tab) => {
        const selected = tab === activeTab;
        return (
          <button
            key={tab}
            id={`tab-${tab}`}
            type="button"
            role="tab"
            className="tab-bar__tab"
            aria-selected={selected}
            aria-controls={`panel-${tab}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => selectTab(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        );
      })}
    </nav>
  );
}