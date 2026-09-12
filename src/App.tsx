import { useState, useEffect, useMemo, useRef } from 'react'
import FAQModal from './FAQModal'
import AdminPanel from './AdminPanel'
import AdminLogin from './AdminLogin'
import { loadContent, loadContentByCustomer } from './services/loadContent'
import { syncContentToDOM } from './utils/contentSync'
import { useWebsiteContext } from './context/WebsiteContext'
import './App.css'

function App() {
  const { content } = useWebsiteContext();
  const [isFAQOpen, setIsFAQOpen] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const hasLoadedRef = useRef(false);
  const defaultContentRef = useRef(content);

  const openAdmin = window.location.pathname === '/admin' || window.location.pathname.endsWith('/admin')
  const showAdminModal = useMemo(() => openAdmin, [openAdmin])

  useEffect(() => {
    if (!openAdmin) {
      localStorage.removeItem('adminAuthenticated')
    }

    window.openFAQModal = () => setIsFAQOpen(true)

    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const customer = params.get('customer');

    const loadAndSync = async () => {
      if (customer && customer.trim()) {
        try {
          const result = await loadContentByCustomer(customer.trim(), defaultContentRef.current as unknown as Record<string, unknown>);
          if (result) {
            syncContentToDOM(result.content as Parameters<typeof syncContentToDOM>[0]);
          }
        } catch (err) {
          console.error('[App] customer load failed:', err);
        }
      } else {
        const siteId = new URLSearchParams(window.location.search).get('site') || 'default'
        try {
          const data = await loadContent(siteId);
          if (data) {
            syncContentToDOM(data);
          }
        } catch (err) {
          console.error('[App] loadContent failed:', err);
        }
      }
    };

    loadAndSync();

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

export default App