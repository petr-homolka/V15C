/**
 * Směrování přes hash. Žádná knihovna — pár cest a tlačítko zpět v prohlížeči
 * fungují, takže router by teď byl závislost navíc bez užitku.
 */

import { useEffect, useState } from 'react'
import * as data from './demo/data'
import { PersonaProvider, usePersona } from './persona'
import { Agenda } from './screens/agenda'
import { AgreementDetail } from './screens/agreement'
import { Home } from './screens/home'
import { Switcher } from './screens/switcher'

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
      <Router />
    </PersonaProvider>
  )
}

function Router() {
  const [route, go] = useRoute()
  const { persona } = usePersona()
  // Pracovník začíná v agendě, ne v seznamu rodin — den se řídí tím, co je
  // dnes, ne abecedou (prototyp V10G).
  const worker = persona.role === 'key_worker' || persona.role === 'management'

  let screen = worker ? <Agenda go={go} /> : <Home go={go} />
  if (route === '/prepnout') screen = <Switcher go={go} />
  else if (route === '/rodiny') screen = <Home go={go} />
  else if (route.startsWith('/dohoda/')) {
    screen = <AgreementDetail id={route.slice('/dohoda/'.length)} go={go} />
  } else if (route.startsWith('/spis/')) {
    // Úkoly a schůzky ukazují na spis; obrazovka je karta dohody.
    const agreement = persona.organizationId
      ? data.agreementOfCaseFile(persona.organizationId, route.slice('/spis/'.length))
      : null
    screen = <AgreementDetail id={agreement?.id ?? ''} go={go} />
  }

  return (
    <>
      {screen}
      {worker && route !== '/prepnout' ? <TabBar route={route} go={go} /> : null}
    </>
  )
}

/** Spodní lišta: v terénu se ovládá palcem, ne horním rohem. */
function TabBar({ route, go }: { route: string; go: (r: string) => void }) {
  const tabs: Array<[string, string]> = [
    ['/', 'Agenda'],
    ['/rodiny', 'Rodiny'],
    ['/prepnout', 'Pohled'],
  ]
  return (
    <nav className="app-bar sticky bottom-0 z-10 mx-auto w-full max-w-2xl border-t border-[var(--ds-gray-alpha-400)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {tabs.map(([path, label]) => {
          const active = path === '/' ? route === '/' : route.startsWith(path)
          return (
            <button
              key={path}
              type="button"
              onClick={() => go(path)}
              className={`text-button-14 flex-1 py-3 ${
                active ? 'text-[var(--ds-gray-1000)]' : 'text-[var(--ds-gray-900)]'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
