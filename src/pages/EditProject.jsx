import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../components/common/EmptyState'
import ProjectForm from '../components/projects/ProjectForm'
import { readProjectById, updateProject } from '../lib/projects'
import { validateProject } from '../lib/projectValidation'

function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    let isMounted = true

    async function loadProject() {
      setLoading(true)
      setError('')

      try {
        const projectData = await readProjectById(id)

        if (isMounted) {
          setProject(projectData)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No se pudo cargar el proyecto.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProject()

    return () => {
      isMounted = false
    }
  }, [id])

  async function handleUpdateProject(values) {
    const errors = validateProject(values)

    setValidationErrors(errors)
    setSubmitError('')
    setSubmitSuccess('')

    if (Object.keys(errors).length > 0) {
      setSubmitError('Revisá los campos obligatorios antes de guardar.')
      return
    }

    setIsSaving(true)

    try {
      const updatedProject = await updateProject(id, values)
      setProject(updatedProject)
      setSubmitSuccess('Proyecto actualizado correctamente. Redirigiendo al listado...')
      window.setTimeout(() => {
        navigate('/projects', { replace: true })
      }, 900)
    } catch (updateError) {
      setSubmitError(
        updateError instanceof Error
          ? updateError.message
          : 'No se pudo actualizar el proyecto.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-stack">
        <section className="panel-card">
          <div className="projects-feedback-card">
            <span className="section-tag">Cargando</span>
            <h3>Cargando proyecto</h3>
            <p>Estamos leyendo el proyecto seleccionado desde Supabase.</p>
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-stack">
        <section className="panel-card">
          <EmptyState
            eyebrow="Error de conexión"
            title="No pudimos cargar este proyecto"
            description={error}
          />
        </section>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="page-stack">
        <section className="panel-card">
          <EmptyState
            eyebrow="Proyecto no encontrado"
            title="No existe un proyecto con este id"
            description="La consulta a Supabase no devolvió resultados para este identificador. Podés volver al listado y seleccionar otro proyecto."
          />
        </section>
      </div>
    )
  }

  return (
    <ProjectForm
      key={project.id}
      initialValues={project}
      mode="edit"
      onSubmit={handleUpdateProject}
      isSaving={isSaving}
      submitError={submitError}
      submitSuccess={submitSuccess}
      validationErrors={validationErrors}
    />
  )
}

export default EditProject
