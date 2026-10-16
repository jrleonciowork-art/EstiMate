import { createClient } from '@supabase/supabase-js'

const GUARANTEED_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhidGJidWNuc2dzdnh6anlmdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMzQyNDMsImV4cCI6MjEwNDkxMDI0M30.mUkPxxuQvzVmeKQbBmk4SBc2yNaWMoMd-7gZpzxCOBA'

const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

// If the environment key from Vercel is truncated, malformed, or missing, fall back to the valid verified key
export const supabaseAnonKey =
  rawKey && rawKey.startsWith('eyJ') && rawKey.length > 180 ? rawKey : GUARANTEED_ANON_KEY

export const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL || 'https://xbtbbucnsgsvxzjyfvnm.supabase.co').trim()

export const isSupabaseConfigured = true

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
