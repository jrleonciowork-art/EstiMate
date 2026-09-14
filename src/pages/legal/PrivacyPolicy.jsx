import React from 'react'
import LegalLayout from './LegalLayout'

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How EstiMate collects, uses, protects, and respects your personal data under the Philippine Data Privacy Act of 2012 (RA 10173), GDPR, and international data protection standards."
      lastUpdated="September 14, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white sm:text-2xl">1. Introduction & Overview</h2>
        <p>
          EstiMate ("we", "our", or "us") operates the EstiMate residential quantity surveying and project cost estimation web application. We are committed to protecting the privacy, confidentiality, and security of all personal data entrusted to us by Philippine civil engineers, architects, project managers, contractors, and quantity surveyors.
        </p>
        <p>
          This Privacy Policy governs our data handling practices in compliance with <strong>Republic Act No. 10173</strong>, also known as the <em>Data Privacy Act of 2012 (DPA)</em> of the Philippines and its Implementing Rules and Regulations (IRR), as well as the General Data Protection Regulation (GDPR) where applicable to international users.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">2. The Offline-First Architecture & Data Ownership</h2>
        <p>
          EstiMate is built with an <strong>offline-first, client-side execution model</strong>. Your project measurements, takeoff calculations (concrete volume, cement bags, rebar kg, CHB blocks, sand/gravel volume, tile boxes, and paint cans), and custom hardware rates are computed and stored directly inside your device's web browser local storage (<code>localStorage</code>).
        </p>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-emerald-200 text-xs sm:text-sm">
          <strong>Key Guarantee:</strong> Your actual project dimensions, job site locations, and takeoff formulas remain stored locally on your machine unless you explicitly sign in and synchronize them to your authenticated profile.
        </div>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">3. Information We Collect</h2>
        <p>We adhere strictly to the principle of <strong>data minimization</strong>. We only collect information essential for service delivery:</p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>
            <strong className="text-white">Account Authentication Data:</strong> When registering via email, we collect your email address and an encrypted password hash. If you authenticate through Google OAuth, we receive your verified email, display name, and avatar URL provided by Google.
          </li>
          <li>
            <strong className="text-white">Optional Contractor Letterhead Data:</strong> To generate personalized, client-ready Bill of Quantities (BOQ) PDF reports, you may optionally provide your professional name, title/position (e.g. Project Manager, Site Engineer), contact phone number, company name, and company logo.
          </li>
          <li>
            <strong className="text-white">Subscription & Plan Status:</strong> We store your active tier level (<em>Free Starter</em> or <em>Pro Contractor</em>) to enforce rightful access to white-label PDF generation, statutory DOLE wage overrides, and project limits.
          </li>
          <li>
            <strong className="text-white">Technical & Session Identifiers:</strong> We utilize essential browser session tokens and cookie preferences to keep you signed in securely and remember cookie consent choices.
          </li>
        </ul>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">4. How We Use Your Data</h2>
        <p>We process your data strictly for legitimate operational purposes:</p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>To authenticate and manage your authorized user session.</li>
          <li>To compile and brand your downloadable PDF Bill of Quantities reports.</li>
          <li>To apply correct regional DOLE statutory wage order baselines (such as NCR-27).</li>
          <li>To enforce subscription limits and tier entitlements.</li>
          <li>To maintain platform security, prevent unauthorized access, and troubleshoot application errors.</li>
        </ul>
        <p className="font-semibold text-white">
          We do NOT sell, rent, monetize, or trade your personal information or proprietary project takeoff data to advertisers, data brokers, or commercial third parties.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">5. Third-Party Infrastructure & Data Processors</h2>
        <p>We partner only with reputable cloud infrastructure providers that uphold strict security and data protection standards:</p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>
            <strong className="text-white">Supabase Inc.:</strong> Provides enterprise-grade PostgreSQL database hosting and authentication services with end-to-end encryption in transit (TLS 1.3) and at rest (AES-256).
          </li>
          <li>
            <strong className="text-white">Google Identity Services:</strong> Provides optional OAuth 2.0 single sign-on authentication for seamless sign-in.
          </li>
        </ul>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">6. Your Rights Under Philippine & Global Law</h2>
        <p>Under Republic Act No. 10173 and international privacy standards, you are endowed with the following rights:</p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li><strong>Right to be Informed:</strong> To understand how your data is collected and processed.</li>
          <li><strong>Right to Access:</strong> To request a copy of the personal information we hold about you.</li>
          <li><strong>Right to Rectification:</strong> To update or correct inaccurate profile or company letterhead information through your Settings dashboard.</li>
          <li><strong>Right to Erasure or Blocking:</strong> To request deletion of your account and removal of personal credentials from our database.</li>
          <li><strong>Right to Data Portability:</strong> To export your calculated estimates and itemized BOQs at any time in standard PDF formats.</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">7. Security Safeguards</h2>
        <p>
          We implement rigorous administrative, physical, and technical safeguards. All network communications are encrypted using Transport Layer Security (TLS/HTTPS). User passwords are cryptographically hashed using industry-standard bcrypt algorithms through Supabase Auth, and our engineering team cannot view raw password credentials.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">8. Contact Us & Data Protection Officer</h2>
        <p>
          If you have questions regarding this Privacy Policy, wish to exercise your data subject rights, or have privacy-related inquiries, please reach out to our team:
        </p>
        <div className="rounded-2xl border border-[#2C599D]/80 bg-[#11224D] p-4 text-xs sm:text-sm font-mono text-blue-200">
          <p><strong>EstiMate Software Solutions — Data Privacy Desk</strong></p>
          <p>Email: <a href="mailto:privacy@estimate.ph" className="text-[#F98125] underline">privacy@estimate.ph</a> / <a href="mailto:support@estimate.ph" className="text-[#F98125] underline">support@estimate.ph</a></p>
          <p>Location: Metro Manila, Philippines</p>
        </div>
      </section>
    </LegalLayout>
  )
}
