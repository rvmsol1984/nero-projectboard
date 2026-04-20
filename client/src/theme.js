import { useState, useEffect } from 'react';

const THEME_CSS = `
  :root {
    --bg-base: #0d1117;
    --bg-card: #161b22;
    --bg-hover: #1c2128;
    --bg-panel: #13161c;
    --border: #30363d;
    --border-hover: #484f58;
    --text-primary: #e6edf3;
    --text-secondary: #8b949e;
    --text-muted: #6e7681;
    --accent-blue: #2f81f7;
    --accent-green: #3fb950;
    --accent-orange: #d29922;
    --accent-red: #f85149;
    --accent-purple: #8957e5;
    --shadow: 0 1px 3px rgba(0,0,0,0.4);
    --shadow-hover: 0 6px 16px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3);
  }
  body.light {
    --bg-base: #f6f8fa;
    --bg-card: #ffffff;
    --bg-hover: #f3f4f6;
    --bg-panel: #ffffff;
    --border: #e5e7eb;
    --border-hover: #d1d5db;
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --text-muted: #9ca3af;
    --accent-blue: #2563eb;
    --accent-green: #16a34a;
    --accent-orange: #d97706;
    --accent-red: #dc2626;
    --accent-purple: #7c3aed;
    --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
    --shadow-hover: 0 6px 16px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06);
  }
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0; padding: 0;
    background: var(--bg-base);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--border-hover); }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes panelIn {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
  @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes checkBounce {
    0%   { transform: scale(1); }
    35%  { transform: scale(1.3); }
    65%  { transform: scale(0.88); }
    100% { transform: scale(1); }
  }
  @keyframes iconSpin {
    from { transform: rotate(-60deg) scale(0.7); opacity: 0; }
    to   { transform: rotate(0deg)   scale(1);   opacity: 1; }
  }
  input, button, select { font-family: inherit; }
  input:focus { outline: none; }
  button:focus-visible { outline: 2px solid var(--accent-blue); outline-offset: 2px; }
`;

export const COLUMNS = [
  { id: 'New',         label: 'New',         color: 'var(--accent-blue)'   },
  { id: 'In Progress', label: 'In Progress', color: 'var(--accent-orange)' },
  { id: 'On Hold',     label: 'On Hold',     color: 'var(--accent-purple)' },
  { id: 'Complete',    label: 'Complete',    color: 'var(--accent-green)'  },
];

export const ASSIGNEE_COLORS = {
  Roman:     'var(--accent-blue)',
  Anton:     'var(--accent-orange)',
  Cory:      'var(--accent-green)',
  Mihael:    'var(--accent-red)',
  Dino:      'var(--accent-purple)',
  Daniel:    '#0891b2',
  Alexandra: '#db2777',
};

export function initials(name = '') {
  const s = String(name);
  if (!s || /^\d+$/.test(s)) return '?';
  return s.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export function assigneeColor(name) {
  if (!name || /^\d+$/.test(String(name))) return 'var(--text-muted)';
  return ASSIGNEE_COLORS[name] || 'var(--text-muted)';
}

export function clientLabel(client) {
  if (!client) return '—';
  if (/^\d+$/.test(String(client))) return `Client #${client}`;
  return String(client);
}

export function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}-${d.getFullYear()}`;
}

export function priorityColor(p) {
  return (
    { High: 'var(--accent-red)', Medium: 'var(--accent-orange)', Low: 'var(--accent-blue)' }[p]
    || 'var(--text-muted)'
  );
}

export function statusColor(s) {
  return (
    {
      Complete:      'var(--accent-green)',
      'In Progress': 'var(--accent-orange)',
      New:           'var(--accent-blue)',
      'On Hold':     'var(--accent-purple)',
    }[s] || 'var(--text-muted)'
  );
}

export function progressColor(pct) {
  if (pct >= 100) return 'var(--accent-green)';
  if (pct > 60)   return 'var(--accent-orange)';
  return 'var(--accent-blue)';
}

const STYLE_ID = 'nero-theme-css';
const STORAGE_KEY = 'nero-theme';

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = THEME_CSS;
  document.head.appendChild(el);
}

function applyBodyTheme(theme) {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('light', theme === 'light');
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    injectStyles();
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const t = saved === 'light' ? 'light' : 'dark';
    applyBodyTheme(t);
    return t;
  });

  useEffect(() => {
    injectStyles();
    applyBodyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}
