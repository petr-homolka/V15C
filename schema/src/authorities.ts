/**
 * Výstupy k úřadům: zprávy, žádosti o údaje, podatelna, roční výkaz.
 *
 * Dvě různé věci, které nemá generovat tentýž kód (dok. 13):
 *   – zpráva podle § 47b odst. 5 je JMENNÝ výstup ze spisu o jedné rodině;
 *   – výkaz podle § 49c je ZOBECNĚNÝ údaj za celou organizaci, bez jmen.
 *
 * Systém nic neodesílá sám. Připraví a zaznamená doručení; odesílá člověk
 * (dok. 05, 13, 16).
 */

import type {
  AuditFields, Delivery, Id, IsoDate, IsoDateTime,
} from './common'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/caseFiles/{cid}/reports/{reportId}                     */
/* ------------------------------------------------------------------ */

/**
 * Workflow není „vygeneruj a odešli“: pěstoun se s obsahem seznámí a jeho
 * vyjádření se stává SOUČÁSTÍ ZÁVĚRŮ, ne kopií na vědomí (dok. 05).
 * Vyjádření pěstouna se nikdy negeneruje — je to jeho projev vůle (dok. 15).
 */
export interface Report extends AuditFields {
  id: Id
  caseFileId: Id
  agreementId: Id
  kind: 'periodic_6m' | 'on_termination' | 'on_request'

  /** Zpráva na vyžádání NEVYNULUJE šestiměsíční cyklus (dok. 13). */
  resetsPeriodicCycle: boolean
  /** U 'on_request': z čeho vyžádání vzešlo. */
  authorityRequestId: Id | null

  periodFrom: IsoDate | null
  periodTo: IsoDate | null

  draftedOn: IsoDate | null         // od tohoto dne běží 15 dnů
  dueBy: IsoDate | null             // draftedOn + 15
  fromDraftId: Id | null
  documentId: Id | null

  acknowledgedByCaregiverAt: IsoDateTime | null
  caregiverStatement: string | null

  /**
   * Tři samostatná doručení. ORP dítěte je JINÝ úřad než ORP pěstouna,
   * takže „odesláno“ nemůže být jedno pole — a při stěhování dítěte se
   * adresát č. 3 mění (dok. 05).
   */
  deliveries: Delivery[]
  status: 'draft' | 'awaiting_acknowledgement' | 'final' | 'delivered'
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/authorityRequests/{id}                                 */
/* ------------------------------------------------------------------ */

/**
 * Vydání údajů VEN. Protipól `InspectionRequest`, který řeší nahlížení
 * dovnitř — splynout nesmějí, protože při kontrole odpovídají na dvě
 * různé otázky (dok. 14).
 *
 * Povinnost sdělit údaje má pověřená osoba podle § 53 odst. 1 písm. e),
 * ale mlčenlivost podle § 57 odst. 2 platí obdobně — proto právní titul.
 */
export interface AuthorityRequest extends AuditFields {
  id: Id
  caseFileId: Id | null             // null u zobecněných dotazů (§ 49c odst. 5)

  requester: {
    kind: 'ospod' | 'kraj_ku' | 'court' | 'police' | 'prosecutor'
        | 'labour_office' | 'ombudsman' | 'other'
    authorityId: Id | null
    label: string
    fileRef: string | null          // jejich jednací číslo
  }
  legalBasis: string                // § 53 odst. 1 e), § 128 o.s.ř., …
  receivedOn: IsoDate
  dueOn: IsoDate | null             // z výzvy, ne dopočítané
  requestedScope: string

  decision: 'provided' | 'partially_provided' | 'refused' | null
  /** Schvaluje vedení, ne Klíčová osoba sama (dok. 13). */
  decidedByPersonId: Id | null
  decidedOn: IsoDate | null
  refusalReason: string | null

  releasedDocumentIds: Id[]
  releasedSummary: string | null
  delivery: Delivery | null

  incomingSubmissionId: Id | null
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/submissions/{id} — podatelna                           */
/* ------------------------------------------------------------------ */

/**
 * Dopis „hozený do chatu“. Tři místa, kde by se to rozbilo (dok. 14 sekce 3):
 *   1. špatně přečtená lhůta → `deadlineGuess` je NEPOTVRZENÁ a vedle ní se
 *      ukazuje úryvek, ze kterého se čísla čtou;
 *   2. špatně přiřazený spis → do potvrzení podání NEŽIJE v žádném spisu;
 *   3. podatelna nesmí být obyčejné vlákno → vyhrazený interní kanál.
 */
export interface IncomingSubmission extends AuditFields {
  id: Id
  documentId: Id                    // sken/PDF, jak přišel
  receivedOn: IsoDate               // kdy fyzicky došlo — zadá člověk
  postedByPersonId: Id

  extracted: {
    senderGuess: string | null
    fileRefGuess: string | null
    legalBasisGuess: string | null
    deadlineGuess: IsoDate | null
    /** Úryvek, ze kterého se lhůta čte — potvrzení je pohled, ne čtení dopisu. */
    deadlineSourceSnippet: string | null
    caseFileGuess: Id | null
    hearingDateGuess: IsoDate | null
    confidence: 'high' | 'low'
  }

  confirmedByPersonId: Id | null
  confirmedAt: IsoDateTime | null
  authorityRequestId: Id | null      // vznikne AŽ potvrzením
  status: 'inbox' | 'confirmed' | 'filed' | 'dismissed'
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/registryReturns/{year}                                 */
/* ------------------------------------------------------------------ */

/**
 * Roční výkaz do registru pověřených osob — § 49c odst. 4, do 30. 6.
 *
 * Systém výkaz NEODESÍLÁ: podává se elektronickým systémem kraje na tiskopisu
 * předepsaném ministerstvem, což je cizí formulář, jehož podobu neřídíme
 * a která se mění. Spočítá čísla, ukáže je a uloží snímek (dok. 13).
 */
export interface AnnualRegistryReturn extends AuditFields {
  id: Id                            // = rok jako string
  year: number                      // rok, ZA který se vykazuje
  dueOn: IsoDate                    // vždy YYYY+1-06-30
  status: 'draft' | 'submitted' | 'corrected'
  submittedOn: IsoDate | null
  submissionChannel: 'ku_electronic_system'

  figures: {
    capacityMaxAgreements: number | null
    staffHeadcount: number
    staffFteTotal: number
    agreementsActive: number
    childrenPlaced: number
    /** Odmítnutí podle § 48a odst. 1 písm. d) — proto ServiceInquiry (dok. 13). */
    refusedOutOfMandate: number
    refusedCapacity: number
    refusedTerminatedWithin6m: number
    /** Volné doplňky, protože tiskopis se mění a my ho neřídíme. */
    extra: Record<string, number | string>
  }

  computedAt: IsoDateTime
  /** PDF toho, co bylo podáno — kvůli kontrole správnosti a úplnosti. */
  snapshotDocumentId: Id | null
}

/* ------------------------------------------------------------------ */
/* transfers/{transferCode} — jediná mezi-organizační kolekce           */
/* ------------------------------------------------------------------ */

/**
 * Předávací kód (dok. 02, 09). Zapisuje POUZE Cloud Function — atomicita
 * a to, že ani jedna strana nesmí obsah druhé přepsat.
 *
 * Přenáší se i respitní dny a vzdělávací hodiny, jinak by přijímající
 * organizace poskytla dalších čtrnáct dní, aniž by to věděla (dok. 09).
 * U přechodu DÍTĚTE se naopak nepřenášejí (dok. 18) — snadné zaměnit.
 */
export interface Transfer {
  code: string
  subject: 'carer' | 'child'
  fromOrganizationId: Id
  toOrganizationId: Id | null        // doplní se při přijetí

  /** Uvolnění nejdéle měsíc před koncem, účinné až den po zániku (dok. 02). */
  releasedOn: IsoDate
  validFrom: IsoDate
  validUntil: IsoDate
  status: 'issued' | 'claimed' | 'completed' | 'expired' | 'cancelled'

  carryOver: {
    educationHours: number | null
    educationPeriodFrom: IsoDate | null
    respiteDaysUsedByChild: Array<{ childId: Id; days: number; year: number }> | null
  } | null

  finalReportDocumentId: Id | null
  claimedAt: IsoDateTime | null
  completedAt: IsoDateTime | null
}

/* ------------------------------------------------------------------ */
/* Reporty pro účetní — NEJSOU výkaznictví vůči orgánům (dok. 13)      */
/* ------------------------------------------------------------------ */

/** Interní podklady. Systém není účetnictví, je poskytovatel podkladů (dok. 07). */
export interface ReportDefinition extends AuditFields {
  id: Id
  dimension: 'organization' | 'key_person' | 'caregiver' | 'child'
  scope: { subjectId: Id | null; all: boolean }
  period: { kind: 'month' | 'quarter' | 'year' | 'custom'; from: IsoDate; to: IsoDate }
  schedule: { cron: string; recipients: Id[] } | null
  sections: Array<'expenses' | 'education' | 'respite' | 'vehicle' | 'contacts'>
  format: 'xlsx' | 'pdf' | 'csv'
  /** Bez verzí sad a směrnic není report při kontrole reprodukovatelný (dok. 07). */
  generatedAt: IsoDateTime | null
  legalRulesetIds: Id[]
  orgPolicyIds: Id[]
}

/* ------------------------------------------------------------------ */
/* EXIT — pět druhů (dok. 18 sekce 5)                                  */
/* ------------------------------------------------------------------ */

/**
 * Odchod nikdy nemaže historii. Organizace si odnáší jen to nejnutnější
 * a ve formátu PDF; kam si to nahraje, je její věc.
 */
export interface ExitPackage extends AuditFields {
  id: Id
  kind: 'organization' | 'key_worker' | 'caregiver' | 'child' | 'staff'
  subjectId: Id
  requestedOn: IsoDate
  status: 'queued' | 'ready' | 'downloaded' | 'expired'
  /** Co se generuje: souhrn za pěstouny, děti a Klíčové osoby. */
  contents: Array<{ path: string; documentId: Id; label: string }>
  readyAt: IsoDateTime | null
  downloadedAt: IsoDateTime | null
  expiresAt: IsoDateTime | null
}
