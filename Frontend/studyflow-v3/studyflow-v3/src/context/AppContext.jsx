import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authAPI, coursesAPI, tasksAPI, notesAPI,
  quizzesAPI, usersAPI,
} from './api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]                     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [courses, setCourses]               = useState([]);
  const [tasks, setTasks]                   = useState([]);
  const [notes, setNotes]                   = useState([]);
  const [globalQuizzes, setGlobalQuizzes]   = useState([]);
  const [studentQuizzes, setStudentQuizzes] = useState([]);
  const [allUsers, setAllUsers]             = useState([]);
  const [globalTasks, setGlobalTasks]       = useState([]);
  const [page, setPage]                     = useState('dashboard');

  // ── Session restore ───────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then(u => setUser(u))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') loadAdminData();
    else loadStudentData(user.id);
  }, [user]);

  // ── Load student data ─────────────────────────────────────────
  const loadStudentData = async (uid) => {
    try {
      const [c1, c2, t, n, gq, sq] = await Promise.all([
        coursesAPI.getForStudent(uid).catch(() => []),
        coursesAPI.getAll().catch(() => []),
        tasksAPI.getForStudent(uid).catch(() => []),
        notesAPI.getForStudent(uid).catch(() => []),
        quizzesAPI.getGlobal().catch(() => []),
        quizzesAPI.getForStudent(uid).catch(() => []),
      ]);
      const allCourses = [...(Array.isArray(c1) ? c1 : []), ...(Array.isArray(c2) ? c2 : [])];
      const uniqueCourses = allCourses.filter((c, i, self) => self.findIndex(x => x.id === c.id) === i);
      setCourses(uniqueCourses);
      setTasks(Array.isArray(t) ? t : []);
      setNotes(Array.isArray(n) ? n : []);
      setGlobalQuizzes(Array.isArray(gq) ? gq : []);
      setStudentQuizzes(Array.isArray(sq) ? sq : []);
    } catch (e) {
      console.error('Error loading student data:', e);
    }
  };

  // ── Load admin data ───────────────────────────────────────────
  const loadAdminData = async () => {
    try {
      const [u, c, n, gq] = await Promise.all([
        usersAPI.getAll().catch(() => []),
        coursesAPI.getAll().catch(() => []),
        notesAPI.getAll().catch(() => []),
        quizzesAPI.getGlobal().catch(() => []),
      ]);
      const safeUsers = Array.isArray(u) ? u : [];
      setAllUsers(safeUsers);
      setCourses(Array.isArray(c) ? c : []);
      setNotes(Array.isArray(n) ? n : []);
      setGlobalQuizzes(Array.isArray(gq) ? gq : []);

      const students = safeUsers.filter(s => s.role === 'student');
      if (students.length > 0) {
        const t = await tasksAPI.getForStudent(students[0].id).catch(() => []);
        const adminTasks = Array.isArray(t) ? t.filter(task => task.assigned_by === 'admin') : [];
        setGlobalTasks(adminTasks);
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    }
  };

  // ── AUTH ──────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      return true;
    } catch (e) { return false; }
  };

  const register = async ({ name, email, password }) => {
    try {
      const data = await authAPI.register(name, email, password);
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      return { ok: true };
    } catch (e) { return { ok: false, msg: e.message }; }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCourses([]); setTasks([]); setNotes([]);
    setGlobalQuizzes([]); setStudentQuizzes([]);
    setAllUsers([]); setGlobalTasks([]);
    setPage('dashboard');
  };

  // ── TASKS ─────────────────────────────────────────────────────
  const toggleTask = async (id) => {
    try {
      const updated = await tasksAPI.toggle(id);
      setTasks(p => p.map(t => t.id === id ? updated : t));
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (id) => {
    try {
      await tasksAPI.delete(id);
      setTasks(p => p.filter(t => t.id !== id));
    } catch (e) { console.error(e); }
  };

  const addTask = async (uid, data) => {
    try {
      const newTask = await tasksAPI.create(uid, data);
      setTasks(p => [...p, newTask]);
      return newTask;
    } catch (e) { console.error(e); }
  };

  const updateTask = async (id, data) => {
    try {
      const updated = await tasksAPI.update(id, data);
      setTasks(p => p.map(t => t.id === id ? updated : t));
    } catch (e) { console.error(e); }
  };

  // ── NOTES ─────────────────────────────────────────────────────
  const deleteNote = async (id) => {
    try {
      if (user.role === 'admin') {
        await notesAPI.delete(id);
      } else {
        await notesAPI.studentDelete(user.id, id);
      }
      setNotes(p => p.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };

  // ── COURSES ───────────────────────────────────────────────────
  const addCourse = async (data) => {
    try {
      const c = await coursesAPI.create(data);
      setCourses(p => [...p, c]);
    } catch (e) { console.error(e); }
  };

  const updateCourse = async (id, data) => {
    try {
      const c = await coursesAPI.update(id, data);
      setCourses(p => p.map(x => x.id === id ? c : x));
    } catch (e) { console.error(e); }
  };

  const deleteCourse = async (id) => {
    try {
      await coursesAPI.delete(id);
      setCourses(p => p.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  // ── ADMIN: Global Quizzes ─────────────────────────────────────
  const adminAddGlobalQuiz = async (data) => {
    try {
      const q = await quizzesAPI.createGlobal(data);
      setGlobalQuizzes(p => [...p, q]);
    } catch (e) { console.error(e); }
  };

  const adminUpdateGlobalQuiz = async (id, data) => {
    try {
      const q = await quizzesAPI.updateGlobal(id, data);
      setGlobalQuizzes(p => p.map(x => x.id === id ? q : x));
    } catch (e) { console.error(e); }
  };

  const adminDeleteGlobalQuiz = async (id) => {
    try {
      await quizzesAPI.deleteGlobal(id);
      setGlobalQuizzes(p => p.filter(q => q.id !== id));
    } catch (e) { console.error(e); }
  };

  // ── ADMIN: Global Tasks ───────────────────────────────────────
  const adminAddGlobalTask = async (data) => {
    try {
      const students = allUsers.filter(u => u.role === 'student');
      const created = [];
      for (const s of students) {
        const t = await tasksAPI.create(s.id, { ...data, assigned_by: 'admin' });
        if (!created.find(x => x.title === t.title)) created.push(t);
      }
      setGlobalTasks(p => [...p, ...created]);
    } catch (e) { console.error(e); }
  };

  const adminUpdateGlobalTask = async (id, data) => {
    try {
      const t = await tasksAPI.update(id, data);
      setGlobalTasks(p => p.map(x => x.id === id ? t : x));
    } catch (e) { console.error(e); }
  };

  // ── FIX: adminDeleteGlobalTask — sabhi students se bhi delete ─
  const adminDeleteGlobalTask = async (id) => {
    try {
      const taskToDelete = globalTasks.find(t => t.id === id);

      // Sabhi students ke tasks fetch karo aur matching task delete karo
      const students = allUsers.filter(u => u.role === 'student');
      for (const s of students) {
        try {
          const sTasks = await tasksAPI.getForStudent(s.id).catch(() => []);
          if (!Array.isArray(sTasks)) continue;

          // Title + assigned_by se match karo
          const match = sTasks.find(t =>
            t.assigned_by === 'admin' &&
            (t.id === id || (taskToDelete && t.title === taskToDelete.title))
          );
          if (match && match.id !== id) {
            await tasksAPI.delete(match.id).catch(() => {});
          }
        } catch (e) { /* ek student fail ho toh baki continue karo */ }
      }

      // Main task delete
      await tasksAPI.delete(id);
      setGlobalTasks(p => p.filter(t => t.id !== id));
    } catch (e) { console.error(e); }
  };

  // ── ADMIN: Notes ──────────────────────────────────────────────
  const adminAddNote = async (data) => {
    try {
      const n = await notesAPI.create(data);
      setNotes(p => [...p, n]);
    } catch (e) { console.error(e); }
  };

  const adminUpdateNote = async (id, data) => {
    try {
      const n = await notesAPI.update(id, data);
      setNotes(p => p.map(x => x.id === id ? n : x));
    } catch (e) { console.error(e); }
  };

  const adminDeleteNote = async (id) => {
    try {
      await notesAPI.delete(id);
      setNotes(p => p.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };

  // ── ADMIN: Student data maps ──────────────────────────────────
  const [studentQuizzesMap, setStudentQuizzesMap] = useState({});
  const [studentNotesMap,   setStudentNotesMap]   = useState({});
  const [studentTasksMap,   setStudentTasksMap]   = useState({});

  const adminAddStudentQuiz = async (uid, data) => {
    try {
      const q = await quizzesAPI.addStudentResult(uid, { ...data, score: Number(data.score) });
      setStudentQuizzesMap(p => ({ ...p, [uid]: [...(p[uid] || []), q] }));
    } catch (e) { console.error(e); }
  };

  const adminUpdateStudentQuiz = async (uid, qid, data) => {
    try {
      const q = await quizzesAPI.updateStudentResult(uid, qid, data);
      setStudentQuizzesMap(p => ({ ...p, [uid]: (p[uid] || []).map(x => x.id === qid ? q : x) }));
    } catch (e) { console.error(e); }
  };

  const adminDeleteStudentQuiz = async (uid, qid) => {
    try {
      await quizzesAPI.deleteStudentResult(uid, qid);
      setStudentQuizzesMap(p => ({ ...p, [uid]: (p[uid] || []).filter(x => x.id !== qid) }));
    } catch (e) { console.error(e); }
  };

  const adminAddStudentNote = async (uid, data) => {
    try {
      const n = await notesAPI.create({ ...data, shared: false });
      await notesAPI.assignToStudent(n.id, uid);
      setStudentNotesMap(p => ({ ...p, [uid]: [...(p[uid] || []), n] }));
    } catch (e) { console.error(e); }
  };

  const adminUpdateStudentNote = async (uid, nid, data) => {
    try {
      const n = await notesAPI.update(nid, data);
      setStudentNotesMap(p => ({ ...p, [uid]: (p[uid] || []).map(x => x.id === nid ? n : x) }));
    } catch (e) { console.error(e); }
  };

  const adminDeleteStudentNote = async (uid, nid) => {
    try {
      await notesAPI.unassignStudent(nid, uid);
      setStudentNotesMap(p => ({ ...p, [uid]: (p[uid] || []).filter(x => x.id !== nid) }));
    } catch (e) { console.error(e); }
  };

  const adminAddStudentTask = async (uid, data) => {
    try {
      const t = await tasksAPI.create(uid, data);
      setStudentTasksMap(p => ({ ...p, [uid]: [...(p[uid] || []), t] }));
    } catch (e) { console.error(e); }
  };

  const adminUpdateStudentTask = async (uid, tid, data) => {
    try {
      const t = await tasksAPI.update(tid, data);
      setStudentTasksMap(p => ({ ...p, [uid]: (p[uid] || []).map(x => x.id === tid ? t : x) }));
    } catch (e) { console.error(e); }
  };

  const adminDeleteStudentTask = async (uid, tid) => {
    try {
      await tasksAPI.delete(tid);
      setStudentTasksMap(p => ({ ...p, [uid]: (p[uid] || []).filter(x => x.id !== tid) }));
    } catch (e) { console.error(e); }
  };

  const loadStudentDataForAdmin = useCallback(async (uid) => {
    try {
      const [t, n, sq] = await Promise.all([
        tasksAPI.getForStudent(uid).catch(() => []),
        notesAPI.getForStudent(uid).catch(() => []),
        quizzesAPI.getForStudent(uid).catch(() => []),
      ]);
      setStudentTasksMap(p => ({ ...p, [uid]: Array.isArray(t) ? t : [] }));
      setStudentNotesMap(p => ({ ...p, [uid]: Array.isArray(n) ? n : [] }));
      setStudentQuizzesMap(p => ({ ...p, [uid]: Array.isArray(sq) ? sq : [] }));
    } catch (e) { console.error(e); }
  }, []);

  const studentProgress = {};
  const streak = user?.streak || 0;
  const xp     = user?.xp     || 0;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      user, login, logout, register,
      courses, addCourse, updateCourse, deleteCourse,
      tasks, toggleTask, deleteTask, addTask, updateTask,
      notes, deleteNote,
      globalQuizzes, adminAddGlobalQuiz, adminUpdateGlobalQuiz, adminDeleteGlobalQuiz,
      globalTasks, adminAddGlobalTask, adminUpdateGlobalTask, adminDeleteGlobalTask,
      adminAddNote, adminUpdateNote, adminDeleteNote,
      studentQuizzes,
      studentQuizzesMap, adminAddStudentQuiz, adminUpdateStudentQuiz, adminDeleteStudentQuiz,
      studentNotesMap,   adminAddStudentNote, adminUpdateStudentNote, adminDeleteStudentNote,
      studentTasksMap,   adminAddStudentTask, adminUpdateStudentTask, adminDeleteStudentTask,
      studentNotes: studentNotesMap,
      studentTasks: studentTasksMap,
      studentProgress,
      loadStudentDataForAdmin,
      streak, xp, page, setPage,
      allUsers, setAllUsers,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export const MOCK_USERS = [];