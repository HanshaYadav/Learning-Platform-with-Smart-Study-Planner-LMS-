import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { usersAPI } from '../context/api';
import { quizQuestionsAPI } from '../context/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

const COURSE_LIST = ['Mathematics', 'Physics', 'Chemistry', 'History', 'English'];
const TIP = { background: '#1a1a26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0eeff', fontSize: 12 };
const USAGE_DATA = [
  { day:'Mon', logins:12, tasks:34 },{ day:'Tue', logins:19, tasks:47 },
  { day:'Wed', logins:15, tasks:28 },{ day:'Thu', logins:22, tasks:56 },
  { day:'Fri', logins:17, tasks:41 },{ day:'Sat', logins:8, tasks:19 },
  { day:'Sun', logins:5, tasks:11 },
];
const PERF_TREND = [
  { month:'Jan', avg:68 },{ month:'Feb', avg:72 },{ month:'Mar', avg:65 },
  { month:'Apr', avg:78 },{ month:'May', avg:82 },{ month:'Jun', avg:75 },
];
const COMPLETION_DATA = [
  { name:'Completed', value:63, color:'#43e8c6' },
  { name:'In Progress', value:27, color:'#6c63ff' },
  { name:'Not Started', value:10, color:'#ff6584' },
];

/* ── FIX 1: Modal renders via Portal at document.body — always truly centered ── */
function Modal({ title, onClose, children }) {
  const content = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',        /* vertically centered */
        justifyContent: 'center',
        zIndex: 99999,               /* above everything */
        padding: '1.5rem',
        overflowY: 'auto',
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-hover)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:700 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'1.3rem', lineHeight:1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
  return createPortal(content, document.body);
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:'flex', gap:'0.25rem', background:'var(--bg-elevated)', borderRadius:'14px', padding:'4px', marginBottom:'1.5rem', flexWrap:'wrap' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding:'0.5rem 1.1rem', borderRadius:'10px', border:'none', cursor:'pointer',
          fontSize:'0.82rem', fontWeight:500, fontFamily:'var(--font-body)',
          background: active===t.id ? 'linear-gradient(135deg,var(--accent),#8b82ff)' : 'transparent',
          color: active===t.id ? '#fff' : 'var(--text-muted)', transition:'all .2s',
        }}>{t.icon} {t.label}</button>
      ))}
    </div>
  );
}

function StatCard({ label, val, color, icon, sub }) {
  return (
    <div className="stat-card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
          <div style={{ fontSize:'1.9rem', fontWeight:800, color, fontFamily:'var(--font-display)', lineHeight:1 }}>{val}</div>
          {sub && <div style={{ fontSize:'0.7rem', color:'var(--text-dim)', marginTop:'0.4rem' }}>{sub}</div>}
        </div>
        <div style={{ fontSize:'1.4rem', opacity:0.3 }}>{icon}</div>
      </div>
    </div>
  );
}

function ActionRow({ onEdit, onDelete }) {
  return (
    <div style={{ display:'flex', gap:'0.35rem' }}>
      <button className="btn btn-ghost btn-sm" onClick={onEdit} style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>✏️ Edit</button>
      <button className="btn btn-ghost btn-sm" onClick={onDelete} style={{ display:'flex', alignItems:'center', gap:'0.3rem', color:'var(--danger)' }}>🗑️ Delete</button>
    </div>
  );
}

/* ── OVERVIEW ── */
function Overview({ allUsers, courses, notes, studentQuizzes, globalQuizzes, globalTasks }) {
  const students = allUsers.filter(u => u.role==='student');
  const totalStudentQuizzes = Object.values(studentQuizzes).flat().length;
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        <StatCard label="Total Users" val={allUsers.length} color="#a89dff" icon="👥" sub={`${students.length} students`}/>
        <StatCard label="Students" val={students.length} color="var(--success)" icon="🎓"/>
        <StatCard label="Courses" val={courses.length} color="var(--warning)" icon="📚"/>
        <StatCard label="Quiz Attempts" val={totalStudentQuizzes} color="#ff9f7f" icon="✏️"/>
        <StatCard label="Notes" val={notes.length} color="var(--accent2)" icon="📄"/>
        <StatCard label="Global Tasks" val={globalTasks.length} color="var(--accent3)" icon="📋"/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
        <div className="card">
          <div className="section-title">Platform Activity (7 Days)</div>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={USAGE_DATA} margin={{ top:4, right:8, left:-22, bottom:0 }}>
              <XAxis dataKey="day" tick={{ fill:'rgba(240,238,255,.4)', fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'rgba(240,238,255,.4)', fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={TIP}/>
              <Bar dataKey="logins" fill="#6c63ff" radius={[4,4,0,0]} name="Logins"/>
              <Bar dataKey="tasks" fill="#43e8c6" radius={[4,4,0,0]} name="Tasks Done"/>
              <Legend wrapperStyle={{ fontSize:11, color:'rgba(240,238,255,.5)' }}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="section-title">Avg Performance Trend</div>
          <ResponsiveContainer width="100%" height={185}>
            <AreaChart data={PERF_TREND} margin={{ top:4, right:8, left:-22, bottom:0 }}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill:'rgba(240,238,255,.4)', fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'rgba(240,238,255,.4)', fontSize:11 }} axisLine={false} tickLine={false} domain={[50,100]}/>
              <Tooltip contentStyle={TIP}/>
              <Area type="monotone" dataKey="avg" stroke="#6c63ff" strokeWidth={2.5} fill="url(#pg)" name="Avg Score %"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        <div className="card">
          <div className="section-title">Course Completion</div>
          <div style={{ display:'flex', alignItems:'center', gap:'2rem' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={COMPLETION_DATA} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" strokeWidth={0}>
                  {COMPLETION_DATA.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip contentStyle={TIP}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {COMPLETION_DATA.map(d => (
                <div key={d.name} style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.8rem' }}>
                  <div style={{ width:9, height:9, borderRadius:'50%', background:d.color }}/>
                  <span style={{ color:'var(--text-muted)' }}>{d.name}</span>
                  <span style={{ fontWeight:700, marginLeft:'auto' }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="section-title">Recent Registrations</div>
          {allUsers.slice().reverse().slice(0,4).map(u => (
            <div key={u.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.4rem 0', borderBottom:'1px solid var(--border)' }}>
              <div className="avatar" style={{ width:28, height:28, fontSize:'0.65rem' }}>{u.name.slice(0,2).toUpperCase()}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.82rem', fontWeight:500 }}>{u.name}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{u.email}</div>
              </div>
              <span className={`badge ${u.role==='admin'?'badge-purple':'badge-teal'}`}>{u.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── STUDENTS ── */
function StudentsTab({ allUsers, studentQuizzes, studentNotes, studentTasks, studentProgress,
  loadStudentDataForAdmin,
  adminAddStudentQuiz, adminUpdateStudentQuiz, adminDeleteStudentQuiz,
  adminAddStudentNote, adminUpdateStudentNote, adminDeleteStudentNote,
  adminAddStudentTask, adminUpdateStudentTask, adminDeleteStudentTask,
}) {
  const students = allUsers.filter(u => u.role==='student');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [subTab, setSubTab] = useState('tasks');
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({});

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const sq = selected ? (studentQuizzes[selected.id]||[]) : [];
  const sn = selected ? (studentNotes[selected.id]||[]) : [];
  const st = selected ? (studentTasks[selected.id]||[]) : [];
  const sp = selected ? (studentProgress[selected.id]||{}) : {};
  const avgScore = sq.length ? Math.round(sq.reduce((a,b)=>a+b.score,0)/sq.length) : 0;
  const avgProg = Object.values(sp).length ? Math.round(Object.values(sp).reduce((a,b)=>a+b,0)/Object.values(sp).length) : 0;
  const radarData = COURSE_LIST.map(c => ({ subject:c.slice(0,4), score:sp[c]||0 }));

  const openModal = (type, target=null) => {
    setEditTarget(target);
    if (type==='task-add') setForm({ title:'', course:'Mathematics', priority:'Medium', deadline:'', duration:60, notes:'' });
    if (type==='task-edit') setForm({ title:target.title, course:target.course_name||target.course, priority:target.priority, deadline:target.deadline||'', duration:target.duration, notes:target.notes||'' });
    if (type==='quiz-add') setForm({ title:'', course:'Mathematics', score:'', totalMarks:100 });
    if (type==='quiz-edit') setForm({ title:target.title, course:target.course_name||target.course, score:target.score, totalMarks:target.total_marks||target.totalMarks });
    if (type==='note-add') setForm({ title:'', course:'Mathematics', type:'PDF', size:'1.0 MB' });
    if (type==='note-edit') setForm({ title:target.title, course:target.course_name||target.course, type:target.file_type||target.type, size:target.file_size||target.size });
    setModal(type);
  };

  const saveModal = () => {
    const uid = selected.id;
    if (modal==='task-add') adminAddStudentTask(uid, { title:form.title, course_name:form.course, priority:form.priority, deadline:form.deadline||null, duration:Number(form.duration), notes:form.notes||'' });
    if (modal==='task-edit') adminUpdateStudentTask(uid, editTarget.id, { title:form.title, course_name:form.course, priority:form.priority, deadline:form.deadline||null, duration:Number(form.duration), notes:form.notes||'' });
    if (modal==='quiz-add') adminAddStudentQuiz(uid, { title:form.title, course_name:form.course, score:Number(form.score), total_marks:Number(form.totalMarks), status:'Completed' });
    if (modal==='quiz-edit') adminUpdateStudentQuiz(uid, editTarget.id, { title:form.title, course_name:form.course, score:Number(form.score), total_marks:Number(form.totalMarks) });
    if (modal==='note-add') adminAddStudentNote(uid, { title:form.title, course_name:form.course, file_type:form.type, file_size:form.size });
    if (modal==='note-edit') adminUpdateStudentNote(uid, editTarget.id, { title:form.title, course_name:form.course, file_type:form.type, file_size:form.size });
    setModal(null);
  };

  if (!selected) return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <div style={{ position:'relative', maxWidth:380 }}>
          <span style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }}>🔍</span>
          <input className="form-input" style={{ paddingLeft:'2.4rem', width:'100%' }} placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
      </div>
      {filtered.length===0
        ? <div className="empty-state"><div className="icon">👤</div><p>No students found.</p></div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1rem' }}>
            {filtered.map(s => {
              const qs = studentQuizzes[s.id]||[];
              const ts = studentTasks[s.id]||[];
              const avg = qs.length ? Math.round(qs.reduce((a,b)=>a+b.score,0)/qs.length) : null;
              return (
                <div key={s.id} className="card" style={{ cursor:'pointer' }} onClick={() => { setSelected(s); setSubTab('tasks'); if(loadStudentDataForAdmin) loadStudentDataForAdmin(s.id); }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
                    <div className="avatar">{s.name.slice(0,2).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{s.name}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{s.email}</div>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', textAlign:'center', marginBottom:'0.75rem' }}>
                    <div><div style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--accent)', fontFamily:'var(--font-display)' }}>{avg!=null?`${avg}%`:'—'}</div><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Avg Quiz</div></div>
                    <div><div style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--warning)', fontFamily:'var(--font-display)' }}>{ts.length}</div><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Tasks</div></div>
                    <div><div style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--success)', fontFamily:'var(--font-display)' }}>{qs.filter(q=>q.score>=(q.total_marks||100)*0.5).length}</div><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Passed</div></div>
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'var(--accent)', textAlign:'right' }}>View Report →</div>
                </div>
              );
            })}
          </div>
      }
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        <button className="btn btn-ghost" onClick={() => setSelected(null)}>← Back</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:'0.75rem', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'0.75rem 1.25rem', flexWrap:'wrap' }}>
          <div className="avatar" style={{ width:42, height:42, fontSize:'0.9rem' }}>{selected.name.slice(0,2).toUpperCase()}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:'1rem', fontFamily:'var(--font-display)' }}>{selected.name}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{selected.email}</div>
          </div>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={() => openModal('task-add')}>📋 Assign Task</button>
  
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.75rem', marginBottom:'1.25rem' }}>
        <StatCard label="Avg Quiz" val={`${avgScore}%`} color="var(--success)" icon="🎯"/>
        <StatCard label="Avg Prog" val={`${avgProg}%`} color="var(--accent)" icon="📈"/>
        <StatCard label="Tasks" val={st.length} color="var(--warning)" icon="📋" sub={`${st.filter(t=>t.completed).length} done`}/>
        <StatCard label="Notes" val={sn.length} color="#a89dff" icon="📄"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
        <div className="card">
          <div className="section-title">Subject Strength</div>
          <ResponsiveContainer width="100%" height={155}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)"/>
              <PolarAngleAxis dataKey="subject" tick={{ fill:'rgba(240,238,255,.5)', fontSize:11 }}/>
              <Radar dataKey="score" stroke="#43e8c6" fill="#43e8c6" fillOpacity={0.2}/>
              <Tooltip contentStyle={TIP}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="section-title">Course Progress</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.55rem' }}>
            {COURSE_LIST.map(c => (
              <div key={c}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.2rem' }}>
                  <span style={{ fontSize:'0.8rem' }}>{c}</span>
                  <span style={{ fontSize:'0.78rem', fontWeight:600 }}>{sp[c]||0}%</span>
                </div>
                <div className="progress-bar" style={{ height:5 }}>
                  <div className="progress-fill" style={{ width:`${sp[c]||0}%`, background:(sp[c]||0)>=70?'var(--success)':(sp[c]||0)>=50?'var(--warning)':'var(--danger)'}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:'0.25rem', background:'var(--bg-elevated)', borderRadius:'12px', padding:'3px', marginBottom:'1rem', width:'fit-content' }}>
        {[{id:'tasks',label:`📋 Tasks (${st.length})`}].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ padding:'0.45rem 1rem', borderRadius:'9px', border:'none', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--font-body)', fontWeight:500, background:subTab===t.id?'var(--bg-card)':'transparent', color:subTab===t.id?'var(--text)':'var(--text-muted)' }}>{t.label}</button>
        ))}
      </div>

      {subTab==='tasks' && (
        <div className="card" style={{ padding:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
            <div className="section-title" style={{ margin:0 }}>Assigned Tasks</div>
            <button className="btn btn-primary btn-sm" onClick={() => openModal('task-add')}>+ Assign Task</button>
          </div>
          {st.length===0 ? <div className="empty-state"><div className="icon">📋</div><p>No tasks assigned yet.</p></div>
            : <table className="table"><thead><tr><th>Task</th><th>Course</th><th>Priority</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{st.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight:500, fontSize:'0.85rem' }}>{t.title}</td>
                    <td><span className="badge badge-gray">{t.course_name||t.course}</span></td>
                    <td><span className={`badge ${t.priority==='High'?'badge-pink':t.priority==='Medium'?'badge-amber':'badge-teal'}`}>{t.priority}</span></td>
                    <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{t.deadline||'—'}</td>
                    <td><span className={`badge ${t.completed?'badge-teal':'badge-gray'}`}>{t.completed?'✅ Done':'⏳ Pending'}</span></td>
                    <td><ActionRow onEdit={() => openModal('task-edit', t)} onDelete={() => adminDeleteStudentTask(selected.id, t.id)}/></td>
                  </tr>
                ))}</tbody>
              </table>
          }
        </div>
      )}

      {subTab==='quizzes' && (
        <div className="card" style={{ padding:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
            <div className="section-title" style={{ margin:0 }}>Quiz Records</div>
            <button className="btn btn-primary btn-sm" onClick={() => openModal('quiz-add')}>+ Add Quiz</button>
          </div>
          {sq.length===0 ? <div className="empty-state"><div className="icon">✏️</div><p>No quizzes yet.</p></div>
            : <table className="table"><thead><tr><th>Title</th><th>Course</th><th>Score</th><th>Grade</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>{sq.map(q => {
                  const total = q.total_marks||q.totalMarks||100;
                  const pct = Math.round((q.score/total)*100);
                  const grade = pct>=80?'A':pct>=65?'B':pct>=50?'C':'F';
                  const gc = {A:'var(--success)',B:'var(--accent)',C:'var(--warning)',F:'var(--danger)'};
                  return (
                    <tr key={q.id}>
                      <td style={{ fontWeight:500, fontSize:'0.85rem' }}>{q.title}</td>
                      <td><span className="badge badge-gray">{q.course_name||q.course}</span></td>
                      <td style={{ fontSize:'0.83rem' }}>{q.score}/{total}</td>
                      <td><span style={{ fontWeight:800, color:gc[grade], fontSize:'0.9rem' }}>{grade}</span></td>
                      <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{q.date}</td>
                      <td><ActionRow onEdit={() => openModal('quiz-edit', q)} onDelete={() => adminDeleteStudentQuiz(selected.id, q.id)}/></td>
                    </tr>
                  );
                })}</tbody>
              </table>
          }
        </div>
      )}

      {subTab==='notes' && (
        <div className="card" style={{ padding:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
            <div className="section-title" style={{ margin:0 }}>Assigned Notes</div>
            <button className="btn btn-secondary btn-sm" onClick={() => openModal('note-add')}>+ Add Note</button>
          </div>
          {sn.length===0 ? <div className="empty-state"><div className="icon">📄</div><p>No notes assigned yet.</p></div>
            : <table className="table"><thead><tr><th>Title</th><th>Course</th><th>Type</th><th>Actions</th></tr></thead>
                <tbody>{sn.map(n => (
                  <tr key={n.id}>
                    <td style={{ fontWeight:500, fontSize:'0.85rem' }}>{n.title}</td>
                    <td><span className="badge badge-gray">{n.course_name||n.course}</span></td>
                    <td><span className="badge badge-purple">{n.file_type||n.type}</span></td>
                    <td><ActionRow onEdit={() => openModal('note-edit', n)} onDelete={() => adminDeleteStudentNote(selected.id, n.id)}/></td>
                  </tr>
                ))}</tbody>
              </table>
          }
        </div>
      )}

      {modal && modal.startsWith('task') && (
        <Modal title={modal==='task-add'?`📋 Assign Task — ${selected.name}`:`✏️ Edit Task`} onClose={() => setModal(null)}>
          <div className="form-group"><label className="form-label">Task Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Solve Chapter 4 Problems"/>
          </div>
          <div className="form-group"><label className="form-label">Course</label>
            <input className="form-input" value={form.course} onChange={e => setForm({...form,course:e.target.value})} placeholder="e.g. Mathematics"/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="form-group"><label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Duration (min)</label>
              <input className="form-input" type="number" min={5} value={form.duration} onChange={e => setForm({...form,duration:Number(e.target.value)})}/>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Deadline</label>
            <input className="form-input" type="date" value={form.deadline} onChange={e => setForm({...form,deadline:e.target.value})}/>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={saveModal} disabled={!form.title?.trim()}>{modal==='task-add'?'📋 Assign Task':'💾 Save Changes'}</button>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}
      {modal && modal.startsWith('quiz') && (
        <Modal title={modal==='quiz-add'?`✏️ Add Quiz — ${selected.name}`:`✏️ Edit Quiz`} onClose={() => setModal(null)}>
          <div className="form-group"><label className="form-label">Quiz Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Algebra Test"/>
          </div>
          <div className="form-group"><label className="form-label">Course</label>
            <input className="form-input" value={form.course} onChange={e => setForm({...form,course:e.target.value})} placeholder="e.g. Mathematics"/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="form-group"><label className="form-label">Score</label>
              <input className="form-input" type="number" min={0} value={form.score} onChange={e => setForm({...form,score:e.target.value})} placeholder="e.g. 75"/>
            </div>
            <div className="form-group"><label className="form-label">Total Marks</label>
              <input className="form-input" type="number" min={1} value={form.totalMarks} onChange={e => setForm({...form,totalMarks:Number(e.target.value)})}/>
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.75rem' }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={saveModal}>{modal==='quiz-add'?'Save Quiz':'Update Quiz'}</button>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}
      {modal && modal.startsWith('note') && (
        <Modal title={modal==='note-add'?`📄 Add Note — ${selected.name}`:`📄 Edit Note`} onClose={() => setModal(null)}>
          <div className="form-group"><label className="form-label">Note Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Calculus Summary"/>
          </div>
          <div className="form-group"><label className="form-label">Course</label>
            <input className="form-input" value={form.course} onChange={e => setForm({...form,course:e.target.value})} placeholder="e.g. Mathematics"/>
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={saveModal}>{modal==='note-add'?'Assign Note':'Update Note'}</button>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── QUIZZES ── */
function QuizzesTab({ globalQuizzes, adminAddGlobalQuiz, adminUpdateGlobalQuiz, adminDeleteGlobalQuiz }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ title:'', course:'', questions:10, duration:20, difficulty:'Medium' });
  const [builderQuiz, setBuilderQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qModal, setQModal] = useState(false);
  const [qForm, setQForm] = useState({ question:'', option_a:'', option_b:'', option_c:'', option_d:'', correct_ans:'A' });
  const [qEditTarget, setQEditTarget] = useState(null);
  const [loadingQ, setLoadingQ] = useState(false);

  const openBuilder = async (quiz) => {
    setBuilderQuiz(quiz);
    setLoadingQ(true);
    try {
      const qs = await quizQuestionsAPI.getAll(quiz.id);
      setQuestions(Array.isArray(qs) ? qs : []);
    } catch(e) { setQuestions([]); }
    setLoadingQ(false);
  };

  const saveQuestion = async () => {
    if (!qForm.question.trim()) return;
    try {
      if (qEditTarget) {
        const updated = await quizQuestionsAPI.update(builderQuiz.id, qEditTarget.id, qForm);
        setQuestions(p => p.map(q => q.id === qEditTarget.id ? updated : q));
      } else {
        const newQ = await quizQuestionsAPI.add(builderQuiz.id, qForm);
        setQuestions(p => [...p, newQ]);
      }
      setQModal(false); setQEditTarget(null);
      setQForm({ question:'', option_a:'', option_b:'', option_c:'', option_d:'', correct_ans:'A' });
    } catch(e) { console.error(e); }
  };

  const deleteQuestion = async (qid) => {
    try { await quizQuestionsAPI.delete(builderQuiz.id, qid); setQuestions(p => p.filter(q => q.id !== qid)); }
    catch(e) { console.error(e); }
  };

  const filtered = globalQuizzes.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    (q.course_name||q.course||'').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({ title:'', course:'', questions:10, duration:20, difficulty:'Medium' }); setEditTarget(null); setModal(true); };
  const openEdit = (q) => { setForm({ title:q.title, course:q.course_name||q.course, questions:q.questions, duration:q.duration, difficulty:q.difficulty }); setEditTarget(q); setModal(true); };

  const save = () => {
    if (!form.title.trim()) return;
    const payload = { title:form.title, course_name:form.course, questions:Number(form.questions), duration:Number(form.duration), difficulty:form.difficulty };
    editTarget ? adminUpdateGlobalQuiz(editTarget.id, payload) : adminAddGlobalQuiz(payload);
    setModal(null);
  };

  const dc = { Easy:'badge-teal', Medium:'badge-amber', Hard:'badge-pink' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', gap:'1rem', flexWrap:'wrap' }}>
        <input className="form-input" style={{ maxWidth:300 }} placeholder="🔍  Search quizzes…" value={search} onChange={e => setSearch(e.target.value)}/>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Quiz</button>
      </div>
      {filtered.length===0
        ? <div className="empty-state"><div className="icon">✏️</div><p>No quizzes yet.</p></div>
        : <div className="card" style={{ padding:0 }}>
            <table className="table">
              <thead><tr><th>Title</th><th>Course</th><th>Questions</th><th>Duration</th><th>Difficulty</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(q => (
                <tr key={q.id}>
                  <td style={{ fontWeight:500, fontSize:'0.85rem' }}>✏️ {q.title}</td>
                  <td><span className="badge badge-gray">{q.course_name||q.course}</span></td>
                  <td style={{ fontSize:'0.82rem' }}>{q.questions} Qs</td>
                  <td style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{q.duration} min</td>
                  <td><span className={`badge ${dc[q.difficulty]||'badge-gray'}`}>{q.difficulty}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:'0.35rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(q)}>✏️ Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openBuilder(q)} style={{ color:'var(--accent)' }}>📝 Add Questions</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => adminDeleteGlobalQuiz(q.id)} style={{ color:'var(--danger)' }}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
      }
      {modal && (
        <Modal title={editTarget?'✏️ Edit Quiz':'✏️ Add Quiz'} onClose={() => setModal(null)}>
          <div className="form-group"><label className="form-label">Quiz Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Math – Calculus Basics"/>
          </div>
          <div className="form-group"><label className="form-label">Course</label>
            <input className="form-input" value={form.course} onChange={e => setForm({...form,course:e.target.value})} placeholder="e.g. Mathematics"/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
            <div className="form-group"><label className="form-label">Questions</label>
              <input className="form-input" type="number" min={1} value={form.questions} onChange={e => setForm({...form,questions:Number(e.target.value)})}/>
            </div>
            <div className="form-group"><label className="form-label">Duration (min)</label>
              <input className="form-input" type="number" min={1} value={form.duration} onChange={e => setForm({...form,duration:Number(e.target.value)})}/>
            </div>
            <div className="form-group"><label className="form-label">Difficulty</label>
              <select className="form-select" value={form.difficulty} onChange={e => setForm({...form,difficulty:e.target.value})}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.75rem' }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={save}>{editTarget?'Save Changes':'Create Quiz'}</button>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}
      {builderQuiz && createPortal(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', overflowY:'auto' }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-hover)', borderRadius:'var(--radius-xl)', padding:'2rem', width:'100%', maxWidth:700, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:700 }}>📝 Questions — {builderQuiz.title}</h3>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button className="btn btn-primary btn-sm" onClick={() => { setQEditTarget(null); setQForm({ question:'', option_a:'', option_b:'', option_c:'', option_d:'', correct_ans:'A' }); setQModal(true); }}>+ Add Question</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setBuilderQuiz(null)}>✕ Close</button>
              </div>
            </div>
            {loadingQ ? <p style={{ color:'var(--text-muted)' }}>Loading...</p>
              : questions.length===0
                ? <div className="empty-state"><div className="icon">❓</div><p>No questions yet.</p></div>
                : questions.map((q,i) => (
                  <div key={q.id} style={{ background:'var(--bg-elevated)', borderRadius:'12px', padding:'1rem', marginBottom:'0.75rem', border:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                      <span style={{ fontWeight:600, fontSize:'0.9rem' }}>Q{i+1}. {q.question}</span>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setQEditTarget(q); setQForm({ question:q.question, option_a:q.option_a, option_b:q.option_b, option_c:q.option_c, option_d:q.option_d, correct_ans:q.correct_ans }); setQModal(true); }}>✏️</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => deleteQuestion(q.id)} style={{ color:'var(--danger)' }}>🗑️</button>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem' }}>
                      {['A','B','C','D'].map(opt => (
                        <div key={opt} style={{ padding:'0.4rem 0.75rem', borderRadius:'8px', fontSize:'0.82rem', background:q.correct_ans===opt?'rgba(67,232,198,0.15)':'var(--bg-card)', border:q.correct_ans===opt?'1px solid var(--success)':'1px solid var(--border)', color:q.correct_ans===opt?'var(--success)':'var(--text-muted)' }}>
                          <strong>{opt}.</strong> {q[`option_${opt.toLowerCase()}`]} {q.correct_ans===opt && '✅'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            }
            {qModal && (
              <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:4000, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'2rem 1rem', overflowY:'auto' }}>
                <div style={{ background:'var(--bg-card)', borderRadius:'var(--radius-xl)', padding:'2rem', width:'100%', maxWidth:520, margin:'auto' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1.25rem' }}>
                    <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>{qEditTarget?'Edit Question':'Add Question'}</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setQModal(false)}>✕</button>
                  </div>
                  <div className="form-group"><label className="form-label">Question</label>
                    <textarea className="form-input" rows={3} value={qForm.question} onChange={e => setQForm({...qForm,question:e.target.value})} placeholder="e.g. What is the derivative of x²?"/>
                  </div>
                  {['a','b','c','d'].map(opt => (
                    <div className="form-group" key={opt}><label className="form-label">Option {opt.toUpperCase()}</label>
                      <input className="form-input" value={qForm[`option_${opt}`]} onChange={e => setQForm({...qForm,[`option_${opt}`]:e.target.value})} placeholder={`Option ${opt.toUpperCase()}`}/>
                    </div>
                  ))}
                  <div className="form-group"><label className="form-label">Correct Answer</label>
                    <select className="form-select" value={qForm.correct_ans} onChange={e => setQForm({...qForm,correct_ans:e.target.value})}>
                      <option value="A">A — {qForm.option_a||'Option A'}</option>
                      <option value="B">B — {qForm.option_b||'Option B'}</option>
                      <option value="C">C — {qForm.option_c||'Option C'}</option>
                      <option value="D">D — {qForm.option_d||'Option D'}</option>
                    </select>
                  </div>
                  <div style={{ display:'flex', gap:'0.75rem', marginTop:'1rem' }}>
                    <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={saveQuestion} disabled={!qForm.question.trim()}>{qEditTarget?'Save Changes':'Add Question'}</button>
                    <button className="btn btn-secondary" onClick={() => setQModal(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── NOTES ── */
function NotesTab({ notes, adminAddNote, adminUpdateNote, adminDeleteNote }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ title:'', course:'', type:'PDF', shared:false, size:'1.0 MB' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const ext = file.name.split('.').pop().toUpperCase();
    const size_kb = file.size/1024;
    const size_str = size_kb<1024 ? `${size_kb.toFixed(1)} KB` : `${(size_kb/1024).toFixed(1)} MB`;
    setForm(f => ({ ...f, type:ext, size:size_str }));
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.course_name||n.course||'').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({ title:'', course:'', type:'PDF', shared:false, size:'1.0 MB' }); setSelectedFile(null); setEditTarget(null); setModal(true); };
  const openEdit = (n) => { setForm({ title:n.title, course:n.course_name||n.course, type:n.file_type||n.type, shared:!!n.shared, size:n.file_size||n.size }); setEditTarget(n); setModal(true); };

  const save = async () => {
    if (!form.title.trim()) return;
    setUploading(true);
    try {
      let finalForm = { ...form, course_name: form.course };
      if (selectedFile && !editTarget) {
        const token = localStorage.getItem('token');
        const fd = new FormData();
        fd.append('file', selectedFile);
        const res = await fetch('http://localhost:8000/api/notes/upload', {
          method:'POST', headers:{ Authorization:`Bearer ${token}` }, body:fd,
        });
        if (res.ok) {
          const data = await res.json();
          finalForm = { ...finalForm, file_url:data.file_url, file_size:data.file_size, file_type:data.file_type };
        }
      }
      editTarget ? adminUpdateNote(editTarget.id, finalForm) : adminAddNote(finalForm);
    } catch(e) { console.error(e); }
    finally { setUploading(false); setModal(null); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', gap:'1rem', flexWrap:'wrap' }}>
        <input className="form-input" style={{ maxWidth:300 }} placeholder="🔍  Search notes…" value={search} onChange={e => setSearch(e.target.value)}/>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Note</button>
      </div>
      {filtered.length===0
        ? <div className="empty-state"><div className="icon">📁</div><p>No notes yet.</p></div>
        : <div className="card" style={{ padding:0 }}>
            <table className="table">
              <thead><tr><th>Title</th><th>Course</th><th>Type</th><th>Size</th><th>Shared</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(n => (
                <tr key={n.id}>
                  <td style={{ fontWeight:500, fontSize:'0.85rem' }}>📄 {n.title}</td>
                  <td><span className="badge badge-gray">{n.course_name||n.course}</span></td>
                  <td><span className="badge badge-purple">{n.file_type||n.type}</span></td>
                  <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{n.file_size||n.size}</td>
                  <td>{n.shared?<span className="badge badge-teal">🔗 Yes</span>:<span className="badge badge-gray">No</span>}</td>
                  <td><ActionRow onEdit={() => openEdit(n)} onDelete={() => adminDeleteNote(n.id)}/></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
      }
      {modal && (
        <Modal title={editTarget?'📄 Edit Note':'📄 Add Note'} onClose={() => setModal(null)}>
          <div className="form-group"><label className="form-label">Note Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Chapter 3 Summary"/>
          </div>
          <div className="form-group"><label className="form-label">Course</label>
            <input className="form-input" value={form.course} onChange={e => setForm({...form,course:e.target.value})} placeholder="e.g. Mathematics"/>
          </div>
          <div className="form-group"><label className="form-label">📎 File Upload</label>
            <input type="file" accept=".pdf,.docx,.ppt,.pptx,.txt" onChange={handleFileChange} style={{ display:'block', width:'100%', padding:'0.6rem', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', cursor:'pointer', fontSize:'0.83rem' }}/>
            {selectedFile ? <div style={{ fontSize:'0.75rem', color:'var(--success)', marginTop:'0.3rem' }}>✅ {selectedFile.name} ({form.size})</div>
              : <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.3rem' }}>Koi file select nahi ki</div>}
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'1rem', cursor:'pointer' }}>
            <input type="checkbox" checked={form.shared} onChange={e => setForm({...form,shared:e.target.checked})} style={{ accentColor:'var(--accent)', width:15, height:15 }}/>
            <span className="form-label" style={{ margin:0 }}>Share with all students</span>
          </label>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={save} disabled={uploading}>{uploading?'Uploading...':editTarget?'Save Changes':'Upload Note'}</button>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── TASKS ── */
function TasksTab({ globalTasks, adminAddGlobalTask, adminUpdateGlobalTask, adminDeleteGlobalTask }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ title:'', course:'', priority:'Medium', deadline:'', duration:60, notes:'' });

  const filtered = globalTasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.course_name||t.course||'').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({ title:'', course:'', priority:'Medium', deadline:'', duration:60, notes:'' }); setEditTarget(null); setModal(true); };
  const openEdit = (t) => { setForm({ title:t.title, course:t.course_name||t.course, priority:t.priority, deadline:t.deadline||'', duration:t.duration, notes:t.notes||'' }); setEditTarget(t); setModal(true); };

  const save = () => {
    if (!form.title.trim()) return;
    const payload = { title:form.title, course_name:form.course, priority:form.priority, deadline:form.deadline||null, duration:Number(form.duration), notes:form.notes||'' };
    editTarget ? adminUpdateGlobalTask(editTarget.id, payload) : adminAddGlobalTask(payload);
    setModal(null);
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', gap:'1rem', flexWrap:'wrap' }}>
        <input className="form-input" style={{ maxWidth:300 }} placeholder="🔍  Search tasks…" value={search} onChange={e => setSearch(e.target.value)}/>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Task</button>
      </div>
      {filtered.length===0
        ? <div className="empty-state"><div className="icon">📋</div><p>No tasks yet.</p></div>
        : <div className="card" style={{ padding:0 }}>
            <table className="table">
              <thead><tr><th>Title</th><th>Course</th><th>Priority</th><th>Deadline</th><th>Duration</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight:500, fontSize:'0.85rem' }}>📋 {t.title}</td>
                  <td><span className="badge badge-gray">{t.course_name||t.course}</span></td>
                  <td><span className={`badge ${t.priority==='High'?'badge-pink':t.priority==='Medium'?'badge-amber':'badge-teal'}`}>{t.priority}</span></td>
                  <td style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>{t.deadline||'—'}</td>
                  <td style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>{t.duration} min</td>
                  <td><ActionRow onEdit={() => openEdit(t)} onDelete={() => adminDeleteGlobalTask(t.id)}/></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
      }
      {modal && (
        <Modal title={editTarget?'📋 Edit Task':'📋 Add Task'} onClose={() => setModal(null)}>
          <div className="form-group"><label className="form-label">Task Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Solve Practice Problems"/>
          </div>
          <div className="form-group"><label className="form-label">Course</label>
            <input className="form-input" value={form.course} onChange={e => setForm({...form,course:e.target.value})} placeholder="e.g. Mathematics"/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="form-group"><label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Duration (min)</label>
              <input className="form-input" type="number" min={5} value={form.duration} onChange={e => setForm({...form,duration:Number(e.target.value)})}/>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Deadline</label>
            <input className="form-input" type="date" value={form.deadline} onChange={e => setForm({...form,deadline:e.target.value})}/>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={save}>{editTarget?'Save Changes':'Add Task'}</button>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── USERS ── */
function UsersTab({ allUsers }) {
  const [users, setUsers] = useState(allUsers.map(u => ({ ...u, status:'Active' })));
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', role:'student', status:'Active' });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const openAdd = () => { setForm({ name:'', email:'', role:'student', status:'Active' }); setEditTarget(null); setModal(true); };
  const openEdit = (u) => { setForm({ name:u.name, email:u.email, role:u.role, status:u.status }); setEditTarget(u); setModal(true); };
  const save = () => {
    if (!form.name.trim()) return;
    editTarget ? setUsers(p => p.map(u => u.id===editTarget.id ? {...u,...form} : u))
               : setUsers(p => [...p, { ...form, id:Date.now(), joined:new Date().toISOString().slice(0,10) }]);
    setModal(null);
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
        <input className="form-input" style={{ maxWidth:280 }} placeholder="🔍  Search users…" value={search} onChange={e => setSearch(e.target.value)}/>
        <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
      </div>
      <div className="card" style={{ padding:0 }}>
        <table className="table">
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(u => (
            <tr key={u.id}>
              <td>
                <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                  <div className="avatar" style={{ width:30, height:30, fontSize:'0.68rem' }}>{u.name.slice(0,2).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight:500, fontSize:'0.85rem' }}>{u.name}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{u.role}</div>
                  </div>
                </div>
              </td>
              <td style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>{u.email}</td>
              <td><span className={`badge ${u.role==='admin'?'badge-purple':'badge-teal'}`}>{u.role}</span></td>
              <td><span className={`badge ${u.status==='Active'?'badge-teal':'badge-pink'}`}>● {u.status}</span></td>
              <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{u.joined}</td>
             <td><ActionRow onEdit={() => openEdit(u)} onDelete={async () => {
  if (!window.confirm(`Remove ${u.name}? They will not be able to login.`)) return;
  try {
    await usersAPI.delete(u.id);
    setUsers(p => p.filter(x => x.id !== u.id));
  } catch (e) {
    alert('Failed to delete user. Please try again.');
  }
}} /></td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length===0 && <div className="empty-state"><div className="icon">👤</div><p>No users found.</p></div>}
      </div>
      {modal && (
        <Modal title={editTarget?'Edit User':'Add User'} onClose={() => setModal(null)}>
          {['name','email'].map(f => (
            <div className="form-group" key={f}><label className="form-label" style={{ textTransform:'capitalize' }}>{f}</label>
              <input className="form-input" value={form[f]} onChange={e => setForm({...form,[f]:e.target.value})} placeholder={f==='email'?'user@example.com':'Full name'}/>
            </div>
          ))}
          <div className="form-group"><label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={e => setForm({...form,role:e.target.value})}>
              <option value="student">Student</option><option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'1rem' }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={save}>{editTarget?'Save Changes':'Create User'}</button>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── FIX 2: CoursesTab — use context directly, NO local useState(init) ── */
function CoursesTab({ courses, addCourse, updateCourse, deleteCourse }) {
  // ✅ No local courses state — directly using context prop
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name:'', category:'Science', difficulty:'Medium', color:'#6c63ff' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const openAdd = () => { setForm({ name:'', category:'Science', difficulty:'Medium', color:'#6c63ff' }); setSelectedFile(null); setEditTarget(null); setModal(true); };
  const openEdit = (c) => { setForm({ name:c.name, category:c.category, difficulty:c.difficulty, color:c.color }); setSelectedFile(null); setEditTarget(c); setModal(true); };

  const save = async () => {
    if (!form.name.trim()) return;
    setUploading(true);
    try {
      let courseData = { ...form };
      if (selectedFile) {
        // File metadata store karo — backend connect hone par actual upload yahan hogi
        courseData = { ...courseData, file_name: selectedFile.name, file_size: `${(selectedFile.size/1024).toFixed(1)} KB` };
      }
      if (editTarget) {
        updateCourse(editTarget.id, courseData); // ✅ context update — student ko dikhega
      } else {
        addCourse(courseData); // ✅ context update — student ko dikhega
      }
    } catch(e) { console.error(e); }
    finally { setUploading(false); setModal(null); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1rem' }}>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Course</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1rem' }}>
        {courses.map(c => (
          <div key={c.id} className="card" style={{ borderLeft:`3px solid ${c.color}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.95rem', fontFamily:'var(--font-display)' }}>{c.name}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:'0.2rem' }}>{c.category} · {c.difficulty}</div>
              </div>
              <ActionRow
                onEdit={() => openEdit(c)}
                onDelete={() => deleteCourse(c.id)}  /* ✅ context delete */
              />
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.25rem' }}>
                <span style={{ fontSize:'0.73rem', color:'var(--text-muted)' }}>Progress</span>
                <span style={{ fontSize:'0.73rem', fontWeight:600 }}>{c.progress||0}%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width:`${c.progress||0}%`, background:c.color }}/></div>
            </div>
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.65rem', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' }}>
              <span className={`badge ${c.difficulty==='Hard'?'badge-pink':c.difficulty==='Medium'?'badge-amber':'badge-teal'}`}>{c.difficulty}</span>
              {c.file_name && <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>📎 {c.file_name}</span>}
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <Modal title={editTarget?'✏️ Edit Course':'📚 Add Course'} onClose={() => setModal(null)}>
          <div className="form-group"><label className="form-label">Course Name</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="e.g. Biology" autoFocus/>
          </div>
          <div className="form-group"><label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm({...form,category:e.target.value})}>
              <option>Science</option><option>Humanities</option><option>Technology</option><option>Arts</option><option>Mathematics</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Difficulty</label>
            <select className="form-select" value={form.difficulty} onChange={e => setForm({...form,difficulty:e.target.value})}>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Color</label>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              {['#6c63ff','#ff6584','#43e8c6','#ffb347','#a89dff','#ff9f7f'].map(col => (
                <button key={col} onClick={() => setForm({...form,color:col})} style={{ width:28, height:28, borderRadius:'50%', border:form.color===col?'3px solid white':'3px solid transparent', background:col, cursor:'pointer', outline:'none' }}/>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">📎 Course Material (Optional)</label>
            <input type="file" accept=".pdf,.docx,.ppt,.pptx,.mp4,.zip,.txt"
              onChange={e => setSelectedFile(e.target.files[0]||null)}
              style={{ display:'block', width:'100%', padding:'0.6rem', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', cursor:'pointer', fontSize:'0.83rem' }}/>
            {selectedFile
              ? <div style={{ fontSize:'0.75rem', color:'var(--success)', marginTop:'0.3rem' }}>✅ {selectedFile.name} ({(selectedFile.size/1024).toFixed(1)} KB)</div>
              : <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.3rem' }}>PDF, DOCX, PPT, MP4, ZIP allowed</div>
            }
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'1rem' }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={save} disabled={uploading||!form.name.trim()}>
              {uploading?'Saving...':editTarget?'Save Changes':'Create Course'}
            </button>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── MAIN ADMIN ── */
const TABS = [
  { id:'overview', label:'Overview', icon:'⊞' },
  { id:'students', label:'Students', icon:'🎓' },
  { id:'quizzes', label:'Quizzes', icon:'✏️' },
  { id:'notes', label:'Notes', icon:'📄' },
  { id:'tasks', label:'Tasks', icon:'📋' },
  { id:'users', label:'Users', icon:'👥' },
  { id:'courses', label:'Courses', icon:'📚' },
];

export default function Admin({ onShowHome }) {
  const {
    user, allUsers, courses, addCourse, updateCourse, deleteCourse,
    notes, adminAddNote, adminUpdateNote, adminDeleteNote,
    globalQuizzes, adminAddGlobalQuiz, adminUpdateGlobalQuiz, adminDeleteGlobalQuiz,
    globalTasks, adminAddGlobalTask, adminUpdateGlobalTask, adminDeleteGlobalTask,
    studentQuizzes, adminAddStudentQuiz, adminUpdateStudentQuiz, adminDeleteStudentQuiz,
    studentNotes, adminAddStudentNote, adminUpdateStudentNote, adminDeleteStudentNote,
    studentTasks, adminAddStudentTask, adminUpdateStudentTask, adminDeleteStudentTask,
    studentQuizzesMap, studentNotesMap, studentTasksMap,
    studentProgress, loadStudentDataForAdmin, logout,
  } = useApp();

  const [tab, setTab] = useState('overview');

  return (
    <div className="animate-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', padding:'1rem 1.5rem', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)' }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.35rem', fontWeight:800, background:'linear-gradient(135deg,var(--accent),var(--accent3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            🛡️ Admin Dashboard
          </h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginTop:'0.1rem' }}>StudyFlow — Full Control Panel</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'0.85rem', fontWeight:600 }}>{user?.name}</div>
            <div style={{ fontSize:'0.7rem', color:'var(--accent)', fontWeight:500 }}>Administrator</div>
          </div>
          <div className="avatar" style={{ width:38, height:38 }}>{user?.name?.slice(0,2).toUpperCase()}</div>
          <button onClick={() => { logout(); if(onShowHome) onShowHome(); }} style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.45rem 1rem', borderRadius:'10px', border:'1px solid rgba(255,101,132,0.35)', background:'rgba(255,101,132,0.08)', color:'#ff6584', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, fontFamily:'var(--font-body)' }}>⏻ Logout</button>
        </div>
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab}/>

      {tab==='overview' && <Overview allUsers={allUsers} courses={courses} notes={notes} studentQuizzes={studentQuizzes} globalQuizzes={globalQuizzes} globalTasks={globalTasks}/>}
      {tab==='students' && <StudentsTab allUsers={allUsers}
        studentQuizzes={studentQuizzesMap||studentQuizzes}
        studentNotes={studentNotesMap||studentNotes}
        studentTasks={studentTasksMap||studentTasks}
        studentProgress={studentProgress}
        loadStudentDataForAdmin={loadStudentDataForAdmin}
        adminAddStudentQuiz={adminAddStudentQuiz} adminUpdateStudentQuiz={adminUpdateStudentQuiz} adminDeleteStudentQuiz={adminDeleteStudentQuiz}
        adminAddStudentNote={adminAddStudentNote} adminUpdateStudentNote={adminUpdateStudentNote} adminDeleteStudentNote={adminDeleteStudentNote}
        adminAddStudentTask={adminAddStudentTask} adminUpdateStudentTask={adminUpdateStudentTask} adminDeleteStudentTask={adminDeleteStudentTask}/>}
      {tab==='quizzes' && <QuizzesTab globalQuizzes={globalQuizzes} adminAddGlobalQuiz={adminAddGlobalQuiz} adminUpdateGlobalQuiz={adminUpdateGlobalQuiz} adminDeleteGlobalQuiz={adminDeleteGlobalQuiz}/>}
      {tab==='notes' && <NotesTab notes={notes} adminAddNote={adminAddNote} adminUpdateNote={adminUpdateNote} adminDeleteNote={adminDeleteNote}/>}
      {tab==='tasks' && <TasksTab globalTasks={globalTasks} adminAddGlobalTask={adminAddGlobalTask} adminUpdateGlobalTask={adminUpdateGlobalTask} adminDeleteGlobalTask={adminDeleteGlobalTask}/>}
      {tab==='users' && <UsersTab allUsers={allUsers}/>}
      {tab==='courses' && <CoursesTab courses={courses} addCourse={addCourse} updateCourse={updateCourse} deleteCourse={deleteCourse}/>}
    </div>
  );
}