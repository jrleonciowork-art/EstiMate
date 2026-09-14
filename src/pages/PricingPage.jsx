import { Link } from 'react-router-dom'
import PricingSection from '../components/PricingSection'

function Mark() {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F98125] shadow-lg shadow-orange-950/30">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="1.8">
        <path d="m21 16-9 5-9-5V8l9-5 9 5v8Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </svg>
    </span>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  )
}

export default function PricingPage() {
  return (
    <div className="blueprint-grid min-h-screen bg-[#11224D] font-sans text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#2C599D]/50 bg-[#11224D]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <Mark />
            <div className="leading-none">
              <span className="text-xl font-bold tracking-tight text-white">
                Esti<span className="text-[#F98125]">Mate</span>
              </span>
              <span className="block text-[0.6rem] font-medium tracking-widest text-[#5B84C4] uppercase">
                QS Field Suite
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/#about" className="text-xs font-semibold text-blue-200/80 transition hover:text-white sm:text-sm">
              About
            </Link>
            <Link
              to="/dashboard"
              className="flex min-h-10 items-center gap-2 rounded-xl bg-[#F98125] px-4 text-xs font-bold text-white shadow-lg shadow-orange-950/40 transition hover:bg-[#FB9B50]"
            >
              Start Estimating <Arrow />
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-4">
        <PricingSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2C599D]/50 bg-[#0d1a3c] px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-[#5B84C4] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} EstiMate · Pocket Quantity Surveying Suite for Philippine Sites</span>
          <span>DOLE NCR-27 Baseline Reference · Transparent Billing</span>
        </div>
      </footer>
    </div>
  )
}
