import { useState, useEffect } from 'react';

const FONT_ID     = 'nero-lora-font';
const STYLE_ID    = 'nero-theme-css';
const STORAGE_KEY = 'nero-theme';

const THEME_CSS = `
  :root {
    --bg-base:   #191919;
    --bg-card:   #252525;
    --bg-hover:  #2e2e2e;
    --bg-panel:  #1e1e1e;
    --border:         rgba(255,255,255,0.08);
    --border-hover:   rgba(255,255,255,0.14);
    --text-primary:   #e6e6e6;
    --text-secondary: #a0a0a0;
    --text-muted:     #6b6b6b;
    --accent-blue:   #3b82f6;
    --accent-green:  #22c55e;
    --accent-orange: #f59e0b;
    --accent-red:    #ef4444;
    --accent-purple: #a855f7;
    --shadow:       0 2px 8px rgba(0,0,0,0.3);
    --shadow-hover: 0 4px 16px rgba(0,0,0,0.4);
    /* backward-compat aliases */
    --bg-body:         #191919;
    --bg-input:        #2e2e2e;
    --border-subtle:   rgba(255,255,255,0.08);
    --shadow-card:     0 2px 8px rgba(0,0,0,0.3);
    --shadow-card-hover: 0 4px 16px rgba(0,0,0,0.4);
    --nav-bg:          rgba(25,25,25,0.90);
    --accent:   #3b82f6;
    --green:    #22c55e;
    --orange:   #f59e0b;
    --red:      #ef4444;
    --purple:   #a855f7;
    --avatar-fallback: #3a3a3a;
    --pill-new-bg:   rgba(59,130,246,0.12);  --pill-new-color:  #3b82f6;
    --pill-prog-bg:  rgba(245,158,11,0.12);  --pill-prog-color: #f59e0b;
    --pill-hold-bg:  rgba(168,85,247,0.12);  --pill-hold-color: #a855f7;
    --pill-done-bg:  rgba(34,197,94,0.12);   --pill-done-color: #22c55e;
  }
  body.light {
    --bg-base:   #ffffff;
    --bg-card:   #ffffff;
    --bg-hover:  #f7f7f7;
    --bg-panel:  #ffffff;
    --border:         rgba(0,0,0,0.08);
    --border-hover:   rgba(0,0,0,0.14);
    --text-primary:   #191919;
    --text-secondary: #6b6b6b;
    --text-muted:     #b0b0b0;
    --accent-blue:   #2563eb;
    --accent-green:  #16a34a;
    --accent-orange: #d97706;
    --accent-red:    #dc2626;
    --accent-purple: #7c3aed;
    --shadow:       0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05);
    --shadow-hover: 0 4px 12px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.08);
    /* backward-compat aliases */
    --bg-body:         #f5f5f5;
    --bg-input:        #f7f7f7;
    --border-subtle:   rgba(0,0,0,0.08);
    --shadow-card:     0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05);
    --shadow-card-hover: 0 4px 12px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.08);
    --nav-bg:          rgba(255,255,255,0.92);
    --accent:   #2563eb;
    --green:    #16a34a;
    --orange:   #d97706;
    --red:      #dc2626;
    --purple:   #7c3aed;
    --avatar-fallback: #9ca3af;
    --pill-new-bg:   rgba(37,99,235,0.12);   --pill-new-color:  #2563eb;
    --pill-prog-bg:  rgba(217,119,6,0.12);   --pill-prog-color: #d97706;
    --pill-hold-bg:  rgba(124,58,237,0.12);  --pill-hold-color: #7c3aed;
    --pill-done-bg:  rgba(22,163,74,0.12);   --pill-done-color: #16a34a;
  }
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0; padding: 0;
    background: var(--bg-base);
    color: var(--text-primary);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  input, button, select { font-family: inherit; }
  input:focus { outline: none; }
  button:focus-visible { outline: 2px solid var(--accent-blue); outline-offset: 2px; }
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
  const first = String(name).split(' ')[0];
  if (ASSIGNEE_COLORS[first]) return ASSIGNEE_COLORS[first];
  const PALETTE = ['#3b82f6','#f59e0b','#22c55e','#ef4444','#a855f7','#06b6d4','#ec4899','#84cc16'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
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
  link.href = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap';
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
