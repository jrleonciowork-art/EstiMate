import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_DATA } from '../lib/estimator'
import { useAuth } from './AuthContext'

const ProjectsContext = createContext(null)

const clone = (value) => JSON.parse(JSON.stringify(value))

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'proj_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9)
}

function getStorageKey(userId) {
  return userId ? `estimate_projects_${userId}_v1` : 'estimate_projects_guest_v1'
}

function readProjectsForUser(userId) {
  const key = getStorageKey(userId)
  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // Strip out any legacy demo sample projects
        return parsed.filter((p) => p.id !== 'demo-sample-villa')
      }
    }

    // If logging into an authenticated account for the first time, check if guest projects exist to migrate
    if (userId) {
      const guestRaw = localStorage.getItem('estimate_projects_guest_v1')
      if (guestRaw) {
        const guestParsed = JSON.parse(guestRaw)
        if (Array.isArray(guestParsed)) {
          const filtered = guestParsed.filter((p) => p.id !== 'demo-sample-villa')
          localStorage.setItem(key, JSON.stringify(filtered))
          localStorage.removeItem('estimate_projects_guest_v1')
          return filtered
        }
      }
    }

    // Check legacy storage key for backward compatibility
    const legacyRaw = localStorage.getItem('estimate-projects-v1')
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw)
      if (Array.isArray(legacyParsed)) {
        const filtered = legacyParsed.filter((p) => p.id !== 'demo-sample-villa')
        localStorage.setItem(key, JSON.stringify(filtered))
        return filtered
      }
    }

    // Free and guest accounts start clean with zero sample projects
    return []
  } catch (err) {
    console.error('Failed to read projects from localStorage:', err)
    return []
  }
}

export function ProjectsProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id || null

  const [projects, setProjectsState] = useState(() => readProjectsForUser(userId))

  // When user identity changes (Sign In / Sign Out / User Switch), re-load isolated project workspace
  useEffect(() => {
    setProjectsState(readProjectsForUser(userId))
  }, [userId])

  const commit = useCallback(
    (updater) => {
      setProjectsState((current) => {
        const next = typeof updater === 'function' ? updater(current) : updater
        try {
          const key = getStorageKey(userId)
          localStorage.setItem(key, JSON.stringify(next))
        } catch (err) {
          console.error('Failed to save projects to localStorage:', err)
        }
        return next
      })
    },
    [userId]
  )

  const createProject = useCallback(
    (details) => {
      const now = new Date().toISOString()
      const project = {
        id: generateId(),
        name: details.name.trim(),
        location: details.location?.trim() || '',
        createdAt: now,
        updatedAt: now,
        data: details.data ? { ...clone(DEFAULT_DATA), ...details.data } : clone(DEFAULT_DATA),
      }
      commit((current) => [project, ...current])
      return project.id
    },
    [commit]
  )

  const updateProject = useCallback(
    (id, details) => {
      commit((current) =>
        current.map((p) =>
          p.id === id ? { ...p, ...details, updatedAt: new Date().toISOString() } : p
        )
      )
    },
    [commit]
  )

  const deleteProject = useCallback(
    (id) => {
      commit((current) => current.filter((p) => p.id !== id))
    },
    [commit]
  )

  const duplicateProject = useCallback(
    (id) => {
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
    },
    [commit]
  )

  const updateProjectData = useCallback(
    (id, data) => {
      commit((current) =>
        current.map((p) => (p.id === id ? { ...p, data, updatedAt: new Date().toISOString() } : p))
      )
    },
    [commit]
  )

  const getProject = useCallback((id) => projects.find((p) => p.id === id), [projects])

  const value = useMemo(
    () => ({
      projects,
      createProject,
      updateProject,
      deleteProject,
      duplicateProject,
      updateProjectData,
      getProject,
    }),
    [projects, createProject, updateProject, deleteProject, duplicateProject, updateProjectData, getProject]
  )

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (!context) throw new Error('useProjects must be used within ProjectsProvider')
  return context
}
