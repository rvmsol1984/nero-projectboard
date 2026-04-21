import { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';
import { STATUS_PILL, assigneeColor, initials } from '../theme.js';

const STATUSES = ['New', 'In Progress', 'On Hold', 'Complete'];

function Avatar({ name, size = 20 }) {
  return (
    <div style={{
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

export default function TaskDetail({ task: initialTask, project, onClose, onTaskUpdate, onProjectStatusUpdate }) {
  const [task, setTask] = useState(initialTask);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(initialTask.title);
  const [description, setDescription] = useState('');
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [showAssigneeDrop, setShowAssigneeDrop] = useState(false);
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceResults, setResourceResults] = useState([]);
  const titleRef = useRef(null);

  useEffect(() => {
    setTask(initialTask);
    setTitleVal(initialTask.title);
    setDescription('');
    setEditingTitle(false);
    setShowStatusDrop(false);
    setShowAssigneeDrop(false);
  }, [initialTask.id]);

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.select();
  }, [editingTitle]);

  useEffect(() => {
    if (resourceSearch.length < 2) { setResourceResults([]); return; }
    const t = setTimeout(async () => {
      try { setResourceResults(await api.searchResources(resourceSearch)); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [resourceSearch]);

  function updateTask(localUpdates, apiFields) {
    const updated = { ...task, ...localUpdates };
    setTask(updated);
    onTaskUpdate?.(updated);
    if (apiFields) {
      api.updateTask({ id: task.id, projectID: task.projectID || project.id, ...apiFields })
        .catch(() => { setTask(task); onTaskUpdate?.(task); });
    }
  }

  function handleStatusChange(status) {
    setShowStatusDrop(false);
    updateTask({ status }, { status });
    if (status === 'In Progress' && project.status === 'New') {
      onProjectStatusUpdate?.('In Progress');
    }
  }

  function handleTitleBlur() {
    setEditingTitle(false);
    if (titleVal.trim() && titleVal.trim() !== task.title) {
      updateTask({ title: titleVal.trim() }, null);
    } else {
      setTitleVal(task.title);
    }
  }

  function handleAssigneeSelect(resource) {
    setShowAssigneeDrop(false);
    setResourceSearch('');
    setResourceResults([]);
    if (resource) {
      updateTask({ assignee: resource.name }, { assigneeID: resource.id });
    } else {
      updateTask({ assignee: null }, { assigneeID: null });
    }
  }

  const pill = STATUS_PILL[task.status] || { bg: 'rgba(82,82,91,0.15)', color: '#52525b' };
  const isNumericAssignee = task.assignee && /^\d+$/.test(String(task.assignee));
  const hasNamedAssignee = task.assignee && !isNumericAssignee;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 350 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: 400,
          background: 'var(--bg-panel)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          animation: 'panelIn 180ms cubic-bezier(0.4,0,0.2,1) forwards',
          overflow: 'hidden', zIndex: 350,
        }}
      >
        {/* Breadcrumb header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexShrink: 0,
        }}>
          <span style={{
            fontSize: 11, color: 'var(--text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {project.name}
            <span style={{ margin: '0 6px', opacity: 0.5 }}>/</span>
            {task.phase}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 26, height: 26, borderRadius: 6, flexShrink: 0, marginLeft: 8,
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .12s, color .12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Checkbox + Title */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div
              onClick={() => handleStatusChange(task.status === 'Complete' ? 'New' : 'Complete')}
              style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 3,
                border: `2px solid ${task.status === 'Complete' ? 'var(--green)' : 'var(--border-subtle)'}`,
                background: task.status === 'Complete' ? 'var(--green)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              {task.status === 'Complete' && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.8 7L9 1" stroke="#fff" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            {editingTitle ? (
              <input
                ref={titleRef}
                value={titleVal}
                onChange={e => setTitleVal(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); handleTitleBlur(); }
                  if (e.key === 'Escape') { setEditingTitle(false); setTitleVal(task.title); }
                }}
                style={{
                  flex: 1, fontSize: 20, fontWeight: 600,
                  color: 'var(--text-primary)', background: 'transparent',
                  border: 'none', borderBottom: '1.5px solid var(--accent)',
                  outline: 'none', fontFamily: 'inherit', padding: '0 0 2px',
                }}
              />
            ) : (
              <h2
                onClick={() => setEditingTitle(true)}
                style={{
                  flex: 1, fontSize: 20, fontWeight: 600, margin: 0,
                  color: task.status === 'Complete' ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: task.status === 'Complete' ? 'line-through' : 'none',
                  lineHeight: 1.3, cursor: 'text', letterSpacing: '-0.2px',
                }}
              >{task.title}</h2>
            )}
          </div>

          {/* Status pill dropdown */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <span
              onClick={() => setShowStatusDrop(v => !v)}
              style={{
                background: pill.bg, color: pill.color,
                borderRadius: 9999, padding: '4px 12px',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                userSelect: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              {task.status}
              <span style={{ fontSize: 8, opacity: 0.7 }}>▾</span>
            </span>
            {showStatusDrop && (
              <div
                onMouseLeave={() => setShowStatusDrop(false)}
                style={{
                  position: 'absolute', top: '100%', left: 0, zIndex: 10, marginTop: 4,
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                  minWidth: 150, overflow: 'hidden',
                }}
              >
                {STATUSES.map(s => {
                  const p = STATUS_PILL[s] || { bg: 'transparent', color: 'var(--text-primary)' };
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        width: '100%', padding: '8px 12px',
                        background: 'transparent', border: 'none',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{
                        background: p.bg, color: p.color,
                        borderRadius: 9999, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                      }}>{s}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Description */}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add description…"
            rows={3}
            style={{
              width: '100%', background: 'transparent',
              border: '1px solid transparent', borderRadius: 6,
              color: 'var(--text-primary)', fontSize: 13,
              padding: '6px 8px', fontFamily: 'inherit',
              resize: 'vertical', minHeight: 72, lineHeight: 1.6,
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color .15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--border-subtle)'; }}
            onBlur={e => { e.target.style.borderColor = 'transparent'; }}
          />

          <div style={{ height: 1, background: 'var(--border-subtle)' }} />

          {/* Properties */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Assignee */}
            <div>
              <div style={{
                fontSize: 9, fontWeight: 600, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
              }}>Assignee</div>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => { setShowAssigneeDrop(v => !v); setResourceSearch(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '3px 0' }}
                >
                  {hasNamedAssignee ? (
                    <>
                      <Avatar name={task.assignee} size={20} />
                      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{task.assignee}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unassigned — click to assign</span>
                  )}
                </div>
                {showAssigneeDrop && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, zIndex: 10, marginTop: 4,
                    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    minWidth: 210, overflow: 'hidden',
                  }}>
                    <input
                      autoFocus
                      value={resourceSearch}
                      onChange={e => setResourceSearch(e.target.value)}
                      placeholder="Search resources…"
                      onBlur={() => setTimeout(() => {
                        setShowAssigneeDrop(false);
                        setResourceSearch('');
                        setResourceResults([]);
                      }, 150)}
                      style={{
                        width: '100%', padding: '8px 12px',
                        background: 'transparent', border: 'none',
                        borderBottom: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)', fontSize: 12,
                        outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                      }}
                    />
                    {hasNamedAssignee && (
                      <button
                        onMouseDown={() => handleAssigneeSelect(null)}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '7px 12px', background: 'transparent',
                          border: 'none', borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >Remove assignee</button>
                    )}
                    {resourceResults.map(r => (
                      <button
                        key={r.id}
                        onMouseDown={() => handleAssigneeSelect(r)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          width: '100%', padding: '7px 12px',
                          background: 'transparent', border: 'none',
                          borderBottom: '1px solid var(--border-subtle)',
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

            {/* Due date */}
            <div>
              <div style={{
                fontSize: 9, fontWeight: 600, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
              }}>Due Date</div>
              <input
                type="date"
                value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                onChange={e => updateTask({ dueDate: e.target.value || null }, { dueDate: e.target.value || null })}
                style={{
                  background: 'transparent', border: '1px solid var(--border-subtle)',
                  borderRadius: 6, color: 'var(--text-primary)',
                  fontSize: 12, padding: '4px 8px',
                  fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
                }}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
