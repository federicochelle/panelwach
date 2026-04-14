import { Link } from 'react-router-dom'
import StatusBadge from '../common/StatusBadge'
import EmptyState from '../common/EmptyState'

function ProjectsTable({
  projects,
  searchTerm,
  categoryFilter,
  statusFilter,
  onClearFilters,
  onDeleteProject,
  onTogglePublish,
  actionLoadingId,
  actionType,
}) {
  if (!projects.length) {
    return (
      <EmptyState
        title="No hay proyectos para esos filtros"
        description="Probá otra búsqueda, cambiá categoría o estado, o limpiá los filtros para volver a ver los resultados cargados desde Supabase."
        action={
          <button
            type="button"
            className="button-secondary"
            onClick={onClearFilters}
          >
            Limpiar filtros
          </button>
        }
      />
    )
  }

  return (
    <div className="projects-table-shell">
      <table className="projects-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Título (ES)</th>
            <th>Categoría</th>
            <th>Año</th>
            <th>Duración</th>
            <th>Estado</th>
            <th>Slug</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => {
            const actionLabel =
              project.status === 'published' ? 'Despublicar' : 'Publicar'
            const isProjectLoading = actionLoadingId === project.id

            return (
              <tr key={project.id}>
                <td data-label="Cliente">{project.client}</td>
                <td data-label="Título (ES)">
                  <div className="project-title-cell">
                    <strong>{project.title}</strong>
                    <span>{project.id}</span>
                  </div>
                </td>
                <td data-label="Categoría">{project.category}</td>
                <td data-label="Año">{project.year}</td>
                <td data-label="Duración">{project.duration}</td>
                <td data-label="Estado">
                  <StatusBadge
                    status={project.status}
                    labels={{ published: 'Publicado', draft: 'Borrador' }}
                  />
                </td>
                <td data-label="Slug">{project.slug}</td>
                <td data-label="Acciones">
                  <div className="table-actions">
                    <Link
                      className="table-action-button"
                      to={`/projects/${project.id}/edit`}
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="table-action-button"
                      onClick={() => onTogglePublish(project.id)}
                      disabled={isProjectLoading}
                    >
                      {isProjectLoading && actionType === 'publish'
                        ? 'Guardando...'
                        : actionLabel}
                    </button>
                    <button
                      type="button"
                      className="table-action-button table-action-button--danger"
                      onClick={() => onDeleteProject(project.id)}
                      disabled={isProjectLoading}
                    >
                      {isProjectLoading && actionType === 'delete'
                        ? 'Eliminando...'
                        : 'Eliminar'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="projects-table-summary">
        <span>
          Mostrando {projects.length} resultado{projects.length === 1 ? '' : 's'}
        </span>
        <span>
          Búsqueda: {searchTerm || 'Todas'} / Categoría:{' '}
          {categoryFilter || 'Todas'} / Estado:{' '}
          {statusFilter === 'published'
            ? 'Publicado'
            : statusFilter === 'draft'
              ? 'Borrador'
              : 'Todos'}
        </span>
      </div>
    </div>
  )
}

export default ProjectsTable
