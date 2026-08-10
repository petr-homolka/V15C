/**
 * Diktování, přepis, souhrn a pravidla pro nahrávané soubory.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ PROČ JE OKNO NA ÚPRAVU PŘEPISU PRÁVĚ TŘI DNY                        │
 * │                                                                     │
 * │ Zvuk se neukládá. Tím se ale ztrácí možnost                         │
 * │ přepis později zkontrolovat proti tomu, co bylo řečeno — a přepis   │
 * │ je primární záznam o tom, co pracovnice v rodině viděla.            │
 * │                                                                     │
 * │ Okno tedy neexistuje kvůli přísnosti. Existuje PROTO, ŽE ZVUK       │
 * │ ZMIZEL: dokud si pracovnice návštěvu pamatuje, může přepis opravit; │
 * │ potom už by opravovala podle ničeho.                                │
 * │                                                                     │
 * │ Po uplynutí okna se nic nezakazuje — oprava je NOVÝ ZÁZNAM, jako    │
 * │ všude jinde (dok. 10). Souhrn zůstává editovatelný trvale, protože  │
 * │ to není záznam o řečeném, ale pracovní výstup.                      │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import type { AuditFields, Id, IsoDate, IsoDateTime, Money } from './common'
import type { RichText } from './richtext'

/* ------------------------------------------------------------------ */
/* Diktát                                                             */
/* ------------------------------------------------------------------ */

/**
 * `orgs/{orgId}/caseFiles/{cid}/dictations/{id}`
 *
 * Diktát je vstup, ne záznam. Výsledkem je obsahový záznam ve spisu
 * (`resultEntryId`) — dokud ho člověk nepotvrdí, je to jen diktát.
 * AI navrhuje, člověk potvrzuje (dok. 02 sekce 6).
 */
export interface Dictation extends AuditFields {
  id: Id
  caseFileId: Id
  recordedByPersonId: Id

  startedAt: IsoDateTime
  durationSeconds: number
  /** Nahráno offline a synchronizováno později (dok. 02). */
  capturedOffline: boolean

  audio: DictationAudio
  transcript: DictationTranscript
  summary: DictationSummary | null

  /** Co z diktátu vzniklo, až to člověk potvrdil. */
  resultEntryId: Id | null
  status: 'recording' | 'transcribing' | 'ready' | 'filed' | 'failed'
  failureReason: string | null
}

/**
 * Zvuk se **standardně neukládá**. Je to zároveň to soukromější řešení —
 * diktát o dítěti v pěstounské péči je údaj podle čl. 9 GDPR a neuchovávat
 * ho je méně rizikové než ho uchovávat (dok. 02).
 */
export interface DictationAudio {
  retention: 'not_stored' | 'stored'
  /** Vyplněné jen u `stored`. */
  storagePath: string | null
  byteSize: number | null
  mimeType: string | null
  /** Podle kterého oprávnění se zvuk uchoval — viz `PlanMatrix`. */
  storedUnderEntitlement: string | null
  /** Do kdy se drží; potom ho smaže úklidová funkce, přepis zůstává. */
  retainUntil: IsoDate | null
  deletedOn: IsoDate | null
}

export interface DictationTranscript {
  text: string
  /** Kde se přepis udělal. On-device je preferované — zvuk pak nikam nejde. */
  engine: 'on_device' | 'cloud_eu'
  language: string
  /** Průměrná spolehlivost; u nízké se to v UI přiznává (jako u OCR, dok. 17). */
  confidence: number | null

  /**
   * Okno pro úpravu. Počítá se od DOKONČENÍ PŘEPISU, ne od nahrání —
   * u diktátu zachyceného offline se přepis udělá až po připojení a
   * pracovnice by jinak o část okna přišla, aniž by o tom věděla.
   */
  transcribedAt: IsoDateTime | null
  editableUntil: IsoDateTime | null
  /**
   * Strojový zrcadlový údaj v milisekundách. Existuje z jediného důvodu:
   * bezpečnostní pravidla umí srovnat `request.time.toMillis()` s číslem,
   * ale s ISO stringem ne — a okno má vynucovat databáze, ne klient.
   * Jinak by ho šlo obejít úpravou požadavku.
   */
  editableUntilMs: number | null
  /** Délka okna je parametr organizace, výchozí 3 dny. */
  editWindowDays: number

  lastEditedAt: IsoDateTime | null
  lastEditedByPersonId: Id | null
  editCount: number
}

/** Souhrn od Eli. Editovatelný trvale — je to pracovní výstup, ne záznam. */
export interface DictationSummary {
  content: RichText
  /** První návrh, neměnný — stejný princip jako `proposedText` (dok. 14). */
  proposedPlainText: string
  modelId: string
  promptVersion: string
  generatedAt: IsoDateTime
  /** Pseudonymizováno vždy (dok. 02 sekce 6). */
  pseudonymized: true
  cost: Money | null
  lastEditedAt: IsoDateTime | null
  lastEditedByPersonId: Id | null
}

/**
 * `.../dictations/{id}/revisions/{n}` — append-only.
 * Drží se úpravy přepisu i souhrnu, protože obojí je součást spisu a
 * u kontroly se ptá „kdo to změnil a kdy“.
 */
export interface DictationRevision {
  revisionNo: number
  target: 'transcript' | 'summary'
  editedByPersonId: Id
  editedAt: IsoDateTime
  textAfter: string
  /** Úprava po zavření okna se zapisuje jako nový záznam, ne sem. */
  afterWindowClosed: boolean
}

/* ------------------------------------------------------------------ */
/* Pravidla pro nahrávané soubory                                      */
/* ------------------------------------------------------------------ */

/**
 * `platform/registry/uploadPolicies/{id}` + přepis na úrovni organizace.
 *
 * Video je **zakázané**, v Premium povolené s limitem. Důvod není jen cena:
 * video z rodiny je nejcitlivější možný obsah, indexovat se nedá a v archivu
 * by leželo desítky let (dok. 10). Zákaz je proto výchozí stav, ne šetření.
 */
export interface UploadPolicy {
  id: Id
  effectiveFrom: IsoDate

  images: {
    allowedMimeTypes: string[]
    maxBytes: number
    /**
     * Normalizace při nahrání je to, co dělá provoz levným — sken z mobilu
     * má 1–3 MB, po převodu ~150 KB (dok. 19 sekce 6.1). Pětinásobná až
     * dvacetinásobná úspora a rychlejší OCR.
     */
    normalize: {
      enabled: boolean
      maxLongEdgePx: number
      jpegQuality: number
      targetKbPerPage: number
      convertToPdfA: boolean
    }
  }

  documents: { allowedMimeTypes: string[]; maxBytes: number }

  audio: {
    /**
     * Nahrávání diktátu vyžaduje oprávnění k AI (`ai.dictation`), protože
     * bez přepisu je zvuk k ničemu — viz `PlanMatrix`.
     */
    captureRequiresEntitlement: PlanEntitlement
    /** Uchování zvuku je samostatná věc; o zařazení do tarifu rozhoduje vlastník. */
    storeRequiresEntitlement: PlanEntitlement | null
    maxBytes: number
    defaultRetentionDays: number
  }

  /**
   * Video je zakázané **natrvalo**. Není to tarifní páka a nedá se zapnout
   * ani v placené variantě — proto tady není režim, ale konstanta.
   *
   * Důvod není cena: video z rodiny je nejcitlivější možný obsah, nedá se
   * indexovat, nedá se pseudonymizovat a v archivu by leželo desítky let
   * (dok. 10). Rozhodnutí zadavatele: nikdy.
   */
  video: {
    allowed: false
    /** Co se uživateli řekne, když to zkusí. Fakticky, bez poučování (dok. 16). */
    refusalMessage: string
  }

  /** Do kvóty se počítají jen aktivní spisy; archiv je zdarma (dok. 19). */
  quota: {
    includedActiveBytes: number
    extraBlockBytes: number
    extraBlockPrice: Money
    archiveCountsToQuota: false
  }
}

/** Počítadlo objemu. Firestore ani Storage objem za organizaci nedají samy. */
export interface StorageQuota {
  organizationId: Id
  activeBytes: number
  archivedBytes: number
  audioBytes: number
  includedBytes: number
  extraBlocksPurchased: number
  measuredAt: IsoDateTime
}

/* ------------------------------------------------------------------ */
/* Fotografování — hlavní vstup dokladů z terénu                        */
/* ------------------------------------------------------------------ */

/**
 * `orgs/{orgId}/caseFiles/{cid}/documents/{id}` s `origin: 'photo_capture'`.
 *
 * Nejde o krásné fotky. Jde o **čitelný doklad**: pokoj, vysvědčení, účtenka,
 * smlouva, certifikát, ručně psaná poznámka. Z toho plyne všechno ostatní —
 * cílem je čitelnost textu při co nejmenším souboru, ne barevná věrnost.
 *
 * Vstup z galerie (fotka nebo snímek obrazovky z mobilu) jde stejnou cestou.
 * Jediný rozdíl je, odkud snímek přišel.
 */
export interface PhotoCapture {
  documentId: Id
  source: 'camera' | 'gallery' | 'screenshot' | 'scanner_app'
  /** Číselník `photo.purpose` — rozšiřitelný (codebooks.ts). */
  purposeCode: string

  /** K čemu se to připíná. Fotka bez vazby je k nenalezení. */
  subject: {
    kind: 'person' | 'child' | 'case_file' | 'entry' | 'expense' | 'education' | 'agreement'
    id: Id
  }

  /** Více snímků = jeden dokument. Účtenka i smlouva mají obvykle víc stran. */
  pages: PhotoPage[]
  /** Sloučeno do jednoho PDF; jednotlivé JPEG se po sloučení nedrží. */
  mergedIntoPdf: boolean

  capturedAt: IsoDateTime
  /** V terénu bez signálu jde do fronty a nahraje se později (dok. 02). */
  capturedOffline: boolean
  uploadedAt: IsoDateTime | null
}

export interface PhotoPage {
  pageNo: number
  /** Rozměr a velikost PO zmenšení na zařízení. Originál se nikam neposílá. */
  widthPx: number
  heightPx: number
  byteSize: number
  /** Automatické narovnání a výřez okrajů dokumentu, když to jde. */
  deskewed: boolean
  /** Odhad čitelnosti; při nízkém se nabídne přefotit (dok. 16 — nabídka, ne blok). */
  legibilityScore: number | null
}

/**
 * Zpracování na zařízení. Zmenšuje se **před nahráním**, ne po něm:
 *
 *   – pracovnice v terénu má často slabý signál a datový limit;
 *   – originál z mobilu má 3–8 MB, po zmenšení ~150–250 KB;
 *   – co se nenahraje, to se nemusí platit ani mazat.
 */
export interface PhotoProcessing {
  /** Delší strana v pixelech. 2200 px = čitelné A4 s drobným písmem. */
  maxLongEdgePx: number
  jpegQuality: number
  /** Odstranit barvu u textových dokladů — menší soubor, stejná čitelnost. */
  grayscaleForDocuments: boolean
  autoDeskew: boolean
  autoCropEdges: boolean
  mergePagesToPdf: boolean

  /**
   * EXIF se odstraňuje VŽDY a bez možnosti vypnout.
   *
   * Fotka pokoje v pěstounské rodině nese v EXIF GPS souřadnice — tedy
   * **adresu domácnosti dítěte v náhradní péči**. Ta se nezobrazuje ani
   * v aplikaci příbuzných (dok. 09), takže ji nesmí prozradit metadata
   * fotky, kterou si někdo stáhne ze spisu.
   */
  stripExif: true
}

export const DEFAULT_PHOTO_PROCESSING: PhotoProcessing = {
  maxLongEdgePx: 2200,
  jpegQuality: 72,
  grayscaleForDocuments: true,
  autoDeskew: true,
  autoCropEdges: true,
  mergePagesToPdf: true,
  stripExif: true,
}

/* ------------------------------------------------------------------ */
/* Tarify — rozhoduje vlastník produktu, ne kód                        */
/* ------------------------------------------------------------------ */

/**
 * Oprávnění, na která se v aplikaci ptáme. Jsou to **jména schopností**,
 * ne tarify — do kterého tarifu která schopnost patří, se rozhoduje jinde
 * a mění se bez nasazení kódu.
 */
export type PlanEntitlement =
  | 'case_file' | 'calendar' | 'documents' | 'tasks' | 'obligations'
  | 'editor' | 'manual_entry' | 'photo_capture'
  | 'reports_statutory' | 'reports_accounting'
  | 'checklists' | 'standards' | 'exports' | 'branding'
  | 'codebook_custom_items'
  | 'ai.assistant' | 'ai.dictation' | 'ai.summary' | 'ai.document_index'
  | 'audio_retention' | 'extra_storage'

/**
 * `platform/registry/planMatrix/{id}` — co je v jakém tarifu.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ TOHLE JE DATOVÝ ZÁZNAM, NE KONSTANTA V KÓDU.                        │
 * │                                                                     │
 * │ O zařazení schopnosti do tarifu rozhoduje výhradně vlastník         │
 * │ produktu. Kód se smí ptát „má tahle organizace `ai.dictation`?“,    │
 * │ ale nesmí obsahovat názor na to, jestli má být zdarma.              │
 * │                                                                     │
 * │ Matrice je datovaná stejně jako ceník a právní sady (dok. 02, 19),  │
 * │ takže změna tarifu je nový záznam s platností „od“.                 │
 * └─────────────────────────────────────────────────────────────────────┘
 */
export interface PlanMatrix {
  id: Id
  effectiveFrom: IsoDate
  note: string | null
  /** Které schopnosti má daný tarif. */
  plans: Array<{
    plan: string                   // 'free' | 'paid' | … — pojmenuje vlastník
    label: string
    entitlements: PlanEntitlement[]
  }>
  /** Schopnosti, které nejsou v žádném tarifu, ale kupují se zvlášť. */
  addOns: Array<{ entitlement: PlanEntitlement; label: string }>
}

/**
 * Přístup k AI. Zkušební období, potom kredit nebo paušál s limitem —
 * zdarma AI není nikdy.
 */
export interface AiEntitlement {
  organizationId: Id
  /** Zkušební období od zavedení organizace. */
  trialFrom: IsoDate
  trialUntil: IsoDate
  trialMonths: number

  mode: 'trial' | 'credit' | 'flat' | 'none'
  /** U `flat`: měsíční limit užití. Po vyčerpání se AI zastaví, nic jiného. */
  flatMonthlyLimit: { unit: 'token' | 'call'; amount: number } | null
  usedThisPeriod: number
  periodResetsOn: IsoDate | null

  /**
   * Když AI není dostupná, systém zůstává plně použitelný ručně:
   * editor, knihovna vět (deterministická a offline, dok. 07) a fotografování
   * dokladů. Diktát ani souhrn ne — ty jsou AI.
   */
  fallbackNote: string
}
