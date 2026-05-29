const BASE_URL = 'http://localhost:8000';

// ── Core fetch helper ─────────────────────────────────────────
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Something went wrong' }));
    throw new Error(err.detail || 'Request failed');
  }

  // 204 No Content ke liye empty return
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  login:    (email, password) => apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (name, email, password) => apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }),
  me: () => apiFetch('/api/auth/me'),
};

// ── Courses ───────────────────────────────────────────────────

export const coursesAPI = {
  getAll:          ()            => apiFetch('/api/courses/'),
  upload: (formData) => fetch(`${BASE_URL}/api/courses/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: formData,
  }).then(r => r.json()),
  getForStudent:   (uid)         => apiFetch(`/api/courses/student/${uid}`),
  create:          (data)        => apiFetch('/api/courses/', { method: 'POST', body: JSON.stringify(data) }),
  update:          (id, data)    => apiFetch(`/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:          (id)          => apiFetch(`/api/courses/${id}`, { method: 'DELETE' }),
  enroll:          (uid, cid)    => apiFetch(`/api/courses/student/${uid}/enroll/${cid}`, { method: 'POST' }),
  updateProgress:  (uid, eid, d) => apiFetch(`/api/courses/student/${uid}/progress/${eid}`, { method: 'PATCH', body: JSON.stringify(d) }),
};

// ── Tasks ─────────────────────────────────────────────────────
export const tasksAPI = {
  getForStudent: (uid)        => apiFetch(`/api/tasks/student/${uid}`),
  create:        (uid, data)  => apiFetch(`/api/tasks/student/${uid}`, { method: 'POST', body: JSON.stringify(data) }),
  update:        (id, data)   => apiFetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggle:        (id)         => apiFetch(`/api/tasks/${id}/toggle`, { method: 'PATCH' }),
  delete:        (id)         => apiFetch(`/api/tasks/${id}`, { method: 'DELETE' }),
};

// ── Notes ─────────────────────────────────────────────────────
export const notesAPI = {
  getAll:           ()             => apiFetch('/api/notes/'),
  getForStudent:    (uid)          => apiFetch(`/api/notes/student/${uid}`),
  create:           (data)         => apiFetch('/api/notes/', { method: 'POST', body: JSON.stringify(data) }),
  update:           (id, data)     => apiFetch(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:           (id)           => apiFetch(`/api/notes/${id}`, { method: 'DELETE' }),
  assignToStudent:  (nid, uid)     => apiFetch(`/api/notes/${nid}/assign/${uid}`, { method: 'POST' }),
  unassignStudent:  (nid, uid)     => apiFetch(`/api/notes/${nid}/assign/${uid}`, { method: 'DELETE' }),
  studentDelete:    (uid, nid)     => apiFetch(`/api/notes/student/${uid}/${nid}`, { method: 'DELETE' }),
};

// ── Quizzes ───────────────────────────────────────────────────
export const quizzesAPI = {
  getGlobal:          ()              => apiFetch('/api/quizzes/global'),
  createGlobal:       (data)          => apiFetch('/api/quizzes/global', { method: 'POST', body: JSON.stringify(data) }),
  updateGlobal:       (id, data)      => apiFetch(`/api/quizzes/global/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGlobal:       (id)            => apiFetch(`/api/quizzes/global/${id}`, { method: 'DELETE' }),
  getForStudent:      (uid)           => apiFetch(`/api/quizzes/student/${uid}`),
  addStudentResult:   (uid, data)     => apiFetch(`/api/quizzes/student/${uid}`, { method: 'POST', body: JSON.stringify(data) }),
  updateStudentResult:(uid, qid, d)   => apiFetch(`/api/quizzes/student/${uid}/${qid}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteStudentResult:(uid, qid)      => apiFetch(`/api/quizzes/student/${uid}/${qid}`, { method: 'DELETE' }),
};

// ── Users (Admin) ─────────────────────────────────────────────
export const usersAPI = {
  getAll:      ()         => apiFetch('/api/users/'),
  getStudents: ()         => apiFetch('/api/users/students'),
  getOne:      (id)       => apiFetch(`/api/users/${id}`),
  update:      (id, data) => apiFetch(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete:      (id)       => apiFetch(`/api/users/${id}`, { method: 'DELETE' }),
};

// ── Analytics ─────────────────────────────────────────────────
export const analyticsAPI = {
  get:        (uid)   => apiFetch(`/api/analytics/${uid}`),
  logSession: (uid, data) => apiFetch(`/api/analytics/${uid}/sessions`, { method: 'POST', body: JSON.stringify(data) }),
};
// ── Quiz Questions ─────────────────────────────────────────────
export const quizQuestionsAPI = {
  getAll:  (qid)        => apiFetch(`/api/quiz-questions/${qid}`),
  add:     (qid, data)  => apiFetch(`/api/quiz-questions/${qid}`, { method: 'POST', body: JSON.stringify(data) }),
  update:  (qid, id, d) => apiFetch(`/api/quiz-questions/${qid}/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  delete:  (qid, id)    => apiFetch(`/api/quiz-questions/${qid}/${id}`, { method: 'DELETE' }),
};