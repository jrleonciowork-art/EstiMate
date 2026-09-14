import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Pitch configurations and multipliers
const PITCH_OPTIONS = [
  { value: 'flat', label: 'Flat Roof (0° · 1.000x)', multiplier: 1.0, angle: 0, description: 'Concrete deck or minimum slope metal roof' },
  { value: '1/4', label: '1/4 Pitch (14.0° · 1.031x)', multiplier: 1.0308, angle: 14.04, description: 'Low slope roof (3:12 slope ratio)' },
  { value: '1/3', label: '1/3 Pitch (18.4° · 1.054x)', multiplier: 1.0541, angle: 18.43, description: 'Medium slope standard roof (4:12 slope ratio)' },
  { value: '1/2', label: '1/2 Pitch (26.6° · 1.118x)', multiplier: 1.1180, angle: 26.57, description: 'Standard Philippine residential gable/hip (6:12 slope ratio)' },
  { value: 'custom', label: 'Custom Degree Angle (°)', multiplier: null, angle: null, description: 'Specify exact slope angle in degrees' },
]

// Material profiles and effective widths
const MATERIAL_OPTIONS = [
  {
    id: 'corrugated',
    name: 'Corrugated GI Sheet',
    effectiveWidth: 0.70,
    nominalWidth: 0.80,
    gauge: 'Gauge 26 (0.40mm)',
    description: 'Traditional 32" wave profile with 1.5 to 2.5 corrugation side lap',
  },
  {
    id: 'ribtype',
    name: 'Rib-Type Prepainted Sheet',
    effectiveWidth: 1.00,
    nominalWidth: 1.05,
    gauge: 'Gauge 24-26 (0.40 - 0.50mm)',
    description: 'Modern trapezoidal commercial profile with 1,000mm net coverage',
  },
]

// Standard Philippine commercial sheet lengths
const LENGTH_OPTIONS = [
  { value: '2.44', label: '8 ft (2.44 m) · Standard' },
  { value: '3.05', label: '10 ft (3.05 m) · Standard' },
  { value: '3.66', label: '12 ft (3.66 m) · Standard' },
  { value: 'custom', label: 'Continuous Long-Span / Custom Length' },
]

// Quick preset dimensions
const PRESETS = [
  { label: 'Bungalow 8m × 6m', length: '8.00', width: '6.00', overhang: '0.80', pitch: '1/3' },
  { label: '2-Storey 10m × 8m', length: '10.00', width: '8.00', overhang: '1.00', pitch: '1/2' },
  { label: 'Warehouse 20m × 12m', length: '20.00', width: '12.00', overhang: '0.60', pitch: '1/4' },
]

export default function RoofEstimator() {
  const { user, signOut } = useAuth()

  // Form State
  const [length, setLength] = useState('10.00')
  const [width, setWidth] = useState('8.00')
  const [overhang, setOverhang] = useState('0.80')
  const [pitch, setPitch] = useState('1/2')
  const [customAngle, setCustomAngle] = useState('25')
  const [material, setMaterial] = useState('ribtype')
  const [sheetLengthChoice, setSheetLengthChoice] = useState('2.44')
  const [customSheetLength, setCustomSheetLength] = useState('6.00')
  const [copied, setCopied] = useState(false)

  // Calculations
  const takeoff = useMemo(() => {
    const l = Math.max(0, Number.parseFloat(length) || 0)
    const w = Math.max(0, Number.parseFloat(width) || 0)
    const ov = Math.max(0, Number.parseFloat(overhang) || 0)

    // 1. Footprint Dimensions (eaves to eaves)
    const totalFootprintLength = l + 2 * ov
    const totalFootprintWidth = w + 2 * ov
    const flatFootprint = totalFootprintLength * totalFootprintWidth

    // 2. Pitch Multiplier
    let multiplier = 1.0
    let effectiveAngle = 0
    if (pitch === 'custom') {
      const angleDeg = Math.min(80, Math.max(0, Number.parseFloat(customAngle) || 0))
      effectiveAngle = angleDeg
      const rad = (angleDeg * Math.PI) / 180
      multiplier = Math.cos(rad) > 0 ? 1 / Math.cos(rad) : 1.0
    } else {
      const found = PITCH_OPTIONS.find((p) => p.value === pitch)
      if (found) {
        multiplier = found.multiplier
        effectiveAngle = found.angle
      }
    }

    // 3. True Roof Area (sqm)
    const trueRoofArea = flatFootprint * multiplier

    // 4. Effective Sheet Width & Commercial Sheet Length
    const selectedMat = MATERIAL_OPTIONS.find((m) => m.id === material) || MATERIAL_OPTIONS[1]
    const effectiveWidth = selectedMat.effectiveWidth

    let effectiveSheetLength = 2.44
    if (sheetLengthChoice === 'custom') {
      effectiveSheetLength = Math.max(0.5, Number.parseFloat(customSheetLength) || 2.44)
    } else {
      effectiveSheetLength = Number.parseFloat(sheetLengthChoice) || 2.44
    }

    // Area covered per sheet
    const sheetCoverageArea = effectiveWidth * effectiveSheetLength

    // 5. Raw Sheet Count & 10% Waste Factor
    const rawSheetCount = sheetCoverageArea > 0 ? trueRoofArea / sheetCoverageArea : 0
    const wasteFactor = 1.10
    const totalSheetsWithWaste = Math.ceil(rawSheetCount * wasteFactor)
    const wasteSheets = Math.max(0, totalSheetsWithWaste - Math.floor(rawSheetCount))

    // Total linear meters of roofing required
    const totalLinearMeters = effectiveWidth > 0 ? (trueRoofArea / effectiveWidth) * wasteFactor : 0

    // Additional hardware estimates (standard Philippine QS rules of thumb)
    // Tekscrews: ~4.5 pcs per sqm of roof
    const estimatedTekscrews = Math.ceil(trueRoofArea * 4.5 * 1.05)
    // Ridge roll / Flashing length: along total length plus 10% overlap
    const ridgeRollLength = (totalFootprintLength * 1.10).toFixed(1)
    const ridgeRollPcs = Math.ceil((totalFootprintLength * 1.10) / 2.20) // standard 2.44m ridge roll with 200mm overlap

    return {
      totalFootprintLength,
      totalFootprintWidth,
      flatFootprint,
      multiplier,
      effectiveAngle,
      trueRoofArea,
      selectedMat,
      effectiveWidth,
      effectiveSheetLength,
      sheetCoverageArea,
      rawSheetCount,
      totalSheetsWithWaste,
      wasteSheets,
      totalLinearMeters,
      estimatedTekscrews,
      ridgeRollLength,
      ridgeRollPcs,
    }
  }, [length, width, overhang, pitch, customAngle, material, sheetLengthChoice, customSheetLength])

  // Quick Preset Handler
  const applyPreset = (preset) => {
    setLength(preset.length)
    setWidth(preset.width)
    setOverhang(preset.overhang)
    setPitch(preset.pitch)
  }

  // Copy Summary
  const copySummary = () => {
    const text = `EstiMate Roof Takeoff Summary:
- Building: ${length}m × ${width}m (Overhang: ${overhang}m)
- Total Footprint: ${takeoff.totalFootprintLength.toFixed(2)}m × ${takeoff.totalFootprintWidth.toFixed(2)}m (${takeoff.flatFootprint.toFixed(2)} sqm)
- Roof Pitch: ${pitch === 'custom' ? `${customAngle}°` : pitch} (Multiplier: ${takeoff.multiplier.toFixed(3)}x)
- True Roof Area: ${takeoff.trueRoofArea.toFixed(2)} sqm
- Material: ${takeoff.selectedMat.name} (Effective Width: ${takeoff.effectiveWidth}m)
- Sheet Length: ${takeoff.effectiveSheetLength}m
- Total Sheet Count (10% waste): ${takeoff.totalSheetsWithWaste} pcs
- Total Linear Meters: ${takeoff.totalLinearMeters.toFixed(2)} m
- Estimated Tekscrews: ${takeoff.estimatedTekscrews} pcs
- Ridge Roll (2.44m pcs): ${takeoff.ridgeRollPcs} pcs`

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
                  <path d="m3 11 9-9 9 9M4 10.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9.5" />
                  <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
                </svg>
              </span>
              <div className="leading-none">
                <span className="text-xl font-bold tracking-tight text-white">
                  Esti<span className="text-[#F98125]">Mate</span>
                </span>
                <span className="block text-[0.6rem] font-medium tracking-widest text-[#7CA3E2] uppercase">
                  Roofing Takeoff Suite
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

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Module Title & Dimension Presets */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5B84C4]/40 bg-[#193A6F]/50 px-3.5 py-1 text-xs font-semibold text-blue-200 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#F98125] animate-pulse" />
              Structural &amp; Architectural Takeoff
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
              Roof Estimator &amp; Sheet Takeoff
            </h1>
            <p className="text-xs sm:text-sm text-[#7CA3E2] mt-1">
              Accurately compute flat footprint, true roof area via pitch multiplier, and commercial sheet counts with 10% standard waste.
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
            {/* 1. Building Geometry Card */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-100 text-[#F98125] font-mono text-xs">
                    01
                  </span>
                  Building Dimensions &amp; Overhang
                </h2>
                <span className="text-xs text-slate-400">All units in meters (m)</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="roof-length" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Building Length (m) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="roof-length"
                    type="number"
                    step="0.10"
                    min="0"
                    inputMode="decimal"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="10.00"
                    className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-mono"
                    required
                  />
                  <p className="text-[0.68rem] text-slate-400 mt-1">Eaves wall length</p>
                </div>

                <div>
                  <label htmlFor="roof-width" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Building Width (m) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="roof-width"
                    type="number"
                    step="0.10"
                    min="0"
                    inputMode="decimal"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="8.00"
                    className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-mono"
                    required
                  />
                  <p className="text-[0.68rem] text-slate-400 mt-1">Gable wall width</p>
                </div>

                <div>
                  <label htmlFor="roof-overhang" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Eaves / Overhang (m)
                  </label>
                  <input
                    id="roof-overhang"
                    type="number"
                    step="0.05"
                    min="0"
                    inputMode="decimal"
                    value={overhang}
                    onChange={(e) => setOverhang(e.target.value)}
                    placeholder="0.80"
                    className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-mono"
                  />
                  <p className="text-[0.68rem] text-slate-400 mt-1">Projection on all sides</p>
                </div>
              </div>

              {/* Footprint formula preview */}
              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2 border border-slate-200/80">
                <span className="font-mono text-[0.72rem]">
                  Footprint = ({length || 0} + 2×{overhang || 0}) × ({width || 0} + 2×{overhang || 0})
                </span>
                <span className="font-bold text-[#11224D]">
                  = {takeoff.flatFootprint.toFixed(2)} m²
                </span>
              </div>
            </div>

            {/* 2. Roof Pitch & Slope Card */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-100 text-[#F98125] font-mono text-xs">
                    02
                  </span>
                  Roof Pitch &amp; Slope Geometry
                </h2>
                <span className="text-xs font-semibold text-[#F98125]">
                  Multiplier: {takeoff.multiplier.toFixed(4)}x
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="roof-pitch" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Roof Pitch Ratio <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="roof-pitch"
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-medium text-slate-800"
                  >
                    {PITCH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[0.68rem] text-slate-400 mt-1">
                    {PITCH_OPTIONS.find((p) => p.value === pitch)?.description}
                  </p>
                </div>

                {pitch === 'custom' ? (
                  <div>
                    <label htmlFor="roof-custom-angle" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Custom Pitch Angle (Degrees °) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="roof-custom-angle"
                      type="number"
                      step="0.5"
                      min="1"
                      max="75"
                      inputMode="decimal"
                      value={customAngle}
                      onChange={(e) => setCustomAngle(e.target.value)}
                      placeholder="25"
                      className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-mono"
                    />
                    <p className="text-[0.68rem] text-slate-400 mt-1">Multiplier = 1 / cos({customAngle || 0}°)</p>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center rounded-xl bg-orange-50/60 p-3.5 border border-orange-200/50">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-orange-800">
                      Slope Angle Reference
                    </span>
                    <p className="text-sm font-bold text-orange-950 mt-0.5">
                      ≈ {takeoff.effectiveAngle.toFixed(1)}° Slope Angle
                    </p>
                    <p className="text-[0.7rem] text-orange-800/80">
                      Area factor expands flat footprint by {((takeoff.multiplier - 1) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Material & Commercial Sheet Specifications */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-100 text-[#F98125] font-mono text-xs">
                    03
                  </span>
                  Roofing Material &amp; Sheet Specs
                </h2>
                <span className="text-xs text-slate-400">Standard Philippine Profiles</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="roof-material" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Material Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="roof-material"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-medium text-slate-800"
                  >
                    {MATERIAL_OPTIONS.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.name} ({mat.effectiveWidth.toFixed(2)}m effective)
                      </option>
                    ))}
                  </select>
                  <p className="text-[0.68rem] text-slate-400 mt-1">
                    {takeoff.selectedMat.description}
                  </p>
                </div>

                <div>
                  <label htmlFor="roof-sheet-length" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Commercial Sheet Length <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="roof-sheet-length"
                    value={sheetLengthChoice}
                    onChange={(e) => setSheetLengthChoice(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-medium text-slate-800"
                  >
                    {LENGTH_OPTIONS.map((len) => (
                      <option key={len.value} value={len.value}>
                        {len.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[0.68rem] text-slate-400 mt-1">
                    Coverage per sheet: {(takeoff.effectiveWidth * takeoff.effectiveSheetLength).toFixed(3)} m²
                  </p>
                </div>
              </div>

              {sheetLengthChoice === 'custom' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label htmlFor="roof-custom-length" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Custom Long-Span Length (m) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="roof-custom-length"
                    type="number"
                    step="0.10"
                    min="0.5"
                    inputMode="decimal"
                    value={customSheetLength}
                    onChange={(e) => setCustomSheetLength(e.target.value)}
                    placeholder="6.00"
                    className="w-full sm:w-1/2 border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-mono"
                  />
                  <p className="text-[0.68rem] text-slate-400 mt-1">Continuous roll-formed cut to rafter slope</p>
                </div>
              )}
            </div>
          </section>

          {/* Right Column: Takeoff Results Card & BOM (5 Cols) */}
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
                  <h3 className="text-lg font-extrabold text-white">Roofing Quantity Takeoff</h3>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[0.65rem] font-bold text-emerald-300">
                  +10% Waste Factored
                </span>
              </div>

              {/* Main Metric 1: True Roof Area */}
              <div className="mt-5 rounded-2xl bg-[#07132F]/60 p-4 border border-[#2C599D]/60 backdrop-blur-sm">
                <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#7CA3E2]">
                  True Roof Area (with Slope Multiplier)
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                    {takeoff.trueRoofArea.toFixed(2)}
                  </span>
                  <span className="text-base font-bold text-blue-200">sqm (m²)</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[0.7rem] text-[#7CA3E2]">
                  <span>Flat Footprint: <strong className="text-white">{takeoff.flatFootprint.toFixed(2)} m²</strong></span>
                  <span>·</span>
                  <span>Pitch Factor: <strong className="text-white">{takeoff.multiplier.toFixed(3)}x</strong></span>
                </div>
              </div>

              {/* Main Metric 2: Total Sheet Count */}
              <div className="mt-4 rounded-2xl bg-[#F98125] p-5 shadow-lg shadow-orange-950/40 text-[#07132F]">
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-orange-950/80">
                    Total Sheets Required
                  </span>
                  <span className="rounded-md bg-white/30 px-2 py-0.5 text-[0.65rem] font-extrabold text-white">
                    {takeoff.selectedMat.name.split(' ')[0]}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                    {takeoff.totalSheetsWithWaste}
                  </span>
                  <span className="text-lg font-black text-[#07132F]">pcs</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-orange-950/90 leading-tight">
                  Based on {takeoff.effectiveWidth.toFixed(2)}m effective width × {takeoff.effectiveSheetLength}m length + 10% cutting waste.
                </p>
              </div>

              {/* Bill of Quantities / Materials Summary */}
              <div className="mt-5 space-y-2 border-t border-[#2C599D]/60 pt-4 text-xs">
                <div className="flex justify-between py-1 text-[#7CA3E2]">
                  <span>Net Sheet Demand:</span>
                  <span className="font-mono text-white">{takeoff.rawSheetCount.toFixed(1)} pcs</span>
                </div>
                <div className="flex justify-between py-1 text-[#7CA3E2]">
                  <span>10% Waste Allowance:</span>
                  <span className="font-mono text-white">+{takeoff.wasteSheets} pcs</span>
                </div>
                <div className="flex justify-between py-1 text-[#7CA3E2]">
                  <span>Total Linear Meters:</span>
                  <span className="font-mono text-white">{takeoff.totalLinearMeters.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between py-1 text-[#7CA3E2]">
                  <span>Estimated Tekscrews (pcs):</span>
                  <span className="font-mono text-white">{takeoff.estimatedTekscrews} pcs</span>
                </div>
                <div className="flex justify-between py-1 text-[#7CA3E2]">
                  <span>Ridge Roll / Flashing:</span>
                  <span className="font-mono text-white">{takeoff.ridgeRollLength} m ({takeoff.ridgeRollPcs} pcs @ 2.44m)</span>
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
                  title="Print Calculation Sheet"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* Quantity Surveyor Engineering Notes Card */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-[#193A6F]/40 p-5 text-xs text-[#7CA3E2] space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[0.7rem] flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#F98125]" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Philippine QS Installation Notes
              </h4>
              <p>
                • <strong>Corrugated GI</strong> uses 0.70m effective width due to 1.5–2 corrugation side lap requirements for heavy rainfall.
              </p>
              <p>
                • <strong>Rib-Type</strong> provides 1.00m nominal effective coverage per sheet with mechanical anti-siphon capillary grooves.
              </p>
              <p>
                • <strong>10% Waste Factor</strong> accounts for rafter end trims, side laps, and valley/hip angled cuts.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2C599D]/50 bg-[#0d1a3c] px-4 py-6 mt-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-[#7CA3E2] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} EstiMate · Pocket Quantity Surveying Suite for Philippine Sites</span>
          <nav aria-label="Legal footer links" className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
