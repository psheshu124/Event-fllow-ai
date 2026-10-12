import { AppState, ChatMessage, EventCardData } from '../types';

// =====================================================
// EventFlow AI — Local Intent-Based Orchestrator
// =====================================================

type OrchestratorResult = {
  text: string;
  eventCards?: EventCardData[];
  action?: 'register';
  actionEventId?: string;
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// Intent detection keywords
const INTENTS = {
  listEvents: ['what events', 'show events', 'upcoming events', 'list events', 'all events', 'find events', 'events happening', 'events this'],
  listAiEvents: ['ai events', 'artificial intelligence', 'machine learning', 'ml events', 'generative ai', 'llm'],
  searchHackathon: ['hackathon', 'hack'],
  searchWorkshop: ['workshop', 'workshops'],
  searchBootcamp: ['bootcamp', 'boot camp'],
  availableSeats: ['available seats', 'seats available', 'open seats', 'seats left', 'has seats', 'spots available', 'which events have'],
  myRegistrations: ['registered for', 'my events', 'my registrations', 'what am i registered', 'signed up', 'which events am i'],
  nextEvent: ['next event', 'upcoming event', 'when is my', 'my next'],
  register: ['register me', 'sign me up', 'register for', 'sign up for', 'can i register', 'i want to register'],
  certificates: ['certificate', 'certificates', 'cert', 'download certificate'],
  feedback: ['feedback', 'review', 'rate the event'],
  help: ['help', 'what can you do', 'how do you work', 'commands'],
};

function detectIntent(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (keywords.some(k => lower.includes(k))) return intent;
  }
  return 'unknown';
}

function extractEventName(msg: string, state: AppState): string | null {
  const lower = msg.toLowerCase();
  for (const ev of state.events) {
    if (lower.includes(ev.title.toLowerCase()) ||
      ev.title.split(' ').some(word => word.length > 4 && lower.includes(word.toLowerCase()))) {
      return ev.id;
    }
  }
  return null;
}

export function processMessage(
  msg: string,
  state: AppState,
  onRegister: (eventId: string) => { success: boolean; message: string }
): OrchestratorResult {
  const intent = detectIntent(msg);
  const lower = msg.toLowerCase();

  // ---- List all events ----
  if (intent === 'listEvents') {
    const published = state.events.filter(e => e.status === 'published' || e.status === 'ongoing');
    if (published.length === 0) return { text: 'There are currently no upcoming events available.' };

    const cards: EventCardData[] = published.map(e => ({
      eventId: e.id,
      title: e.title,
      date: `${formatDate(e.date)} • ${e.time}`,
      venue: e.venue,
      seatsLeft: e.capacity - e.registeredCount,
      status: e.status,
    }));

    return {
      text: `Here are all upcoming campus events (${published.length} found):`,
      eventCards: cards,
    };
  }

  // ---- AI events ----
  if (intent === 'listAiEvents') {
    const aiEvents = state.events.filter(e =>
      (e.status === 'published' || e.status === 'ongoing') &&
      (e.title.toLowerCase().includes('ai') ||
       e.title.toLowerCase().includes('artificial') ||
       e.category.toLowerCase().includes('ai') ||
       e.description.toLowerCase().includes('ai') ||
       e.description.toLowerCase().includes('machine learning'))
    );

    if (aiEvents.length === 0) return { text: 'I don\'t see any AI-focused events currently open for registration.' };

    const cards: EventCardData[] = aiEvents.map(e => ({
      eventId: e.id,
      title: e.title,
      date: `${formatDate(e.date)} • ${e.time}`,
      venue: e.venue,
      seatsLeft: e.capacity - e.registeredCount,
      status: e.status,
    }));

    return {
      text: `I found ${aiEvents.length} AI-related event${aiEvents.length > 1 ? 's' : ''} coming up:`,
      eventCards: cards,
    };
  }

  // ---- Hackathons ----
  if (intent === 'searchHackathon') {
    const events = state.events.filter(e =>
      (e.status === 'published' || e.status === 'ongoing') &&
      (e.category === 'Hackathon' || e.title.toLowerCase().includes('hackathon'))
    );
    if (events.length === 0) return { text: 'No hackathons are currently scheduled.' };
    const cards: EventCardData[] = events.map(e => ({ eventId: e.id, title: e.title, date: `${formatDate(e.date)} • ${e.time}`, venue: e.venue, seatsLeft: e.capacity - e.registeredCount, status: e.status }));
    return { text: `Found ${events.length} hackathon${events.length > 1 ? 's' : ''}:`, eventCards: cards };
  }

  // ---- Workshops ----
  if (intent === 'searchWorkshop') {
    const events = state.events.filter(e =>
      (e.status === 'published' || e.status === 'ongoing') &&
      (e.category === 'Workshop' || e.title.toLowerCase().includes('workshop'))
    );
    if (events.length === 0) return { text: 'No workshops are currently scheduled.' };
    const cards: EventCardData[] = events.map(e => ({ eventId: e.id, title: e.title, date: `${formatDate(e.date)} • ${e.time}`, venue: e.venue, seatsLeft: e.capacity - e.registeredCount, status: e.status }));
    return { text: `Found ${events.length} workshop${events.length > 1 ? 's' : ''}:`, eventCards: cards };
  }

  // ---- Bootcamps ----
  if (intent === 'searchBootcamp') {
    const events = state.events.filter(e =>
      (e.status === 'published' || e.status === 'ongoing') &&
      (e.category === 'Bootcamp' || e.title.toLowerCase().includes('bootcamp'))
    );
    if (events.length === 0) return { text: 'No bootcamps are currently scheduled.' };
    const cards: EventCardData[] = events.map(e => ({ eventId: e.id, title: e.title, date: `${formatDate(e.date)} • ${e.time}`, venue: e.venue, seatsLeft: e.capacity - e.registeredCount, status: e.status }));
    return { text: `Found ${events.length} bootcamp${events.length > 1 ? 's' : ''}:`, eventCards: cards };
  }

  // ---- Available seats ----
  if (intent === 'availableSeats') {
    const available = state.events.filter(e =>
      (e.status === 'published' || e.status === 'ongoing') &&
      (e.capacity - e.registeredCount) > 0
    );
    if (available.length === 0) return { text: 'Unfortunately, all current events are at full capacity.' };
    const cards: EventCardData[] = available.map(e => ({ eventId: e.id, title: e.title, date: `${formatDate(e.date)} • ${e.time}`, venue: e.venue, seatsLeft: e.capacity - e.registeredCount, status: e.status }));
    return { text: `${available.length} event${available.length > 1 ? 's have' : ' has'} seats available:`, eventCards: cards };
  }

  // ---- My registrations ----
  if (intent === 'myRegistrations') {
    const myRegs = state.registrations.filter(
      r => r.studentId === state.currentStudentId && r.status !== 'cancelled'
    );
    if (myRegs.length === 0) return { text: "You haven't registered for any events yet. Use the Student Dashboard to discover and register!" };

    const cards: EventCardData[] = myRegs.map(r => {
      const ev = state.events.find(e => e.id === r.eventId);
      return {
        eventId: r.eventId,
        title: ev?.title ?? 'Unknown Event',
        date: ev ? `${formatDate(ev.date)} • ${ev.time}` : '',
        venue: ev?.venue ?? '',
        seatsLeft: ev ? ev.capacity - ev.registeredCount : 0,
        status: r.status,
      };
    });

    return { text: `You're registered for ${myRegs.length} event${myRegs.length > 1 ? 's' : ''}:`, eventCards: cards };
  }

  // ---- Next event ----
  if (intent === 'nextEvent') {
    const myRegs = state.registrations.filter(
      r => r.studentId === state.currentStudentId && r.status !== 'cancelled'
    );
    const upcoming = myRegs
      .map(r => ({ reg: r, event: state.events.find(e => e.id === r.eventId) }))
      .filter(({ event }) => event && new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.event!.date).getTime() - new Date(b.event!.date).getTime());

    if (upcoming.length === 0) return { text: "You have no upcoming registered events. Browse the Student Dashboard to discover events!" };

    const { event, reg } = upcoming[0];
    return {
      text: `Your next event is **${event!.title}** on ${formatDate(event!.date)} at ${event!.time} at ${event!.venue}. Your pass token is: \`${reg.passToken}\``,
    };
  }

  // ---- Register ----
  if (intent === 'register') {
    const eventId = extractEventName(msg, state);
    if (!eventId) {
      const published = state.events.filter(e => e.status === 'published');
      if (published.length === 0) return { text: 'No events are currently open for registration.' };
      const cards: EventCardData[] = published.map(e => ({ eventId: e.id, title: e.title, date: `${formatDate(e.date)} • ${e.time}`, venue: e.venue, seatsLeft: e.capacity - e.registeredCount, status: e.status }));
      return {
        text: 'Which event would you like to register for? Here are the available events:',
        eventCards: cards,
      };
    }

    const result = onRegister(eventId);
    const event = state.events.find(e => e.id === eventId);
    if (result.success) {
      return { text: `✅ ${result.message} You can find your QR pass in **My Events & QR**.` };
    }
    return { text: `❌ Registration failed: ${result.message}` };
  }

  // ---- Certificates ----
  if (intent === 'certificates') {
    const myCerts = state.certificates.filter(c => c.studentId === state.currentStudentId);
    if (myCerts.length === 0) {
      return { text: 'You don\'t have any certificates yet. Certificates are issued after attending an event and submitting feedback. Check your eligibility in the Certificates page.' };
    }
    const list = myCerts.map(c => `• **${c.eventTitle}** — ${c.certificateNumber}`).join('\n');
    return { text: `You have ${myCerts.length} certificate${myCerts.length > 1 ? 's' : ''}:\n\n${list}\n\nGo to the **Certificates** page to view and download them.` };
  }

  // ---- Help ----
  if (intent === 'help') {
    return {
      text: `I'm EventFlow AI — your campus event assistant! Here's what I can help with:\n\n• **Find events**: "What AI events are coming up?"\n• **Check seats**: "Which events have available seats?"\n• **Register**: "Register me for the AI Hackathon"\n• **My schedule**: "What events am I registered for?"\n• **Next event**: "When is my next event?"\n• **Certificates**: "Show my certificates"\n\nJust ask naturally!`,
    };
  }

  // ---- Unknown / fallback ----
  // Try to search event titles
  const matchedEvent = state.events.find(e =>
    e.title.toLowerCase().split(' ').some(word => word.length > 3 && lower.includes(word.toLowerCase()))
  );
  if (matchedEvent) {
    const seatsLeft = matchedEvent.capacity - matchedEvent.registeredCount;
    return {
      text: `Here's info about **${matchedEvent.title}**:\n\n📅 ${formatDate(matchedEvent.date)} at ${matchedEvent.time}\n📍 ${matchedEvent.venue}\n👥 ${matchedEvent.registeredCount}/${matchedEvent.capacity} registered (${seatsLeft} seats left)\n📋 Status: ${matchedEvent.status}\n\n${matchedEvent.description}`,
    };
  }

  return {
    text: `I didn't quite understand that. Try asking about events, available seats, your registrations, or type "help" to see what I can do!`,
  };
}

export function generateId(prefix: string = 'msg'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
