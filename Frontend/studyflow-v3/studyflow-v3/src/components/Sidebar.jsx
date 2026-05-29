import React from 'react';
import { useApp } from '../context/AppContext';

const NAV = [
  { section: 'Main', items: [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'planner', label: 'Study Planner', icon: '📅' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'progress', label: 'Progress', icon: '📈' },
  ]},
  { section: 'Tools', items: [
    { id: 'quiz', label: 'Quiz & Tests', icon: '✏️' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ]},
];

const ADMIN_NAV = [
  { section: 'Admin', items: [
    { id: 'admin', label: 'Admin Panel', icon: '🛡️' },
  ]},
];
export default function Sidebar({ onShowHome }) {
  const { user, logout, page, setPage, streak, xp } = useApp();

  const level = Math.floor(xp / 500) + 1;
  const xpToNext = 500 - (xp % 500);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>StudyFlow</h1>
        <span>Smart Learning Platform</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(group => (
          <div key={group.section}>
            <div className="nav-section-label">{group.section}</div>
            {group.items.map(item => (
              <button
                key={item.id}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}

        {user?.role === 'admin' && ADMIN_NAV.map(group => (
          <div key={group.section}>
            <div className="nav-section-label">{group.section}</div>
            {group.items.map(item => (
              <button
                key={item.id}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}

        {/* Streak & XP */}
        <div style={{ margin: '1rem 1rem 0', background: 'rgba(108,99,255,0.08)', borderRadius: '12px', padding: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Level {level}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{xpToNext} XP to next</span>
          </div>
          <div className="progress-bar" style={{ height: '4px', marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${(xp % 500) / 5}%` }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="streak-fire">🔥</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{streak} day streak</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{xp} XP</span>
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="avatar">{user?.name?.slice(0,2).toUpperCase()}</div>
          <div className="user-info" style={{ flex: 1 }}>
            <p>{user?.name?.split(' ')[0]}</p>
            <span>{user?.role === 'admin' ? 'Administrator' : 'Student'}</span>
          </div>
          <button className="btn-ghost btn" onClick={() => { logout(); onShowHome(); }} title="Logout" style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}>⏻</button>
        </div>
      </div>
    </aside>
  );
}
