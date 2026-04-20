import ProjectCard from './ProjectCard.jsx';

export default function Column({
  column, projects,
  dragOver, onDragOver, onDragLeave, onDrop,
  onDragStart, onDragEnd, onCardClick,
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        display: 'flex', flexDirection: 'column',
        background: dragOver ? 'var(--bg-hover)' : 'transparent',
        borderRadius: 8,
        transition: 'background .15s',
        minHeight: 60,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 7, padding: '0 4px 10px',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: column.color, flexShrink: 0,
        }} />
        <span style={{
          fontSize: 11, fontWeight: 500,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          flex: 1,
        }}>{column.label}</span>
        <span style={{
          fontSize: 11, color: 'var(--text-muted)',
          fontWeight: 500,
        }}>{projects.length}</span>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
