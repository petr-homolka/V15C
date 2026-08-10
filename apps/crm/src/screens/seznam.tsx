/**
 * Seznam na plochu — tabulka.
 *
 * Tabulka není ozdoba: dvacet rodin se porovnává po sloupcích (kde to je,
 * kdo to má, do kdy). Na mobilu se místo ní vykreslí řádky s tím podstatným,
 * protože šest sloupců na 390 px není tabulka, ale hlavolam.
 *
 * Filtr a seskupení jsou nad tabulkou v jednom pruhu — Klíčová osoba mění
 * pohled častěji, než hledá jméno.
 */

import { useMemo, useState } from 'react'
import { Face } from '../face'
import { usePersona } from '../persona'
import { SEGMENTS, fold, listOf, type Item, type Segment } from '../shell'
import type { Column } from '../ui'
import {
  Button, Card, Chip, Due, Field, Pager, PageHead, Row, Screen, Table, Td, Tr,
  daysUntil, type Sorting,
} from '../ui'

type Grouping = 'zadne' | 'obec' | 'termin'

const GROUPINGS: Array<[Grouping, string]> = [
  ['zadne', 'Bez seskupení'],
  ['obec', 'Podle obce'],
  ['termin', 'Podle termínu'],
]

const COLUMNS: Record<Segment, Column[]> = {
  dohody: [
    { label: 'Rodina', sort: 'name' },
    { label: 'Obec', hide: 'sm', sort: 'town' },
    { label: 'Druh péče', hide: 'md', sort: 'note' },
    { label: 'Klíčová osoba', hide: 'md', sort: 'extra' },
    { label: 'Nejbližší lhůta', align: 'right', sort: 'due' },
  ],
  pestouni: [
    { label: 'Jméno', sort: 'name' },
    { label: 'Obec', hide: 'sm', sort: 'town' },
    { label: 'Postavení', hide: 'md', sort: 'note' },
    { label: 'Rodina', hide: 'md', sort: 'extra' },
    { label: 'Nejbližší lhůta', align: 'right', sort: 'due' },
  ],
  deti: [
    { label: 'Jméno', sort: 'name' },
    { label: 'Obec', hide: 'sm', sort: 'town' },
    { label: 'Věk', hide: 'md', sort: 'note' },
    { label: 'Rodina', hide: 'md', sort: 'extra' },
    { label: 'Nejbližší lhůta', align: 'right', sort: 'due' },
  ],
  tym: [
    { label: 'Jméno', sort: 'name' },
    { label: 'Obec', hide: 'sm', sort: 'town' },
    { label: 'Role', hide: 'md', sort: 'note' },
    { label: 'Ve správě', hide: 'md', sort: 'extra' },
    { label: '', align: 'right' },
  ],
}

const PER_PAGE = 12

export function Seznam({ segment, go }: { segment: Segment; go: (r: string) => void }) {
  const { persona } = usePersona()
  const [q, setQ] = useState('')
  const [grouping, setGrouping] = useState<Grouping>('zadne')
  const [sorting, setSorting] = useState<Sorting>({ by: 'name', dir: 'asc' })
  const [page, setPage] = useState(1)

  // Změna filtru nebo řazení vrací na první stránku — jinak by člověk zíral
  // na prázdno, protože sedmá stránka po zúžení neexistuje.
  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPage(1)
  }

  const items = useMemo(
    () => listOf(segment, persona.organizationId, persona),
    [segment, persona],
  )
  const shown = q.trim()
    ? items.filter((i) => fold(`${i.name} ${i.town ?? ''} ${i.extra ?? ''}`).includes(fold(q.trim())))
    : items

  const sorted = [...shown].sort((a, b) => {
    const dir = sorting.dir === 'asc' ? 1 : -1
    if (sorting.by === 'due') {
      // Bez termínu patří na konec v obou směrech — je to „nic", ne „nejdřív".
      if (!a.dueOn) return 1
      if (!b.dueOn) return -1
      return a.dueOn.localeCompare(b.dueOn) * dir
    }
    const key = sorting.by as 'name' | 'town' | 'note' | 'extra'
    return (a[key] ?? '').localeCompare(b[key] ?? '', 'cs') * dir
  })

  // Stránkuje se jen bez seskupení; skupiny jsou samy o sobě porcování.
  const paged =
    grouping === 'zadne' ? sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE) : sorted
  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))

  const groups = group(paged, grouping)
  const label = SEGMENTS.find(([k]) => k === segment)?.[1] ?? 'Seznam'

  return (
    <Screen wide>
      <PageHead
        title={label}
        subtitle={`${items.length} záznamů${persona.role === 'key_worker' ? ' ve vaší správě' : ''}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-52">
              <Field value={q} onChange={change(setQ)} placeholder="Hledat" />
            </div>
            {GROUPINGS.map(([key, text]) => (
              <Button
                key={key}
                size="sm"
                variant={key === grouping ? 'primary' : 'secondary'}
                onClick={() => change(setGrouping)(key)}
              >
                {text}
              </Button>
            ))}
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        {groups.map(([title, rows]) => (
          <Card
            key={title}
            title={grouping === 'zadne' ? undefined : title}
            table
            footer={
              grouping === 'zadne' ? (
                <Pager
                  page={page}
                  pages={pages}
                  from={(page - 1) * PER_PAGE + 1}
                  to={Math.min(page * PER_PAGE, sorted.length)}
                  total={sorted.length}
                  onPage={setPage}
                />
              ) : (
                <>
                  <span>
                    {rows.length} {rows.length === 1 ? 'záznam' : rows.length < 5 ? 'záznamy' : 'záznamů'}
                  </span>
                  <span>{shown.length !== items.length ? `filtrováno z ${items.length}` : null}</span>
                </>
              )
            }
          >
            {/* Široký displej: tabulka. */}
            <div className="hidden sm:block">
              <Table
                columns={COLUMNS[segment]}
                sorting={sorting}
                onSort={(by) =>
                  setSorting((prev) =>
                    prev.by === by
                      ? { by, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                      : { by, dir: 'asc' },
                  )
                }
              >
                {rows.map((i) => (
                  <Tr key={i.uid} onClick={() => go(i.route)}>
                    <Td>
                      <span className="flex items-center gap-2.5">
                        <Face uid={i.uid} name={i.name} kind={i.kind} />
                        <span className="truncate">{i.name}</span>
                      </span>
                    </Td>
                    <Td hide="sm" muted>
                      {i.town ?? '—'}
                    </Td>
                    <Td hide="md" muted>
                      {i.note ?? '—'}
                    </Td>
                    <Td hide="md" muted>
                      {i.extra ?? '—'}
                    </Td>
                    <Td align="right">
                      {i.alert && i.alert.tone === 'neutral' ? (
                        <Chip>{i.alert.text}</Chip>
                      ) : (
                        <Due iso={i.dueOn} />
                      )}
                    </Td>
                  </Tr>
                ))}
              </Table>
            </div>

            {/* Mobil: řádky. */}
            <div className="sm:hidden">
              {rows.map((i) => (
                <Row
                  key={i.uid}
                  leading={<Face uid={i.uid} name={i.name} kind={i.kind} />}
                  title={i.name}
                  subtitle={[i.town, i.note].filter(Boolean).join(' · ')}
                  meta={i.alert ? <Chip tone={i.alert.tone}>{i.alert.text}</Chip> : undefined}
                  onClick={() => go(i.route)}
                />
              ))}
            </div>
          </Card>
        ))}

        {shown.length === 0 ? (
          <Card>
            <p className="text-copy-14 px-4 py-6 text-[var(--ds-gray-900)]">
              Nic k tomu, co jste napsal.
            </p>
          </Card>
        ) : null}
      </div>
    </Screen>
  )
}

function group(items: Item[], mode: Grouping): Array<[string, Item[]]> {
  if (mode === 'zadne') return items.length ? [['vše', items]] : []

  const key = (i: Item): string => {
    if (mode === 'obec') return i.town ?? 'Bez adresy'
    if (!i.dueOn) return 'Bez termínu'
    const d = daysUntil(i.dueOn)
    if (d < 0) return 'Po termínu'
    if (d <= 7) return 'Tento týden'
    if (d <= 31) return 'Do měsíce'
    return 'Později'
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
  } else {
    out.sort((a, b) => a[0].localeCompare(b[0], 'cs'))
  }
  return out
}
