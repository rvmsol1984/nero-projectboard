function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  );
}

const iconBtn = {
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '6px 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 0,
  transition: 'border-color .12s, color .12s',
};

export default function Nav({ counts, theme, onToggleTheme, onRefresh }) {
  return (
    <nav style={{
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
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 26, height: 26,
          background: 'var(--accent-blue)',
          borderRadius: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
          letterSpacing: '-0.5px', flexShrink: 0,
        }}>N</div>
        <span style={{
          fontWeight: 700, fontSize: 15,
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px',
        }}>NERO</span>
        <span style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          fontWeight: 400,
        }}>ProjectBoard</span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {[
          { label: 'Total',  value: counts.total,  color: 'var(--text-primary)'   },
          { label: 'Active', value: counts.active, color: 'var(--accent-orange)'  },
          { label: 'Done',   value: counts.done,   color: 'var(--accent-green)'   },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 1, lineHeight: 1,
          }}>
            <span style={{
              fontSize: 10, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 500,
            }}>{label}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color }}>{value}</span>
          </div>
        ))}

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        <button
          style={iconBtn}
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button style={iconBtn} onClick={onRefresh} title="Refresh projects">
          <RefreshIcon />
        </button>
      </div>
    </nav>
  );
}
