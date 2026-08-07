/**
 * Dohody, umístění dětí, souhlasy a vyjádření ORP, vzdělávací období.
 *
 * Tři věci, které se tady snadno pokazí a jsou proto v typech vidět:
 *   1. dohodu uzavírají MANŽELÉ SPOLEČNĚ, takže nemůže mít jednoho vlastníka
 *      (§ 47b odst. 7, dok. 01);
 *   2. u osoby v evidenci dohoda NEVISÍ NA DÍTĚTI (§ 47c odst. 1, dok. 18);
 *   3. bez souhlasu ORP podle § 154 SpŘ nelze vyplatit státní příspěvek (dok. 01).
 */

import type {
  AuditFields, ComputedFrom, Id, IsoDate, Lifecycle,
} from './common'
import type { CustodyBasis } from './people'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/agreements/{agreementId}                               */
/* ------------------------------------------------------------------ */

export interface Agreement extends AuditFields {
  id: Id
  reference: string                 // 'ROD-2026-001' — lidský identifikátor

  /**
   * Jedna až dvě osoby. Manželé uzavírají společně bez ohledu na to, komu
   * jsou které děti svěřeny (§ 47b odst. 7). Jeden `fosterPersonUid` by byl
   * strukturální chyba — proto pole.
   */
  carerPersonIds: Id[]
  jointSpouses: boolean
  /** Výjimka § 47b odst. 7 věta druhá — manželé spolu nežijí, ORP rozhodl. */
  separatedByOrpDecision: boolean

  carerKind: 'pecujici' | 'v_evidenci'
  custodyBasis: CustodyBasis
  /** PPPD je vždy zprostředkovaná → vzdělávání 24 h, nezávisle na dětech (dok. 18). */
  mediatedCare: boolean

  /** Právní režim se váže k dohodě, ne k systému — novela nepřepíše minulost. */
  legalRegime: string
  legalRulesetId: Id

  counterparty: 'pověřená osoba' | 'ORP'
  concludedOn: IsoDate | null
  effectiveFrom: IsoDate | null
  status: AgreementStatus

  /** Zánik jen k 30. 6. / 31. 12. s 30denní výpovědí (dok. 01). */
  termination: {
    noticeGivenOn: IsoDate | null
    noticeByWhom: 'organization' | 'carer' | null
    reason: string | null
    /** § 47c odst. 2 písm. c) — odmítnutí přijetí dítěte do PPPD. */
    legalGround: string | null
    effectiveOn: IsoDate | null
  } | null

  /** Předchozí a následující organizace při přechodu (dok. 02, 09). */
  previousOrganizationId: Id | null
  transferCode: string | null

  /* --- denormalizované ukazatele: každá obrazovka jeden dotaz --- */
  carerDisplayName: string
  childCount: number
  activePlacementCount: number
  nextObligationDueOn: IsoDate | null
  openObligationCount: number

  lifecycle: Lifecycle
}

export type AgreementStatus =
  | 'draft'                 // připravuje se
  | 'awaiting_orp_consent'  // bez souhlasu ORP nelze aktivovat (dok. 01)
  | 'active'
  | 'notice_given'
  | 'ended'

/* ------------------------------------------------------------------ */
/* Souhlas ORP podle § 154 správního řádu                              */
/* ------------------------------------------------------------------ */

/**
 * Samostatný artefakt, ne poznámka u dohody. Bez souhlasu ORP nelze vyplatit
 * státní příspěvek na výkon pěstounské péče — to je ta nejtvrdší podmínka
 * v celé agendě (dok. 01).
 *
 * Ukládá se jako `agreements/{id}/consents/{consentId}`.
 */
export interface OrpConsent extends AuditFields {
  id: Id
  orpId: Id
  requestedOn: IsoDate
  decision: 'granted' | 'refused' | null
  decidedOn: IsoDate | null
  documentId: Id | null
  note: string | null
}

/**
 * Vyjádření ORP podle § 10 odst. 3 — JINÝ dokument než souhlas výše.
 * Bez něj nelze uzavřít dohodu u osob podle § 2a písm. c) bodu 2 a 3 (dok. 18).
 *
 * Ukládá se jako `agreements/{id}/orpStatements/{id}`.
 */
export interface OrpStatement extends AuditFields {
  id: Id
  personId: Id
  childId: Id
  basis: 'pending_ex_officio' | 'pending_on_motion'
  issuedByOrpId: Id
  issuedOn: IsoDate
  personallyCares: boolean
  /** Jen u § 2a c) 3. Zjevná bezdůvodnost — § 10 odst. 4. */
  manifestlyUnfounded: boolean | null
  documentId: Id
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/agreements/{agreementId}/placements/{placementId}       */
/* ------------------------------------------------------------------ */

/**
 * Umístění dítěte je TEMPORÁLNÍ entita (dok. 03), ne pole u dítěte.
 * U přechodné péče se děti střídají a dohoda trvá dál — spis bez dítěte
 * je platný stav, ne nedokončený (dok. 18).
 */
export interface Placement extends AuditFields {
  id: Id
  childId: Id
  childDisplayName: string          // denormalizace kvůli seznamům
  agreementId: Id

  startedOn: IsoDate
  startDocumentId: Id | null        // rozhodnutí soudu

  /** Kterému z manželů je dítě svěřeno; null = do společné péče. */
  entrustedToPersonId: Id | null

  endedOn: IsoDate | null
  endReason: PlacementEndReason | null
  /** Doklad je povinný obsahově, ne blokačně — nic neblokuje (dok. 16, 18). */
  endDocumentId: Id | null
  endNote: string | null
  /** Když dítě přechází k pěstounovi v systému. */
  transferredToAgreementId: Id | null
}

export type PlacementEndReason =
  | 'to_permanent_foster' | 'to_parents' | 'to_guardian' | 'to_adoption'
  | 'to_institution' | 'adulthood' | 'care_terminated_other' | 'child_died'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/agreements/{id}/educationPeriods/{periodId}            */
/* ------------------------------------------------------------------ */

/**
 * Klouzavých 12 měsíců ukotvených dnem uzavření dohody, ne kalendářní rok —
 * to byla jedna ze čtyř oprav zadání (dok. 01). Přebytek se přenáší
 * do následujícího období (§ 47a odst. 3).
 *
 * Při přechodu k jiné organizaci hodiny jdou s pěstounem (dok. 10).
 */
export interface EducationPeriod extends AuditFields {
  id: Id
  agreementId: Id
  personId: Id                      // povinnost je osobní, ne rodinná

  periodFrom: IsoDate
  periodTo: IsoDate
  requiredHours: number             // 18 nebo 24 podle mediatedCare
  carriedOverHours: number          // z předchozího období
  completedHours: number            // dopočítané ze záznamů
  /** Přenos z jiné organizace — hodiny se počítají u nové (dok. 10). */
  importedHours: number
  importedFromOrganizationId: Id | null

  computedFrom: ComputedFrom
  closed: boolean
}
