/**
 * Registr entit — každá věc v systému má UID a profil.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ UID JE IDENTITA, NÁZEV JE POPISEK                                   │
 * │                                                                     │
 * │ Všechno v systému je vedené pod UID: vazby, chat, dokumenty, práva, │
 * │ lhůty, audit. Název je jen to, co se zobrazuje — mění se, překládá  │
 * │ se, přejmenovává. **Nic se na název nikdy neváže.**                 │
 * │                                                                     │
 * │ Registr je INDEX, ne profil. Profil zůstává tam, kde je             │
 * │ (`orgs/{org}/persons/{uid}` a podobně) a registr říká jen: co to je,│
 * │ komu to patří, kde to leží a jak se to jmenuje.                     │
 * │                                                                     │
 * │ Proč to má být na jednom místě: UID se objevuje v chatu, v odkazech │
 * │ v textu, v auditu a v paměti Eli. Bez registru by každé z těch míst │
 * │ muselo vědět, ve které kolekci hledat — a při přidání nového druhu  │
 * │ entity by se opravovalo pět míst.                                   │
 * │                                                                     │
 * │ UID dostává i **dokument a sken**, ne jen věci s profilem. Prostor  │
 * │ UID je proto JEDEN pro všechno — kód nikdy neznamená dvě věci —     │
 * │ a registr odliší, co profil má (`hasProfile`).                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Tvar UID a proč je sedmimístný: `uid.ts`.
 */

import type { AuditFields, Id, IsoDate, IsoDateTime } from './common'

/* ------------------------------------------------------------------ */
/* Druhy entit                                                         */
/* ------------------------------------------------------------------ */

/**
 * Co je entita: věc, která má **profil** a k níž se vážou **služby**.
 *
 * Není entitou to, co je obsahem profilu — zápis, výdaj, zpráva, dokument.
 * Ty mají id, ale nemají profil ani vlastní práva; patří někomu jinému.
 */
export type EntityKind =
  /* --- živé, s profilem --- */
  | 'person'          // člověk obecně: pěstoun, rodič, zaměstnanec, příbuzný
  | 'child'           // dítě má vlastní profil i vlastní aplikaci (dok. 08)
  /* --- neživé, s profilem --- */
  | 'agreement'       // dohoda = karta rodiny; jmenuje se po pěstounovi
  | 'organization'    // doprovázející organizace
  | 'provider'        // pořadatel nebo poskytovatel z marketplace
  | 'authority'       // ORP, krajský úřad, soud
  | 'device'          // zařízení, na kterém se podepisuje (dok. 19)
  | 'vehicle'         // auto organizace — leasing a cestovní náhrady (dok. 07)
  | 'offer'           // kurz nebo nabídka služby
  /* --- předměty: UID mají, profil ne --- */
  | 'document'        // dokument včetně všech verzí
  | 'scan'            // vyfocený doklad s přepisem (dok. 22)
  | 'dictation'       // diktát s přepisem a souhrnem (dok. 20)
  | 'report'          // zpráva o průběhu PP
  | 'certificate'     // certifikát z kurzu
  | 'confirmation'    // potvrzení služby
  | 'order'           // objednávka z marketplace

/**
 * Které druhy mají profil, tedy vlastní obrazovku, karty a práva.
 *
 * Předmět profil nemá — patří tam, kde leží, a práva se řeší přes něj.
 * Kdyby měl dokument vlastní profil s vlastními právy, rozdvojilo by se
 * oprávnění od spisu, ve kterém je (dok. 25).
 */
export const KINDS_WITH_PROFILE: readonly EntityKind[] = [
  'person', 'child', 'agreement', 'organization',
  'provider', 'authority', 'device', 'vehicle', 'offer',
]

export function hasProfile(kind: EntityKind): boolean {
  return KINDS_WITH_PROFILE.includes(kind)
}

/* ------------------------------------------------------------------ */
/* Registr — entities/{uid}                                            */
/* ------------------------------------------------------------------ */

export interface EntityRecord extends AuditFields {
  uid: string
  kind: EntityKind

  /**
   * Komu entita patří. `null` u těch, které nepatří žádné organizaci —
   * pořadatel, úřad, veřejný profil. Podle tohohle pole se rozhoduje,
   * kdo registr smí přečíst, a nestojí to žádné další čtení.
   */
  organizationId: Id | null

  /** Kde leží profil. Registr sám žádný obsah nedrží. */
  profilePath: string

  /** Zobrazovaný název. U dohody se odvozuje — sekce níže. */
  displayName: string
  /** Druhý řádek v seznamech: „ROD-2026-001“, „9 let“, „Teplice“. */
  subtitle: string | null

  /** Které služby jsou u té entity zapnuté (`ENTITY_SERVICES` níže). */
  services: EntityService[]

  /** Má vlastní obrazovku a práva, nebo je to předmět ve spisu? */
  hasProfile: boolean

  /**
   * Stav. Entita se **nikdy nemaže** (dok. 10) — přechází do `archived`
   * a v odkazech zůstává čitelná.
   */
  status: 'active' | 'inactive' | 'archived'
  archivedOn: IsoDate | null
}

/* ------------------------------------------------------------------ */
/* Služby, které se na profil vážou                                    */
/* ------------------------------------------------------------------ */

export type EntityService =
  | 'chat'            // vlákna a zprávy (dok. 12)
  | 'documents'       // dokumenty a jejich verze
  | 'calendar'        // události
  | 'tasks'
  | 'obligations'     // lhůty (dok. 11)
  | 'education'       // vzdělávací období a hodiny
  | 'respite'         // respitní dny a nároky
  | 'expenses'
  | 'life_book'       // jen dítě (dok. 10)
  | 'timeline'
  | 'signatures'
  | 'marketplace'     // objednávky a nabídky
  | 'reports'
  | 'devices'

/**
 * Které služby má který druh entity. Tabulka je v kódu, protože z ní
 * plyne, **co se na profilu vůbec ukáže** — a nesmysly jako „respitní dny
 * u zaměstnance“ tím padnou samy.
 *
 * Není to oprávnění. Oprávnění řeší role a pravidla; tohle říká, co má
 * u té věci smysl.
 */
export const ENTITY_SERVICES: Record<EntityKind, readonly EntityService[]> = {
  person: [
    'chat', 'documents', 'calendar', 'tasks', 'obligations',
    'education', 'expenses', 'timeline', 'signatures', 'devices', 'marketplace',
  ],
  child: [
    'documents', 'calendar', 'obligations', 'respite', 'expenses',
    'life_book', 'timeline', 'signatures', 'marketplace',
  ],
  agreement: [
    'chat', 'documents', 'calendar', 'tasks', 'obligations',
    'education', 'respite', 'expenses', 'timeline', 'signatures', 'reports',
  ],
  organization: ['documents', 'obligations', 'reports', 'marketplace'],
  provider: ['documents', 'marketplace'],
  authority: ['documents'],
  device: ['signatures'],
  vehicle: ['documents', 'expenses'],
  offer: ['documents', 'marketplace'],
  // Předměty nemají karty — mají místo, kde leží.
  document: [],
  scan: [],
  dictation: [],
  report: [],
  certificate: [],
  confirmation: [],
  order: [],
}

/** Má u téhle entity ta služba smysl? */
export function hasService(kind: EntityKind, service: EntityService): boolean {
  return ENTITY_SERVICES[kind].includes(service)
}

/* ------------------------------------------------------------------ */
/* Profil                                                             */
/* ------------------------------------------------------------------ */

/**
 * Profil není nová kolekce — je to **způsob, jak se na entitu kouká**.
 * Skládá se ze tří věcí a všechny tři už v modelu jsou:
 *
 *   1. hlavička  — identita z profilového dokumentu (jméno, rod, stav);
 *   2. karty     — služby z `ENTITY_SERVICES`, každá se svými záznamy;
 *   3. práva     — co smí dívající se člověk vidět a dělat (pravidla).
 *
 * Tenhle typ popisuje jen to první a druhé, aby se profil dal sestavit
 * jednotně pro pěstouna, dítě i dohodu a nemusel se psát třikrát.
 */
export interface ProfileView {
  uid: string
  kind: EntityKind
  displayName: string
  subtitle: string | null
  /** Cesta na profilový dokument — odtud se čte hlavička. */
  profilePath: string
  /** Karty, které se mají vykreslit, v tomhle pořadí. */
  cards: EntityService[]
  /** Vazby na jiné entity: „pěstoun v dohodě“, „dítě v péči“. */
  relations: Array<{
    uid: string
    kind: EntityKind
    displayName: string
    relation: string
  }>
}

/* ------------------------------------------------------------------ */
/* Název dohody                                                        */
/* ------------------------------------------------------------------ */

/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ NÁZEV DOHODY SE ODVOZUJE Z PŘÍJMENÍ PĚSTOUNA                        │
 * │                                                                     │
 * │ Jeden pěstoun          → „Novákovi“ (z jeho příjmení)               │
 * │ Manželé, stejné příjm. → „Novákovi“                                 │
 * │ Dva, různá příjmení    → systém vybere JEDNO a je vidět které       │
 * │                                                                     │
 * │ Klíčová osoba může přejmenovat. Přejmenování nemění NIC jiného —    │
 * │ všechno je vedené pod UID, ne pod názvem.                           │
 * └─────────────────────────────────────────────────────────────────────┘
 */
export interface AgreementNaming {
  /** Co se zobrazuje. */
  displayName: string

  /**
   * `derived` = spočítané z příjmení, `renamed` = přepsané člověkem.
   *
   * Rozdíl je podstatný: **odvozený název se sám aktualizuje**, když
   * pěstounka změní příjmení (svatba, rozvod), zatímco přejmenovaný
   * zůstane. Kdyby se aktualizoval i ten, přepsalo by to práci Klíčové
   * osoby a nikdo by nevěděl proč.
   */
  source: 'derived' | 'renamed'

  /** Z čího příjmení se to vzalo — ať to není záhada u dvou pěstounů. */
  derivedFromPersonUid: string | null

  renamedByPersonId: Id | null
  renamedAt: IsoDateTime | null
  /** Předchozí názvy. Nic se neztrácí (dok. 10) a hledání podle nich funguje. */
  previousNames: Array<{ name: string; until: IsoDateTime }>
}

/**
 * Označení rodiny v množném čísle: „Novákovi“.
 *
 * Odvozuje se ze ŽENSKÉHO tvaru příjmení, ne z mužského — a to je ten trik,
 * na kterém to stojí. Čeština u příjmení na -ek, -ec a -el vypouští
 * v ohnutých tvarech -e-: Blažek → **Blažkovi**, Jelínek → **Jelínkovi**,
 * Marek → **Markovi**, Němec → **Němcovi**. Z mužského tvaru by vyšlo
 * „Blažekovi“, což by v systému, který generuje dokumenty pro soud,
 * vypadalo nedbale.
 *
 * Ženský tvar ten správný základ už obsahuje (Blažková → Blažk-), takže
 * stačí odebrat koncovku a přidat -ovi. U přídavných jmen (Veselá → Veselí)
 * se přidává -í.
 *
 * Proto je v `Person` `grammaticalGender` (dok. 07) — bez ženského tvaru
 * v datech by tohle nešlo spočítat.
 */
export function familyPlural(femaleSurname: string): string {
  if (femaleSurname.endsWith('ová')) return `${femaleSurname.slice(0, -3)}ovi`
  if (femaleSurname.endsWith('á')) return `${femaleSurname.slice(0, -1)}í`
  return `${femaleSurname}ovi`
}

/**
 * Odvození názvu. `pickIndex` je deterministické „náhodné“ číslo, které
 * dodá volající — u dvou různých příjmení se z něj vybere jedno.
 *
 * Deterministické proto, aby dvě spuštění nad stejnými daty dala stejný
 * název; kdyby to bylo skutečně náhodné, dohoda by se po přepočtu
 * přejmenovala sama a působilo by to jako chyba.
 */
export function deriveAgreementName(
  carers: ReadonlyArray<{ uid: string; familyName: string; familyLabel: string }>,
  pickIndex = 0,
): Pick<AgreementNaming, 'displayName' | 'source' | 'derivedFromPersonUid'> {
  if (carers.length === 0) {
    return { displayName: 'Bez pečující osoby', source: 'derived', derivedFromPersonUid: null }
  }

  const distinct = [...new Set(carers.map((c) => c.familyName))]
  const chosen = distinct.length === 1
    ? carers[0]!
    : carers[pickIndex % carers.length]!

  return {
    displayName: chosen.familyLabel,
    source: 'derived',
    derivedFromPersonUid: chosen.uid,
  }
}

/**
 * Přejmenování. Původní název se odkládá do historie a `source` se překlopí
 * na `renamed`, takže ho už žádný přepočet nepřepíše.
 */
export function renameAgreement(
  naming: AgreementNaming,
  newName: string,
  byPersonId: Id,
  at: IsoDateTime,
): AgreementNaming {
  return {
    displayName: newName,
    source: 'renamed',
    derivedFromPersonUid: naming.derivedFromPersonUid,
    renamedByPersonId: byPersonId,
    renamedAt: at,
    previousNames: [...naming.previousNames, { name: naming.displayName, until: at }],
  }
}

/**
 * Pravidlo, které z toho plyne a je snadné ho porušit:
 *
 * **Nic se nesmí vyhledávat, řadit ani párovat podle názvu.** Název je
 * popisek, který si kdokoli kdykoli přepíše. Spisová značka
 * (`CaseFile.reference`) a UID jsou to, co drží.
 *
 * Konkrétně: odkaz v textu (`mention`, richtext.ts) ukládá UID a název
 * dokresluje při zobrazení; kdyby ukládal název, po přejmenování by
 * v loňské zprávě zůstalo staré jméno bez vazby.
 */
export const NEVER_KEY_ON_DISPLAY_NAME = true
