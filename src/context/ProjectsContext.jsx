import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DEFAULT_DATA } from '../lib/estimator'

const STORAGE_KEY = 'estimate-projects-v1'
const ProjectsContext = createContext(null)

const clone = (value) => JSON.parse(JSON.stringify(value))

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'proj_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9)
}

const SAMPLE_PROJECT = {
  id: 'demo-sample-villa',
  name: 'Sample Residential Villa',
  location: 'Quezon City, Metro Manila',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  data: {
    structural: {
      slabLength: '10.00', slabWidth: '8.00', slabThickness: '0.12',
      columnCount: '8', columnWidth: '0.30', columnDepth: '0.30', columnHeight: '3.00',
      footingCount: '8', footingLength: '1.20', footingWidth: '1.20', footingThickness: '0.30',
      mixClass: 'A', wastage: '5', bagSize: 40, rebarRatio: '80',
    },
    masonry: {
      wallLength: '42.00', wallHeight: '3.00', openingsArea: '14.50', wastage: '5',
      plasterSides: 2, plasterThickness: '16',
    },
    finishes: {
      floorArea: '75.00', tileWastage: '10', paintArea: '210.00', paintCoats: '2',
    },
    prices: { ...DEFAULT_DATA.prices },
    wages: { ...DEFAULT_DATA.wages },
    marketUpdated: null,
  },
}

function readProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }

    const legacyData = JSON.parse(localStorage.getItem('estimate-qs-suite-v1') || 'null')
    if (legacyData) {
      const now = new Date().toISOString()
      const migrated = [{
        id: generateId(),
        name: 'My Residential Project',
        location: 'Metro Manila',
        createdAt: now,
        updatedAt: now,
        data: { ...clone(DEFAULT_DATA), ...legacyData },
      }]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      return migrated
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify([SAMPLE_PROJECT]))
    return [SAMPLE_PROJECT]
  } catch {
    return [SAMPLE_PROJECT]
  }
}

export function ProjectsProvider({ children }) {
  const [projects, setProjectsState] = useState(readProjects)

  const commit = useCallback((updater) => {
    setProjectsState((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (err) {
        console.error('Failed to save projects to localStorage:', err)
      }
      return next
    })
  }, [])

  const createProject = useCallback((details) => {
    const now = new Date().toISOString()
    const project = {
      id: generateId(),
      name: details.name.trim(),
      location: details.location?.trim() || '',
      createdAt: now,
      updatedAt: now,
      data: clone(DEFAULT_DATA),
    }
    commit((current) => [project, ...current])
    return project.id
  }, [commit])

  const updateProject = useCallback((id, details) => {
    commit((current) => current.map((p) => (p.id === id ? { ...p, ...details, updatedAt: new Date().toISOString() } : p)))
  }, [commit])

  const deleteProject = useCallback((id) => {
    commit((current) => current.filter((p) => p.id !== id))
  }, [commit])

  const duplicateProject = useCallback((id) => {
    const now = new Date().toISOString()
    let newId = null
    commit((current) => {
      const original = current.find((p) => p.id === id)
      if (!original) return current
      newId = generateId()
      const duplicate = {
        id: newId,
        name: `${original.name} (Copy)`,
        location: original.location,
        createdAt: now,
        updatedAt: now,
        data: clone(original.data),
      }
      return [duplicate, ...current]
    })
    return newId
  }, [commit])

  const updateProjectData = useCallback((id, data) => {
    commit((current) => current.map((p) => (p.id === id ? { ...p, data, updatedAt: new Date().toISOString() } : p)))
  }, [commit])

  const getProject = useCallback((id) => projects.find((p) => p.id === id), [projects])

  const value = useMemo(() => ({
    projects,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    updateProjectData,
    getProject,
  }), [projects, createProject, updateProject, deleteProject, duplicateProject, updateProjectData, getProject])

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (!context) throw new Error('useProjects must be used within ProjectsProvider')
  return context
}
