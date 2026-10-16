import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MIXES, PRODUCTIVITY } from '../lib/estimator'

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 })
const number = new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 3 })
const integer = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 })

const PRESETS = [
  {
    label: '4-Col Constant (400×400, H=3m)',
    type: 'column',
    isVariable: false,
    width: '0.40',
    depth: '0.40',
    height: '3.00',
    length: '0.40',
    count: '4',
    w1: '0.40',
    d1: '0.40',
    w2: '0.40',
    d2: '0.40',
  },
  {
    label: 'Tapered Col (500×500 to 350×350, H=3.6m)',
    type: 'column',
    isVariable: true,
    width: '0.50',
    depth: '0.50',
    height: '3.60',
    length: '0.50',
    count: '4',
    w1: '0.50',
    d1: '0.50',
    w2: '0.35',
    d2: '0.35',
  },
  {
    label: 'Haunched Girder (250×600 to 250×400, L=6m)',
    type: 'beam',
    isVariable: true,
    width: '0.25',
    depth: '0.60',
    height: '0.60',
    length: '6.00',
    count: '2',
    w1: '0.25',
    d1: '0.60',
    w2: '0.25',
    d2: '0.40',
  },
  {
    label: 'Suspended Slab 8×6m (t=125mm)',
    type: 'slab',
    isVariable: false,
    width: '6.00',
    depth: '0.125',
    height: '0.125',
    length: '8.00',
    count: '1',
    w1: '6.00',
    d1: '0.125',
    w2: '6.00',
    d2: '0.125',
  },
  {
    label: 'Isolated Footing 1.5×1.5m (t=350mm)',
    type: 'footing',
    isVariable: false,
    width: '1.50',
    depth: '0.35',
    height: '0.35',
    length: '1.50',
    count: '4',
    w1: '1.50',
    d1: '0.35',
    w2: '1.50',
    d2: '0.35',
  },
]

export default function ConcreteEstimator() {
  const { user, signOut } = useAuth()

  // Element Type
  const [elementType, setElementType] = useState('column')
  const [isVariable, setIsVariable] = useState(false)

  // Constant Dimensions
  const [length, setLength] = useState('0.40')
  const [width, setWidth] = useState('0.40')
  const [heightDepth, setHeightDepth] = useState('3.00')
  const [quantity, setQuantity] = useState('4')

  // Variable (Non-Prismatic) Dimensions
  const [widthStart, setWidthStart] = useState('0.50')
  const [depthStart, setDepthStart] = useState('0.50')
  const [widthEnd, setWidthEnd] = useState('0.35')
  const [depthEnd, setDepthEnd] = useState('0.35')

  // Concrete Mix Parameters
  const [mixClass, setMixClass] = useState('A')
  const [bagSize, setBagSize] = useState(40)
  const [wastagePercent, setWastagePercent] = useState('5')
  const [rebarRatio, setRebarRatio] = useState('80') // kg per m3

  // Multi-Element Schedule
  const [items, setItems] = useState([])
  const [itemName, setItemName] = useState('C-1 Column')
  const [copied, setCopied] = useState(false)

  // Single Element Volume Calculation (Prismoidal Frustum for Variable)
  const currentVolume = useMemo(() => {
    const l = Math.max(0, Number.parseFloat(length) || 0)
    const w = Math.max(0, Number.parseFloat(width) || 0)
    const h = Math.max(0, Number.parseFloat(heightDepth) || 0)
    const q = Math.max(0, Number.parseFloat(quantity) || 0)

    let unitVol = 0

    if (elementType === 'column') {
      if (isVariable) {
        // Frustum of pyramid/rectangular prism: V = (H/3) * (A1 + A2 + sqrt(A1*A2))
        const w1 = Math.max(0, Number.parseFloat(widthStart) || w)
        const d1 = Math.max(0, Number.parseFloat(depthStart) || (l > 0 ? l : w))
        const w2 = Math.max(0, Number.parseFloat(widthEnd) || w1)
        const d2 = Math.max(0, Number.parseFloat(depthEnd) || d1)
        const a1 = w1 * d1
        const a2 = w2 * d2
        unitVol = (h / 3) * (a1 + a2 + Math.sqrt(a1 * a2))
      } else {
        unitVol = w * (l > 0 ? l : w) * h
      }
    } else if (elementType === 'beam') {
      if (isVariable) {
        // Tapered/haunched girder along span L: V = (L/3) * (A1 + A2 + sqrt(A1*A2))
        const w1 = Math.max(0, Number.parseFloat(widthStart) || w)
        const d1 = Math.max(0, Number.parseFloat(depthStart) || h)
        const w2 = Math.max(0, Number.parseFloat(widthEnd) || w1)
        const d2 = Math.max(0, Number.parseFloat(depthEnd) || d1)
        const a1 = w1 * d1
        const a2 = w2 * d2
        const spanL = l > 0 ? l : 1
        unitVol = (spanL / 3) * (a1 + a2 + Math.sqrt(a1 * a2))
      } else {
        unitVol = (l > 0 ? l : 1) * w * h
      }
    } else if (elementType === 'slab') {
      unitVol = l * w * (h > 0 ? h : 0.125)
    } else if (elementType === 'footing') {
      unitVol = l * w * (h > 0 ? h : 0.35)
    }

    return {
      unitVol,
      totalVol: unitVol * q,
      length: l,
      width: w,
      heightDepth: h,
      quantity: q,
      type: elementType,
      isVariable,
    }
  }, [elementType, isVariable, length, width, heightDepth, quantity, widthStart, depthStart, widthEnd, depthEnd])

  // Consolidated neat volume
  const totalNeatVolume = useMemo(() => {
    if (items.length > 0) {
      return items.reduce((acc, it) => acc + it.totalVol, 0)
    }
    return currentVolume.totalVol
  }, [items, currentVolume])

  // Material & Labor Takeoff
  const takeoff = useMemo(() => {
    const waste = Math.max(0, Number.parseFloat(wastagePercent) || 5) / 100
    const grossVol = totalNeatVolume * (1 + waste)
    const selectedMix = MIXES[mixClass] || MIXES.A

    // Cement bags calculation with bag size factor
    const bagFactor = 40 / (Number.parseFloat(bagSize) || 40)
    const exactBags = grossVol * selectedMix.bags40 * bagFactor
    const totalBags = Math.ceil(exactBags)

    // Aggregates (1:2:4 ratio -> 0.5 m³ sand, 1.0 m³ gravel per m³ concrete)
    const sandVol = grossVol * 0.5
    const gravelVol = grossVol * 1.0

    // Steel Rebar estimate
    const ratio = Math.max(0, Number.parseFloat(rebarRatio) || 80)
    const rebarKg = totalNeatVolume * ratio

    // DOLE Labor crew man-days
    const foremanDays = grossVol * PRODUCTIVITY.structural.foremanPerM3
    const skilledDays = grossVol * PRODUCTIVITY.structural.skilledPerM3
    const helperDays = grossVol * PRODUCTIVITY.structural.helperPerM3

    return {
      neatVol: totalNeatVolume.toFixed(3),
      grossVol: grossVol.toFixed(3),
      selectedMix,
      exactBags: exactBags.toFixed(1),
      totalBags,
      sandVol: sandVol.toFixed(2),
      gravelVol: gravelVol.toFixed(2),
      rebarKg: rebarKg.toFixed(1),
      foremanDays: foremanDays.toFixed(2),
      skilledDays: skilledDays.toFixed(2),
      helperDays: helperDays.toFixed(2),
    }
  }, [totalNeatVolume, wastagePercent, mixClass, bagSize, rebarRatio])

  const applyPreset = (preset) => {
    setElementType(preset.type)
    setIsVariable(preset.isVariable)
    setWidth(preset.width)
    setLength(preset.length)
    setHeightDepth(preset.height)
    setQuantity(preset.count)
    setWidthStart(preset.w1)
    setDepthStart(preset.d1)
    setWidthEnd(preset.w2)
    setDepthEnd(preset.d2)
    setItemName(preset.label.split(' ')[0])
  }

  const addItemToSchedule = () => {
    if (currentVolume.totalVol <= 0) return
    const dimDesc = isVariable
      ? `${widthStart}×${depthStart}m → ${widthEnd}×${depthEnd}m (${elementType === 'column' ? `H=${heightDepth}m` : `L=${length}m`})`
      : `${length}m × ${width}m × ${heightDepth}m`

    const newItem = {
      id: Date.now(),
      name: itemName || `${elementType.toUpperCase()} (${quantity} pcs)`,
      type: elementType,
      isVariable,
      dimensions: dimDesc,
      quantity,
      unitVol: currentVolume.unitVol,
      totalVol: currentVolume.totalVol,
    }
    setItems((prev) => [...prev, newItem])
    setItemName('')
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const clearSchedule = () => {
    setItems([])
  }

  const copySummary = () => {
    const text = `EstiMate Structural Concrete Takeoff:
- Total Neat Concrete Volume: ${takeoff.neatVol} m³
- Gross Volume (+${wastagePercent}% waste): ${takeoff.grossVol} m³
- Mix Classification: ${takeoff.selectedMix.label} (${takeoff.selectedMix.ratio})
- Portland Cement (${bagSize}kg): ${takeoff.totalBags} bags
- Washed Concreting Sand: ${takeoff.sandVol} m³
- 3/4" Crushed Gravel: ${takeoff.gravelVol} m³
- Reinforcing Steel (Rebar @ ${rebarRatio} kg/m³): ${takeoff.rebarKg} kg
- Labor Demand: Foreman ${takeoff.foremanDays} md, Skilled ${takeoff.skilledDays} md, Helper ${takeoff.helperDays} md`

    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="blueprint-grid min-h-screen bg-[#11224D] font-sans text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-[#2C599D]/60 bg-[#11224D]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F98125] text-white shadow-lg shadow-orange-950/30">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 21V10m16 11V10M2 10h20M6 10l2-7h8l2 7M8 14h8M8 18h8" />
                </svg>
              </span>
              <div className="leading-none">
                <span className="text-xl font-bold tracking-tight text-white">
                  Esti<span className="text-[#F98125]">Mate</span>
                </span>
                <span className="block text-[0.6rem] font-medium tracking-widest text-[#7CA3E2] uppercase">
                  Concrete &amp; Non-Prismatic Frustum Estimator
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 rounded-xl border border-[#2C599D]/70 bg-[#193A6F]/50 px-3.5 py-2 text-xs font-semibold text-blue-200 transition hover:bg-[#193A6F] hover:text-white"
            >
              ← Dashboard
            </Link>

            {user && (
              <div className="flex items-center gap-2.5 border-l border-[#2C599D]/60 pl-3">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-semibold text-white leading-tight">{user.name || user.email}</p>
                  <p className="text-[0.65rem] text-[#F98125] font-medium">{user.plan || 'Free Tier'}</p>
                </div>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="rounded-xl border border-[#2C599D]/70 bg-[#193A6F]/60 px-2.5 py-1.5 text-xs font-medium text-blue-200 transition hover:border-red-400/50 hover:bg-red-500/15 hover:text-red-300"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Title & Presets */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5B84C4]/40 bg-[#193A6F]/50 px-3.5 py-1 text-xs font-semibold text-blue-200 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#F98125] animate-pulse" />
              Structural Concrete Volume &amp; Mix Proportions
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
              Concrete Takeoff Suite &amp; Non-Prismatic Support
            </h1>
            <p className="text-xs sm:text-sm text-[#7CA3E2] mt-1">
              Compute precise concrete volumes for prismatic members and variable non-prismatic sections (tapered columns &amp; haunched girders).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#7CA3E2]">Presets:</span>
            {PRESETS.map((pr) => (
              <button
                key={pr.label}
                type="button"
                onClick={() => applyPreset(pr)}
                className="rounded-lg border border-[#2C599D]/70 bg-[#193A6F]/60 px-2.5 py-1 text-xs font-medium text-blue-200 transition hover:border-[#F98125] hover:text-white"
              >
                {pr.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Form Inputs (7 cols) */}
          <section className="space-y-6 lg:col-span-7">
            {/* 1. Element Geometry Card */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-100 text-[#F98125] font-mono text-xs">
                    01
                  </span>
                  Structural Geometry &amp; Section Profile
                </h2>
                <span className="text-xs text-slate-400">Dimensions in meters (m)</span>
              </div>

              {/* Element Type Selector */}
              <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { id: 'column', label: 'Column' },
                  { id: 'beam', label: 'Beam / Girder' },
                  { id: 'slab', label: 'Floor Slab' },
                  { id: 'footing', label: 'Isolated Footing' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setElementType(type.id)
                      if (type.id === 'slab' || type.id === 'footing') {
                        setIsVariable(false)
                      }
                    }}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      elementType === type.id
                        ? 'border-[#F98125] bg-orange-50 text-[#F98125] shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Section Geometry Toggle (Only applicable for columns and beams) */}
              {(elementType === 'column' || elementType === 'beam') && (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#11224D]" />
                      Member Cross-Section Type:
                    </span>
                    <span className="text-[0.65rem] font-bold uppercase text-[#F98125]">
                      {isVariable ? 'Non-Prismatic Frustum' : 'Constant Prismatic'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsVariable(false)}
                      className={`rounded-xl p-2.5 text-xs font-bold transition flex items-center justify-center gap-2 border ${
                        !isVariable
                          ? 'border-[#11224D] bg-[#11224D] text-white shadow-sm'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="4" width="16" height="16" rx="1" />
                      </svg>
                      Constant Section
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsVariable(true)}
                      className={`rounded-xl p-2.5 text-xs font-bold transition flex items-center justify-center gap-2 border ${
                        isVariable
                          ? 'border-[#F98125] bg-[#F98125] text-white shadow-sm'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 2 22 22 22" />
                      </svg>
                      Variable Section (Tapered / Haunched)
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Inputs based on Constant vs Variable */}
              {isVariable && (elementType === 'column' || elementType === 'beam') ? (
                /* Non-Prismatic Inputs */
                <div className="space-y-4">
                  <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-4">
                    <p className="text-xs font-bold text-[#11224D] mb-3">
                      Start Section Dimensions (Bottom / Support):
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Start Width (W₁) (m)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          value={widthStart}
                          onChange={(e) => setWidthStart(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm bg-white focus:outline-none focus:border-[#F98125]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Start Depth (D₁) (m)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          value={depthStart}
                          onChange={(e) => setDepthStart(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm bg-white focus:outline-none focus:border-[#F98125]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
                    <p className="text-xs font-bold text-[#11224D] mb-3">
                      End Section Dimensions (Top / Midspan):
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          End Width (W₂) (m)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          value={widthEnd}
                          onChange={(e) => setWidthEnd(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm bg-white focus:outline-none focus:border-[#F98125]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          End Depth (D₂) (m)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          value={depthEnd}
                          onChange={(e) => setDepthEnd(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm bg-white focus:outline-none focus:border-[#F98125]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {elementType === 'column' ? 'Column Clear Height (m)' : 'Beam Span Length (m)'}
                      </label>
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={elementType === 'column' ? heightDepth : length}
                        onChange={(e) => {
                          if (elementType === 'column') setHeightDepth(e.target.value)
                          else setLength(e.target.value)
                        }}
                        className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quantity (pcs)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Constant Section Inputs */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {elementType === 'column' ? 'Column Width (m)' : 'Element Length (m)'}
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="0.40"
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {elementType === 'column' ? 'Column Depth (m)' : 'Element Width (m)'}
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="0.40"
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {elementType === 'column'
                        ? 'Height / Floor Clearance (m)'
                        : elementType === 'slab'
                        ? 'Slab Thickness (m)'
                        : 'Beam Depth / Thickness (m)'}
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={heightDepth}
                      onChange={(e) => setHeightDepth(e.target.value)}
                      placeholder="3.00"
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Element Quantity (pcs)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="4"
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Live Preview Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
                <span className="font-mono text-[0.72rem]">
                  Current Element Volume: {currentVolume.unitVol.toFixed(3)} m³ × {quantity} pcs
                </span>
                <span className="font-bold text-[#11224D]">
                  = {currentVolume.totalVol.toFixed(3)} m³
                </span>
              </div>

              {/* Add to multi-element schedule */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Element Tag (e.g. C-1, G-1, S-1)"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125]"
                />
                <button
                  type="button"
                  onClick={addItemToSchedule}
                  className="rounded-xl bg-[#11224D] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#193A6F] flex items-center gap-1.5"
                >
                  <span>+</span> Add to Schedule
                </button>
              </div>
            </div>

            {/* Schedule Table (if items added) */}
            {items.length > 0 && (
              <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Structural Concrete Schedule ({items.length} items)
                  </h3>
                  <button
                    type="button"
                    onClick={clearSchedule}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="pb-2">Tag/Name</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Geometry Profile</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2 text-right">Neat Volume</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-bold text-slate-800">{item.name}</td>
                          <td className="py-2.5 uppercase font-mono text-[0.7rem] text-slate-500">{item.type}</td>
                          <td className="py-2.5 font-mono text-slate-600">
                            {item.dimensions}
                            {item.isVariable && (
                              <span className="ml-1.5 rounded bg-orange-100 px-1.5 py-0.5 text-[0.6rem] font-bold text-[#F98125]">
                                Frustum
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 font-mono">{item.quantity}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-[#11224D]">
                            {item.totalVol.toFixed(3)} m³
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. Concrete Mix & Material Specifications Card */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-100 text-[#193A6F] font-mono text-xs">
                    02
                  </span>
                  Concrete Mix Specification &amp; Factors
                </h2>
                <span className="text-xs text-slate-400">DPWH / NSCP Proportions</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Concrete Mix Classification
                  </label>
                  <select
                    value={mixClass}
                    onChange={(e) => setMixClass(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125]"
                  >
                    {Object.entries(MIXES).map(([key, mix]) => (
                      <option key={key} value={key}>
                        {mix.label} ({mix.ratio}) · {mix.bags40} bags/m³
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Cement Bag Packaging Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[40, 50].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setBagSize(size)}
                        className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                          bagSize === size
                            ? 'border-[#F98125] bg-orange-50 text-[#F98125]'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {size} kg bag
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Concrete Wastage Margin (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="20"
                    value={wastagePercent}
                    onChange={(e) => setWastagePercent(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] font-mono"
                  />
                  <p className="text-[0.68rem] text-slate-400 mt-1">Standard site wastage: 5%–8%</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Rebar Allowance Ratio (kg/m³)
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="40"
                    max="200"
                    value={rebarRatio}
                    onChange={(e) => setRebarRatio(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] font-mono"
                  />
                  <p className="text-[0.68rem] text-slate-400 mt-1">Standard: 80 kg/m³ (Beams/Columns)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Results & Non-Prismatic Frustum Visualizer (5 cols) */}
          <aside className="space-y-6 lg:col-span-5">
            {/* Primary Takeoff Results Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border-2 border-[#F98125] bg-gradient-to-b from-[#193A6F] to-[#11224D] p-6 shadow-2xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-[#F98125]/15 blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#2C599D]/70 pb-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#F98125]">
                    Concrete Takeoff Output
                  </span>
                  <h3 className="text-lg font-extrabold text-white">Bill of Materials</h3>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[0.65rem] font-bold text-emerald-300">
                  +{wastagePercent}% Wastage Factored
                </span>
              </div>

              {/* Main Metric: Concrete Volume */}
              <div className="mt-5 rounded-2xl bg-[#07132F]/60 p-4 border border-[#2C599D]/60 backdrop-blur-sm">
                <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#7CA3E2]">
                  Total Gross Concrete Volume (Delivered / Batch Mixed)
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight text-white font-mono">
                    {takeoff.grossVol}
                  </span>
                  <span className="text-base font-bold text-blue-200">m³ (cu.m)</span>
                </div>
                <div className="mt-2 text-[0.7rem] text-[#7CA3E2]">
                  Neat Form Volume: <strong className="text-white">{takeoff.neatVol} m³</strong> · Mix: <strong className="text-white">{takeoff.selectedMix.label}</strong>
                </div>
              </div>

              {/* Main Metric 2: Cement Demand */}
              <div className="mt-4 rounded-2xl bg-[#F98125] p-5 shadow-lg shadow-orange-950/40 text-[#07132F]">
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-orange-950/80">
                    Portland Cement Demand ({bagSize}kg Bags)
                  </span>
                  <span className="rounded-md bg-white/30 px-2 py-0.5 text-[0.65rem] font-extrabold text-white">
                    {takeoff.selectedMix.ratio}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                    {takeoff.totalBags}
                  </span>
                  <span className="text-lg font-black text-[#07132F]">bags</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-orange-950/90 leading-tight">
                  Based on exact demand of {takeoff.exactBags} bags (Type 1 Portland Cement).
                </p>
              </div>

              {/* Secondary Breakdown: Sand, Gravel, Rebar */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#07132F]/60 p-3.5 border border-[#2C599D]/60">
                  <span className="text-[0.65rem] font-semibold uppercase text-[#7CA3E2]">Washed Sand</span>
                  <div className="mt-1 font-mono text-xl font-black text-white">
                    {takeoff.sandVol} <span className="text-xs font-bold text-blue-200">m³</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#07132F]/60 p-3.5 border border-[#2C599D]/60">
                  <span className="text-[0.65rem] font-semibold uppercase text-[#7CA3E2]">3/4" Crushed Gravel</span>
                  <div className="mt-1 font-mono text-xl font-black text-white">
                    {takeoff.gravelVol} <span className="text-xs font-bold text-blue-200">m³</span>
                  </div>
                </div>

                <div className="col-span-2 rounded-2xl bg-[#07132F]/60 p-3.5 border border-[#2C599D]/60 flex items-center justify-between">
                  <div>
                    <span className="text-[0.65rem] font-semibold uppercase text-[#7CA3E2]">Estimated Steel Rebar</span>
                    <p className="text-[0.65rem] text-slate-400">@ {rebarRatio} kg/m³ neat concrete</p>
                  </div>
                  <div className="font-mono text-xl font-black text-orange-400">
                    {takeoff.rebarKg} <span className="text-xs font-bold text-white">kg</span>
                  </div>
                </div>
              </div>

              {/* DOLE Labor Crew */}
              <div className="mt-4 rounded-2xl bg-[#07132F]/40 p-4 border border-[#2C599D]/40 text-xs space-y-2">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#F98125]">
                  DOLE Labor Crew Productivity Norms
                </span>
                <div className="flex justify-between py-1 border-b border-white/5 text-[#7CA3E2]">
                  <span>Structural Foreman:</span>
                  <span className="font-mono text-white">{takeoff.foremanDays} man-days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 text-[#7CA3E2]">
                  <span>Skilled Mason / Tradesman:</span>
                  <span className="font-mono text-white">{takeoff.skilledDays} man-days</span>
                </div>
                <div className="flex justify-between py-1 text-[#7CA3E2]">
                  <span>Construction Helper:</span>
                  <span className="font-mono text-white">{takeoff.helperDays} man-days</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={copySummary}
                  className="flex-1 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/25 flex items-center justify-center gap-1.5"
                >
                  {copied ? '✓ Copied to Clipboard' : 'Copy Takeoff Summary'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-white/10 px-3 py-2.5 text-xs font-bold text-blue-200 transition hover:bg-white/20 hover:text-white"
                  title="Print"
                >
                  🖨️
                </button>
              </div>
            </motion.div>

            {/* Non-Prismatic 3D Geometry Diagram Visualizer */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-[#193A6F]/40 p-5 text-xs text-[#7CA3E2] space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[0.7rem] flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#F98125]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m21 16-9 5-9-5V8l9-5 9 5v8Z" />
                  <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
                </svg>
                {isVariable ? 'Non-Prismatic Frustum 3D Profile' : 'Constant Section 3D Profile'}
              </h4>

              <div className="rounded-2xl border border-[#2C599D]/80 bg-[#07132F]/80 p-4">
                {/* SVG Visualizing the Tapered / Frustum geometry */}
                <div className="relative w-full h-44 flex items-center justify-center">
                  <svg viewBox="0 0 280 150" className="w-full h-full">
                    {isVariable ? (
                      /* Tapered Frustum Shape */
                      <g>
                        {/* Top End Section (W2 x D2) */}
                        <polygon
                          points="110,25 170,25 185,45 125,45"
                          fill="#FB923C"
                          fillOpacity="0.4"
                          stroke="#F98125"
                          strokeWidth="2"
                        />
                        {/* Side Face 1 (Left trapezoid) */}
                        <polygon
                          points="110,25 125,45 105,125 90,105"
                          fill="#193A6F"
                          fillOpacity="0.7"
                          stroke="#2C599D"
                          strokeWidth="1.5"
                        />
                        {/* Front Face (Front trapezoid) */}
                        <polygon
                          points="125,45 185,45 205,125 105,125"
                          fill="#F98125"
                          fillOpacity="0.6"
                          stroke="#F98125"
                          strokeWidth="2"
                        />
                        {/* Labels */}
                        <text x="145" y="20" fill="#7CA3E2" fontSize="9" textAnchor="middle" fontFamily="monospace">
                          End: {widthEnd}m × {depthEnd}m
                        </text>
                        <text x="155" y="140" fill="#F98125" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          Start: {widthStart}m × {depthStart}m
                        </text>
                        <text x="60" y="80" fill="#7CA3E2" fontSize="9" textAnchor="middle" fontFamily="monospace">
                          {elementType === 'column' ? `H=${heightDepth}m` : `L=${length}m`}
                        </text>
                        <line x1="80" y1="35" x2="80" y2="115" stroke="#7CA3E2" strokeWidth="1" strokeDasharray="3 3" />
                      </g>
                    ) : (
                      /* Prismatic Constant Box Shape */
                      <g>
                        <polygon
                          points="100,30 180,30 200,55 120,55"
                          fill="#FB923C"
                          fillOpacity="0.4"
                          stroke="#F98125"
                          strokeWidth="2"
                        />
                        <polygon
                          points="100,30 120,55 120,125 100,100"
                          fill="#193A6F"
                          fillOpacity="0.7"
                          stroke="#2C599D"
                          strokeWidth="1.5"
                        />
                        <polygon
                          points="120,55 200,55 200,125 120,125"
                          fill="#F98125"
                          fillOpacity="0.6"
                          stroke="#F98125"
                          strokeWidth="2"
                        />
                        <text x="150" y="22" fill="#7CA3E2" fontSize="9" textAnchor="middle" fontFamily="monospace">
                          Uniform: {width}m × {elementType === 'column' ? length : width}m
                        </text>
                        <text x="160" y="140" fill="#F98125" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          Constant Cross-Section
                        </text>
                        <text x="70" y="80" fill="#7CA3E2" fontSize="9" textAnchor="middle" fontFamily="monospace">
                          {heightDepth}m
                        </text>
                        <line x1="90" y1="40" x2="90" y2="115" stroke="#7CA3E2" strokeWidth="1" strokeDasharray="3 3" />
                      </g>
                    )}
                  </svg>
                </div>

                <p className="mt-2 text-[0.68rem] text-slate-400 leading-relaxed text-center">
                  {isVariable
                    ? 'Computed via Prismoidal Frustum Volume: V = (H/3) × (A₁ + A₂ + √(A₁A₂)). Ensures 100% volumetric accuracy for non-prismatic structural members.'
                    : 'Computed via Prismatic Rectangular Volume: V = Length × Width × Height × Quantity.'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
