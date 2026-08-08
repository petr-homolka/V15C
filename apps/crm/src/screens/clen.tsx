/**
 * Člen týmu. Kolik má ve správě a co u něj běží — víc o kolegovi vidět nemá
 * být (charta: systém nehlídá lidi, dok. 16).
 */

import * as data from '../demo/data'
import * as L from '../labels'
import { usePersona } from '../persona'
import { ProfileHeader } from './profil'
import {
  Card, Due, Chip, Note, PageHead, Screen, Stack, Table, Td, Tr,
  childCountLabel, dueTone, formatDate, formatUid,
} from '../ui'

export function Clen({ id, go }: { id: string; go: (r: string) => void }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId!
  const person = data.person(orgId, id)
  const member = data.members(orgId).find((m) => m.personId === id)

  if (!person) {
    return (
      <Screen>
        <PageHead title="Člen týmu" back={() => go('/seznam/tym')} />
        <Card>
          <Note>Tahle osoba tu není.</Note>
        </Card>
      </Screen>
    )
  }

  const contact = data.contactOfPerson(orgId, id)
  const files = data.caseFiles(orgId).filter((c) => c.keyWorkerPersonId === id)
  const ids = new Set(files.map((f) => f.agreementId))
  const agreements = data.agreements(orgId).filter((a) => ids.has(a.id))

  return (
    <Screen wide>
      <PageHead title="Karta člena týmu" back={() => go('/seznam/tym')} />

      <Stack>
        <ProfileHeader
          uid={id}
          name={person.displayName}
          facts={[
            ...(member ? [{ icon: 'tag' as const, text: L.memberRole(member.role) }] : []),
            ...(contact?.address?.city ? [{ icon: 'pin' as const, text: contact.address.city }] : []),
            { icon: 'home', text: `${agreements.length} dohod ve správě` },
            { icon: 'tag', text: formatUid(id) },
          ]}
          onEditImage={() => undefined}
        />

        <Card title="Dohody ve správě">
          {agreements.length === 0 ? (
            <Note>Žádná dohoda ve správě.</Note>
          ) : (
            <Table
              columns={[
                { label: 'Rodina' },
                { label: 'Obec', hide: 'sm' },
                { label: 'Děti', hide: 'md' },
                { label: 'Nejbližší lhůta', align: 'right' },
              ]}
            >
              {agreements.map((a) => (
                <Tr key={a.id} onClick={() => go(`/rodina/${a.id}`)}>
                  <Td>{a.naming.displayName}</Td>
                  <Td hide="sm" muted>
                    {data.townOfAgreement(orgId, a.id) ?? '—'}
                  </Td>
                  <Td hide="md" muted>
                    {childCountLabel(a.childCount)}
                  </Td>
                  <Td align="right">
                    <Due iso={a.nextObligationDueOn} />
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>
      </Stack>
    </Screen>
  )
}
