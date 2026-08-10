/**
 * Příkazový řádek — jediná navigace v rozvržení B.
 *
 * ┌───────────────────────────────────────────────────────────────────┐
 * │ PROČ ŽÁDNÉ MENU                                                   │
 * │                                                                   │
 * │ Klíčová osoba nezná strukturu aplikace, zná **jména**. Ví, že jede│
 * │ k Novotným, že Adélu čeká vysvědčení, že OSPOD chce zprávu. Menu  │
 * │ ji nutí přeložit si jméno na cestu (Dohody → seznam → hledat →    │
 * │ řádek). Řádek to přeskakuje: napíše „Novotní" a je tam.           │
 * │                                                                   │
 * │ A protože Eli je stejně ústřední nástroj (dok. 15), je to jedno   │
 * │ pole: **co vypadá jako jméno, hledá; co vypadá jako věta, je      │
 * │ dotaz na Eli.** Rozhodne první slovo, ne přepínač.                │
 * └───────────────────────────────────────────────────────────────────┘
 *
 * Otevírá se klávesou (Ctrl/⌘ + K) nebo klepnutím. Zavírá Esc.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import * as data from '../demo/data'
import { answer, type EliAnswer } from '../eli/answer'
import { Face } from '../face'
import { useLocal } from '../local'
import { usePersona } from '../persona'
import { fold, listOf } from '../shell'
import { Chip, dueBadge, dueTone } from '../ui'

interface Hit {
  uid: string
  kind: 'family' | 'person' | 'child'
  name: string
  detail: string
  route: string
  dueOn: string | null
}

/** Věta, ne jméno: začíná otázkou nebo slovesem. */
function looksLikeQuestion(q: string): boolean {
  const f = fold(q.trim())
  if (f.endsWith('?')) return true
  return /^(kdy|kde|kdo|co|jak|kolik|proc|zapis|zapiš|naplanuj|domluv|uka[zž]|najdi|potreb)/.test(f)
}

export function Omnibar({
  open,
  onClose,
  go,
}: {
  open: boolean
  onClose: () => void
  go: (route: string) => void
}) {
  const { persona } = usePersona()
  const local = useLocal()
  const orgId = persona.organizationId!
  const [q, setQ] = useState('')
  const [reply, setReply] = useState<EliAnswer | null>(null)
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      setQ('')
      setReply(null)
      setCursor(0)
    }
  }, [open])

  const hits = useMemo<Hit[]>(() => {
    if (!q.trim() || looksLikeQuestion(q)) return []
    const needle = fold(q.trim())
    const all: Hit[] = [
      ...listOf('dohody', orgId, persona).map((i) => ({
        uid: i.uid,
        kind: 'family' as const,
        name: i.name,
        detail: [i.town, i.note].filter(Boolean).join(' · '),
        route: `/b/spis/${i.uid}`,
        dueOn: i.dueOn,
      })),
      ...listOf('deti', orgId, persona).map((i) => ({
        uid: i.uid,
        kind: 'child' as const,
        name: i.name,
        detail: [i.town, i.note, i.extra].filter(Boolean).join(' · '),
        route: `/b/spis/${data.childAgreementId(orgId, i.uid) ?? ''}`,
        dueOn: i.dueOn,
      })),
      ...listOf('pestouni', orgId, persona).map((i) => ({
        uid: i.uid,
        kind: 'person' as const,
        name: i.name,
        detail: [i.town, i.extra].filter(Boolean).join(' · '),
        route: `/b/spis/${
          data.agreementsOfCarer(orgId, i.uid)[0]?.id ?? ''
        }`,
        dueOn: i.dueOn,
      })),
    ]
    return all.filter((h) => fold(`${h.name} ${h.detail}`).includes(needle)).slice(0, 8)
  }, [q, orgId, persona])

  if (!open) return null

  const ask = () => {
    setReply(
      answer(q, {
        organizationId: orgId,
        personId: persona.personId,
        addEvent: local.addEvent,
        removeEvent: local.removeEvent,
      }),
    )
  }

  const submit = () => {
    if (looksLikeQuestion(q) || hits.length === 0) {
      if (q.trim()) ask()
      return
    }
    const hit = hits[Math.min(cursor, hits.length - 1)]
    if (hit) {
      go(hit.route)
      onClose()
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-[var(--ds-gray-alpha-600)] backdrop-blur-[2px]"
      />
      <div className="fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-2xl px-4 pt-[8vh]">
        <div className="kt-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setReply(null)
                setCursor(0)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose()
                if (e.key === 'Enter') submit()
                if (e.key === 'ArrowDown') setCursor((c) => Math.min(c + 1, hits.length - 1))
                if (e.key === 'ArrowUp') setCursor((c) => Math.max(0, c - 1))
              }}
              placeholder="Jméno rodiny, dítěte — nebo se zeptejte Eli"
              className="text-copy-16 h-14 min-w-0 flex-1 bg-transparent text-[var(--ds-gray-1000)] outline-none placeholder:text-[var(--ds-gray-700)]"
            />
            <kbd className="kt-kbd hidden sm:inline-flex">esc</kbd>
          </div>

          {/* Odpověď Eli, když to byla věta. */}
          {reply ? (
            <div className="border-b border-[var(--border)] px-4 py-3">
              <p className="text-copy-15 text-[var(--ds-gray-1000)]">{reply.text}</p>
              {reply.links?.map((l, i) => (
                <button
                  key={`${l.route}-${i}`}
                  type="button"
                  onClick={() => {
                    go(l.route.startsWith('/rodina/') ? `/b/spis/${l.route.slice(8)}` : l.route)
                    onClose()
                  }}
                  className="text-copy-14 mt-2 flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-[var(--ds-gray-100)]"
                >
                  <span className="truncate text-[var(--ds-purple-700)]">{l.label}</span>
                  <span className="text-copy-13 shrink-0 text-[var(--muted-foreground)]">
                    {l.detail}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {/* Nalezené věci. */}
          {hits.length > 0 ? (
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {hits.map((h, i) => (
                <button
                  key={h.uid}
                  type="button"
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => {
                    go(h.route)
                    onClose()
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left ${
                    i === cursor ? 'bg-[var(--ds-gray-100)]' : ''
                  }`}
                >
                  <Face uid={h.uid} name={h.name} kind={h.kind} />
                  <span className="min-w-0 flex-1">
                    <span className="text-copy-14 block truncate text-[var(--ds-gray-1000)]">
                      {h.name}
                    </span>
                    <span className="text-copy-13 block truncate text-[var(--muted-foreground)]">
                      {h.detail}
                    </span>
                  </span>
                  {h.dueOn ? <Chip tone={dueTone(h.dueOn)}>{dueBadge(h.dueOn)}</Chip> : null}
                </button>
              ))}
            </div>
          ) : null}

          {/* Nápověda, dokud se nepíše. */}
          {!q.trim() ? (
            <div className="text-copy-13 px-4 py-3 text-[var(--muted-foreground)]">
              Piště jméno — otevře se spis. Piště větu — odpoví Eli.
              <span className="block pt-1">
                Zkuste „Novotní", „Co mi utíká?" nebo „Zapiš návštěvu v pátek ve tři".
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
