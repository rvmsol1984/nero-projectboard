import { useState, useEffect } from 'react';
import { api } from '../api.js';
import {
  COLUMNS,
  assigneeColor,
  initials,
  isOverdue,
  fmtDate,
  priorityColor,
  statusColor,
} from '../theme.js';

function PriorityDot({ priority, size = 7 }) {
  return (
    <span
      title={priority}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: priorityColor(priority),
        display: 'inline-block', flexShrink: 0,
      }}
    />
  );
}

function Avatar({ name, size = 20 }) {
  return (
    <div
      title={name}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: assigneeColor(name),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.4),
        fontWeight: 600, color: '#fff', flexShrink: 0,
        letterSpacing: '-0.3px',
      }}
    >
      {initials(name)}
    </div>
  );
}

function Badge({ color, children }) {
  return (
    <span style={{
      background: `color-mix(in srgb, ${color} 15%, transparent)`,
      color,
      border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
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
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--bg-hover)' : 'transparent',
        border: `1px solid ${active ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius: 4,
        padding: '4px 10px',
        fontSize: 12,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        fontWeight: active ? 500 : 400,
        transition: 'all .1s',
      }}
    >
      {value}
    </button>
  );
}

function TaskRow({ task, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const done = task.status === 'Complete';
  const inProgress = task.status === 'In Progress';

  return (
    <div
      onClick={() => onToggle(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 20px',
        height: 40,
        cursor: 'pointer',
        background: hovered ? 'var(--bg-hover)' : 'transparent',
        borderBottom: '1px solid var(--border)',
        transition: 'background .1s',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <input
          type="checkbox"
          checked={done}
          onChange={(e) => { e.stopPropagation(); onToggle(task); }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 14, height: 14,
            cursor: 'pointer',
            accentColor: 'var(--accent-green)',
            display: 'block',
          }}
        />
        {inProgress && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent-orange)',
            border: '1.5px solid var(--bg-card)',
          }} />
        )}
      </div>
      <PriorityDot priority={task.priority} size={6} />
      <span style={{
        flex: 1,
        fontSize: 13,
        color: done ? 'var(--text-muted)' : 'var(--text-primary)',
        textDecoration: done ? 'line-through' : 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {task.title}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Badge color={statusColor(task.status)}>{task.status}</Badge>
        <span style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          minWidth: 32,
          textAlign: 'right',
        }}>{task.hours}h</span>
        <Avatar name={task.assignee} size={20} />
        <span style={{
          fontSize: 11,
          color: isOverdue(task.dueDate) ? 'var(--accent-red)' : 'var(--text-muted)',
          minWidth: 78,
          textAlign: 'right',
        }}>{fmtDate(task.dueDate)}</span>
      </div>
    </div>
  );
}

function ModalSpinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 48, flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        border: '2px solid var(--border)',
        borderTopColor: 'var(--accent-blue)',
        animation: 'spin .8s linear infinite',
      }} />
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading tasks…</span>
    </div>
  );
}

export default function Modal({ project, onClose }) {
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
    const original = task.status;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    api.updateTaskStatus(task.id, newStatus).catch(() => {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: original } : t));
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
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeIn .15s ease',
      }}
    >
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '10px 10px 0 0',
        width: '100%',
        maxWidth: 920,
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp .2s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 8, marginBottom: 6, flexWrap: 'wrap',
              }}>
                <span style={{
                  fontSize: 10, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.6px',
                  fontWeight: 500,
                }}>
                  {project.client}
                </span>
                <Badge color={priorityColor(project.priority)}>{project.priority}</Badge>
                {overdue && <Badge color="var(--accent-red)">OVERDUE</Badge>}
              </div>
              <h2 style={{
                fontSize: 18, fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: 8,
                letterSpacing: '-0.2px',
              }}>
                {project.name}
              </h2>
              {project.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                  {project.tags.map(t => (
                    <span key={t} style={{
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      padding: '1px 7px',
                      fontSize: 11,
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
                borderRadius: 6,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '2px 10px',
                fontSize: 18,
                lineHeight: 1.2,
                flexShrink: 0,
              }}
            >×</button>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex', gap: 24, flexWrap: 'wrap',
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            marginTop: 4,
          }}>
            <Stat label="Tasks Done" value={`${doneTasks} / ${tasks.length}`} />
            <Stat label="Hours Logged" value={`${totalHours.toFixed(1)}h`} />
            <Stat
              label="Due Date"
              value={fmtDate(project.dueDate)}
              color={overdue ? 'var(--accent-red)' : undefined}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{
                fontSize: 10, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                fontWeight: 500,
              }}>Lead</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Avatar name={project.assignee} size={18} />
                <span style={{
                  fontSize: 13, color: 'var(--text-primary)', fontWeight: 500,
                }}>{project.assignee || '—'}</span>
              </div>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 4,
              flex: 1, minWidth: 120, justifyContent: 'center',
            }}>
              <span style={{
                fontSize: 10, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                fontWeight: 500,
              }}>Progress {pct}%</span>
              <div style={{
                height: 4, background: 'var(--border)',
                borderRadius: 2, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: colColor, borderRadius: 2,
                  transition: 'width .3s',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{
          padding: '10px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', gap: 6, flexWrap: 'wrap',
          alignItems: 'center',
          flexShrink: 0,
          background: 'var(--bg-card)',
        }}>
          {phases.map(p => (
            <FilterPill
              key={p}
              value={p === 'All' ? 'All Phases' : `Phase: ${p}`}
              active={phaseFilter === p}
              onClick={() => setPhaseFilter(p)}
            />
          ))}
          <div style={{
            width: 1, height: 18, background: 'var(--border)',
            margin: '0 4px',
          }} />
          {statuses.map(s => (
            <FilterPill
              key={s}
              value={s === 'All' ? 'All Statuses' : s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
            />
          ))}
        </div>

        {/* Task list */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          {loading ? (
            <ModalSpinner />
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
              padding: 32,
            }}>No tasks found</div>
          ) : (
            Object.entries(grouped).map(([phase, phaseTasks]) => (
              <div key={phase}>
                <div style={{
                  padding: '10px 20px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  background: 'var(--bg-card)',
                  borderBottom: '1px solid var(--border)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span>Phase: {phase}</span>
                  <span style={{
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '0 6px',
                    fontWeight: 500,
                    fontSize: 10,
                  }}>{phaseTasks.length}</span>
                </div>
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

function Stat({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{
        fontSize: 10, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.8px',
        fontWeight: 500,
      }}>{label}</span>
      <span style={{
        fontSize: 13, color: color || 'var(--text-primary)', fontWeight: 500,
      }}>{value}</span>
    </div>
  );
}
