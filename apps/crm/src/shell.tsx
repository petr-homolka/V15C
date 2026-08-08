/**
 * Skořápka: horní lišta a **skrývající se levé menu** se seznamy.
 *
 * V řádku seznamu je jen to, co Klíčová osoba potřebuje, než někam klikne:
 * **obrázek, jméno, obec a upozornění.** Spisová značka ani UID tam nejsou —
 * opakovat je u každého řádku je šum a nic se podle nich nehledá (dok. 25).
 * UID je vidět až v profilu, kde slouží k dohledání.
 *
 * Seskupení se přepíná: abecedně, podle obce, podle nejbližšího termínu nebo
 * podle vlastního barevného označení. Jeden seznam, čtyři způsoby, jak se na
 * něj kouknout — to je levnější než čtyři obrazovky.
 */

import { useMemo, useState, type ReactNode } from 'react'
import * as data from './demo/data'
import { Face, TINT_BG, type FaceKind, type Tint, faceOf } from './face'
import * as L from './labels'
import { usePersona } from './persona'
import { Chevron, daysUntil, dueBadge, formatShort } from './ui'

type Segment = 'dohody' | 'pestouni' | 'deti' | 'tym'
type Grouping = 'abeceda' | 'obec' | 'termin' | 'znacka'

const SEGMENTS: Array<[Segment, string]> = [
  ['dohody', 'Dohody'],
  ['pestouni', 'Pěstouni'],
  ['deti', 'Děti'],
  ['tym', 'Tým'],
]

const GROUPINGS: Array<[Grouping, string]> = [
  ['abeceda', 'Abecedně'],
  ['obec', 'Podle obce'],
  ['termin', 'Podle termínu'],
  ['znacka', 'Podle označení'],
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

  // Na širokém displeji menu nezmizí — je to sloupec vedle obsahu. Na mobilu
  // se vysouvá. Jedna komponenta, dvě chování; druhá navigace by se rozešla.
  return (
    <div className="min-h-full bg-[var(--ds-background-100)] lg:pl-80">
      <TopBar onMenu={() => setOpen(true)} go={go} />
      {children}

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-[var(--ds-gray-alpha-600)] transition-opacity duration-200 lg:hidden ${
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

function TopBar({ onMenu, go }: { onMenu: () => void; go: (r: string) => void }) {
  const { persona } = usePersona()
  return (
    <header className="sticky top-0 z-30 bg-[var(--ds-background-100)]/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-3">
        <span className="lg:hidden">
          <IconButton label="Menu" onClick={onMenu}>
            <path d="M3 5h18M3 12h18M3 19h18" />
          </IconButton>
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => go('/dnes')}
          className="text-label-13 rounded-full bg-[var(--ds-purple-100)] px-3 py-1.5 text-[var(--ds-purple-900)]"
        >
          {persona.organizationName ?? 'Systém'}
        </button>
        <div className="flex-1" />
        <button type="button" onClick={() => go('/ja')} aria-label="Pohled">
          <Face uid={persona.personId ?? persona.key} name={persona.displayName} />
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
  const [grouping, setGrouping] = useState<Grouping>('abeceda')
  const [q, setQ] = useState('')

  const items = useMemo(() => list(segment, orgId, persona), [segment, orgId, persona])
  const shown = q.trim()
    ? items.filter((i) => fold(`${i.name} ${i.town ?? ''} ${i.note ?? ''}`).includes(fold(q.trim())))
    : items

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[20rem] max-w-[88vw] flex-col border-r border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-200)] transition-transform duration-200 lg:translate-x-0 lg:shadow-none ${
        open ? 'translate-x-0 shadow-[var(--ds-shadow-modal)]' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center gap-2 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ds-purple-700)]">
          <span className="text-label-14 text-white">E</span>
        </div>
        <span className="text-heading-16 flex-1 text-[var(--ds-gray-1000)]">Doprovázení</span>
        <span className="lg:hidden">
          <IconButton label="Zavřít" onClick={close}>
            <path d="M6 6l12 12M18 6L6 18" />
          </IconButton>
        </span>
      </div>

      <div className="px-3 pt-3">
        <div className="flex rounded-xl bg-[var(--ds-gray-200)] p-0.5">
          {SEGMENTS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSegment(key)}
              className={`text-label-13 h-8 flex-1 rounded-[10px] transition-colors ${
                key === segment
                  ? 'bg-[var(--ds-background-100)] text-[var(--ds-purple-900)] shadow-[var(--ds-shadow-small)]'
                  : 'text-[var(--ds-gray-900)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

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
          placeholder="Hledat jméno nebo obec"
          className="text-copy-14 w-full rounded-xl bg-[var(--ds-background-100)] px-3 py-2 text-[var(--ds-gray-1000)] shadow-[var(--ds-shadow-border-small)] outline-none placeholder:text-[var(--ds-gray-700)]"
        />
      </div>

      {/* Jak se na seznam koukám. Vodorovné, ať se to nerozlije do výšky. */}
      <div className="flex gap-1.5 overflow-x-auto px-3 pt-2.5 pb-1">
        {GROUPINGS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setGrouping(key)}
            className={`text-label-12 shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 ${
              key === grouping
                ? 'bg-[var(--ds-purple-700)] text-white'
                : 'bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] shadow-[var(--ds-shadow-border-small)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-1 flex-1 overflow-y-auto px-3 pb-3">
        {shown.length === 0 ? (
          <p className="text-copy-14 px-2 py-4 text-[var(--ds-gray-900)]">Nic tu není.</p>
        ) : (
          group(shown, grouping).map(([title, rows]) => (
            <div key={title}>
              <h3 className="text-label-12 px-2 pb-1 pt-3 text-[var(--ds-gray-700)]">
                {title} <span className="text-[var(--ds-gray-600)]">· {rows.length}</span>
              </h3>
              {rows.map((i) => (
                <ListRow key={i.uid} item={i} onClick={() => go(i.route)} />
              ))}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[var(--ds-gray-alpha-400)] p-3">
        <button
          type="button"
          onClick={() => go('/ja')}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left active:bg-[var(--ds-gray-200)]"
        >
          <Face uid={persona.personId ?? persona.key} name={persona.displayName} />
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

/** Řádek seznamu: obrázek, jméno, obec, upozornění. */
function ListRow({ item, onClick }: { item: Item; onClick: () => void }) {
  const mark = faceOf(item.uid).mark
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left active:bg-[var(--ds-gray-200)]"
    >
      <Face uid={item.uid} name={item.name} kind={item.kind} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-copy-14 truncate ${
              mark === 'none'
                ? 'text-[var(--ds-gray-1000)]'
                : `${TINT_BG[mark]} rounded-md px-1.5`
            }`}
          >
            {item.name}
          </span>
        </div>
        <div className="text-label-12 flex items-center gap-1 truncate text-[var(--ds-gray-700)]">
          {item.town ? <Pin /> : null}
          <span className="truncate">
            {[item.town, item.note].filter(Boolean).join(' · ') || '—'}
          </span>
        </div>
      </div>
      {item.alert ? (
        <span
          className={`text-label-12 shrink-0 rounded-full px-2 py-0.5 ${
            item.alert.urgent
              ? 'bg-[var(--ds-red-200)] text-[var(--ds-red-900)]'
              : 'bg-[var(--ds-amber-200)] text-[var(--ds-amber-900)]'
          }`}
        >
          {item.alert.text}
        </span>
      ) : null}
    </button>
  )
}

function Pin() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3 w-3 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
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
        active ? 'bg-[var(--ds-purple-100)] text-[var(--ds-purple-900)]' : 'active:bg-[var(--ds-gray-200)]'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
      <span className="text-copy-14">{label}</span>
    </button>
  )
}

/* ------------------------------------------------------------------ */

interface Item {
  uid: string
  kind: FaceKind
  name: string
  town: string | null
  note: string | null
  dueOn: string | null
  alert: { text: string; urgent: boolean } | null
  route: string
}

/** Z lhůty se dělá upozornění jen tehdy, když je na co upozorňovat. */
function alertOf(dueOn: string | null): Item['alert'] {
  if (!dueOn) return null
  const d = daysUntil(dueOn)
  if (d < 0) return { text: dueBadge(dueOn), urgent: true }
  if (d <= 14) return { text: dueBadge(dueOn), urgent: false }
  return null
}

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
      uid: a.id,
      kind: 'family' as const,
      name: a.naming.displayName,
      town: data.townOfAgreement(orgId, a.id),
      note: a.status === 'active' ? L.custodyBasis(a.custodyBasis) : L.agreementStatus(a.status),
      dueOn: a.nextObligationDueOn,
      alert: alertOf(a.nextObligationDueOn),
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
          kind: 'person' as const,
          name: p.displayName,
          town: data.townOfPerson(orgId, pid),
          note: L.carerKind(a.carerKind),
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
          kind: 'child' as const,
          name: c.displayName,
          town: data.townOfChild(orgId, c.id),
          note: `${age(c.birthDate)} let`,
          dueOn: due?.dueOn ?? null,
          alert: c.careEndedOn
            ? { text: 'péče ukončena', urgent: false }
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
        note: files > 0 ? `${files} dohod` : L.memberRole(m.role),
        dueOn: null,
        alert: null,
        route: `/clen/${m.personId}`,
      }
    })
}

export const age = (birthDate: string): number =>
  Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 86_400_000))

/* --- seskupení ------------------------------------------------------------ */

const MARK_ORDER: Tint[] = ['red', 'amber', 'pink', 'purple', 'blue', 'teal', 'green', 'none']

function group(items: Item[], mode: Grouping): Array<[string, Item[]]> {
  const key = (i: Item): string => {
    if (mode === 'obec') return i.town ?? 'Bez adresy'
    if (mode === 'znacka') {
      const m = faceOf(i.uid).mark
      return m === 'none' ? 'Neoznačené' : `Označené — ${m}`
    }
    if (mode === 'termin') {
      if (!i.dueOn) return 'Bez termínu'
      const d = daysUntil(i.dueOn)
      if (d < 0) return 'Po termínu'
      if (d <= 7) return 'Tento týden'
      if (d <= 31) return 'Do měsíce'
      return 'Později'
    }
    return i.name.charAt(0).toUpperCase()
  }

  const map = new Map<string, Item[]>()
  for (const i of items) {
    const k = key(i)
    const list = map.get(k)
    if (list) list.push(i)
    else map.set(k, [i])
  }

  const out = [...map]

  if (mode === 'termin') {
    const order = ['Po termínu', 'Tento týden', 'Do měsíce', 'Později', 'Bez termínu']
    out.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
    for (const [, rows] of out) rows.sort((x, y) => (x.dueOn ?? '').localeCompare(y.dueOn ?? ''))
  } else if (mode === 'znacka') {
    const rank = (s: string) =>
      MARK_ORDER.findIndex((t) => (t === 'none' ? s === 'Neoznačené' : s.endsWith(t)))
    out.sort((a, b) => rank(a[0]) - rank(b[0]))
  } else {
    out.sort((a, b) => a[0].localeCompare(b[0], 'cs'))
  }

  return out
}

/** Krátký termín do řádku — používá se i jinde než v menu. */
export const shortDue = (iso: string): string => formatShort(iso)
