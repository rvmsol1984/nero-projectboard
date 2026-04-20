import { useState, useEffect } from 'react';
import { api } from '../api.js';
import {
  COLUMNS,
  assigneeColor, initials,
  isOverdue, fmtDate,
  priorityColor, statusColor, progressColor,
} from '../theme.js';

/* ── Shared micro-components ─────────────────────────────────── */
function Avatar({ name, size = 20 }) {
  return (
    <div title={name} style={{
      width: size, height: size, borderRadius: '50%',
      background: assigneeColor(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.38), fontWeight: 600,
      color: '#fff', flexShrink: 0, letterSpacing: '-0.3px',
    }}>
      {initials(name)}
    </div>
  );
}

function OutlineBadge({ color, children }) {
  return (
    <span style={{
      color,
      border: `1px solid ${color}`,
      borderRadius: 4,
      padding: '1px 7px',
      fontSize: 11,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function FilterPill({ value, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'var(--bg-hover)' : 'transparent',
      border: `1px solid ${active ? 'var(--border-hover)' : 'var(--border)'}`,
      borderRadius: 4,
      padding: '3px 10px',
      fontSize: 11,
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      cursor: 'pointer',
      fontWeight: active ? 500 : 400,
      whiteSpace: 'nowrap',
      transition: 'all .1s',
    }}>{value}</button>
  );
}

/* ── Custom checkbox ─────────────────────────────────────────── */
function TaskCheck({ status }) {
  const done = status === 'Complete';
  const inProg = status === 'In Progress';
  return (
    <div style={{ position: 'relative', width: 15, height: 15, flexShrink: 0 }}>
      <div style={{
        width: 15, height: 15, borderRadius: 3,
        border: `1.5px solid ${done ? 'var(--accent-green)' : 'var(--border-hover)'}`,
        background: done ? 'var(--accent-green)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {done && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="#fff"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {inProg && !done && (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--accent-orange)',
          border: '1.5px solid var(--bg-card)',
        }} />
      )}
    </div>
  );
}

/* ── Task row ────────────────────────────────────────────────── */
function TaskRow({ task, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const done = task.status === 'Complete';
  const overdue = isOverdue(task.dueDate);

  return (
    <div
      onClick={() => onToggle(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '0 16px', height: 36,
        cursor: 'pointer',
        background: hovered ? 'var(--bg-hover)' : 'transparent',
        borderBottom: '1px solid var(--border)',
        transition: 'background .1s',
      }}
    >
      <TaskCheck status={task.status} />

      <span style={{
        flex: 1, fontSize: 13,
        color: done ? 'var(--text-muted)' : 'var(--text-primary)',
        textDecoration: done ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{task.title}</span>

      {/* Mini status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        flexShrink: 0, minWidth: 80,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: statusColor(task.status),
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap',
        }}>{task.status}</span>
      </div>

      <span style={{
        fontSize: 11, color: 'var(--text-muted)',
        flexShrink: 0, minWidth: 28, textAlign: 'right',
      }}>{task.hours || 0}h</span>

      <Avatar name={task.assignee} size={18} />

      <span style={{
        fontSize: 11,
        color: overdue ? 'var(--accent-red)' : 'var(--text-muted)',
        flexShrink: 0, minWidth: 76, textAlign: 'right',
      }}>{fmtDate(task.dueDate)}</span>
    </div>
  );
}

/* ── Loading spinner ─────────────────────────────────────────── */
function PanelSpinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 48, flexDirection: 'column', gap: 10,
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

/* ── Stat cell ───────────────────────────────────────────────── */
function Stat({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span style={{
        fontSize: 9, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600,
      }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 500,
        color: color || 'var(--text-primary)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{value}</span>
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
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
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
        background: 'rgba(0,0,0,0.35)',
        zIndex: 200,
        animation: 'fadeIn .15s ease',
      }}
    >
      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: 480,
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight .22s ease',
          zIndex: 201,
          overflow: 'hidden',
        }}
      >
        {/* ── Panel Header ───────────────────────────────────── */}
        <div style={{
          padding: '16px 18px 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          {/* Close + meta row */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: 12, marginBottom: 8,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 7, marginBottom: 6, flexWrap: 'wrap',
              }}>
                <span style={{
                  fontSize: 10, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500,
                }}>{/^\d+$/.test(String(project.client)) ? `Client #${project.client}` : project.client}</span>
                <OutlineBadge color={priorityColor(project.priority)}>
                  {project.priority}
                </OutlineBadge>
                {overdue && (
                  <OutlineBadge color="var(--accent-red)">OVERDUE</OutlineBadge>
                )}
              </div>

              <h2 style={{
                fontSize: 17, fontWeight: 500,
                color: 'var(--text-primary)',
                letterSpacing: '-0.2px',
                lineHeight: 1.3,
                marginBottom: project.tags?.length ? 8 : 0,
              }}>{project.name}</h2>

              {project.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {project.tags.map(t => (
                    <span key={t} style={{
                      border: '1px solid var(--border)', borderRadius: 4,
                      padding: '1px 6px', fontSize: 10,
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
                borderRadius: 5,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '2px 9px 3px',
                fontSize: 17, lineHeight: 1.2,
                flexShrink: 0,
              }}
            >×</button>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr) 2fr',
            gap: 12,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}>
            <Stat label="Done" value={`${doneTasks}/${tasks.length}`} />
            <Stat label="Hours" value={`${totalHours.toFixed(1)}h`} />
            <Stat
              label="Due"
              value={fmtDate(project.dueDate)}
              color={overdue ? 'var(--accent-red)' : undefined}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{
                fontSize: 9, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600,
              }}>Lead</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                <Avatar name={project.assignee} size={17} />
                <span style={{
                  fontSize: 12, color: 'var(--text-primary)',
                  fontWeight: 500, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{project.assignee || '—'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
              <span style={{
                fontSize: 9, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600,
              }}>Progress {pct}%</span>
              <div style={{
                height: 6, background: 'var(--border)',
                borderRadius: 3, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: progressColor(pct),
                  borderRadius: 3, transition: 'width .3s',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter bar ─────────────────────────────────────── */}
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', gap: 5, flexWrap: 'wrap',
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
            background: 'var(--border)', margin: '0 3px', flexShrink: 0,
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
            <PanelSpinner />
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 12, padding: 32,
            }}>No tasks found</div>
          ) : (
            Object.entries(grouped).map(([phase, phaseTasks]) => {
              const phaseDone = phaseTasks.filter(t => t.status === 'Complete').length;
              return (
                <div key={phase}>
                  {/* Phase header */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 16px 6px',
                    position: 'sticky', top: 0, zIndex: 5,
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                    }}>{phase}</span>
                    <span style={{
                      fontSize: 10, color: 'var(--text-muted)',
                    }}>{phaseDone}/{phaseTasks.length}</span>
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
