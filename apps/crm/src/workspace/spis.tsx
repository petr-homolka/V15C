/**
 * Rozvržení B — spis jako dokument.
 *
 * ┌───────────────────────────────────────────────────────────────────┐
 * │ V ČEM SE LIŠÍ OD ROZVRŽENÍ A                                      │
 * │                                                                   │
 * │ A: navigace vlevo → seznam → karta. Obrazovka je **rejstřík**.    │
 * │ B: žádná navigace. Obrazovka je **jeden spis**, čte se shora dolů │
 * │    jako dokument a mezi spisy se skáče psaním (příkazový řádek).  │
 * │                                                                   │
 * │ Uprostřed je **jedna časová osa** — návštěvy, poznámky, výdaje,   │
 * │ dokumenty, lhůty i schůzky promíchané podle data, protože takhle  │
 * │ se ta práce odehrála. V rozvržení A jsou tytéž věci ve čtyřech    │
 * │ záložkách a člověk si pořadí musí složit v hlavě.                 │
 * │                                                                   │
 * │ Vpravo stojí fakta, která se při čtení nesmí ztratit: kdo je      │
 * │ v rodině, co běží, kde to je.                                     │
 * └───────────────────────────────────────────────────────────────────┘
 */

import { useMemo } from 'react'
import * as data from '../demo/data'
import { Face } from '../face'
import * as L from '../labels'
import { useLocal } from '../local'
import { usePersona } from '../persona'
import {
  Chip, Due, childCountLabel, daysUntil, dueBadge, dueTone, formatDate, formatTime,
} from '../ui'

type Kind = 'visit' | 'note' | 'expense' | 'document' | 'obligation' | 'event' | 'other'

interface Moment {
  id: string
  at: string
  kind: Kind
  title: string
  body: string | null
  meta: string | null
  future: boolean
}

const ICONS: Record<Kind, string> = {
  visit: 'M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  note: 'M5 4h11l3 3v13H5V4Zm3 6h8M8 14h8',
  expense: 'M12 3v18M8 7h6a2.5 2.5 0 0 1 0 5h-4a2.5 2.5 0 0 0 0 5h6',
  document: 'M6 3h8l4 4v14H6V3Zm8 0v4h4',
  obligation: 'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  event: 'M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
  other: 'M12 6v12M6 12h12',
}

const KIND_OF_ENTRY: Record<string, Kind> = {
  monitoring_contact: 'visit',
  note: 'note',
  expense: 'expense',
  dictation: 'note',
  education_record: 'other',
  care_episode: 'other',
  contact_event: 'visit',
}

export function Spis({ id, go }: { id: string; go: (r: string) => void }) {
  const { persona } = usePersona()
  const local = useLocal()
  const orgId = persona.organizationId!

  const agreement = data.agreements(orgId).find((a) => a.id === id)
  const file = agreement ? data.caseFileOfAgreement(orgId, id) : null

  const moments = useMemo<Moment[]>(() => {
    if (!agreement || !file) return []
    const now = new Date().toISOString()
    const out: Moment[] = []

    for (const e of data.entries(orgId, file.id)) {
      out.push({
        id: e.id,
        at: e.occurredAt,
        kind: KIND_OF_ENTRY[e.kind] ?? 'other',
        title: L.entryKind(e.kind),
        body: e.summary,
        meta: e.place ?? null,
        future: false,
      })
    }
    for (const d of data.documents(orgId, file.id)) {
      out.push({
        id: d.id,
        at: d.createdAt,
        kind: 'document',
        title: d.title,
        body: null,
        meta: L.documentCategory(d.category),
        future: false,
      })
    }
    for (const o of data.obligationsOfAgreement(orgId, id)) {
      out.push({
        id: o.id,
        at: `${o.dueOn}T09:00:00.000Z`,
        kind: 'obligation',
        title: `${L.obligationKind(o.kind)} — ${o.subjectDisplayName}`,
        body: null,
        meta: o.status === 'met' ? 'splněno' : null,
        future: `${o.dueOn}T09:00:00.000Z` > now,
      })
    }
    for (const e of [...data.events(orgId), ...local.events]) {
      if (e.subjectDisplayName !== agreement.naming.displayName) continue
      out.push({
        id: e.id,
        at: e.startAt,
        kind: 'event',
        title: e.title,
        body: null,
        meta: e.allDay ? 'celý den' : `${formatTime(e.startAt)}–${formatTime(e.endAt)}`,
        future: e.startAt > now,
      })
    }

    return out.sort((a, b) => b.at.localeCompare(a.at))
  }, [orgId, id, agreement, file, local.events])

  if (!agreement) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-copy-16 text-[var(--muted-foreground)]">
          Vyberte spis — stiskněte <kbd className="kt-kbd">⌘K</kbd> nebo klepněte na hledání nahoře.
        </p>
      </div>
    )
  }

  const kids = data.childrenOfAgreement(orgId, id)
  const town = data.townOfAgreement(orgId, id)
  const due = data.obligationsOfAgreement(orgId, id).filter((o) => o.status !== 'met')

  // Budoucí věci jdou nad osu, minulost pod ni — čte se to jako kalendář
  // obrácený k dnešku, ne jako archiv.
  const future = moments.filter((m) => m.future).reverse()
  const past = moments.filter((m) => !m.future)

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {/* --- dokument ------------------------------------------------- */}
      <article className="min-w-0">
        <header className="pb-6">
          <div className="flex items-center gap-3">
            <Face uid={id} kind="family" name={agreement.naming.displayName} size="md" />
            <div className="min-w-0">
              <h1 className="text-heading-32 truncate text-[var(--ds-gray-1000)]">
                {agreement.naming.displayName}
              </h1>
              <p className="text-copy-14 text-[var(--muted-foreground)]">
                {[town, L.custodyBasis(agreement.custodyBasis), childCountLabel(kids.length)]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
        </header>

        {future.length > 0 ? (
          <>
            <Rule label="Co se chystá" />
            <ol className="flex flex-col">
              {future.map((m) => (
                <MomentRow key={m.id} moment={m} />
              ))}
            </ol>
          </>
        ) : null}

        <Rule label="Dnes" today />

        <ol className="flex flex-col">
          {past.map((m) => (
            <MomentRow key={m.id} moment={m} />
          ))}
        </ol>

        {past.length === 0 ? (
          <p className="text-copy-14 py-6 text-[var(--muted-foreground)]">Ve spisu zatím nic není.</p>
        ) : null}
      </article>

      {/* --- fakta, která se při čtení nesmí ztratit -------------------- */}
      <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
        <Panel title="Rodina">
          {agreement.carerPersonIds.map((pid) => {
            const p = data.person(orgId, pid)
            return (
              <PersonLine
                key={pid}
                uid={pid}
                name={p?.displayName ?? pid}
                note={L.carerKind(agreement.carerKind)}
              />
            )
          })}
          {kids.map((c) => (
            <PersonLine
              key={c.id}
              uid={c.id}
              kind="child"
              name={c.displayName}
              note={`${Math.floor(
                (Date.now() - new Date(c.birthDate).getTime()) / (365.25 * 86_400_000),
              )} let`}
            />
          ))}
        </Panel>

        <Panel title={`Co běží (${due.length})`}>
          {due.length === 0 ? (
            <p className="text-copy-13 text-[var(--muted-foreground)]">Nic neběží.</p>
          ) : (
            due.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-2 py-1">
                <span className="text-copy-14 min-w-0 truncate text-[var(--ds-gray-1000)]">
                  {L.obligationKind(o.kind)}
                </span>
                <Due iso={o.dueOn} />
              </div>
            ))
          )}
        </Panel>

        <Panel title="Spis">
          <Fact label="Značka" value={file?.reference ?? '—'} />
          <Fact label="Klíčová osoba" value={file?.keyWorkerDisplayName ?? '—'} />
          <Fact label="Uzavřeno" value={formatDate(agreement.concludedOn)} />
          {file?.archivedOn ? <Fact label="Archivováno" value={formatDate(file.archivedOn)} /> : null}
        </Panel>

        <button
          type="button"
          onClick={() => go(`/rodina/${id}`)}
          className="kt-link kt-link-sm self-start"
        >
          Otevřít v rozvržení A
        </button>
      </aside>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function MomentRow({ moment }: { moment: Moment }) {
  const overdue = moment.kind === 'obligation' && !moment.future && daysUntil(moment.at) < 0
  return (
    <li className="group relative flex gap-4 pb-6">
      {/* Osa: svislá linka, na ní kolečko s ikonou. */}
      <div className="relative flex w-9 shrink-0 justify-center">
        <span className="absolute inset-y-0 top-8 w-px bg-[var(--border)] group-last:hidden" />
        <span
          className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border ${
            overdue
              ? 'border-[var(--ds-red-400)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]'
              : moment.future
                ? 'border-[var(--ds-purple-400)] bg-[var(--ds-purple-100)] text-[var(--ds-purple-700)]'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={ICONS[moment.kind]} />
          </svg>
        </span>
      </div>

      <div className="min-w-0 flex-1 pt-1.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-copy-16 text-[var(--ds-gray-1000)]">{moment.title}</h3>
          <span className="text-copy-13 text-[var(--muted-foreground)]">
            {formatDate(moment.at)}
          </span>
          {moment.meta ? <Chip>{moment.meta}</Chip> : null}
          {overdue ? <Chip tone="red">{dueBadge(moment.at)}</Chip> : null}
        </div>
        {moment.body ? (
          <p className="text-copy-15 max-w-[68ch] pt-1 leading-relaxed text-[var(--ds-gray-900)]">
            {moment.body}
          </p>
        ) : null}
      </div>
    </li>
  )
}

/** Předěl v ose. „Dnes" je jediná linka, která má barvu. */
function Rule({ label, today }: { label: string; today?: boolean }) {
  return (
    <div className="flex items-center gap-3 pb-5 pt-1">
      <span
        className={`text-label-13 ${
          today ? 'text-[var(--ds-purple-700)]' : 'text-[var(--muted-foreground)]'
        }`}
      >
        {label}
      </span>
      <span
        className={`h-px flex-1 ${today ? 'bg-[var(--ds-purple-400)]' : 'bg-[var(--border)]'}`}
      />
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-label-13 pb-2 text-[var(--muted-foreground)]">{title}</h2>
      <div className="flex flex-col">{children}</div>
    </section>
  )
}

function PersonLine({
  uid,
  name,
  note,
  kind = 'person',
}: {
  uid: string
  name: string
  note: string
  kind?: 'person' | 'child'
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <Face uid={uid} name={name} kind={kind} />
      <span className="min-w-0">
        <span className="text-copy-14 block truncate text-[var(--ds-gray-1000)]">{name}</span>
        <span className="text-copy-13 block truncate text-[var(--muted-foreground)]">{note}</span>
      </span>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-copy-13 text-[var(--muted-foreground)]">{label}</span>
      <span className="text-copy-14 truncate text-[var(--ds-gray-1000)]">{value}</span>
    </div>
  )
}
