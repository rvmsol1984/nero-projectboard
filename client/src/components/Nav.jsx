function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  );
}

const styles = {
  nav: {
    height: 56,
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'var(--bg-base)',
  },
  left: { display: 'flex', alignItems: 'center', gap: 10 },
  logo: {
    width: 26, height: 26,
    background: 'var(--accent-blue)',
    borderRadius: 5,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#fff',
    letterSpacing: '-0.5px',
  },
  nero: {
    fontWeight: 700, fontSize: 15,
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  sub: {
    fontSize: 14, color: 'var(--text-muted)',
    fontWeight: 400,
  },
  right: { display: 'flex', alignItems: 'center', gap: 18 },
  stat: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 1, lineHeight: 1,
  },
  statLabel: {
    fontSize: 10, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.6px',
    fontWeight: 500,
  },
  statValue: (color) => ({
    fontSize: 15, fontWeight: 600, color, lineHeight: 1.2,
  }),
  iconBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '6px 9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color .15s, color .15s, background .15s',
  },
};

export default function Nav({ counts, theme, onToggleTheme, onRefresh }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <div style={styles.logo}>N</div>
        <span style={styles.nero}>NERO</span>
        <span style={styles.sub}>ProjectBoard</span>
      </div>

      <div style={styles.right}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Total</span>
          <span style={styles.statValue('var(--text-primary)')}>{counts.total}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Active</span>
          <span style={styles.statValue('var(--accent-orange)')}>{counts.active}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Done</span>
          <span style={styles.statValue('var(--accent-green)')}>{counts.done}</span>
        </div>
        <button
          style={styles.iconBtn}
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button style={styles.iconBtn} onClick={onRefresh} title="Refresh">
          <RefreshIcon />
        </button>
      </div>
    </nav>
  );
}
