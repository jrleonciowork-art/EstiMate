import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const CONSENT_STORAGE_KEY = 'estimate_cookie_consent_v1'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (!stored) {
        // Slight delay so it does not conflict with initial page load animations
        const timer = setTimeout(() => setIsVisible(true), 800)
        return () => clearTimeout(timer)
      }
    } catch {
      setIsVisible(false)
    }
  }, [])

  const handleConsent = (choice) => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
        choice,
        timestamp: new Date().toISOString(),
      }))
    } catch {
      // ignore
    }
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          role="region"
          aria-label="Cookie and local storage consent"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-[#2C599D] bg-[#11224D]/95 p-4 sm:p-5 text-white shadow-2xl backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-6"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#193A6F] text-[#F98125] shadow-inner" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </span>

            <div className="flex-1 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <p className="font-semibold text-white">
                Offline Storage & Cookie Notice
              </p>
              <p className="mt-1 text-xs text-blue-100/80">
                EstiMate uses strictly essential browser local storage to save your takeoff calculations offline on job sites and preserve secure login sessions. We do not use third-party advertising or cross-site tracking cookies.
              </p>
              <p className="mt-1 text-[0.7rem] text-[#7CA3E2]">
                Read our{' '}
                <Link to="/cookies" className="underline font-semibold hover:text-white">
                  Cookie Policy
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline font-semibold hover:text-white">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:items-center">
            <button
              type="button"
              onClick={() => handleConsent('essential')}
              className="rounded-xl border border-[#2C599D]/80 bg-[#193A6F]/50 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:bg-[#193A6F] hover:text-white"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={() => handleConsent('all')}
              className="rounded-xl bg-[#F98125] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-orange-950/30 transition hover:bg-[#FB9B50]"
            >
              Accept All
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
