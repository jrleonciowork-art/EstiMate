import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'estimate_auth_session_v1'

function formatSupabaseUser(sessionUser) {
  if (!sessionUser) return null
  const meta = sessionUser.user_metadata || {}
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name: meta.name || sessionUser.email?.split('@')[0] || 'Estimator',
    avatar: meta.avatar_url || meta.avatar || null,
    position: meta.position || 'Site Engineer',
    contactNumber: meta.contactNumber || '',
    companyName: meta.companyName || '',
    companyLogo: meta.companyLogo || null,
    defaultRegion: meta.defaultRegion || 'NCR',
    plan: meta.plan || 'Free Tier',
    provider: sessionUser.app_metadata?.provider || 'email',
    createdAt: sessionUser.created_at,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem(AUTH_STORAGE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Listen to live Supabase authentication state changes
  useEffect(() => {
    let mounted = true

    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          if (session?.user) {
            const formatted = formatSupabaseUser(session.user)
            setUser(formatted)
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(formatted))
          } else {
            setUser(null)
            localStorage.removeItem(AUTH_STORAGE_KEY)
          }
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const formatted = formatSupabaseUser(session.user)
        setUser(formatted)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(formatted))
      } else {
        setUser(null)
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Real Supabase Email/Password Sign In
  const signIn = useCallback(async ({ email, password }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error
      const formatted = formatSupabaseUser(data.user)
      setUser(formatted)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(formatted))
      return { success: true, user: formatted }
    } catch (err) {
      console.error('Supabase Sign In Error:', err)
      return { success: false, error: err.message || 'Failed to sign in.' }
    } finally {
      setLoading(false)
    }
  }, [])

  // Real Supabase Email/Password Sign Up
  const signUp = useCallback(async ({ email, password, name = '', position = 'Site Engineer' }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            position,
            plan: 'Free Tier',
          },
        },
      })
      if (error) throw error
      if (data.user) {
        const formatted = formatSupabaseUser(data.user)
        setUser(formatted)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(formatted))
        return { success: true, user: formatted, session: data.session }
      }
      return { success: true, message: 'Account created! Please check your email to verify.' }
    } catch (err) {
      console.error('Supabase Sign Up Error:', err)
      return { success: false, error: err.message || 'Failed to sign up.' }
    } finally {
      setLoading(false)
    }
  }, [])

  // Real Supabase Google OAuth Sign In
  const signInWithGoogle = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Supabase Google OAuth Error:', err)
      return { success: false, error: err.message || 'Google sign in failed.' }
    }
  }, [])

  // Real Supabase Sign Out
  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch (err) {
      console.error('Sign Out Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Real Supabase User Profile Update
  const updateProfile = useCallback(async (updates) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      })
      if (error) throw error
      const formatted = formatSupabaseUser(data.user)
      setUser(formatted)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(formatted))
      return { success: true, user: formatted }
    } catch (err) {
      console.error('Update Profile Error:', err)
      return { success: false, error: err.message || 'Failed to update profile.' }
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      updateProfile,
      signOut,
    }),
    [user, loading, signIn, signUp, signInWithGoogle, updateProfile, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
