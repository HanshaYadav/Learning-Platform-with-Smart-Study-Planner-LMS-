import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { quizzesAPI, quizQuestionsAPI } from '../context/api';

export default function Quiz() {
  const { user, globalQuizzes, studentQuizzes } = useApp();
  console.log('Global quizzes:', globalQuizzes);
  const [quizState, setQuizState] = useState('list'); // list | active | result
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timedMode, setTimedMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [myResults, setMyResults] = useState([]);

  // Load student's past results
  useEffect(() => {
    if (!user) return;
    quizzesAPI.getForStudent(user.id)
      .then(r => setMyResults(Array.isArray(r) ? r : []))
      .catch(() => setMyResults([]));
  }, [user]);

  const handleNext = useCallback(() => {
    const newAnswers = [...answers, {
      selected,
      correct: selected === questions[current].answer
    }];
    if (current + 1 < questions.length) {
      setAnswers(newAnswers);
      setCurrent(c => c + 1);
      setSelected(null);
      setTimeLeft(30);
    } else {
      const score = newAnswers.filter(a => a.correct).length;
      setAnswers(newAnswers);
      // Save result
      quizzesAPI.addStudentResult(user.id, {
        title: selectedQuiz.title,
        course_name: selectedQuiz.course_name,
        score: score,
        total_marks: questions.length,
        status: 'Completed',
        quiz_id: selectedQuiz.id,
      }).then(r => setMyResults(p => [...p, r])).catch(() => {});
      setQuizState('result');
    }
  }, [answers, current, questions, selected, selectedQuiz, user]);

  useEffect(() => {
    if (quizState !== 'active' || !timedMode) return;
    if (timeLeft <= 0) { handleNext(); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, quizState, timedMode, handleNext]);

  const startQuiz = async (quiz) => {
    setLoading(true);
    setSelectedQuiz(quiz);
    try {
      const qs = await quizQuestionsAPI.getAll(quiz.id);
      console.log('Questions loaded:', qs);
      if (!qs || qs.length === 0) {
        alert('Is quiz mein abhi koi questions nahi hain. Admin se contact karo!');
        setLoading(false);
        return;
      }
      const formatted = qs.map(q => ({
        q: q.question,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        answer: ['A', 'B', 'C', 'D'].indexOf(q.correct_ans),
      }));
      setQuestions(formatted);
      setCurrent(0);
      setSelected(null);
      setAnswers([]);
      setTimeLeft(30);
      setQuizState('active');
    } catch (e) {
      alert('Quiz load karne mein error aaya.');
    }
    setLoading(false);
  };

  const score = answers.filter(a => a.correct).length;
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  // ── Quiz List ──
  if (quizState === 'list') return (
    <div className="animate-in">
      <div className="page-header">
        <h2>Quiz & Assessments</h2>
        <p>Attempt quizzes created by your teacher</p>
      </div>

      {globalQuizzes.length === 0 ? (
        <div className="empty-state">
          <div className="icon">✏️</div>
          <p>Koi quiz available nahi hai abhi. Admin jald hi add karega!</p>
        </div>
      ) : (
        <div className="grid-3">
          {globalQuizzes.map(quiz => {
            const myResult = myResults.filter(r => r.quiz_id === quiz.id || r.title === quiz.title);
            const attempted = myResult.length > 0;
            const lastScore = attempted ? myResult[myResult.length - 1] : null;
            const pctScore = lastScore ? Math.round((lastScore.score / lastScore.total_marks) * 100) : 0;
            return (
              <div key={quiz.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '12px', background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>✏️</div>
                  <span className={`badge ${quiz.difficulty === 'Hard' ? 'badge-pink' : quiz.difficulty === 'Medium' ? 'badge-amber' : 'badge-teal'}`}>{quiz.difficulty}</span>
                </div>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>{quiz.title}</h4>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-gray">{quiz.course_name}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>❓ {quiz.questions} Qs</span>
                  <span>⏱ {quiz.duration} min</span>
                </div>
                {attempted && (
                  <div style={{ background: 'rgba(67,232,198,0.1)', borderRadius: '8px', padding: '0.5rem 0.75rem', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                    ✅ Last score: <strong style={{ color: 'var(--success)' }}>{lastScore.score}/{lastScore.total_marks} ({pctScore}%)</strong>
                  </div>
                )}
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => startQuiz(quiz)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : attempted ? '🔄 Retry Quiz' : '🚀 Start Quiz'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Past Results */}
      {myResults.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div className="section-title">My Quiz History</div>
          <div className="card" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr><th>Quiz</th><th>Course</th><th>Score</th><th>Grade</th><th>Date</th></tr>
              </thead>
              <tbody>
                {myResults.slice().reverse().map((r, i) => {
                  const p = Math.round((r.score / r.total_marks) * 100);
                  const grade = p >= 80 ? 'A' : p >= 65 ? 'B' : p >= 50 ? 'C' : 'F';
                  const gc = { A: 'var(--success)', B: 'var(--accent)', C: 'var(--warning)', F: 'var(--danger)' };
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{r.title}</td>
                      <td><span className="badge badge-gray">{r.course_name}</span></td>
                      <td>{r.score}/{r.total_marks} ({p}%)</td>
                      <td><span style={{ fontWeight: 800, color: gc[grade] }}>{grade}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{r.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ── Active Quiz ──
  if (quizState === 'active') return (
    <div className="animate-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>{selectedQuiz.title}</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => setQuizState('list')}>✕ Quit</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="progress-bar" style={{ flex: 1, height: 8 }}>
          <div className="progress-fill" style={{ width: `${(current / questions.length) * 100}%` }} />
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{current + 1} / {questions.length}</span>
        {timedMode && (
          <div style={{ width: 42, height: 42, borderRadius: '50%', border: `3px solid ${timeLeft <= 10 ? 'var(--danger)' : 'var(--accent)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: timeLeft <= 10 ? 'var(--danger)' : 'var(--accent)', flexShrink: 0 }}>
            {timeLeft}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
          <span className="badge badge-purple">Q{current + 1}</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.4 }}>
            {questions[current].q}
          </h3>
        </div>
        <div>
          {questions[current].options.map((opt, i) => (
            <div key={i} className={`quiz-option ${selected === i ? 'selected' : ''}`} onClick={() => setSelected(i)}
              style={{ padding: '0.875rem 1rem', borderRadius: '10px', border: `1.5px solid ${selected === i ? 'var(--accent)' : 'var(--border)'}`, background: selected === i ? 'rgba(108,99,255,0.12)' : 'var(--bg-elevated)', cursor: 'pointer', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.15s' }}>
              <span style={{ fontWeight: 700, color: selected === i ? 'var(--accent)' : 'var(--text-dim)', minWidth: 20 }}>{String.fromCharCode(65 + i)}.</span>
              <span style={{ fontSize: '0.9rem' }}>{opt}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" checked={timedMode} onChange={e => setTimedMode(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
            Timed mode
          </label>
          <button className="btn btn-primary" disabled={selected === null} onClick={handleNext} style={{ opacity: selected === null ? 0.5 : 1 }}>
            {current + 1 === questions.length ? 'Finish Quiz' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Result ──
  if (quizState === 'result') return (
    <div className="animate-in" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📖'}</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good Job!' : 'Keep Practicing!'}
        </h3>
        <div style={{ fontSize: '3.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)', margin: '1rem 0' }}>
          {pct}%
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {score} / {questions.length} correct — {selectedQuiz.title}
          <span style={{ color: 'var(--success)', display: 'block', fontSize: '0.8rem', marginTop: '0.4rem' }}>✅ Result saved!</span>
        </p>
        <div className="progress-bar" style={{ height: 10, marginBottom: '1.5rem' }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)' }} />
        </div>
      </div>

      <div className="card" style={{ textAlign: 'left', marginBottom: '1rem' }}>
        <div className="section-title">Answer Review</div>
        {questions.map((q, i) => (
          <div key={i} style={{ padding: '0.75rem 0', borderBottom: i < questions.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>Q{i + 1}. {q.q}</p>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
              <span style={{ color: answers[i]?.correct ? 'var(--success)' : 'var(--danger)' }}>
                {answers[i]?.correct ? '✅' : '❌'} Your answer: {q.options[answers[i]?.selected] ?? 'Skipped'}
              </span>
              {!answers[i]?.correct && <span style={{ color: 'var(--success)' }}>✓ Correct: {q.options[q.answer]}</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={() => setQuizState('list')}>← Back to Quizzes</button>
        <button className="btn btn-primary" onClick={() => startQuiz(selectedQuiz)}>🔄 Retry</button>
      </div>
    </div>
  );

  return null;
}