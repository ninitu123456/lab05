import { useAppState } from '../context/useAppContext.js';
import { TAB_LABELS } from '../constants/tabs.js';
import EvidencePanel from './EvidencePanel.jsx';
import ReelsPanel from './ReelsPanel.jsx';

const PANEL_TEXT = Object.freeze({
  chat: 'Real-time appeal chat room — coming in Exercise 2.1.',
});

function PanelContent({ tab }) {
  switch (tab) {
    case 'reels':
      return <ReelsPanel />;
    case 'evidence':
      return <EvidencePanel />;
    default:
      return <p>{PANEL_TEXT[tab]}</p>;
  }
}

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
      <PanelContent tab={activeTab} />
    </section>
  );
}