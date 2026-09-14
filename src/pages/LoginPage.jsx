import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const POSITIONS = [
  'Contractor',
  'Project Manager',
  'Site Engineer',
  'Quantity Surveyor',
  'Architect',
  'Student',
  'Other',
]

function GoogleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  )
}

function Mark() {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F98125] text-white shadow-lg shadow-orange-950/40">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="1.8">
        <path d="m21 16-9 5-9-5V8l9-5 9 5v8Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </svg>
    </span>
  )
}

function EyeIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, loading, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Tab mode: 'signin' | 'signup'
  const [mode, setMode] = useState('signin')

  // Common Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Sign Up Only Fields
  const [fullName, setFullName] = useState('')
  const [position, setPosition] = useState('Site Engineer')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // UI state
  const [errorMsg, setErrorMsg] = useState('')
  const [activeMethod, setActiveMethod] = useState(null) // 'credentials' | 'google' | null

  // Destination path (defaults to /dashboard if navigated directly to /login)
  const fromPath = location.state?.from?.pathname || '/dashboard'

  // If already authenticated, redirect to destination
  if (isAuthenticated && !loading) {
    return <Navigate to={fromPath} replace />
  }

  // Pre-fill demo account credentials for quick testing
  function handleFillDemo() {
    setEmail('engineer@estimate.ph')
    setPassword('password123')
    setErrorMsg('')
  }

  // Submit Sign In Form
  async function handleSignInSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.')
      return
    }

    setErrorMsg('')
    setActiveMethod('credentials')
    try {
      const res = await signIn({ email, password })
      if (res.success) {
        navigate(fromPath, { replace: true })
      } else {
        setErrorMsg(res.error || 'Invalid credentials.')
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.')
    } finally {
      setActiveMethod(null)
    }
  }

  // Submit Sign Up Form
  async function handleSignUpSubmit(e) {
    e.preventDefault()
    setErrorMsg('')

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.')
      return
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.')
      return
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-type your password.')
      return
    }

    setActiveMethod('credentials')
    try {
      const res = await signUp({
        name: fullName,
        email,
        password,
        position,
      })
      if (res.success) {
        navigate(fromPath, { replace: true })
      } else {
        setErrorMsg(res.error || 'Failed to create account.')
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during registration.')
    } finally {
      setActiveMethod(null)
    }
  }

  // Google OAuth Shortcut
  async function handleGoogleSignIn() {
    setErrorMsg('')
    setActiveMethod('google')
    try {
      const res = await signInWithGoogle()
      if (res.success) {
        navigate(fromPath, { replace: true })
      } else {
        setErrorMsg(res.error || 'Google sign-in could not be completed.')
      }
    } catch {
      setErrorMsg('Unexpected error during Google sign-in.')
    } finally {
      setActiveMethod(null)
    }
  }

  return (
    <div className="blueprint-grid relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-[#11224D] px-4 py-8 font-sans text-white sm:px-6 lg:px-8">
      {/* Background Soft Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#193A6F]/35 blur-3xl" />

      {/* Top Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between">
        <Link to="/" className="flex items-center gap-3 transition hover:opacity-90">
          <Mark />
          <div className="leading-none">
            <span className="text-xl font-bold tracking-tight text-white">
              Esti<span className="text-[#F98125]">Mate</span>
            </span>
            <span className="block text-[0.6rem] font-medium tracking-widest text-[#5B84C4] uppercase">
              Field QS Suite
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs font-semibold text-blue-200/70 transition hover:text-white"
        >
          ← Back to Site
        </Link>
      </header>

      {/* Authentication Card */}
      <main className="relative z-10 mx-auto my-auto w-full max-w-md pt-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-slate-200 bg-white p-7 text-slate-900 shadow-2xl shadow-black/35 sm:p-9"
        >
          {/* Segmented Mode Switcher */}
          <div className="flex rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setErrorMsg('')
              }}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setErrorMsg('')
              }}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <div className="mt-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {mode === 'signin' ? 'Sign in to EstiMate' : 'Create your account'}
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
              {mode === 'signin'
                ? 'Access your projects, offline takeoffs, and BOQs.'
                : 'Start estimating residential projects on field with zero setup.'}
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-600"
              >
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Sign In (Google OAuth) */}
          <div className="mt-6">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400 disabled:opacity-60 sm:text-sm"
            >
              {activeMethod === 'google' ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              ) : (
                <GoogleIcon className="h-4 w-4" />
              )}
              <span>{mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}</span>
            </button>
          </div>

          {/* OR Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 font-mono text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">
              OR
            </span>
          </div>

          {/* 1. SIGN IN FORM */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label htmlFor="signin-email" className="block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="mt-1.5">
                  <input
                    id="signin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@estimate.ph"
                    className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 transition focus:border-[#F98125] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F98125]/20 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="signin-password" className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[0.7rem] font-semibold text-[#F98125] hover:underline"
                  >
                    Use Demo Credentials
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-900 transition focus:border-[#F98125] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F98125]/20 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#F98125] focus:ring-[#F98125]"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-[0.7rem] text-slate-400">
                  Default pass: <code className="text-slate-600">password123</code>
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#F98125] px-5 text-sm font-bold text-white shadow-md shadow-orange-950/20 transition hover:bg-[#FB9B50] hover:scale-[1.01] disabled:opacity-50"
              >
                {activeMethod === 'credentials' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          ) : (
            /* 2. SIGN UP FORM */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-xs font-semibold text-slate-700">
                  Full Name <span className="text-[#F98125]">*</span>
                </label>
                <div className="mt-1.5">
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maria Clara Rivera"
                    className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 transition focus:border-[#F98125] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F98125]/20 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-position" className="block text-xs font-semibold text-slate-700">
                  Construction Position
                </label>
                <div className="mt-1.5">
                  <select
                    id="signup-position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-900 transition focus:border-[#F98125] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F98125]/20"
                  >
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-700">
                  Email Address <span className="text-[#F98125]">*</span>
                </label>
                <div className="mt-1.5">
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@company.ph"
                    className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 transition focus:border-[#F98125] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F98125]/20 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-700">
                  Password (min. 6 characters) <span className="text-[#F98125]">*</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-900 transition focus:border-[#F98125] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F98125]/20 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-slate-700">
                  Confirm Password <span className="text-[#F98125]">*</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-900 transition focus:border-[#F98125] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F98125]/20 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !fullName.trim() || !email.trim() || !password || !confirmPassword}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#F98125] px-5 text-sm font-bold text-white shadow-md shadow-orange-950/20 transition hover:bg-[#FB9B50] hover:scale-[1.01] disabled:opacity-50"
              >
                {activeMethod === 'credentials' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials Footer Note */}
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-center">
            <p className="text-[0.7rem] text-[#193A6F] font-medium leading-relaxed">
              💡 <strong>Instant Testing:</strong> Sign in with <code className="font-semibold text-[#11224D]">engineer@estimate.ph</code> / <code className="font-semibold text-[#11224D]">password123</code>, or register any new email/password above.
            </p>
          </div>

          {/* Legal notice */}
          <div className="mt-5 border-t border-slate-100 pt-3.5 text-center text-[0.68rem] text-slate-400 leading-relaxed">
            By continuing, you agree to EstiMate's{' '}
            <span className="text-[#2C599D] font-medium underline cursor-pointer">Terms</span> and{' '}
            <span className="text-[#2C599D] font-medium underline cursor-pointer">Privacy Policy</span>. Data is stored safely offline.
          </div>
        </motion.div>
      </main>

      {/* Page Footer */}
      <footer className="relative z-10 text-center text-xs text-[#5B84C4]">
        EstiMate · Philippine Construction Estimator Authentication
      </footer>
    </div>
  )
}
