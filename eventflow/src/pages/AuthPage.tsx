import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export default function AuthPage() {
  const { signIn, signUp, error, clearError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localValidation, setLocalValidation] = useState<string | null>(null);

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    clearError();
    setLocalValidation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidation(null);
    clearError();

    if (!email.trim() || !password) {
      setLocalValidation('Please fill in both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setLocalValidation('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setLocalValidation('Password must be at least 6 characters long.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch {
      // Error handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const activeError = localValidation || error;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-lg)',
      }}
    >
      <div
        className="card card-3xl"
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--surface-container-lowest)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-xl)',
          border: '1px solid var(--outline-variant)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--primary-fixed)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-sm)',
            }}
          >
            <span
              className="material-symbols-outlined icon-filled"
              style={{ color: 'var(--primary)', fontSize: 30 }}
            >
              event_available
            </span>
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--on-surface)',
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}
          >
            EventFlow AI
          </h1>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
            College Event Management & Intelligent Operations
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--surface-container)',
            borderRadius: 'var(--radius-lg)',
            padding: 4,
            marginBottom: 'var(--space-lg)',
            gap: 4,
          }}
        >
          <button
            type="button"
            className={`role-btn${mode === 'signin' ? ' active' : ''}`}
            style={{ flex: 1, padding: '8px 0', fontSize: 13 }}
            onClick={() => switchMode('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`role-btn${mode === 'signup' ? ' active' : ''}`}
            style={{ flex: 1, padding: '8px 0', fontSize: 13 }}
            onClick={() => switchMode('signup')}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div
            style={{
              background: 'var(--error-container)',
              color: 'var(--on-error-container)',
              borderRadius: 'var(--radius-lg)',
              padding: '10px 14px',
              fontSize: 12,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-sm)',
              marginBottom: 'var(--space-md)',
              lineHeight: 1.4,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, color: 'var(--error)', flexShrink: 0 }}
            >
              error
            </span>
            <div style={{ flex: 1 }}>{activeError}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                className="form-input"
                placeholder="e.g. Alex Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="e.g. alex.chen@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {/* Role Policy Notice */}
          {mode === 'signup' && (
            <div
              style={{
                background: 'var(--surface-container)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                fontSize: 12,
                color: 'var(--on-surface-variant)',
                lineHeight: 1.4,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)', flexShrink: 0 }}>
                verified_user
              </span>
              <div>
                All new accounts receive <strong>Student</strong> access by default. Volunteer permissions are granted via authorized coordinator promotion.
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
            style={{
              width: '100%',
              marginTop: 'var(--space-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-sm)',
            }}
          >
            {submitting ? (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{
                    animation: 'spin 1s linear infinite',
                    fontSize: 18,
                  }}
                >
                  progress_activity
                </span>
                <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {mode === 'signin' ? 'login' : 'person_add'}
                </span>
                <span>{mode === 'signin' ? 'Sign In to EventFlow' : 'Register Account'}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
          <span style={{ fontSize: 12, color: 'var(--outline)' }}>
            Secured by Firebase Authentication
          </span>
        </div>
      </div>
    </div>
  );
}
