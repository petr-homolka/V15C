/**
 * České jméno, adresa, kontakt — v podobě, kterou testovací data potřebují.
 *
 * Dvě věci, na kterých tady záleží nejvíc:
 *
 *   1. PŘÍJMENÍ MÁ MUŽSKÝ A ŽENSKÝ TVAR. Novák / Nováková. Kdyby generátor
 *      dával ženám mužský tvar, testovaly by se obrazovky na datech, která
 *      v češtině neexistují — a knihovna vět se skloňováním (dok. 07) by se
 *      neměla na čem ověřit.
 *
 *   2. PĚSTOUNI A DĚTI MAJÍ OBVYKLE JINÁ PŘÍJMENÍ. Dítě v pěstounské péči si
 *      nechává své. Kdyby všichni ve spisu byli „Novákovi“, neodhalilo by se,
 *      kde v UI chybí rozlišení osob.
 */

import { Rng } from './rng'

/* ------------------------------------------------------------------ */
/* Jména                                                               */
/* ------------------------------------------------------------------ */

const MALE_GIVEN = [
  'Jan', 'Petr', 'Tomáš', 'Martin', 'Jakub', 'Michal', 'Pavel', 'Lukáš',
  'David', 'Ondřej', 'Filip', 'Marek', 'Vojtěch', 'Adam', 'Josef', 'Radek',
  'Zdeněk', 'Karel', 'Miroslav', 'Štěpán', 'Matyáš', 'Dominik',
] as const

const FEMALE_GIVEN = [
  'Jana', 'Eva', 'Hana', 'Lenka', 'Kateřina', 'Lucie', 'Veronika', 'Martina',
  'Tereza', 'Michaela', 'Petra', 'Alena', 'Marie', 'Klára', 'Barbora',
  'Zuzana', 'Iveta', 'Radka', 'Simona', 'Nikola', 'Adéla', 'Vendula',
] as const

/** [mužský tvar, ženský tvar] */
const SURNAMES: ReadonlyArray<readonly [string, string]> = [
  ['Novák', 'Nováková'], ['Svoboda', 'Svobodová'], ['Novotný', 'Novotná'],
  ['Dvořák', 'Dvořáková'], ['Černý', 'Černá'], ['Procházka', 'Procházková'],
  ['Kučera', 'Kučerová'], ['Veselý', 'Veselá'], ['Horák', 'Horáková'],
  ['Němec', 'Němcová'], ['Marek', 'Marková'], ['Pospíšil', 'Pospíšilová'],
  ['Pokorný', 'Pokorná'], ['Hájek', 'Hájková'], ['Jelínek', 'Jelínková'],
  ['Král', 'Králová'], ['Růžička', 'Růžičková'], ['Beneš', 'Benešová'],
  ['Fiala', 'Fialová'], ['Sedláček', 'Sedláčková'], ['Doležal', 'Doležalová'],
  ['Zeman', 'Zemanová'], ['Kolář', 'Kolářová'], ['Navrátil', 'Navrátilová'],
  ['Čermák', 'Čermáková'], ['Vaněk', 'Vaňková'], ['Urban', 'Urbanová'],
  ['Blažek', 'Blažková'], ['Kříž', 'Křížová'], ['Kovář', 'Kovářová'],
  ['Šimek', 'Šimková'], ['Bartoš', 'Bartošová'], ['Sýkora', 'Sýkorová'],
  ['Malý', 'Malá'], ['Kadlec', 'Kadlecová'], ['Vlček', 'Vlčková'],
]

export type Gender = 'm' | 'f'

export interface GeneratedName {
  givenName: string
  familyName: string
  displayName: string
  grammaticalGender: Gender
}

/** Když je zadaný `surnameIndex`, drží rodinu u stejného příjmení. */
export function makeName(rng: Rng, gender: Gender, surnameIndex?: number): GeneratedName {
  const pair = surnameIndex === undefined
    ? rng.pick(SURNAMES)
    : SURNAMES[surnameIndex % SURNAMES.length]!
  const givenName = gender === 'm' ? rng.pick(MALE_GIVEN) : rng.pick(FEMALE_GIVEN)
  const familyName = gender === 'm' ? pair[0] : pair[1]
  return {
    givenName,
    familyName,
    displayName: `${givenName} ${familyName}`,
    grammaticalGender: gender,
  }
}

/** Náhodný index příjmení — pro dítě, které má jiné než pěstoun. */
export function pickSurnameIndex(rng: Rng, avoid: number[] = []): number {
  for (let attempt = 0; attempt < 20; attempt++) {
    const i = rng.int(0, SURNAMES.length - 1)
    if (!avoid.includes(i)) return i
  }
  return rng.int(0, SURNAMES.length - 1)
}

/** Rodné jméno v množném čísle pro označení rodiny: „Novákovi“. */
export function familyLabel(surnameIndex: number): string {
  const male = SURNAMES[surnameIndex % SURNAMES.length]![0]
  if (male.endsWith('ý')) return `${male.slice(0, -1)}í`      // Veselý → Veselí
  if (male.endsWith('a')) return `${male.slice(0, -1)}ovi`    // Fiala → Fialovi
  return `${male}ovi`                                        // Novák → Novákovi
}

/* ------------------------------------------------------------------ */
/* Adresy                                                             */
/* ------------------------------------------------------------------ */

export interface Town { city: string; zip: string; orpCode: string }

/**
 * Obce ve dvou krajích, aby šlo testovat, že ORP pěstouna a ORP trvalého
 * pobytu dítěte mohou být JINÉ úřady — na tom stojí tři adresáti zprávy
 * podle § 47b odst. 5 (dok. 05).
 */
const TOWNS: readonly Town[] = [
  { city: 'Teplice', zip: '415 01', orpCode: 'ORP-TEPLICE' },
  { city: 'Bílina', zip: '418 01', orpCode: 'ORP-BILINA' },
  { city: 'Ledvice', zip: '417 72', orpCode: 'ORP-BILINA' },
  { city: 'Duchcov', zip: '419 01', orpCode: 'ORP-TEPLICE' },
  { city: 'Krupka', zip: '417 42', orpCode: 'ORP-TEPLICE' },
  { city: 'Litoměřice', zip: '412 01', orpCode: 'ORP-LITOMERICE' },
  { city: 'Lovosice', zip: '410 02', orpCode: 'ORP-LOVOSICE' },
  { city: 'Roudnice nad Labem', zip: '413 01', orpCode: 'ORP-ROUDNICE' },
  { city: 'Kladno', zip: '272 01', orpCode: 'ORP-KLADNO' },
  { city: 'Slaný', zip: '274 01', orpCode: 'ORP-SLANY' },
  { city: 'Beroun', zip: '266 01', orpCode: 'ORP-BEROUN' },
  { city: 'Rakovník', zip: '269 01', orpCode: 'ORP-RAKOVNIK' },
]

const STREETS = [
  'Nádražní', 'Školní', 'Zahradní', 'Lipová', 'Krátká', 'Polní', 'Havlíčkova',
  'Masarykova', 'Sadová', 'Husova', 'Palackého', 'U Parku', 'Na Vyhlídce',
  'Dlouhá', 'Tovární', 'Bezručova', 'Komenského', 'Sokolská',
] as const

export interface Address {
  street: string
  city: string
  zip: string
  country: 'CZ'
  orpCode: string
}

export function makeAddress(rng: Rng, town?: Town): Address {
  const t = town ?? rng.pick(TOWNS)
  return {
    street: `${rng.pick(STREETS)} ${rng.int(1, 320)}`,
    city: t.city,
    zip: t.zip,
    country: 'CZ',
    orpCode: t.orpCode,
  }
}

export function pickTown(rng: Rng): Town {
  return rng.pick(TOWNS)
}

/** Obec v jiném ORP než zadaná — kvůli různým adresátům zprávy. */
export function pickTownInOtherOrp(rng: Rng, orpCode: string): Town {
  const others = TOWNS.filter((t) => t.orpCode !== orpCode)
  return rng.pick(others)
}

export const ORP_LIST = [
  { code: 'ORP-TEPLICE', name: 'Městský úřad Teplice, OSPOD' },
  { code: 'ORP-BILINA', name: 'Městský úřad Bílina, OSPOD' },
  { code: 'ORP-LITOMERICE', name: 'Městský úřad Litoměřice, OSPOD' },
  { code: 'ORP-LOVOSICE', name: 'Městský úřad Lovosice, OSPOD' },
  { code: 'ORP-ROUDNICE', name: 'Městský úřad Roudnice nad Labem, OSPOD' },
  { code: 'ORP-KLADNO', name: 'Magistrát města Kladna, OSPOD' },
  { code: 'ORP-SLANY', name: 'Městský úřad Slaný, OSPOD' },
  { code: 'ORP-BEROUN', name: 'Městský úřad Beroun, OSPOD' },
  { code: 'ORP-RAKOVNIK', name: 'Městský úřad Rakovník, OSPOD' },
] as const

export const KU_LIST = [
  { code: 'KU-ULK', name: 'Krajský úřad Ústeckého kraje' },
  { code: 'KU-STC', name: 'Krajský úřad Středočeského kraje' },
] as const

/* ------------------------------------------------------------------ */
/* Kontakty — musí být na první pohled vymyšlené                       */
/* ------------------------------------------------------------------ */

/**
 * Domény `.test` a `.example` jsou rezervované a nikdy se nerozřeší
 * (RFC 2606, RFC 6761), takže se nemůže stát, že by testovací e-mail
 * odešel skutečnému člověku.
 */
const EMAIL_DOMAINS = ['priklad.test', 'ukazka.test', 'example.test'] as const

const DIACRITICS: Record<string, string> = {
  á: 'a', č: 'c', ď: 'd', é: 'e', ě: 'e', í: 'i', ň: 'n', ó: 'o', ř: 'r',
  š: 's', ť: 't', ú: 'u', ů: 'u', ý: 'y', ž: 'z',
}

export function slug(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => DIACRITICS[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '')
}

export function makeEmail(rng: Rng, name: GeneratedName): string {
  return `${slug(name.givenName)}.${slug(name.familyName)}@${rng.pick(EMAIL_DOMAINS)}`
}

/**
 * Prostřední blok je vždy `000`, takže číslo je tvarem správné (a UI se na něm
 * dá otestovat), ale žádnému skutečnému člověku nepatří.
 */
export function makePhone(rng: Rng): string {
  const prefix = rng.pick(['601', '602', '603', '731', '732', '777'] as const)
  return `+420 ${prefix} 000 ${String(rng.int(100, 999))}`
}

/**
 * Rodné číslo ve správném tvaru, ale s nemožným kontrolním zbytkem.
 * Nesmí projít validací jako platné — testovací data nemají obsahovat
 * použitelné identifikátory.
 */
export function makeFakeNationalId(rng: Rng, birth: Date, gender: Gender): string {
  const yy = String(birth.getFullYear() % 100).padStart(2, '0')
  const mm = String(birth.getMonth() + 1 + (gender === 'f' ? 50 : 0)).padStart(2, '0')
  const dd = String(birth.getDate()).padStart(2, '0')
  return `${yy}${mm}${dd}/00${rng.int(1, 9)}`   // '00X' — nikdy platné
}

export function makeBankAccount(rng: Rng): string {
  return `${rng.int(100000000, 999999999)}/0800`
}
