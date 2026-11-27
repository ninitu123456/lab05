import { useAppState } from '../context/useAppContext.js';
import { TAB_LABELS } from '../constants/tabs.js';

const PANEL_TEXT = Object.freeze({
  reels: 'Vertical 60fps evidence reels — coming in Exercise 1.1.',
  evidence: 'Paginated evidence archive — coming in Exercise 0.2.',
  chat: 'Real-time appeal chat room — coming in Exercise 2.1.',
});

export default function TabPanel() {
  const { activeTab } = useAppState();

  return (
    <section
      id={`panel-${activeTab}`}
      role="tabpanel"
      aria-labelledby={`tab-${activeTab}`}
      className="tab-panel"
      tabIndex={0}
    >
      <h2>{TAB_LABELS[activeTab]}</h2>
      <p>{PANEL_TEXT[activeTab]}</p>
    </section>
  );
}