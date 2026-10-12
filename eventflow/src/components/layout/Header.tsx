import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  title: string;
  onNavigate: (page: string) => void;
}

export default function Header({ title, onNavigate }: HeaderProps) {
  const { state, dispatch, resetDemo } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <header className="header">
      <div className="header-title">{title}</div>

      <div className="header-actions">
        {/* Reset Demo Button */}
        <button
          className="btn btn-surface btn-sm"
          onClick={() => {
            if (confirm('Reset all demo data to the initial state?')) resetDemo();
          }}
          title="Reset demo data"
          style={{ fontSize: 11, padding: '5px 12px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>restart_alt</span>
          Reset Demo
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="header-icon-btn" onClick={() => setShowNotifs(v => !v)}>
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && <span className="notif-badge" />}
          </button>

          {showNotifs && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 55 }}
                onClick={() => setShowNotifs(false)}
              />
              <div className="notif-panel">
                <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      style={{ fontSize: 11, color: 'var(--primary)', cursor: 'pointer', background: 'none', border: 'none' }}
                      onClick={() => {
                        state.notifications.forEach(n => {
                          if (!n.read) dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id });
                        });
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                {state.notifications.length === 0 ? (
                  <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--outline)' }}>
                    No notifications yet
                  </div>
                ) : (
                  state.notifications.slice(0, 10).map(n => (
                    <div
                      key={n.id}
                      className={`notif-item${!n.read ? ' unread' : ''}`}
                      onClick={() => {
                        dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id });
                        if (n.eventId) setShowNotifs(false);
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 18,
                          color: n.type === 'success' ? '#28A745' : n.type === 'warning' ? '#FFC107' : n.type === 'error' ? 'var(--error)' : 'var(--primary)',
                          marginTop: 2
                        }}
                      >
                        {n.type === 'success' ? 'check_circle' : n.type === 'warning' ? 'warning' : n.type === 'error' ? 'error' : 'info'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface)' }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2 }}>{n.message}</div>
                        <div style={{ fontSize: 10, color: 'var(--outline)', marginTop: 3 }}>
                          {new Date(n.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {!n.read && <div className="notif-dot" />}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Avatar */}
        <div className="avatar">
          {state.currentStudentName.split(' ').map(n => n[0]).join('')}
        </div>
      </div>
    </header>
  );
}
