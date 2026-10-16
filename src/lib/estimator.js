export const MIXES = {
  AA: { label: 'Class AA', ratio: '1 : 1.5 : 3', bags40: 12 },
  A: { label: 'Class A', ratio: '1 : 2 : 4', bags40: 9 },
  B: { label: 'Class B', ratio: '1 : 2.5 : 5', bags40: 7.5 },
  C: { label: 'Class C', ratio: '1 : 3 : 6', bags40: 6 },
}

export const DEFAULT_DATA = {
  structural: {
    slabLength: '', slabWidth: '', slabThickness: '',
    columnCount: '', columnWidth: '0.30', columnDepth: '0.30', columnHeight: '3.00',
    footingCount: '', footingLength: '1.20', footingWidth: '1.20', footingThickness: '0.30',
    mixClass: 'A', wastage: '5', bagSize: 40, rebarRatio: '80',
  },
  masonry: {
    wallLength: '', wallHeight: '3.00', openingsArea: '0', wastage: '5',
    plasterSides: 2, plasterThickness: '12',
  },
  finishes: {
    floorArea: '', tileWastage: '10', paintArea: '', paintCoats: '2',
  },
  formwork: {
    elementType: 'column', length: '0.40', width: '0.40', heightDepth: '3.00', quantity: '4',
    plywoodChoice: 'phenolic_18', lumberChoice: '2x2', wastePercent: '10', studSpacing: '0.30',
  },
  rebar: {
    diameter: '16', stockChoice: 'optimal',
    cuts: [
      { id: '1', mark: 'Main Column Verticals', length: '3.60', count: '16' },
      { id: '2', mark: 'Beam Top/Bottom Bars', length: '2.50', count: '12' },
      { id: '3', mark: 'Ties & Stirrups', length: '1.20', count: '24' },
    ],
  },
  roofing: {
    length: '10.00', width: '8.00', overhang: '0.80', pitch: '1/3', customAngle: '',
    material: 'corrugated', sheetLengthChoice: '10ft', customSheetLength: '',
  },
  boq: {
    ocmRate: '8', profitRate: '10', taxRate: '5',
  },
  prices: {
    cement40: '285', rebarKg: '62', sandM3: '1600', gravelM3: '1800',
    chbPiece: '22', tileM2: '650', paint4L: '780',
    plywood4x8: '1250', lumberBdft: '42', cwnNailsKg: '80', tieWireKg: '85',
    roofSheetLm: '820', ridgeRollPc: '460', tekscrewPc: '3.5',
  },
  wages: {
    region: 'NCR', foreman: '1200', skilled: '950', helper: '755',
    source: 'NCR-27 · effective 25 Jul 2026',
  },
  marketUpdated: null,
}

export const PRICE_LABELS = {
  cement40: ['Cement', '40kg bag'], rebarKg: ['Rebar', 'kg'], sandM3: ['Washed sand', 'm³'],
  gravelM3: ['Gravel 3/4', 'm³'], chbPiece: ['CHB 4 in.', 'piece'], tileM2: ['Floor tiles', 'm²'],
  paint4L: ['Latex paint', '4L can'],
}

export const MARKET_PRICES = {
  cement40: 292, rebarKg: 64.5, sandM3: 1650, gravelM3: 1850,
  chbPiece: 23.5, tileM2: 680, paint4L: 825,
}

export const PRODUCTIVITY = {
  structural: { foremanPerM3: 0.08, skilledPerM3: 0.65, helperPerM3: 1.20 },
  masonry: { chbM2PerDay: 8, plasterM2PerDay: 7, foremanShare: 0.05 },
  finishes: { tileM2PerDay: 8, paintM2PerDay: 25, foremanShare: 0.05 },
}

export const num = (value) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

const line = (module, category, item, quantity, unit, unitCost, laborClass = '') => ({
  module, category, item, quantity, unit, unitCost, amount: quantity * unitCost, laborClass,
})

export function calculateStructural(input, prices, wages) {
  const slab = num(input.slabLength) * num(input.slabWidth) * num(input.slabThickness)
  const columns = num(input.columnCount) * num(input.columnWidth) * num(input.columnDepth) * num(input.columnHeight)
  const footings = num(input.footingCount) * num(input.footingLength) * num(input.footingWidth) * num(input.footingThickness)
  const neat = slab + columns + footings
  const gross = neat * (1 + num(input.wastage) / 100)
  const mix = MIXES[input.mixClass] || MIXES.A
  const exactBags = gross * mix.bags40 * (40 / num(input.bagSize || 40))
  const bags = exactBags > 0 ? Math.ceil(exactBags) : 0
  const bagPrice = num(prices.cement40) * (num(input.bagSize || 40) / 40)
  const sand = gross * 0.5
  const gravel = gross
  const rebar = neat * num(input.rebarRatio)
  const foremanDays = gross * PRODUCTIVITY.structural.foremanPerM3
  const skilledDays = gross * PRODUCTIVITY.structural.skilledPerM3
  const helperDays = gross * PRODUCTIVITY.structural.helperPerM3
  const items = neat > 0 ? [
    line('Structural', 'Material', `Cement (${input.bagSize}kg)`, bags, 'bag', bagPrice),
    line('Structural', 'Material', 'Washed sand', sand, 'm³', num(prices.sandM3)),
    line('Structural', 'Material', 'Gravel 3/4', gravel, 'm³', num(prices.gravelM3)),
    line('Structural', 'Material', 'Reinforcing steel', rebar, 'kg', num(prices.rebarKg)),
    line('Structural', 'Labor', 'Structural foreman', foremanDays, 'man-day', num(wages.foreman), 'Foreman'),
    line('Structural', 'Labor', 'Carpenter / mason / steelman', skilledDays, 'man-day', num(wages.skilled), 'Skilled'),
    line('Structural', 'Labor', 'Construction helper', helperDays, 'man-day', num(wages.helper), 'Unskilled'),
  ] : []
  return { slab, columns, footings, neat, gross, exactBags, bags, sand, gravel, rebar, foremanDays, skilledDays, helperDays, items }
}

export function calculateMasonry(input, prices, wages) {
  const grossArea = num(input.wallLength) * num(input.wallHeight)
  const area = Math.max(0, grossArea - num(input.openingsArea))
  const factor = 1 + num(input.wastage) / 100
  const blocks = area > 0 ? Math.ceil(area * 12.5 * factor) : 0
  const mortarWet = area * 0.012 * factor
  const plasterArea = area * num(input.plasterSides)
  const plasterWet = plasterArea * (num(input.plasterThickness) / 1000) * factor
  const combinedDry = (mortarWet + plasterWet) * 1.33
  const cementKg = combinedDry * 0.25 * 1440
  const cementBags = cementKg > 0 ? Math.ceil(cementKg / 40) : 0
  const sand = combinedDry * 0.75
  const layingDays = area / PRODUCTIVITY.masonry.chbM2PerDay
  const plasterDays = plasterArea / PRODUCTIVITY.masonry.plasterM2PerDay
  const skilledDays = layingDays + plasterDays
  const helperDays = skilledDays
  const foremanDays = (skilledDays + helperDays) * PRODUCTIVITY.masonry.foremanShare
  const items = area > 0 ? [
    line('Masonry', 'Material', 'Concrete hollow block 4 in.', blocks, 'pc', num(prices.chbPiece)),
    line('Masonry', 'Material', 'Cement (40kg)', cementBags, 'bag', num(prices.cement40)),
    line('Masonry', 'Material', 'Washed sand', sand, 'm³', num(prices.sandM3)),
    line('Masonry', 'Labor', 'Masonry foreman', foremanDays, 'man-day', num(wages.foreman), 'Foreman'),
    line('Masonry', 'Labor', 'Skilled mason', skilledDays, 'man-day', num(wages.skilled), 'Skilled'),
    line('Masonry', 'Labor', 'Masonry helper', helperDays, 'man-day', num(wages.helper), 'Unskilled'),
  ] : []
  return { grossArea, area, blocks, mortarWet, plasterArea, plasterWet, cementBags, sand, foremanDays, skilledDays, helperDays, items }
}

export function calculateFinishes(input, prices, wages) {
  const tileNet = num(input.floorArea)
  const tileArea = tileNet * (1 + num(input.tileWastage) / 100)
  const paintArea = num(input.paintArea)
  const coats = num(input.paintCoats)
  const paintLiters = paintArea * coats / 10
  const paintCans = paintLiters > 0 ? Math.ceil(paintLiters / 4) : 0
  const skilledDays = tileNet / PRODUCTIVITY.finishes.tileM2PerDay + paintArea * coats / PRODUCTIVITY.finishes.paintM2PerDay
  const helperDays = skilledDays * 0.5
  const foremanDays = (skilledDays + helperDays) * PRODUCTIVITY.finishes.foremanShare
  const active = tileNet > 0 || paintArea > 0
  const items = active ? [
    ...(tileNet > 0 ? [line('Finishes', 'Material', 'Floor tiles', tileArea, 'm²', num(prices.tileM2))] : []),
    ...(paintArea > 0 ? [line('Finishes', 'Material', 'Latex paint (4L)', paintCans, 'can', num(prices.paint4L))] : []),
    line('Finishes', 'Labor', 'Finishes foreman', foremanDays, 'man-day', num(wages.foreman), 'Foreman'),
    line('Finishes', 'Labor', 'Tile setter / painter', skilledDays, 'man-day', num(wages.skilled), 'Skilled'),
    line('Finishes', 'Labor', 'Finishes helper', helperDays, 'man-day', num(wages.helper), 'Unskilled'),
  ] : []
  return { tileNet, tileArea, paintArea, coats, paintLiters, paintCans, foremanDays, skilledDays, helperDays, items }
}

export function calculateFormwork(input, prices, wages) {
  if (!input) return { area: 0, sheets: 0, bdft: 0, nailsKg: 0, items: [] }
  const l = num(input.length)
  const w = num(input.width)
  const h = num(input.heightDepth)
  const q = num(input.quantity)
  const waste = num(input.wastePercent || 10) / 100

  let unitArea = 0
  if (input.elementType === 'column') {
    unitArea = 2 * (w + (l > 0 ? l : w)) * h
  } else if (input.elementType === 'beam') {
    unitArea = (w + 2 * h) * (l > 0 ? l : 1)
  } else if (input.elementType === 'slab') {
    unitArea = (l * w) + (2 * (l + w) * (h > 0 ? h : 0.125))
  } else if (input.elementType === 'footing') {
    unitArea = 2 * (l + w) * (h > 0 ? h : 0.30)
  }

  const area = unitArea * q
  const sheets = area > 0 ? Math.ceil((area / 2.9768) * (1 + waste)) : 0
  const bdft = area > 0 ? Math.ceil(area * 6.5 * (1 + waste)) : 0
  const nailsKg = area > 0 ? Math.ceil(area * 0.08 * (1 + waste)) : 0

  const items = area > 0 ? [
    line('Formwork', 'Material', '18mm Phenolic Board (4\'×8\')', sheets, 'sheet', num(prices.plywood4x8 || 1250)),
    line('Formwork', 'Material', '2"×3" Framing Lumber', bdft, 'bd.ft', num(prices.lumberBdft || 42)),
    line('Formwork', 'Material', 'Common Wire Nails (Assorted)', nailsKg, 'kg', num(prices.cwnNailsKg || 80)),
    line('Formwork', 'Labor', 'Formwork Carpenter', area * 0.12, 'man-day', num(wages.skilled), 'Skilled'),
    line('Formwork', 'Labor', 'Formwork Helper', area * 0.12, 'man-day', num(wages.helper), 'Unskilled'),
  ] : []

  return { area, sheets, bdft, nailsKg, items }
}

export function calculateRebar(input, prices, wages) {
  if (!input || !Array.isArray(input.cuts)) return { totalWeightKg: 0, stockBars: 0, tieWireKg: 0, items: [] }
  const cuts = input.cuts
  const dia = num(input.diameter || 16)
  const unitWeight = (dia * dia) / 162

  let totalNetM = 0
  cuts.forEach((c) => {
    totalNetM += num(c.length) * num(c.count)
  })

  // Stock bars approximation (with 8% cutting loss)
  const totalPurchasedM = totalNetM * 1.08
  const stockBars = totalPurchasedM > 0 ? Math.ceil(totalPurchasedM / 6.0) : 0
  const totalWeightKg = totalPurchasedM * unitWeight
  const tieWireKg = totalWeightKg > 0 ? Math.ceil((totalWeightKg / 1000) * 11) : 0

  const items = totalWeightKg > 0 ? [
    line('Rebar', 'Material', `${dia}mm Ø × 6.0m Deformed Bar`, stockBars, 'pc', num(prices.rebarKg || 62) * (unitWeight * 6.0)),
    line('Rebar', 'Material', '#16 G.I. Tie Wire', tieWireKg, 'kg', num(prices.tieWireKg || 85)),
    line('Rebar', 'Labor', 'Steel-man / Rebar Fabricator', totalWeightKg * 0.003, 'man-day', num(wages.skilled), 'Skilled'),
    line('Rebar', 'Labor', 'Steel-man Helper', totalWeightKg * 0.003, 'man-day', num(wages.helper), 'Unskilled'),
  ] : []

  return { totalNetM, totalPurchasedM, stockBars, totalWeightKg, tieWireKg, items }
}

export function calculateRoofing(input, prices, wages) {
  if (!input) return { flatArea: 0, trueArea: 0, sheets: 0, tekscrews: 0, items: [] }
  const l = num(input.length)
  const w = num(input.width)
  const ovh = num(input.overhang)
  const effL = l + 2 * ovh
  const effW = w + 2 * ovh
  const flatArea = effL * effW

  // Multiplier for 1/3 pitch is ~1.054
  const multiplier = 1.054
  const trueArea = flatArea * multiplier

  const effWidth = input.material === 'rib' ? 1.00 : 0.70
  const sheets = trueArea > 0 ? Math.ceil((effL / effWidth) * (1 + 0.10)) : 0
  const tekscrews = trueArea > 0 ? Math.ceil(trueArea * 4.5 * 1.05) : 0
  const ridgeRollPcs = l > 0 ? Math.ceil(l / 2.24) : 0

  const items = trueArea > 0 ? [
    line('Roofing', 'Material', `${input.material === 'rib' ? 'Rib-Type' : 'Corrugated'} Prepainted Roofing Sheet`, sheets, 'sheet', num(prices.roofSheetLm || 820)),
    line('Roofing', 'Material', 'Prepainted Ridge Roll & Flashing', ridgeRollPcs, 'pc', num(prices.ridgeRollPc || 460)),
    line('Roofing', 'Material', '2-1/2" Tekscrews with EPDM', tekscrews, 'pc', num(prices.tekscrewPc || 3.5)),
    line('Roofing', 'Labor', 'Roofing Tinsmith / Installer', trueArea * 0.08, 'man-day', num(wages.skilled), 'Skilled'),
    line('Roofing', 'Labor', 'Roofing Helper', trueArea * 0.08, 'man-day', num(wages.helper), 'Unskilled'),
  ] : []

  return { flatArea, trueArea, sheets, tekscrews, ridgeRollPcs, items }
}

export function calculateProject(data) {
  const structural = calculateStructural(data.structural, data.prices, data.wages)
  const formwork = calculateFormwork(data.formwork, data.prices, data.wages)
  const rebar = calculateRebar(data.rebar, data.prices, data.wages)
  const roofing = calculateRoofing(data.roofing, data.prices, data.wages)
  const masonry = calculateMasonry(data.masonry, data.prices, data.wages)
  const finishes = calculateFinishes(data.finishes, data.prices, data.wages)

  const items = [
    ...structural.items,
    ...formwork.items,
    ...rebar.items,
    ...roofing.items,
    ...masonry.items,
    ...finishes.items,
  ]
  const materials = items.filter((item) => item.category === 'Material')
  const labor = items.filter((item) => item.category === 'Labor')
  const materialCost = materials.reduce((sum, item) => sum + item.amount, 0)
  const laborCost = labor.reduce((sum, item) => sum + item.amount, 0)
  const subtotal = materialCost + laborCost
  const contingency = subtotal * 0.05
  return {
    structural,
    formwork,
    rebar,
    roofing,
    masonry,
    finishes,
    items,
    materials,
    labor,
    materialCost,
    laborCost,
    subtotal,
    contingency,
    total: subtotal + contingency,
  }
}

export function fetchMarketPrices() {
  return new Promise((resolve) => window.setTimeout(() => resolve({ ...MARKET_PRICES, fetchedAt: new Date().toISOString() }), 900))
}
