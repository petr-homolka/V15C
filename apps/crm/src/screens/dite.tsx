/**
 * Karta dítěte.
 *
 * Skladba je stejná jako u dospělých — tohle je pracovní karta, ne dětská
 * appka. Jediné, co je jinak: **obrázek si vybírá dítě** a kniha života má
 * vlastní kartu, protože to není evidence.
 */

import { useState } from 'react'
import * as data from '../demo/data'
import { FacePicker } from '../face'
import * as L from '../labels'
import { usePersona } from '../persona'
import { age } from '../shell'
import { EditImageButton, ProfileHeader } from './profil'
import {
  Button, Card, Chip, Due, Grid, InfoRow, Note, PageHead, Row, Screen, Stack,
  dueLabel, dueTone, formatDate, formatTime, formatUid,
} from '../ui'

export function Dite({ id, go }: { id: string; go: (r: string) => void }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId!
  const [picker, setPicker] = useState(false)

  const child = data.child(orgId, id)
  if (!child) {
    return (
      <Screen>
        <PageHead title="Dítě" back={() => go('/seznam/deti')} />
        <Card>
          <Note>Tohle dítě tu není.</Note>
        </Card>
      </Screen>
    )
  }

  const contact = data.contactOfChild(orgId, id)
  const agreementId = data.childAgreementId(orgId, id)
  const agreement = agreementId
    ? data.agreements(orgId).find((a) => a.id === agreementId) ?? null
    : null
  const due = agreementId
    ? data
        .obligationsOfAgreement(orgId, agreementId)
        .filter((o) => o.childId === id && o.status !== 'met')
    : []
  const events = data
    .events(orgId)
    .filter((e) => agreement && e.subjectDisplayName === agreement.naming.displayName)
    .filter((e) => new Date(e.startAt) >= new Date())
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 4)

  const days = birthdayIn(child.birthDate)

  return (
    <Screen wide>
      <PageHead title="Karta dítěte" back={() => go('/seznam/deti')} />

      <Stack>
        <ProfileHeader
          uid={id}
          kind="child"
          name={child.displayName}
          facts={[
            { icon: 'cake', text: `${age(child.birthDate)} let` },
            ...(contact?.address?.city ? [{ icon: 'pin' as const, text: contact.address.city }] : []),
            ...(typeof child.school === 'string' ? [{ icon: 'home' as const, text: child.school }] : []),
            ...(days !== null
              ? [{ icon: 'cake' as const, text: days === 0 ? 'dnes má narozeniny' : `narozeniny za ${days} dní` }]
              : []),
          ]}
          actions={<EditImageButton onClick={() => setPicker(true)} />}
          onEditImage={() => setPicker(true)}
        />

        <Grid>
          <Stack>
            <Card title="Údaje">
              <InfoRow label="Narozeno">{formatDate(child.birthDate)}</InfoRow>
              <InfoRow label="Škola">
                {typeof child.school === 'string' ? child.school : '—'}
              </InfoRow>
              <InfoRow label="Bydliště">
                {contact?.address
                  ? `${contact.address.street}, ${contact.address.zip} ${contact.address.city}`
                  : '—'}
              </InfoRow>
              <InfoRow label="Rodina">
                {agreement ? (
                  <button
                    type="button"
                    onClick={() => go(`/rodina/${agreement.id}`)}
                    className="text-[var(--ds-purple-700)]"
                  >
                    {agreement.naming.displayName}
                  </button>
                ) : (
                  '—'
                )}
              </InfoRow>
              <InfoRow label="Druh péče">
                {agreement ? L.custodyBasis(agreement.custodyBasis) : '—'}
              </InfoRow>
              <InfoRow label="UID">
                <span className="font-mono">{formatUid(id)}</span>
              </InfoRow>
              {child.careEndedOn ? (
                <InfoRow label="Péče ukončena">
                  <Chip tone="amber">{formatDate(child.careEndedOn)}</Chip>
                </InfoRow>
              ) : null}
            </Card>

            <Card
              title="Kniha života"
              action={<Button size="sm">Přidat</Button>}
            >
              <Note>
                Fotky, výkresy, vysvědčení a vzpomínky, které si dítě odnese, až péče skončí.
                Zatím prázdná — přidávat se bude, až aplikace umí ukládat.
              </Note>
            </Card>
          </Stack>

          <Stack>
            <Card title="Co běží">
              {due.length === 0 ? (
                <Note>Žádná lhůta neběží.</Note>
              ) : (
                due.map((o) => (
                  <Row
                    key={o.id}
                    title={L.obligationKind(o.kind)}
                    subtitle={formatDate(o.dueOn)}
                    meta={<Due iso={o.dueOn} />}
                  />
                ))
              )}
            </Card>

            <Card title="Co se chystá">
              {events.length === 0 ? (
                <Note>Nic naplánovaného.</Note>
              ) : (
                events.map((e) => (
                  <Row
                    key={e.id}
                    title={e.title}
                    subtitle={`${formatDate(e.startAt)}${e.allDay ? '' : ` · ${formatTime(e.startAt)}`}`}
                    onClick={e.caseFileId ? () => go(`/spis/${e.caseFileId}`) : undefined}
                  />
                ))
              )}
            </Card>
          </Stack>
        </Grid>
      </Stack>

      {picker ? (
        <FacePicker uid={id} kind="child" name={child.displayName} onClose={() => setPicker(false)} />
      ) : null}
    </Screen>
  )
}

/** Kolik dní do narozenin; `null`, když je to dál než za měsíc. */
function birthdayIn(birthDate: string): number | null {
  const now = new Date()
  const b = new Date(birthDate)
  const next = new Date(now.getFullYear(), b.getMonth(), b.getDate())
  if (next < new Date(now.toDateString())) next.setFullYear(next.getFullYear() + 1)
  const days = Math.round((next.getTime() - new Date(now.toDateString()).getTime()) / 86_400_000)
  return days <= 31 ? days : null
}
