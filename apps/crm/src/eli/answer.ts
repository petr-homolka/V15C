/**
 * Eli — odpovědi nad daty.
 *
 * Tohle NENÍ jazykový model. Je to pravidlový výklad věty nad skutečnými daty
 * organizace, aby šlo osahat, jak se s Eli pracuje, dřív než se zapojí model
 * (dok. 15, 17). Co Eli neumí přečíst, na to řekne, co umí — nikdy nepoučuje
 * a nikdy si nedomýšlí (dok. 16).
 *
 * Až přijde model, tenhle soubor se nemaže: zůstane jako **záchranná síť**
 * pro dotazy, které mají jednoznačnou odpověď z dat, a jako popis toho, co
 * všechno musí umět rozpoznat.
 */

import * as data from '../demo/data'
import { childCountLabel, dueLabel, formatDate, formatTime, formatWeekday } from '../ui'

export interface EliAnswer {
  text: string
  /** Řádky k zobrazení pod odpovědí — každý vede někam. */
  links?: Array<{ label: string; detail?: string; route: string }>
  /** Co Eli udělala. Zobrazí se s možností vrátit zpět. */
  did?: { label: string; undo: () => void }
}

export interface EliContext {
  organizationId: string
  personId: string | null
  /** Schůzka vzniklá v chatu. Kostra nezapisuje do databáze. */
  addEvent: (e: data.EventRow) => void
  removeEvent: (id: string) => void
}

/* --- pomůcky ------------------------------------------------------------- */

const fold = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const DAY_MS = 86_400_000
const WEEKDAYS = ['nedele', 'pondeli', 'utery', 'streda', 'ctvrtek', 'patek', 'sobota']
const WORD_NUMBERS: Record<string, number> = {
  jednu: 1, jedne: 1, dvanact: 12, jedenact: 11, deset: 10, devet: 9, osm: 8,
  sedm: 7, sest: 6, pet: 5, ctyri: 4, tri: 3, dve: 2, dva: 2,
}

/** Rodina podle jména v textu. Vrací i to, jak jistá shoda je. */
function findAgreement(q: string, orgId: string) {
  const f = fold(q)
  const all = data.agreements(orgId)
  let best: { a: (typeof all)[number]; score: number } | null = null
  for (const a of all) {
    // „Novákovi — pěstounská péče" → hledá se „novakovi" i „novak"
    const name = fold(a.naming.displayName).split('—')[0]!.trim()
    const stem = name.replace(/(ovi|i|ova)$/, '')
    if (stem.length < 3) continue
    if (f.includes(name) || f.includes(stem)) {
      const score = name.length
      if (!best || score > best.score) best = { a, score }
    }
  }
  return best?.a ?? null
}

function parseWhen(q: string, from = new Date()): Date | null {
  const f = fold(q)
  const base = new Date(from)
  base.setHours(0, 0, 0, 0)

  let day: Date | null = null
  if (/\bdnes\b/.test(f)) day = base
  else if (/\bzitra\b/.test(f)) day = new Date(base.getTime() + DAY_MS)
  else if (/\bpozitri\b/.test(f)) day = new Date(base.getTime() + 2 * DAY_MS)
  else {
    const wd = WEEKDAYS.findIndex((w) => f.includes(w.slice(0, 5)))
    if (wd >= 0) {
      const diff = (wd - base.getDay() + 7) % 7 || 7
      day = new Date(base.getTime() + diff * DAY_MS)
    } else {
      const m = f.match(/(\d{1,2})\s*\.\s*(\d{1,2})\s*\.?/)
      if (m) {
        day = new Date(base.getFullYear(), Number(m[2]) - 1, Number(m[1]))
        if (day < base) day.setFullYear(day.getFullYear() + 1)
      }
    }
  }
  if (!day) return null

  // Čas: „v 15:30", „v 15", „ve tři odpoledne", „v půl čtvrté" neumím a řeknu to.
  let hour = 9
  let minute = 0
  const hm = f.match(/\b(\d{1,2})[:.](\d{2})\b/)
  const h = f.match(/\bv[e]?\s+(\d{1,2})\b/)
  // Slovní hodina se hledá VE VŠECH výskytech „v …", ne jen v prvním:
  // ve větě „v pátek ve tři" je první „v pátek" a čas by propadl.
  const words = [...f.matchAll(/\bv[e]?\s+([a-z]+)\b/g)]
    .map((m) => WORD_NUMBERS[m[1]!])
    .filter((n): n is number => n !== undefined)
  if (hm) {
    hour = Number(hm[1])
    minute = Number(hm[2])
  } else if (h) {
    hour = Number(h[1])
  } else if (words.length > 0) {
    hour = words[0]!
  }
  if (/(odpoledne|vecer)/.test(f) && hour <= 12) hour += 12
  if (/rano|dopoledne/.test(f) && hour === 12) hour = 0

  const out = new Date(day)
  out.setHours(hour, minute, 0, 0)
  return out
}

/* --- odpověď ------------------------------------------------------------- */

export function answer(question: string, ctx: EliContext): EliAnswer {
  const q = fold(question)
  const orgId = ctx.organizationId
  const mine = ctx.personId

  /* 1. Zápis do kalendáře ------------------------------------------------ */
  if (/(zapis|zapiš|naplanuj|domluv|prid|založ|zaloz)/.test(q) && /(navstev|schuzk|jednani|setkan)/.test(q)) {
    const agreement = findAgreement(question, orgId)
    const when = parseWhen(question)
    if (!when) {
      return {
        text: 'Kdy to má být? Stačí „v pátek ve tři“ nebo „12. 9. v 15:30“.',
      }
    }
    const file = agreement ? data.caseFileOfAgreement(orgId, agreement.id) : null
    const id = `chat-${when.getTime()}`
    const event: data.EventRow = {
      id,
      ownerPersonId: mine ?? '',
      title: agreement ? `Návštěva · ${agreement.naming.displayName}` : 'Návštěva',
      kind: 'visit',
      startAt: when.toISOString(),
      endAt: new Date(when.getTime() + 90 * 60_000).toISOString(),
      allDay: false,
      place: null,
      caseFileId: file?.id ?? null,
      subjectDisplayName: agreement?.naming.displayName ?? null,
      travelMinutesEstimate: null,
      status: 'planned',
    }
    ctx.addEvent(event)
    return {
      text: `Zapsáno na ${formatWeekday(when).toLowerCase()} ${formatDate(when.toISOString())} v ${formatTime(when.toISOString())}${
        agreement ? `, ${agreement.naming.displayName}` : ''
      }. Délku jsem dala hodinu a půl — dá se přepsat.`,
      did: { label: 'Vrátit zpět', undo: () => ctx.removeEvent(id) },
      links: agreement
        ? [{ label: agreement.naming.displayName, detail: 'otevřít rodinu', route: `/rodina/${agreement.id}` }]
        : [],
    }
  }

  /* 2. Kdy nejpozději u koho -------------------------------------------- */
  if (/\bkdy\b|nejpozdeji|termin/.test(q)) {
    const agreement = findAgreement(question, orgId)
    if (agreement) {
      const due = data.obligationsOfAgreement(orgId, agreement.id).filter((o) => o.status !== 'met')
      if (due.length === 0) {
        return { text: `U rodiny ${agreement.naming.displayName} teď neběží žádná lhůta.` }
      }
      const first = due[0]!
      const rest = due.slice(1, 4)
      return {
        text:
          `Nejpozději ${formatDate(first.dueOn)} — ${dueLabel(first.dueOn)}. ` +
          `Jde o osobní styk s ${first.subjectDisplayName}.` +
          (rest.length ? ' Další lhůty téže rodiny jsou níž.' : ''),
        links: [
          {
            label: agreement.naming.displayName,
            detail: `spis ${first.caseFileReference}`,
            route: `/rodina/${agreement.id}`,
          },
          ...rest.map((o) => ({
            label: `${o.subjectDisplayName} — ${formatDate(o.dueOn)}`,
            detail: dueLabel(o.dueOn),
            route: `/rodina/${agreement.id}`,
          })),
        ],
      }
    }
  }

  /* 3. Co mám dnes ------------------------------------------------------- */
  if (/\b(dnes|dnesek|dneska|program|agenda)\b/.test(q)) {
    const today = new Date().toDateString()
    const events = data
      .events(orgId)
      .filter((e) => (!mine || e.ownerPersonId === mine) && new Date(e.startAt).toDateString() === today)
      .sort((a, b) => a.startAt.localeCompare(b.startAt))
    const tasks = data
      .tasks(orgId)
      .filter((t) => (!mine || t.assigneePersonId === mine) && t.status === 'open')
    const overdue = tasks.filter((t) => t.dueOn && new Date(t.dueOn) < new Date())

    if (events.length === 0 && tasks.length === 0) return { text: 'Dnes nemáte nic.' }
    return {
      text:
        `Dnes ${events.length === 0 ? 'nemáte žádnou schůzku' : `máte ${events.length} ${events.length === 1 ? 'schůzku' : events.length < 5 ? 'schůzky' : 'schůzek'}`}` +
        `${overdue.length ? `, ${overdue.length} úkol${overdue.length === 1 ? '' : 'y'} po termínu` : ''}.`,
      links: events.map((e) => ({
        label: e.title,
        detail: e.allDay ? 'celý den' : `${formatTime(e.startAt)}–${formatTime(e.endAt)}`,
        route: e.caseFileId ? `/spis/${e.caseFileId}` : '/dnes',
      })),
    }
  }

  /* 4. Co mi utíká ------------------------------------------------------- */
  if (/(utik|po termin|zmesk|propadl|prusvih|resta)/.test(q)) {
    const files = mine
      ? new Set(
          data.caseFiles(orgId).filter((c) => c.keyWorkerPersonId === mine).map((c) => c.agreementId),
        )
      : null
    const late = data
      .obligations(orgId)
      .filter((o) => o.status === 'overdue' && (!files || files.has(o.agreementId)))
      .sort((a, b) => a.dueOn.localeCompare(b.dueOn))
    if (late.length === 0) return { text: 'Nic po termínu. ' }
    return {
      text: `Po termínu ${late.length === 1 ? 'je jedna lhůta' : `jsou ${late.length} lhůty`}.`,
      links: late.slice(0, 8).map((o) => ({
        label: `${o.subjectDisplayName}`,
        detail: `${formatDate(o.dueOn)} · ${dueLabel(o.dueOn)}`,
        route: `/rodina/${o.agreementId}`,
      })),
    }
  }

  /* 5. Ukaž rodinu ------------------------------------------------------- */
  const agreement = findAgreement(question, orgId)
  if (agreement) {
    const file = data.caseFileOfAgreement(orgId, agreement.id)
    const kids = data.childrenOfAgreement(orgId, agreement.id)
    return {
      text: `${agreement.naming.displayName}, ${childCountLabel(kids.length)}${
        file ? `, spis ${file.reference}` : ''
      }.`,
      links: [
        { label: 'Otevřít rodinu', detail: agreement.reference, route: `/rodina/${agreement.id}` },
        ...kids.map((c) => ({
          label: c.displayName,
          detail: `nar. ${formatDate(c.birthDate)}`,
          route: `/rodina/${agreement.id}`,
        })),
      ],
    }
  }

  /* 6. Když nerozumím — nabídnu, co umím, a nekárám (dok. 16) ------------ */
  return {
    text: 'Tohle zatím neumím přečíst. Umím odpovědět na termíny a lhůty, ukázat rodinu nebo zapsat schůzku do kalendáře.',
    links: [],
  }
}

/** Návrhy pod prázdným chatem — ukazují, co se dá říct. */
export const SUGGESTIONS = [
  'Co mám dnes?',
  'Co mi utíká?',
  'Kdy se nejpozději musím stavit u…',
  'Zapiš návštěvu v pátek ve tři',
]
