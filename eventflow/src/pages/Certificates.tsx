import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Certificate } from '../types';

function CertificateView({ cert }: { cert: Certificate }) {
  return (
    <div className="certificate-card certificate-print">
      {/* Decorative corners */}
      <div style={{ position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderTop: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)', borderRadius: '4px 0 0 0', opacity: 0.4 }} />
      <div style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderTop: '2px solid var(--primary)', borderRight: '2px solid var(--primary)', borderRadius: '0 4px 0 0', opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: 16, left: 16, width: 40, height: 40, borderBottom: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)', borderRadius: '0 0 0 4px', opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: 16, right: 16, width: 40, height: 40, borderBottom: '2px solid var(--primary)', borderRight: '2px solid var(--primary)', borderRadius: '0 0 4px 0', opacity: 0.4 }} />

      <div style={{ position: 'relative', zIndex: 1, padding: 'var(--space-lg)' }}>
        {/* Seal */}
        <div className="cert-seal">
          <span className="material-symbols-outlined icon-filled" style={{ fontSize: 36, color: 'white' }}>workspace_premium</span>
        </div>

        {/* Header */}
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--outline)', marginBottom: 8 }}>
          EventFlow AI University Platform
        </div>
        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 'var(--space-lg)' }}>
          Certificate of Participation
        </div>

        {/* Recipient */}
        <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 8 }}>This is to certify that</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          {cert.studentName}
        </div>
        <div style={{ width: 120, height: 2, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', margin: '0 auto var(--space-md)', borderRadius: 999 }} />

        <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 6 }}>successfully participated in</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginBottom: 'var(--space-lg)' }}>{cert.eventTitle}</div>

        {/* Date */}
        <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 'var(--space-lg)' }}>
          Issued on {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        {/* Certificate Number */}
        <div style={{ padding: '6px 16px', background: 'var(--primary-fixed)', borderRadius: 'var(--radius-full)', display: 'inline-block' }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: 'var(--on-primary-fixed)' }}>
            {cert.certificateNumber}
          </span>
        </div>

        {/* Signature line */}
        <div style={{ marginTop: 'var(--space-xl)', display: 'flex', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 120, height: 1, background: 'var(--outline-variant)', marginBottom: 6 }} />
            <div style={{ fontSize: 11, color: 'var(--outline)' }}>Event Organizer</div>
            <div style={{ fontSize: 10, color: 'var(--outline)' }}>EventFlow AI Platform</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Certificates() {
  const { state } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  const myCerts = state.certificates.filter(c => c.studentId === state.currentStudentId);

  const handlePrint = (certId: string) => {
    const certEl = document.getElementById(`cert-${certId}`);
    if (!certEl) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: Inter, sans-serif; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
          .certificate-card { max-width: 600px; width: 100%; border: 2px solid #e1e0ff; border-radius: 16px; padding: 48px; text-align: center; position: relative; }
        </style>
      </head>
      <body>${certEl.outerHTML}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-label">Certificates</div>
        <h1 className="page-title">My Certificates</h1>
        <p className="page-subtitle">Your verified participation certificates from campus events.</p>
      </div>

      {myCerts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--outline-variant)' }}>card_membership</span>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--on-surface)', marginTop: 'var(--space-md)' }}>No certificates yet</h2>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: 8, maxWidth: 400, margin: '8px auto' }}>
            Certificates are issued when you attend an event and submit feedback. Complete the workflow to earn your first certificate!
          </p>
          <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 8, justifyContent: 'center' }}>
            <div style={{ padding: 'var(--space-md)', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', fontSize: 12, color: 'var(--on-surface-variant)' }}>
              1. Register for event
            </div>
            <span style={{ alignSelf: 'center', color: 'var(--outline)' }}>→</span>
            <div style={{ padding: 'var(--space-md)', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', fontSize: 12, color: 'var(--on-surface-variant)' }}>
              2. Attend & check in
            </div>
            <span style={{ alignSelf: 'center', color: 'var(--outline)' }}>→</span>
            <div style={{ padding: 'var(--space-md)', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', fontSize: 12, color: 'var(--on-surface-variant)' }}>
              3. Submit feedback
            </div>
            <span style={{ alignSelf: 'center', color: 'var(--outline)' }}>→</span>
            <div style={{ padding: 'var(--space-md)', background: 'var(--primary-fixed)', borderRadius: 'var(--radius-xl)', fontSize: 12, color: 'var(--on-primary-fixed)', fontWeight: 600 }}>
              🎓 Certificate!
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            <div className="stat-card">
              <div className="stat-card-glow" style={{ background: 'var(--primary-fixed)' }} />
              <div className="stat-card-icon icon-bg-primary" style={{ marginBottom: 'var(--space-md)' }}>
                <span className="material-symbols-outlined icon-filled">card_membership</span>
              </div>
              <div className="stat-value">{myCerts.length}</div>
              <div className="stat-label">Total Certificates</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-glow" style={{ background: 'var(--secondary-fixed)' }} />
              <div className="stat-card-icon icon-bg-secondary" style={{ marginBottom: 'var(--space-md)' }}>
                <span className="material-symbols-outlined">event</span>
              </div>
              <div className="stat-value">{new Set(myCerts.map(c => c.eventId)).size}</div>
              <div className="stat-label">Events Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-glow" style={{ background: 'var(--tertiary-fixed)' }} />
              <div className="stat-card-icon icon-bg-tertiary" style={{ marginBottom: 'var(--space-md)' }}>
                <span className="material-symbols-outlined">workspace_premium</span>
              </div>
              <div className="stat-value">100%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
          </div>

          {/* Certificates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 'var(--space-xl)' }}>
            {myCerts.map(cert => (
              <div key={cert.id}>
                <div id={`cert-${cert.id}`}>
                  <CertificateView cert={cert} />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={() => handlePrint(cert.id)}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
                    Print / Save PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
