import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconMic } from '../components/Icons';

const LINKS = [
  { href: '#problem', label: 'Problem' },
  { href: '#how', label: 'How it works' },
  { href: '#features', label: 'Platform' },
  { href: '#stack', label: 'Stack' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`lp-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="lp-wrap lp-nav-inner">
        <a href="#top" className="lp-brand" onClick={() => setOpen(false)}>
          <span className="lp-brand-mark">
            <IconMic s={15} />
          </span>
          <span className="lp-brand-text">VoiceAgent</span>
        </a>

        <nav className="lp-nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>

        <div className="lp-nav-actions">
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="lp-nav-docs">
            API docs
          </a>
          <Link to="/app" className="lp-btn lp-btn-ink lp-btn-sm">
            Open console
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <button
            type="button"
            className="lp-nav-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <div className="lp-nav-mobile">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <Link to="/app" className="lp-btn lp-btn-ink" onClick={() => setOpen(false)}>
            Open console
          </Link>
        </div>
      )}
    </header>
  );
}
