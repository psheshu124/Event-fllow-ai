// =====================================================
// EventFlow AI — Core Type Definitions
// =====================================================

export type UserRole = 'student' | 'volunteer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
export type EventCategory = 'Hackathon' | 'Workshop' | 'Bootcamp' | 'Seminar' | 'Cultural' | 'Sports' | 'Career' | 'Technology & AI';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory | string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  attendedCount: number;
  registrationDeadline: string;
  status: EventStatus;
  eligibility: string;
  imageUrl?: string;
  organizer: string;
  isSeedData: boolean;
  createdAt: string;
  endedAt?: string;
}

export type RegistrationStatus = 'registered' | 'confirmed' | 'attended' | 'cancelled';

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: RegistrationStatus;
  passToken: string;
  registeredAt: string;
  checkedInAt?: string;
  isSeedData: boolean;
}

export interface Feedback {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  submittedAt: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  themes?: string[];
  isSeedData: boolean;
}

export interface Certificate {
  id: string;
  eventId: string;
  eventTitle: string;
  studentId: string;
  studentName: string;
  issuedAt: string;
  certificateNumber: string;
  isSeedData: boolean;
}

export interface AutomationLog {
  id: string;
  eventId?: string;
  eventTitle?: string;
  action: string;
  detail: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  icon: string;
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  eventId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  eventCards?: EventCardData[];
}

export interface EventCardData {
  eventId: string;
  title: string;
  date: string;
  venue: string;
  seatsLeft: number;
  status: string;
}

export interface PostEventReport {
  eventId: string;
  totalRegistrations: number;
  totalAttended: number;
  attendanceRate: number;
  totalFeedback: number;
  averageRating: number;
  sentimentPositive: number;
  sentimentNeutral: number;
  sentimentNegative: number;
  topThemes: string[];
  certificatesIssued: number;
  generatedAt: string;
}

export interface AppState {
  role: UserRole;
  events: Event[];
  registrations: Registration[];
  feedback: Feedback[];
  certificates: Certificate[];
  automationLogs: AutomationLog[];
  notifications: Notification[];
  chatHistory: ChatMessage[];
  currentStudentId: string;
  currentStudentName: string;
}
