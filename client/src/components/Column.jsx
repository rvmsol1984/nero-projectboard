import ProjectCard from './ProjectCard.jsx';

const styles = {
  column: (dragOver) => ({
    background: dragOver ? 'var(--bg-hover)' : 'transparent',
    borderRadius: 8,
    border: `1px solid ${dragOver ? 'var(--border-hover)' : 'var(--border)'}`,
    transition: 'border-color .15s, background .15s',
    minHeight: 80,
    display: 'flex',
    flexDirection: 'column',
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px 10px',
    flexShrink: 0,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  bar: (color) => ({
    width: 3,
    height: 14,
    borderRadius: 2,
    background: color,
    flexShrink: 0,
  }),
  labelText: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  badge: {
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '1px 7px',
    fontSize: 11,
    color: 'var(--text-secondary)',
    fontWeight: 500,
    minWidth: 20,
    textAlign: 'center',
  },
  body: {
    padding: '0 8px 10px',
    flex: 1,
  },
};

export default function Column({
  column,
  projects,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onCardClick,
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={styles.column(dragOver)}
    >
      <div style={styles.header}>
        <div style={styles.label}>
          <div style={styles.bar(column.color)} />
          <span style={styles.labelText}>{column.label}</span>
        </div>
        <span style={styles.badge}>{projects.length}</span>
      </div>
      <div style={styles.body}>
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
