import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const FILE_ICONS = { PDF: '📄', DOCX: '📝', DOC: '📝', PPT: '📊', PPTX: '📊', TXT: '📃', Image: '🖼' };
const FILE_COLORS = { PDF: 'rgba(255,101,132,0.12)', DOCX: 'rgba(108,99,255,0.12)', DOC: 'rgba(108,99,255,0.12)', PPT: 'rgba(255,179,71,0.1)', PPTX: 'rgba(255,179,71,0.1)', TXT: 'rgba(67,232,198,0.1)', Image: 'rgba(255,179,71,0.1)' };
const BASE_URL = 'http://localhost:8000';

export default function Notes() {
  const { notes, deleteNote } = useApp();
  const [filterCourse, setFilterCourse] = useState('All');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [viewingNote, setViewingNote] = useState(null);

  const courseNames = ['All', ...new Set(notes.map(n => n.course_name || n.course || '').filter(Boolean))];

  const filtered = notes.filter(n => {
    const course = n.course_name || n.course || '';
    return (filterCourse === 'All' || course === filterCourse) &&
      (n.title || '').toLowerCase().includes(search.toLowerCase());
  });

  const shared = notes.filter(n => n.shared).length;

  const getFileUrl = (note) => {
    if (!note.file_url) return null;
    const filename = note.file_url.split('/').pop();
    return `${BASE_URL}/api/notes/view/${filename}`;
  };

  const handleDownload = async (note) => {
    const url = getFileUrl(note);
    if (!url) { alert('File not available.'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = note.title || 'note';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      alert('Download failed.');
    }
  };
const handleView = async (note) => {
  const url = getFileUrl(note);
  if (!url) { alert('File not available to view.'); return; }
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    setViewingNote({ ...note, url: blobUrl });
  } catch (e) {
    alert('Could not load file.');
  }
};

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>Notes & Study Materials</h2>
        <p>View and download your study notes</p>
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Notes', val: notes.length, color: '#a89dff', icon: '📝' },
          { label: 'Shared Notes', val: shared, color: 'var(--success)', icon: '🔗' },
          { label: 'Subjects', val: new Set(notes.map(n => n.course_name || n.course)).size, color: 'var(--warning)', icon: '📚' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '1rem' }}>
            <div className="stat-label">{s.icon} {s.label}</div>
            <div className="stat-value" style={{ fontSize: '1.6rem', color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" style={{ maxWidth: 220 }} placeholder="🔍  Search notes…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ width: 'auto', minWidth: 160 }} value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          {courseNames.map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '3px' }}>
          {['grid', 'list'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '0.4rem 0.75rem', borderRadius: '7px', border: 'none', cursor: 'pointer',
              background: view === v ? 'var(--bg-card)' : 'transparent',
              color: view === v ? 'var(--text)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontSize: '0.8rem'
            }}>{v === 'grid' ? '⊞' : '≡'}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="icon">📁</div><p>No notes found.</p></div>
      ) : view === 'grid' ? (
        <div className="grid-3">
          {filtered.map(note => {
            const type = note.file_type || note.type || 'PDF';
            const course = note.course_name || note.course || '';
            const hasFile = !!note.file_url;
            return (
              <div key={note.id} className="card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '12px', background: FILE_COLORS[type] || FILE_COLORS.PDF, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    {FILE_ICONS[type] || '📄'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {note.shared ? <span className="badge badge-teal">🔗 Shared</span> : null}
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteNote(note.id)} style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>✕</button>
                  </div>
                </div>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', lineHeight: 1.4 }}>{note.title}</h4>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-gray">{course}</span>
                  <span className="badge badge-purple">{type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>{note.file_size || note.size || ''}</span>
                  <span style={{ fontSize: '0.73rem', color: hasFile ? 'var(--success)' : 'var(--danger)' }}>
                    {hasFile ? '✅ File ready' : '⚠️ No file'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center', opacity: hasFile ? 1 : 0.5 }} onClick={() => handleDownload(note)}>⬇ Download</button>
                  
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Subject</th><th>Type</th><th>Size</th><th>Shared</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(note => {
                const type = note.file_type || note.type || 'PDF';
                const course = note.course_name || note.course || '';
                return (
                  <tr key={note.id}>
                    <td style={{ fontWeight: 500 }}>{FILE_ICONS[type] || '📄'} {note.title}</td>
                    <td><span className="badge badge-gray">{course}</span></td>
                    <td><span className="badge badge-purple">{type}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{note.file_size || note.size || ''}</td>
                    <td>{note.shared ? <span className="badge badge-teal">Yes</span> : <span className="badge badge-gray">No</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDownload(note)}>⬇</button>
                      
                        <button className="btn btn-ghost btn-sm" onClick={() => deleteNote(note.id)} style={{ color: 'var(--danger)' }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewingNote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>📄 {viewingNote.title}</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => handleDownload(viewingNote)} style={{ padding: '0.4rem 1rem', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.83rem' }}>⬇ Download</button>
              <button onClick={() => setViewingNote(null)} style={{ padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.83rem' }}>✕ Close</button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <iframe
              src={viewingNote.url}
              style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
              title={viewingNote.title}
            />
          </div>
        </div>
      )}
    </div>
  );
}