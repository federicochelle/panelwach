import { Link } from 'react-router-dom'
import StatusBadge from '../common/StatusBadge'
import EmptyState from '../common/EmptyState'

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 16.5V20h3.5L18.1 9.4l-3.5-3.5L4 16.5Z" />
      <path d="m16.2 4.3 1.5-1.5a1.6 1.6 0 0 1 2.3 0l1.2 1.2a1.6 1.6 0 0 1 0 2.3l-1.5 1.5-3.5-3.5Z" />
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h16v13H4V7Z" />
      <path d="M3 4h18v3H3V4Z" />
      <path d="M9 11h6" />
    </svg>
  )
}

function PublishIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 19V5" />
      <path d="m6.5 10.5 5.5-5.5 5.5 5.5" />
      <path d="M5 19h14" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 7h14" />
      <path d="M9 7V4h6v3" />
      <path d="M7 7l1 13h8l1-13" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5v14" />
      <path d="m4.5 8.5 3.5-3.5 3.5 3.5" />
      <path d="M16 19V5" />
      <path d="m12.5 15.5 3.5 3.5 3.5-3.5" />
    </svg>
  )
}

function ProjectsTable({
  projects,
  searchTerm,
  categoryFilter,
  statusFilter,
  onClearFilters,
  onDeleteProject,
  onTogglePublish,
  onToggleSort,
  sortConfig,
  actionLoadingId,
  actionType,
}) {
  if (!projects.length) {
    return (
      <EmptyState
        title="No hay proyectos para esos filtros"
        description="Probá otra búsqueda, cambiá categoría o estado, o limpiá los filtros para volver a ver los resultados cargados."
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
            <th>
              <div className="table-heading-action">
                <span>Cliente</span>
                <button
                  type="button"
                  className="table-sort-button"
                  onClick={() => onToggleSort('client')}
                  aria-label={
                    sortConfig.field === 'client' && sortConfig.direction === 'asc'
                      ? 'Ordenar clientes de Z a A'
                      : 'Ordenar clientes de A a Z'
                  }
                >
                  <SortIcon />
                </button>
              </div>
            </th>
            <th>Título (ES)</th>
            <th>Categoría</th>
            <th>Año</th>
            <th>Estado</th>
            <th>
              <div className="table-heading-action">
                <span>Orden</span>
                <button
                  type="button"
                  className="table-sort-button"
                  onClick={() => onToggleSort('position')}
                  aria-label={
                    sortConfig.field === 'position' && sortConfig.direction === 'asc'
                      ? 'Ordenar de mayor a menor'
                      : 'Ordenar de menor a mayor'
                  }
                >
                  <SortIcon />
                </button>
              </div>
            </th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => {
            const actionLabel =
              project.status === 'published' ? 'Archivar' : 'Publicar'
            const isProjectLoading = actionLoadingId === project.id
            const publishTooltip =
              isProjectLoading && actionType === 'publish'
                ? 'Guardando...'
                : actionLabel
            const deleteTooltip =
              isProjectLoading && actionType === 'delete'
                ? 'Eliminando...'
                : 'Eliminar'

            return (
              <tr key={project.id}>
                <td data-label="Cliente">{project.client}</td>
                <td data-label="Título (ES)">
                  <div className="project-title-cell">
                    <strong>{project.title}</strong>
                  </div>
                </td>
                <td data-label="Categoría">{project.category}</td>
                <td data-label="Año">{project.year}</td>
                <td data-label="Estado">
                  <StatusBadge
                    status={project.status}
                    labels={{ published: 'Publicado', draft: 'Borrador' }}
                  />
                </td>
                <td data-label="Orden">
                  <span className="project-order-cell">
                    {project.position === '' || project.position === null
                      ? 'Sin orden'
                      : `#${project.position}`}
                  </span>
                </td>
                <td data-label="Acciones">
                  <div className="table-actions">
                    <Link
                      className="table-action-button"
                      to={`/projects/${project.id}/edit`}
                      aria-label="Editar"
                      data-tooltip="Editar"
                    >
                      <EditIcon />
                    </Link>
                    <button
                      type="button"
                      className="table-action-button"
                      onClick={() => onTogglePublish(project.id)}
                      disabled={isProjectLoading}
                      aria-label={publishTooltip}
                      data-tooltip={publishTooltip}
                    >
                      {project.status === 'published' ? (
                        <ArchiveIcon />
                      ) : (
                        <PublishIcon />
                      )}
                    </button>
                    <button
                      type="button"
                      className="table-action-button table-action-button--danger"
                      onClick={() => onDeleteProject(project.id)}
                      disabled={isProjectLoading}
                      aria-label={deleteTooltip}
                      data-tooltip={deleteTooltip}
                    >
                      <DeleteIcon />
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
