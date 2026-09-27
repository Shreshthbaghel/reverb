import { useEffect, useState } from 'react';

const LINES = [
  { role: 'agent', text: 'Hi, thanks for calling Northline Support. How can I help today?' },
  { role: 'caller', text: 'I need to reschedule my Tuesday appointment.' },
  { role: 'agent', text: 'Of course. I can move that to Thursday at 2:30 — does that work?' },
  { role: 'caller', text: 'Perfect, Thursday works.' },
  { role: 'agent', text: 'Done. You’ll get a confirmation SMS shortly.' },
];

export default function VoiceCallDemo() {
  const [visible, setVisible] = useState(0);
  const [bars, setBars] = useState(() => Array.from({ length: 28 }, () => 0.25));

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setVisible(LINES.length);
      return undefined;
    }

    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setVisible((v) => Math.min(LINES.length, v + 1));
      if (i >= LINES.length) clearInterval(timer);
    }, 900);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;

    const id = setInterval(() => {
      setBars(Array.from({ length: 28 }, () => 0.18 + Math.random() * 0.82));
    }, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="va-demo" aria-hidden="true">
      <div className="va-demo-chrome">
        <div className="va-demo-dots">
          <span />
          <span />
          <span />
        </div>
        <span className="va-demo-title">Live agent session</span>
        <span className="va-demo-live">
          <i />
          Live
        </span>
      </div>

      <div className="va-demo-meta">
        <div>
          <span className="va-demo-label">Agent</span>
          <strong>Support desk</strong>
        </div>
        <div>
          <span className="va-demo-label">Model</span>
          <strong>Groq · Llama 3.3</strong>
        </div>
        <div>
          <span className="va-demo-label">Latency</span>
          <strong>184 ms</strong>
        </div>
      </div>

      <div className="va-demo-wave" aria-hidden="true">
        {bars.map((h, idx) => (
          <span key={idx} style={{ height: `${Math.round(h * 100)}%` }} />
        ))}
      </div>

      <div className="va-demo-transcript">
        {LINES.slice(0, visible).map((line, idx) => (
          <div key={idx} className={`va-demo-line ${line.role}`}>
            <span className="va-demo-role">{line.role === 'agent' ? 'Agent' : 'Caller'}</span>
            <p>{line.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
