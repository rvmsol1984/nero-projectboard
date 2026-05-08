import { useState } from 'react';
import { clientLabel, isOverdue, fmtDate, STATUS_PILL, assigneeColor, initials } from '../theme.js';

function ProgressCircle({ pct, color }) {
  const r = 11;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, pct)) / 100) * circ;

  return (
    <svg width="28" height="28" viewBox="0 0 28 28" style={{ flexShrink: 0 }}>
      <circle
        cx="14" cy="14" r={r} fill="none"
        stroke="var(--border)" strokeWidth="2.5"
      />
      {pct > 0 && (
        <circle
          cx="14" cy="14" r={r} fill="none"
          stroke={color} strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 14 14)"
        />
      )}
      <text
        x="14" y="14"
        textAnchor="middle" dominantBaseline="central"
        fontSize="6.5" fontFamily="system-ui, sans-serif" fontWeight="600"
        fill="var(--text-muted)"
      >{pct > 0 ? pct : ''}</text>
    </svg>
  );
}

function Avatar({ name, size = 24 }) {
  if (!name || /^\d+$/.test(String(name))) return null;
  return (
    <div title={name} style={{
      width: size, height: size, borderRadius: '50%',
      background: assigneeColor(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.38), fontWeight: 700, color: '#fff',
      flexShrink: 0, letterSpacing: '-0.3px', userSelect: 'none',
    }}>{initials(name)}</div>
  );
}

export default function ProjectCard({ project, onDragStart, onDragEnd, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const pct = Math.min(100, project.tasksDone || 0);
  const overdue = isOverdue(project.dueDate);
  const pill = STATUS_PILL[project.status] || { bg: 'rgba(82,82,91,0.15)', color: '#a0a0a0' };

  const clientDisplay = (() => {
    const label = clientLabel(project.client);
    if (!label || label === '—' || /^client #0/i.test(label)) return null;
    return label;
  })();

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
        borderRadius: 10,
        padding: 14,
        cursor: dragging ? 'grabbing' : 'pointer',
        opacity: dragging ? 0.4 : 1,
        boxShadow: hovered && !dragging ? 'var(--shadow-hover)' : 'var(--shadow)',
        border: `1px solid ${hovered && !dragging ? 'var(--border-hover)' : 'transparent'}`,
        transform: hovered && !dragging ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease',
        userSelect: 'none',
      }}
    >
      {/* Client badge — colored by project status */}
      {clientDisplay && (
        <div style={{
          display: 'inline-block',
          background: pill.bg,
          color: pill.color,
          fontSize: 10, fontWeight: 700,
          fontFamily: 'system-ui, sans-serif',
          padding: '2px 8px', borderRadius: 4,
          marginBottom: 8,
          letterSpacing: '0.02em',
          maxWidth: '100%',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{clientDisplay}</div>
      )}

      {/* Project name */}
      <div style={{
        fontFamily: "'Lora', Georgia, serif",
        fontSize: 14, fontWeight: 600,
        color: 'var(--text-primary)',
        lineHeight: 1.4,
        marginBottom: 10,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>{project.name}</div>

      {/* Overdue warning */}
      {overdue && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 11, color: 'var(--accent-red)',
          marginBottom: 8, fontWeight: 500,
        }}>⚠ {fmtDate(project.dueDate)}</div>
      )}

      {/* Bottom row: progress circle + spacer + avatar */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ProgressCircle pct={pct} color={pill.color} />
        <div style={{ flex: 1 }} />
        <Avatar name={project.assignee} size={24} />
      </div>
    </div>
  );
}
