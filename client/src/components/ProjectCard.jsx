import { useState } from 'react';
import {
  clientLabel, isOverdue, fmtDate, progressBarColor, STATUS_PILL,
} from '../theme.js';

const AVATAR_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#ef4444', '#06b6d4', '#84cc16',
];

function Avatar({ name }) {
  if (!name || /^\d+$/.test(String(name))) return null;
  const color = AVATAR_COLORS[name.charCodeAt(0) % 8];
  return (
    <div title={name} style={{
      width: 18, height: 18, borderRadius: '50%',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0,
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

export default function ProjectCard({ project, onDragStart, onDragEnd, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const pct = Math.min(100, project.tasksDone || 0);
  const overdue = isOverdue(project.dueDate);
  const pill = STATUS_PILL[project.status] || { bg: 'rgba(82,82,91,0.15)', color: '#52525b' };

  const clientDisplay = (() => {
    const label = clientLabel(project.client);
    if (!label || label === '—' || /^client #0/i.test(label)) return null;
    return label;
  })();
  const dateDisplay = fmtDate(project.dueDate);
  const showTopRow = clientDisplay || dateDisplay !== '—';

  const taskCountText = project.tasksDone > 0 && project.tasksTotal === 100
    ? `${project.tasksDone}% complete`
    : null;

  return (
    <div
      draggable
      onDragStart={() => { setDragging(true); onDragStart(); }}
      onDragEnd={() => { setDragging(false); onDragEnd(); }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 8,
        padding: 12,
        cursor: dragging ? 'grabbing' : 'grab',
        opacity: dragging ? 0.4 : 1,
        boxShadow: hovered && !dragging
          ? 'var(--shadow-card-hover)'
          : 'var(--shadow-card)',
        transform: hovered && !dragging ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'box-shadow 180ms ease, transform 180ms ease',
        userSelect: 'none',
      }}
    >
      {/* Row 1: client + due date */}
      {showTopRow && (
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 5,
        }}>
          {clientDisplay && (
            <span style={{
              fontSize: 10, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', flex: 1, marginRight: 6,
            }}>{clientDisplay}</span>
          )}
          {dateDisplay !== '—' && (
            <span style={{
              fontSize: 10,
              color: overdue ? 'var(--red)' : 'var(--text-muted)',
              fontWeight: overdue ? 500 : 400, flexShrink: 0,
              marginLeft: 'auto',
            }}>{dateDisplay}</span>
          )}
        </div>
      )}

      {/* Row 2: project name */}
      <div style={{
        fontSize: 13, fontWeight: 500,
        color: 'var(--text-primary)',
        lineHeight: 1.4, marginBottom: 8,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>{project.name}</div>

      {/* Row 3: status pill + task count + avatar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: pct > 0 ? 8 : 0,
      }}>
        <span style={{
          background: pill.bg, color: pill.color,
          borderRadius: 9999, padding: '2px 9px',
          fontSize: 10, fontWeight: 600,
          letterSpacing: '0.02em', whiteSpace: 'nowrap',
        }}>{project.status}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          {taskCountText && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {taskCountText}
            </span>
          )}
          <Avatar name={project.assignee} />
        </div>
      </div>

      {/* Row 4: progress bar (only if > 0) */}
      {pct > 0 && (
        <div style={{
          height: 3, background: 'var(--border-subtle)',
          borderRadius: 9999, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: progressBarColor(pct),
            borderRadius: 9999, transition: 'width .4s ease',
          }} />
        </div>
      )}
    </div>
  );
}
