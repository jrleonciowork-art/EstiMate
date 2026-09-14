import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'estimate_auth_session_v1'

export function AuthProvider({ children }) {
  // Initialize state from local storage so authentication persists across page refreshes
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
   * Primary Auth Method: Google Sign-In
   * 
   * BACKEND INTEGRATION NOTES:
   * - Supabase:
   *     await supabase.auth.signInWithOAuth({ provider: 'google' })
   * - Firebase:
   *     const provider = new GoogleAuthProvider()
   *     const cred = await signInWithPopup(auth, provider)
   * - Auth0 / NextAuth:
   *     signIn('google', { callbackUrl: '/dashboard' })
   */
  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    try {
      // Simulated async network roundtrip
      await new Promise((resolve) => setTimeout(resolve, 650))

      const demoUser = {
        id: 'usr_google_' + Date.now().toString(36),
        email: 'maria.rivera@estimate.ph',
        name: 'Maria Rivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        provider: 'google',
        plan: 'Free Tier',
        position: 'Quantity Surveyor',
        contactNumber: '+63 917 555 0192',
        companyName: 'Rivera Project Management & Estimates',
        defaultRegion: 'NCR',
        createdAt: new Date().toISOString(),
      }

      setUser(demoUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser))
      return { success: true, user: demoUser }
    } catch (err) {
      console.error('Google Sign-In Error:', err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Secondary Auth Method: Email Sign-In (Magic Link / Password)
   * 
   * BACKEND INTEGRATION NOTES:
   * - Supabase Magic Link:
   *     await supabase.auth.signInWithOtp({ email })
   * - Firebase Email/Password or Link:
   *     await signInWithEmailAndPassword(auth, email, password)
   */
  const signInWithEmail = useCallback(async (email) => {
    setLoading(true)
    try {
      // Simulated async network roundtrip
      await new Promise((resolve) => setTimeout(resolve, 650))

      const cleanEmail = email.trim().toLowerCase()
      const demoUser = {
        id: 'usr_email_' + Date.now().toString(36),
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        avatar: null,
        provider: 'email',
        plan: 'Free Starter',
        createdAt: new Date().toISOString(),
      }

      setUser(demoUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser))
      return { success: true, user: demoUser }
    } catch (err) {
      console.error('Email Sign-In Error:', err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update Profile: Persists updated user profile fields
   * 
   * BACKEND INTEGRATION NOTES:
   * - Supabase: await supabase.from('profiles').upsert(...)
   * - Firebase: await updateDoc(doc(db, 'users', user.id), ...)
   */
  const updateProfile = useCallback(async (updates) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 350))
      let updatedUser = null
      setUser((prev) => {
        updatedUser = {
          ...(prev || {}),
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
        return updatedUser
      })
      return { success: true, user: updatedUser }
    } catch (err) {
      console.error('Update Profile Error:', err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Sign Out: Clears current session
   * 
   * BACKEND INTEGRATION NOTES:
   * - Supabase: await supabase.auth.signOut()
   * - Firebase: await signOut(auth)
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
      signInWithGoogle,
      signInWithEmail,
      updateProfile,
      signOut,
    }),
    [user, loading, signInWithGoogle, signInWithEmail, updateProfile, signOut]
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
