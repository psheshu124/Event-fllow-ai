import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

interface ScanResult {
  type: 'ready' | 'success' | 'duplicate' | 'invalid';
  title: string;
  description: string;
  timestamp: string;
}

export default function QRAttendance() {
  const { state, checkIn, dispatch } = useApp();
  const { showToast } = useToast();

  const [selectedEventId, setSelectedEventId] = useState<string>(
    state.events[0]?.id || 'event-hackathon-001'
  );
  const [manualInput, setManualInput] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult>({
    type: 'ready',
    title: 'Ready to Scan',
    description: 'Align attendee QR code or enter a registration ID to verify participant entry.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const selectedEvent = state.events.find(e => e.id === selectedEventId) || state.events[0];

  // Registrations for the selected event
  const eventRegistrations = useMemo(() => {
    return state.registrations.filter(r => r.eventId === selectedEventId);
  }, [state.registrations, selectedEventId]);

  const registeredCount = selectedEvent ? selectedEvent.registeredCount : 0;
  const attendedCount = selectedEvent ? selectedEvent.attendedCount : 0;
  const remainingCount = Math.max(0, registeredCount - attendedCount);

  // Recent check-ins list
  const recentCheckins = useMemo(() => {
    return eventRegistrations
      .filter(r => r.status === 'attended')
      .slice(-8)
      .reverse();
  }, [eventRegistrations]);

  const handleVerifyToken = (tokenOrId: string) => {
    const trimmed = tokenOrId.trim();
    if (!trimmed) {
      showToast('Empty Input', 'Please enter a registration pass token or student ID.', 'warning');
      return;
    }

    // Find registration matching either passToken, id, or studentId
    const reg = state.registrations.find(
      r =>
        r.eventId === selectedEventId &&
        (r.passToken.toLowerCase() === trimmed.toLowerCase() ||
          r.id.toLowerCase() === trimmed.toLowerCase() ||
          r.studentId.toLowerCase() === trimmed.toLowerCase() ||
          `#${r.studentId.slice(-4)}` === trimmed)
    );

    if (!reg) {
      setScanResult({
        type: 'invalid',
        title: 'Invalid Registration',
        description: `Pass code "${trimmed}" was not found in the attendee roster for ${selectedEvent?.title}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      showToast('Invalid Code', 'Pass token not recognized in attendee directory.', 'error');
      return;
    }

    if (reg.status === 'attended') {
      setScanResult({
        type: 'duplicate',
        title: 'Duplicate Check-in Alert',
        description: `${reg.studentName} (${reg.passToken}) was already checked in at ${
          reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'earlier'
        }.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      showToast('Duplicate Pass', `${reg.studentName} has already checked in!`, 'warning');
      return;
    }

    // Perform check-in
    const result = checkIn(reg.passToken, selectedEventId);
    if (result.success) {
      setScanResult({
        type: 'success',
        title: 'Attendance Confirmed ✓',
        description: `${reg.studentName} (${reg.passToken}) verified successfully for ${selectedEvent?.title}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      showToast('Check-in Confirmed! 🎉', `${reg.studentName} verified.`, 'success');
      setManualInput('');
    } else {
      setScanResult({
        type: 'invalid',
        title: 'Check-in Error',
        description: result.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      showToast('Error', result.message, 'error');
    }
  };

  // Quick Simulations
  const handleSimulateAlex = () => {
    // Find Alex's registration for this event or create one
    let alexReg = state.registrations.find(
      r => r.studentId === state.currentStudentId && r.eventId === selectedEventId
    );
    if (!alexReg) {
      // Auto register Alex for quick testing
      const token = `PASS-${Date.now().toString(16).toUpperCase()}`;
      alexReg = {
        id: `reg-alex-${Date.now()}`,
        eventId: selectedEventId,
        studentId: state.currentStudentId,
        studentName: state.currentStudentName,
        studentEmail: 'alex.chen@university.edu',
        status: 'confirmed',
        passToken: token,
        registeredAt: new Date().toISOString(),
        isSeedData: false,
      };
      dispatch({ type: 'ADD_REGISTRATION', registration: alexReg });
    }
    handleVerifyToken(alexReg.passToken);
  };

  const handleSimulateRandom = () => {
    const unChecked = eventRegistrations.find(r => r.status !== 'attended');
    if (unChecked) {
      handleVerifyToken(unChecked.passToken);
    } else {
      showToast('All Checked In', 'Every registered student has already checked in for this event.', 'info');
    }
  };

  const handleSimulateDuplicate = () => {
    const checked = eventRegistrations.find(r => r.status === 'attended');
    if (checked) {
      handleVerifyToken(checked.passToken);
    } else {
      showToast('No Prior Check-ins', 'Check in at least one participant first to test duplicate detection.', 'info');
    }
  };

  const handleSimulateInvalid = () => {
    handleVerifyToken('INVALID-PASS-9999');
  };

  return (
    <div className="fade-in">
      {/* Top Bar & Event Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Volunteer Operations
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
            QR Attendance Scanner
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            style={{
              minWidth: 260,
              background: 'var(--surface-container-low)',
              color: 'var(--on-surface)',
              border: '1.5px solid var(--outline-variant)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-xl)',
              fontSize: 14,
              fontWeight: 500,
              outline: 'none',
            }}
            value={selectedEventId}
            onChange={e => {
              setSelectedEventId(e.target.value);
              setScanResult({
                type: 'ready',
                title: 'Ready to Scan',
                description: 'Switched event venue. Align QR code to begin scan.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
            }}
          >
            {state.events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.venue})
              </option>
            ))}
          </select>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--surface-container-low)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-xl)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--on-surface)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#10B981' }}>videocam</span>
            <span>Camera Active</span>
          </div>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid-3" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Registered
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>group</span>
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)' }}>{registeredCount}</div>
        </div>

        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Checked-In
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: '#D1FAE5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined icon-filled" style={{ fontSize: 20 }}>how_to_reg</span>
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>{attendedCount}</div>
        </div>

        <div className="card bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Remaining
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--surface-container)', color: 'var(--tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>pending_actions</span>
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--tertiary)' }}>{remainingCount}</div>
        </div>
      </div>

      {/* Main Scanner & Manual Verification Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
        {/* Central Scanner Area */}
        <div
          style={{
            background: 'var(--inverse-surface)',
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            minHeight: 440,
            boxShadow: 'var(--shadow-md)',
            gridColumn: 'span 2',
          }}
        >
          {/* Simulated Camera View Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.25,
            }}
          />

          {/* Scanner Viewfinder Overlay */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-xl)',
            }}
          >
            <div
              style={{
                width: 240,
                height: 240,
                border: '2px solid rgba(192, 193, 255, 0.4)',
                borderRadius: 'var(--radius-2xl)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(70, 72, 212, 0.1)',
                backdropFilter: 'blur(2px)',
              }}
            >
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTop: '4px solid var(--primary-fixed)', borderLeft: '4px solid var(--primary-fixed)', borderTopLeftRadius: 8 }} />
              <div style={{ position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderTop: '4px solid var(--primary-fixed)', borderRight: '4px solid var(--primary-fixed)', borderTopRightRadius: 8 }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, borderBottom: '4px solid var(--primary-fixed)', borderLeft: '4px solid var(--primary-fixed)', borderBottomLeftRadius: 8 }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottom: '4px solid var(--primary-fixed)', borderRight: '4px solid var(--primary-fixed)', borderBottomRightRadius: 8 }} />

              {/* Scanning laser beam animation */}
              <div
                style={{
                  width: '90%',
                  height: 3,
                  background: 'linear-gradient(90deg, transparent, #818CF8, #4648D4, #818CF8, transparent)',
                  position: 'absolute',
                  boxShadow: '0 0 12px #818CF8',
                  animation: 'float 2s infinite ease-in-out',
                }}
              />

              <span className="material-symbols-outlined" style={{ fontSize: 52, color: 'var(--primary-fixed-dim)', opacity: 0.8 }}>
                qr_code_scanner
              </span>
            </div>

            <p style={{ color: 'var(--inverse-on-surface)', marginTop: 'var(--space-md)', fontSize: 14, fontWeight: 500, textAlign: 'center' }}>
              Align attendee QR code pass within the viewfinder frame
            </p>
          </div>

          {/* Scanner Bottom Action Bar */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              background: 'rgba(30, 33, 35, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: 'var(--space-md) var(--space-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-md)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--inverse-on-surface)', fontSize: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span>Laser Viewfinder Active</span>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSimulateAlex}
                title="Verify current student (Alex Chen)"
                style={{ fontSize: 11, padding: '6px 12px' }}
              >
                Scan Alex Chen
              </button>
              <button
                className="btn btn-surface btn-sm"
                onClick={handleSimulateRandom}
                title="Verify next waiting student"
                style={{ fontSize: 11, padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: 'white' }}
              >
                Simulate Scan
              </button>
              <button
                className="btn btn-surface btn-sm"
                onClick={handleSimulateDuplicate}
                title="Simulate already scanned code"
                style={{ fontSize: 11, padding: '6px 12px', background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D' }}
              >
                Duplicate
              </button>
              <button
                className="btn btn-surface btn-sm"
                onClick={handleSimulateInvalid}
                title="Simulate invalid ticket"
                style={{ fontSize: 11, padding: '6px 12px', background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5' }}
              >
                Invalid
              </button>
            </div>
          </div>
        </div>

        {/* Manual Input & Verification Status Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {/* Manual Input Card */}
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 'var(--space-md)' }}>
              Manual Pass Verification
            </h2>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--on-surface-variant)', marginBottom: 6 }}>
                Registration ID or Pass Token
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="input"
                  style={{ flex: 1, fontSize: 13 }}
                  placeholder="e.g. HACK-A000 or Alex"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyToken(manualInput)}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => handleVerifyToken(manualInput)}
                  style={{ whiteSpace: 'nowrap', fontSize: 13, padding: '8px 16px' }}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Result State Card */}
          <div
            className="card"
            style={{
              padding: 'var(--space-lg)',
              transition: 'all 0.2s',
              border:
                scanResult.type === 'success'
                  ? '1.5px solid #10B981'
                  : scanResult.type === 'duplicate'
                  ? '1.5px solid #F59E0B'
                  : scanResult.type === 'invalid'
                  ? '1.5px solid #EF4444'
                  : '1px solid var(--outline-variant)',
              background:
                scanResult.type === 'success'
                  ? 'rgba(16, 185, 129, 0.06)'
                  : scanResult.type === 'duplicate'
                  ? 'rgba(245, 158, 11, 0.06)'
                  : scanResult.type === 'invalid'
                  ? 'rgba(239, 68, 68, 0.06)'
                  : 'var(--surface-container-low)',
            }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background:
                    scanResult.type === 'success'
                      ? '#D1FAE5'
                      : scanResult.type === 'duplicate'
                      ? '#FEF3C7'
                      : scanResult.type === 'invalid'
                      ? '#FEE2E2'
                      : 'var(--primary-fixed)',
                  color:
                    scanResult.type === 'success'
                      ? '#065F46'
                      : scanResult.type === 'duplicate'
                      ? '#92400E'
                      : scanResult.type === 'invalid'
                      ? '#991B1B'
                      : 'var(--on-primary-fixed)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                  {scanResult.type === 'success'
                    ? 'check_circle'
                    : scanResult.type === 'duplicate'
                    ? 'warning'
                    : scanResult.type === 'invalid'
                    ? 'error'
                    : 'info'}
                </span>
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color:
                      scanResult.type === 'success'
                        ? '#065F46'
                        : scanResult.type === 'duplicate'
                        ? '#92400E'
                        : scanResult.type === 'invalid'
                        ? '#991B1B'
                        : 'var(--on-surface)',
                  }}
                >
                  {scanResult.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4, lineHeight: 1.4 }}>
                  {scanResult.description}
                </p>
                <div style={{ fontSize: 11, color: 'var(--outline)', marginTop: 8 }}>
                  Telemetry recorded at {scanResult.timestamp}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats & Fast-pass banner */}
          <div
            style={{
              background: 'var(--primary-fixed)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              color: 'var(--on-primary-fixed)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>bolt</span>
              <span>Fast-pass QR auto-verifier active</span>
            </div>
            <span style={{ fontWeight: 600 }}>Active</span>
          </div>
        </div>
      </div>

      {/* Recent Check-ins List Table */}
      <div className="card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-container)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--on-surface)' }}>
            Recent Verified Attendees ({attendedCount})
          </h2>
          <span style={{ fontSize: 12, color: 'var(--outline)' }}>Live Real-Time Log</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', fontSize: 12, fontWeight: 600 }}>
                <th style={{ padding: '12px 20px' }}>Participant</th>
                <th style={{ padding: '12px 20px' }}>Reg Pass Token</th>
                <th style={{ padding: '12px 20px' }}>Timestamp</th>
                <th style={{ padding: '12px 20px' }}>Verification Method</th>
                <th style={{ padding: '12px 20px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCheckins.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--outline)' }}>
                    No check-ins recorded yet for this event. Scan an attendee pass above!
                  </td>
                </tr>
              ) : (
                recentCheckins.map(reg => (
                  <tr
                    key={reg.id}
                    style={{ borderBottom: '1px solid var(--surface-container)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container-low)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--primary-fixed)',
                            color: 'var(--on-primary-fixed)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {reg.studentName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{reg.studentName}</div>
                          <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{reg.studentEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                      {reg.passToken}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--on-surface-variant)' }}>
                      {reg.checkedInAt
                        ? new Date(reg.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : '10:42 AM'}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--on-surface-variant)' }}>
                      QR Scan Viewfinder
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                        Attendance Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
