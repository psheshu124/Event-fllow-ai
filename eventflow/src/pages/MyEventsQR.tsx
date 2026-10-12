import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';

// Simple deterministic QR pattern generator from string
function generateQRPattern(str: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (row + r < size && col + c < size) {
          const isEdge = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[row + r][col + c] = isEdge || isCenter;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);

  // Timing pattern
  for (let i = 8; i < 13; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Data fill based on string hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 9; r < size - 1; r++) {
    for (let c = 9; c < size - 1; c++) {
      if (!grid[r][c]) {
        const idx = r * size + c + hash;
        grid[r][c] = (idx * 1234567 + hash * 7654321) % 3 === 0;
      }
    }
  }

  return grid;
}

function QRCode({ token, size = 160 }: { token: string; size?: number }) {
  const pattern = useMemo(() => generateQRPattern(token), [token]);
  const cellSize = Math.floor(size / 21);

  return (
    <div style={{ display: 'inline-block', background: 'white', padding: 12, borderRadius: 'var(--radius-xl)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(21, ${cellSize}px)`, gap: 0 }}>
        {pattern.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: cellSize,
                height: cellSize,
                background: cell ? '#000' : '#fff',
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function MyEventsQR({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { state } = useApp();

  const myRegistrations = useMemo(() => {
    return state.registrations
      .filter(r => r.studentId === state.currentStudentId && r.status !== 'cancelled')
      .map(r => ({
        reg: r,
        event: state.events.find(e => e.id === r.eventId),
      }))
      .filter(({ event }) => !!event)
      .sort((a, b) => new Date(a.event!.date).getTime() - new Date(b.event!.date).getTime());
  }, [state.registrations, state.events, state.currentStudentId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'attended': return <span className="badge badge-success">Attended ✓</span>;
      case 'confirmed': return <span className="badge badge-primary">Confirmed</span>;
      case 'registered': return <span className="badge badge-secondary">Registered</span>;
      default: return <span className="badge badge-surface">{status}</span>;
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-label">My Events</div>
        <h1 className="page-title">My Events & QR Passes</h1>
        <p className="page-subtitle">All your registrations, QR passes, and event tickets.</p>
      </div>

      {myRegistrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--outline-variant)' }}>qr_code</span>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--on-surface)', marginTop: 'var(--space-md)' }}>No Events Yet</h2>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: 8 }}>Register for events on the Student Dashboard to get your QR passes here.</p>
          <button className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }} onClick={() => onNavigate('student-dashboard')}>
            Browse Events
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {myRegistrations.map(({ reg, event }) => (
            <div key={reg.id} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-xl)', alignItems: 'start' }}>
              {/* Event Info */}
              <div>
                <div className="flex items-center gap-sm mb-md">
                  {getStatusBadge(reg.status)}
                  <span style={{ fontSize: 12, color: 'var(--outline)' }}>Pass Token: </span>
                  <code style={{ fontSize: 12, background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', padding: '2px 8px', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontWeight: 600 }}>
                    {reg.passToken}
                  </code>
                </div>

                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 'var(--space-sm)' }}>{event!.title}</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                  {[
                    { icon: 'calendar_today', label: 'Date', value: new Date(event!.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) },
                    { icon: 'schedule', label: 'Time', value: event!.time },
                    { icon: 'location_on', label: 'Venue', value: event!.venue },
                    { icon: 'person', label: 'Registered', value: new Date(reg.registeredAt).toLocaleDateString('en-IN') },
                  ].map(item => (
                    <div key={item.label} style={{ padding: 'var(--space-md)', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)' }}>
                      <div className="flex items-center gap-xs mb-xs">
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)' }}>{item.icon}</span>
                        <span style={{ fontSize: 11, color: 'var(--outline)', fontWeight: 500 }}>{item.label}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {reg.checkedInAt && (
                  <div style={{ padding: 'var(--space-md)', background: 'rgba(40,167,69,0.08)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(40,167,69,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined icon-filled" style={{ color: '#28A745', fontSize: 18 }}>check_circle</span>
                    <span style={{ fontSize: 13, color: '#1E7E34', fontWeight: 500 }}>
                      Checked in at {new Date(reg.checkedInAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} on {new Date(reg.checkedInAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div style={{ textAlign: 'center' }}>
                <div className="qr-pass-card" style={{ padding: 'var(--space-lg)', minWidth: 200 }}>
                  <div style={{ marginBottom: 'var(--space-md)', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9, marginBottom: 4 }}>ENTRY PASS</div>
                    <div style={{ fontSize: 11, opacity: 0.75 }}>{state.currentStudentName}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                    <QRCode token={reg.passToken} size={140} />
                  </div>
                  <div style={{ marginTop: 'var(--space-md)', fontSize: 14, fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2, opacity: 0.9, position: 'relative', zIndex: 1 }}>
                    {reg.passToken}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
