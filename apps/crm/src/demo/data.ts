/**
 * Dotazy, které obrazovky potřebují. Cesty se skládají výhradně přes
 * `schema/src/paths.ts`, aby přechod na Firestore byl výměna těla funkcí,
 * ne hledání cest po komponentách.
 */

import { org as orgPaths } from '../../../../schema/src/index'
import { collection, document, type Doc } from './store'

export interface OrgRow {
  id: string
  displayName: string
  legalName: string
}

export interface PersonRow {
  id: string
  displayName: string
  familyName: string
  grammaticalGender: 'f' | 'm'
  roles: string[]
}

export interface MemberRow {
  personId: string
  role: string
  additionalRoles: string[]
  status: string
}

export interface AgreementRow {
  id: string
  reference: string
  naming: { displayName: string; source: 'derived' | 'renamed' }
  carerPersonIds: string[]
  carerDisplayName: string
  carerKind: string
  custodyBasis: string
  status: string
  childCount: number
  activePlacementCount: number
  nextObligationDueOn: string | null
  openObligationCount: number
  concludedOn: string
}

export interface CaseFileRow {
  id: string
  agreementId: string
  reference: string
  keyWorkerPersonId: string
  keyWorkerDisplayName: string
  carerDisplayName: string
  childIds: string[]
  archivedOn: string | null
}

export interface ObligationRow {
  id: string
  kind: string
  agreementId: string
  caseFileId: string
  personId: string | null
  childId: string | null
  subjectDisplayName: string
  caseFileReference: string
  assigneePersonId: string
  dueOn: string
  status: string
}

export interface EntryRow {
  id: string
  kind: string
  caseFileId: string
  occurredAt: string
  summary: string | null
  place: string | null
  voided: boolean
}

export interface DocumentRow {
  id: string
  title: string
  category: string
  currentVersionNo: number
  indexStatus: string
  origin: { kind?: string } | null
}

export interface ChildRow {
  id: string
  displayName: string
  familyName: string
  birthDate: string
  school: unknown
  careEndedOn: string | null
}

const unwrap = <T>(docs: Array<Doc<T>>): T[] => docs.map((d) => d.data)

export const orgs = (): OrgRow[] => unwrap<OrgRow>(collection('orgs'))

export const org = (orgId: string): OrgRow | null =>
  document<OrgRow>(orgPaths(orgId).doc())?.data ?? null

export const persons = (orgId: string): PersonRow[] =>
  unwrap<PersonRow>(collection(orgPaths(orgId).persons()))

export const person = (orgId: string, personId: string): PersonRow | null =>
  document<PersonRow>(orgPaths(orgId).person(personId))?.data ?? null

export const members = (orgId: string): MemberRow[] =>
  unwrap<MemberRow>(collection(orgPaths(orgId).members()))

export const agreements = (orgId: string): AgreementRow[] =>
  unwrap<AgreementRow>(collection(orgPaths(orgId).agreements()))

export const caseFiles = (orgId: string): CaseFileRow[] =>
  unwrap<CaseFileRow>(collection(orgPaths(orgId).caseFiles()))

export const obligations = (orgId: string): ObligationRow[] =>
  unwrap<ObligationRow>(collection(orgPaths(orgId).obligations()))

export const entries = (orgId: string, caseFileId: string): EntryRow[] =>
  unwrap<EntryRow>(collection(orgPaths(orgId).entries(caseFileId)))

export const documents = (orgId: string, caseFileId: string): DocumentRow[] =>
  unwrap<DocumentRow>(collection(orgPaths(orgId).documents(caseFileId)))

export const children = (orgId: string): ChildRow[] =>
  unwrap<ChildRow>(collection(orgPaths(orgId).children()))

export const child = (orgId: string, childId: string): ChildRow | null =>
  document<ChildRow>(orgPaths(orgId).child(childId))?.data ?? null

/* ------------------------------------------------------------------ */

/**
 * Spis podle dohody. V aplikaci to bude dotaz `where('agreementId', '==', …)`;
 * tady je to průchod, protože sada je v paměti.
 */
export const caseFileOfAgreement = (
  orgId: string,
  agreementId: string,
): CaseFileRow | null => caseFiles(orgId).find((c) => c.agreementId === agreementId) ?? null

/** Lhůty jedné dohody, nejbližší termín první. */
export const obligationsOfAgreement = (
  orgId: string,
  agreementId: string,
): ObligationRow[] =>
  obligations(orgId)
    .filter((o) => o.agreementId === agreementId)
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn))

/** Dohody, které má Klíčová osoba ve správě. */
export const agreementsOfKeyWorker = (
  orgId: string,
  personId: string,
): AgreementRow[] => {
  const mine = new Set(
    caseFiles(orgId)
      .filter((c) => c.keyWorkerPersonId === personId)
      .map((c) => c.agreementId),
  )
  return agreements(orgId).filter((a) => mine.has(a.id))
}

/** Dohody, ve kterých je daná osoba pečující. */
export const agreementsOfCarer = (orgId: string, personId: string): AgreementRow[] =>
  agreements(orgId).filter((a) => a.carerPersonIds.includes(personId))

export const childrenOfAgreement = (orgId: string, agreementId: string): ChildRow[] => {
  const file = caseFileOfAgreement(orgId, agreementId)
  if (!file) return []
  const ids = new Set(file.childIds)
  return children(orgId).filter((c) => ids.has(c.id))
}
