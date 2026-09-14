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

  // Check for company branding from user profile settings
  let profile = null
  try {
    const raw = localStorage.getItem('estimate_user_profile_v1') || localStorage.getItem('estimate_auth_session_v1')
    profile = raw ? JSON.parse(raw) : null
  } catch {
    profile = null
  }

  doc.setFillColor(...navy)
  doc.rect(0, 0, 210, 34, 'F')

  // Render company logo or fallback EstiMate orange badge
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
  doc.text(profile?.companyName || 'EstiMate', 36, 16)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const subtitle = profile?.name ? `PREPARED BY: ${profile.name.toUpperCase()} · ${profile.position || 'ESTIMATOR'}` : 'RESIDENTIAL QUANTITY SURVEYING SUITE'
  doc.text(subtitle, 36, 22)
  doc.setFontSize(9)
  doc.text('MASTER BILL OF QUANTITIES', 196, 15, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.text(project.meta?.name || 'Untitled Project', 196, 21, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(`${project.meta?.location || 'Location not set'} | Generated: ${generated}`, 196, 27, { align: 'right' })

  doc.setTextColor(...navy)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Cost summary', 14, 44)
  const summary = [
    ['Materials', money(project.materialCost)],
    ['Labor', money(project.laborCost)],
    ['Subtotal', money(project.subtotal)],
    ['Contingency (5%)', money(project.contingency)],
    ['TOTAL PROJECT COST', money(project.total)],
  ]
  autoTable(doc, {
    startY: 48,
    body: summary,
    theme: 'plain',
    margin: { left: 14, right: 14 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: slate }, 1: { halign: 'right', fontStyle: 'bold', textColor: navy } },
    bodyStyles: { cellPadding: 2.2, fontSize: 9 },
    didParseCell: (hook) => {
      if (hook.row.index === summary.length - 1) {
        hook.cell.styles.fillColor = orange
        hook.cell.styles.textColor = [255, 255, 255]
        hook.cell.styles.fontSize = 10
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
    doc.setFontSize(12)
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

  let cursor = table('A. Materials', project.materials, doc.lastAutoTable.finalY + 12)
  const skilled = project.labor.filter((item) => item.laborClass !== 'Unskilled')
  const unskilled = project.labor.filter((item) => item.laborClass === 'Unskilled')
  cursor = table('B. Labor - Skilled / Supervision', skilled, cursor + 12)
  table('C. Labor - Unskilled', unskilled, cursor + 12)

  const pages = doc.internal.getNumberOfPages()
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page)
    if (page > 1) {
      doc.setFillColor(...navy)
      doc.rect(0, 0, 210, 12, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text('EstiMate', 14, 7.5)
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
