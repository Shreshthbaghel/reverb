/**
 * VoiceAgent embed loader.
 * Usage:
 * <script
 *   src="http://localhost:5173/embed.js"
 *   data-agent-id="1"
 *   data-base="http://localhost:5173"
 *   async></script>
 */
(function () {
  var script = document.currentScript;
  if (!script) return;

  var agentId = script.getAttribute('data-agent-id');
  if (!agentId) {
    console.error('[VoiceAgent] data-agent-id is required on the embed script tag.');
    return;
  }

  var base = (script.getAttribute('data-base') || 'http://localhost:5173').replace(/\/$/, '');
  var position = script.getAttribute('data-position') || 'right';
  var openAttr = script.getAttribute('data-open');

  if (document.getElementById('va-embed-root-' + agentId)) return;

  var root = document.createElement('div');
  root.id = 'va-embed-root-' + agentId;
  root.setAttribute('data-voiceagent', agentId);
  Object.assign(root.style, {
    position: 'fixed',
    bottom: '20px',
    zIndex: '2147483000',
    fontFamily: 'DM Sans, system-ui, sans-serif',
  });
  if (position === 'left') root.style.left = '20px';
  else root.style.right = '20px';

  var panel = document.createElement('div');
  Object.assign(panel.style, {
    display: 'none',
    width: 'min(380px, calc(100vw - 32px))',
    height: '560px',
    marginBottom: '12px',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 18px 50px rgba(15, 20, 25, 0.28)',
    border: '1px solid rgba(228, 226, 219, 0.9)',
    background: '#fff',
  });

  var iframe = document.createElement('iframe');
  iframe.src = base + '/embed/' + encodeURIComponent(agentId) + '?embedded=1';
  iframe.title = 'VoiceAgent';
  iframe.allow = 'clipboard-write';
  Object.assign(iframe.style, {
    width: '100%',
    height: '100%',
    border: '0',
    display: 'block',
  });
  panel.appendChild(iframe);

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Open VoiceAgent chat');
  Object.assign(btn.style, {
    width: '56px',
    height: '56px',
    borderRadius: '999px',
    border: '0',
    cursor: 'pointer',
    background: '#0f766e',
    color: '#ecfdf8',
    boxShadow: '0 10px 28px rgba(15, 118, 110, 0.35)',
    display: 'grid',
    placeItems: 'center',
    marginLeft: position === 'left' ? '0' : 'auto',
    marginRight: position === 'left' ? 'auto' : '0',
  });
  btn.innerHTML =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>';

  var open = openAttr === 'true';
  function sync() {
    panel.style.display = open ? 'block' : 'none';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () {
    open = !open;
    sync();
  });
  sync();

  root.appendChild(panel);
  root.appendChild(btn);
  document.body.appendChild(root);
})();
