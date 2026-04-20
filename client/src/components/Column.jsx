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
        background: dragOver ? 'var(--bg-hover)' : 'transparent',
        borderRadius: 8,
        border: `1px solid ${dragOver ? 'var(--border-hover)' : 'var(--border)'}`,
        transition: 'border-color .15s, background .15s',
        minHeight: 60,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Column header */}
      <div style={{
        padding: '10px 12px 8px',
        borderBottom: `1px solid var(--border)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 3, height: 13, borderRadius: 2,
            background: column.color, flexShrink: 0,
          }} />
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}>{column.label}</span>
        </div>
        <span style={{
          background: 'var(--bg-hover)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '1px 7px',
          fontSize: 11,
          color: 'var(--text-muted)',
          fontWeight: 500,
          flexShrink: 0,
        }}>{projects.length}</span>
      </div>

      {/* Cards */}
      <div style={{ padding: '8px 8px 4px', flex: 1 }}>
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
