/**
 * Dokumenty, verze, index pro Eli, koncepty a logy.
 *
 * Dokument se nikdy nepřepisuje — nová verze je nový prvek `versions`
 * (dok. 12). Index patří ke KONKRÉTNÍ verzi, jinak by odpověď opřená
 * o starou smlouvu byla nepravdivá, aniž by to bylo poznat (dok. 17).
 */

import type { AuditFields, Id, IsoDate, IsoDateTime, Via } from './common'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/caseFiles/{cid}/documents/{documentId}                 */
/* ------------------------------------------------------------------ */

export interface Document extends AuditFields {
  id: Id
  caseFileId: Id | null             // null = dokument organizace (např. směrnice)
  category: DocumentCategory
  title: string

  origin: 'generated' | 'uploaded' | 'chat_attachment' | 'checklist_photo' | 'imported'
  sourceRefId: Id | null

  versions: DocumentVersion[]
  currentVersionNo: number

  signatureCeremonyId: Id | null
  /** Pro skartační řízení; konkrétní lhůty čekají na skartační plán (dok. 10). */
  retentionBasis: string | null

  /** Kniha života a soukromé dokumenty dítěte se neindexují (dok. 17). */
  indexable: boolean
  indexStatus: 'queued' | 'indexed' | 'failed' | 'skipped'
  /** Vyřazeno skartačním řízením — ruší dokument I index jedním úkonem. */
  disposedOn: IsoDate | null
  disposalRecordId: Id | null
}

export interface DocumentVersion {
  versionNo: number
  storagePath: string
  mimeType: string
  byteSize: number
  /** Vazba na podpis — podepisuje se obsah, ne zařízení (dok. 08). */
  contentHash: string
  createdByPersonId: Id
  createdAt: IsoDateTime
  /** Stopa přežívá do všech dalších verzí (dok. 14). */
  fromDraftId: Id | null
  supersededByVersionNo: number | null
}

export type DocumentCategory =
  | 'agreement' | 'agreement_consent' | 'orp_statement' | 'court_decision'
  | 'plan_10c' | 'plan_10d'
  | 'report_6m' | 'report_on_request' | 'final_report' | 'ospod_report'
  | 'authority_release' | 'incoming_authority_letter'
  | 'registry_return' | 'inspection_protocol' | 'corrective_measure'
  | 'certificate' | 'receipt' | 'care_log' | 'delivery_receipt'
  | 'declaration' | 'policy' | 'insurance' | 'life_book'
  | 'exit_summary' | 'other'

/* ------------------------------------------------------------------ */
/* .../documents/{documentId}/index/{versionNo}                        */
/* ------------------------------------------------------------------ */

/**
 * Přečtený dokument. Index je PODŘÍZENÝ dokumentu, ne samostatná sbírka —
 * jinak by se jím obešel celý model oprávnění (dok. 17 sekce 2.3).
 */
export interface DocumentIndex {
  documentId: Id
  versionNo: number
  caseFileId: Id | null             // dědí se
  visibilityClass: 'metadata' | 'content'   // dědí se

  status: 'queued' | 'extracted' | 'indexed' | 'failed' | 'skipped'
  method: 'pdf_text_layer' | 'ocr' | 'none'
  language: string | null
  pageCount: number

  detected: {
    docTypeGuess: string | null
    authority: string | null
    fileRef: string | null          // sp. zn. / č. j.
    dates: Array<{ value: IsoDate; role: string | null; snippet: string }>
    amounts: Array<{ amountMinor: number; currency: string; snippet: string }>
    legalRefs: string[]
    /** Jen pro přiřazení ke spisu; párování se dělá lokálně (dok. 02). */
    personNameHits: string[]
  }

  /** Tokeny pro přesné hledání — Firestore neumí fulltext (dok. 19). */
  keywords: string[]

  indexedAt: IsoDateTime
  indexVersion: string              // aby šlo přeindexovat po zlepšení postupu
  failureReason: string | null
}

/** .../index/{versionNo}/chunks/{n} — vektory pro `findNearest`. */
export interface DocumentChunk {
  chunkNo: number
  pageFrom: number
  pageTo: number
  text: string
  /** OCR se v odpovědi přiznává — u nízké spolehlivosti jednou větou (dok. 17). */
  ocrConfidence: number | null
  embedding: number[]
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/caseFiles/{cid}/drafts/{draftId}                       */
/* ------------------------------------------------------------------ */

/**
 * Koncept. Autorem uloženého dokumentu je VŽDY člověk; Eli je v `generation`
 * (dok. 14). `proposedText` se drží stejně dlouho jako dokument — rozdíl mezi
 * návrhem a uloženým textem je odpověď na otázku „kolik z toho napsal člověk“.
 *
 * Koncept NIKDY neplní lhůtu (dok. 14 sekce 0).
 */
export interface DocumentDraft extends AuditFields {
  id: Id
  caseFileId: Id | null
  purpose: DraftPurpose
  status: 'proposed' | 'in_edit' | 'saved' | 'discarded'
  savedAsDocumentId: Id | null
  /** I zahození je informace — jiná situace než nenechat si navrhnout nic. */
  discardReason: string | null

  proposedText: string              // PRVNÍ návrh, neměnný
  currentText: string
  /** '[DOPLNIT: počet osobních styků]' — mezera místo věrohodné věty (dok. 14). */
  gapMarkers: string[]

  generation: {
    modelId: string
    promptVersion: string
    generatedAt: IsoDateTime
    requestedByPersonId: Id
    /** Z čeho to vzniklo — každá faktická věta nese odkaz na záznam. */
    retrieval: Array<{ refType: string; refId: Id }>
    pseudonymized: true             // vždy — dok. 02 sekce 6
    creditCostMinor: number
  } | null                          // null = člověk psal od nuly
}

export type DraftPurpose =
  | 'report_6m' | 'report_on_request' | 'final_report' | 'authority_reply'
  | 'plan_10c' | 'plan_10d' | 'visit_note' | 'handover_summary'
  | 'standard_self_assessment' | 'registry_return_comment' | 'free'

/** .../drafts/{draftId}/revisions/{n} — append-only. */
export interface DraftRevision {
  revisionNo: number
  editedByPersonId: Id
  editedAt: IsoDateTime
  textAfter: string
  charsAdded: number
  charsRemoved: number
}

/* ------------------------------------------------------------------ */
/* Logy — dvoustupňová granularita (dok. 12)                           */
/* ------------------------------------------------------------------ */

/**
 * Nahlížení AGREGOVANĚ: jeden záznam za spis, osobu a den. Prohlížení je
 * vysokoobjemové a samo o sobě málo vypovídá.
 * `orgs/{orgId}/viewLogs/{caseFileId}_{personId}_{day}` — id je deterministické,
 * takže inkrement je jeden zápis bez čtení.
 */
export interface CaseFileViewLog {
  caseFileId: Id
  personId: Id
  day: IsoDate
  viewCount: number
  firstAt: IsoDateTime
  lastAt: IsoDateTime
  /** Nepřidělený spis — hranicí je organizace, ale stopa zůstává (dok. 03). */
  crossCaseAccess: boolean
  /** Dotaz na Eli se počítá jako nahlédnutí — nesmí to být cesta okolo (dok. 15). */
  viaAssistantCount: number
}

/**
 * Odnesení kopie JEDNOTLIVĚ — to je ten úkon, na který míří standard 13a
 * i GDPR (dok. 12).
 */
export interface DocumentExportLog {
  documentId: Id
  caseFileId: Id | null
  personId: Id
  action: 'download' | 'copy' | 'print' | 'authority_release' | 'exit_export'
  at: IsoDateTime
  /** U vydání úřadu odkaz na titul (dok. 13). */
  authorityRequestId: Id | null
}

/** Zapůjčení spisu — standard 13a. */
export interface CaseFileLending extends AuditFields {
  id: Id
  caseFileId: Id
  lentToPersonId: Id
  lentOn: IsoDate
  purpose: string
  dueOn: IsoDate | null
  returnedOn: IsoDate | null
}

/** Žádost o nahlédnutí do spisu, VČETNĚ odmítnutí — 13a to žádá výslovně. */
export interface InspectionRequest extends AuditFields {
  id: Id
  caseFileId: Id
  requestedByPersonId: Id
  requestedOn: IsoDate
  decision: 'granted' | 'partially_granted' | 'refused' | null
  decidedByPersonId: Id | null
  decidedOn: IsoDate | null
  refusalReason: string | null
  scopeGranted: string | null
}

/* ------------------------------------------------------------------ */
/* Podpisy                                                             */
/* ------------------------------------------------------------------ */

/**
 * Podpis je vždy vlastní úkon a jen online — biometrika a doručený kód
 * offline fungovat nemohou (dok. 08). Z chatu nikdy (dok. 15, stupeň 3).
 */
export interface SignatureCeremony extends AuditFields {
  id: Id
  documentId: Id
  documentVersionNo: number
  /** Podepisuje se OBSAH: výzva WebAuthn = hash obsahu (dok. 08). */
  contentHash: string
  kind: 'simple_in_app' | 'qualified'
  status: 'pending' | 'complete' | 'expired' | 'cancelled'

  signatures: Array<{
    personId: Id
    /** U dítěte podle věku ve vlastní aplikaci (dok. 08). */
    signerRole: 'caregiver' | 'child' | 'key_worker' | 'manager' | 'other'
    deviceId: Id | null
    webauthnCredentialId: string | null
    codeDeliveredTo: 'sms' | 'email' | null
    signedAt: IsoDateTime | null
    /** Když někdo nemá mobil, Klíčová osoba potvrdí (rozhodnuto uživatelem). */
    attestedByPersonId: Id | null
  }>
  via: Via
}
