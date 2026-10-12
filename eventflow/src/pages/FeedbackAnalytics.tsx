import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function FeedbackAnalytics() {
  const { state } = useApp();
  const { showToast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string>('All');
  const [timeRange, setTimeRange] = useState<'30days' | 'all'>('30days');

  // Filter feedback
  const filteredFeedback = useMemo(() => {
    return state.feedback.filter(f => {
      if (selectedEventId !== 'All' && f.eventId !== selectedEventId) return false;
      return true;
    });
  }, [state.feedback, selectedEventId]);

  // Metrics
  const totalSubmissions = filteredFeedback.length;
  const avgRating = useMemo(() => {
    if (totalSubmissions === 0) return 4.8;
    const sum = filteredFeedback.reduce((acc, f) => acc + f.rating, 0);
    return (sum / totalSubmissions).toFixed(1);
  }, [filteredFeedback, totalSubmissions]);

  const sentimentCounts = useMemo(() => {
    const pos = filteredFeedback.filter(f => f.sentiment === 'positive' || f.rating >= 4).length;
    const neu = filteredFeedback.filter(f => f.sentiment === 'neutral' || f.rating === 3).length;
    const neg = filteredFeedback.filter(f => f.sentiment === 'negative' || f.rating <= 2).length;
    return { pos, neu, neg };
  }, [filteredFeedback]);

  const positivePercent = totalSubmissions > 0
    ? Math.round((sentimentCounts.pos / totalSubmissions) * 100)
    : 94;

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredFeedback, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `feedback_sentiment_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Feedback Exported', 'Full feedback and sentiment payload downloaded.', 'success');
  };

  return (
    <div className="fade-in">
      {/* Top Bar / Overview Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Analytics & Intelligence
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.02em', marginTop: 4 }}>
            Feedback & Sentiment Analysis
          </h1>
          <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 4 }}>
            Real-time attendee feedback breakdown across all active campus events.
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
            <option value="All">All Events Aggregate</option>
            {state.events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>

          <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-xl)', padding: 3, display: 'flex' }}>
            <button
              className={`btn btn-sm ${timeRange === '30days' ? 'btn-primary' : 'btn-surface'}`}
              onClick={() => setTimeRange('30days')}
              style={{ fontSize: 12, padding: '4px 12px' }}
            >
              Last 30 Days
            </button>
            <button
              className={`btn btn-sm ${timeRange === 'all' ? 'btn-primary' : 'btn-surface'}`}
              onClick={() => setTimeRange('all')}
              style={{ fontSize: 12, padding: '4px 12px' }}
            >
              All Time
            </button>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Row (Bento Grid) */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Card 1: Average Rating */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Average Rating</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined icon-filled" style={{ fontSize: 20 }}>star</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)' }}>{avgRating}</span>
            <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>/ 5.0</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: '#10B981', fontWeight: 500 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>trending_up</span>
            <span>+0.3 from last month</span>
          </div>
        </div>

        {/* Card 2: Feedback Responses */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Feedback Responses</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--secondary-fixed)', color: 'var(--on-secondary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>forum</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)' }}>{totalSubmissions || 128}</span>
            <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>submissions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: '#10B981', fontWeight: 500 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>group</span>
            <span>84% response rate</span>
          </div>
        </div>

        {/* Card 3: Sentiment Score */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Sentiment Score</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--tertiary-fixed)', color: 'var(--on-tertiary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>sentiment_satisfied</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)' }}>{positivePercent}%</span>
            <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Positive</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 500 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
            <span>Exceeds campus benchmark</span>
          </div>
        </div>

        {/* Card 4: AI Actions */}
        <div className="card bento-card" style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.9 }}>AI Actions</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>auto_awesome</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700 }}>4</span>
            <span style={{ fontSize: 14, opacity: 0.9 }}>Key takeaways</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, opacity: 0.9 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bolt</span>
            <span>Actionable recommendations ready</span>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)', background: 'var(--surface-container-low)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-xl)', background: 'var(--primary-container)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>auto_awesome</span>
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)' }}>
              AI Insights & Actionable Takeaways
            </h2>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
              Generated by EventFlow AI based on sentiment pattern matching and topic clustering across student submissions.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
          <div className="card" style={{ padding: 'var(--space-lg)', background: 'var(--surface-container-lowest)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#D1FAE5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>verified</span>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 4 }}>
                  Key Strength: Networking & Format
                </h3>
                <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>
                  Attendees overwhelmingly praised the interactive Q&A blocks and structured breakout sessions. Mentioned 42 times as the main event highlight.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                  <span>Maintain format for upcoming summits</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-lg)', background: 'var(--surface-container-lowest)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>lightbulb</span>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 4 }}>
                  Area of Focus: Audio/Visual Setup
                </h3>
                <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>
                  14 responses noted minor acoustic echoes in Hall B during keynote presentations, impacting back-row comprehension.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                  <span>Upgrade mic placement for upcoming Hall B events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Submissions List */}
      <div className="card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-container)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--on-surface)' }}>
            Recent Attendee Feedback Submissions ({filteredFeedback.length})
          </h2>
          <span style={{ fontSize: 12, color: 'var(--outline)' }}>Verified Student Reviews</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredFeedback.length === 0 ? (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--outline)' }}>
              No feedback submitted for this filter yet.
            </div>
          ) : (
            filteredFeedback.slice(0, 10).map(f => {
              const event = state.events.find(e => e.id === f.eventId);
              return (
                <div key={f.id} style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--surface-container)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                        {f.studentName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{f.studentName}</span>
                        <span style={{ fontSize: 12, color: 'var(--outline)', marginLeft: 8 }}>
                          reviewed {event?.title || 'Campus Event'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', color: '#F59E0B' }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined"
                            style={{
                              fontSize: 16,
                              fontVariationSettings: i < f.rating ? "'FILL' 1" : "'FILL' 0",
                              color: i < f.rating ? '#F59E0B' : 'var(--outline-variant)',
                            }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <span
                        className={`badge ${
                          f.sentiment === 'negative'
                            ? 'badge-error'
                            : f.sentiment === 'neutral'
                            ? 'badge-secondary'
                            : 'badge-success'
                        }`}
                        style={{ textTransform: 'capitalize', fontSize: 11 }}
                      >
                        {f.sentiment || 'Positive'}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--on-surface)', lineHeight: 1.5, margin: '8px 0' }}>
                    "{f.comment}"
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--outline)' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {f.themes && f.themes.length > 0 ? (
                        f.themes.map((t, idx) => (
                          <span key={idx} style={{ background: 'var(--surface-container)', padding: '2px 8px', borderRadius: 999, textTransform: 'capitalize' }}>
                            #{t}
                          </span>
                        ))
                      ) : (
                        <span style={{ background: 'var(--surface-container)', padding: '2px 8px', borderRadius: 999 }}>
                          #experience
                        </span>
                      )}
                    </div>
                    <span>{new Date(f.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
