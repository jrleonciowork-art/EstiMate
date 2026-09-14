import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function CheckIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ArrowRightIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function PricingSection() {
  const { user, isPro, upgradeToPro, downgradeToFree } = useAuth()
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' | 'annual'
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [successNotice, setSuccessNotice] = useState(false)

  const isAnnual = billingCycle === 'annual'

  return (
    <section id="pricing" className="relative bg-[#11224D] px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8 blueprint-grid">
      {/* Soft Ambient Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#193A6F]/35 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#5B84C4]">
            Transparent Pricing for Philippine Builders
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Simple, predictable plans.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-100/75">
            Start calculating with our core pocket quantity surveying tools for free, or unlock multi-project saving, DOLE NCR-27 labor costing, and client-ready PDF BOQs.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-10 inline-flex items-center gap-3 rounded-2xl border border-[#2C599D]/80 bg-[#193A6F]/60 p-1.5 shadow-xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`relative rounded-xl px-5 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                !isAnnual
                  ? 'bg-[#F98125] text-white shadow-lg shadow-orange-950/40'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                isAnnual
                  ? 'bg-[#F98125] text-white shadow-lg shadow-orange-950/40'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide transition ${
                isAnnual
                  ? 'bg-white text-[#F98125]'
                  : 'bg-emerald-400/20 text-emerald-300'
              }`}>
                Save ₱1,300
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid items-stretch gap-8 lg:grid-cols-2 lg:gap-8 max-w-5xl mx-auto">
          {/* 1. Free Tier Card */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-[#2C599D]/70 bg-[#193A6F]/50 p-8 shadow-2xl backdrop-blur-xl transition hover:border-[#5B84C4] sm:p-10">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#5B84C4]">
                    Field Starter
                  </span>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Free
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-4xl font-extrabold text-white">₱0</span>
                  <span className="block text-xs text-blue-200/60 font-medium">Free forever</span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-blue-100/70 sm:text-sm">
                Essential pocket quantity surveying tools for rapid, on-the-spot field checks and concrete volume takeoffs.
              </p>

              <div className="my-8 border-t border-[#2C599D]/50" />

              {/* Free Features List */}
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5B84C4]">
                  Included with Free:
                </p>
                <ul className="space-y-3.5 text-xs sm:text-sm">
                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/20 text-emerald-400 mt-0.5">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <strong className="text-white font-semibold">Basic Geometry Inputs:</strong>{' '}
                      <span className="text-blue-100/70">
                        Access to input dimensions for slabs, columns, footings, and standard walls.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/20 text-emerald-400 mt-0.5">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <strong className="text-white font-semibold">Raw Volume Calculations:</strong>{' '}
                      <span className="text-blue-100/70">
                        Instant outputs for total cubic meters (concrete) or square meters (masonry).
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/20 text-emerald-400 mt-0.5">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <strong className="text-white font-semibold">Standard Material Yields:</strong>{' '}
                      <span className="text-blue-100/70">
                        Exact number of standard 40kg cement bags, sand, and gravel required based on default mix classes.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-500/20 text-slate-300 mt-0.5">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </span>
                    <div>
                      <strong className="text-white font-semibold">On-Screen Calculations Only:</strong>{' '}
                      <span className="text-blue-100/70">
                        Free accounts are ineligible for PDF export. Material takeoffs and cost figures are interactive on screen only.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Free CTA */}
            <div className="mt-10">
              <Link
                to="/dashboard"
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#5B84C4]/70 bg-transparent px-6 text-sm font-bold text-white transition hover:bg-[#193A6F] hover:border-white"
              >
                Start Estimating for Free <ArrowRightIcon />
              </Link>
            </div>
          </div>

          {/* 2. Pro Tier Card (Visually Highlighted) */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-[#F98125] bg-white p-8 text-slate-900 shadow-2xl shadow-orange-950/40 sm:p-10 transform lg:-translate-y-2">
            {/* Top Featured Ribbon / Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#F98125] px-4 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-white shadow-lg shadow-orange-950/30">
              Most Popular for Quantity Surveyors
            </div>

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#F98125]">
                    Pocket QS Pro
                  </span>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Pro
                  </h3>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="font-mono text-4xl font-extrabold text-slate-900 sm:text-5xl">
                      {isAnnual ? '₱3,500' : '₱400'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {isAnnual ? '/ year' : '/ month'}
                    </span>
                  </div>

                  {/* Savings Badge on Annual */}
                  <AnimatePresence mode="wait">
                    {isAnnual ? (
                      <motion.div
                        key="annual-badge"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#F98125] px-2.5 py-0.5 text-[0.65rem] font-extrabold text-white shadow"
                      >
                        Save ₱1,300
                      </motion.div>
                    ) : (
                      <span key="monthly-note" className="block text-[0.7rem] text-slate-400 font-medium">
                        Billed monthly · Cancel anytime
                      </span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
                Unlock full commercial bidding capabilities: itemized PDF exports, custom hardware rates, DOLE wage compliance, and multi-project saving.
              </p>

              <div className="my-8 border-t border-slate-100" />

              {/* Pro Features List */}
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#2C599D]">
                  Everything in Free, plus:
                </p>

                <ul className="space-y-3.5 text-xs sm:text-sm">
                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-orange-100 text-[#F98125] mt-0.5">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <strong className="text-slate-900 font-semibold">Client-Ready PDF BOQ Export:</strong>{' '}
                      <span className="text-slate-600">
                        Official, white-label PDF Bill of Quantities downloads with custom company letterhead, logo, and DOLE labor compliance.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-orange-100 text-[#F98125] mt-0.5">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <strong className="text-slate-900 font-semibold">Master Database & Custom Prices:</strong>{' '}
                      <span className="text-slate-600">
                        Save specific local hardware store rates and custom unit weights for future use.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-orange-100 text-[#F98125] mt-0.5">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <strong className="text-slate-900 font-semibold">DOLE Labor Integrations:</strong>{' '}
                      <span className="text-slate-600">
                        Automated manpower cost calculations based on regional minimum wages and standard productivity constants.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-orange-100 text-[#F98125] mt-0.5">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <strong className="text-slate-900 font-semibold">Project Saving:</strong>{' '}
                      <span className="text-slate-600">
                        Unlock the project management dashboard to save, edit, and manage multiple named projects across sessions.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro CTA Button */}
            <div className="mt-10">
              {isPro ? (
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-xl transition hover:bg-emerald-500"
                  >
                    <span>Active Pro Account · Open Dashboard</span> <ArrowRightIcon />
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await downgradeToFree()
                    }}
                    className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
                  >
                    Switch back to Free Starter (Test Mode)
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        navigate('/login?redirect=/pricing')
                        return
                      }
                      setShowUpgradeModal(true)
                    }}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F98125] px-6 text-sm font-bold text-white shadow-xl shadow-orange-950/30 transition hover:bg-[#FB9B50] hover:scale-[1.01]"
                  >
                    Upgrade to Pro <ArrowRightIcon />
                  </button>

                  <p className="mt-2.5 text-center text-[0.7rem] text-slate-400 font-medium">
                    {isAnnual ? '₱3,500 billed annually (equivalent to ₱291/mo)' : '₱400 billed monthly · Instant access'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contractor Guarantee Note */}
        <div className="mt-16 text-center text-xs text-blue-200/60">
          <p>
            🇵🇭 Built for Philippine General Contractors, Project Engineers, and Quantity Surveyors.
          </p>
          <p className="mt-1">
            Accepts GCash, Maya, Debit/Credit Card, and Direct Bank Transfer with official invoice.
          </p>
        </div>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-[#07132F]/80 p-4 backdrop-blur-sm"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-slate-900 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#F98125]">
                  EstiMate Pro
                </span>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                Upgrade to Pocket QS Pro
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                You selected the <strong>{isAnnual ? 'Annual (₱3,500/year)' : 'Monthly (₱400/month)'}</strong> plan.
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">Total Due Today</span>
                  <span className="font-mono font-extrabold text-[#F98125] text-lg">
                    {isAnnual ? '₱3,500.00' : '₱400.00'}
                  </span>
                </div>
                {isAnnual && (
                  <p className="mt-1 text-xs text-emerald-600 font-semibold">
                    ✓ Includes ₱1,300 annual discount
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  disabled={upgrading}
                  onClick={async () => {
                    setUpgrading(true)
                    const res = await upgradeToPro(billingCycle)
                    setUpgrading(false)
                    if (res?.success) {
                      setShowUpgradeModal(false)
                      setSuccessNotice(true)
                      setTimeout(() => setSuccessNotice(false), 4000)
                    }
                  }}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F98125] text-sm font-bold text-white shadow hover:bg-[#FB9B50] disabled:opacity-60"
                >
                  {upgrading ? 'Activating Pro...' : 'Confirm & Activate Pro Contractor'} <ArrowRightIcon />
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="min-h-11 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successNotice && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/90 p-4 text-emerald-100 shadow-2xl backdrop-blur-xl"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckIcon className="h-5 w-5" />
            </span>
            <div className="text-xs">
              <p className="font-bold text-white">Pro Contractor Activated!</p>
              <p className="text-emerald-200/80">Unlimited projects, custom company logo, and white-label BOQs are now unlocked.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
