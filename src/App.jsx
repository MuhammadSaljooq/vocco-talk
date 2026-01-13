import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import { OfflineIndicator, LoadingSpinner } from './components/FallbackUI'
import { getCurrentUser, logoutUser } from './utils/userStorage'

// Lazy load components for better performance
const Auth = lazy(() => import('./components/Auth'))
const ConsentModal = lazy(() => import('./components/ConsentModal'))
const Home = lazy(() => import('./pages/Home'))
const Product = lazy(() => import('./pages/Product'))
const Blog = lazy(() => import('./pages/Blog'))
const Contact = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const CreateAgent = lazy(() => import('./pages/CreateAgent'))
const TestAgent = lazy(() => import('./pages/TestAgent'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Pricing = lazy(() => import('./components/Pricing'))
const DemoPage = lazy(() => import('./pages/DemoPage'))

function App() {
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      // Show consent modal if user hasn't given consent
      if (!currentUser.preferences?.gdprConsent && !currentUser.preferences?.conversationConsent) {
        setShowConsent(true)
      }
    }
    setLoading(false)
  }, [])

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setShowAuth(false)
  }

  const handleLogout = () => {
    logoutUser()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-secondary-grey">Loading...</p>
      </div>
    )
  }

  // Loading fallback component
  const PageLoader = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading page..." />
    </div>
  )

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header user={user} onLoginClick={() => setShowAuth(true)} onLogout={handleLogout} />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
                <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
                <Route path="/signup" element={<ErrorBoundary><Signup /></ErrorBoundary>} />
                <Route path="/forgot-password" element={<ErrorBoundary><ForgotPassword /></ErrorBoundary>} />
                <Route path="/product" element={<ErrorBoundary><Product /></ErrorBoundary>} />
                <Route 
                  path="/create-agent" 
                  element={<ErrorBoundary><CreateAgent /></ErrorBoundary>} 
                />
                <Route 
                  path="/test-agent" 
                  element={<ErrorBoundary><TestAgent /></ErrorBoundary>} 
                />
                <Route 
                  path="/dashboard" 
                  element={user ? <ErrorBoundary><Dashboard /></ErrorBoundary> : <Home />} 
                />
                <Route 
                  path="/profile" 
                  element={user ? <ErrorBoundary><Profile user={user} /></ErrorBoundary> : <Home />} 
                />
                <Route path="/pricing" element={<ErrorBoundary><Pricing /></ErrorBoundary>} />
                <Route path="/blog" element={<ErrorBoundary><Blog /></ErrorBoundary>} />
                <Route path="/contact" element={<ErrorBoundary><Contact /></ErrorBoundary>} />
                <Route path="/demo/:demoId" element={<ErrorBoundary><DemoPage /></ErrorBoundary>} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <OfflineIndicator />
        {showAuth && (
          <Suspense fallback={<div className="fixed inset-0 bg-background-dark/80 backdrop-blur-sm flex items-center justify-center z-50"><LoadingSpinner /></div>}>
            <Auth 
              onAuthSuccess={handleAuthSuccess}
              onClose={() => setShowAuth(false)}
            />
          </Suspense>
        )}
        {showConsent && user && (
          <Suspense fallback={<div className="fixed inset-0 bg-background-dark/80 backdrop-blur-sm flex items-center justify-center z-50"><LoadingSpinner /></div>}>
            <ConsentModal
              onAccept={() => {
                setShowConsent(false)
                // Reload user to get updated preferences
                const updatedUser = getCurrentUser()
                if (updatedUser) setUser(updatedUser)
              }}
              onDecline={() => {
                setShowConsent(false)
              }}
            />
          </Suspense>
        )}
      </div>
    </Router>
    </ErrorBoundary>
  )
}

export default App
