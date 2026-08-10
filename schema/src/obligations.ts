/**
 * Lhůty. Dvě řady: vůči rodině (`obligations`) a vůči úřadům
 * (`mandateObligations`) — dosud existovala jen první (dok. 13).
 *
 * Ploché kolekce na úrovni organizace, aby „co mi utíká napříč rodinami“
 * byl jeden indexovaný dotaz (README sekce 2).
 *
 * Lhůty se DOPOČÍTÁVAJÍ ze sady pravidel a nikdy se nedopisují ručně.
 * Jejich výstupem je anotace, ne návrh schůzky — termíny si Klíčová osoba
 * domlouvá mimo systém (dok. 11).
 */

import type { AuditFields, ComputedFrom, Id, IsoDate, Ref } from './common'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/obligations/{obligationId}                             */
/* ------------------------------------------------------------------ */

export interface Obligation {
  id: Id
  kind: ObligationKind

  agreementId: Id | null
  caseFileId: Id | null
  /**
   * U osobního styku je vyplněný BUĎ personId (pěstoun), NEBO childId —
   * lhůta běží zvlášť za pěstouna a zvlášť za každé dítě (dok. 11).
   * U osoby v evidenci bez dítěte vzniká jen řádek za osobu, a ten se
   * nesmí přeskočit jako „nemá děti, nic neřeším“ (dok. 18).
   */
  personId: Id | null
  childId: Id | null
  /** Denormalizace kvůli seznamům — jeden dotaz bez dočítání. */
  subjectDisplayName: string
  caseFileReference: string | null

  /** Komu se to zobrazuje. Nikdy se to nikam neeskaluje (dok. 16). */
  assigneePersonId: Id | null

  basisDate: IsoDate
  dueOn: IsoDate
  status: 'open' | 'met' | 'overdue' | 'justified_exception'

  metByRef: Ref | null
  metOn: IsoDate | null
  /** Povinné u justified_exception — „musí být řádně odůvodněno ve spisu“. */
  justification: string | null

  /** Nabídky vedle anotace. Nic negeneruje samo (dok. 15 sekce 6). */
  suggestedActions: SuggestedAction[]

  computedFrom: ComputedFrom
  recomputedAt: string
}

export type ObligationKind =
  | 'personal_contact'          // 2 měsíce, § 47b odst. 4
  | 'report_6m'                 // 6 měsíců, § 47b odst. 5
  | 'report_delivery'           // 15 dnů třem adresátům
  | 'education_period_end'      // klouzavých 12 měsíců
  | 'respite_year_end'          // kalendářní rok
  | 'agreement_conclusion'      // 30 dnů od právní moci svěření
  | 'termination_notice_window' // 30. 6. / 31. 12. minus 30 dnů
  | 'orp_consent_pending'       // blokuje aktivaci i příspěvek
  | 'orp_statement_pending'     // § 10 odst. 3 u § 2a c) 2 a 3
  | 'transfer_code_window'      // okno Předávacího kódu
  | 'registry_entry_expiry'     // vyřazení z evidence KÚ = zánik dohody

export type SuggestedAction =
  | 'create_draft_report' | 'plan_visit' | 'record_contact'
  | 'request_orp_consent' | 'attach_document' | 'open_case_file'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/mandateObligations/{id}                                */
/* ------------------------------------------------------------------ */

/**
 * Povinnosti ORGANIZACE vůči úřadu. Tři z nich mají jako sankci odnětí
 * pověření (§ 50 odst. 1 písm. c) a g) — dok. 13.
 *
 * Vedení to vidí jako přehled; nechodí to jako výzvy (dok. 16).
 */
export interface MandateObligation extends AuditFields {
  id: Id
  kind: MandateObligationKind

  triggerEvent: string              // co ji vyvolalo
  triggeredOn: IsoDate
  dueOn: IsoDate
  /** U opatření z kontroly určuje lhůtu úřad, nedopočítává se. */
  dueOnFromAuthority: boolean

  authorityId: Id                   // KÚ, který vydal pověření
  status: 'open' | 'submitted' | 'overdue' | 'closed'
  submittedOn: IsoDate | null
  evidenceDocumentId: Id | null     // doručenka, potvrzení, protokol
  note: string | null
}

export type MandateObligationKind =
  | 'mandate_change_notice'   // § 48a odst. 1 a) — do 15. dne dalšího měsíce
  | 'insurance_copy'          // § 48a odst. 3 — 15 dnů, OPAKUJE SE při obnově
  | 'corrective_measure'      // § 49b odst. 3 — lhůta od orgánu
  | 'annual_registry_return'  // § 49c odst. 4 — do 30. 6.
  | 'aggregate_on_request'    // § 49c odst. 5 — 8 dnů
