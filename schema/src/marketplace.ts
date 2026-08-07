/**
 * Marketplace vzdělávání pro pěstouny.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ DOPORUČENÍ: NESTAVĚT E-SHOP. STAVĚT KATALOG A OBJEDNÁVKU.           │
 * │                                                                     │
 * │ Peníze přes nás v první verzi netečou. Pořadatel vystaví fakturu,   │
 * │ organizace ji zaplatí převodem. Čtyři důvody:                       │
 * │                                                                     │
 * │  1. Ve chvíli, kdy bychom platbu mezi dvěma cizími stranami         │
 * │     zprostředkovali, jsme platební zprostředkovatel se vším, co     │
 * │     k tomu patří. Pro trh o velikosti české republiky je to         │
 * │     nepoměrná složitost.                                            │
 * │  2. České neziskovky platí fakturou převodem, ne kartou (dok. 19).  │
 * │  3. Vzdělávání se hradí ze státního příspěvku a při kontrole ÚP se  │
 * │     dokládá **fakturou od pořadatele organizaci**. Přesně ten       │
 * │     doklad tak vzniká sám od sebe.                                  │
 * │  4. Kurz běží na cizí platformě. Nejsme LMS a nemá smysl jím být.   │
 * │                                                                     │
 * │ Model je ale postavený tak, aby karta šla doplnit BEZ MIGRACE:      │
 * │ `Order.payment.method` má od začátku i hodnotu `'card'`.            │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Co v systému je: profil pořadatele, sklad kurzů, veřejná nabídka,
 * objednávka, přístupy, faktura a **certifikát**. Co v systému není:
 * samotný kurz.
 */

import type { AuditFields, Id, IsoDate, IsoDateTime, Money } from './common'

/* ------------------------------------------------------------------ */
/* Pořadatel — providers/{providerId}                                  */
/* ------------------------------------------------------------------ */

/**
 * Vlastní kořenová kolekce, ne podkolekce organizace: pořadatel je
 * samostatný subjekt, prodává napříč organizacemi a jeho profil je
 * **veřejný i mimo systém**.
 */
export interface CourseProvider extends AuditFields {
  id: Id
  slug: string                      // do veřejné adresy: /kurzy/{slug}
  legalName: string
  displayName: string
  ico: string | null
  dic: string | null

  contact: {
    email: string
    phone: string | null
    web: string | null
    address: { street: string; city: string; zip: string; country: string } | null
  }

  about: string
  logoDocumentId: Id | null

  /**
   * Ověření superadminem. Pořadatel vystavuje certifikát, kterým se plní
   * ZÁKONNÁ povinnost pěstouna (§ 47a odst. 2 písm. f) — takže je rozdíl
   * mezi kýmkoli, kdo se zaregistruje, a subjektem, u kterého někdo ověřil,
   * že existuje.
   *
   * Neověřený pořadatel může listovat, ale ve výpisu je to vidět. Blokovat
   * ho není potřeba — rozhodnutí patří organizaci (dok. 16).
   */
  verification: {
    status: 'unverified' | 'verified' | 'rejected'
    verifiedOn: IsoDate | null
    verifiedByPersonId: Id | null
    note: string | null
  }

  /** Akreditace MPSV, pokud ji pořadatel má — u vzdělávání pěstounů se to řeší. */
  accreditation: {
    number: string | null
    validUntil: IsoDate | null
    documentId: Id | null
  } | null

  billing: { bankAccount: string | null; invoiceNote: string | null }
  status: 'active' | 'suspended' | 'closed'
}

/** Kdo za pořadatele pracuje. Do systému se přihlašuje jako každý jiný (dok. 19). */
export interface ProviderMembership extends AuditFields {
  providerId: Id
  personId: Id
  role: 'provider_admin' | 'provider_staff'
  startedOn: IsoDate
  endedOn: IsoDate | null
}

/* ------------------------------------------------------------------ */
/* Kurz — providers/{providerId}/courses/{courseId}                    */
/* ------------------------------------------------------------------ */

export interface Course extends AuditFields {
  id: Id
  providerId: Id
  slug: string
  title: string
  perex: string
  description: string

  /**
   * HODINY JSOU NOSNÉ POLE CELÉHO MARKETPLACE.
   *
   * Certifikát z kurzu plní zákonnou povinnost 18 nebo 24 hodin za dvanáct
   * měsíců (§ 47a odst. 2 písm. f). Když pořadatel nadsadí hodiny, při
   * inspekci to odnese organizace, ne on. Proto se hodiny deklarují
   * u kurzu, potvrzují na certifikátu a v záznamu je vidět, že přišly
   * z certifikátu pořadatele, ne z klávesnice Klíčové osoby.
   */
  hours: number

  /**
   * Forma se mapuje na číselník `education.form` (codebooks.ts) a ten
   * na chování: e-learning má v sadě pravidel vlastní limit (dok. 02).
   * Kdyby forma byla jen text, limit by se nedal hlídat.
   */
  formCode: string
  topicCodes: string[]              // číselník `education.topic`

  price: Money
  vatIncluded: boolean
  capacity: number | null

  language: string
  /** Vhodné pro: pěstoun, osoba v evidenci, poručník, zaměstnanec organizace. */
  audience: string[]

  /** Kde kurz probíhá. Systém to neřídí, jen o tom ví. */
  delivery: {
    kind: 'self_paced' | 'scheduled_online' | 'in_person' | 'hybrid'
    platformNote: string | null     // „Zoom“, „vlastní LMS“, „Praha, Karlín“
    accessInstructions: string | null
  }

  status: 'draft' | 'listed' | 'unlisted' | 'archived'
}

/** Konkrétní běh kurzu s termínem. U `self_paced` nevzniká. */
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
/* Veřejná nabídka — listings/{listingId}                              */
/* ------------------------------------------------------------------ */

/**
 * Kořenová kolekce **čitelná bez přihlášení**, aby si kurz mohl koupit
 * i pěstoun nebo organizace mimo systém a aby se nabídka dala najít
 * na internetu.
 *
 * Proto v ní **nesmí být nic osobního**. Je to výkladní skříň: co se prodává
 * a za kolik. Objednávky, účastníci a certifikáty žijí jinde a jsou
 * chráněné — stejný princip jako u ověřování dokumentů (dok. 21).
 */
export interface CourseListing {
  id: Id
  courseId: Id
  providerId: Id
  providerSlug: string
  providerDisplayName: string
  providerVerified: boolean

  /** Denormalizovaná kopie kurzu — veřejný výpis je jeden dotaz. */
  title: string
  perex: string
  hours: number
  formCode: string
  topicCodes: string[]
  price: Money
  language: string
  nextSessionAt: IsoDateTime | null

  visibility: 'public' | 'system_only'
  publishedAt: IsoDateTime
  unlistedAt: IsoDateTime | null
  /** Řazení ve výpisu; počítá se z objednávek, ne z hodnocení. */
  popularity: number
}

/* ------------------------------------------------------------------ */
/* Objednávka — orders/{orderId}                                       */
/* ------------------------------------------------------------------ */

/**
 * Objednávku zakládá **organizace** (Klíčová osoba nebo vedení), protože
 * ona kurz platí ze státního příspěvku. Pěstoun si kurz může **vybrat
 * a požádat o něj** — z toho vznikne objednávka ke schválení.
 *
 * Druhá cesta je host: pěstoun nebo organizace **mimo systém**. Tam
 * neznáme nikoho, takže se vede jen to nejnutnější k fakturaci
 * a k vystavení certifikátu.
 */
export interface Order extends AuditFields {
  id: Id
  providerId: Id
  courseId: Id
  sessionId: Id | null

  buyer: OrderBuyer
  /** Kolik míst a pro koho. U hosta jen jméno a e-mail. */
  seats: OrderSeat[]
  seatCount: number

  unitPrice: Money
  totalPrice: Money

  status: OrderStatus
  requestedByPersonId: Id | null    // pěstoun, když si o kurz řekl
  approvedByPersonId: Id | null     // vedení nebo Klíčová osoba
  approvedAt: IsoDateTime | null
  rejectedReason: string | null

  payment: OrderPayment
  /** Faktura od pořadatele. V systému jako dokument, ne jako částka. */
  invoiceDocumentId: Id | null
  /** Vazba na výdaj ve spisu, aby to bylo v čerpání SPVPP (dok. 07). */
  expenseEntryIds: Id[]

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
      /** Minimum k fakturaci a certifikátu. Nic víc o hostovi nevedeme. */
      displayName: string
      email: string
      ico: string | null
      billingAddress: string
    }

export interface OrderSeat {
  /** U objednávky organizace: osoba v systému. U hosta: null. */
  personId: Id | null
  displayName: string
  email: string
  /** Kterému vzdělávacímu období se hodiny připíšou (agreements.ts). */
  educationPeriodId: Id | null
}

export type OrderStatus =
  | 'requested'      // pěstoun požádal, čeká na schválení
  | 'approved'
  | 'rejected'
  | 'confirmed'      // pořadatel potvrdil místo
  | 'invoiced'
  | 'paid'
  | 'completed'
  | 'cancelled'

export interface OrderPayment {
  /**
   * `'invoice'` je jediná cesta v první verzi. `'card'` je tady od začátku,
   * aby se dal doplnit bez migrace objednávek — ne proto, že už funguje.
   */
  method: 'invoice' | 'card'
  /** Peníze tečou přímo mezi pořadatelem a kupujícím, ne přes nás. */
  flowsThroughPlatform: false
  paidOn: IsoDate | null
  variableSymbol: string | null
  note: string | null
}

/* ------------------------------------------------------------------ */
/* Přístup a certifikát                                                */
/* ------------------------------------------------------------------ */

/**
 * Přístup ke kurzu. Kurz běží jinde, takže tady je jen to, co pořadatel
 * sdělil — odkaz, kód, pozvánka.
 *
 * Pořadatel vidí ze systému **jméno a e-mail účastníka a nic víc**. Nemá
 * přístup ke spisu, k dítěti ani k organizaci nad rámec fakturačních údajů.
 * Předání jména a e-mailu je nutné k poskytnutí služby, ale zůstává to
 * předání osobních údajů třetí straně — proto je evidované.
 */
export interface Enrolment extends AuditFields {
  id: Id
  orderId: Id
  courseId: Id
  providerId: Id

  personId: Id | null              // null u hosta
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

/**
 * Certifikát vystavuje **pořadatel v systému** a tím potvrzuje absolvování.
 *
 * Tohle je hlavní přínos celého marketplace: dnes Klíčová osoba opisuje
 * hodiny z papírového certifikátu a při inspekci se dokládá sken. Tady
 * hodiny **potvrdil ten, kdo kurz vedl**, a je to v systému dohledatelné.
 * Je to lepší důkaz než dnešní stav, ne horší.
 */
export interface CourseCertificate extends AuditFields {
  id: Id
  enrolmentId: Id
  orderId: Id
  courseId: Id
  providerId: Id

  participantName: string
  participantPersonId: Id | null
  courseTitle: string
  /** Skutečně absolvované hodiny. Nemusí se rovnat `Course.hours`. */
  hours: number
  formCode: string
  completedOn: IsoDate

  issuedByPersonId: Id
  issuedAt: IsoDateTime
  accreditationNumber: string | null

  /** PDF certifikátu; vystaví se ze šablony pořadatele (branding.ts). */
  documentId: Id | null
  /** Token ověřovací stránky — QR na certifikátu (dok. 21). */
  verificationToken: string | null

  /**
   * Záznam o vzdělávání, který z certifikátu vznikl ve spisu pěstouna.
   * Vytvoří se **automaticky s možností vrátit zpět** (charta, dok. 16) —
   * je to deterministické přenesení potvrzených hodin, ne rozhodnutí.
   */
  educationRecordId: Id | null

  /** Zrušení certifikátu pořadatelem. Nemaže se, mění se stav (dok. 10). */
  revokedAt: IsoDateTime | null
  revokedReason: string | null
}

/* ------------------------------------------------------------------ */
/* Obchodní podmínky marketplace                                       */
/* ------------------------------------------------------------------ */

/**
 * `platform/registry/marketplaceTerms/{id}` — datovaný záznam.
 *
 * Jestli si platforma bere provizi a kolik, **rozhoduje vlastník produktu**,
 * ne kód (poučení z dok. 21). Tady je jen místo, kam se to zapíše.
 */
export interface MarketplaceTerms {
  id: Id
  effectiveFrom: IsoDate
  /** Provize z ceny kurzu. `null` = neúčtuje se. */
  commissionPct: number | null
  /** Poplatek za listování kurzu. `null` = zdarma. */
  listingFee: Money | null
  /** Kdo smí listovat: kdokoli, nebo jen ověřený pořadatel. */
  listingRequiresVerification: boolean
  /** Text podmínek, který pořadatel odsouhlasí při registraci. */
  termsDocumentId: Id | null
}

/* ------------------------------------------------------------------ */
/* Hranice, které marketplace nesmí překročit                          */
/* ------------------------------------------------------------------ */

/**
 * 1. **Žádná data o dětech.** V marketplace nefiguruje dítě ani spis.
 *    Objednávka se váže na pěstouna a na jeho vzdělávací období, ne na spis.
 *
 * 2. **Pořadatel nevidí do organizace.** Jméno, e-mail, fakturační údaje.
 *    Nic o rodině, nic o dohodě, nic o dítěti.
 *
 * 3. **Veřejná část neobsahuje osobní údaje.** `listings/**` je čitelné
 *    bez přihlášení, takže tam smí být jen nabídka.
 *
 * 4. **Systém není LMS a není platební brána.** Kurz běží jinde, peníze
 *    tečou mimo nás.
 *
 * 5. **Hodiny jsou tvrzení pořadatele.** Systém je přenese do spisu, ale
 *    neověřuje je — a je vidět, odkud přišly.
 */
export const MARKETPLACE_BOUNDARIES = [
  'no_child_data',
  'provider_sees_minimum',
  'public_listing_has_no_personal_data',
  'not_an_lms',
  'not_a_payment_processor',
  'hours_are_provider_claim',
] as const
