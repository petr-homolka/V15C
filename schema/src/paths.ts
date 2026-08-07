/**
 * Cesty ke kolekcím na jednom místě.
 *
 * Důvod: cesta nese nájemce (README sekce 1.1), takže překlep v cestě je
 * bezpečnostní chyba, ne jen chyba dotazu. Když jsou cesty tady, jde je
 * otestovat a nikde se neskládají ze stringů ručně.
 */

import type { Id, IsoDate } from './common'

/* ---------------------------------------------------------------- */
/* platform/* — číselníky, čte každý přihlášený, zapisuje superadmin */
/* ---------------------------------------------------------------- */

/**
 * Číselníky visí pod jedním dokumentem `platform/registry`, ne přímo v korenu.
 *
 * Důvod je tvrdý: cesta k dokumentu musí mít SUDÝ počet částí, takže
 * `platform/authorities/ORP-TEPLICE` je cesta ke KOLEKCI, ne k dokumentu.
 * Kontejner navíc drží celý `platform/**` pod jedním pravidlem a nezanáší
 * korenový jmenný prostor — v něm zůstávají jen `platform`, `orgs`
 * a `transfers`.
 */
export const PLATFORM_ROOT = 'platform/registry'

export const platform = {
  root: () => PLATFORM_ROOT,
  legalRulesets: () => `${PLATFORM_ROOT}/legalRulesets`,
  legalRuleset: (id: Id) => `${PLATFORM_ROOT}/legalRulesets/${id}`,
  standardTemplates: () => `${PLATFORM_ROOT}/standardTemplates`,
  standardTemplate: (id: Id) => `${PLATFORM_ROOT}/standardTemplates/${id}`,
  sentenceTemplates: () => `${PLATFORM_ROOT}/sentenceTemplates`,
  documentTemplates: () => `${PLATFORM_ROOT}/documentTemplates`,
  pricingRulesets: () => `${PLATFORM_ROOT}/pricingRulesets`,
  pricingRuleset: (id: Id) => `${PLATFORM_ROOT}/pricingRulesets/${id}`,
  countries: () => `${PLATFORM_ROOT}/countries`,
  country: (code: string) => `${PLATFORM_ROOT}/countries/${code}`,
  authorities: () => `${PLATFORM_ROOT}/authorities`,
  authority: (code: string) => `${PLATFORM_ROOT}/authorities/${code}`,
  /** Definice číselníků — které nabídky jsou rozšiřitelné. */
  codebooks: () => `${PLATFORM_ROOT}/codebooks`,
  codebook: (code: string) => `${PLATFORM_ROOT}/codebooks/${code}`,
  /** Výchozí a adoptované položky číselníků. */
  codebookItems: () => `${PLATFORM_ROOT}/codebookItems`,
  codebookItem: (id: Id) => `${PLATFORM_ROOT}/codebookItems/${id}`,
  uploadPolicies: () => `${PLATFORM_ROOT}/uploadPolicies`,
  uploadPolicy: (id: Id) => `${PLATFORM_ROOT}/uploadPolicies/${id}`,
} as const

/** Jediná mezi-organizační kolekce. Zapisuje POUZE Cloud Function. */
export const transfers = {
  all: () => 'transfers',
  one: (code: string) => `transfers/${code}`,
} as const

/* ---------------------------------------------------------------- */
/* orgs/{orgId}/*                                                    */
/* ---------------------------------------------------------------- */

export function org(orgId: Id) {
  const base = `orgs/${orgId}`
  return {
    doc: () => base,

    /* --- správa --- */
    members: () => `${base}/members`,
    member: (personId: Id) => `${base}/members/${personId}`,
    subscription: () => `${base}/subscription/current`,
    wallet: () => `${base}/wallet/current`,
    settings: (scope: string) => `${base}/settings/${scope}`,
    policies: () => `${base}/policies`,
    policy: (id: Id) => `${base}/policies/${id}`,
    standards: () => `${base}/standards`,
    standard: (id: Id) => `${base}/standards/${id}`,
    sentences: () => `${base}/sentences`,
    checklists: () => `${base}/checklists`,
    /** Vlastní položky číselníků organizace — sjednotí se s platformními. */
    codebookItems: () => `${base}/codebookItems`,
    codebookItem: (id: Id) => `${base}/codebookItems/${id}`,
    storageQuota: () => `${base}/quota/current`,

    /* --- osoby a děti; kontakty jsou ODDĚLENĚ (dok. 04) --- */
    persons: () => `${base}/persons`,
    person: (personId: Id) => `${base}/persons/${personId}`,
    personContact: (personId: Id) => `${base}/persons/${personId}/private/contact`,
    personCarer: (personId: Id) => `${base}/persons/${personId}/private/carer`,
    devices: (personId: Id) => `${base}/persons/${personId}/devices`,
    device: (personId: Id, deviceId: Id) => `${base}/persons/${personId}/devices/${deviceId}`,

    children: () => `${base}/children`,
    child: (childId: Id) => `${base}/children/${childId}`,
    childContact: (childId: Id) => `${base}/children/${childId}/private/contact`,
    lifeBook: (childId: Id) => `${base}/children/${childId}/lifeBook`,
    lifeBookGrants: (childId: Id) => `${base}/children/${childId}/lifeBookGrants`,

    inquiries: () => `${base}/inquiries`,
    inquiry: (id: Id) => `${base}/inquiries/${id}`,

    /* --- dohody --- */
    agreements: () => `${base}/agreements`,
    agreement: (id: Id) => `${base}/agreements/${id}`,
    placements: (agreementId: Id) => `${base}/agreements/${agreementId}/placements`,
    placement: (agreementId: Id, id: Id) => `${base}/agreements/${agreementId}/placements/${id}`,
    orpConsents: (agreementId: Id) => `${base}/agreements/${agreementId}/consents`,
    orpStatements: (agreementId: Id) => `${base}/agreements/${agreementId}/orpStatements`,
    educationPeriods: (agreementId: Id) => `${base}/agreements/${agreementId}/educationPeriods`,

    /* --- spis: metadata vs obsah --- */
    caseFiles: () => `${base}/caseFiles`,
    caseFile: (id: Id) => `${base}/caseFiles/${id}`,
    /** OBSAH — jen role s přístupem k obsahu (dok. 04). */
    entries: (caseFileId: Id) => `${base}/caseFiles/${caseFileId}/entries`,
    entry: (caseFileId: Id, id: Id) => `${base}/caseFiles/${caseFileId}/entries/${id}`,
    timeline: (caseFileId: Id) => `${base}/caseFiles/${caseFileId}/timeline`,

    documents: (caseFileId: Id) => `${base}/caseFiles/${caseFileId}/documents`,
    document: (caseFileId: Id, id: Id) => `${base}/caseFiles/${caseFileId}/documents/${id}`,
    documentIndex: (caseFileId: Id, documentId: Id, versionNo: number) =>
      `${base}/caseFiles/${caseFileId}/documents/${documentId}/index/${versionNo}`,
    documentChunks: (caseFileId: Id, documentId: Id, versionNo: number) =>
      `${base}/caseFiles/${caseFileId}/documents/${documentId}/index/${versionNo}/chunks`,

    drafts: (caseFileId: Id) => `${base}/caseFiles/${caseFileId}/drafts`,
    draft: (caseFileId: Id, id: Id) => `${base}/caseFiles/${caseFileId}/drafts/${id}`,
    draftRevisions: (caseFileId: Id, draftId: Id) =>
      `${base}/caseFiles/${caseFileId}/drafts/${draftId}/revisions`,

    dictations: (caseFileId: Id) => `${base}/caseFiles/${caseFileId}/dictations`,
    dictation: (caseFileId: Id, id: Id) => `${base}/caseFiles/${caseFileId}/dictations/${id}`,
    dictationRevisions: (caseFileId: Id, id: Id) =>
      `${base}/caseFiles/${caseFileId}/dictations/${id}/revisions`,

    reports: (caseFileId: Id) => `${base}/caseFiles/${caseFileId}/reports`,
    report: (caseFileId: Id, id: Id) => `${base}/caseFiles/${caseFileId}/reports/${id}`,

    threads: (caseFileId: Id) => `${base}/caseFiles/${caseFileId}/threads`,
    messages: (caseFileId: Id, threadId: Id) =>
      `${base}/caseFiles/${caseFileId}/threads/${threadId}/messages`,

    /* --- ploché kolekce: „co mi utíká“ je jeden dotaz (README 1.4) --- */
    obligations: () => `${base}/obligations`,
    obligation: (id: Id) => `${base}/obligations/${id}`,
    mandateObligations: () => `${base}/mandateObligations`,
    tasks: () => `${base}/tasks`,
    task: (id: Id) => `${base}/tasks/${id}`,
    events: () => `${base}/events`,
    event: (id: Id) => `${base}/events/${id}`,

    /* --- úřady --- */
    authorityRequests: () => `${base}/authorityRequests`,
    submissions: () => `${base}/submissions`,
    registryReturns: () => `${base}/registryReturns`,
    registryReturn: (year: number) => `${base}/registryReturns/${year}`,
    reportDefinitions: () => `${base}/reportDefinitions`,
    exitPackages: () => `${base}/exitPackages`,

    /* --- Eli --- */
    assistantSessions: () => `${base}/assistant`,
    assistantSession: (id: Id) => `${base}/assistant/${id}`,
    assistantTurns: (sessionId: Id) => `${base}/assistant/${sessionId}/turns`,
    assistantActions: () => `${base}/assistantActions`,
    memory: () => `${base}/memory`,
    aiUsage: () => `${base}/aiUsage`,

    /* --- logy a audit --- */
    audit: () => `${base}/audit`,
    /** Deterministické id → inkrement je jeden zápis bez čtení (dok. 12). */
    viewLog: (caseFileId: Id, personId: Id, day: IsoDate) =>
      `${base}/viewLogs/${caseFileId}_${personId}_${day}`,
    viewLogs: () => `${base}/viewLogs`,
    exportLogs: () => `${base}/exportLogs`,
    lendings: () => `${base}/lendings`,
    inspectionRequests: () => `${base}/inspectionRequests`,
    signatures: () => `${base}/signatures`,
  } as const
}

/**
 * Kolekce, ve kterých pravidla nikdy nepovolí `delete`. Seznam je tady,
 * aby ho šlo otestovat proti `firestore.rules` — nic se nemaže (dok. 10).
 * Skartace běží v Cloud Function pod dohledem superadmina.
 */
export const APPEND_ONLY_COLLECTIONS = [
  'entries', 'timeline', 'documents', 'drafts', 'revisions', 'reports',
  'messages', 'audit', 'viewLogs', 'exportLogs', 'aiUsage', 'signatures',
  'placements', 'obligations', 'lifeBook', 'dictations',
] as const

/**
 * Kolekce, ze kterých se položka SMÍ odstranit, když se nikde nepoužila.
 * Jediné místo v celém modelu, kde se maže — a i tam jen proto, že
 * nepoužitou položkou číselníku se nic neztrácí (viz codebooks.ts).
 */
export const REMOVABLE_IF_UNUSED = ['codebookItems'] as const
