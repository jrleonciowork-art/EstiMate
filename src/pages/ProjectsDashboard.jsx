import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectsContext'
import { calculateProject } from '../lib/estimator'

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 })
const compactMoney = new Intl.NumberFormat('en-PH', { notation: 'compact', compactDisplay: 'short', style: 'currency', currency: 'PHP' })

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    more: (
      <>
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    copy: (
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5m4-5v5" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    cube: (
      <>
        <path d="m21 16-9 5-9-5V8l9-5 9 5v8Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </>
    ),
    search: <path d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function ProjectModal({ project, onClose, onSave }) {
  const [name, setName] = useState(project?.name || '')
  const [location, setLocation] = useState(project?.location || '')
  const nameRef = useRef(null)

  useEffect(() => {
    nameRef.current?.focus()
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function submit(e) {
    e.preventDefault()
    if (name.trim()) {
      onSave({ name: name.trim(), location: location.trim() })
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-[#07132F]/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#2C599D]">
            {project ? 'Edit Details' : 'Project Management'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {project ? 'Update Project Details' : 'Create New Project'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {project
            ? 'Adjust the project name or site location without affecting calculations.'
            : 'Initialize an isolated workspace for your field measurements and BOQ.'}
        </p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Project Name <b className="text-[#F98125]">*</b>
          </span>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. 2-Storey Residence, Taguig"
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-[#F98125] focus:bg-white focus:ring-2 focus:ring-[#F98125]/20"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Location / Site Address
          </span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Quezon City, Metro Manila"
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-[#F98125] focus:bg-white focus:ring-2 focus:ring-[#F98125]/20"
          />
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="min-h-11 flex-1 rounded-xl bg-[#F98125] text-sm font-semibold text-white shadow transition hover:bg-[#FB9B50] disabled:opacity-40"
          >
            {project ? 'Save Changes' : 'Start Estimating'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}

function DeleteModal({ project, onClose, onDelete }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-[#07132F]/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 10 }}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-red-100 text-red-600">
          <Icon name="trash" className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Delete Project?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Are you sure you want to delete <strong className="text-slate-900">"{project.name}"</strong>? All dimensions, material specifications, and calculated BOQs will be permanently removed from this browser.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Keep Project
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="min-h-11 flex-1 rounded-xl bg-red-600 text-sm font-semibold text-white shadow hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#5B84C4]/60 bg-[#193A6F]/30 px-6 py-16 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#193A6F] text-[#F98125] shadow-inner">
        <Icon name="cube" className="h-8 w-8" />
      </span>
      <h2 className="mt-6 text-2xl font-bold text-white">No estimates yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-blue-100/70">
        Create your first project to measure concrete geometry, mortar & block takeoffs, finishes, and generate client-ready PDF bills of quantities.
      </p>
      <button
        onClick={onCreate}
        className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#F98125] px-6 text-sm font-semibold text-white shadow-xl hover:bg-[#FB9B50]"
      >
        <Icon name="plus" />
        Create New Project
      </button>
    </div>
  )
}

export default function ProjectsDashboard() {
  const { user, signOut } = useAuth()
  const { projects, createProject, updateProject, deleteProject, duplicateProject } = useProjects()
  const navigate = useNavigate()
  const [modal, setModal] = useState(null)
  const [menu, setMenu] = useState(null)
  const [search, setSearch] = useState('')

  const openCreate = () => setModal({ type: 'create' })

  function save(details) {
    if (modal.type === 'create') {
      const id = createProject(details)
      setModal(null)
      navigate(`/project/${id}`)
    } else if (modal.type === 'edit') {
      updateProject(modal.project.id, details)
      setModal(null)
    }
  }

  // Pre-calculate estimates for fast search and display
  const projectSummaries = useMemo(() => {
    return projects.map((p) => {
      const estimate = calculateProject(p.data)
      const hasStructural = (estimate.structural?.neat || 0) > 0
      const hasMasonry = (estimate.masonry?.area || 0) > 0
      const hasFinishes = ((estimate.finishes?.tileArea || 0) > 0) || ((estimate.finishes?.paintArea || 0) > 0)
      return {
        ...p,
        estimate,
        hasStructural,
        hasMasonry,
        hasFinishes,
      }
    })
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projectSummaries
    const q = search.toLowerCase()
    return projectSummaries.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.location && p.location.toLowerCase().includes(q))
    )
  }, [projectSummaries, search])

  const totalPortfolioValue = useMemo(() => {
    return projectSummaries.reduce((sum, p) => sum + (p.estimate.total || 0), 0)
  }, [projectSummaries])

  return (
    <div className="blueprint-grid min-h-screen bg-[#11224D] font-sans text-white">
      {/* Kebab menu click-outside overlay */}
      {menu && <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />}

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#2C599D]/60 bg-[#11224D]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F98125] text-white shadow-lg shadow-orange-950/30">
                <Icon name="cube" />
              </span>
              <div className="leading-none">
                <span className="text-xl font-bold tracking-tight text-white">
                  Esti<span className="text-[#F98125]">Mate</span>
                </span>
                <span className="block text-[0.6rem] font-medium tracking-widest text-[#5B84C4] uppercase">
                  Project Management
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-semibold text-[#5B84C4] transition hover:text-white sm:text-sm"
            >
              ← Landing Page
            </Link>
            {projects.length > 0 && (
              <button
                onClick={openCreate}
                className="flex min-h-10 items-center gap-1.5 rounded-xl bg-[#F98125] px-4 text-xs font-semibold text-white shadow-md transition hover:bg-[#FB9B50] sm:text-sm"
              >
                <Icon name="plus" className="h-4 w-4" />
                <span className="hidden sm:inline">Create New Project</span>
                <span className="sm:hidden">New</span>
              </button>
            )}

            {/* User Account, Settings & Sign Out */}
            {user && (
              <div className="flex items-center gap-2.5 border-l border-[#2C599D]/60 pl-3">
                <Link
                  to="/settings"
                  title="Account Settings & Preferences"
                  className="hidden text-right transition hover:opacity-85 sm:block"
                >
                  <p className="text-xs font-semibold text-white leading-tight">{user.name || user.email}</p>
                  <p className="text-[0.65rem] text-[#F98125] font-medium">{user.plan || 'Free Tier'}</p>
                </Link>
                <Link
                  to="/settings"
                  title="Account Settings & Preferences"
                  className="rounded-xl border border-[#2C599D]/70 bg-[#193A6F]/60 p-2 text-blue-200 transition hover:bg-[#193A6F] hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </Link>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="rounded-xl border border-[#2C599D]/70 bg-[#193A6F]/60 px-2.5 py-1.5 text-xs font-medium text-blue-200 transition hover:border-red-400/50 hover:bg-red-500/15 hover:text-red-300"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Title Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B84C4]">
              Quantity Surveying Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Project Management
            </h1>
            <p className="mt-1 text-sm text-blue-100/70">
              Manage your residential construction projects, isolated takeoffs, and BOQs.
            </p>
          </div>

          {/* Quick Portfolio Stats */}
          {projects.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              <div className="rounded-xl border border-[#2C599D]/80 bg-[#193A6F]/50 px-3.5 py-2">
                <span className="block text-[0.6rem] uppercase tracking-wider text-[#5B84C4]">Projects</span>
                <span className="font-mono text-sm font-bold text-white">{projects.length} active</span>
              </div>
              <div className="rounded-xl border border-[#2C599D]/80 bg-[#193A6F]/50 px-3.5 py-2">
                <span className="block text-[0.6rem] uppercase tracking-wider text-[#5B84C4]">Total Portfolio Value</span>
                <span className="font-mono text-sm font-bold text-[#F98125]">
                  {compactMoney.format(totalPortfolioValue)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar if projects exist */}
        {projects.length > 1 && (
          <div className="mt-6 relative max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Icon name="search" className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name or location..."
              className="h-11 w-full rounded-xl border border-[#2C599D]/70 bg-[#193A6F]/40 pl-10 pr-4 text-xs font-medium text-white placeholder:text-blue-200/50 focus:border-[#F98125] focus:outline-none focus:ring-2 focus:ring-[#F98125]/20"
            />
          </div>
        )}

        {/* Projects Grid */}
        <div className="mt-8">
          {projects.length === 0 ? (
            <EmptyState onCreate={openCreate} />
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2C599D] bg-[#193A6F]/20 p-8 text-center">
              <p className="text-sm text-blue-200/70">No projects found matching "{search}"</p>
              <button
                onClick={() => setSearch('')}
                className="mt-3 text-xs font-semibold text-[#F98125] underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project, index) => {
                const est = project.estimate
                return (
                  <motion.article
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:shadow-2xl"
                  >
                    {/* Top Row: Icon + Kebab Menu */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#193A6F]">
                            <Icon name="cube" className="h-5 w-5" />
                          </span>
                          <div>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.6rem] font-bold text-slate-600 uppercase tracking-wider">
                              QS Project
                            </span>
                          </div>
                        </div>

                        {/* Kebab Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            aria-label={`Project options for ${project.name}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenu(menu === project.id ? null : project.id)
                            }}
                            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Icon name="more" className="h-5 w-5" />
                          </button>

                          {menu === project.id && (
                            <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setModal({ type: 'edit', project })
                                  setMenu(null)
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <Icon name="edit" className="h-3.5 w-3.5 text-slate-500" />
                                Edit Details
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  duplicateProject(project.id)
                                  setMenu(null)
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <Icon name="copy" className="h-3.5 w-3.5 text-slate-500" />
                                Duplicate Project
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setModal({ type: 'delete', project })
                                  setMenu(null)
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                <Icon name="trash" className="h-3.5 w-3.5 text-red-500" />
                                Delete Project
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Main Clickable Area to navigate to /project/:id */}
                      <button
                        type="button"
                        onClick={() => navigate(`/project/${project.id}`)}
                        className="mt-4 block w-full text-left"
                      >
                        <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 group-hover:text-[#193A6F]">
                          {project.name}
                        </h2>

                        <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
                          <Icon name="pin" className="h-3.5 w-3.5 shrink-0 text-[#5B84C4]" />
                          <span>{project.location || 'Location not specified'}</span>
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-slate-400">
                          <Icon name="calendar" className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            Created{' '}
                            {new Date(project.createdAt).toLocaleDateString('en-PH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </p>

                        {/* Trade status badges */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {project.hasStructural && (
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold text-[#193A6F]">
                              Structural
                            </span>
                          )}
                          {project.hasMasonry && (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-700">
                              Masonry
                            </span>
                          )}
                          {project.hasFinishes && (
                            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[0.65rem] font-semibold text-purple-700">
                              Finishes
                            </span>
                          )}
                          {!project.hasStructural && !project.hasMasonry && !project.hasFinishes && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.65rem] font-medium text-slate-500">
                              Empty Takeoff
                            </span>
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Bottom Cost Summary */}
                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/project/${project.id}`)}
                        className="flex w-full items-end justify-between text-left"
                      >
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
                            Estimated Total
                          </p>
                          <p
                            className={`mt-0.5 font-mono text-lg font-extrabold ${
                              est.total > 0 ? 'text-[#F98125]' : 'text-slate-400'
                            }`}
                          >
                            {est.total > 0 ? money.format(est.total) : 'Not calculated'}
                          </p>
                          {est.total > 0 && (
                            <p className="text-[0.65rem] text-slate-500 font-mono">
                              Mat: {compactMoney.format(est.materialCost)} · Lab: {compactMoney.format(est.laborCost)}
                            </p>
                          )}
                        </div>

                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#11224D] text-white shadow transition group-hover:bg-[#F98125] group-hover:scale-105">
                          <Icon name="arrow" className="h-4 w-4" />
                        </span>
                      </button>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === 'create' && (
          <ProjectModal onClose={() => setModal(null)} onSave={save} />
        )}
        {modal?.type === 'edit' && (
          <ProjectModal project={modal.project} onClose={() => setModal(null)} onSave={save} />
        )}
        {modal?.type === 'delete' && (
          <DeleteModal
            project={modal.project}
            onClose={() => setModal(null)}
            onDelete={() => {
              deleteProject(modal.project.id)
              setModal(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
