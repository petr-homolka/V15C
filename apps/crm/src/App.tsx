/**
 * Směrování přes hash. Obrazovky sedí v `Shell`, který drží horní lištu
 * a vysouvací menu.
 */

import { useEffect, useState } from 'react'
import * as data from './demo/data'
import { LocalProvider } from './local'
import { PersonaProvider, usePersona } from './persona'
import { Shell } from './shell'
import { Clen } from './screens/clen'
import { Dnes } from './screens/dnes'
import { Eli } from './screens/eli'
import { Ja } from './screens/ja'
import { Rodina } from './screens/rodina'

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

function Router() {
  const [route, go] = useRoute()
  const { persona } = usePersona()

  let screen = <Eli go={go} />
  if (route === '/dnes') screen = <Dnes go={go} />
  else if (route === '/ja') screen = <Ja go={go} />
  else if (route.startsWith('/rodina/')) {
    screen = <Rodina id={route.slice('/rodina/'.length)} go={go} />
  } else if (route.startsWith('/clen/')) {
    screen = <Clen id={route.slice('/clen/'.length)} go={go} />
  } else if (route.startsWith('/spis/')) {
    // Schůzky a úkoly odkazují na spis; obrazovka je karta rodiny.
    const agreement = persona.organizationId
      ? data.agreementOfCaseFile(persona.organizationId, route.slice('/spis/'.length))
      : null
    screen = <Rodina id={agreement?.id ?? ''} go={go} />
  }

  return (
    <Shell go={go} route={route}>
      {screen}
    </Shell>
  )
}
