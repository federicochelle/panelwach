import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectForm from '../components/projects/ProjectForm'
import { defaultProjectValues } from '../data/projects'
import { validateProject } from '../lib/projectValidation'
import { createProject, removeProjectImage, uploadProjectImage } from '../lib/projects'

function NewProject() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [validationErrors, setValidationErrors] = useState({})

  async function handleCreateProject(values, imageFile) {
    const errors = validateProject(values)

    setValidationErrors(errors)
    setSubmitError('')
    setSubmitSuccess('')

    if (Object.keys(errors).length > 0) {
      setSubmitError('Revisá los campos obligatorios antes de guardar.')
      return
    }

    setIsSaving(true)

    let uploadedImageUrl = ''

    try {
      let projectPayload = values

      if (imageFile) {
        uploadedImageUrl = await uploadProjectImage(imageFile)
        projectPayload = {
          ...values,
          image_cf: uploadedImageUrl,
        }
      }

      await createProject(projectPayload)
      setSubmitSuccess('Proyecto creado correctamente. Redirigiendo al listado...')
      window.setTimeout(() => {
        navigate('/projects', { replace: true })
      }, 900)
    } catch (error) {
      if (uploadedImageUrl) {
        try {
          await removeProjectImage(uploadedImageUrl)
        } catch (cleanupError) {
          console.warn('No se pudo limpiar la imagen subida.', cleanupError)
        }
      }

      setSubmitError(
        error instanceof Error ? error.message : 'No se pudo crear el proyecto.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProjectForm
      initialValues={defaultProjectValues}
      mode="create"
      onSubmit={handleCreateProject}
      isSaving={isSaving}
      submitError={submitError}
      submitSuccess={submitSuccess}
      validationErrors={validationErrors}
    />
  )
}

export default NewProject
