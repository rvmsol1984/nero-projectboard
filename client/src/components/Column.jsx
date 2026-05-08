import ProjectCard from './ProjectCard.jsx';

const STATUS_ICONS = {
  'New':         '○',
  'In Progress': '◑',
  'On Hold':     '⏸',
  'Complete':    '●',
};

const STATUS_ACCENT = {
  'New':         '#3b82f6',
  'In Progress': '#f59e0b',
  'On Hold':     '#a855f7',
  'Complete':    '#22c55e',
};

export default function Column({
  column, projects,
  dragOver, onDragOver, onDragLeave, onDrop,
  onDragStart, onDragEnd, onCardClick,
}) {
  const iconColor = STATUS_ACCENT[column.id] || 'var(--text-muted)';

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        display: 'flex', flexDirection: 'column',
        background: dragOver ? 'rgba(59,130,246,0.05)' : 'var(--bg-hover)',
        borderRadius: 8,
        padding: 12,
        transition: 'background .15s',
        minHeight: 'calc(100vh - 120px)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 7, padding: '2px 2px 12px',
      }}>
        <span style={{
          color: iconColor,
          fontSize: 14, lineHeight: 1, flexShrink: 0,
        }}>{STATUS_ICONS[column.id] || '○'}</span>

        <span style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 14, fontWeight: 600,
          color: 'var(--text-primary)',
          flex: 1, letterSpacing: '-0.1px',
        }}>{column.label}</span>

        <span style={{
          fontSize: 11, color: 'var(--text-muted)',
          fontWeight: 500,
        }}>{projects.length}</span>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {projects.map(p => (
          <ProjectCard
            key={p.id}
            project={p}
            onDragStart={() => onDragStart(p)}
            onDragEnd={onDragEnd}
            onClick={() => onCardClick(p)}
          />
        ))}
      </div>
    </div>
  );
}
