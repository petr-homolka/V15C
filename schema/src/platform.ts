/**
 * platform/* — číselníky nad organizacemi.
 *
 * Čte je každý přihlášený, zapisuje jen superadmin. Všechno je datované:
 * novela zákona ani změna ceníku není nasazení kódu, ale nový dokument
 * s platností „od“ (dok. 02, dok. 19).
 */

import type {
  Currency, GrammaticalGender, Id, IsoDate, IsoDateTime, YearlyDate,
} from './common'

/* ------------------------------------------------------------------ */
/* Právní sada — platform/legalRulesets/{id}                           */
/* ------------------------------------------------------------------ */

/**
 * Zákon a vyhláška v datech. Dohoda si drží `legalRegime` a počítá se podle
 * sady, která platila — jinak by novela přepsala minulost (dok. 01, 02).
 */
export interface LegalRuleset {
  id: Id
  country: 'CZ'
  regime: string                    // 'CZ-2026-01'
  effectiveFrom: IsoDate
  effectiveUntil: IsoDate | null
  label: string
  sourceNote: string                // které předpisy a v jakém znění

  education: {
    /** 18 h nezprostředkovaná, 24 h zprostředkovaná — § 47a odst. 2 písm. f) */
    hoursNonMediated: number
    hoursMediated: number
    /** Klouzavých 12 měsíců od uzavření dohody, ne kalendářní rok (dok. 01). */
    periodMonths: number
    anchor: 'agreement_date'
    /** Přebytek se přenáší do dalšího období — § 47a odst. 3. */
    carryOverAllowed: boolean
    elearningFullyAllowed: boolean
  }

  respiteCare: {
    minDaysPerChildPerYear: number   // 14 — § 47a odst. 2 písm. b)
    childMinAgeYears: number         // 2
    countingUnit: 'day'              // i hodina = den (rozhodnuto v dok. 03)
    overLimitRequiresWrittenJustification: boolean
    overLimitRequiresIpodAlignment: boolean
    allowedInZdvop: boolean
  }

  monitoring: {
    personalContactMaxIntervalMonths: number   // 2 — § 47b odst. 4
    /** Lhůta běží per pěstoun A per dítě, ne per rodina (dok. 11). */
    contactPerChild: true
    reportIntervalMonths: number               // 6 — § 47b odst. 5
    reportAlsoOnTermination: boolean
    reportDeliveryDeadlineDays: number         // 15
    reportRecipients: Array<'caregiver' | 'orp_caregiver' | 'orp_child_residence'>
  }

  agreementLifecycle: {
    mustConcludeWithinDaysOfPlacement: number  // 30
    terminationBoundary: 'calendar_half_year'  // 30. 6. / 31. 12.
    noticeMinDaysBeforeBoundary: number        // 30
    lateNoticeShiftsToNextBoundary: boolean
    newAgreementDeadlineDaysAfterTermination: number
    onePerCarer: boolean                       // § 47b odst. 6
    spousesConcludeJointly: boolean            // § 47b odst. 7
    /** Nová dohoda účinná dnem po zániku staré (rozhodnuto v dok. 03). */
    transitionGapDays: number
    /** U osoby v evidenci trvá dohoda podle zápisu v evidenci — § 47c odst. 1. */
    registryEntryDrivesTerm: boolean
    orpConsentRequired: boolean                // § 154 SpŘ (dok. 01)
  }

  /** SPVPP. Pásma § 5c jsou odložená, pole ale existují (dok. 03). */
  grant: {
    currency: Currency
    annualAmountMinor: { pecujici: number; vEvidenci: number }
    increaseMinor: number
    increaseConditions: { minChildren: number; dependencyLevels: string[] }
    proRataUnit: 'month'
    spendBands: Array<{ rights: string[]; minPct: number; maxPct: number }>
    deadlines: {
      nextYearRequestBy: YearlyDate
      payoutBy: YearlyDate
      notifyChangesWithinDays: number
      spendReportBy: YearlyDate
      returnUnspentBy: YearlyDate
    }
    /** Mapa písmen práv — novela 2024 přečíslovala a)–h) na a)–g) (dok. 02). */
    rightCodes: Array<{ code: string; label: string }>
    nonEligible: string[]
  }

  /** Náhrady za zajištěnou péči — § 5f vyhlášky (dok. 04). */
  careProviderRates: {
    perDayMinor: number              // 260 Kč
    perHalfDayMinor: number          // 120 Kč
    perHourMinor: number             // 90 Kč
    accommodationOnlyForFullDay: boolean
    accommodationPerNightMinor: number
  }

  /** Povinnosti vůči úřadům — dok. 13. */
  mandateDuties: {
    registryReturnDueBy: YearlyDate            // '--06-30' § 49c odst. 4
    aggregateOnRequestDays: number             // 8 — § 49c odst. 5
    mandateChangeNoticeRule: 'by_15th_of_next_month'   // § 48a odst. 1 a)
    insuranceCopyWithinDays: number            // 15 — § 48a odst. 3
    inspectionMinFractionOfMaxPoints: number   // 1/3 — § 50 odst. 1 h)
    inspectionRepeatedMinFraction: number      // 1/2
  }
}

/* ------------------------------------------------------------------ */
/* Standardy — platform/standardTemplates/{id}                          */
/* ------------------------------------------------------------------ */

/** Příloha 2 vyhlášky 473/2012: 16 standardů, 30 kritérií (dok. 07). */
export interface StandardTemplate {
  id: Id
  legalRulesetId: Id
  code: string                      // '7a', '13a', '14a'
  standardNo: number                // 1–16
  title: string
  criterionText: string
  scoringMax: 0 | 1 | 2 | 3
  /** Kam se plnění tohoto kritéria promítá — klíčová vazba z dok. 07. */
  mapsTo: {
    planAreaCode?: string
    reportSection?: string
    checklistCode?: string
    settingKey?: string
  } | null
  /** Moduly mimo první rozsah — dok. 07 rozhodnutí uživatele. */
  inFirstScope: boolean
}

/* ------------------------------------------------------------------ */
/* Úřady — platform/authorities/{code}                                 */
/* ------------------------------------------------------------------ */

/**
 * ORP, krajské úřady, soudy, Úřad práce.
 *
 * Patří na platformní úroveň, protože jsou to tytéž úřady pro všechny
 * organizace a jsou stabilní. Kdyby si je každá organizace vedla sama,
 * rozešly by se — a přitom `authorityId` se objevuje na zprávách,
 * doručenkách a žádostech, kde na jednoznačnosti záleží (dok. 05, 13).
 */
export interface Authority {
  code: string                      // 'ORP-TEPLICE'
  kind: 'orp' | 'kraj_ku' | 'court' | 'labour_office' | 'ministry' | 'other'
  name: string
  /** Nadřízený kraj u ORP — pro směrování výkazů (dok. 13). */
  parentCode: string | null
  address: {
    street: string; city: string; zip: string; country: string
  } | null
  isds: string | null               // ID datové schránky
  email: string | null
  active: boolean
}

/* ------------------------------------------------------------------ */
/* Knihovna vět a vzory                                                */
/* ------------------------------------------------------------------ */

/**
 * Věta s tokeny a tvary, ne hotový text. „Pěstoun zajistil“ pro pěstounku
 * by v dokumentu, který jde na OSPOD, vypadal nedbale (dok. 07).
 */
export interface SentenceTemplate {
  id: Id
  scope: 'platform' | 'organization'
  organizationId: Id | null
  contextTags: string[]             // 'plan.area.health', 'visit.note'
  text: string                     // 'Pečující osoba {{v:zajistit_past}} …'
  slots: Array<{
    token: string
    agreesWith: 'caregiver' | 'caregivers' | 'child'
    forms: { m: string; f: string; pl: string }
  }>
  usageCount: number
  active: boolean
}

export interface DocumentTemplate {
  id: Id
  scope: 'platform' | 'organization'
  organizationId: Id | null
  kind: DocumentTemplateKind
  version: string
  effectiveFrom: IsoDate
  /** Struktura sekcí; obsah se plní ze záznamů, ne z modelu (dok. 14). */
  sections: Array<{ code: string; title: string; required: boolean }>
}

export type DocumentTemplateKind =
  | 'agreement' | 'report_6m' | 'report_on_request' | 'final_report'
  | 'plan_10c' | 'plan_10d' | 'authority_reply' | 'exit_summary'

/* ------------------------------------------------------------------ */
/* Ceník — platform/pricingRulesets/{id}                               */
/* ------------------------------------------------------------------ */

/**
 * Monetizace jako datovaná série, ne jako kód — model se bude měnit (dok. 19).
 * Účtovanou jednotkou je dohoda ve správě, plátcem organizace.
 */
export interface PricingRuleset {
  id: Id
  effectiveFrom: IsoDate
  currency: Currency
  unit: 'agreement'
  tiers: Array<{ fromCount: number; pricePerUnitMinor: number }>
  /** Spodní stupeň musí být rozumný i pro pověřenou fyzickou osobu (dok. 19). */
  minMonthlyMinor: number
  annualDiscountPct: number
  trialDays: number
  freePlanLimits: { maxAgreements: number; features: string[] }
  /** AI se platí kreditem zvlášť — cena za jednotku užití. */
  aiCredit: { unit: 'token' | 'page' | 'call'; pricePerUnitMinor: number }
}

/* ------------------------------------------------------------------ */
/* Příprava na jiné státy — platform/countries/{code}                  */
/* ------------------------------------------------------------------ */

export interface CountryProfile {
  code: string                     // 'CZ'
  label: string
  locale: string                   // 'cs-CZ'
  currency: Currency
  /** Jak se v té zemi jmenuje to, čemu u nás říkáme doprovázení. */
  terminology: Record<string, string>
  genderAgreementRequired: boolean // čeština ano, angličtina ne
  activeLegalRulesetId: Id | null
  createdAt: IsoDateTime
}

/** Persona asistenta. Výchozí jméno Eli, organizace si přejmenuje (dok. 17). */
export interface AssistantPersona {
  name: string                     // 'Eli'
  grammaticalGender: GrammaticalGender
  avatarRef: string | null
}
