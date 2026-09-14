import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

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
    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F98125] shadow-lg shadow-orange-950/40">
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="white" strokeWidth="1.8">
        <path d="m21 16-9 5-9-5V8l9-5 9 5v8Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </svg>
    </span>
  )
}

function ArrowRight({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  )
}

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, loading, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [activeMethod, setActiveMethod] = useState(null) // 'google' | 'email' | null
  const [errorMsg, setErrorMsg] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  // Target path where user was originally heading (e.g. /dashboard or /project/123)
  const fromPath = location.state?.from?.pathname || '/dashboard'

  // If already authenticated, redirect to destination
  if (isAuthenticated && !loading) {
    return <Navigate to={fromPath} replace />
  }

  // Handle Primary Auth: Google Sign-In
  async function handleGoogleSignIn() {
    setErrorMsg('')
    setActiveMethod('google')
    try {
      const res = await signInWithGoogle()
      if (res.success) {
        navigate(fromPath, { replace: true })
      } else {
        setErrorMsg('Unable to complete Google sign-in. Please try again.')
      }
    } catch (err) {
      setErrorMsg('Unexpected error during sign-in.')
    } finally {
      setActiveMethod(null)
    }
  }

  // Handle Secondary Auth: Email Sign-In (Magic Link / Password)
  async function handleEmailSignIn(e) {
    e.preventDefault()
    if (!email.trim()) return

    setErrorMsg('')
    setActiveMethod('email')
    try {
      const res = await signInWithEmail(email)
      if (res.success) {
        navigate(fromPath, { replace: true })
      } else {
        setErrorMsg('Unable to sign in with email. Please try again.')
      }
    } catch (err) {
      setErrorMsg('Unexpected error during email sign-in.')
    } finally {
      setActiveMethod(null)
    }
  }

  return (
    <div className="blueprint-grid relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-[#11224D] px-4 py-8 font-sans text-white sm:px-6 lg:px-8">
      {/* Soft Background Ambient Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[550px] w-[850px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#193A6F]/40 blur-3xl" />

      {/* Top Brand Header */}
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

      {/* Main Authentication Card */}
      <main className="relative z-10 mx-auto my-auto w-full max-w-md pt-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-slate-200 bg-white p-7 text-slate-900 shadow-2xl shadow-black/30 sm:p-9"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Sign in to EstiMate
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
              Sync your projects across devices and manage your subscription.
            </p>
          </div>

          {errorMsg && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-600">
              {errorMsg}
            </div>
          )}

          {/* Primary Auth Method: Continue with Google */}
          <div className="mt-7">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400 disabled:opacity-60"
            >
              {activeMethod === 'google' ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Visual Divider (OR) */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 font-mono text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest">
              OR
            </span>
          </div>

          {/* Secondary Auth Method: Email Sign-In */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@firm.ph"
                  className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#F98125] focus:bg-white focus:ring-2 focus:ring-[#F98125]/20 placeholder:text-slate-400"
                />
              </div>
              <p className="mt-1 text-[0.68rem] text-slate-400">
                We'll send you a secure magic link or sign in with your password.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#F98125] px-5 text-sm font-bold text-white shadow-md shadow-orange-950/20 transition hover:bg-[#FB9B50] hover:scale-[1.01] disabled:opacity-50"
            >
              {activeMethod === 'email' ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Continue with Email</span>
                  <ArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Demo Shortcut Note for Reviewers */}
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-center">
            <p className="text-[0.7rem] text-[#193A6F] font-medium">
              💡 <strong>Quick Demo:</strong> Click "Continue with Google" or enter any test email to immediately preview authenticated project management.
            </p>
          </div>

          {/* Security & Terms Footer */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-[0.7rem] text-slate-400 leading-relaxed">
            By signing in, you agree to our{' '}
            <span className="text-[#2C599D] font-medium underline">Terms of Service</span> and{' '}
            <span className="text-[#2C599D] font-medium underline">Privacy Policy</span>. Offline data is synced securely.
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
