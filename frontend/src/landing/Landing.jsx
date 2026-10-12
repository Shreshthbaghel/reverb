import { Link } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';
import LandingNav from './LandingNav';
import LandingHero from './LandingHero';
import '../landing.css';

const PROBLEMS = [
  {
    n: '01',
    title: 'Agents without ops',
    body: 'Most demos stop at a chatbot reply. Real voice systems need prompts, transcripts, quality scores, and a place to manage them.',
  },
  {
    n: '02',
    title: 'Opaque call quality',
    body: 'Without structured logs and scoring, you cannot tell if an agent is helping callers or quietly failing.',
  },
  {
    n: '03',
    title: 'Paid APIs by default',
    body: 'Many stacks lock you into expensive LLM providers. This project routes inference through Groq so iteration stays free and fast.',
  },
];

const STEPS = [
  {
    kicker: '01 · Design',
    title: 'Configure the agent',
    body: 'Name the agent, attach a system prompt, and pick a use-case template — support, booking, real estate, or orders.',
    viz: 'config',
  },
  {
    kicker: '02 · Converse',
    title: 'Handle the call',
    body: 'Caller input is sent with conversation history to Groq. The agent replies with low latency using Llama 3.3.',
    viz: 'chat',
  },
  {
    kicker: '03 · Measure',
    title: 'Log and score',
    body: 'Every call is stored with transcript, duration, and a Groq-generated quality score so the console can surface real metrics.',
    viz: 'metrics',
  },
];

const FEATURES = [
  {
    title: 'Description → master prompt',
    body: 'Describe the agent in plain language; Groq drafts an editable system prompt you can refine before publishing.',
  },
  {
    title: 'One-line HTML embed',
    body: 'Copy a script or iframe tag into any site. Visitors chat with your agent through a hosted widget.',
  },
  {
    title: 'Call intelligence',
    body: 'Transcripts, success filters, duration, and response quality — ready for portfolio walkthroughs.',
  },
  {
    title: 'FastAPI backend',
    body: 'Typed routes, public chat API, SQLAlchemy models, CORS for embeds, and OpenAPI docs at /docs.',
  },
];

const USE_CASES = [
  { title: 'Customer support', tag: 'Inbound', body: 'Answer product questions, track orders, and escalate cleanly when confidence is low.' },
  { title: 'Appointment booking', tag: 'Scheduling', body: 'Collect name, slot, and reason — then confirm before writing anything down.' },
  { title: 'Restaurant orders', tag: 'Transactional', body: 'Walk through menu items, dietary notes, and pickup vs delivery without a human on the line.' },
];

const STACK = [
  { layer: 'Frontend', items: 'React 19 · Vite · Tailwind · Axios' },
  { layer: 'Backend', items: 'FastAPI · SQLAlchemy · Pydantic · Uvicorn' },
  { layer: 'AI', items: 'Groq API · Llama 3.3 70B · Transcript scoring' },
  { layer: 'Data', items: 'PostgreSQL · SQLite (local) · Docker Compose' },
];

function StepViz({ type }) {
  if (type === 'config') {
    return (
      <div className="lp-mini-panel">
        <div className="lp-mini-row"><span>Name</span><b>Support desk</b></div>
        <div className="lp-mini-row"><span>Status</span><b className="ok">active</b></div>
        <div className="lp-mini-prompt">You are a calm support agent. Confirm details before changing bookings…</div>
      </div>
    );
  }
  if (type === 'chat') {
    return (
      <div className="lp-mini-panel dark">
        <div className="lp-mini-chat">
          <span className="in">Caller → need to change my order</span>
          <span className="out">Agent → sure — what should we update?</span>
        </div>
        <div className="lp-mini-pill">Groq · llama-3.3-70b-versatile</div>
      </div>
    );
  }
  return (
    <div className="lp-mini-panel">
      <div className="lp-mini-metrics">
        <div><span>Quality</span><b>92%</b></div>
        <div><span>Duration</span><b>48s</b></div>
        <div><span>Sentiment</span><b>positive</b></div>
      </div>
    </div>
  );
}

function Reveal({ className = '', children }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="lp">
      <div className="lp-grain" aria-hidden="true" />
      <LandingNav />
      <LandingHero />

      <section className="lp-section" id="problem">
        <div className="lp-wrap">
          <Reveal className="lp-section-head reveal">
            <span className="lp-eyebrow">Why this exists</span>
            <h2>Voice agents need a real control plane.</h2>
            <p className="lp-lede">
              VoiceAgent is not a single chat script — it is a small platform that mirrors how production agent teams think about prompts, calls, and quality.
            </p>
          </Reveal>
          <Reveal className="lp-problem-grid reveal-stagger">
            {PROBLEMS.map((p) => (
              <article key={p.n} className="lp-problem-item">
                <span className="lp-mono">{p.n}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="lp-section lp-section-alt" id="how">
        <div className="lp-wrap">
          <Reveal className="lp-section-head reveal">
            <span className="lp-eyebrow">How it works</span>
            <h2>From prompt to scored call in three steps.</h2>
            <p className="lp-lede">
              Designed so a recruiter can follow the pipeline in seconds — and so you can demo it live from the console.
            </p>
          </Reveal>
          <div className="lp-steps">
            {STEPS.map((s) => (
              <Reveal key={s.kicker} className="lp-step reveal">
                <div className="lp-step-copy">
                  <span className="lp-mono">{s.kicker}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
                <div className="lp-step-viz" aria-hidden="true">
                  <StepViz type={s.viz} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section" id="features">
        <div className="lp-wrap">
          <Reveal className="lp-section-head reveal">
            <span className="lp-eyebrow">Platform</span>
            <h2>What you can show on a resume walkthrough.</h2>
            <p className="lp-lede">
              Concrete surfaces — not buzzwords. Every block maps to a working screen or API route.
            </p>
          </Reveal>
          <Reveal className="lp-feature-grid reveal-stagger">
            {FEATURES.map((f, i) => (
              <article key={f.title} className="lp-feature">
                <span className="lp-mono">0{i + 1}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="lp-section lp-section-alt" id="use-cases">
        <div className="lp-wrap">
          <Reveal className="lp-section-head reveal">
            <span className="lp-eyebrow">Use cases</span>
            <h2>Templates ready for real conversations.</h2>
          </Reveal>
          <Reveal className="lp-use-grid reveal-stagger">
            {USE_CASES.map((u) => (
              <article key={u.title} className="lp-use">
                <span className="lp-tag">{u.tag}</span>
                <h3>{u.title}</h3>
                <p>{u.body}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="lp-section" id="stack">
        <div className="lp-wrap">
          <Reveal className="lp-section-head reveal">
            <span className="lp-eyebrow">Technical stack</span>
            <h2>Built with tools employers recognize.</h2>
            <p className="lp-lede">
              FastAPI + React + Groq + Postgres — the kind of stack you can defend in an interview.
            </p>
          </Reveal>
          <Reveal className="lp-stack reveal">
            {STACK.map((s) => (
              <div key={s.layer} className="lp-stack-row">
                <span className="lp-mono">{s.layer}</span>
                <span>{s.items}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="lp-section lp-cta-band" id="open">
        <div className="lp-wrap">
          <Reveal className="lp-cta-panel reveal">
            <div className="lp-cta-grid-bg" aria-hidden="true" />
            <span className="lp-eyebrow lp-eyebrow-light">Try it</span>
            <h2>Open the operator console and create your first agent.</h2>
            <p>
              Live dashboard, agent builder, call logs, and analytics — backed by a FastAPI service and Groq inference.
            </p>
            <div className="lp-hero-ctas">
              <Link to="/app" className="lp-btn lp-btn-light">
                Launch console
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="lp-btn lp-btn-outline-light">
                API reference
              </a>
            </div>
            <div className="lp-cta-pills">
              <span>Agent CRUD</span>
              <span>Call analytics</span>
              <span>Groq scoring</span>
              <span>OpenAPI docs</span>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <div>
            <strong>VoiceAgent</strong>
            <p>AI voice agent platform — portfolio MVP.</p>
          </div>
          <div className="lp-footer-links">
            <a href="#problem">Problem</a>
            <a href="#how">How it works</a>
            <a href="#stack">Stack</a>
            <Link to="/app">Console</Link>
          </div>
          <p className="lp-footer-note">Built with React, FastAPI, and Groq.</p>
        </div>
      </footer>
    </div>
  );
}
