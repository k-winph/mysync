import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { FeedbackProvider } from './components/ui/Feedback'
import { CelebrationProvider } from './components/Celebration'
import './index.css'

// `basename` must match `base` in vite.config.js so routing works on GitHub Pages.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename="/mysync/">
        <FeedbackProvider>
          <CelebrationProvider>
            <App />
          </CelebrationProvider>
        </FeedbackProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
