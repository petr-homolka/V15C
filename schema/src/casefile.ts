/**
 * Spis: metadata, obsahové záznamy, časová osa.
 *
 * `caseFiles/{id}` je METADATA — čte je každý člen organizace.
 * `caseFiles/{id}/entries/{id}` je OBSAH — čtou jen role s přístupem k obsahu.
 * Rozdělení vynucuje Firestore, který neumí skrýt pole (dok. 04).
 */

import type {
  AuditFields, ComputedFrom, Id, IsoDate, IsoDateTime, Lifecycle, Money, Ref,
} from './common'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/caseFiles/{caseFileId} — METADATA                      */
/* ------------------------------------------------------------------ */

export interface CaseFile extends AuditFields {
  id: Id
  agreementId: Id
  reference: string                 // 'ROD-2026-001'

  carerPersonIds: Id[]
  carerDisplayName: string
  childIds: Id[]

  /** Klíčová osoba je vztah odpovědnosti, ne hranice přístupu (dok. 03). */
  keyWorkerPersonId: Id | null
  keyWorkerDisplayName: string | null
  deputyPersonId: Id | null

  /* --- uložené ukazatele: dashboard je jeden dotaz (README 1.4) --- */
  indicators: {
    lastContactOn: IsoDate | null
    nextContactDueOn: IsoDate | null
    /** Nejhorší lhůta ze všech dětí — detail je v obligations (dok. 11). */
    overdueObligationCount: number
    openObligationCount: number
    lastReportOn: IsoDate | null
    nextReportDueOn: IsoDate | null
    educationHoursDone: number
    educationHoursRequired: number
    respiteDaysUsedThisYear: number
    documentCount: number
    unreadIndexCount: number        // kolik dokumentů Eli ještě nepřečetla (dok. 17)
  }

  /** Archiv je stav spisu, ne jiné úložiště (dok. 18). */
  lifecycle: Lifecycle
  archivedOn: IsoDate | null
  archivedReason: 'care_ended' | 'agreement_ended' | 'org_exit' | null
  retentionUntil: IsoDate | null
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/caseFiles/{id}/entries/{entryId} — OBSAH               */
/* ------------------------------------------------------------------ */

/**
 * Jedna kolekce pro všechny druhy obsahových záznamů. Spis se čte
 * chronologicky přes všechny druhy; pět kolekcí by znamenalo pět dotazů
 * a slučování na klientu (README sekce 2).
 */
export type CaseEntry =
  | MonitoringContact
  | ContactEvent
  | CaseNote
  | CareEpisode
  | ExpenseEntry
  | EducationRecord
  | ChecklistRun

export interface CaseEntryBase extends AuditFields {
  id: Id
  kind: CaseEntry['kind']
  caseFileId: Id
  agreementId: Id
  /** Kdy se to STALO, ne kdy se to zapsalo (dok. 12). */
  occurredAt: IsoDateTime
  subjectRefs: Ref[]
  /** Storno místo mazání — nic se nemaže (dok. 10, 16). */
  voided: boolean
  voidedByPersonId: Id | null
  voidReason: string | null
}

/* --- osobní styk ---------------------------------------------------- */

/**
 * Nejcitlivější záznam v celém systému: plní dvouměsíční lhůtu, a ta běží
 * ZVLÁŠŤ za pěstouna a ZVLÁŠŤ za každé svěřené dítě (§ 47b odst. 4, dok. 11).
 *
 * Jedno zaškrtávátko „návštěva proběhla“ by vykazovalo soulad tam, kde není.
 * Proto `presentChildIds` a `absentChildren` — a dítě, které nebylo zmíněno,
 * zůstane prostě mimo obojí a lhůta mu běží dál (dok. 16).
 */
export interface MonitoringContact extends CaseEntryBase {
  kind: 'monitoring_contact'
  place: 'home' | 'organization' | 'other'
  /** Kontakt mimo domov se počítá stejně (rozhodnuto v dok. 11). */
  placeNote: string | null

  presentPersonIds: Id[]
  presentChildIds: Id[]
  absentChildren: Array<{
    childId: Id
    reason: string
    /** Omluvitelnost se zapisuje, nevynucuje. */
    justified: boolean
  }>

  durationMinutes: number | null    // jen pro plánování, ne pro výkaz práce
  summary: string
  computedFrom: ComputedFrom
}

/* --- kontakt s blízkými, asistovaný kontakt -------------------------- */

/** § 47a odst. 2 písm. e) — pomoc při styku s osobami blízkými (dok. 09). */
export interface ContactEvent extends CaseEntryBase {
  kind: 'contact_event'
  childId: Id
  contactWith: Array<{ kind: 'parent' | 'sibling' | 'relative' | 'other'; personId: Id | null; label: string }>
  assisted: boolean
  assistedByPersonId: Id | null
  place: string | null
  courseNote: string
  /** Doporučení z odborné pomoci se předvyplňují do plánu (dok. 07). */
  recommendation: string | null
}

/* --- poznámka a diktát ----------------------------------------------- */

export interface CaseNote extends CaseEntryBase {
  kind: 'note' | 'dictation'
  text: string
  /** U diktátu: co navrhla AI a co člověk změnil (dok. 02 sekce 6). */
  aiProposedText: string | null
  attachmentDocumentIds: Id[]
}

/* --- respit ---------------------------------------------------------- */

/**
 * Zajištěná celodenní péče — § 47a odst. 2 písm. b), 14 dní od 2 let dítěte.
 * Jednotkou je DEN, i když šlo o hodinu (rozhodnuto v dok. 03).
 * Počty se při přechodu pěstouna přenášejí s ním (dok. 09), u dítěte ne (dok. 18).
 */
export interface CareEpisode extends CaseEntryBase {
  kind: 'care_episode'
  childId: Id
  from: IsoDate
  to: IsoDate
  days: number
  providerPersonId: Id | null
  providerLabel: string | null
  /**
   * Manžel či registrovaný partner v rodinné domácnosti plní vlastní zákonnou
   * povinnost (§ 965 odst. 3 + § 655 odst. 2 OZ), takže úplata nelze (dok. 05).
   */
  paid: boolean
  amount: Money | null
  overLimit: boolean
  justification: string | null
  place: 'home' | 'provider' | 'camp' | 'other'
}

/* --- výdaj ----------------------------------------------------------- */

/**
 * Výdaj ZÁMĚRNĚ není v časové ose — zašuměl by ji (rozhodnuto v dok. 12).
 * Systém není účetnictví; je to poskytovatel podkladů (dok. 07).
 */
export interface ExpenseEntry extends CaseEntryBase {
  kind: 'expense'
  amount: Money
  categoryCode: string
  /** Písmeno práva podle § 47a odst. 2 — mapa je verzovaná (dok. 02). */
  rightCode: string | null
  boundToPersonId: Id | null
  boundToChildId: Id | null
  paymentRoute: 'org_paid' | 'reimbursed_to_carer' | 'paid_by_carer' | null
  receiptDocumentId: Id | null
  approvedByPersonId: Id | null
  approvedAt: IsoDateTime | null
}

/* --- vzdělávání ------------------------------------------------------ */

export interface EducationRecord extends CaseEntryBase {
  kind: 'education_record'
  personId: Id                      // povinnost je osobní
  educationPeriodId: Id
  title: string
  hours: number
  form: 'in_person' | 'online_live' | 'elearning' | 'self_study' | 'other'
  providerLabel: string | null
  certificateDocumentId: Id | null
  /** Přeneseno z jiné organizace — hodiny se počítají u nové (dok. 10). */
  importedFromOrganizationId: Id | null
}

/* --- vyplněný checklist ---------------------------------------------- */

/** Checklist vyplněný na návštěvě je z poloviny hotová zpráva (dok. 07). */
export interface ChecklistRun extends CaseEntryBase {
  kind: 'checklist_run'
  templateId: Id
  templateVersion: string
  answers: Array<{
    itemCode: string
    childId: Id | null              // u položek 'child_each'
    value: string | number | boolean | null
    photoDocumentId: Id | null
  }>
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/caseFiles/{id}/timeline/{entryId}                      */
/* ------------------------------------------------------------------ */

/**
 * Tenký index, ne úložiště (dok. 12). Malý dokument s odkazem — obsah se
 * nekopíruje, protože by se rozešel s originálem a zdvojnásobil čtení.
 */
export interface TimelineEntry {
  id: Id
  caseFileId: Id
  occurredAt: IsoDateTime           // KDY se to stalo
  recordedAt: IsoDateTime           // kdy se to zapsalo

  refType: TimelineRefType
  refId: Id
  actorPersonId: Id
  subjectRefs: Ref[]
  visibilityClass: 'metadata' | 'content'
  summary: string
}

export type TimelineRefType =
  | 'monitoring_contact' | 'contact_event' | 'note' | 'dictation'
  | 'document' | 'plan' | 'report' | 'education_record' | 'care_episode'
  | 'message_thread' | 'signature' | 'obligation' | 'handover' | 'transfer'
  | 'life_book_entry' | 'incoming_submission' | 'authority_request'
  | 'placement_start' | 'placement_end'
  // výdaje ZÁMĚRNĚ nejsou — rozhodnuto v dok. 12
  // koncepty ZÁMĚRNĚ nejsou — do osy jde až uložený dokument (dok. 15)

/* ------------------------------------------------------------------ */
/* Kniha života — patří DÍTĚTI, ne organizaci                          */
/* ------------------------------------------------------------------ */

/**
 * `children/{childId}/lifeBook/{entryId}`.
 * Přístup rodiče až po souhlasu dítěte, pěstouna a Klíčové osoby;
 * odebrat ho může kdokoli z nich sám (dok. 10).
 * Eli knihu života neindexuje a nečte (dok. 17).
 */
export interface LifeBookEntry extends AuditFields {
  id: Id
  childId: Id
  occurredOn: IsoDate | null
  title: string
  text: string | null
  documentIds: Id[]
  authorRole: 'child' | 'caregiver' | 'key_worker' | 'parent'
  /** Nikdy se neindexuje pro asistenta. */
  indexable: false
}

/** Souhlas s přístupem rodiče ke knize života — tři souhlasy, jedno odebrání. */
export interface LifeBookAccessGrant extends AuditFields {
  id: Id
  childId: Id
  parentPersonId: Id
  approvals: Array<{
    byRole: 'child' | 'caregiver' | 'key_worker'
    byPersonId: Id
    approvedAt: IsoDateTime
  }>
  active: boolean
  revokedByPersonId: Id | null
  revokedAt: IsoDateTime | null
}
