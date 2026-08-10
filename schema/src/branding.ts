/**
 * Branding organizace a šablony dopisních papírů.
 *
 * Dokumenty z tohohle systému chodí na OSPOD, na krajský úřad a k soudu.
 * Musí vypadat jako úřední dokument organizace, ne jako výstup z aplikace —
 * a musí být na první pohled dohledatelné a ověřitelné.
 */

import type { AuditFields, Id, IsoDate, IsoDateTime } from './common'

/* ------------------------------------------------------------------ */
/* Branding — orgs/{orgId}/branding/current                            */
/* ------------------------------------------------------------------ */

export interface OrgBranding extends AuditFields {
  /** Logo ve dvou variantách; tmavá se použije na světlém pozadí a naopak. */
  logo: {
    lightDocumentId: Id | null      // pro bílý papír a světlé rozhraní
    darkDocumentId: Id | null       // pro tmavý režim aplikace
    /** Výška v milimetrech na papíře. Šířka se dopočítá z poměru. */
    printHeightMm: number
  }

  /**
   * Akcentní barva organizace.
   *
   * POZOR: v aplikaci se **nepoužívá jako barva textu ani pozadí** — na to
   * jsou tokeny návrhového systému, které drží kontrast v obou režimech
   * (CLAUDE.md). Akcent slouží k odlišení: linka v hlavičce dokumentu,
   * proužek u loga, barva odkazu v PDF. Tam, kde jeho záměna nemůže
   * způsobit nečitelnost.
   */
  accent: {
    hex: string
    /** Ověřený kontrast proti bílému papíru; pod 3:1 se v UI nepoužije. */
    contrastOnWhite: number
  } | null

  /** Údaje do zápatí dopisu — bez nich to není úřední dokument. */
  footer: {
    legalName: string
    seatLine: string                // „Nádražní 12, 415 01 Teplice“
    ico: string | null
    dic: string | null
    registrationNote: string | null // „zapsáno v OR vedeném KS v Ústí n. L., oddíl O, vložka 123“
    bankAccount: string | null
    isds: string | null             // ID datové schránky
    web: string | null
    phone: string | null
    email: string | null
    /** Číslo pověření k výkonu SPOD — patří na dokumenty vůči úřadům. */
    mandateNote: string | null
  }

  /** Podpisový blok. Obrázek podpisu je pomůcka, ne elektronický podpis. */
  signatureBlock: {
    defaultSignerPersonId: Id | null
    defaultSignerTitle: string | null   // „ředitelka“, „vedoucí služby“
    /** Naskenovaný podpis do PDF. Nezaměňovat s podpisem podle dok. 08. */
    scannedSignatureDocumentId: Id | null
    stampDocumentId: Id | null
  }

  /** Nastavení QR kódu na dokumentech — viz sekce o ověřování níže. */
  qr: {
    enabled: boolean
    /** Kde se na stránce vykreslí. */
    placement: 'footer_right' | 'footer_left' | 'header_right' | 'none'
    sizeMm: number
  }
}

/* ------------------------------------------------------------------ */
/* Šablona dopisního papíru                                            */
/* ------------------------------------------------------------------ */

/**
 * `orgs/{orgId}/letterheads/{id}` — verzované, protože dokument se musí
 * dát znovu vysázet ve stejné podobě, v jaké odešel.
 */
export interface LetterheadTemplate extends AuditFields {
  id: Id
  code: string                      // 'dopis-a4', 'zprava-a4', 'sdeleni-a5'
  label: string
  version: string
  effectiveFrom: IsoDate
  supersedesId: Id | null

  format: PageFormat
  orientation: 'portrait' | 'landscape'
  margins: Margins

  /** Které bloky se na dokumentu objeví a v jakém pořadí. */
  blocks: LetterheadBlock[]

  /**
   * Pozice adresního okénka. Když organizace posílá poštou v okénkové
   * obálce, adresa MUSÍ ležet v okénku — jinak se dopis vrátí. Rozměry
   * se odvozují z ČSN pro obálky s okénkem; **je nutné je ověřit proti
   * obálkám, které organizace skutečně kupuje**, protože se u výrobců liší.
   */
  addressWindow: {
    enabled: boolean
    leftMm: number                  // typicky 20
    topMm: number                   // typicky 45–50
    widthMm: number                 // typicky 85
    heightMm: number                // typicky 25–30
  }

  /** Zápatí a číslování na každé straně. */
  pagination: {
    show: boolean
    /** „Strana 2 z 5“ — u zprávy o průběhu PP se to čeká. */
    format: 'page_of_total' | 'page_only'
    firstPageShows: boolean
  }

  /** Druhá a další strana bývá bez loga a s užší hlavičkou. */
  continuationHeader: 'none' | 'compact' | 'same'
}

export type PageFormat = 'A4' | 'A5' | 'A5_landscape' | 'letter'

export interface Margins {
  topMm: number
  rightMm: number
  bottomMm: number
  leftMm: number
}

export type LetterheadBlock =
  | 'logo'
  | 'org_header'          // název a sídlo vpravo nahoře
  | 'address_recipient'   // adresát do okénka
  | 'reference_table'     // Naše značka / Vaše značka / Vyřizuje / Datum
  | 'subject'             // Věc
  | 'body'
  | 'closing'             // S pozdravem
  | 'signature'
  | 'attachments'         // Přílohy
  | 'footer_legal'
  | 'qr'
  | 'page_numbers'

/* ------------------------------------------------------------------ */
/* Hlavička dokumentu — „obvyklé věci“                                 */
/* ------------------------------------------------------------------ */

/**
 * Referenční blok českého úředního dopisu. Vyplňuje se automaticky ze spisu;
 * co se nedá odvodit, zůstane prázdné (dok. 16 — prázdno je platný stav).
 */
export interface DocumentReferenceFields {
  /** NAŠE ZNAČKA — jednací číslo, které dokumentu dáváme my. */
  ourReference: string
  /**
   * Spisová značka — drží dokumenty jedné věci pohromadě. U doprovázení je
   * to přirozeně značka spisu rodiny (`CaseFile.reference`), takže se
   * neodvozuje z ničeho nového.
   */
  fileReference: string | null

  /** VAŠE ZNAČKA — jednací číslo protistrany, když na něco odpovídáme. */
  yourReference: string | null
  /** Datum jejich dokumentu, na který odpovídáme. */
  yourDocumentDate: IsoDate | null

  /** VYŘIZUJE — kdo to zpracoval, s kontaktem. */
  handledBy: {
    personId: Id
    displayName: string
    title: string | null
    phone: string | null
    email: string | null
  }

  place: string                     // „V Teplicích“
  date: IsoDate
  subject: string                   // VĚC
  attachments: Array<{ label: string; documentId: Id | null }>
  /** Komu jde kopie — u zprávy podle § 47b odst. 5 jsou tři adresáti (dok. 05). */
  copiesTo: string[]
}

/**
 * Číslování dokumentů. Řada je na úrovni organizace a je **verzovaná
 * podle roku**, protože jednací čísla se v ČR běžně restartují k 1. 1.
 */
export interface ReferenceNumberSeries extends AuditFields {
  id: Id
  code: string                      // 'zprava', 'odpoved-urad', 'obecne'
  label: string
  /** Vzor: `{PREFIX}-{ROK}/{SEQ}` → „ZPR-2026/0042“. */
  pattern: string
  prefix: string
  year: number
  /** Poslední přidělené číslo. Přiděluje Cloud Function transakčně, jinak
   *  by dvě zprávy vytvořené naráz dostaly stejné jednací číslo. */
  lastSequence: number
  resetsYearly: boolean
  padTo: number
}

/* ------------------------------------------------------------------ */
/* QR kód — a proč nesmí odkazovat na dokument                         */
/* ------------------------------------------------------------------ */

/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ QR VEDE NA OVĚŘENÍ, NE NA OBSAH.                                    │
 * │                                                                     │
 * │ Dopis se zprávou o dítěti v pěstounské péči jde poštou nebo do       │
 * │ datové schránky, leží na stole v podatelně a projde rukama několika  │
 * │ lidí. Kdyby QR vedl na dokument, byl by to **klíč k údajům podle    │
 * │ čl. 9 GDPR vytištěný na papíře** — kdokoli by ho vyfotil, měl by     │
 * │ obsah spisu dítěte.                                                 │
 * │                                                                     │
 * │ QR proto vede na **ověřovací stránku**, která bez přihlášení ukáže   │
 * │ jen to, co ověření potřebuje: kdo dokument vydal, kdy, jaký je jeho  │
 * │ druh, jednací číslo a jestli otisk odpovídá. Žádný obsah.            │
 * │                                                                     │
 * │ Kdo je přihlášený a má na dokument právo, uvidí na téže stránce      │
 * │ i odkaz na dokument. Rozhoduje o tom přihlášení, ne držení papíru.   │
 * └─────────────────────────────────────────────────────────────────────┘
 */
export interface DocumentVerification {
  /** Krátký token v URL. Neobsahuje id spisu ani dítěte. */
  token: string
  documentId: Id
  documentVersionNo: number
  organizationId: Id

  /** Co ověřovací stránka ukáže BEZ přihlášení. */
  publicFacts: {
    issuerName: string              // název organizace
    issuedOn: IsoDate
    documentKindLabel: string       // „Zpráva o průběhu výkonu pěstounské péče“
    ourReference: string
    pageCount: number
    /** Otisk obsahu — stejný jako u podpisu (dok. 08). */
    contentHash: string
    /** Zneplatněno novou verzí. */
    supersededByVersionNo: number | null
  }

  createdAt: IsoDateTime
  /** Ověření nemá důvod expirovat — dokument existuje dál (dok. 18). */
  revokedAt: IsoDateTime | null
  /** Kolikrát někdo skenoval. Zajímavé u kontroly, jinak neškodné. */
  scanCount: number
  lastScanAt: IsoDateTime | null
}

/* ------------------------------------------------------------------ */
/* Vysázení dokumentu                                                  */
/* ------------------------------------------------------------------ */

/**
 * Zadání pro Cloud Function, která z konceptu udělá PDF. Uchovává se, aby
 * se dokument dal vysázet znovu **ve stejné podobě** — šablona i branding
 * se v čase mění a bez verzí by se stará zpráva vytiskla jinak než odešla.
 */
export interface RenderRequest {
  documentId: Id
  letterheadTemplateId: Id
  letterheadVersion: string
  brandingSnapshot: OrgBranding
  reference: DocumentReferenceFields
  verificationToken: string | null

  /** Obsah z blokového editoru (richtext.ts). */
  contentRef: { kind: 'draft' | 'document'; id: Id }

  /**
   * Nevyplněná místa `[DOPLNIT: …]` se v PDF vykreslí **viditelně**
   * a tenhle příznak jde nastavit jen na `true` — mezera nesmí vypadnout
   * tiše (dok. 14).
   */
  showGapMarkers: true

  /** Vodoznak u konceptu, aby se nespletl s odeslaným dokumentem. */
  watermark: 'none' | 'draft'
  requestedByPersonId: Id
  requestedAt: IsoDateTime
}

/* ------------------------------------------------------------------ */
/* Výchozí šablony                                                     */
/* ------------------------------------------------------------------ */

/**
 * Rozměry vycházejí z běžné české úpravy obchodního a úředního dopisu
 * (ČSN 01 6910 pro úpravu písemností, ČSN 88 6510 pro obálky s okénkem).
 * **Před prvním tiskem je nutné je ověřit proti obálkám, které organizace
 * kupuje** — u výrobců se okénko o pár milimetrů liší a dopis se pak
 * nedá odeslat.
 */
export const DEFAULT_LETTERHEADS: ReadonlyArray<
  Pick<LetterheadTemplate, 'code' | 'label' | 'format' | 'orientation' | 'margins'
    | 'blocks' | 'addressWindow' | 'pagination' | 'continuationHeader'>
> = [
  {
    code: 'dopis-a4',
    label: 'Dopis A4 (okénková obálka)',
    format: 'A4',
    orientation: 'portrait',
    margins: { topMm: 20, rightMm: 20, bottomMm: 20, leftMm: 25 },
    blocks: [
      'logo', 'org_header', 'address_recipient', 'reference_table', 'subject',
      'body', 'closing', 'signature', 'attachments', 'footer_legal', 'qr',
      'page_numbers',
    ],
    addressWindow: { enabled: true, leftMm: 20, topMm: 45, widthMm: 85, heightMm: 30 },
    pagination: { show: true, format: 'page_of_total', firstPageShows: false },
    continuationHeader: 'compact',
  },
  {
    code: 'zprava-a4',
    label: 'Zpráva A4 (bez okénka, k založení do spisu)',
    format: 'A4',
    orientation: 'portrait',
    margins: { topMm: 25, rightMm: 20, bottomMm: 20, leftMm: 25 },
    blocks: [
      'logo', 'org_header', 'reference_table', 'subject', 'body',
      'signature', 'attachments', 'footer_legal', 'qr', 'page_numbers',
    ],
    addressWindow: { enabled: false, leftMm: 0, topMm: 0, widthMm: 0, heightMm: 0 },
    pagination: { show: true, format: 'page_of_total', firstPageShows: true },
    continuationHeader: 'compact',
  },
  {
    code: 'sdeleni-a5',
    label: 'Sdělení A5',
    format: 'A5',
    orientation: 'portrait',
    margins: { topMm: 15, rightMm: 15, bottomMm: 15, leftMm: 18 },
    blocks: [
      'logo', 'org_header', 'reference_table', 'body', 'signature',
      'footer_legal', 'qr',
    ],
    addressWindow: { enabled: false, leftMm: 0, topMm: 0, widthMm: 0, heightMm: 0 },
    pagination: { show: false, format: 'page_only', firstPageShows: false },
    continuationHeader: 'none',
  },
  {
    code: 'potvrzeni-a5',
    label: 'Potvrzení A5 (na šířku)',
    format: 'A5_landscape',
    orientation: 'landscape',
    margins: { topMm: 15, rightMm: 18, bottomMm: 15, leftMm: 18 },
    blocks: ['logo', 'org_header', 'subject', 'body', 'signature', 'qr'],
    addressWindow: { enabled: false, leftMm: 0, topMm: 0, widthMm: 0, heightMm: 0 },
    pagination: { show: false, format: 'page_only', firstPageShows: false },
    continuationHeader: 'none',
  },
]

/**
 * Typografie se **nekonfiguruje**. Geist Sans a Geist Mono jsou vendorované
 * (CLAUDE.md) a dokument sázený stejným písmem jako aplikace drží jednotný
 * dojem. Kdyby si každá organizace vybírala písmo, půlka výstupů bude
 * v Comic Sans a zbytek nečitelný na tisku.
 *
 * Organizace si mění **logo, akcent a zápatí** — to je to, co dělá dokument
 * jejím, a nic z toho nemůže rozbít sazbu.
 */
export const TYPOGRAPHY_IS_FIXED = true
