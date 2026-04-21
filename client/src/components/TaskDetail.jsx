import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { STATUS_PILL, assigneeColor, initials } from '../theme.js';

const STATUSES = ['New', 'In Progress', 'On Hold', 'Complete'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const PRIORITY_COLOR = {
  High:   { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
  Medium: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  Low:    { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
};

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

function getDisplayName(task) {
  return task.assignee && !/^\d+$/.test(String(task.assignee)) ? task.assignee : null;
}

export default function TaskDetail({ task: initialTask, project, onClose, onTaskUpdate, onProjectStatusUpdate }) {
  const [draftStatus, setDraftStatus] = useState(initialTask.status || 'New');
  const [draftDueDate, setDraftDueDate] = useState(initialTask.dueDate ? initialTask.dueDate.slice(0, 10) : '');
  const [draftAssignee, setDraftAssignee] = useState(null);
  const [assigneeModified, setAssigneeModified] = useState(false);
  const [priority, setPriority] = useState(initialTask.priority || 'Medium');
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [showAssigneeDrop, setShowAssigneeDrop] = useState(false);
  const [resourceSearch, setResourceSearch] = useState('');
  const [allResources, setAllResources] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [addingSubTask, setAddingSubTask] = useState(false);
  const [subTaskTitle, setSubTaskTitle] = useState('');

  useEffect(() => {
    setDraftStatus(initialTask.status || 'New');
    setDraftDueDate(initialTask.dueDate ? initialTask.dueDate.slice(0, 10) : '');
    setDraftAssignee(null);
    setAssigneeModified(false);
    setPriority(initialTask.priority || 'Medium');
    setShowStatusDrop(false);
    setShowAssigneeDrop(false);
    setSaving(false);
    setSaveError(null);
    setAddingSubTask(false);
    setSubTaskTitle('');
  }, [initialTask.id]);

  useEffect(() => {
    if (!showAssigneeDrop || allResources.length > 0) return;
    api.getResources().then(setAllResources).catch(() => {});
  }, [showAssigneeDrop]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        id: initialTask.id,
        projectID: initialTask.projectID || project.id,
        status: draftStatus,
        dueDate: draftDueDate || null,
      };
      if (assigneeModified) {
        payload.assigneeID = draftAssignee?.id ?? null;
      }
      await api.updateTask(payload);
      if (draftStatus === 'In Progress' && project.status === 'New') {
        onProjectStatusUpdate?.('In Progress');
      }
      onTaskUpdate?.({
        ...initialTask,
        status: draftStatus,
        dueDate: draftDueDate || null,
        assignee: assigneeModified ? (draftAssignee?.name || null) : initialTask.assignee,
      });
      onClose();
    } catch (err) {
      setSaveError(err.message || 'Save failed');
      setSaving(false);
    }
  }

  const displayAssigneeName = assigneeModified ? (draftAssignee?.name || null) : getDisplayName(initialTask);
  const pill = STATUS_PILL[draftStatus] || { bg: 'rgba(82,82,91,0.15)', color: '#52525b' };
  const filteredResources = allResources.filter(
    r => !resourceSearch || r.name.toLowerCase().includes(resourceSearch.toLowerCase())
  );

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
            {initialTask.phase}
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

          {/* Title */}
          <h2 style={{
            fontSize: 20, fontWeight: 600, margin: 0,
            color: draftStatus === 'Complete' ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: draftStatus === 'Complete' ? 'line-through' : 'none',
            lineHeight: 1.3, letterSpacing: '-0.2px',
          }}>{initialTask.title}</h2>

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
              {draftStatus}
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
                  const isSelected = draftStatus === s;
                  return (
                    <button
                      key={s}
                      onClick={() => { setDraftStatus(s); setShowStatusDrop(false); }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        width: '100%', padding: '8px 12px',
                        background: isSelected ? 'var(--bg-hover)' : 'transparent',
                        border: 'none', borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--bg-hover)' : 'transparent'; }}
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

          {/* Sub-task */}
          {addingSubTask ? (
            <input
              autoFocus
              value={subTaskTitle}
              onChange={e => setSubTaskTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const t = subTaskTitle.trim();
                  if (t) api.createTask({ projectID: initialTask.projectID || project.id, phaseID: initialTask.phaseID, title: t });
                  setSubTaskTitle(''); setAddingSubTask(false);
                }
                if (e.key === 'Escape') { setSubTaskTitle(''); setAddingSubTask(false); }
              }}
              onBlur={() => { setSubTaskTitle(''); setAddingSubTask(false); }}
              placeholder="Sub-task title…"
              style={{
                width: '100%', background: 'transparent',
                border: 'none', borderBottom: '1px solid var(--accent)',
                color: 'var(--text-primary)', fontSize: 13,
                padding: '3px 0', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <div
              onClick={() => setAddingSubTask(true)}
              style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
              <span>Add sub-task</span>
            </div>
          )}

          <div style={{ height: 1, background: 'var(--border-subtle)' }} />

          {/* Properties */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

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
                  {displayAssigneeName ? (
                    <>
                      <Avatar name={displayAssigneeName} size={20} />
                      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{displayAssigneeName}</span>
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
                    minWidth: 210, maxHeight: 260, overflow: 'auto',
                  }}>
                    <div style={{ position: 'sticky', top: 0, background: 'var(--bg-card)' }}>
                      <input
                        autoFocus
                        value={resourceSearch}
                        onChange={e => setResourceSearch(e.target.value)}
                        placeholder="Search resources…"
                        onBlur={() => setTimeout(() => {
                          setShowAssigneeDrop(false);
                          setResourceSearch('');
                        }, 150)}
                        style={{
                          width: '100%', padding: '8px 12px',
                          background: 'transparent', border: 'none',
                          borderBottom: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)', fontSize: 12,
                          outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    {displayAssigneeName && (
                      <button
                        onMouseDown={() => {
                          setDraftAssignee(null);
                          setAssigneeModified(true);
                          setShowAssigneeDrop(false);
                          setResourceSearch('');
                        }}
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
                    {filteredResources.map(r => {
                      const isSelected = draftAssignee?.id === r.id;
                      return (
                        <button
                          key={r.id}
                          onMouseDown={() => {
                            setDraftAssignee(r);
                            setAssigneeModified(true);
                            setShowAssigneeDrop(false);
                            setResourceSearch('');
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            width: '100%', padding: '7px 12px',
                            background: isSelected ? 'var(--bg-hover)' : 'transparent',
                            border: 'none', borderBottom: '1px solid var(--border-subtle)',
                            cursor: 'pointer', fontSize: 12, color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--bg-hover)' : 'transparent'; }}
                        >
                          <Avatar name={r.name} size={16} />
                          {r.name}
                        </button>
                      );
                    })}
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
                value={draftDueDate}
                onChange={e => setDraftDueDate(e.target.value)}
                style={{
                  background: 'transparent', border: '1px solid var(--border-subtle)',
                  borderRadius: 6, color: 'var(--text-primary)',
                  fontSize: 12, padding: '4px 8px',
                  fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
                }}
              />
            </div>

            {/* Priority — UI only */}
            <div>
              <div style={{
                fontSize: 9, fontWeight: 600, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
              }}>Priority</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {PRIORITIES.map(p => {
                  const active = priority === p;
                  const c = PRIORITY_COLOR[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      style={{
                        background: active ? c.bg : 'transparent',
                        border: `1px solid ${active ? 'transparent' : 'var(--border-subtle)'}`,
                        borderRadius: 9999, padding: '3px 10px',
                        fontSize: 11, fontWeight: active ? 600 : 400,
                        color: active ? c.color : 'var(--text-secondary)',
                        cursor: 'pointer', transition: 'all .1s', fontFamily: 'inherit',
                      }}
                    >{p}</button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer: Cancel / Save */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {saveError && (
            <div style={{
              fontSize: 12, color: '#ef4444',
              padding: '6px 10px', borderRadius: 6,
              background: 'rgba(239,68,68,0.08)',
            }}>{saveError}</div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 6,
                background: 'transparent', border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                transition: 'background .1s',
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 2, padding: '8px 0', borderRadius: 6,
                background: saving ? 'rgba(59,130,246,0.6)' : 'var(--accent)',
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'opacity .1s',
              }}
            >
              {saving ? (
                <>
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: '#fff',
                    animation: 'spin .8s linear infinite',
                  }} />
                  Saving…
                </>
              ) : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
