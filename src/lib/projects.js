import { isSupabaseConfigured, supabase } from './supabase'

function normalizeProjectRow(project) {
  return {
    id: project.id,
    slug: project.slug || '',
    client: project.client || 'Sin cliente',
    title: project.title_es || 'Sin titulo',
    category: project.category || 'Sin categoria',
    year: project.year || 'Sin ano',
    duration: project.duration || 'Sin duracion',
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

  if (!Number.isInteger(parsedValue)) {
    throw new Error('El campo Orden debe ser un número entero válido.')
  }

  return parsedValue
}

export async function readProjects() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase no esta configurado. Defini VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
    )
  }

  const { data, error } = await supabase
    .from('projects')
    .select(
      'id, slug, client, title_es, category, year, duration, published, created_at',
    )
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

function buildProjectCreatePayload(projectData) {
  return {
    slug: projectData.slug.trim(),
    client: projectData.client.trim(),
    title_es: projectData.title_es.trim(),
    role_es: projectData.role_es?.trim() || null,
    position: getNumericPositionValue(projectData.position),
    category: projectData.category.trim(),
    image: projectData.image?.trim() || null,
    image_cf: projectData.image_cf?.trim() || null,
    vimeo: projectData.vimeo?.trim() || null,
    description_es: projectData.description_es?.trim() || null,
    year: projectData.year?.trim() || null,
    duration: projectData.duration?.trim() || null,
    format: projectData.format?.trim() || null,
    platforms: projectData.platforms?.trim() || null,
    published: Boolean(projectData.published),
    title_en: projectData.title_en?.trim() || null,
    description_en: projectData.description_en?.trim() || null,
    role_en: projectData.role_en?.trim() || null,
  }
}

function getOptionalUpdateValue(value) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmedValue = value.trim()

  return trimmedValue === '' ? undefined : trimmedValue
}

function buildProjectUpdatePayload(projectData) {
  // Create and update intentionally use different builders:
  // on update we avoid converting optional empty fields to null because that
  // would wipe existing database content when the edit form is saved.
  const payload = {
    slug: projectData.slug.trim(),
    client: projectData.client.trim(),
    title_es: projectData.title_es.trim(),
    category: projectData.category.trim(),
    published: Boolean(projectData.published),
  }

  if (projectData.position !== '' && projectData.position !== null && projectData.position !== undefined) {
    payload.position = getNumericPositionValue(projectData.position)
  }

  const optionalFields = [
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

  optionalFields.forEach((field) => {
    const nextValue = getOptionalUpdateValue(projectData[field])

    if (nextValue !== undefined) {
      payload[field] = nextValue
    }
  })

  return payload
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
      'Supabase no esta configurado. Defini VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
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

export async function createProject(projectData) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase no esta configurado. Defini VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
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
      'Supabase no esta configurado. Defini VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
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
      'Supabase no esta configurado. Defini VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
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
      'Supabase no esta configurado. Defini VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
    )
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ published })
    .eq('id', projectId)
    .select('id, slug, client, title_es, category, year, duration, published, created_at')
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
      'Supabase no esta configurado. Defini VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
    )
  }

  const { error } = await supabase.from('projects').delete().eq('id', projectId)

  if (error) {
    throw new Error(error.message || 'No se pudo eliminar el proyecto.')
  }

  return projectId
}
