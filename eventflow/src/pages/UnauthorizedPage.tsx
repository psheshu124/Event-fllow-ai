import React from 'react';

interface UnauthorizedPageProps {
  requestedPage: string;
  onGoBack: () => void;
}

export default function UnauthorizedPage({ requestedPage, onGoBack }: UnauthorizedPageProps) {
  const formatPageName = (page: string) => {
    return page
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div
      className="fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: 'var(--space-xl)',
      }}
    >
      <div
        className="card card-3xl"
        style={{
          maxWidth: 520,
          textAlign: 'center',
          padding: 'var(--space-xl) var(--space-xl)',
          background: 'var(--surface-container-lowest)',
          border: '1px solid var(--outline-variant)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Shield Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-full)',
            background: 'var(--error-container)',
            color: 'var(--on-error-container)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-md)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--error)' }}>
            gpp_bad
          </span>
        </div>

        <div className="badge badge-error" style={{ marginBottom: 'var(--space-sm)' }}>
          Access Denied • HTTP 403
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--on-surface)',
            marginBottom: 'var(--space-xs)',
            letterSpacing: '-0.02em',
          }}
        >
          Volunteer Authorization Required
        </h2>

        <p
          style={{
            fontSize: 14,
            color: 'var(--on-surface-variant)',
            lineHeight: 1.5,
            marginBottom: 'var(--space-md)',
          }}
        >
          The page <strong>"{formatPageName(requestedPage)}"</strong> is restricted to verified campus event coordinators and volunteers. Your authenticated account currently holds standard <strong>Student</strong> permissions.
        </p>

        <div
          style={{
            background: 'var(--surface-container)',
            borderRadius: 'var(--radius-xl)',
            padding: '12px 16px',
            fontSize: 12,
            color: 'var(--outline)',
            textAlign: 'left',
            marginBottom: 'var(--space-xl)',
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--on-surface)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>
              security
            </span>
            Security Policy Enforcement
          </div>
          Students cannot view volunteer operations, access live attendee QR check-ins, or publish events. If you are an authorized coordinator, request a role promotion from your faculty administrator.
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={onGoBack}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            arrow_back
          </span>
          Return to Student Discovery
        </button>
      </div>
    </div>
  );
}
