/**
 * Směrování přes hash. Žádná knihovna — tři cesty a zpět v prohlížeči
 * fungují, takže router by teď byl závislost navíc bez užitku.
 */

import { useEffect, useState } from 'react'
import { PersonaProvider } from './persona'
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
  const [route, go] = useRoute()

  let screen = <Home go={go} />
  if (route === '/prepnout') screen = <Switcher go={go} />
  else if (route.startsWith('/dohoda/')) {
    screen = <AgreementDetail id={route.slice('/dohoda/'.length)} go={go} />
  }

  return <PersonaProvider>{screen}</PersonaProvider>
}
