/**
 * Osoby, děti, zařízení, zájemci.
 *
 * Kontaktní údaje NEJSOU polem osoby — jsou v podřízeném dokumentu
 * `persons/{id}/private/contact`. Firestore neumí skrýt pole, takže
 * oddělení je struktura, ne volba (dok. 04, README sekce 1.3).
 */

import type {
  AuditFields, GrammaticalGender, Id, IsoDate, IsoDateTime, Revocable,
} from './common'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/persons/{personId} — METADATA                          */
/* ------------------------------------------------------------------ */

export interface Person extends AuditFields {
  id: Id
  /** Pouze uid z Firebase Auth. V Auth samotném není nikdy nic o rodinách (dok. 19). */
  authUid: string | null

  givenName: string
  familyName: string
  displayName: string              // denormalizované, aby seznam byl jeden dotaz
  /** Slouží jen ke skloňování, odděleno od administrativního pohlaví (dok. 07). */
  grammaticalGender: GrammaticalGender

  birthDate: IsoDate | null
  /** Rodné číslo je v private/contact, ne tady. */

  roles: PersonRole[]
  lifecycle: 'active' | 'inactive' | 'archived'
}

export type PersonRole =
  | 'caregiver'          // osoba pečující nebo osoba v evidenci
  | 'spouse'             // manžel/partner pečující osoby — § 965 odst. 3 OZ
  | 'household_member'
  | 'care_provider'      // poskytovatel zajištěné péče (hlídání)
  | 'birth_parent'
  | 'relative'
  | 'staff'
  | 'authority_officer'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/persons/{personId}/private/contact                     */
/* ------------------------------------------------------------------ */

/**
 * Oddělený dokument. Adresa pěstouna se nikdy nezobrazuje v aplikaci
 * příbuzných (dok. 09) — proto nesmí být součástí osoby.
 */
export interface PersonContact extends AuditFields {
  nationalId: string | null        // rodné číslo
  phone: string | null
  email: string | null
  address: {
    street: string; city: string; zip: string; country: string
  } | null
  /** Adresa doručovací, když je jiná. */
  mailingAddress: PersonContact['address']
  bankAccount: string | null
  note: string | null
}

/* ------------------------------------------------------------------ */
/* Profil pečující osoby                                               */
/* ------------------------------------------------------------------ */

/**
 * Doplněk k osobě, když je pečující. Není to zvláštní kolekce — pečující
 * osoba je pořád osoba, jen s dalšími poli.
 * Ukládá se jako `persons/{id}/private/carer` (obsahuje citlivé posouzení).
 */
export interface CarerProfile extends AuditFields {
  /** § 2a písm. b) vs c) — jiná výše SPVPP, jiný režim zániku (dok. 18). */
  carerKind: 'pecujici' | 'v_evidenci'

  /** Sedm hodnot podle § 2a písm. c) a b) — dok. 18 sekce 3. */
  custodyBasisHistory: Array<{
    basis: CustodyBasis
    from: IsoDate
    to: IsoDate | null
    documentId: Id | null
  }>

  /** Jen u osoby v evidenci: dohoda visí na zápisu, ne na dítěti (§ 47c odst. 1). */
  registryEntry: {
    krajskyUradId: Id
    enrolledFrom: IsoDate
    enrolledUntil: IsoDate | null
  } | null

  /** Zprostředkovaná péče = 24 h vzdělávání; PPPD je vždy zprostředkovaná. */
  mediatedCare: boolean

  spouseOfPersonId: Id | null
  /**
   * Test podle OZ je „rodinná domácnost“, ne „společná“ (dok. 05).
   * Manžel či registrovaný partner v rodinné domácnosti se podílí na péči
   * ze zákona, takže mu nelze proplatit hlídání jako službu.
   */
  livesInFamilyHouseholdWithChild: boolean
}

export type CustodyBasis =
  | 'foster'             // § 2a c) 1 — pěstounská péče
  | 'foster_temporary'   // § 2a c) 1 + b) — PPPD
  | 'pre_foster'         // § 2a c) 1 — předpěstounská
  | 'care_953'           // § 2a c) 1 — péče jiné osoby, § 953 OZ
  | 'pending_ex_officio' // § 2a c) 2 — řízení z moci úřední
  | 'pending_on_motion'  // § 2a c) 3 — na návrh
  | 'guardian_caring'    // § 2a c) 4 — poručník s osobní péčí

/** Vztah poskytovatele zajištěné péče — blokuje úplatu u manžela (dok. 05). */
export interface CareProviderProfile {
  relationToCaregiver:
    | 'spouse' | 'registered_partner' | 'other_household_member'
    | 'relative' | 'close_person' | 'employee' | 'external'
  livesInFamilyHouseholdWithChild: boolean
  /** ZKP — zákonná kvalifikovaná péče, dle směrnice zdarma (dok. 05). */
  isQualifiedProvider: boolean
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/children/{childId}                                     */
/* ------------------------------------------------------------------ */

export interface Child extends AuditFields {
  id: Id
  authUid: string | null           // dětská aplikace od 12 let (dok. 08)

  givenName: string
  familyName: string
  displayName: string
  grammaticalGender: GrammaticalGender
  birthDate: IsoDate

  /** Adresát zprávy č. 3 je ORP trvalého pobytu DÍTĚTE — jiný úřad (dok. 05). */
  residenceOrpId: Id | null

  school: string | null
  dependencyLevel: 'none' | 'I' | 'II' | 'III' | 'IV' | null

  lifecycle: 'active' | 'archived'
  /** Zletilost sama nic nemění; mění to ukončení péče (dok. 18). */
  careEndedOn: IsoDate | null
  careEndDocumentId: Id | null
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/persons/{personId}/devices/{deviceId}                  */
/* ------------------------------------------------------------------ */

/**
 * Chybějící díl podpisu: podpis stojí na biometrice zařízení (dok. 08),
 * takže ztracený telefon musí mít odpověď (dok. 19 sekce 5).
 */
export interface Device extends AuditFields, Revocable {
  id: Id
  label: string                    // „Petrův iPhone“ — pojmenuje si člověk
  platform: 'ios' | 'android' | 'web'
  lastSeenAt: IsoDateTime | null
  /** Veřejná část WebAuthn. Podpisy zůstávají platné i po odebrání zařízení. */
  webauthnCredentialId: string | null
  fcmToken: string | null
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/inquiries/{inquiryId}                                  */
/* ------------------------------------------------------------------ */

/**
 * Zájemce. Existuje PŘED spisem — systém dosud nevěděl o nikom, kdo se
 * klientem nestal, a roční výkaz se přitom ptá právě na odmítnuté (dok. 13).
 *
 * Odmítnutí, které se nezapsalo, když se stalo, se do výkazu nedostane nikdy.
 */
export interface ServiceInquiry extends AuditFields {
  id: Id
  receivedOn: IsoDate
  channel: 'phone' | 'email' | 'in_person' | 'referral_ospod' | 'other'
  /** Minimum údajů — plný profil bez právního titulu by byl nadbytečný. */
  inquirer: { displayName: string; note: string | null }
  requestedScope: string

  outcome: 'agreement_concluded' | 'refused' | 'withdrew' | 'referred_elsewhere' | 'open'
  agreementId: Id | null

  /** § 48a odst. 1 písm. d) — jiný důvod odmítnutí zákon nezná. */
  refusalReason: 'out_of_mandate' | 'capacity' | 'terminated_within_6m' | null
  refusalNote: string | null
  refusalCommunicatedOn: IsoDate | null
}
