/**
 * Pravá lišta — připnutí lidé.
 *
 * V Luminaux je na tomhle místě messenger: avatary s tečkou přítomnosti
 * a okno chatu. **Chat u nás nebude** — s pěstounem se mluví telefonem
 * a osobně a psaná komunikace o dítěti patří do spisu, ne do bubliny, která
 * se nikam nezapíše (dok. 16 a 21).
 *
 * Co ale ta lišta umí dobře, je **držet po ruce těch pět lidí, se kterými
 * má člověk zrovna co dělat.** Tak je použitá tady: připnu si pěstouna nebo
 * kolegu, kliknutím se otevře karta s obcí, nejbližší lhůtou a tím, čím se
 * ozvat — telefon, e-mail, otevřít spis. Zavolat se dá jedním kliknutím,
 * což je přesně to, co Klíčová osoba v autě potřebuje.
 *
 * Připnutí je **soukromé** (localStorage, jako barevné označení), protože
 * „koho mám připnutého" je pracovní poznámka, ne údaj o rodině.
 */

import { useEffect, useState } from 'react'
import * as data from './demo/data'
import { Face } from './face'
import { usePersona } from './persona'
import { listOf, type Segment } from './shell'
import { Due, formatUid } from './ui'

const KEY = 'v15c.pins'

function read(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown
    return Array.isArray(raw) ? (raw as string[]) : []
  } catch {
    return []
  }
}

let cache: string[] | null = null
const listeners = new Set<() => void>()

function all(): string[] {
  if (!cache) cache = read()
  return cache
}

function write(next: string[]): void {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Plné úložiště není důvod ke spadnutí.
  }
  listeners.forEach((l) => l())
}

export function isPinned(uid: string): boolean {
  return all().includes(uid)
}

/** Přepnutí připnutí. Nové jde na konec, ať se lišta nemíchá pod rukou. */
export function togglePin(uid: string): void {
  write(all().includes(uid) ? all().filter((u) => u !== uid) : [...all(), uid])
}

export function usePins(): string[] {
  const [, bump] = useState(0)
  useEffect(() => {
    const l = () => bump((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  return all()
}

/* --- lišta ---------------------------------------------------------------- */

/** Kdo to je, hledá se ve všech segmentech — připnout se dá kdokoli. */
const SEGMENTS_TO_SEARCH: Segment[] = ['pestouni', 'deti', 'tym']

export function PinRail({ go }: { go: (r: string) => void }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId
  const pins = usePins()
  const [openUid, setOpenUid] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)

  /**
   * Než si někdo připne své, drží lišta ty, u kterých něco přeteklo. Prázdná
   * lišta se stejně nikdy nenaplní — nikdo nezkouší, co dělá „+".
   */
  useEffect(() => {
    if (!orgId || localStorage.getItem(KEY) !== null) return
    write(
      SEGMENTS_TO_SEARCH.flatMap((s) => listOf(s, orgId, persona))
        .filter((i) => i.alert?.tone === 'red')
        .slice(0, 4)
        .map((i) => i.uid),
    )
  }, [orgId, persona])

  if (!orgId) return null

  const everyone = SEGMENTS_TO_SEARCH.flatMap((s) => listOf(s, orgId, persona))

  const pinned = pins.map((uid) => everyone.find((i) => i.uid === uid)).filter((i) => i !== undefined)

  return (
    // Rozměry ze šablony: 4 rem, sticky, celá výška, z-45 (nad horní lištou).
    <aside className="sticky top-0 z-45 hidden h-dvh w-16 shrink-0 flex-col items-center gap-4 border-l border-[var(--border)] bg-[var(--ds-background-100)] py-4 lg:flex">
      {pinned.map((i) => (
        <button
          key={i.uid}
          type="button"
          onClick={() => setOpenUid(openUid === i.uid ? null : i.uid)}
          title={i.name}
          aria-label={i.name}
          className="relative rounded-full transition-transform hover:scale-105"
        >
          <Face uid={i.uid} name={i.name} kind={i.kind} />
          {/* Tečka nese termín, ne přítomnost — kdo je „online" u pěstounů neřešíme. */}
          {i.alert ? (
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--ds-background-100)] ${
                i.alert.tone === 'red' ? 'bg-[var(--ds-red-700)]' : 'bg-[var(--ds-amber-700)]'
              }`}
            />
          ) : null}
        </button>
      ))}

      <button
        type="button"
        onClick={() => setPicking(true)}
        aria-label="Připnout člověka"
        title="Připnout člověka"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-[var(--ds-gray-alpha-400)] text-[var(--ds-gray-700)] hover:border-[var(--ds-purple-700)] hover:text-[var(--ds-purple-700)]"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {openUid ? (
        <PinCard
          uid={openUid}
          orgId={orgId}
          item={pinned.find((i) => i.uid === openUid)!}
          onClose={() => setOpenUid(null)}
          go={go}
        />
      ) : null}

      {picking ? (
        <PinPicker
          items={everyone}
          pins={pins}
          onClose={() => setPicking(false)}
        />
      ) : null}
    </aside>
  )
}

/** Karta u avataru — obec, lhůta a čím se ozvat. Vysouvá se doleva od lišty. */
function PinCard({
  uid,
  orgId,
  item,
  onClose,
  go,
}: {
  uid: string
  orgId: string
  item: ReturnType<typeof listOf>[number]
  onClose: () => void
  go: (r: string) => void
}) {
  const contact = item.kind === 'child' ? data.contactOfChild(orgId, uid) : data.contactOfPerson(orgId, uid)

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40" />
      <div className="absolute right-16 top-3 z-50 w-72 rounded-xl border border-[var(--border)] bg-[var(--ds-background-100)] p-4 shadow-[var(--ds-shadow-menu)]">
        <div className="flex items-center gap-3">
          <Face uid={uid} name={item.name} kind={item.kind} size="md" />
          <div className="min-w-0">
            <div className="text-copy-14 truncate text-[var(--ds-gray-1000)]">{item.name}</div>
            <div className="text-label-12 truncate text-[var(--muted-foreground)]">
              {item.town ?? 'Bez adresy'}
              {item.note ? ` · ${item.note}` : ''}
            </div>
          </div>
        </div>

        {item.dueOn ? (
          <div className="text-copy-13 flex items-center justify-between gap-2 pt-3 text-[var(--muted-foreground)]">
            <span>Nejbližší lhůta</span>
            <Due iso={item.dueOn} />
          </div>
        ) : null}

        <div className="flex flex-col gap-1 pt-3">
          {contact?.phone ? (
            <a
              href={`tel:${contact.phone.replace(/\s/g, '')}`}
              className="text-copy-13 flex h-9 items-center gap-2 rounded-lg px-2 text-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-100)]"
            >
              <Glyph d="M5 4h3l2 5-2 1a10 10 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
              {contact.phone}
            </a>
          ) : null}
          {contact?.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="text-copy-13 flex h-9 items-center gap-2 rounded-lg px-2 text-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-100)]"
            >
              <Glyph d="M4 6h16v12H4V6Zm0 0 8 6 8-6" />
              <span className="truncate">{contact.email}</span>
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => {
              onClose()
              go(item.route)
            }}
            className="text-copy-13 flex h-9 items-center gap-2 rounded-lg px-2 text-left text-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-100)]"
          >
            <Glyph d="M4 5h9l3 3h4v11H4V5Z" />
            Otevřít kartu
          </button>
          <button
            type="button"
            onClick={() => {
              togglePin(uid)
              onClose()
            }}
            className="text-copy-13 flex h-9 items-center gap-2 rounded-lg px-2 text-left text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)]"
          >
            <Glyph d="M6 6l12 12M18 6 6 18" />
            Odepnout
          </button>
        </div>

        <p className="text-label-12 pt-3 text-[var(--ds-gray-700)]">{formatUid(uid)}</p>
      </div>
    </>
  )
}

/** Výběr, koho připnout. Filtruje se psaním, protože jinak je to dlouhý sloupec. */
function PinPicker({
  items,
  pins,
  onClose,
}: {
  items: ReturnType<typeof listOf>
  pins: string[]
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const found = needle ? items.filter((i) => i.name.toLowerCase().includes(needle)) : items

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-[var(--ds-gray-alpha-600)]" />
      <div className="absolute right-16 top-3 z-50 flex max-h-[80dvh] w-80 flex-col rounded-xl border border-[var(--border)] bg-[var(--ds-background-100)] p-3 shadow-[var(--ds-shadow-menu)]">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Jméno…"
          className="kt-input mb-2"
        />
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {found.slice(0, 40).map((i) => (
            <li key={i.uid}>
              <button
                type="button"
                onClick={() => togglePin(i.uid)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-[var(--ds-gray-100)]"
              >
                <Face uid={i.uid} name={i.name} kind={i.kind} size="xs" />
                <span className="min-w-0 flex-1">
                  <span className="text-copy-13 block truncate text-[var(--ds-gray-1000)]">
                    {i.name}
                  </span>
                  <span className="text-label-12 block truncate text-[var(--muted-foreground)]">
                    {i.town ?? '—'}
                  </span>
                </span>
                <span className="text-label-12 text-[var(--ds-purple-700)]">
                  {pins.includes(i.uid) ? 'připnuto' : 'připnout'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

function Glyph({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}
