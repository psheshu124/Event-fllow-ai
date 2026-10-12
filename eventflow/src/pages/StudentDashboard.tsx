import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Event } from '../types';

const EVENT_IMAGES: Record<string, string> = {
  'event-hackathon-001': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80',
  'event-workshop-002': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80',
  'event-bootcamp-003': 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=400&q=80',
};

const CATEGORY_COLORS: Record<string, string> = {
  Hackathon: 'var(--primary)',
  Workshop: 'var(--secondary)',
  Bootcamp: 'var(--on-secondary-fixed)',
  Seminar: 'var(--tertiary)',
  Cultural: '#D4590A',
  Sports: '#1B7E34',
  Career: '#6B21A8',
  default: 'var(--primary)',
};

interface EventCardProps {
  event: Event;
  onRegister: (eventId: string) => void;
  isRegistered: boolean;
  seatsLeft: number;
}

function EventCard({ event, onRegister, isRegistered, seatsLeft }: EventCardProps) {
  const imgUrl = EVENT_IMAGES[event.id] ?? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80';
  const catColor = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.default;
  const eventDate = new Date(event.date);
  const dateStr = eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const isFull = seatsLeft <= 0;
  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);

  return (
    <div className="event-card fade-in">
      <div>
        <div className="event-card-img">
          <img src={imgUrl} alt={event.title} loading="lazy" />
          <span className="event-type-badge" style={{ color: catColor }}>{event.category}</span>
        </div>
        <div className="event-meta">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
          <span>{dateStr} • {event.time}</span>
        </div>
        <h3 className="event-title line-clamp-1">{event.title}</h3>
        <div className="event-venue mb-md">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
          <span className="truncate">{event.venue}</span>
        </div>
      </div>
      <div className="event-footer">
        <span className="seats-badge">
          {isFull ? '❌ Full' : `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} left`}
        </span>
        {isRegistered ? (
          <span className="badge badge-success">Registered ✓</span>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onRegister(event.id)}
            disabled={isFull || isDeadlinePassed || event.status !== 'published'}
          >
            {isDeadlinePassed ? 'Closed' : isFull ? 'Full' : 'Register'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { state, registerForEvent } = useApp();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Hackathon', 'Workshop', 'Bootcamp'];

  const myRegEventIds = useMemo(() =>
    new Set(state.registrations
      .filter(r => r.studentId === state.currentStudentId && r.status !== 'cancelled')
      .map(r => r.eventId)),
    [state.registrations, state.currentStudentId]
  );

  const filteredEvents = useMemo(() => {
    return state.events.filter(e => {
      if (e.status !== 'published' && e.status !== 'ongoing') return false;
      if (activeCategory !== 'All' && e.category !== activeCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [state.events, activeCategory, searchQuery]);

  const handleRegister = (eventId: string) => {
    const result = registerForEvent(eventId);
    if (result.success) {
      showToast('Registration Successful! 🎉', result.message, 'success');
    } else {
      showToast('Registration Failed', result.message, 'error');
    }
  };

  // My upcoming registered events
  const myUpcoming = useMemo(() => {
    return state.registrations
      .filter(r => r.studentId === state.currentStudentId && r.status !== 'cancelled')
      .map(r => ({ reg: r, event: state.events.find(e => e.id === r.eventId) }))
      .filter(({ event }) => event && (event.status === 'published' || event.status === 'ongoing'))
      .slice(0, 3);
  }, [state.registrations, state.events, state.currentStudentId]);

  // My certs count
  const myCertCount = state.certificates.filter(c => c.studentId === state.currentStudentId).length;

  // Next reminder event
  const nextEvent = useMemo(() => {
    return myUpcoming.find(({ event }) => event)?.event;
  }, [myUpcoming]);

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-lg)' }}>
            <div>
              <div className="flex items-center gap-sm mb-sm">
                <span className="badge badge-primary">CS Junior • {state.currentStudentName}</span>
                <span style={{ fontSize: 12, color: 'var(--outline)' }}>• ID: #84920</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>
                Discover your next campus experience
              </h1>
              <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', maxWidth: 480 }}>
                Explore upcoming hackathons, AI workshops, and university tech bootcamps tailored to your curriculum.
              </p>
            </div>
            <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
              <div className="search-wrapper" style={{ width: 280 }}>
                <span className="material-symbols-outlined search-icon">search</span>
                <input
                  className="search-input"
                  placeholder="Search campus events..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
        {/* Left: Event Discovery */}
        <div>
          <div className="flex items-center justify-between mb-md">
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--on-surface)' }}>Recommended For You</h2>
              <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>Handpicked tech events based on your computer science major.</p>
            </div>
            <div className="filter-chips">
              {categories.map(cat => (
                <button key={cat} className={`chip ${activeCategory === cat ? 'chip-active' : 'chip-default'}`} onClick={() => setActiveCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon"><span className="material-symbols-outlined" style={{ fontSize: 48 }}>event_busy</span></div>
              <div className="empty-state-title">No events found</div>
              <div className="empty-state-text">Try a different search or category filter</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-lg)' }}>
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={handleRegister}
                  isRegistered={myRegEventIds.has(event.id)}
                  seatsLeft={event.capacity - event.registeredCount}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: AI Assistant + Next Event */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* AI Assistant Card */}
          <div className="ai-gradient-card" style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex items-center gap-sm mb-md">
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-xl)', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined icon-filled" style={{ fontSize: 22 }}>smart_toy</span>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>Ask EventFlow AI</h3>
                <p style={{ fontSize: 12, opacity: 0.8 }}>Instant campus event assistance</p>
              </div>
            </div>
            <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 'var(--space-md)', fontStyle: 'italic' }}>
              "Find me hackathons happening next week with available seats."
            </p>
            <button
              className="btn btn-surface w-full"
              onClick={() => onNavigate('ai-assistant')}
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              <span className="material-symbols-outlined icon-filled" style={{ fontSize: 16 }}>smart_toy</span>
              Open AI Assistant
            </button>
          </div>

          {/* Next Event Reminder */}
          <div className="card card-3xl">
            <div className="flex items-center justify-between mb-md">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Next Event Reminder</h3>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} className="pulse" />
            </div>
            {nextEvent ? (
              <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>Upcoming</div>
                <h4 style={{ fontWeight: 600, color: 'var(--on-surface)', marginBottom: 4 }}>{nextEvent.title}</h4>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                  {new Date(nextEvent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {nextEvent.time} • {nextEvent.venue}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-md)', color: 'var(--outline)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>event_available</span>
                <p style={{ fontSize: 12, marginTop: 8 }}>Register for an event to see reminders</p>
              </div>
            )}
            <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
              <span style={{ color: 'var(--on-surface-variant)' }}>QR Pass Ready</span>
              <button
                onClick={() => onNavigate('my-events')}
                style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}
              >
                View Ticket <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: My Events + Certificates */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 'var(--space-xl)' }}>
        {/* My Upcoming Events */}
        <div className="card card-3xl">
          <div className="flex items-center justify-between mb-lg">
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>My Upcoming Events</h3>
              <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>Events you're registered to attend</p>
            </div>
            <button
              onClick={() => onNavigate('my-events')}
              style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
            >
              View All
            </button>
          </div>
          {myUpcoming.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><span className="material-symbols-outlined" style={{ fontSize: 40 }}>event_note</span></div>
              <div className="empty-state-title">No registrations yet</div>
              <div className="empty-state-text">Browse and register for events above!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {myUpcoming.map(({ reg, event }) => (
                <div
                  key={reg.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)', background: 'var(--surface-container-low)', cursor: 'pointer', transition: 'background 0.1s' }}
                  onClick={() => onNavigate('my-events')}
                >
                  <div className="flex items-center gap-md">
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-xl)', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: 'var(--on-primary-fixed)' }}>
                      {new Date(event!.date).getDate()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--on-surface)' }}>{event?.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{event?.venue} • {event?.time}</div>
                    </div>
                  </div>
                  <span className="badge badge-primary">{reg.status === 'attended' ? 'Attended' : reg.status === 'confirmed' ? 'Confirmed' : 'Registered'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificates Summary */}
        <div className="card card-3xl flex-col" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div className="flex items-center justify-between mb-md">
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Certificates Available</h3>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--secondary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                <span className="material-symbols-outlined">card_membership</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 'var(--space-lg)' }}>
              {myCertCount > 0 ? `You have earned ${myCertCount} verified certificate${myCertCount > 1 ? 's' : ''} from campus tech events.` : 'Attend events and submit feedback to earn certificates.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)', background: 'var(--surface-container-low)', textAlign: 'center' }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', display: 'block' }}>{myCertCount}</span>
                <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Certificates</span>
              </div>
              <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)', background: 'var(--surface-container-low)', textAlign: 'center' }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--secondary)', display: 'block' }}>
                  {myUpcoming.length > 0 ? '100%' : '—'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Attendance</span>
              </div>
            </div>
          </div>
          <button className="btn btn-surface w-full" onClick={() => onNavigate('certificates')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>card_membership</span>
            View Certificates
          </button>
        </div>
      </div>
    </div>
  );
}
