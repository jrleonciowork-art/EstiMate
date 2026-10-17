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
import FormworkEstimator from './pages/FormworkEstimator'
import ConcreteEstimator from './pages/ConcreteEstimator'
import RebarEstimator from './pages/RebarEstimator'
import BoqExporter from './pages/BoqExporter'
import CookieConsent from './components/CookieConsent'
import MobileDisplayAdvisory from './components/MobileDisplayAdvisory'
import ErrorBoundary from './components/ErrorBoundary'

function ProtectedRoute({ children, allowGuest = true }) {
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

  if (!isAuthenticated && !allowGuest) {
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
      <ErrorBoundary>
        <AuthProvider>
          <ProjectsProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowGuest>
                    <ProjectsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project/:id"
                element={
                  <ProtectedRoute allowGuest>
                    <ScopedProjectRoute />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowGuest>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roof-estimate"
                element={
                  <ProtectedRoute allowGuest>
                    <RoofEstimator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/concrete-estimate"
                element={
                  <ProtectedRoute allowGuest>
                    <ConcreteEstimator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/formwork-estimate"
                element={
                  <ProtectedRoute allowGuest>
                    <FormworkEstimator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rebar-estimate"
                element={
                  <ProtectedRoute allowGuest>
                    <RebarEstimator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/boq-exporter"
                element={
                  <ProtectedRoute allowGuest>
                    <BoqExporter />
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
            <MobileDisplayAdvisory />
          </ProjectsProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
