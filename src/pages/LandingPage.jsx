import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useRef } from 'react'
import gsap from 'gsap'
import { ParallaxComponent } from '@/components/ui/parallax-scrolling'
import PricingSection from '../components/PricingSection'
import { useAuth } from '../context/AuthContext'

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

function Mark() {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F98125] shadow-lg shadow-orange-950/30">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="1.8">
        <path d="m21 16-9 5-9-5V8l9-5 9 5v8Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </svg>
    </span>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  )
}

function Check() {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-xs text-emerald-400">
      ✓
    </span>
  )
}

function AppPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 35, rotate: 1 }}
      whileInView={{ opacity: 1, x: 0, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-lg lg:max-w-none"
    >
      <div className="absolute -inset-6 rounded-3xl bg-[#2C599D]/25 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-[#5B84C4]/40 bg-[#193A6F] p-3 shadow-2xl shadow-black/50 sm:p-5">
        {/* Window Bar */}
        <div className="mb-4 flex items-center justify-between border-b border-[#2C599D]/50 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F98125]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#5B84C4]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#2C599D]" />
            <span className="ml-2 font-mono text-[0.65rem] tracking-wider text-[#5B84C4]">
              EstiMate QS Suite · Scoped
            </span>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[0.6rem] font-medium text-emerald-300">
            ● Local Autosave
          </span>
        </div>

        {/* Mockup Inside */}
        <div className="rounded-xl bg-[#11224D] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[#5B84C4]">Active Project</p>
              <h4 className="mt-0.5 text-base font-medium text-white sm:text-lg">Sample Residential Villa</h4>
              <p className="text-xs text-blue-200/60">Quezon City · Structural & Finishes</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-lg bg-[#F98125] px-3 py-1.5 text-xs font-medium text-white shadow-md">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 21h14" />
              </svg>
              Export BOQ
            </span>
          </div>

          {/* Metric Tiles */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200/10 bg-white/5 p-2.5">
              <p className="text-[0.55rem] uppercase tracking-wider text-slate-400">Materials</p>
              <p className="mt-1 font-mono text-xs font-bold text-white sm:text-sm">₱1,178,500</p>
            </div>
            <div className="rounded-lg border border-slate-200/10 bg-white/5 p-2.5">
              <p className="text-[0.55rem] uppercase tracking-wider text-slate-400">Labor</p>
              <p className="mt-1 font-mono text-xs font-bold text-white sm:text-sm">₱393,920</p>
            </div>
            <div className="rounded-lg border border-slate-200/10 bg-white/5 p-2.5">
              <p className="text-[0.55rem] uppercase tracking-wider text-slate-400">Contingency</p>
              <p className="mt-1 font-mono text-xs font-bold text-white sm:text-sm">₱78,621</p>
            </div>
            <div className="rounded-lg border border-orange-500/40 bg-[#F98125]/15 p-2.5">
              <p className="text-[0.55rem] uppercase tracking-wider text-orange-300">Total BOQ</p>
              <p className="mt-1 font-mono text-xs font-bold text-[#F98125] sm:text-sm">₱1,651,041</p>
            </div>
          </div>

          {/* Trade modules preview */}
          <div className="mt-3.5 space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-[#2C599D]/60 bg-[#193A6F]/50 px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#F98125]" />
                <span className="font-medium text-white">Class A Concrete Takeoff</span>
              </div>
              <span className="font-mono text-blue-200">167 bags (40kg) · 14.5 m³</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#2C599D]/60 bg-[#193A6F]/50 px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-medium text-white">CHB Masonry & Plaster</span>
              </div>
              <span className="font-mono text-blue-200">1,418 pcs · 113 m² wall</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#2C599D]/60 bg-[#193A6F]/50 px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span className="font-medium text-white">DOLE NCR-27 Labor Crew</span>
              </div>
              <span className="font-mono text-blue-200">Foreman, Mason & Helpers</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const keyProps = [
  {
    no: '01',
    title: 'Exact commercial material yields',
    subtitle: 'Practical procurement numbers, not just raw geometric volume',
    text: 'Convert CAD drawings or field dimensions into supplier-ready commercial quantities. Computes whole 40kg or 50kg cement bags, Class AA to Class C mix volume factors, gravel & sand in cubic meters, 400x200mm CHB units with laying mortar, and exact tile cartons with realistic wastage.',
  },
  {
    no: '02',
    title: 'DOLE-approved labor rate calculations',
    subtitle: 'Empirical productivity constants with statutory regional baselines',
    text: 'Eliminate arbitrary labor percentage guesses. Automatically converts measured scopes into foreman, skilled mason, and helper man-days based on actual field productivity constants and editable DOLE NCR Wage Order (NCR-27) regional baselines.',
  },
  {
    no: '03',
    title: 'Instant BOQ PDF generation on the field',
    subtitle: 'Formal client-ready bill of quantities exported before leaving site',
    text: 'Roll every measured trade into a professionally branded, itemized PDF. Includes separate sections for Materials, Skilled/Supervisory Labor, Unskilled Labor, contractor contingency markup (5%), and total project cost ready for signing.',
  },
]

const modules = [
  {
    name: 'Structural Concrete & Rebar',
    description: 'Calculate slab, column, and footing volumes with Class AA, A, B, or C mix designs, bag sizing, and kg/m³ rebar ratios.',
    metrics: ['Slab + Column + Footing geometry', 'Wastage factor allowance', 'Sand & gravel procurement yields'],
  },
  {
    name: 'Masonry & Surface Plaster',
    description: 'CHB wall area minus openings, standard 12.5 pcs/m² takeoff, 1:3 cement-sand mortar, and single or dual-sided plaster coats.',
    metrics: ['Window & door deduction', 'Laying mortar wet/dry factors', 'Plaster thickness in mm'],
  },
  {
    name: 'Architectural Finishes',
    description: 'Floor tile areas with cut allowances and multi-coat interior/exterior painting coverage down to 4L purchase cans.',
    metrics: ['Net floor tile area + breakage %', 'Spread rate (10 m²/L/coat)', 'Purchasable 4-liter gallon cans'],
  },
  {
    name: 'Master Material & Wage Database',
    description: 'One centralized price basket for Metro Manila supplier quotes and DOLE labor baselines that automatically cascades to all active trades.',
    metrics: ['Simulated market quote refresh', 'NCR-27 daily wage order rates', 'Offline local persistence'],
  },
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const mainRef = useRef(null)

  function fastScrollTo(targetId, e) {
    e?.preventDefault()
    const target = document.getElementById(targetId)
    if (!target) return

    const targetY = target.getBoundingClientRect().top + window.scrollY - 65
    const distance = Math.abs(window.scrollY - targetY)
    const duration = Math.min(Math.max(distance / 2800, 0.65), 0.95)

    const scrollState = { y: window.scrollY, blur: 0 }

    // High velocity smooth scroll
    gsap.to(scrollState, {
      y: targetY,
      duration: duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        window.scrollTo(0, scrollState.y)
      },
      onComplete: () => {
        window.scrollTo(0, targetY)
      },
    })

    // Cinematic motion blur velocity curve
    const el = mainRef.current
    if (el) {
      gsap.timeline()
        .to(scrollState, {
          blur: 8, // Peak velocity blur in px
          duration: duration * 0.45,
          ease: 'power2.in',
          onUpdate: () => {
            el.style.filter = `blur(${scrollState.blur}px)`
            el.style.willChange = 'filter'
          },
        })
        .to(scrollState, {
          blur: 0,
          duration: duration * 0.55,
          ease: 'power2.out',
          onUpdate: () => {
            if (scrollState.blur > 0.2) {
              el.style.filter = `blur(${scrollState.blur}px)`
            } else {
              el.style.filter = 'none'
              el.style.willChange = 'auto'
            }
          },
          onComplete: () => {
            el.style.filter = 'none'
            el.style.willChange = 'auto'
          },
        })
    }
  }

  return (
    <div className="blueprint-grid min-h-screen overflow-x-hidden bg-[#11224D] font-sans text-white">
      {/* Top Floating Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-[#2C599D]/50 bg-[#11224D]/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <Mark />
            <div className="leading-none">
              <span className="text-xl font-bold tracking-tight text-white">
                Esti<span className="text-[#F98125]">Mate</span>
              </span>
              <span className="block text-[0.6rem] font-medium tracking-widest text-[#5B84C4] uppercase">
                QS Field Suite
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="#about"
              onClick={(e) => fastScrollTo('about', e)}
              className="text-xs font-semibold text-blue-200/80 transition hover:text-white sm:text-sm"
            >
              About
            </a>
            <a
              href="#pricing"
              onClick={(e) => fastScrollTo('pricing', e)}
              className="text-xs font-semibold text-blue-200/80 transition hover:text-white sm:text-sm"
            >
              Pricing
            </a>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex min-h-10 items-center gap-2 rounded-xl bg-[#F98125] px-4 text-xs font-bold text-white shadow-lg shadow-orange-950/40 transition hover:bg-[#FB9B50]"
              >
                Go to Dashboard <Arrow />
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex min-h-10 items-center gap-2 rounded-xl bg-[#F98125] px-4 text-xs font-bold text-white shadow-lg shadow-orange-950/40 transition hover:bg-[#FB9B50]"
              >
                Sign In <Arrow />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main ref={mainRef}>
        {/* GSAP-Powered Parallax Hero Section (Metro Manila Skyline & Branding) */}
        <ParallaxComponent />

        {/* Value Proposition Feature Blocks (Reference: quantitysurveyortools.com) */}
        <section id="about" className="relative bg-slate-50 px-4 py-20 text-slate-900 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={reveal}
              className="max-w-2xl"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2C599D]">
                Built For Field Construction Managers
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">
                Precision estimation that replaces slow, brittle spreadsheets.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                EstiMate delivers the three core pillars quantity surveyors and site engineers need when inspecting, bidding, or procuring materials on site.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {keyProps.map((item, i) => (
                <motion.article
                  key={item.no}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, delay: i * 0.12 }}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-900/5 hover:border-[#F98125]/40 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-[#F98125]">{item.no}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.65rem] font-semibold text-slate-600 uppercase tracking-wider">
                        Core Value Prop
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-[#2C599D]">
                      {item.subtitle}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      {item.text}
                    </p>
                  </div>

                  <div className="mt-8 border-t border-slate-100 pt-4">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F98125] hover:text-[#FB9B50]"
                    >
                      Try in Dashboard <Arrow />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* 3-Step Workflow & Live Calculator Preview */}
        <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B84C4]">
                Simple Field-Ready Architecture
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-white">
                From tape measurements to a signed BOQ in minutes.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-blue-100/70">
                Organize multiple construction jobs in the project dashboard. Each project maintains its own isolated geometry, mix choices, regional price basket, and calculated bill of quantities.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/dashboard"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F98125] px-6 text-sm font-semibold text-white shadow-lg transition hover:bg-[#FB9B50]"
                >
                  Open Dashboard <Arrow />
                </Link>
                <Link
                  to="/project/demo-sample-villa"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#2C599D] bg-[#193A6F]/50 px-6 text-sm font-semibold text-blue-100 transition hover:bg-[#193A6F] hover:text-white"
                >
                  View Sample Villa Takeoff
                </Link>
              </div>
            </motion.div>

            <AppPreview />
          </div>
        </section>

        {/* QS Tools / Modules Breakdown */}
        <section id="modules" className="border-t border-[#2C599D]/40 bg-[#0d1a3c] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B84C4]">
                Everything Included in `/project/:id`
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                The Dedicated Quantity Surveying Toolset
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-blue-100/60">
                All 4 estimator tools run locally in your browser with zero latency.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {modules.map((m) => (
                <div key={m.name} className="flex flex-col justify-between rounded-2xl border border-[#2C599D]/60 bg-[#11224D] p-5">
                  <div>
                    <h3 className="text-lg font-bold text-white">{m.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-blue-100/60">{m.description}</p>
                  </div>
                  <ul className="mt-5 space-y-1.5 border-t border-[#2C599D]/40 pt-4 text-xs text-[#5B84C4]">
                    {m.metrics.map((metric) => (
                      <li key={metric} className="flex items-center gap-2">
                        <span className="text-[#F98125]">›</span> {metric}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* Bottom Banner CTA */}
        <section className="px-4 pb-20 pt-10 sm:px-6 sm:pb-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#F98125] to-[#f4710f] px-6 py-12 text-center shadow-2xl shadow-orange-950/30 sm:px-12 sm:py-16"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-950/70">
              Instant Access · Offline-First
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Ready to build your next construction estimate?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/90">
              Open the project dashboard right now. No logins, no subscriptions, and zero signal required on the job site.
            </p>
            <div className="mt-8">
              <Link
                to="/dashboard"
                className="inline-flex min-h-14 items-center gap-2 rounded-xl bg-[#11224D] px-8 text-base font-semibold text-white shadow-xl transition hover:bg-[#193A6F] hover:scale-[1.02]"
              >
                Start Estimating <Arrow />
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2C599D]/50 bg-[#0d1a3c] px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-[#7CA3E2] sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-semibold text-white/90">EstiMate</p>
            <p>© {new Date().getFullYear()} EstiMate · Pocket Quantity Surveying Suite for Philippine Sites</p>
            <p className="text-[11px] text-slate-400">DOLE NCR-27 Baseline Reference · Verify approved specifications</p>
          </div>
          <nav aria-label="Legal links" className="flex flex-wrap items-center gap-x-6 gap-y-2 font-medium">
            <Link to="/privacy" className="hover:text-white transition-colors focus-visible:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors focus-visible:text-white">Terms & Conditions</Link>
            <Link to="/cookies" className="hover:text-white transition-colors focus-visible:text-white">Cookie Policy</Link>
            <Link to="/refunds" className="hover:text-white transition-colors focus-visible:text-white">Refund Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
