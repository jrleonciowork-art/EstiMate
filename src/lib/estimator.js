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
    isColumnVariable: false, columnWidthStart: '0.40', columnDepthStart: '0.40', columnWidthEnd: '0.30', columnDepthEnd: '0.30',
    footingCount: '', footingLength: '1.20', footingWidth: '1.20', footingThickness: '0.30',
    beamCount: '', beamLength: '', beamWidth: '0.20', beamDepth: '0.35',
    isBeamVariable: false, beamWidthStart: '0.25', beamDepthStart: '0.50', beamWidthEnd: '0.20', beamDepthEnd: '0.35',
    mixClass: 'A', wastage: '5', bagSize: 40, rebarRatio: '80',
  },
  earthworks: {
    enabled: false,
    excavationDepth: '1.50',
    workingSpace: '0.20',
    gravelBedThk: '0.075',
    gravelBedSlabThk: '0.050',
    trenchLength: '20.00',
    trenchWidth: '0.40',
    trenchDepth: '0.60',
    soilPoisoning: true,
    backfillCompaction: true,
  },
  masonry: {
    chbSize: '4', // '4' or '6'
    wallLength: '', wallHeight: '3.00', openingsArea: '0', wastage: '5',
    plasterSides: 2, plasterThickness: '12',
  },
  finishes: {
    floorArea: '', tileWastage: '10', paintArea: '', paintCoats: '2',
    ceilingArea: '', ceilingBoard: 'ficem_4.5', // 'ficem_4.5' or 'gypsum_9'
  },
  formwork: {
    elementType: 'column', length: '0.40', width: '0.40', heightDepth: '3.00', quantity: '4',
    isVariable: false, widthStart: '0.40', depthStart: '0.40', widthEnd: '0.30', depthEnd: '0.30',
    plywoodChoice: 'phenolic_18', lumberChoice: '2x2', wastePercent: '10', studSpacing: '0.30',
    reuseCycles: '4',
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
    includePrelims: false,
    ppeCost: '15000',
    tempFacilities: '25000',
    safetyOfficerDays: '12',
    variationOrders: [],
  },
  prices: {
    cement40: '295', rebarKg: '66', sandM3: '1650', gravelM3: '1850',
    chbPiece: '22', chb6Piece: '28', tileM2: '650', paint4L: '780',
    plywood4x8: '1250', lumberBdft: '42', cwnNailsKg: '80', tieWireKg: '85',
    roofSheetLm: '820', ridgeRollPc: '460', tekscrewPc: '3.5',
    gravelBedM3: '1750', soilPoisonL: '850',
    ficemBoard4x8: '420', gypsumBoard4x8: '380',
    metalFurringLm: '48', carryingChannelLm: '65', wallAngleLm: '35',
    safetyOfficerDay: '1200',
  },
  wages: {
    region: 'NCR', foreman: '1200', skilled: '950', helper: '755',
    source: 'NCR-27 · effective 25 Jul 2026',
  },
  marketUpdated: null,
}

export const PRICE_LABELS = {
  cement40: ['Cement', '40kg bag'], rebarKg: ['Rebar', 'kg'], sandM3: ['Washed sand', 'm³'],
  gravelM3: ['Gravel 3/4', 'm³'], chbPiece: ['CHB 4 in.', 'piece'], chb6Piece: ['CHB 6 in.', 'piece'], tileM2: ['Floor tiles', 'm²'],
  paint4L: ['Latex paint', '4L can'],
  gravelBedM3: ['G-1 Pea Gravel Bed', 'm³'], soilPoisonL: ['Anti-Termite Soil Poison', 'liter'],
  ficemBoard4x8: ['Fiber Cement Board 4.5mm', '4x8 sheet'], gypsumBoard4x8: ['Gypsum Board 9mm', '4x8 sheet'],
  metalFurringLm: ['Metal Furring (Double)', 'linear meter'], carryingChannelLm: ['Main Carrying Channel', 'linear meter'],
  wallAngleLm: ['Perimeter Wall Angle', 'linear meter'],
}

export const MARKET_PRICES = {
  cement40: 295, rebarKg: 66, sandM3: 1650, gravelM3: 1850,
  chbPiece: 22, chb6Piece: 28, tileM2: 650, paint4L: 780,
  gravelBedM3: 1750, soilPoisonL: 850,
  ficemBoard4x8: 420, gypsumBoard4x8: 380,
  metalFurringLm: 48, carryingChannelLm: 65, wallAngleLm: 35,
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

export function calculateStructural(input = {}, prices = {}, wages = {}) {
  const slab = num(input?.slabLength) * num(input?.slabWidth) * num(input?.slabThickness)

  // Columns: Prismatic (constant) or Non-Prismatic (tapered / stepped)
  let columns = 0
  if (input?.isColumnVariable) {
    const w1 = num(input?.columnWidthStart || input?.columnWidth)
    const d1 = num(input?.columnDepthStart || input?.columnDepth)
    const w2 = num(input?.columnWidthEnd || w1)
    const d2 = num(input?.columnDepthEnd || d1)
    const h = num(input?.columnHeight)
    const a1 = w1 * d1
    const a2 = w2 * d2
    const prismoidal = (h / 3) * (a1 + a2 + Math.sqrt(a1 * a2))
    columns = num(input?.columnCount) * prismoidal
  } else {
    columns = num(input?.columnCount) * num(input?.columnWidth) * num(input?.columnDepth) * num(input?.columnHeight)
  }

  const footings = num(input?.footingCount) * num(input?.footingLength) * num(input?.footingWidth) * num(input?.footingThickness)

  // Beams & Girders: Prismatic (constant) or Non-Prismatic (haunched / tapered)
  let beams = 0
  if (input?.isBeamVariable) {
    const w1 = num(input?.beamWidthStart || input?.beamWidth)
    const d1 = num(input?.beamDepthStart || input?.beamDepth)
    const w2 = num(input?.beamWidthEnd || w1)
    const d2 = num(input?.beamDepthEnd || d1)
    const l = num(input?.beamLength)
    const a1 = w1 * d1
    const a2 = w2 * d2
    const prismoidal = (l / 3) * (a1 + a2 + Math.sqrt(a1 * a2))
    beams = num(input?.beamCount) * prismoidal
  } else {
    beams = num(input?.beamCount) * num(input?.beamLength) * num(input?.beamWidth) * num(input?.beamDepth)
  }

  const neat = slab + columns + footings + beams
  const gross = neat * (1 + num(input?.wastage) / 100)
  const mix = (input?.mixClass && MIXES[input.mixClass]) || MIXES.A
  const exactBags = gross * mix.bags40 * (40 / num(input?.bagSize || 40))
  const bags = exactBags > 0 ? Math.ceil(exactBags) : 0
  const bagPrice = num(prices?.cement40 || 295) * (num(input?.bagSize || 40) / 40)
  const sand = gross * 0.5
  const gravel = gross
  const rebar = neat * num(input?.rebarRatio || 80)
  const foremanDays = gross * PRODUCTIVITY.structural.foremanPerM3
  const skilledDays = gross * PRODUCTIVITY.structural.skilledPerM3
  const helperDays = gross * PRODUCTIVITY.structural.helperPerM3
  const items = neat > 0 ? [
    line('Structural', 'Material', `Cement (${input?.bagSize || 40}kg)`, bags, 'bag', bagPrice),
    line('Structural', 'Material', 'Washed sand', sand, 'm³', num(prices?.sandM3 || 1650)),
    line('Structural', 'Material', 'Gravel 3/4', gravel, 'm³', num(prices?.gravelM3 || 1850)),
    line('Structural', 'Material', 'Reinforcing steel', rebar, 'kg', num(prices?.rebarKg || 66)),
    line('Structural', 'Labor', 'Structural foreman', foremanDays, 'man-day', num(wages?.foreman || 1200), 'Foreman'),
    line('Structural', 'Labor', 'Carpenter / mason / steelman', skilledDays, 'man-day', num(wages?.skilled || 950), 'Skilled'),
    line('Structural', 'Labor', 'Construction helper', helperDays, 'man-day', num(wages?.helper || 755), 'Unskilled'),
  ] : []
  return { slab, columns, footings, beams, neat, gross, exactBags, bags, sand, gravel, rebar, foremanDays, skilledDays, helperDays, items }
}

export function calculateEarthworks(earthInput, structInput, prices, wages) {
  if (!earthInput?.enabled || !structInput) {
    return { enabled: false, excavationM3: 0, gravelBedM3: 0, backfillM3: 0, soilPoisoningM2: 0, soilPoisonLiters: 0, helperDays: 0, foremanDays: 0, items: [] }
  }

  const depth = num(earthInput.excavationDepth || 1.50)
  const ws = num(earthInput.workingSpace || 0.20)
  const ftgCount = num(structInput.footingCount)
  const ftgL = num(structInput.footingLength || 1.20)
  const ftgW = num(structInput.footingWidth || 1.20)
  const ftgThk = num(structInput.footingThickness || 0.30)

  // Footing pit excavation
  const pitL = ftgL + 2 * ws
  const pitW = ftgW + 2 * ws
  const footingPitsM3 = ftgCount * pitL * pitW * depth

  // Trench excavation for tie/grade beams & wall footings
  const beamCount = num(structInput.beamCount)
  const beamL = num(structInput.beamLength)
  const beamW = num(structInput.beamWidth || 0.20)
  const beamD = num(structInput.beamDepth || 0.35)
  const trenchL = num(earthInput.trenchLength)
  const trenchW = num(earthInput.trenchWidth || 0.40)
  const trenchD = num(earthInput.trenchDepth || 0.60)
  const trenchM3 = trenchL > 0 ? trenchL * trenchW * trenchD : 0
  const beamTrenchM3 = (beamCount * beamL * (beamW + 2 * ws) * beamD) + trenchM3

  const excavationM3 = footingPitsM3 + beamTrenchM3

  // Gravel Bedding (G-1 pea gravel): under footings + under ground slab
  const ftgGravelThk = num(earthInput.gravelBedThk || 0.075)
  const ftgGravelM3 = ftgCount * ftgL * ftgW * ftgGravelThk

  const slabL = num(structInput.slabLength)
  const slabW = num(structInput.slabWidth)
  const slabGravelThk = num(earthInput.gravelBedSlabThk || 0.050)
  const slabGravelM3 = slabL * slabW * slabGravelThk
  const gravelBedM3 = (ftgGravelM3 + slabGravelM3) * 1.10 // 10% compaction factor

  // Soil Poisoning anti-termite treatment
  const slabArea = slabL * slabW
  const ftgPitArea = ftgCount * pitL * pitW
  const isSoilPoisoning = earthInput.soilPoisoning !== false
  const soilPoisoningM2 = isSoilPoisoning ? slabArea + ftgPitArea : 0
  const soilPoisonLiters = soilPoisoningM2 > 0 ? Math.ceil(soilPoisoningM2 / 3.0) : 0

  // Backfill & Compaction
  const buriedConcrete = (ftgCount * ftgL * ftgW * ftgThk) + (beamCount * beamL * beamW * beamD)
  const netBackfillM3 = Math.max(0, (excavationM3 - buriedConcrete - ftgGravelM3) * 1.15)

  // Labor
  const excavationHelperDays = excavationM3 / 1.5
  const backfillHelperDays = netBackfillM3 / 3.0
  const helperDays = excavationHelperDays + backfillHelperDays
  const foremanDays = helperDays * 0.05

  const items = (excavationM3 > 0 || gravelBedM3 > 0) ? [
    line('Earthworks', 'Labor', 'Common Excavation (Pit & Trench Digging)', excavationM3, 'm³', (num(wages.helper) / 1.5), 'Unskilled'),
    ...(gravelBedM3 > 0 ? [line('Earthworks', 'Material', 'G-1 Pea Gravel Bedding (Compacted Sub-base)', gravelBedM3, 'm³', num(prices.gravelBedM3 || 1750))] : []),
    ...(soilPoisonLiters > 0 ? [line('Earthworks', 'Material', 'Soil Poisoning Chemical Barrier (Anti-Termite Emulsion)', soilPoisonLiters, 'liter', num(prices.soilPoisonL || 850))] : []),
    ...(netBackfillM3 > 0 ? [line('Earthworks', 'Labor', 'Structural Backfill & Mechanical Tamping', netBackfillM3, 'm³', (num(wages.helper) / 3.0), 'Unskilled')] : []),
    line('Earthworks', 'Labor', 'Earthworks Foreman / Grade Checker', foremanDays, 'man-day', num(wages.foreman), 'Foreman'),
  ] : []

  return {
    enabled: true,
    excavationM3,
    gravelBedM3,
    backfillM3: netBackfillM3,
    soilPoisoningM2,
    soilPoisonLiters,
    soilPoisonL: soilPoisonLiters,
    helperDays,
    foremanDays,
    items,
  }
}

export function calculateMasonry(input = {}, prices = {}, wages = {}) {
  const is6Inch = String(input?.chbSize || '4') === '6'
  const grossArea = num(input?.wallLength) * num(input?.wallHeight)
  const area = Math.max(0, grossArea - num(input?.openingsArea))
  const factor = 1 + num(input?.wastage || 5) / 100
  const blocks = area > 0 ? Math.ceil(area * 12.5 * factor) : 0

  // Mortar for laying bed joints & cell core filling
  // 4" CHB laying: 0.012 m³/m², core grout: 0.035 m³/m²
  // 6" CHB laying: 0.019 m³/m², core grout: 0.065 m³/m²
  const layingMortarWet = area * (is6Inch ? 0.019 : 0.012) * factor
  const coreGroutWet = area * (is6Inch ? 0.065 : 0.035) * factor
  const mortarWet = layingMortarWet + coreGroutWet

  const plasterArea = area * num(input?.plasterSides ?? 2)
  const plasterWet = plasterArea * (num(input?.plasterThickness || 12) / 1000) * factor
  const combinedDry = (mortarWet + plasterWet) * 1.33
  const cementKg = combinedDry * 0.25 * 1440
  const cementBags = cementKg > 0 ? Math.ceil(cementKg / 40) : 0
  const sand = combinedDry * 0.75

  // Philippine NSCP / DPWH standard 10mm Ø rebar for CHB (verticals @ 0.60m, horizontals every 3 layers)
  // ~0.56 pcs of 6.0m bars per m² of wall area
  const rebarBars = area > 0 ? Math.ceil(area * 0.56 * factor) : 0
  const rebarKg = rebarBars * 6.0 * 0.617 // 10mm Ø = 0.617 kg/m
  const tieWireKg = area > 0 ? Math.ceil(area * 0.05 * factor) : 0

  const layingDays = area / (is6Inch ? 7 : PRODUCTIVITY.masonry.chbM2PerDay)
  const plasterDays = plasterArea / PRODUCTIVITY.masonry.plasterM2PerDay
  const rebarDays = rebarKg * 0.003
  const skilledDays = layingDays + plasterDays + rebarDays
  const helperDays = skilledDays
  const foremanDays = (skilledDays + helperDays) * PRODUCTIVITY.masonry.foremanShare

  const blockPrice = is6Inch ? num(prices?.chb6Piece || 28) : num(prices?.chbPiece || 22)
  const blockLabel = is6Inch ? 'Concrete hollow block 6 in. (Exterior/Firewall)' : 'Concrete hollow block 4 in. (Interior)'

  const items = area > 0 ? [
    line('Masonry', 'Material', blockLabel, blocks, 'pc', blockPrice),
    line('Masonry', 'Material', '10mm Ø × 6.0m Deformed Rebar (CHB Dowels & Horizontal)', rebarBars, 'pc', num(prices?.rebarKg || 62) * (6.0 * 0.617)),
    line('Masonry', 'Material', '#16 G.I. Tie Wire (Masonry)', tieWireKg, 'kg', num(prices?.tieWireKg || 85)),
    line('Masonry', 'Material', 'Cement (40kg - Mortar, Plaster & Grout)', cementBags, 'bag', num(prices?.cement40 || 295)),
    line('Masonry', 'Material', 'Washed sand', sand, 'm³', num(prices?.sandM3 || 1650)),
    line('Masonry', 'Labor', 'Masonry foreman', foremanDays, 'man-day', num(wages?.foreman || 1200), 'Foreman'),
    line('Masonry', 'Labor', 'Skilled mason / steelman', skilledDays, 'man-day', num(wages?.skilled || 950), 'Skilled'),
    line('Masonry', 'Labor', 'Masonry helper', helperDays, 'man-day', num(wages?.helper || 755), 'Unskilled'),
  ] : []
  return { grossArea, area, is6Inch, blocks, mortarWet, coreGroutWet, plasterArea, plasterWet, cementBags, sand, rebarBars, rebarKg, tieWireKg, foremanDays, skilledDays, helperDays, items }
}

export function calculateFinishes(input = {}, prices = {}, wages = {}) {
  const tileNet = num(input?.floorArea)
  const tileArea = tileNet * (1 + num(input?.tileWastage || 10) / 100)
  const paintArea = num(input?.paintArea)
  const coats = num(input?.paintCoats || 2)
  const paintLiters = paintArea * coats / 10
  const paintCans = paintLiters > 0 ? Math.ceil(paintLiters / 4) : 0

  // Ceiling System (Fiber Cement / Gypsum on Metal Furring)
  const ceilingArea = num(input?.ceilingArea)
  const isGypsum = input?.ceilingBoard === 'gypsum_9'
  const boardPcs = ceilingArea > 0 ? Math.ceil((ceilingArea / 2.9768) * 1.08) : 0
  const boardPrice = isGypsum ? num(prices?.gypsumBoard4x8 || 380) : num(prices?.ficemBoard4x8 || 420)
  const boardLabel = isGypsum ? '9mm × 4\' × 8\' Gypsum Board (Moisture Resistant)' : '4.5mm × 4\' × 8\' Fiber Cement Board (HardieFlex)'
  const metalFurringLm = ceilingArea * 2.7 // 0.40m spacing
  const carryingChannelLm = ceilingArea * 0.9 // 1.20m spacing
  const wallAngleLm = Math.sqrt(ceilingArea || 0) * 4 * 1.10

  const tileSkilledDays = tileNet / PRODUCTIVITY.finishes.tileM2PerDay
  const paintSkilledDays = paintArea * coats / PRODUCTIVITY.finishes.paintM2PerDay
  const ceilingSkilledDays = ceilingArea / 10 // 10 m² / carpenter-day
  const skilledDays = tileSkilledDays + paintSkilledDays + ceilingSkilledDays
  const helperDays = (tileSkilledDays + paintSkilledDays) * 0.5 + ceilingSkilledDays * 0.5
  const foremanDays = (skilledDays + helperDays) * PRODUCTIVITY.finishes.foremanShare

  const active = tileNet > 0 || paintArea > 0 || ceilingArea > 0
  const items = active ? [
    ...(tileNet > 0 ? [line('Finishes', 'Material', 'Floor tiles', tileArea, 'm²', num(prices?.tileM2 || 650))] : []),
    ...(paintArea > 0 ? [line('Finishes', 'Material', 'Latex paint (4L)', paintCans, 'can', num(prices?.paint4L || 780))] : []),
    ...(ceilingArea > 0 ? [
      line('Finishes', 'Material', boardLabel, boardPcs, 'sheet', boardPrice),
      line('Finishes', 'Material', 'Metal Furring Channel (Double)', metalFurringLm, 'lm', num(prices?.metalFurringLm || 48)),
      line('Finishes', 'Material', 'Main Carrying Channel', carryingChannelLm, 'lm', num(prices?.carryingChannelLm || 65)),
      line('Finishes', 'Material', 'Perimeter Wall Angle', wallAngleLm, 'lm', num(prices?.wallAngleLm || 35)),
    ] : []),
    line('Finishes', 'Labor', 'Finishes foreman', foremanDays, 'man-day', num(wages?.foreman || 1200), 'Foreman'),
    line('Finishes', 'Labor', 'Tile setter / painter / ceiling carpenter', skilledDays, 'man-day', num(wages?.skilled || 950), 'Skilled'),
    line('Finishes', 'Labor', 'Finishes helper', helperDays, 'man-day', num(wages?.helper || 755), 'Unskilled'),
  ] : []
  return {
    tileNet, tileArea, paintArea, coats, paintLiters, paintCans,
    ceilingArea, isGypsum, boardPcs, metalFurringLm, carryingChannelLm, wallAngleLm,
    foremanDays, skilledDays, helperDays, items,
  }
}

export function calculateFormwork(input, prices, wages) {
  if (!input) return { area: 0, sheets: 0, contactSheets: 0, reuseCycles: 4, bdft: 0, nailsKg: 0, items: [] }
  const l = num(input.length)
  const w = num(input.width)
  const h = num(input.heightDepth)
  const q = num(input.quantity)
  const waste = num(input.wastePercent || 10) / 100
  const reuseCycles = Math.max(1, num(input.reuseCycles) || (String(input.plywoodChoice || '').includes('phenolic') ? 4 : 2))

  let unitArea = 0
  if (input.elementType === 'column') {
    if (input.isVariable) {
      const w1 = num(input.widthStart || w)
      const d1 = num(input.depthStart || (l > 0 ? l : w))
      const w2 = num(input.widthEnd || w1)
      const d2 = num(input.depthEnd || d1)
      unitArea = (w1 + w2 + d1 + d2) * h
    } else {
      unitArea = 2 * (w + (l > 0 ? l : w)) * h
    }
  } else if (input.elementType === 'beam') {
    if (input.isVariable) {
      const w1 = num(input.widthStart || w)
      const d1 = num(input.depthStart || h)
      const w2 = num(input.widthEnd || w1)
      const d2 = num(input.depthEnd || d1)
      const beamL = l > 0 ? l : 1
      unitArea = (((w1 + w2) / 2) + (d1 + d2)) * beamL
    } else {
      unitArea = (w + 2 * h) * (l > 0 ? l : 1)
    }
  } else if (input.elementType === 'slab') {
    unitArea = (l * w) + (2 * (l + w) * (h > 0 ? h : 0.125))
  } else if (input.elementType === 'footing') {
    unitArea = 2 * (l + w) * (h > 0 ? h : 0.30)
  }

  const area = unitArea * q
  const contactSheets = area > 0 ? (area / 2.9768) : 0
  const sheets = area > 0 ? Math.max(1, Math.ceil((contactSheets / reuseCycles) * (1 + waste))) : 0
  const bdft = area > 0 ? Math.ceil(area * 6.5 * (1 + waste)) : 0
  const nailsKg = area > 0 ? Math.ceil(area * 0.08 * (1 + waste)) : 0

  const items = area > 0 ? [
    line('Formwork', 'Material', `18mm Phenolic Board (4'×8', ${reuseCycles}x reuse)`, sheets, 'sheet', num(prices.plywood4x8 || 1250)),
    line('Formwork', 'Material', '2"×3" Framing Lumber', bdft, 'bd.ft', num(prices.lumberBdft || 42)),
    line('Formwork', 'Material', 'Common Wire Nails (Assorted)', nailsKg, 'kg', num(prices.cwnNailsKg || 80)),
    line('Formwork', 'Labor', 'Formwork Carpenter', area * 0.12, 'man-day', num(wages.skilled), 'Skilled'),
    line('Formwork', 'Labor', 'Formwork Helper', area * 0.12, 'man-day', num(wages.helper), 'Unskilled'),
  ] : []

  return { area, sheets, contactSheets, reuseCycles, bdft, nailsKg, items }
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
  if (!input) return { flatArea: 0, trueArea: 0, multiplier: 1.0, sheetLength: 2.44, totalLinearMeters: 0, sheets: 0, tekscrews: 0, ridgeRollPcs: 0, items: [] }
  const l = num(input.length)
  const w = num(input.width)
  const ovh = num(input.overhang)
  const effL = l + 2 * ovh
  const effW = w + 2 * ovh
  const flatArea = effL * effW

  // Dynamic pitch slope multiplier
  const PITCH_MULTIPLIERS = {
    flat: 1.0,
    '1/4': 1.0308,
    '1/3': 1.0541,
    '1/2': 1.1180,
  }
  let multiplier = PITCH_MULTIPLIERS[input.pitch]
  if (input.pitch === 'custom' && num(input.customAngle) > 0) {
    const rad = (num(input.customAngle) * Math.PI) / 180
    multiplier = Math.cos(rad) > 0 ? 1 / Math.cos(rad) : 1.0
  } else if (!multiplier) {
    multiplier = 1.0541
  }

  const trueArea = flatArea * multiplier

  // Effective commercial sheet coverage width (trapezoidal rib = 1.00m, corrugated = 0.70m)
  const isRib = String(input.material || '').toLowerCase().includes('rib')
  const effWidth = isRib ? 1.00 : 0.70

  // Commercial sheet length in meters
  let sheetLength = 2.44 // standard 8ft
  const choice = String(input.sheetLengthChoice || '').toLowerCase()
  if (choice.includes('custom') || choice === 'longspan') {
    sheetLength = Math.max(0.5, num(input.customSheetLength) || 6.00)
  } else if (choice === '12ft' || choice === '3.66') {
    sheetLength = 3.66
  } else if (choice === '10ft' || choice === '3.05') {
    sheetLength = 3.05
  } else if (choice === '8ft' || choice === '2.44') {
    sheetLength = 2.44
  } else if (num(choice) > 0) {
    sheetLength = num(choice)
  }

  const wasteFactor = 1.10 // 10% overlap and end lap cutting loss
  const totalLinearMeters = effWidth > 0 ? Math.ceil((trueArea / effWidth) * wasteFactor * 100) / 100 : 0
  const sheets = sheetLength > 0 ? Math.ceil(totalLinearMeters / sheetLength) : 0
  const tekscrews = trueArea > 0 ? Math.ceil(trueArea * 4.5 * 1.05) : 0
  const ridgeRollPcs = l > 0 ? Math.ceil((effL * 1.10) / 2.20) : 0

  const sheetUnitCost = sheetLength * num(prices.roofSheetLm || 820)
  const items = trueArea > 0 ? [
    line('Roofing', 'Material', `${isRib ? 'Rib-Type' : 'Corrugated'} Prepainted Roofing Sheet (${sheetLength.toFixed(2)}m sheets)`, sheets, 'sheet', sheetUnitCost),
    line('Roofing', 'Material', 'Prepainted Ridge Roll & Flashing (2.44m / 8ft)', ridgeRollPcs, 'pc', num(prices.ridgeRollPc || 460)),
    line('Roofing', 'Material', '2-1/2" Tekscrews with EPDM Washer', tekscrews, 'pc', num(prices.tekscrewPc || 3.5)),
    line('Roofing', 'Labor', 'Roofing Tinsmith / Installer', trueArea * 0.08, 'man-day', num(wages.skilled), 'Skilled'),
    line('Roofing', 'Labor', 'Roofing Helper', trueArea * 0.08, 'man-day', num(wages.helper), 'Unskilled'),
  ] : []

  return { flatArea, trueArea, multiplier, sheetLength, totalLinearMeters, sheets, tekscrews, ridgeRollPcs, items }
}

export function sanitizeProjectData(raw) {
  const defaults = DEFAULT_DATA
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(defaults))
  }
  return {
    ...defaults,
    ...raw,
    earthworks: { ...defaults.earthworks, ...(raw.earthworks || {}) },
    structural: { ...defaults.structural, ...(raw.structural || {}) },
    formwork: { ...defaults.formwork, ...(raw.formwork || {}) },
    rebar: { ...defaults.rebar, ...(raw.rebar || {}) },
    roofing: { ...defaults.roofing, ...(raw.roofing || {}) },
    masonry: { ...defaults.masonry, ...(raw.masonry || {}) },
    finishes: { ...defaults.finishes, ...(raw.finishes || {}) },
    boq: {
      ...defaults.boq,
      ...(raw.boq || {}),
      variationOrders: Array.isArray(raw.boq?.variationOrders)
        ? raw.boq.variationOrders
        : (defaults.boq?.variationOrders || []),
    },
    prices: { ...defaults.prices, ...(raw.prices || {}) },
    wages: { ...defaults.wages, ...(raw.wages || {}) },
  }
}

export function calculateProject(rawData) {
  const data = sanitizeProjectData(rawData)
  const earthworks = calculateEarthworks(data.earthworks, data.structural, data.prices, data.wages)
  const structural = calculateStructural(data.structural, data.prices, data.wages)
  const formwork = calculateFormwork(data.formwork, data.prices, data.wages)
  const rebar = calculateRebar(data.rebar, data.prices, data.wages)
  const roofing = calculateRoofing(data.roofing, data.prices, data.wages)
  const masonry = calculateMasonry(data.masonry, data.prices, data.wages)
  const finishes = calculateFinishes(data.finishes, data.prices, data.wages)

  // Preliminaries (DOLE CSHP & Site Facilities)
  const prelimItems = []
  const includePrelims = Boolean(data.boq?.includePrelims)
  if (includePrelims) {
    const ppeCost = num(data.boq?.ppeCost || 15000)
    const tempFacilities = num(data.boq?.tempFacilities || 25000)
    const safetyDays = num(data.boq?.safetyOfficerDays || 30)
    const safetyRate = num(data.prices?.safetyOfficerDay || 1200)

    prelimItems.push(line('Preliminaries', 'Material', 'DOLE Construction Safety PPE Allowance (Hard hats, vests, boots)', 1, 'lot', ppeCost))
    prelimItems.push(line('Preliminaries', 'Material', 'Temporary Barracks, Perimeter Enclosure & Power/Water Hookup', 1, 'lot', tempFacilities))
    prelimItems.push(line('Preliminaries', 'Labor', 'DOLE Accredited Safety Officer (CSHO Part-Time)', safetyDays, 'man-day', safetyRate, 'Specialist'))
  }

  const items = [
    ...earthworks.items,
    ...prelimItems,
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
  const directCost = materialCost + laborCost
  const contingency = directCost * 0.05

  // Philippine Contractor Commercial Markups (OCM, Profit, VAT)
  const ocmRate = num(data.boq?.ocmRate ?? 8)
  const profitRate = num(data.boq?.profitRate ?? 10)
  const taxRate = num(data.boq?.taxRate ?? 5)

  const ocmCost = directCost * (ocmRate / 100)
  const profitCost = directCost * (profitRate / 100)
  const taxCost = (directCost + ocmCost + profitCost) * (taxRate / 100)
  const totalBid = directCost + ocmCost + profitCost + taxCost

  // Milestones & Retention
  const advancePayment = totalBid * 0.15 // 15% Standard Mobilization
  const retentionMoney = totalBid * 0.10 // 10% Defects Liability Retention

  // Variation Orders (VO / Change Orders)
  const variationOrders = Array.isArray(data.boq?.variationOrders) ? data.boq.variationOrders : []
  const approvedVOAmount = variationOrders
    .filter((vo) => vo.status === 'Approved')
    .reduce((sum, vo) => {
      const amt = num(vo.amount)
      return sum + (vo.type === 'Deductive' ? -amt : amt)
    }, 0)
  const originalContract = totalBid
  const revisedContract = totalBid + approvedVOAmount

  return {
    earthworks,
    prelimItems,
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
    subtotal: directCost,
    directCost,
    contingency,
    ocmRate,
    ocmCost,
    profitRate,
    profitCost,
    taxRate,
    taxCost,
    totalBid,
    total: totalBid > 0 ? totalBid : directCost + contingency,
    advancePayment,
    retentionMoney,
    originalContract,
    approvedVOAmount,
    revisedContract,
    variationOrders,
  }
}

export function fetchMarketPrices() {
  return new Promise((resolve) => window.setTimeout(() => resolve({ ...MARKET_PRICES, fetchedAt: new Date().toISOString() }), 900))
}
