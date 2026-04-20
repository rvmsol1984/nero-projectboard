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
        borderRadius: 10,
        border: `1px solid ${dragOver ? 'var(--border-hover)' : 'var(--border)'}`,
        background: dragOver ? 'var(--bg-hover)' : 'transparent',
        transition: 'border-color .15s, background .2s',
        minHeight: 80,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '10px 14px 9px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 4, height: 14, borderRadius: 2,
            background: column.color, flexShrink: 0,
          }} />
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}>{column.label}</span>
        </div>
        <span style={{
          background: 'var(--bg-hover)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '1px 8px',
          fontSize: 11, fontWeight: 600,
          color: 'var(--text-muted)',
        }}>{projects.length}</span>
      </div>

      {/* Card list */}
      <div style={{ padding: '10px 8px 8px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
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
