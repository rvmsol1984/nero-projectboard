import { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';
import { useTheme, COLUMNS, assigneeColor } from './theme.js';
import Nav from './components/Nav.jsx';
import Column from './components/Column.jsx';
import Panel from './components/Panel.jsx';

function Spinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        border: '2.5px solid var(--border)',
        borderTopColor: 'var(--accent-blue)',
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
      <span style={{ fontSize: 13, color: 'var(--accent-red)' }}>Error: {message}</span>
      <button onClick={onRetry} style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        color: 'var(--text-primary)',
        padding: '8px 18px',
        fontSize: 13, fontWeight: 500,
        cursor: 'pointer',
      }}>Retry</button>
    </div>
  );
}

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();

  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [dragItem, setDragItem]         = useState(null);
  const [dragOverCol, setDragOverCol]   = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const assignees = [
    'All',
    ...Array.from(new Set(projects.map(p => p.assignee).filter(Boolean))),
  ];

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
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Nav
        counts={counts}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRefresh={fetchProjects}
      />

      {/* Toolbar */}
      <div style={{
        padding: '9px 20px',
        display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-base)',
        position: 'sticky', top: 48, zIndex: 50,
      }}>
        <input
          placeholder="Search projects or clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-primary)',
            padding: '7px 12px',
            fontSize: 13, width: 240,
          }}
        />

        {assignees.map(a => {
          const active = assigneeFilter === a;
          const isNumericId = a !== 'All' && /^\d+$/.test(String(a));
          const label = isNumericId ? `#${String(a).slice(0, 8)}` : a;
          return (
            <button
              key={a}
              onClick={() => setAssigneeFilter(a)}
              style={{
                background: active ? 'var(--bg-hover)' : 'var(--bg-card)',
                border: `1px solid ${active ? 'var(--border-hover)' : 'var(--border)'}`,
                borderRadius: 20,
                padding: '4px 11px',
                fontSize: 12,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
                fontWeight: active ? 500 : 400,
                transition: 'all .1s',
                maxWidth: 140,
              }}
            >
              {a !== 'All' && (
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: assigneeColor(a), flexShrink: 0,
                }} />
              )}
              <span style={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{label}</span>
            </button>
          );
        })}

        <button style={{
          marginLeft: 'auto',
          background: 'var(--accent-blue)',
          border: 'none', borderRadius: 6,
          color: '#fff', padding: '7px 14px',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>+ New Project</button>
      </div>

      {/* Board */}
      {loading ? <Spinner /> : error ? (
        <ErrorState message={error} onRetry={fetchProjects} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14, padding: '16px 20px',
          alignItems: 'start',
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
        <Panel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
