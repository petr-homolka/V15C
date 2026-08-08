/**
 * Karta rodiny.
 *
 * Hlavička, čtyři karty pod sebou v mřížce. Záznamy mají vlastní kartu se
 * záložkami, protože jich bývají desítky — a to už je tabulka, ne seznam.
 */

import { useState } from 'react'
import * as data from '../demo/data'
import { Face, FacePicker } from '../face'
import * as L from '../labels'
import { usePersona } from '../persona'
import { ProfileHeader } from './profil'
import {
  Card, Due, Chip, Grid, InfoRow, Note, PageHead, Row, Screen, Segmented, Stack,
  Table, Td, Tr, childCountLabel, dueLabel, dueTone, formatDate, formatUid,
} from '../ui'

type Tab = 'zaznamy' | 'lhuty' | 'dokumenty'

export function Rodina({ id, go }: { id: string; go: (r: string) => void }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId!
  const [tab, setTab] = useState<Tab>('zaznamy')
  const [picker, setPicker] = useState(false)

  const agreement = data.agreements(orgId).find((a) => a.id === id)
  if (!agreement) {
    return (
      <Screen>
        <PageHead title="Rodina" back={() => go('/seznam/dohody')} />
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
  const town = data.townOfAgreement(orgId, id)

  return (
    <Screen wide>
      <PageHead title="Karta rodiny" back={() => go('/seznam/dohody')} />

      <Stack>
        <ProfileHeader
          uid={id}
          kind="family"
          name={agreement.naming.displayName}
          facts={[
            ...(town ? [{ icon: 'pin' as const, text: town }] : []),
            { icon: 'tag', text: L.custodyBasis(agreement.custodyBasis) },
            { icon: 'home', text: childCountLabel(kids.length) },
            ...(file ? [{ icon: 'tag' as const, text: file.reference }] : []),
          ]}
          actions={
            agreement.status !== 'active' ? (
              <Chip tone="amber">{L.agreementStatus(agreement.status)}</Chip>
            ) : undefined
          }
          onEditImage={() => setPicker(true)}
        />

        <Grid>
          <Stack>
            <Card title="Pečující osoby">
              {agreement.carerPersonIds.map((pid) => {
                const p = data.person(orgId, pid)
                return (
                  <Row
                    key={pid}
                    leading={<Face uid={pid} name={p?.displayName ?? '?'} />}
                    title={p?.displayName ?? pid}
                    subtitle={[data.townOfPerson(orgId, pid), L.carerKind(agreement.carerKind)]
                      .filter(Boolean)
                      .join(' · ')}
                    onClick={() => go(`/pestoun/${pid}`)}
                  />
                )
              })}
            </Card>

            <Card title={`Děti (${kids.length})`}>
              {kids.length === 0 ? (
                <Note>
                  Bez svěřeného dítěte. U osoby v evidenci je to platný stav — dohoda visí na
                  zápisu v evidenci, ne na dítěti.
                </Note>
              ) : (
                kids.map((c) => (
                  <Row
                    key={c.id}
                    leading={<Face uid={c.id} kind="child" name={c.displayName} />}
                    title={c.displayName}
                    subtitle={[data.townOfChild(orgId, c.id), `nar. ${formatDate(c.birthDate)}`]
                      .filter(Boolean)
                      .join(' · ')}
                    meta={c.careEndedOn ? <Chip>péče ukončena</Chip> : undefined}
                    onClick={() => go(`/dite/${c.id}`)}
                  />
                ))
              )}
            </Card>
          </Stack>

          <Stack>
            <Card title="Spis">
              <InfoRow label="Spisová značka">{file?.reference ?? '—'}</InfoRow>
              <InfoRow label="Klíčová osoba">{file?.keyWorkerDisplayName ?? '—'}</InfoRow>
              <InfoRow label="Uzavřeno">{formatDate(agreement.concludedOn)}</InfoRow>
              <InfoRow label="Postavení">{L.carerKind(agreement.carerKind)}</InfoRow>
              <InfoRow label="UID">
                <span className="font-mono">{formatUid(id)}</span>
              </InfoRow>
              {file?.archivedOn ? (
                <InfoRow label="Archivováno">{formatDate(file.archivedOn)}</InfoRow>
              ) : null}
            </Card>

            <Card title={`Lhůty (${due.length})`}>
              {due.length === 0 ? (
                <Note>Žádná lhůta neběží.</Note>
              ) : (
                due.map((o) => (
                  <Row
                    key={o.id}
                    title={L.obligationKind(o.kind)}
                    subtitle={`${o.subjectDisplayName} · ${formatDate(o.dueOn)}`}
                    meta={<Due iso={o.dueOn} />}
                  />
                ))
              )}
            </Card>
          </Stack>
        </Grid>

        <Card
          title="Spisový obsah"
          action={
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                ['zaznamy', `Záznamy (${entries.length})`],
                ['lhuty', `Lhůty (${due.length})`],
                ['dokumenty', `Dokumenty (${docs.length})`],
              ]}
            />
          }
        >
          {tab === 'zaznamy' ? (
            entries.length === 0 ? (
              <Note>Zatím nic.</Note>
            ) : (
              <Table
                columns={[
                  { label: 'Druh' },
                  { label: 'Shrnutí', hide: 'sm' },
                  { label: 'Datum', align: 'right' },
                ]}
              >
                {[...entries]
                  .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
                  .slice(0, 40)
                  .map((e) => (
                    <Tr key={e.id}>
                      <Td>{L.entryKind(e.kind)}</Td>
                      <Td hide="sm" muted>
                        {e.summary ?? '—'}
                      </Td>
                      <Td align="right" muted>
                        {formatDate(e.occurredAt)}
                      </Td>
                    </Tr>
                  ))}
              </Table>
            )
          ) : null}

          {tab === 'lhuty' ? (
            <Table
              columns={[
                { label: 'Povinnost' },
                { label: 'Koho se týká', hide: 'sm' },
                { label: 'Termín', align: 'right' },
              ]}
            >
              {due.map((o) => (
                <Tr key={o.id}>
                  <Td>{L.obligationKind(o.kind)}</Td>
                  <Td hide="sm" muted>
                    {o.subjectDisplayName}
                  </Td>
                  <Td align="right">
                    <Due iso={o.dueOn} />
                  </Td>
                </Tr>
              ))}
            </Table>
          ) : null}

          {tab === 'dokumenty' ? (
            docs.length === 0 ? (
              <Note>Zatím nic.</Note>
            ) : (
              <Table
                columns={[
                  { label: 'Název' },
                  { label: 'Druh', hide: 'sm' },
                  { label: 'Verze', align: 'right' },
                ]}
              >
                {docs.map((d) => (
                  <Tr key={d.id}>
                    <Td>
                      <span className="flex items-center gap-2">
                        {d.title}
                        {d.indexStatus === 'queued' ? <Chip>čeká na Eli</Chip> : null}
                      </span>
                    </Td>
                    <Td hide="sm" muted>
                      {L.documentCategory(d.category)}
                    </Td>
                    <Td align="right" muted>
                      {d.currentVersionNo}
                    </Td>
                  </Tr>
                ))}
              </Table>
            )
          ) : null}
        </Card>
      </Stack>

      {picker ? (
        <FacePicker
          uid={id}
          kind="family"
          name={agreement.naming.displayName}
          onClose={() => setPicker(false)}
        />
      ) : null}
    </Screen>
  )
}
