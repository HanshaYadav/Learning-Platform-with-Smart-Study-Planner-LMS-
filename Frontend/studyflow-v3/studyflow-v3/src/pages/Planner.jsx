import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const PRIORITIES = ['High', 'Medium', 'Low'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const priorityColor = { High: 'var(--danger)', Medium: 'var(--warning)', Low: 'var(--success)' };
const priorityBadge = { High: 'badge-pink', Medium: 'badge-amber', Low: 'badge-teal' };

/* ── Task Add / Edit Modal ─────────────────────────────── */
function TaskModal({ onClose, onSave, courses, editTask }) {
  const [form, setForm] = useState(editTask || {
    title: '', course: courses[0]?.name || 'Mathematics',
    priority: 'Medium', deadline: '', duration: 60,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3>{editTask ? 'Edit Task' : '+ Create Study Task'}</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Task Title *</label>
          <input className="form-input" value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Solve Chapter 5 Problems" autoFocus />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Course</label>
            <select className="form-select" value={form.course} onChange={e => set('course', e.target.value)}>
              {courses.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input className="form-input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Duration (mins)</label>
            <input className="form-input" type="number" value={form.duration}
              onChange={e => set('duration', +e.target.value)} min={15} step={15} />
          </div>
        </div>

        {/* Priority preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.6rem 0.875rem', background: 'var(--bg-elevated)', borderRadius: 10, fontSize: '0.82rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor[form.priority] }} />
          <span style={{ color: 'var(--text-muted)' }}>Priority:</span>
          <span style={{ color: priorityColor[form.priority], fontWeight: 600 }}>{form.priority}</span>
          {form.deadline && <><span style={{ color: 'var(--text-dim)', marginLeft: '0.75rem' }}>📅</span><span style={{ color: 'var(--text-muted)' }}>{form.deadline}</span></>}
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>⏱ {form.duration}m</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} style={{ flex: 2, justifyContent: 'center' }}>
            {editTask ? '💾 Save Changes' : '✅ Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Smart scheduler ───────────────────────────────────── */
function generateSchedule(tasks) {
  const slots = [];
  const pending = tasks.filter(t => !t.completed);
  const hours = [8, 9, 10, 11, 14, 15, 16, 17, 19, 20];
  pending.slice(0, 7).forEach((task, i) => {
    const day = DAYS[i % 7];
    const hour = hours[i % hours.length];
    slots.push({ ...task, day, time: `${hour}:00 – ${hour + Math.ceil(task.duration / 60)}:00` });
  });
  return slots;
}

/* ── Main Planner ──────────────────────────────────────── */
export default function Planner() {
  const { tasks, courses, addTask, toggleTask, deleteTask, user } = useApp();
  const [showModal, setShowModal]   = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTask, setEditTask]     = useState(null);
  const [view, setView]             = useState('list');
  const [filterCourse, setFilterCourse]     = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus]     = useState('All');

  const schedule    = generateSchedule(tasks);
  const courseNames = ['All', ...courses.map(c => c.name)];
  const filtered = tasks.filter(t =>
    (filterCourse   === 'All' || (t.course_name || t.course) === filterCourse) &&
    (filterPriority === 'All' || t.priority === filterPriority) &&
    (filterStatus   === 'All' || (filterStatus === 'Done' ? t.completed : !t.completed))
  );

  const handleSave = async (form) => {
    if (editTask) {
      await deleteTask(editTask.id);
    }
    await addTask(user?.id, {
      title: form.title,
      course_name: form.course,
      priority: form.priority,
      deadline: form.deadline || null,
      duration: Number(form.duration),
    });
    setEditTask(null);
  };

  const openEdit = (task) => { setEditTask(task); setShowModal(true); };
  const openAdd  = () => { setEditTask(null); setShowModal(true); };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>Study Planner</h2>
        <p>Manage your tasks and view your smart daily schedule</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* View toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '3px' }}>
          {[['list', '📋 Task List'], ['schedule', '📅 Schedule']].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: view === v ? 'var(--bg-card)' : 'transparent',
              color: view === v ? 'var(--text)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500,
            }}>{l}</button>
          ))}
        </div>

        {view === 'list' && <>
          <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            {courseNames.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto', minWidth: 130 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            {['All', 'High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto', minWidth: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {['All', 'Pending', 'Done'].map(s => <option key={s}>{s}</option>)}
          </select>
        </>}
      </div>

      {view === 'list' ? (
        <>
          {/* Summary cards */}
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Tasks', val: tasks.length,                          color: '#a89dff'        },
              { label: 'Completed',   val: tasks.filter(t => t.completed).length,  color: 'var(--success)' },
              { label: 'Pending',     val: tasks.filter(t => !t.completed).length, color: 'var(--warning)' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: '1rem' }}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: '1.8rem', color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Task list */}
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
              <p style={{ color: 'var(--text-muted)' }}>No tasks found. Tasks assigned by admin will appear here.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              {filtered.map((task, i) => (
                <div key={task.id}
                  onClick={() => setSelectedTask(task)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    opacity: task.completed ? 0.5 : 1, transition: 'opacity .2s', cursor: 'pointer',
                  }}>
                  <input type="checkbox" className="checkbox" checked={task.completed}
                    onChange={e => { e.stopPropagation(); toggleTask(task.id); }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500, textDecoration: task.completed ? 'line-through' : 'none', marginBottom: '0.2rem' }}>
                      {task.title}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.course_name || task.course}</span>
                      {task.deadline && <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>📅 {task.deadline}</span>}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>⏱ {task.duration}m</span>
                    </div>
                  </div>
                  <span className={`badge ${priorityBadge[task.priority]}`}>{task.priority}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Smart Schedule View */
        <div>
          <div className="card" style={{ marginBottom: '1rem', background: 'rgba(108,99,255,0.06)', borderColor: 'rgba(108,99,255,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Smart Auto-Scheduler</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generated from your task priorities and deadlines</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '0.5rem' }}>
            {DAYS.map(day => {
              const daySlots = schedule.filter(s => s.day === day);
              return (
                <div key={day}>
                  <div style={{ textAlign: 'center', padding: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{day}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {daySlots.length === 0
                      ? <div style={{ height: 80, borderRadius: '10px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Free</span>
                        </div>
                      : daySlots.map(slot => (
                          <div key={slot.id} style={{ padding: '0.6rem 0.7rem', borderRadius: '10px',
                            background: slot.priority === 'High' ? 'rgba(255,101,132,0.12)' : slot.priority === 'Medium' ? 'rgba(255,179,71,0.1)' : 'rgba(67,232,198,0.1)',
                            borderLeft: `3px solid ${priorityColor[slot.priority]}` }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.2rem', lineHeight: 1.3 }}>{slot.title}</p>
                            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{slot.time}</p>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{slot.course}</p>
                          </div>
                        ))
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>📋 {selectedTask.title}</h3>
              <button className="btn btn-ghost" onClick={() => setSelectedTask(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>📚 <strong>Course:</strong> {selectedTask.course_name || selectedTask.course}</div>
              <div>🎯 <strong>Priority:</strong> {selectedTask.priority}</div>
              <div>⏱ <strong>Duration:</strong> {selectedTask.duration} min</div>
              <div>📅 <strong>Deadline:</strong> {selectedTask.deadline || 'N/A'}</div>
              <div>👤 <strong>Assigned by:</strong> {selectedTask.assigned_by || 'Admin'}</div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <TaskModal
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSave}
          courses={courses}
          editTask={editTask}
        />
      )}
    </div>
  );
}