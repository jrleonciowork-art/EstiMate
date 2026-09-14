import React from 'react'
import { Link, NavLink } from 'react-router-dom'

const LEGAL_NAV = [
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Terms & Conditions', path: '/terms' },
  { name: 'Cookie Policy', path: '/cookies' },
  { name: 'Refund Policy', path: '/refunds' },
]

export default function LegalLayout({ title, subtitle, lastUpdated, children }) {
  return (
    <div className="blueprint-grid min-h-screen bg-[#11224D] font-sans text-white">
      {/* Top Floating Header */}
      <header className="sticky top-0 z-30 border-b border-[#2C599D]/60 bg-[#11224D]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              aria-label="Back to EstiMate Home"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F98125] text-white shadow-lg transition hover:bg-[#FB9B50]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5m7 7-7-7 7-7" />
              </svg>
            </Link>

            <div>
              <Link to="/" className="text-lg font-bold tracking-tight text-white hover:text-orange-200 sm:text-xl">
                Esti<span className="text-[#F98125]">Mate</span>
              </Link>
              <span className="ml-2 hidden rounded-md bg-[#193A6F] px-2 py-0.5 text-[0.65rem] font-bold text-[#7CA3E2] uppercase tracking-wider sm:inline-block">
                Legal & Compliance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="rounded-xl border border-[#2C599D]/80 bg-[#193A6F]/60 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#193A6F]"
            >
              Open Dashboard →
            </Link>
          </div>
        </div>

        {/* Sub-nav Tabs */}
        <nav
          aria-label="Legal documents navigation"
          className="hide-scrollbar mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 pb-2.5 sm:px-6 lg:px-8 touch-pan-x"
        >
          {LEGAL_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex shrink-0 items-center rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#F98125] text-white shadow-md'
                    : 'text-blue-200/80 hover:bg-[#193A6F]/80 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Document Header */}
        <div className="border-b border-[#2C599D]/60 pb-6 sm:pb-8">
          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#7CA3E2]">
            Legal Document
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-blue-100/80 sm:text-base leading-relaxed">
              {subtitle}
            </p>
          )}
          <p className="mt-4 font-mono text-xs text-[#7CA3E2]">
            Effective Date & Last Updated: {lastUpdated || 'September 14, 2026'} · Version 1.0 (PH / Global)
          </p>
        </div>

        {/* Document Body Card */}
        <article className="prose prose-invert mt-8 max-w-none rounded-3xl border border-[#2C599D]/70 bg-[#193A6F]/40 p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-slate-200 text-sm sm:text-base leading-relaxed space-y-6">
          {children}
        </article>
      </main>

      {/* Legal Footer */}
      <footer className="border-t border-[#2C599D]/50 bg-[#0d1a3c] px-4 py-8 text-center text-xs text-[#7CA3E2]">
        <div className="mx-auto max-w-7xl space-y-2">
          <p>© {new Date().getFullYear()} EstiMate Software Solutions. All rights reserved.</p>
          <p>Operated in accordance with Republic Act No. 10173 (Philippine Data Privacy Act of 2012) and international standards.</p>
        </div>
      </footer>
    </div>
  )
}
