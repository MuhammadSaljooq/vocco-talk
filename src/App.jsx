import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Auth from './components/Auth'
import ConsentModal from './components/ConsentModal'
import Home from './pages/Home'
import Product from './pages/Product'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import CreateAgent from './pages/CreateAgent'
import TestAgent from './pages/TestAgent'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Pricing from './components/Pricing'
import ErrorBoundary from './components/ErrorBoundary'
import { OfflineIndicator } from './components/FallbackUI'
import { getCurrentUser, logoutUser } from './utils/userStorage'

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
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header user={user} onLoginClick={() => setShowAuth(true)} onLogout={handleLogout} />
          <main className="flex-1">
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
            </Routes>
          </main>
          <Footer />
          <OfflineIndicator />
        {showAuth && (
          <Auth 
            onAuthSuccess={handleAuthSuccess}
            onClose={() => setShowAuth(false)}
          />
        )}
        {showConsent && user && (
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
        )}
      </div>
    </Router>
    </ErrorBoundary>
  )
}

export default App
