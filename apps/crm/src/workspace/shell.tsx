/**
 * Skořápka rozvržení B.
 *
 * Nahoře je jen to nezbytné: značka, **hledání přes celou šířku** a poslední
 * otevřené spisy. Žádné menu — cesta k věcem vede psaním (`omnibar.tsx`).
 *
 * Naposledy otevřené si aplikace pamatuje, protože Klíčová osoba se během
 * dopoledne vrací ke třem rodinám dokola; bez toho by musela pokaždé psát
 * znovu.
 */

import { useEffect, useState, type ReactNode } from 'react'
import * as data from '../demo/data'
import { Face } from '../face'
import { usePersona } from '../persona'
import { Omnibar } from './omnibar'

const RECENT_KEY = 'v15c.recent'

export function WorkspaceShell({
  children,
  go,
  route,
}: {
  children: ReactNode
  go: (r: string) => void
  route: string
}) {
  const { persona } = usePersona()
  const orgId = persona.organizationId
  const [open, setOpen] = useState(false)
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[]
    } catch {
      return []
    }
  })

  // Ctrl/⌘ + K otevírá hledání odkudkoli — v aplikaci bez menu je to hlavní
  // způsob, jak se někam dostat, tak musí být pod rukou.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Zapamatovat si otevřený spis.
  useEffect(() => {
    if (!route.startsWith('/b/spis/')) return
    const id = route.slice('/b/spis/'.length)
    if (!id) return
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 6)
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      return next
    })
  }, [route])

  const current = route.startsWith('/b/spis/') ? route.slice('/b/spis/'.length) : null

  return (
    <div className="min-h-full bg-[var(--ds-background-100)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--ds-background-100)]/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => go('/b')}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--ds-purple-700)]"
            aria-label="Domů"
          >
            <span className="text-label-13 text-white">E</span>
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-copy-14 flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-left text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-100)]"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <span className="truncate">Hledat rodinu nebo se zeptat Eli</span>
            <kbd className="kt-kbd ms-auto hidden sm:inline-flex">⌘K</kbd>
          </button>

          <button type="button" onClick={() => go('/ja')} aria-label="Pohled" className="shrink-0">
            <Face uid={persona.personId ?? persona.key} name={persona.displayName} />
          </button>
        </div>

        {/* Poslední otevřené — jediná trvalá navigace, jakou tohle rozvržení má. */}
        {recent.length > 0 && orgId ? (
          <div className="mx-auto flex w-full max-w-6xl gap-1.5 overflow-x-auto px-4 pb-2 sm:px-6">
            {recent.map((id) => {
              const a = data.agreements(orgId).find((x) => x.id === id)
              if (!a) return null
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => go(`/b/spis/${id}`)}
                  className={`text-label-13 flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 ${
                    id === current
                      ? 'border-[var(--ds-purple-400)] bg-[var(--ds-purple-100)] text-[var(--ds-purple-900)]'
                      : 'border-[var(--border)] text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)]'
                  }`}
                >
                  <Face uid={id} kind="family" name={a.naming.displayName} />
                  <span className="max-w-[10rem] truncate">{a.naming.displayName}</span>
                </button>
              )
            })}
          </div>
        ) : null}
      </header>

      {children}

      <Omnibar open={open} onClose={() => setOpen(false)} go={go} />
    </div>
  )
}
