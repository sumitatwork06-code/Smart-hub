import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BrainCircuit, X, MessageSquare } from 'lucide-react';
import botAvatar from '../assets/ai_helper_avatar.png';

export default function DecisionAI({ cityState }) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your Gemini-powered Decision Companion. Ask me to analyze the city's air quality, traffic flow, clean energy metrics, or recommend automation updates.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const chatEndRef = useRef(null);

  const toggleExpand = (idx) => {
    setExpandedSources(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Auto Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e, customText = null) => {
    if (e) e.preventDefault();
    const text = customText || inputValue;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    const query = text.toLowerCase();
    if (!customText) setInputValue('');
    setIsTyping(true);

    // Send request to backend Express chat api
    fetch(`http://${window.location.hostname}:3001/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: text }),
    })
      .then((res) => res.json())
      .then((data) => {
        const responseText = data.response || "No response received.";
        const aiMsg = {
          sender: 'ai',
          text: responseText,
          sources: data.sources || [],
          confidence: data.confidence || 'Low',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      })
      .catch((err) => {
        console.error("Error communicating with AI Decision server:", err);
        const errMsg = {
          sender: 'ai',
          text: "Sorry, I am having trouble connecting to the decision intelligence server. Make sure the backend server is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errMsg]);
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bot-avatar-glowing"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          border: 'none',
          background: 'none',
          padding: 0,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'transform 0.2s',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img src={botAvatar} alt="Decision Bot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </button>
    );
  }

  return (
    <div
      className="glass-panel"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '380px',
        height: '500px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(20, 180, 160, 0.05))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img src={botAvatar} alt="Bot Avatar" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid hsl(var(--color-teal))' }} />
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '-0.01em' }}>Decision AI Companion</h4>
            <span style={{ fontSize: '0.65rem', color: 'hsl(var(--color-teal))', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} /> Online (Gemini Core)
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Window */}
      <div
        style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {messages.map((msg, idx) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={idx}
              style={{
                alignSelf: isAI ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
                flexDirection: isAI ? 'row' : 'row-reverse',
              }}
            >
              {isAI && (
                <img src={botAvatar} alt="AI" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: isAI ? 'flex-start' : 'flex-end', width: '100%' }}>
                <div
                  style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: isAI ? '0px 12px 12px 12px' : '12px 12px 0px 12px',
                    background: isAI ? 'rgba(255, 255, 255, 0.04)' : 'rgba(99, 102, 241, 0.15)',
                    border: isAI ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(99, 102, 241, 0.25)',
                    fontSize: '0.82rem',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-line',
                    color: isAI ? 'hsl(var(--text-secondary))' : 'hsl(var(--text-primary))',
                  }}
                >
                  {msg.text}
                </div>

                {/* Collapsible Sources and Confidence */}
                {isAI && msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: '0.25rem', width: '100%' }}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'hsl(var(--color-teal))',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        outline: 'none',
                      }}
                    >
                      <span>{expandedSources[idx] ? '▼' : '►'} Sources & Confidence</span>
                      <span style={{
                        fontSize: '0.6rem',
                        padding: '1px 5px',
                        borderRadius: '8px',
                        background: msg.confidence === 'High' ? 'rgba(16, 185, 129, 0.12)' : msg.confidence === 'Medium' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.06)',
                        color: msg.confidence === 'High' ? '#10b981' : msg.confidence === 'Medium' ? '#f59e0b' : 'hsl(var(--text-muted))',
                        fontWeight: '800',
                        marginLeft: '4px'
                      }}>
                        {msg.confidence || 'Low'}
                      </span>
                    </button>
                    
                    {expandedSources[idx] && (
                      <div style={{
                        marginTop: '0.3rem',
                        padding: '0.4rem 0.5rem',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '6px',
                        fontSize: '0.65rem',
                        color: 'hsl(var(--text-muted))',
                        fontFamily: 'monospace',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        maxWidth: '100%',
                        overflowX: 'auto'
                      }}>
                        {msg.sources.map((src, sIdx) => (
                          <div key={sIdx} style={{ display: 'flex', gap: '3px' }}>
                            <span style={{ color: 'hsl(var(--color-teal))' }}>•</span>
                            <span>{src}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <span style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))' }}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '4px', padding: '0.5rem 0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
            <div style={typingDotStyle} />
            <div style={{ ...typingDotStyle, animationDelay: '0.2s' }} />
            <div style={{ ...typingDotStyle, animationDelay: '0.4s' }} />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Pills */}
      <div style={{ display: 'flex', gap: '0.4rem', padding: '0.5rem 0.75rem', overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10, 12, 20, 0.2)' }}>
        <button type="button" className="chat-pill" onClick={() => handleSend(null, "Run Diagnosis")}>Run Diagnosis</button>
        <button type="button" className="chat-pill" onClick={() => handleSend(null, "Optimize Solar")}>Optimize Solar</button>
        <button type="button" className="chat-pill" onClick={() => handleSend(null, "Check Traffic")}>Check Traffic</button>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 12, 20, 0.4)',
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask AI (e.g. 'Air Quality suggestions')"
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            color: '#fff',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--color-primary)), #4f46e5)',
            border: 'none',
            color: '#fff',
            padding: '0.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

const typingDotStyle = {
  width: '6px',
  height: '6px',
  background: 'hsl(var(--color-teal))',
  borderRadius: '50%',
  animation: 'pulse-glow 1.4s infinite ease-in-out',
};
