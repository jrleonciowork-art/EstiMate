import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PLYWOOD_SIZES = [
  { id: 'phenolic_18', name: 'Phenolic Board 3/4" (18mm)', thickness: '18mm', width: 1.22, length: 2.44, area: 2.9768, reusableTimes: 6 },
  { id: 'phenolic_12', name: 'Phenolic Board 1/2" (12mm)', thickness: '12mm', width: 1.22, length: 2.44, area: 2.9768, reusableTimes: 4 },
  { id: 'marine_18', name: 'Marine Plywood 3/4" (18mm)', thickness: '18mm', width: 1.22, length: 2.44, area: 2.9768, reusableTimes: 3 },
  { id: 'marine_12', name: 'Marine Plywood 1/2" (12mm)', thickness: '12mm', width: 1.22, length: 2.44, area: 2.9768, reusableTimes: 2 },
]

const LUMBER_SIZES = [
  { id: '2x2', name: '2" × 2" Good Lumber', thicknessInches: 2, widthInches: 2, bdftPerLinearFt: 0.333 },
  { id: '2x3', name: '2" × 3" Good Lumber', thicknessInches: 2, widthInches: 3, bdftPerLinearFt: 0.500 },
  { id: '2x4', name: '2" × 4" Good Lumber', thicknessInches: 2, widthInches: 4, bdftPerLinearFt: 0.667 },
]

const PRESETS = [
  { label: '4-Col 400×400 (H=3m)', type: 'column', width: '0.40', depth: '0.40', height: '3.00', length: '0.40', count: '4', isVariable: false },
  { label: 'Tapered Col 500→350 (H=3.6m)', type: 'column', width: '0.50', depth: '0.50', height: '3.60', length: '0.50', count: '4', isVariable: true, w1: '0.50', d1: '0.50', w2: '0.35', d2: '0.35' },
  { label: 'Girder 250×500 (L=6m)', type: 'beam', width: '0.25', depth: '0.50', height: '0.50', length: '6.00', count: '2', isVariable: false },
  { label: 'Haunched Girder 600→400 (L=6m)', type: 'beam', width: '0.25', depth: '0.60', height: '0.60', length: '6.00', count: '2', isVariable: true, w1: '0.25', d1: '0.60', w2: '0.25', d2: '0.40' },
  { label: 'Suspended Slab 8×6m (t=125mm)', type: 'slab', width: '6.00', depth: '0.125', height: '0.125', length: '8.00', count: '1', isVariable: false },
  { label: 'Footing 1.5×1.5m (t=400mm)', type: 'footing', width: '1.50', depth: '0.40', height: '0.40', length: '1.50', count: '4', isVariable: false },
]

export default function FormworkEstimator() {
  const { user, signOut } = useAuth()

  // Single or schedule mode
  const [elementType, setElementType] = useState('column')
  const [isVariable, setIsVariable] = useState(false)
  const [length, setLength] = useState('0.40')
  const [width, setWidth] = useState('0.40')
  const [heightDepth, setHeightDepth] = useState('3.00')
  const [quantity, setQuantity] = useState('4')

  // Variable (Non-Prismatic) Dimensions
  const [widthStart, setWidthStart] = useState('0.50')
  const [depthStart, setDepthStart] = useState('0.50')
  const [widthEnd, setWidthEnd] = useState('0.35')
  const [depthEnd, setDepthEnd] = useState('0.35')

  const [plywoodChoice, setPlywoodChoice] = useState('phenolic_18')
  const [lumberChoice, setLumberChoice] = useState('2x2')
  const [wastePercent, setWastePercent] = useState('10')
  const [studSpacing, setStudSpacing] = useState('0.30') // 0.30m or 0.40m
  const [copied, setCopied] = useState(false)

  // Additional elements schedule
  const [items, setItems] = useState([])
  const [itemName, setItemName] = useState('C-1 Column')

  // Calculate single element contact area
  const currentContactArea = useMemo(() => {
    const l = Math.max(0, Number.parseFloat(length) || 0)
    const w = Math.max(0, Number.parseFloat(width) || 0)
    const h = Math.max(0, Number.parseFloat(heightDepth) || 0)
    const q = Math.max(0, Number.parseFloat(quantity) || 0)

    let unitArea = 0
    if (elementType === 'column') {
      if (isVariable) {
        // 4 trapezoidal perimeter faces: (W1 + W2 + D1 + D2) * H
        const w1 = Math.max(0, Number.parseFloat(widthStart) || w)
        const d1 = Math.max(0, Number.parseFloat(depthStart) || (l > 0 ? l : w))
        const w2 = Math.max(0, Number.parseFloat(widthEnd) || w1)
        const d2 = Math.max(0, Number.parseFloat(depthEnd) || d1)
        unitArea = (w1 + w2 + d1 + d2) * h
      } else {
        unitArea = 2 * (w + (l > 0 ? l : w)) * h
      }
    } else if (elementType === 'beam') {
      if (isVariable) {
        // Tapered/haunched girder: soffit trapezoid + 2 side trapezoids
        const w1 = Math.max(0, Number.parseFloat(widthStart) || w)
        const d1 = Math.max(0, Number.parseFloat(depthStart) || h)
        const w2 = Math.max(0, Number.parseFloat(widthEnd) || w1)
        const d2 = Math.max(0, Number.parseFloat(depthEnd) || d1)
        const beamL = l > 0 ? l : 1
        unitArea = (((w1 + w2) / 2) + (d1 + d2)) * beamL
      } else {
        unitArea = (w + 2 * h) * (l > 0 ? l : 1)
      }
    } else if (elementType === 'slab') {
      unitArea = (l * w) + (2 * (l + w) * (h > 0 ? h : 0.125))
    } else if (elementType === 'footing') {
      unitArea = 2 * (l + w) * (h > 0 ? h : 0.30)
    }

    return {
      unitArea,
      totalArea: unitArea * q,
      length: l,
      width: w,
      heightDepth: h,
      quantity: q,
      type: elementType,
      isVariable,
    }
  }, [elementType, isVariable, length, width, heightDepth, quantity, widthStart, depthStart, widthEnd, depthEnd])

  // Consolidated contact area (either active single item, or item schedule)
  const totalArea = useMemo(() => {
    if (items.length > 0) {
      return items.reduce((acc, item) => acc + item.totalArea, 0)
    }
    return currentContactArea.totalArea
  }, [items, currentContactArea])

  // Material & cutting calculations
  const takeoff = useMemo(() => {
    const selectedPlywood = PLYWOOD_SIZES.find((p) => p.id === plywoodChoice) || PLYWOOD_SIZES[0]
    const selectedLumber = LUMBER_SIZES.find((l) => l.id === lumberChoice) || LUMBER_SIZES[0]
    const waste = Math.max(0, Number.parseFloat(wastePercent) || 10) / 100
    const spacing = Number.parseFloat(studSpacing) || 0.30

    // Plywood Calculations
    const sheetArea = selectedPlywood.area // 2.9768 m²
    const netSheets = sheetArea > 0 ? totalArea / sheetArea : 0
    const grossSheetsExact = netSheets * (1 + waste)
    const totalSheets = Math.ceil(grossSheetsExact)
    const wasteSheets = Math.max(0, totalSheets - Math.floor(netSheets))

    // 2D Cutting Optimization Estimate
    // Typical cuts: columns typically take 2-4 vertical strips from a 1.22x2.44m sheet
    const avgPieceWidth = Number.parseFloat(width) || 0.40
    const cutsPerSheetWidth = avgPieceWidth > 0 ? Math.floor(1.22 / avgPieceWidth) : 2
    const usableWidthYield = (cutsPerSheetWidth * avgPieceWidth) / 1.22
    const offcutPercentage = Math.max(0, Math.min(30, (1 - usableWidthYield) * 100))

    // Framing Lumber Calculations (Philippine standard: studs @ spacing, wales @ 0.60m, shores/braces)
    // Detailed calculation:
    // 1. Studs: perimeter / spacing * height
    // 2. Wales/Ribs: 2 to 3 sets around perimeter
    // Rule-of-thumb comparison: 5.5 to 6.5 bd.ft per m² for 2x2, 7.5 to 8.5 for 2x3
    const bdftFactor = selectedLumber.id === '2x2' ? 5.8 : selectedLumber.id === '2x3' ? 7.6 : 9.2
    const netBdft = totalArea * bdftFactor
    const totalBdft = Math.ceil(netBdft * (1 + waste))

    // Equivalent pieces of 12-foot commercial lumber
    // 1 piece of 2x2x12ft = 4 bd.ft; 2x3x12ft = 6 bd.ft
    const bdftPer12ftPiece = (selectedLumber.thicknessInches * selectedLumber.widthInches * 12) / 12
    const lumberPieces12ft = Math.ceil(totalBdft / bdftPer12ftPiece)

    // Fasteners & Consumables
    // Common Wire Nails (CWN): ~0.08 kg per m²
    const cwnNailsKg = Math.ceil(totalArea * 0.08 * (1 + waste))
    // Tie Wire (#16): ~0.04 kg per m²
    const tieWireKg = Math.ceil(totalArea * 0.04 * (1 + waste))
    // Form Release Oil: ~0.15 liters per m²
    const formOilLiters = (totalArea * 0.15).toFixed(1)

    return {
      selectedPlywood,
      selectedLumber,
      wastePercent: (waste * 100).toFixed(0),
      netSheets: netSheets.toFixed(2),
      totalSheets,
      wasteSheets,
      offcutPercentage: offcutPercentage.toFixed(1),
      totalBdft,
      lumberPieces12ft,
      cwnNailsKg,
      tieWireKg,
      formOilLiters,
    }
  }, [totalArea, plywoodChoice, lumberChoice, wastePercent, studSpacing, width])

  // Presets
  const applyPreset = (preset) => {
    setElementType(preset.type)
    setIsVariable(!!preset.isVariable)
    setWidth(preset.width)
    setHeightDepth(preset.height)
    setLength(preset.length)
    setQuantity(preset.count)
    if (preset.isVariable) {
      setWidthStart(preset.w1 || preset.width)
      setDepthStart(preset.d1 || preset.depth)
      setWidthEnd(preset.w2 || preset.width)
      setDepthEnd(preset.d2 || preset.depth)
    }
    setItemName(preset.label.split(' ')[0])
  }

  // Add item to schedule
  const addItemToSchedule = () => {
    if (currentContactArea.totalArea <= 0) return
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
      totalArea: currentContactArea.totalArea,
    }
    setItems((prev) => [...prev, newItem])
    setItemName('')
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const clearSchedule = () => {
    setItems([])
  }

  const copySummary = () => {
    const text = `EstiMate Formwork & Sheet Cutting Takeoff:
- Total Contact Surface Area: ${totalArea.toFixed(2)} m²
- Plywood Specs: ${takeoff.selectedPlywood.name} (1.22m × 2.44m)
- Total 4x8 Sheets Required (${takeoff.wastePercent}% waste): ${takeoff.totalSheets} pcs
- Framing Lumber Specs: ${takeoff.selectedLumber.name}
- Total Lumber Volume: ${takeoff.totalBdft} bd.ft (~${takeoff.lumberPieces12ft} pcs of 12ft lumber)
- Common Wire Nails (CWN): ${takeoff.cwnNailsKg} kg
- #16 G.I. Tie Wire: ${takeoff.tieWireKg} kg
- Form Release Oil: ${takeoff.formOilLiters} liters`

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
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </span>
              <div className="leading-none">
                <span className="text-xl font-bold tracking-tight text-white">
                  Esti<span className="text-[#F98125]">Mate</span>
                </span>
                <span className="block text-[0.6rem] font-medium tracking-widest text-[#7CA3E2] uppercase">
                  Formwork &amp; Sheet Cutting Optimizer
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
        {/* Module Title & Presets */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5B84C4]/40 bg-[#193A6F]/50 px-3.5 py-1 text-xs font-semibold text-blue-200 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#F98125] animate-pulse" />
              Structural Carpentry &amp; Falsework
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
              Formwork &amp; Sheet Cutting Optimizer
            </h1>
            <p className="text-xs sm:text-sm text-[#7CA3E2] mt-1">
              Compute contact surface area, optimal 4x8 ft plywood sheets, framing lumber (bd.ft), and fasteners with 2D cutting nesting.
            </p>
          </div>

          {/* Quick Presets */}
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

        {/* 2-Column Grid: Form Inputs vs Results Dashboard */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Form Inputs (7 Cols) */}
          <section className="space-y-6 lg:col-span-7">
            {/* 1. Element Geometry Card */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-100 text-[#F98125] font-mono text-xs">
                    01
                  </span>
                  Structural Element Geometry
                </h2>
                <span className="text-xs text-slate-400">Dimensions in meters (m)</span>
              </div>

              {/* Element Type Selector */}
              <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { id: 'column', label: 'Column' },
                  { id: 'beam', label: 'Beam / Girder' },
                  { id: 'slab', label: 'Floor Slab' },
                  { id: 'footing', label: 'Footing' },
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

              {/* Section Profile Toggle (Columns & Beams) */}
              {(elementType === 'column' || elementType === 'beam') && (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#11224D]" />
                      Member Cross-Section Profile:
                    </span>
                    <span className="text-[0.65rem] font-bold uppercase text-[#F98125]">
                      {isVariable ? 'Non-Prismatic (Trapezoidal Faces)' : 'Constant Section'}
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
                      Variable Section (Tapered)
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Inputs: Variable vs Constant */}
              {isVariable && (elementType === 'column' || elementType === 'beam') ? (
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
                        {elementType === 'column' ? 'Height / Floor Clearance (m)' : 'Span Length (m)'}
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="formwork-length" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {elementType === 'column' ? 'Column Width / Side A (m)' : 'Element Length (m)'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="formwork-length"
                      type="number"
                      step="0.05"
                      min="0"
                      inputMode="decimal"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="0.40"
                      className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="formwork-width" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {elementType === 'column' ? 'Column Depth / Side B (m)' : 'Element Width (m)'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="formwork-width"
                      type="number"
                      step="0.05"
                      min="0"
                      inputMode="decimal"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="0.40"
                      className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="formwork-height" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {elementType === 'column' ? 'Height / Floor Clearance (m)' : elementType === 'slab' ? 'Slab Thickness (m)' : 'Beam Depth (m)'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="formwork-height"
                      type="number"
                      step="0.05"
                      min="0"
                      inputMode="decimal"
                      value={heightDepth}
                      onChange={(e) => setHeightDepth(e.target.value)}
                      placeholder="3.00"
                      className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="formwork-qty" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Element Quantity (pcs) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="formwork-qty"
                      type="number"
                      step="1"
                      min="1"
                      inputMode="numeric"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="4"
                      className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-mono"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Active element contact area preview */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
                <span className="font-mono text-[0.72rem]">
                  Current Element Contact Area: {currentContactArea.unitArea.toFixed(2)} m² × {quantity} pcs
                </span>
                <span className="font-bold text-[#11224D]">
                  = {currentContactArea.totalArea.toFixed(2)} m²
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
                    Structural Elements Schedule ({items.length} items)
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
                        <th className="pb-2">Dimensions</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2 text-right">Contact Area</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-bold text-slate-800">{item.name}</td>
                          <td className="py-2.5 uppercase text-[0.68rem] text-slate-500 font-medium">{item.type}</td>
                          <td className="py-2.5 font-mono text-slate-600">{item.dimensions}</td>
                          <td className="py-2.5 font-mono text-slate-700">{item.quantity}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-slate-900">{item.totalArea.toFixed(2)} m²</td>
                          <td className="py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 font-bold px-1"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300 font-bold text-slate-900">
                        <td colSpan={4} className="pt-2 text-right">Total Schedule Contact Area:</td>
                        <td className="pt-2 text-right font-mono text-sm text-[#F98125]">{totalArea.toFixed(2)} m²</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* 2. Formwork Materials & Stiffeners Setup */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-100 text-[#F98125] font-mono text-xs">
                    02
                  </span>
                  Materials, Lumber &amp; Wastage
                </h2>
                <span className="text-xs text-slate-400">Philippine Commercial Standards</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="plywood-type" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Sheathing Material (4x8 ft) <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="plywood-type"
                    value={plywoodChoice}
                    onChange={(e) => setPlywoodChoice(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-medium text-slate-800"
                  >
                    {PLYWOOD_SIZES.map((ply) => (
                      <option key={ply.id} value={ply.id}>
                        {ply.name} (~{ply.reusableTimes} uses)
                      </option>
                    ))}
                  </select>
                  <p className="text-[0.68rem] text-slate-400 mt-1">
                    Standard 1.22m × 2.44m = 2.977 m² surface coverage
                  </p>
                </div>

                <div>
                  <label htmlFor="lumber-size" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Framing Lumber Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="lumber-size"
                    value={lumberChoice}
                    onChange={(e) => setLumberChoice(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-medium text-slate-800"
                  >
                    {LUMBER_SIZES.map((lum) => (
                      <option key={lum.id} value={lum.id}>
                        {lum.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[0.68rem] text-slate-400 mt-1">
                    Vertical ribs, horizontal wales, and bracing
                  </p>
                </div>

                <div>
                  <label htmlFor="waste-percent" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Cutting Waste Margin (%)
                  </label>
                  <input
                    id="waste-percent"
                    type="number"
                    step="1"
                    min="0"
                    max="30"
                    value={wastePercent}
                    onChange={(e) => setWastePercent(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-mono"
                  />
                  <p className="text-[0.68rem] text-slate-400 mt-1">Standard DPWH/PRC default is 10%</p>
                </div>

                <div>
                  <label htmlFor="stud-spacing" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Rib / Stud Spacing (m)
                  </label>
                  <select
                    id="stud-spacing"
                    value={studSpacing}
                    onChange={(e) => setStudSpacing(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-medium text-slate-800"
                  >
                    <option value="0.30">0.30m (Heavy Concrete Pressure / Columns)</option>
                    <option value="0.40">0.40m (Standard Beams &amp; Slabs)</option>
                    <option value="0.50">0.50m (Light Footing Forms)</option>
                  </select>
                  <p className="text-[0.68rem] text-slate-400 mt-1">Center-to-center framing stiffener spacing</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Takeoff Results Card & Cutting Optimization (5 Cols) */}
          <aside className="space-y-6 lg:col-span-5">
            {/* Primary Hero Results Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border-2 border-[#F98125] bg-gradient-to-b from-[#193A6F] to-[#11224D] p-6 shadow-2xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-[#F98125]/15 blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#2C599D]/70 pb-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#F98125]">
                    Takeoff Output
                  </span>
                  <h3 className="text-lg font-extrabold text-white">Formwork Bill of Materials</h3>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[0.65rem] font-bold text-emerald-300">
                  +{takeoff.wastePercent}% Waste Factored
                </span>
              </div>

              {/* Main Metric 1: Total Contact Area */}
              <div className="mt-5 rounded-2xl bg-[#07132F]/60 p-4 border border-[#2C599D]/60 backdrop-blur-sm">
                <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#7CA3E2]">
                  Total Formwork Contact Surface Area
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                    {totalArea.toFixed(2)}
                  </span>
                  <span className="text-base font-bold text-blue-200">sqm (m²)</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[0.7rem] text-[#7CA3E2]">
                  <span>Net Sheet Demand: <strong className="text-white">{takeoff.netSheets} pcs</strong></span>
                  <span>·</span>
                  <span>Est. Offcut: <strong className="text-white">~{takeoff.offcutPercentage}%</strong></span>
                </div>
              </div>

              {/* Main Metric 2: Total 4x8 Plywood Sheets */}
              <div className="mt-4 rounded-2xl bg-[#F98125] p-5 shadow-lg shadow-orange-950/40 text-[#07132F]">
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-orange-950/80">
                    4' × 8' Plywood Sheets Required
                  </span>
                  <span className="rounded-md bg-white/30 px-2 py-0.5 text-[0.65rem] font-extrabold text-white">
                    {takeoff.selectedPlywood.thickness}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                    {takeoff.totalSheets}
                  </span>
                  <span className="text-lg font-black text-[#07132F]">sheets (pcs)</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-orange-950/90 leading-tight">
                  {takeoff.selectedPlywood.name} · Includes {takeoff.wasteSheets} offcut/cutting allowance sheet(s).
                </p>
              </div>

              {/* Metric 3: Framing Lumber Volume */}
              <div className="mt-4 rounded-2xl bg-[#07132F]/60 p-4 border border-[#2C599D]/60">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#7CA3E2]">
                    Framing Lumber ({takeoff.selectedLumber.name.split(' ')[0]})
                  </span>
                  <span className="text-[0.68rem] font-bold text-blue-200">
                    ≈ {takeoff.lumberPieces12ft} pcs @ 12ft
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-white font-mono">
                    {takeoff.totalBdft}
                  </span>
                  <span className="text-base font-bold text-blue-200">board feet (bd.ft)</span>
                </div>
              </div>

              {/* Consumables Breakdown */}
              <div className="mt-5 space-y-2 border-t border-[#2C599D]/60 pt-4 text-xs">
                <div className="flex justify-between py-1 text-[#7CA3E2]">
                  <span>Common Wire Nails (2" - 3"):</span>
                  <span className="font-mono text-white">{takeoff.cwnNailsKg} kg</span>
                </div>
                <div className="flex justify-between py-1 text-[#7CA3E2]">
                  <span>#16 G.I. Tie Wire:</span>
                  <span className="font-mono text-white">{takeoff.tieWireKg} kg</span>
                </div>
                <div className="flex justify-between py-1 text-[#7CA3E2]">
                  <span>Form Release Agent / Oil:</span>
                  <span className="font-mono text-white">{takeoff.formOilLiters} liters</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={copySummary}
                  className="flex-1 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/25 flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-white"
                >
                  {copied ? (
                    <>
                      <span className="text-emerald-400">✓</span> Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy Takeoff Summary
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-white/10 px-3 py-2.5 text-xs font-bold text-blue-200 transition hover:bg-white/20 hover:text-white"
                  title="Print Formwork Calculation Sheet"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* 2D Cutting Nesting Diagram Card */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-[#193A6F]/40 p-5 text-xs text-[#7CA3E2] space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[0.7rem] flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#F98125]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m21 16-9 5-9-5V8l9-5 9 5v8Z" />
                  <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
                </svg>
                2D Sheet Cutting Pattern Logic (1.22m × 2.44m)
              </h4>
              <div className="rounded-xl border border-[#2C599D]/80 bg-[#07132F]/80 p-3.5 space-y-2">
                <div className="flex justify-between items-center text-[0.68rem]">
                  <span className="text-white font-mono">Standard 4x8 Panel: 1.22m × 2.44m</span>
                  <span className="text-orange-400 font-bold">{takeoff.offcutPercentage}% Est. Kerf/Offcut</span>
                </div>
                {/* Visual miniature representation of sheet nesting */}
                <div className="relative h-20 w-full rounded-lg border border-dashed border-[#F98125]/70 bg-blue-950/50 p-1 flex gap-1 overflow-hidden">
                  {isVariable ? (
                    <>
                      <div className="h-full flex-1 rounded bg-[#F98125]/30 border border-[#F98125] flex flex-col items-center justify-center text-[0.65rem] font-bold text-white leading-tight">
                        <span>Trapezoid Face 1</span>
                        <span className="text-[0.6rem] text-orange-200 font-mono">({widthStart}m → {widthEnd}m)</span>
                      </div>
                      <div className="h-full flex-1 rounded bg-[#FB923C]/30 border border-[#FB923C] flex flex-col items-center justify-center text-[0.65rem] font-bold text-white leading-tight">
                        <span>Trapezoid Face 2</span>
                        <span className="text-[0.6rem] text-orange-200 font-mono">({widthStart}m → {widthEnd}m)</span>
                      </div>
                      <div className="h-full w-12 rounded bg-slate-700/40 border border-slate-600 flex items-center justify-center text-[0.6rem] text-slate-400">
                        Offcut
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-full flex-1 rounded bg-[#F98125]/30 border border-[#F98125] flex items-center justify-center text-[0.65rem] font-bold text-white">
                        Face 1 ({width}m)
                      </div>
                      <div className="h-full flex-1 rounded bg-[#F98125]/30 border border-[#F98125] flex items-center justify-center text-[0.65rem] font-bold text-white">
                        Face 2 ({width}m)
                      </div>
                      <div className="h-full w-12 rounded bg-slate-700/40 border border-slate-600 flex items-center justify-center text-[0.6rem] text-slate-400">
                        Offcut
                      </div>
                    </>
                  )}
                </div>
                <p className="text-[0.68rem] text-slate-400 leading-relaxed">
                  {isVariable
                    ? 'Complementary diagonal ripping across the 1.22m panel yields paired trapezoidal faces with minimal offcuts. Offcut triangles are repurposed as kicker blocks.'
                    : 'Cuts are oriented along standard grain direction. Offcuts under 0.30m are recycled into column yokes, cleats, and kicker blocks.'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
