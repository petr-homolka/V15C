/**
 * Skořápka: horní lišta a **skrývající se levé menu**.
 *
 * Menu se vysouvá zleva a hlavní plocha pod ním ztmavne. Uvnitř je nahoře
 * přepínač čtyř seznamů — Dohody, Pěstouni, Děti, Tým — a pod ním vždycky
 * seznam toho jednoho. Spodní lišta zmizela: čtyři záložky dole a čtyři
 * v menu by byly dvě navigace vedle sebe.
 */

import { useMemo, useState, type ReactNode } from 'react'
import * as data from './demo/data'
import * as L from './labels'
import { usePersona } from './persona'
import { Avatar, Chevron } from './ui'

type Segment = 'dohody' | 'pestouni' | 'deti' | 'tym'

const SEGMENTS: Array<[Segment, string]> = [
  ['dohody', 'Dohody'],
  ['pestouni', 'Pěstouni'],
  ['deti', 'Děti'],
  ['tym', 'Tým'],
]

const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

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
    <div className="min-h-full bg-[var(--ds-background-100)]">
      <TopBar onMenu={() => setOpen(true)} go={go} />
      {children}

      {/* Ztmavení plochy. Kliknutím se menu zavře — tak to čekají všichni. */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-[var(--ds-gray-alpha-600)] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <Drawer
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

/** Lišta je téměř prázdná — obsah má být obsah, ne rám. */
function TopBar({ onMenu, go }: { onMenu: () => void; go: (r: string) => void }) {
  const { persona } = usePersona()
  return (
    <header className="sticky top-0 z-30 bg-[var(--ds-background-100)]/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-3">
        <IconButton label="Menu" onClick={onMenu}>
          <path d="M3 5h18M3 12h18M3 19h18" />
        </IconButton>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => go('/dnes')}
          className="text-label-13 rounded-full bg-[var(--ds-gray-100)] px-3 py-1.5 text-[var(--ds-gray-1000)]"
        >
          {persona.organizationName ?? 'Systém'}
        </button>

        <div className="flex-1" />

        <button type="button" onClick={() => go('/ja')} aria-label="Pohled">
          <Avatar text={persona.displayName} tone="blue" />
        </button>
      </div>
    </header>
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
      className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--ds-gray-900)] active:bg-[var(--ds-gray-100)]"
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

function Drawer({
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

  const items = useMemo(() => list(segment, orgId, persona), [segment, orgId, persona])
  const shown = q.trim() ? items.filter((i) => fold(i.title + (i.subtitle ?? '')).includes(fold(q.trim()))) : items

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[19rem] max-w-[85vw] flex-col bg-[var(--ds-background-200)] shadow-[var(--ds-shadow-modal)] transition-transform duration-200 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* --- hlava: značka a hledání ------------------------------------ */}
      <div className="flex items-center gap-2 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ds-gray-1000)]">
          <span className="text-label-14 text-[var(--ds-background-100)]">E</span>
        </div>
        <span className="text-heading-16 flex-1 text-[var(--ds-gray-1000)]">Doprovázení</span>
        <IconButton label="Zavřít" onClick={close}>
          <path d="M6 6l12 12M18 6L6 18" />
        </IconButton>
      </div>

      {/* --- přepínač seznamů ------------------------------------------- */}
      <div className="px-3 pt-3">
        <div className="flex rounded-xl bg-[var(--ds-gray-200)] p-0.5">
          {SEGMENTS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSegment(key)}
              className={`text-label-13 h-8 flex-1 rounded-[10px] ${
                key === segment
                  ? 'bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-[var(--ds-shadow-small)]'
                  : 'text-[var(--ds-gray-900)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* --- co je pořád po ruce ---------------------------------------- */}
      <div className="px-3 pt-3">
        <DrawerRow
          icon={<path d="M12 5v14M5 12h14" />}
          label="Nový dotaz pro Eli"
          active={route === '/'}
          onClick={() => go('/')}
        />
        <DrawerRow
          icon={<path d="M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />}
          label="Dnes"
          active={route === '/dnes'}
          onClick={() => go('/dnes')}
        />
      </div>

      <div className="px-3 pt-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hledat"
          className="text-copy-14 w-full rounded-xl bg-[var(--ds-background-100)] px-3 py-2 text-[var(--ds-gray-1000)] shadow-[var(--ds-shadow-border-small)] outline-none placeholder:text-[var(--ds-gray-700)]"
        />
      </div>

      {/* --- seznam ------------------------------------------------------ */}
      <div className="mt-2 flex-1 overflow-y-auto px-3 pb-3">
        {shown.length === 0 ? (
          <p className="text-copy-14 px-2 py-4 text-[var(--ds-gray-900)]">Nic tu není.</p>
        ) : (
          groupBy(shown).map(([group, rows]) => (
            <div key={group}>
              <h3 className="text-label-12 px-2 pb-1 pt-3 text-[var(--ds-gray-700)]">{group}</h3>
              {rows.map((i) => (
                <button
                  key={i.route + i.title}
                  type="button"
                  onClick={() => go(i.route)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left active:bg-[var(--ds-gray-200)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-copy-14 truncate text-[var(--ds-gray-1000)]">{i.title}</div>
                    {i.subtitle ? (
                      <div className="text-label-12 truncate text-[var(--ds-gray-700)]">{i.subtitle}</div>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          ))
        )}
      </div>

      {/* --- pata: kdo jsem -------------------------------------------- */}
      <div className="border-t border-[var(--ds-gray-alpha-400)] p-3">
        <button
          type="button"
          onClick={() => go('/ja')}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left active:bg-[var(--ds-gray-200)]"
        >
          <Avatar text={persona.displayName} tone="blue" />
          <div className="min-w-0 flex-1">
            <div className="text-copy-14 truncate text-[var(--ds-gray-1000)]">{persona.displayName}</div>
            <div className="text-label-12 truncate text-[var(--ds-gray-700)]">{persona.roleLabel}</div>
          </div>
          <Chevron />
        </button>
      </div>
    </aside>
  )
}

function DrawerRow({
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
      className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left ${
        active ? 'bg-[var(--ds-gray-200)]' : 'active:bg-[var(--ds-gray-200)]'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px] text-[var(--ds-gray-900)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
      <span className="text-copy-14 text-[var(--ds-gray-1000)]">{label}</span>
    </button>
  )
}

/* ------------------------------------------------------------------ */

interface Item {
  title: string
  subtitle?: string
  group: string
  route: string
}

/**
 * Obsah seznamu podle přepínače.
 *
 * Skupina je vždycky něco, co pracovníka zajímá dřív než abeceda: u dohod je
 * to nejbližší lhůta, u dětí věk, u týmu role.
 */
function list(
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
      title: a.naming.displayName,
      subtitle: `${a.reference} · ${L.custodyBasis(a.custodyBasis)}`,
      group: a.status === 'active' ? 'Aktivní' : 'Ukončené',
      route: `/rodina/${a.id}`,
    }))
  }

  if (segment === 'pestouni') {
    const out: Item[] = []
    for (const a of agreements) {
      for (const pid of a.carerPersonIds) {
        const p = data.person(orgId, pid)
        if (!p) continue
        out.push({
          title: p.displayName,
          subtitle: a.naming.displayName,
          group: L.carerKind(a.carerKind),
          route: `/rodina/${a.id}`,
        })
      }
    }
    return out.sort((x, y) => x.title.localeCompare(y.title, 'cs'))
  }

  if (segment === 'deti') {
    const out: Item[] = []
    for (const a of agreements) {
      for (const c of data.childrenOfAgreement(orgId, a.id)) {
        const age = Math.floor((Date.now() - new Date(c.birthDate).getTime()) / (365.25 * 86_400_000))
        out.push({
          title: c.displayName,
          subtitle: `${age} let · ${a.naming.displayName}`,
          group: c.careEndedOn ? 'Péče ukončena' : age < 6 ? 'Do 6 let' : age < 15 ? '6–15 let' : 'Nad 15 let',
          route: `/rodina/${a.id}`,
        })
      }
    }
    return out.sort((x, y) => x.title.localeCompare(y.title, 'cs'))
  }

  // Tým
  return data
    .members(orgId)
    .filter((m) => m.status === 'active')
    .map((m) => {
      const p = data.person(orgId, m.personId)
      const files = data.caseFiles(orgId).filter((c) => c.keyWorkerPersonId === m.personId).length
      return {
        title: p?.displayName ?? m.personId,
        subtitle: files > 0 ? `${files} dohod ve správě` : undefined,
        group: L.memberRole(m.role),
        route: `/clen/${m.personId}`,
      }
    })
}

function groupBy(items: Item[]): Array<[string, Item[]]> {
  const map = new Map<string, Item[]>()
  for (const i of items) {
    const list = map.get(i.group)
    if (list) list.push(i)
    else map.set(i.group, [i])
  }
  return [...map]
}
