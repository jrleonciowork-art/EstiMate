import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'estimate_auth_session_v1'
const ACCOUNTS_STORAGE_KEY = 'estimate_registered_accounts_v1'

// Default starter demo account seeded for instant testing
const DEFAULT_DEMO_ACCOUNT = {
  id: 'usr_demo_1',
  email: 'engineer@estimate.ph',
  password: 'password123',
  name: 'Maria Rivera',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
  position: 'Quantity Surveyor',
  contactNumber: '+63 917 555 0192',
  companyName: 'Rivera Project Management & Estimates',
  defaultRegion: 'NCR',
  plan: 'Free Tier',
  provider: 'local',
  createdAt: '2026-09-14T00:00:00.000Z',
}

function getStoredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    if (!raw) {
      const initial = [DEFAULT_DEMO_ACCOUNT]
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_DEMO_ACCOUNT]
  } catch {
    return [DEFAULT_DEMO_ACCOUNT]
  }
}

function saveStoredAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
  } catch (err) {
    console.error('Failed to save accounts to storage:', err)
  }
}

export function AuthProvider({ children }) {
  // Initialize user session from local storage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  /**
   * Register a new account (Sign Up)
   * 
   * BACKEND INTEGRATION NOTES (When switching to Supabase/Firebase):
   * - Supabase:
   *     const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, position } } })
   * - Firebase:
   *     const cred = await createUserWithEmailAndPassword(auth, email, password)
   */
  const signUp = useCallback(async ({ email, password, name, position = 'Site Engineer', contactNumber = '', companyName = '' }) => {
    setLoading(true)
    try {
      // Simulate network latency for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 600))

      const cleanEmail = email.trim().toLowerCase()
      const accounts = getStoredAccounts()

      // Validate email uniqueness
      const existing = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail)
      if (existing) {
        return { success: false, error: 'An account with this email address already exists. Please sign in instead.' }
      }

      if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' }
      }

      const newAccount = {
        id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        email: cleanEmail,
        password: password, // In production, never store plaintext passwords
        name: name.trim() || cleanEmail.split('@')[0],
        avatar: null,
        position: position || 'Site Engineer',
        contactNumber: contactNumber.trim(),
        companyName: companyName.trim(),
        defaultRegion: 'NCR',
        plan: 'Free Tier',
        provider: 'local',
        createdAt: new Date().toISOString(),
      }

      // Save to local accounts database
      const updatedAccounts = [...accounts, newAccount]
      saveStoredAccounts(updatedAccounts)

      // Automatically log the newly registered user in (omit password from session)
      const { password: _, ...sessionUser } = newAccount
      setUser(sessionUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser))

      return { success: true, user: sessionUser }
    } catch (err) {
      console.error('Sign Up Error:', err)
      return { success: false, error: err.message || 'Registration failed. Please try again.' }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Authenticate existing user (Sign In)
   * 
   * BACKEND INTEGRATION NOTES:
   * - Supabase:
   *     const { data, error } = await supabase.auth.signInWithPassword({ email, password })
   * - Firebase:
   *     const cred = await signInWithEmailAndPassword(auth, email, password)
   */
  const signIn = useCallback(async ({ email, password }) => {
    setLoading(true)
    try {
      // Simulate network latency for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 550))

      const cleanEmail = email.trim().toLowerCase()
      const accounts = getStoredAccounts()

      // Find user by email
      const matchedAccount = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail)
      if (!matchedAccount) {
        return { success: false, error: 'No account found with this email address. Please check your spelling or sign up.' }
      }

      // Validate password
      if (matchedAccount.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' }
      }

      // Log the user in (omit password from session)
      const { password: _, ...sessionUser } = matchedAccount
      setUser(sessionUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser))

      return { success: true, user: sessionUser }
    } catch (err) {
      console.error('Sign In Error:', err)
      return { success: false, error: err.message || 'Sign in failed. Please try again.' }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Google Sign-In Shortcut
   */
  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 650))

      const accounts = getStoredAccounts()
      let googleUser = accounts.find((acc) => acc.provider === 'google' || acc.email === 'maria.rivera@estimate.ph')

      if (!googleUser) {
        googleUser = {
          id: 'usr_google_' + Date.now().toString(36),
          email: 'maria.rivera@estimate.ph',
          password: 'google_oauth_mock',
          name: 'Maria Rivera',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          position: 'Quantity Surveyor',
          contactNumber: '+63 917 555 0192',
          companyName: 'Rivera Project Management & Estimates',
          defaultRegion: 'NCR',
          plan: 'Free Tier',
          provider: 'google',
          createdAt: new Date().toISOString(),
        }
        saveStoredAccounts([...accounts, googleUser])
      }

      const { password: _, ...sessionUser } = googleUser
      setUser(sessionUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser))
      return { success: true, user: sessionUser }
    } catch (err) {
      console.error('Google Sign-In Error:', err)
      return { success: false, error: 'Google sign-in could not be completed.' }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update User Profile & Preferences
   */
  const updateProfile = useCallback(async (updates) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 350))
      let updatedSession = null

      setUser((prev) => {
        updatedSession = {
          ...(prev || {}),
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession))
        return updatedSession
      })

      // Also persist back into registered accounts array
      if (updatedSession) {
        const accounts = getStoredAccounts()
        const index = accounts.findIndex((a) => a.id === updatedSession.id || a.email === updatedSession.email)
        if (index >= 0) {
          accounts[index] = { ...accounts[index], ...updates, updatedAt: new Date().toISOString() }
          saveStoredAccounts(accounts)
        }
      }

      return { success: true, user: updatedSession }
    } catch (err) {
      console.error('Update Profile Error:', err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Sign Out: Clears current session
   */
  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      setUser(null)
      localStorage.removeItem(AUTH_STORAGE_KEY)
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
