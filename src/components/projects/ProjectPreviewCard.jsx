import StatusBadge from '../common/StatusBadge'

function ProjectPreviewCard({ project }) {
  const completionItems = [
    { label: 'Campos base', done: Boolean(project.title_es && project.client) },
    { label: 'Contenido ES', done: Boolean(project.description_es) },
    { label: 'Imagen principal', done: Boolean(project.image) },
    { label: 'Vimeo', done: Boolean(project.vimeo) },
  ]

  return (
    <div className="project-preview-card-panel">
      <div className="project-preview-card-panel__hero">
        <div>
          <span className="section-tag">Resumen</span>
          <h3>{project.title_es || 'Proyecto sin título'}</h3>
          <p>
            {project.description_es ||
              'Definí la narrativa del proyecto, su metadata principal y el estado editorial desde este formulario.'}
          </p>
        </div>

        <StatusBadge status={project.published ? 'published' : 'draft'} />
      </div>

      <div className="project-preview-card-panel__list">
        <div>
          <span>Slug</span>
          <strong>{project.slug || 'sin-definir'}</strong>
        </div>
        <div>
          <span>Cliente</span>
          <strong>{project.client || 'Pendiente'}</strong>
        </div>
        <div>
          <span>Categoría</span>
          <strong>{project.category || 'Sin seleccionar'}</strong>
        </div>
        <div>
          <span>Año</span>
          <strong>{project.year || 'Sin dato'}</strong>
        </div>
      </div>

      <div className="project-preview-progress">
        {completionItems.map((item) => (
          <div
            key={item.label}
            className={`project-preview-progress__item${item.done ? ' is-complete' : ''}`}
          >
            <strong>{item.label}</strong>
            <span>{item.done ? 'Listo' : 'Pendiente'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectPreviewCard
