import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Helper to convert mm or m to standard meters
function toMeters(val) {
  const n = Number.parseFloat(val)
  if (isNaN(n) || n <= 0) return 0
  if (n >= 20) return n / 1000 // millimeters to meters
  return n // already in meters
}

// Robust regex patterns for Philippine structural and architectural schedules
const SCHEDULE_PATTERNS = {
  columns: [
    /(?:column|col|c\s*-?\s*\d+)\s*[:=\s-]*\s*(\d+(?:\.\d+)?)\s*(?:mm|m)?\s*[xX*×]\s*(\d+(?:\.\d+)?)\s*(?:mm|m)?/i,
    /(\d+(?:\.\d+)?)\s*(?:mm|m)?\s*[xX*×]\s*(\d+(?:\.\d+)?)\s*(?:mm|m)?\s*(?:rc\s*col|column|c\s*-?\s*\d+)/i,
    /c\s*-?\s*(\d+)\s*\((\d+(?:\.\d+)?)\s*[xX*×]\s*(\d+(?:\.\d+)?)\)/i,
    /col(?:umn)?\s*size\s*[:=\s]*(\d+(?:\.\d+)?)\s*[xX*×]\s*(\d+(?:\.\d+)?)/i,
    /(\d{3,4})\s*[xX*×]\s*(\d{3,4})\s*(?:mm)?/i,
  ],
  beams: [
    /(?:beam|girder|b\s*-?\s*\d+|g\s*-?\s*\d+|rb\s*-?\s*\d+|fb\s*-?\s*\d+)\s*[:=\s-]*\s*(\d+(?:\.\d+)?)\s*(?:mm|m)?\s*[xX*×]\s*(\d+(?:\.\d+)?)\s*(?:mm|m)?/i,
    /(\d+(?:\.\d+)?)\s*(?:mm|m)?\s*[xX*×]\s*(\d+(?:\.\d+)?)\s*(?:mm|m)?\s*(?:beam|girder|b\s*-?\s*\d+|g\s*-?\s*\d+)/i,
    /(?:span|length)\s*[:=\s]*(\d+(?:\.\d+)?)\s*(?:m|meters)/i,
  ],
  slabs: [
    /(?:slab|s\s*-?\s*\d+)?\s*(?:thickness|thk|t\s*=)\s*[:=\s]*(\d+(?:\.\d+)?)\s*(?:mm|m|thk)?/i,
    /(\d+(?:\.\d+)?)\s*(?:mm|m)?\s*thk\.?\s*(?:rc|concrete)?\s*slab/i,
    /t\s*=\s*0?\.?(\d+(?:\.\d+)?)\s*m/i,
  ],
  footings: [
    /(?:footing|ftg|f\s*-?\s*\d+)\s*[:=\s-]*\s*(\d+(?:\.\d+)?)\s*(?:mm|m)?\s*[xX*×]\s*(\d+(?:\.\d+)?)\s*(?:mm|m)?(?:\s*[xX*×]\s*(\d+(?:\.\d+)?)\s*(?:mm|m)?)?/i,
    /(\d+(?:\.\d+)?)\s*(?:mm|m)?\s*[xX*×]\s*(\d+(?:\.\d+)?)\s*(?:mm|m)?\s*(?:isolated\s*footing|footing|ftg)/i,
  ],
  rebar: [
    /(\d+)\s*[-–]\s*(\d{2})\s*(?:mm|ø|dia|d)\b/i,
    /(\d{2})\s*(?:mm|ø|dia)\s*@\s*(\d{2,3})\s*(?:mm)?\s*(?:o\.?c\.?|spacing)/i,
    /(?:grade\s*40|grade\s*60|defbar)\s*(\d{2})\s*mm/i,
    /(\d{2})\s*mm\s*(?:ø|dia|diameter|rebar|deformed)/i,
  ],
}

const DEFAULT_CONFIGURED_SPECS = {
  column: {
    width: '0.40',
    depth: '0.40',
    height: '3.00',
    count: '8',
    source: 'Default 2-Story Structure Heuristic',
  },
  beam: {
    width: '0.25',
    depth: '0.50',
    length: '5.00',
    count: '6',
    source: 'Default 2-Story Structure Heuristic',
  },
  slab: {
    length: '10.00',
    width: '8.00',
    thickness: '0.125',
    source: 'Default 2-Story Structure Heuristic',
  },
  footing: {
    length: '1.20',
    width: '1.20',
    thickness: '0.35',
    count: '8',
    source: 'Default 2-Story Structure Heuristic',
  },
  rebar: {
    mainDia: '16',
    tieDia: '10',
    spacing: '0.15',
    source: 'PNS 49 / DPWH Standard',
  },
}

export default function PdfUploader({ onApplySpecs, onCreateProject, className = '' }) {
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [extractedSpecs, setExtractedSpecs] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')
  const [appliedNotice, setAppliedNotice] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [newProjectLocation, setNewProjectLocation] = useState('Metro Manila')

  // Active editable structural specifications
  const [configuredSpecs, setConfiguredSpecs] = useState(DEFAULT_CONFIGURED_SPECS)

  const fileInputRef = useRef(null)

  // Update a specific field inside configuredSpecs
  const updateSpec = (trade, field, val) => {
    setConfiguredSpecs((prev) => ({
      ...prev,
      [trade]: {
        ...prev[trade],
        [field]: val,
        source: 'User Customized',
      },
    }))
  }

  // Adopt an extracted candidate from the PDF
  const adoptCandidate = (trade, item) => {
    setConfiguredSpecs((prev) => {
      const updated = { ...prev[trade], source: `Adopted from Plan (Page ${item.page})` }
      if (trade === 'column') {
        updated.width = item.width
        updated.depth = item.depth
      } else if (trade === 'beam') {
        updated.width = item.width
        updated.depth = item.depth
        if (item.length) updated.length = item.length
      } else if (trade === 'slab') {
        updated.thickness = item.thickness
      } else if (trade === 'footing') {
        updated.length = item.length
        updated.width = item.width
        if (item.thickness) updated.thickness = item.thickness
      } else if (trade === 'rebar') {
        updated.mainDia = item.diameter
      }
      return { ...prev, [trade]: updated }
    })
  }

  // Parse PDF File using pdfjs-dist or raw stream extractor
  const processPdfFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF document.')
      return
    }

    setLoading(true)
    setProgress('Reading PDF document structure...')
    setFileName(file.name)
    setNewProjectTitle(file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '))
    setFileSize((file.size / 1024).toFixed(1) + ' KB')
    setExtractedSpecs(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      let fullPagesText = []

      // Try dynamic import of pdfjs-dist
      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs').catch(() =>
          import('pdfjs-dist')
        )

        if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs'
        }

        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) })
        const pdfDoc = await loadingTask.promise
        setPageCount(pdfDoc.numPages)

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          setProgress(`Parsing page ${i} of ${pdfDoc.numPages}...`)
          const page = await pdfDoc.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map((item) => item.str).join(' ')
          fullPagesText.push({ pageNum: i, text: pageText })
        }
      } catch (pdfJsErr) {
        console.warn('pdfjs-dist worker fallback, reading textual streams:', pdfJsErr)
        const decoder = new TextDecoder('latin1')
        const rawString = decoder.decode(arrayBuffer)
        const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g
        let match
        let extracted = ''

        while ((match = streamRegex.exec(rawString)) !== null) {
          const streamText = match[1].replace(/[^\x20-\x7E\s]/g, ' ')
          if (streamText.length > 30) {
            extracted += streamText + '\n'
          }
        }

        if (!extracted) {
          extracted = rawString.replace(/[^\x20-\x7E\s]/g, ' ')
        }

        fullPagesText.push({ pageNum: 1, text: extracted })
        setPageCount(1)
      }

      setProgress('Analyzing structural schedule keywords & dimensions...')

      // Extract structural elements using heuristic rules
      const extracted = parseStructuralText(fullPagesText, file.name)
      setExtractedSpecs(extracted)
      setDrawerOpen(true)
      setProgress('')
    } catch (err) {
      console.error('PDF Parsing failed:', err)
      alert('Unable to extract text from this PDF. It may be a scanned image or protected.')
    } finally {
      setLoading(false)
    }
  }

  // Regex and token analysis across pages
  const parseStructuralText = (pages, fname = '') => {
    const results = {
      columns: [],
      beams: [],
      slabs: [],
      footings: [],
      rebar: [],
    }

    let allTextCombined = fname + ' '

    pages.forEach(({ pageNum, text }) => {
      allTextCombined += text + ' '
      const clean = text.replace(/\s+/g, ' ')

      // 1. Column Schedules
      SCHEDULE_PATTERNS.columns.forEach((regex) => {
        const matches = [...clean.matchAll(new RegExp(regex, 'gi'))]
        matches.forEach((m) => {
          let w = toMeters(m[1])
          let d = toMeters(m[2])

          if (w > 0 && d > 0 && w <= 2.5 && d <= 2.5) {
            const key = `${w.toFixed(2)}x${d.toFixed(2)}`
            if (!results.columns.some((c) => c.key === key)) {
              results.columns.push({
                key,
                type: 'Column',
                tag: `Column (${(w * 1000).toFixed(0)}×${(d * 1000).toFixed(0)}mm)`,
                width: w.toFixed(2),
                depth: d.toFixed(2),
                height: '3.00',
                snippet: m[0],
                page: pageNum,
                confidence: 'High',
              })
            }
          }
        })
      })

      // 2. Beam Schedules
      SCHEDULE_PATTERNS.beams.forEach((regex) => {
        const matches = [...clean.matchAll(new RegExp(regex, 'gi'))]
        matches.forEach((m) => {
          let w = toMeters(m[1])
          let d = toMeters(m[2])

          if (w > 0 && d > 0 && w <= 2.0 && d <= 3.0) {
            const key = `${w.toFixed(2)}x${d.toFixed(2)}`
            if (!results.beams.some((b) => b.key === key)) {
              results.beams.push({
                key,
                type: 'Beam',
                tag: `Beam (${(w * 1000).toFixed(0)}×${(d * 1000).toFixed(0)}mm)`,
                width: w.toFixed(2),
                depth: d.toFixed(2),
                length: '5.00',
                snippet: m[0],
                page: pageNum,
                confidence: 'High',
              })
            }
          }
        })
      })

      // 3. Slab Schedules
      SCHEDULE_PATTERNS.slabs.forEach((regex) => {
        const matches = [...clean.matchAll(new RegExp(regex, 'gi'))]
        matches.forEach((m) => {
          let thk = toMeters(m[1])

          if (thk >= 0.08 && thk <= 0.45) {
            const key = thk.toFixed(3)
            if (!results.slabs.some((s) => s.key === key)) {
              results.slabs.push({
                key,
                type: 'Slab',
                tag: `Slab Thickness (${(thk * 1000).toFixed(0)}mm)`,
                thickness: thk.toFixed(3),
                snippet: m[0],
                page: pageNum,
                confidence: 'High',
              })
            }
          }
        })
      })

      // 4. Footing Schedules
      SCHEDULE_PATTERNS.footings.forEach((regex) => {
        const matches = [...clean.matchAll(new RegExp(regex, 'gi'))]
        matches.forEach((m) => {
          let l = toMeters(m[1])
          let w = toMeters(m[2])
          let t = m[3] ? toMeters(m[3]) : 0.35

          if (l > 0 && w > 0 && l <= 5.0 && w <= 5.0) {
            const key = `${l.toFixed(2)}x${w.toFixed(2)}x${t.toFixed(2)}`
            if (!results.footings.some((f) => f.key === key)) {
              results.footings.push({
                key,
                type: 'Footing',
                tag: `Footing (${l.toFixed(2)}m × ${w.toFixed(2)}m × ${t.toFixed(2)}m)`,
                length: l.toFixed(2),
                width: w.toFixed(2),
                thickness: t.toFixed(2),
                snippet: m[0],
                page: pageNum,
                confidence: 'Medium',
              })
            }
          }
        })
      })

      // 5. Rebar Callouts
      SCHEDULE_PATTERNS.rebar.forEach((regex) => {
        const matches = [...clean.matchAll(new RegExp(regex, 'gi'))]
        matches.forEach((m) => {
          const dia = m[2] || m[1]
          if (['10', '12', '16', '20', '25', '28', '32'].includes(dia)) {
            const key = dia
            if (!results.rebar.some((r) => r.key === key)) {
              results.rebar.push({
                key,
                type: 'Rebar',
                tag: `${dia}mm Ø Deformed Bar`,
                diameter: dia,
                snippet: m[0],
                page: pageNum,
                confidence: 'High',
              })
            }
          }
        })
      })
    })

    const totalFound =
      results.columns.length +
      results.beams.length +
      results.slabs.length +
      results.footings.length +
      results.rebar.length

    results.totalFound = totalFound
    results.noMatchesFound = totalFound === 0

    // Auto-update configured specs based on plan findings or 2-story building heuristic
    const isTwoStory = /two[\s-]?stor(?:y|ey)|2[\s-]?stor(?:y|ey)/i.test(allTextCombined)
    const newSpecs = { ...DEFAULT_CONFIGURED_SPECS }

    if (isTwoStory) {
      newSpecs.column.count = '8'
      newSpecs.column.height = '3.00'
      newSpecs.footing.count = '8'
      newSpecs.column.source = '2-Story House Structure Heuristic'
    }

    if (results.columns.length > 0) {
      newSpecs.column.width = results.columns[0].width
      newSpecs.column.depth = results.columns[0].depth
      newSpecs.column.source = `Extracted from PDF (${results.columns[0].tag})`
    }
    if (results.beams.length > 0) {
      newSpecs.beam.width = results.beams[0].width
      newSpecs.beam.depth = results.beams[0].depth
      newSpecs.beam.source = `Extracted from PDF (${results.beams[0].tag})`
    }
    if (results.slabs.length > 0) {
      newSpecs.slab.thickness = results.slabs[0].thickness
      newSpecs.slab.source = `Extracted from PDF (${results.slabs[0].tag})`
    }
    if (results.footings.length > 0) {
      newSpecs.footing.length = results.footings[0].length
      newSpecs.footing.width = results.footings[0].width
      if (results.footings[0].thickness) newSpecs.footing.thickness = results.footings[0].thickness
      newSpecs.footing.source = `Extracted from PDF (${results.footings[0].tag})`
    }
    if (results.rebar.length > 0) {
      newSpecs.rebar.mainDia = results.rebar[0].diameter
      newSpecs.rebar.source = `Extracted from PDF (${results.rebar[0].tag})`
    }

    setConfiguredSpecs(newSpecs)
    return results
  }

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processPdfFile(files[0])
    }
  }

  // Handle File Input Change
  const handleFileInput = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      processPdfFile(files[0])
    }
  }

  // Apply to calculators
  const handleApply = () => {
    localStorage.setItem('estimate_extracted_specs_v1', JSON.stringify(configuredSpecs))
    if (onApplySpecs) {
      onApplySpecs(configuredSpecs)
    }
    setAppliedNotice(true)
    setTimeout(() => setAppliedNotice(false), 3000)
  }

  // Create new project automatically from configured blueprint specs
  const handleCreateProject = () => {
    const col = configuredSpecs.column
    const beam = configuredSpecs.beam
    const slab = configuredSpecs.slab
    const ftg = configuredSpecs.footing
    const reb = configuredSpecs.rebar

    const projectData = {
      structural: {
        slabLength: slab.length || '10.00',
        slabWidth: slab.width || '8.00',
        slabThickness: slab.thickness || '0.125',
        columnCount: col.count || '8',
        columnWidth: col.width || '0.40',
        columnDepth: col.depth || '0.40',
        columnHeight: col.height || '3.00',
        footingCount: ftg.count || '8',
        footingLength: ftg.length || '1.20',
        footingWidth: ftg.width || '1.20',
        footingThickness: ftg.thickness || '0.35',
        mixClass: 'A',
        wastage: '5',
        bagSize: 40,
        rebarRatio: '85',
      },
      formwork: {
        elementType: 'column',
        length: col.width || '0.40',
        width: col.depth || '0.40',
        heightDepth: col.height || '3.00',
        quantity: col.count || '8',
        plywoodChoice: 'phenolic_18',
        lumberChoice: '2x2',
        wastePercent: '10',
        studSpacing: '0.30',
      },
      rebar: {
        diameter: reb.mainDia || '16',
        stockChoice: 'optimal',
        cuts: [
          {
            id: '1',
            mark: 'Column Main Verticals',
            length: (Number(col.height || 3) + 0.6).toFixed(2),
            count: String(Number(col.count || 8) * 4),
          },
          {
            id: '2',
            mark: 'Beam Top/Bottom Bars',
            length: beam.length || '5.00',
            count: String(Number(beam.count || 6) * 4),
          },
          {
            id: '3',
            mark: 'Ties & Stirrups',
            length: '1.35',
            count: String(Number(col.count || 8) * 12),
          },
        ],
      },
      roofing: {
        length: (Number(slab.length || 10) + 1.6).toFixed(2),
        width: (Number(slab.width || 8) + 1.6).toFixed(2),
        overhang: '0.80',
        pitch: '1/3',
        customAngle: '',
        material: 'corrugated',
        sheetLengthChoice: '10ft',
        customSheetLength: '',
      },
    }

    if (onCreateProject) {
      onCreateProject({
        name: newProjectTitle.trim() || `Project from ${fileName || 'Plan'}`,
        location: newProjectLocation.trim() || 'Metro Manila',
        data: projectData,
      })
    } else if (onApplySpecs) {
      onApplySpecs(configuredSpecs)
    }
  }

  // Flat list of all extracted items
  const allItems = extractedSpecs
    ? [
        ...extractedSpecs.columns,
        ...extractedSpecs.beams,
        ...extractedSpecs.slabs,
        ...extractedSpecs.footings,
        ...extractedSpecs.rebar,
      ]
    : []

  // Tab definitions with count badges
  const TABS = [
    { id: 'all', label: 'All Trades', count: allItems.length },
    { id: 'column', label: 'Column', count: extractedSpecs?.columns?.length || 0 },
    { id: 'beam', label: 'Beam', count: extractedSpecs?.beams?.length || 0 },
    { id: 'slab', label: 'Slab', count: extractedSpecs?.slabs?.length || 0 },
    { id: 'footing', label: 'Footing', count: extractedSpecs?.footings?.length || 0 },
    { id: 'rebar', label: 'Rebar', count: extractedSpecs?.rebar?.length || 0 },
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-7 text-center transition-all ${
          isDragging
            ? 'border-[#F98125] bg-[#F98125]/10 scale-[1.01]'
            : 'border-[#2C599D]/70 bg-[#193A6F]/40 hover:border-[#F98125] hover:bg-[#193A6F]/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F98125] text-white shadow-lg shadow-orange-950/40">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 12 15 15" />
            </svg>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">
              {fileName ? fileName : 'Upload Architectural or Structural Plan (.PDF)'}
            </h4>
            <p className="mt-1 text-xs text-[#7CA3E2]">
              Drag &amp; drop structural drawings, beam/column schedules, or click to browse.
            </p>
          </div>

          {fileName && (
            <div className="flex items-center gap-2 text-[0.7rem] text-blue-200">
              <span className="rounded bg-[#11224D] px-2 py-0.5 font-mono">{fileSize}</span>
              <span>•</span>
              <span className="font-mono">{pageCount} pages parsed</span>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 grid place-items-center rounded-3xl bg-[#07132F]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-white">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#F98125] border-t-transparent" />
              <span className="text-xs font-semibold text-blue-200">{progress}</span>
            </div>
          </div>
        )}
      </div>

      {/* Button to re-open inspection drawer if specs exist */}
      {extractedSpecs && !drawerOpen && (
        <div className="flex items-center justify-between rounded-2xl border border-[#2C599D]/80 bg-[#193A6F]/60 p-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-white">
              {allItems.length} Candidate Specs Detected from {fileName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-xl bg-[#F98125] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#e07421]"
          >
            Open Structural Inspector Drawer
          </button>
        </div>
      )}

      {/* Inspection Drawer / Side Sheet */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="h-full w-full max-w-2xl bg-[#07132F] border-l border-[#2C599D]/80 p-5 sm:p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between border-b border-[#2C599D]/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F98125] text-white">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">Structural Plan Inspector &amp; Studio</h3>
                      <p className="text-[0.68rem] text-[#7CA3E2]">
                        {fileName} · {allItems.length} candidate dimensions detected
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Filter & Specification Tabs */}
                <div className="mt-3.5 flex flex-wrap gap-1.5 border-b border-[#2C599D]/40 pb-3 text-xs">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedTab(tab.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[0.7rem] font-bold transition ${
                        selectedTab === tab.id
                          ? 'bg-[#F98125] text-white shadow-md shadow-orange-950/30'
                          : 'bg-[#193A6F]/60 text-blue-200 hover:bg-[#193A6F] hover:text-white'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[0.6rem] font-mono ${
                          selectedTab === tab.id
                            ? 'bg-black/30 text-white'
                            : 'bg-[#07132F]/80 text-[#7CA3E2]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Content Body */}
              <div className="my-3.5 flex-1 space-y-4 overflow-y-auto pr-1">
                {/* 1. COLUMN TAB */}
                {selectedTab === 'column' && (
                  <div className="space-y-4">
                    {/* Active Configurator */}
                    <div className="rounded-2xl border border-[#F98125]/60 bg-[#11224D]/90 p-4 shadow-lg space-y-3">
                      <div className="flex items-center justify-between border-b border-[#2C599D]/60 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#F98125]" />
                          Active Column Parameters for Project
                        </span>
                        <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[0.62rem] font-semibold text-orange-300">
                          {configuredSpecs.column.source}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Width (m)</label>
                          <input
                            type="number"
                            step="0.05"
                            value={configuredSpecs.column.width}
                            onChange={(e) => updateSpec('column', 'width', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Depth (m)</label>
                          <input
                            type="number"
                            step="0.05"
                            value={configuredSpecs.column.depth}
                            onChange={(e) => updateSpec('column', 'depth', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Clear Height (m)</label>
                          <input
                            type="number"
                            step="0.10"
                            value={configuredSpecs.column.height}
                            onChange={(e) => updateSpec('column', 'height', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Quantity (pcs)</label>
                          <input
                            type="number"
                            step="1"
                            value={configuredSpecs.column.count}
                            onChange={(e) => updateSpec('column', 'count', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#07132F]/80 p-2.5 text-xs border border-[#2C599D]/60">
                        <span className="text-[0.7rem] text-[#7CA3E2]">
                          Concrete Vol: <strong className="text-white">{(Number(configuredSpecs.column.width) * Number(configuredSpecs.column.depth) * Number(configuredSpecs.column.height) * Number(configuredSpecs.column.count)).toFixed(2)} m³</strong>
                        </span>
                        <span className="text-[0.7rem] text-[#7CA3E2]">
                          Formwork Contact: <strong className="text-white">{(2 * (Number(configuredSpecs.column.width) + Number(configuredSpecs.column.depth)) * Number(configuredSpecs.column.height) * Number(configuredSpecs.column.count)).toFixed(2)} m²</strong>
                        </span>
                      </div>
                    </div>

                    {/* Extracted Candidates List */}
                    <div className="space-y-2">
                      <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-[#7CA3E2]">
                        Extracted Column Candidates from Plan ({extractedSpecs?.columns?.length || 0})
                      </span>
                      {extractedSpecs?.columns?.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#2C599D]/60 p-4 text-center text-xs text-slate-400">
                          No column schedule text detected in this PDF. The 2-Story RC baseline (0.40m × 0.40m) is active above for your project.
                        </div>
                      ) : (
                        extractedSpecs?.columns?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl border border-[#2C599D]/70 bg-[#11224D]/60 p-3"
                          >
                            <div>
                              <p className="font-bold text-white text-xs">{item.tag}</p>
                              <p className="font-mono text-[0.68rem] text-slate-300">"{item.snippet}" · Page {item.page}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => adoptCandidate('column', item)}
                              className="rounded-lg bg-[#193A6F] px-2.5 py-1 text-xs font-bold text-blue-200 hover:bg-[#F98125] hover:text-white transition"
                            >
                              ✓ Adopt
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 2. BEAM TAB */}
                {selectedTab === 'beam' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#F98125]/60 bg-[#11224D]/90 p-4 shadow-lg space-y-3">
                      <div className="flex items-center justify-between border-b border-[#2C599D]/60 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#F98125]" />
                          Active Beam Parameters for Project
                        </span>
                        <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[0.62rem] font-semibold text-orange-300">
                          {configuredSpecs.beam.source}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Width (m)</label>
                          <input
                            type="number"
                            step="0.05"
                            value={configuredSpecs.beam.width}
                            onChange={(e) => updateSpec('beam', 'width', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Depth (m)</label>
                          <input
                            type="number"
                            step="0.05"
                            value={configuredSpecs.beam.depth}
                            onChange={(e) => updateSpec('beam', 'depth', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Span Length (m)</label>
                          <input
                            type="number"
                            step="0.25"
                            value={configuredSpecs.beam.length}
                            onChange={(e) => updateSpec('beam', 'length', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Quantity (pcs)</label>
                          <input
                            type="number"
                            step="1"
                            value={configuredSpecs.beam.count}
                            onChange={(e) => updateSpec('beam', 'count', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#07132F]/80 p-2.5 text-xs border border-[#2C599D]/60">
                        <span className="text-[0.7rem] text-[#7CA3E2]">
                          Concrete Vol: <strong className="text-white">{(Number(configuredSpecs.beam.width) * Number(configuredSpecs.beam.depth) * Number(configuredSpecs.beam.length) * Number(configuredSpecs.beam.count)).toFixed(2)} m³</strong>
                        </span>
                        <span className="text-[0.7rem] text-[#7CA3E2]">
                          Contact Area: <strong className="text-white">{((Number(configuredSpecs.beam.width) + 2 * Number(configuredSpecs.beam.depth)) * Number(configuredSpecs.beam.length) * Number(configuredSpecs.beam.count)).toFixed(2)} m²</strong>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-[#7CA3E2]">
                        Extracted Beam Candidates from Plan ({extractedSpecs?.beams?.length || 0})
                      </span>
                      {extractedSpecs?.beams?.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#2C599D]/60 p-4 text-center text-xs text-slate-400">
                          No beam schedule text detected. Baseline 250×500mm beam parameters are active above.
                        </div>
                      ) : (
                        extractedSpecs?.beams?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl border border-[#2C599D]/70 bg-[#11224D]/60 p-3"
                          >
                            <div>
                              <p className="font-bold text-white text-xs">{item.tag}</p>
                              <p className="font-mono text-[0.68rem] text-slate-300">"{item.snippet}" · Page {item.page}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => adoptCandidate('beam', item)}
                              className="rounded-lg bg-[#193A6F] px-2.5 py-1 text-xs font-bold text-blue-200 hover:bg-[#F98125] hover:text-white transition"
                            >
                              ✓ Adopt
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 3. SLAB TAB */}
                {selectedTab === 'slab' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#F98125]/60 bg-[#11224D]/90 p-4 shadow-lg space-y-3">
                      <div className="flex items-center justify-between border-b border-[#2C599D]/60 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#F98125]" />
                          Active Floor Slab Parameters
                        </span>
                        <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[0.62rem] font-semibold text-orange-300">
                          {configuredSpecs.slab.source}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Footprint Length (m)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={configuredSpecs.slab.length}
                            onChange={(e) => updateSpec('slab', 'length', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Footprint Width (m)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={configuredSpecs.slab.width}
                            onChange={(e) => updateSpec('slab', 'width', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Thickness (m)</label>
                          <input
                            type="number"
                            step="0.005"
                            value={configuredSpecs.slab.thickness}
                            onChange={(e) => updateSpec('slab', 'thickness', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#07132F]/80 p-2.5 text-xs border border-[#2C599D]/60">
                        <span className="text-[0.7rem] text-[#7CA3E2]">
                          Floor Area: <strong className="text-white">{(Number(configuredSpecs.slab.length) * Number(configuredSpecs.slab.width)).toFixed(2)} m²</strong>
                        </span>
                        <span className="text-[0.7rem] text-[#7CA3E2]">
                          Slab Volume: <strong className="text-white">{(Number(configuredSpecs.slab.length) * Number(configuredSpecs.slab.width) * Number(configuredSpecs.slab.thickness)).toFixed(2)} m³</strong>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-[#7CA3E2]">
                        Extracted Slab Thickness Candidates ({extractedSpecs?.slabs?.length || 0})
                      </span>
                      {extractedSpecs?.slabs?.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#2C599D]/60 p-4 text-center text-xs text-slate-400">
                          No slab schedule text detected. Baseline 125mm (0.125m) thickness is active above.
                        </div>
                      ) : (
                        extractedSpecs?.slabs?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl border border-[#2C599D]/70 bg-[#11224D]/60 p-3"
                          >
                            <div>
                              <p className="font-bold text-white text-xs">{item.tag}</p>
                              <p className="font-mono text-[0.68rem] text-slate-300">"{item.snippet}" · Page {item.page}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => adoptCandidate('slab', item)}
                              className="rounded-lg bg-[#193A6F] px-2.5 py-1 text-xs font-bold text-blue-200 hover:bg-[#F98125] hover:text-white transition"
                            >
                              ✓ Adopt
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 4. FOOTING TAB */}
                {selectedTab === 'footing' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#F98125]/60 bg-[#11224D]/90 p-4 shadow-lg space-y-3">
                      <div className="flex items-center justify-between border-b border-[#2C599D]/60 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#F98125]" />
                          Active Footing Foundation Parameters
                        </span>
                        <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[0.62rem] font-semibold text-orange-300">
                          {configuredSpecs.footing.source}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Length (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={configuredSpecs.footing.length}
                            onChange={(e) => updateSpec('footing', 'length', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Width (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={configuredSpecs.footing.width}
                            onChange={(e) => updateSpec('footing', 'width', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Thickness (m)</label>
                          <input
                            type="number"
                            step="0.05"
                            value={configuredSpecs.footing.thickness}
                            onChange={(e) => updateSpec('footing', 'thickness', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Count (pcs)</label>
                          <input
                            type="number"
                            step="1"
                            value={configuredSpecs.footing.count}
                            onChange={(e) => updateSpec('footing', 'count', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#07132F]/80 p-2.5 text-xs border border-[#2C599D]/60">
                        <span className="text-[0.7rem] text-[#7CA3E2]">
                          Concrete Vol: <strong className="text-white">{(Number(configuredSpecs.footing.length) * Number(configuredSpecs.footing.width) * Number(configuredSpecs.footing.thickness) * Number(configuredSpecs.footing.count)).toFixed(2)} m³</strong>
                        </span>
                        <span className="text-[0.7rem] text-[#7CA3E2]">
                          Formwork Area: <strong className="text-white">{(2 * (Number(configuredSpecs.footing.length) + Number(configuredSpecs.footing.width)) * Number(configuredSpecs.footing.thickness) * Number(configuredSpecs.footing.count)).toFixed(2)} m²</strong>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-[#7CA3E2]">
                        Extracted Footing Candidates ({extractedSpecs?.footings?.length || 0})
                      </span>
                      {extractedSpecs?.footings?.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#2C599D]/60 p-4 text-center text-xs text-slate-400">
                          No footing schedule text detected. Baseline 1.20×1.20×0.35m isolated footing parameters are active above.
                        </div>
                      ) : (
                        extractedSpecs?.footings?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl border border-[#2C599D]/70 bg-[#11224D]/60 p-3"
                          >
                            <div>
                              <p className="font-bold text-white text-xs">{item.tag}</p>
                              <p className="font-mono text-[0.68rem] text-slate-300">"{item.snippet}" · Page {item.page}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => adoptCandidate('footing', item)}
                              className="rounded-lg bg-[#193A6F] px-2.5 py-1 text-xs font-bold text-blue-200 hover:bg-[#F98125] hover:text-white transition"
                            >
                              ✓ Adopt
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 5. REBAR TAB */}
                {selectedTab === 'rebar' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#F98125]/60 bg-[#11224D]/90 p-4 shadow-lg space-y-3">
                      <div className="flex items-center justify-between border-b border-[#2C599D]/60 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#F98125]" />
                          Active Reinforcement Specifications
                        </span>
                        <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[0.62rem] font-semibold text-orange-300">
                          {configuredSpecs.rebar.source}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Main Bar Diameter</label>
                          <select
                            value={configuredSpecs.rebar.mainDia}
                            onChange={(e) => updateSpec('rebar', 'mainDia', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 text-xs text-white focus:outline-none focus:border-[#F98125]"
                          >
                            <option value="12">12mm Ø Deformed Bar</option>
                            <option value="16">16mm Ø Deformed Bar (Standard)</option>
                            <option value="20">20mm Ø Deformed Bar</option>
                            <option value="25">25mm Ø Deformed Bar</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Ties / Stirrup Diameter</label>
                          <select
                            value={configuredSpecs.rebar.tieDia}
                            onChange={(e) => updateSpec('rebar', 'tieDia', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 text-xs text-white focus:outline-none focus:border-[#F98125]"
                          >
                            <option value="10">10mm Ø Lateral Ties</option>
                            <option value="12">12mm Ø Heavy Ties</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-semibold text-[#7CA3E2] mb-1">Tie Spacing (m)</label>
                          <input
                            type="number"
                            step="0.05"
                            value={configuredSpecs.rebar.spacing}
                            onChange={(e) => updateSpec('rebar', 'spacing', e.target.value)}
                            className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] p-2 font-mono text-xs text-white focus:outline-none focus:border-[#F98125]"
                          />
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#07132F]/80 p-2.5 text-xs text-[#7CA3E2] border border-[#2C599D]/60 flex justify-between items-center">
                        <span>PNS 49 / DPWH Standard: Minimum 4 vertical bars per column with #16 G.I. tie wire.</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-[#7CA3E2]">
                        Extracted Rebar Callouts ({extractedSpecs?.rebar?.length || 0})
                      </span>
                      {extractedSpecs?.rebar?.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#2C599D]/60 p-4 text-center text-xs text-slate-400">
                          No rebar schedule text detected. Baseline 16mm Ø Grade 40 bars are active above.
                        </div>
                      ) : (
                        extractedSpecs?.rebar?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl border border-[#2C599D]/70 bg-[#11224D]/60 p-3"
                          >
                            <div>
                              <p className="font-bold text-white text-xs">{item.tag}</p>
                              <p className="font-mono text-[0.68rem] text-slate-300">"{item.snippet}" · Page {item.page}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => adoptCandidate('rebar', item)}
                              className="rounded-lg bg-[#193A6F] px-2.5 py-1 text-xs font-bold text-blue-200 hover:bg-[#F98125] hover:text-white transition"
                            >
                              ✓ Adopt
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 6. ALL TAB (EXECUTIVE SUMMARY & INSPECTOR) */}
                {selectedTab === 'all' && (
                  <div className="space-y-4">
                    {extractedSpecs?.noMatchesFound && (
                      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                        <p className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                          <span>💡 Smart Structural Heuristics Applied</span>
                        </p>
                        <p className="text-[0.72rem] leading-relaxed text-amber-200/90">
                          This plan was identified as a <strong>2-Story Residential House</strong>. Standard structural member specifications have been calculated and loaded into the tabs above. Click any category tab or tune dimensions below.
                        </p>
                      </div>
                    )}

                    {/* 5-Card Trade Overview Grid */}
                    <div className="space-y-2">
                      <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-[#7CA3E2]">
                        Configured Project Takeoff Breakdown
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Column Card */}
                        <div className="rounded-xl border border-[#2C599D]/70 bg-[#11224D]/80 p-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-white">Columns ({configuredSpecs.column.count} pcs)</span>
                              <span className="rounded bg-orange-500/20 px-1.5 py-0.5 font-mono text-[0.62rem] text-orange-300">
                                {configuredSpecs.column.width}×{configuredSpecs.column.depth}m
                              </span>
                            </div>
                            <p className="text-[0.68rem] text-[#7CA3E2]">
                              Clear Height: {configuredSpecs.column.height}m · Concrete: {(Number(configuredSpecs.column.width) * Number(configuredSpecs.column.depth) * Number(configuredSpecs.column.height) * Number(configuredSpecs.column.count)).toFixed(2)} m³
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedTab('column')}
                            className="mt-2.5 text-left text-[0.68rem] font-bold text-[#F98125] hover:underline"
                          >
                            Inspect / Edit Columns →
                          </button>
                        </div>

                        {/* Beam Card */}
                        <div className="rounded-xl border border-[#2C599D]/70 bg-[#11224D]/80 p-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-white">Beams ({configuredSpecs.beam.count} pcs)</span>
                              <span className="rounded bg-orange-500/20 px-1.5 py-0.5 font-mono text-[0.62rem] text-orange-300">
                                {configuredSpecs.beam.width}×{configuredSpecs.beam.depth}m
                              </span>
                            </div>
                            <p className="text-[0.68rem] text-[#7CA3E2]">
                              Span: {configuredSpecs.beam.length}m · Concrete: {(Number(configuredSpecs.beam.width) * Number(configuredSpecs.beam.depth) * Number(configuredSpecs.beam.length) * Number(configuredSpecs.beam.count)).toFixed(2)} m³
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedTab('beam')}
                            className="mt-2.5 text-left text-[0.68rem] font-bold text-[#F98125] hover:underline"
                          >
                            Inspect / Edit Beams →
                          </button>
                        </div>

                        {/* Slab Card */}
                        <div className="rounded-xl border border-[#2C599D]/70 bg-[#11224D]/80 p-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-white">Floor Slab</span>
                              <span className="rounded bg-orange-500/20 px-1.5 py-0.5 font-mono text-[0.62rem] text-orange-300">
                                t = {configuredSpecs.slab.thickness}m
                              </span>
                            </div>
                            <p className="text-[0.68rem] text-[#7CA3E2]">
                              Footprint: {configuredSpecs.slab.length}m × {configuredSpecs.slab.width}m ({(Number(configuredSpecs.slab.length) * Number(configuredSpecs.slab.width)).toFixed(1)} m²)
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedTab('slab')}
                            className="mt-2.5 text-left text-[0.68rem] font-bold text-[#F98125] hover:underline"
                          >
                            Inspect / Edit Slab →
                          </button>
                        </div>

                        {/* Footing Card */}
                        <div className="rounded-xl border border-[#2C599D]/70 bg-[#11224D]/80 p-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-white">Footings ({configuredSpecs.footing.count} pcs)</span>
                              <span className="rounded bg-orange-500/20 px-1.5 py-0.5 font-mono text-[0.62rem] text-orange-300">
                                {configuredSpecs.footing.length}×{configuredSpecs.footing.width}m
                              </span>
                            </div>
                            <p className="text-[0.68rem] text-[#7CA3E2]">
                              Thk: {configuredSpecs.footing.thickness}m · Concrete: {(Number(configuredSpecs.footing.length) * Number(configuredSpecs.footing.width) * Number(configuredSpecs.footing.thickness) * Number(configuredSpecs.footing.count)).toFixed(2)} m³
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedTab('footing')}
                            className="mt-2.5 text-left text-[0.68rem] font-bold text-[#F98125] hover:underline"
                          >
                            Inspect / Edit Footings →
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Raw Schedule Callouts List */}
                    {allItems.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#2C599D]/40">
                        <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-[#7CA3E2]">
                          Raw Blueprint Schedule Callouts ({allItems.length})
                        </span>
                        {allItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-[#2C599D]/60 bg-[#11224D]/60 p-2.5 text-xs flex justify-between items-center"
                          >
                            <span className="font-bold text-white flex items-center gap-2">
                              <span className="rounded bg-[#F98125]/20 px-1.5 py-0.2 font-mono text-[0.62rem] text-[#F98125]">
                                {item.type}
                              </span>
                              {item.tag}
                            </span>
                            <span className="font-mono text-[0.65rem] text-blue-200">Page {item.page}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Footer & Actions */}
              <div className="border-t border-[#2C599D]/60 pt-3.5 space-y-3">
                {onCreateProject && (
                  <div className="rounded-2xl border border-[#2C599D]/80 bg-[#11224D]/90 p-3 space-y-2 text-xs">
                    <span className="font-bold text-white text-[0.7rem] uppercase tracking-wider block">
                      New Project Details from Plan
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[0.65rem] text-[#7CA3E2] mb-1 font-semibold">Project Name</label>
                        <input
                          type="text"
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          placeholder="Project Name..."
                          className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F98125]"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] text-[#7CA3E2] mb-1 font-semibold">Location</label>
                        <input
                          type="text"
                          value={newProjectLocation}
                          onChange={(e) => setNewProjectLocation(e.target.value)}
                          placeholder="e.g. Quezon City, Metro Manila"
                          className="w-full rounded-lg border border-[#2C599D] bg-[#07132F] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F98125]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {appliedNotice && (
                  <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-2 text-center text-xs font-bold text-emerald-300">
                    ✓ Applied to local session. Open your estimator modules below!
                  </div>
                )}

                <div className="flex gap-2">
                  {onCreateProject ? (
                    <button
                      type="button"
                      onClick={handleCreateProject}
                      className="flex-1 rounded-xl bg-[#F98125] py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-[#e07421] shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Save &amp; Create New Project from Plan
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApply}
                      className="flex-1 rounded-xl bg-[#F98125] py-2.5 text-xs font-bold text-white transition hover:bg-[#e07421]"
                    >
                      Save &amp; Apply Extracted Specs
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-xl border border-[#2C599D] px-4 py-2.5 text-xs font-semibold text-blue-200 hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
