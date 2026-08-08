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
import {
  Button, Card, Chip, Due, Field, PageHead, Row, Screen, Table, Td, Tr,
  daysUntil,
} from '../ui'

type Grouping = 'zadne' | 'obec' | 'termin'

const GROUPINGS: Array<[Grouping, string]> = [
  ['zadne', 'Bez seskupení'],
  ['obec', 'Podle obce'],
  ['termin', 'Podle termínu'],
]

const COLUMNS: Record<Segment, Array<{ label: string; align?: 'right'; hide?: 'sm' | 'md' }>> = {
  dohody: [
    { label: 'Rodina' },
    { label: 'Obec', hide: 'sm' },
    { label: 'Druh péče', hide: 'md' },
    { label: 'Klíčová osoba', hide: 'md' },
    { label: 'Nejbližší lhůta', align: 'right' },
  ],
  pestouni: [
    { label: 'Jméno' },
    { label: 'Obec', hide: 'sm' },
    { label: 'Postavení', hide: 'md' },
    { label: 'Rodina', hide: 'md' },
    { label: 'Nejbližší lhůta', align: 'right' },
  ],
  deti: [
    { label: 'Jméno' },
    { label: 'Obec', hide: 'sm' },
    { label: 'Věk', hide: 'md' },
    { label: 'Rodina', hide: 'md' },
    { label: 'Nejbližší lhůta', align: 'right' },
  ],
  tym: [
    { label: 'Jméno' },
    { label: 'Obec', hide: 'sm' },
    { label: 'Role', hide: 'md' },
    { label: 'Ve správě', hide: 'md' },
    { label: '', align: 'right' },
  ],
}

export function Seznam({ segment, go }: { segment: Segment; go: (r: string) => void }) {
  const { persona } = usePersona()
  const [q, setQ] = useState('')
  const [grouping, setGrouping] = useState<Grouping>('zadne')

  const items = useMemo(
    () => listOf(segment, persona.organizationId, persona),
    [segment, persona],
  )
  const shown = q.trim()
    ? items.filter((i) => fold(`${i.name} ${i.town ?? ''} ${i.extra ?? ''}`).includes(fold(q.trim())))
    : items

  const groups = group(shown, grouping)
  const label = SEGMENTS.find(([k]) => k === segment)?.[1] ?? 'Seznam'

  return (
    <Screen wide>
      <PageHead
        title={label}
        subtitle={`${items.length} záznamů${persona.role === 'key_worker' ? ' ve vaší správě' : ''}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-52">
              <Field value={q} onChange={setQ} placeholder="Hledat" />
            </div>
            {GROUPINGS.map(([key, text]) => (
              <Button
                key={key}
                size="sm"
                variant={key === grouping ? 'primary' : 'secondary'}
                onClick={() => setGrouping(key)}
              >
                {text}
              </Button>
            ))}
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        {groups.map(([title, rows]) => (
          <Card key={title} title={grouping === 'zadne' ? undefined : `${title} · ${rows.length}`}>
            {/* Široký displej: tabulka. */}
            <div className="hidden sm:block">
              <Table columns={COLUMNS[segment]}>
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
