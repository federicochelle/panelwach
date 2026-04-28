import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { defaultProjectValues, projectCategories } from '../../data/projects'
import { getProjectImageUrl } from '../../lib/projects'
import StatusBadge from '../common/StatusBadge'
import FormSection from './FormSection'
import FieldGroup from './FieldGroup'
import ImageUploadPlaceholder from './ImageUploadPlaceholder'

function ProjectForm({
  initialValues,
  mode = 'create',
  onSubmit,
  isSaving = false,
  submitError = '',
  submitSuccess = '',
  validationErrors = {},
}) {
  const [formValues, setFormValues] = useState({
    ...defaultProjectValues,
    ...initialValues,
  })
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [selectedImageFileName, setSelectedImageFileName] = useState('')

  const formTitle =
    formValues.title_es || (mode === 'edit' ? 'Proyecto en edición' : 'Nuevo proyecto')
  const selectedImagePreviewUrl = useMemo(
    () => (selectedImageFile ? URL.createObjectURL(selectedImageFile) : ''),
    [selectedImageFile],
  )
  const remoteImageUrl = getProjectImageUrl(formValues)
  const previewImageUrl = selectedImagePreviewUrl || remoteImageUrl

  useEffect(() => {
    if (!selectedImagePreviewUrl) {
      return undefined
    }

    return () => {
      URL.revokeObjectURL(selectedImagePreviewUrl)
    }
  }, [selectedImagePreviewUrl])

  function updateField(field) {
    return (event) => {
      setFormValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }))
    }
  }

  function handleImageFileChange(event) {
    const nextFile = event.target.files?.[0] || null

    setSelectedImageFile(nextFile)
    setSelectedImageFileName(nextFile?.name || '')
  }

  function handleSubmit(nextPublishedValue) {
    if (!onSubmit || isSaving) {
      return
    }

    const payload = {
      ...formValues,
      published: nextPublishedValue,
    }

    setFormValues(payload)
    onSubmit(payload, selectedImageFile)
  }

  return (
    <div className="project-editor-layout">
      <div className="project-editor-main">
        <FormSection
          eyebrow="Información principal"
          title={formTitle}
          titleMeta={
            <StatusBadge status={formValues.published ? 'published' : 'draft'} />
          }
          actions={
            <div className="project-form-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => handleSubmit(false)}
                disabled={isSaving || !onSubmit}
              >
                {isSaving ? 'Guardando...' : 'Guardar borrador'}
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={() => handleSubmit(true)}
                disabled={isSaving || !onSubmit}
              >
                {isSaving ? 'Guardando...' : 'Publicar'}
              </button>
              <Link className="button-tertiary" to="/projects">
                Cancelar
              </Link>
            </div>
          }
        >
          {submitError ? (
            <p className="project-form-notice project-form-notice--error">
              {submitError}
            </p>
          ) : null}

          {submitSuccess ? (
            <p className="project-form-notice project-form-notice--success">
              {submitSuccess}
            </p>
          ) : null}

          <div className="project-form-grid">
            <FieldGroup
              label="Título (ES)"
              value={formValues.title_es}
              onChange={updateField('title_es')}
              placeholder="Ejemplo: Solar Campaign 2026"
              error={validationErrors.title_es}
            />
            <FieldGroup
              label="Título (EN)"
              value={formValues.title_en}
              onChange={updateField('title_en')}
              placeholder="Versión en inglés del título"
            />
            <FieldGroup
              label="Slug"
              value={formValues.slug}
              onChange={updateField('slug')}
              placeholder="solar-campaign-2026"
              error={validationErrors.slug}
            />
            <FieldGroup
              label="Cliente"
              value={formValues.client}
              onChange={updateField('client')}
              placeholder="Cliente o marca"
              error={validationErrors.client}
            />
            <FieldGroup
              label="Rol (ES)"
              value={formValues.role_es}
              onChange={updateField('role_es')}
              placeholder="Dirección, producción, postproducción..."
            />
            <FieldGroup
              label="Rol (EN)"
              value={formValues.role_en}
              onChange={updateField('role_en')}
              placeholder="Versión en inglés del rol"
            />
            <FieldGroup
              label="Orden"
              type="number"
              min="1"
              value={formValues.position}
              onChange={updateField('position')}
              placeholder="Ej: 1"
              error={validationErrors.position}
            />
            <label className="project-field">
              <span>Categoría</span>
              <select
                className={`project-field__control${
                  validationErrors.category ? ' project-field__control--error' : ''
                }`}
                value={formValues.category}
                onChange={updateField('category')}
              >
                <option value="">Seleccionar categoría</option>
                {projectCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {validationErrors.category ? (
                <small className="project-field__error">
                  {validationErrors.category}
                </small>
              ) : null}
            </label>
            <FieldGroup
              label="Imagen principal"
              value={formValues.image}
              onChange={updateField('image')}
              placeholder="nombre-del-archivo.jpg"
            />
            <FieldGroup
              label="URL de Vimeo"
              value={formValues.vimeo}
              onChange={updateField('vimeo')}
              placeholder="https://vimeo.com/..."
            />
            <FieldGroup
              label="Año"
              value={formValues.year}
              onChange={updateField('year')}
              placeholder="2026"
            />
            <FieldGroup
              label="Duración"
              value={formValues.duration}
              onChange={updateField('duration')}
              placeholder="01:48"
            />
            <FieldGroup
              label="Formato"
              value={formValues.format}
              onChange={updateField('format')}
              placeholder="Digital Film"
            />
            <FieldGroup
              label="Plataformas"
              value={formValues.platforms}
              onChange={updateField('platforms')}
              placeholder="Web, Social, Events"
            />
            <div className="project-form-grid__full">
              <FieldGroup
                label="Descripción (ES)"
                value={formValues.description_es}
                onChange={updateField('description_es')}
                placeholder="Escribí la descripción editorial en español."
                as="textarea"
              />
            </div>
            <div className="project-form-grid__full">
              <FieldGroup
                label="Descripción (EN)"
                value={formValues.description_en}
                onChange={updateField('description_en')}
                placeholder="Escribí la descripción editorial en inglés."
                as="textarea"
              />
            </div>
          </div>

          <div className="project-media-grid project-media-grid--single">
            <ImageUploadPlaceholder
              label="Imagen principal"
              fileName={selectedImageFileName || remoteImageUrl}
              hint="Si elegís un archivo, se subirá al bucket `projects` y se guardará su URL pública en `image_cf` al guardar el proyecto."
              previewUrl={previewImageUrl}
              currentUrl={remoteImageUrl}
              onFileChange={handleImageFileChange}
              isUploading={isSaving && Boolean(selectedImageFile)}
            />
          </div>
        </FormSection>
      </div>
    </div>
  )
}

export default ProjectForm
