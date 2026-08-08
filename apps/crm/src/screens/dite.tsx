/**
 * Karta dítěte — dětská sekce.
 *
 * Dítě není řádek v tabulce. Karta proto začíná obrázkem, který si dítě samo
 * vybere, a pokračuje tím, co o něm potřebuje vědět člověk, který za ním jede:
 * kolik mu je, kam chodí do školy, kde bydlí, co se u něj chystá.
 *
 * Kniha života má vlastní místo a **schválně jiný tón** než spis: je to
 * sbírka toho hezkého, ne evidence.
 */

import { useState } from 'react'
import * as data from '../demo/data'
import { Face, FacePicker } from '../face'
import * as L from '../labels'
import { usePersona } from '../persona'
import { ProfileHead } from './pestoun'
import { age } from '../shell'
import {
  Card, Divider, GroupTitle, LargeTitle, Meta, Note, Row, Screen,
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
        <LargeTitle title="Dítě" back={() => go('/')} />
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
    ? data.obligationsOfAgreement(orgId, agreementId).filter((o) => o.childId === id && o.status !== 'met')
    : []
  const events = data
    .events(orgId)
    .filter((e) => e.caseFileId && agreement && e.subjectDisplayName === agreement.naming.displayName)
    .filter((e) => new Date(e.startAt) >= new Date())
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 3)

  const years = age(child.birthDate)
  const nameday = birthdayIn(child.birthDate)

  return (
    <Screen>
      <LargeTitle title={child.displayName} back={() => go('/')} />

      <ProfileHead
        uid={id}
        kind="child"
        name={child.displayName}
        line={`${years} let`}
        town={contact?.address?.city ?? null}
        onEdit={() => setPicker(true)}
        extra={
          nameday !== null ? (
            <div className="text-copy-14 pt-1 text-[var(--ds-purple-900)]">
              {nameday === 0 ? 'Dnes má narozeniny 🎂' : `Narozeniny za ${nameday} dní`}
            </div>
          ) : null
        }
      />

      <GroupTitle>O dítěti</GroupTitle>
      <Card>
        <Row title="Narozeno" meta={<Meta>{formatDate(child.birthDate)}</Meta>} />
        <Divider />
        <Row
          title="Škola"
          subtitle={typeof child.school === 'string' ? child.school : undefined}
          meta={typeof child.school === 'string' ? undefined : <Meta>—</Meta>}
        />
        <Divider />
        <Row
          title="Bydliště"
          subtitle={
            contact?.address
              ? `${contact.address.street}, ${contact.address.zip} ${contact.address.city}`
              : undefined
          }
        />
        {agreement ? (
          <>
            <Divider />
            <Row
              leading={<Face uid={agreement.id} kind="family" name={agreement.naming.displayName} />}
              title={agreement.naming.displayName}
              subtitle={L.custodyBasis(agreement.custodyBasis)}
              onClick={() => go(`/rodina/${agreement.id}`)}
            />
          </>
        ) : null}
        {child.careEndedOn ? (
          <>
            <Divider />
            <Row title="Péče ukončena" meta={<Meta tone="amber">{formatDate(child.careEndedOn)}</Meta>} />
          </>
        ) : null}
      </Card>

      {due.length > 0 ? (
        <>
          <GroupTitle>Co běží</GroupTitle>
          <Card>
            {due.map((o, i) => (
              <div key={o.id}>
                {i > 0 ? <Divider /> : null}
                <Row
                  title={L.obligationKind(o.kind)}
                  subtitle={dueLabel(o.dueOn)}
                  meta={<Meta tone={dueTone(o.dueOn)}>{formatDate(o.dueOn)}</Meta>}
                />
              </div>
            ))}
          </Card>
        </>
      ) : null}

      {events.length > 0 ? (
        <>
          <GroupTitle>Co se chystá</GroupTitle>
          <Card>
            {events.map((e, i) => (
              <div key={e.id}>
                {i > 0 ? <Divider /> : null}
                <Row
                  title={e.title}
                  subtitle={`${formatDate(e.startAt)}${e.allDay ? '' : ` · ${formatTime(e.startAt)}`}`}
                  onClick={e.caseFileId ? () => go(`/spis/${e.caseFileId}`) : undefined}
                />
              </div>
            ))}
          </Card>
        </>
      ) : null}

      <GroupTitle>Kniha života</GroupTitle>
      <div className="rounded-2xl bg-[var(--ds-teal-100)] p-4">
        <p className="text-copy-16 text-[var(--ds-teal-900)]">
          Fotky, výkresy, vysvědčení a vzpomínky, které si dítě odnese, až péče
          skončí.
        </p>
        <p className="text-copy-14 pt-2 text-[var(--ds-teal-900)]">
          Zatím prázdná — přidávat se bude, až aplikace umí ukládat.
        </p>
      </div>

      <GroupTitle>Záznam v systému</GroupTitle>
      <Card>
        <Row title="UID" meta={<Meta><span className="font-mono">{formatUid(id)}</span></Meta>} />
      </Card>

      {picker ? <FacePicker uid={id} kind="child" name={child.displayName} onClose={() => setPicker(false)} /> : null}
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
