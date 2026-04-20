import { useState } from 'react';
import { assigneeColor, initials, isOverdue, fmtDate, priorityColor, progressColor } from '../theme.js';

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

const STATUS_PILL_BG = {
  'New':         '#0073ea',
  'In Progress': '#fdab3d',
  'On Hold':     '#a25ddc',
  'Complete':    '#00c875',
};

function StatusPill({ status }) {
  return (
    <span style={{
      background: STATUS_PILL_BG[status] || '#888',
      color: '#fff',
      borderRadius: 9999,
      padding: '3px 10px',
      fontSize: 10,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      letterSpacing: '0.1px',
      lineHeight: 1,
    }}>{status}</span>
  );
}

function clientLabel(client) {
  if (!client) return '—';
  if (/^\d+$/.test(String(client))) return `Client #${client}`;
  return client;
}

export default function ProjectCard({ project, onDragStart, onDragEnd, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const pct = Math.min(100, project.tasksDone || 0);
  const hours = project.tasksTotal || 0;
  const overdue = isOverdue(project.dueDate);
  const hasTags = project.tags?.length > 0;

  return (
    <div
      draggable
      onDragStart={() => { setDragging(true); onDragStart(); }}
      onDragEnd={() => { setDragging(false); onDragEnd(); }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && !dragging ? 'var(--bg-hover)' : 'var(--bg-card)',
        border: `1px solid ${hovered && !dragging ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius: 6,
        padding: '10px 11px',
        marginBottom: 7,
        cursor: dragging ? 'grabbing' : 'grab',
        transform: hovered && !dragging ? 'translateY(-1px)' : 'none',
        opacity: dragging ? 0.45 : 1,
        boxShadow: 'var(--shadow-card)',
        transition: 'transform .1s, border-color .1s, background .1s, box-shadow .1s',
        userSelect: 'none',
      }}
    >
      {/* Row 1: priority dot + client */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: priorityColor(project.priority),
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 10, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          fontWeight: 500, flex: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{clientLabel(project.client)}</span>
      </div>

      {/* Row 2: project name */}
      <div style={{
        fontSize: 14, fontWeight: 500,
        color: 'var(--text-primary)',
        lineHeight: 1.3, marginBottom: 6,
      }}>{project.name}</div>

      {/* Row 3: status pill + tags (only if tags exist) */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 5, flexWrap: 'wrap',
        marginBottom: hasTags ? 7 : 6,
      }}>
        <StatusPill status={project.status} />
        {hasTags && project.tags.map(t => (
          <span key={t} style={{
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '1px 6px',
            fontSize: 10,
            color: 'var(--text-secondary)',
          }}>{t}</span>
        ))}
      </div>

      {/* Row 4: progress bar */}
      <div style={{ marginBottom: 7 }}>
        <div style={{
          height: 6, background: 'var(--border)',
          borderRadius: 3, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: progressColor(pct),
            borderRadius: 3,
            transition: 'width .3s',
          }} />
        </div>
      </div>

      {/* Row 5: pct + hours | avatar + due date */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 6,
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {pct}% · {hours}h
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
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
