import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell, PieChart, Pie, Legend
} from 'recharts';

const MONTHLY = [
  { month: 'Jan', completed: 12, target: 20 }, { month: 'Feb', completed: 18, target: 20 },
  { month: 'Mar', completed: 15, target: 20 }, { month: 'Apr', completed: 22, target: 20 },
  { month: 'May', completed: 9, target: 20 },
];

const RADAR_DATA = [
  { subject: 'Math', score: 72 }, { subject: 'Physics', score: 45 },
  { subject: 'Chemistry', score: 60 }, { subject: 'History', score: 88 }, { subject: 'English', score: 55 },
];

const PIE_COLORS = ['#6c63ff', '#43e8c6', '#ff6584', '#ffb347', '#a89dff'];

const TOOLTIP_STYLE = { background: '#1a1a26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0eeff' };

export default function Progress() {
  const { courses, tasks } = useApp();
  const [period, setPeriod] = useState('weekly');

  const completedTasks = tasks.filter(t => t.completed);
  const pendingTasks = tasks.filter(t => !t.completed);
  const completionRate = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const courseDistribution = courses.map((c, i) => ({ name: c.name, value: c.completedTasks, color: PIE_COLORS[i % PIE_COLORS.length] }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>Progress Tracking</h2>
        <p>Monitor your learning milestones and completion rates</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Completion Rate', val: `${completionRate}%`, color: '#6c63ff', icon: '🎯' },
          { label: 'Tasks Done', val: completedTasks.length, color: 'var(--success)', icon: '✅' },
          { label: 'Tasks Pending', val: pendingTasks.length, color: 'var(--warning)', icon: '⏳' },
          { label: 'Courses Active', val: courses.length, color: 'var(--accent2)', icon: '📚' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.icon} {s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: '1.8rem' }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Monthly tasks bar chart */}
        <div className="card">
          <div className="section-title">
            Monthly Task Completion
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['weekly', 'monthly'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} className="btn btn-sm" style={{
                  background: period === p ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: period === p ? 'white' : 'var(--text-muted)',
                  border: '1px solid var(--border)', textTransform: 'capitalize'
                }}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: 'rgba(240,238,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(240,238,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="target" fill="rgba(255,255,255,0.05)" radius={[4,4,0,0]} name="Target" />
              <Bar dataKey="completed" fill="#6c63ff" radius={[4,4,0,0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="card">
          <div className="section-title">Subject Performance Radar</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(240,238,255,0.5)', fontSize: 11 }} />
              <Radar dataKey="score" stroke="#43e8c6" fill="#43e8c6" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: '#43e8c6' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem' }}>
        {/* Pie chart */}
        <div className="card">
          <div className="section-title">Completed by Course</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={courseDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {courseDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend formatter={(v) => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Per-course progress table */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Course-by-Course Breakdown</div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Completed</th>
                <th>Total</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, display: 'inline-block' }} />{c.name}</span></td>
                  <td><span className="badge badge-gray">{c.category}</span></td>
                  <td style={{ color: 'var(--success)' }}>{c.completedTasks}</td>
                  <td>{c.totalTasks}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="progress-bar" style={{ width: 80, flex: 'unset' }}>
                        <div className="progress-fill" style={{ width: `${c.progress}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}aa)` }} />
                      </div>
                      <span style={{ fontSize: '0.78rem' }}>{c.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.progress >= 80 ? 'badge-teal' : c.progress >= 50 ? 'badge-amber' : 'badge-pink'}`}>
                      {c.progress >= 80 ? '🔥 Excellent' : c.progress >= 50 ? '📈 On Track' : '⚠️ Needs Work'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
