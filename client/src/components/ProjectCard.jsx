import { useState } from 'react';
import {
  assigneeColor, initials, clientLabel,
  isOverdue, fmtDate, priorityColor, progressColor,
} from '../theme.js';

const STATUS_BG = {
  'New':         'var(--accent-blue)',
  'In Progress': 'var(--accent-orange)',
  'On Hold':     'var(--accent-purple)',
  'Complete':    'var(--accent-green)',
};

function Avatar({ name, size = 20 }) {
  const isNumeric = !name || /^\d+$/.test(String(name));
  return (
    <div title={name} style={{
      width: size, height: size, borderRadius: '50%',
      background: isNumeric ? 'var(--border-hover)' : assigneeColor(name),
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
  const hours = project.tasksTotal || 0;
  const overdue = isOverdue(project.dueDate);
  const hasTags = project.tags?.length > 0;
  const isActive = hovered && !dragging;

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
        border: `1px solid ${isActive ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius: 8,
        padding: 14,
        cursor: dragging ? 'grabbing' : 'grab',
        opacity: dragging ? 0.45 : 1,
        transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isActive ? 'var(--shadow-hover)' : 'var(--shadow)',
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 150ms ease',
        userSelect: 'none',
      }}
    >
      {/* Row 1: priority dot + client */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: priorityColor(project.priority), flexShrink: 0,
        }} />
        <span style={{
          fontSize: 11, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          fontWeight: 500, flex: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{clientLabel(project.client)}</span>
      </div>

      {/* Row 2: project name */}
      <div style={{
        fontSize: 14, fontWeight: 600,
        color: 'var(--text-primary)',
        lineHeight: 1.35, marginBottom: 8,
      }}>{project.name}</div>

      {/* Row 3: status pill + optional tags */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 5, flexWrap: 'wrap', marginBottom: 10,
      }}>
        <span style={{
          background: STATUS_BG[project.status] || 'var(--text-muted)',
          color: '#fff', borderRadius: 9999,
          padding: '2px 10px', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.02em', whiteSpace: 'nowrap',
        }}>{project.status}</span>
        {hasTags && project.tags.map(t => (
          <span key={t} style={{
            border: '1px solid var(--border)', borderRadius: 5,
            padding: '1px 7px', fontSize: 10, color: 'var(--text-secondary)',
          }}>{t}</span>
        ))}
      </div>

      {/* Row 4: progress bar + percentage */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            flex: 1, height: 4, background: 'var(--border)',
            borderRadius: 9999, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: progressColor(pct),
              borderRadius: 9999, transition: 'width .4s ease',
            }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0, width: 28, textAlign: 'right' }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Row 5: task count + hours | avatar + due date */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 6,
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {hours}h est.
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <Avatar name={project.assignee} size={20} />
          <span style={{
            fontSize: 11,
            color: overdue ? 'var(--accent-red)' : 'var(--text-muted)',
            fontWeight: overdue ? 500 : 400,
          }}>
            {overdue ? '⚠ ' : ''}{fmtDate(project.dueDate)}
          </span>
        </div>
      </div>
    </div>
  );
}
