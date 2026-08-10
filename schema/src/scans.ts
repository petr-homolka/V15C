/**
 * Přepis vyfoceného dokladu.
 *
 * Účtenka, faktura, certifikát, vysvědčení, recept, žádanka, výsledek
 * vyšetření — všechno, co do systému přijde jako fotka nebo sken, dostane
 * **editovatelný přepis**. Pracuje se s přepisem, originál zůstává.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ROZDÍL PROTI DIKTÁTU, KTERÝ URČUJE PRAVIDLA                         │
 * │                                                                     │
 * │ U diktátu se přepis zamyká po třech dnech, PROTOŽE ZVUK ZMIZEL      │
 * │ (media.ts) — po třech dnech by pracovnice opravovala podle ničeho.  │
 * │                                                                     │
 * │ Tady je to obráceně: **originál zůstává navždy**. Přepis se proto   │
 * │ smí opravovat kdykoli, protože se má vždycky proti čemu srovnat.    │
 * │                                                                     │
 * │ Pravidlo je tedy stejné v podstatě, jen vychází jinak: text se smí  │
 * │ měnit, dokud existuje, proti čemu ho ověřit.                        │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import type { AuditFields, Id, IsoDate, IsoDateTime, Money } from './common'
import type { RichText } from './richtext'

/* ------------------------------------------------------------------ */
/* Přepis — .../documents/{documentId}/transcript/{versionNo}          */
/* ------------------------------------------------------------------ */

/**
 * Podřízený dokumentu, jako index (dok. 17) — dědí tím spis i viditelnost
 * a nedá se jím obejít model oprávnění.
 *
 * Váže se na KONKRÉTNÍ verzi dokumentu: když se doklad přefotí, vzniká nový
 * přepis a starý zůstává u své verze. Jinak by odpověď z přepisu neodpovídala
 * tomu, co je na obrázku.
 */
export interface ScanTranscript extends AuditFields {
  documentId: Id
  documentVersionNo: number
  caseFileId: Id | null
  visibilityClass: 'metadata' | 'content'

  /**
   * Surový výstup OCR. **Neměnný** — je to doklad o tom, co stroj přečetl,
   * proti čemu se dá porovnat, co člověk opravil. Stejný princip jako
   * `proposedText` u konceptů (dok. 14).
   */
  ocrText: string
  ocrEngine: 'cloud_vision' | 'document_ai' | 'on_device' | 'manual'
  ocrConfidence: number | null
  language: string | null

  /** S čím se pracuje. Blokový obsah, aby šel otevřít v editoru (richtext.ts). */
  content: RichText
  /** Odvozený mirror pro hledání, vektory a citace (richtext.ts). */
  plainText: string

  /**
   * Kdo přepis vytvořil. Bez oprávnění k AI se OCR nespustí a přepis se
   * napíše ručně — `manual_entry` je zdarma, `ai.document_index` ne
   * (media.ts, dok. 21).
   */
  source: 'ocr' | 'manual' | 'ocr_then_edited'

  /** Strukturovaná pole podle druhu dokladu — sekce níže. */
  extracted: ExtractedFields | null

  lastEditedAt: IsoDateTime | null
  lastEditedByPersonId: Id | null
  editCount: number
  cost: Money | null
}

/** `.../transcript/{versionNo}/revisions/{n}` — append-only. */
export interface ScanTranscriptRevision {
  revisionNo: number
  editedByPersonId: Id
  editedAt: IsoDateTime
  textAfter: string
  /** Která pole se změnila — kvůli tomu, aby šlo najít opravy částek. */
  changedFields: string[]
}

/* ------------------------------------------------------------------ */
/* Strukturovaná pole                                                  */
/* ------------------------------------------------------------------ */

/**
 * Tohle je ta část, kvůli které se přepis vyplatí: z dokladu se vytáhnou
 * pole, která **předvyplní záznam**. Účtenka předvyplní výdaj, certifikát
 * předvyplní vzdělávací záznam včetně hodin.
 *
 * Každé pole nese `snippet` — úryvek, ze kterého se hodnota přečetla.
 * Potvrzení je pak pohled, ne opětovné čtení dokladu (stejně jako u lhůty
 * v podatelně, dok. 14).
 */
export interface ExtractedFields {
  docKind: ScanDocKind
  /** Nízká spolehlivost se přiznává, neblokuje (dok. 16). */
  confidence: 'high' | 'low'
  fields: ExtractedField[]
  /** Návrh, jaký záznam z toho udělat. Člověk potvrdí. */
  suggests: SuggestedRecord | null
}

export interface ExtractedField {
  key: string                      // 'amount', 'date', 'hours', 'issuer', …
  label: string
  value: string
  snippet: string | null
  confidence: number | null
  /** Opravené člověkem — pak se z toho učí zařazování dalších (dok. 17). */
  correctedByPersonId: Id | null
}

/** Číselník `scan.docKind` je rozšiřitelný (codebooks.ts); tohle jsou výchozí. */
export type ScanDocKind =
  | 'receipt'            // účtenka
  | 'invoice'            // faktura
  | 'certificate'        // certifikát ze vzdělávání
  | 'school_report'      // vysvědčení
  | 'school_note'        // známky, sdělení školy
  | 'prescription'       // recept
  | 'referral'           // žádanka
  | 'medical_report'     // výsledek vyšetření, zpráva lékaře
  | 'court_decision'
  | 'contract'
  | 'handwritten_note'
  | 'other'

/**
 * Co se z dokladu dá udělat. Systém to **navrhne a provede** s možností
 * *Vrátit zpět* (charta, dok. 16) — je to deterministické předvyplnění
 * z přečtených polí, ne rozhodnutí.
 */
export interface SuggestedRecord {
  kind: 'expense' | 'education_record' | 'care_episode' | 'attachment_only'
  payload: Record<string, unknown>
  /** Co chybí, aby to bylo úplné. Prázdné pole je platný stav (dok. 16). */
  missingFields: string[]
}

/**
 * Výchozí pole podle druhu dokladu. Seznam je v kódu, aby bylo vidět,
 * co se z čeho čte — a aby se dal doplnit v diffu, ne v databázi.
 */
export const EXPECTED_FIELDS: Record<ScanDocKind, readonly string[]> = {
  receipt: ['date', 'amount', 'currency', 'vendor', 'vat', 'items'],
  invoice: ['issueDate', 'dueDate', 'amount', 'currency', 'supplier', 'ico', 'variableSymbol'],
  certificate: ['title', 'hours', 'date', 'provider', 'participant', 'accreditation'],
  school_report: ['schoolYear', 'term', 'school', 'pupil', 'grades'],
  school_note: ['date', 'school', 'subject', 'text'],
  prescription: ['date', 'prescriber', 'medication'],
  referral: ['date', 'issuer', 'targetProvider', 'reason'],
  medical_report: ['date', 'provider', 'conclusion'],
  court_decision: ['fileRef', 'court', 'date', 'legalForceDate'],
  contract: ['parties', 'date', 'subject'],
  handwritten_note: ['date'],
  other: ['date'],
}

/* ------------------------------------------------------------------ */
/* Odkaz na originál z jiného dokumentu                                */
/* ------------------------------------------------------------------ */

/**
 * Když se ve zprávě nebo v plánu mluví o dokladu, musí být originál
 * dohledatelný. V aplikaci je to odkaz; **na papíře QR kód**.
 *
 * Platí přitom totéž, co u QR na dokumentu (dok. 21): **QR vede na ověření,
 * ne na obsah.** Účtenka je ještě relativně neškodná, ale vysvědčení dítěte
 * nebo lékařská zpráva jsou údaje podle čl. 9 GDPR a QR na papíře je vidí
 * každý, komu ten papír projde rukama.
 *
 * Ověřovací stránka ukáže, že doklad existuje, jakého je druhu a kdy vznikl.
 * Samotný obrázek uvidí jen ten, kdo je přihlášený a má na spis právo.
 */
export interface SourceReference {
  /** Kde se o dokladu mluví. */
  inDocumentId: Id
  /** O který doklad jde. */
  sourceDocumentId: Id
  sourceVersionNo: number
  /** Token ověřovací stránky — z něj se vykreslí QR (branding.ts). */
  verificationToken: string
  /** Jak se to v textu zobrazí: „účtenka č. 3 ze 14. 6. 2026“. */
  label: string
  /** Vytiskne se QR, nebo jen text s odkazem? */
  renderQr: boolean
}

/**
 * Pravidlo pro sazbu: **v dokumentu, který odchází úřadu, se příloha
 * přikládá, ne odkazuje.** QR je pomůcka pro toho, kdo dokument čte
 * v organizaci nebo ho má ve spisu; úřad má dostat kopii, ne odkaz,
 * který mu bez přihlášení nic neukáže.
 */
export const QR_IS_NOT_A_SUBSTITUTE_FOR_ATTACHMENT = true
