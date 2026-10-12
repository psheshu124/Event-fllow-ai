import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { processMessage, generateId } from '../services/orchestrator';
import { ChatMessage, EventCardData } from '../types';

const EXAMPLE_QUERIES = [
  { icon: 'event', text: 'What AI events are coming up?' },
  { icon: 'chair', text: 'Which events have available seats?' },
  { icon: 'confirmation_number', text: 'What events am I registered for?' },
  { icon: 'app_registration', text: 'Register me for the AI Hackathon' },
  { icon: 'calendar_month', text: 'When is my next event?' },
  { icon: 'card_membership', text: 'Show my certificates' },
];

function EventCardPreview({ card }: { card: EventCardData }) {
  return (
    <div style={{ padding: 12, background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)' }}>{card.title}</div>
        <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2 }}>{card.date} • {card.venue}</div>
      </div>
      <span className={`badge ${card.seatsLeft > 0 ? 'badge-primary' : 'badge-error'}`} style={{ fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>
        {card.seatsLeft > 0 ? `${card.seatsLeft} seats` : 'Full'}
      </span>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Parse simple markdown bold
  const parseContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} style={{ background: 'rgba(0,0,0,0.1)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>{part.slice(1, -1)}</code>;
      }
      // Render newlines
      return part.split('\n').map((line, j, arr) => (
        <span key={`${i}-${j}`}>{line}{j < arr.length - 1 ? <br /> : null}</span>
      ));
    });
  };

  return (
    <div className={`chat-row${isUser ? ' chat-row-user' : ''}`}>
      <div className={`chat-avatar ${isUser ? 'chat-avatar-user' : 'chat-avatar-ai'}`}>
        <span className={`material-symbols-outlined ${isUser ? '' : 'icon-filled'}`} style={{ fontSize: 14 }}>
          {isUser ? 'person' : 'smart_toy'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
        <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{parseContent(msg.content)}</div>
          {msg.eventCards && msg.eventCards.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {msg.eventCards.map(card => (
                <EventCardPreview key={card.eventId} card={card} />
              ))}
            </div>
          )}
        </div>
        <span className="chat-time">{timeStr}</span>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const { state, dispatch, registerForEvent } = useApp();
  const { showToast } = useToast();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatHistory]);

  // Add greeting on first visit
  useEffect(() => {
    if (state.chatHistory.length === 0) {
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        message: {
          id: generateId(),
          role: 'assistant',
          content: `Hello ${state.currentStudentName}! I'm your EventFlow AI assistant 👋\n\nI can help you discover events, check available seats, register for events, view your schedule, and check your certificates.\n\nHow can I help you today?`,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, []);

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_CHAT_MESSAGE', message: userMsg });
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const result = processMessage(msg, state, (eventId) => {
        const res = registerForEvent(eventId);
        if (res.success) showToast('Registration Successful! 🎉', res.message, 'success');
        else showToast('Registration Failed', res.message, 'error');
        return res;
      });

      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: result.text,
        timestamp: new Date().toISOString(),
        eventCards: result.eventCards,
      };

      dispatch({ type: 'ADD_CHAT_MESSAGE', message: aiMsg });
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 'var(--space-xl)', height: 'calc(100vh - 120px)' }}>
      {/* Chat Panel */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
        {/* Chat Header */}
        <div style={{ padding: 'var(--space-lg)', background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--outline-variant)' }}>
          <div className="flex items-center gap-md">
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined icon-filled" style={{ color: 'white', fontSize: 20 }}>smart_toy</span>
            </div>
            <div>
              <h2 style={{ fontWeight: 600, fontSize: 16, color: 'var(--on-surface)' }}>EventFlow AI Assistant</h2>
              <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28A745', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Online • Ready to help
              </p>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => dispatch({ type: 'CLEAR_CHAT' })}
            title="Clear chat"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {state.chatHistory.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isTyping && (
            <div className="chat-row">
              <div className="chat-avatar chat-avatar-ai">
                <span className="material-symbols-outlined icon-filled" style={{ fontSize: 14 }}>smart_toy</span>
              </div>
              <div className="chat-bubble chat-bubble-ai" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--outline)', animation: 'pulse 1s infinite 0s' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--outline)', animation: 'pulse 1s infinite 0.2s' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--outline)', animation: 'pulse 1s infinite 0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div style={{ padding: '0 var(--space-lg) var(--space-sm)', background: 'var(--surface-container-low)' }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
            {EXAMPLE_QUERIES.map(q => (
              <button
                key={q.text}
                className="chip chip-default"
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => handleSend(q.text)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)' }}>{q.icon}</span>
                {q.text}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: 'var(--space-md) var(--space-lg)', background: 'var(--surface-container-low)', borderTop: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '6px 6px 6px 16px', boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--outline-variant)' }}>
            <input
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: 'var(--on-surface)' }}
              placeholder="Ask about events, seating, schedules..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            <button
              className="btn btn-primary btn-icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              style={{ width: 38, height: 38, borderRadius: 'var(--radius-lg)', flexShrink: 0 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>bolt</span>
            Quick Inquiries
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: 'event_seat', label: 'Seat Availability', q: 'Which events have available seats?' },
              { icon: 'fact_check', label: 'My Registrations', q: 'What events am I registered for?' },
              { icon: 'military_tech', label: 'My Certificates', q: 'Show my certificates' },
              { icon: 'calendar_month', label: 'Upcoming Schedule', q: 'When is my next event?' },
            ].map(item => (
              <div
                key={item.label}
                style={{ padding: 12, background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.1s', gap: 8 }}
                onClick={() => handleSend(item.q)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-container)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-container-low)'}
              >
                <div className="flex items-center gap-sm">
                  <div className="icon-bg-primary stat-card-icon" style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', fontSize: 16 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{item.icon}</span>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--on-surface)' }}>{item.label}</span>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>arrow_forward</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tip */}
        <div style={{ background: 'linear-gradient(135deg, rgba(70,72,212,0.08), rgba(247,249,251,0))', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)', border: '1px solid var(--primary-fixed-dim)' }}>
          <div className="flex items-center gap-sm mb-sm">
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 20 }}>lightbulb</span>
            <h4 style={{ fontWeight: 600, fontSize: 14 }}>AI Tip</h4>
          </div>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
            You can ask the assistant to register you directly: try "Register me for the AI Hackathon" and it will handle the validation and confirmation automatically!
          </p>
        </div>
      </div>
    </div>
  );
}
