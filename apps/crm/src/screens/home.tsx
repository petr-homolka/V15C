/**
 * Domovská obrazovka. Co ukáže, závisí na pohledu — ne na tom, co si smí
 * kdo přečíst; to bude na pravidlech, až bude přihlášení.
 */

import * as data from '../demo/data'
import * as L from '../labels'
import { usePersona } from '../persona'
import {
  AppBar, Badge, Button, Empty, List, Row, Screen, Section,
  dueLabel, dueTone, formatDate,
} from '../ui'

export function Home({ go }: { go: (route: string) => void }) {
  const { persona } = usePersona()
  const switcher = (
    <Button onClick={() => go('/prepnout')}>{persona.roleLabel}</Button>
  )

  if (persona.role === 'superadmin') return <Platform right={switcher} />
  if (persona.role === 'child') return <ChildHome right={switcher} />
  if (persona.role === 'carer') return <CarerHome go={go} right={switcher} />
  return <WorkerHome go={go} right={switcher} />
}

/* --- Klíčová osoba a vedení ---------------------------------------------- */

function WorkerHome({ go, right }: { go: (r: string) => void; right: React.ReactNode }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId!
  const mine = persona.role === 'key_worker'

  const agreements = mine
    ? data.agreementsOfKeyWorker(orgId, persona.personId!)
    : data.agreements(orgId)

  const ids = new Set(agreements.map((a) => a.id))
  const due = data
    .obligations(orgId)
    .filter((o) => ids.has(o.agreementId) && o.status !== 'met')
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn))

  return (
    <Screen>
      <AppBar
        title={mine ? 'Moje rodiny' : 'Rodiny organizace'}
        subtitle={`${persona.displayName} — ${persona.organizationName}`}
        right={right}
      />

      <Section title={`Nejbližší lhůty (${due.length})`}>
        {due.length === 0 ? (
          <Empty>Nic neběží.</Empty>
        ) : (
          <List>
            {due.slice(0, 5).map((o) => (
              <Row
                key={o.id}
                title={`${L.obligationKind(o.kind)} — ${o.subjectDisplayName}`}
                subtitle={`${o.caseFileReference} · ${formatDate(o.dueOn)}`}
                trailing={<Badge tone={dueTone(o.dueOn)}>{dueLabel(o.dueOn)}</Badge>}
                onClick={() => go(`/dohoda/${o.agreementId}`)}
              />
            ))}
          </List>
        )}
      </Section>

      <Section title={`Dohody ve správě (${agreements.length})`}>
        <List>
          {agreements.map((a) => (
            <Row
              key={a.id}
              title={a.naming.displayName}
              subtitle={`${a.reference} · ${a.childCount === 0 ? 'bez dítěte' : `${a.childCount} ${a.childCount === 1 ? 'dítě' : a.childCount < 5 ? 'děti' : 'dětí'}`}`}
              trailing={
                a.nextObligationDueOn ? (
                  <Badge tone={dueTone(a.nextObligationDueOn)}>
                    {formatDate(a.nextObligationDueOn)}
                  </Badge>
                ) : a.status !== 'active' ? (
                  <Badge>{L.agreementStatus(a.status)}</Badge>
                ) : null
              }
              onClick={() => go(`/dohoda/${a.id}`)}
            />
          ))}
        </List>
      </Section>
      <div className="h-10" />
    </Screen>
  )
}

/* --- Pečující osoba ------------------------------------------------------- */

function CarerHome({ go, right }: { go: (r: string) => void; right: React.ReactNode }) {
  const { persona } = usePersona()
  const orgId = persona.organizationId!
  const mine = data.agreementsOfCarer(orgId, persona.personId!)

  return (
    <Screen>
      <AppBar title="Moje rodina" subtitle={persona.displayName} right={right} />
      <Section title="Dohoda">
        <List>
          {mine.map((a) => (
            <Row
              key={a.id}
              title={a.naming.displayName}
              subtitle={`${L.custodyBasis(a.custodyBasis)} · od ${formatDate(a.concludedOn)}`}
              onClick={() => go(`/dohoda/${a.id}`)}
            />
          ))}
        </List>
      </Section>
      <Section title="Děti v péči">
        <List>
          {mine.flatMap((a) =>
            data.childrenOfAgreement(orgId, a.id).map((c) => (
              <Row key={c.id} title={c.displayName} subtitle={`nar. ${formatDate(c.birthDate)}`} />
            )),
          )}
        </List>
      </Section>
      <div className="h-10" />
    </Screen>
  )
}

/* --- Dítě ----------------------------------------------------------------- */

function ChildHome({ right }: { right: React.ReactNode }) {
  const { persona } = usePersona()
  const kid = data.child(persona.organizationId!, persona.childId!)
  return (
    <Screen>
      <AppBar title="Můj profil" subtitle={persona.displayName} right={right} />
      <Section title="O mně">
        <List>
          <Row title={kid?.displayName ?? '—'} subtitle={`nar. ${formatDate(kid?.birthDate ?? null)}`} />
        </List>
      </Section>
      <Empty>Aplikace pro dítě se teprve staví. Zatím je tu jen profil.</Empty>
    </Screen>
  )
}

/* --- Správce systému ------------------------------------------------------ */

function Platform({ right }: { right: React.ReactNode }) {
  const all = data.orgs()
  return (
    <Screen>
      <AppBar title="Organizace" subtitle={`${all.length} v systému`} right={right} />
      <Section title="Doprovázející organizace">
        <List>
          {all.map((o) => {
            const ags = data.agreements(o.id)
            return (
              <Row
                key={o.id}
                title={o.displayName}
                subtitle={`${o.legalName} · ${ags.length} dohod`}
                trailing={<Badge>{o.id}</Badge>}
              />
            )
          })}
        </List>
      </Section>
    </Screen>
  )
}
