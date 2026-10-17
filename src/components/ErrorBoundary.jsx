import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('EstiMate Application Error Boundary caught:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleResetStorage = () => {
    try {
      // Clear potentially corrupted workspace caches without wiping credentials
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('estimate_projects_') || key === 'estimate-projects-v1')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
      window.location.href = '/'
    } catch {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#11224D] p-6 text-white font-sans">
          <div className="w-full max-w-lg rounded-3xl border border-[#2C599D] bg-[#0d1b3e] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F98125] text-white font-bold text-xl shadow-lg">
                !
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Something interrupted the workspace</h1>
                <p className="text-xs text-blue-200/80">EstiMate caught a rendering error and kept your session secure.</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-700/60 bg-[#07132F] p-4 text-xs font-mono text-amber-300 overflow-x-auto max-h-36">
              {this.state.error?.message || 'An unexpected runtime error occurred.'}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 rounded-xl bg-[#F98125] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-[#FB9B50] transition"
              >
                Reload Workspace
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="flex-1 rounded-xl border border-[#2C599D] bg-[#193A6F]/50 py-3 text-xs font-bold uppercase tracking-wider text-blue-100 hover:bg-[#193A6F] transition"
              >
                Back to Landing
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={this.handleResetStorage}
                className="text-[0.7rem] text-slate-400 hover:text-rose-300 underline transition"
              >
                Reset Corrupted Local Data (If crash persists after reload)
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
