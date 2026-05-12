import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'

// Snippet 11: Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('NutriLens: Ecosystem synchronization active.', reg))
      .catch(err => console.error('Metabolic Sync Connection Failed:', err));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Snippet 20: Wrap in Error Boundary */}
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
