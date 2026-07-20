import { useState, useEffect } from 'react'
import FAQModal from './FAQModal'
import AdminPanel from './AdminPanel'
import AdminLogin from './AdminLogin'

import { loadContentFromLocalStorage } from './utils/contentSync'
import './App.css'

function App() {
  const [isFAQOpen, setIsFAQOpen] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showAdminButton, setShowAdminButton] = useState(false)


  useEffect(() => {
    // Load content from localStorage on mount
    loadContentFromLocalStorage().catch(console.error)
    
    // Expose function to window so HTML button can call it
    window.openFAQModal = () => setIsFAQOpen(true)
    
    // Check URL parameters for admin mode
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === 'true') {
      // Only check authentication from localStorage when in admin mode
      const isAuth = localStorage.getItem('adminAuthenticated') === 'true'
      console.log('Admin mode detected, checking auth from localStorage:', isAuth)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setIsAdminAuthenticated(isAuth) // Initialization from localStorage
      setShowAdminButton(true)
      console.log('Admin mode detected, showing gear icon')
    } else {
      // Clear any previous authentication when not in admin mode
      localStorage.removeItem('adminAuthenticated')
      console.log('Normal mode - cleared any previous authentication')
    }
    
    // Trigger hero animations
    const triggerAnimations = () => {
      document.querySelectorAll('.hero [data-anim]').forEach(el => {
        if (!el.hasAttribute('data-io')) el.classList.add('is-in');
      });
    }
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(triggerAnimations)
    
    // Fallback for slower loads
    const timeoutId = setTimeout(triggerAnimations, 250)
    
    // Listen for admin access
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsAdminAuthenticated(false)
        setShowAdminModal(false)
        localStorage.removeItem('adminAuthenticated')
        console.log('Admin authentication cleared')
      }
    }
    
    window.addEventListener('keydown', handleKeydown)
    
    return () => {
      delete window.openFAQModal
      window.removeEventListener('keydown', handleKeydown)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <>
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />

      {/* Admin Access Button - Show only when ?admin=true in URL */}
      {showAdminButton && (
        <button
          className="admin-access-btn"
          onClick={() => setShowAdminModal(true)}
          title="Click to access admin panel"
        >
          ⚙️
        </button>
      )}

      {/* Admin Panel - Show if authenticated */}
      {isAdminAuthenticated && <AdminPanel />}

      {/* Admin Login Modal - Show if trying to access but not authenticated */}
      {showAdminModal && !isAdminAuthenticated && (
        <div className="admin-modal-overlay">
          <AdminLogin onLogin={() => {
            setIsAdminAuthenticated(true)
            localStorage.setItem('adminAuthenticated', 'true')
            setShowAdminModal(false)
          }} />
        </div>
      )}
    </>
  )
}

declare global {
  interface Window {
    openFAQModal?: () => void
  }
}

export default App
