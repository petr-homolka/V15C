import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

// Styl první: theme.js si po načtení čte vypočtené `--ds-background-100`
// z DOM, místo aby hex duplikoval (pwa/README.md).
import './app.css'
import './theme.js'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
