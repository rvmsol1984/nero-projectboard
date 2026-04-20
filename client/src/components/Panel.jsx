import { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';
import {
  COLUMNS, STATUS_PILL, assigneeColor, initials, clientLabel,
  isOverdue, fmtDate, priorityColor, statusColor, progressBarColor,
} from '../theme.js';

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
      border: `1.5px solid ${done ? 'var(--green)' : 'var(--border-subtle)'}`,
      background: done ? 'var(--green)' : 'transparent',
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
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--orange)' }} />
      ) : null}
    </div>
  );
}

function TaskRow({ task, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const done = task.status === 'Complete';
  const inProg = task.status === 'In Progress';
  const overdue = isOverdue(task.dueDate);

  function handleClick() {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 200);
    onToggle(task);
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 18px', height: 38, cursor: 'pointer',
        background: hovered ? 'var(--bg-hover)' : 'transparent',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background .1s',
      }}
    >
      <TaskCheck done={done} inProg={inProg} bouncing={bouncing} />
      <span style={{
        flex: 1, fontSize: 13,
        color: done ? 'var(--text-muted)' : 'var(--text-primary)',
        textDecoration: done ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        transition: 'color .15s',
      }}>{task.title}</span>
      <Avatar name={task.assignee} size={16} />
      <span style={{
        fontSize: 11,
        color: overdue ? 'var(--red)' : 'var(--text-muted)',
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
      padding: '6px 18px', borderBottom: '1px solid var(--border-subtle)',
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
          borderBottom: '1px solid var(--accent)',
          color: 'var(--text-primary)', fontSize: 13,
          padding: '3px 0', outline: 'none', fontFamily: 'inherit',
        }}
      />
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); if (val.trim()) onCommit(val.trim()); }}
        style={{
          background: 'var(--accent)', border: 'none', borderRadius: 4,
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
        border: '2px solid var(--border-subtle)',
        borderTopColor: 'var(--accent)',
        animation: 'spin .8s linear infinite',
      }} />
    </div>
  );
}

export default function Panel({ project, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [localPhases, setLocalPhases] = useState([]);
  const [addingPhase, setAddingPhase] = useState(false);
  const [addingTaskPhase, setAddingTaskPhase] = useState(null);
  const [hoveredPhase, setHoveredPhase] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getTasksForProject(project.id)
      .then(data => { if (!cancelled) { setTasks(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [project.id]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleToggle(task) {
    const newStatus = task.status === 'Complete' ? 'New' : 'Complete';
    const orig = task.status;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    api.updateTaskStatus(task.id, newStatus).catch(() => {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: orig } : t));
    });
  }

  function handleCreatePhase(title) {
    const tempPhase = { id: null, title };
    setLocalPhases(prev => [...prev, tempPhase]);
    setAddingPhase(false);
    api.createPhase({ projectID: project.id, title })
      .then(res => {
        setLocalPhases(prev => prev.map(p => p.title === title ? { ...p, id: res.id } : p));
      })
      .catch(() => {
        setLocalPhases(prev => prev.filter(p => p.title !== title));
      });
  }

  function handleCreateTask(phaseName) {
    return (title) => {
      const tempId = `temp-${Date.now()}`;
      const phaseID = tasks.find(t => t.phase === phaseName)?.phaseID
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

  const statuses = ['All', 'New', 'In Progress', 'On Hold', 'Complete'];
  const filtered = tasks.filter(t => statusFilter === 'All' || t.status === statusFilter);

  const grouped = filtered.reduce((acc, t) => {
    (acc[t.phase] = acc[t.phase] || []).push(t);
    return acc;
  }, {});

  const phasesFromTasks = Object.keys(grouped);
  const extraPhases = localPhases
    .filter(p => !phasesFromTasks.includes(p.title))
    .map(p => p.title);
  const allPhaseNames = [...phasesFromTasks, ...extraPhases];

  const doneTasks = tasks.filter(t => t.status === 'Complete').length;
  const totalHours = tasks.reduce((s, t) => s + (t.hours || 0), 0);
  const pct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const overdue = isOverdue(project.dueDate);
  const pill = STATUS_PILL[project.status] || { bg: 'rgba(82,82,91,0.15)', color: '#52525b' };

  return (
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
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column',
          animation: 'panelIn 200ms cubic-bezier(0.4,0,0.2,1) forwards',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: 12, marginBottom: 14,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap',
              }}>
                <span style={{
                  fontSize: 10, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500,
                }}>{clientLabel(project.client)}</span>
                <span style={{
                  background: pill.bg, color: pill.color,
                  borderRadius: 9999, padding: '1px 8px',
                  fontSize: 10, fontWeight: 600,
                }}>{project.status}</span>
              </div>
              <h2 style={{
                fontSize: 20, fontWeight: 600,
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
            {[
              { label: 'Tasks done',   value: `${doneTasks} / ${tasks.length}` },
              { label: 'Hours logged', value: `${totalHours.toFixed(1)}h` },
              { label: 'Due date',     value: fmtDate(project.dueDate), accent: overdue ? 'var(--red)' : null },
              { label: 'Lead',         isLead: true },
            ].map(({ label, value, accent, isLead }) => (
              <div key={label}>
                <div style={{
                  fontSize: 9, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  fontWeight: 600, marginBottom: 3,
                }}>{label}</div>
                {isLead ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar name={project.assignee} size={18} />
                    <span style={{
                      fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{project.assignee || '—'}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 14, fontWeight: 600, color: accent || 'var(--text-primary)' }}>
                    {value}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Progress</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{pct}%</span>
            </div>
            <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 9999, overflow: 'hidden' }}>
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
          borderBottom: '1px solid var(--border-subtle)',
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
                  border: `1px solid ${active ? 'var(--border-subtle)' : 'transparent'}`,
                  borderRadius: 6, padding: '3px 10px', fontSize: 11,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: active ? 500 : 400,
                  transition: 'all .1s',
                }}
              >{s}</button>
            );
          })}
        </div>

        {/* Task list */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          {loading ? <Spinner /> : allPhaseNames.length === 0 && !addingPhase ? (
            <div style={{ textAlign: 'center', padding: 40, fontSize: 13, color: 'var(--text-muted)' }}>
              No tasks yet
            </div>
          ) : (
            <>
              {allPhaseNames.map(phase => {
                const phaseTasks = grouped[phase] || [];
                const phaseDone = phaseTasks.filter(t => t.status === 'Complete').length;
                const isHovered = hoveredPhase === phase;

                return (
                  <div
                    key={phase}
                    onMouseEnter={() => setHoveredPhase(phase)}
                    onMouseLeave={() => setHoveredPhase(null)}
                  >
                    {/* Phase header */}
                    <div style={{
                      padding: '8px 18px',
                      position: 'sticky', top: 0, zIndex: 5,
                      background: 'var(--bg-panel)',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.07em',
                      }}>{phase}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {phaseDone}/{phaseTasks.length}
                      </span>
                    </div>

                    {/* Task rows */}
                    {phaseTasks.map(t => (
                      <TaskRow key={t.id} task={t} onToggle={handleToggle} />
                    ))}

                    {/* Add task inline input */}
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
                          opacity: isHovered ? 1 : 0,
                          transition: 'opacity .15s',
                          borderBottom: '1px solid var(--border-subtle)',
                        }}
                      >
                        <span style={{ fontSize: 11, color: 'var(--accent)' }}>+ Add task</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add phase section */}
              <div style={{ padding: '10px 18px' }}>
                {addingPhase ? (
                  <InlineInput
                    placeholder="Phase name…"
                    onCommit={handleCreatePhase}
                    onCancel={() => setAddingPhase(false)}
                  />
                ) : (
                  <button
                    onClick={() => setAddingPhase(true)}
                    style={{
                      background: 'transparent', border: 'none',
                      color: 'var(--accent)', fontSize: 12,
                      cursor: 'pointer', padding: '4px 0',
                      fontFamily: 'inherit', fontWeight: 500,
                    }}
                  >+ Add Phase</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
