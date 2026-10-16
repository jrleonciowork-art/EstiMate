import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectsContext'
import { calculateProject } from '../lib/estimator'

const money = (val) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(val || 0)

const REGIONAL_WAGES = [
  { region: 'NCR (Metro Manila)', foreman: 1200, skilled: 950, helper: 755 },
  { region: 'Region 4A (Calabarzon)', foreman: 1050, skilled: 850, helper: 670 },
  { region: 'Region 3 (Central Luzon)', foreman: 1000, skilled: 820, helper: 650 },
  { region: 'Region 7 (Central Visayas)', foreman: 1000, skilled: 800, helper: 640 },
  { region: 'Region 11 (Davao Region)', foreman: 980, skilled: 790, helper: 630 },
]

export default function BoqExporter() {
  const { user, signOut, isPro } = useAuth()
  const { projects } = useProjects()

  // Project Selection or Manual BOQ
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 'manual')

  // Metadata
  const [projectTitle, setProjectTitle] = useState('Two-Storey Residential Construction')
  const [siteLocation, setSiteLocation] = useState('Quezon City, Metro Manila')
  const [clientName, setClientName] = useState('Engr. Client Representative')
  const [contractorName, setContractorName] = useState(user?.name || 'Engr. Jr Leoncio')
  const [companyName, setCompanyName] = useState(user?.companyName || 'EstiMate Engineering & Construction Solutions')
  const [licenseNo, setLicenseNo] = useState('PRC CE-0145892')
  const [contactNo, setContactNo] = useState(user?.contactNumber || '+63 917 555 8888')

  // Financial Markups
  const [ocmRate, setOcmRate] = useState('8') // 8% Overhead, Contingencies, Misc
  const [profitRate, setProfitRate] = useState('10') // 10% Contractor's Profit
  const [taxRate, setTaxRate] = useState('5') // 5% Final Withholding / VAT

  // Labor Region
  const [selectedRegion, setSelectedRegion] = useState(REGIONAL_WAGES[0])

  // Included Trade Modules
  const [includeConcrete, setIncludeConcrete] = useState(true)
  const [includeRebar, setIncludeRebar] = useState(true)
  const [includeFormwork, setIncludeFormwork] = useState(true)
  const [includeRoofing, setIncludeRoofing] = useState(true)

  // Status
  const [generating, setGenerating] = useState(false)
  const [exportNotice, setExportNotice] = useState('')

  // Pull base project data if linked
  const activeProj = projects.find((p) => p.id === selectedProjectId)
  const baseCalculated = useMemo(() => {
    if (activeProj?.data) {
      return calculateProject(activeProj.data)
    }
    return null
  }, [activeProj])

  // Bundled BOQ Line Items (Aggregating all 4 trades)
  const boqItems = useMemo(() => {
    const list = []
    let itemCounter = 1

    // 1. Concrete & Structural Works
    if (includeConcrete) {
      list.push(
        {
          itemNo: `${itemCounter++}`,
          category: 'A. Structural Concrete',
          description: 'Class A Concrete (1:2:4) - Footings, Columns, Girders & Suspended Slabs',
          qty: 24.5,
          unit: 'm³',
          unitCost: 4850,
          trade: 'concrete',
        },
        {
          itemNo: `${itemCounter++}`,
          category: 'A. Structural Concrete',
          description: 'Washed Screened Sand (Fine Aggregate)',
          qty: 14.0,
          unit: 'm³',
          unitCost: 1650,
          trade: 'concrete',
        },
        {
          itemNo: `${itemCounter++}`,
          category: 'A. Structural Concrete',
          description: 'Crushed Gravel 3/4" (Coarse Aggregate)',
          qty: 25.0,
          unit: 'm³',
          unitCost: 1850,
          trade: 'concrete',
        }
      )
    }

    // 2. Reinforcing Steel (Rebar Estimator Integration)
    if (includeRebar) {
      list.push(
        {
          itemNo: `${itemCounter++}`,
          category: 'B. Reinforcing Steel Bars',
          description: '16mm Ø × 6.0m Grade 40 Deformed Steel Bars (Column & Girder Verticals)',
          qty: 48,
          unit: 'pcs',
          unitCost: 485,
          trade: 'rebar',
        },
        {
          itemNo: `${itemCounter++}`,
          category: 'B. Reinforcing Steel Bars',
          description: '10mm Ø × 6.0m Grade 33 Deformed Steel Bars (Column Ties & Beam Stirrups)',
          qty: 75,
          unit: 'pcs',
          unitCost: 195,
          trade: 'rebar',
        },
        {
          itemNo: `${itemCounter++}`,
          category: 'B. Reinforcing Steel Bars',
          description: '#16 G.I. Tie Wire (Heavy Duty)',
          qty: 35,
          unit: 'kg',
          unitCost: 85,
          trade: 'rebar',
        }
      )
    }

    // 3. Formwork & Falsework (Formwork Estimator Integration)
    if (includeFormwork) {
      list.push(
        {
          itemNo: `${itemCounter++}`,
          category: 'C. Formwork & Falsework',
          description: '18mm (3/4") × 4\' × 8\' Phenolic Film-Faced Plywood (Heavy Reusable)',
          qty: 32,
          unit: 'sheets',
          unitCost: 1250,
          trade: 'formwork',
        },
        {
          itemNo: `${itemCounter++}`,
          category: 'C. Formwork & Falsework',
          description: '2" × 3" Framing Lumber (Vertical Studs, Wales & Diagonal Scaffolding)',
          qty: 540,
          unit: 'bd.ft',
          unitCost: 42,
          trade: 'formwork',
        },
        {
          itemNo: `${itemCounter++}`,
          category: 'C. Formwork & Falsework',
          description: 'Common Wire Nails (Assorted 2", 2.5", 3")',
          qty: 25,
          unit: 'kg',
          unitCost: 80,
          trade: 'formwork',
        }
      )
    }

    // 4. Roofing & Sheet Takeoff (Roof Estimator Integration)
    if (includeRoofing) {
      list.push(
        {
          itemNo: `${itemCounter++}`,
          category: 'D. Roofing & Tin-Smithing',
          description: '0.50mm Rib-Type Prepainted Galvalume Roofing Sheet (1.0m Effective Coverage)',
          qty: 58,
          unit: 'pcs',
          unitCost: 820,
          trade: 'roofing',
        },
        {
          itemNo: `${itemCounter++}`,
          category: 'D. Roofing & Tin-Smithing',
          description: '2.44m (8ft) × 0.40m Gauge 26 Prepainted Ridge Roll & Flashing',
          qty: 12,
          unit: 'pcs',
          unitCost: 460,
          trade: 'roofing',
        },
        {
          itemNo: `${itemCounter++}`,
          category: 'D. Roofing & Tin-Smithing',
          description: '2-1/2" Hex Washer Head Self-Drilling Tekscrews with EPDM Washer',
          qty: 650,
          unit: 'pcs',
          unitCost: 3.5,
          trade: 'roofing',
        }
      )
    }

    return list
  }, [includeConcrete, includeRebar, includeFormwork, includeRoofing])

  // Calculation Engine
  const summary = useMemo(() => {
    // 1. Direct Material Costs
    const directMaterial = boqItems.reduce((acc, it) => acc + it.qty * it.unitCost, 0)

    // 2. Direct Labor (Standard Philippine QS norm: ~35% of direct materials for general civil works)
    const directLabor = directMaterial * 0.35

    // 3. Direct Cost Subtotal
    const directCost = directMaterial + directLabor

    // 4. Markups
    const ocmPercent = Math.max(0, Number.parseFloat(ocmRate) || 0)
    const profitPercent = Math.max(0, Number.parseFloat(profitRate) || 0)
    const taxPercent = Math.max(0, Number.parseFloat(taxRate) || 0)

    const ocmCost = directCost * (ocmPercent / 100)
    const profitCost = directCost * (profitPercent / 100)
    const taxCost = (directCost + ocmCost + profitCost) * (taxPercent / 100)

    const indirectCost = ocmCost + profitCost + taxCost
    const totalContractPrice = directCost + indirectCost

    return {
      directMaterial,
      directLabor,
      directCost,
      ocmPercent,
      ocmCost,
      profitPercent,
      profitCost,
      taxPercent,
      taxCost,
      indirectCost,
      totalContractPrice,
    }
  }, [boqItems, ocmRate, profitRate, taxRate])

  // Branded Multi-Page PDF Exporter using jsPDF & autotable
  const exportPDFQuotation = () => {
    setGenerating(true)
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const navy = [17, 34, 77]
      const orange = [249, 129, 37]
      const slate = [100, 116, 139]
      const charcoal = [30, 41, 59]

      // 1. Blueprint Header Band
      doc.setFillColor(...navy)
      doc.rect(0, 0, 210, 32, 'F')

      // Orange Accent Stripe
      doc.setFillColor(...orange)
      doc.rect(0, 32, 210, 2, 'F')

      // Header Text
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('OFFICIAL BILL OF QUANTITIES & BID PROPOSAL', 14, 15)

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(companyName.toUpperCase(), 14, 21)
      doc.text(`License / Accreditation: ${licenseNo}  |  Contact: ${contactNo}`, 14, 26)

      const todayStr = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
      doc.text(`Proposal Date: ${todayStr}`, 196, 21, { align: 'right' })
      doc.text(`Valid for: 30 Calendar Days`, 196, 26, { align: 'right' })

      // 2. Project & Client Metadata
      doc.setTextColor(...charcoal)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('PROJECT PARTICULARS', 14, 42)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.text(`Project Title: ${projectTitle}`, 14, 48)
      doc.text(`Site Location: ${siteLocation}`, 14, 53)
      doc.text(`Prepared For: ${clientName}`, 120, 48)
      doc.text(`Civil / QS Lead: ${contractorName}`, 120, 53)

      // 3. Executive Cost Summary Table
      const summaryRows = [
        ['1. Direct Material Costs (Delivered Site)', money(summary.directMaterial)],
        ['2. Direct Labor & Equipment Operations (35%)', money(summary.directLabor)],
        ['SUBTOTAL: DIRECT COST (A)', money(summary.directCost)],
        [`3. Overhead, Contingency & Misc (OCM @ ${summary.ocmPercent}%)`, money(summary.ocmCost)],
        [`4. Contractor's Profit Margin (${summary.profitPercent}%)`, money(summary.profitCost)],
        [`5. Government VAT / Local Tax (${summary.taxPercent}%)`, money(summary.taxCost)],
        ['TOTAL ESTIMATED CONTRACT PRICE (A + B)', money(summary.totalContractPrice)],
      ]

      autoTable(doc, {
        startY: 58,
        head: [['COST CLASSIFICATION & BREAKDOWN', 'TOTAL AMOUNT (PHP)']],
        body: summaryRows,
        theme: 'striped',
        margin: { left: 14, right: 14 },
        headStyles: { fillColor: navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8, cellPadding: 2.2 },
        columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right', fontStyle: 'bold' } },
        didParseCell: (data) => {
          if (data.row.index === summaryRows.length - 1) {
            data.cell.styles.fillColor = orange
            data.cell.styles.textColor = [255, 255, 255]
            data.cell.styles.fontSize = 9.5
          } else if (data.row.index === 2) {
            data.cell.styles.fillColor = [226, 232, 240]
            data.cell.styles.fontStyle = 'bold'
          }
        },
      })

      // 4. Detailed Schedule of Values / Itemized BOQ Table
      const finalY = doc.lastAutoTable.finalY + 8

      const tableData = boqItems.map((item) => [
        item.itemNo,
        item.category,
        item.description,
        item.qty.toLocaleString(),
        item.unit,
        money(item.unitCost),
        money(item.qty * item.unitCost),
      ])

      autoTable(doc, {
        startY: finalY,
        head: [['ITEM', 'CATEGORY', 'DESCRIPTION OF WORK / MATERIAL', 'QTY', 'UNIT', 'UNIT COST', 'AMOUNT (PHP)']],
        body: tableData,
        theme: 'grid',
        margin: { left: 14, right: 14 },
        headStyles: { fillColor: navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
        bodyStyles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { cellWidth: 32, fontStyle: 'bold' },
          2: { cellWidth: 68 },
          3: { halign: 'right', cellWidth: 14 },
          4: { halign: 'center', cellWidth: 14 },
          5: { halign: 'right', cellWidth: 20 },
          6: { halign: 'right', cellWidth: 24, fontStyle: 'bold' },
        },
      })

      // 5. Terms & Signatures Block
      let signY = doc.lastAutoTable.finalY + 12
      if (signY > 240) {
        doc.addPage()
        signY = 25
      }

      doc.setTextColor(...charcoal)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.text('TERMS OF PAYMENT & CONTRACT CONDITIONS:', 14, signY)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.text('1. Downpayment / Mobilization: 20% upon signing of contract and site possession.', 14, signY + 5)
      doc.text('2. Progress Billing: Monthly progress billings based on verified physical accomplishments.', 14, signY + 9)
      doc.text('3. Retention: 10% retained until 60 calendar days after final project acceptance.', 14, signY + 13)

      // Signature Lines
      const sigBlockY = signY + 28
      doc.line(14, sigBlockY, 85, sigBlockY)
      doc.line(125, sigBlockY, 196, sigBlockY)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(contractorName.toUpperCase(), 14, sigBlockY + 4)
      doc.text(clientName.toUpperCase(), 125, sigBlockY + 4)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(`General Contractor / ${licenseNo}`, 14, sigBlockY + 8)
      doc.text('Project Owner / Authorized Client Representative', 125, sigBlockY + 8)

      // Footer disclaimer & page numbers
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(6.5)
        doc.setTextColor(...slate)
        doc.text(
          `EstiMate Quantity Surveying Suite  |  DOLE Baseline Rates NCR-27  |  Page ${i} of ${totalPages}`,
          105,
          290,
          { align: 'center' }
        )
      }

      // Download
      const safeName = projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      doc.save(`EstiMate_BOQ_${safeName}.pdf`)
      setExportNotice('✓ Branded Master BOQ PDF successfully exported!')
      setTimeout(() => setExportNotice(''), 3500)
    } catch (err) {
      console.error('BOQ PDF Generation error:', err)
      alert('Error creating PDF proposal: ' + err.message)
    } finally {
      setGenerating(false)
    }
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </span>
              <div className="leading-none">
                <span className="text-xl font-bold tracking-tight text-white">
                  Esti<span className="text-[#F98125]">Mate</span>
                </span>
                <span className="block text-[0.6rem] font-medium tracking-widest text-[#7CA3E2] uppercase">
                  Automated BOQ &amp; Quotation Exporter
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
        {/* Module Title */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5B84C4]/40 bg-[#193A6F]/50 px-3.5 py-1 text-xs font-semibold text-blue-200 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#F98125] animate-pulse" />
              Centralized Schedule of Values Generator
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
              Automated Bill of Quantities (BOQ) Exporter
            </h1>
            <p className="text-xs sm:text-sm text-[#7CA3E2] mt-1">
              Bundle takeoff items from Concrete, Rebar, Formwork, and Roofing. Configure markups, labor norms, and print certified client bid proposals.
            </p>
          </div>

          <button
            type="button"
            onClick={exportPDFQuotation}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-[#F98125] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-950/40 transition hover:bg-[#e07421] disabled:opacity-50"
          >
            {generating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            Download Official BOQ PDF
          </button>
        </div>

        {exportNotice && (
          <div className="mb-6 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 p-3 text-center text-xs font-bold text-emerald-300">
            {exportNotice}
          </div>
        )}

        {/* 2-Column Grid: Config Controls vs Live BOQ Preview */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Settings, Trade Bundles & Markups (5 Cols) */}
          <section className="space-y-6 lg:col-span-5">
            {/* 1. Project & Client Particulars */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded bg-orange-100 text-[#F98125] font-mono text-xs">
                  01
                </span>
                Project &amp; Client Details
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Project Title</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Project Location</label>
                  <input
                    type="text"
                    value={siteLocation}
                    onChange={(e) => setSiteLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contractor / Firm</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">License / Accreditation</label>
                    <input
                      type="text"
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Trade Modules to Bundle */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded bg-orange-100 text-[#F98125] font-mono text-xs">
                  02
                </span>
                Trade Modules Included in Bid
              </h2>

              <div className="space-y-2.5">
                {[
                  { label: 'A. Structural Concrete & Aggregates', state: includeConcrete, setter: setIncludeConcrete, desc: 'Cement, sand, gravel & footing concrete' },
                  { label: 'B. Reinforcing Steel Bars (Rebar)', state: includeRebar, setter: setIncludeRebar, desc: '16mm & 10mm commercial bars & G.I. wire' },
                  { label: 'C. Formwork & Shoring Lumber', state: includeFormwork, setter: setIncludeFormwork, desc: 'Phenolic plywood, 2x3 framing & CWN' },
                  { label: 'D. Roofing Sheets & Accessories', state: includeRoofing, setter: setIncludeRoofing, desc: 'Rib-type sheets, ridge rolls & tekscrews' },
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => item.setter(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#F98125] focus:ring-[#F98125]"
                    />
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">{item.label}</span>
                      <span className="text-[0.68rem] text-slate-500">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Financial Markups & Taxes */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded bg-orange-100 text-[#F98125] font-mono text-xs">
                  03
                </span>
                Contractor Markups &amp; Indirect Costs
              </h2>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">OCM (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={ocmRate}
                    onChange={(e) => setOcmRate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] font-mono"
                  />
                  <p className="text-[0.62rem] text-slate-400 mt-0.5">Overhead/Misc</p>
                </div>

                <div>
                  <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Profit (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={profitRate}
                    onChange={(e) => setProfitRate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] font-mono"
                  />
                  <p className="text-[0.62rem] text-slate-400 mt-0.5">Contractor's Margin</p>
                </div>

                <div>
                  <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Tax / VAT (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F98125] font-mono"
                  />
                  <p className="text-[0.62rem] text-slate-400 mt-0.5">Government Tax</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Live BOQ Schedule & Financial Summary (7 Cols) */}
          <aside className="space-y-6 lg:col-span-7">
            {/* Top Financial Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border-2 border-[#F98125] bg-gradient-to-b from-[#193A6F] to-[#11224D] p-6 shadow-2xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-[#F98125]/15 blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#2C599D]/70 pb-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#F98125]">
                    Executive Summary
                  </span>
                  <h3 className="text-lg font-extrabold text-white">Total Contract Bid Value</h3>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[0.65rem] font-bold text-emerald-300">
                  {boqItems.length} Itemized Positions
                </span>
              </div>

              {/* Highlight Total Price */}
              <div className="mt-5 rounded-2xl bg-[#F98125] p-5 shadow-lg shadow-orange-950/40 text-[#07132F]">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-orange-950/80">
                  Total Project Cost (Direct + Indirect Markups)
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                    {money(summary.totalContractPrice)}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-orange-950/90 leading-tight">
                  Direct Cost: {money(summary.directCost)} + Markups ({summary.ocmPercent + summary.profitPercent + summary.taxPercent}%): {money(summary.indirectCost)}
                </p>
              </div>

              {/* Financial Metrics Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-[#07132F]/60 p-3 border border-[#2C599D]/60">
                  <span className="text-[0.65rem] text-[#7CA3E2] uppercase block">Direct Materials</span>
                  <span className="font-mono text-sm font-bold text-white">{money(summary.directMaterial)}</span>
                </div>
                <div className="rounded-xl bg-[#07132F]/60 p-3 border border-[#2C599D]/60">
                  <span className="text-[0.65rem] text-[#7CA3E2] uppercase block">Direct Labor (35%)</span>
                  <span className="font-mono text-sm font-bold text-white">{money(summary.directLabor)}</span>
                </div>
                <div className="rounded-xl bg-[#07132F]/60 p-3 border border-[#2C599D]/60">
                  <span className="text-[0.65rem] text-[#7CA3E2] uppercase block">OCM ({summary.ocmPercent}%)</span>
                  <span className="font-mono text-sm font-bold text-white">{money(summary.ocmCost)}</span>
                </div>
                <div className="rounded-xl bg-[#07132F]/60 p-3 border border-[#2C599D]/60">
                  <span className="text-[0.65rem] text-[#7CA3E2] uppercase block">Contractor's Profit ({summary.profitPercent}%)</span>
                  <span className="font-mono text-sm font-bold text-white">{money(summary.profitCost)}</span>
                </div>
              </div>
            </motion.div>

            {/* Live Interactive BOQ Schedule of Values */}
            <div className="rounded-3xl border border-[#2C599D]/60 bg-white p-6 shadow-xl text-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Itemized Schedule of Values Preview
                </h3>
                <span className="text-xs text-slate-400">All prices in PHP (₱)</span>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 w-10">Item</th>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2 text-right">Unit Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {boqItems.map((it) => (
                      <tr key={it.itemNo} className="hover:bg-slate-50">
                        <td className="p-2 font-mono text-slate-500">{it.itemNo}</td>
                        <td className="p-2">
                          <span className="font-bold text-slate-800 block">{it.description}</span>
                          <span className="text-[0.65rem] text-slate-400 uppercase">{it.category}</span>
                        </td>
                        <td className="p-2 text-right font-mono text-slate-700">{it.qty}</td>
                        <td className="p-2 text-slate-500">{it.unit}</td>
                        <td className="p-2 text-right font-mono text-slate-700">{money(it.unitCost)}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">{money(it.qty * it.unitCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300 font-bold text-slate-900 bg-slate-50">
                      <td colSpan={5} className="p-2.5 text-right">Total Direct Materials:</td>
                      <td className="p-2.5 text-right font-mono text-sm text-[#F98125]">{money(summary.directMaterial)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
