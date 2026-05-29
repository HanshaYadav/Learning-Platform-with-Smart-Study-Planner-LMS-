import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Planner from './pages/Planner';
import Progress from './pages/Progress';
import Analytics from './pages/Analytics';
import Quiz from './pages/Quiz';
import Notes from './pages/Notes';
import Admin from './pages/Admin';
import HomePage from './pages/HomePage';
function AdminShell({ onShowHome }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ maxWidth:1380, margin:'0 auto', padding:'2rem 1.5rem' }}>
        <Admin onShowHome={onShowHome} />
      </div>
    </div>
  );
}

function StudentShell({ onShowHome }) {
  const { page } = useApp();
  const pages = {
    dashboard: <Dashboard />,
    courses:   <Courses />,
    planner:   <Planner />,
    progress:  <Progress />,
    analytics: <Analytics />,
    quiz:      <Quiz />,
    notes:     <Notes />,
  };
  return (
    <div className="app-shell">
      <Sidebar onShowHome={onShowHome} />
      <main className="main-content">{pages[page] || <Dashboard />}</main>
    </div>
  );
}

function AppShell({ onShowHome, defaultTab }) {
  const { user } = useApp();
  if (!user) return <Login onShowHome={onShowHome} defaultTab={defaultTab} />;
  return user.role === 'admin' ? <AdminShell onShowHome={onShowHome} /> : <StudentShell onShowHome={onShowHome} />;
}

export default function App() {
  const [showHome, setShowHome] = useState(true);
  const [defaultTab, setDefaultTab] = useState('login');

  return (
    <AppProvider>
      {showHome
  ? <HomePage
      onGetStarted={() => { setDefaultTab('login'); setShowHome(false); }}
      onSignIn={() => { setDefaultTab('register'); setShowHome(false); }}
    />
  : <AppShell onShowHome={() => setShowHome(true)} defaultTab={defaultTab} />
}
    </AppProvider>
  );
}