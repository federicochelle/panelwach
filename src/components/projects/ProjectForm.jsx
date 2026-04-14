import { useState } from 'react'
import { Link } from 'react-router-dom'
import { defaultProjectValues, projectCategories } from '../../data/projects'
import { uploadProjectImage } from '../../lib/projects'
import FormSection from './FormSection'
import FieldGroup from './FieldGroup'
import ImageUploadPlaceholder from './ImageUploadPlaceholder'
import ProjectPreviewCard from './ProjectPreviewCard'

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
  const [uploadError, setUploadError] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const formTitle =
    formValues.title_es || (mode === 'edit' ? 'Proyecto en edición' : 'Nuevo proyecto')

  const formSubtitle =
    mode === 'edit'
      ? 'Revisá el contenido del proyecto y actualizá su estado editorial desde el panel.'
      : 'Definí la estructura editorial y los datos base del proyecto usando directamente el schema real.'

  function updateField(field) {
    return (event) => {
      const value =
        event.target.type === 'checkbox' ? event.target.checked : event.target.value

      setFormValues((currentValues) => ({
        ...currentValues,
        [field]: value,
      }))
    }
  }

  function handleImageFileChange(event) {
    const nextFile = event.target.files?.[0] || null

    setSelectedImageFile(nextFile)
    setSelectedImageFileName(nextFile?.name || '')
    setUploadError('')
  }

  async function handleSubmit(nextPublishedValue) {
    if (!onSubmit || isSaving || isUploadingImage) {
      return
    }

    let payload = {
      ...formValues,
      published: nextPublishedValue,
    }

    if (selectedImageFile) {
      setIsUploadingImage(true)
      setUploadError('')

      try {
        const uploadedImageUrl = await uploadProjectImage(selectedImageFile)

        payload = {
          ...payload,
          image_cf: uploadedImageUrl,
        }
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : 'No se pudo subir la imagen.',
        )
        setIsUploadingImage(false)
        return
      }
    }

    setFormValues(payload)
    setIsUploadingImage(false)
    onSubmit(payload)
  }

  return (
    <div className="project-editor-layout">
      <div className="project-editor-main">
        <section className="page-hero">
          <div className="project-form-header">
            <div>
              <span className="section-tag">
                {mode === 'edit' ? 'Editar proyecto' : 'Nuevo proyecto'}
              </span>
              <h2>{formTitle}</h2>
              <p>{formSubtitle}</p>
            </div>

            <div className="project-form-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => handleSubmit(false)}
                disabled={isSaving || isUploadingImage || !onSubmit}
              >
                {isSaving || isUploadingImage ? 'Guardando...' : 'Guardar borrador'}
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={() => handleSubmit(true)}
                disabled={isSaving || isUploadingImage || !onSubmit}
              >
                {isSaving || isUploadingImage ? 'Guardando...' : 'Publicar'}
              </button>
              <Link className="button-tertiary" to="/projects">
                Cancelar
              </Link>
            </div>
          </div>

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

          {uploadError ? (
            <p className="project-form-notice project-form-notice--error">
              {uploadError}
            </p>
          ) : null}
        </section>

        <FormSection
          eyebrow="Contenido"
          title="Información principal"
          description="Campos alineados directamente con la tabla real `projects` en Supabase."
        >
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
            <label className="project-switch project-form-grid__full">
              <div>
                <span>Publicado</span>
                <p>
                  Controlá el estado de publicación que se enviará al guardar este
                  proyecto.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formValues.published}
                onChange={updateField('published')}
              />
            </label>
          </div>
        </FormSection>

        <FormSection
          eyebrow="Medios"
          title="Referencia visual"
          description="La imagen nueva se sube a Supabase Storage y se guarda en `image_cf`. El campo `image` se mantiene solo como fallback heredado."
        >
          <div className="project-media-grid project-media-grid--single">
            <ImageUploadPlaceholder
              label="Imagen principal"
              fileName={selectedImageFileName || formValues.image_cf || formValues.image}
              hint="Si elegís un archivo, se subirá al bucket `projects` y se guardará su URL pública en `image_cf` al guardar el proyecto."
              uploadedUrl={formValues.image_cf}
              onFileChange={handleImageFileChange}
              isUploading={isUploadingImage}
            />
          </div>
        </FormSection>
      </div>

      <aside className="project-editor-sidebar">
        <FormSection
          eyebrow="Estado"
          title="Resumen de publicación"
          description="Vista rápida del contenido usando directamente las claves reales del proyecto."
        >
          <ProjectPreviewCard project={formValues} />
        </FormSection>

        <FormSection
          eyebrow="Flujo"
          title="Estado actual"
          description="El formulario usa la tabla real `projects` y deja explícita la convivencia entre `image` e `image_cf`."
        >
          <div className="checkpoint-list">
            <div className="checkpoint-item is-complete">
              <strong>Schema alineado</strong>
              <span>El estado interno ya usa las keys reales de la tabla `projects`.</span>
            </div>
            <div className="checkpoint-item is-complete">
              <strong>CRUD real funcionando</strong>
              <span>Alta y edición escriben directamente sobre el schema actual.</span>
            </div>
            <div className="checkpoint-item is-complete">
              <strong>Flujo de imágenes vigente</strong>
              <span>
                `image_cf` recibe las nuevas imágenes del panel y `image` queda como respaldo para compatibilidad.
              </span>
            </div>
          </div>
        </FormSection>
      </aside>
    </div>
  )
}

export default ProjectForm
