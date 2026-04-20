function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

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

function IconBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 7,
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        padding: '5px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        lineHeight: 0,
        transition: 'border-color .15s, color .15s, background .15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-hover)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      {children}
    </button>
  );
}

export default function Nav({ counts, theme, onToggleTheme, onRefresh }) {
  return (
    <nav style={{
      height: 48,
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--bg-base)',
    }}>
      {/* Left: logo + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28,
          background: 'var(--accent-blue)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
          letterSpacing: '-0.5px', flexShrink: 0,
        }}>N</div>
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          NERO
        </span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>
          ProjectBoard
        </span>
      </div>

      {/* Right: stats + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {[
          { label: 'TOTAL',  val: counts.total,  color: 'var(--text-primary)'   },
          { label: 'ACTIVE', val: counts.active, color: 'var(--accent-orange)'  },
          { label: 'DONE',   val: counts.done,   color: 'var(--accent-green)'   },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ textAlign: 'center', lineHeight: 1 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em', marginBottom: 2 }}>
              {label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        <IconBtn onClick={onToggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {/* key forces re-mount → re-triggers iconSpin animation */}
          <span key={theme} style={{ display: 'flex', animation: 'iconSpin 300ms ease' }}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </span>
        </IconBtn>

        <IconBtn onClick={onRefresh} title="Refresh">
          <RefreshIcon />
        </IconBtn>
      </div>
    </nav>
  );
}
