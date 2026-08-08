/**
 * Skořápka aplikace — podle rozvržení „true black sidebar" (Luminaux).
 *
 * ┌───────────────────────────────────────────────────────────────────┐
 * │ PANEL JE DVOUSLOUPCOVÝ                                            │
 * │                                                                   │
 * │  ┌──┬──────────┬──────────────────────────────────────────────┐   │
 * │  │▣ │ Přehled  │ horní lišta: hledání, zvonek, uživatel       │   │
 * │  │▣ │ Dnes     ├──────────────────────────────────────────────┤   │
 * │  │▣ │ Dohody   │ tenký pruh: drobečky                         │   │
 * │  │▣ │ …        ├──────────────────────────────────────────────┤   │
 * │  │▣ │          │ obsah stránky                                │   │
 * │  └──┴──────────┴──────────────────────────────────────────────┘   │
 * │                                                                   │
 * │ **Lišta (4 rem)** drží oblasti — pět ikon, nic víc. **Sloupec**   │
 * │ (13 rem) ukazuje navigaci té jedné oblasti. Přepnutí oblasti je   │
 * │ jedno kliknutí a nemění přitom celý seznam pod rukou.             │
 * │                                                                   │
 * │ Panel je černý v obou režimech — třídou `dark` se uvnitř přepnou  │
 * │ tokeny Geistu na tmavé hodnoty, takže nepřibyl žádný hex.         │
 * └───────────────────────────────────────────────────────────────────┘
 */

import { KTDropdown, KTToast } from '@keenthemes/ktui'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as data from './demo/data'
import { Face, type FaceKind } from './face'
import * as L from './labels'
import { usePersona } from './persona'
import { Chevron, Chip, daysUntil, dueBadge, type Tone } from './ui'

export type Segment = 'dohody' | 'pestouni' | 'deti' | 'tym'

export const SEGMENTS: Array<[Segment, string]> = [
  ['dohody', 'Dohody'],
  ['pestouni', 'Pěstouni'],
  ['deti', 'Děti'],
  ['tym', 'Tým'],
]

export const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/* --- oblasti v liště ------------------------------------------------------ */

type Area = 'eli' | 'prehled' | 'agenda' | 'lide' | 'nastaveni'

const AREAS: Array<{ key: Area; label: string; icon: string }> = [
  { key: 'eli', label: 'Eli', icon: 'M21 12a8 8 0 0 1-8 8 9 9 0 0 1-2.6-.4L5 21l1.4-3.3A8 8 0 1 1 21 12Z' },
  { key: 'prehled', label: 'Přehled', icon: 'M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-4H4v4Z' },
  { key: 'agenda', label: 'Agenda', icon: 'M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z' },
  { key: 'lide', label: 'Lidé', icon: 'M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-1.5a4 4 0 0 0-3-3.9M16.5 3.6a4 4 0 0 1 0 7.7' },
  { key: 'nastaveni', label: 'Nastavení', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8.4-2.2a8 8 0 0 0 0-1.6l2-1.5-2-3.4-2.3 1a8 8 0 0 0-1.4-.8L15.9 3h-3.8l-.8 2.5c-.5.2-1 .5-1.4.8l-2.3-1-2 3.4 2 1.5a8 8 0 0 0 0 1.6l-2 1.5 2 3.4 2.3-1c.4.3.9.6 1.4.8l.8 2.5h3.8l.8-2.5c.5-.2 1-.5 1.4-.8l2.3 1 2-3.4-2-1.5Z' },
]

/** Ve které oblasti právě jsem — podle cesty, ne podle klikání. */
function areaOf(route: string): Area {
  if (route === '/' || route.startsWith('/b')) return 'eli'
  if (route === '/prehled') return 'prehled'
  if (route === '/ja') return 'nastaveni'
  if (
    route.startsWith('/seznam/pestouni') ||
    route.startsWith('/seznam/deti') ||
    route.startsWith('/seznam/tym') ||
    route.startsWith('/pestoun/') ||
    route.startsWith('/dite/') ||
    route.startsWith('/clen/')
  ) {
    return 'lide'
  }
  return 'agenda'
}

function routeOfArea(area: Area): string {
  if (area === 'eli') return '/'
  if (area === 'prehled') return '/prehled'
  if (area === 'lide') return '/seznam/pestouni'
  if (area === 'nastaveni') return '/ja'
  return '/seznam/dohody'
}

/* ------------------------------------------------------------------ */

export function Shell({
  children,
  go,
  route,
}: {
  children: ReactNode
  go: (r: string) => void
  route: string
}) {
  const [open, setOpen] = useState(false)
  const area = areaOf(route)

  return (
    <div className="flex min-h-dvh bg-[var(--ds-background-200)]">
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-[var(--ds-gray-alpha-600)] transition-opacity duration-200 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <Sidebar
        open={open}
        area={area}
        route={route}
        go={(r) => {
          setOpen(false)
          go(r)
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setOpen(true)} go={go} />
        <PageBar route={route} go={go} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

/* --- panel ---------------------------------------------------------------- */

function Sidebar({
  open,
  area,
  route,
  go,
}: {
  open: boolean
  area: Area
  route: string
  go: (r: string) => void
}) {
  return (
    <aside
      className={`dark fixed inset-y-0 left-0 z-50 flex w-[17rem] shrink-0 bg-[var(--ds-background-200)] transition-transform duration-200 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* --- lišta oblastí ------------------------------------------- */}
      <div className="flex w-16 shrink-0 flex-col items-center border-r border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-100)]">
        <div className="flex h-14 items-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ds-purple-700)]">
            <span className="text-label-14 text-white">E</span>
          </span>
        </div>
        <nav className="flex flex-1 flex-col items-center gap-1 py-2">
          {AREAS.map((a) => (
            <RailButton
              key={a.key}
              label={a.label}
              icon={a.icon}
              active={a.key === area}
              onClick={() => go(routeOfArea(a.key))}
            />
          ))}
        </nav>
      </div>

      {/* --- navigace oblasti ---------------------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center px-4">
          <span className="text-heading-16 truncate text-[var(--ds-gray-1000)]">
            {AREAS.find((a) => a.key === area)?.label}
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <AreaNav area={area} route={route} go={go} />
        </nav>
        <div className="border-t border-[var(--ds-gray-alpha-400)] p-3">
          <PersonaCard go={go} />
        </div>
      </div>
    </aside>
  )
}

function AreaNav({ area, route, go }: { area: Area; route: string; go: (r: string) => void }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId
  const count = (segment: Segment) => (orgId ? listOf(segment, orgId, persona).length : 0)

  if (area === 'eli') {
    return (
      <>
        <NavRow label="Nový dotaz" active={route === '/'} onClick={() => go('/')} />
        <NavRow label="Spis jako dokument" active={route.startsWith('/b')} onClick={() => go('/b')} />
        <NavNote>
          Eli odpovídá z dat organizace. Psaním se dá i hledat a zapisovat do kalendáře.
        </NavNote>
      </>
    )
  }

  if (area === 'prehled') {
    return (
      <>
        <NavRow label="Ukazatele" active={route === '/prehled'} onClick={() => go('/prehled')} />
        <NavRow label="Dnes" active={route === '/dnes'} onClick={() => go('/dnes')} />
      </>
    )
  }

  if (area === 'agenda') {
    return (
      <>
        <NavRow label="Dnes" active={route === '/dnes'} onClick={() => go('/dnes')} />
        <NavRow
          label="Dohody"
          badge={count('dohody')}
          active={route.startsWith('/seznam/dohody') || route.startsWith('/rodina/')}
          onClick={() => go('/seznam/dohody')}
        />
      </>
    )
  }

  if (area === 'lide') {
    return (
      <>
        <NavRow
          label="Pěstouni"
          badge={count('pestouni')}
          active={route.startsWith('/seznam/pestouni') || route.startsWith('/pestoun/')}
          onClick={() => go('/seznam/pestouni')}
        />
        <NavRow
          label="Děti"
          badge={count('deti')}
          active={route.startsWith('/seznam/deti') || route.startsWith('/dite/')}
          onClick={() => go('/seznam/deti')}
        />
        <NavRow
          label="Tým"
          badge={count('tym')}
          active={route.startsWith('/seznam/tym') || route.startsWith('/clen/')}
          onClick={() => go('/seznam/tym')}
        />
      </>
    )
  }

  return (
    <>
      <NavRow label="Pohled a vzhled" active={route === '/ja'} onClick={() => go('/ja')} />
      <NavNote>Přihlášení, číselníky a branding přibudou později (dok. 19, 20, 21).</NavNote>
    </>
  )
}

/** Ikona v liště. Popisek vyjede vedle — jinak by z ikon byla hádanka. */
function RailButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: string
  active: boolean
  onClick: () => void
}) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-current={active}
        className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
          active
            ? 'bg-[var(--ds-purple-900)] text-[var(--ds-purple-100)]'
            : 'text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-200)] hover:text-[var(--ds-gray-1000)]'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={icon} />
        </svg>
      </button>
      <span
        role="tooltip"
        className="text-label-12 pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 scale-95 whitespace-nowrap rounded-md bg-[var(--ds-gray-1000)] px-2 py-1 text-[var(--ds-background-100)] opacity-0 transition duration-150 group-hover:scale-100 group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  )
}

function NavRow({
  label,
  badge,
  active,
  onClick,
}: {
  label: string
  badge?: number
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-copy-14 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
        active
          ? 'bg-[var(--ds-gray-200)] text-[var(--ds-gray-1000)]'
          : 'text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-200)] hover:text-[var(--ds-gray-1000)]'
      }`}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge !== undefined ? (
        <span className="text-label-12 rounded-md bg-[var(--ds-gray-200)] px-1.5 py-0.5 tabular-nums text-[var(--ds-gray-900)]">
          {badge}
        </span>
      ) : null}
    </button>
  )
}

function NavNote({ children }: { children: ReactNode }) {
  return <p className="text-copy-13 px-3 pt-3 leading-relaxed text-[var(--ds-gray-700)]">{children}</p>
}

function PersonaCard({ go }: { go: (r: string) => void }) {
  const { persona } = usePersona()
  return (
    <button
      type="button"
      onClick={() => go('/ja')}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-[var(--ds-gray-200)]"
    >
      <Face uid={persona.personId ?? persona.key} name={persona.displayName} />
      <span className="min-w-0 flex-1">
        <span className="text-copy-14 block truncate text-[var(--ds-gray-1000)]">
          {persona.displayName}
        </span>
        <span className="text-label-12 block truncate text-[var(--ds-gray-700)]">
          {persona.roleLabel}
        </span>
      </span>
      <Chevron />
    </button>
  )
}

/* --- horní lišta a drobečky ----------------------------------------------- */

function TopBar({ onMenu, go }: { onMenu: () => void; go: (r: string) => void }) {
  const { persona } = usePersona()
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--ds-background-100)]/85 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="flex h-14 items-center gap-2 px-4 lg:px-6">
        <span className="lg:hidden">
          <IconButton label="Menu" onClick={onMenu}>
            <path d="M3 5h18M3 12h18M3 19h18" />
          </IconButton>
        </span>

        <button
          type="button"
          onClick={() => go('/b')}
          className="text-copy-14 flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-left text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-100)]"
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
          <span className="flex-1 truncate">Hledat rodinu nebo se zeptat Eli</span>
          <kbd className="kt-kbd hidden sm:inline-flex">⌘K</kbd>
        </button>

        <div className="ml-auto flex items-center gap-1">
          <Bell go={go} />
          <span className="text-label-13 hidden rounded-md border border-[var(--border)] px-2 py-1 text-[var(--ds-gray-900)] sm:inline-flex">
            {persona.organizationName ?? 'Systém'}
          </span>
          <PersonaMenu go={go} />
        </div>
      </div>
    </header>
  )
}

/** Tenký lepící pruh s drobečky — odděluje rám od obsahu. */
function PageBar({ route, go }: { route: string; go: (r: string) => void }) {
  const crumbs = breadcrumbs(route)
  return (
    <div className="sticky top-14 z-20 flex h-11 items-center gap-1 border-b border-[var(--border)] bg-[var(--ds-background-100)] px-4 lg:px-6">
      {crumbs.map((c, i) => (
        <span key={c.label + i} className="flex min-w-0 items-center gap-1">
          {i > 0 ? <span className="text-[var(--ds-gray-600)]">/</span> : null}
          {c.route && i < crumbs.length - 1 ? (
            <button
              type="button"
              onClick={() => go(c.route!)}
              className="text-copy-13 truncate text-[var(--muted-foreground)] hover:text-[var(--ds-gray-1000)]"
            >
              {c.label}
            </button>
          ) : (
            <span className="text-copy-13 truncate text-[var(--ds-gray-1000)]">{c.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}

function breadcrumbs(route: string): Array<{ label: string; route?: string }> {
  if (route === '/') return [{ label: 'Eli' }]
  if (route.startsWith('/b')) return [{ label: 'Eli', route: '/' }, { label: 'Spis jako dokument' }]
  if (route === '/prehled') return [{ label: 'Přehled' }]
  if (route === '/dnes') return [{ label: 'Agenda', route: '/seznam/dohody' }, { label: 'Dnes' }]
  if (route === '/ja') return [{ label: 'Nastavení' }, { label: 'Pohled a vzhled' }]
  if (route.startsWith('/seznam/')) {
    const seg = route.slice('/seznam/'.length) as Segment
    return [
      { label: seg === 'dohody' ? 'Agenda' : 'Lidé' },
      { label: SEGMENTS.find(([k]) => k === seg)?.[1] ?? 'Seznam' },
    ]
  }
  if (route.startsWith('/rodina/')) {
    return [
      { label: 'Agenda' },
      { label: 'Dohody', route: '/seznam/dohody' },
      { label: 'Karta rodiny' },
    ]
  }
  if (route.startsWith('/pestoun/')) {
    return [{ label: 'Lidé' }, { label: 'Pěstouni', route: '/seznam/pestouni' }, { label: 'Karta' }]
  }
  if (route.startsWith('/dite/')) {
    return [{ label: 'Lidé' }, { label: 'Děti', route: '/seznam/deti' }, { label: 'Karta' }]
  }
  if (route.startsWith('/clen/')) {
    return [{ label: 'Lidé' }, { label: 'Tým', route: '/seznam/tym' }, { label: 'Karta' }]
  }
  return [{ label: 'Doprovázení' }]
}

/**
 * Zvonek. Číslo je počet lhůt po termínu — jediné, co v tomhle systému
 * opravdu „přišlo" a nepočká. Notifikace se teprve navrhují (dok. 00).
 */
function Bell({ go }: { go: (r: string) => void }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId
  const mine = persona.role === 'key_worker' ? persona.personId : null
  const late = orgId
    ? data
        .obligations(orgId)
        .filter((o) => o.status === 'overdue')
        .filter((o) => {
          if (!mine) return true
          const f = data.caseFiles(orgId).find((c) => c.id === o.caseFileId)
          return f?.keyWorkerPersonId === mine
        }).length
    : 0

  return (
    <button
      type="button"
      onClick={() => go('/prehled')}
      aria-label={`Po termínu: ${late}`}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)]"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8a6 6 0 1 0-12 0c0 7-2 8-2 8h16s-2-1-2-8M10.3 20a2 2 0 0 0 3.4 0" />
      </svg>
      {late > 0 ? (
        <span className="text-label-12 absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ds-red-700)] px-1 text-white">
          {late}
        </span>
      ) : null}
    </button>
  )
}

/** Nabídka pohledu. Vysouvání obstarává KtUI, potvrzení hláška. */
function PersonaMenu({ go }: { go: (r: string) => void }) {
  const { personas, persona, setPersona } = usePersona()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    KTDropdown.init()
  }, [])

  const pick = (key: string, name: string, role: string) => {
    setPersona(key)
    KTDropdown.getInstance(ref.current!)?.hide()
    KTToast.show({
      message: `Pohled: ${name} — ${role}`,
      variant: 'primary',
      position: 'bottom-center',
      duration: 2500,
    })
    go('/')
  }

  return (
    <div ref={ref} data-kt-dropdown="true" data-kt-dropdown-trigger="click">
      <button
        type="button"
        data-kt-dropdown-toggle="true"
        aria-label="Pohled"
        className="flex items-center gap-2 rounded-lg p-1 hover:bg-[var(--ds-gray-100)]"
      >
        <Face uid={persona.personId ?? persona.key} name={persona.displayName} />
        <span className="text-copy-14 hidden text-[var(--ds-gray-1000)] md:block">
          {persona.displayName}
        </span>
        <Chevron />
      </button>

      <div className="kt-dropdown hidden w-72 p-2" data-kt-dropdown-menu="true">
        <div className="kt-dropdown-header">Přepnout pohled</div>
        {personas.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => pick(p.key, p.displayName, p.roleLabel)}
            data-kt-dropdown-item="true"
            className="kt-dropdown-menu-link w-full"
          >
            <Face uid={p.personId ?? p.key} name={p.displayName} />
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate">{p.displayName}</span>
              <span className="text-label-12 block truncate text-[var(--muted-foreground)]">
                {p.roleLabel}
                {p.organizationName ? ` · ${p.organizationName}` : ''}
              </span>
            </span>
            {p.key === persona.key ? <Chip tone="purple">teď</Chip> : null}
          </button>
        ))}
        <div className="kt-dropdown-menu-separator" />
        <button
          type="button"
          onClick={() => go('/ja')}
          data-kt-dropdown-item="true"
          className="kt-dropdown-menu-link w-full"
        >
          Nastavení pohledu
        </button>
      </div>
    </div>
  )
}

export function IconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)]"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  )
}

/* --- data pro seznamy ----------------------------------------------------- */

export interface Item {
  uid: string
  kind: FaceKind
  name: string
  town: string | null
  note: string | null
  extra: string | null
  dueOn: string | null
  alert: { text: string; tone: Tone } | null
  route: string
}

function alertOf(dueOn: string | null): Item['alert'] {
  if (!dueOn) return null
  const d = daysUntil(dueOn)
  if (d < 0) return { text: dueBadge(dueOn), tone: 'red' }
  if (d <= 14) return { text: dueBadge(dueOn), tone: 'amber' }
  return null
}

export const age = (birthDate: string): number =>
  Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 86_400_000))

/** Jeden zdroj pravdy pro navigaci i pro tabulku. */
export function listOf(
  segment: Segment,
  orgId: string | null,
  persona: ReturnType<typeof usePersona>['persona'],
): Item[] {
  if (!orgId) return []

  const mineOnly = persona.role === 'key_worker'
  const agreements = mineOnly
    ? data.agreementsOfKeyWorker(orgId, persona.personId!)
    : data.agreements(orgId)

  if (segment === 'dohody') {
    return agreements.map((a) => ({
      uid: a.id,
      kind: 'family' as const,
      name: a.naming.displayName,
      town: data.townOfAgreement(orgId, a.id),
      note: L.custodyBasis(a.custodyBasis),
      extra: data.caseFileOfAgreement(orgId, a.id)?.keyWorkerDisplayName ?? null,
      dueOn: data.nextDueOfAgreement(orgId, a.id)?.dueOn ?? a.nextObligationDueOn,
      alert:
        a.status === 'active'
          ? alertOf(data.nextDueOfAgreement(orgId, a.id)?.dueOn ?? a.nextObligationDueOn)
          : { text: L.agreementStatus(a.status), tone: 'neutral' as const },
      route: `/rodina/${a.id}`,
    }))
  }

  if (segment === 'pestouni') {
    const out: Item[] = []
    for (const a of agreements) {
      for (const pid of a.carerPersonIds) {
        const p = data.person(orgId, pid)
        if (!p) continue
        const due = data
          .obligationsOfAgreement(orgId, a.id)
          .find((o) => o.personId === pid && o.status !== 'met')
        out.push({
          uid: pid,
          kind: 'person',
          name: p.displayName,
          town: data.townOfPerson(orgId, pid),
          note: L.carerKind(a.carerKind),
          extra: a.naming.displayName,
          dueOn: due?.dueOn ?? null,
          alert: alertOf(due?.dueOn ?? null),
          route: `/pestoun/${pid}`,
        })
      }
    }
    return out.sort((x, y) => x.name.localeCompare(y.name, 'cs'))
  }

  if (segment === 'deti') {
    const out: Item[] = []
    for (const a of agreements) {
      for (const c of data.childrenOfAgreement(orgId, a.id)) {
        const due = data
          .obligationsOfAgreement(orgId, a.id)
          .find((o) => o.childId === c.id && o.status !== 'met')
        out.push({
          uid: c.id,
          kind: 'child',
          name: c.displayName,
          town: data.townOfChild(orgId, c.id),
          note: `${age(c.birthDate)} let`,
          extra: a.naming.displayName,
          dueOn: due?.dueOn ?? null,
          alert: c.careEndedOn
            ? { text: 'péče ukončena', tone: 'neutral' }
            : alertOf(due?.dueOn ?? null),
          route: `/dite/${c.id}`,
        })
      }
    }
    return out.sort((x, y) => x.name.localeCompare(y.name, 'cs'))
  }

  return data
    .members(orgId)
    .filter((m) => m.status === 'active')
    .map((m) => {
      const p = data.person(orgId, m.personId)
      const files = data.caseFiles(orgId).filter((c) => c.keyWorkerPersonId === m.personId).length
      return {
        uid: m.personId,
        kind: 'person' as const,
        name: p?.displayName ?? m.personId,
        town: data.townOfPerson(orgId, m.personId),
        note: L.memberRole(m.role),
        extra: files > 0 ? `${files} dohod` : null,
        dueOn: null,
        alert: null,
        route: `/clen/${m.personId}`,
      }
    })
}
