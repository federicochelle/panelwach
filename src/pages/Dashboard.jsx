import { useEffect, useState } from 'react'
import EmptyState from '../components/common/EmptyState'
import { readProjectsDashboard } from '../lib/projects'

function formatProjectDate(value) {
  if (!value) {
    return 'Sin fecha disponible'
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sin fecha disponible'
  }

  return new Intl.DateTimeFormat('es-UY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalProjects: 0,
    publishedProjects: 0,
    draftProjects: 0,
    recentProjects: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const nextDashboardData = await readProjectsDashboard()

        if (isMounted) {
          setDashboardData(nextDashboardData)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No se pudo cargar el resumen del panel.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const { totalProjects, publishedProjects, draftProjects, recentProjects } =
    dashboardData

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <article className="stat-card">
          <span>Total de proyectos</span>
          <strong>{loading ? '...' : totalProjects}</strong>
          <p>
            Total real de registros disponibles en la tabla `projects` del panel.
          </p>
        </article>

        <article className="stat-card">
          <span>Publicados</span>
          <strong>{loading ? '...' : publishedProjects}</strong>
          <p>
            Proyectos marcados como publicados dentro del catálogo conectado.
          </p>
        </article>

        <article className="stat-card">
          <span>Borradores</span>
          <strong>{loading ? '...' : draftProjects}</strong>
          <p>
            Entradas todavía no publicadas, útiles para revisar contenido y media.
          </p>
        </article>
      </section>

      <section className="content-grid dashboard-activity-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <span className="section-tag">Actividad</span>
              <h3>Últimos proyectos creados</h3>
            </div>
          </div>

          {loading ? (
            <div className="projects-feedback-card">
              <span className="section-tag">Cargando</span>
              <h3>Cargando actividad</h3>
              <p>Estamos leyendo los proyectos más recientes desde Supabase.</p>
            </div>
          ) : null}

          {!loading && error ? (
            <EmptyState
              eyebrow="Error de conexión"
              title="No pudimos cargar la actividad reciente"
              description={error}
            />
          ) : null}

          {!loading && !error && recentProjects.length === 0 ? (
            <EmptyState
              eyebrow="Sin actividad"
              title="Todavía no hay proyectos cargados"
              description="Cuando existan registros reales en la tabla `projects`, los últimos creados van a aparecer acá."
            />
          ) : null}

          {!loading && !error && recentProjects.length > 0 ? (
            <ul className="timeline-list">
              {recentProjects.map((project) => (
                <li key={project.id}>
                  <strong>{project.title}</strong>
                  <span>
                    {project.client || 'Sin cliente'} · {project.category || 'Sin categoría'} ·{' '}
                    {project.published ? 'Publicado' : 'Borrador'} · Creado el{' '}
                    {formatProjectDate(project.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </article>

      </section>
    </div>
  )
}

export default Dashboard
