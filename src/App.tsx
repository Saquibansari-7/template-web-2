import { useState, useEffect } from 'react'
import FAQModal from './FAQModal'
import AdminPanel from './AdminPanel'
import AdminLogin from './AdminLogin'

import { loadContentFromLocalStorage } from './utils/contentSync'
import { loadContent } from './services/loadContent'
import { syncContentToDOM } from './utils/contentSync'
import './App.css'

function App() {
  const [isFAQOpen, setIsFAQOpen] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)

  const siteId = new URLSearchParams(window.location.search).get('site')
  const openAdmin = new URLSearchParams(window.location.search).has('admin')


  useEffect(() => {
    // Load content from localStorage on mount (existing behavior)
    loadContentFromLocalStorage().catch(console.error)

    // Load content from Supabase if a site id is present
    if (siteId) {
      loadContent(siteId)
        .then((data) => {
          if (data) {
            syncContentToDOM(data);
          }
        })
        .catch(console.error);
    }

    // Expose function to window so HTML button can call it
    window.openFAQModal = () => setIsFAQOpen(true)

    // Open admin panel directly when ?admin is present in the URL
    if (openAdmin) {
      setShowAdminModal(true)
    } else {
      localStorage.removeItem('adminAuthenticated')
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
