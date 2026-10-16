import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectsContext'
import { calculateProject, DEFAULT_DATA, fetchMarketPrices, MIXES, num, PRICE_LABELS, PRODUCTIVITY } from '../lib/estimator'
import PdfUploader from '../components/PdfUploader'
import PricingGrid from '../components/PricingGrid'

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 })
const number = new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 3 })
const integer = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 })

const TABS = [
  ['dashboard', 'Master Dashboard', 'grid'],
  ['structural', 'Structural & Concrete', 'structure'],
  ['formwork', 'Formwork & Shoring', 'cube'],
  ['rebar', 'Rebar Cutting Optimizer', 'rebar'],
  ['roofing', 'Roofing & Sheeting', 'home'],
  ['masonry', 'Masonry & Plaster', 'wall'],
  ['finishes', 'Finishes (Tile & Paint)', 'paint'],
  ['boq', 'Official BOQ & Bid Proposal', 'fileText'],
  ['database', 'Master Database', 'database'],
]

function cloneDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA))
}

function mergeWithDefaults(saved) {
  const defaults = cloneDefaults()
  if (!saved) return defaults
  return {
    ...defaults,
    ...saved,
    structural: { ...defaults.structural, ...(saved.structural || {}) },
    formwork: { ...defaults.formwork, ...(saved.formwork || {}) },
    rebar: { ...defaults.rebar, ...(saved.rebar || {}) },
    roofing: { ...defaults.roofing, ...(saved.roofing || {}) },
    boq: { ...defaults.boq, ...(saved.boq || {}) },
    masonry: { ...defaults.masonry, ...(saved.masonry || {}) },
    finishes: { ...defaults.finishes, ...(saved.finishes || {}) },
    prices: { ...defaults.prices, ...(saved.prices || {}) },
    wages: { ...defaults.wages, ...(saved.wages || {}) },
  }
}

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    structure: (
      <>
        <path d="M4 21V10m16 11V10M2 10h20M6 10l2-7h8l2 7M8 14h8M8 18h8" />
      </>
    ),
    wall: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <path d="M3 9h18M3 15h18M8 4v5m8-5v5M6 9v6m6-6v6m6-6v6M9 15v5m7-5v5" />
      </>
    ),
    paint: (
      <>
        <path d="m14.6 4.4 5 5L8 21H3v-5L14.6 4.4Z" />
        <path d="m13 6 5 5M3 21h18" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7h-5V2M4 17h5v5" />
        <path d="M5.1 9A8 8 0 0 1 18 5.2L20 7M4 17l2 1.8A8 8 0 0 0 18.9 15" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5m0-8h.01" />
      </>
    ),
    peso: (
      <>
        <path d="M7 20V4h6.5a4 4 0 0 1 0 8H7m0-4h10M5 12h8" />
      </>
    ),
    cube: (
      <>
        <path d="m21 16-9 5-9-5V8l9-5 9 5v8Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    back: <path d="M19 12H5m7 7-7-7 7-7" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    lock: (
      <>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
    rebar: (
      <>
        <line x1="4" y1="21" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="3" />
        <line x1="2" y1="14" x2="22" y2="14" />
        <line x1="2" y1="8" x2="22" y2="8" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-9 9 9M4 10.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9.5" />
      </>
    ),
    fileText: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </>
    ),
    scan: (
      <>
        <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
        <line x1="7" y1="12" x2="17" y2="12" />
      </>
    ),
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Field({ label, value, onChange, unit, placeholder = '0.00', step = 'any', help, disabled = false }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>{label}</span>
        {disabled && (
          <span className="text-[0.62rem] font-bold text-amber-600 uppercase">DOLE Baseline (Locked)</span>
        )}
      </span>
      <span className={`flex h-11 overflow-hidden rounded-xl border ${
        disabled
          ? 'border-slate-200 bg-slate-100 cursor-not-allowed'
          : 'border-slate-300 bg-slate-50 transition focus-within:border-[#F98125] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#F98125]/20'
      }`}>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={(e) => !disabled && onChange(e.target.value)}
          className={`min-w-0 flex-1 bg-transparent px-3 font-mono text-base sm:text-sm font-medium outline-none placeholder:text-slate-400 ${
            disabled ? 'text-slate-500 cursor-not-allowed' : 'text-slate-900'
          }`}
        />
        {unit && (
          <span className="flex items-center border-l border-slate-200 bg-slate-100/70 px-3 font-mono text-xs font-semibold text-slate-500">
            {unit}
          </span>
        )}
      </span>
      {help && <span className="mt-1 block text-[0.7rem] text-slate-500">{help}</span>}
    </label>
  )
}

function Card({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-lg shadow-black/10 ${className}`}>
      {children}
    </section>
  )
}

function Heading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5 sm:gap-4">
      <div>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#2C599D]">{eyebrow}</p>
        <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 max-w-2xl text-xs text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

function Pill({ children, orange = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${
        orange ? 'bg-orange-100 text-[#F98125]' : 'bg-blue-50 text-[#193A6F]'
      }`}
    >
      {children}
    </span>
  )
}

function Metric({ label, value, unit, accent = false, icon }) {
  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${accent ? 'border-orange-200 bg-orange-50/80' : 'border-slate-200 bg-slate-50'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.7rem] sm:text-xs font-medium text-slate-500">{label}</span>
        {icon && <Icon name={icon} className={`h-4 w-4 ${accent ? 'text-[#F98125]' : 'text-[#5B84C4]'}`} />}
      </div>
      <p className={`mt-1.5 break-words font-mono text-base sm:text-xl font-bold ${accent ? 'text-[#F98125]' : 'text-slate-900'}`}>
        {value}
      </p>
      {unit && <p className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-slate-400">{unit}</p>}
    </div>
  )
}

function Empty({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-xs text-slate-500">
      {children}
    </div>
  )
}

function TabNavigation({ tabs, activeTab, onSelectTab }) {
  const navRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startScrollLeftRef = useRef(0)
  const hasMovedRef = useRef(false)

  const checkScroll = useCallback(() => {
    const el = navRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = navRef.current
    if (!el) return

    checkScroll()

    // Wheel event: convert mouse wheel to horizontal sliding smoothly
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > 0 || Math.abs(e.deltaX) > 0) {
        e.preventDefault()
        el.scrollLeft += (e.deltaY !== 0 ? e.deltaY : e.deltaX) * 0.95
        checkScroll()
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', checkScroll)

    return () => {
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  // Center active tab smoothly on change
  useEffect(() => {
    const el = navRef.current
    if (!el) return
    const activeEl = el.querySelector(`[data-tab-id="${activeTab}"]`)
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    const timer = setTimeout(checkScroll, 300)
    return () => clearTimeout(timer)
  }, [activeTab, checkScroll])

  const scrollByAmount = (amount) => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: amount, behavior: 'smooth' })
      setTimeout(checkScroll, 320)
    }
  }

  // Mouse Drag / Slide Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    const el = navRef.current
    if (!el) return
    isDraggingRef.current = true
    hasMovedRef.current = false
    startXRef.current = e.pageX - el.offsetLeft
    startScrollLeftRef.current = el.scrollLeft
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return
    const el = navRef.current
    if (!el) return
    const x = e.pageX - el.offsetLeft
    const dist = x - startXRef.current
    if (Math.abs(dist) > 5) {
      hasMovedRef.current = true
    }
    el.scrollLeft = startScrollLeftRef.current - dist * 1.2
    checkScroll()
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
    setTimeout(() => {
      hasMovedRef.current = false
    }, 60)
  }

  const handleTabClick = (tabId) => {
    if (hasMovedRef.current) return
    onSelectTab(tabId)
  }

  return (
    <div className="relative mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-220)}
          aria-label="Scroll tabs left"
          className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 grid h-8 w-8 place-items-center rounded-full bg-[#11224D]/95 text-white shadow-xl border border-[#2C599D] hover:bg-[#F98125] hover:border-[#F98125] transition active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Edge gradient masks */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-2.5 w-8 bg-gradient-to-r from-[#11224D] to-transparent z-10" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-2.5 w-8 bg-gradient-to-l from-[#11224D] to-transparent z-10" />
      )}

      {/* Scrollable Tabs Nav */}
      <nav
        ref={navRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onScroll={checkScroll}
        className="hide-scrollbar flex gap-1.5 overflow-x-auto px-1 sm:px-2 pb-2.5 touch-pan-x select-none cursor-grab active:cursor-grabbing"
        aria-label="Estimator Modules"
      >
        {tabs.map(([tabId, label, icon]) => (
          <button
            key={tabId}
            data-tab-id={tabId}
            type="button"
            onClick={() => handleTabClick(tabId)}
            className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition ${
              activeTab === tabId
                ? 'bg-white text-[#193A6F] shadow ring-1 ring-white/50'
                : 'text-blue-200 hover:bg-[#193A6F] hover:text-white'
            }`}
          >
            <Icon name={icon} className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </nav>

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(220)}
          aria-label="Scroll tabs right"
          className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 grid h-8 w-8 place-items-center rounded-full bg-[#11224D]/95 text-white shadow-xl border border-[#2C599D] hover:bg-[#F98125] hover:border-[#F98125] transition active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  )
}

/* 1. MASTER DASHBOARD TAB */
function DashboardTab({ project, onNavigate, onPdf, onOpenPdfModal, isPro }) {
  const activeModules = [
    {
      name: 'Structural Concrete',
      enabled: project.structural.neat > 0,
      detail: `${number.format(project.structural.neat)} m³ neat · ${integer.format(project.structural.bags)} bags cement`,
      target: 'structural',
    },
    {
      name: 'Formwork & Shoring',
      enabled: (project.formwork?.area || 0) > 0,
      detail: `${number.format(project.formwork?.area || 0)} m² contact · ${integer.format(project.formwork?.sheets || 0)} 4x8 plywood sheets`,
      target: 'formwork',
    },
    {
      name: 'Rebar Cutting Stock',
      enabled: (project.rebar?.totalWeightKg || 0) > 0,
      detail: `${number.format(project.rebar?.totalWeightKg || 0)} kg steel · ${integer.format(project.rebar?.stockBars || 0)} commercial bars`,
      target: 'rebar',
    },
    {
      name: 'Roofing & Sheeting',
      enabled: (project.roofing?.trueArea || 0) > 0,
      detail: `${number.format(project.roofing?.trueArea || 0)} m² roof · ${integer.format(project.roofing?.sheets || 0)} sheets`,
      target: 'roofing',
    },
    {
      name: 'Masonry & Plaster',
      enabled: project.masonry.area > 0,
      detail: `${number.format(project.masonry.area)} m² wall · ${integer.format(project.masonry.blocks)} CHB pieces`,
      target: 'masonry',
    },
    {
      name: 'Architectural Finishes',
      enabled: project.finishes.tileNet > 0 || project.finishes.paintArea > 0,
      detail: `${number.format(project.finishes.tileArea)} m² tiles · ${integer.format(project.finishes.paintCans)} paint cans`,
      target: 'finishes',
    },
    {
      name: 'Official BOQ & Bid Proposal',
      enabled: project.items.length > 0,
      detail: 'Configure contractor markups, terms & export client PDF',
      target: 'boq',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B84C4]">Project Overview</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Master Cost Dashboard</h1>
          <p className="mt-1 text-xs text-blue-100/70">
            Consolidated materials, DOLE labor crews, and contingency across every active module.
          </p>
        </div>

        <div className="flex flex-wrap items-center sm:items-end gap-2.5">
          <button
            type="button"
            onClick={onOpenPdfModal}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#2C599D]/70 bg-[#193A6F]/70 px-4 text-xs font-semibold text-blue-200 transition hover:bg-[#193A6F] hover:text-white"
            title="Upload architectural or structural plan to auto-populate dimensions"
          >
            <Icon name="scan" className="h-4 w-4 text-[#F98125]" />
            <span>Scan Blueprint PDF</span>
          </button>

          <button
            type="button"
            disabled={!project.items.length}
            onClick={onPdf}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-xl shadow-black/20 transition disabled:cursor-not-allowed disabled:opacity-40 ${
              isPro
                ? 'bg-[#F98125] text-white hover:bg-[#FB9B50]'
                : 'bg-slate-800/90 text-white border border-amber-500/40 hover:bg-slate-800'
            }`}
          >
            {isPro ? (
              <>
                <Icon name="download" className="h-4 w-4" />
                <span>Generate White-Label BOQ (PDF)</span>
              </>
            ) : (
              <>
                <Icon name="lock" className="h-4 w-4 text-[#F98125]" />
                <span>Generate Master BOQ (PDF)</span>
                <span className="ml-1 rounded bg-[#F98125] px-1.5 py-0.5 text-[0.65rem] font-black uppercase text-white shadow-sm">
                  PRO
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Procurement Materials" value={money.format(project.materialCost)} icon="cube" />
        <Metric label="DOLE Labor Allowance" value={money.format(project.laborCost)} icon="users" />
        <Metric label="Contingency (5%)" value={money.format(project.contingency)} icon="info" />
        <Metric label="Total Project Estimate" value={money.format(project.total)} accent icon="peso" />
      </div>

      {/* Quick Trade Jump Cards */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activeModules.map((m) => (
          <button
            key={m.name}
            type="button"
            onClick={() => onNavigate(m.target)}
            className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 text-left shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-[#F98125]"
          >
            <div className="flex items-center justify-between">
              <Pill orange={m.enabled}>{m.enabled ? 'Scope Active' : 'Not Started'}</Pill>
              <span className="text-xs font-bold text-slate-400">Jump →</span>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900">{m.name}</h3>
            <p className="mt-1 font-mono text-xs text-slate-500">{m.enabled ? m.detail : 'Click to add dimensions'}</p>
          </button>
        ))}
      </div>

      {/* Consolidated Bill of Quantities Table */}
      <Card>
        <Heading
          eyebrow="Master Bill of Quantities"
          title="Consolidated Itemized BOQ"
          description="Live procurement quantities and labor man-days generated from your active field dimensions."
        />
        {project.items.length ? (
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="sm:hidden mb-2 flex items-center justify-between text-[0.68rem] text-slate-400 font-medium">
              <span>Swipe horizontally to view full breakdown →</span>
              <span className="font-mono text-[#F98125] font-bold">{project.items.length} items</span>
            </div>
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
                  {['Module', 'Category', 'Description', 'Quantity', 'Unit Cost', 'Amount'].map((h) => (
                    <th key={h} className="px-3 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {project.items.map((item, i) => (
                  <tr key={`${item.module}-${item.item}-${i}`} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5">
                      <Pill>{item.module}</Pill>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">{item.category}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{item.item}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-700">
                      {number.format(item.quantity)} {item.unit}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-500">{money.format(item.unitCost)}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                      {money.format(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>
            Start with the Structural, Masonry, or Finishes tabs above to build your master bill of quantities.
          </Empty>
        )}
      </Card>
    </div>
  )
}

/* 2. STRUCTURAL TAB */
function StructuralTab({ value, update, result, wages }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
      <div className="space-y-6">
        <Card>
          <Heading eyebrow="Geometry · Slabs" title="Slab Dimensions" description="Finished concrete slab footprint before wastage." />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <Field label="Length" value={value.slabLength} onChange={(v) => update('slabLength', v)} unit="m" />
            <Field label="Width" value={value.slabWidth} onChange={(v) => update('slabWidth', v)} unit="m" />
            <div className="col-span-2 sm:col-span-1">
              <Field label="Thickness" value={value.slabThickness} onChange={(v) => update('slabThickness', v)} unit="m" placeholder="0.10" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <Heading eyebrow="Geometry · Vertical" title="Structural Columns" description="Prismatic uniform columns or non-prismatic tapered frustums." />
            <div className="flex rounded-xl bg-slate-100 p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => update('isColumnVariable', false)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  !value.isColumnVariable ? 'bg-[#193A6F] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Constant
              </button>
              <button
                type="button"
                onClick={() => update('isColumnVariable', true)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  value.isColumnVariable ? 'bg-[#F98125] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Variable (Tapered)
              </button>
            </div>
          </div>

          {value.isColumnVariable ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Count" value={value.columnCount} onChange={(v) => update('columnCount', v)} unit="pcs" />
                <Field label="Height" value={value.columnHeight} onChange={(v) => update('columnHeight', v)} unit="m" />
                <Field label="Start Width (W₁)" value={value.columnWidthStart || value.columnWidth} onChange={(v) => update('columnWidthStart', v)} unit="m" />
                <Field label="Start Depth (D₁)" value={value.columnDepthStart || value.columnDepth} onChange={(v) => update('columnDepthStart', v)} unit="m" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                <Field label="End Width (W₂)" value={value.columnWidthEnd || value.columnWidthStart || value.columnWidth} onChange={(v) => update('columnWidthEnd', v)} unit="m" />
                <Field label="End Depth (D₂)" value={value.columnDepthEnd || value.columnDepthStart || value.columnDepth} onChange={(v) => update('columnDepthEnd', v)} unit="m" />
              </div>
              <p className="text-[0.68rem] text-slate-500 font-mono">
                Volumetric frustum formula: V = (H/3) × (A₁ + A₂ + √(A₁A₂))
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
              <Field label="Count" value={value.columnCount} onChange={(v) => update('columnCount', v)} unit="pcs" />
              <Field label="Width" value={value.columnWidth} onChange={(v) => update('columnWidth', v)} unit="m" />
              <Field label="Depth" value={value.columnDepth} onChange={(v) => update('columnDepth', v)} unit="m" />
              <Field label="Height" value={value.columnHeight} onChange={(v) => update('columnHeight', v)} unit="m" />
            </div>
          )}
        </Card>

        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <Heading eyebrow="Geometry · Horizontal" title="Beams & Girders" description="Grade beams, tie beams, floor girders, and haunched sections." />
            <div className="flex rounded-xl bg-slate-100 p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => update('isBeamVariable', false)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  !value.isBeamVariable ? 'bg-[#193A6F] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Constant
              </button>
              <button
                type="button"
                onClick={() => update('isBeamVariable', true)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  value.isBeamVariable ? 'bg-[#F98125] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Variable (Haunched)
              </button>
            </div>
          </div>

          {value.isBeamVariable ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Count" value={value.beamCount} onChange={(v) => update('beamCount', v)} unit="pcs" />
                <Field label="Span Length" value={value.beamLength} onChange={(v) => update('beamLength', v)} unit="m" placeholder="4.00" />
                <Field label="Start Width (W₁)" value={value.beamWidthStart || value.beamWidth} onChange={(v) => update('beamWidthStart', v)} unit="m" placeholder="0.25" />
                <Field label="Start Depth (D₁)" value={value.beamDepthStart || value.beamDepth} onChange={(v) => update('beamDepthStart', v)} unit="m" placeholder="0.50" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                <Field label="End Width (W₂)" value={value.beamWidthEnd || value.beamWidthStart || value.beamWidth} onChange={(v) => update('beamWidthEnd', v)} unit="m" placeholder="0.20" />
                <Field label="End Depth (D₂)" value={value.beamDepthEnd || value.beamDepthStart || value.beamDepth} onChange={(v) => update('beamDepthEnd', v)} unit="m" placeholder="0.35" />
              </div>
              <p className="text-[0.68rem] text-slate-500 font-mono">
                Volumetric frustum formula: V = (L/3) × (A₁ + A₂ + √(A₁A₂))
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
              <Field label="Count" value={value.beamCount} onChange={(v) => update('beamCount', v)} unit="pcs" />
              <Field label="Span Length" value={value.beamLength} onChange={(v) => update('beamLength', v)} unit="m" placeholder="4.00" />
              <Field label="Width" value={value.beamWidth} onChange={(v) => update('beamWidth', v)} unit="m" placeholder="0.20" />
              <Field label="Depth" value={value.beamDepth} onChange={(v) => update('beamDepth', v)} unit="m" placeholder="0.35" />
            </div>
          )}
        </Card>

        <Card>
          <Heading eyebrow="Geometry · Foundation" title="Isolated Footings" description="Uniform footing pads concrete volume." />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <Field label="Count" value={value.footingCount} onChange={(v) => update('footingCount', v)} unit="pcs" />
            <Field label="Length" value={value.footingLength} onChange={(v) => update('footingLength', v)} unit="m" />
            <Field label="Width" value={value.footingWidth} onChange={(v) => update('footingWidth', v)} unit="m" />
            <Field label="Thickness" value={value.footingThickness} onChange={(v) => update('footingThickness', v)} unit="m" />
          </div>
        </Card>

        <Card>
          <Heading eyebrow="Mix & Reinforcement" title="Concrete Mix & Rebar Ratios" description="Commercial mix proportions and procurement bag size." />
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Concrete Mix Class</span>
              <select
                value={value.mixClass}
                onChange={(e) => update('mixClass', e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-base sm:text-xs font-medium text-slate-900 outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20"
              >
                {Object.entries(MIXES).map(([key, mix]) => (
                  <option key={key} value={key}>
                    {mix.label} · {mix.ratio} ({mix.bags40} bags/m³)
                  </option>
                ))}
              </select>
            </label>

            <Field label="Concrete Wastage" value={value.wastage} onChange={(v) => update('wastage', v)} unit="%" />
            <Field label="Rebar Allowance Ratio" value={value.rebarRatio} onChange={(v) => update('rebarRatio', v)} unit="kg/m³" help="Budget default: 80 kg per m³." />

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Cement Bag Size</span>
              <div className="grid h-11 grid-cols-2 rounded-xl bg-slate-100 p-1">
                {[40, 50].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => update('bagSize', size)}
                    className={`rounded-lg font-mono text-xs font-bold transition ${
                      Number(value.bagSize) === size ? 'bg-[#193A6F] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {size} kg
                  </button>
                ))}
              </div>
            </label>
          </div>
        </Card>
      </div>

      {/* Live Results Panel */}
      <div className="space-y-6 xl:sticky xl:top-36">
        <Card>
          <Heading
            eyebrow="Structural Takeoff"
            title="Procurement Quantities"
            description={`${MIXES[value.mixClass]?.label || 'Class A'} · ${MIXES[value.mixClass]?.ratio || '1:2:4'}`}
          />
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Slab Volume" value={number.format(result.slab)} unit="m³" />
            <Metric label="Columns Volume" value={number.format(result.columns)} unit="m³" />
            <Metric label="Beams Volume" value={number.format(result.beams || 0)} unit="m³" />
            <Metric label="Footings Volume" value={number.format(result.footings)} unit="m³" />
            <Metric label="Gross Concrete" value={number.format(result.gross)} unit="m³" accent />
            <Metric label="Cement to Order" value={integer.format(result.bags)} unit={`${value.bagSize}kg bags`} accent />
            <Metric label="Rebar Steel" value={number.format(result.rebar)} unit="kg" accent />
            <Metric label="Sand Volume" value={number.format(result.sand)} unit="m³" />
            <Metric label="Gravel 3/4" value={number.format(result.gravel)} unit="m³" />
          </div>
        </Card>

        <LaborCrewCard result={result} wages={wages} />
      </div>
    </div>
  )
}

/* 3. MASONRY TAB */
function MasonryTab({ value, update, result, wages }) {
  const is6Inch = String(value.chbSize) === '6'

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
      <div className="space-y-6">
        <Card>
          <Heading
            eyebrow="Block Specification"
            title="CHB Thickness & Application"
            description="NSCP / Philippine Building Code standards for interior partitions vs exterior perimeter walls."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => update('chbSize', '4')}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                !is6Inch
                  ? 'border-[#F98125] bg-orange-50/60 shadow-sm ring-1 ring-[#F98125]/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                !is6Inch ? 'bg-[#F98125] text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                4"
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">4-inch (100mm) CHB</p>
                <p className="text-[0.7rem] text-slate-500">Interior partitions & non-loadbearing room dividers</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => update('chbSize', '6')}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                is6Inch
                  ? 'border-[#F98125] bg-orange-50/60 shadow-sm ring-1 ring-[#F98125]/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                is6Inch ? 'bg-[#F98125] text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                6"
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">6-inch (150mm) CHB</p>
                <p className="text-[0.7rem] text-slate-500">Exterior perimeter, firewalls & load-bearing masonry</p>
              </div>
            </button>
          </div>
        </Card>

        <Card>
          <Heading
            eyebrow="Geometry · Walls"
            title="CHB Wall Footprint"
            description="Openings are deducted before block, mortar, plaster, and labor calculations."
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2">
            <Field label="Total Wall Length" value={value.wallLength} onChange={(v) => update('wallLength', v)} unit="m" />
            <Field label="Wall Height" value={value.wallHeight} onChange={(v) => update('wallHeight', v)} unit="m" />
            <Field label="Door & Window Deductions" value={value.openingsArea} onChange={(v) => update('openingsArea', v)} unit="m²" />
            <Field label="CHB Wastage Allowance" value={value.wastage} onChange={(v) => update('wastage', v)} unit="%" />
          </div>
        </Card>

        <Card>
          <Heading
            eyebrow="Finishes · Plaster"
            title="Plaster Surface & Thickness"
            description="Laying mortar and wall plaster use a standard 1:3 cement-sand budgeting mix."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Plastered Faces</span>
              <div className="grid h-11 grid-cols-2 rounded-xl bg-slate-100 p-1">
                {[1, 2].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update('plasterSides', s)}
                    className={`rounded-lg text-xs font-bold transition ${
                      Number(value.plasterSides) === s ? 'bg-[#193A6F] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s} face{s > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </label>

            <Field label="Plaster Thickness" value={value.plasterThickness} onChange={(v) => update('plasterThickness', v)} unit="mm" />
          </div>
        </Card>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs leading-relaxed text-[#193A6F]">
          <p className="flex items-start gap-2">
            <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-[#2C599D]" />
            <span>
              <strong>Philippine Standard CHB (NSCP 707):</strong> Factors 12.5 blocks/m², 10mm Ø steel rebar dowels (@ 0.60m) and horizontal bars (every 3 layers), core cell grout fill, and 1:3 mortar with 5% default wastage.
            </span>
          </p>
        </div>
      </div>

      {/* Live Results Panel */}
      <div className="space-y-6 xl:sticky xl:top-36">
        <Card>
          <Heading eyebrow="Masonry Takeoff" title="Block, Rebar & Mortar" />
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Net Wall Area" value={number.format(result.area)} unit="m²" />
            <Metric label={is6Inch ? '6" CHB Blocks' : '4" CHB Blocks'} value={integer.format(result.blocks)} unit="pieces" accent />
            <Metric label="10mm Ø Rebar (6m)" value={integer.format(result.rebarBars || 0)} unit="commercial bars" accent />
            <Metric label="#16 Tie Wire" value={number.format(result.tieWireKg || 0)} unit="kg" />
            <Metric label="Cement to Order" value={integer.format(result.cementBags)} unit="40kg bags" accent />
            <Metric label="Washed Sand" value={number.format(result.sand)} unit="m³" />
          </div>
        </Card>

        <LaborCrewCard result={result} wages={wages} />
      </div>
    </div>
  )
}

/* 4. FINISHES TAB */
function FinishesTab({ value, update, result, wages }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
      <div className="space-y-6">
        <Card>
          <Heading
            eyebrow="Flooring · Tiles"
            title="Floor Tile Area"
            description="Tile pricing measured per square meter; includes cut & corner breakage allowances."
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2">
            <Field label="Net Floor Area" value={value.floorArea} onChange={(v) => update('floorArea', v)} unit="m²" />
            <Field label="Tile Wastage Allowance" value={value.tileWastage} onChange={(v) => update('tileWastage', v)} unit="%" />
          </div>
        </Card>

        <Card>
          <Heading
            eyebrow="Painting · Latex"
            title="Wall & Ceiling Paint Scope"
            description="Standard coverage is 10 m² per liter per coat (40 m² per 4L gallon can)."
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2">
            <Field label="Paintable Area" value={value.paintArea} onChange={(v) => update('paintArea', v)} unit="m²" />
            <Field label="Number of Coats" value={value.paintCoats} onChange={(v) => update('paintCoats', v)} unit="coats" step="1" />
          </div>
        </Card>
      </div>

      {/* Live Results Panel */}
      <div className="space-y-6 xl:sticky xl:top-36">
        <Card>
          <Heading eyebrow="Finishes Takeoff" title="Material Yields" />
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Tile Area (Procured)" value={number.format(result.tileArea)} unit="m²" accent />
            <Metric label="Paint Volume" value={number.format(result.paintLiters)} unit="liters" />
            <Metric label="Paint Cans to Order" value={integer.format(result.paintCans)} unit="4L cans" accent />
            <Metric label="Coated Coverage" value={number.format(result.paintArea * result.coats)} unit="m²-coats" />
          </div>
        </Card>

        <LaborCrewCard result={result} wages={wages} />
      </div>
    </div>
  )
}

/* 5. MASTER DATABASE TAB */
function DatabaseTab({ data, update, onFetch, fetching, isPro }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B84C4]">Project Controls</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Master Database</h1>
        <p className="mt-1 text-xs text-blue-100/70">
          Centralized price basket and DOLE wage baseline scoped to this project.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <Heading
            eyebrow="Metro Manila Market Basket"
            title="Material Unit Prices"
            description="Edit supplier quotations manually or fetch simulated regional benchmark quotes."
            action={
              <button
                type="button"
                onClick={onFetch}
                disabled={fetching}
                className="flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-[#F98125] px-3.5 text-xs font-semibold text-white shadow transition hover:bg-[#FB9B50] disabled:opacity-60"
              >
                <Icon name="refresh" className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
                {fetching ? 'Updating…' : 'Fetch Market Prices'}
              </button>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(PRICE_LABELS).map(([key, [label, unit]]) => (
              <Field
                key={key}
                label={label}
                value={data.prices[key]}
                onChange={(v) => update('prices', key, v)}
                unit={`₱ / ${unit}`}
              />
            ))}
          </div>

          <p className="mt-4 text-[0.7rem] leading-relaxed text-slate-500">
            Confirm supplier quotations, delivery hauling, VAT, and location premiums before procurement.
            {data.marketUpdated && ` (Last benchmark update: ${new Date(data.marketUpdated).toLocaleString('en-PH')})`}
          </p>
        </Card>

        <div className="xl:col-span-2">
          <PricingGrid
            prices={data.prices}
            onUpdatePrice={(k, v) => update('prices', k, v)}
            onResetAll={() => {
              const def = cloneDefaults()
              Object.keys(def.prices).forEach((k) => update('prices', k, def.prices[k]))
            }}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <Heading
              eyebrow="DOLE Regional Wage Order"
              title="Statutory Daily Wage Rates"
              description="Editable labor budgeting rates per 8-hour man-day."
              action={
                <span className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider ${
                  isPro ? 'bg-orange-100 text-[#F98125]' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isPro ? 'Unlocked' : 'DOLE Baseline'}
                </span>
              }
            />
            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Wage Order Region</span>
              <select
                value={data.wages.region}
                onChange={(e) => update('wages', 'region', e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-900 outline-none"
              >
                <option value="NCR">NCR · Metro Manila (Wage Order NCR-27)</option>
              </select>
            </label>

            <div className="space-y-3.5">
              <Field
                label="Foreman Planning Rate"
                value={data.wages.foreman}
                disabled={!isPro}
                onChange={(v) => update('wages', 'foreman', v)}
                unit="₱ / day"
              />
              <Field
                label="Skilled Mason / Tradesman"
                value={data.wages.skilled}
                disabled={!isPro}
                onChange={(v) => update('wages', 'skilled', v)}
                unit="₱ / day"
              />
              <Field
                label="Construction Helper (Statutory Min)"
                value={data.wages.helper}
                disabled={!isPro}
                onChange={(v) => update('wages', 'helper', v)}
                unit="₱ / day"
              />
            </div>

            {!isPro && (
              <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50/80 p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F98125]">Custom DOLE Wage Rates</span>
                  <Link to="/pricing" className="text-[0.7rem] font-bold text-[#F98125] underline hover:text-[#FB9B50]">
                    Upgrade to Pro →
                  </Link>
                </div>
                <p className="mt-1 text-[0.7rem] leading-relaxed text-slate-600">
                  Daily wage customization is a Pro Contractor capability. Free tier computes with statutory DOLE NCR-27 baseline (₱755/day).
                </p>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-[0.7rem] leading-relaxed text-[#193A6F]">
              <strong>DOLE NCR-27 Reference:</strong> ₱755/day non-agricultural statutory minimum effective July 2026. Foreman and skilled rates incorporate trade skill allowances.
            </div>
          </Card>

          <Card>
            <Heading eyebrow="Empirical Constants" title="Productivity Library" />
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                Structural: {PRODUCTIVITY.structural.skilledPerM3} skilled + {PRODUCTIVITY.structural.helperPerM3} helper days/m³
              </li>
              <li>Masonry CHB Laying: {PRODUCTIVITY.masonry.chbM2PerDay} m² / mason-day</li>
              <li>Plastering: {PRODUCTIVITY.masonry.plasterM2PerDay} m² / mason-day</li>
              <li>Tile Setting: {PRODUCTIVITY.finishes.tileM2PerDay} m² / day</li>
              <li>Wall Painting: {PRODUCTIVITY.finishes.paintM2PerDay} m²-coats / day</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

function LaborCrewCard({ result, wages }) {
  const rows = [
    ['Foreman / Supervision', result.foremanDays, wages.foreman],
    ['Skilled Mason / Tradesman', result.skilledDays, wages.skilled],
    ['Construction Helper', result.helperDays, wages.helper],
  ]

  const totalLabor = rows.reduce((sum, [, days, rate]) => sum + days * num(rate), 0)

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <Heading eyebrow="Labor Allowance" title="Calculated Man-Days" />
        <span className="font-mono text-xs font-bold text-[#F98125]">{money.format(totalLabor)}</span>
      </div>
      <div className="space-y-2.5">
        {rows.map(([label, days, rate]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5">
            <div>
              <p className="text-xs font-semibold text-slate-800">{label}</p>
              <p className="font-mono text-[0.65rem] text-slate-500">
                {number.format(days)} days × {money.format(num(rate))}
              </p>
            </div>
            <strong className="font-mono text-xs font-bold text-slate-900">
              {money.format(days * num(rate))}
            </strong>
          </div>
        ))}
      </div>
    </Card>
  )
}

function FormworkCuttingDiagram({ value }) {
  const l = Math.max(0.01, Number.parseFloat(value?.length) || 0.40)
  const w = Math.max(0.01, Number.parseFloat(value?.width) || 0.40)
  const h = Math.max(0.01, Number.parseFloat(value?.heightDepth) || 3.00)
  const elemType = value?.elementType || 'column'

  // Standard 4x8 Panel in meters
  const SHEET_W = 1.22
  const SHEET_L = 2.44
  const sheetArea = SHEET_W * SHEET_L // 2.977 m²

  const layout = useMemo(() => {
    let cuts = []
    let desc = ''
    let title = ''

    if (elemType === 'column') {
      title = `Column Formwork: 4 Faces (${l.toFixed(2)}m × ${w.toFixed(2)}m × ${h.toFixed(2)}m)`
      desc = `Strips ripped along the 2.44m grain to resist hydrostatic concrete lateral pressure.`

      // Pack alternating face strips across 1.22m sheet width
      const targetWidths = [l, w, l, w]
      let curX = 0
      for (let i = 0; i < targetWidths.length; i++) {
        const width = targetWidths[i]
        if (curX + width <= SHEET_W + 0.005) {
          cuts.push({
            id: `face-${i + 1}`,
            label: `Face ${i % 2 === 0 ? 'A' : 'B'}`,
            sublabel: `${width.toFixed(2)}m × 2.44m`,
            width,
            length: SHEET_L,
            x: curX,
            y: 0,
            type: 'cut',
            color: i % 2 === 0 ? '#F98125' : '#FB923C',
          })
          curX += width
        }
      }

      // If more fit
      while (curX + Math.min(l, w) <= SHEET_W + 0.005) {
        const width = curX + l <= SHEET_W + 0.005 ? l : w
        cuts.push({
          id: `face-extra-${cuts.length + 1}`,
          label: `Face (Extra)`,
          sublabel: `${width.toFixed(2)}m × 2.44m`,
          width,
          length: SHEET_L,
          x: curX,
          y: 0,
          type: 'cut',
          color: '#F98125',
        })
        curX += width
      }

      const offcut = Math.max(0, SHEET_W - curX)
      if (offcut > 0.005) {
        cuts.push({
          id: 'offcut',
          label: 'Offcut / Kerf',
          sublabel: `${offcut.toFixed(2)}m × 2.44m`,
          width: offcut,
          length: SHEET_L,
          x: curX,
          y: 0,
          type: 'offcut',
          color: '#64748B',
        })
      }
    } else if (elemType === 'beam') {
      title = `Beam Formwork: Soffit (${w.toFixed(2)}m) & 2 Sides (${h.toFixed(2)}m depth)`
      desc = `2 vertical sides and soffit form ripped across the 1.22m panel width.`

      let curX = 0
      // Side 1
      if (curX + h <= SHEET_W) {
        cuts.push({
          id: 'side-1',
          label: 'Beam Side 1',
          sublabel: `${h.toFixed(2)}m × 2.44m`,
          width: h,
          length: SHEET_L,
          x: curX,
          y: 0,
          type: 'cut',
          color: '#F98125',
        })
        curX += h
      }
      // Side 2
      if (curX + h <= SHEET_W) {
        cuts.push({
          id: 'side-2',
          label: 'Beam Side 2',
          sublabel: `${h.toFixed(2)}m × 2.44m`,
          width: h,
          length: SHEET_L,
          x: curX,
          y: 0,
          type: 'cut',
          color: '#FB923C',
        })
        curX += h
      }
      // Soffit
      if (curX + w <= SHEET_W) {
        cuts.push({
          id: 'soffit',
          label: 'Beam Soffit',
          sublabel: `${w.toFixed(2)}m × 2.44m`,
          width: w,
          length: SHEET_L,
          x: curX,
          y: 0,
          type: 'cut',
          color: '#2C599D',
        })
        curX += w
      }

      const offcut = Math.max(0, SHEET_W - curX)
      if (offcut > 0.005) {
        cuts.push({
          id: 'offcut',
          label: 'Offcut / Kerf',
          sublabel: `${offcut.toFixed(2)}m × 2.44m`,
          width: offcut,
          length: SHEET_L,
          x: curX,
          y: 0,
          type: 'offcut',
          color: '#64748B',
        })
      }
    } else if (elemType === 'slab') {
      title = `Floor Slab Formwork: Modular 1.22m × 2.44m Panels`
      desc = `Full sheets arranged in running bond layout with minimal edge trimmings.`
      cuts = [
        {
          id: 'slab-sheet',
          label: 'Full Modular Panel',
          sublabel: '1.22m × 2.44m (Standard 4x8)',
          width: SHEET_W,
          length: SHEET_L,
          x: 0,
          y: 0,
          type: 'cut',
          color: '#F98125',
        },
      ]
    } else {
      // Footing
      title = `Footing Perimeter Formwork: 4 Sides (Depth = ${h.toFixed(2)}m)`
      desc = `Lateral side forms ripped from 4x8 sheet.`
      let curX = 0
      const count = Math.max(1, Math.floor(SHEET_W / h))
      for (let i = 0; i < count; i++) {
        cuts.push({
          id: `footing-side-${i + 1}`,
          label: `Side Form ${i + 1}`,
          sublabel: `${h.toFixed(2)}m × 2.44m`,
          width: h,
          length: SHEET_L,
          x: curX,
          y: 0,
          type: 'cut',
          color: i % 2 === 0 ? '#F98125' : '#FB923C',
        })
        curX += h
      }
      const offcut = Math.max(0, SHEET_W - curX)
      if (offcut > 0.005) {
        cuts.push({
          id: 'offcut',
          label: 'Offcut / Kerf',
          sublabel: `${offcut.toFixed(2)}m × 2.44m`,
          width: offcut,
          length: SHEET_L,
          x: curX,
          y: 0,
          type: 'offcut',
          color: '#64748B',
        })
      }
    }

    const usedArea = cuts
      .filter((c) => c.type === 'cut')
      .reduce((acc, c) => acc + c.width * c.length, 0)
    const utilization = Math.min(100, Math.max(0, (usedArea / sheetArea) * 100))
    const offcutPct = Math.max(0, 100 - utilization)

    const needsSplice = h > 2.44 && (elemType === 'column' || elemType === 'beam')
    const spliceHeight = needsSplice ? (h - 2.44).toFixed(2) : 0

    return {
      title,
      desc,
      cuts,
      utilization: utilization.toFixed(1),
      offcutPct: offcutPct.toFixed(1),
      needsSplice,
      spliceHeight,
    }
  }, [elemType, l, w, h])

  // Canvas dimensions for SVG (exact 2:1 proportional 4x8 panel)
  const padX = 55
  const padY = 40
  const sheetDrawL = 500 // 2.44m length (horizontal)
  const sheetDrawW = 250 // 1.22m width (vertical)
  const svgWidth = sheetDrawL + 2 * padX + 25 // 635
  const svgHeight = sheetDrawW + 2 * padY // 330

  return (
    <Card className="overflow-hidden border-[#2C599D]/40 shadow-xl">
      <Heading
        eyebrow="2D Optimization & Nesting Pattern"
        title="Formwork Sheet Cutting Layout (1.22m × 2.44m / 4'×8')"
        description={layout.desc}
      />

      {/* SVG Cutting Pattern Diagram */}
      <div className="relative rounded-2xl border border-[#2C599D]/50 bg-[#07132F] p-4 text-white overflow-hidden shadow-inner">
        {/* Grain Direction Banner */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#2C599D]/60 pb-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded bg-[#F98125] text-[0.65rem] font-bold text-white">
              4×8
            </span>
            <span className="font-semibold text-white">{layout.title}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[0.68rem] text-blue-200">
            <span>⟷ Grain Direction:</span>
            <span className="font-bold text-[#F98125]">2.44m (Longitudinal)</span>
          </div>
        </div>

        {/* Scaled SVG Blueprint Viewport */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full min-w-[540px] h-auto select-none"
          >
            <defs>
              <pattern
                id="offcutHatch"
                width="12"
                height="12"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="12" stroke="#475569" strokeWidth="2.5" />
              </pattern>

              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#7CA3E2" />
              </marker>
            </defs>

            {/* Top Dimension Leader: 2.44m */}
            <line x1={padX} y1={20} x2={padX + sheetDrawL} y2={20} stroke="#7CA3E2" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
            <text x={padX + sheetDrawL / 2} y={15} fill="#7CA3E2" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              2.44 m (8'-0" Standard Panel Length)
            </text>

            {/* Left Dimension Leader: 1.22m */}
            <line x1={22} y1={padY} x2={22} y2={padY + sheetDrawW} stroke="#7CA3E2" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
            <text
              x={-(padY + sheetDrawW / 2)}
              y={15}
              transform="rotate(-90)"
              fill="#7CA3E2"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              1.22 m (4'-0" Width)
            </text>

            {/* Plywood Sheet Outer Outline */}
            <rect
              x={padX}
              y={padY}
              width={sheetDrawL}
              height={sheetDrawW}
              fill="#0F2447"
              stroke="#5B84C4"
              strokeWidth="2"
              rx="4"
            />

            {/* Render Cut Pieces */}
            {layout.cuts.map((cut) => {
              const cutPixelH = (cut.width / SHEET_W) * sheetDrawW
              const cutPixelY = padY + (cut.x / SHEET_W) * sheetDrawW
              const cutPixelW = (cut.length / SHEET_L) * sheetDrawL
              const cutPixelX = padX + (cut.y / SHEET_L) * sheetDrawL
              const isOffcut = cut.type === 'offcut'

              return (
                <g key={cut.id}>
                  {/* Cut Piece Shape */}
                  <rect
                    x={cutPixelX}
                    y={cutPixelY}
                    width={cutPixelW}
                    height={cutPixelH}
                    fill={isOffcut ? 'url(#offcutHatch)' : cut.color}
                    fillOpacity={isOffcut ? 0.9 : 0.85}
                    stroke={isOffcut ? '#94A3B8' : '#FFFFFF'}
                    strokeWidth="1.5"
                    strokeDasharray={isOffcut ? '4 3' : 'none'}
                    rx="2"
                  />

                  {/* Cut Dimension Line on Right Edge */}
                  <line
                    x1={cutPixelX + cutPixelW + 6}
                    y1={cutPixelY + 2}
                    x2={cutPixelX + cutPixelW + 6}
                    y2={cutPixelY + cutPixelH - 2}
                    stroke="#F98125"
                    strokeWidth="1.2"
                  />
                  <text
                    x={cutPixelX + cutPixelW + 12}
                    y={cutPixelY + cutPixelH / 2 + 3}
                    fill="#FDBA74"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {cut.width.toFixed(2)}m
                  </text>

                  {/* Label in Center */}
                  {cutPixelH > 24 && (
                    <text
                      x={cutPixelX + cutPixelW / 2}
                      y={cutPixelY + cutPixelH / 2 - 2}
                      fill="#FFFFFF"
                      fontSize={cutPixelH < 35 ? '10' : '12'}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {cut.label}
                    </text>
                  )}
                  {cutPixelH > 40 && (
                    <text
                      x={cutPixelX + cutPixelW / 2}
                      y={cutPixelY + cutPixelH / 2 + 13}
                      fill={isOffcut ? '#CBD5E1' : '#FED7AA'}
                      fontSize="9.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {cut.sublabel}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Legend & Utilization Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-[#2C599D]/60 pt-3">
          <div className="rounded-xl bg-[#11224D]/80 p-2.5 border border-[#2C599D]/60 text-center">
            <span className="block text-[0.62rem] font-bold uppercase text-[#7CA3E2]">Sheet Utilization</span>
            <span className="font-mono text-base font-extrabold text-emerald-400">
              {layout.utilization}%
            </span>
          </div>

          <div className="rounded-xl bg-[#11224D]/80 p-2.5 border border-[#2C599D]/60 text-center">
            <span className="block text-[0.62rem] font-bold uppercase text-[#7CA3E2]">Offcut / Kerf</span>
            <span className="font-mono text-base font-extrabold text-[#F98125]">
              {layout.offcutPct}%
            </span>
          </div>

          <div className="rounded-xl bg-[#11224D]/80 p-2.5 border border-[#2C599D]/60 text-center">
            <span className="block text-[0.62rem] font-bold uppercase text-[#7CA3E2]">Standard Plywood</span>
            <span className="font-mono text-xs font-bold text-white mt-0.5 block">
              1.22m × 2.44m (4'×8')
            </span>
          </div>

          <div className="rounded-xl bg-[#11224D]/80 p-2.5 border border-[#2C599D]/60 text-center">
            <span className="block text-[0.62rem] font-bold uppercase text-[#7CA3E2]">Cut Yield</span>
            <span className="font-mono text-xs font-bold text-white mt-0.5 block">
              {layout.cuts.filter((c) => c.type === 'cut').length} Pieces / Panel
            </span>
          </div>
        </div>

        {/* Splice Notice (if height > 2.44m) */}
        {layout.needsSplice && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-200">
            <span className="text-amber-400 font-bold shrink-0">⚠️</span>
            <p className="leading-snug">
              <strong>Height Extension Required:</strong> Element height ({h.toFixed(2)}m) exceeds standard 2.44m panel length. A <strong>+{layout.spliceHeight}m</strong> top splice extension with 2x3 backing cleats is factored into framing takeoff.
            </p>
          </div>
        )}

        {/* Philippine Site Practice Note */}
        <div className="mt-3 rounded-xl border border-[#2C599D]/50 bg-[#0F2447]/60 p-2.5 text-[0.7rem] text-[#7CA3E2] leading-relaxed">
          💡 <strong className="text-white">Philippine Carpentry Standard:</strong> Offcut strips under 300mm are conserved on-site for column yokes, kicker blocks, and chamfer fillets to achieve near-zero material waste.
        </div>
      </div>
    </Card>
  )
}

/* 3. FORMWORK & SHORING TAB */
function FormworkTab({ value, update, result, wages }) {
  const contactArea = result?.area || 0
  const sheets = result?.sheets || 0
  const bdft = result?.bdft || 0
  const nailsKg = result?.nailsKg || 0

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
        <div className="space-y-6">
          <Card>
            <Heading
              eyebrow="Formwork & Falsework"
              title="Structural Member Formwork"
              description="Contact area and 4x8 ft plywood sheet demand."
            />
            <div className="mb-4">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Structural Element Type</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { id: 'column', label: 'Column' },
                  { id: 'beam', label: 'Beam / Girder' },
                  { id: 'slab', label: 'Floor Slab' },
                  { id: 'footing', label: 'Footing' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => update('elementType', t.id)}
                    className={`rounded-xl border p-2 text-xs font-bold transition ${
                      value.elementType === t.id
                        ? 'border-[#F98125] bg-orange-50 text-[#F98125]'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Profile Toggle (Columns & Beams) */}
            {(value.elementType === 'column' || value.elementType === 'beam') && (
              <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-100 p-2 text-xs">
                <span className="font-semibold text-slate-700">Member Section Geometry:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => update('isVariable', false)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      !value.isVariable ? 'bg-[#193A6F] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Constant
                  </button>
                  <button
                    type="button"
                    onClick={() => update('isVariable', true)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      value.isVariable ? 'bg-[#F98125] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Variable (Trapezoidal)
                  </button>
                </div>
              </div>
            )}

            {value.isVariable && (value.elementType === 'column' || value.elementType === 'beam') ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
                  <Field
                    label={value.elementType === 'column' ? 'Height' : 'Span Length'}
                    value={value.elementType === 'column' ? value.heightDepth : value.length}
                    onChange={(v) => update(value.elementType === 'column' ? 'heightDepth' : 'length', v)}
                    unit="m"
                  />
                  <Field
                    label="Quantity"
                    value={value.quantity}
                    onChange={(v) => update('quantity', v)}
                    unit="pcs"
                  />
                  <Field
                    label="Start Width (W₁)"
                    value={value.widthStart || value.width}
                    onChange={(v) => update('widthStart', v)}
                    unit="m"
                  />
                  <Field
                    label="Start Depth (D₁)"
                    value={value.depthStart || value.length}
                    onChange={(v) => update('depthStart', v)}
                    unit="m"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                  <Field
                    label="End Width (W₂)"
                    value={value.widthEnd || value.widthStart || value.width}
                    onChange={(v) => update('widthEnd', v)}
                    unit="m"
                  />
                  <Field
                    label="End Depth (D₂)"
                    value={value.depthEnd || value.depthStart || value.length}
                    onChange={(v) => update('depthEnd', v)}
                    unit="m"
                  />
                </div>
                <p className="text-[0.68rem] text-slate-500 font-mono">
                  Trapezoidal contact area: {value.elementType === 'column' ? '(W₁ + W₂ + D₁ + D₂) × H' : '((W₁ + W₂)/2 + D₁ + D₂) × L'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
                <Field
                  label={value.elementType === 'column' ? 'Side A' : 'Length'}
                  value={value.length}
                  onChange={(v) => update('length', v)}
                  unit="m"
                />
                <Field
                  label={value.elementType === 'column' ? 'Side B' : 'Width'}
                  value={value.width}
                  onChange={(v) => update('width', v)}
                  unit="m"
                />
                <Field
                  label={value.elementType === 'column' ? 'Height' : value.elementType === 'slab' ? 'Thickness' : 'Depth'}
                  value={value.heightDepth}
                  onChange={(v) => update('heightDepth', v)}
                  unit="m"
                />
                <Field
                  label="Quantity"
                  value={value.quantity}
                  onChange={(v) => update('quantity', v)}
                  unit="pcs"
                />
              </div>
            )}
          </Card>

          <Card>
            <Heading
              eyebrow="Materials & Framing"
              title="Plywood Specs & Framing Lumber"
              description="Lumber stiffeners, studs, wales, and cutting waste margin."
            />
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">Plywood Thickness</span>
                <select
                  value={value.plywoodChoice}
                  onChange={(e) => update('plywoodChoice', e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#F98125]"
                >
                  <option value="phenolic_18">18mm (3/4") Phenolic Board</option>
                  <option value="phenolic_12">12mm (1/2") Phenolic Board</option>
                  <option value="marine_18">18mm (3/4") Marine Plywood</option>
                  <option value="marine_12">12mm (1/2") Marine Plywood</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">Framing Lumber Size</span>
                <select
                  value={value.lumberChoice}
                  onChange={(e) => update('lumberChoice', e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#F98125]"
                >
                  <option value="2x2">2" × 2" Good Lumber</option>
                  <option value="2x3">2" × 3" Good Lumber</option>
                  <option value="2x4">2" × 4" Good Lumber</option>
                </select>
              </label>

              <Field
                label="Cutting Waste Allowance"
                value={value.wastePercent}
                onChange={(v) => update('wastePercent', v)}
                unit="%"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-orange-200 bg-orange-50/40">
            <Heading eyebrow="Formwork Output" title="Takeoff Results" />
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Contact Surface Area" value={`${number.format(contactArea)} m²`} accent icon="cube" />
              <Metric label="4' × 8' Plywood Sheets" value={`${integer.format(sheets)} pcs`} icon="structure" />
              <Metric label="Framing Lumber Volume" value={`${integer.format(bdft)} bd.ft`} icon="structure" />
              <Metric label="Common Wire Nails" value={`${integer.format(nailsKg)} kg`} icon="structure" />
            </div>
            <div className="mt-4 rounded-xl border border-orange-200 bg-white p-3 text-xs text-slate-600 leading-relaxed">
              Standard 1.22m × 2.44m (4x8) panel covers 2.977 m². Lumber includes studs @ 0.30m, wales, and diagonal shores.
            </div>
          </Card>

          {result?.items && result.items.length > 0 && (
            <LaborCrewCard
              result={{
                foremanDays: contactArea * 0.02,
                skilledDays: contactArea * 0.12,
                helperDays: contactArea * 0.12,
              }}
              wages={wages}
            />
          )}
        </div>
      </div>

      {/* 2D Sheet Cutting Pattern & Nesting Visualizer */}
      <FormworkCuttingDiagram value={value} />
    </div>
  )
}

/* 4. REBAR CUTTING OPTIMIZER TAB */
function RebarTab({ value, update, result, wages }) {
  const cuts = Array.isArray(value?.cuts) ? value.cuts : []
  const dia = num(value?.diameter || 16)
  const totalWeightKg = result?.totalWeightKg || 0
  const stockBars = result?.stockBars || 0
  const tieWireKg = result?.tieWireKg || 0

  const addCut = () => {
    update('cuts', [
      ...cuts,
      { id: Date.now().toString(), mark: `Cut ${cuts.length + 1}`, length: '2.50', count: '10' },
    ])
  }

  const removeCut = (id) => {
    update('cuts', cuts.filter((c) => c.id !== id))
  }

  const updateCut = (id, field, val) => {
    update('cuts', cuts.map((c) => (c.id === id ? { ...c, [field]: val } : c)))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
      <div className="space-y-6">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <Heading
              eyebrow="Reinforcing Steel"
              title="Rebar Bar-Bending & Cuts"
              description="1D cutting stock optimizer minimizing scrap offcuts."
            />
            <button
              type="button"
              onClick={addCut}
              className="rounded-xl bg-[#F98125] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#FB9B50]"
            >
              + Add Cut Length
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Bar Diameter (mm)</span>
              <select
                value={value.diameter}
                onChange={(e) => update('diameter', e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#F98125]"
              >
                {[10, 12, 16, 20, 25, 28, 32].map((d) => (
                  <option key={d} value={d}>
                    {d}mm Ø Deformed Bar ({((d * d) / 162).toFixed(3)} kg/m)
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Commercial Stock Bar Length</span>
              <select
                value={value.stockChoice}
                onChange={(e) => update('stockChoice', e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#F98125]"
              >
                <option value="optimal">Optimal Multi-Stock (6m, 9m, 12m)</option>
                <option value="6.0">Standard 6.0m Commercial Bars</option>
                <option value="9.0">Extended 9.0m Commercial Bars</option>
                <option value="12.0">Full 12.0m Commercial Bars</option>
              </select>
            </label>
          </div>

          {/* Cuts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-2">Element Mark</th>
                  <th className="pb-2">Cut Length (m)</th>
                  <th className="pb-2">Quantity</th>
                  <th className="pb-2 text-right">Subtotal</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cuts.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2">
                      <input
                        type="text"
                        value={c.mark}
                        onChange={(e) => updateCut(c.id, 'mark', e.target.value)}
                        className="w-full bg-slate-50 border rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:border-[#F98125]"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        step="0.05"
                        value={c.length}
                        onChange={(e) => updateCut(c.id, 'length', e.target.value)}
                        className="w-20 bg-slate-50 border rounded-lg px-2 py-1 font-mono text-slate-800 focus:outline-none focus:border-[#F98125]"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        step="1"
                        value={c.count}
                        onChange={(e) => updateCut(c.id, 'count', e.target.value)}
                        className="w-16 bg-slate-50 border rounded-lg px-2 py-1 font-mono text-slate-800 focus:outline-none focus:border-[#F98125]"
                      />
                    </td>
                    <td className="py-2 text-right font-mono font-bold text-slate-800">
                      {(num(c.length) * num(c.count)).toFixed(2)} m
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeCut(c.id)}
                        className="text-red-500 hover:text-red-700 font-bold px-1"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-orange-200 bg-orange-50/40">
          <Heading eyebrow="1D Optimization Output" title="Steel Procurement Takeoff" />
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Total Steel Weight" value={`${number.format(totalWeightKg)} kg`} accent icon="peso" />
            <Metric label="6.0m Commercial Bars" value={`${integer.format(stockBars)} pcs`} icon="structure" />
            <Metric label="#16 G.I. Tie Wire" value={`${integer.format(tieWireKg)} kg`} icon="structure" />
            <Metric label="Equivalent Tonnage" value={`${(totalWeightKg / 1000).toFixed(2)} MT`} icon="structure" />
          </div>
          <div className="mt-4 rounded-xl border border-orange-200 bg-white p-3 text-xs text-slate-600 leading-relaxed">
            Standard Philippine rebar unit weight: {dia}mm Ø = {((dia * dia) / 162).toFixed(3)} kg/m. Cuts packed with First-Fit Decreasing algorithm.
          </div>
        </Card>

        {totalWeightKg > 0 && (
          <LaborCrewCard
            result={{
              foremanDays: totalWeightKg * 0.0005,
              skilledDays: totalWeightKg * 0.003,
              helperDays: totalWeightKg * 0.003,
            }}
            wages={wages}
          />
        )}
      </div>
    </div>
  )
}

/* 5. ROOFING & SHEETING TAB */
function RoofingTab({ value, update, result, wages }) {
  const trueArea = result?.trueArea || 0
  const sheets = result?.sheets || 0
  const tekscrews = result?.tekscrews || 0
  const ridgeRollPcs = result?.ridgeRollPcs || 0

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
      <div className="space-y-6">
        <Card>
          <Heading
            eyebrow="Roofing Geometry"
            title="Building Envelope & Overhang"
            description="Flat footprint dimensions before pitch multiplier."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <Field label="Building Length" value={value.length} onChange={(v) => update('length', v)} unit="m" />
            <Field label="Building Width" value={value.width} onChange={(v) => update('width', v)} unit="m" />
            <Field label="Eaves / Overhang" value={value.overhang} onChange={(v) => update('overhang', v)} unit="m" placeholder="0.80" />
          </div>
        </Card>

        <Card>
          <Heading
            eyebrow="Roof Specs & Materials"
            title="Roof Pitch & Sheeting Profile"
            description="Standard Philippine Corrugated and Rib-Type sheet profiles."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Roof Pitch / Slope</span>
              <select
                value={value.pitch}
                onChange={(e) => update('pitch', e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#F98125]"
              >
                <option value="flat">Flat Roof (0° · 1.000x)</option>
                <option value="1/4">1/4 Pitch (14.0° · 1.031x)</option>
                <option value="1/3">1/3 Pitch (18.4° · 1.054x)</option>
                <option value="1/2">1/2 Pitch (26.6° · 1.118x)</option>
                <option value="custom">Custom Degree Angle (°)</option>
              </select>
            </label>

            {value.pitch === 'custom' ? (
              <Field
                label="Custom Slope Angle"
                value={value.customAngle}
                onChange={(v) => update('customAngle', v)}
                unit="degrees (°)"
                placeholder="25"
                help={`Slope factor: ~${(result?.multiplier || 1.0).toFixed(3)}x`}
              />
            ) : (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">Sheeting Profile</span>
                <select
                  value={value.material}
                  onChange={(e) => update('material', e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#F98125]"
                >
                  <option value="corrugated">Corrugated G.I. Sheet (0.70m eff. width)</option>
                  <option value="rib">Rib-Type Prepainted Sheet (1.00m eff. width)</option>
                </select>
              </label>
            )}
          </div>

          {value.pitch === 'custom' && (
            <div className="mt-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">Sheeting Profile</span>
                <select
                  value={value.material}
                  onChange={(e) => update('material', e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#F98125]"
                >
                  <option value="corrugated">Corrugated G.I. Sheet (0.70m eff. width)</option>
                  <option value="rib">Rib-Type Prepainted Sheet (1.00m eff. width)</option>
                </select>
              </label>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-orange-200 bg-orange-50/40">
          <Heading eyebrow="Roofing Output" title="Takeoff Results" />
          <div className="grid grid-cols-2 gap-3">
            <Metric label="True 3D Roof Area" value={`${number.format(trueArea)} m²`} accent icon="home" />
            <Metric label="Roofing Sheets (pcs)" value={`${integer.format(sheets)} pcs`} icon="structure" />
            <Metric label={'2-1/2" Tekscrews'} value={`${integer.format(tekscrews)} pcs`} icon="structure" />
            <Metric label="Ridge Roll & Flashing" value={`${integer.format(ridgeRollPcs)} pcs`} icon="structure" />
          </div>
          <div className="mt-4 rounded-xl border border-orange-200 bg-white p-3 text-xs text-slate-600 leading-relaxed">
            Includes 10% end-lap allowance and side overlaps. Ridge rolls standard 2.44m (8ft) with 200mm overlap.
          </div>
        </Card>

        {trueArea > 0 && (
          <LaborCrewCard
            result={{
              foremanDays: trueArea * 0.015,
              skilledDays: trueArea * 0.08,
              helperDays: trueArea * 0.08,
            }}
            wages={wages}
          />
        )}
      </div>
    </div>
  )
}

/* 6. OFFICIAL BOQ BID PROPOSAL TAB */
function BoqTab({ project, boqData, update, onPdf, isPro, projectName, projectLocation, wages }) {
  const ocmRate = num(boqData?.ocmRate || 8)
  const profitRate = num(boqData?.profitRate || 10)
  const taxRate = num(boqData?.taxRate || 5)

  const directMaterial = project.materialCost
  const directLabor = project.laborCost
  const directCost = directMaterial + directLabor

  const ocmCost = directCost * (ocmRate / 100)
  const profitCost = directCost * (profitRate / 100)
  const taxCost = (directCost + ocmCost + profitCost) * (taxRate / 100)
  const totalBid = directCost + ocmCost + profitCost + taxCost

  // PM Gang Sizing & Crew Deployment
  const [foremanCount, setForemanCount] = useState(1)
  const [skilledCount, setSkilledCount] = useState(3)
  const [helperCount, setHelperCount] = useState(3)

  const totalSkilledDays = useMemo(() => {
    return project.labor
      .filter((it) => it.laborClass !== 'Unskilled')
      .reduce((sum, it) => sum + (it.quantity || 0), 0)
  }, [project.labor])

  const totalHelperDays = useMemo(() => {
    return project.labor
      .filter((it) => it.laborClass === 'Unskilled')
      .reduce((sum, it) => sum + (it.quantity || 0), 0)
  }, [project.labor])

  const estimatedWorkingDays = useMemo(() => {
    const activeSkilled = Math.max(1, Number(skilledCount) || 1)
    return Math.ceil(totalSkilledDays / activeSkilled)
  }, [totalSkilledDays, skilledCount])

  const calendarWeeks = (estimatedWorkingDays / 6).toFixed(1)

  const dailyGangPayroll = useMemo(() => {
    const fRate = num(wages?.foreman || 1200)
    const sRate = num(wages?.skilled || 950)
    const hRate = num(wages?.helper || 755)
    return (
      (Number(foremanCount) || 1) * fRate +
      (Number(skilledCount) || 1) * sRate +
      (Number(helperCount) || 1) * hRate
    )
  }, [foremanCount, skilledCount, helperCount, wages])

  // Phased Material Procurement Staging (BOM)
  const phasedMaterials = useMemo(() => {
    const p1 = [] // Substructure / Foundation
    const p2 = [] // Superstructure Framing
    const p3 = [] // Enclosure & Roofing
    const p4 = [] // Architectural Finishes

    project.materials.forEach((m) => {
      const mod = (m.module || '').toLowerCase()
      const it = (m.item || '').toLowerCase()
      if (mod.includes('struct') && (it.includes('footing') || it.includes('sand') || it.includes('gravel') || it.includes('cement'))) {
        p1.push(m)
      } else if (mod.includes('struct') || mod.includes('formwork') || mod.includes('rebar')) {
        p2.push(m)
      } else if (mod.includes('roof') || mod.includes('masonry')) {
        p3.push(m)
      } else {
        p4.push(m)
      }
    })

    const sumCost = (list) => list.reduce((sum, item) => sum + (item.amount || 0), 0)

    return [
      { name: 'Phase 1: Substructure & Foundation', desc: 'Footings, ground tie beams & gravel bed materials', items: p1, total: sumCost(p1) },
      { name: 'Phase 2: Superstructure Framing', desc: 'Columns, elevated beams, suspended slabs & falsework', items: p2, total: sumCost(p2) },
      { name: 'Phase 3: Enclosure & Metal Roofing', desc: 'CHB walls, masonry rebar, trusses & prepainted sheets', items: p3, total: sumCost(p3) },
      { name: 'Phase 4: Architectural Finishes', desc: 'Floor tiles, wall plaster skim-coat & multi-coat paint', items: p4, total: sumCost(p4) },
    ]
  }, [project.materials])

  // Milestone Progress Billing Schedule
  const billingMilestones = useMemo(() => {
    return [
      { milestone: 'Mobilization / Advance Payment', share: '15%', amount: totalBid * 0.15, condition: 'Upon contract execution, permit clearance & notice to proceed' },
      { milestone: 'Milestone 1: Substructure & Foundation', share: '25%', amount: totalBid * 0.25, condition: 'Footing pads, grade tie beams poured & column stub-ups complete' },
      { milestone: 'Milestone 2: Superstructure & Roof Frame', share: '25%', amount: totalBid * 0.25, condition: 'Columns, elevated beams, suspended slabs & roof sheets secured' },
      { milestone: 'Milestone 3: Masonry & Rough-ins', share: '15%', amount: totalBid * 0.15, condition: 'CHB walls erected, plaster scratch coat & conduit rough-ins' },
      { milestone: 'Milestone 4: Architectural Finishes', share: '10%', amount: totalBid * 0.10, condition: 'Floor tiles laid, finish paint & punch-list substantially complete' },
      { milestone: 'Defects Liability Retention Release', share: '10%', amount: totalBid * 0.10, condition: 'Released 60 days post-turnover upon Certificate of Final Acceptance' },
    ]
  }, [totalBid])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B84C4]">Commercial & Project Management</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Bill of Quantities &amp; Project Controls</h1>
          <p className="mt-1 text-xs text-blue-100/70">
            Configure contractor indirect markups, gang scheduling, phased BOM delivery, and client milestone billings.
          </p>
        </div>

        <button
          type="button"
          onClick={onPdf}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F98125] px-6 text-sm font-bold text-white shadow-xl shadow-orange-950/40 hover:bg-[#FB9B50] transition"
        >
          <Icon name="download" className="h-4 w-4" />
          <span>Export Client Quotation PDF</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Direct Material Cost" value={money.format(directMaterial)} icon="cube" />
        <Metric label="Direct DOLE Labor" value={money.format(directLabor)} icon="users" />
        <Metric label={`Markups (${ocmRate + profitRate + taxRate}%)`} value={money.format(ocmCost + profitCost + taxCost)} icon="info" />
        <Metric label="Total Bid Proposal Value" value={money.format(totalBid)} accent icon="peso" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <Heading
            eyebrow="Commercial Markups"
            title="Contractor's Margin & Tax"
            description="Philippine government and private bid markup allowances."
          />
          <div className="space-y-4">
            <Field
              label="Overhead, Contingencies & Misc (OCM)"
              value={boqData?.ocmRate || '8'}
              onChange={(v) => update('ocmRate', v)}
              unit="%"
              help="Standard DPWH/PRC norm: 8% to 12%."
            />
            <Field
              label="Contractor's Profit Margin"
              value={boqData?.profitRate || '10'}
              onChange={(v) => update('profitRate', v)}
              unit="%"
              help="Standard contractor margin: 8% to 15%."
            />
            <Field
              label="Government Tax / VAT"
              value={boqData?.taxRate || '5'}
              onChange={(v) => update('taxRate', v)}
              unit="%"
              help="5% final withholding or 12% standard VAT."
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <Heading
            eyebrow="Consolidated Schedule"
            title="Itemized Schedule of Values"
            description="Combined line items across Structural, Formwork, Rebar, Roofing, Masonry, and Finishes."
          />
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 text-slate-600 font-bold border-b">
                <tr>
                  <th className="p-2">Trade</th>
                  <th className="p-2">Item Description</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2">Unit</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {project.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-700">{it.module}</td>
                    <td className="p-2 text-slate-800">{it.item}</td>
                    <td className="p-2 text-right font-mono text-slate-600">{number.format(it.quantity)}</td>
                    <td className="p-2 text-slate-500">{it.unit}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">{money.format(it.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* PROJECT MANAGER OPERATIONAL CONTROLS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* PM Gang Sizing & Duration Calculator */}
        <Card>
          <Heading
            eyebrow="Project Operations"
            title="Crew Gang Sizing & Estimated Duration"
            description="Estimate construction calendar timeline based on active site crew deployment."
          />
          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Foreman"
              value={foremanCount}
              onChange={(v) => setForemanCount(v)}
              unit="pax"
              step="1"
            />
            <Field
              label="Skilled Tradesmen"
              value={skilledCount}
              onChange={(v) => setSkilledCount(v)}
              unit="pax"
              step="1"
            />
            <Field
              label="Helpers / Laborers"
              value={helperCount}
              onChange={(v) => setHelperCount(v)}
              unit="pax"
              step="1"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-100 pt-3">
            <div className="rounded-xl bg-slate-50 p-2.5 text-center">
              <span className="block text-[0.65rem] font-bold uppercase text-slate-500">Skilled Man-Days</span>
              <span className="font-mono text-base font-extrabold text-slate-900">
                {number.format(totalSkilledDays)}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5 text-center">
              <span className="block text-[0.65rem] font-bold uppercase text-slate-500">Working Days</span>
              <span className="font-mono text-base font-extrabold text-[#F98125]">
                {estimatedWorkingDays} days
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5 text-center">
              <span className="block text-[0.65rem] font-bold uppercase text-slate-500">Calendar Weeks</span>
              <span className="font-mono text-base font-extrabold text-slate-900">
                {calendarWeeks} wks
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5 text-center">
              <span className="block text-[0.65rem] font-bold uppercase text-slate-500">Daily Crew Payroll</span>
              <span className="font-mono text-xs font-extrabold text-emerald-700 block mt-1">
                {money.format(dailyGangPayroll)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[0.7rem] text-slate-500 leading-relaxed">
            💡 Calculated on a 6-day Philippine site workweek based on DOLE regional minimum wage baseline ({wages?.region || 'NCR'}).
          </p>
        </Card>

        {/* Milestone Progress Billing Schedule */}
        <Card>
          <Heading
            eyebrow="Commercial Cash Flow"
            title="Milestone Progress Billing Schedule"
            description="Standard Philippine contractual payment milestones with 10% defects liability retention."
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-2">Milestone / Deliverable</th>
                  <th className="p-2 text-center">%</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billingMilestones.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-2">
                      <p className="font-bold text-slate-800">{m.milestone}</p>
                      <p className="text-[0.65rem] text-slate-400">{m.condition}</p>
                    </td>
                    <td className="p-2 text-center font-mono font-semibold text-slate-600">{m.share}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">{money.format(m.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Phased Material Delivery Staging (BOM) */}
      <Card>
        <Heading
          eyebrow="Procurement Logistics"
          title="Phased Material Procurement Staging (BOM)"
          description="Batch material deliveries by construction phase to prevent jobsite congestion and weather spoilage."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {phasedMaterials.map((phase, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between">
              <div>
                <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[0.62rem] font-bold text-[#193A6F] uppercase">
                  Batch {idx + 1}
                </span>
                <h4 className="mt-2 text-xs font-bold text-slate-900">{phase.name}</h4>
                <p className="mt-1 text-[0.68rem] text-slate-500 leading-snug">{phase.desc}</p>
                <div className="mt-3 space-y-1.5 border-t border-slate-200 pt-2.5 max-h-36 overflow-y-auto text-[0.68rem]">
                  {phase.items.length > 0 ? (
                    phase.items.map((it, i) => (
                      <div key={i} className="flex justify-between items-center text-slate-700">
                        <span className="truncate pr-1">{it.item}</span>
                        <span className="font-mono font-bold shrink-0">{number.format(it.quantity)} {it.unit}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No scope active for this phase</span>
                  )}
                </div>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-2 flex items-center justify-between">
                <span className="text-[0.65rem] font-bold uppercase text-slate-400">Phase Total</span>
                <span className="font-mono text-xs font-bold text-slate-900">{money.format(phase.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function EditProjectModal({ project, onClose, onSave }) {
  const [name, setName] = useState(project?.name || '')
  const [location, setLocation] = useState(project?.location || '')

  function submit(e) {
    e.preventDefault()
    if (name.trim()) onSave({ name: name.trim(), location: location.trim() })
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-[#07132F]/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Edit Project Information</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Project Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-base sm:text-sm font-medium text-slate-900 outline-none focus:border-[#F98125]"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Site Location</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Quezon City, Metro Manila"
            className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-base sm:text-sm font-medium text-slate-900 outline-none focus:border-[#F98125]"
          />
        </label>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="min-h-11 flex-1 rounded-xl bg-[#F98125] text-xs font-semibold text-white shadow hover:bg-[#FB9B50]"
          >
            Save Changes
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}

function PdfUpgradeModal({ onClose, onUpgrade }) {
  const navigate = useNavigate()
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-[#07132F]/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl text-slate-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-[#F98125] shadow-inner">
              <Icon name="lock" className="h-6 w-6" />
            </span>
            <div>
              <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[0.65rem] font-bold text-amber-800 uppercase tracking-wider">
                Pro Contractor Exclusive
              </span>
              <h2 className="mt-1 text-xl font-bold text-slate-900">PDF BOQ Export Locked</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 leading-relaxed">
          <strong>Free accounts are ineligible for PDF export.</strong> The Free Starter tier is strictly scoped to interactive on-screen calculations.
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
          Upgrade to <strong>Pro Contractor</strong> to unlock official, client-ready PDF Bill of Quantities with itemized material takeoffs, custom company letterhead & logo, and DOLE labor compliance.
        </p>

        {/* Pricing Summary Box */}
        <div className="mt-4 rounded-2xl border border-orange-200/80 bg-orange-50/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Pro Contractor Plan</p>
              <p className="text-[0.7rem] text-slate-500">Starts at ₱400/mo or ₱3,500/year</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-lg font-extrabold text-[#F98125]">₱400</span>
              <span className="text-xs text-slate-500">/mo</span>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[0.7rem] font-semibold text-emerald-700">
            <Icon name="check" className="h-4 w-4" />
            <span>Instant activation · White-label PDF export unlocked immediately</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={upgrading}
            onClick={async () => {
              setUpgrading(true)
              await onUpgrade()
              setUpgrading(false)
              onClose()
            }}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#F98125] text-xs font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-[#FB9B50] disabled:opacity-60 sm:text-sm"
          >
            {upgrading ? 'Activating Pro...' : 'Upgrade Now to Pro Contractor'}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              navigate('/pricing')
            }}
            className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Compare All Features on Pricing Page →
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* MAIN PROJECT SUITE COMPONENT */
export default function ProjectSuite() {
  const { id } = useParams()
  const { isPro, upgradeToPro } = useAuth()
  const { getProject, updateProjectData, updateProject } = useProjects()
  const activeProject = getProject(id)

  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState(() => mergeWithDefaults(activeProject?.data))
  const [fetching, setFetching] = useState(false)
  const [notice, setNotice] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPdfUpgradeModal, setShowPdfUpgradeModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)

  const handleApplyPdfSpecs = (extractedSpecs) => {
    if (!extractedSpecs) return
    const col = extractedSpecs.columns?.[0]
    const beam = extractedSpecs.beams?.[0]
    const slab = extractedSpecs.slabs?.[0]
    const ftg = extractedSpecs.footings?.[0]
    const reb = extractedSpecs.rebar?.[0]

    setData((current) => ({
      ...current,
      structural: {
        ...current.structural,
        ...(col ? { columnWidth: col.width, columnDepth: col.depth, columnHeight: col.height } : {}),
        ...(beam ? { beamWidth: beam.width, beamDepth: beam.depth, beamLength: beam.length || '4.00', beamCount: '4' } : {}),
        ...(slab ? { slabThickness: slab.thickness } : {}),
        ...(ftg ? { footingLength: ftg.length, footingWidth: ftg.width, footingThickness: ftg.thickness } : {}),
      },
      formwork: {
        ...current.formwork,
        ...(col ? { length: col.width, width: col.depth, heightDepth: col.height } : {}),
      },
      rebar: {
        ...current.rebar,
        ...(reb ? { diameter: reb.diameter } : {}),
      },
    }))
    setShowPdfModal(false)
    setNotice('✓ Extracted blueprint specifications applied to current project!')
    window.setTimeout(() => setNotice(''), 3000)
  }

  // Recalculate full project figures reactively
  const project = useMemo(() => calculateProject(data), [data])

  // Sync to local project storage whenever data changes
  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    if (activeProject) {
      updateProjectData(id, data)
    }
  }, [data, id, updateProjectData])

  const update = (section, key, value) => {
    setData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }))
  }

  const moduleUpdate = (section) => (key, value) => update(section, key, value)

  async function refreshPrices() {
    setFetching(true)
    try {
      const result = await fetchMarketPrices()
      setData((current) => ({
        ...current,
        prices: {
          ...current.prices,
          ...Object.fromEntries(
            Object.entries(result)
              .filter(([k]) => k !== 'fetchedAt')
              .map(([k, v]) => [k, String(v)])
          ),
        },
        marketUpdated: result.fetchedAt,
      }))
      setNotice('Metro Manila benchmark prices updated')
      window.setTimeout(() => setNotice(''), 2500)
    } finally {
      setFetching(false)
    }
  }

  async function exportPdf() {
    if (!isPro) {
      setShowPdfUpgradeModal(true)
      return
    }

    try {
      const { generateBOQPdf } = await import('../lib/pdf')
      generateBOQPdf({
        ...project,
        meta: {
          name: activeProject?.name || 'EstiMate Project',
          location: activeProject?.location || 'Site Location',
        },
      })
      setNotice('Master BOQ PDF downloaded successfully')
      window.setTimeout(() => setNotice(''), 2500)
    } catch (err) {
      console.error('PDF export error:', err)
      setNotice('Error generating PDF')
      window.setTimeout(() => setNotice(''), 2500)
    }
  }

  if (!activeProject) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="blueprint-grid min-h-screen bg-[#11224D] font-sans text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#2C599D]/70 bg-[#11224D]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
          {/* Back button and Project Info */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <Link
              to="/dashboard"
              aria-label="Back to Project Management"
              className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl bg-[#F98125] text-white shadow-lg transition hover:bg-[#FB9B50]"
            >
              <Icon name="back" className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="truncate text-sm font-bold tracking-tight text-white sm:text-lg">
                  {activeProject.name}
                </h1>
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="rounded p-1 text-blue-200/70 hover:bg-[#193A6F] hover:text-white"
                  title="Edit project name or location"
                >
                  <Icon name="edit" className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[0.65rem] text-[#5B84C4]">
                <Link to="/dashboard" className="hover:underline">
                  ← Projects
                </Link>
                <span>•</span>
                <span className="truncate">{activeProject.location || 'Location not set'}</span>
              </div>
            </div>
          </div>

          {/* Autosaved Pill & Total Cost Preview */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="text-right">
              <span className="block text-[0.55rem] sm:text-[0.6rem] font-semibold uppercase tracking-wider text-[#5B84C4]">
                Total
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#F98125]">
                {project.total > 0 ? money.format(project.total) : '₱0.00'}
              </span>
            </div>

            <div className="hidden xs:inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[0.6rem] sm:text-[0.65rem] font-medium text-emerald-300">
              ● Saved
            </div>
          </div>
        </div>

        {/* Navigation Tabs with Smooth Horizontal Slide, Drag, Wheel, and Arrow Controls */}
        <TabNavigation tabs={TABS} activeTab={activeTab} onSelectTab={setActiveTab} />
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            project={project}
            onNavigate={setActiveTab}
            onPdf={exportPdf}
            onOpenPdfModal={() => setShowPdfModal(true)}
            isPro={isPro}
          />
        )}
        {activeTab === 'structural' && (
          <StructuralTab
            value={data.structural}
            update={moduleUpdate('structural')}
            result={project.structural}
            prices={data.prices}
            wages={data.wages}
          />
        )}
        {activeTab === 'formwork' && (
          <FormworkTab
            value={data.formwork}
            update={moduleUpdate('formwork')}
            result={project.formwork}
            wages={data.wages}
          />
        )}
        {activeTab === 'rebar' && (
          <RebarTab
            value={data.rebar}
            update={moduleUpdate('rebar')}
            result={project.rebar}
            wages={data.wages}
          />
        )}
        {activeTab === 'roofing' && (
          <RoofingTab
            value={data.roofing}
            update={moduleUpdate('roofing')}
            result={project.roofing}
            wages={data.wages}
          />
        )}
        {activeTab === 'masonry' && (
          <MasonryTab
            value={data.masonry}
            update={moduleUpdate('masonry')}
            result={project.masonry}
            wages={data.wages}
          />
        )}
        {activeTab === 'finishes' && (
          <FinishesTab
            value={data.finishes}
            update={moduleUpdate('finishes')}
            result={project.finishes}
            wages={data.wages}
          />
        )}
        {activeTab === 'boq' && (
          <BoqTab
            project={project}
            boqData={data.boq}
            update={moduleUpdate('boq')}
            onPdf={exportPdf}
            isPro={isPro}
            projectName={activeProject.name}
            projectLocation={activeProject.location}
            wages={data.wages}
          />
        )}
        {activeTab === 'database' && (
          <DatabaseTab data={data} update={update} onFetch={refreshPrices} fetching={fetching} isPro={isPro} />
        )}
      </main>

      <footer className="px-4 pb-8 text-center text-xs text-[#5B84C4]">
        EstiMate QS Suite · Scoped to {activeProject.name} · All computations persist in local browser storage
      </footer>

      {/* Toast Notice */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            role="status"
            className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-medium text-white shadow-2xl"
          >
            <Icon name="check" className="h-4 w-4 text-emerald-400" />
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Project Info Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditProjectModal
            project={activeProject}
            onClose={() => setShowEditModal(false)}
            onSave={(details) => {
              updateProject(id, details)
              setShowEditModal(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* PDF Scanner Modal inside Project Dashboard */}
      <AnimatePresence>
        {showPdfModal && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-[#07132F]/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && setShowPdfModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-3xl border border-[#2C599D]/70 bg-[#11224D] p-6 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-[#2C599D]/60 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F98125] text-white">
                    <Icon name="scan" className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">Scan Blueprint Plan for {activeProject.name}</h3>
                    <p className="text-xs text-[#7CA3E2]">Auto-populates column, beam, slab, and footing dimensions</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>

              <PdfUploader onApplySpecs={handleApplyPdfSpecs} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Upgrade Modal for Free Accounts */}
      <AnimatePresence>
        {showPdfUpgradeModal && (
          <PdfUpgradeModal
            onClose={() => setShowPdfUpgradeModal(false)}
            onUpgrade={async () => {
              await upgradeToPro()
              setNotice('Upgraded to Pro Contractor! PDF export unlocked.')
              window.setTimeout(() => setNotice(''), 3000)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
