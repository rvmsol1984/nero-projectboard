import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api.js';

/* ─── Constants ─────────────────────────────────────────────── */
const COLUMNS = [
  { id: 'New',         label: 'New',         color: '#4B9EFF' },
  { id: 'In Progress', label: 'In Progress',  color: '#F5A623' },
  { id: 'On Hold',     label: 'On Hold',      color: '#9B59B6' },
  { id: 'Complete',    label: 'Complete',     color: '#2ECC71' },
];

const ASSIGNEE_COLORS = {
  Roman:     '#4B9EFF',
  Anton:     '#F5A623',
  Cory:      '#2ECC71',
  Mihael:    '#E74C3C',
  Dino:      '#9B59B6',
  Daniel:    '#1ABC9C',
  Alexandra: '#E91E8C',
};

const PRIORITY_COLORS = {
  High:   '#FF4E4E',
  Medium: '#F5A623',
  Low:    '#4B9EFF',
};

const STATUS_COLORS = {
  Complete:    '#2ECC71',
  'In Progress': '#F5A623',
  New:         '#4B9EFF',
  'On Hold':   '#9B59B6',
};

/* ─── Helpers ────────────────────────────────────────────────── */
function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function assigneeColor(name) {
  return ASSIGNEE_COLORS[name] || '#555';
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Inline styles (no external CSS file) ───────────────────── */
const S = {
  root: {
    fontFamily: "'DM Mono', monospace",
    background: '#0A0A0A',
    minHeight: '100vh',
    color: '#E0E0E0',
  },
  nav: {
    height: 56,
    borderBottom: '1px solid #131313',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#0A0A0A',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logo: {
    width: 28, height: 28,
    background: '#4B9EFF',
    borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 14,
    color: '#fff',
  },
  navTitle: { display: 'flex', alignItems: 'baseline', gap: 6 },
  navNero: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 16,
    color: '#E0E0E0',
  },
  navSub: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    color: '#2a2a2a',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: 16 },
  counter: { fontSize: 12, color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  counterNum: { fontSize: 16, fontWeight: 700, color: '#E0E0E0' },
  refreshBtn: {
    background: 'none', border: '1px solid #222', borderRadius: 6,
    color: '#888', cursor: 'pointer', padding: '5px 8px', fontSize: 16,
    transition: 'color .2s, border-color .2s',
  },
  toolbar: {
    padding: '12px 24px',
    display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
    borderBottom: '1px solid #131313',
  },
  searchInput: {
    background: '#111', border: '1px solid #222', borderRadius: 8,
    color: '#E0E0E0', padding: '8px 14px', fontSize: 13, outline: 'none',
    width: 220,
  },
  filterBtn: (active, color) => ({
    background: active ? (color || '#4B9EFF') + '22' : 'transparent',
    border: `1px solid ${active ? (color || '#4B9EFF') : '#222'}`,
    borderRadius: 20, padding: '4px 12px', fontSize: 12,
    color: active ? (color || '#4B9EFF') : '#888', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
  }),
  dot: (color) => ({
    width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0,
  }),
  newProjectBtn: {
    marginLeft: 'auto',
    background: '#4B9EFF', border: 'none', borderRadius: 8,
    color: '#fff', padding: '8px 16px', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Mono', monospace",
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    padding: '20px 24px',
    alignItems: 'start',
  },
  column: (color, dragOver) => ({
    background: dragOver ? '#151515' : '#0D0D0D',
    borderRadius: 12,
    border: `1px solid ${dragOver ? color : '#181818'}`,
    transition: 'border-color .2s, background .2s',
    minHeight: 120,
  }),
  colHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px 10px',
  },
  colLabel: (color) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600,
    color: '#888', textTransform: 'uppercase', letterSpacing: 1,
  }),
  colBar: (color) => ({
    width: 3, height: 14, borderRadius: 2, background: color,
  }),
  colBadge: (color) => ({
    background: color + '22', color, borderRadius: 20,
    padding: '2px 8px', fontSize: 11, fontWeight: 700,
  }),
  colBody: { padding: '0 10px 12px' },
  card: (dragging) => ({
    background: '#111',
    border: '1px solid #1E1E1E',
    borderRadius: 10,
    padding: '12px 14px',
    marginBottom: 10,
    cursor: dragging ? 'grabbing' : 'grab',
    opacity: dragging ? 0.5 : 1,
    transition: 'transform .15s, border-color .15s, box-shadow .15s',
    userSelect: 'none',
  }),
  cardHover: {
    transform: 'translateY(-2px)',
    borderColor: '#333',
    boxShadow: '0 4px 16px rgba(0,0,0,.4)',
  },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cardClient: { fontSize: 11, color: '#555', display: 'flex', alignItems: 'center', gap: 5 },
  cardName: {
    fontFamily: "'Syne', sans-serif", fontWeight: 700,
    fontSize: 13, color: '#E0E0E0', marginBottom: 8, lineHeight: 1.3,
  },
  tags: { display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 },
  tag: {
    background: '#1A1A1A', border: '1px solid #252525',
    borderRadius: 12, padding: '2px 8px', fontSize: 10, color: '#666',
  },
  progressWrap: { marginBottom: 8 },
  progressBar: { height: 3, background: '#1E1E1E', borderRadius: 2, overflow: 'hidden' },
  progressFill: (pct, color) => ({
    height: '100%', width: `${Math.min(100, pct)}%`,
    background: color, borderRadius: 2, transition: 'width .3s',
  }),
  progressLabel: { fontSize: 10, color: '#444', marginTop: 3 },
  cardBottom: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  avatar: (color, size = 24) => ({
    width: size, height: size, borderRadius: '50%',
    background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0,
  }),
  dueDate: (overdue) => ({
    fontSize: 11, color: overdue ? '#FF4E4E' : '#444',
  }),
  spinner: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '60vh', flexDirection: 'column', gap: 16,
  },
  errorBox: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '60vh', flexDirection: 'column', gap: 16,
  },
  retryBtn: {
    background: '#4B9EFF', border: 'none', borderRadius: 8,
    color: '#fff', padding: '10px 20px', fontSize: 13,
    cursor: 'pointer', fontFamily: "'DM Mono', monospace",
  },
  /* Modal */
  backdrop: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)',
    zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  },
  modal: {
    background: '#0D0D0D', border: '1px solid #1E1E1E',
    borderRadius: '16px 16px 0 0',
    width: '100%', maxWidth: 860,
    maxHeight: '90vh', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    animation: 'slideUp .25s ease',
  },
  modalHeader: { padding: '20px 24px 16px', borderBottom: '1px solid #131313' },
  modalBody: { overflow: 'auto', flex: 1, padding: '16px 24px 24px' },
  modalClose: {
    background: 'none', border: '1px solid #222', borderRadius: 6,
    color: '#888', cursor: 'pointer', padding: '4px 10px', fontSize: 18,
  },
  statsStrip: {
    display: 'flex', gap: 24, marginTop: 12, paddingTop: 12,
    borderTop: '1px solid #131313', flexWrap: 'wrap',
  },
  statItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  statLabel: { fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { fontSize: 14, color: '#E0E0E0', fontWeight: 600 },
  filterBar: {
    display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center',
  },
  select: {
    background: '#111', border: '1px solid #222', borderRadius: 8,
    color: '#888', padding: '6px 12px', fontSize: 12, outline: 'none',
    fontFamily: "'DM Mono', monospace",
  },
  phaseGroup: { marginBottom: 20 },
  phaseHeader: {
    fontSize: 11, color: '#444', textTransform: 'uppercase',
    letterSpacing: 1.5, padding: '8px 0 6px',
    position: 'sticky', top: 0, background: '#0D0D0D',
    borderBottom: '1px solid #131313', marginBottom: 4,
  },
  taskRow: (done) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 0', borderBottom: '1px solid #0F0F0F',
    opacity: done ? 0.5 : 1,
  }),
  checkbox: {
    width: 16, height: 16, borderRadius: 4,
    border: '1px solid #333', background: 'transparent',
    cursor: 'pointer', flexShrink: 0, appearance: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  taskTitle: (done) => ({
    flex: 1, fontSize: 13,
    textDecoration: done ? 'line-through' : 'none',
    color: done ? '#444' : '#CCC',
  }),
  pill: (color) => ({
    background: color + '22', color,
    borderRadius: 12, padding: '2px 8px', fontSize: 11, whiteSpace: 'nowrap',
  }),
  taskMeta: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
};

/* ─── Google Fonts injection ─────────────────────────────────── */
function injectFonts() {
  if (document.getElementById('gf-nero')) return;
  const link = document.createElement('link');
  link.id = 'gf-nero';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap';
  document.head.appendChild(link);
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #111; }
    ::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }
  `;
  document.head.appendChild(style);
}

/* ─── Sub-components ─────────────────────────────────────────── */
function Spinner() {
  return (
    <div style={S.spinner}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid #222', borderTopColor: '#4B9EFF',
        animation: 'spin .8s linear infinite',
      }} />
      <span style={{ fontSize: 13, color: '#444' }}>Loading projects…</span>
    </div>
  );
}

function Avatar({ name, size }) {
  return (
    <div style={S.avatar(assigneeColor(name), size)} title={name}>
      {initials(name)}
    </div>
  );
}

function PriorityDot({ priority }) {
  return <span style={S.dot(PRIORITY_COLORS[priority] || '#555')} title={priority} />;
}

/* ─── Project Card ───────────────────────────────────────────── */
function ProjectCard({ project, onDragStart, onDragEnd, onClick }) {
  const [hovered, setHovered] = useState(false);
  const done = project.tasksDone || 0;
  const total = project.tasksTotal || 0;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const colColor = COLUMNS.find(c => c.id === project.status)?.color || '#4B9EFF';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...S.card(false), ...(hovered ? S.cardHover : {}) }}
    >
      <div style={S.cardTop}>
        <div style={S.cardClient}>
          <PriorityDot priority={project.priority} />
          {project.client}
        </div>
      </div>
      <div style={S.cardName}>{project.name}</div>
      {project.tags?.length > 0 && (
        <div style={S.tags}>
          {project.tags.map(t => <span key={t} style={S.tag}>{t}</span>)}
        </div>
      )}
      <div style={S.progressWrap}>
        <div style={S.progressBar}>
          <div style={S.progressFill(pct, colColor)} />
        </div>
        <div style={S.progressLabel}>{done} / {total} tasks</div>
      </div>
      <div style={S.cardBottom}>
        <Avatar name={project.assignee} size={24} />
        <span style={S.dueDate(isOverdue(project.dueDate))}>
          {isOverdue(project.dueDate) ? '⚠ ' : ''}{fmtDate(project.dueDate)}
        </span>
      </div>
    </div>
  );
}

/* ─── Kanban Column ──────────────────────────────────────────── */
function Column({ column, projects, dragOver, onDragOver, onDragLeave, onDrop, onDragStart, onDragEnd, onCardClick }) {
  return (
    <div
      style={S.column(column.color, dragOver)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div style={S.colHeader}>
        <div style={S.colLabel(column.color)}>
          <div style={S.colBar(column.color)} />
          {column.label}
        </div>
        <span style={S.colBadge(column.color)}>{projects.length}</span>
      </div>
      <div style={S.colBody}>
        {projects.map(p => (
          <ProjectCard
            key={p.id}
            project={p}
            onDragStart={() => onDragStart(p)}
            onDragEnd={onDragEnd}
            onClick={() => onCardClick(p)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Task Row ───────────────────────────────────────────────── */
function TaskRow({ task, onToggle }) {
  const done = task.status === 'Complete';
  return (
    <div style={S.taskRow(done)}>
      <input
        type="checkbox"
        checked={done}
        onChange={() => onToggle(task)}
        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#4B9EFF' }}
      />
      <PriorityDot priority={task.priority} />
      <span style={S.taskTitle(done)}>{task.title}</span>
      <div style={S.taskMeta}>
        <span style={S.pill(STATUS_COLORS[task.status] || '#555')}>{task.status}</span>
        <span style={{ fontSize: 11, color: '#444' }}>{task.hours}h</span>
        <Avatar name={task.assignee} size={20} />
        <span style={S.dueDate(isOverdue(task.dueDate))}>{fmtDate(task.dueDate)}</span>
      </div>
    </div>
  );
}

/* ─── Project Modal ──────────────────────────────────────────── */
function ProjectModal({ project, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getTasksForProject(project.id)
      .then(data => { if (!cancelled) { setTasks(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [project.id]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const phases = ['All', ...Array.from(new Set(tasks.map(t => t.phase)))];
  const statuses = ['All', 'New', 'In Progress', 'On Hold', 'Complete'];

  const filtered = tasks.filter(t =>
    (phaseFilter === 'All' || t.phase === phaseFilter) &&
    (statusFilter === 'All' || t.status === statusFilter)
  );

  const grouped = filtered.reduce((acc, t) => {
    (acc[t.phase] = acc[t.phase] || []).push(t);
    return acc;
  }, {});

  const doneTasks = tasks.filter(t => t.status === 'Complete').length;
  const totalHours = tasks.reduce((s, t) => s + (t.hours || 0), 0);
  const pct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const colColor = COLUMNS.find(c => c.id === project.status)?.color || '#4B9EFF';

  function handleToggle(task) {
    const newStatus = task.status === 'Complete' ? 'New' : 'Complete';
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    api.updateTaskStatus(task.id, newStatus).catch(() => {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
    });
  }

  return (
    <div style={S.backdrop} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modal}>
        <div style={S.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#555' }}>{project.client}</span>
                <PriorityDot priority={project.priority} />
                <span style={{ fontSize: 11, color: PRIORITY_COLORS[project.priority] }}>{project.priority}</span>
                {isOverdue(project.dueDate) && (
                  <span style={{ ...S.pill('#FF4E4E'), fontSize: 11 }}>OVERDUE</span>
                )}
              </div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: 20, color: '#E0E0E0', marginBottom: 8,
              }}>{project.name}</h2>
              {project.tags?.length > 0 && (
                <div style={S.tags}>
                  {project.tags.map(t => <span key={t} style={S.tag}>{t}</span>)}
                </div>
              )}
            </div>
            <button style={S.modalClose} onClick={onClose}>×</button>
          </div>
          <div style={S.statsStrip}>
            <div style={S.statItem}>
              <span style={S.statLabel}>Tasks Done</span>
              <span style={S.statValue}>{doneTasks} / {tasks.length}</span>
            </div>
            <div style={S.statItem}>
              <span style={S.statLabel}>Hours Logged</span>
              <span style={S.statValue}>{totalHours.toFixed(1)}h</span>
            </div>
            <div style={S.statItem}>
              <span style={S.statLabel}>Due Date</span>
              <span style={{ ...S.statValue, color: isOverdue(project.dueDate) ? '#FF4E4E' : '#E0E0E0' }}>
                {fmtDate(project.dueDate)}
              </span>
            </div>
            <div style={S.statItem}>
              <span style={S.statLabel}>Lead</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Avatar name={project.assignee} size={20} />
                <span style={S.statValue}>{project.assignee || '—'}</span>
              </div>
            </div>
            <div style={{ ...S.statItem, flex: 1, minWidth: 120 }}>
              <span style={S.statLabel}>Progress {pct}%</span>
              <div style={{ ...S.progressBar, height: 6, marginTop: 6 }}>
                <div style={S.progressFill(pct, colColor)} />
              </div>
            </div>
          </div>
        </div>
        <div style={S.modalBody}>
          <div style={S.filterBar}>
            <select value={phaseFilter} onChange={e => setPhaseFilter(e.target.value)} style={S.select}>
              {phases.map(p => <option key={p} value={p}>{p === 'All' ? 'All Phases' : `Phase: ${p}`}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={S.select}>
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
            </select>
          </div>

          {loading ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#444', fontSize: 13, marginTop: 32 }}>No tasks found</div>
          ) : (
            Object.entries(grouped).map(([phase, phaseTasks]) => (
              <div key={phase} style={S.phaseGroup}>
                <div style={S.phaseHeader}>Phase: {phase} ({phaseTasks.length})</div>
                {phaseTasks.map(t => (
                  <TaskRow key={t.id} task={t} onToggle={handleToggle} />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── App ────────────────────────────────────────────────────── */
export default function App() {
  injectFonts();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [dragItem, setDragItem] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
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

  const assignees = ['All', ...Array.from(new Set(
    projects.map(p => p.assignee).filter(Boolean)
  ))];

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.client?.toLowerCase().includes(q);
    const matchAssignee = assigneeFilter === 'All' || p.assignee === assigneeFilter;
    return matchSearch && matchAssignee;
  });

  const counts = {
    total: projects.length,
    active: projects.filter(p => p.status === 'In Progress').length,
    done: projects.filter(p => p.status === 'Complete').length,
  };

  function handleDragStart(project) { setDragItem(project); }
  function handleDragEnd() { setDragItem(null); setDragOverCol(null); }

  function handleDrop(colId) {
    if (!dragItem || dragItem.status === colId) {
      setDragOverCol(null);
      setDragItem(null);
      return;
    }
    const prevStatus = dragItem.status;
    setProjects(prev =>
      prev.map(p => p.id === dragItem.id ? { ...p, status: colId } : p)
    );
    setDragOverCol(null);
    setDragItem(null);
    api.updateProjectStatus(dragItem.id, colId).catch(() => {
      setProjects(prev =>
        prev.map(p => p.id === dragItem.id ? { ...p, status: prevStatus } : p)
      );
    });
  }

  return (
    <div style={S.root}>
      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.navLeft}>
          <div style={S.logo}>N</div>
          <div style={S.navTitle}>
            <span style={S.navNero}>NERO</span>
            <span style={S.navSub}>ProjectBoard</span>
          </div>
        </div>
        <div style={S.navRight}>
          <div style={S.counter}>
            <span style={S.counterNum}>{counts.total}</span>
            <span>Total</span>
          </div>
          <div style={S.counter}>
            <span style={{ ...S.counterNum, color: '#F5A623' }}>{counts.active}</span>
            <span>Active</span>
          </div>
          <div style={S.counter}>
            <span style={{ ...S.counterNum, color: '#2ECC71' }}>{counts.done}</span>
            <span>Done</span>
          </div>
          <button
            style={S.refreshBtn}
            onClick={fetchProjects}
            title="Refresh"
          >↻</button>
        </div>
      </nav>

      {/* Toolbar */}
      <div style={S.toolbar}>
        <input
          style={S.searchInput}
          placeholder="Search projects or clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {assignees.map(a => (
          <button
            key={a}
            style={S.filterBtn(assigneeFilter === a, assigneeColor(a))}
            onClick={() => setAssigneeFilter(a)}
          >
            {a !== 'All' && <span style={S.dot(assigneeColor(a))} />}
            {a}
          </button>
        ))}
        <button style={S.newProjectBtn}>+ New Project</button>
      </div>

      {/* Board */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <div style={S.errorBox}>
          <span style={{ color: '#FF4E4E', fontSize: 14 }}>Error: {error}</span>
          <button style={S.retryBtn} onClick={fetchProjects}>Retry</button>
        </div>
      ) : (
        <div style={S.board}>
          {COLUMNS.map(col => (
            <Column
              key={col.id}
              column={col}
              projects={filtered.filter(p => p.status === col.id)}
              dragOver={dragOverCol === col.id}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col.id)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onCardClick={p => setSelectedProject(p)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
