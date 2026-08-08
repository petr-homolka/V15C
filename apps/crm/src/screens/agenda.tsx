/**
 * Denní agenda — úkoly a časová osa dne.
 *
 * Přeneseno z prototypu V10G (`RoutineAgendaView`), ale postavené znovu:
 * uspořádání a chování se přebírá, vzhled jede na tokenech Geistu a data
 * jsou skutečná ze `schema` + `tools/seed`, ne pole v komponentě.
 *
 * Co se převzalo:
 *  – úkoly ve skupinách Po termínu / Dnes / Tento týden / Hotové,
 *  – u každého úkolu vazba na rodinu, dítě nebo osobu,
 *  – rychlé přidání řádkem nahoře,
 *  – 24hodinová osa s čarou aktuálního času,
 *  – celodenní pás nahoře (narozeniny, celodenní události),
 *  – zvýraznění překryvu schůzek.
 *
 * Co se NEpřevzalo: přetahování myší (na mobilu k ničemu, a bez zápisu do
 * databáze by to jen předstíralo, že se něco uložilo) a diktování — to má
 * vlastní návrh (dok. 20) a patří k Eli.
 *
 * Zaškrtnutí a přidání úkolu žijí jen v paměti záložky. Kostra nezapisuje.
 */

import { useMemo, useState } from 'react'
import * as data from '../demo/data'
import { usePersona } from '../persona'
import { AppBar, List, Screen, Section, formatDate } from '../ui'

const HOUR_PX = 56
const DAY_MS = 86_400_000

const dayKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const WEEKDAY = new Intl.DateTimeFormat('cs-CZ', { weekday: 'long' })
const LONG = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
const TIME = new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit' })

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/* ------------------------------------------------------------------ */

export function Agenda({ go }: { go: (r: string) => void }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId!
  const mine = persona.role === 'key_worker'

  const [day, setDay] = useState(() => new Date())
  const [done, setDone] = useState<Set<string>>(new Set())
  const [added, setAdded] = useState<data.TaskRow[]>([])
  const [draft, setDraft] = useState('')

  const allTasks = useMemo(() => {
    const base = data.tasks(orgId)
    return (mine ? base.filter((t) => t.assigneePersonId === persona.personId) : base).concat(added)
  }, [orgId, mine, persona.personId, added])

  const allEvents = useMemo(() => {
    const base = data.events(orgId)
    return mine ? base.filter((e) => e.ownerPersonId === persona.personId) : base
  }, [orgId, mine, persona.personId])

  const today = dayKey(new Date())
  const shown = dayKey(day)

  const dayEvents = allEvents
    .filter((e) => dayKey(new Date(e.startAt)) === shown)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))

  /** Nejbližší den se schůzkou — aby prázdný den nebyl slepá ulička. */
  const nextWithEvents = useMemo(() => {
    const future = allEvents
      .map((e) => dayKey(new Date(e.startAt)))
      .filter((k) => k > shown)
      .sort()
    return future[0] ?? null
  }, [allEvents, shown])

  const groups = groupTasks(allTasks, done, today)

  const birthdays = useMemo(() => {
    const md = `${day.getMonth() + 1}-${day.getDate()}`
    const out: string[] = []
    for (const c of data.children(orgId)) {
      const b = new Date(c.birthDate)
      if (`${b.getMonth() + 1}-${b.getDate()}` === md) {
        out.push(`${c.displayName} — ${day.getFullYear() - b.getFullYear()} let`)
      }
    }
    return out
  }, [orgId, day])

  const addTask = () => {
    const title = draft.trim()
    if (!title) return
    setAdded((prev) => [
      ...prev,
      {
        id: `nový-${prev.length + 1}`,
        title,
        detail: null,
        caseFileId: null,
        caseFileReference: null,
        subjectDisplayName: null,
        assigneePersonId: persona.personId!,
        servesObligationId: null,
        dueOn: today,
        status: 'open',
      },
    ])
    setDraft('')
  }

  return (
    <Screen>
      <AppBar
        title="Agenda"
        subtitle={`${persona.displayName} — ${persona.organizationName}`}
        right={<TinyButton onClick={() => go('/prepnout')}>{persona.roleLabel}</TinyButton>}
      />

      {/* --- rychlé přidání ------------------------------------------- */}
      <div className="px-4 pt-3">
        <div className="material-small flex items-center gap-2 rounded-lg px-3 py-2">
          <span className="text-[var(--ds-gray-700)]">+</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTask()
            }}
            placeholder="Přidat úkol…"
            className="text-copy-14 min-w-0 flex-1 bg-transparent text-[var(--ds-gray-1000)] outline-none placeholder:text-[var(--ds-gray-700)]"
          />
        </div>
      </div>

      {/* --- úkoly ---------------------------------------------------- */}
      {groups.map(([label, list]) =>
        list.length === 0 ? null : (
          <Section key={label} title={`${label} (${list.length})`}>
            <List>
              {list.map((t) => (
                <TaskLine
                  key={t.id}
                  task={t}
                  done={done.has(t.id) || t.status === 'done'}
                  onToggle={() =>
                    setDone((prev) => {
                      const next = new Set(prev)
                      if (next.has(t.id)) next.delete(t.id)
                      else next.add(t.id)
                      return next
                    })
                  }
                  onOpen={() => (t.caseFileId ? go(`/spis/${t.caseFileId}`) : undefined)}
                />
              ))}
            </List>
          </Section>
        ),
      )}

      {/* --- den ------------------------------------------------------ */}
      <Section
        title="Den"
        action={
          <div className="flex items-center gap-1">
            <TinyButton onClick={() => setDay(new Date(day.getTime() - DAY_MS))}>‹</TinyButton>
            <TinyButton onClick={() => setDay(new Date())}>dnes</TinyButton>
            <TinyButton onClick={() => setDay(new Date(day.getTime() + DAY_MS))}>›</TinyButton>
          </div>
        }
      >
        <div className="text-label-14 pb-2 text-[var(--ds-gray-1000)]">
          {cap(WEEKDAY.format(day))} {LONG.format(day)}
        </div>

        {birthdays.length > 0 || dayEvents.some((e) => e.allDay) ? (
          <div className="mb-2 flex flex-col gap-1">
            {birthdays.map((b) => (
              <AllDay key={b} tone="purple">
                Narozeniny: {b}
              </AllDay>
            ))}
            {dayEvents
              .filter((e) => e.allDay)
              .map((e) => (
                <AllDay key={e.id} tone="amber">
                  {e.title}
                </AllDay>
              ))}
          </div>
        ) : null}

        {dayEvents.length === 0 ? (
          <div className="material-small rounded-lg px-4 py-6">
            <p className="text-copy-14 text-[var(--ds-gray-900)]">
              Na tenhle den nic naplánovaného.
            </p>
            {nextWithEvents ? (
              <div className="pt-3">
                <TinyButton onClick={() => setDay(new Date(nextWithEvents))}>
                  Nejbližší den se schůzkou: {formatDate(nextWithEvents)}
                </TinyButton>
              </div>
            ) : null}
          </div>
        ) : (
          <Timeline
            events={dayEvents.filter((e) => !e.allDay)}
            showNow={shown === today}
            onOpen={(e) => (e.caseFileId ? go(`/spis/${e.caseFileId}`) : undefined)}
          />
        )}
      </Section>

      <div className="h-10" />
    </Screen>
  )
}

/* ------------------------------------------------------------------ */
/* Úkoly                                                               */
/* ------------------------------------------------------------------ */

function groupTasks(
  tasks: data.TaskRow[],
  done: Set<string>,
  today: string,
): Array<[string, data.TaskRow[]]> {
  const week = dayKey(new Date(Date.now() + 7 * DAY_MS))
  const overdue: data.TaskRow[] = []
  const now: data.TaskRow[] = []
  const soon: data.TaskRow[] = []
  const later: data.TaskRow[] = []
  const finished: data.TaskRow[] = []

  for (const t of tasks) {
    if (done.has(t.id) || t.status === 'done') finished.push(t)
    else if (!t.dueOn) later.push(t)
    else if (t.dueOn < today) overdue.push(t)
    else if (t.dueOn === today) now.push(t)
    else if (t.dueOn <= week) soon.push(t)
    else later.push(t)
  }

  const byDue = (a: data.TaskRow, b: data.TaskRow) => (a.dueOn ?? '').localeCompare(b.dueOn ?? '')
  return [
    ['Po termínu', overdue.sort(byDue)],
    ['Dnes', now],
    ['Tento týden', soon.sort(byDue)],
    ['Později', later.sort(byDue)],
    ['Hotové', finished],
  ]
}

function TaskLine({
  task,
  done,
  onToggle,
  onOpen,
}: {
  task: data.TaskRow
  done: boolean
  onToggle: () => void
  onOpen: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        onClick={onToggle}
        aria-label={done ? 'Vrátit zpět' : 'Hotovo'}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] ${
          done
            ? 'bg-[var(--ds-blue-700)] text-white'
            : 'shadow-[var(--ds-shadow-border-small)]'
        }`}
      >
        {done ? '✓' : ''}
      </button>

      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div
          className={`text-label-15 truncate ${
            done
              ? 'text-[var(--ds-gray-700)] line-through'
              : 'text-[var(--ds-gray-1000)]'
          }`}
        >
          {task.title}
        </div>
        {task.subjectDisplayName || task.caseFileReference ? (
          <div className="text-copy-13 truncate text-[var(--ds-gray-900)]">
            {task.subjectDisplayName ?? task.caseFileReference}
          </div>
        ) : null}
      </button>

      {task.dueOn ? (
        <span className="text-label-12 shrink-0 text-[var(--ds-gray-900)]">
          {formatDate(task.dueOn)}
        </span>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Časová osa                                                          */
/* ------------------------------------------------------------------ */

interface Placed {
  event: data.EventRow
  top: number
  height: number
  column: number
  columns: number
}

/**
 * Rozvržení dne. Překrývající se schůzky se rozdělí do sloupců vedle sebe —
 * překryv je informace („tady to nevyjde"), ne chyba, kterou by měl systém
 * odmítnout uložit (dok. 16).
 */
function layout(events: data.EventRow[]): Placed[] {
  const items = events.map((event) => {
    const s = new Date(event.startAt)
    const e = new Date(event.endAt)
    const startMin = s.getHours() * 60 + s.getMinutes()
    const endMin = Math.max(startMin + 15, e.getHours() * 60 + e.getMinutes())
    return { event, startMin, endMin }
  })

  const placed: Placed[] = []
  let cluster: typeof items = []

  const flush = () => {
    if (cluster.length === 0) return
    const columns: Array<typeof items> = []
    for (const item of cluster) {
      let col = columns.findIndex((c) => c.every((x) => x.endMin <= item.startMin))
      if (col === -1) {
        columns.push([item])
        col = columns.length - 1
      } else {
        columns[col]!.push(item)
      }
      placed.push({
        event: item.event,
        top: (item.startMin * HOUR_PX) / 60,
        height: Math.max(28, ((item.endMin - item.startMin) * HOUR_PX) / 60),
        column: col,
        columns: 0,
      })
    }
    const count = columns.length
    for (const p of placed.slice(-cluster.length)) p.columns = count
    cluster = []
  }

  let clusterEnd = -1
  for (const item of items) {
    if (cluster.length > 0 && item.startMin >= clusterEnd) flush()
    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, item.endMin)
  }
  flush()
  return placed
}

function Timeline({
  events,
  showNow,
  onOpen,
}: {
  events: data.EventRow[]
  showNow: boolean
  onOpen: (e: data.EventRow) => void
}) {
  const placed = layout(events)
  const first = Math.max(0, Math.min(...placed.map((p) => Math.floor(p.top / HOUR_PX))) - 1)
  const last = Math.min(24, Math.max(...placed.map((p) => Math.ceil((p.top + p.height) / HOUR_PX))) + 1)
  const hours = Array.from({ length: last - first }, (_, i) => first + i)

  const now = new Date()
  const nowTop = ((now.getHours() * 60 + now.getMinutes()) * HOUR_PX) / 60 - first * HOUR_PX
  const nowVisible = showNow && now.getHours() >= first && now.getHours() < last

  return (
    <div className="material-small relative overflow-hidden rounded-lg">
      <div className="relative" style={{ height: hours.length * HOUR_PX }}>
        {hours.map((h, i) => (
          <div
            key={h}
            className="absolute left-0 right-0 border-t border-[var(--ds-gray-alpha-400)]"
            style={{ top: i * HOUR_PX }}
          >
            <span className="text-label-12 absolute -top-2 left-2 bg-[var(--ds-background-100)] px-1 text-[var(--ds-gray-700)]">
              {String(h).padStart(2, '0')}:00
            </span>
          </div>
        ))}

        {placed.map((p) => {
          const width = 100 / p.columns
          const clash = p.columns > 1
          return (
            <button
              key={p.event.id}
              type="button"
              onClick={() => onOpen(p.event)}
              className={`absolute overflow-hidden rounded-md px-2 py-1 text-left ${
                clash
                  ? 'bg-[var(--ds-red-100)] shadow-[0_0_0_1px_var(--ds-red-400)]'
                  : 'bg-[var(--ds-blue-100)] shadow-[0_0_0_1px_var(--ds-blue-400)]'
              }`}
              style={{
                top: p.top - first * HOUR_PX,
                height: p.height,
                left: `calc(3.5rem + ${p.column * width}% * 0.85)`,
                width: `calc(${width}% * 0.85 - 0.5rem)`,
              }}
            >
              {clash ? (
                <span className="text-label-12 block text-[var(--ds-red-900)]">Překryv</span>
              ) : null}
              <span className="text-label-13 block truncate text-[var(--ds-gray-1000)]">
                {p.event.title}
              </span>
              <span className="text-copy-13 block truncate text-[var(--ds-gray-900)]">
                {TIME.format(new Date(p.event.startAt))}–{TIME.format(new Date(p.event.endAt))}
                {p.event.travelMinutesEstimate
                  ? ` · cesta ${p.event.travelMinutesEstimate} min`
                  : ''}
              </span>
            </button>
          )
        })}

        {nowVisible ? (
          <div
            className="pointer-events-none absolute left-0 right-0 flex items-center gap-1"
            style={{ top: nowTop }}
          >
            <span className="text-label-12 rounded-full bg-[var(--ds-red-700)] px-1.5 text-white">
              {TIME.format(now)}
            </span>
            <div className="h-px flex-1 bg-[var(--ds-red-700)]" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function AllDay({ tone, children }: { tone: 'amber' | 'purple'; children: React.ReactNode }) {
  const cls =
    tone === 'amber'
      ? 'bg-[var(--ds-amber-100)] text-[var(--ds-amber-900)]'
      : 'bg-[var(--ds-purple-100)] text-[var(--ds-purple-900)]'
  return <div className={`text-label-13 truncate rounded-md px-3 py-2 ${cls}`}>{children}</div>
}

function TinyButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-button-14 inline-flex h-8 shrink-0 items-center rounded-md bg-[var(--ds-background-100)] px-2.5 text-[var(--ds-gray-1000)] shadow-[var(--ds-shadow-border-small)]"
    >
      {children}
    </button>
  )
}
