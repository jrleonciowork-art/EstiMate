import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const money = (value) => `PHP ${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const quantity = (value) => Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 3 })

export function buildBOQPdf(project) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const navy = [17, 34, 77]
  const blue = [25, 58, 111]
  const orange = [249, 129, 37]
  const slate = [71, 85, 105]
  const generated = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })

  // Check for company branding & tier status from user profile settings
  let profile = null
  try {
    const raw = localStorage.getItem('estimate_user_profile_v1') || localStorage.getItem('estimate_auth_session_v1')
    profile = raw ? JSON.parse(raw) : null
  } catch {
    profile = null
  }

  const isPro = Boolean(profile?.plan && String(profile.plan).toLowerCase().includes('pro'))

  // Free Tier Ineligibility Gate: BOQ PDF generation is exclusive to Pro Contractor accounts
  if (!isPro) {
    throw new Error('PDF BOQ Export is exclusive to Pro Contractor accounts. Free accounts are ineligible for PDF export.')
  }

  doc.setFillColor(...navy)
  doc.rect(0, 0, 210, 34, 'F')

  // Render company logo for Pro accounts, fallback to EstiMate badge if none uploaded
  let hasCustomLogo = false
  if (profile?.companyLogo && typeof profile.companyLogo === 'string' && profile.companyLogo.startsWith('data:image')) {
    try {
      doc.addImage(profile.companyLogo, 'PNG', 14, 8, 18, 18, undefined, 'FAST')
      hasCustomLogo = true
    } catch {
      hasCustomLogo = false
    }
  }

  if (!hasCustomLogo) {
    doc.setFillColor(...orange)
    doc.roundedRect(14, 9, 16, 16, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('EST', 22, 19, { align: 'center' })
  }

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  const headerTitle = profile?.companyName || 'EstiMate'
  doc.text(headerTitle, 36, 16)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const subtitle = profile?.name
    ? `PREPARED BY: ${profile.name.toUpperCase()} · ${profile.position || 'ESTIMATOR'}`
    : 'RESIDENTIAL QUANTITY SURVEYING SUITE'
  doc.text(subtitle, 36, 22)
  doc.setFontSize(9)
  doc.text('MASTER BILL OF QUANTITIES', 196, 15, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.text(project.meta?.name || 'Untitled Project', 196, 21, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(`${project.meta?.location || 'Location not set'} | Generated: ${generated}`, 196, 27, { align: 'right' })

  const costSummaryTop = 44
  doc.setTextColor(...navy)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Bid Proposal Cost Summary', 14, costSummaryTop)

  const directSubtotal = project.directCost || project.subtotal || 0
  const ocmRate = project.ocmRate ?? 8
  const profitRate = project.profitRate ?? 10
  const taxRate = project.taxRate ?? 5
  const ocmCost = project.ocmCost ?? directSubtotal * (ocmRate / 100)
  const profitCost = project.profitCost ?? directSubtotal * (profitRate / 100)
  const taxCost = project.taxCost ?? (directSubtotal + ocmCost + profitCost) * (taxRate / 100)
  const totalBid = project.totalBid ?? (directSubtotal + ocmCost + profitCost + taxCost)

  const summary = [
    ['Direct Material Cost', money(project.materialCost)],
    ['Direct Labor Cost (DOLE Regional)', money(project.laborCost)],
    ['Direct Cost Subtotal', money(directSubtotal)],
    [`Overhead, Contingencies & Misc (OCM ${ocmRate}%)`, money(ocmCost)],
    [`Contractor's Profit Margin (${profitRate}%)`, money(profitCost)],
    [`Government Tax / VAT (${taxRate}%)`, money(taxCost)],
    ['TOTAL CONTRACT BID PROPOSAL', money(totalBid)],
  ]
  autoTable(doc, {
    startY: costSummaryTop + 4,
    body: summary,
    theme: 'plain',
    margin: { left: 14, right: 14 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: slate }, 1: { halign: 'right', fontStyle: 'bold', textColor: navy } },
    bodyStyles: { cellPadding: 2.2, fontSize: 8.5 },
    didParseCell: (hook) => {
      if (hook.row.index === summary.length - 1) {
        hook.cell.styles.fillColor = orange
        hook.cell.styles.textColor = [255, 255, 255]
        hook.cell.styles.fontSize = 9.5
        hook.cell.styles.fontStyle = 'bold'
      } else if (hook.row.index === 2) {
        hook.cell.styles.fillColor = [240, 243, 248]
        hook.cell.styles.textColor = navy
        hook.cell.styles.fontStyle = 'bold'
      }
    },
  })

  const table = (title, rows, startY) => {
    if (startY > 250) {
      doc.addPage()
      startY = 22
    }
    doc.setTextColor(...navy)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(title, 14, startY)
    autoTable(doc, {
      startY: startY + 4,
      head: [['Module', 'Description', 'Qty', 'Unit', 'Unit cost', 'Amount']],
      body: rows.map((item) => [item.module, item.item, quantity(item.quantity), item.unit, money(item.unitCost), money(item.amount)]),
      foot: [['', '', '', '', 'Section total', money(rows.reduce((sum, item) => sum + item.amount, 0))]],
      theme: 'grid',
      margin: { left: 14, right: 14 },
      headStyles: { fillColor: blue, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      footStyles: { fillColor: [238, 242, 247], textColor: navy, fontStyle: 'bold', halign: 'right' },
      bodyStyles: { fontSize: 7.5, textColor: slate, cellPadding: 2 },
      alternateRowStyles: { fillColor: [247, 249, 252] },
      columnStyles: { 0: { cellWidth: 21 }, 1: { cellWidth: 59 }, 2: { halign: 'right', cellWidth: 20 }, 3: { cellWidth: 18 }, 4: { halign: 'right', cellWidth: 31 }, 5: { halign: 'right', cellWidth: 33 } },
      showFoot: 'lastPage',
    })
    return doc.lastAutoTable.finalY
  }

  let cursor = table('A. Direct Materials', project.materials, doc.lastAutoTable.finalY + 10)
  const skilled = project.labor.filter((item) => item.laborClass !== 'Unskilled')
  const unskilled = project.labor.filter((item) => item.laborClass === 'Unskilled')
  cursor = table('B. Direct Labor - Skilled / Supervision', skilled, cursor + 10)
  cursor = table('C. Direct Labor - Unskilled', unskilled, cursor + 10)

  // Payment Terms & Milestones Block
  if (cursor > 230) {
    doc.addPage()
    cursor = 22
  } else {
    cursor += 8
  }

  doc.setTextColor(...navy)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Standard Commercial Terms & Payment Milestones', 14, cursor)

  const paymentTerms = [
    ['1. Mobilization / Advance Payment (15%)', money(totalBid * 0.15), 'Due upon contract execution & site handover'],
    ['2. Progress Accomplishment Billings (75%)', money(totalBid * 0.75), 'Billed bi-weekly or monthly against verified site accomplishment'],
    ['3. Defects Liability Retention (10%)', money(totalBid * 0.10), 'Released 60 days post-turnover upon Certificate of Final Acceptance'],
  ]

  autoTable(doc, {
    startY: cursor + 3,
    body: paymentTerms,
    theme: 'plain',
    margin: { left: 14, right: 14 },
    bodyStyles: { cellPadding: 1.8, fontSize: 7.5, textColor: slate },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 65 }, 1: { halign: 'right', fontStyle: 'bold', textColor: navy, cellWidth: 35 }, 2: { cellWidth: 82 } },
  })

  // Signatures
  cursor = doc.lastAutoTable.finalY + 12
  if (cursor > 260) {
    doc.addPage()
    cursor = 30
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...slate)

  // Left side: Contractor
  doc.text('Prepared & Submitted By:', 14, cursor)
  doc.line(14, cursor + 16, 85, cursor + 16)
  doc.setFont('helvetica', 'bold')
  doc.text(profile?.name || 'CONTRACTOR / QUANTITY SURVEYOR', 14, cursor + 20)
  doc.setFont('helvetica', 'normal')
  doc.text(profile?.position ? `${profile.position.toUpperCase()} · ${profile?.companyName || ''}` : 'PROJECT QUANTITY SURVEYOR', 14, cursor + 24)

  // Right side: Client
  doc.text('Conforme & Accepted By:', 125, cursor)
  doc.line(125, cursor + 16, 196, cursor + 16)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENT / PROJECT OWNER', 125, cursor + 20)
  doc.setFont('helvetica', 'normal')
  doc.text('AUTHORIZED REPRESENTATIVE', 125, cursor + 24)

  const pages = doc.internal.getNumberOfPages()
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page)
    if (page > 1) {
      doc.setFillColor(...navy)
      doc.rect(0, 0, 210, 12, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(profile?.companyName || 'EstiMate', 14, 7.5)
      doc.setFont('helvetica', 'normal')
      doc.text('MASTER BILL OF QUANTITIES - CONTINUED', 196, 7.5, { align: 'right' })
    }

    doc.setDrawColor(220, 226, 235)
    doc.line(14, 286, 196, 286)
    doc.setTextColor(...slate)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text('Planning estimate only. Validate quantities, approved specifications, and current supplier quotations before procurement.', 14, 291)
    doc.text(`Page ${page} of ${pages}`, 196, 291, { align: 'right' })
  }

  return doc
}

export function generateBOQPdf(project) {
  const doc = buildBOQPdf(project)
  const slug = (project.meta?.name || 'Project').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')
  doc.save(`EstiMate-${slug}-BOQ-${new Date().toISOString().slice(0, 10)}.pdf`)
}
