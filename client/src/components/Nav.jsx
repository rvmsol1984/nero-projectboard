function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function IconBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 6,
        background: 'transparent', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-secondary)', cursor: 'pointer',
        transition: 'background .12s, color .12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >{children}</button>
  );
}

export default function Nav({ counts, theme, onToggleTheme, onRefresh }) {
  const stats = `${counts.total} projects · ${counts.active} active · ${counts.done} done`;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: 48,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 10,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 6,
        background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
        letterSpacing: '-0.3px',
      }}>N</div>

      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
        NERO
      </span>
      <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 300 }}>/</span>
      <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 }}>
        ProjectBoard
      </span>

      <div style={{ flex: 1 }} />

      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stats}</span>

      <div style={{ width: 1, height: 16, background: 'var(--border-subtle)', margin: '0 4px' }} />

      <IconBtn title="Refresh" onClick={onRefresh}><RefreshIcon /></IconBtn>
      <IconBtn title={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={onToggleTheme}>
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </IconBtn>
    </nav>
  );
}
