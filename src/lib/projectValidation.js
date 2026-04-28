export function validateProject(values) {
  const errors = {}

  if (!String(values.title_es ?? '').trim()) {
    errors.title_es = 'El titulo en español es obligatorio.'
  }

  if (!String(values.slug ?? '').trim()) {
    errors.slug = 'El slug es obligatorio.'
  }

  if (!String(values.client ?? '').trim()) {
    errors.client = 'El cliente es obligatorio.'
  }

  if (!String(values.category ?? '').trim()) {
    errors.category = 'La categoria es obligatoria.'
  }

  const positionValue = values.position

  if (positionValue !== '' && positionValue !== null && positionValue !== undefined) {
    const parsedPosition = Number(positionValue)

    if (!Number.isInteger(parsedPosition) || parsedPosition < 1) {
      errors.position = 'El orden debe ser un número entero mayor o igual a 1.'
    }
  }

  return errors
}
