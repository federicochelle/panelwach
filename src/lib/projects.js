import { isSupabaseConfigured, supabase } from './supabase'

function getProjectImageFieldValue(value) {
  const trimmedValue = String(value ?? '').trim()

  return trimmedValue || null
}

export function getProjectImageUrl(project) {
  if (!project) {
    return null
  }

  return (
    getProjectImageFieldValue(project.image_cf) ||
    getProjectImageFieldValue(project.image)
  )
}

function normalizeProjectRow(project) {
  return {
    id: project.id,
    slug: project.slug || '',
    client: project.client || 'Sin cliente',
    title: project.title_es || 'Sin titulo',
    category: project.category || 'Sin categoria',
    year: project.year || 'Sin ano',
    duration: project.duration || 'Sin duracion',
    position: project.position ?? '',
    published: Boolean(project.published),
    status: project.published ? 'published' : 'draft',
    createdAt: project.created_at || null,
    raw: project,
  }
}

function normalizeProjectRecord(project) {
  if (!project) {
    return null
  }

  return {
    id: project.id,
    slug: project.slug || '',
    client: project.client || '',
    title_es: project.title_es || '',
    role_es: project.role_es || '',
    position: project.position ?? '',
    category: project.category || '',
    image: project.image || '',
    image_cf: project.image_cf || '',
    vimeo: project.vimeo || '',
    description_es: project.description_es || '',
    year: project.year || '',
    duration: project.duration || '',
    format: project.format || '',
    platforms: project.platforms || '',
    published: Boolean(project.published),
    created_at: project.created_at || null,
    title_en: project.title_en || '',
    description_en: project.description_en || '',
    role_en: project.role_en || '',
  }
}

function getNumericPositionValue(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsedValue = Number(value)

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new Error('El campo Orden debe ser un número entero mayor o igual a 1.')
  }

  return parsedValue
}

export async function readProjects() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'La conexión no está configurada. Revisá las variables de entorno requeridas.',
    )
  }

  const { data, error } = await supabase
    .from('projects')
    .select(
      'id, slug, client, title_es, category, year, duration, position, published, created_at',
    )
    .order('position', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'No se pudieron cargar los proyectos.')
  }

  return (data || []).map(normalizeProjectRow)
}

export async function readProjectsDashboard() {
  const projects = await readProjects()

  const publishedCount = projects.filter((project) => project.published).length
  const draftCount = projects.length - publishedCount

  return {
    totalProjects: projects.length,
    publishedProjects: publishedCount,
    draftProjects: draftCount,
    recentProjects: projects.slice(0, 4),
  }
}

const optionalStringFields = [
  'role_es',
  'image',
  'image_cf',
  'vimeo',
  'description_es',
  'year',
  'duration',
  'format',
  'platforms',
  'title_en',
  'description_en',
  'role_en',
]

function getRequiredStringValue(value) {
  return String(value ?? '').trim()
}

function getOptionalStringValue(value) {
  const trimmedValue = String(value ?? '').trim()

  return trimmedValue === '' ? null : trimmedValue
}

function buildProjectPayload(projectData) {
  const payload = {
    slug: getRequiredStringValue(projectData.slug),
    client: getRequiredStringValue(projectData.client),
    title_es: getRequiredStringValue(projectData.title_es),
    position: getNumericPositionValue(projectData.position),
    category: getRequiredStringValue(projectData.category),
    published: Boolean(projectData.published),
  }

  optionalStringFields.forEach((field) => {
    payload[field] = getOptionalStringValue(projectData[field])
  })

  return payload
}

function buildProjectCreatePayload(projectData) {
  return buildProjectPayload(projectData)
}

function buildProjectUpdatePayload(projectData) {
  return buildProjectPayload(projectData)
}

function getProjectBaseSelect() {
  return `
    id,
    slug,
    client,
    title_es,
    role_es,
    position,
    category,
    image,
    image_cf,
    vimeo,
    description_es,
    year,
    duration,
    format,
    platforms,
    published,
    created_at,
    title_en,
    description_en,
    role_en
  `
}

export async function uploadProjectImage(file) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'La conexión no está configurada. Revisá las variables de entorno requeridas.',
    )
  }

  if (!(file instanceof File)) {
    throw new Error('No se recibió un archivo válido para subir.')
  }

  const sanitizedFileName = file.name.replace(/\s+/g, '-')
  const fileName = `${Date.now()}-${sanitizedFileName}`

  const { error: uploadError } = await supabase.storage
    .from('projects')
    .upload(fileName, file)

  if (uploadError) {
    throw new Error(uploadError.message || 'No se pudo subir la imagen.')
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('projects').getPublicUrl(fileName)

  if (!publicUrl) {
    throw new Error('No se pudo obtener la URL pública de la imagen subida.')
  }

  return publicUrl
}

function getProjectStoragePathFromPublicUrl(publicUrl) {
  if (!publicUrl || typeof publicUrl !== 'string') {
    return ''
  }

  try {
    const { pathname } = new URL(publicUrl)
    const bucketPathMarker = '/storage/v1/object/public/projects/'
    const markerIndex = pathname.indexOf(bucketPathMarker)

    if (markerIndex === -1) {
      return ''
    }

    return decodeURIComponent(
      pathname.slice(markerIndex + bucketPathMarker.length),
    )
  } catch {
    return ''
  }
}

export async function removeProjectImage(publicUrl) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'La conexión no está configurada. Revisá las variables de entorno requeridas.',
    )
  }

  const filePath = getProjectStoragePathFromPublicUrl(publicUrl)

  if (!filePath) {
    return
  }

  const { error } = await supabase.storage.from('projects').remove([filePath])

  if (error) {
    throw new Error(error.message || 'No se pudo limpiar la imagen subida.')
  }
}

export async function createProject(projectData) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'La conexión no está configurada. Revisá las variables de entorno requeridas.',
    )
  }

  const payload = buildProjectCreatePayload(projectData)

  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select(getProjectBaseSelect())
    .single()

  if (error) {
    throw new Error(error.message || 'No se pudo crear el proyecto.')
  }

  return normalizeProjectRecord(data)
}

export async function readProjectById(projectId) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'La conexión no está configurada. Revisá las variables de entorno requeridas.',
    )
  }

  const { data, error } = await supabase
    .from('projects')
    .select(getProjectBaseSelect())
    .eq('id', projectId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message || 'No se pudo cargar el proyecto.')
  }

  return normalizeProjectRecord(data)
}

export async function updateProject(projectId, projectData) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'La conexión no está configurada. Revisá las variables de entorno requeridas.',
    )
  }

  const payload = buildProjectUpdatePayload(projectData)

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', projectId)
    .select(getProjectBaseSelect())
    .single()

  if (error) {
    throw new Error(error.message || 'No se pudo actualizar el proyecto.')
  }

  return normalizeProjectRecord(data)
}

export async function toggleProjectPublished(projectId, published) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'La conexión no está configurada. Revisá las variables de entorno requeridas.',
    )
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ published })
    .eq('id', projectId)
    .select('id, slug, client, title_es, category, year, duration, position, published, created_at')
    .single()

  if (error) {
    throw new Error(
      error.message || 'No se pudo actualizar el estado de publicación.',
    )
  }

  return normalizeProjectRow(data)
}

export async function deleteProject(projectId) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'La conexión no está configurada. Revisá las variables de entorno requeridas.',
    )
  }

  const { error } = await supabase.from('projects').delete().eq('id', projectId)

  if (error) {
    throw new Error(error.message || 'No se pudo eliminar el proyecto.')
  }

  return projectId
}
