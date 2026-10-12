import { AppState, Event, Registration, Feedback, Certificate, AutomationLog, Notification } from '../types';

// =====================================================
// EventFlow AI — Seed Data
// =====================================================

export const CURRENT_STUDENT_ID = 'student-alex-84920';
export const CURRENT_STUDENT_NAME = 'Alex Chen';

export const SEED_EVENTS: Event[] = [
  {
    id: 'event-hackathon-001',
    title: 'AI Innovation Hackathon',
    description: 'Join the most exciting hackathon of the semester! Collaborate with top minds to build cutting-edge AI-powered applications. Teams of 2–4 will compete across tracks including Computer Vision, NLP, and Generative AI. Mentors from top tech companies will guide participants through 24 hours of intensive innovation. Prizes worth ₹2,00,000 await the winners!',
    category: 'Hackathon',
    date: '2026-10-15',
    time: '09:00',
    venue: 'Engineering Hall, Room 402',
    capacity: 150,
    registeredCount: 127,
    attendedCount: 112,
    registrationDeadline: '2026-10-13',
    status: 'published',
    eligibility: 'Computer Science Dept',
    organizer: 'Prof. Ramesh Kumar',
    isSeedData: true,
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'event-workshop-002',
    title: 'Generative AI Workshop',
    description: 'An intensive hands-on workshop exploring the frontiers of Generative AI. Participants will experiment with LLMs, diffusion models, and multi-modal AI systems. Led by industry experts from Google DeepMind and OpenAI research teams. Includes live demo sessions and take-home project kits.',
    category: 'Workshop',
    date: '2026-10-18',
    time: '14:00',
    venue: 'Science Complex, Lab B',
    capacity: 60,
    registeredCount: 52,
    attendedCount: 48,
    registrationDeadline: '2026-10-16',
    status: 'published',
    eligibility: 'All Students',
    organizer: 'Dr. Priya Sharma',
    isSeedData: true,
    createdAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'event-bootcamp-003',
    title: 'Web Development Bootcamp',
    description: 'A comprehensive 2-day bootcamp covering modern full-stack web development. Topics include React, TypeScript, Node.js, and cloud deployment on AWS. Perfect for students looking to launch their first web project or level up their skills. Certificate of completion provided.',
    category: 'Bootcamp',
    date: '2026-10-24',
    time: '10:00',
    venue: 'Student Union, Auditorium',
    capacity: 80,
    registeredCount: 58,
    attendedCount: 0,
    registrationDeadline: '2026-10-22',
    status: 'published',
    eligibility: 'All Students',
    organizer: 'Volunteer Tech Club',
    isSeedData: true,
    createdAt: '2026-10-03T10:00:00Z',
  },
];

function generateSeedRegistrations(): Registration[] {
  const regs: Registration[] = [];
  const names = [
    'Ravi Patel', 'Priya Singh', 'Arjun Kumar', 'Deepika Nair', 'Siddharth Menon',
    'Ananya Iyer', 'Karthik Reddy', 'Meera Krishnan', 'Aditya Gupta', 'Sneha Sharma',
    'Rohan Verma', 'Pooja Mehta', 'Vikram Rao', 'Kavya Pillai', 'Nikhil Joshi',
    'Divya Agarwal', 'Manish Choudhary', 'Swati Pandey', 'Rajesh Nambiar', 'Asha Balan',
    'Suresh Chandrasekaran', 'Lakshmi Devi', 'Ganesh Murthy', 'Rupal Shah', 'Tejas Kulkarni',
  ];

  // Hackathon: 127 sample students (not our demo student)
  for (let i = 0; i < 127; i++) {
    const name = `${names[i % names.length]}${i >= names.length ? ' ' + (Math.floor(i / names.length) + 1) : ''}`;
    const status: Registration['status'] = i < 112 ? 'attended' : 'confirmed';
    regs.push({
      id: `reg-hack-${i.toString().padStart(3, '0')}`,
      eventId: 'event-hackathon-001',
      studentId: `student-${1000 + i}`,
      studentName: name,
      studentEmail: `${name.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
      status,
      passToken: `HACK-${(0xA000 + i).toString(16).toUpperCase()}`,
      registeredAt: '2026-10-05T10:00:00Z',
      checkedInAt: status === 'attended' ? '2026-10-15T09:15:00Z' : undefined,
      isSeedData: true,
    });
  }

  // Workshop: 52 sample students
  for (let i = 0; i < 52; i++) {
    const name = `${names[i % names.length]} W${i >= names.length ? (Math.floor(i / names.length) + 1) : ''}`;
    const status: Registration['status'] = i < 48 ? 'attended' : 'confirmed';
    regs.push({
      id: `reg-work-${i.toString().padStart(3, '0')}`,
      eventId: 'event-workshop-002',
      studentId: `student-ws-${2000 + i}`,
      studentName: name.trim(),
      studentEmail: `${name.trim().toLowerCase().replace(/\s+/g, '.')}@university.edu`,
      status,
      passToken: `WORK-${(0xB000 + i).toString(16).toUpperCase()}`,
      registeredAt: '2026-10-06T10:00:00Z',
      checkedInAt: status === 'attended' ? '2026-10-18T14:10:00Z' : undefined,
      isSeedData: true,
    });
  }

  // Bootcamp: 58 sample students
  for (let i = 0; i < 58; i++) {
    const name = `${names[i % names.length]} B${i >= names.length ? (Math.floor(i / names.length) + 1) : ''}`;
    regs.push({
      id: `reg-boot-${i.toString().padStart(3, '0')}`,
      eventId: 'event-bootcamp-003',
      studentId: `student-bc-${3000 + i}`,
      studentName: name.trim(),
      studentEmail: `${name.trim().toLowerCase().replace(/\s+/g, '.')}@university.edu`,
      status: 'registered',
      passToken: `BOOT-${(0xC000 + i).toString(16).toUpperCase()}`,
      registeredAt: '2026-10-07T10:00:00Z',
      isSeedData: true,
    });
  }

  return regs;
}

function generateSeedFeedback(): Feedback[] {
  type FC = { c: string; r: number; s: Feedback['sentiment']; t: string[] };
  const comments: FC[] = [
    { c: 'Amazing event! The speakers were incredibly knowledgeable and inspiring.', r: 5, s: 'positive', t: ['speakers', 'inspiring', 'knowledge'] },
    { c: 'Great organization and venue. Loved the team collaboration aspect.', r: 5, s: 'positive', t: ['organization', 'collaboration', 'venue'] },
    { c: 'Really enjoyed the workshops. Learned a lot about machine learning models.', r: 4, s: 'positive', t: ['learning', 'workshops', 'machine learning'] },
    { c: 'Good event overall, though time management could be improved.', r: 3, s: 'neutral', t: ['time management', 'improvement'] },
    { c: 'Excellent resources provided. Will definitely attend next year!', r: 5, s: 'positive', t: ['resources', 'returning attendee'] },
    { c: 'The NLP session was fascinating. Need more hands-on time though.', r: 4, s: 'positive', t: ['NLP', 'hands-on', 'learning'] },
    { c: 'Some sessions were too basic but the advanced tracks were excellent.', r: 3, s: 'neutral', t: ['mixed levels', 'advanced track'] },
    { c: 'Best hackathon I have attended! The mentors were super helpful.', r: 5, s: 'positive', t: ['mentors', 'helpful', 'best event'] },
    { c: 'Registration process was smooth. Event ran on time. Great team!', r: 4, s: 'positive', t: ['organization', 'punctuality'] },
    { c: 'Venue was a bit crowded but content was outstanding.', r: 4, s: 'positive', t: ['venue', 'content', 'crowded'] },
    { c: 'Good networking opportunities. Met many like-minded students.', r: 4, s: 'positive', t: ['networking', 'community'] },
    { c: 'The AI demos were mind-blowing! Definitely coming back.', r: 5, s: 'positive', t: ['AI demos', 'innovation'] },
    { c: 'Food could be better but the technical content was top-notch.', r: 3, s: 'neutral', t: ['food', 'technical content'] },
    { c: 'Loved the project showcase at the end. Very motivating!', r: 5, s: 'positive', t: ['showcase', 'motivation'] },
    { c: 'WiFi connectivity issues hampered the coding sessions.', r: 2, s: 'negative', t: ['infrastructure', 'connectivity'] },
  ];

  const feedback: Feedback[] = [];

  for (let i = 0; i < 45; i++) {
    const c = comments[i % comments.length];
    feedback.push({
      id: `fb-hack-${i.toString().padStart(3, '0')}`,
      eventId: 'event-hackathon-001',
      studentId: `student-${1000 + i}`,
      studentName: `Participant ${1000 + i}`,
      rating: c.r,
      comment: c.c,
      submittedAt: '2026-10-15T18:00:00Z',
      sentiment: c.s,
      themes: c.t,
      isSeedData: true,
    });
  }

  for (let i = 0; i < 30; i++) {
    const c = comments[i % comments.length];
    feedback.push({
      id: `fb-work-${i.toString().padStart(3, '0')}`,
      eventId: 'event-workshop-002',
      studentId: `student-ws-${2000 + i}`,
      studentName: `Participant WS${2000 + i}`,
      rating: c.r,
      comment: c.c,
      submittedAt: '2026-10-18T19:00:00Z',
      sentiment: c.s,
      themes: c.t,
      isSeedData: true,
    });
  }

  return feedback;
}

function generateSeedCertificates(): Certificate[] {
  const certs: Certificate[] = [];

  for (let i = 0; i < 40; i++) {
    certs.push({
      id: `cert-hack-${i.toString().padStart(3, '0')}`,
      eventId: 'event-hackathon-001',
      eventTitle: 'AI Innovation Hackathon',
      studentId: `student-${1000 + i}`,
      studentName: `Participant ${1000 + i}`,
      issuedAt: '2026-10-15T20:00:00Z',
      certificateNumber: `CERT-HACK-2026-${(1000 + i)}`,
      isSeedData: true,
    });
  }

  for (let i = 0; i < 25; i++) {
    certs.push({
      id: `cert-work-${i.toString().padStart(3, '0')}`,
      eventId: 'event-workshop-002',
      eventTitle: 'Generative AI Workshop',
      studentId: `student-ws-${2000 + i}`,
      studentName: `Participant WS${2000 + i}`,
      issuedAt: '2026-10-18T21:00:00Z',
      certificateNumber: `CERT-WORK-2026-${(2000 + i)}`,
      isSeedData: true,
    });
  }

  return certs;
}

const SEED_AUTOMATION_LOGS: AutomationLog[] = [
  { id: 'log-001', eventId: 'event-hackathon-001', eventTitle: 'AI Innovation Hackathon', action: 'Event Published', detail: 'Registration opened for AI Innovation Hackathon. Capacity: 150.', status: 'success', timestamp: '2026-10-01T08:05:00Z', icon: 'publish', color: 'primary' },
  { id: 'log-002', eventId: 'event-hackathon-001', eventTitle: 'AI Innovation Hackathon', action: 'Capacity Alert', detail: 'AI Innovation Hackathon is 85% full. 22 seats remaining.', status: 'success', timestamp: '2026-10-08T14:00:00Z', icon: 'warning', color: 'secondary' },
  { id: 'log-003', eventId: 'event-workshop-002', eventTitle: 'Generative AI Workshop', action: 'Event Published', detail: 'Registration opened for Generative AI Workshop. Capacity: 60.', status: 'success', timestamp: '2026-10-02T09:05:00Z', icon: 'publish', color: 'primary' },
  { id: 'log-004', eventId: 'event-hackathon-001', eventTitle: 'AI Innovation Hackathon', action: 'Reminders Dispatched', detail: '127 reminder notifications sent to registered participants (simulated).', status: 'success', timestamp: '2026-10-14T09:00:00Z', icon: 'schedule', color: 'tertiary' },
  { id: 'log-005', eventId: 'event-hackathon-001', eventTitle: 'AI Innovation Hackathon', action: 'Check-in Opened', detail: 'QR attendance check-in portal activated for AI Innovation Hackathon.', status: 'success', timestamp: '2026-10-15T08:45:00Z', icon: 'qr_code_scanner', color: 'primary' },
  { id: 'log-006', eventId: 'event-hackathon-001', eventTitle: 'AI Innovation Hackathon', action: 'Feedback Requests Sent', detail: '112 feedback request notifications sent to attendees (simulated).', status: 'success', timestamp: '2026-10-15T18:00:00Z', icon: 'rate_review', color: 'secondary' },
  { id: 'log-007', eventId: 'event-hackathon-001', eventTitle: 'AI Innovation Hackathon', action: 'Sentiment Analysis Complete', detail: 'AI processed 45 feedback responses. Avg rating: 4.2/5. Positive: 73%.', status: 'success', timestamp: '2026-10-15T20:00:00Z', icon: 'analytics', color: 'primary' },
  { id: 'log-008', eventId: 'event-hackathon-001', eventTitle: 'AI Innovation Hackathon', action: 'Certificates Issued', detail: '40 digital certificates issued for AI Innovation Hackathon attendees.', status: 'success', timestamp: '2026-10-15T20:30:00Z', icon: 'card_membership', color: 'secondary' },
  { id: 'log-009', eventId: 'event-workshop-002', eventTitle: 'Generative AI Workshop', action: 'Certificates Issued', detail: '25 digital certificates issued for Generative AI Workshop attendees.', status: 'success', timestamp: '2026-10-18T21:00:00Z', icon: 'card_membership', color: 'secondary' },
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'notif-001', title: 'Upcoming: AI Innovation Hackathon', message: 'Your registered event starts in 3 days. Make sure your team is ready!', type: 'info', timestamp: '2026-10-12T09:00:00Z', read: false, eventId: 'event-hackathon-001' },
  { id: 'notif-002', title: 'Generative AI Workshop — Today!', message: 'Your workshop starts at 2:00 PM in Science Complex, Lab B. QR pass ready.', type: 'success', timestamp: '2026-10-18T08:00:00Z', read: false, eventId: 'event-workshop-002' },
  { id: 'notif-003', title: 'Hackathon almost full!', message: 'AI Innovation Hackathon is 85% full — only 23 seats left. Register now!', type: 'warning', timestamp: '2026-10-10T14:00:00Z', read: true, eventId: 'event-hackathon-001' },
];

export function createSeedState(): AppState {
  return {
    role: 'student',
    events: SEED_EVENTS.map(e => ({ ...e })),
    registrations: generateSeedRegistrations(),
    feedback: generateSeedFeedback(),
    certificates: generateSeedCertificates(),
    automationLogs: [...SEED_AUTOMATION_LOGS],
    notifications: [...SEED_NOTIFICATIONS],
    chatHistory: [],
    currentStudentId: CURRENT_STUDENT_ID,
    currentStudentName: CURRENT_STUDENT_NAME,
  };
}
