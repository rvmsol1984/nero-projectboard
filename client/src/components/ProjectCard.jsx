import { useState } from 'react';
import { COLUMNS, assigneeColor, initials, isOverdue, fmtDate, priorityColor } from '../theme.js';

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

function Avatar({ name, size = 22 }) {
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

export default function ProjectCard({ project, onDragStart, onDragEnd, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const colColor = COLUMNS.find(c => c.id === project.status)?.color || 'var(--accent-blue)';
  const done = project.tasksDone || 0;
  const total = project.tasksTotal || 0;
  const pct = total > 0 ? Math.min(100, (done / total) * 100) : 0;
  const overdue = isOverdue(project.dueDate);

  return (
    <div
      draggable
      onDragStart={(e) => { setDragging(true); onDragStart(e); }}
      onDragEnd={(e) => { setDragging(false); onDragEnd(e); }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-hover)' : 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius: 6,
        padding: '10px 12px',
        marginBottom: 8,
        cursor: dragging ? 'grabbing' : 'grab',
        transform: hovered && !dragging ? 'translateY(-1px)' : 'none',
        opacity: dragging ? 0.5 : 1,
        transition: 'transform .1s, border-color .1s, background .1s',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <PriorityDot priority={project.priority} />
        <span style={{
          fontSize: 10, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.6px',
          fontWeight: 500, flex: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {project.client}
        </span>
      </div>

      <div style={{
        fontSize: 14, fontWeight: 500,
        color: 'var(--text-primary)',
        marginBottom: 8, lineHeight: 1.35,
      }}>
        {project.name}
      </div>

      {project.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {project.tags.map(t => (
            <span key={t} style={{
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '1px 6px',
              fontSize: 11,
              color: 'var(--text-secondary)',
            }}>{t}</span>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <div style={{
          height: 2, background: 'var(--border)',
          borderRadius: 1, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: colColor, borderRadius: 1,
            transition: 'width .3s',
          }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          {done} / {total} tasks
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Avatar name={project.assignee} size={22} />
        <span style={{
          fontSize: 11,
          color: overdue ? 'var(--accent-red)' : 'var(--text-muted)',
          fontWeight: overdue ? 500 : 400,
        }}>
          {overdue ? '⚠ ' : ''}{fmtDate(project.dueDate)}
        </span>
      </div>
    </div>
  );
}
