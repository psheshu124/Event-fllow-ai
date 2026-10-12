import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const STUDENT_NAV = [
  { id: 'student-dashboard', icon: 'school', label: 'Student Dashboard' },
  { id: 'ai-assistant', icon: 'smart_toy', label: 'AI Assistant' },
  { id: 'my-events', icon: 'qr_code', label: 'My Events & QR' },
  { id: 'reminders', icon: 'schedule', label: 'Reminders' },
  { id: 'feedback', icon: 'rate_review', label: 'Submit Feedback' },
  { id: 'certificates', icon: 'card_membership', label: 'Certificates' },
];

const VOLUNTEER_NAV = [
  { id: 'volunteer-dashboard', icon: 'volunteer_activism', label: 'Dashboard' },
  { id: 'create-event', icon: 'add_circle', label: 'Create Event' },
  { id: 'qr-attendance', icon: 'qr_code_scanner', label: 'QR Attendance' },
  { id: 'reminders', icon: 'schedule', label: 'Reminders & Automation' },
  { id: 'feedback-analytics', icon: 'analytics', label: 'Feedback Analytics' },
  { id: 'certificates', icon: 'card_membership', label: 'Certificates' },
  { id: 'post-event-report', icon: 'description', label: 'Post-Event Report' },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { state, setRole } = useApp();
  const { user, signOut } = useAuth();
  const isStudent = state.role === 'student';
  const navItems = isStudent ? STUDENT_NAV : VOLUNTEER_NAV;

  const displayName = user?.displayName || (isStudent ? state.currentStudentName : 'Volunteer User');
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--primary)', fontSize: 22 }}>event_available</span>
        <span>EventFlow AI</span>
      </div>

      {/* Verified Role Badge */}
      <div style={{ padding: '0 var(--space-lg)', marginBottom: 'var(--space-md)' }}>
        <div
          style={{
            background: isStudent ? 'var(--primary-fixed)' : 'var(--secondary-fixed)',
            color: isStudent ? 'var(--on-primary-fixed)' : 'var(--on-secondary-fixed)',
            borderRadius: 'var(--radius-lg)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {isStudent ? 'school' : 'volunteer_activism'}
            </span>
            <span>{isStudent ? 'Student Account' : 'Volunteer Portal'}</span>
          </div>
          <span
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              opacity: 0.85,
            }}
          >
            Verified
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">{isStudent ? 'Student Space' : 'Volunteer Space'}</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item${currentPage === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className={`material-symbols-outlined nav-icon${currentPage === item.id ? ' icon-filled' : ''}`}>
              {item.icon}
            </span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom user info & Sign Out */}
      <div style={{ padding: 'var(--space-md) var(--space-lg)', borderTop: '1px solid var(--outline-variant)' }}>
        <div className="flex items-center gap-sm" style={{ marginBottom: 8 }}>
          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
            {userInitials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="truncate" style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface)' }} title={displayName}>
              {displayName}
            </div>
            <div className="truncate" style={{ fontSize: 11, color: 'var(--outline)' }} title={user?.email || ''}>
              {user?.email || (isStudent ? 'student@university.edu' : 'volunteer@university.edu')}
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="btn btn-surface btn-sm"
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: 11,
            padding: '6px 12px',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--error)',
          }}
          title="Sign out of EventFlow"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

