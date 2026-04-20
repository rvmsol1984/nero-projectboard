import { useState, useEffect } from 'react';

const FONT_ID   = 'nero-inter-font';
const STYLE_ID  = 'nero-theme-css';
const STORAGE_KEY = 'nero-theme';

const THEME_CSS = `
  :root {
    --bg-body:   #09090b;
    --bg-card:   #18181b;
    --bg-panel:  #18181b;
    --bg-hover:  rgba(255,255,255,0.05);
    --bg-input:  rgba(255,255,255,0.06);
    --shadow-card:       0 0 0 1px rgba(255,255,255,0.06), 0 2px 4px rgba(0,0,0,0.4);
    --shadow-card-hover: 0 0 0 1px rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.5);
    --border-subtle: rgba(255,255,255,0.07);
    --nav-bg:    rgba(9,9,11,0.82);
    --text-primary:   #fafafa;
    --text-secondary: #a1a1aa;
    --text-muted:     #52525b;
    --accent:   #3b82f6;
    --green:    #22c55e;
    --orange:   #f59e0b;
    --red:      #ef4444;
    --purple:   #a855f7;
    --avatar-fallback: #3f3f46;
    --pill-new-bg:    rgba(59,130,246,0.15);  --pill-new-color:  #3b82f6;
    --pill-prog-bg:   rgba(245,158,11,0.15);  --pill-prog-color: #f59e0b;
    --pill-hold-bg:   rgba(168,85,247,0.15);  --pill-hold-color: #a855f7;
    --pill-done-bg:   rgba(34,197,94,0.15);   --pill-done-color: #22c55e;
  }
  body.light {
    --bg-body:   #f0f2f5;
    --bg-card:   #ffffff;
    --bg-panel:  #ffffff;
    --bg-hover:  rgba(0,0,0,0.04);
    --bg-input:  rgba(0,0,0,0.04);
    --shadow-card:       0 0 0 1px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.06);
    --shadow-card-hover: 0 0 0 1px rgba(0,0,0,0.14), 0 6px 16px rgba(0,0,0,0.1);
    --border-subtle: rgba(0,0,0,0.09);
    --nav-bg:    rgba(240,242,245,0.88);
    --text-primary:   #0f0f0f;
    --text-secondary: #4b5563;
    --text-muted:     #6b7280;
    --accent:   #3b82f6;
    --green:    #22c55e;
    --orange:   #f59e0b;
    --red:      #dc2626;
    --purple:   #a855f7;
    --avatar-fallback: #9ca3af;
    --pill-new-bg:    rgba(37,99,235,0.12);   --pill-new-color:  #1d4ed8;
    --pill-prog-bg:   rgba(217,119,6,0.12);   --pill-prog-color: #b45309;
    --pill-hold-bg:   rgba(124,58,237,0.12);  --pill-hold-color: #6d28d9;
    --pill-done-bg:   rgba(22,163,74,0.12);   --pill-done-color: #15803d;
  }
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0; padding: 0;
    background: var(--bg-body);
    color: var(--text-primary);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
  body.light ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); }
  body.light ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes panelIn {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
  @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes checkBounce {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.28); }
    70%  { transform: scale(0.88); }
    100% { transform: scale(1); }
  }
  @keyframes iconIn {
    from { transform: rotate(-45deg) scale(0.6); opacity: 0; }
    to   { transform: rotate(0deg)   scale(1);   opacity: 1; }
  }
  input, button, select { font-family: inherit; }
  input:focus { outline: none; }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
`;

export const STATUS_PILL = {
  'New':         { bg: 'var(--pill-new-bg)',  color: 'var(--pill-new-color)'  },
  'In Progress': { bg: 'var(--pill-prog-bg)', color: 'var(--pill-prog-color)' },
  'On Hold':     { bg: 'var(--pill-hold-bg)', color: 'var(--pill-hold-color)' },
  'Complete':    { bg: 'var(--pill-done-bg)', color: 'var(--pill-done-color)' },
};

export const COLUMNS = [
  { id: 'New',         label: 'New',         color: '#3b82f6' },
  { id: 'In Progress', label: 'In Progress', color: '#f59e0b' },
  { id: 'On Hold',     label: 'On Hold',     color: '#a855f7' },
  { id: 'Complete',    label: 'Complete',    color: '#22c55e' },
];

export const ASSIGNEE_COLORS = {
  Roman:     '#3b82f6',
  Anton:     '#f59e0b',
  Cory:      '#22c55e',
  Mihael:    '#ef4444',
  Dino:      '#a855f7',
  Daniel:    '#06b6d4',
  Alexandra: '#ec4899',
};

export function initials(name = '') {
  const s = String(name);
  if (!s || /^\d+$/.test(s)) return '?';
  return s.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export function assigneeColor(name) {
  if (!name || /^\d+$/.test(String(name))) return 'var(--avatar-fallback)';
  return ASSIGNEE_COLORS[name] || 'var(--avatar-fallback)';
}

export function clientLabel(val) {
  if (!val) return '—';
  if (/^\d+$/.test(String(val))) return `Client #${val}`;
  return String(val);
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
  return { High: '#ef4444', Medium: '#f59e0b', Low: '#3b82f6' }[p] || '#52525b';
}

export function statusColor(s) {
  return STATUS_PILL[s]?.color || '#52525b';
}

export function progressBarColor(pct) {
  if (pct >= 100) return '#22c55e';
  if (pct > 60)   return '#f59e0b';
  return '#3b82f6';
}

function injectFont() {
  if (typeof document === 'undefined' || document.getElementById(FONT_ID)) return;
  const link = document.createElement('link');
  link.id   = FONT_ID;
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = THEME_CSS;
  document.head.appendChild(el);
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('light', theme === 'light');
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    injectFont();
    injectStyles();
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const t = saved === 'light' ? 'light' : 'dark';
    applyTheme(t);
    return t;
  });

  useEffect(() => {
    injectFont();
    injectStyles();
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}
