import React from 'react'
import LegalLayout from './LegalLayout'

export default function RefundPolicy() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      subtitle="Clear, fair, and transparent guidelines regarding subscription billing, cancellations, and refunds for EstiMate Pro Contractor plans."
      lastUpdated="September 14, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white sm:text-2xl">1. Overview</h2>
        <p>
          At EstiMate, our goal is to deliver the most reliable, rapid, and practical residential quantity surveying tools for Philippine builders, contractors, and engineers. We strive for 100% transparency in our pricing, subscription cycles, and refund processes.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">2. Subscription Plans & Billing Cycles</h2>
        <p>EstiMate offers two straightforward Pro Contractor billing options:</p>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <div className="rounded-2xl border border-[#2C599D]/70 bg-[#11224D]/60 p-5">
            <h3 className="font-bold text-white text-base">Monthly Pro Contractor</h3>
            <p className="font-mono text-xl font-extrabold text-[#F98125] mt-1">₱400 <span className="text-xs text-slate-400 font-normal">/ month</span></p>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Billed on a recurring 30-day cycle. You may cancel at any time with zero termination penalties.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-[#F98125] bg-[#11224D]/60 p-5 relative">
            <span className="absolute -top-3 right-4 rounded-full bg-[#F98125] px-2.5 py-0.5 text-[0.65rem] font-black text-white uppercase">
              Save ₱1,300
            </span>
            <h3 className="font-bold text-white text-base">Annual Pro Contractor</h3>
            <p className="font-mono text-xl font-extrabold text-[#F98125] mt-1">₱3,500 <span className="text-xs text-slate-400 font-normal">/ year</span></p>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Billed once annually for 12 months of continuous unlimited project management and white-label BOQ exports.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">3. 7-Day Money-Back Guarantee (Annual Plans)</h2>
        <p>
          We want you to evaluate EstiMate on your active projects with complete peace of mind. For <strong>Annual Subscriptions</strong>, we provide an unconditional <strong>7-Day Money-Back Guarantee</strong> from the date of initial purchase:
        </p>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-emerald-200 text-xs sm:text-sm leading-relaxed">
          <strong>How It Works:</strong> If you decide within 7 calendar days of your initial annual plan upgrade that EstiMate Pro does not meet your firm's quantity surveying needs, simply email <a href="mailto:billing@estimate.ph" className="text-white underline font-bold">billing@estimate.ph</a> with your registered account email. We will issue a full 100% refund, no questions asked.
        </div>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">4. Monthly Plan Cancellation Terms</h2>
        <p>
          For Monthly Subscriptions, you can cancel your renewal at any time via your Account Settings or by contacting support.
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-slate-300">
          <li>Upon cancellation, your Pro Contractor privileges (unlimited projects, white-label PDF export, custom DOLE rates) will remain fully active until the conclusion of your current 30-day prepaid period.</li>
          <li>We do not offer prorated or partial refunds for days unused within a monthly cycle once the billing period has commenced.</li>
          <li>Following expiration, your account smoothly transitions back to the Free Starter tier. All your saved estimates remain safely preserved in local browser storage.</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">5. Billing Inquiries & Accidental Charges</h2>
        <p>
          If you believe an erroneous or duplicate charge has occurred on your payment method, please notify us within thirty (30) days of the transaction date. Our billing team will promptly investigate and process an immediate reversal for any verified system error or duplicate charge.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">6. Contacting the Billing Department</h2>
        <div className="rounded-2xl border border-[#2C599D]/80 bg-[#11224D] p-4 text-xs sm:text-sm font-mono text-blue-200">
          <p><strong>EstiMate Billing & Customer Support Desk</strong></p>
          <p>Email: <a href="mailto:billing@estimate.ph" className="text-[#F98125] underline">billing@estimate.ph</a></p>
          <p>Response Time: Within 24 business hours (Monday – Saturday, PHT / UTC+8)</p>
        </div>
      </section>
    </LegalLayout>
  )
}
