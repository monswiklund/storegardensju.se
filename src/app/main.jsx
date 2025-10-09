import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ThemeProvider from './providers/ThemeProvider.jsx'
import ScrollProvider from './providers/ScrollProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ScrollProvider>
        <App />
      </ScrollProvider>
    </ThemeProvider>
  </StrictMode>,
)
