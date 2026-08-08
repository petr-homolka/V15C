import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

// Styl první: theme.js si po načtení čte vypočtené `--ds-background-100`
// z DOM, místo aby hex duplikoval (pwa/README.md).
import './app.css'
import './theme.js'

// KtUI (MIT, Keenthemes) — komponenty, které potřebují chování: nabídka
// v liště a hlášky. Inicializuje se jednou po vykreslení; komponenty, které
// vzniknou později, si init volají samy (`KTDropdown.init()`).
import { KTComponents } from '@keenthemes/ktui'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

KTComponents.init()
