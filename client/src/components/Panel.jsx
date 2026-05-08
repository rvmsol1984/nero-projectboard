import { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';
import {
  COLUMNS, STATUS_PILL, assigneeColor, initials, clientLabel,
  isOverdue, fmtDate, progressBarColor,
} from '../theme.js';
import TaskDetail from './TaskDetail.jsx';

const STATUSES = ['New', 'In Progress', 'On Hold', 'Complete'];

const LORA = "'Lora', Georgia, serif";

function Avatar({ name, size = 18 }) {
  return (
    <div title={name} style={{
      width: size, height: size, borderRadius: '50%',
      background: assigneeColor(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.42), fontWeight: 600,
      color: '#fff', flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}

function TaskCheck({ done, inProg, bouncing }) {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
      border: `1.5px solid ${done ? 'var(--accent-green)' : 'var(--border)'}`,
      background: done ? 'var(--accent-green)' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 150ms, border-color 150ms',
      animation: bouncing ? 'checkBounce 180ms ease' : 'none',
    }}>
      {done ? (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : inProg ? (
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-orange)' }} />
      ) : null}
    </div>
  );
}

function TaskRow({ task, resourceMap, onToggle, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const done = task.status === 'Complete';
  const inProg = task.status === 'In Progress';
  const overdue = isOverdue(task.dueDate);
  const assigneeName = task.assignee && /^\d+$/.test(String(task.assignee))
    ? (resourceMap[task.assignee] || null)
    : (task.assignee || null);

  function handleToggleClick(e) {
    e.stopPropagation();
    setBouncing(true);
    setTimeout(() => setBouncing(false), 200);
    onToggle(task);
  }

  return (
    <div
      onClick={() => onOpen?.(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 18px', height: 38, cursor: 'pointer',
        background: hovered ? 'var(--bg-hover)' : 'transparent',
        borderBottom: '1px solid var(--border)',
        transition: 'background .1s',
      }}
    >
      <div onClick={handleToggleClick} style={{ flexShrink: 0, display: 'flex' }}>
        <TaskCheck done={done} inProg={inProg} bouncing={bouncing} />
      </div>
      <span style={{
        flex: 1, fontSize: 13,
        fontFamily: LORA,
        color: done ? 'var(--text-muted)' : 'var(--text-primary)',
        textDecoration: done ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        transition: 'color .15s',
      }}>{task.title}</span>
      {assigneeName && <Avatar name={assigneeName} size={16} />}
      <span style={{
        fontSize: 11,
        color: overdue ? 'var(--accent-red)' : 'var(--text-muted)',
        flexShrink: 0, minWidth: 72, textAlign: 'right',
        fontWeight: overdue ? 500 : 400,
      }}>{fmtDate(task.dueDate)}</span>
    </div>
  );
}

function InlineInput({ placeholder, onCommit, onCancel }) {
  const ref = useRef(null);
  const [val, setVal] = useState('');

  useEffect(() => { ref.current?.focus(); }, []);

  function handleKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); if (val.trim()) onCommit(val.trim()); }
    if (e.key === 'Escape') onCancel();
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 18px', borderBottom: '1px solid var(--border)',
    }}>
      <input
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { if (val.trim()) onCommit(val.trim()); else onCancel(); }}
        placeholder={placeholder}
        style={{
          flex: 1, background: 'transparent', border: 'none',
          borderBottom: '1px solid var(--accent-blue)',
          color: 'var(--text-primary)', fontSize: 13,
          padding: '3px 0', outline: 'none', fontFamily: 'inherit',
        }}
      />
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); if (val.trim()) onCommit(val.trim()); }}
        style={{
          background: 'var(--accent-blue)', border: 'none', borderRadius: 4,
          color: '#fff', fontSize: 11, padding: '2px 8px',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >✓</button>
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); onCancel(); }}
        style={{
          background: 'transparent', border: 'none',
          color: 'var(--text-muted)', fontSize: 14,
          cursor: 'pointer', padding: '0 2px',
        }}
      >✕</button>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        border: '2px solid var(--border)',
        borderTopColor: 'var(--accent-blue)',
        animation: 'spin .8s linear infinite',
      }} />
    </div>
  );
}

export default function Panel({ project, onClose, onProjectStatusUpdate }) {
  const [tasks, setTasks] = useState([]);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [localPhases, setLocalPhases] = useState([]);
  const [addingPhase, setAddingPhase] = useState(false);
  const [addingTaskPhase, setAddingTaskPhase] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [projectStatus, setProjectStatus] = useState(project.status);
  const [showProjectStatusDrop, setShowProjectStatusDrop] = useState(false);
  const [projectAssignee, setProjectAssignee] = useState(project.assignee);
  const [projectDueDate, setProjectDueDate] = useState(project.dueDate);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [showTechDrop, setShowTechDrop] = useState(false);
  const [techSearch, setTechSearch] = useState('');
  const [allResources, setAllResources] = useState([]);

  function loadTasks() {
    setLoading(true);
    api.getTasksForProject(project.id)
      .then(({ tasks, phases }) => {
        setTasks(tasks);
        setPhases(phases);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadTasks();
  }, [project.id]);

  useEffect(() => {
    api.getResources().then(setAllResources).catch(() => {});
  }, []);

  useEffect(() => {
    if (!showTechDrop || allResources.length > 0) return;
    api.getResources().then(setAllResources).catch(() => {});
  }, [showTechDrop]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape' && !selectedTask) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, selectedTask]);

  function handleToggle(task) {
    const newStatus = task.status === 'Complete' ? 'New' : 'Complete';
    const orig = task.status;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    api.updateTaskStatus(task.id, newStatus).catch(() => {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: orig } : t));
    });
  }

  function handleProjectStatusChange(status) {
    setShowProjectStatusDrop(false);
    const prev = projectStatus;
    setProjectStatus(status);
    onProjectStatusUpdate?.(status);
    api.updateProjectStatus(project.id, status).catch(() => setProjectStatus(prev));
  }

  function handleCreatePhase(title) {
    setLocalPhases(prev => [...prev, { id: null, title }]);
    setAddingPhase(false);
    api.createPhase({ projectID: project.id, title })
      .then(res => {
        setLocalPhases(prev => prev.filter(p => p.title !== title));
        setPhases(prev => [...prev, { id: res.id, title, projectID: project.id }]);
      })
      .catch(() => {
        setLocalPhases(prev => prev.filter(p => p.title !== title));
      });
  }

  function handleCreateTask(phaseName) {
    return (title) => {
      const tempId = `temp-${Date.now()}`;
      const phaseID = phaseName === 'General'
        ? null
        : phases.find(p => p.title === phaseName)?.id
          || localPhases.find(p => p.title === phaseName)?.id
          || null;
      const newTask = {
        id: tempId, title, status: 'New',
        phase: phaseName, phaseID,
        assignee: null, dueDate: null, hours: 0,
      };
      setTasks(prev => [...prev, newTask]);
      setAddingTaskPhase(null);
      api.createTask({ projectID: project.id, phaseID, title })
        .catch(() => {
          setTasks(prev => prev.filter(t => t.id !== tempId));
        });
    };
  }

  const resourceMap = Object.fromEntries(allResources.map(r => [r.id, r.name]));

  const statuses = ['All', 'New', 'In Progress', 'On Hold', 'Complete'];
  const filtered = tasks.filter(t => statusFilter === 'All' || t.status === statusFilter);

  const grouped = filtered.reduce((acc, t) => {
    const key = t.phaseID ? t.phase : 'General';
    (acc[key] = acc[key] || []).push(t);
    return acc;
  }, {});

  const hasGeneral = tasks.some(t => !t.phaseID);
  const serverPhaseNames = phases.map(p => p.title);
  const extraLocalPhaseNames = localPhases
    .filter(lp => !serverPhaseNames.includes(lp.title))
    .map(lp => lp.title);

  const allPhaseNames = [
    ...(hasGeneral ? ['General'] : []),
    ...serverPhaseNames,
    ...extraLocalPhaseNames,
  ];

  const doneTasks = tasks.filter(t => t.status === 'Complete').length;
  const totalHours = tasks.reduce((s, t) => s + (t.hours || 0), 0);
  const pct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const overdue = isOverdue(projectDueDate);
  const pill = STATUS_PILL[projectStatus] || { bg: 'rgba(82,82,91,0.15)', color: '#a0a0a0' };

  const clientDisplay = (() => {
    const label = clientLabel(project.client);
    if (!label || label === '—' || /^client #0/i.test(label)) return null;
    return label;
  })();

  return (
    <>
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        zIndex: 200,
        animation: 'backdropIn 200ms ease forwards',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: 480,
          background: 'var(--bg-panel)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          animation: 'panelIn 200ms cubic-bezier(0.4,0,0.2,1) forwards',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: 12, marginBottom: 14,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Client badge + status pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 8, flexWrap: 'wrap',
              }}>
                {clientDisplay && (
                  <span style={{
                    background: pill.bg, color: pill.color,
                    fontSize: 10, fontWeight: 700,
                    fontFamily: 'system-ui, sans-serif',
                    padding: '2px 8px', borderRadius: 4,
                    letterSpacing: '0.02em',
                  }}>{clientDisplay}</span>
                )}

                {/* Clickable status pill */}
                <div style={{ position: 'relative' }}>
                  <span
                    onClick={() => setShowProjectStatusDrop(v => !v)}
                    style={{
                      background: pill.bg, color: pill.color,
                      borderRadius: 9999, padding: '2px 9px',
                      fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      userSelect: 'none', display: 'inline-flex', alignItems: 'center', gap: 3,
                    }}
                  >
                    {projectStatus}
                    <span style={{ fontSize: 7, opacity: 0.7 }}>▾</span>
                  </span>
                  {showProjectStatusDrop && (
                    <div
                      onMouseLeave={() => setShowProjectStatusDrop(false)}
                      style={{
                        position: 'absolute', top: '100%', left: 0, zIndex: 20, marginTop: 4,
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 8, boxShadow: 'var(--shadow-hover)',
                        minWidth: 150, overflow: 'hidden',
                      }}
                    >
                      {STATUSES.map(s => {
                        const p = STATUS_PILL[s] || { bg: 'transparent', color: 'var(--text-primary)' };
                        return (
                          <button
                            key={s}
                            onClick={() => handleProjectStatusChange(s)}
                            style={{
                              display: 'flex', alignItems: 'center',
                              width: '100%', padding: '7px 10px',
                              background: 'transparent', border: 'none',
                              borderBottom: '1px solid var(--border)',
                              cursor: 'pointer', fontFamily: 'inherit',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span style={{
                              background: p.bg, color: p.color,
                              borderRadius: 9999, padding: '2px 8px', fontSize: 10, fontWeight: 600,
                            }}>{s}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Project name in Lora */}
              <h2 style={{
                fontFamily: LORA,
                fontSize: 22, fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.25, letterSpacing: '-0.3px',
                margin: 0,
              }}>{project.name}</h2>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                fontSize: 18, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .12s, color .12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >×</button>
          </div>

          {/* 2×2 stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 3 }}>Tasks done</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: LORA }}>{doneTasks} / {tasks.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 3 }}>Hours logged</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: LORA }}>{totalHours.toFixed(1)}h</div>
            </div>
            {/* Due date */}
            <div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 3 }}>Due date</div>
              {editingDueDate ? (
                <input
                  type="date"
                  autoFocus
                  defaultValue={projectDueDate ? projectDueDate.slice(0, 10) : ''}
                  onChange={e => {
                    const val = e.target.value;
                    const prev = projectDueDate;
                    setProjectDueDate(val || null);
                    setEditingDueDate(false);
                    api.updateProject({ id: project.id, dueDate: val }).catch(() => setProjectDueDate(prev));
                  }}
                  onBlur={() => setEditingDueDate(false)}
                  style={{
                    background: 'transparent', border: '1px solid var(--accent-blue)',
                    borderRadius: 4, color: 'var(--text-primary)',
                    fontSize: 12, padding: '2px 6px',
                    fontFamily: 'inherit', outline: 'none',
                  }}
                />
              ) : (
                <div
                  onClick={() => setEditingDueDate(true)}
                  style={{ fontSize: 14, fontWeight: 600, color: overdue ? 'var(--accent-red)' : 'var(--text-primary)', cursor: 'pointer', fontFamily: LORA }}
                >{fmtDate(projectDueDate) || '—'}</div>
              )}
            </div>
            {/* Tech */}
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 3 }}>Tech</div>
              <div
                onClick={() => { setShowTechDrop(v => !v); setTechSearch(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
              >
                <Avatar name={projectAssignee} size={18} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {projectAssignee || '—'}
                </span>
              </div>
              {showTechDrop && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, zIndex: 20, marginTop: 4,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 8, boxShadow: 'var(--shadow-hover)',
                  minWidth: 200, maxHeight: 240, overflow: 'auto',
                }}>
                  <input
                    autoFocus
                    value={techSearch}
                    onChange={e => setTechSearch(e.target.value)}
                    placeholder="Search resources…"
                    onBlur={() => setTimeout(() => { setShowTechDrop(false); setTechSearch(''); }, 150)}
                    style={{
                      width: '100%', padding: '8px 12px',
                      background: 'transparent', border: 'none',
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: 12,
                      outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                    }}
                  />
                  {allResources.filter(r => !techSearch || r.name.toLowerCase().includes(techSearch.toLowerCase())).map(r => (
                    <button
                      key={r.id}
                      onMouseDown={() => {
                        const prev = projectAssignee;
                        setProjectAssignee(r.name);
                        setShowTechDrop(false);
                        setTechSearch('');
                        api.updateProject({ id: project.id, assigneeID: r.id }).catch(() => setProjectAssignee(prev));
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        width: '100%', padding: '7px 12px',
                        background: 'transparent', border: 'none',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer', fontSize: 12, color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Avatar name={r.name} size={16} />
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Progress</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{pct}%</span>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: progressBarColor(pct),
                borderRadius: 9999, transition: 'width .4s ease',
              }} />
            </div>
          </div>
        </div>

        {/* Status filter */}
        <div style={{
          padding: '8px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0,
        }}>
          {statuses.map(s => {
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  background: active ? 'var(--bg-hover)' : 'transparent',
                  border: `1px solid ${active ? 'var(--border-hover)' : 'transparent'}`,
                  borderRadius: 6, padding: '3px 10px', fontSize: 11,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: active ? 500 : 400,
                  transition: 'all .1s',
                }}
              >{s}</button>
            );
          })}
        </div>

        {/* Add Phase */}
        <div style={{ flexShrink: 0 }}>
          {addingPhase ? (
            <InlineInput
              placeholder="Phase name…"
              onCommit={handleCreatePhase}
              onCancel={() => setAddingPhase(false)}
            />
          ) : (
            <div style={{ padding: '7px 18px', borderBottom: '1px solid var(--border)' }}>
              <button
                onClick={() => setAddingPhase(true)}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'var(--accent-blue)', fontSize: 12,
                  cursor: 'pointer', padding: 0,
                  fontFamily: 'inherit', fontWeight: 500,
                }}
              >+ Add Phase</button>
            </div>
          )}
        </div>

        {/* Task list */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          {loading ? <Spinner /> : allPhaseNames.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, fontSize: 13, color: 'var(--text-muted)' }}>
              No tasks yet
            </div>
          ) : (
            allPhaseNames.map(phase => {
              const phaseTasks = grouped[phase] || [];
              const phaseDone = phaseTasks.filter(t => t.status === 'Complete').length;

              return (
                <div key={phase}>
                  {/* Phase header */}
                  <div style={{
                    padding: '8px 18px',
                    position: 'sticky', top: 0, zIndex: 5,
                    background: 'var(--bg-panel)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{
                      fontFamily: LORA,
                      fontStyle: 'italic',
                      fontSize: 11, fontWeight: 400,
                      color: 'var(--text-secondary)',
                      letterSpacing: '0.01em',
                    }}>{phase}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {phaseDone}/{phaseTasks.length}
                    </span>
                  </div>

                  {/* Task rows */}
                  {phaseTasks.map(t => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      resourceMap={resourceMap}
                      onToggle={handleToggle}
                      onOpen={t => setSelectedTask({
                        ...t,
                        projectID: project.id,
                        assigneeID: t.assignedResourceID || t.assigneeID || null,
                        assigneeName: resourceMap[t.assignedResourceID] || resourceMap[t.assigneeID] || null,
                      })}
                    />
                  ))}

                  {/* Add task */}
                  {addingTaskPhase === phase ? (
                    <InlineInput
                      placeholder="Task title…"
                      onCommit={handleCreateTask(phase)}
                      onCancel={() => setAddingTaskPhase(null)}
                    />
                  ) : (
                    <div
                      onClick={() => setAddingTaskPhase(phase)}
                      style={{
                        padding: '6px 18px', height: 32,
                        display: 'flex', alignItems: 'center',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <span style={{ fontSize: 11, color: 'var(--accent-blue)' }}>+ Add task</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>

    {selectedTask && (
      <TaskDetail
        task={selectedTask}
        project={{ ...project, status: projectStatus }}
        onClose={() => { setSelectedTask(null); loadTasks(); }}
        onTaskUpdate={updated => {
          setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
        }}
        onProjectStatusUpdate={status => handleProjectStatusChange(status)}
      />
    )}
    </>
  );
}
