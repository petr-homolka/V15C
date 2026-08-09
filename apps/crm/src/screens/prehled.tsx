/**
 * Přehled — první obrazovka pro vedení, druhá pro Klíčovou osobu.
 *
 * Ukazatele nahoře nejsou ozdoba. Každý z nich odpovídá na otázku, kterou
 * si člověk stejně položí, jen by na ni musel klikat: **kolik toho mám, co
 * hoří, co mě čeká, kolik dětí je v péči.** Pod nimi je to, co s tím udělat.
 *
 * Číslo bez cesty dál je k ničemu, takže každá dlaždice někam vede.
 */

import { useMemo, useState } from 'react'
import { Area, Donut, Spark } from '../charts'
import * as data from '../demo/data'
import * as L from '../labels'
import { usePersona } from '../persona'
import { listOf } from '../shell'
import {
  Card, Chip, Due, Grid, Note, PageHead, Row, Screen, Stack, Table, Td, Tr,
  daysUntil, formatDate, formatTime,
} from '../ui'

/** Období, za které se čtou grafy. Delší okno = plošší křivka, ne jiná data. */
const PERIODS = [
  { months: 3, label: '3 měsíce' },
  { months: 6, label: '6 měsíců' },
  { months: 12, label: '12 měsíců' },
] as const

export function Prehled({ go }: { go: (r: string) => void }) {
  const [months, setMonths] = useState<number>(6)
  const { persona } = usePersona()
  const orgId = persona.organizationId!
  const mine = persona.role === 'key_worker' ? persona.personId : null

  const agreements = useMemo(() => listOf('dohody', orgId, persona), [orgId, persona])
  const children = useMemo(() => listOf('deti', orgId, persona), [orgId, persona])

  const files = mine
    ? new Set(data.caseFiles(orgId).filter((c) => c.keyWorkerPersonId === mine).map((c) => c.agreementId))
    : null

  const obligations = data
    .obligations(orgId)
    .filter((o) => o.status !== 'met' && (!files || files.has(o.agreementId)))
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn))

  const overdue = obligations.filter((o) => daysUntil(o.dueOn) < 0)
  const thisWeek = obligations.filter((o) => {
    const d = daysUntil(o.dueOn)
    return d >= 0 && d <= 7
  })

  const upcoming = data
    .events(orgId)
    .filter((e) => (!mine || e.ownerPersonId === mine) && new Date(e.startAt) >= new Date())
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 5)

  /** Návštěvy po měsících — poslední sloupec je tento měsíc. */
  const visits = useMemo(() => {
    const out: Array<{ label: string; n: number }> = []
    const names = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro']
    const now = new Date()
    for (let i = months - 1; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const n = data
        .events(orgId)
        .filter((e) => (!mine || e.ownerPersonId === mine) && e.kind === 'visit')
        .filter((e) => {
          const at = new Date(e.startAt)
          return at >= from && at < to
        }).length
      out.push({ label: names[from.getMonth()]!, n })
    }
    return out
  }, [orgId, mine, months])

  const visitTotal = visits.reduce((sum, v) => sum + v.n, 0)
  const visitDelta = (visits.at(-1)?.n ?? 0) - (visits.at(-2)?.n ?? 0)

  /**
   * Kolik dohod bylo ve správě na konci každého z uplynulých měsíců. Počítá
   * se z data uzavření — je to skutečná řada, ne dokreslená křivka.
   */
  const agreementTrend = useMemo(() => {
    const now = new Date()
    const rows = mine ? data.agreementsOfKeyWorker(orgId, mine) : data.agreements(orgId)
    return Array.from({ length: months }, (_, i) => {
      const to = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i) + 1, 1)
      return rows.filter((a) => a.concludedOn && new Date(a.concludedOn) < to).length
    })
  }, [orgId, mine, months])

  /** Lhůty den po dni na týden dopředu — tvar toho, co přijde. */
  const weekTrend = useMemo(
    () =>
      Array.from({ length: 8 }, (_, d) => obligations.filter((o) => daysUntil(o.dueOn) === d).length),
    [obligations],
  )

  /** Rozdělení dohod podle druhu péče. */
  const byBasis = useMemo(() => {
    const tones = [
      'var(--ds-purple-700)',
      'var(--ds-blue-700)',
      'var(--ds-teal-700)',
      'var(--ds-amber-700)',
      'var(--ds-gray-600)',
    ]
    const map = new Map<string, number>()
    for (const a of agreements) {
      const k = a.note ?? '—'
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return [...map]
      .sort((x, y) => y[1] - x[1])
      .slice(0, 5)
      .map(([label, value], i) => ({ label, value, tone: tones[i]! }))
  }, [agreements])

  /** Rozložení podle obcí — kam se nejvíc jezdí. */
  const byTown = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of agreements) {
      const t = a.town ?? 'Bez adresy'
      map.set(t, (map.get(t) ?? 0) + 1)
    }
    return [...map].sort((x, y) => y[1] - x[1]).slice(0, 6)
  }, [agreements])
  const maxTown = Math.max(1, ...byTown.map(([, n]) => n))

  return (
    <Screen wide>
      <PageHead
        title={`Dobrý den, ${persona.displayName.split(' ')[0]}.`}
        subtitle={persona.role === 'key_worker' ? 'Vaše agenda' : persona.organizationName}
        actions={
          <>
            {/*
              Ovladače u nadpisu — období vlevo, vývoz vpravo. Zvolené období
              je bílá pilulka v zapuštěné liště: pozná se i na statickém
              obrázku, což podtržítko neumí.
            */}
            <div className="flex rounded-lg bg-[var(--ds-gray-200)] p-0.5">
              {PERIODS.map((p) => (
                <button
                  key={p.months}
                  type="button"
                  onClick={() => setMonths(p.months)}
                  className={`text-label-13 rounded-md px-2.5 py-1 transition-colors ${
                    months === p.months
                      ? 'bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-[var(--ds-shadow-border-small)]'
                      : 'text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => exportObligations(obligations)}
              className="kt-btn kt-btn-outline kt-btn-sm"
              title="Stáhne otevřené lhůty jako CSV"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 17v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2" />
              </svg>
              Vývoz
            </button>
          </>
        }
      />

      <Stack>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Tile
            icon="home"
            label="Dohody ve správě"
            value={agreements.length}
            note={`${children.length} dětí v péči`}
            spark={agreementTrend}
            onClick={() => go('/seznam/dohody')}
          />
          <Tile
            icon="alert"
            label="Po termínu"
            value={overdue.length}
            note={overdue.length ? 'vyžaduje pozornost' : 'nic nechybí'}
            tone={overdue.length ? 'red' : 'green'}
            onClick={() => go('/seznam/dohody')}
          />
          <Tile
            icon="clock"
            label="Lhůty tento týden"
            value={thisWeek.length}
            note="do sedmi dnů"
            tone={thisWeek.length ? 'amber' : 'neutral'}
            spark={weekTrend}
            onClick={() => go('/seznam/dohody')}
          />
          <Tile
            icon="calendar"
            label={`Návštěvy za ${PERIODS.find((p) => p.months === months)!.label}`}
            value={visitTotal}
            spark={visits.map((v) => v.n)}
            note={
              visitDelta === 0
                ? 'stejně jako předchozí měsíc'
                : `${visitDelta > 0 ? '+' : ''}${visitDelta} oproti minulému měsíci`
            }
            tone={visitDelta >= 0 ? 'green' : 'amber'}
            onClick={() => go('/dnes')}
          />
        </div>

        <Grid>
          <Card title="Návštěvy po měsících" padded>
            <Area points={visits.map((v) => v.n)} labels={visits.map((v) => v.label)} />
          </Card>

          <Card title="Podle druhu péče" padded>
            <Donut slices={byBasis} total={agreements.length} caption="Rozdělení dohod podle druhu péče" />
          </Card>
        </Grid>

        <Card
          table
          title="Co hoří"
          action={<Chip tone={overdue.length ? 'red' : 'green'}>{obligations.length} otevřených lhůt</Chip>}
          footer={
            <>
              <span>Řazeno podle termínu</span>
              <button
                type="button"
                onClick={() => go('/seznam/dohody')}
                className="kt-link kt-link-sm"
              >
                Celý seznam
              </button>
            </>
          }
        >
          {obligations.length === 0 ? (
            <Note>Žádná lhůta neběží.</Note>
          ) : (
            <Table
              columns={[
                { label: 'Povinnost' },
                { label: 'Koho se týká', hide: 'sm' },
                { label: 'Spis', hide: 'md' },
                { label: 'Termín', align: 'right' },
              ]}
            >
              {obligations.slice(0, 8).map((o) => (
                <Tr key={o.id} onClick={() => go(`/rodina/${o.agreementId}`)}>
                  <Td>{L.obligationKind(o.kind)}</Td>
                  <Td hide="sm" muted>
                    {o.subjectDisplayName}
                  </Td>
                  <Td hide="md" muted>
                    {o.caseFileReference}
                  </Td>
                  <Td align="right">
                    <Due iso={o.dueOn} />
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>

        <Grid>
          <Card title="Nejbližší schůzky">
            {upcoming.length === 0 ? (
              <Note>Nic naplánovaného.</Note>
            ) : (
              upcoming.map((e) => (
                <Row
                  key={e.id}
                  title={e.title}
                  subtitle={`${formatDate(e.startAt)}${e.allDay ? '' : ` · ${formatTime(e.startAt)}`}${
                    e.travelMinutesEstimate ? ` · cesta ${e.travelMinutesEstimate} min` : ''
                  }`}
                  onClick={e.caseFileId ? () => go(`/spis/${e.caseFileId}`) : undefined}
                />
              ))
            )}
          </Card>

          <Card title="Kam se jezdí" padded>
            {byTown.length === 0 ? (
              <p className="text-copy-14 text-[var(--muted-foreground)]">Zatím nic.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {byTown.map(([town, n]) => (
                  <div key={town} className="flex items-center gap-3">
                    <span className="text-copy-14 w-28 shrink-0 truncate text-[var(--ds-gray-1000)]">
                      {town}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--ds-gray-200)]">
                      <span
                        className="block h-full rounded-full bg-[var(--ds-purple-700)]"
                        style={{ width: `${(n / maxTown) * 100}%` }}
                      />
                    </span>
                    <span className="text-copy-13 w-6 shrink-0 text-right tabular-nums text-[var(--muted-foreground)]">
                      {n}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Grid>
      </Stack>
    </Screen>
  )
}

/**
 * Dlaždice s číslem. Barva jen tehdy, když číslo něco znamená — nula po
 * termínu je zelená, protože to je dobrá zpráva; deset je červená.
 */
const TILE_ICONS: Record<string, string> = {
  home: 'M4 11l8-6 8 6v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8Z',
  alert: 'M12 9v4m0 4h.01M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  clock: 'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  calendar: 'M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
}

function Tile({
  label,
  value,
  note,
  tone = 'neutral',
  small,
  icon,
  spark,
  onClick,
}: {
  label: string
  value: string | number
  note?: string
  tone?: 'neutral' | 'red' | 'amber' | 'green'
  small?: boolean
  icon?: keyof typeof TILE_ICONS | string
  /** Skutečná řada za číslem — jiskřička se kreslí jen tam, kde ji máme. */
  spark?: number[]
  onClick?: () => void
}) {
  const color =
    tone === 'red'
      ? 'text-[var(--ds-red-700)]'
      : tone === 'amber'
        ? 'text-[var(--ds-amber-900)]'
        : tone === 'green'
          ? 'text-[var(--ds-green-700)]'
          : 'text-[var(--ds-gray-1000)]'
  return (
    <button
      type="button"
      onClick={onClick}
      className="kt-card kt-card-soft p-4 text-left transition-colors hover:bg-[var(--ds-gray-100)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-copy-13 text-[var(--muted-foreground)]">{label}</div>
        {icon ? (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              tone === 'red'
                ? 'bg-[var(--ds-red-100)] text-[var(--ds-red-700)]'
                : tone === 'amber'
                  ? 'bg-[var(--ds-amber-100)] text-[var(--ds-amber-900)]'
                  : tone === 'green'
                    ? 'bg-[var(--ds-green-100)] text-[var(--ds-green-700)]'
                    : 'bg-[var(--ds-purple-100)] text-[var(--ds-purple-700)]'
            }`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={TILE_ICONS[icon] ?? TILE_ICONS.home!} />
            </svg>
          </span>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className={`${small ? 'text-heading-20' : 'text-heading-32'} pt-1 tabular-nums ${color}`}>
          {value}
        </div>
        {spark && spark.some((n) => n > 0) ? (
          <Spark
            points={spark}
            tone={
              tone === 'red'
                ? 'var(--ds-red-700)'
                : tone === 'amber'
                  ? 'var(--ds-amber-700)'
                  : tone === 'green'
                    ? 'var(--ds-green-700)'
                    : 'var(--ds-purple-700)'
            }
          />
        ) : null}
      </div>
      {note ? (
        <div className="text-copy-13 truncate pt-0.5 text-[var(--muted-foreground)]">{note}</div>
      ) : null}
    </button>
  )
}

/**
 * Vývoz otevřených lhůt do CSV. Středník a BOM proto, že to lidé otevřou
 * v Excelu s českým prostředím — čárka by rozhodila sloupce.
 */
function exportObligations(rows: Array<{
  kind: string
  subjectDisplayName: string
  caseFileReference: string
  dueOn: string
}>) {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`
  const csv = [
    ['Povinnost', 'Koho se týká', 'Spis', 'Termín'].map(esc).join(';'),
    ...rows.map((o) =>
      [L.obligationKind(o.kind as never), o.subjectDisplayName, o.caseFileReference, o.dueOn]
        .map((v) => esc(String(v ?? '')))
        .join(';'),
    ),
  ].join('\r\n')

  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'lhuty.csv'
  a.click()
  URL.revokeObjectURL(url)
}
