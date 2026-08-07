/**
 * Sdílené typy. Bez závislostí — importuje to klient i Cloud Functions.
 *
 * Konvence viz schema/README.md sekce 3.
 */

/** 'YYYY-MM-DD'. Lhůty se počítají v kalendářních dnech, ne v milisekundách. */
export type IsoDate = string

/** ISO 8601 s offsetem, např. '2026-08-07T14:30:00+02:00'. */
export type IsoDateTime = string

/** '--MM-DD' — opakující se datum v roce (§ termíny jako 31. 3.). */
export type YearlyDate = string

export type Id = string

export type Currency = 'CZK' | 'EUR'

/** Peníze vždy v nejmenší jednotce. 6 300 Kč = 630000. */
export interface Money {
  amountMinor: number
  currency: Currency
}

/** Jak záznam vznikl. Bez tohohle nejde říct, co udělala Eli (dok. 15). */
export type Via = 'ui' | 'assistant' | 'import' | 'outbox' | 'system'

/**
 * Nese každý zapisovaný dokument.
 * createdByPersonId je VŽDY člověk — i když návrh psala Eli (dok. 14).
 */
export interface AuditFields {
  createdByPersonId: Id
  createdAt: IsoDateTime
  via: Via
  /** Poslední úprava. Historie úprav je vždy v podřízené kolekci, ne tady. */
  updatedByPersonId: Id | null
  updatedAt: IsoDateTime | null
}

/**
 * Třída viditelnosti. Rozhoduje, jestli záznam patří do metadat nebo do obsahu
 * (dok. 04). Ve Firestore se to projevuje umístěním, ne polem — pole je tu jen
 * proto, aby index dokumentu mohl viditelnost zdědit (dok. 17).
 */
export type VisibilityClass = 'metadata' | 'content'

/** Gramatický rod pro skloňování v generovaných textech (dok. 07). */
export type GrammaticalGender = 'm' | 'f'

/** Role v organizaci. Podrobně v dok. 03 a 04. */
export type OrgRole =
  | 'org_admin'      // správa organizace, nastavení, předplatné
  | 'manager'        // vedoucí — schvaluje vydání údajů ven, kontroluje
  | 'supervisor'     // supervizor — vidí vše (rozhodnuto v dok. 07)
  | 'key_worker'     // Klíčová osoba
  | 'social_worker'  // odborný pracovník bez přidělených rodin
  | 'accountant'     // jen reporty a výdaje, bez obsahu spisů
  | 'observer'       // jen metadata (např. zřizovatel)

/** Role mimo organizaci — vlastní aplikace, vlastní pravidla (dok. 08, 09). */
export type ExternalRole = 'caregiver' | 'child' | 'relative' | 'authority'

/**
 * Odkaz na jiný záznam. Používá se v časové ose, v úkolech a v paměti Eli,
 * aby se nemusela pro každý druh vazby vyrábět vlastní pole.
 */
export interface Ref {
  kind: RefKind
  id: Id
  /** Denormalizovaný popis pro seznamy — aby seznam byl jeden dotaz. */
  label: string | null
}

export type RefKind =
  | 'organization' | 'person' | 'child' | 'agreement' | 'placement'
  | 'case_file' | 'entry' | 'document' | 'draft' | 'report' | 'task'
  | 'thread' | 'message' | 'obligation' | 'mandate_obligation'
  | 'authority_request' | 'submission' | 'signature' | 'transfer'
  | 'education_period' | 'inquiry' | 'registry_return' | 'life_book_entry'

/**
 * Stav, který se nemaže. Použití: zařízení, členství, paměť Eli, aliasy.
 * Zrušení je změna stavu plus důvod, nikdy delete (dok. 10).
 */
export interface Revocable {
  status: 'active' | 'revoked'
  revokedAt: IsoDateTime | null
  revokedByPersonId: Id | null
  revokeReason: string | null
}

/** Vazba na verzovanou sadu pravidel, podle které se něco počítalo (dok. 02). */
export interface ComputedFrom {
  legalRulesetId: Id
  legalRegime: string        // např. 'CZ-2026-01'
  orgPolicyIds: Id[]
  computedAt: IsoDateTime
}

/** Doručení dokumentu adresátovi. Sledované zvlášť za adresáta (dok. 05). */
export interface Delivery {
  recipientKind:
    | 'caregiver' | 'orp_caregiver' | 'orp_child_residence'
    | 'court' | 'police' | 'kraj_ku' | 'labour_office' | 'other'
  authorityId: Id | null
  deliveredOn: IsoDate | null
  channel: 'isds' | 'email' | 'post' | 'in_person' | null
  proofDocumentId: Id | null   // doručenka
}

/** Stav životního cyklu spisu. Archiv je stav, ne jiné úložiště (dok. 18). */
export type Lifecycle = 'active' | 'archived'
