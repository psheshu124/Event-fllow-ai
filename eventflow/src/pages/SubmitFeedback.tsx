import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function SubmitFeedback() {
  const { state, submitFeedback } = useApp();
  const { showToast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState<string[]>([]);

  // Events the student attended
  const attendedEvents = useMemo(() => {
    return state.registrations
      .filter(r => r.studentId === state.currentStudentId && r.status === 'attended')
      .map(r => {
        const event = state.events.find(e => e.id === r.eventId);
        const alreadyFeedback = state.feedback.some(f => f.eventId === r.eventId && f.studentId === state.currentStudentId);
        return { reg: r, event, alreadyFeedback };
      })
      .filter(({ event }) => !!event);
  }, [state.registrations, state.events, state.feedback, state.currentStudentId]);

  // Eligible but awaiting feedback
  const awaitingFeedback = attendedEvents.filter(({ alreadyFeedback }) => !alreadyFeedback);

  const handleSubmit = () => {
    if (!selectedEventId) { showToast('Select an event', 'Please choose which event to review.', 'warning'); return; }
    if (rating === 0) { showToast('Rating required', 'Please select a star rating.', 'warning'); return; }
    if (comment.trim().length < 10) { showToast('Comment too short', 'Please write at least 10 characters.', 'warning'); return; }

    const result = submitFeedback(selectedEventId, rating, comment);
    if (result.success) {
      showToast('Feedback Submitted! 🎉', result.message, 'success');
      setSubmitted(prev => [...prev, selectedEventId]);
      setSelectedEventId('');
      setRating(0);
      setComment('');
    } else {
      showToast('Submission Failed', result.message, 'error');
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-label">Feedback</div>
        <h1 className="page-title">Submit Event Feedback</h1>
        <p className="page-subtitle">Share your experience and earn your certificate of participation.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        {/* Feedback Form */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Rate Your Experience</h2>

          {awaitingFeedback.length === 0 && submitted.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><span className="material-symbols-outlined" style={{ fontSize: 48 }}>rate_review</span></div>
              <div className="empty-state-title">No feedback pending</div>
              <div className="empty-state-text">
                Feedback can be submitted after attending an event and the event ends.
              </div>
            </div>
          ) : (
            <>
              {/* Event Selector */}
              <div className="form-group mb-lg">
                <label className="form-label">Select Event *</label>
                <select
                  className="form-select"
                  value={selectedEventId}
                  onChange={e => setSelectedEventId(e.target.value)}
                >
                  <option value="">Choose an event...</option>
                  {awaitingFeedback.map(({ event }) => (
                    <option key={event!.id} value={event!.id}>{event!.title}</option>
                  ))}
                </select>
              </div>

              {/* Star Rating */}
              <div className="form-group mb-lg">
                <label className="form-label">Overall Rating *</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`star material-symbols-outlined${(hoverRating || rating) >= star ? ' active icon-filled' : ''}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      star
                    </span>
                  ))}
                </div>
                {(hoverRating || rating) > 0 && (
                  <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, marginTop: 4 }}>
                    {ratingLabels[hoverRating || rating]}
                  </span>
                )}
              </div>

              {/* Comment */}
              <div className="form-group mb-lg">
                <label className="form-label">Your Feedback *</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  placeholder="Share what you enjoyed, what could be improved, and any suggestions for future events..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
                <div style={{ fontSize: 11, color: comment.length < 10 ? 'var(--error)' : 'var(--outline)', textAlign: 'right', marginTop: 4 }}>
                  {comment.length} characters (min 10)
                </div>
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={handleSubmit}
                disabled={!selectedEventId || rating === 0 || comment.length < 10}
                style={{ padding: '12px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                Submit Feedback
              </button>
            </>
          )}
        </div>

        {/* Status Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Already submitted */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--space-md)' }}>Feedback Submitted</h3>
            {attendedEvents.filter(({ alreadyFeedback }) => alreadyFeedback).length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--outline)' }}>No feedback submitted yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attendedEvents.filter(({ alreadyFeedback }) => alreadyFeedback).map(({ event }) => {
                  const myFb = state.feedback.find(f => f.eventId === event!.id && f.studentId === state.currentStudentId);
                  return (
                    <div key={event!.id} style={{ padding: 'var(--space-md)', background: 'rgba(40,167,69,0.06)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(40,167,69,0.2)' }}>
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>{event!.title}</span>
                        <span className="badge badge-success">Submitted ✓</span>
                      </div>
                      {myFb && (
                        <div style={{ marginTop: 6 }}>
                          <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`material-symbols-outlined icon-filled`} style={{ fontSize: 14, color: s <= myFb.rating ? '#FFB800' : 'var(--outline-variant)' }}>star</span>
                            ))}
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>"{myFb.comment.slice(0, 80)}..."</p>
                          <div style={{ marginTop: 4 }}>
                            {myFb.sentiment && (
                              <span className={`badge ${myFb.sentiment === 'positive' ? 'badge-success' : myFb.sentiment === 'negative' ? 'badge-error' : 'badge-surface'}`} style={{ fontSize: 10 }}>
                                {myFb.sentiment} sentiment
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Certificate info */}
          <div style={{ padding: 'var(--space-lg)', background: 'linear-gradient(135deg, rgba(70,72,212,0.07), rgba(247,249,251,0))', borderRadius: 'var(--radius-xl)', border: '1px solid var(--primary-fixed-dim)' }}>
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--primary)', fontSize: 20 }}>card_membership</span>
              <h4 style={{ fontWeight: 600, fontSize: 14 }}>Certificate Eligibility</h4>
            </div>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
              Certificates are automatically issued when:<br />
              ✓ Event is completed<br />
              ✓ Your attendance is marked<br />
              ✓ Feedback is submitted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
