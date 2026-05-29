import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { analyticsAPI } from '../context/api';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const TIP_STYLE = {
  background: '#1a1a26',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#f0eeff',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Analytics() {
  const { user, tasks, xp, streak } = useApp();
  const [activeMetric, setActiveMetric] = useState('hours');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    analyticsAPI.get(user.id)
      .then(data => setAnalyticsData(data))
      .catch(() => setAnalyticsData(null))
      .finally(() => setLoading(false));
  }, [user]);

  // Weekly data from backend ya empty zeros
  const weeklyData = analyticsData?.weekly_hours?.length
    ? analyticsData.weekly_hours.map(d => ({
        day: d.day,
        hours: d.hours || 0,
        score: 0,
        tasks: 0,
      }))
    : DAY_NAMES.map(day => ({ day, hours: 0, score: 0, tasks: 0 }));

  const totalStudyHours = analyticsData?.total_hours_week ?? 0;
  const avgQuizScore = analyticsData?.avg_quiz_score ?? 0;
  const completedTasks = analyticsData?.completed_tasks ?? 0;
  const pendingTasks = analyticsData?.pending_tasks ?? 0;
  const courseProgress = analyticsData?.course_progress ?? {};

  // Best day calculation
  const bestDay = weeklyData.reduce((a, b) => a.hours > b.hours ? a : b, weeklyData[0]);

  // Monthly trend — real data nahi hai toh completed tasks se banate hain
  const monthlyTrend = [
    { month: 'Jan', score: 0 },
    { month: 'Feb', score: 0 },
    { month: 'Mar', score: 0 },
    { month: 'Apr', score: 0 },
    { month: 'May', score: Math.round(avgQuizScore) },
  ];

  // Weak subjects from course progress
  const subjectData = Object.entries(courseProgress).map(([name, score]) => ({
    name,
    score,
    recommendation: score < 50
      ? `Spend more time on ${name} — below passing level`
      : score < 70
      ? `Review key topics in ${name} to improve`
      : `Great progress in ${name}! Keep it up`,
  }));

  const metrics = [
    { key: 'hours', label: 'Study Hours', color: '#43e8c6' },
  ];

  if (loading) {
    return (
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading analytics…</div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Your learning performance and activity insights</p>
      </div>

      {/* KPI row */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          {
            label: 'Avg Quiz Score',
            val: avgQuizScore > 0 ? `${avgQuizScore}%` : '—',
            color: '#a89dff',
            sub: avgQuizScore > 0 ? 'Based on your quizzes' : 'No quizzes yet',
            icon: '📝',
          },
          {
            label: 'Study Hours',
            val: totalStudyHours > 0 ? `${totalStudyHours}h` : '—',
            color: 'var(--success)',
            sub: totalStudyHours > 0 ? 'This week' : 'No sessions yet',
            icon: '⏱',
          },
          {
            label: 'Tasks Done',
            val: completedTasks > 0 ? completedTasks : '—',
            color: 'var(--warning)',
            sub: pendingTasks > 0 ? `${pendingTasks} pending` : 'No tasks yet',
            icon: '✅',
          },
          {
            label: 'Current Streak',
            val: streak > 0 ? `${streak}d` : '—',
            color: 'var(--accent2)',
            sub: streak > 0 ? 'Keep it up!' : 'Start your streak!',
            icon: '🔥',
          },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-label">{k.icon} {k.label}</div>
            <div className="stat-value" style={{ color: k.color, fontSize: '1.8rem' }}>{k.val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Weekly Study Hours Chart */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">Weekly Study Hours</div>
        {totalStudyHours === 0 ? (
          <div className="empty-state" style={{ height: 180 }}>
            <div className="icon">📊</div>
            <p>No study sessions recorded yet this week.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-hours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#43e8c6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#43e8c6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'rgba(240,238,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(240,238,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TIP_STYLE} />
              <Area type="monotone" dataKey="hours" stroke="#43e8c6" strokeWidth={2.5}
                fill="url(#grad-hours)" dot={{ r: 3, fill: '#43e8c6' }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Quiz Score Trend */}
        <div className="card">
          <div className="section-title">Quiz Score Trend</div>
          {avgQuizScore === 0 ? (
            <div className="empty-state" style={{ height: 140 }}>
              <div className="icon">✏️</div>
              <p>No quiz attempts yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: 'rgba(240,238,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(240,238,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={TIP_STYLE} />
                <Line type="monotone" dataKey="score" stroke="#ff6584" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#ff6584' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Task Summary */}
        <div className="card">
          <div className="section-title">Task Summary</div>
          {completedTasks === 0 && pendingTasks === 0 ? (
            <div className="empty-state" style={{ height: 140 }}>
              <div className="icon">📋</div>
              <p>No tasks assigned yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>✅ Completed</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>{completedTasks}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${completedTasks + pendingTasks > 0 ? Math.round((completedTasks / (completedTasks + pendingTasks)) * 100) : 0}%`,
                    background: 'var(--success)'
                  }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>⏳ Pending</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--warning)' }}>{pendingTasks}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${completedTasks + pendingTasks > 0 ? Math.round((pendingTasks / (completedTasks + pendingTasks)) * 100) : 0}%`,
                    background: 'var(--warning)'
                  }} />
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a89dff', fontFamily: 'var(--font-display)' }}>
                  {completedTasks + pendingTasks > 0 ? Math.round((completedTasks / (completedTasks + pendingTasks)) * 100) : 0}%
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>completion rate</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Progress / Weak Subject Detection */}
      <div className="card">
        <div className="section-title">
          <span>📚 Course Progress & Recommendations</span>
        </div>
        {subjectData.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📖</div>
            <p>No course progress data yet. Start studying to see insights here!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '0.75rem' }}>
            {subjectData.map(sub => (
              <div key={sub.name} style={{
                padding: '1rem', borderRadius: '12px',
                background: sub.score < 50 ? 'rgba(255,101,132,0.07)' : sub.score < 70 ? 'rgba(255,179,71,0.07)' : 'rgba(108,99,255,0.07)',
                border: `1px solid ${sub.score < 50 ? 'rgba(255,101,132,0.2)' : sub.score < 70 ? 'rgba(255,179,71,0.2)' : 'rgba(108,99,255,0.2)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sub.name}</span>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    color: sub.score < 50 ? 'var(--danger)' : sub.score < 70 ? 'var(--warning)' : '#a89dff'
                  }}>{sub.score}%</span>
                </div>
                <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                  <div className="progress-fill" style={{
                    width: `${sub.score}%`,
                    background: sub.score < 50
                      ? 'linear-gradient(90deg, #ff6584, #ff6584aa)'
                      : sub.score < 70
                      ? 'linear-gradient(90deg, #ffb347, #ffb347aa)'
                      : 'linear-gradient(90deg, #6c63ff, #a89dff)'
                  }} />
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  💡 {sub.recommendation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}