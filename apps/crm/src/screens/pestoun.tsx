/**
 * Karta pěstouna.
 *
 * Tady — a nikde jinde v seznamech — je vidět **UID**. Slouží k dohledání
 * a k nadiktování po telefonu, ne k tomu, aby se opakovalo u každého řádku
 * (dok. 25).
 */

import { useState } from 'react'
import * as data from '../demo/data'
import { Face, FacePicker, type FaceKind } from '../face'
import * as L from '../labels'
import { usePersona } from '../persona'
import {
  Card, Divider, GroupTitle, LargeTitle, Meta, Note, Row, Screen,
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
        <LargeTitle title="Pěstoun" back={() => go('/')} />
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
    ? data.obligationsOfAgreement(orgId, agreement.id).filter((o) => o.personId === id && o.status !== 'met')
    : []

  return (
    <Screen>
      <LargeTitle title={person.displayName} back={() => go('/')} />

      <ProfileHead
        uid={id}
        name={person.displayName}
        line={agreement ? L.carerKind(agreement.carerKind) : 'Pečující osoba'}
        town={contact?.address?.city ?? null}
        onEdit={() => setPicker(true)}
      />

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

      <GroupTitle>Spojení</GroupTitle>
      <Card>
        <Row
          title="Telefon"
          meta={
            contact?.phone ? (
              <a href={`tel:${contact.phone}`} className="text-copy-14 text-[var(--ds-purple-700)]">
                {contact.phone}
              </a>
            ) : (
              <Meta>—</Meta>
            )
          }
        />
        <Divider />
        <Row
          title="E-mail"
          meta={
            contact?.email ? (
              <a href={`mailto:${contact.email}`} className="text-copy-14 text-[var(--ds-purple-700)]">
                {contact.email}
              </a>
            ) : (
              <Meta>—</Meta>
            )
          }
        />
        <Divider />
        <Row
          title="Adresa"
          subtitle={
            contact?.address
              ? `${contact.address.street}, ${contact.address.zip} ${contact.address.city}`
              : undefined
          }
        />
      </Card>

      <GroupTitle>Rodina</GroupTitle>
      <Card>
        {agreements.length === 0 ? (
          <Note>Bez dohody.</Note>
        ) : (
          agreements.map((a, i) => (
            <div key={a.id}>
              {i > 0 ? <Divider /> : null}
              <Row
                leading={<Face uid={a.id} kind="family" name={a.naming.displayName} />}
                title={a.naming.displayName}
                subtitle={`${L.custodyBasis(a.custodyBasis)} · ${childCountLabel(a.childCount)}`}
                onClick={() => go(`/rodina/${a.id}`)}
              />
            </div>
          ))
        )}
      </Card>

      <GroupTitle>Záznam v systému</GroupTitle>
      <Card>
        <Row title="UID" meta={<Meta><span className="font-mono">{formatUid(id)}</span></Meta>} />
        <Divider />
        <Row title="Uzavřeno" meta={<Meta>{agreement ? formatDate(agreement.concludedOn) : '—'}</Meta>} />
      </Card>

      {picker ? (
        <FacePicker uid={id} name={person.displayName} onClose={() => setPicker(false)} />
      ) : null}
    </Screen>
  )
}

/**
 * Hlavička profilu — velký obrázek, jméno, obec. Kliknutím na obrázek se
 * mění obrázek i barevné označení; jinde v aplikaci to nejde, aby se to
 * nepřepsalo omylem při scrollování seznamu.
 */
export function ProfileHead({
  uid,
  name,
  kind = 'person',
  line,
  town,
  onEdit,
  extra,
}: {
  uid: string
  name: string
  kind?: FaceKind
  line: string
  town: string | null
  onEdit: () => void
  extra?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-[var(--ds-purple-100)] p-4">
      <button type="button" onClick={onEdit} className="relative shrink-0" aria-label="Změnit obrázek">
        <Face uid={uid} name={name} kind={kind} size="lg" />
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ds-purple-700)] text-white">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h3l2-2h6l2 2h3v12H4V7Z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </span>
      </button>
      <div className="min-w-0 flex-1">
        <div className="text-copy-16 truncate text-[var(--ds-purple-900)]">{line}</div>
        {town ? <div className="text-copy-14 truncate text-[var(--ds-purple-900)]">{town}</div> : null}
        {extra}
      </div>
    </div>
  )
}
