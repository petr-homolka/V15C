/**
 * Karta pěstouna.
 *
 * Dvousloupcové rozvržení: vlevo údaje, vpravo to, co běží. Na mobilu pod
 * sebou. UID je tady — a nikde jinde v seznamech (dok. 25).
 */

import { useState } from 'react'
import * as data from '../demo/data'
import { FacePicker } from '../face'
import * as L from '../labels'
import { usePersona } from '../persona'
import { EditImageButton, ProfileHeader } from './profil'
import {
  Card, Due, Chip, Grid, InfoRow, Note, PageHead, Row, Screen, Stack,
  childCountLabel, dueLabel, dueTone, formatDate, formatUid,
} from '../ui'

export function Pestoun({ id, go }: { id: string; go: (r: string) => void }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId!
  const [picker, setPicker] = useState(false)

  const person = data.person(orgId, id)
  if (!person) {
    return (
      <Screen>
        <PageHead title="Pěstoun" back={() => go('/seznam/pestouni')} />
        <Card>
          <Note>Tahle osoba tu není.</Note>
        </Card>
      </Screen>
    )
  }

  const contact = data.contactOfPerson(orgId, id)
  const agreements = data.agreementsOfCarer(orgId, id)
  const agreement = agreements[0]
  const due = agreement
    ? data
        .obligationsOfAgreement(orgId, agreement.id)
        .filter((o) => o.personId === id && o.status !== 'met')
    : []

  return (
    <Screen wide>
      <PageHead title="Karta pěstouna" back={() => go('/seznam/pestouni')} />

      <Stack>
        <ProfileHeader
          uid={id}
          name={person.displayName}
          facts={[
            ...(contact?.address?.city ? [{ icon: 'pin' as const, text: contact.address.city }] : []),
            ...(agreement ? [{ icon: 'tag' as const, text: L.carerKind(agreement.carerKind) }] : []),
            ...(contact?.phone ? [{ icon: 'phone' as const, text: contact.phone }] : []),
            ...(contact?.email ? [{ icon: 'mail' as const, text: contact.email }] : []),
          ]}
          actions={<EditImageButton onClick={() => setPicker(true)} />}
          onEditImage={() => setPicker(true)}
        />

        <Grid>
          <Stack>
            <Card title="Údaje">
              <InfoRow label="Jméno">{person.displayName}</InfoRow>
              <InfoRow label="Adresa">
                {contact?.address
                  ? `${contact.address.street}, ${contact.address.zip} ${contact.address.city}`
                  : '—'}
              </InfoRow>
              <InfoRow label="Telefon">
                {contact?.phone ? (
                  <a href={`tel:${contact.phone}`} className="text-[var(--ds-purple-700)]">
                    {contact.phone}
                  </a>
                ) : (
                  '—'
                )}
              </InfoRow>
              <InfoRow label="E-mail">
                {contact?.email ? (
                  <a href={`mailto:${contact.email}`} className="text-[var(--ds-purple-700)]">
                    {contact.email}
                  </a>
                ) : (
                  '—'
                )}
              </InfoRow>
              <InfoRow label="UID">
                <span className="font-mono">{formatUid(id)}</span>
              </InfoRow>
            </Card>

            <Card title="Rodina">
              {agreements.length === 0 ? (
                <Note>Bez dohody.</Note>
              ) : (
                agreements.map((a) => (
                  <Row
                    key={a.id}
                    title={a.naming.displayName}
                    subtitle={`${L.custodyBasis(a.custodyBasis)} · ${childCountLabel(a.childCount)}`}
                    meta={<Chip>{a.reference}</Chip>}
                    onClick={() => go(`/rodina/${a.id}`)}
                  />
                ))
              )}
            </Card>
          </Stack>

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
        </Grid>
      </Stack>

      {picker ? (
        <FacePicker uid={id} name={person.displayName} onClose={() => setPicker(false)} />
      ) : null}
    </Screen>
  )
}
