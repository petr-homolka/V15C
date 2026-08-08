/**
 * Skořápka: postranní panel a horní lišta.
 *
 * Panel je **navigace, ne obsah**. Nese přepínač čtyř oblastí, hledání a
 * krátký seznam; celý seznam se otevírá na plochu jako tabulka, protože
 * dvacet rodin se v pruhu 320 px neprohlíží.
 *
 * Na širokém displeji panel stojí, na mobilu se vysouvá. Jedna komponenta,
 * dvě chování.
 */

import { KTDropdown, KTToast } from '@keenthemes/ktui'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as data from './demo/data'
import { Face, type FaceKind } from './face'
import * as L from './labels'
import { usePersona } from './persona'
import { Chevron, Chip, Field, daysUntil, dueBadge, type Tone } from './ui'

export type Segment = 'dohody' | 'pestouni' | 'deti' | 'tym'

export const SEGMENTS: Array<[Segment, string]> = [
  ['dohody', 'Dohody'],
  ['pestouni', 'Pěstouni'],
  ['deti', 'Děti'],
  ['tym', 'Tým'],
]

export const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

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

  return (
    <div className="min-h-full bg-[var(--ds-background-200)] lg:pl-[17.5rem]">
      <TopBar onMenu={() => setOpen(true)} go={go} route={route} />
      {children}

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-[var(--ds-gray-alpha-600)] transition-opacity duration-200 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <Sidebar
        open={open}
        route={route}
        close={() => setOpen(false)}
        go={(r) => {
          setOpen(false)
          go(r)
        }}
      />
    </div>
  )
}

function TopBar({
  onMenu,
  go,
  route,
}: {
  onMenu: () => void
  go: (r: string) => void
  route: string
}) {
  const { persona } = usePersona()
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-100)] pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <span className="lg:hidden">
          <IconButton label="Menu" onClick={onMenu}>
            <path d="M3 5h18M3 12h18M3 19h18" />
          </IconButton>
        </span>

        <span className="text-copy-14 hidden text-[var(--ds-gray-900)] lg:block">
          {breadcrumb(route)}
        </span>

        <div className="flex-1" />

        {/* Hledání je i tady, ne jen v rozvržení B — cesta k věci má být
            všude stejně krátká. */}
        <button
          type="button"
          onClick={() => go('/b')}
          className="text-copy-14 hidden h-9 w-64 items-center gap-2 rounded-lg border border-[var(--ds-gray-alpha-400)] px-3 text-left text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-100)] md:flex"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <span className="flex-1 truncate">Hledat</span>
          <kbd className="kt-kbd">⌘K</kbd>
        </button>

        <Bell go={go} />

        <PersonaMenu go={go} />
      </div>
    </header>
  )
}

function breadcrumb(route: string): string {
  if (route === '/') return 'Eli'
  if (route === '/prehled') return 'Přehled'
  if (route === '/dnes') return 'Dnes'
  if (route.startsWith('/seznam/')) {
    const seg = route.slice('/seznam/'.length) as Segment
    return SEGMENTS.find(([k]) => k === seg)?.[1] ?? 'Seznam'
  }
  if (route.startsWith('/rodina/')) return 'Dohody · karta rodiny'
  if (route.startsWith('/pestoun/')) return 'Pěstouni · karta'
  if (route.startsWith('/dite/')) return 'Děti · karta'
  if (route.startsWith('/clen/')) return 'Tým · karta'
  if (route === '/ja') return 'Pohled'
  return ''
}

/**
 * Nabídka pohledu v liště.
 *
 * Vysouvání obstarává KtUI (`data-kt-dropdown`) — umístění, zavírání klikem
 * vedle i klávesou Esc. Přepnutí pohledu ohlásí hláškou, protože se tím mění
 * všechno, co je na obrazovce, a bez potvrzení to vypadá jako chyba.
 */
function PersonaMenu({ go }: { go: (r: string) => void }) {
  const { personas, persona, setPersona } = usePersona()
  const ref = useRef<HTMLDivElement>(null)

  // Nabídka vzniká až v Reactu, takže si init volá sama.
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
        className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-[var(--ds-gray-100)]"
      >
        <Face uid={persona.personId ?? persona.key} name={persona.displayName} />
        <span className="text-copy-14 hidden text-[var(--ds-gray-1000)] md:block">
          {persona.displayName}
        </span>
        <Chevron />
      </button>

      {/* `kt-dropdown` je v KtUI samotný panel, ne obal — obal je jen nosič
          data-atributů. `hidden` je povinné, jinak panel svítí i zavřený. */}
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

/**
 * Zvonek. Číslo je počet lhůt po termínu — jediné, co v tomhle systému
 * opravdu „přišlo" a nepočká. Notifikace se teprve navrhují (dok. 00),
 * tak zatím ukazuje to, co spočítat umíme.
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
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

/* ------------------------------------------------------------------ */

function Sidebar({
  open,
  close,
  go,
  route,
}: {
  open: boolean
  close: () => void
  go: (r: string) => void
  route: string
}) {
  const { persona } = usePersona()
  const orgId = persona.organizationId
  const [segment, setSegment] = useState<Segment>('dohody')
  const [q, setQ] = useState('')

  const items = useMemo(() => listOf(segment, orgId, persona), [segment, orgId, persona])
  const shown = (
    q.trim() ? items.filter((i) => fold(`${i.name} ${i.town ?? ''}`).includes(fold(q.trim()))) : items
  ).slice(0, 40)

  return (
    /*
     * Panel je černý v obou režimech. Není to zapsaná barva: třídou `dark`
     * se uvnitř přepnou tokeny Geistu na tmavé hodnoty, takže `background-100`
     * je tady skoro černá a `gray-1000` skoro bílá. V tmavém režimu se nic
     * nemění — panel už tmavý je.
     */
    <aside
      className={`dark fixed inset-y-0 left-0 z-50 flex w-[17.5rem] max-w-[86vw] flex-col bg-[var(--ds-background-100)] transition-transform duration-200 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* --- značka -------------------------------------------------- */}
      <div className="flex h-14 items-center gap-2.5 border-b border-[var(--ds-gray-alpha-400)] px-4 pt-[env(safe-area-inset-top)]">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--ds-purple-700)]">
          <span className="text-label-13 text-white">E</span>
        </div>
        <span className="text-heading-16 flex-1 text-[var(--ds-gray-1000)]">Doprovázení</span>
        <span className="lg:hidden">
          <IconButton label="Zavřít" onClick={close}>
            <path d="M6 6l12 12M18 6L6 18" />
          </IconButton>
        </span>
      </div>

      {/* --- co je pořád po ruce ------------------------------------- */}
      <nav className="px-2 py-2">
        <p className="text-label-12 px-2 pb-1 pt-1 text-[var(--ds-gray-700)]">Práce</p>
        <NavItem
          icon={<path d="M21 12a8 8 0 0 1-8 8 9 9 0 0 1-2.6-.4L5 21l1.4-3.3A8 8 0 1 1 21 12Z" />}
          label="Eli"
          active={route === '/'}
          onClick={() => go('/')}
        />
        <NavItem
          icon={<path d="M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-4H4v4Z" />}
          label="Přehled"
          active={route === '/prehled'}
          onClick={() => go('/prehled')}
        />
        <NavItem
          icon={<path d="M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />}
          label="Dnes"
          active={route === '/dnes'}
          onClick={() => go('/dnes')}
        />
      </nav>

      {/* --- oblasti ------------------------------------------------- */}
      <div className="border-t border-[var(--ds-gray-alpha-400)]">
        <p className="text-label-12 px-4 pb-1 pt-3 text-[var(--ds-gray-700)]">Agenda</p>
        <div className="flex px-2">
          {SEGMENTS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSegment(key)}
              className={`text-label-13 relative flex-1 py-2.5 ${
                key === segment
                  ? 'text-[var(--ds-gray-1000)]'
                  : 'text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]'
              }`}
            >
              {label}
              {key === segment ? (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--ds-purple-700)]" />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--ds-gray-alpha-400)] px-3 py-2.5">
        <Field value={q} onChange={setQ} placeholder="Hledat jméno nebo obec" />
      </div>

      {/* --- krátký seznam ------------------------------------------- */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {shown.length === 0 ? (
          <p className="text-copy-13 px-2 py-3 text-[var(--ds-gray-900)]">Nic tu není.</p>
        ) : (
          shown.map((i) => (
            <button
              key={i.uid}
              type="button"
              onClick={() => go(i.route)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left ${
                route === i.route ? 'bg-[var(--ds-gray-100)]' : 'hover:bg-[var(--ds-gray-100)]'
              }`}
            >
              <Face uid={i.uid} name={i.name} kind={i.kind} />
              <span className="min-w-0 flex-1">
                <span className="text-copy-14 block truncate text-[var(--ds-gray-1000)]">
                  {i.name}
                </span>
                <span className="text-label-12 block truncate text-[var(--ds-gray-700)]">
                  {i.town ?? i.note ?? '—'}
                </span>
              </span>
              {i.alert && i.alert.tone !== 'neutral' ? (
                <Chip tone={i.alert.tone}>{i.alert.text}</Chip>
              ) : null}
            </button>
          ))
        )}
      </div>

      <div className="border-t border-[var(--ds-gray-alpha-400)] p-2">
        <button
          type="button"
          onClick={() => go(`/seznam/${segment}`)}
          className="text-label-13 flex w-full items-center justify-between rounded-lg px-2 py-2 text-[var(--ds-purple-700)] hover:bg-[var(--ds-gray-100)]"
        >
          Zobrazit celý seznam ({items.length})
          <Chevron />
        </button>
      </div>
    </aside>
  )
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left ${
        active
          ? 'bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]'
          : 'text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)]'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
      <span className="text-copy-14">{label}</span>
      {active ? (
        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-[var(--ds-purple-700)]" />
      ) : null}
    </button>
  )
}

/* ------------------------------------------------------------------ */

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

/** Jeden zdroj pravdy pro panel i pro tabulku. */
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
      // `nextObligationDueOn` bude přepočítávat Cloud Function; než bude,
      // se to spočítá ze lhůt, jinak by sloupec zůstal prázdný.
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
