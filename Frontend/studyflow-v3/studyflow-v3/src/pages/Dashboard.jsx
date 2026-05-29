import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { analyticsAPI } from '../context/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EMPTY_WEEK = [
  { day: 'Mon', hours: 0 }, { day: 'Tue', hours: 0 }, { day: 'Wed', hours: 0 },
  { day: 'Thu', hours: 0 }, { day: 'Fri', hours: 0 }, { day: 'Sat', hours: 0 }, { day: 'Sun', hours: 0 },
];

export default function Dashboard() {
  const { user, courses, tasks, streak, xp, setPage } = useApp();
  const [weekData, setWeekData] = useState(EMPTY_WEEK);
  const [totalHours, setTotalHours] = useState(0);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    analyticsAPI.get(user.id)
      .then(data => {
        if (data?.weekly_hours?.length) {
          setWeekData(data.weekly_hours.map(d => ({ day: d.day, hours: d.hours || 0 })));
          setTotalHours(data.total_hours_week || 0);
        }
        setAnalyticsLoaded(true);
      })
      .catch(() => setAnalyticsLoaded(true));
  }, [user]);

  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed).length;
  const weakCourse = [...courses].sort((a, b) => (a.progress || 0) - (b.progress || 0))[0];
  const upcomingTasks = tasks.filter(t => !t.completed).slice(0, 4);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p>Here's your learning overview for today</p>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card purple">
          <div className="stat-label">Study Streak</div>
          <div className="stat-value" style={{ color: '#a89dff' }}>{streak || 0}</div>
          <div className="stat-change up">🔥 days in a row</div>
        </div>
        <div className="stat-card teal">
          <div className="stat-label">Total XP</div>
          <div className="stat-value" style={{ color: 'var(--accent3)' }}>{xp || 0}</div>
          <div className="stat-change up">↑ earned so far</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-label">Pending Tasks</div>
          <div className="stat-value" style={{ color: 'var(--accent2)' }}>{pending}</div>
          <div className="stat-change">{completed} completed</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Hours This Week</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {totalHours > 0 ? `${totalHours}h` : '—'}
          </div>
          <div className="stat-change">
            {totalHours > 0 ? 'This week' : 'No sessions yet'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem', marginBottom: '1rem' }}>
        {/* Study hours chart */}
        <div className="card">
          <div className="section-title">Study Hours This Week</div>
          {totalHours === 0 && analyticsLoaded ? (
            <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem' }}>
              <div style={{ fontSize: '2rem' }}>📊</div>
              <p style={{ fontSize: '0.85rem' }}>No study sessions recorded yet this week.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weekData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: 'rgba(240,238,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(240,238,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0eeff' }} />
                <Area type="monotone" dataKey="hours" stroke="#6c63ff" strokeWidth={2.5} fill="url(#grad)" dot={{ r: 3, fill: '#6c63ff' }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Achievements */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="section-title">Achievements</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { icon: '🔥', label: 'On Fire', sub: streak > 0 ? `${streak}-day streak` : 'Start your streak!', color: 'rgba(255,179,71,0.12)', unlocked: streak >= 7 },
              { icon: '⭐', label: 'Star Learner', sub: 'Top 10%', color: 'rgba(108,99,255,0.12)', unlocked: xp >= 1000 },
              { icon: '📚', label: 'Bookworm', sub: `${courses.length} courses`, color: 'rgba(67,232,198,0.1)', unlocked: courses.length >= 5 },
              { icon: '🎯', label: 'Focused', sub: `${completed} tasks done`, color: 'rgba(255,101,132,0.1)', unlocked: completed >= 50 },
            ].map(a => (
              <div key={a.label} style={{ background: a.color, borderRadius: '10px', padding: '0.75rem', textAlign: 'center', opacity: a.unlocked ? 1 : 0.4, filter: a.unlocked ? 'none' : 'grayscale(0.8)' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{a.icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{a.label}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{a.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(108,99,255,0.08)', borderRadius: '10px', padding: '0.875rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Level {Math.floor((xp || 0) / 500) + 1} — {(xp || 0) % 500}/500 XP
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((xp || 0) % 500) / 5}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Course progress */}
        <div className="card">
          <div className="section-title">
            Course Progress
            <button className="btn btn-sm btn-secondary" onClick={() => setPage('courses')}>View All</button>
          </div>
          {courses.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.85rem' }}>
              No courses enrolled yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {courses.map(c => (
                <div key={c.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{c.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.progress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${c.progress || 0}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}aa)` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming tasks + weak subject */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="section-title">
              Today's Tasks
              <button className="btn btn-sm btn-secondary" onClick={() => setPage('planner')}>View Planner</button>
            </div>
            {upcomingTasks.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0', fontSize: '0.85rem' }}>
                🎉 No pending tasks!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {upcomingTasks.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.priority === 'High' ? 'var(--danger)' : t.priority === 'Medium' ? 'var(--warning)' : 'var(--success)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.83rem', flex: 1 }}>{t.title}</span>
                    <span className={`badge ${t.priority === 'High' ? 'badge-pink' : t.priority === 'Medium' ? 'badge-amber' : 'badge-teal'}`}>{t.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {weakCourse && (weakCourse.progress || 0) < 100 && (
            <div className="card" style={{ background: 'rgba(255,101,132,0.06)', borderColor: 'rgba(255,101,132,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span>⚠️</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent2)' }}>Weak Subject Detected</span>
              </div>
              <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{weakCourse.name}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Only {weakCourse.progress || 0}% complete — schedule more sessions
              </p>
              <button className="btn btn-sm btn-secondary" style={{ marginTop: '0.75rem' }} onClick={() => setPage('analytics')}>
                See Analytics →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}