import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProjectsProvider } from './context/ProjectsContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ProjectsDashboard from './pages/ProjectsDashboard'
import ProjectSuite from './pages/ProjectSuite'
import ParallaxDemo from './demos/default'
import PricingPage from './pages/PricingPage'
import SettingsPage from './pages/SettingsPage'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsConditions from './pages/legal/TermsConditions'
import CookiePolicy from './pages/legal/CookiePolicy'
import RefundPolicy from './pages/legal/RefundPolicy'
import RoofEstimator from './pages/RoofEstimator'
import CookieConsent from './components/CookieConsent'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#11224D] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F98125] border-t-transparent" />
          <p className="font-mono text-xs text-blue-200">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function ScopedProjectRoute() {
  const { id } = useParams()
  return <ProjectSuite key={id} />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectsProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProjectsDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/:id"
              element={
                <ProtectedRoute>
                  <ScopedProjectRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roof-estimate"
              element={
                <ProtectedRoute>
                  <RoofEstimator />
                </ProtectedRoute>
              }
            />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/refunds" element={<RefundPolicy />} />
            <Route path="/demo" element={<ParallaxDemo />} />
            <Route path="/parallax" element={<ParallaxDemo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <CookieConsent />
        </ProjectsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
