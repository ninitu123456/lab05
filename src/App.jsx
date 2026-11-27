import ThemeToggle from './components/ThemeToggle.jsx';
import TabBar from './components/TabBar.jsx';
import TabPanel from './components/TabPanel.jsx';

// App reads NO context → it never re-renders on state changes.
// Only the leaf consumers (TabBar, TabPanel) re-render.
export default function App() {
  return (
    <div className="app-shell">
      <ThemeToggle />
      <header className="app-header">
        <h1 className="app-title">#JusticeForHimassTanVuu</h1>
        <p className="app-subtitle">UIT S3T · Lab 5 Evidence Dashboard</p>
        <TabBar />
      </header>
      <main className="app-main">
        <TabPanel />
      </main>
    </div>
  );
}