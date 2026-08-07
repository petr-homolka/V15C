/**
 * Marketplace — vzdělávání i služby pro rodinu (respit, terapie, doučování).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ JEDEN MARKETPLACE, DVA DRUHY NABÍDKY                                │
 * │                                                                     │
 * │ Respit nedostal vlastní strom. Profil pořadatele, nabídka,          │
 * │ objednávka, faktura a potvrzení jsou u kurzu i u tábora totéž —     │
 * │ dvě paralelní větve by znamenaly dvojí správu navždy.               │
 * │                                                                     │
 * │ Liší se jen to, co z toho vznikne ve spisu:                         │
 * │   kurz    → certifikát s HODINAMI  → vzdělávací záznam (18/24 h)    │
 * │   služba  → potvrzení se DNY       → respitní epizoda (14 dnů)      │
 * │                                                                     │
 * │ A oba se vážou na PÍSMENO PRÁVA podle § 47a odst. 2, protože podle  │
 * │ něj se čerpá státní příspěvek (§ 5c vyhlášky, dok. 02).             │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Doporučení k platbám zůstává z dok. 22: **žádná platební brána.**
 * Pořadatel fakturuje, organizace platí převodem. `payment.method` má od
 * začátku i `'card'`, aby se to dalo doplnit bez migrace.
 */

import type { AuditFields, Id, IsoDate, IsoDateTime, Money } from './common'

/* ------------------------------------------------------------------ */
/* Domény                                                              */
/* ------------------------------------------------------------------ */

export type MarketplaceDomain =
  | 'education'    // kurzy pro pěstouny — § 47a odst. 2 písm. f)
  | 'respite'      // odlehčení, hlídání, tábory — písm. a), b)
  | 'therapy'      // psycholog, terapeut — písm. d)
  | 'tutoring'     // doučování, rozvoj dítěte
  | 'contact_support' // asistovaný kontakt s blízkými — písm. e)
  | 'counselling'  // odborné poradenství — písm. c)

/**
 * Mapa na písmeno práva. **Není to kosmetika**: podle písmene se výdaj
 * zařadí do pásma čerpání státního příspěvku (§ 5c vyhlášky 473/2012),
 * takže špatné zařazení je chyba v čerpání, ne v popisku.
 *
 * `education` je zvlášť, protože vedle výdaje plní i hodinovou povinnost.
 */
export const DOMAIN_RIGHT_CODE: Record<MarketplaceDomain, string> = {
  education: 'f',
  respite: 'b',
  therapy: 'd',
  tutoring: 'none',        // rozvoj dítěte nemá vlastní písmeno
  contact_support: 'e',
  counselling: 'c',
}

/* ------------------------------------------------------------------ */
/* Pořadatel / poskytovatel — providers/{providerId}                   */
/* ------------------------------------------------------------------ */

export interface MarketplaceProvider extends AuditFields {
  id: Id
  slug: string                      // veřejná adresa: /nabidka/{slug}
  legalName: string
  displayName: string
  ico: string | null
  dic: string | null

  domains: MarketplaceDomain[]

  /**
   * Externí poskytovatel prodává napříč organizacemi a je veřejně vidět.
   * **Interní** je zaměstnanec nebo spolupracovník jedné organizace —
   * hlídání, doučování. Ten se nikde nelistuje a neúčtuje se mu fakturou;
   * odbavuje se vnitřně (sekce „Interní poskytovatel“).
   */
  kind: 'external' | 'internal'
  /** Vyplněné jen u `internal`. */
  organizationId: Id | null

  contact: {
    email: string
    phone: string | null
    web: string | null
    address: { street: string; city: string; zip: string; country: string } | null
  }

  about: string
  logoDocumentId: Id | null
  serviceAreas: string[]            // kraje nebo okresy, kde působí

  verification: ProviderVerification
  /** Způsobilost k péči o dítě — sekce níže. Prázdné u čistě vzdělávacích. */
  eligibility: ProviderEligibility | null

  billing: { bankAccount: string | null; invoiceNote: string | null }
  status: 'active' | 'suspended' | 'closed'
}

export interface ProviderVerification {
  status: 'unverified' | 'verified' | 'rejected'
  verifiedOn: IsoDate | null
  verifiedByPersonId: Id | null
  note: string | null
  /** Akreditace MPSV u vzdělávání; u služeb bývá jiné oprávnění. */
  accreditation: { number: string; validUntil: IsoDate | null; documentId: Id | null } | null
}

/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ TOHLE JE U RESPITU TO PODSTATNÉ A U VZDĚLÁVÁNÍ TO NENÍ.             │
 * │                                                                     │
 * │ § 49 odst. 4 ZSPOD říká, kdo smí poskytovat pomoc a podporu při     │
 * │ osobní péči o dítě podle § 47a odst. 2 písm. a) a b):               │
 * │                                                                     │
 * │  a) fyzická osoba **plně svéprávná, zdravotně způsobilá, bezúhonná**│
 * │     a splňující další osobnostní předpoklady (posuzuje se obdobně   │
 * │     podle § 23d odst. 4 písm. b) a d) a § 23e), NEBO                │
 * │  b) **osoba pořádající zotavovací akci** podle zvláštního předpisu  │
 * │     — tedy tábor.                                                   │
 * │                                                                     │
 * │ Prakticky: tábor je v pořádku tím, že je táborem. Paní odvedle,     │
 * │ která pohlídá, musí mít doloženou bezúhonnost a zdravotní           │
 * │ způsobilost. Organizace, která by z příspěvku zaplatila neprověřené │
 * │ hlídání, má problém při kontrole — ne poskytovatel.                 │
 * │                                                                     │
 * │ Systém proto **eviduje, na jakém základě poskytovatel péči smí**,   │
 * │ a v nabídce to ukazuje. Neblokuje (dok. 16), ale netvrdí za nikoho, │
 * │ že je prověřený, když to nikdo nedoložil.                           │
 * └─────────────────────────────────────────────────────────────────────┘
 */
export interface ProviderEligibility {
  /** Podle kterého písmene § 49 odst. 4 poskytovatel péči poskytuje. */
  basis: 'natural_person_vetted' | 'recreation_event_organizer' | 'not_applicable'

  /** U `natural_person_vetted` — bez těchhle dokladů to není doložené. */
  criminalRecord: { checkedOn: IsoDate; documentId: Id | null } | null
  medicalFitness: { checkedOn: IsoDate; documentId: Id | null } | null
  personalPrerequisites: { assessedOn: IsoDate; note: string; documentId: Id | null } | null

  /** U `recreation_event_organizer` — ohlášení zotavovací akce. */
  recreationEventNote: string | null

  /** Dopočítané: je doloženo všechno, co k danému základu patří? */
  complete: boolean
  /** Doklady mají platnost; po ní je to k doložení znovu. */
  validUntil: IsoDate | null
}

export interface ProviderMembership extends AuditFields {
  providerId: Id
  personId: Id
  role: 'provider_admin' | 'provider_staff'
  startedOn: IsoDate
  endedOn: IsoDate | null
}

/* ------------------------------------------------------------------ */
/* Nabídka: kurz                                                       */
/* ------------------------------------------------------------------ */

/** `providers/{providerId}/courses/{courseId}` — doména `education`. */
export interface Course extends AuditFields {
  id: Id
  providerId: Id
  slug: string
  title: string
  perex: string
  description: string

  /**
   * HODINY JSOU NOSNÉ POLE. Certifikát plní zákonnou povinnost 18 nebo 24
   * hodin za dvanáct měsíců (§ 47a odst. 2 písm. f). Když pořadatel hodiny
   * nadsadí, při inspekci to odnese organizace, ne on — proto je u záznamu
   * vidět, že přišly z certifikátu, ne z klávesnice.
   */
  hours: number

  /** Mapuje se na číselník `education.form` a přes něj na limit e-learningu. */
  formCode: string
  topicCodes: string[]

  price: Money
  vatIncluded: boolean
  capacity: number | null
  language: string
  audience: string[]

  delivery: {
    kind: 'self_paced' | 'scheduled_online' | 'in_person' | 'hybrid'
    platformNote: string | null
    accessInstructions: string | null
  }

  status: OfferStatus
}

export interface CourseSession extends AuditFields {
  id: Id
  courseId: Id
  startsAt: IsoDateTime
  endsAt: IsoDateTime
  capacity: number | null
  seatsTaken: number
  place: string | null
  status: 'planned' | 'running' | 'finished' | 'cancelled'
  cancelledReason: string | null
}

/* ------------------------------------------------------------------ */
/* Nabídka: služba                                                     */
/* ------------------------------------------------------------------ */

/**
 * `providers/{providerId}/services/{serviceId}` — respit, terapie, doučování.
 *
 * Nabídka může být **obecná** („psycholožka, Teplice, cena dohodou“) nebo
 * **položková** („letní tábor 12.–19. 7., 6 500 Kč / dítě“). Obojí musí jít,
 * protože psycholog nebude vypisovat termíny a tábor bez termínu nedává
 * smysl.
 */
export interface ServiceOffer extends AuditFields {
  id: Id
  providerId: Id
  slug: string
  domain: MarketplaceDomain
  title: string
  perex: string
  description: string

  /** Obecná nabídka nemá cenu ani termín; položková je má. */
  offerKind: 'general' | 'itemized'

  /** U `general`: orientační informace, ne závazek. */
  general: {
    priceNote: string | null        // „cena dohodou“, „od 600 Kč / hodina“
    availabilityNote: string | null
    contactFirst: true              // domluva probíhá mimo systém
  } | null

  /** U `itemized`: konkrétní položky, které jdou objednat. */
  items: ServiceItem[]

  /** Pro koho je služba určená a jaká věková skupina. */
  childAgeFrom: number | null
  childAgeTo: number | null
  audience: string[]

  serviceAreas: string[]
  language: string
  status: OfferStatus
}

export interface ServiceItem {
  code: string
  label: string
  /** Jednotka, ve které se to prodává a ve které se to i vykazuje. */
  unit: ServiceUnit
  unitPrice: Money
  vatIncluded: boolean

  /** U pobytových položek termín; u hodinových `null`. */
  from: IsoDate | null
  to: IsoDate | null
  capacity: number | null
  place: string | null

  /**
   * Kolik DNŮ se z položky započítá do čtrnáctidenního nároku
   * (§ 47a odst. 2 písm. b). Jednotkou je den, i kdyby šlo o hodinu
   * (rozhodnuto v dok. 03) — a hodinové hlídání se do nároku obvykle
   * nepočítá vůbec, proto to není dopočet z `unit`, ale vlastní pole.
   */
  respiteDays: number | null

  /** Ubytování a strava se hradí zvlášť — § 58 odst. 3 písm. g), h). */
  includesMeals: boolean
  includesAccommodation: boolean
}

export type ServiceUnit = 'hour' | 'half_day' | 'day' | 'night' | 'session' | 'package'

export type OfferStatus = 'draft' | 'listed' | 'unlisted' | 'archived'

/* ------------------------------------------------------------------ */
/* Veřejná nabídka — listings/{listingId}                              */
/* ------------------------------------------------------------------ */

/**
 * Kořenová kolekce **čitelná bez přihlášení**, aby se nabídka dala najít
 * na internetu a koupit i mimo systém.
 *
 * Proto v ní **nesmí být nic osobního**. Je to výkladní skříň. Objednávky,
 * děti a potvrzení žijí jinde a jsou chráněné.
 */
export interface Listing {
  id: Id
  domain: MarketplaceDomain
  offerKind: 'course' | 'service'
  offerId: Id
  providerId: Id
  providerSlug: string
  providerDisplayName: string
  providerVerified: boolean
  /** U péče o dítě: doložená způsobilost podle § 49 odst. 4. */
  providerEligible: boolean | null

  title: string
  perex: string
  /** U kurzu hodiny, u služby počet dnů nebo jednotka. */
  hours: number | null
  unitLabel: string | null
  priceFrom: Money | null
  priceNote: string | null

  serviceAreas: string[]
  language: string
  nextDateAt: IsoDateTime | null

  visibility: 'public' | 'system_only'
  publishedAt: IsoDateTime
  unlistedAt: IsoDateTime | null
  popularity: number
}

/* ------------------------------------------------------------------ */
/* Objednávka — orders/{orderId}                                       */
/* ------------------------------------------------------------------ */

export interface Order extends AuditFields {
  id: Id
  domain: MarketplaceDomain
  offerKind: 'course' | 'service'
  providerId: Id
  offerId: Id
  sessionId: Id | null
  itemCode: string | null

  buyer: OrderBuyer
  /** U kurzu jsou to místa pro pěstouny, u služby pobyty dětí. */
  seats: OrderSeat[]
  bookings: ServiceBooking[]
  seatCount: number

  unitPrice: Money
  totalPrice: Money

  status: OrderStatus
  requestedByPersonId: Id | null
  approvedByPersonId: Id | null
  approvedAt: IsoDateTime | null
  rejectedReason: string | null

  payment: OrderPayment
  invoiceDocumentId: Id | null
  expenseEntryIds: Id[]
  /** Písmeno práva, pod které výdaj spadne (`DOMAIN_RIGHT_CODE`). */
  rightCode: string

  placedAt: IsoDateTime
  cancelledAt: IsoDateTime | null
  cancelledReason: string | null
}

export type OrderBuyer =
  | {
      kind: 'organization'
      organizationId: Id
      organizationName: string
      ico: string | null
      billingAddress: string
    }
  | {
      kind: 'guest'
      displayName: string
      email: string
      ico: string | null
      billingAddress: string
    }

export interface OrderSeat {
  personId: Id | null
  displayName: string
  email: string
  educationPeriodId: Id | null
}

/**
 * Rezervace služby pro konkrétní dítě.
 *
 * `childId` je jediné místo, kde se marketplace dotýká dítěte — a to jen
 * uvnitř organizace. **Poskytovatel dostane jméno a věk, nic dalšího.**
 * Do veřejné nabídky ani do objednávky hosta se dítě nedostane nikdy.
 */
export interface ServiceBooking {
  childId: Id
  childDisplayName: string
  childAgeYears: number
  from: IsoDate
  to: IsoDate
  units: number
  unit: ServiceUnit
  /** Kolik dnů se započítá do nároku podle § 47a odst. 2 písm. b). */
  respiteDays: number
  caseFileId: Id
  /** Vznikne po potvrzení poskytovatelem. */
  careEpisodeId: Id | null
}

export type OrderStatus =
  | 'requested' | 'approved' | 'rejected' | 'confirmed'
  | 'invoiced' | 'paid' | 'completed' | 'cancelled'

export interface OrderPayment {
  method: 'invoice' | 'card' | 'internal'
  /** Peníze tečou přímo mezi poskytovatelem a kupujícím, ne přes nás. */
  flowsThroughPlatform: false
  paidOn: IsoDate | null
  variableSymbol: string | null
  note: string | null
}

/* ------------------------------------------------------------------ */
/* Co z toho vznikne ve spisu                                          */
/* ------------------------------------------------------------------ */

export interface Enrolment extends AuditFields {
  id: Id
  orderId: Id
  offerId: Id
  providerId: Id
  personId: Id | null
  displayName: string
  email: string
  access: {
    kind: 'link' | 'code' | 'invitation_email' | 'in_person'
    value: string | null
    sharedAt: IsoDateTime | null
  } | null
  status: 'enrolled' | 'in_progress' | 'completed' | 'not_completed' | 'cancelled'
  completedOn: IsoDate | null
  certificateId: Id | null
}

/** Certifikát z kurzu — potvrzuje HODINY. */
export interface CourseCertificate extends AuditFields {
  id: Id
  enrolmentId: Id
  orderId: Id
  offerId: Id
  providerId: Id
  participantName: string
  participantPersonId: Id | null
  courseTitle: string
  hours: number
  formCode: string
  completedOn: IsoDate
  issuedByPersonId: Id
  issuedAt: IsoDateTime
  accreditationNumber: string | null
  documentId: Id | null
  verificationToken: string | null
  /** Vzdělávací záznam ve spisu; vznikne sám s možností vrátit zpět. */
  educationRecordId: Id | null
  revokedAt: IsoDateTime | null
  revokedReason: string | null
}

/**
 * Potvrzení služby — u respitu potvrzuje DNY.
 *
 * Je to protějšek certifikátu a plní stejnou roli: dnes Klíčová osoba
 * respitní dny opisuje z faktury, tady je potvrdil ten, kdo péči poskytl.
 *
 * Z potvrzení vzniká `CareEpisode` (casefile.ts), který se počítá proti
 * čtrnáctidennímu nároku a **při přechodu pěstouna jde s ním** (dok. 09).
 */
export interface ServiceConfirmation extends AuditFields {
  id: Id
  orderId: Id
  offerId: Id
  providerId: Id
  domain: MarketplaceDomain

  childId: Id
  childDisplayName: string
  from: IsoDate
  to: IsoDate
  unitsDelivered: number
  unit: ServiceUnit
  /** Kolik dnů se skutečně započítá. Nemusí se rovnat objednanému. */
  respiteDays: number

  issuedByPersonId: Id
  issuedAt: IsoDateTime
  documentId: Id | null
  verificationToken: string | null
  note: string | null

  /** Záznam ve spisu; vznikne sám s možností vrátit zpět (dok. 16). */
  careEpisodeId: Id | null
  revokedAt: IsoDateTime | null
  revokedReason: string | null
}

/* ------------------------------------------------------------------ */
/* Interní poskytovatel                                                */
/* ------------------------------------------------------------------ */

/**
 * Hlídání nebo doučování dělá zaměstnanec či spolupracovník organizace.
 *
 * Nefakturuje se, protože obě strany jsou tatáž organizace — účtuje se
 * vnitřně. Objednávka proto vzniká rovnou ve stavu `confirmed`
 * s `payment.method: 'internal'` a nevzniká faktura.
 *
 * **Co se ale nemění:** dny se počítají do nároku stejně a **způsobilost
 * podle § 49 odst. 4 platí i pro zaměstnance.** Bezúhonnost se nedokládá
 * podle toho, kdo komu fakturuje.
 *
 * A jedna pojistka z dok. 05: manžel nebo registrovaný partner pečující
 * osoby žijící v rodinné domácnosti se podílí na péči ze zákona
 * (§ 965 odst. 3 + § 655 odst. 2 OZ), takže mu **nelze proplatit ani
 * interně**. To hlídá `CareProviderProfile`, ne marketplace.
 */
export interface InternalServiceDelivery extends AuditFields {
  id: Id
  organizationId: Id
  providerId: Id                    // interní poskytovatel
  performedByPersonId: Id
  domain: MarketplaceDomain

  childId: Id | null
  caseFileId: Id
  from: IsoDate
  to: IsoDate
  units: number
  unit: ServiceUnit
  respiteDays: number

  /** Vnitřní ocenění pro reporty. Nemusí být — dobrovolnická práce. */
  internalCost: Money | null
  /** Sazba podle § 5f vyhlášky, když se náhrada poskytuje (dok. 04). */
  rateBasis: 'per_day' | 'per_half_day' | 'per_hour' | 'none'

  careEpisodeId: Id | null
  expenseEntryId: Id | null
}

/* ------------------------------------------------------------------ */
/* Obchodní podmínky — nastavení na úrovni systému                     */
/* ------------------------------------------------------------------ */

/**
 * `platform/registry/marketplaceTerms/{id}` — datovaný záznam, který
 * **superadmin edituje v nastavení systému**.
 *
 * Provize a poplatek za listování se nastavují **zvlášť pro každou doménu**:
 * kurz za 1 800 Kč a tábor za 6 500 Kč nemají důvod mít stejnou sazbu.
 * O výši rozhoduje vlastník produktu, ne kód (poučení z dok. 21).
 */
export interface MarketplaceTerms {
  id: Id
  effectiveFrom: IsoDate
  note: string | null

  /** Výchozí hodnoty, když doména nemá vlastní. */
  defaults: DomainTerms
  /** Nastavení pro konkrétní doménu; přebíjí `defaults`. */
  perDomain: Array<{ domain: MarketplaceDomain } & Partial<DomainTerms>>

  termsDocumentId: Id | null
}

export interface DomainTerms {
  /** Provize z ceny objednávky. `null` = neúčtuje se. */
  commissionPct: number | null
  /** Strop provize za objednávku, aby tábor pro pět dětí neutrhl ucho. */
  commissionCap: Money | null
  /** Poplatek za vylistování nabídky. `null` = zdarma. */
  listingFee: Money | null
  listingFeePeriod: 'once' | 'monthly' | 'yearly' | null
  /** Smí listovat i neověřený poskytovatel? */
  listingRequiresVerification: boolean
  /**
   * U péče o dítě: smí listovat i ten, kdo nedoložil způsobilost podle
   * § 49 odst. 4? Výchozí ano — v nabídce je to vidět a rozhodnutí patří
   * organizaci (dok. 16).
   */
  listingRequiresEligibility: boolean
}

/** Rozhodnutí superadmina pro doménu, s dopadem `defaults`. */
export function termsForDomain(terms: MarketplaceTerms, domain: MarketplaceDomain): DomainTerms {
  const specific = terms.perDomain.find((d) => d.domain === domain)
  return { ...terms.defaults, ...(specific ?? {}) }
}

/* ------------------------------------------------------------------ */
/* Hranice, které marketplace nesmí překročit                          */
/* ------------------------------------------------------------------ */

/**
 * 1. **O dítěti se ven dostane jméno a věk, nic víc.** Poskytovatel respitu
 *    to potřebuje, aby dítě přijal; spis, diagnózu ani rodinu nevidí.
 * 2. **Veřejná část bez osobních údajů.** `listings/**` a `providers/**`
 *    jsou čitelné bez přihlášení.
 * 3. **Nejsme LMS ani platební brána.**
 * 4. **Hodiny i dny jsou tvrzení poskytovatele** a je vidět, odkud přišly.
 * 5. **Způsobilost k péči se eviduje, ale neblokuje** — v nabídce je vidět.
 */
export const MARKETPLACE_BOUNDARIES = [
  'child_data_minimal',
  'public_listing_has_no_personal_data',
  'not_an_lms',
  'not_a_payment_processor',
  'hours_and_days_are_provider_claim',
  'eligibility_is_shown_not_enforced',
] as const
