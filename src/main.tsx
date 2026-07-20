import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WebsiteProvider } from './context/WebsiteContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebsiteProvider>
      <App />
    </WebsiteProvider>
  </StrictMode>,
)
