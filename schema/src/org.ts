/**
 * orgs/{orgId} a jeho správní podkolekce.
 *
 * Organizace je nájemce (tenant) a je v cestě, takže dotaz mimo svou
 * organizaci nejde ani napsat (README sekce 1.1).
 */

import type {
  AuditFields, Id, IsoDate, IsoDateTime, Money, OrgRole, Revocable,
} from './common'
import type { AssistantPersona } from './platform'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}                                                        */
/* ------------------------------------------------------------------ */

export interface Organization extends AuditFields {
  id: Id
  legalName: string
  displayName: string
  ico: string | null
  /** Pověřená osoba může být i fyzická osoba, která je sama Klíčovou osobou (dok. 03). */
  subjectKind: 'legal_entity' | 'natural_person' | 'municipality_orp'

  seat: { street: string; city: string; zip: string; country: string }

  /** Pověření k výkonu SPOD — na tom visí povinnosti z dok. 13. */
  mandate: {
    issuedByKrajskyUradId: Id
    issuedOn: IsoDate
    scopeCodes: string[]            // § 48 odst. 2 písm. a)–e)
    registryEntryNo: string | null
    suspendedFrom: IsoDate | null
    withdrawnOn: IsoDate | null
  }

  /** Kapacita musí být číslo — odmítnutí „pro kapacitu“ se vykazuje (dok. 13). */
  capacity: { maxAgreements: number | null; note: string | null }

  /** Pojištění odpovědnosti — § 48a odst. 3, opakující se povinnost (dok. 13). */
  insurance: {
    insurer: string | null
    policyNo: string | null
    validFrom: IsoDate | null
    validUntil: IsoDate | null
    copySentOn: IsoDate | null
  }

  legalRegime: string               // výchozí režim pro nové dohody
  lifecycle: 'active' | 'exiting' | 'exited'
  exitedOn: IsoDate | null
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/members/{personId}                                     */
/* ------------------------------------------------------------------ */

/**
 * Členství. Role se odsud propisuje do custom claims tokenu Cloud Functionou —
 * pravidla pak nečtou nic (README sekce 1.2).
 */
export interface OrgMembership extends AuditFields, Revocable {
  personId: Id
  role: OrgRole
  /** Vedlejší role, když jeden člověk dělá dvě věci (běžné v malé organizaci). */
  additionalRoles: OrgRole[]

  fteFraction: number              // 1.0 = plný úvazek
  /**
   * Poměr agend jako NASTAVENÝ parametr, ne měření času.
   * Systém není docházkový (rozhodnuto v dok. 11).
   */
  agendaAllocation: Array<{ agendaCode: string; percent: number }>

  startedOn: IsoDate
  endedOn: IsoDate | null
  /** Scénáře odchodu — dok. 03 sekce o odchodu Klíčové osoby. */
  handoverToPersonId: Id | null
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/policies/{policyId}                                    */
/* ------------------------------------------------------------------ */

/**
 * Směrnice organizace v datech. Organizace si nastavuje, co chce, a nese
 * riziko; systém při překročení jen zobrazí údaj (dok. 07, dok. 16).
 */
export interface OrgPolicy extends AuditFields {
  id: Id
  code: string                     // 'smernice-1'
  title: string
  version: string
  effectiveFrom: IsoDate
  effectiveUntil: IsoDate | null
  supersedesPolicyId: Id | null
  sourceDocumentId: Id | null      // naskenovaná směrnice

  parameters: OrgPolicyParameters
}

export interface OrgPolicyParameters {
  respite: {
    /** Např. 450 Kč/den, 70 % strop, 6 300 Kč/rok ze Směrnice č. 1 (dok. 05). */
    ratePerDayMinor: number | null
    maxSharePct: number | null
    annualCapMinor: number | null
    /** Zákonná kvalifikovaná péče zdarma. */
    zkpFree: boolean
  }
  education: {
    accommodationPerNightMinor: number | null
    travelReimbursed: boolean
    fuelPriceSeries: Array<{ from: IsoDate; pricePerLitreMinor: number }>
    perDiemMinor: number | null
  }
  reimbursements: Array<{ code: string; enabled: boolean; capMinor: number | null }>
  monitoring: {
    /** Organizace může chtít častěji než zákon. Méně často nesmí. */
    contactIntervalMonths: number | null
    reportIntervalMonths: number | null
  }
  vehicles: { leasePerAgreementPerMonthMinor: number | null }
  /** Každé upozornění lze vypnout — charta, dok. 16. */
  warnings: Record<string, boolean>
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/standards/{standardId}                                 */
/* ------------------------------------------------------------------ */

/** Přijatý standard. „Standardy jsou vždy platné Od…“ (zadání, dok. 06). */
export interface AdoptedStandard extends AuditFields {
  id: Id
  templateId: Id
  code: string
  effectiveFrom: IsoDate
  effectiveUntil: IsoDate | null

  ownText: string                  // vlastní znění organizace
  /** Sebehodnocení 0–3. Vedle skóre se ukazují prahy § 50 odst. 1 h) (dok. 13). */
  selfScore: 0 | 1 | 2 | 3 | null
  selfScoreNote: string | null
  selfScoredOn: IsoDate | null
  evidenceRefs: Array<{ kind: string; id: Id }>
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/checklists/{id}                                        */
/* ------------------------------------------------------------------ */

/** Checklist nic nevynucuje; nevyplněná položka je prázdná, ne chyba (dok. 16). */
export interface ChecklistTemplate extends AuditFields {
  id: Id
  code: string
  title: string
  version: string
  effectiveFrom: IsoDate
  items: Array<{
    code: string
    label: string
    kind: 'bool' | 'text' | 'number' | 'photo' | 'child_each'
    /** Kam se odpověď promítne — předvyplnění zprávy a plánu (dok. 07). */
    mapsTo: { reportSection?: string; planAreaCode?: string } | null
  }>
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/settings/{scope}                                       */
/* ------------------------------------------------------------------ */

/**
 * Nastavení organizace. Tři úrovně parametrů jsou platforma → organizace →
 * pracovník (dok. 03); tady je ta prostřední.
 */
export interface OrgSettings extends AuditFields {
  scope: 'general' | 'assistant' | 'documents' | 'notifications'

  assistant: {
    enabled: boolean
    persona: AssistantPersona
    /** Rozsah je celá organizace (rozhodnuto uživatelem, dok. 14 sekce 9). */
    searchScope: 'organization'
    actionsEnabled: boolean
    learningEnabled: boolean
    /** Organizace může stupeň zpřísnit, nikdy uvolnit (dok. 15 sekce 3). */
    tierOverrides: Record<string, 1 | 2>
  } | null

  documents: {
    /** Vrstvy indexace kvůli nákladům (dok. 17 sekce 2.3). */
    extractTextLayer: boolean
    ocrScans: boolean
    semanticIndex: boolean
  } | null

  notifications: {
    /** Pěstounovi a dítěti nechodí prakticky nic (rozhodnuto v dok. 18). */
    externalOnly: Array<'upcoming_contact' | 'new_message'>
    staffChannels: Array<'push' | 'email' | 'in_app'>
  } | null
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/subscription/current a wallet/current                  */
/* ------------------------------------------------------------------ */

export interface Subscription extends AuditFields {
  plan: 'free' | 'paid'
  billingPeriod: 'monthly' | 'annual'
  trialUntil: IsoDate | null
  pricingRulesetId: Id
  /** Měřeno k datu, ne průměrem — nedá se o tom vést spor (dok. 19). */
  billableAgreementCount: number
  measuredOn: IsoDate
  status: 'trial' | 'active' | 'past_due' | 'suspended' | 'ended'
  /** České neziskovky běžně platí na fakturu převodem (dok. 19). */
  paymentMethod: 'card' | 'invoice' | null
  externalCustomerId: string | null
}

/** Kredit na AI. Když dojde, Eli přestane navrhovat — nic jiného (dok. 19). */
export interface CreditWallet extends AuditFields {
  balance: Money
  autoTopUp: { enabled: boolean; threshold: Money; amount: Money } | null
  lastTopUpAt: IsoDateTime | null
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/audit/{auditId}                                        */
/* ------------------------------------------------------------------ */

/**
 * Append-only. Pravidla povolují create a zakazují update i delete.
 * Audit není spis — odpovídá na „kdo se na co díval“, ne „co se dělo“ (dok. 15).
 */
export interface AuditEvent {
  at: IsoDateTime
  personId: Id
  kind:
    | 'case_file_view' | 'document_export' | 'cross_case_access'
    | 'permission_change' | 'setting_change' | 'export' | 'disposal'
    | 'sign' | 'authority_release' | 'assistant_query' | 'assistant_action'
  target: { kind: string; id: Id } | null
  detail: Record<string, unknown> | null
}
