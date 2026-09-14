import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectsContext'
import { calculateProject, DEFAULT_DATA, fetchMarketPrices, MIXES, num, PRICE_LABELS, PRODUCTIVITY } from '../lib/estimator'

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 })
const number = new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 3 })
const integer = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 })

const TABS = [
  ['dashboard', 'Master Dashboard', 'grid'],
  ['structural', 'Structural & Concrete', 'structure'],
  ['masonry', 'Masonry & Plaster', 'wall'],
  ['finishes', 'Finishes (Tile & Paint)', 'paint'],
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
          className={`min-w-0 flex-1 bg-transparent px-3 font-mono text-sm font-medium outline-none placeholder:text-slate-400 ${
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
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-black/10 sm:p-6 ${className}`}>
      {children}
    </section>
  )
}

function Heading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#2C599D]">{eyebrow}</p>
        <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 max-w-2xl text-xs text-slate-500">{description}</p>}
      </div>
      {action}
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
    <div className={`rounded-xl border p-3.5 sm:p-4 ${accent ? 'border-orange-200 bg-orange-50/80' : 'border-slate-200 bg-slate-50'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {icon && <Icon name={icon} className={`h-4 w-4 ${accent ? 'text-[#F98125]' : 'text-[#5B84C4]'}`} />}
      </div>
      <p className={`mt-1.5 break-words font-mono text-xl font-bold ${accent ? 'text-[#F98125]' : 'text-slate-900'}`}>
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

/* 1. MASTER DASHBOARD TAB */
function DashboardTab({ project, onNavigate, onPdf, isPro }) {
  const activeModules = [
    {
      name: 'Structural Concrete',
      enabled: project.structural.neat > 0,
      detail: `${number.format(project.structural.neat)} m³ neat · ${integer.format(project.structural.bags)} bags cement`,
      target: 'structural',
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

        <div className="flex flex-col items-stretch sm:items-end gap-1.5">
          <button
            type="button"
            disabled={!project.items.length}
            onClick={onPdf}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F98125] px-5 text-sm font-semibold text-white shadow-xl shadow-black/20 transition hover:bg-[#FB9B50] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="download" />
            {isPro ? 'Generate White-Label BOQ (PDF)' : 'Generate Master BOQ (PDF)'}
          </button>
          {!isPro && (
            <span className="text-[0.68rem] text-orange-200/90 font-medium text-center sm:text-right">
              Free plan export includes watermark ·{' '}
              <Link to="/pricing" className="underline font-bold text-white hover:text-orange-200">
                Upgrade to Pro
              </Link>
            </span>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Procurement Materials" value={money.format(project.materialCost)} icon="cube" />
        <Metric label="DOLE Labor Allowance" value={money.format(project.laborCost)} icon="users" />
        <Metric label="Contingency (5%)" value={money.format(project.contingency)} icon="info" />
        <Metric label="Total Project Estimate" value={money.format(project.total)} accent icon="peso" />
      </div>

      {/* Quick Trade Jump Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {activeModules.map((m) => (
          <button
            key={m.name}
            type="button"
            onClick={() => onNavigate(m.target)}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-[#F98125]"
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
          <div className="overflow-x-auto">
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
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Length" value={value.slabLength} onChange={(v) => update('slabLength', v)} unit="m" />
            <Field label="Width" value={value.slabWidth} onChange={(v) => update('slabWidth', v)} unit="m" />
            <Field label="Thickness" value={value.slabThickness} onChange={(v) => update('slabThickness', v)} unit="m" placeholder="0.10" />
          </div>
        </Card>

        <Card>
          <Heading eyebrow="Geometry · Vertical" title="Rectangular Columns" description="Uniform columns; enter total count and section size." />
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Count" value={value.columnCount} onChange={(v) => update('columnCount', v)} unit="pcs" />
            <Field label="Width" value={value.columnWidth} onChange={(v) => update('columnWidth', v)} unit="m" />
            <Field label="Depth" value={value.columnDepth} onChange={(v) => update('columnDepth', v)} unit="m" />
            <Field label="Height" value={value.columnHeight} onChange={(v) => update('columnHeight', v)} unit="m" />
          </div>
        </Card>

        <Card>
          <Heading eyebrow="Geometry · Foundation" title="Isolated Footings" description="Uniform footing pads concrete volume." />
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Count" value={value.footingCount} onChange={(v) => update('footingCount', v)} unit="pcs" />
            <Field label="Length" value={value.footingLength} onChange={(v) => update('footingLength', v)} unit="m" />
            <Field label="Width" value={value.footingWidth} onChange={(v) => update('footingWidth', v)} unit="m" />
            <Field label="Thickness" value={value.footingThickness} onChange={(v) => update('footingThickness', v)} unit="m" />
          </div>
        </Card>

        <Card>
          <Heading eyebrow="Mix & Reinforcement" title="Concrete Mix & Rebar Ratios" description="Commercial mix proportions and procurement bag size." />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Concrete Mix Class</span>
              <select
                value={value.mixClass}
                onChange={(e) => update('mixClass', e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20"
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
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
      <div className="space-y-6">
        <Card>
          <Heading
            eyebrow="Geometry · Walls"
            title="CHB Wall Footprint"
            description="Openings are deducted before block, mortar, plaster, and labor calculations."
          />
          <div className="grid gap-4 sm:grid-cols-2">
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
              <strong>Philippine Standard CHB:</strong> Uses 12.5 standard 400 × 200 mm blocks per m², 0.012 m³ laying mortar per m², and 1.33 dry-volume multiplier with 5% default breakage wastage.
            </span>
          </p>
        </div>
      </div>

      {/* Live Results Panel */}
      <div className="space-y-6 xl:sticky xl:top-36">
        <Card>
          <Heading eyebrow="Masonry Takeoff" title="Block & Mortar Quantities" />
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Net Wall Area" value={number.format(result.area)} unit="m²" />
            <Metric label="CHB Blocks" value={integer.format(result.blocks)} unit="pieces" accent />
            <Metric label="Laying Mortar" value={number.format(result.mortarWet)} unit="m³ wet" />
            <Metric label="Plaster Area" value={number.format(result.plasterArea)} unit="m²" />
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
          <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="grid gap-4 sm:grid-cols-2">
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
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
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
            className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none focus:border-[#F98125]"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Site Location</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Quezon City, Metro Manila"
            className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none focus:border-[#F98125]"
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

/* MAIN PROJECT SUITE COMPONENT */
export default function ProjectSuite() {
  const { id } = useParams()
  const { isPro } = useAuth()
  const { getProject, updateProjectData, updateProject } = useProjects()
  const activeProject = getProject(id)

  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState(() => mergeWithDefaults(activeProject?.data))
  const [fetching, setFetching] = useState(false)
  const [notice, setNotice] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)

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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Back button and Project Info */}
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/dashboard"
              aria-label="Back to Project Management"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F98125] text-white shadow-lg transition hover:bg-[#FB9B50]"
            >
              <Icon name="back" className="h-5 w-5" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
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

              <div className="flex items-center gap-2 text-[0.65rem] text-[#5B84C4]">
                <Link to="/dashboard" className="hover:underline">
                  ← Projects
                </Link>
                <span>•</span>
                <span className="truncate">{activeProject.location || 'Location not set'}</span>
              </div>
            </div>
          </div>

          {/* Autosaved Pill & Total Cost Preview */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden text-right sm:block">
              <span className="block text-[0.6rem] font-semibold uppercase tracking-wider text-[#5B84C4]">
                Project Total
              </span>
              <span className="font-mono text-sm font-bold text-[#F98125]">
                {project.total > 0 ? money.format(project.total) : '₱0.00'}
              </span>
            </div>

            <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[0.65rem] font-medium text-emerald-300">
              ● Auto-saved
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          className="hide-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2.5 sm:px-6 lg:px-8"
          aria-label="Estimator Modules"
        >
          {TABS.map(([tabId, label, icon]) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition ${
                activeTab === tabId
                  ? 'bg-white text-[#193A6F] shadow'
                  : 'text-blue-200 hover:bg-[#193A6F] hover:text-white'
              }`}
            >
              <Icon name={icon} className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8">
        {activeTab === 'dashboard' && (
          <DashboardTab project={project} onNavigate={setActiveTab} onPdf={exportPdf} isPro={isPro} />
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
    </div>
  )
}
