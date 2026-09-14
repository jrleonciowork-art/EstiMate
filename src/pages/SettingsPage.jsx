import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const POSITIONS = [
  'Contractor',
  'Project Manager',
  'Site Engineer',
  'Quantity Surveyor',
  'Architect',
  'Student',
  'Other',
]

const PHILIPPINE_REGIONS = [
  { value: 'NCR', label: 'NCR - National Capital Region (Metro Manila)' },
  { value: 'CAR', label: 'CAR - Cordillera Administrative Region' },
  { value: 'Region I', label: 'Region I - Ilocos Region' },
  { value: 'Region II', label: 'Region II - Cagayan Valley' },
  { value: 'Region III', label: 'Region III - Central Luzon' },
  { value: 'Region IV-A', label: 'Region IV-A - CALABARZON' },
  { value: 'MIMAROPA', label: 'MIMAROPA - Southwestern Tagalog' },
  { value: 'Region V', label: 'Region V - Bicol Region' },
  { value: 'Region VI', label: 'Region VI - Western Visayas' },
  { value: 'Region VII', label: 'Region VII - Central Visayas' },
  { value: 'Region VIII', label: 'Region VIII - Eastern Visayas' },
  { value: 'Region IX', label: 'Region IX - Zamboanga Peninsula' },
  { value: 'Region X', label: 'Region X - Northern Mindanao' },
  { value: 'Region XI', label: 'Region XI - Davao Region' },
  { value: 'Region XII', label: 'Region XII - SOCCSKSARGEN' },
  { value: 'Region XIII', label: 'Region XIII - Caraga' },
  { value: 'BARMM', label: 'BARMM - Bangsamoro Autonomous Region' },
]

function Mark() {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F98125] text-white shadow-lg shadow-orange-950/30">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="1.8">
        <path d="m21 16-9 5-9-5V8l9-5 9 5v8Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </svg>
    </span>
  )
}

function CheckIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function UploadIcon({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function UserIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function BuildingIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  )
}

function SparklesIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  )
}

export default function SettingsPage() {
  const { user, isPro, updateProfile, upgradeToPro, downgradeToFree } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Strip accidental "Engr." legacy test prefixes to adhere strictly to instruction:
  // "Do NOT automatically append or prepend 'Engr.' or any title to this field. Allow the user to type it themselves if they wish."
  const cleanInitialName = (name) => {
    if (!name) return ''
    return name.replace(/^Engr\.\s*/i, '').trim()
  }

  // Form State
  const [fullName, setFullName] = useState(() => cleanInitialName(user?.name) || '')
  const [position, setPosition] = useState(() => user?.position || 'Site Engineer')
  const [contactNumber, setContactNumber] = useState(() => user?.contactNumber || '')
  const [companyName, setCompanyName] = useState(() => user?.companyName || '')
  const [companyLogo, setCompanyLogo] = useState(() => user?.companyLogo || null)
  const [defaultRegion, setDefaultRegion] = useState(() => user?.defaultRegion || 'NCR')

  // UI States
  const [isDragging, setIsDragging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)
  const [errorNotice, setErrorNotice] = useState('')

  // Sync if user data loads or updates
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(cleanInitialName(user.name))
      if (!companyName && user.companyName) setCompanyName(user.companyName)
      if (!companyLogo && user.companyLogo) setCompanyLogo(user.companyLogo)
      if (!contactNumber && user.contactNumber) setContactNumber(user.contactNumber)
    }
  }, [user])

  // Handle Logo Upload File Conversion to Data URL
  function processLogoFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorNotice('Please upload a valid image file (PNG, JPG, SVG, or WEBP).')
      return
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setErrorNotice('Logo file size exceeds 2.5MB. Please choose a smaller file.')
      return
    }

    setErrorNotice('')
    const reader = new FileReader()
    reader.onload = (e) => {
      setCompanyLogo(e.target?.result)
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processLogoFile(e.dataTransfer.files[0])
    }
  }

  function handleFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
      processLogoFile(e.target.files[0])
    }
  }

  function removeLogo() {
    setCompanyLogo(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Handle Form Submission
  async function handleSubmit(e) {
    e.preventDefault()
    setIsSaving(true)
    setErrorNotice('')
    setSavedNotice(false)

    try {
      const profileUpdates = {
        name: fullName.trim(), // Raw name strictly as user typed, no prepended title
        position,
        contactNumber: contactNumber.trim(),
        companyName: companyName.trim(),
        companyLogo,
        defaultRegion,
      }

      const res = await updateProfile(profileUpdates)
      if (res.success) {
        // Also mirror in dedicated local storage profile key for offline PDF export modules
        localStorage.setItem('estimate_user_profile_v1', JSON.stringify(profileUpdates))
        setSavedNotice(true)
        setTimeout(() => setSavedNotice(false), 3500)
      } else {
        setErrorNotice('Unable to save changes. Please try again.')
      }
    } catch (err) {
      console.error(err)
      setErrorNotice('Unexpected error while updating settings.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="blueprint-grid min-h-screen bg-[#11224D] font-sans text-white pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#2C599D]/60 bg-[#11224D]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-3 transition hover:opacity-90">
              <Mark />
              <div className="leading-none">
                <span className="text-xl font-bold tracking-tight text-white">
                  Esti<span className="text-[#F98125]">Mate</span>
                </span>
                <span className="block text-[0.6rem] font-medium tracking-widest text-[#5B84C4] uppercase">
                  Profile & Settings
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 rounded-xl border border-[#2C599D]/60 bg-[#193A6F]/60 px-3.5 py-2 text-xs font-semibold text-blue-100 transition hover:bg-[#193A6F] hover:text-white"
            >
              <span>← Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5B84C4]/40 bg-[#193A6F]/50 px-3.5 py-1 text-xs font-semibold text-blue-200">
            <span className="h-2 w-2 rounded-full bg-[#F98125]" />
            ACCOUNT & PREFERENCES
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Profile & Output Settings
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-blue-200/70">
            Configure your professional information, company letterhead branding, and default Philippine DOLE wage baselines for all client-facing Bill of Quantities (BOQ) PDF reports.
          </p>
        </div>

        {/* Status Notifications */}
        <AnimatePresence>
          {savedNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-sm text-emerald-200 backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-white">Changes saved successfully</p>
                  <p className="text-xs text-emerald-300/80">Your profile and PDF letterhead branding preferences are active.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSavedNotice(false)}
                className="text-xs text-emerald-300 hover:text-white"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {errorNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center justify-between rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200 backdrop-blur-md"
            >
              <p className="font-medium">{errorNotice}</p>
              <button
                type="button"
                onClick={() => setErrorNotice('')}
                className="text-xs text-red-300 hover:text-white"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Personal Information Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl shadow-black/25 sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#193A6F]">
                <UserIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Personal Information
                </h2>
                <p className="text-xs text-slate-500">
                  Your identity as an estimating professional on projects and field inspections.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Full Name <span className="text-[#F98125]">*</span>
                </label>
                <div className="mt-2">
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maria Clara Rivera"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-[#F98125] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F98125]/20 placeholder:text-slate-400"
                  />
                </div>
                <p className="mt-1.5 text-[0.7rem] text-slate-400">
                  Enter your real name as it should appear on site reports. (You may include your professional title manually, e.g. Arch., Engr., or omit it).
                </p>
              </div>

              {/* Construction Position */}
              <div>
                <label htmlFor="position" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Construction Position <span className="text-[#F98125]">*</span>
                </label>
                <div className="mt-2">
                  <select
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-[#F98125] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F98125]/20"
                  >
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1.5 text-[0.7rem] text-slate-400">
                  Specifies your signature role on project approvals and estimates.
                </p>
              </div>

              {/* Email Address (Read-only / Tied to Auth) */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email Address
                  </label>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500">
                    Verified Auth
                  </span>
                </div>
                <div className="mt-2">
                  <input
                    id="email"
                    type="email"
                    disabled
                    readOnly
                    value={user?.email || 'engineer@estimate.ph'}
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500 focus:outline-none"
                  />
                </div>
                <p className="mt-1.5 text-[0.7rem] text-slate-400">
                  Your primary authentication email address. Managed through your sign-in provider.
                </p>
              </div>

              {/* Contact Number */}
              <div>
                <label htmlFor="contactNumber" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Contact Number
                </label>
                <div className="mt-2">
                  <input
                    id="contactNumber"
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+63 917 123 4567"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-[#F98125] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F98125]/20 placeholder:text-slate-400"
                  />
                </div>
                <p className="mt-1.5 text-[0.7rem] text-slate-400">
                  Included in BOQ letterheads for contractor client inquiries.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Company & Output Preferences Card (For PDF Generation) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl shadow-black/25 sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-[#F98125]">
                <BuildingIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Company & Output Preferences
                </h2>
                <p className="text-xs text-slate-500">
                  Tailor your company letterhead, logo placement, and regional DOLE wage order for PDF exports.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Company / Firm Name
                </label>
                <div className="mt-2">
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Metro Manila Construction & Engineering Services Corp."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-[#F98125] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F98125]/20 placeholder:text-slate-400"
                  />
                </div>
                <p className="mt-1.5 text-[0.7rem] text-slate-400">
                  Appears prominently in the header of exported Bill of Quantities (BOQ) documents.
                </p>
              </div>

              {/* Company Logo Drag-and-Drop Upload */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Company Logo (For PDF Header)
                  </label>
                  <span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                    isPro ? 'bg-orange-100 text-[#F98125]' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isPro ? 'Pro Feature Unlocked' : 'Pro Feature'}
                  </span>
                </div>

                {!isPro ? (
                  <div className="mt-3 relative overflow-hidden rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#11224D] text-[#F98125] shadow-md">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-slate-900">Custom Letterhead Logo is a Pro Feature</h3>
                    <p className="mx-auto mt-1 max-w-md text-xs text-slate-600">
                      Upgrade to <strong>Pro Contractor</strong> to attach your official company logo to generated client BOQs and remove EstiMate watermarks.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={async () => {
                          await upgradeToPro()
                          setSavedNotice(true)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#F98125] px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-[#FB9B50]"
                      >
                        Upgrade to Pro Contractor
                      </button>
                      <Link
                        to="/pricing"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        View Pricing
                      </Link>
                    </div>
                  </div>
                ) : companyLogo ? (
                  <div className="mt-3 flex flex-col items-center gap-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 p-5 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-28 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                        <img
                          src={companyLogo}
                          alt="Company Logo Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700 uppercase">
                            Logo Attached
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-800">
                          Active Letterhead Logo
                        </p>
                        <p className="text-[0.7rem] text-slate-400">
                          Will be placed at the top of client BOQs.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                      >
                        Change Logo
                      </button>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
                      isDragging
                        ? 'border-[#F98125] bg-orange-50/50 scale-[1.01]'
                        : 'border-slate-300 bg-slate-50/80 hover:border-slate-400 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm">
                      <UploadIcon className="h-6 w-6 text-[#F98125]" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      Click to upload or drag & drop your company logo
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      PNG, JPG, WEBP, or SVG (Recommended: Transparent PNG, max 2.5MB)
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      Browse Files
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Default Operations Region */}
              <div>
                <label htmlFor="defaultRegion" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Default Operations Region (DOLE Labor Baseline)
                </label>
                <div className="mt-2">
                  <select
                    id="defaultRegion"
                    value={defaultRegion}
                    onChange={(e) => setDefaultRegion(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-[#F98125] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F98125]/20"
                  >
                    {PHILIPPINE_REGIONS.map((reg) => (
                      <option key={reg.value} value={reg.value}>
                        {reg.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1.5 text-[0.7rem] text-slate-400">
                  EstiMate will initialize labor rates and statutory minimum wage baselines (e.g. NCR-27 at ₱755/day) based on this regional territory.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: Subscription Section (Distinct Small Card) */}
          <div className="relative overflow-hidden rounded-3xl border border-[#2C599D]/60 bg-gradient-to-br from-white to-blue-50/70 p-6 text-slate-800 shadow-xl sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#11224D] text-[#F98125] shadow-md">
                  <SparklesIcon className="h-6 w-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Subscription Plan
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                      isPro ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      {isPro ? 'Pro Active' : 'Current: Free'}
                    </span>
                  </div>
                  <h3 className="mt-0.5 text-xl font-extrabold text-[#11224D]">
                    {user?.plan || (isPro ? 'Pro Contractor' : 'Free Tier')}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    {isPro
                      ? 'Unlimited project suites, custom company logo on PDF letterhead, unwatermarked white-label client BOQs, and custom DOLE labor wage orders.'
                      : 'Includes up to 3 active project suites, local browser autosave, and standard DOLE NCR wage order calculation.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {isPro ? (
                  <>
                    <Link
                      to="/pricing"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      <span>Manage Billing</span>
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        await downgradeToFree()
                        setSavedNotice(true)
                      }}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                      Switch to Free (Test Mode)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        await upgradeToPro()
                        setSavedNotice(true)
                      }}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F98125] px-5 text-xs font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-[#FB9B50] hover:scale-[1.02]"
                    >
                      <span>Activate Pro Contractor</span>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14m-5-5 5 5-5 5" />
                      </svg>
                    </button>
                    <Link
                      to="/pricing"
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      View Plans
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Save Action Bar */}
          <div className="flex flex-col-reverse items-center justify-between gap-4 rounded-2xl border border-[#2C599D]/50 bg-[#11224D]/80 p-4 backdrop-blur-md sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="text-xs text-blue-200">
                All preferences are stored offline and persist across project workspaces.
              </p>
            </div>

            <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
              <Link
                to="/dashboard"
                className="flex-1 rounded-xl border border-blue-300/30 px-4 py-2.5 text-center text-xs font-semibold text-blue-200 transition hover:bg-white/5 hover:text-white sm:flex-initial"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#F98125] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-950/40 transition hover:bg-[#FB9B50] hover:scale-[1.01] disabled:opacity-60 sm:flex-initial sm:text-sm"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
