import React from 'react'
import LegalLayout from './LegalLayout'

export default function TermsConditions() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="The agreement between you and EstiMate regarding your access, rights, obligations, and use of our residential quantity surveying and estimating software suite."
      lastUpdated="September 14, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white sm:text-2xl">1. Acceptance of Terms</h2>
        <p>
          By creating an account, accessing, or using EstiMate ("the Service", "the Application", or "the Platform"), you acknowledge that you have read, understood, and agreed to be bound by these Terms & Conditions ("Terms"). If you do not agree to these Terms, you must immediately discontinue use of the Service.
        </p>
        <p>
          These Terms constitute a legally binding agreement between you ("User", "Contractor", or "Estimator") and EstiMate Software Solutions ("Company", "we", "us", or "our"), enforceable under the laws of the Republic of the Philippines.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">2. Professional Engineering & Quantity Surveying Disclaimer</h2>
        <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-950/30 p-5 text-amber-200 text-xs sm:text-sm leading-relaxed space-y-2">
          <p className="font-bold text-white uppercase tracking-wide">⚠️ Mandatory Engineering Notice:</p>
          <p>
            EstiMate provides empirical quantity surveying estimators, mix design ratios (Class AA, A, B, C), and statutory DOLE labor productivity calculations for preliminary planning, commercial budgeting, and contractor tender preparation.
          </p>
          <p>
            <strong>The Application does NOT replace certified structural engineering analysis, stamped structural calculations, or official architectural working drawings.</strong> All structural concrete members (slabs, columns, footings, and rebar steel schedules) must be designed, detailed, and validated in compliance with the National Structural Code of the Philippines (NSCP) and local municipal building codes under the supervision of a duly licensed Civil Engineer or Professional Structural Engineer registered with the Philippine Professional Regulation Commission (PRC).
          </p>
          <p>
            EstiMate and its developers assume no liability for procurement shortages, material overages, on-site construction structural defects, or commercial bidding errors resulting from field measurement discrepancies or unverified benchmark price assumptions.
          </p>
        </div>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">3. User Accounts & Security</h2>
        <p>
          You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify EstiMate immediately of any unauthorized use or security breach. EstiMate cannot and will not be liable for any loss or damage arising from your failure to safeguard your account.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">4. Subscription Tiers & Feature Entitlements</h2>
        <p>The Service is offered under two distinct service tiers:</p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>
            <strong className="text-white">Free Starter Tier:</strong> Includes core geometric inputs, material yield calculators, and up to 3 active project suites saved in local browser storage. Free accounts are limited to interactive on-screen calculations and are strictly <em>ineligible</em> for white-label PDF Bill of Quantities exports.
          </li>
          <li>
            <strong className="text-white">Pro Contractor Tier:</strong> Unlocks unlimited saved project suites, white-label client-ready PDF Bill of Quantities downloads, custom company letterhead & logo upload, and editable statutory DOLE wage orders (NCR-27 and regional minimums). Available via monthly (₱400/month) or annual (₱3,500/year) subscription billing.
          </li>
        </ul>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">5. Intellectual Property Rights</h2>
        <p>
          The EstiMate codebase, brand marks, visual design, custom UI components, and software algorithms are the proprietary property of EstiMate Software Solutions.
        </p>
        <p>
          <strong className="text-white">Your Project Data Belongs to You:</strong> You retain full, exclusive ownership of all project dimensions, material rates, company logos, and exported BOQ documents you create using the Platform.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">6. Prohibited Activities</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>Attempt to reverse-engineer, decompile, or disassemble any part of the EstiMate software.</li>
          <li>Bypass or attempt to circumvent subscription feature gates, project limits, or PDF export eligibility locks.</li>
          <li>Use automated scripts, web scrapers, or bots to harvest market benchmark database rates.</li>
          <li>Use the service for fraudulent construction billing or misleading public tender submissions.</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable Philippine law, EstiMate and its affiliates, directors, and developers shall not be liable for any indirect, punitive, incidental, special, or consequential damages, including loss of profits, construction delays, job-site disputes, or procurement losses resulting from the use or inability to use the Platform.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">8. Governing Law & Dispute Resolution</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any legal action, dispute, or proceeding arising out of or related to these Terms shall be instituted exclusively in the proper courts of Quezon City or Manila, Philippines.
        </p>
      </section>
    </LegalLayout>
  )
}
