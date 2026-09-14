import React, { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

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

export default function LoginPage() {
  const { isAuthenticated, loading: authLoading, signIn, signInTesterPro } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  // Target path where user was heading
  const fromPath = location.state?.from?.pathname || '/dashboard'

  // If already authenticated, redirect
  if (isAuthenticated && !authLoading) {
    return <Navigate to={fromPath} replace />
  }

  // Handle Email/Password Sign Up with Supabase
  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy to create an account.')
      return
    }

    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (error) {
        setError(error.message)
      } else if (data.session) {
        navigate(fromPath, { replace: true })
      } else {
        setNotice('Registration successful! Please check your email to confirm your account, then sign in.')
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during sign up.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Email/Password Login with Supabase / Pro Tester
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const res = await signIn({ email, password })
      if (!res.success) {
        setError(res.error || 'Failed to sign in.')
      } else {
        navigate(fromPath, { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Google OAuth Login with Supabase
  const handleGoogleLogin = async () => {
    setError(null)
    setNotice(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) setError(error.message)
    } catch (err) {
      setError(err.message || 'Google sign in failed.')
    }
  }

  return (
    <div className="blueprint-grid min-h-screen flex flex-col justify-between bg-[#11224D] px-4 py-8 font-sans text-white sm:px-6 lg:px-8">
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

      {/* Main Authentication Card */}
      <main className="relative z-10 mx-auto my-auto w-full max-w-md pt-6 pb-8">
        <div className="bg-white p-7 sm:p-9 rounded-3xl shadow-2xl shadow-black/35 text-slate-800 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-1 sm:text-3xl">Sign in to EstiMate</h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">Sync your projects across devices with Supabase Cloud.</p>

          {notice && (
            <div role="status" aria-live="polite" className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl mb-4 text-xs font-medium leading-relaxed">
              {notice}
            </div>
          )}

          {error && (
            <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl mb-4 text-xs font-semibold">
              {error}
            </div>
          )}

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm focus-visible:ring-2 focus-visible:ring-[#F98125]"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-5 h-5" width="20" height="20" />
            Continue with Google
          </button>

          <div className="my-5 flex items-center text-slate-400">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-[0.7rem] font-mono font-bold tracking-wider">OR</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input 
                id="login-email"
                name="email"
                type="email" 
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@firm.ph"
                className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 placeholder:text-slate-400"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input 
                id="login-password"
                name="password"
                type="password" 
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 placeholder:text-slate-400"
                required
                aria-required="true"
              />
            </div>

            {/* Compliance: Explicit Terms and Privacy Agreement Checkbox */}
            <div className="pt-1">
              <label htmlFor="agree-terms" className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#F98125] focus:ring-2 focus:ring-[#F98125] focus:ring-offset-1 accent-[#F98125]"
                />
                <span className="text-xs text-slate-600 leading-snug">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#11224D] underline hover:text-[#F98125]">
                    Terms &amp; Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#11224D] underline hover:text-[#F98125]">
                    Privacy Policy
                  </Link>
                  . <span className="text-[11px] text-slate-400">(Required for new accounts)</span>
                </span>
              </label>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#F98125] text-white rounded-xl p-3 text-xs sm:text-sm font-bold hover:bg-[#e07421] transition shadow-md shadow-orange-950/20 disabled:opacity-60 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F98125]"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Sign In'
                )}
              </button>
              <button 
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                className="flex-1 border-2 border-[#F98125] text-[#F98125] rounded-xl p-3 text-xs sm:text-sm font-bold hover:bg-orange-50 transition disabled:opacity-60 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F98125]"
              >
                Sign Up
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-3.5 text-center text-[0.68rem] text-slate-400 leading-relaxed">
            Connected to live Supabase Auth · Offline projects persist securely.
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="relative z-10 text-center text-xs text-[#7CA3E2] space-y-2">
        <p>© {new Date().getFullYear()} EstiMate · Philippine Construction Estimator Authentication</p>
        <nav aria-label="Legal footer" className="flex justify-center gap-4 text-[11px]">
          <Link to="/privacy" className="hover:text-white underline focus-visible:text-white">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white underline focus-visible:text-white">Terms &amp; Conditions</Link>
          <Link to="/cookies" className="hover:text-white underline focus-visible:text-white">Cookie Policy</Link>
          <Link to="/refunds" className="hover:text-white underline focus-visible:text-white">Refund Policy</Link>
        </nav>
      </footer>
    </div>
  )
}