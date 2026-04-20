import { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';
import { useTheme, COLUMNS, assigneeColor } from './theme.js';
import Nav from './components/Nav.jsx';
import Column from './components/Column.jsx';
import Panel from './components/Panel.jsx';

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{
        position: 'absolute', left: 10, top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none', color: 'var(--text-muted)',
      }}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function Spinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        border: '2px solid var(--border-subtle)',
        borderTopColor: 'var(--accent)',
        animation: 'spin .8s linear infinite',
      }} />
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading projects…</span>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '60vh', gap: 14,
    }}>
      <span style={{ fontSize: 13, color: 'var(--red)' }}>Error: {message}</span>
      <button onClick={onRetry} style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 7, color: 'var(--text-primary)',
        padding: '8px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        transition: 'border-color .15s',
      }}>Retry</button>
    </div>
  );
}

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();

  const [projects, setProjects]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [search, setSearch]                 = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [dragItem, setDragItem]             = useState(null);
  const [dragOverCol, setDragOverCol]       = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      setProjects(await api.getProjects());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const assignees = ['All', ...Array.from(new Set(
    projects.map(p => p.assignee).filter(Boolean)
  ))];

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    return (
      (!q || p.name?.toLowerCase().includes(q) || p.client?.toLowerCase().includes(q)) &&
      (assigneeFilter === 'All' || p.assignee === assigneeFilter)
    );
  });

  const counts = {
    total:  projects.length,
    active: projects.filter(p => p.status === 'In Progress').length,
    done:   projects.filter(p => p.status === 'Complete').length,
  };

  function handleDrop(colId) {
    if (!dragItem || dragItem.status === colId) {
      setDragOverCol(null); setDragItem(null); return;
    }
    const prev = dragItem.status;
    const id   = dragItem.id;
    setProjects(ps => ps.map(p => p.id === id ? { ...p, status: colId } : p));
    setDragOverCol(null); setDragItem(null);
    api.updateProjectStatus(id, colId).catch(() => {
      setProjects(ps => ps.map(p => p.id === id ? { ...p, status: prev } : p));
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Nav
        counts={counts}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRefresh={fetchProjects}
      />

      {/* Toolbar */}
      <div style={{
        padding: '8px 20px',
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-body)',
        position: 'sticky', top: 48, zIndex: 50,
      }}>
        <div style={{ position: 'relative' }}>
          <SearchIcon />
          <input
            placeholder="Search projects or clients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              color: 'var(--text-primary)',
              padding: '6px 10px 6px 30px',
              fontSize: 12, width: 240,
              transition: 'border-color .15s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.18)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
          />
        </div>

        {/* Assignee filter pills */}
        {assignees.map(a => {
          const active = assigneeFilter === a;
          const isNumericId = a !== 'All' && /^\d+$/.test(String(a));
          const label = isNumericId ? `#${String(a).slice(0, 8)}` : a;
          return (
            <button
              key={a}
              onClick={() => setAssigneeFilter(a)}
              style={{
                background: active ? 'var(--bg-hover)' : 'transparent',
                border: `1px solid ${active ? 'rgba(255,255,255,0.12)' : 'var(--border-subtle)'}`,
                borderRadius: 20, padding: '4px 11px', fontSize: 11,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                fontWeight: active ? 500 : 400, maxWidth: 140,
                transition: 'all .1s',
              }}
            >
              {a !== 'All' && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: assigneeColor(a), flexShrink: 0,
                }} />
              )}
              <span style={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Board */}
      {loading ? <Spinner /> : error ? (
        <ErrorState message={error} onRetry={fetchProjects} />
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20, padding: '20px 20px', alignItems: 'start',
        }}>
          {COLUMNS.map(col => (
            <Column
              key={col.id}
              column={col}
              projects={filtered.filter(p => p.status === col.id)}
              dragOver={dragOverCol === col.id}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col.id)}
              onDragStart={p => setDragItem(p)}
              onDragEnd={() => { setDragItem(null); setDragOverCol(null); }}
              onCardClick={p => setSelectedProject(p)}
            />
          ))}
        </div>
      )}

      {selectedProject && (
        <Panel project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
