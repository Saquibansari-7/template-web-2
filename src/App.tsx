import { useState, useEffect, useMemo } from 'react'
import FAQModal from './FAQModal'
import AdminPanel from './AdminPanel'
import AdminLogin from './AdminLogin'
import { loadContent } from './services/loadContent'
import { syncContentToDOM } from './utils/contentSync'
import { useWebsiteContext } from './context/WebsiteContext'
import './App.css'

function App() {
  const { content } = useWebsiteContext();
  const [isFAQOpen, setIsFAQOpen] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  const openAdmin = window.location.pathname === '/admin' || window.location.pathname.endsWith('/admin')
  const showAdminModal = useMemo(() => openAdmin, [openAdmin])

  useEffect(() => {
    if (!openAdmin) {
      localStorage.removeItem('adminAuthenticated')
    }

    window.openFAQModal = () => setIsFAQOpen(true)

    const siteId = new URLSearchParams(window.location.search).get('site') || 'default'
    
    loadContent(siteId)
      .then((data) => {
        if (data) {
          syncContentToDOM(data);
        }
      })
      .catch(console.error);

    const triggerAnimations = () => {
      document.querySelectorAll('.hero [data-anim]').forEach(el => {
        if (!el.hasAttribute('data-io')) el.classList.add('is-in');
      });
    }

    requestAnimationFrame(triggerAnimations)

    const timeoutId = setTimeout(triggerAnimations, 250)

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsAdminAuthenticated(false)
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
  }, [openAdmin])

  return (
    <>
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} items={content.faq.items || []} />

      {/* Admin Panel - Show if authenticated */}
      {isAdminAuthenticated && <AdminPanel />}

      {/* Admin Login Modal - Show if trying to access but not authenticated */}
      {showAdminModal && !isAdminAuthenticated && (
        <div className="admin-modal-overlay">
          <AdminLogin onLogin={() => {
            setIsAdminAuthenticated(true)
            localStorage.setItem('adminAuthenticated', 'true')
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