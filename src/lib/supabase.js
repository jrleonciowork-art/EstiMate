import { createClient } from '@supabase/supabase-js'

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://xbtbbucnsgsvxzjyfvnm.supabase.co'
export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhidGJidWNuc2dzdnh6anlmdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMzQyNDMsImV4cCI6MjEwNDkxMDI0M30.mUkPxxuQvzVmeKQbBmk4SBc2yNaWMoMd-7gZpzxCOBA'

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')
)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
