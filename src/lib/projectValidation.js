export function validateProject(values) {
  const errors = {}

  if (!values.title_es.trim()) {
    errors.title_es = 'El titulo en español es obligatorio.'
  }

  if (!values.slug.trim()) {
    errors.slug = 'El slug es obligatorio.'
  }

  if (!values.client.trim()) {
    errors.client = 'El cliente es obligatorio.'
  }

  if (!values.category.trim()) {
    errors.category = 'La categoria es obligatoria.'
  }

  return errors
}
