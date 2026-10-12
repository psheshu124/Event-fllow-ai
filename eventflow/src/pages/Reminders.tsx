import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const ICON_COLOR_MAP: Record<string, { bg: string; color: string }> = {
  primary: { bg: 'var(--primary-fixed)', color: 'var(--primary)' },
  secondary: { bg: 'var(--secondary-fixed)', color: 'var(--secondary)' },
  tertiary: { bg: 'var(--tertiary-fixed)', color: 'var(--tertiary)' },
  error: { bg: 'var(--error-container)', color: 'var(--error)' },
};

export default function Reminders() {
  const { state } = useApp();

  const myRegistrations = useMemo(() => {
    return state.registrations
      .filter(r => r.studentId === state.currentStudentId && r.status !== 'cancelled')
      .map(r => ({ reg: r, event: state.events.find(e => e.id === r.eventId) }))
      .filter(({ event }) => !!event)
      .sort((a, b) => new Date(a.event!.date).getTime() - new Date(b.event!.date).getTime());
  }, [state.registrations, state.events, state.currentStudentId]);

  const myEventIds = new Set(myRegistrations.map(({ event }) => event!.id));

  // Filter logs relevant to the student's events
  const relevantLogs = state.automationLogs.filter(
    l => !l.eventId || myEventIds.has(l.eventId)
  );

  const myNotifications = state.notifications;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-label">Notifications</div>
        <h1 className="page-title">Reminders & Notifications</h1>
        <p className="page-subtitle">Your event reminders, confirmations, and activity updates.</p>
      </div>

      <div className="demo-banner">
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
        <span>Reminders are simulated prototype notifications. Real delivery (WhatsApp/Email/SMS) would require a messaging integration.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        {/* Notifications */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 'var(--space-md)' }}>
            Your Notifications ({myNotifications.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {myNotifications.length === 0 ? (
              <div className="card empty-state">
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--outline-variant)' }}>notifications_none</span>
                <div className="empty-state-title">No notifications yet</div>
              </div>
            ) : (
              myNotifications.map(n => (
                <div
                  key={n.id}
                  style={{
                    padding: 'var(--space-md) var(--space-lg)',
                    borderRadius: 'var(--radius-xl)',
                    background: n.read ? 'var(--surface-container-lowest)' : 'rgba(70,72,212,0.04)',
                    border: `1.5px solid ${n.read ? 'var(--outline-variant)' : 'var(--primary-fixed-dim)'}`,
                    display: 'flex',
                    gap: 'var(--space-md)',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    className="material-symbols-outlined icon-filled"
                    style={{
                      fontSize: 20,
                      color: n.type === 'success' ? '#28A745' : n.type === 'warning' ? '#FFC107' : n.type === 'error' ? 'var(--error)' : 'var(--primary)',
                      marginTop: 2,
                    }}
                  >
                    {n.type === 'success' ? 'check_circle' : n.type === 'warning' ? 'warning' : n.type === 'error' ? 'error' : 'notifications'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--on-surface)', marginBottom: 3 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--outline)', marginTop: 4 }}>{timeAgo(n.timestamp)}</div>
                  </div>
                  {!n.read && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 5, flexShrink: 0 }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 'var(--space-md)' }}>
            Activity Log ({relevantLogs.length})
          </h2>
          <div className="card" style={{ padding: 'var(--space-md)' }}>
            {relevantLogs.length === 0 ? (
              <div className="empty-state">
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--outline-variant)' }}>history</span>
                <div className="empty-state-title">No activity yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {relevantLogs.slice(0, 20).map(log => {
                  const colors = ICON_COLOR_MAP[log.color] ?? ICON_COLOR_MAP.primary;
                  return (
                    <div key={log.id} className="log-item">
                      <div className="log-icon" style={{ background: colors.bg, color: colors.color }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{log.icon}</span>
                      </div>
                      <div className="log-detail">
                        <div className="log-action">{log.action}</div>
                        <div className="log-desc">{log.eventTitle && <span className="fw-500" style={{ color: 'var(--primary)' }}>[{log.eventTitle}] </span>}{log.detail}</div>
                      </div>
                      <div className="log-time">{timeAgo(log.timestamp)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
