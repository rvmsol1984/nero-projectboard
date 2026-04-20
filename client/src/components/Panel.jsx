import { useState, useEffect } from 'react';
import { api } from '../api.js';
import {
  COLUMNS, assigneeColor, initials, clientLabel,
  isOverdue, fmtDate, priorityColor, statusColor, progressColor,
} from '../theme.js';

/* ── Shared atoms ────────────────────────────────────────────── */
function Avatar({ name, size = 20 }) {
  const isNumeric = !name || /^\d+$/.test(String(name));
  return (
    <div title={name} style={{
      width: size, height: size, borderRadius: '50%',
      background: isNumeric ? 'var(--border-hover)' : assigneeColor(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.42), fontWeight: 600,
      color: '#fff', flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}

function OutlinePill({ color, children }) {
  return (
    <span style={{
      color, border: `1px solid ${color}`,
      borderRadius: 9999, padding: '2px 9px',
      fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function FilterPill({ value, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'var(--accent-blue)' : 'transparent',
      border: `1px solid ${active ? 'var(--accent-blue)' : 'var(--border)'}`,
      borderRadius: 9999,
      padding: '3px 11px',
      fontSize: 11,
      color: active ? '#fff' : 'var(--text-secondary)',
      cursor: 'pointer', fontWeight: active ? 600 : 400,
      whiteSpace: 'nowrap', transition: 'all .15s',
    }}>{value}</button>
  );
}

/* ── Task checkbox ───────────────────────────────────────────── */
function TaskCheck({ status, bouncing }) {
  const done = status === 'Complete';
  const inProg = status === 'In Progress';
  return (
    <div style={{
      position: 'relative', width: 16, height: 16, flexShrink: 0,
      animation: bouncing ? 'checkBounce 180ms ease' : 'none',
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: 4,
        border: `1.5px solid ${done ? 'var(--accent-green)' : 'var(--border-hover)'}`,
        background: done ? 'var(--accent-green)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 150ms ease, border-color 150ms ease',
      }}>
        {done && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {inProg && !done && (
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--accent-orange)',
          }} />
        )}
      </div>
    </div>
  );
}

/* ── Task row ────────────────────────────────────────────────── */
function TaskRow({ task, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const done = task.status === 'Complete';
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
        padding: '0 18px', height: 40, cursor: 'pointer',
        background: hovered ? 'var(--bg-hover)' : 'transparent',
        borderBottom: '1px solid var(--border)',
        transition: 'background .12s',
      }}
    >
      <TaskCheck status={task.status} bouncing={bouncing} />

      <span style={{
        flex: 1, fontSize: 13,
        color: done ? 'var(--text-muted)' : 'var(--text-primary)',
        textDecoration: done ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        transition: 'color .15s',
      }}>{task.title}</span>

      {/* Status dot + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, minWidth: 88 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: statusColor(task.status), flexShrink: 0,
        }} />
        <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {task.status}
        </span>
      </div>

      <span style={{
        fontSize: 11, color: 'var(--text-muted)',
        flexShrink: 0, minWidth: 32, textAlign: 'right',
      }}>{task.hours || 0}h</span>

      <Avatar name={task.assignee} size={18} />

      <span style={{
        fontSize: 11,
        color: overdue ? 'var(--accent-red)' : 'var(--text-muted)',
        flexShrink: 0, minWidth: 78, textAlign: 'right',
      }}>{fmtDate(task.dueDate)}</span>
    </div>
  );
}

/* ── Panel spinner ───────────────────────────────────────────── */
function Loading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 48, flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        border: '2px solid var(--border)',
        borderTopColor: 'var(--accent-blue)',
        animation: 'spin .8s linear infinite',
      }} />
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loading tasks…</span>
    </div>
  );
}

/* ── Panel ───────────────────────────────────────────────────── */
export default function Panel({ project, onClose }) {
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
  const colColor = COLUMNS.find(c => c.id === project.status)?.color || 'var(--accent-blue)';
  const overdue = isOverdue(project.dueDate);

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 200,
        animation: 'backdropIn 200ms ease forwards',
      }}
    >
      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: 500,
          background: 'var(--bg-panel)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          animation: 'panelIn 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          {/* Meta row */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: 12,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 7, marginBottom: 8, flexWrap: 'wrap',
              }}>
                <span style={{
                  fontSize: 11, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500,
                }}>{clientLabel(project.client)}</span>
                <OutlinePill color={priorityColor(project.priority)}>
                  {project.priority}
                </OutlinePill>
                {overdue && (
                  <OutlinePill color="var(--accent-red)">OVERDUE</OutlinePill>
                )}
              </div>

              <h2 style={{
                fontSize: 22, fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.2, letterSpacing: '-0.3px',
                marginBottom: project.tags?.length ? 10 : 0,
              }}>{project.name}</h2>

              {project.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {project.tags.map(t => (
                    <span key={t} style={{
                      border: '1px solid var(--border)', borderRadius: 5,
                      padding: '2px 8px', fontSize: 11,
                      color: 'var(--text-secondary)',
                    }}>{t}</span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 7,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                width: 30, height: 30,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, lineHeight: 1, flexShrink: 0,
                transition: 'border-color .15s, color .15s',
              }}
            >×</button>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12, marginTop: 14,
          }}>
            {[
              { label: 'Done',  value: `${doneTasks}/${tasks.length}` },
              { label: 'Hours', value: `${totalHours.toFixed(1)}h`   },
              { label: 'Due',   value: fmtDate(project.dueDate),
                color: overdue ? 'var(--accent-red)' : undefined },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{
                  fontSize: 9, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  fontWeight: 600, marginBottom: 3,
                }}>{label}</div>
                <div style={{
                  fontSize: 14, fontWeight: 600,
                  color: color || 'var(--text-primary)',
                }}>{value}</div>
              </div>
            ))}
            <div>
              <div style={{
                fontSize: 9, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                fontWeight: 600, marginBottom: 4,
              }}>Lead</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Avatar name={project.assignee} size={18} />
                <span style={{
                  fontSize: 13, fontWeight: 500,
                  color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{clientLabel(project.assignee) === '—' ? (project.assignee || '—') : project.assignee || '—'}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Progress</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{pct}%</span>
            </div>
            <div style={{
              height: 6, background: 'var(--border)',
              borderRadius: 9999, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: progressColor(pct),
                borderRadius: 9999, transition: 'width .4s ease',
              }} />
            </div>
          </div>
        </div>

        {/* ── Filter bar ─────────────────────────────────────── */}
        <div style={{
          padding: '10px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', gap: 6, flexWrap: 'wrap',
          alignItems: 'center', flexShrink: 0,
        }}>
          {phases.map(p => (
            <FilterPill
              key={p}
              value={p === 'All' ? 'All Phases' : p}
              active={phaseFilter === p}
              onClick={() => setPhaseFilter(p)}
            />
          ))}
          <div style={{
            width: 1, height: 16,
            background: 'var(--border)', margin: '0 2px', flexShrink: 0,
          }} />
          {statuses.map(s => (
            <FilterPill
              key={s}
              value={s === 'All' ? 'All' : s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
            />
          ))}
        </div>

        {/* ── Task list ──────────────────────────────────────── */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          {loading ? (
            <Loading />
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', color: 'var(--text-muted)',
              fontSize: 13, padding: 40,
            }}>No tasks found</div>
          ) : (
            Object.entries(grouped).map(([phase, phaseTasks]) => {
              const phaseDone = phaseTasks.filter(t => t.status === 'Complete').length;
              return (
                <div key={phase}>
                  {/* Sticky phase header */}
                  <div style={{
                    padding: '9px 18px 7px',
                    position: 'sticky', top: 0, zIndex: 5,
                    background: 'var(--bg-panel)',
                    borderBottom: '1px solid var(--border)',
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
                  {phaseTasks.map(t => (
                    <TaskRow key={t.id} task={t} onToggle={handleToggle} />
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
