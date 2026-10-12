import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

interface CreateEventProps {
  onNavigate: (page: string) => void;
}

const AI_PRESETS = [
  {
    title: 'NextGen Autonomous Robotics Sprint 2026',
    description: 'A 48-hour intensive building challenge focusing on ROS 2, LiDAR navigation, and reinforcement learning for mobile robots. Work alongside industry mentors to build autonomous obstacle avoidance and search-and-rescue rovers.',
    category: 'Technology & AI',
    eligibility: 'Computer Science & Robotics Dept',
    date: '2026-11-05',
    time: '10:00',
    venue: 'Robotics Center, Building 7, Lab 101',
    deadline: '2026-11-03',
    capacity: 120,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
  },
  {
    title: 'Cloud Native & Microservices Workshop',
    description: 'Learn modern distributed system architecture with Kubernetes, Docker, and gRPC. Hands-on labs deploying multi-region resilient clusters with live chaos engineering drills.',
    category: 'Career & Workshop',
    eligibility: 'All Students',
    date: '2026-11-12',
    time: '14:30',
    venue: 'Auditorium Complex, Hall 3',
    deadline: '2026-11-10',
    capacity: 90,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
  },
  {
    title: 'Campus FinTech & Web3 Ideation Summit',
    description: 'Explore the intersection of zero-knowledge proofs, automated market makers, and regulatory compliance. Featuring keynotes from global crypto venture funds and university alumni founders.',
    category: 'Academic Seminar',
    eligibility: 'All Students',
    date: '2026-11-20',
    time: '11:00',
    venue: 'Management School, Executive Hall',
    deadline: '2026-11-18',
    capacity: 150,
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80',
  },
];

export default function CreateEvent({ onNavigate }: CreateEventProps) {
  const { createEvent, publishEvent, addNotification } = useApp();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology & AI');
  const [eligibility, setEligibility] = useState('All Students');
  const [date, setDate] = useState('2026-11-15');
  const [time, setTime] = useState('10:00');
  const [venue, setVenue] = useState('');
  const [deadline, setDeadline] = useState('2026-11-13');
  const [capacity, setCapacity] = useState<number>(100);
  const [organizer, setOrganizer] = useState('EventFlow Organizing Committee');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80');

  const handleMagicFill = () => {
    const randomPreset = AI_PRESETS[Math.floor(Math.random() * AI_PRESETS.length)];
    setTitle(randomPreset.title);
    setDescription(randomPreset.description);
    setCategory(randomPreset.category);
    setEligibility(randomPreset.eligibility);
    setDate(randomPreset.date);
    setTime(randomPreset.time);
    setVenue(randomPreset.venue);
    setDeadline(randomPreset.deadline);
    setCapacity(randomPreset.capacity);
    setImageUrl(randomPreset.imageUrl);

    showToast('AI Magic Fill ✨', 'Populated event fields using EventFlow intelligence.', 'info');
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim()) {
      showToast('Missing Fields', 'Please provide at least a title and venue.', 'warning');
      return;
    }

    const event = createEvent({
      title,
      description: description || 'No description provided.',
      category,
      eligibility,
      date: date || '2026-11-15',
      time: time || '10:00',
      venue,
      registrationDeadline: deadline || '2026-11-13',
      capacity: Number(capacity) || 50,
      organizer,
      imageUrl,
    });

    showToast('Draft Saved', `"${event.title}" saved in draft mode.`, 'success');
    onNavigate('volunteer-dashboard');
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !venue.trim()) {
      showToast('Validation Error', 'Please complete title, description, and venue.', 'warning');
      return;
    }

    const event = createEvent({
      title,
      description,
      category,
      eligibility,
      date,
      time,
      venue,
      registrationDeadline: deadline,
      capacity: Number(capacity) || 50,
      organizer,
      imageUrl,
    });

    publishEvent(event.id);
    addNotification({
      title: 'New Campus Event!',
      message: `${title} has been scheduled for ${date} at ${venue}.`,
      type: 'info',
      eventId: event.id,
    });

    showToast('Event Published! 🚀', `"${title}" is now live and accepting registrations.`, 'success');
    onNavigate('volunteer-dashboard');
  };

  return (
    <div className="fade-in">
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-primary" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11 }}>
              Create & Configure
            </span>
            <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>// AI-Powered Event Builder</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
            Publish a New Campus Experience
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <button className="btn btn-surface" onClick={handleSaveDraft} type="button">
            Save Draft
          </button>
          <button className="btn btn-primary" onClick={handlePublish} type="button" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>publish</span>
            Publish Event
          </button>
        </div>
      </div>

      {/* Main Grid: Form (8 cols) vs Live Preview (4 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Form Column */}
        <div className="card" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', gridColumn: 'span 2' }}>
          {/* AI Generator Quick Prompt Bar */}
          <div
            style={{
              background: 'var(--primary-fixed)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-md) var(--space-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-md)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>auto_awesome</span>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-primary-fixed)' }}>
                  Generate with AI Assistant
                </h3>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                  Auto-draft comprehensive event details, venue limits, and agendas.
                </p>
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleMagicFill}
              type="button"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bolt</span>
              Magic Fill
            </button>
          </div>

          <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {/* Event Title */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
                Event Title *
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Annual AI & Hackathon Summit 2026"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
                Description *
              </label>
              <textarea
                className="input"
                rows={4}
                placeholder="Provide a comprehensive summary of activities, mentors, track categories, and schedule..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            {/* Category & Eligibility */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
                  Category *
                </label>
                <select
                  className="input"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="Technology & AI">Technology & AI</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Bootcamp">Bootcamp</option>
                  <option value="Academic Seminar">Academic Seminar</option>
                  <option value="Career & Workshop">Career & Workshop</option>
                  <option value="Cultural & Arts">Cultural & Arts</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
                  Eligibility *
                </label>
                <select
                  className="input"
                  value={eligibility}
                  onChange={e => setEligibility(e.target.value)}
                >
                  <option value="All Students">All Students</option>
                  <option value="Computer Science Dept">Computer Science Dept</option>
                  <option value="Computer Science & Robotics Dept">Computer Science & Robotics Dept</option>
                  <option value="Final Year Students">Final Year Students</option>
                  <option value="Registered Volunteers">Registered Volunteers</option>
                </select>
              </div>
            </div>

            {/* Date & Start Time */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
                  Date *
                </label>
                <input
                  type="date"
                  className="input"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
                  Start Time *
                </label>
                <input
                  type="time"
                  className="input"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Venue & Registration Deadline */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
                  Venue *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Main Auditorium, Block B"
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
                  Registration Deadline *
                </label>
                <input
                  type="date"
                  className="input"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Capacity & Organizer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
                  Maximum Capacity *
                </label>
                <input
                  type="number"
                  className="input"
                  min="10"
                  max="1000"
                  value={capacity}
                  onChange={e => setCapacity(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
                  Organizer / Host
                </label>
                <input
                  type="text"
                  className="input"
                  value={organizer}
                  onChange={e => setOrganizer(e.target.value)}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                // Live Preview
              </span>
              <span className="badge badge-secondary" style={{ fontSize: 11 }}>
                Live Feed Preview
              </span>
            </div>

            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                background: 'var(--surface-container-lowest)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--outline-variant)',
              }}
            >
              <div
                style={{
                  height: 160,
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--primary)',
                  }}
                >
                  {category}
                </span>
              </div>
              <div style={{ padding: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_month</span>
                  <span>{date || 'Date TBD'} • {time || 'Time TBD'}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 6, lineHeight: 1.3 }}>
                  {title || 'Event Title Placeholder'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                  <span>{venue || 'Campus Venue TBD'}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', lineHeight: 1.4, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {description || 'Event description will appear here in real-time as you compose your campus experience.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--surface-container)' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                    {capacity} seats available
                  </span>
                  <span className="badge badge-primary" style={{ fontSize: 11 }}>
                    {eligibility}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
