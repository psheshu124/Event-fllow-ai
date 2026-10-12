import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { isFirebaseConfigured } from './firebase'

// Firebase initialization status check
if (isFirebaseConfigured) {
  console.log('[Firebase] Modular SDK initialized successfully.');
} else {
  console.info('[Firebase] Modular SDK prepared. Ready for web app configuration.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
