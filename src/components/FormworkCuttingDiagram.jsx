import { useMemo, useState } from 'react'

export default function FormworkCuttingDiagram({
  elemType,
  length,
  width,
  heightDepth,
  isVariable,
  widthStart,
  widthEnd,
  depthStart,
  depthEnd,
  value,
  className = '',
}) {
  const [viewMode, setViewMode] = useState('fit') // 'fit' (responsive auto-scale) | 'scroll' (1:1 blueprint scroll)
  const [showKerfInfo, setShowKerfInfo] = useState(false)

  const resolvedElemType = elemType || value?.elementType || 'column'
  const isVar = typeof isVariable === 'boolean' ? isVariable : !!value?.isVariable

  const l = Math.max(0.01, Number.parseFloat(length ?? value?.length) || 0.40)
  const w = Math.max(0.01, Number.parseFloat(width ?? value?.width) || 0.40)
  const h = Math.max(0.01, Number.parseFloat(heightDepth ?? value?.heightDepth) || 3.00)

  const w1 = Math.max(0.01, Number.parseFloat(widthStart ?? value?.widthStart) || w)
  const w2 = Math.max(0.01, Number.parseFloat(widthEnd ?? value?.widthEnd) || w)
  const d1 = Math.max(0.01, Number.parseFloat(depthStart ?? value?.depthStart) || l)
  const d2 = Math.max(0.01, Number.parseFloat(depthEnd ?? value?.depthEnd) || l)

  // Standard 4x8 Panel in meters
  const SHEET_W = 1.22
  const SHEET_L = 2.44
  const sheetArea = SHEET_W * SHEET_L // 2.977 m²

  const layout = useMemo(() => {
    let cuts = []
    let desc = ''
    let title = ''

    if (resolvedElemType === 'column') {
      if (isVar) {
        title = `Tapered Column Formwork: Paired Trapezoids (${w1.toFixed(2)}m→${w2.toFixed(2)}m × H=${h.toFixed(2)}m)`
        desc = `Complementary diagonal ripping across the 1.22m sheet produces paired trapezoidal faces with minimal edge loss.`

        const avgWidth = (w1 + w2) / 2
        const avgDepth = (d1 + d2) / 2
        let curX = 0

        // Pair 1: Width faces
        if (curX + w1 + w2 <= SHEET_W + 0.01) {
          cuts.push({
            id: 'trap-w1',
            label: 'Face A (Tapered)',
            sublabel: `${w1.toFixed(2)}m → ${w2.toFixed(2)}m`,
            width: avgWidth,
            length: SHEET_L,
            x: curX,
            y: 0,
            type: 'cut',
            color: '#F98125',
          })
          curX += avgWidth

          cuts.push({
            id: 'trap-w2',
            label: 'Face B (Inverted)',
            sublabel: `${w2.toFixed(2)}m → ${w1.toFixed(2)}m`,
            width: avgWidth,
            length: SHEET_L,
            x: curX,
            y: 0,
            type: 'cut',
            color: '#FB923C',
          })
          curX += avgWidth
        }

        // Pair 2: Depth faces if they fit
        if (curX + avgDepth <= SHEET_W + 0.01) {
          cuts.push({
            id: 'trap-d1',
            label: 'Face C (Depth)',
            sublabel: `${d1.toFixed(2)}m → ${d2.toFixed(2)}m`,
            width: avgDepth,
            length: SHEET_L,
            x: curX,
            y: 0,
            type: 'cut',
            color: '#F98125',
          })
          curX += avgDepth
        }

        const offcut = Math.max(0, SHEET_W - curX)
        if (offcut > 0.005) {
          cuts.push({
            id: 'offcut',
            label: 'Offcut / Kerf',
            sublabel: `${offcut.toFixed(2)}m (${Math.round(offcut * 1000)}mm scrap/kerf)`,
            width: offcut,
            length: SHEET_L,
            x: curX,
            y: 0,
            type: 'offcut',
            color: '#64748B',
          })
        }
      } else {
        title = `4×8 Column Formwork: 4 Faces (${l.toFixed(2)}m × ${w.toFixed(2)}m × ${h.toFixed(2)}m)`
        desc = `Strips ripped along the 2.44m grain to resist hydrostatic concrete lateral pressure.`

        // Pack alternating face strips across 1.22m sheet width
        const targetWidths = [l, w, l, w]
        let curX = 0
        for (let i = 0; i < targetWidths.length; i++) {
          const widthVal = targetWidths[i]
          if (curX + widthVal <= SHEET_W + 0.005) {
            cuts.push({
              id: `face-${i + 1}`,
              label: `Face ${i % 2 === 0 ? 'A' : 'B'}`,
              sublabel: `${widthVal.toFixed(2)}m × 2.44m`,
              width: widthVal,
              length: SHEET_L,
              x: curX,
              y: 0,
              type: 'cut',
              color: i % 2 === 0 ? '#F98125' : '#FB923C',
            })
            curX += widthVal
          }
        }

        // If more fit
        while (curX + Math.min(l, w) <= SHEET_W + 0.005) {
          const extraWidth = curX + l <= SHEET_W + 0.005 ? l : w
          cuts.push({
            id: `face-extra-${cuts.length + 1}`,
            label: `Face (Extra)`,
            sublabel: `${extraWidth.toFixed(2)}m × 2.44m`,
            width: extraWidth,
            length: SHEET_L,
            x: curX,
            y: 0,
            type: 'cut',
            color: '#F98125',
          })
          curX += extraWidth
        }

        const offcut = Math.max(0, SHEET_W - curX)
        if (offcut > 0.005) {
          cuts.push({
            id: 'offcut',
            label: 'Offcut / Kerf',
            sublabel: `${offcut.toFixed(2)}m (${Math.round(offcut * 1000)}mm scrap/kerf)`,
            width: offcut,
            length: SHEET_L,
            x: curX,
            y: 0,
            type: 'offcut',
            color: '#64748B',
          })
        }
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
          sublabel: `${offcut.toFixed(2)}m (${Math.round(offcut * 1000)}mm scrap/kerf)`,
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
          sublabel: `${offcut.toFixed(2)}m (${Math.round(offcut * 1000)}mm scrap/kerf)`,
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

    const needsSplice = h > 2.44 && (resolvedElemType === 'column' || resolvedElemType === 'beam')
    const spliceHeight = needsSplice ? (h - 2.44).toFixed(2) : 0

    return {
      title,
      desc,
      cuts,
      utilization: utilization.toFixed(1),
      offcutPct: offcutPct.toFixed(1),
      needsSplice,
      spliceHeight,
      offcutWidth: cuts.find((c) => c.type === 'offcut')?.width || 0,
    }
  }, [resolvedElemType, isVar, l, w, h, w1, w2, d1, d2])

  // Canvas dimensions for SVG (Exact 2:1 proportional 4x8 panel with generous leader margins)
  const padLeft = 70 // generous padding so 1.22m vertical label never clips
  const padRight = 55 // space for right dimension annotations
  const padTop = 42 // leader 2.44m line and text
  const padBottom = 35
  const sheetDrawL = 500 // 2.44m length (horizontal)
  const sheetDrawW = 250 // 1.22m width (vertical)
  const svgWidth = sheetDrawL + padLeft + padRight // 625
  const svgHeight = sheetDrawW + padTop + padBottom // 327

  return (
    <div className={`overflow-hidden rounded-2xl border border-[#2C599D]/50 bg-[#07132F] p-3 sm:p-5 text-white shadow-xl ${className}`}>
      {/* Top Header: Title, Grain Direction & View Mode Toggle */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5 border-b border-[#2C599D]/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#F98125] text-[0.65rem] font-bold text-white shadow-md shadow-orange-950/30">
            4×8
          </span>
          <div>
            <span className="block text-xs font-bold text-white leading-tight">{layout.title}</span>
            <span className="text-[0.65rem] text-[#7CA3E2]">{layout.desc}</span>
          </div>
        </div>

        {/* Controls: Grain Badge + Responsive Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#2C599D]/80 bg-[#11224D]/90 px-2.5 py-1 font-mono text-[0.65rem] text-blue-200">
            <span>⟷ Grain:</span>
            <span className="font-bold text-[#F98125]">2.44m (Longitudinal)</span>
          </div>

          {/* iPad & Mobile View Mode Switcher */}
          <div className="flex items-center rounded-xl border border-[#2C599D]/80 bg-[#0F2042] p-0.5 text-[0.68rem] font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('fit')}
              className={`rounded-lg px-2.5 py-1 transition ${
                viewMode === 'fit'
                  ? 'bg-[#F98125] text-[#07132F] font-bold shadow-sm'
                  : 'text-[#7CA3E2] hover:text-white'
              }`}
              title="Scale to fit entire width on phones and tablets without scrolling"
            >
              📱 Fit to Screen
            </button>
            <button
              type="button"
              onClick={() => setViewMode('scroll')}
              className={`rounded-lg px-2.5 py-1 transition ${
                viewMode === 'scroll'
                  ? 'bg-[#F98125] text-[#07132F] font-bold shadow-sm'
                  : 'text-[#7CA3E2] hover:text-white'
              }`}
              title="Full 1:1 blueprint view with touch scroll"
            >
              🔍 1:1 Zoom
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Hint Banner */}
      <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-[#11224D]/60 px-3 py-1.5 text-[0.65rem] text-[#7CA3E2] sm:hidden">
        <span>💡 Tip: Rotate to landscape for full-size diagram view</span>
        {layout.offcutWidth > 0 && (
          <button
            type="button"
            onClick={() => setShowKerfInfo(!showKerfInfo)}
            className="text-[#F98125] font-bold underline"
          >
            What is {layout.offcutWidth.toFixed(2)}m?
          </button>
        )}
      </div>

      {/* Explain Offcut / Kerf Dialog/Banner */}
      {showKerfInfo && (
        <div className="mb-3 rounded-xl border border-orange-400/40 bg-orange-950/40 p-3 text-xs text-orange-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <strong className="text-white">What is the {layout.offcutWidth.toFixed(2)}m strip?</strong>
              <p className="mt-1 text-[0.7rem] leading-relaxed text-orange-200/90">
                The <strong>{layout.offcutWidth.toFixed(2)}m ({Math.round(layout.offcutWidth * 1000)}mm)</strong> is the leftover offcut / scrap margin.
                In jobsite carpentry, a circular saw blade has a <strong>~3mm kerf</strong> (cut thickness). Ripping 3 strips consumes ~6–9mm in sawdust. This 20mm margin absorbs saw blade kerf and edge squaring cleanly!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowKerfInfo(false)}
              className="text-white hover:text-orange-400 font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Scaled SVG Blueprint Viewport */}
      <div
        className={`w-full ${
          viewMode === 'scroll'
            ? 'overflow-x-auto touch-pan-x pb-2 cursor-grab active:cursor-grabbing'
            : 'overflow-hidden'
        }`}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className={`h-auto select-none transition-all ${
            viewMode === 'scroll' ? 'min-w-[580px] sm:min-w-[620px]' : 'w-full'
          }`}
        >
          <defs>
            <pattern
              id="diagOffcutHatch"
              width="12"
              height="12"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="12" stroke="#475569" strokeWidth="2.5" />
            </pattern>

            <marker
              id="svgArrow"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#7CA3E2" />
            </marker>
          </defs>

          {/* Top Dimension Leader: 2.44m (Longitudinal) */}
          <line
            x1={padLeft}
            y1={22}
            x2={padLeft + sheetDrawL}
            y2={22}
            stroke="#7CA3E2"
            strokeWidth="1.5"
            markerStart="url(#svgArrow)"
            markerEnd="url(#svgArrow)"
          />
          <text
            x={padLeft + sheetDrawL / 2}
            y={16}
            fill="#7CA3E2"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            2.44 m (8&apos;-0&quot; Standard Panel Length)
          </text>

          {/* Left Dimension Leader: 1.22m (Width) - Generously spaced so it never clips */}
          <line
            x1={28}
            y1={padTop}
            x2={28}
            y2={padTop + sheetDrawW}
            stroke="#7CA3E2"
            strokeWidth="1.5"
            markerStart="url(#svgArrow)"
            markerEnd="url(#svgArrow)"
          />
          <text
            x={-(padTop + sheetDrawW / 2)}
            y={18}
            transform="rotate(-90)"
            fill="#7CA3E2"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            1.22 m (4&apos;-0&quot; Width)
          </text>

          {/* Plywood Sheet Outer Outline */}
          <rect
            x={padLeft}
            y={padTop}
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
            const cutPixelY = padTop + (cut.x / SHEET_W) * sheetDrawW
            const cutPixelW = (cut.length / SHEET_L) * sheetDrawL
            const cutPixelX = padLeft + (cut.y / SHEET_L) * sheetDrawL
            const isOffcut = cut.type === 'offcut'

            return (
              <g key={cut.id}>
                {/* Cut Piece Shape */}
                <rect
                  x={cutPixelX}
                  y={cutPixelY}
                  width={cutPixelW}
                  height={cutPixelH}
                  fill={isOffcut ? 'url(#diagOffcutHatch)' : cut.color}
                  fillOpacity={isOffcut ? 0.95 : 0.88}
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
                  stroke={isOffcut ? '#94A3B8' : '#F98125'}
                  strokeWidth="1.2"
                />
                <text
                  x={cutPixelX + cutPixelW + 12}
                  y={cutPixelY + cutPixelH / 2 + 3}
                  fill={isOffcut ? '#94A3B8' : '#FDBA74'}
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {cut.width.toFixed(2)}m
                </text>

                {/* Label in Center */}
                {cutPixelH > 22 && (
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
                {cutPixelH > 38 && (
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

      {/* Legend & Utilization Metrics - Responsive 2 cols on phone, 4 on tablet/desktop */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 border-t border-[#2C599D]/60 pt-3">
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
          <span className="font-mono text-xs font-bold text-white mt-0.5 block truncate">
            1.22m × 2.44m (4&apos;×8&apos;)
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
          <p className="leading-snug text-[0.72rem]">
            <strong>Height Extension Required:</strong> Element height ({h.toFixed(2)}m) exceeds standard 2.44m panel length. A <strong>+{layout.spliceHeight}m</strong> top splice extension with 2x3 backing cleats is factored into framing takeoff.
          </p>
        </div>
      )}
    </div>
  )
}
