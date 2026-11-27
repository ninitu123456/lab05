import { useAppState } from '../context/useAppContext.js';
import { TAB_LABELS } from '../constants/tabs.js';
import EvidencePanel from './EvidencePanel.jsx';

const PANEL_TEXT = Object.freeze({
  reels: 'Vertical 60fps evidence reels — coming in Exercise 1.1.',
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
      {activeTab === 'evidence' ? <EvidencePanel /> : <p>{PANEL_TEXT[activeTab]}</p>}
    </section>
  );
}