/**
 * Karta rodiny.
 *
 * Nahoře kdo to je, pak přepínač na čtyři pohledy. Záznamy jsou tu hlavní
 * obsah, proto mají odstavec textu, ne jen datum vpravo.
 */

import { useState } from 'react'
import * as data from '../demo/data'
import * as L from '../labels'
import { usePersona } from '../persona'
import { Face } from '../face'
import {
  Card, Divider, GroupTitle, LargeTitle, Meta, Note, Row, Screen, Segmented,
  childCountLabel, dueLabel, dueTone, formatDate, formatUid,
} from '../ui'

type Tab = 'prehled' | 'zaznamy' | 'lhuty' | 'dokumenty'

export function Rodina({ id, go }: { id: string; go: (r: string) => void }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId!
  const [tab, setTab] = useState<Tab>('prehled')

  const agreement = data.agreements(orgId).find((a) => a.id === id)
  if (!agreement) {
    return (
      <Screen>
        <LargeTitle title="Rodina" back={() => go('/')} />
        <Card>
          <Note>Tahle rodina tu není.</Note>
        </Card>
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
      <LargeTitle
        title={agreement.naming.displayName}
        subtitle={[data.townOfAgreement(orgId, id), L.custodyBasis(agreement.custodyBasis)]
          .filter(Boolean)
          .join(' · ')}
        back={() => go('/')}
        right={
          agreement.status !== 'active' ? (
            <div className="pt-2">
              <Meta tone="amber">{L.agreementStatus(agreement.status)}</Meta>
            </div>
          ) : undefined
        }
      />

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          ['prehled', 'Přehled'],
          ['zaznamy', 'Záznamy'],
          ['lhuty', 'Lhůty'],
          ['dokumenty', 'Dokumenty'],
        ]}
      />

      {tab === 'prehled' ? (
        <>
          <GroupTitle>Pečující osoby</GroupTitle>
          <Card>
            {agreement.carerPersonIds.map((pid, i) => {
              const p = data.person(orgId, pid)
              return (
                <div key={pid}>
                  {i > 0 ? <Divider /> : null}
                  <Row
                    leading={<Face uid={pid} name={p?.displayName ?? '?'} />}
                    title={p?.displayName ?? pid}
                    subtitle={[data.townOfPerson(orgId, pid), L.carerKind(agreement.carerKind)]
                      .filter(Boolean)
                      .join(' · ')}
                    onClick={() => go(`/pestoun/${pid}`)}
                  />
                </div>
              )
            })}
          </Card>

          <GroupTitle>{childCountLabel(kids.length)}</GroupTitle>
          <Card>
            {kids.length === 0 ? (
              <Note>
                Bez svěřeného dítěte. U osoby v evidenci je to platný stav — dohoda visí na
                zápisu v evidenci, ne na dítěti.
              </Note>
            ) : (
              kids.map((c, i) => (
                <div key={c.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row
                    leading={<Face uid={c.id} kind="child" name={c.displayName} />}
                    title={c.displayName}
                    subtitle={[data.townOfChild(orgId, c.id), `nar. ${formatDate(c.birthDate)}`]
                      .filter(Boolean)
                      .join(' · ')}
                    meta={c.careEndedOn ? <Meta>péče ukončena</Meta> : undefined}
                    onClick={() => go(`/dite/${c.id}`)}
                  />
                </div>
              ))
            )}
          </Card>

          <GroupTitle>Spis</GroupTitle>
          <Card>
            <Row title="Spisová značka" meta={<Meta>{file?.reference ?? '—'}</Meta>} />
            <Divider />
            <Row title="UID" meta={<Meta><span className="font-mono">{formatUid(id)}</span></Meta>} />
            <Divider />
            <Row title="Klíčová osoba" meta={<Meta>{file?.keyWorkerDisplayName ?? '—'}</Meta>} />
            <Divider />
            <Row title="Uzavřeno" meta={<Meta>{formatDate(agreement.concludedOn)}</Meta>} />
            {file?.archivedOn ? (
              <>
                <Divider />
                <Row title="Archivováno" meta={<Meta>{formatDate(file.archivedOn)}</Meta>} />
              </>
            ) : null}
          </Card>
        </>
      ) : null}

      {tab === 'zaznamy' ? (
        <>
          <GroupTitle>{entries.length} záznamů</GroupTitle>
          <Card>
            {entries.length === 0 ? (
              <Note>Zatím nic.</Note>
            ) : (
              [...entries]
                .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
                .slice(0, 40)
                .map((e, i) => (
                  <div key={e.id}>
                    {i > 0 ? <Divider /> : null}
                    <div className="px-4 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-copy-16 text-[var(--ds-gray-1000)]">
                          {L.entryKind(e.kind)}
                        </span>
                        <Meta>{formatDate(e.occurredAt)}</Meta>
                      </div>
                      {e.summary ? (
                        <p className="text-copy-14 pt-1 text-[var(--ds-gray-900)]">{e.summary}</p>
                      ) : null}
                    </div>
                  </div>
                ))
            )}
          </Card>
        </>
      ) : null}

      {tab === 'lhuty' ? (
        <>
          <GroupTitle>{due.length} lhůt</GroupTitle>
          <Card>
            {due.length === 0 ? (
              <Note>Žádná lhůta neběží.</Note>
            ) : (
              due.map((o, i) => (
                <div key={o.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row
                    title={L.obligationKind(o.kind)}
                    subtitle={`${o.subjectDisplayName} · ${formatDate(o.dueOn)}`}
                    meta={<Meta tone={dueTone(o.dueOn)}>{dueLabel(o.dueOn)}</Meta>}
                  />
                </div>
              ))
            )}
          </Card>
        </>
      ) : null}

      {tab === 'dokumenty' ? (
        <>
          <GroupTitle>{docs.length} dokumentů</GroupTitle>
          <Card>
            {docs.length === 0 ? (
              <Note>Zatím nic.</Note>
            ) : (
              docs.map((d, i) => (
                <div key={d.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row
                    title={d.title}
                    subtitle={L.documentCategory(d.category)}
                    meta={d.indexStatus === 'queued' ? <Meta tone="blue">čeká na Eli</Meta> : undefined}
                    onClick={() => undefined}
                  />
                </div>
              ))
            )}
          </Card>
        </>
      ) : null}
    </Screen>
  )
}
