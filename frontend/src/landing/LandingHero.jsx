import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import VoiceCallDemo from './VoiceCallDemo';

export default function LandingHero() {
  const copyRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      copyRef.current?.classList.add('in');
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="lp-hero" id="top">
      <div className="lp-hero-wash" aria-hidden="true" />
      <div className="lp-wrap lp-hero-grid">
        <div className="lp-hero-copy reveal-stagger" ref={copyRef}>
          <p className="lp-brand-line">VoiceAgent</p>
          <h1>Build and operate AI voice agents that actually ship.</h1>
          <p className="lp-lede">
            A full-stack platform to design agent behavior, log live calls, score quality with Groq, and monitor performance — built end-to-end as a production-minded MVP.
          </p>
          <div className="lp-hero-ctas">
            <Link to="/app" className="lp-btn lp-btn-ink">
              Open the console
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <a href="#how" className="lp-btn lp-btn-ghost">See how it works</a>
          </div>
        </div>

        <div className="lp-hero-visual">
          <VoiceCallDemo />
        </div>
      </div>
    </section>
  );
}
