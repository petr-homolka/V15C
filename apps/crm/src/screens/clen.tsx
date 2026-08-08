/**
 * Člen týmu. Kolik má ve správě a co mu utíká — víc o kolegovi vidět nemá
 * být (charta: systém nehlídá lidi, dok. 16).
 */

import * as data from '../demo/data'
import * as L from '../labels'
import { usePersona } from '../persona'
import { Face } from '../face'
import {
  Card, Divider, GroupTitle, LargeTitle, Meta, Note, Row, Screen,
  childCountLabel, dueLabel, dueTone,
} from '../ui'

export function Clen({ id, go }: { id: string; go: (r: string) => void }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId!
  const person = data.person(orgId, id)
  const member = data.members(orgId).find((m) => m.personId === id)

  if (!person) {
    return (
      <Screen>
        <LargeTitle title="Člen týmu" back={() => go('/')} />
        <Card>
          <Note>Tahle osoba tu není.</Note>
        </Card>
      </Screen>
    )
  }

  const files = data.caseFiles(orgId).filter((c) => c.keyWorkerPersonId === id)
  const ids = new Set(files.map((f) => f.agreementId))
  const agreements = data.agreements(orgId).filter((a) => ids.has(a.id))

  return (
    <Screen>
      <LargeTitle
        title={person.displayName}
        subtitle={member ? L.memberRole(member.role) : undefined}
        back={() => go('/')}
      />

      <GroupTitle>Ve správě</GroupTitle>
      <Card>
        {agreements.length === 0 ? (
          <Note>Žádná dohoda ve správě.</Note>
        ) : (
          agreements.map((a, i) => (
            <div key={a.id}>
              {i > 0 ? <Divider /> : null}
              <Row
                leading={<Face uid={a.id} kind="family" name={a.naming.displayName} />}
                title={a.naming.displayName}
                subtitle={[data.townOfAgreement(orgId, a.id), childCountLabel(a.childCount)].filter(Boolean).join(' · ')}
                meta={
                  a.nextObligationDueOn ? (
                    <Meta tone={dueTone(a.nextObligationDueOn)}>{dueLabel(a.nextObligationDueOn)}</Meta>
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
