/** Simple inline SVG icons — no emoji dependency */

const size = (s) => ({ width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' });

export function IconLayout({ className = '', s = 18 }) {
  return (
    <svg {...size(s)} className={className} aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

export function IconBot({ className = '', s = 18 }) {
  return (
    <svg {...size(s)} className={className} aria-hidden>
      <rect x="5" y="8" width="14" height="10" rx="2" />
      <path d="M12 8V5" />
      <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPlus({ className = '', s = 18 }) {
  return (
    <svg {...size(s)} className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconPhone({ className = '', s = 18 }) {
  return (
    <svg {...size(s)} className={className} aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function IconRefresh({ className = '', s = 16 }) {
  return (
    <svg {...size(s)} className={className} aria-hidden>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export function IconEdit({ className = '', s = 16 }) {
  return (
    <svg {...size(s)} className={className} aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function IconTrash({ className = '', s = 16 }) {
  return (
    <svg {...size(s)} className={className} aria-hidden>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  );
}

export function IconChevron({ className = '', s = 16, up = false }) {
  return (
    <svg {...size(s)} className={className} aria-hidden style={up ? { transform: 'rotate(180deg)' } : undefined}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconMic({ className = '', s = 20 }) {
  return (
    <svg {...size(s)} className={className} aria-hidden>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v4M8 21h8" />
    </svg>
  );
}

export function IconExternal({ className = '', s = 14 }) {
  return (
    <svg {...size(s)} className={className} aria-hidden>
      <path d="M14 3h7v7" />
      <path d="M10 14 21 3" />
      <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6" />
    </svg>
  );
}

export function IconCheck({ className = '', s = 16 }) {
  return (
    <svg {...size(s)} className={className} aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconX({ className = '', s = 16 }) {
  return (
    <svg {...size(s)} className={className} aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconDoc({ className = '', s = 16 }) {
  return (
    <svg {...size(s)} className={className} aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </svg>
  );
}
