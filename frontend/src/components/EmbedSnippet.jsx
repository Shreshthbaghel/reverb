import React, { useEffect, useState } from 'react';
import { api, API_URL } from '../api';

const FRONTEND_BASE = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

export default function EmbedSnippet({ agentId, agentName }) {
  const [snippet, setSnippet] = useState(null);
  const [tab, setTab] = useState('script');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/api/agents/${agentId}/embed`);
        if (!cancelled) setSnippet(res.data);
      } catch (err) {
        // Fallback local snippet if API is down
        if (!cancelled) {
          const scriptTag =
            `<script src="${FRONTEND_BASE}/embed.js" data-agent-id="${agentId}" ` +
            `data-base="${FRONTEND_BASE}" data-api="${API_URL}" async></script>`;
          const iframeTag =
            `<iframe src="${FRONTEND_BASE}/embed/${agentId}" title="${agentName || 'VoiceAgent'}" ` +
            `width="380" height="560" style="border:0;border-radius:14px;"></iframe>`;
          setSnippet({
            agent_id: agentId,
            embed_url: `${FRONTEND_BASE}/embed/${agentId}`,
            script_tag: scriptTag,
            iframe_tag: iframeTag,
          });
          setError('');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [agentId, agentName]);

  const code = tab === 'script' ? snippet?.script_tag : snippet?.iframe_tag;

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Could not copy — select the code manually');
    }
  };

  if (!snippet) {
    return (
      <div className="prompt-preview">
        <p className="page-sub">Loading embed code…</p>
      </div>
    );
  }

  return (
    <div className="embed-panel">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <p className="mono-label">Embed on your site</p>
        <div className="flex gap-1.5">
          <button
            type="button"
            className={`filter-chip ${tab === 'script' ? 'active' : ''}`}
            onClick={() => setTab('script')}
          >
            Script tag
          </button>
          <button
            type="button"
            className={`filter-chip ${tab === 'iframe' ? 'active' : ''}`}
            onClick={() => setTab('iframe')}
          >
            iframe
          </button>
        </div>
      </div>

      <p className="page-sub !text-xs mb-2">
        Paste this into any HTML page. Visitors chat with <strong>{agentName}</strong> via your agent.
      </p>

      <pre className="embed-code">{code}</pre>

      <div className="flex flex-wrap gap-2 mt-3">
        <button type="button" className="btn-primary text-xs" onClick={copy}>
          {copied ? 'Copied' : 'Copy code'}
        </button>
        <a
          href={snippet.embed_url}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary text-xs no-underline"
        >
          Open widget
        </a>
      </div>
      {error && <p className="alert-error mt-3">{error}</p>}
    </div>
  );
}
