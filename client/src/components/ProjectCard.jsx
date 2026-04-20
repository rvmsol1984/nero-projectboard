import { useState } from 'react';
import {
  assigneeColor, initials, clientLabel,
  isOverdue, fmtDate, priorityColor, progressBarColor, STATUS_PILL,
} from '../theme.js';

function Avatar({ name, size = 18 }) {
  return (
    <div title={name} style={{
      width: size, height: size, borderRadius: '50%',
      background: assigneeColor(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.42), fontWeight: 600,
      color: '#fff', flexShrink: 0, letterSpacing: '-0.3px',
    }}>
      {initials(name)}
    </div>
  );
}

export default function ProjectCard({ project, onDragStart, onDragEnd, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const pct = Math.min(100, project.tasksDone || 0);
  const overdue = isOverdue(project.dueDate);
  const pill = STATUS_PILL[project.status] || { bg: 'rgba(82,82,91,0.15)', color: '#52525b' };

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
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 5,
      }}>
        <span style={{
          fontSize: 10, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', flex: 1, marginRight: 6,
        }}>{clientLabel(project.client)}</span>
        <span style={{
          fontSize: 10,
          color: overdue ? 'var(--red)' : 'var(--text-muted)',
          fontWeight: overdue ? 500 : 400,
          flexShrink: 0,
        }}>{fmtDate(project.dueDate)}</span>
      </div>

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

      {/* Row 3: status pill + avatar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: pct > 0 ? 8 : 0,
      }}>
        <span style={{
          background: pill.bg,
          color: pill.color,
          borderRadius: 9999,
          padding: '2px 9px',
          fontSize: 10, fontWeight: 600,
          letterSpacing: '0.02em', whiteSpace: 'nowrap',
        }}>{project.status}</span>
        <Avatar name={project.assignee} size={18} />
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
