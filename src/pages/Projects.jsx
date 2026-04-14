import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import ProjectsTable from '../components/projects/ProjectsTable'
import {
  deleteProject,
  readProjects,
  toggleProjectPublished,
} from '../lib/projects'

function Projects() {
  const [projects, setProjects] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [actionType, setActionType] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProjects() {
      setLoading(true)
      setError('')

      try {
        const projectsData = await readProjects()

        if (isMounted) {
          setProjects(projectsData)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No se pudieron cargar los proyectos.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(() => {
    return [...new Set(projects.map((project) => project.category))].sort()
  }, [projects])

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return projects.filter((project) => {
      const matchesSearch =
        normalizedSearch === '' ||
        project.title.toLowerCase().includes(normalizedSearch) ||
        project.client.toLowerCase().includes(normalizedSearch) ||
        project.slug.toLowerCase().includes(normalizedSearch)

      const matchesCategory =
        categoryFilter === '' || project.category === categoryFilter

      const matchesStatus =
        statusFilter === '' || project.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [projects, searchTerm, categoryFilter, statusFilter])

  async function handleDeleteProject(projectId) {
    const projectToDelete = projects.find((project) => project.id === projectId)

    if (!projectToDelete) {
      return
    }

    const confirmed = window.confirm(
      `Vas a eliminar "${projectToDelete.title}". Esta accion no se puede deshacer.`,
    )

    if (!confirmed) {
      return
    }

    setActionLoadingId(projectId)
    setActionType('delete')
    setActionError('')
    setActionSuccess('')

    try {
      await deleteProject(projectId)
      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== projectId),
      )
      setActionSuccess(`"${projectToDelete.title}" se eliminó correctamente.`)
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : 'No se pudo eliminar el proyecto.',
      )
    } finally {
      setActionLoadingId('')
      setActionType('')
    }
  }

  async function handleTogglePublish(projectId) {
    const currentProject = projects.find((project) => project.id === projectId)

    if (!currentProject) {
      return
    }

    const nextPublished = !currentProject.published

    setActionLoadingId(projectId)
    setActionType('publish')
    setActionError('')
    setActionSuccess('')

    try {
      const updatedProject = await toggleProjectPublished(projectId, nextPublished)
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === projectId ? updatedProject : project,
        ),
      )
      setActionSuccess(
        nextPublished
          ? `"${currentProject.title}" quedó publicado.`
          : `"${currentProject.title}" volvió a borrador.`,
      )
    } catch (publishError) {
      setActionError(
        publishError instanceof Error
          ? publishError.message
          : 'No se pudo actualizar el estado del proyecto.',
      )
    } finally {
      setActionLoadingId('')
      setActionType('')
    }
  }

  function handleClearFilters() {
    setSearchTerm('')
    setCategoryFilter('')
    setStatusFilter('')
  }

  async function handleRetry() {
      setLoading(true)
      setError('')
      setActionError('')

      try {
        const projectsData = await readProjects()
      setProjects(projectsData)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No se pudieron cargar los proyectos.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Proyectos"
        title="Gestión de proyectos"
        subtitle="Listado conectado a Supabase para revisar el catálogo real de proyectos, sin tocar todavía el flujo CRUD completo."
        actions={
          <Link className="button-primary" to="/projects/new">
            Nuevo proyecto
          </Link>
        }
      />

      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <span className="section-tag">Biblioteca</span>
            <h3>Catálogo de proyectos</h3>
            <p>
              Explorá, filtrá y administrá visualmente los proyectos reales
              guardados en Supabase.
            </p>
          </div>
        </div>

        <div className="projects-toolbar">
          <label className="control-field control-field--search">
            <span>Búsqueda</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por titulo, cliente o slug"
            />
          </label>

          <label className="control-field">
            <span>Categoría</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              disabled={loading || Boolean(error)}
            >
              <option value="">Todas las categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="control-field">
            <span>Estado</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              disabled={loading || Boolean(error)}
            >
              <option value="">Todos los estados</option>
              <option value="published">Publicado</option>
              <option value="draft">Borrador</option>
            </select>
          </label>

          <button
            type="button"
            className="button-secondary"
            onClick={handleClearFilters}
            disabled={Boolean(actionLoadingId)}
          >
            Limpiar
          </button>
        </div>

        {actionError ? (
          <p className="project-form-notice project-form-notice--error">
            {actionError}
          </p>
        ) : null}

        {actionSuccess ? (
          <p className="project-form-notice project-form-notice--success">
            {actionSuccess}
          </p>
        ) : null}

        {loading ? (
          <div className="projects-feedback-card">
            <span className="section-tag">Cargando</span>
            <h3>Cargando proyectos</h3>
            <p>Estamos consultando la tabla `projects` en Supabase.</p>
          </div>
        ) : null}

        {!loading && error ? (
          <EmptyState
            eyebrow="Error de conexión"
            title="No pudimos leer proyectos desde Supabase"
            description={error}
            action={
              <button
                type="button"
                className="button-secondary"
                onClick={handleRetry}
              >
                Reintentar
              </button>
            }
          />
        ) : null}

        {!loading && !error && projects.length === 0 ? (
          <EmptyState
            eyebrow="Biblioteca vacía"
            title="Todavía no hay proyectos cargados"
            description="La tabla `projects` no devolvió registros. Cuando existan filas reales en Supabase, van a aparecer acá manteniendo esta misma UI."
          />
        ) : null}

        {!loading && !error && projects.length > 0 ? (
          <ProjectsTable
            projects={filteredProjects}
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            statusFilter={statusFilter}
            onClearFilters={handleClearFilters}
            onDeleteProject={handleDeleteProject}
            onTogglePublish={handleTogglePublish}
            actionLoadingId={actionLoadingId}
            actionType={actionType}
          />
        ) : null}
      </section>
    </div>
  )
}

export default Projects
