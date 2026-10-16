import { useState, useMemo } from 'react'
import { MARKET_BENCHMARKS_2026, validatePrice } from '../utils/pricingData'

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 })

export default function PricingGrid({ prices = {}, onUpdatePrice, onResetAll }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const set = new Set()
    Object.values(MARKET_BENCHMARKS_2026).forEach((item) => set.add(item.category))
    return ['all', ...Array.from(set)]
  }, [])

  const items = useMemo(() => {
    return Object.values(MARKET_BENCHMARKS_2026).filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory
      const matchSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.specification.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [selectedCategory, search])

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xl space-y-5 text-slate-800">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-100 text-[#F98125] font-bold text-xs">
              ₱
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              2026 Philippine Material Unit Cost Verification
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Review live market baselines (NCR/CALABARZON). Override default unit costs before generating the final BOQ.
          </p>
        </div>

        {onResetAll && (
          <button
            type="button"
            onClick={onResetAll}
            className="self-start sm:self-auto rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-bold text-[#F98125] hover:bg-orange-100 transition shadow-sm"
          >
            ↺ Reset to 2026 Benchmarks
          </button>
        )}
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                selectedCategory === cat
                  ? 'bg-[#11224D] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Materials' : cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#F98125] focus:bg-white"
          />
        </div>
      </div>

      {/* Interactive Pricing Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-3.5">Material &amp; Specification</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Unit</th>
              <th className="py-3 px-3">2026 Market Range</th>
              <th className="py-3 px-3">Active Unit Cost (Editable)</th>
              <th className="py-3 px-3.5 text-right">Verification Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((item) => {
              const activeVal = prices[item.key] !== undefined ? prices[item.key] : item.benchmark
              const check = validatePrice(item.key, activeVal)
              const isModified = Number(activeVal) !== item.benchmark

              return (
                <tr key={item.key} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3.5">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-[0.68rem] text-slate-500">{item.specification}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-600">{item.unit}</td>
                  <td className="py-3 px-3 font-mono text-[0.72rem] text-slate-500">
                    ₱{item.min.toLocaleString()} – ₱{item.max.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-400">₱</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={activeVal}
                        onChange={(e) => onUpdatePrice && onUpdatePrice(item.key, e.target.value)}
                        className={`w-28 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-bold outline-none transition ${
                          check.status === 'above'
                            ? 'border-amber-400 bg-amber-50 text-amber-900 focus:border-amber-500'
                            : check.status === 'below'
                            ? 'border-blue-300 bg-blue-50 text-blue-900 focus:border-blue-400'
                            : isModified
                            ? 'border-[#F98125] bg-orange-50/40 text-slate-900 focus:border-[#F98125]'
                            : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-[#F98125] focus:bg-white'
                        }`}
                      />
                      {isModified && (
                        <button
                          type="button"
                          onClick={() => onUpdatePrice && onUpdatePrice(item.key, String(item.benchmark))}
                          title="Reset to 2026 benchmark"
                          className="rounded p-1 text-[0.65rem] font-bold text-slate-400 hover:text-[#F98125]"
                        >
                          ↺
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    {check.status === 'normal' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Within Range
                      </span>
                    ) : check.status === 'above' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[0.65rem] font-bold text-amber-800" title={check.message}>
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Above Market
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[0.65rem] font-bold text-blue-700" title={check.message}>
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Below Market
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[0.7rem] text-slate-500 leading-relaxed">
        💡 <strong className="text-slate-700">Contractor Note:</strong> Unit costs set here immediately update all project bills of quantities (BOQ), material schedule markups, and client bid export figures.
      </div>
    </div>
  )
}
