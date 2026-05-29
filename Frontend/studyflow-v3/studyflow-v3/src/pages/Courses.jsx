import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const COLORS = ['#6c63ff','#ff6584','#43e8c6','#ffb347','#a89dff','#f78c6c','#82aaff','#c3e88d'];
const CATEGORIES = ['BME', 'BCE', 'Engineering drawing', 'Engineering Chemistry', 'Engineering Physics'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function Courses() {
  const { courses, addCourse, deleteCourse } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', category: 'Science', difficulty: 'Medium', color: COLORS[0], description: '' });
  const [saving, setSaving] = useState(false);

  const allCategories = ['All', ...new Set(courses.map(c => c.category).filter(Boolean))];
  const filtered = courses.filter(c =>
    (filter === 'All' || c.category === filter) &&
    (c.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await addCourse(form);
      setShowModal(false);
      setForm({ name: '', category: 'Science', difficulty: 'Medium', color: COLORS[0], description: '' });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await deleteCourse(id);
    }
  };

 const handleView = (course) => {
  const url = course.file_url;
  if (!url) return;
  const fullUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`;
  window.open(fullUrl, '_blank');
};

  const handleDownload = async (course) => {
    const url = course.file_url;
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(fullUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = course.file_name || course.name || 'course-material';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>My Courses</h2>
        <p>Manage and track all your enrolled subjects</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" style={{ maxWidth: 240, marginBottom: 0 }} placeholder="🔍  Search courses…" value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className="btn btn-sm" style={{
              background: filter === cat ? 'var(--accent)' : 'var(--bg-elevated)',
              color: filter === cat ? 'white' : 'var(--text-muted)',
              border: '1px solid var(--border)'
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📚</div>
          <p>No courses found.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(course => {
            const progress = course.progress || 0;
            const completedTasks = course.completed_tasks ?? course.completedTasks ?? 0;
            const totalTasks = course.total_tasks ?? course.totalTasks ?? 0;
            const hasFile = !!course.file_url;

            return (
              <div key={course.id} className="card" style={{ borderTop: `3px solid ${course.color}`, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${course.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                    📖
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(course.id)} style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>✕</button>
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem' }}>{course.name}</h3>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                  <span className="badge badge-gray">{course.category}</span>
                  <span className={`badge ${course.difficulty === 'Hard' ? 'badge-pink' : course.difficulty === 'Medium' ? 'badge-amber' : 'badge-teal'}`}>{course.difficulty}</span>
                </div>

                

                {/* File name agar hai */}
                {hasFile && (
                  <div style={{ marginBottom: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    📎 {course.file_name || 'Course Material'}
                  </div>
                )}

                {/* View & Download buttons */}
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleDownload(course)}
                    disabled={!hasFile}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0',
                      borderRadius: '8px',
                      border: 'none',
                      background: hasFile ? 'linear-gradient(135deg, #1d4ed8, #1e40af)' : 'var(--bg-elevated)',
                      color: hasFile ? '#fff' : 'var(--text-dim)',
                      cursor: hasFile ? 'pointer' : 'not-allowed',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      opacity: hasFile ? 1 : 0.4,
                      boxShadow: hasFile ? '0 2px 8px rgba(29,78,216,0.3)' : 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if(hasFile) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    ⬇ Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Course Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Course</h3>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Course Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Advanced Mathematics" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select className="form-select" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })} style={{
                    width: 28, height: 28, borderRadius: '50%', background: c,
                    border: form.color === c ? '3px solid white' : '3px solid transparent',
                    cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2
                  }} />
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What will you learn?" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()}>
                {saving ? 'Saving...' : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}