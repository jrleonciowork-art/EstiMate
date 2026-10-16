/**
 * 2026 Philippine Construction Material Pricing Benchmarks & Verification
 * Reflects verified market rates across NCR, Region III (Central Luzon), and Region IV-A (CALABARZON).
 * Sources: DTI Consumer Guide, DPWH Construction Cost Indices, Philippine Constructors Association (PCA).
 */

export const MARKET_BENCHMARKS_2026 = {
  cement40: {
    key: 'cement40',
    name: 'Portland Cement (Type 1)',
    specification: '40kg bag (Republic / Holcim / Eagle)',
    category: 'Cement & Aggregates',
    unit: 'bag',
    benchmark: 295,
    min: 280,
    max: 320,
    description: 'General purpose hydraulic cement for structural concrete.',
  },
  rebarKg: {
    key: 'rebarKg',
    name: 'Deformed Steel Rebar (Grade 40/60)',
    specification: 'Standard deformed billet bar per kg',
    category: 'Steel & Metals',
    unit: 'kg',
    benchmark: 66,
    min: 58,
    max: 76,
    description: '₱620–₱720 per 6.0m length for 16mm Ø (approx. 9.47 kg/pc = ~₱66/kg).',
  },
  sandM3: {
    key: 'sandM3',
    name: 'Washed River Sand (Fine Aggregate)',
    specification: 'Screened concreting sand',
    category: 'Cement & Aggregates',
    unit: 'm³',
    benchmark: 1650,
    min: 1400,
    max: 1950,
    description: 'Clean washed river sand free from organic matter and silt.',
  },
  gravelM3: {
    key: 'gravelM3',
    name: 'Crushed Gravel (3/4" Coarse Aggregate)',
    specification: 'G-1 / 3/4" crushed angular stone',
    category: 'Cement & Aggregates',
    unit: 'm³',
    benchmark: 1850,
    min: 1550,
    max: 2200,
    description: 'Standard crushed basalt or andesite aggregate for structural mix.',
  },
  marinePlywood12: {
    key: 'marinePlywood12',
    name: 'Marine Plywood 1/2" (12mm)',
    specification: '4ft × 8ft (1.22m × 2.44m) Class A',
    category: 'Wood & Formwork',
    unit: 'sheet',
    benchmark: 790,
    min: 740,
    max: 850,
    description: 'Waterproof exterior resin bonded plywood for slab/beam forms.',
  },
  plywood4x8: {
    key: 'plywood4x8',
    name: 'Phenolic Board 3/4" (18mm Film-Faced)',
    specification: '4ft × 8ft (1.22m × 2.44m) High-Reuse',
    category: 'Wood & Formwork',
    unit: 'sheet',
    benchmark: 1250,
    min: 1150,
    max: 1380,
    description: 'Smooth film-faced phenolic board, 4–6 reuses for fair-faced concrete.',
  },
  lumberBdft: {
    key: 'lumberBdft',
    name: 'Rough Framing Lumber (Good Lumber)',
    specification: '2"×2", 2"×3", 2"×4" Tanguile/Red Lauan equivalent',
    category: 'Wood & Formwork',
    unit: 'bd.ft',
    benchmark: 42,
    min: 36,
    max: 48,
    description: 'Seasoned framing studs, wales, vertical ribs, and diagonal shores.',
  },
  chbPiece: {
    key: 'chbPiece',
    name: 'Concrete Hollow Block (CHB) 4"',
    specification: '100mm × 200mm × 400mm Non-Load Bearing',
    category: 'Masonry',
    unit: 'pc',
    benchmark: 22,
    min: 18,
    max: 26,
    description: 'Interior non-load bearing concrete partition block.',
  },
  chb6Piece: {
    key: 'chb6Piece',
    name: 'Concrete Hollow Block (CHB) 6"',
    specification: '150mm × 200mm × 400mm Load-Bearing',
    category: 'Masonry',
    unit: 'pc',
    benchmark: 28,
    min: 24,
    max: 34,
    description: 'Exterior structural wall block reinforced with vertical rebars.',
  },
  tileM2: {
    key: 'tileM2',
    name: 'Glazed / Unglazed Ceramic Floor Tiles',
    specification: '60cm × 60cm Polished / Matte',
    category: 'Finishes',
    unit: 'm²',
    benchmark: 650,
    min: 480,
    max: 850,
    description: 'Vitrified porcelain or glazed ceramic floor finishes.',
  },
  paint4L: {
    key: 'paint4L',
    name: '100% Acrylic Latex Paint',
    specification: '4-Liter Gallon (Boysen / Davies)',
    category: 'Finishes',
    unit: 'can',
    benchmark: 780,
    min: 680,
    max: 890,
    description: 'Exterior and interior water-based premium concrete wall finish.',
  },
  cwnNailsKg: {
    key: 'cwnNailsKg',
    name: 'Common Wire Nails (Assorted 2"–3")',
    specification: 'CWN per kg',
    category: 'Hardware & Fasteners',
    unit: 'kg',
    benchmark: 80,
    min: 70,
    max: 95,
    description: 'Standard steel wire nails for falsework carpentry.',
  },
  tieWireKg: {
    key: 'tieWireKg',
    name: '#16 Black Annealed G.I. Tie Wire',
    specification: '#16 G.I. Tie Wire per kg',
    category: 'Hardware & Fasteners',
    unit: 'kg',
    benchmark: 85,
    min: 75,
    max: 100,
    description: 'Soft-annealed tie wire for rebar joints and stirrups.',
  },
  roofSheetLm: {
    key: 'roofSheetLm',
    name: 'Prepainted Steel Roofing Sheet (0.40–0.50mm)',
    specification: 'Corrugated / Rib-type per linear meter (Coloroof)',
    category: 'Roofing',
    unit: 'lm',
    benchmark: 820,
    min: 740,
    max: 920,
    description: 'Long-span oven-baked prepainted galvanized roof sheeting.',
  },
  ridgeRollPc: {
    key: 'ridgeRollPc',
    name: 'Prepainted Ridge Roll & Flashing',
    specification: 'Standard 2.44m (8ft) × 0.40mm',
    category: 'Roofing',
    unit: 'pc',
    benchmark: 460,
    min: 400,
    max: 520,
    description: 'Pre-formed flashing, valley rolls, and end eaves covers.',
  },
  tekscrewPc: {
    key: 'tekscrewPc',
    name: 'Self-Drilling Tekscrews with EPDM',
    specification: '2-1/2" Hex Washer Head with rubber gasket',
    category: 'Hardware & Fasteners',
    unit: 'pc',
    benchmark: 3.5,
    min: 2.8,
    max: 4.5,
    description: 'Zinc-coated corrosion resistant fasteners for steel purlins.',
  },
}

/**
 * Returns baseline prices object formatted for the estimator engine.
 */
export function getBaselinePrices() {
  const prices = {}
  Object.values(MARKET_BENCHMARKS_2026).forEach((item) => {
    prices[item.key] = String(item.benchmark)
  })
  return prices
}

/**
 * Validates a user entered unit price against 2026 market ranges.
 * @param {string} key - material key
 * @param {number|string} price - user input price
 * @returns {{ status: 'normal'|'below'|'above', message: string, min: number, max: number, benchmark: number }}
 */
export function validatePrice(key, price) {
  const benchmark = MARKET_BENCHMARKS_2026[key]
  const val = Number.parseFloat(price) || 0

  if (!benchmark) {
    return { status: 'normal', message: 'Custom item', min: 0, max: 0, benchmark: val }
  }

  if (val < benchmark.min) {
    return {
      status: 'below',
      message: `Below 2026 market baseline (₱${benchmark.min.toLocaleString()}–₱${benchmark.max.toLocaleString()})`,
      min: benchmark.min,
      max: benchmark.max,
      benchmark: benchmark.benchmark,
    }
  }

  if (val > benchmark.max) {
    return {
      status: 'above',
      message: `Above 2026 market baseline (₱${benchmark.min.toLocaleString()}–₱${benchmark.max.toLocaleString()})`,
      min: benchmark.min,
      max: benchmark.max,
      benchmark: benchmark.benchmark,
    }
  }

  return {
    status: 'normal',
    message: 'Within 2026 market range',
    min: benchmark.min,
    max: benchmark.max,
    benchmark: benchmark.benchmark,
  }
}
