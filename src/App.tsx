import { useState, useEffect, useMemo, useRef } from 'react'
import FAQModal from './FAQModal'
import AdminPanel from './AdminPanel'
import AdminLogin from './AdminLogin'
import { loadContent, loadContentByCustomer } from './services/loadContent'
import { syncContentToDOM } from './utils/contentSync'
import { useWebsiteContext } from './context/WebsiteContext'
import { WebsiteContent } from './context/WebsiteContext'
import './App.css'

declare global {
  interface Window {
    openFAQModal?: () => void
  }
}

function App() {
  const { content, site, loading } = useWebsiteContext();
  const [isFAQOpen, setIsFAQOpen] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const hasLoadedRef = useRef(false);
  const defaultContentRef = useRef<WebsiteContent>(content as WebsiteContent);

  const customer = new URLSearchParams(window.location.search).get('customer');
  const showNotFound = !loading && customer && customer.trim() && !site;

  const openAdmin = window.location.pathname === '/admin' || window.location.pathname.endsWith('/admin')
  const showAdminModal = useMemo(() => openAdmin, [openAdmin])

  useEffect(() => {
    if (!openAdmin) return;
    if (isAdminAuthenticated) return;

    const customerParam = new URLSearchParams(window.location.search).get('customer')?.toLowerCase().trim();
    const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;
    const EXPECTED_TEMPLATE_ID = 'editorial';

    if (!customerParam || !SUBDOMAIN_REGEX.test(customerParam)) {
      window.location.href = 'https://weddappvows.vercel.app/dashboard?error=invalid_customer';
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch(`https://weddappvows.vercel.app/api/site/lookup?customer=${encodeURIComponent(customerParam)}`);
        if (!res.ok) {
          window.location.href = 'https://weddappvows.vercel.app/dashboard?error=site_not_found';
          return;
        }
        const siteData = await res.json();
        if (siteData.template_id !== EXPECTED_TEMPLATE_ID) {
          window.location.href = 'https://weddappvows.vercel.app/dashboard?error=wrong_template';
          return;
        }
        if (siteData.status !== 'active') {
          window.location.href = 'https://weddappvows.vercel.app/dashboard?error=site_inactive';
          return;
        }
      } catch {
        window.location.href = 'https://weddappvows.vercel.app/dashboard?error=validation_failed';
      }
    };

    validate();
  }, [openAdmin, isAdminAuthenticated]);

  useEffect(() => {
    if (!openAdmin) {
      localStorage.removeItem('adminAuthenticated')
    }

    window.openFAQModal = () => setIsFAQOpen(true)

    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const customerParam = params.get('customer');

    const loadAndSync = async () => {
      if (customerParam && customerParam.trim()) {
        try {
          const result = await loadContentByCustomer(customerParam.trim(), defaultContentRef.current as unknown as Record<string, unknown>);
          if (result) {
            syncContentToDOM(result.content as unknown as WebsiteContent);
          }
        } catch (err) {
          console.error('[App] customer load failed:', err);
        }
      } else {
        const siteId = new URLSearchParams(window.location.search).get('site') || 'emma-jordan'
        try {
          const data = await loadContent(siteId);
          if (data) {
            syncContentToDOM(data as unknown as WebsiteContent);
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

  if (showNotFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EAD1D6', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: 'center', color: '#C21F0C' }}>
          <h1 style={{ fontSize: '80px', fontFamily: "'DM Serif Display', serif", margin: 0 }}>404</h1>
          <p style={{ fontSize: '18px', marginTop: '16px' }}>This wedding site could not be found.</p>
          <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>Please check the URL or contact the couple.</p>
        </div>
      </div>
    );
  }

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
