/**
 * Eli — dotazy, akce, paměť, účtování.
 *
 * Dvě věty, ze kterých všechno ostatní plyne:
 *   „Eli nikdy nevytvoří záznam. Vytvoří jen koncept nebo návrh akce,
 *    který má autora-člověka od okamžiku potvrzení.“        (dok. 14)
 *   „Eli se učí daty, ne modelem.“                          (dok. 17)
 */

import type { AuditFields, Id, IsoDate, IsoDateTime, Money } from './common'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/assistant/{sessionId}                                  */
/* ------------------------------------------------------------------ */

export interface AssistantSession extends AuditFields {
  id: Id
  personId: Id
  startedAt: IsoDateTime
  lastTurnAt: IsoDateTime | null
  turnCount: number
  /**
   * Rozsah relace se deklaruje předem: „Odpovídám z celé organizace.“
   * Eli neprozrazuje ani existenci nedostupného záznamu — i to je informace
   * o rodině (dok. 14).
   */
  declaredScope: string
}

/** .../assistant/{sessionId}/turns/{turnId} */
export interface AssistantQuery {
  id: Id
  sessionId: Id
  askedByPersonId: Id
  askedAt: IsoDateTime
  question: string

  /**
   * Rozsah je CELÁ ORGANIZACE (rozhodnuto uživatelem, dok. 14 sekce 9).
   * Filtruje se VYHLEDÁVÁNÍ, ne odpověď — post-filtrace je nefunkční obrana,
   * model už ta data viděl a prosákne to formulací.
   */
  scope: {
    organizationWide: true
    visibilityClasses: Array<'metadata' | 'content'>
    includeArchived: boolean
  }

  retrieved: Array<{ refType: string; refId: Id; caseFileId: Id | null }>
  /**
   * CROSS_CASE_ACCESS se loguje podle SKUTEČNĚ POUŽITÝCH spisů, ne podle
   * rozsahu — jinak by příznak nesl každý dotaz a log by ztratil smysl
   * (dok. 14 sekce 9).
   */
  crossCaseCaseFileIds: Id[]

  answerText: string
  citedRefIds: Id[]
  /** Odpověď z archivu se označuje (dok. 18). */
  usedArchived: boolean
  producedDraftId: Id | null
  producedActionIds: Id[]

  modelId: string
  promptVersion: string
  creditCost: Money | null
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/assistantActions/{id}                                  */
/* ------------------------------------------------------------------ */

/**
 * Návrh akce. Stupně podle NÁSLEDKU, ne podle složitosti (dok. 15 sekce 3),
 * upravené chartou (dok. 16): stupně 1 a 2 se NEPTAJÍ PŘEDEM — akce proběhne
 * a vedle ní je *Vrátit zpět*. Karta je výsledek, ne otázka.
 *
 * Stupeň 3 se z chatu neprovede nikdy: podpis, odeslání ven, vydání údajů
 * úřadu, zánik dohody, oprávnění, parametry, skartace, kniha života.
 * Není to nedůvěra v pracovníka — je to ochrana před cizím jménem.
 */
export interface AssistantAction extends AuditFields {
  id: Id
  sessionId: Id
  turnId: Id
  proposedForPersonId: Id

  intent: string                    // 'calendar.create', 'contact.record', …
  tier: 0 | 1 | 2 | 3
  payload: Record<string, unknown>

  /**
   * Rozpoznané entity a JAK jistě. Eli se nikdy nehádá: dvě rodiny Novákových
   * → zeptá se. Zápis do špatného spisu je ztráta záznamu i incident a nikdo
   * ho nehledá tam, kde omylem je (dok. 15 sekce 5a).
   */
  resolvedRefs: Array<{
    slot: 'family' | 'child' | 'person' | 'date' | 'time' | 'amount' | 'place'
    refType: string | null
    refId: Id | null
    rawText: string
    resolution: 'explicit' | 'inferred' | 'defaulted' | 'ambiguous'
    /** Naučená hodnota se v kartě PŘIZNÁVÁ: „1,5 h — podle tvých zápisů“. */
    memoryId: Id | null
  }>

  status: 'proposed' | 'executed' | 'undone' | 'rejected' | 'expired'
  executedAt: IsoDateTime | null
  /** Rozdíl proti `payload` je doklad o kontrole — jako proposedText u konceptů. */
  payloadAtExecute: Record<string, unknown> | null
  undoneAt: IsoDateTime | null
  undoneByPersonId: Id | null

  resultRefType: string | null
  resultRefId: Id | null
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/memory/{memoryId}                                      */
/* ------------------------------------------------------------------ */

/**
 * Naučené věci nesmějí být skrytý stav — jsou to záznamy, které jde přečíst,
 * změnit a zrušit. V UI obrazovka „Co si Eli pamatuje“ (dok. 17).
 *
 * Z ÚPRAV se učí hodně, z PŘIJETÍ málo: kdo odklepává bez čtení, dává slabý
 * signál. Učit se hlavně z přijetí by znamenalo naučit se odklepnutou chybu.
 */
export interface AssistantMemory extends AuditFields {
  id: Id
  scope: 'person' | 'organization'
  ownerId: Id                       // personId nebo organizationId

  kind: 'alias' | 'default_value' | 'preference' | 'fact' | 'phrase'
  key: string                       // 'family.alias.Nováci', 'visit.duration'
  value: unknown
  /** Lidsky čitelný popis do obrazovky „Co si Eli pamatuje“. */
  humanLabel: string

  /** 'stated' = někdo řekl „Eli, pamatuj si…“; 'learned' = odvozeno. */
  origin: 'learned' | 'stated'
  evidenceCount: number
  firstSeenAt: IsoDateTime
  lastUsedAt: IsoDateTime | null

  /** Vypnutí je storno, ne mazání (dok. 10). */
  active: boolean
  forgottenByPersonId: Id | null
  forgottenAt: IsoDateTime | null
}

/**
 * Hranice učení (dok. 17 sekce 3.4) — vynucuje se strukturou:
 *   – paměť žije POD organizací, takže se nemůže přelít mezi nájemce;
 *   – `scope: 'person'` se do organizační povyšuje jen vědomým úkonem;
 *   – `kind: 'fact'` je vyhrazený pro provozní věci („u Svobodových se parkuje
 *     za domem“), NIKDY pro nic o dítěti nebo jeho zdraví — fakta o rodinách
 *     patří do spisu, ne do paměti asistenta.
 */

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/aiUsage/{id}                                           */
/* ------------------------------------------------------------------ */

/**
 * Záznam každého volání. Existuje kvůli auditu (dok. 02) a účtování se z něj
 * odečítá — takže účtování nepotřebuje druhé měření (dok. 19).
 *
 * Když kredit dojde, Eli přestane navrhovat. Nic jiného se nezastaví:
 * systém musí být plně použitelný bez AI.
 */
export interface AiUsageLog {
  id: Id
  at: IsoDateTime
  personId: Id
  purpose:
    | 'assistant_query' | 'draft' | 'dictation' | 'ocr'
    | 'document_index' | 'classification' | 'embedding'
  modelId: string
  region: string                    // musí být evropský (dok. 19)
  tokensIn: number
  tokensOut: number
  pages: number | null
  cost: Money
  /** Pseudonymizováno vždy — dvoustupňové schéma z dok. 02 sekce 6. */
  pseudonymized: true
  refType: string | null
  refId: Id | null
}

/* ------------------------------------------------------------------ */
/* Stupně akcí — tabulka k vynucení v pravidlech a v Cloud Functions   */
/* ------------------------------------------------------------------ */

/**
 * Stupeň 3 je platformní a organizace ho nemůže uvolnit (dok. 15).
 * Seznam je tady, aby existoval na jednom místě a dal se testovat.
 */
export const TIER3_INTENTS = [
  'signature.perform',
  'report.deliver',
  'authority.release',
  'agreement.terminate',
  'agreement.notice',
  'carer.release',
  'transfer.issue',
  'permissions.change',
  'settings.change',
  'ruleset.change',
  'disposal.perform',
  'life_book.write',
] as const

export type Tier3Intent = (typeof TIER3_INTENTS)[number]

/** Stupeň 2 — provede se, ale karta rozepisuje pole s následkem (dok. 16). */
export const TIER2_INTENTS = [
  'contact.record',
  'expense.record',
  'education.record',
  'respite.record',
  'placement.start',
  'placement.end',
  'entry.write',
] as const

export type ObligationTouchingIntent = (typeof TIER2_INTENTS)[number]

/** Poslední den, ke kterému byla paměť pročištěna — provozní hygiena. */
export interface AssistantMaintenance {
  organizationId: Id
  lastMemorySweepOn: IsoDate | null
  lastReindexOn: IsoDate | null
  pendingIndexCount: number
}
