import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { API_URL } from '../api';
import './embed.css';

export default function EmbedWidget() {
  const { agentId } = useParams();
  const [searchParams] = useSearchParams();
  const embedded = searchParams.get('embedded') === '1';

  const [agent, setAgent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/agents/${agentId}/public`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || 'Agent not available');
        }
        const data = await res.json();
        if (!cancelled) setAgent(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load agent');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [agentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, sending]);

  const send = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || sending) return;

    setSending(true);
    setError('');
    setMessage('');
    const optimistic = [...history, { role: 'user', content: text }];
    setHistory(optimistic);

    try {
      const res = await fetch(`${API_URL}/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Chat failed');
      setHistory(data.history || [...optimistic, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.message || 'Chat failed');
      setHistory(history);
      setMessage(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`embed-shell ${embedded ? 'is-embedded' : ''}`}>
      <header className="embed-header">
        <div>
          <p className="embed-kicker">VoiceAgent</p>
          <h1>{agent?.name || 'Loading…'}</h1>
          {agent?.description && <p className="embed-desc">{agent.description}</p>}
        </div>
        <span className="embed-live"><i /> Live</span>
      </header>

      <div className="embed-messages">
        {loading && <p className="embed-hint">Connecting agent…</p>}
        {!loading && history.length === 0 && !error && (
          <p className="embed-hint">
            Ask a question to start chatting with this agent.
          </p>
        )}
        {history.map((m, i) => (
          <div key={i} className={`embed-bubble ${m.role}`}>
            <span>{m.role === 'user' ? 'You' : agent?.name || 'Agent'}</span>
            <p>{m.content}</p>
          </div>
        ))}
        {sending && <p className="embed-hint">Thinking…</p>}
        {error && <p className="embed-error">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form className="embed-composer" onSubmit={send}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message…"
          disabled={loading || (!agent && !!error)}
          aria-label="Message"
        />
        <button type="submit" disabled={sending || !message.trim() || !agent}>
          Send
        </button>
      </form>
    </div>
  );
}
