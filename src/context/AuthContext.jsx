import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'estimate_auth_session_v1'

export const ADMIN_PRO_USER = {
  id: 'estimate-admin-user-001',
  email: 'jr.admin@estimate.ph',
  password: 'EstiMate#Pro2026!',
  name: 'Engr. Jr Leoncio',
  position: 'Project Manager',
  contactNumber: '+63 917 555 8888',
  companyName: 'EstiMate Engineering & Construction Solutions',
  companyLogo: null,
  defaultRegion: 'NCR',
  plan: 'Pro Contractor',
  provider: 'admin',
  createdAt: '2026-09-01T08:00:00.000Z',
}

const PRO_EMAILS = [
  'jr.admin@estimate.ph',
  'admin@estimate.ph',
  'jrleoncio.work@gmail.com',
  'jrleoncio@gmail.com',
]

function formatSupabaseUser(sessionUser) {
  if (!sessionUser) return null
  const meta = sessionUser.user_metadata || {}
  const userEmail = (sessionUser.email || '').toLowerCase()
  const isWhitelistedPro = PRO_EMAILS.some((em) => userEmail === em)
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
    plan: isWhitelistedPro ? 'Pro Contractor' : (meta.plan || 'Free Tier'),
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
            // Keep active admin session if logged in
            const cached = localStorage.getItem(AUTH_STORAGE_KEY)
            const parsed = cached ? JSON.parse(cached) : null
            if (parsed?.provider === 'admin' || parsed?.provider === 'tester') {
              setUser(parsed)
            } else {
              setUser(null)
              localStorage.removeItem(AUTH_STORAGE_KEY)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const formatted = formatSupabaseUser(session.user)
        setUser(formatted)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(formatted))
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        localStorage.removeItem(AUTH_STORAGE_KEY)
      } else {
        const cached = localStorage.getItem(AUTH_STORAGE_KEY)
        const parsed = cached ? JSON.parse(cached) : null
        if (parsed?.provider === 'admin' || parsed?.provider === 'tester') {
          setUser(parsed)
        } else {
          setUser(null)
          localStorage.removeItem(AUTH_STORAGE_KEY)
        }
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Sign In with email and password (with Private Admin Pro account verification)
  const signIn = useCallback(async ({ email, password }) => {
    const trimmed = (email || '').trim().toLowerCase()
    // Private Admin Pro Account Check
    if (trimmed === ADMIN_PRO_USER.email.toLowerCase() || trimmed === 'admin@estimate.ph') {
      if (password !== ADMIN_PRO_USER.password) {
        return { success: false, error: 'Incorrect password for admin account.' }
      }
      setUser(ADMIN_PRO_USER)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(ADMIN_PRO_USER))
      localStorage.setItem('estimate_user_profile_v1', JSON.stringify({
        name: ADMIN_PRO_USER.name,
        position: ADMIN_PRO_USER.position,
        contactNumber: ADMIN_PRO_USER.contactNumber,
        companyName: ADMIN_PRO_USER.companyName,
        companyLogo: ADMIN_PRO_USER.companyLogo,
        defaultRegion: ADMIN_PRO_USER.defaultRegion,
        plan: 'Pro Contractor',
      }))
      return { success: true, user: ADMIN_PRO_USER }
    }

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

  // 1-Click Pro Admin Account Sign In
  const signInTesterPro = useCallback(() => {
    setUser(ADMIN_PRO_USER)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(ADMIN_PRO_USER))
    localStorage.setItem('estimate_user_profile_v1', JSON.stringify({
      name: ADMIN_PRO_USER.name,
      position: ADMIN_PRO_USER.position,
      contactNumber: ADMIN_PRO_USER.contactNumber,
      companyName: ADMIN_PRO_USER.companyName,
      companyLogo: ADMIN_PRO_USER.companyLogo,
      defaultRegion: ADMIN_PRO_USER.defaultRegion,
      plan: 'Pro Contractor',
    }))
    return { success: true, user: ADMIN_PRO_USER }
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

  // Helper to determine if the active user is on a Pro tier
  const isPro = useMemo(() => {
    return Boolean(user?.plan && String(user.plan).toLowerCase().includes('pro'))
  }, [user?.plan])

  // Real Supabase User Profile Update with local fallback
  const updateProfile = useCallback(async (updates) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      })
      if (!error && data?.user) {
        const formatted = formatSupabaseUser(data.user)
        setUser(formatted)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(formatted))
        return { success: true, user: formatted }
      }
      throw error || new Error('No user data returned')
    } catch (err) {
      console.warn('Supabase Update Profile Error, updating local state:', err)
      // Fallback: update local state if user is logged in
      if (user) {
        const updated = { ...user, ...updates }
        setUser(updated)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated))
        return { success: true, user: updated, fallback: true }
      }
      return { success: false, error: err.message || 'Failed to update profile.' }
    } finally {
      setLoading(false)
    }
  }, [user])

  const upgradeToPro = useCallback(async (billingCycle = 'monthly') => {
    return await updateProfile({ plan: 'Pro Contractor', billingCycle })
  }, [updateProfile])

  const downgradeToFree = useCallback(async () => {
    return await updateProfile({ plan: 'Free Tier' })
  }, [updateProfile])

  const value = useMemo(
    () => ({
      user,
      isPro,
      isAuthenticated: !!user,
      loading,
      signIn,
      signInTesterPro,
      signUp,
      signInWithGoogle,
      updateProfile,
      upgradeToPro,
      downgradeToFree,
      signOut,
    }),
    [user, isPro, loading, signIn, signInTesterPro, signUp, signInWithGoogle, updateProfile, upgradeToPro, downgradeToFree, signOut]
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
