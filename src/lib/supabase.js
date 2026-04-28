import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

function normalizeSupabaseUrl(url) {
  if (!url) {
    return ''
  }

  try {
    const parsedUrl = new URL(url)

    if (parsedUrl.pathname === '/rest/v1' || parsedUrl.pathname === '/rest/v1/') {
      return parsedUrl.origin
    }

    return parsedUrl.toString().replace(/\/$/, '')
  } catch {
    return url
  }
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
