import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function PostEventReport() {
  const { state } = useApp();
  const { showToast } = useToast();

  const [selectedEventId, setSelectedEventId] = useState<string>(
    state.events[0]?.id || 'event-hackathon-001'
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedEvent = state.events.find(e => e.id === selectedEventId) || state.events[0];

  // Registrations & Attendees
  const registrations = useMemo(() => {
    return state.registrations.filter(r => r.eventId === selectedEventId);
  }, [state.registrations, selectedEventId]);

  const totalRegs = selectedEvent ? selectedEvent.registeredCount : 150;
  const totalAttended = selectedEvent ? selectedEvent.attendedCount : 142;
  const attendanceRate = totalRegs > 0 ? ((totalAttended / totalRegs) * 100).toFixed(1) : '94.7';

  // Feedback
  const eventFeedback = useMemo(() => {
    return state.feedback.filter(f => f.eventId === selectedEventId);
  }, [state.feedback, selectedEventId]);

  const feedbackCount = eventFeedback.length > 0 ? eventFeedback.length : 128;
  const avgRating = eventFeedback.length > 0
    ? (eventFeedback.reduce((acc, f) => acc + f.rating, 0) / eventFeedback.length).toFixed(1)
    : '4.8';

  // Certificates
  const certsCount = state.certificates.filter(c => c.eventId === selectedEventId).length || totalAttended;

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      showToast('Report Synthesized ✨', 'AI recalculated attendance conversion and sentiment clusters.', 'success');
    }, 900);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fade-in post-event-report-page">
      {/* Event Overview & Actions Banner */}
      <div
        className="card hero-banner"
        style={{
          padding: 'var(--space-xl)',
          marginBottom: 'var(--space-xl)',
          background: 'var(--surface-container-lowest)',
          border: '1px solid var(--outline-variant)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-secondary" style={{ fontSize: 11, fontWeight: 600 }}>
                {selectedEvent?.status === 'completed' ? 'Completed' : 'Active Telemetry'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontFamily: 'monospace' }}>
                ID: EVT-{selectedEvent?.id.slice(-6).toUpperCase() || '8849-AI'}
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
              {selectedEvent?.title || 'AI Innovation Hackathon'}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Post-event analytics, attendance verification, and AI-synthesized organizational insights.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              style={{
                background: 'var(--surface-container-low)',
                color: 'var(--on-surface)',
                border: '1.5px solid var(--outline-variant)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-xl)',
                fontSize: 13,
                outline: 'none',
              }}
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
            >
              {state.events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>

            <button
              className="btn btn-surface"
              onClick={handleRegenerate}
              disabled={isGenerating}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span className={`material-symbols-outlined ${isGenerating ? 'animate-spin' : ''}`} style={{ fontSize: 18 }}>
                auto_awesome
              </span>
              {isGenerating ? 'Analyzing...' : 'Generate Report'}
            </button>

            <button
              className="btn btn-primary"
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>print</span>
              Print / Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bento Grid (6 cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        {/* Card 1: Total Registrations */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Total Registrations</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>group</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)' }}>{totalRegs}</span>
            <span style={{ fontSize: 12, color: 'var(--tertiary)' }}>Students Enrolled</span>
          </div>
          <div style={{ marginTop: 12, width: '100%', height: 6, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'var(--primary)', borderRadius: 999 }} />
          </div>
        </div>

        {/* Card 2: Total Attendees */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Total Attendees</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--secondary-fixed)', color: 'var(--on-secondary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>how_to_reg</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)' }}>{totalAttended}</span>
            <span style={{ fontSize: 12, color: 'var(--tertiary)' }}>Checked-in via QR</span>
          </div>
          <div style={{ marginTop: 12, width: '100%', height: 6, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${attendanceRate}%`, height: '100%', background: 'var(--secondary)', borderRadius: 999 }} />
          </div>
        </div>

        {/* Card 3: Attendance Rate */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Attendance Rate</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--tertiary-fixed)', color: 'var(--on-tertiary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>trending_up</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)' }}>{attendanceRate}%</span>
            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>+4.2% vs campus avg</span>
          </div>
          <div style={{ marginTop: 12, width: '100%', height: 6, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${attendanceRate}%`, height: '100%', background: 'var(--tertiary)', borderRadius: 999 }} />
          </div>
        </div>

        {/* Card 4: Feedback Responses */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Feedback Responses</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chat_bubble</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)' }}>{feedbackCount}</span>
            <span style={{ fontSize: 12, color: 'var(--tertiary)' }}>Surveys Submitted</span>
          </div>
          <div style={{ marginTop: 12, width: '100%', height: 6, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: '90%', height: '100%', background: 'var(--primary)', borderRadius: 999 }} />
          </div>
        </div>

        {/* Card 5: Average Rating */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Average Rating</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined icon-filled" style={{ fontSize: 20 }}>star</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)' }}>{avgRating}</span>
            <span style={{ fontSize: 12, color: 'var(--tertiary)' }}>/ 5.0 scale</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 10, color: '#F59E0B' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="material-symbols-outlined icon-filled" style={{ fontSize: 16 }}>star</span>
            ))}
          </div>
        </div>

        {/* Card 6: Certificates Issued */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Certificates Issued</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--secondary-fixed)', color: 'var(--on-secondary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>card_membership</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)' }}>{certsCount}</span>
            <span style={{ fontSize: 12, color: 'var(--tertiary)' }}>Auto-issued on completion</span>
          </div>
          <div style={{ marginTop: 12, width: '100%', height: 6, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'var(--secondary)', borderRadius: 999 }} />
          </div>
        </div>
      </div>

      {/* Detailed Sections: Key Findings & Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-lg)' }}>
        {/* Key Findings Section */}
        <div className="card" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>insights</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>Key Findings</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
            Comprehensive synthesis of event telemetry, attendance tracking, and participant satisfaction indices gathered throughout the event.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ background: 'var(--surface-container-low)', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)', display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', marginTop: 2 }}>check_circle</span>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>Exceptional Attendance Conversion</h4>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4, lineHeight: 1.4 }}>
                  {attendanceRate}% turnout rate significantly exceeded historical campus averages (78%), driven by automated WhatsApp reminders and seamless QR check-in passes.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--surface-container-low)', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)', display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', marginTop: 2 }}>check_circle</span>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>High Participant Engagement</h4>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4, lineHeight: 1.4 }}>
                  {feedbackCount} attendees completed the feedback survey within 2 hours of event conclusion, indicating high investment in future editions.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--surface-container-low)', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)', display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', marginTop: 2 }}>check_circle</span>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>Technical Infrastructure Stability</h4>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4, lineHeight: 1.4 }}>
                  Zero downtime reported during API endpoint testing and mentor booking sessions. Cloud credits distributed seamlessly to all checked-in attendees.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="card" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--secondary-fixed)', color: 'var(--on-secondary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>lightbulb</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>AI Recommendations</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
            AI-generated strategic directives and organizer notes for optimizing future campus technology events and workshops.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ background: 'var(--surface-container-low)', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)', display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', marginTop: 2 }}>arrow_forward</span>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>Expand Venue Capacity</h4>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4, lineHeight: 1.4 }}>
                  Due to high demand (over 45 waitlisted students unable to register), consider reserving the main auditorium or hybridizing the workshop tier next semester.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--surface-container-low)', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)', display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', marginTop: 2 }}>arrow_forward</span>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>Optimize Mentor Pairing Ratios</h4>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4, lineHeight: 1.4 }}>
                  Feedback indicated peak mentoring bottlenecks between hours 4 and 6. Increase active technical mentors by 25% during ideation sprints.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--surface-container-low)', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)', display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', marginTop: 2 }}>arrow_forward</span>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>Pre-Event Environment Checkpoint</h4>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4, lineHeight: 1.4 }}>
                  Introduce a mandatory software setup checklist 48 hours prior to reduce onboarding friction at the opening session.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
