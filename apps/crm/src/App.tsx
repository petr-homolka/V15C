/**
 * Skořápka aplikace: čtyři záložky dole, směrování přes hash.
 *
 * Pořadí záložek je záměrné — **Eli první.** Chat je ústřední nástroj, ne
 * odkládací pomocník (dok. 15).
 */

import { useEffect, useState } from 'react'
import * as data from './demo/data'
import { LocalProvider } from './local'
import { PersonaProvider, usePersona } from './persona'
import { Dnes } from './screens/dnes'
import { Eli } from './screens/eli'
import { Ja } from './screens/ja'
import { Rodina } from './screens/rodina'
import { Rodiny } from './screens/rodiny'

function useRoute(): [string, (r: string) => void] {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || '/')
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.slice(1) || '/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return [route, (r) => { window.location.hash = r }]
}

export function App() {
  return (
    <PersonaProvider>
      <LocalProvider>
        <Router />
      </LocalProvider>
    </PersonaProvider>
  )
}

const TABS: Array<[string, string, string]> = [
  ['/', 'Eli', 'M12 3c5 0 9 3.6 9 8s-4 8-9 8a10 10 0 0 1-2.6-.3L4 21l1.3-3.4A7.5 7.5 0 0 1 3 11c0-4.4 4-8 9-8Z'],
  ['/dnes', 'Dnes', 'M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z'],
  ['/rodiny', 'Rodiny', 'M4 20v-6l8-6 8 6v6M9 20v-5h6v5'],
  ['/ja', 'Pohled', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0'],
]

function Router() {
  const [route, go] = useRoute()
  const { persona } = usePersona()

  let screen = <Eli go={go} />
  if (route === '/dnes') screen = <Dnes go={go} />
  else if (route === '/rodiny') screen = <Rodiny go={go} />
  else if (route === '/ja') screen = <Ja go={go} />
  else if (route.startsWith('/rodina/')) {
    screen = <Rodina id={route.slice('/rodina/'.length)} go={go} />
  } else if (route.startsWith('/spis/')) {
    // Schůzky a úkoly odkazují na spis; obrazovka je karta rodiny.
    const agreement = persona.organizationId
      ? data.agreementOfCaseFile(persona.organizationId, route.slice('/spis/'.length))
      : null
    screen = <Rodina id={agreement?.id ?? ''} go={go} />
  }

  return (
    <div className="min-h-full bg-[var(--ds-background-200)]">
      {screen}
      <TabBar route={route} go={go} />
    </div>
  )
}

/** Dole, aby to šlo ovládat palcem. Ikona a slovo, jak je na mobilu zvykem. */
function TabBar({ route, go }: { route: string; go: (r: string) => void }) {
  const active = (path: string) =>
    path === '/' ? route === '/' : route.startsWith(path) || (path === '/rodiny' && route.startsWith('/rodina'))

  return (
    <nav className="app-bar fixed inset-x-0 bottom-0 z-30 border-t border-[var(--ds-gray-alpha-400)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-2xl">
        {TABS.map(([path, label, d]) => (
          <button
            key={path}
            type="button"
            onClick={() => go(path)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 ${
              active(path) ? 'text-[var(--ds-gray-1000)]' : 'text-[var(--ds-gray-700)]'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={d} />
            </svg>
            <span className="text-label-12">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
