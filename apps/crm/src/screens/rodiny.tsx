/**
 * Rodiny — seznam s hledáním.
 *
 * Řádek nese jméno, děti a nejbližší lhůtu. Nic víc: co se do řádku nevejde,
 * patří do karty rodiny, ne do dalšího sloupce.
 */

import { useMemo, useState } from 'react'
import * as data from '../demo/data'
import { usePersona } from '../persona'
import {
  Avatar, Card, Divider, LargeTitle, Meta, Note, Row, Screen,
  childCountLabel, dueLabel, dueTone,
} from '../ui'

export function Rodiny({ go }: { go: (r: string) => void }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId!
  const [q, setQ] = useState('')

  const all = useMemo(() => {
    if (persona.role === 'key_worker') return data.agreementsOfKeyWorker(orgId, persona.personId!)
    if (persona.role === 'carer') return data.agreementsOfCarer(orgId, persona.personId!)
    return data.agreements(orgId)
  }, [orgId, persona.role, persona.personId])

  const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const list = q.trim()
    ? all.filter((a) => fold(a.naming.displayName + a.reference).includes(fold(q.trim())))
    : all

  return (
    <Screen>
      <LargeTitle
        title="Rodiny"
        subtitle={persona.role === 'key_worker' ? 've vaší správě' : persona.organizationName}
      />

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Hledat"
        className="text-copy-16 mb-4 w-full rounded-xl bg-[var(--ds-background-100)] px-4 py-2.5 text-[var(--ds-gray-1000)] shadow-[var(--ds-shadow-border-small)] outline-none placeholder:text-[var(--ds-gray-700)]"
      />

      <Card>
        {list.length === 0 ? (
          <Note>Nic k tomu, co jste napsal.</Note>
        ) : (
          list.map((a, i) => (
            <div key={a.id}>
              {i > 0 ? <Divider /> : null}
              <Row
                leading={<Avatar text={a.naming.displayName} tone={a.status === 'active' ? 'gray' : 'amber'} />}
                title={a.naming.displayName}
                subtitle={`${a.reference} · ${childCountLabel(a.childCount)}`}
                meta={
                  a.nextObligationDueOn ? (
                    <Meta tone={dueTone(a.nextObligationDueOn)}>{dueLabel(a.nextObligationDueOn)}</Meta>
                  ) : a.status !== 'active' ? (
                    <Meta>ukončená</Meta>
                  ) : undefined
                }
                onClick={() => go(`/rodina/${a.id}`)}
              />
            </div>
          ))
        )}
      </Card>
    </Screen>
  )
}
