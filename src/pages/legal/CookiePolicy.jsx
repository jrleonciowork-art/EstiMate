import React from 'react'
import LegalLayout from './LegalLayout'

export default function CookiePolicy() {
  return (
    <LegalLayout
      title="Cookie & Local Storage Policy"
      subtitle="How EstiMate uses essential browser cookies and local storage technology to deliver offline-first quantity surveying and persistent project calculations."
      lastUpdated="September 14, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white sm:text-2xl">1. What Are Cookies and Local Storage?</h2>
        <p>
          Cookies are small text files placed on your computer or mobile device by websites you visit. In addition to standard HTTP cookies, modern web applications like EstiMate utilize <strong>HTML5 Web Storage (<code>localStorage</code>)</strong>, which allows websites to store structured data safely within your browser without transmitting it to external servers on every network request.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">2. Why EstiMate Uses Local Storage</h2>
        <p>
          EstiMate is purposefully designed as an <strong>offline-first, zero-latency engineering utility</strong>. Field quantity surveyors frequently operate on active construction job sites where cellular and Wi-Fi reception is intermittent or unavailable. Local storage enables your takeoffs and project configurations to persist even when disconnected.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">3. Specific Keys & Storage Items We Use</h2>
        <p>Below is a transparent catalog of every key stored on your device by EstiMate:</p>

        <div className="overflow-x-auto rounded-2xl border border-[#2C599D]/70 bg-[#11224D]/60 mt-4">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#2C599D]/60 text-[#7CA3E2] font-semibold uppercase tracking-wider text-[0.7rem]">
                <th className="p-3.5">Storage Key / Cookie</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Purpose & Function</th>
                <th className="p-3.5">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C599D]/40 text-slate-300">
              <tr>
                <td className="p-3.5 font-mono text-white">estimate_projects_v1</td>
                <td className="p-3.5"><span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-300 uppercase">Strictly Essential</span></td>
                <td className="p-3.5">Stores your active project suites, concrete geometries, CHB areas, tile takeoffs, and custom hardware prices.</td>
                <td className="p-3.5">Persistent until deleted by user</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-white">estimate_auth_session_v1</td>
                <td className="p-3.5"><span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-300 uppercase">Strictly Essential</span></td>
                <td className="p-3.5">Maintains your authenticated session token so you do not need to sign in repeatedly on page refreshes.</td>
                <td className="p-3.5">Session / Until sign-out</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-white">estimate_user_profile_v1</td>
                <td className="p-3.5"><span className="rounded bg-blue-500/20 px-2 py-0.5 text-[0.65rem] font-bold text-blue-300 uppercase">Functional</span></td>
                <td className="p-3.5">Caches your contractor letterhead preferences, company name, and logo for instant client-facing BOQ PDF rendering.</td>
                <td className="p-3.5">Persistent</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-white">estimate_cookie_consent_v1</td>
                <td className="p-3.5"><span className="rounded bg-blue-500/20 px-2 py-0.5 text-[0.65rem] font-bold text-blue-300 uppercase">Functional</span></td>
                <td className="p-3.5">Records your cookie consent preference so the banner is not displayed on every page load.</td>
                <td className="p-3.5">1 Year</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">4. Zero Third-Party Advertising Trackers</h2>
        <div className="rounded-2xl border border-blue-500/30 bg-blue-950/30 p-4 text-blue-200 text-xs sm:text-sm">
          <strong>Privacy First:</strong> EstiMate does <strong>NOT</strong> integrate advertising cookies, behavioral tracking beacons (such as Meta Pixel or Google remarketing tags), or cross-site data broker trackers. We believe professional engineering tools should respect user privacy.
        </div>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#2C599D]/50">
        <h2 className="text-xl font-bold text-white sm:text-2xl">5. How to Manage and Clear Storage</h2>
        <p>
          You can inspect, manage, or delete all cookies and local storage keys at any time through your web browser settings:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-slate-300">
          <li><strong>Google Chrome & Microsoft Edge:</strong> Settings → Privacy & Security → Site Settings → On-device site data → Search for <code>estimate.ph</code> or <code>localhost</code> → Delete data.</li>
          <li><strong>Apple Safari (iOS & macOS):</strong> Preferences/Settings → Privacy → Manage Website Data → Remove.</li>
          <li><strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data → Clear Data.</li>
        </ul>
        <p className="text-xs text-amber-200/90 pt-1">
          <em>Please note: Clearing your browser's local storage will remove any project takeoffs that have not been backed up or exported to PDF.</em>
        </p>
      </section>
    </LegalLayout>
  )
}
