/**
 * Přehled — první obrazovka pro vedení, druhá pro Klíčovou osobu.
 *
 * Ukazatele nahoře nejsou ozdoba. Každý z nich odpovídá na otázku, kterou
 * si člověk stejně položí, jen by na ni musel klikat: **kolik toho mám, co
 * hoří, co mě čeká, kolik dětí je v péči.** Pod nimi je to, co s tím udělat.
 *
 * Číslo bez cesty dál je k ničemu, takže každá dlaždice někam vede.
 */

import { useMemo } from 'react'
import * as data from '../demo/data'
import * as L from '../labels'
import { usePersona } from '../persona'
import { listOf } from '../shell'
import {
  Card, Chip, Due, Grid, Note, PageHead, Row, Screen, Stack, Table, Td, Tr,
  daysUntil, formatDate, formatTime,
} from '../ui'

export function Prehled({ go }: { go: (r: string) => void }) {
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
      />

      <Stack>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Tile
            label="Dohody ve správě"
            value={agreements.length}
            note={`${children.length} dětí v péči`}
            onClick={() => go('/seznam/dohody')}
          />
          <Tile
            label="Po termínu"
            value={overdue.length}
            note={overdue.length ? 'vyžaduje pozornost' : 'nic nechybí'}
            tone={overdue.length ? 'red' : 'green'}
            onClick={() => go('/seznam/dohody')}
          />
          <Tile
            label="Lhůty tento týden"
            value={thisWeek.length}
            note="do sedmi dnů"
            tone={thisWeek.length ? 'amber' : 'neutral'}
            onClick={() => go('/seznam/dohody')}
          />
          <Tile
            label="Nejbližší schůzka"
            value={upcoming[0] ? formatDate(upcoming[0].startAt) : '—'}
            note={upcoming[0]?.subjectDisplayName ?? 'nic naplánovaného'}
            small
            onClick={() => go('/dnes')}
          />
        </div>

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
function Tile({
  label,
  value,
  note,
  tone = 'neutral',
  small,
  onClick,
}: {
  label: string
  value: string | number
  note?: string
  tone?: 'neutral' | 'red' | 'amber' | 'green'
  small?: boolean
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
      className="kt-card p-4 text-left transition-colors hover:bg-[var(--ds-gray-100)]"
    >
      <div className="text-copy-13 text-[var(--muted-foreground)]">{label}</div>
      <div className={`${small ? 'text-heading-20' : 'text-heading-32'} pt-1 tabular-nums ${color}`}>
        {value}
      </div>
      {note ? (
        <div className="text-copy-13 truncate pt-0.5 text-[var(--muted-foreground)]">{note}</div>
      ) : null}
    </button>
  )
}
