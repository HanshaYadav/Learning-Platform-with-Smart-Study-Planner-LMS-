import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function HomePage({ onGetStarted, onSignIn }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    { icon: '📚', title: 'Smart Courses', desc: 'Access all your enrolled courses with real-time progress tracking' },
    { icon: '📋', title: 'Study Planner', desc: 'Organize tasks assigned by your teacher and manage your schedule' },
    { icon: '✏️', title: 'Quiz & Tests', desc: 'Attempt quizzes created by admin and track your performance' },
    { icon: '📄', title: 'Study Notes', desc: 'Download and view study materials shared by your teachers' },
    { icon: '📊', title: 'Progress Analytics', desc: 'Visualize your learning journey with detailed performance charts' },
    { icon: '🛡️', title: 'Admin Control', desc: 'Full dashboard for teachers to manage students, tasks and quizzes' },
  ];

  const stats = [
    { val: '500+', label: 'Students' },
    { val: '50+', label: 'Courses' },
    { val: '1000+', label: 'Quizzes' },
    { val: '98%', label: 'Satisfaction' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 3rem', background: 'rgba(13,13,20,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #6c63ff, #43e8c6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🎓</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg, #6c63ff, #43e8c6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>StudyFlow</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onGetStarted} style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}>Login</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '6rem 2rem 4rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(67,232,198,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '99px', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', color: '#a89dff', fontSize: '0.8rem', fontWeight: 500, marginBottom: '1.5rem' }}>
          🚀 Smart Learning Platform
        </div>

        <h5 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: 800, margin: '0 auto 1.5rem' }}>
          Learn Smarter,{' '}
          <span style={{ background: 'linear-gradient(135deg, #6c63ff, #43e8c6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Achieve More
          </span>
        </h5>

        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          StudyFlow is your all-in-one platform for managing courses, tasks, quizzes and progress — built for students and teachers.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onGetStarted} style={{ padding: '0.875rem 2.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6c63ff, #8b82ff)', color: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-body)', boxShadow: '0 8px 32px rgba(108,99,255,0.35)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.target.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform='translateY(0)'}>
            🚀 Get Started Free
          </button>
         <button onClick={onSignIn} style={{ padding: '0.875rem 2rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer', fontSize: '1rem', fontFamily: 'var(--font-body)' }}>
  Sign In →
</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '4rem', flexWrap: 'wrap' }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, #6c63ff, #43e8c6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.val}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Everything You Need</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>Powerful tools for students and teachers in one place</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {features.map((f, i) => (
            <div key={i}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{ padding: '1.75rem', borderRadius: '16px', background: hoveredFeature === i ? 'var(--bg-card)' : 'var(--bg-elevated)', border: `1px solid ${hoveredFeature === i ? 'rgba(108,99,255,0.4)' : 'var(--border)'}`, cursor: 'default', transition: 'all 0.2s', transform: hoveredFeature === i ? 'translateY(-4px)' : 'none', boxShadow: hoveredFeature === i ? '0 12px 40px rgba(108,99,255,0.15)' : 'none' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(67,232,198,0.08))', border: '1px solid rgba(108,99,255,0.25)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎓</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to Start Learning?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>Join thousands of students already using StudyFlow to achieve their academic goals.</p>
          <button onClick={onGetStarted} style={{ padding: '0.875rem 2.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6c63ff, #43e8c6)', color: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
            Start Learning Today →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        © 2026 StudyFlow — Smart Learning Platform
      </footer>
    </div>
  );
}