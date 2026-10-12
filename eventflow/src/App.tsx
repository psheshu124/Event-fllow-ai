import React, { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AuthPage from './pages/AuthPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Pages
import StudentDashboard from './pages/StudentDashboard';
import AIAssistant from './pages/AIAssistant';
import MyEventsQR from './pages/MyEventsQR';
import Reminders from './pages/Reminders';
import SubmitFeedback from './pages/SubmitFeedback';
import Certificates from './pages/Certificates';
import VolunteerDashboard from './pages/VolunteerDashboard';
import CreateEvent from './pages/CreateEvent';
import QRAttendance from './pages/QRAttendance';
import FeedbackAnalytics from './pages/FeedbackAnalytics';
import PostEventReport from './pages/PostEventReport';

// Define strict RBAC page permission sets
const VOLUNTEER_ONLY_PAGES = new Set([
  'volunteer-dashboard',
  'create-event',
  'qr-attendance',
  'feedback-analytics',
  'post-event-report',
  'admin',
]);

const ALL_VALID_PAGES = new Set([
  'student-dashboard',
  'ai-assistant',
  'my-events',
  'reminders',
  'feedback',
  'certificates',
  ...Array.from(VOLUNTEER_ONLY_PAGES),
]);

function MainApp() {
  const { state } = useApp();
  const { isVolunteer, userRole } = useAuth();

  // Helper to read current URL hash
  const getPageFromHash = useCallback((): string | null => {
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    return ALL_VALID_PAGES.has(hash) ? hash : null;
  }, []);

  // Initialize current page based on verified role or valid URL hash
  const [currentPage, setCurrentPageState] = useState<string>(() => {
    const hashPage = getPageFromHash();
    if (hashPage) return hashPage;
    return isVolunteer ? 'volunteer-dashboard' : 'student-dashboard';
  });

  // Safe navigation function that also syncs URL hash
  const navigate = useCallback((page: string) => {
    setCurrentPageState(page);
    window.location.hash = page;
  }, []);

  // Listen for browser navigation / manual URL hash changes (e.g. #create-event)
  useEffect(() => {
    const handleHashChange = () => {
      const page = getPageFromHash();
      if (page) {
        setCurrentPageState(page);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [getPageFromHash]);

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'student-dashboard':
        return 'Student Event Discovery';
      case 'ai-assistant':
        return 'Campus AI Assistant';
      case 'my-events':
        return 'My Registrations & QR Passes';
      case 'reminders':
        return isVolunteer ? 'Automation & Triggers Log' : 'Reminders & Notifications';
      case 'feedback':
        return 'Submit Post-Event Feedback';
      case 'certificates':
        return 'Digital Participation Certificates';
      case 'volunteer-dashboard':
        return 'Volunteer Operations Hub';
      case 'create-event':
        return 'AI-Assisted Event Builder';
      case 'qr-attendance':
        return 'Live Attendance QR Scanner';
      case 'feedback-analytics':
        return 'Feedback Sentiment & Intelligence';
      case 'post-event-report':
        return 'Post-Event AI Synthesis';
      default:
        return 'EventFlow AI';
    }
  };

  /**
   * Protected Route Dispatcher
   * Enforces that student accounts CANNOT access volunteer/admin dashboards.
   */
  const renderProtectedPage = () => {
    // 1. Check if the page is volunteer-only
    if (VOLUNTEER_ONLY_PAGES.has(currentPage)) {
      if (!isVolunteer) {
        // Enforce RBAC Denial
        return (
          <UnauthorizedPage
            requestedPage={currentPage}
            onGoBack={() => navigate('student-dashboard')}
          />
        );
      }
    }

    // 2. Render authorized view
    switch (currentPage) {
      case 'student-dashboard':
        return <StudentDashboard onNavigate={navigate} />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'my-events':
        return <MyEventsQR onNavigate={navigate} />;
      case 'reminders':
        return <Reminders />;
      case 'feedback':
        return <SubmitFeedback />;
      case 'certificates':
        return <Certificates />;
      case 'volunteer-dashboard':
        return <VolunteerDashboard onNavigate={navigate} />;
      case 'create-event':
        return <CreateEvent onNavigate={navigate} />;
      case 'qr-attendance':
        return <QRAttendance />;
      case 'feedback-analytics':
        return <FeedbackAnalytics />;
      case 'post-event-report':
        return <PostEventReport />;
      default:
        return <StudentDashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar with role-filtered navigation */}
      <Sidebar currentPage={currentPage} onNavigate={navigate} />

      {/* Main Content Area */}
      <div className="main-content">
        <Header title={getPageTitle(currentPage)} onNavigate={navigate} />
        <main className="page">
          {renderProtectedPage()}
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, userRole, loading } = useAuth();
  const { state, setRole, setUserInfo } = useApp();

  useEffect(() => {
    if (user) {
      if (userRole && userRole !== state.role) {
        setRole(userRole);
      }
      const displayName = user.displayName || user.email?.split('@')[0] || 'User';
      setUserInfo(user.uid, displayName);
    }
  }, [user, userRole, setRole, setUserInfo, state.role]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface)',
          gap: 'var(--space-md)',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-xl)',
            background: 'var(--primary-fixed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--primary)', fontSize: 26 }}>
            event_available
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--outline)', fontSize: 13 }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: 16 }}>
            progress_activity
          </span>
          <span>Verifying role permissions...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <MainApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}
