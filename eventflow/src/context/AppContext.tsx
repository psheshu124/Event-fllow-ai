import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, Event, Registration, Feedback, Certificate, AutomationLog, Notification, ChatMessage, UserRole } from '../types';
import { createSeedState } from '../data/seed';
import { loadState, saveState, clearState } from '../data/storage';

// =====================================================
// Action Types
// =====================================================
type Action =
  | { type: 'SET_ROLE'; role: UserRole }
  | { type: 'ADD_EVENT'; event: Event }
  | { type: 'UPDATE_EVENT'; event: Event }
  | { type: 'ADD_REGISTRATION'; registration: Registration }
  | { type: 'UPDATE_REGISTRATION'; registration: Registration }
  | { type: 'ADD_FEEDBACK'; feedback: Feedback }
  | { type: 'ADD_CERTIFICATE'; certificate: Certificate }
  | { type: 'ADD_AUTOMATION_LOG'; log: AutomationLog }
  | { type: 'ADD_NOTIFICATION'; notification: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'ADD_CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'CLEAR_CHAT' }
  | { type: 'RESET_DEMO' }
  | { type: 'SET_USER_INFO'; id: string; name: string };

// =====================================================
// Reducer
// =====================================================
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role };

    case 'ADD_EVENT':
      return {
        ...state,
        events: [action.event, ...state.events],
      };

    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(e => e.id === action.event.id ? action.event : e),
      };

    case 'ADD_REGISTRATION': {
      const reg = action.registration;
      const updatedEvents = state.events.map(e => {
        if (e.id === reg.eventId) {
          return { ...e, registeredCount: e.registeredCount + 1 };
        }
        return e;
      });
      return {
        ...state,
        registrations: [...state.registrations, reg],
        events: updatedEvents,
      };
    }

    case 'UPDATE_REGISTRATION': {
      const reg = action.registration;
      const oldReg = state.registrations.find(r => r.id === reg.id);
      let updatedEvents = state.events;

      // If marking attended, update attendedCount
      if (reg.status === 'attended' && oldReg?.status !== 'attended') {
        updatedEvents = state.events.map(e => {
          if (e.id === reg.eventId) {
            return { ...e, attendedCount: e.attendedCount + 1 };
          }
          return e;
        });
      }

      return {
        ...state,
        registrations: state.registrations.map(r => r.id === reg.id ? reg : r),
        events: updatedEvents,
      };
    }

    case 'ADD_FEEDBACK':
      return { ...state, feedback: [...state.feedback, action.feedback] };

    case 'ADD_CERTIFICATE':
      return { ...state, certificates: [...state.certificates, action.certificate] };

    case 'ADD_AUTOMATION_LOG':
      return { ...state, automationLogs: [action.log, ...state.automationLogs] };

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications] };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      };

    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.message] };

    case 'CLEAR_CHAT':
      return { ...state, chatHistory: [] };

    case 'RESET_DEMO':
      return createSeedState();

    case 'SET_USER_INFO':
      return {
        ...state,
        currentStudentId: action.id,
        currentStudentName: action.name,
      };

    default:
      return state;
  }
}

// =====================================================
// Context
// =====================================================
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Convenience helpers
  setRole: (role: UserRole) => void;
  registerForEvent: (eventId: string) => { success: boolean; message: string };
  checkIn: (token: string, eventId: string) => { success: boolean; message: string };
  endEvent: (eventId: string) => void;
  submitFeedback: (eventId: string, rating: number, comment: string) => { success: boolean; message: string };
  createEvent: (eventData: Omit<Event, 'id' | 'registeredCount' | 'attendedCount' | 'status' | 'isSeedData' | 'createdAt'>) => Event;
  publishEvent: (eventId: string) => void;
  resetDemo: () => void;
  setUserInfo: (id: string, name: string) => void;
  addLog: (log: Omit<AutomationLog, 'id' | 'timestamp'>) => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const initial = loadState() ?? createSeedState();
  const [state, dispatch] = useReducer(reducer, initial);

  // Persist state on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ---- Helpers ----

  const setRole = useCallback((role: UserRole) => {
    dispatch({ type: 'SET_ROLE', role });
  }, []);

  const addLog = useCallback((log: Omit<AutomationLog, 'id' | 'timestamp'>) => {
    dispatch({
      type: 'ADD_AUTOMATION_LOG',
      log: {
        ...log,
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    });
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        ...n,
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
      },
    });
  }, []);

  const registerForEvent = useCallback((eventId: string): { success: boolean; message: string } => {
    const s = state;
    const event = s.events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Event not found.' };
    if (event.status !== 'published') return { success: false, message: 'Registration is not open for this event.' };

    const deadline = new Date(event.registrationDeadline);
    if (new Date() > deadline) return { success: false, message: `Registration deadline was ${deadline.toLocaleDateString()}.` };

    const seatsLeft = event.capacity - event.registeredCount;
    if (seatsLeft <= 0) return { success: false, message: 'This event is at full capacity.' };

    const alreadyRegistered = s.registrations.some(
      r => r.eventId === eventId && r.studentId === s.currentStudentId && r.status !== 'cancelled'
    );
    if (alreadyRegistered) return { success: false, message: "You're already registered for this event!" };

    const token = `${event.title.slice(0, 4).toUpperCase().replace(/\s/g, '')}-${Date.now().toString(16).toUpperCase().slice(-6)}`;

    const reg: Registration = {
      id: `reg-${Date.now()}`,
      eventId,
      studentId: s.currentStudentId,
      studentName: s.currentStudentName,
      studentEmail: `${s.currentStudentName.toLowerCase().replace(/\s/g, '.')}@university.edu`,
      status: 'registered',
      passToken: token,
      registeredAt: new Date().toISOString(),
      isSeedData: false,
    };

    dispatch({ type: 'ADD_REGISTRATION', registration: reg });

    addLog({
      eventId,
      eventTitle: event.title,
      action: 'Registration Confirmed',
      detail: `${s.currentStudentName} (ID: ${s.currentStudentId}) registered for ${event.title}. Pass token: ${token}`,
      status: 'success',
      icon: 'verified',
      color: 'primary',
    });

    addLog({
      eventId,
      eventTitle: event.title,
      action: 'Pass Generated',
      detail: `QR pass generated for ${s.currentStudentName}. Token: ${token}`,
      status: 'success',
      icon: 'qr_code',
      color: 'secondary',
    });

    addLog({
      eventId,
      eventTitle: event.title,
      action: 'Reminder Scheduled',
      detail: `Simulated reminder notification scheduled 24h before ${event.title} for ${s.currentStudentName}.`,
      status: 'success',
      icon: 'schedule',
      color: 'tertiary',
    });

    addNotification({
      title: `Registered: ${event.title}`,
      message: `You've successfully registered! Your pass token is ${token}. View it in My Events.`,
      type: 'success',
      eventId,
    });

    // Capacity warning if near full
    const newSeatsLeft = seatsLeft - 1;
    if (newSeatsLeft <= 10 && newSeatsLeft > 0) {
      addLog({
        eventId,
        eventTitle: event.title,
        action: 'Capacity Alert',
        detail: `${event.title} is nearly full! Only ${newSeatsLeft} seat(s) remaining.`,
        status: 'success',
        icon: 'warning',
        color: 'error',
      });
    }

    return { success: true, message: `Successfully registered! Your pass token is ${token}.` };
  }, [state, addLog, addNotification]);

  const checkIn = useCallback((token: string, eventId: string): { success: boolean; message: string } => {
    if (state.role !== 'volunteer' && state.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Volunteer authorization required for attendee check-in.' };
    }
    const s = state;
    const reg = s.registrations.find(r => r.passToken === token && r.eventId === eventId);
    if (!reg) return { success: false, message: 'Invalid token or event. Check-in failed.' };
    if (reg.status === 'attended') return { success: false, message: `${reg.studentName} has already been checked in.` };
    if (reg.status === 'cancelled') return { success: false, message: 'This registration has been cancelled.' };

    const event = s.events.find(e => e.id === eventId);
    const updatedReg: Registration = { ...reg, status: 'attended', checkedInAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_REGISTRATION', registration: updatedReg });

    addLog({
      eventId,
      eventTitle: event?.title,
      action: 'Check-in Confirmed',
      detail: `${reg.studentName} checked in for ${event?.title ?? 'event'}. Token: ${token}`,
      status: 'success',
      icon: 'how_to_reg',
      color: 'primary',
    });

    return { success: true, message: `${reg.studentName} checked in successfully!` };
  }, [state, addLog]);

  const endEvent = useCallback((eventId: string) => {
    if (state.role !== 'volunteer' && state.role !== 'admin') {
      console.warn('[RBAC] Unauthorized: Only volunteers can end events.');
      return;
    }
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;

    const updatedEvent: Event = { ...event, status: 'completed', endedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_EVENT', event: updatedEvent });

    addLog({
      eventId,
      eventTitle: event.title,
      action: 'Event Ended',
      detail: `${event.title} has been marked as completed. Feedback requests queued.`,
      status: 'success',
      icon: 'flag',
      color: 'primary',
    });

    addLog({
      eventId,
      eventTitle: event.title,
      action: 'Feedback Requests Sent',
      detail: `Simulated: Feedback request notifications sent to ${event.attendedCount} attendees for ${event.title}.`,
      status: 'success',
      icon: 'rate_review',
      color: 'secondary',
    });

    addNotification({
      title: `Event Ended: ${event.title}`,
      message: `${event.title} has concluded. Please submit your feedback to earn your certificate.`,
      type: 'info',
      eventId,
    });
  }, [state, addLog, addNotification]);

  const submitFeedback = useCallback((eventId: string, rating: number, comment: string): { success: boolean; message: string } => {
    const s = state;
    const event = s.events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Event not found.' };

    const reg = s.registrations.find(r => r.eventId === eventId && r.studentId === s.currentStudentId);
    if (!reg) return { success: false, message: 'You are not registered for this event.' };
    if (reg.status !== 'attended') return { success: false, message: 'You can only submit feedback after attending the event.' };

    const alreadySubmitted = s.feedback.some(f => f.eventId === eventId && f.studentId === s.currentStudentId);
    if (alreadySubmitted) return { success: false, message: 'You have already submitted feedback for this event.' };

    // Simple sentiment analysis
    const positiveWords = ['amazing', 'great', 'excellent', 'outstanding', 'loved', 'fantastic', 'best', 'helpful', 'wonderful', 'awesome', 'good', 'enjoyed'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'disappointing', 'boring', 'issues', 'problems', 'failed', 'waste'];
    const lower = comment.toLowerCase();
    const posCount = positiveWords.filter(w => lower.includes(w)).length;
    const negCount = negativeWords.filter(w => lower.includes(w)).length;
    const sentiment: Feedback['sentiment'] = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' :
      posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral';

    // Theme detection
    const themeMap: Record<string, string[]> = {
      speakers: ['speaker', 'presenter', 'keynote', 'mentor'],
      organization: ['organized', 'organization', 'smooth', 'well-run', 'punctual'],
      content: ['content', 'material', 'curriculum', 'topic', 'subject'],
      networking: ['network', 'connect', 'meet', 'community'],
      venue: ['venue', 'location', 'hall', 'room', 'space'],
      learning: ['learned', 'learning', 'knowledge', 'skill', 'insight'],
    };
    const themes = Object.entries(themeMap)
      .filter(([, keywords]) => keywords.some(k => lower.includes(k)))
      .map(([theme]) => theme);

    const fb: Feedback = {
      id: `fb-${Date.now()}`,
      eventId,
      studentId: s.currentStudentId,
      studentName: s.currentStudentName,
      rating,
      comment,
      submittedAt: new Date().toISOString(),
      sentiment,
      themes,
      isSeedData: false,
    };

    dispatch({ type: 'ADD_FEEDBACK', feedback: fb });

    addLog({
      eventId,
      eventTitle: event.title,
      action: 'Feedback Submitted',
      detail: `${s.currentStudentName} submitted ${rating}/5 feedback for ${event.title}. Sentiment: ${sentiment}.`,
      status: 'success',
      icon: 'rate_review',
      color: 'primary',
    });

    // Check certificate eligibility
    const hasExistingCert = s.certificates.some(c => c.eventId === eventId && c.studentId === s.currentStudentId);
    if (!hasExistingCert && event.status === 'completed') {
      const certNum = `CERT-${event.title.slice(0, 3).toUpperCase()}-2026-${Date.now().toString().slice(-6)}`;
      const cert: Certificate = {
        id: `cert-${Date.now()}`,
        eventId,
        eventTitle: event.title,
        studentId: s.currentStudentId,
        studentName: s.currentStudentName,
        issuedAt: new Date().toISOString(),
        certificateNumber: certNum,
        isSeedData: false,
      };
      dispatch({ type: 'ADD_CERTIFICATE', certificate: cert });
      addLog({
        eventId,
        eventTitle: event.title,
        action: 'Certificate Issued',
        detail: `Certificate ${certNum} issued to ${s.currentStudentName} for ${event.title}.`,
        status: 'success',
        icon: 'card_membership',
        color: 'secondary',
      });
      addNotification({
        title: 'Certificate Available!',
        message: `Your certificate for ${event.title} is now available. Download it from the Certificates page.`,
        type: 'success',
        eventId,
      });
    }

    return { success: true, message: 'Thank you for your feedback! Your certificate eligibility has been evaluated.' };
  }, [state, addLog, addNotification]);

  const createEvent = useCallback((eventData: Omit<Event, 'id' | 'registeredCount' | 'attendedCount' | 'status' | 'isSeedData' | 'createdAt'>): Event => {
    if (state.role !== 'volunteer' && state.role !== 'admin') {
      throw new Error('Unauthorized: Only authorized volunteers can create new events.');
    }
    const event: Event = {
      ...eventData,
      id: `event-${Date.now()}`,
      registeredCount: 0,
      attendedCount: 0,
      status: 'draft',
      isSeedData: false,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_EVENT', event });
    return event;
  }, [state.role]);

  const publishEvent = useCallback((eventId: string) => {
    if (state.role !== 'volunteer' && state.role !== 'admin') {
      throw new Error('Unauthorized: Only authorized volunteers can publish events.');
    }
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;
    const updated: Event = { ...event, status: 'published' };
    dispatch({ type: 'UPDATE_EVENT', event: updated });

    addLog({
      eventId,
      eventTitle: event.title,
      action: 'Event Published',
      detail: `${event.title} has been published. Registration is now open. Capacity: ${event.capacity}.`,
      status: 'success',
      icon: 'publish',
      color: 'primary',
    });

    addNotification({
      title: `Event Published: ${event.title}`,
      message: `${event.title} is now live and accepting registrations.`,
      type: 'success',
      eventId,
    });
  }, [state, addLog, addNotification]);

  const resetDemo = useCallback(() => {
    clearState();
    dispatch({ type: 'RESET_DEMO' });
  }, []);

  const setUserInfo = useCallback((id: string, name: string) => {
    dispatch({ type: 'SET_USER_INFO', id, name });
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      setRole,
      registerForEvent,
      checkIn,
      endEvent,
      submitFeedback,
      createEvent,
      publishEvent,
      resetDemo,
      setUserInfo,
      addLog,
      addNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
