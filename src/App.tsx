import { useState, useEffect, useRef } from 'react'
import FAQModal from './FAQModal'
import AdminPanel from './AdminPanel'
import AdminLogin from './AdminLogin'
import { useWebsiteContext } from './context/WebsiteContext'
import './App.css'

declare global {
  interface Window {
    openFAQModal?: () => void
  }
}

const ADMIN_API_URL = 'https://weddappvows.vercel.app'
const EXPECTED_ADMIN_TEMPLATE_ID = 'editorial'
const ADMIN_SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/

async function validateAdminCustomer(customer: string): Promise<boolean> {
  const trimmed = (customer || '').toLowerCase().trim()
  if (!trimmed || !ADMIN_SUBDOMAIN_REGEX.test(trimmed)) {
    if (!import.meta.env.DEV) {
      window.location.href = `${ADMIN_API_URL}/dashboard?error=invalid_customer`
    }
    return false
  }

  // In dev, allow any customer so local testing works without the API
  if (import.meta.env.DEV) {
    return true
  }

  try {
    const res = await fetch(`${ADMIN_API_URL}/api/site/lookup?customer=${encodeURIComponent(trimmed)}`)
    if (!res.ok) {
      window.location.href = `${ADMIN_API_URL}/dashboard?error=site_not_found`
      return false
    }
    const siteData = await res.json()
    if (siteData.template_id !== EXPECTED_ADMIN_TEMPLATE_ID) {
      window.location.href = `${ADMIN_API_URL}/dashboard?error=wrong_template`
      return false
    }
    if (siteData.status !== 'active') {
      window.location.href = `${ADMIN_API_URL}/dashboard?error=site_inactive`
      return false
    }
    return true
  } catch {
    window.location.href = `${ADMIN_API_URL}/dashboard?error=validation_failed`
    return false
  }
}

function App() {
  const { content, site, loading } = useWebsiteContext();
  const [isFAQOpen, setIsFAQOpen] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [isCustomerValid, setIsCustomerValid] = useState(false)
  const hasLoadedRef = useRef(false);

  const customer = new URLSearchParams(window.location.search).get('customer');
  const showNotFound = !loading && customer && customer.trim() && !site;

  const openAdmin = window.location.pathname === '/admin' || window.location.pathname.endsWith('/admin')

  useEffect(() => {
    if (!openAdmin) return;

    async function validate() {
      const params = new URLSearchParams(window.location.search);
      const customerParam = params.get('customer');
      const isValid = await validateAdminCustomer(customerParam || '');
      setIsCustomerValid(isValid);
    }

    validate();
  }, [openAdmin]);

  useEffect(() => {
    if (!openAdmin) {
      localStorage.removeItem('adminAuthenticated')
    }

    window.openFAQModal = () => setIsFAQOpen(true)

    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

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

  useEffect(() => {
    if (showNotFound && !import.meta.env.DEV) {
      window.location.href = `${ADMIN_API_URL}/dashboard?error=site_not_found`
    }
  }, [showNotFound])

  if (showNotFound && import.meta.env.DEV) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EAD1D6', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: 'center', color: '#C21F0C' }}>
          <h1 style={{ fontSize: '80px', fontFamily: "'DM Serif Display', serif", margin: 0 }}>404</h1>
          <p style={{ fontSize: '18px', marginTop: '16px' }}>This wedding site could not be found.</p>
          <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>Dev mode: would redirect to dashboard in production.</p>
        </div>
      </div>
    )
  }

  if (showNotFound && !import.meta.env.DEV) {
    return null
  }

  return (
    <>
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} items={content.faq.items || []} />

      {openAdmin && isCustomerValid && isAdminAuthenticated && <AdminPanel />}

      {openAdmin && isCustomerValid && !isAdminAuthenticated && (
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
