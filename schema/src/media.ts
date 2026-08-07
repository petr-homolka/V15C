/**
 * Diktování, přepis, souhrn a pravidla pro nahrávané soubory.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ PROČ JE OKNO NA ÚPRAVU PŘEPISU PRÁVĚ TŘI DNY                        │
 * │                                                                     │
 * │ Zvuk se neukládá (ukládání je Premium). Tím se ale ztrácí možnost   │
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
  /** Ukládání zvuku je Premium — viz `PlanFeatures`. */
  storedUnderPlan: 'premium' | null
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
    /** Nahrávání diktátu jde vždy; ukládání zvuku je Premium. */
    captureAllowed: boolean
    storeAllowed: 'never' | 'premium_only' | 'always'
    maxBytes: number
    defaultRetentionDays: number
  }

  video: {
    /** Výchozí stav. */
    mode: 'forbidden' | 'premium_only'
    maxBytes: number
    maxDurationSeconds: number
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
/* Co je v jakém tarifu                                                */
/* ------------------------------------------------------------------ */

/**
 * Základní varianta je **příznaky, ne druhá aplikace** (dok. 19 sekce 6).
 * Seznam je tady, aby byl na jednom místě a dal se testovat.
 */
export const PLAN_FEATURES = {
  free: [
    'case_file', 'calendar', 'documents', 'tasks', 'obligations',
    'reports_statutory', 'editor', 'dictation_transcript',
  ],
  paid: [
    'assistant', 'document_index', 'reports_accounting', 'checklists',
    'standards', 'exports', 'codebook_custom_items',
  ],
  premium: [
    'dictation_audio_storage', 'video_upload', 'extra_storage_blocks',
  ],
} as const

export type PlanFeature =
  | (typeof PLAN_FEATURES.free)[number]
  | (typeof PLAN_FEATURES.paid)[number]
  | (typeof PLAN_FEATURES.premium)[number]

/**
 * Diktát a přepis jsou v bezplatné variantě záměrně. Je to ta nejužitečnější
 * věc pro terén (dok. 02: „minimum psaní — diktát je hlavní vstup“) a schovat
 * ji za tarif by znamenalo, že systém v terénu nepomůže tomu, kdo neplatí.
 * Premium je až **uchování zvuku**, což je náklad a riziko, ne užitek.
 */
