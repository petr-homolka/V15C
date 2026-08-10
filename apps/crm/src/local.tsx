/**
 * Co v kostře vzniklo za běhu — schůzka zapsaná přes Eli, odškrtnutý úkol.
 *
 * Žije jen v paměti záložky. Kostra do databáze nezapisuje; tenhle modul je
 * to jediné místo, kde se to děje, takže výměna za skutečný zápis bude
 * výměna čtyř funkcí.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { EventRow } from './demo/data'

interface LocalState {
  events: EventRow[]
  addEvent: (e: EventRow) => void
  removeEvent: (id: string) => void
  doneTasks: Set<string>
  toggleTask: (id: string) => void
}

const Ctx = createContext<LocalState | null>(null)

export function LocalProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventRow[]>([])
  const [doneTasks, setDone] = useState<Set<string>>(new Set())

  const value = useMemo<LocalState>(
    () => ({
      events,
      addEvent: (e) => setEvents((prev) => [...prev, e]),
      removeEvent: (id) => setEvents((prev) => prev.filter((x) => x.id !== id)),
      doneTasks,
      toggleTask: (id) =>
        setDone((prev) => {
          const next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        }),
    }),
    [events, doneTasks],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLocal(): LocalState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLocal mimo LocalProvider')
  return ctx
}
