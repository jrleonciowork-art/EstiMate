import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'estimate_hide_mobile_advisory'

export default function MobileDisplayAdvisory() {
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [isMobileScreen, setIsMobileScreen] = useState(false)

  useEffect(() => {
    const checkScreen = () => {
      // Treat screens narrower than 768px (phones) as mobile. Tablets (iPad >= 768px) and desktop are recommended displays.
      const isPhone = window.innerWidth < 768
      setIsMobileScreen(isPhone)

      const dismissed = localStorage.getItem(STORAGE_KEY) === 'true'
      if (isPhone && !dismissed) {
        setIsOpen(true)
      } else if (!isPhone) {
        setIsOpen(false)
      }
    }

    checkScreen()
    window.addEventListener('resize', checkScreen)
    window.addEventListener('orientationchange', checkScreen)

    return () => {
      window.removeEventListener('resize', checkScreen)
      window.removeEventListener('orientationchange', checkScreen)
    }
  }, [])

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
    setIsOpen(false)
  }

  const handleReopen = () => {
    setIsOpen(true)
  }

  // Only render on phone screens
  if (!isMobileScreen) return null

  return (
    <>
      {/* Floating Re-Open Pill when dismissed on phone */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleReopen}
          className="fixed bottom-3 right-3 z-40 flex items-center gap-1.5 rounded-full border border-[#2C599D]/80 bg-[#11224D]/95 px-3 py-1.5 text-[0.68rem] font-bold text-white shadow-xl backdrop-blur-md transition active:scale-95 hover:border-[#F98125]"
          title="Display Advisory"
        >
          <span className="h-2 w-2 rounded-full bg-[#F98125] animate-pulse" />
          <span>📱 Best on iPad / Desktop</span>
        </button>
      )}

      {/* Modal Overlay & Card */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismiss}
              className="absolute inset-0 bg-[#07132F]/80 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border-2 border-[#F98125] bg-[#11224D] p-5 sm:p-6 text-white shadow-2xl shadow-orange-950/40"
            >
              {/* Top Accent Glow */}
              <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-[#F98125]/20 blur-3xl pointer-events-none" />

              {/* Header Badge & Close Button */}
              <div className="flex items-center justify-between pb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5B84C4]/50 bg-[#193A6F]/80 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-blue-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F98125]" />
                  Display Recommendation
                </span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition"
                  aria-label="Close Advisory"
                >
                  ✕
                </button>
              </div>

              {/* Graphic Icon: Screen Comparison */}
              <div className="my-3 flex items-center justify-center gap-3 rounded-2xl border border-[#2C599D]/60 bg-[#0A1838] py-3.5 px-4">
                {/* Desktop Monitor */}
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-12 items-center justify-center rounded-lg border-2 border-emerald-400/80 bg-emerald-500/15 text-emerald-300">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                  </div>
                  <span className="mt-1 text-[0.62rem] font-semibold text-emerald-300">Desktop ✓</span>
                </div>

                <span className="text-slate-500 font-bold">+</span>

                {/* iPad / Tablet */}
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-emerald-400/80 bg-emerald-500/15 text-emerald-300">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="2" width="16" height="20" rx="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
                    </svg>
                  </div>
                  <span className="mt-1 text-[0.62rem] font-semibold text-emerald-300">iPad/Tablet ✓</span>
                </div>

                <span className="text-slate-500 font-bold">vs</span>

                {/* Phone */}
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-6 items-center justify-center rounded-lg border border-amber-400/80 bg-amber-500/15 text-amber-300">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
                    </svg>
                  </div>
                  <span className="mt-1 text-[0.62rem] font-semibold text-amber-300">Phone (Compact)</span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
                Better on a Larger Display
              </h3>
              <p className="mt-1.5 text-xs text-[#9BB7EA] leading-relaxed">
                EstiMate&apos;s structural estimators, 2D sheet cutting optimizer, and engineering blueprints are engineered for detailed engineering workflows and best viewed on an <strong className="text-white">iPad, tablet, or desktop computer</strong>.
              </p>

              {/* Quick Tips for Phone */}
              <div className="mt-3.5 space-y-2 rounded-xl border border-[#2C599D]/60 bg-[#193A6F]/40 p-3 text-xs text-blue-100">
                <div className="flex items-start gap-2">
                  <span className="text-[#F98125] font-bold text-sm">🔄</span>
                  <p className="text-[0.72rem] leading-snug">
                    <strong className="text-white">Rotate to Landscape:</strong> Turn your phone sideways for wider CAD sheet layouts and table views.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold text-sm">🔍</span>
                  <p className="text-[0.72rem] leading-snug">
                    <strong className="text-white">Interactive Diagrams:</strong> Use the &ldquo;Fit to Screen&rdquo; or &ldquo;1:1 Zoom&rdquo; buttons on diagrams to pan and inspect dimensions.
                  </p>
                </div>
              </div>

              {/* Don't show again checkbox */}
              <label className="mt-4 flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-400 bg-slate-800 text-[#F98125] focus:ring-[#F98125]"
                />
                <span className="text-[0.75rem]">Don&apos;t show this again on this phone</span>
              </label>

              {/* Action Button */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#F98125] to-[#FB923C] py-3 text-xs font-bold uppercase tracking-wider text-[#07132F] shadow-lg shadow-orange-950/40 transition hover:brightness-110 active:scale-[0.98]"
                >
                  Continue on Mobile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
