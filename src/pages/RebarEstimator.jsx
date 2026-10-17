import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectsContext'

// Standard Philippine commercial steel bar sizes and unit weights (kg/m = d^2 / 162)
const REBAR_DIAMETERS = [
  { id: '10', name: '10mm Ø Defbar', diameter: 10, unitWeight: 0.617, grade: 'Grade 33 / 40', commonUse: 'Stirrups, column ties, slab temperature bars' },
  { id: '12', name: '12mm Ø Defbar', diameter: 12, unitWeight: 0.888, grade: 'Grade 40', commonUse: 'Slab main bars, light beams, tie beams' },
  { id: '16', name: '16mm Ø Defbar', diameter: 16, unitWeight: 1.579, grade: 'Grade 40 / 60', commonUse: 'Columns, girders, footing mats' },
  { id: '20', name: '20mm Ø Defbar', diameter: 20, unitWeight: 2.466, grade: 'Grade 60', commonUse: 'Heavy column verticals, transfer girders' },
  { id: '25', name: '25mm Ø Defbar', diameter: 25, unitWeight: 3.854, grade: 'Grade 60', commonUse: 'Multi-storey building columns and heavy foundations' },
  { id: '28', name: '28mm Ø Defbar', diameter: 28, unitWeight: 4.834, grade: 'Grade 60', commonUse: 'High-rise structural columns' },
  { id: '32', name: '32mm Ø Defbar', diameter: 32, unitWeight: 6.313, grade: 'Grade 60', commonUse: 'Bridge girders & heavy civil piers' },
]

const STOCK_LENGTHS = [6.0, 9.0, 12.0]

const PRESETS = [
  {
    label: 'Column Verticals & Ties',
    diameter: '16',
    stockStrategy: 'optimal',
    cuts: [
      { id: '1', mark: 'Main Verticals (Floor 1-2)', length: '3.60', count: '16' },
      { id: '2', mark: 'Main Verticals (Lap Splice)', length: '2.40', count: '8' },
      { id: '3', mark: 'Dowels / Starter Bars', length: '1.20', count: '16' },
    ],
  },
  {
    label: 'Beam Span + Stirrups',
    diameter: '16',
    stockStrategy: 'optimal',
    cuts: [
      { id: '1', mark: 'Top Negative Bars', length: '4.80', count: '6' },
      { id: '2', mark: 'Bottom Positive Bars', length: '5.40', count: '6' },
      { id: '3', mark: 'Support Anchors', length: '1.50', count: '12' },
    ],
  },
  {
    label: 'Isolated Footing Mat',
    diameter: '16',
    stockStrategy: 'optimal',
    cuts: [
      { id: '1', mark: 'Mat Bottom X-Dir', length: '1.45', count: '18' },
      { id: '2', mark: 'Mat Bottom Y-Dir', length: '1.45', count: '18' },
    ],
  },
]

export default function RebarEstimator() {
  const { user, signOut } = useAuth()
  const { projects, updateProjectData, createProject } = useProjects()
  const navigate = useNavigate()

  // Form State
  const [diameter, setDiameter] = useState('16')
  const [stockChoice, setStockChoice] = useState('optimal') // 'optimal', '6.0', '9.0', '12.0'
  const [cuts, setCuts] = useState([
    { id: '1', mark: 'Main Bars A', length: '3.60', count: '12' },
    { id: '2', mark: 'Main Bars B', length: '2.30', count: '16' },
    { id: '3', mark: 'Splice / Dowels', length: '1.15', count: '8' },
  ])
  const [newMark, setNewMark] = useState('')
  const [newLength, setNewLength] = useState('2.50')
  const [newCount, setNewCount] = useState('10')
  const [copied, setCopied] = useState(false)

  // Project Integration Modal State
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [targetProjectId, setTargetProjectId] = useState(projects[0]?.id || 'new')
  const [newProjectName, setNewProjectName] = useState('Structural Rebar Takeoff')
  const [applySuccessNotice, setApplySuccessNotice] = useState(null)

  // NSCP 2015 Section 425 Tension Lap Splice Parameters (Ld = 40 * db)
  const diaNum = Number.parseFloat(diameter) || 16
  const lapSpliceMeters = Math.round((40 * (diaNum / 1000)) * 100) / 100
  const maxCommercialStock = stockChoice === 'optimal' ? 12.0 : (Number.parseFloat(stockChoice) || 6.0)
  const overlengthCuts = cuts.filter((c) => (Number.parseFloat(c.length) || 0) > maxCommercialStock)
  const hasOverlengthCuts = overlengthCuts.length > 0

  // 1-Click Auto Splice Helper for Cuts Exceeding Commercial Stock
  const handleAutoSplice = () => {
    setCuts((prev) => {
      const next = []
      prev.forEach((c) => {
        const len = Number.parseFloat(c.length) || 0
        if (len > maxCommercialStock) {
          let rem = len
          let idx = 1
          while (rem > 0) {
            if (rem > maxCommercialStock) {
              next.push({
                id: `${c.id}_p${idx}`,
                mark: `${c.mark} (P${idx}: ${maxCommercialStock.toFixed(2)}m)`,
                length: maxCommercialStock.toFixed(2),
                count: c.count,
              })
              rem = rem - maxCommercialStock + lapSpliceMeters
              idx++
            } else {
              next.push({
                id: `${c.id}_p${idx}`,
                mark: `${c.mark} (P${idx} Lap End +${lapSpliceMeters}m Lap)`,
                length: Math.max(0.1, rem).toFixed(2),
                count: c.count,
              })
              rem = 0
            }
          }
        } else {
          next.push(c)
        }
      })
      return next
    })
  }

  // Apply to Active Project Handler
  const handleApplyToProject = () => {
    if (targetProjectId === 'new' || !targetProjectId) {
      const newId = createProject({
        name: newProjectName.trim() || 'Structural Rebar Takeoff',
        data: {
          rebar: {
            diameter,
            stockChoice,
            cuts,
          },
        },
      })
      setApplySuccessNotice('New project created and rebar takeoff applied!')
      setTimeout(() => navigate(`/project/${newId}`), 1000)
    } else {
      const target = projects.find((p) => p.id === targetProjectId)
      if (target) {
        updateProjectData(target.id, {
          ...target.data,
          rebar: {
            ...(target.data?.rebar || {}),
            diameter,
            stockChoice,
            cuts,
          },
        })
        setApplySuccessNotice(`Rebar takeoff successfully synced to "${target.name}"!`)
        setTimeout(() => navigate(`/project/${target.id}`), 1000)
      }
    }
  }

  // 1D Cutting Stock Optimizer (First-Fit Decreasing / Best-Fit Algorithm)
  const optimization = useMemo(() => {
    const selectedRebar = REBAR_DIAMETERS.find((r) => r.id === diameter) || REBAR_DIAMETERS[2]

    // 1. Expand cuts into flat array of pieces, segmenting any cuts > maxCommercialStock with lap splice
    const pieces = []
    cuts.forEach((c) => {
      const len = Math.max(0, Number.parseFloat(c.length) || 0)
      const qty = Math.max(0, Number.parseInt(c.count, 10) || 0)
      for (let i = 0; i < qty; i++) {
        if (len > 0) {
          if (len > maxCommercialStock) {
            let rem = len
            let seg = 1
            while (rem > 0) {
              if (rem > maxCommercialStock) {
                pieces.push({ length: maxCommercialStock, mark: `${c.mark} (P${seg})` })
                rem = rem - maxCommercialStock + lapSpliceMeters
                seg++
              } else {
                pieces.push({ length: Math.round(rem * 100) / 100, mark: `${c.mark} (End+Lap)` })
                rem = 0
              }
            }
          } else {
            pieces.push({ length: len, mark: c.mark })
          }
        }
      }
    })

    // Sort cuts descending (FFD heuristic)
    pieces.sort((a, b) => b.length - a.length)

    // Allowed commercial lengths
    const allowedStocks = stockChoice === 'optimal'
      ? STOCK_LENGTHS
      : [Number.parseFloat(stockChoice) || 6.0]

    // 2. Bin packing algorithm
    const packedBars = []

    pieces.forEach((piece) => {
      const pLen = piece.length

      // Check if piece can fit into existing open bars
      let bestBarIndex = -1
      let minRemainingWaste = Number.POSITIVE_INFINITY

      for (let i = 0; i < packedBars.length; i++) {
        const bar = packedBars[i]
        const remaining = bar.stockLength - bar.usedLength
        if (remaining >= pLen) {
          const wasteAfter = remaining - pLen
          if (wasteAfter < minRemainingWaste) {
            minRemainingWaste = wasteAfter
            bestBarIndex = i
          }
        }
      }

      if (bestBarIndex !== -1) {
        // Fit into existing bar
        const bar = packedBars[bestBarIndex]
        bar.cuts.push(piece)
        bar.usedLength += pLen
        bar.scrapLength = bar.stockLength - bar.usedLength
      } else {
        // Open a new commercial stock bar
        // If optimal mode, pick the stock length (6, 9, 12) that minimizes leftover
        let chosenStock = allowedStocks[0]
        if (stockChoice === 'optimal') {
          // Find the smallest stock length that accommodates the piece with minimum remainder
          const viable = allowedStocks.filter((s) => s >= pLen)
          if (viable.length > 0) {
            chosenStock = viable[0] // smallest viable commercial bar
          } else {
            chosenStock = allowedStocks[allowedStocks.length - 1] // largest available
          }
        } else {
          chosenStock = allowedStocks[0]
        }

        packedBars.push({
          id: packedBars.length + 1,
          stockLength: chosenStock,
          cuts: [piece],
          usedLength: pLen,
          scrapLength: Math.max(0, chosenStock - pLen),
        })
      }
    })

    // 3. Summarize metrics
    const totalBarsCount = packedBars.length
    const stockCounts = { 6.0: 0, 9.0: 0, 12.0: 0 }
    let totalPurchasedMeters = 0
    let totalNetMeters = 0
    let totalScrapMeters = 0

    packedBars.forEach((b) => {
      stockCounts[b.stockLength] = (stockCounts[b.stockLength] || 0) + 1
      totalPurchasedMeters += b.stockLength
      totalNetMeters += b.usedLength
      totalScrapMeters += b.scrapLength
    })

    const scrapRate = totalPurchasedMeters > 0
      ? (totalScrapMeters / totalPurchasedMeters) * 100
      : 0

    // Steel weights
    const netWeightKg = totalNetMeters * selectedRebar.unitWeight
    const purchasedWeightKg = totalPurchasedMeters * selectedRebar.unitWeight
    const scrapWeightKg = totalScrapMeters * selectedRebar.unitWeight

    // Tie wire (#16 G.I. wire): standard Philippine QS rule: ~10kg to 12kg of tie wire per 1,000kg of rebar
    const tieWireKg = Math.ceil((purchasedWeightKg / 1000) * 11)

    // Group identical cutting patterns for clean output
    const patterns = []
    packedBars.forEach((bar) => {
      const signature = `${bar.stockLength}m:[${bar.cuts.map((c) => c.length).sort().join(',')}]`
      const existing = patterns.find((p) => p.signature === signature)
      if (existing) {
        existing.count += 1
      } else {
        patterns.push({
          signature,
          stockLength: bar.stockLength,
          cuts: bar.cuts,
          usedLength: bar.usedLength,
          scrapLength: bar.scrapLength,
          scrapPercent: ((bar.scrapLength / bar.stockLength) * 100).toFixed(1),
          count: 1,
        })
      }
    })

    return {
      selectedRebar,
      totalPieces: pieces.length,
      packedBars,
      patterns,
      totalBarsCount,
      stockCounts,
      totalPurchasedMeters,
      totalNetMeters,
      totalScrapMeters,
      scrapRate: scrapRate.toFixed(1),
      netWeightKg: netWeightKg.toFixed(1),
      purchasedWeightKg: purchasedWeightKg.toFixed(1),
      scrapWeightKg: scrapWeightKg.toFixed(1),
      tieWireKg,
    }
  }, [diameter, stockChoice, cuts])

  // Handlers for dynamic cut table
  const addCut = () => {
    const len = Number.parseFloat(newLength) || 0
    const count = Number.parseInt(newCount, 10) || 0
    if (len <= 0 || count <= 0) return

    setCuts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        mark: newMark.trim() || `Cut ${prev.length + 1}`,
        length: len.toFixed(2),
        count: count.toString(),
      },
    ])
    setNewMark('')
    setNewLength('2.50')
    setNewCount('10')
  }

  const removeCut = (id) => {
    setCuts((prev) => prev.filter((c) => c.id !== id))
  }

  const updateCut = (id, field, val) => {
    setCuts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    )
  }

  const applyPreset = (preset) => {
    setDiameter(preset.diameter)
    setStockChoice(preset.stockStrategy)
    setCuts(preset.cuts)
  }

  const copySummary = () => {
    const text = `EstiMate Rebar 1D Cutting Stock Optimization:
- Rebar Size: ${optimization.selectedRebar.name} (${optimization.selectedRebar.grade})
- Commercial Stock Bars Required:
  ${optimization.stockCounts['6.0'] > 0 ? `• 6.0m bars: ${optimization.stockCounts['6.0']} pcs\n  ` : ''}${optimization.stockCounts['9.0'] > 0 ? `• 9.0m bars: ${optimization.stockCounts['9.0']} pcs\n  ` : ''}${optimization.stockCounts['12.0'] > 0 ? `• 12.0m bars: ${optimization.stockCounts['12.0']} pcs\n  ` : ''}• Total Commercial Bars: ${optimization.totalBarsCount} pcs
- Total Purchased Steel Weight: ${optimization.purchasedWeightKg} kg
- Net Steel Required: ${optimization.netWeightKg} kg
- Scrap / Offcut Rate: ${optimization.scrapRate}% (${optimization.scrapWeightKg} kg)
- Estimated #16 G.I. Tie Wire: ${optimization.tieWireKg} kg`

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
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
              </span>
              <div className="leading-none">
                <span className="text-xl font-bold tracking-tight text-white">
                  Esti<span className="text-[#F98125]">Mate</span>
                </span>
                <span className="block text-[0.6rem] font-medium tracking-widest text-[#7CA3E2] uppercase">
                  Rebar Cut-Length Optimizer
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
              1D Cutting Stock Optimization (CSP)
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
              Rebar Cut-Length &amp; Scrap Optimizer
            </h1>
            <p className="text-xs sm:text-sm text-[#7CA3E2] mt-1">
              Solve the 1D bin-packing problem for reinforcing steel bars. Minimize scrap across 6.0m, 9.0m, and 12.0m commercial stock bars.
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
          {/* Left Column: Form Inputs & Cut Schedule Table (7 Cols) */}
          <section className="space-y-6 lg:col-span-7">
            {/* 1. Steel Rebar Specs Card */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-100 text-[#F98125] font-mono text-xs">
                    01
                  </span>
                  Bar Diameter &amp; Stock Strategy
                </h2>
                <span className="text-xs font-semibold text-[#F98125]">
                  {optimization.selectedRebar.unitWeight} kg/m
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rebar-diameter" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Rebar Diameter (mm) <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="rebar-diameter"
                    value={diameter}
                    onChange={(e) => setDiameter(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-medium text-slate-800"
                  >
                    {REBAR_DIAMETERS.map((reb) => (
                      <option key={reb.id} value={reb.id}>
                        {reb.name} ({reb.unitWeight} kg/m)
                      </option>
                    ))}
                  </select>
                  <p className="text-[0.68rem] text-slate-400 mt-1">
                    {optimization.selectedRebar.commonUse}
                  </p>
                </div>

                <div>
                  <label htmlFor="stock-length" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Commercial Stock Length <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="stock-length"
                    value={stockChoice}
                    onChange={(e) => setStockChoice(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-base sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] focus:ring-2 focus:ring-[#F98125]/20 font-medium text-slate-800"
                  >
                    <option value="optimal">Multi-Stock Optimizer (Mix 6m, 9m, 12m)</option>
                    <option value="6.0">Standard 6.0m Commercial Bars</option>
                    <option value="9.0">Extended 9.0m Commercial Bars</option>
                    <option value="12.0">Full 12.0m Commercial Bars</option>
                  </select>
                  <p className="text-[0.68rem] text-slate-400 mt-1">
                    Optimizer picks stock bars that yield the least residual offcut
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Cut Schedule Table Card */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-100 text-[#F98125] font-mono text-xs">
                    02
                  </span>
                  Required Cut Lengths Schedule
                </h2>
                <span className="text-xs text-slate-400">Total Cuts: {optimization.totalPieces} pcs</span>
              </div>

              {/* Overlength Lap Splice Alert Banner */}
              {hasOverlengthCuts && (
                <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <p className="font-bold flex items-center gap-1.5 text-amber-800">
                        <span>⚠️</span> NSCP Lap Splice Notice: {overlengthCuts.length} cut(s) exceed maximum commercial stock ({maxCommercialStock}m)
                      </p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Per NSCP 2015 Section 425 &amp; ACI 318, longitudinal bars exceeding stock delivery must incorporate tension lap splices (40d = +{lapSpliceMeters}m for {diameter}mm Ø).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoSplice}
                      className="shrink-0 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 text-xs shadow-sm transition"
                    >
                      Auto-Splice into {maxCommercialStock}m Bars
                    </button>
                  </div>
                </div>
              )}

              {/* Table of cuts */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[0.68rem]">
                      <th className="pb-2">Element Tag / Mark</th>
                      <th className="pb-2">Cut Length (m)</th>
                      <th className="pb-2">Quantity</th>
                      <th className="pb-2 text-right">Subtotal</th>
                      <th className="pb-2 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cuts.map((cut) => (
                      <tr key={cut.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-bold text-slate-800">
                          <input
                            type="text"
                            value={cut.mark}
                            onChange={(e) => updateCut(cut.id, 'mark', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#F98125] focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 font-mono">
                          <input
                            type="number"
                            step="0.05"
                            min="0.1"
                            value={cut.length}
                            onChange={(e) => updateCut(cut.id, 'length', e.target.value)}
                            className="w-20 rounded border border-slate-200 px-2 py-1 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125]"
                          />
                        </td>
                        <td className="py-2.5 font-mono">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={cut.count}
                            onChange={(e) => updateCut(cut.id, 'count', e.target.value)}
                            className="w-16 rounded border border-slate-200 px-2 py-1 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125]"
                          />
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-slate-800">
                          {((Number.parseFloat(cut.length) || 0) * (Number.parseInt(cut.count, 10) || 0)).toFixed(2)} m
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => removeCut(cut.id)}
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
                      <td colSpan={3} className="pt-2 text-right">Net Linear Meters:</td>
                      <td className="pt-2 text-right font-mono text-sm text-[#F98125]">{optimization.totalNetMeters.toFixed(2)} m</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Add New Cut Form */}
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  + Add Required Cut to Schedule
                </span>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Element Mark (e.g. Beam Top Bar)"
                      value={newMark}
                      onChange={(e) => setNewMark(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white focus:outline-none focus:border-[#F98125]"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      placeholder="Length (m)"
                      value={newLength}
                      onChange={(e) => setNewLength(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white focus:outline-none focus:border-[#F98125] font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      placeholder="Qty"
                      value={newCount}
                      onChange={(e) => setNewCount(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white focus:outline-none focus:border-[#F98125] font-mono"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addCut}
                  className="mt-3 w-full rounded-xl bg-[#11224D] py-2.5 text-xs font-bold text-white transition hover:bg-[#193A6F]"
                >
                  Add Cut Length
                </button>
              </div>
            </div>
          </section>

          {/* Right Column: Optimization Results & Cutting Patterns (5 Cols) */}
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
                    1D Cutting Schedule
                  </span>
                  <h3 className="text-lg font-extrabold text-white">Bar Optimization Result</h3>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[0.65rem] font-bold text-emerald-300">
                  {optimization.scrapRate}% Scrap Rate
                </span>
              </div>

              {/* Main Metric 1: Total Commercial Stock Bars */}
              <div className="mt-5 rounded-2xl bg-[#F98125] p-5 shadow-lg shadow-orange-950/40 text-[#07132F]">
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-orange-950/80">
                    Total Commercial Steel Bars Required
                  </span>
                  <span className="rounded-md bg-white/30 px-2 py-0.5 text-[0.65rem] font-extrabold text-white">
                    {optimization.selectedRebar.diameter}mm Ø
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                    {optimization.totalBarsCount}
                  </span>
                  <span className="text-lg font-black text-[#07132F]">bars (pcs)</span>
                </div>
                {/* Breakdown by stock length */}
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-orange-950">
                  {optimization.stockCounts['6.0'] > 0 && (
                    <span className="rounded bg-white/20 px-2 py-0.5">6.0m: {optimization.stockCounts['6.0']} pcs</span>
                  )}
                  {optimization.stockCounts['9.0'] > 0 && (
                    <span className="rounded bg-white/20 px-2 py-0.5">9.0m: {optimization.stockCounts['9.0']} pcs</span>
                  )}
                  {optimization.stockCounts['12.0'] > 0 && (
                    <span className="rounded bg-white/20 px-2 py-0.5">12.0m: {optimization.stockCounts['12.0']} pcs</span>
                  )}
                </div>
              </div>

              {/* Main Metric 2: Steel Weight */}
              <div className="mt-4 rounded-2xl bg-[#07132F]/60 p-4 border border-[#2C599D]/60">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#7CA3E2]">
                    Total Purchased Steel Weight
                  </span>
                  <span className="text-[0.68rem] font-mono text-emerald-400">
                    Net: {optimization.netWeightKg} kg
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-white font-mono">
                    {optimization.purchasedWeightKg}
                  </span>
                  <span className="text-base font-bold text-blue-200">kg ({((Number.parseFloat(optimization.purchasedWeightKg) || 0) / 1000).toFixed(2)} MT)</span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="mt-5 space-y-2 border-t border-[#2C599D]/60 pt-4 text-xs">
                <div className="flex justify-between py-1 text-[#7CA3E2]">
                  <span>Total Linear Meters Purchased:</span>
                  <span className="font-mono text-white">{optimization.totalPurchasedMeters.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between py-1 text-[#7CA3E2]">
                  <span>Scrap / Offcut Loss:</span>
                  <span className="font-mono text-white">{optimization.totalScrapMeters.toFixed(2)} m ({optimization.scrapWeightKg} kg)</span>
                </div>
                <div className="flex justify-between py-1 text-[#7CA3E2]">
                  <span>#16 G.I. Tie Wire Required:</span>
                  <span className="font-mono text-white">{optimization.tieWireKg} kg (~1 roll = 35kg)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(true)}
                  className="flex-1 rounded-xl bg-[#F98125] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#FB9B50] flex items-center justify-center gap-1.5 shadow-md shadow-orange-950/40"
                  title="Apply rebar takeoff directly to a project workspace"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Apply to Project
                </button>

                <button
                  type="button"
                  onClick={copySummary}
                  className="rounded-xl bg-white/15 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-white/25 flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-white"
                >
                  {copied ? (
                    <>
                      <span className="text-emerald-400">✓</span> Copied
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy Schedule
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-white/10 px-3 py-2.5 text-xs font-bold text-blue-200 transition hover:bg-white/20 hover:text-white"
                  title="Print Rebar Cutting Schedule"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* Visual Cutting Schedule Patterns Card */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-[#193A6F]/40 p-5 text-xs text-[#7CA3E2] space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[0.7rem] flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#F98125]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Optimal Commercial Bar Cutting Patterns ({optimization.patterns.length} unique pattern sets)
              </h4>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {optimization.patterns.map((pat, idx) => (
                  <div
                    key={pat.signature + idx}
                    className="rounded-xl border border-[#2C599D]/80 bg-[#07132F]/80 p-3 space-y-2"
                  >
                    <div className="flex justify-between items-center text-[0.68rem]">
                      <span className="font-bold text-white font-mono">
                        Pattern #{idx + 1} ({pat.stockLength}m stock) × <strong className="text-[#F98125]">{pat.count} bars</strong>
                      </span>
                      <span className="text-emerald-400 font-mono">
                        {pat.scrapLength.toFixed(2)}m offcut ({pat.scrapPercent}%)
                      </span>
                    </div>

                    {/* Proportional visual bar */}
                    <div className="h-6 w-full rounded border border-slate-700 bg-slate-900/80 flex overflow-hidden">
                      {pat.cuts.map((c, cIdx) => {
                        const widthPct = (c.length / pat.stockLength) * 100
                        return (
                          <div
                            key={cIdx}
                            style={{ width: `${widthPct}%` }}
                            className="h-full border-r border-slate-900 bg-[#F98125]/80 hover:bg-[#F98125] flex items-center justify-center text-[0.6rem] font-bold text-slate-950 truncate px-0.5"
                            title={`${c.mark}: ${c.length}m`}
                          >
                            {c.length}m
                          </div>
                        )
                      })}
                      {pat.scrapLength > 0 && (
                        <div
                          style={{ width: `${(pat.scrapLength / pat.stockLength) * 100}%` }}
                          className="h-full bg-red-500/30 flex items-center justify-center text-[0.55rem] text-red-300 truncate"
                          title={`Scrap Offcut: ${pat.scrapLength.toFixed(2)}m`}
                        >
                          Offcut
                        </div>
                      )}
                    </div>

                    <div className="text-[0.65rem] text-slate-400 flex flex-wrap gap-1">
                      <span>Cuts:</span>
                      {pat.cuts.map((c, cIdx) => (
                        <span key={cIdx} className="rounded bg-slate-800 px-1 text-slate-300">
                          {c.length}m ({c.mark})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Apply to Project Modal */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#07132F]/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#2C599D] bg-[#11224D] p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#F98125]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Apply Rebar Takeoff to Project
            </h3>
            <p className="text-xs text-blue-200/80 mb-4">
              Sync this cutting schedule ({optimization.totalBarsCount} bars, {optimization.purchasedWeightKg} kg) directly into your project's Bill of Quantities.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1.5">
                  Select Target Project
                </label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full rounded-xl border border-[#2C599D] bg-[#193A6F] p-3 text-sm text-white focus:outline-none focus:border-[#F98125]"
                >
                  <option value="new">+ Create as New Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.location ? `(${p.location})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {targetProjectId === 'new' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1.5">
                    New Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. Residential Villa - Rebar"
                    className="w-full rounded-xl border border-[#2C599D] bg-[#193A6F] p-3 text-sm text-white focus:outline-none focus:border-[#F98125]"
                  />
                </div>
              )}

              {applySuccessNotice && (
                <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/20 p-3 text-xs font-bold text-emerald-200 text-center">
                  {applySuccessNotice}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="flex-1 rounded-xl border border-[#2C599D] bg-[#193A6F]/60 py-2.5 text-xs font-bold text-blue-200 hover:bg-[#193A6F] hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyToProject}
                  className="flex-1 rounded-xl bg-[#F98125] py-2.5 text-xs font-bold text-white hover:bg-[#FB9B50] transition shadow-md shadow-orange-950/40"
                >
                  Confirm &amp; Open Project →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
