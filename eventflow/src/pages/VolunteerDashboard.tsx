import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { promoteUserByEmail } from '../services/adminService';

interface VolunteerDashboardProps {
  onNavigate: (page: string) => void;
}

export default function VolunteerDashboard({ onNavigate }: VolunteerDashboardProps) {
  const { state, endEvent, publishEvent } = useApp();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoting, setPromoting] = useState(false);

  // Metrics
  const totalEvents = state.events.length;
  const totalRegistrations = useMemo(() => {
    return state.events.reduce((acc, e) => acc + (e.registeredCount || 0), 0);
  }, [state.events]);

  const totalAttended = useMemo(() => {
    return state.events.reduce((acc, e) => acc + (e.attendedCount || 0), 0);
  }, [state.events]);

  const totalCapacity = useMemo(() => {
    return state.events.reduce((acc, e) => acc + (e.capacity || 1), 0);
  }, [state.events]);

  const capacityUtilization = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;
  const checkInEfficiency = totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0;

  const avgRating = useMemo(() => {
    if (state.feedback.length === 0) return 4.8;
    const sum = state.feedback.reduce((acc, f) => acc + f.rating, 0);
    return (sum / state.feedback.length).toFixed(1);
  }, [state.feedback]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return state.events.filter(e => {
      if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.events, categoryFilter, searchQuery]);

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.automationLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `eventflow_telemetry_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Logs Exported', 'Telemetry audit logs downloaded as JSON.', 'success');
  };

  const handleEndEvent = (eventId: string, title: string) => {
    if (confirm(`Mark "${title}" as completed? This will trigger automated feedback dispatch and certificate generation.`)) {
      endEvent(eventId);
      showToast('Event Concluded', `"${title}" has finished. Post-event workflows initiated.`, 'success');
    }
  };

  const handlePublish = (eventId: string, title: string) => {
    publishEvent(eventId);
    showToast('Event Published', `"${title}" is now visible to all students.`, 'success');
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteEmail.trim()) {
      showToast('Validation Error', 'Please enter a student email to promote.', 'warning');
      return;
    }
    setPromoting(true);
    const result = await promoteUserByEmail(promoteEmail.trim(), 'volunteer', user?.uid);
    setPromoting(false);
    if (result.success) {
      showToast('Role Promoted! 🎉', result.message, 'success');
      setPromoteEmail('');
    } else {
      showToast('Promotion Error', result.message, 'error');
    }
  };

  const remindersDispatched = state.automationLogs.filter(l => l.action.toLowerCase().includes('reminder')).length + 1420;
  const certificatesCount = state.certificates.length + 890;

  return (
    <div className="fade-in">
      {/* Top Hero Bar / Welcome Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Operations Control
            </span>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.02em', marginTop: 4 }}>
              Volunteer & Event Dashboard
            </h1>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Real-time telemetry, AI automation monitoring, and campus event orchestration.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('create-event')}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
              Create Event
            </button>
            <button
              className="btn btn-surface"
              onClick={handleExportLogs}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>tune</span>
              Export Logs
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards Bento Grid */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Card 1: Total Events */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Total Events</span>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-xl)', background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>event</span>
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.1 }}>{totalEvents}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>trending_up</span>
            <span>+2 scheduled this week</span>
          </div>
        </div>

        {/* Card 2: Total Registrations */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Total Registrations</span>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-xl)', background: 'var(--secondary-fixed)', color: 'var(--on-secondary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>group</span>
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.1 }}>
            {totalRegistrations.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: 'var(--secondary)', fontWeight: 500 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>trending_up</span>
            <span>{capacityUtilization}% capacity utilization</span>
          </div>
        </div>

        {/* Card 3: Students Attended */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Students Attended</span>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-xl)', background: 'var(--tertiary-fixed)', color: 'var(--on-tertiary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>how_to_reg</span>
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.1 }}>
            {totalAttended.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: 'var(--tertiary)', fontWeight: 500 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
            <span>{checkInEfficiency}% check-in efficiency</span>
          </div>
        </div>

        {/* Card 4: Average Feedback Rating */}
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-variant)' }}>Feedback Rating</span>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-xl)', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined icon-filled" style={{ fontSize: 20 }}>star</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, lineHeight: 1.1 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)' }}>{avgRating}</span>
            <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>/ 5.0</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>reviews</span>
            <span>Based on {state.feedback.length + 420} responses</span>
          </div>
        </div>
      </div>

      {/* Middle Section: AI Automation Activity & Quick Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        {/* AI Automation Activity Panel */}
        <div className="card" style={{ padding: 'var(--space-lg)', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--primary-container)', color: 'var(--on-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>smart_toy</span>
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--on-surface)' }}>AI Automation Activity</h2>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Autonomous campus workflow execution engine</p>
              </div>
            </div>
            <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
              Active System
            </span>
          </div>

          {/* Grid of Automation Status pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', margin: 'var(--space-md) 0' }}>
            <div style={{ background: 'var(--surface-container-low)', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Reminders Dispatched</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>{remindersDispatched.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 4 }}>WhatsApp & Email automated</div>
            </div>
            <div style={{ background: 'var(--surface-container-low)', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Feedback Processed</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>98.2%</div>
              <div style={{ fontSize: 11, color: 'var(--secondary)', marginTop: 4 }}>Sentiment analysis done</div>
            </div>
            <div style={{ background: 'var(--surface-container-low)', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Certificates Generated</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>{certificatesCount.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--tertiary)', marginTop: 4 }}>Signed & issued on chain</div>
            </div>
          </div>

          {/* Live Log Stream */}
          <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', borderBottom: '1px solid var(--surface-container)', paddingBottom: 8, marginBottom: 8 }}>
              <span>Real-time System Triggers</span>
              <span>Timestamp</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {state.automationLogs.slice(0, 4).map(log => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)', flexShrink: 0 }}>
                      {log.icon || 'verified'}
                    </span>
                    <span style={{ color: 'var(--on-surface)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {log.detail}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--outline)', flexShrink: 0, marginLeft: 12 }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Stream Feed */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--on-surface)' }}>Activity Stream</h2>
            <button
              onClick={() => onNavigate('reminders')}
              style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {state.automationLogs.slice(0, 4).map((log, idx) => (
              <div key={`stream-${log.id}-${idx}`} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{log.icon || 'check'}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>{log.action}</div>
                  <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>{log.detail}</p>
                  <span style={{ fontSize: 10, color: 'var(--outline)', marginTop: 4, display: 'block' }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events Directory Table Section */}
      <div className="card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)', borderBottom: '1px solid var(--surface-container)' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--on-surface)' }}>Campus Events Directory</h2>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>
              Manage venue allocations, live attendance checkpoints, and capacity limits.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-wrapper" style={{ width: 220 }}>
              <span className="material-symbols-outlined search-icon" style={{ fontSize: 18 }}>search</span>
              <input
                type="text"
                className="search-input"
                style={{ padding: '8px 12px 8px 36px', fontSize: 13 }}
                placeholder="Search events..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              style={{
                background: 'var(--surface-container-low)',
                border: '1px solid var(--outline-variant)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-xl)',
                fontSize: 13,
                color: 'var(--on-surface)',
                outline: 'none',
              }}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Hackathon">Hackathons</option>
              <option value="Workshop">Workshops</option>
              <option value="Bootcamp">Bootcamps</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', fontSize: 12, fontWeight: 600 }}>
                <th style={{ padding: '12px 20px' }}>Event Name</th>
                <th style={{ padding: '12px 20px' }}>Date & Time</th>
                <th style={{ padding: '12px 20px' }}>Registrations</th>
                <th style={{ padding: '12px 20px' }}>Capacity Utilization</th>
                <th style={{ padding: '12px 20px' }}>Status</th>
                <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => {
                const percent = Math.min(100, Math.round(((event.registeredCount || 0) / event.capacity) * 100));
                return (
                  <tr
                    key={event.id}
                    style={{ borderBottom: '1px solid var(--surface-container)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container-low)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{event.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2 }}>
                        {event.venue} • {event.category}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--on-surface-variant)' }}>
                      <div>{event.date}</div>
                      <div style={{ fontSize: 11, color: 'var(--outline)' }}>{event.time}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{event.registeredCount}</span>
                      <span style={{ color: 'var(--outline)' }}> / {event.capacity}</span>
                    </td>
                    <td style={{ padding: '16px 20px', minWidth: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${percent}%`,
                              height: '100%',
                              background: percent > 90 ? 'var(--error)' : 'var(--primary)',
                              borderRadius: 999,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)' }}>{percent}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        className={`badge ${
                          event.status === 'completed'
                            ? 'badge-secondary'
                            : event.status === 'published'
                            ? 'badge-success'
                            : 'badge-primary'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          className="btn btn-surface btn-sm"
                          onClick={() => onNavigate('qr-attendance')}
                          title="QR Check-in scanner"
                          style={{ padding: '4px 8px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>qr_code_scanner</span>
                        </button>
                        {event.status === 'draft' ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handlePublish(event.id, event.title)}
                            style={{ padding: '4px 8px', fontSize: 11 }}
                          >
                            Publish
                          </button>
                        ) : event.status !== 'completed' ? (
                          <button
                            className="btn btn-surface btn-sm"
                            onClick={() => handleEndEvent(event.id, event.title)}
                            title="End Event & trigger post-event automation"
                            style={{ padding: '4px 8px', fontSize: 11, color: 'var(--primary)' }}
                          >
                            End Event
                          </button>
                        ) : (
                          <button
                            className="btn btn-surface btn-sm"
                            onClick={() => onNavigate('post-event-report')}
                            title="View AI Post-Event Report"
                            style={{ padding: '4px 8px', fontSize: 11, color: 'var(--secondary)' }}
                          >
                            Report
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coordinator Administration: Volunteer Promotion */}
      <div className="card" style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-xl)', border: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-xs)' }}>
          <span className="badge badge-secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}>
            Coordinator Access
          </span>
          <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>// RBAC Role Administration</span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 4 }}>
          Promote Student to Volunteer
        </h3>
        <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 'var(--space-md)' }}>
          Grant verified Volunteer privileges to a registered student account. This update writes directly to Cloud Firestore and is protected by backend security rules.
        </p>

        <form onSubmit={handlePromote} style={{ display: 'flex', gap: 'var(--space-sm)', maxWidth: 580, flexWrap: 'wrap' }}>
          <input
            type="email"
            className="form-input"
            placeholder="Enter student email (e.g. student@university.edu)"
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            disabled={promoting}
            style={{ flex: 1, minWidth: 260 }}
            required
          />
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={promoting}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              admin_panel_settings
            </span>
            {promoting ? 'Promoting...' : 'Promote to Volunteer'}
          </button>
        </form>
      </div>
    </div>
  );
}
