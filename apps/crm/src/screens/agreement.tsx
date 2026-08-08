/**
 * Karta dohody — hlavička, karty služeb, obsah spisu.
 *
 * Jméno v hlavičce je `naming.displayName`, ale odkazuje se přes UID: název
 * si Klíčová osoba kdykoli přepíše (dok. 25).
 */

import { useState } from 'react'
import * as data from '../demo/data'
import * as L from '../labels'
import { usePersona } from '../persona'
import {
  AppBar, Badge, Empty, List, Row, Screen, Section,
  dueLabel, dueTone, formatDate,
} from '../ui'

type Tab = 'prehled' | 'zaznamy' | 'lhuty' | 'dokumenty'

const TABS: Array<[Tab, string]> = [
  ['prehled', 'Přehled'],
  ['zaznamy', 'Záznamy'],
  ['lhuty', 'Lhůty'],
  ['dokumenty', 'Dokumenty'],
]

export function AgreementDetail({ id, go }: { id: string; go: (r: string) => void }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId!
  const [tab, setTab] = useState<Tab>('prehled')

  const agreement = data.agreements(orgId).find((a) => a.id === id)
  if (!agreement) {
    return (
      <Screen>
        <AppBar title="Dohoda" left={<Back go={go} />} />
        <Empty>Tahle dohoda tu není.</Empty>
      </Screen>
    )
  }

  const file = data.caseFileOfAgreement(orgId, id)
  const kids = data.childrenOfAgreement(orgId, id)
  const due = data.obligationsOfAgreement(orgId, id)
  const entries = file ? data.entries(orgId, file.id) : []
  const docs = file ? data.documents(orgId, file.id) : []

  return (
    <Screen>
      <AppBar
        title={agreement.naming.displayName}
        subtitle={`${agreement.reference} · ${L.custodyBasis(agreement.custodyBasis)}`}
        left={<Back go={go} />}
        right={
          agreement.status === 'active' ? null : (
            <Badge tone={agreement.status === 'ended' ? 'neutral' : 'amber'}>
              {L.agreementStatus(agreement.status)}
            </Badge>
          )
        }
      />

      <nav className="flex gap-1 overflow-x-auto px-4 py-2">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`text-button-14 h-8 shrink-0 rounded-md px-3 ${
              tab === key
                ? 'bg-[var(--ds-gray-1000)] text-[var(--ds-background-100)]'
                : 'text-[var(--ds-gray-900)]'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'prehled' ? (
        <>
          <Section title="Pečující osoby">
            <List>
              {agreement.carerPersonIds.map((pid) => {
                const p = data.person(orgId, pid)
                return (
                  <Row
                    key={pid}
                    title={p?.displayName ?? pid}
                    subtitle={L.carerKind(agreement.carerKind)}
                    trailing={<Badge>{pid}</Badge>}
                  />
                )
              })}
            </List>
          </Section>

          <Section title={`Děti (${kids.length})`}>
            {kids.length === 0 ? (
              <Empty>
                Bez svěřeného dítěte. U osoby v evidenci je to platný stav —
                dohoda visí na zápisu v evidenci, ne na dítěti.
              </Empty>
            ) : (
              <List>
                {kids.map((c) => (
                  <Row
                    key={c.id}
                    title={c.displayName}
                    subtitle={`nar. ${formatDate(c.birthDate)}`}
                    trailing={c.careEndedOn ? <Badge>péče ukončena</Badge> : null}
                  />
                ))}
              </List>
            )}
          </Section>

          <Section title="Spis">
            <List>
              <Row title="Spisová značka" trailing={<Badge>{file?.reference ?? '—'}</Badge>} />
              <Row title="Klíčová osoba" subtitle={file?.keyWorkerDisplayName ?? '—'} />
              <Row title="Uzavřeno" subtitle={formatDate(agreement.concludedOn)} />
              {file?.archivedOn ? (
                <Row title="Archivováno" subtitle={formatDate(file.archivedOn)} />
              ) : null}
            </List>
          </Section>
        </>
      ) : null}

      {tab === 'zaznamy' ? (
        <Section title={`Záznamy (${entries.length})`}>
          {entries.length === 0 ? (
            <Empty>Zatím nic.</Empty>
          ) : (
            <List>
              {[...entries]
                .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
                .slice(0, 40)
                .map((e) => (
                  <Row
                    key={e.id}
                    title={L.entryKind(e.kind)}
                    subtitle={e.summary ?? formatDate(e.occurredAt)}
                    trailing={<Badge>{formatDate(e.occurredAt)}</Badge>}
                  />
                ))}
            </List>
          )}
        </Section>
      ) : null}

      {tab === 'lhuty' ? (
        <Section title={`Lhůty (${due.length})`}>
          {due.length === 0 ? (
            <Empty>Žádná lhůta neběží.</Empty>
          ) : (
            <List>
              {due.map((o) => (
                <Row
                  key={o.id}
                  title={`${L.obligationKind(o.kind)} — ${o.subjectDisplayName}`}
                  subtitle={formatDate(o.dueOn)}
                  trailing={<Badge tone={dueTone(o.dueOn)}>{dueLabel(o.dueOn)}</Badge>}
                />
              ))}
            </List>
          )}
        </Section>
      ) : null}

      {tab === 'dokumenty' ? (
        <Section title={`Dokumenty (${docs.length})`}>
          {docs.length === 0 ? (
            <Empty>Zatím nic.</Empty>
          ) : (
            <List>
              {docs.map((d) => (
                <Row
                  key={d.id}
                  title={d.title}
                  subtitle={`${L.documentCategory(d.category)} · verze ${d.currentVersionNo}`}
                  trailing={
                    d.indexStatus === 'queued' ? <Badge tone="blue">čeká na Eli</Badge> : null
                  }
                />
              ))}
            </List>
          )}
        </Section>
      ) : null}

      <div className="h-10" />
    </Screen>
  )
}

function Back({ go }: { go: (r: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => go('/')}
      aria-label="Zpět"
      className="text-label-14 -ml-1 flex h-8 w-8 items-center justify-center rounded-md text-[var(--ds-gray-900)]"
    >
      ←
    </button>
  )
}
