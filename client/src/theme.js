import { useState, useEffect } from 'react';

export const THEME_CSS = `
  :root, body.dark {
    --bg-base: #0d1117;
    --bg-card: #161b22;
    --bg-hover: #1c2128;
    --border: #30363d;
    --border-hover: #484f58;
    --text-primary: #e6edf3;
    --text-secondary: #7d8590;
    --text-muted: #484f58;
    --accent-blue: #2f81f7;
    --accent-green: #3fb950;
    --accent-orange: #d29922;
    --accent-red: #f85149;
    --accent-purple: #a371f7;
  }
  body.light {
    --bg-base: #ffffff;
    --bg-card: #f6f8fa;
    --bg-hover: #eaeef2;
    --border: #d0d7de;
    --border-hover: #afb8c1;
    --text-primary: #1f2328;
    --text-secondary: #656d76;
    --text-muted: #9198a1;
    --accent-blue: #0969da;
    --accent-green: #1a7f37;
    --accent-orange: #9a6700;
    --accent-red: #d1242f;
    --accent-purple: #8250df;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    background: var(--bg-base);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: var(--bg-base); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--border-hover); }
  @keyframes slideUp {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  input, button, select, textarea {
    font-family: inherit;
  }
  input:focus, button:focus, select:focus {
    outline: none;
  }
`;

const STYLE_ID = 'nero-theme-styles';
const STORAGE_KEY = 'nero-theme';

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = THEME_CSS;
  document.head.appendChild(style);
}

function applyBodyTheme(theme) {
  if (typeof document === 'undefined') return;
  document.body.classList.remove('dark', 'light');
  document.body.classList.add(theme);
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    injectStyles();
    applyBodyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle, setTheme };
}

export const ASSIGNEE_COLORS = {
  Roman:     'var(--accent-blue)',
  Anton:     'var(--accent-orange)',
  Cory:      'var(--accent-green)',
  Mihael:    'var(--accent-red)',
  Dino:      'var(--accent-purple)',
  Daniel:    '#1abc9c',
  Alexandra: '#e91e8c',
};

export const PRIORITY_COLORS = {
  High:   'var(--accent-red)',
  Medium: 'var(--accent-orange)',
  Low:    'var(--accent-blue)',
};

export const STATUS_COLORS = {
  Complete:      'var(--accent-green)',
  'In Progress': 'var(--accent-orange)',
  New:           'var(--accent-blue)',
  'On Hold':     'var(--accent-purple)',
};

export const COLUMNS = [
  { id: 'New',         label: 'New',         color: 'var(--accent-blue)'   },
  { id: 'In Progress', label: 'In Progress', color: 'var(--accent-orange)' },
  { id: 'On Hold',     label: 'On Hold',     color: 'var(--accent-purple)' },
  { id: 'Complete',    label: 'Complete',    color: 'var(--accent-green)'  },
];

export function initials(name = '') {
  return String(name).split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export function assigneeColor(name) {
  if (!name || typeof name === 'number' || /^\d+$/.test(String(name))) return 'var(--text-muted)';
  return ASSIGNEE_COLORS[name] || 'var(--text-muted)';
}

export function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function priorityColor(p) {
  return PRIORITY_COLORS[p] || 'var(--text-muted)';
}

export function statusColor(s) {
  return STATUS_COLORS[s] || 'var(--text-muted)';
}
