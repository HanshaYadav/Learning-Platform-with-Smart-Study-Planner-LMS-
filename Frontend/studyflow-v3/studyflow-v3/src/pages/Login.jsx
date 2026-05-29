import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login({ onShowHome, defaultTab = 'login' }) {
  const { login, register } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [tab, setTab] = useState(defaultTab);
  const [regData, setRegData] = useState({ name: '', email: '', password: '' });
  const [regMsg, setRegMsg] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email.trim()) {
      setError('❌ Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('❌ Please enter your password.');
      return;
    }

    setLoginLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        setError('❌ Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('❌ Something went wrong. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegMsg('');

    // Validation
    if (!regData.name.trim()) {
      setRegMsg('❌ Please enter your full name.');
      return;
    }
    if (!regData.email.trim()) {
      setRegMsg('❌ Please enter your email address.');
      return;
    }
    if (regData.password.length < 6) {
      setRegMsg('❌ Password must be at least 6 characters.');
      return;
    }

    setRegLoading(true);
    try {
      const result = await register(regData);
      if (result.ok) {
        setRegMsg('✅ Account created! Redirecting to login…');
        setEmail(regData.email);
        setPassword(regData.password);
        setTimeout(() => { setRegMsg(''); setTab('login'); }, 1800);
      } else {
        setRegMsg(`❌ ${result.msg || 'Registration failed. Please try again.'}`);
      }
    } catch (err) {
      setRegMsg('❌ Something went wrong. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, #6c63ff, #43e8c6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>
            StudyFlow
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Smart Learning Platform</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '3px', marginBottom: '1.5rem' }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setRegMsg(''); }} style={{
              flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: tab === t ? 'var(--bg-card)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500,
              transition: 'all 0.2s', textTransform: 'capitalize'
            }}>{t}</button>
          ))}
        </div>

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                style={{ borderColor: error ? 'var(--danger)' : '' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  style={{ paddingRight: '2.5rem', borderColor: error ? 'var(--danger)' : '' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: '#ff6584', fontSize: '0.82rem', marginBottom: '1rem',
                padding: '0.65rem 0.875rem',
                background: 'rgba(255,101,132,0.1)',
                border: '1px solid rgba(255,101,132,0.3)',
                borderRadius: '8px',
                animation: 'shake 0.3s ease'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              disabled={loginLoading}
            >
              {loginLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

        ) : (
          /* Register Form */
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                className="form-input"
                value={regData.name}
                onChange={e => { setRegData({ ...regData, name: e.target.value }); setRegMsg(''); }}
                placeholder="Your full name"
                style={{ borderColor: regMsg.startsWith('❌') && !regData.name ? 'var(--danger)' : '' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                value={regData.email}
                onChange={e => { setRegData({ ...regData, email: e.target.value }); setRegMsg(''); }}
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={regData.password}
                onChange={e => { setRegData({ ...regData, password: e.target.value }); setRegMsg(''); }}
                placeholder="Min 6 characters"
                minLength={6}
              />
            </div>

            {/* Register Message */}
            {regMsg && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: regMsg.startsWith('✅') ? '#43e8c6' : '#ff6584',
                fontSize: '0.82rem', marginBottom: '1rem',
                padding: '0.65rem 0.875rem',
                background: regMsg.startsWith('✅') ? 'rgba(67,232,198,0.1)' : 'rgba(255,101,132,0.1)',
                border: `1px solid ${regMsg.startsWith('✅') ? 'rgba(67,232,198,0.3)' : 'rgba(255,101,132,0.3)'}`,
                borderRadius: '8px',
              }}>
                {regMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              disabled={regLoading}
            >
              {regLoading ? 'Creating…' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button
            onClick={onShowHome}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              fontSize: '0.85rem', fontFamily: 'var(--font-body)',
              display: 'inline-flex', alignItems: 'center',
              gap: '0.4rem', padding: '0.4rem 0.75rem',
              borderRadius: '8px', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}