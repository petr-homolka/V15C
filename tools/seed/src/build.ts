/**
 * Postaví celou testovací sadu v paměti jako seznam {cesta, data}.
 *
 * Cíl není „nějaká data“, ale data, na kterých se dají otestovat právě ta
 * místa, kde je návrh choulostivý:
 *
 *   – pěstoun a dítě mají JINÁ příjmení a jiné bydliště;
 *   – ORP pěstouna a ORP trvalého pobytu dítěte jsou u části rodin JINÉ
 *     úřady (tři adresáti zprávy, § 47b odst. 5);
 *   – manželé mají JEDNU společnou dohodu (§ 47b odst. 7);
 *   – jeden pěstoun je osoba v evidenci BEZ DÍTĚTE a povinnosti mu běží
 *     (§ 47c odst. 1);
 *   – jeden je poručník s osobní péčí (§ 2a písm. c) bod 4);
 *   – část lhůt je PO TERMÍNU, aby bylo co zobrazovat;
 *   – jeden spis je ARCHIVOVANÝ po ukončení péče;
 *   – jsou tu odmítnutí zájemců, bez kterých nelze spočítat roční výkaz.
 */

import type {
  Agreement, AssistantMemory, CaseEntry, CaseFile, Child, Document,
  DocumentDraft, EducationPeriod, IncomingSubmission, LifeBookEntry,
  MandateObligation, Obligation, OrgMembership, OrgPolicy, Organization,
  Person, PersonContact, Placement, Report, ServiceInquiry, Task,
  CalendarEvent, OrgSettings, Subscription, CreditWallet, OrpConsent,
  TimelineEntry, AuthorityRequest, Authority, PricingRuleset,
  CodebookDef, CodebookItem, UploadPolicy, Dictation, PlanMatrix,
  AiEntitlement, OrgBranding, LetterheadTemplate, ReferenceNumberSeries,
} from '../../../schema/src/index'
import {
  org as orgPaths, platform as platformPaths, CODEBOOKS, DEFAULT_LETTERHEADS,
} from '../../../schema/src/index'
import {
  Address, Gender, KU_LIST, ORP_LIST, Town, familyLabel, makeAddress, makeBankAccount,
  makeEmail, makeFakeNationalId, makeName, makePhone, pickSurnameIndex,
  pickTown, pickTownInOtherOrp,
} from './czech'
import { Rng, addDays, addMonths, isoDate, isoDateTime } from './rng'

/** Každý dokument nese značku, aby šla celá sada smazat i najít. */
export interface DemoMark {
  demo: true
  demoBatchId: string
}

export interface SeedDoc {
  path: string
  data: Record<string, unknown> & DemoMark
}

export interface SeedResult {
  batchId: string
  docs: SeedDoc[]
  stats: Record<string, number>
}

export interface SeedOptions {
  seed: string
  organizations: number
  keyWorkersPerOrg: number
  maxAgreementsPerKeyWorker: number
  /** Ke kterému dni se sada tváří jako aktuální. */
  today: Date
}

export const DEFAULT_OPTIONS: SeedOptions = {
  seed: 'v15c-demo-1',
  organizations: 2,
  keyWorkersPerOrg: 2,
  maxAgreementsPerKeyWorker: 19,
  today: new Date('2026-08-07T09:00:00Z'),
}

const ORG_NAMES = [
  { legal: 'Doprovázení Podkrušnohoří, o.p.s.', display: 'Podkrušnohoří', ico: '27100011', ku: 'KU-ULK' },
  { legal: 'Rodina a dítě Střední Čechy, z.ú.', display: 'Rodina a dítě', ico: '27100022', ku: 'KU-STC' },
  { legal: 'Naděje pro rodiny, o.p.s.', display: 'Naděje pro rodiny', ico: '27100033', ku: 'KU-ULK' },
]

/* ------------------------------------------------------------------ */

export function build(options: Partial<SeedOptions> = {}): SeedResult {
  const opt = { ...DEFAULT_OPTIONS, ...options }
  const rng = new Rng(opt.seed)
  const batchId = `demo-${opt.seed}`
  const docs: SeedDoc[] = []
  const stats: Record<string, number> = {}

  const mark: DemoMark = { demo: true, demoBatchId: batchId }
  const push = (path: string, data: Record<string, unknown>, statKey: string) => {
    docs.push({ path, data: { ...data, ...mark } })
    stats[statKey] = (stats[statKey] ?? 0) + 1
  }

  const now = isoDateTime(opt.today)
  const sys = (createdBy: string) => ({
    createdByPersonId: createdBy,
    createdAt: now,
    via: 'import' as const,
    updatedByPersonId: null,
    updatedAt: null,
  })

  buildPlatform()
  for (let o = 0; o < opt.organizations; o++) {
    buildOrganization(o)
  }

  return { batchId, docs, stats }

  /* ================================================================ */

  /**
   * Platformní číselníky. Úřady patří sem, ne k organizacím — jsou to
   * tytéž úřady pro všechny a `authorityId` se objevuje na zprávách
   * a doručenkách, kde na jednoznačnosti záleží (dok. 05, 13).
   */
  function buildPlatform(): void {
    for (const ku of KU_LIST) {
      const a: Authority = {
        code: ku.code,
        kind: 'kraj_ku',
        name: ku.name,
        parentCode: null,
        address: null,
        isds: `isds-${ku.code.toLowerCase()}`,
        email: null,
        active: true,
      }
      push(platformPaths.authority(a.code), a as unknown as Record<string, unknown>, 'authorities')
    }

    for (const orp of ORP_LIST) {
      const a: Authority = {
        code: orp.code,
        kind: 'orp',
        name: orp.name,
        // Ústecké obce pod ULK, ostatní pod STC — hrubě, ale pravdivě.
        parentCode: ['ORP-KLADNO', 'ORP-SLANY', 'ORP-BEROUN', 'ORP-RAKOVNIK']
          .includes(orp.code) ? 'KU-STC' : 'KU-ULK',
        address: null,
        isds: `isds-${orp.code.toLowerCase()}`,
        email: `ospod@${orp.code.toLowerCase().replace('orp-', '')}.priklad.test`,
        active: true,
      }
      push(platformPaths.authority(a.code), a as unknown as Record<string, unknown>, 'authorities')
    }

    for (const court of [
      { code: 'OS-TEPLICE', name: 'Okresní soud v Teplicích' },
      { code: 'OS-LITOMERICE', name: 'Okresní soud v Litoměřicích' },
      { code: 'OS-KLADNO', name: 'Okresní soud v Kladně' },
    ]) {
      const a: Authority = {
        code: court.code,
        kind: 'court',
        name: court.name,
        parentCode: null,
        address: null,
        isds: `isds-${court.code.toLowerCase()}`,
        email: null,
        active: true,
      }
      push(platformPaths.authority(a.code), a as unknown as Record<string, unknown>, 'authorities')
    }

    // Definice číselníků a jejich výchozí položky. Nabídka nikdy nekončí —
    // na konci je „+ Přidat nové“ (codebooks.ts).
    for (const def of CODEBOOKS) {
      push(platformPaths.codebook(def.code), def as unknown as Record<string, unknown>, 'codebookDefs')
    }

    const DEFAULT_ITEMS: Array<[string, string, string, Record<string, string> | null]> = [
      ['expense.category', 'jizdne', 'Jízdné', { rightCode: 'a' }],
      ['expense.category', 'terapie', 'Terapie a odborná pomoc', { rightCode: 'd' }],
      ['expense.category', 'vzdelavani', 'Vzdělávání pěstouna', { rightCode: 'f' }],
      ['expense.category', 'respit', 'Zajištěná péče', { rightCode: 'b' }],
      ['expense.category', 'material', 'Materiál a pomůcky', { rightCode: 'none' }],
      ['education.form', 'prezencne', 'Prezenčně', { countsAs: 'in_person' }],
      ['education.form', 'online', 'Online živě', { countsAs: 'online_live' }],
      ['education.form', 'elearning', 'E-learning', { countsAs: 'elearning' }],
      ['education.topic', 'attachment', 'Attachment a vztahová vazba', null],
      ['education.topic', 'trauma', 'Trauma u dětí', null],
      ['education.topic', 'pravo', 'Právní minimum', null],
      ['contact.place', 'domov', 'V domácnosti pěstouna', { countsAs: 'home' }],
      ['contact.place', 'organizace', 'V organizaci', { countsAs: 'organization' }],
      ['contact.absenceReason', 'skola', 'Ve škole', { justifiedByDefault: 'ask' }],
      ['contact.absenceReason', 'hospitalizace', 'Hospitalizace', { justifiedByDefault: 'yes' }],
      ['careEpisode.place', 'babicka', 'U prarodičů', null],
      ['careEpisode.place', 'tabor', 'Tábor', null],
      ['photo.purpose', 'pokoj', 'Pokoj dítěte', { processing: 'photo_color' }],
      ['photo.purpose', 'vysvedceni', 'Vysvědčení', { processing: 'document_grayscale' }],
      ['photo.purpose', 'uctenka', 'Účtenka nebo doklad', { processing: 'document_grayscale' }],
      ['photo.purpose', 'smlouva', 'Smlouva nebo dohoda', { processing: 'document_grayscale' }],
      ['photo.purpose', 'certifikat', 'Certifikát ze vzdělávání', { processing: 'document_grayscale' }],
      ['photo.purpose', 'poznamky', 'Ruční poznámky', { processing: 'document_grayscale' }],
      ['task.type', 'doklad', 'Doložit doklad', null],
      ['agenda.code', 'doprovazeni', 'Doprovázení', null],
      ['agenda.code', 'ostatni', 'Ostatní agendy', null],
    ]
    DEFAULT_ITEMS.forEach(([codebookCode, code, label, behavior], i) => {
      const item: CodebookItem = {
        ...sys('superadmin'),
        id: `cb-${code}-${i}`,
        codebookCode,
        code,
        label,
        description: null,
        origin: 'platform',
        organizationId: null,
        behavior,
        order: i,
        status: 'active',
        retiredOn: null,
        retiredByPersonId: null,
        retiredReason: null,
        adoption: null,
      }
      push(platformPaths.codebookItem(item.id), item as unknown as Record<string, unknown>, 'codebookItems')
    })

    // Video je zakázané; ukládání zvuku Premium. Normalizace obrázků je to,
    // co dělá provoz levným (dok. 19 sekce 6.1).
    const uploadPolicy: UploadPolicy = {
      id: 'upload-2026-01',
      effectiveFrom: '2026-01-01',
      images: {
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/heic'],
        maxBytes: 25 * 1024 * 1024,
        normalize: {
          enabled: true,
          maxLongEdgePx: 2200,
          jpegQuality: 72,
          targetKbPerPage: 150,
          convertToPdfA: true,
        },
      },
      documents: {
        allowedMimeTypes: ['application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        maxBytes: 40 * 1024 * 1024,
      },
      audio: {
        captureRequiresEntitlement: 'ai.dictation',
        storeRequiresEntitlement: 'audio_retention',
        maxBytes: 60 * 1024 * 1024,
        defaultRetentionDays: 90,
      },
      video: {
        allowed: false,
        refusalMessage: 'Video se do spisu nenahrává. Popis situace patří do zápisu, snímek jako fotografie.',
      },
      quota: {
        includedActiveBytes: 10 * 1024 * 1024 * 1024,
        extraBlockBytes: 10 * 1024 * 1024 * 1024,
        extraBlockPrice: { amountMinor: 10000, currency: 'CZK' },
        archiveCountsToQuota: false,
      },
    }
    push(
      platformPaths.uploadPolicy(uploadPolicy.id),
      uploadPolicy as unknown as Record<string, unknown>,
      'uploadPolicies',
    )

    // Co je v jakém tarifu. Rozhodnutí VLASTNÍKA PRODUKTU, uložené jako
    // datovaný záznam — mění se bez nasazení kódu (media.ts).
    const planMatrix: PlanMatrix = {
      id: 'plans-2026-01',
      effectiveFrom: '2026-01-01',
      note: 'AI zdarma jen ve zkušebním období; ruční dopisování zdarma vždy.',
      plans: [
        {
          plan: 'free',
          label: 'Základní',
          entitlements: [
            'case_file', 'calendar', 'documents', 'tasks', 'obligations',
            'editor', 'manual_entry', 'photo_capture', 'reports_statutory',
          ],
        },
        {
          plan: 'paid',
          label: 'Placená',
          entitlements: [
            'case_file', 'calendar', 'documents', 'tasks', 'obligations',
            'editor', 'manual_entry', 'photo_capture', 'reports_statutory',
            'reports_accounting', 'checklists', 'standards', 'exports',
            'branding', 'codebook_custom_items',
          ],
        },
      ],
      // AI a uchování zvuku se kupují zvlášť; zdarma AI není nikdy.
      addOns: [
        { entitlement: 'ai.assistant', label: 'Eli — dotazy a koncepty' },
        { entitlement: 'ai.dictation', label: 'Diktování a přepis' },
        { entitlement: 'ai.summary', label: 'Souhrny' },
        { entitlement: 'ai.document_index', label: 'Čtení dokumentů' },
        { entitlement: 'audio_retention', label: 'Uchování zvuku diktátu' },
        { entitlement: 'extra_storage', label: 'Další prostor' },
      ],
    }
    push(
      platformPaths.planMatrix(planMatrix.id),
      planMatrix as unknown as Record<string, unknown>,
      'planMatrices',
    )

    // Ceník jako datovaná série — model se bude měnit, tak není v kódu (dok. 19).
    const pricing: PricingRuleset = {
      id: 'pricing-2026-01',
      effectiveFrom: '2026-01-01',
      currency: 'CZK',
      unit: 'agreement',
      tiers: [
        { fromCount: 0, pricePerUnitMinor: 9000 },
        { fromCount: 21, pricePerUnitMinor: 7500 },
        { fromCount: 51, pricePerUnitMinor: 6000 },
      ],
      minMonthlyMinor: 49000,
      annualDiscountPct: 15,
      trialDays: 60,
      freePlanLimits: { maxAgreements: 5, features: ['case_file', 'calendar', 'documents'] },
      aiCredit: { unit: 'token', pricePerUnitMinor: 0.02 },
    }
    push(
      `${platformPaths.pricingRulesets()}/${pricing.id}`,
      pricing as unknown as Record<string, unknown>,
      'pricingRulesets',
    )
  }

  function buildOrganization(orgIndex: number): void {
    const meta = ORG_NAMES[orgIndex % ORG_NAMES.length]!
    const orgId = `demo-org-${orgIndex + 1}`
    const p = orgPaths(orgId)
    const orgTown = pickTown(rng)
    const ku = KU_LIST.find((k) => k.code === meta.ku)!

    /* --- vedení a klíčové osoby ---------------------------------- */

    const managerGender: Gender = rng.bool() ? 'f' : 'm'
    const managerName = makeName(rng, managerGender)
    const managerId = `${orgId}-p-manager`

    const keyWorkers = Array.from({ length: opt.keyWorkersPerOrg }, (_, k) => {
      const gender: Gender = rng.bool(0.8) ? 'f' : 'm'   // v praxi převažují ženy
      return { id: `${orgId}-p-kw${k + 1}`, name: makeName(rng, gender) }
    })

    const organization: Organization = {
      ...sys(managerId),
      id: orgId,
      legalName: meta.legal,
      displayName: meta.display,
      ico: meta.ico,
      subjectKind: 'legal_entity',
      seat: {
        street: makeAddress(rng, orgTown).street,
        city: orgTown.city,
        zip: orgTown.zip,
        country: 'CZ',
      },
      mandate: {
        issuedByKrajskyUradId: ku.code,
        issuedOn: '2019-03-15',
        scopeCodes: ['48-2-d', '48-2-b'],
        registryEntryNo: `${orgIndex + 1}/2019/SPOD`,
        suspendedFrom: null,
        withdrawnOn: null,
      },
      capacity: { maxAgreements: 60, note: 'dle personálního zabezpečení' },
      insurance: {
        insurer: 'Pojišťovna Příklad a.s.',
        policyNo: `PZ-${meta.ico}-2026`,
        validFrom: '2026-01-01',
        validUntil: '2026-12-31',
        copySentOn: '2026-01-08',
      },
      legalRegime: 'CZ-2026-01',
      lifecycle: 'active',
      exitedOn: null,
    }
    push(p.doc(), organization as unknown as Record<string, unknown>, 'organizations')

    // Vedení má org_admin i manager — v malé organizaci to je jeden člověk.
    pushPerson(managerId, managerName, ['staff'], orgTown, { staff: true })
    pushMembership(managerId, 'org_admin', ['manager'], 1)

    for (const kw of keyWorkers) {
      pushPerson(kw.id, kw.name, ['staff'], orgTown, { staff: true })
      // Poměr agend je NASTAVENÝ parametr, ne měření času (dok. 11).
      pushMembership(kw.id, 'key_worker', [], 1, [
        { agendaCode: 'doprovazeni', percent: 80 },
        { agendaCode: 'ostatni', percent: 20 },
      ])
    }

    /* --- nastavení, směrnice, předplatné -------------------------- */

    pushSettings(orgId, managerId)
    pushPolicy(orgId, managerId, orgIndex)
    pushSubscriptionAndWallet(orgId, managerId, orgIndex)
    pushMandateObligations(orgId, managerId, ku.code)
    pushInquiries(orgId, managerId)
    pushOrgMemory(orgId, keyWorkers[0]!.id, keyWorkers[0]!.name.givenName)
    pushOwnCodebookItems(orgId, keyWorkers[0]!.id, orgIndex)
    pushBranding(orgId, managerId, meta, orgTown)
    pushLetterheads(orgId, managerId)
    pushReferenceSeries(orgId, managerId)
    pushAiEntitlement(orgId, managerId, orgIndex)

    /* --- dohody --------------------------------------------------- */

    let agreementSeq = 0

    keyWorkers.forEach((kw, kwIndex) => {
      const count = rng.int(8, opt.maxAgreementsPerKeyWorker)
      for (let a = 0; a < count; a++) {
        agreementSeq++
        // Zvláštní případy rozeseté po sadě, ať jsou v obou organizacích.
        const special =
          kwIndex === 0 && a === 0 ? 'temporary_no_child'
          : kwIndex === 0 && a === 1 ? 'guardian'
          : kwIndex === 0 && a === 2 ? 'awaiting_orp_consent'
          : kwIndex === 1 && a === 0 ? 'archived'
          : null
        buildAgreement(orgId, managerId, kw.id, kw.name.displayName, agreementSeq, special)
      }
    })

    /* ---------------------------------------------------------------- */

    function pushPerson(
      personId: string,
      name: ReturnType<typeof makeName>,
      roles: Person['roles'],
      town: ReturnType<typeof pickTown>,
      extra: { staff?: boolean; birth?: Date } = {},
    ): Address {
      const address = makeAddress(rng, town)
      const birth = extra.birth ?? rng.dateBetween(new Date('1965-01-01'), new Date('1995-12-31'))

      const person: Person = {
        ...sys(managerId),
        id: personId,
        authUid: null,           // v Auth není nikdy nic o rodinách (dok. 19)
        givenName: name.givenName,
        familyName: name.familyName,
        displayName: name.displayName,
        grammaticalGender: name.grammaticalGender,
        birthDate: isoDate(birth),
        roles,
        lifecycle: 'active',
      }
      push(p.person(personId), person as unknown as Record<string, unknown>, 'persons')

      // Kontakty ODDĚLENĚ — proto to je podřízený dokument (dok. 04).
      const contact: PersonContact = {
        ...sys(managerId),
        nationalId: extra.staff ? null : makeFakeNationalId(rng, birth, name.grammaticalGender),
        phone: makePhone(rng),
        email: makeEmail(rng, name),
        address: { street: address.street, city: address.city, zip: address.zip, country: 'CZ' },
        mailingAddress: null,
        bankAccount: extra.staff ? null : makeBankAccount(rng),
        note: null,
      }
      push(p.personContact(personId), contact as unknown as Record<string, unknown>, 'personContacts')
      return address
    }

    function pushMembership(
      personId: string,
      role: OrgMembership['role'],
      additionalRoles: OrgMembership['role'][],
      fte: number,
      agenda: OrgMembership['agendaAllocation'] = [{ agendaCode: 'doprovazeni', percent: 100 }],
    ): void {
      const m: OrgMembership = {
        ...sys(managerId),
        personId,
        role,
        additionalRoles,
        fteFraction: fte,
        agendaAllocation: agenda,
        startedOn: '2024-01-01',
        endedOn: null,
        handoverToPersonId: null,
        status: 'active',
        revokedAt: null,
        revokedByPersonId: null,
        revokeReason: null,
      }
      push(p.member(personId), m as unknown as Record<string, unknown>, 'memberships')
    }

    /* ---------------------------------------------------------------- */

    function buildAgreement(
      orgId: string,
      managerId: string,
      keyWorkerId: string,
      keyWorkerName: string,
      seq: number,
      special: string | null,
    ): void {
      const ref = `ROD-2026-${String(seq).padStart(3, '0')}`
      const agreementId = `${orgId}-ag-${seq}`
      const caseFileId = `${orgId}-cf-${seq}`

      // Datum uzavření se počítá PŘED pěstouny — profil pečující osoby
      // z něj bere počátek `custodyBasisHistory`.
      const concluded = rng.dateBetween(new Date('2023-01-01'), addMonths(opt.today, -3))

      /* --- pěstouni: 1 nebo 2, se společným příjmením --- */
      const carerSurname = pickSurnameIndex(rng)
      const carerTown = pickTown(rng)
      const jointSpouses = special === null && rng.bool(0.55)
      const carerCount = jointSpouses ? 2 : 1

      const carerIds: string[] = []
      const carerNames: string[] = []
      for (let c = 0; c < carerCount; c++) {
        const gender: Gender = carerCount === 2 ? (c === 0 ? 'f' : 'm') : (rng.bool(0.7) ? 'f' : 'm')
        const name = makeName(rng, gender, carerSurname)
        const id = `${agreementId}-carer${c + 1}`
        pushPerson(id, name, ['caregiver'], carerTown)
        pushCarerProfile(id, special)
        carerIds.push(id)
        carerNames.push(name.displayName)
      }

      const carerKind: Agreement['carerKind'] =
        special === 'temporary_no_child' ? 'v_evidenci' : 'pecujici'
      const custodyBasis: Agreement['custodyBasis'] =
        special === 'temporary_no_child' ? 'foster_temporary'
        : special === 'guardian' ? 'guardian_caring'
        : rng.bool(0.15) ? 'care_953' : 'foster'
      // PPPD je vždy zprostředkovaná → vzdělávání 24 h nezávisle na dětech (dok. 18).
      const mediatedCare = carerKind === 'v_evidenci' || rng.bool(0.4)

      const status: Agreement['status'] =
        special === 'awaiting_orp_consent' ? 'awaiting_orp_consent'
        : special === 'archived' ? 'ended'
        : 'active'

      /* --- děti: 1–5, VŽDY jiné příjmení než pěstoun --- */
      const childCount = special === 'temporary_no_child' ? 0 : rng.int(1, 5)
      const children: Array<{ id: string; name: ReturnType<typeof makeName>; birth: Date; orp: string }> = []
      const usedChildSurnames: number[] = [carerSurname]
      let lastChildTown: Town | null = null

      for (let ch = 0; ch < childCount; ch++) {
        // Sourozenci sdílejí příjmení, jinak každé dítě vlastní.
        const sibling = ch > 0 && rng.bool(0.45)
        const surnameIndex = sibling
          ? usedChildSurnames[usedChildSurnames.length - 1]!
          : pickSurnameIndex(rng, usedChildSurnames)
        if (!sibling) usedChildSurnames.push(surnameIndex)

        const gender: Gender = rng.bool() ? 'f' : 'm'
        const name = makeName(rng, gender, surnameIndex)
        const birth = rng.dateBetween(addMonths(opt.today, -17 * 12), addMonths(opt.today, -2 * 12))
        // U části dětí je ORP trvalého pobytu JINÝ než ORP pěstouna (dok. 05).
        // Sourozenci ho ale sdílejí — mají stejné trvalé bydliště.
        const childTown: Town = sibling && lastChildTown
          ? lastChildTown
          : rng.bool(0.45) ? pickTownInOtherOrp(rng, carerTown.orpCode) : carerTown
        lastChildTown = childTown
        const childId = `${agreementId}-child${ch + 1}`

        const child: Child = {
          ...sys(keyWorkerId),
          id: childId,
          authUid: null,
          givenName: name.givenName,
          familyName: name.familyName,
          displayName: name.displayName,
          grammaticalGender: name.grammaticalGender,
          birthDate: isoDate(birth),
          residenceOrpId: childTown.orpCode,
          school: ageYears(birth) >= 6 ? `Základní škola ${childTown.city}` : null,
          dependencyLevel: rng.bool(0.12) ? rng.pick(['I', 'II', 'III'] as const) : 'none',
          lifecycle: special === 'archived' ? 'archived' : 'active',
          careEndedOn: special === 'archived' ? isoDate(addMonths(opt.today, -2)) : null,
          careEndDocumentId: null,
        }
        push(p.child(childId), child as unknown as Record<string, unknown>, 'children')

        const childAddress = makeAddress(rng, childTown)
        push(p.childContact(childId), {
          ...sys(keyWorkerId),
          nationalId: makeFakeNationalId(rng, birth, gender),
          phone: ageYears(birth) >= 12 ? makePhone(rng) : null,
          email: ageYears(birth) >= 12 ? makeEmail(rng, name) : null,
          address: { street: childAddress.street, city: childAddress.city, zip: childAddress.zip, country: 'CZ' },
          mailingAddress: null,
          bankAccount: null,
          note: null,
        }, 'childContacts')

        children.push({ id: childId, name, birth, orp: childTown.orpCode })
        pushLifeBook(childId, name, keyWorkerId)
      }

      const agreement: Agreement = {
        ...sys(managerId),
        id: agreementId,
        reference: ref,
        carerPersonIds: carerIds,
        jointSpouses,
        separatedByOrpDecision: false,
        carerKind,
        custodyBasis,
        mediatedCare,
        legalRegime: 'CZ-2026-01',
        legalRulesetId: 'cz-2026-01',
        counterparty: 'pověřená osoba',
        concludedOn: isoDate(concluded),
        effectiveFrom: isoDate(concluded),
        status,
        termination: special === 'archived'
          ? {
              noticeGivenOn: isoDate(addMonths(opt.today, -4)),
              noticeByWhom: 'carer',
              reason: 'dítě svěřeno zpět do péče matky',
              legalGround: null,
              effectiveOn: isoDate(addMonths(opt.today, -2)),
            }
          : null,
        previousOrganizationId: null,
        transferCode: null,
        carerDisplayName: jointSpouses ? familyLabel(carerSurname) : carerNames[0]!,
        childCount,
        activePlacementCount: special === 'archived' ? 0 : childCount,
        nextObligationDueOn: null,     // dopočítá Function; tady jen kostra
        openObligationCount: 0,
        lifecycle: special === 'archived' ? 'archived' : 'active',
      }
      push(p.agreement(agreementId), agreement as unknown as Record<string, unknown>, 'agreements')

      // Souhlas ORP — bez něj nelze vyplatit státní příspěvek (dok. 01).
      const consent: OrpConsent = {
        ...sys(keyWorkerId),
        id: `${agreementId}-consent`,
        orpId: carerTown.orpCode,
        requestedOn: isoDate(addDays(concluded, -20)),
        decision: special === 'awaiting_orp_consent' ? null : 'granted',
        decidedOn: special === 'awaiting_orp_consent' ? null : isoDate(addDays(concluded, -5)),
        documentId: null,
        note: null,
      }
      push(`${p.orpConsents(agreementId)}/${consent.id}`, consent as unknown as Record<string, unknown>, 'orpConsents')

      // Vyjádření ORP podle § 10 odst. 3 — jen u § 2a c) 2 a 3 (dok. 18).
      if (custodyBasis === 'care_953' && children[0]) {
        push(`${p.orpStatements(agreementId)}/${agreementId}-stmt`, {
          ...sys(keyWorkerId),
          id: `${agreementId}-stmt`,
          personId: carerIds[0]!,
          childId: children[0].id,
          basis: 'pending_on_motion',
          issuedByOrpId: carerTown.orpCode,
          issuedOn: isoDate(addDays(concluded, -30)),
          personallyCares: true,
          manifestlyUnfounded: false,
          documentId: null,
        }, 'orpStatements')
      }

      /* --- umístění dětí --- */
      children.forEach((child, i) => {
        const started = rng.dateBetween(concluded, addMonths(opt.today, -2))
        const ended = special === 'archived' && i === 0
        const placement: Placement = {
          ...sys(keyWorkerId),
          id: `${agreementId}-pl${i + 1}`,
          childId: child.id,
          childDisplayName: child.name.displayName,
          agreementId,
          startedOn: isoDate(started),
          startDocumentId: null,
          entrustedToPersonId: jointSpouses ? null : carerIds[0]!,
          endedOn: ended ? isoDate(addMonths(opt.today, -2)) : null,
          endReason: ended ? 'to_parents' : null,
          endDocumentId: null,   // doklad chybí ZÁMĚRNĚ — nic neblokuje (dok. 16)
          endNote: ended ? 'rozhodnutí soudu o návratu do péče matky' : null,
          transferredToAgreementId: null,
        }
        push(
          `${p.placements(agreementId)}/${placement.id}`,
          placement as unknown as Record<string, unknown>,
          'placements',
        )
      })

      /* --- vzdělávací období: klouzavých 12 měsíců od dohody (dok. 01) --- */
      carerIds.forEach((carerId, i) => {
        const required = mediatedCare ? 24 : 18
        const done = rng.int(0, required + 6)
        const period: EducationPeriod = {
          ...sys(keyWorkerId),
          id: `${agreementId}-edu${i + 1}`,
          agreementId,
          personId: carerId,
          periodFrom: isoDate(concluded),
          periodTo: isoDate(addMonths(concluded, 12)),
          requiredHours: required,
          carriedOverHours: rng.bool(0.2) ? rng.int(1, 5) : 0,
          completedHours: done,
          importedHours: 0,
          importedFromOrganizationId: null,
          computedFrom: {
            legalRulesetId: 'cz-2026-01',
            legalRegime: 'CZ-2026-01',
            orgPolicyIds: [`${orgId}-policy-1`],
            computedAt: now,
          },
          closed: false,
        }
        push(
          `${p.educationPeriods(agreementId)}/${period.id}`,
          period as unknown as Record<string, unknown>,
          'educationPeriods',
        )
      })

      /* --- spis --- */
      const lastContact = addDays(opt.today, -rng.int(5, 95))
      const nextContactDue = addMonths(lastContact, 2)
      const overdue = nextContactDue < opt.today

      const caseFile: CaseFile = {
        ...sys(keyWorkerId),
        id: caseFileId,
        agreementId,
        reference: ref,
        carerPersonIds: carerIds,
        carerDisplayName: agreement.carerDisplayName,
        childIds: children.map((c) => c.id),
        keyWorkerPersonId: keyWorkerId,
        keyWorkerDisplayName: keyWorkerName,
        deputyPersonId: null,
        indicators: {
          lastContactOn: isoDate(lastContact),
          nextContactDueOn: isoDate(nextContactDue),
          overdueObligationCount: overdue ? rng.int(1, Math.max(1, childCount)) : 0,
          openObligationCount: 1 + childCount,
          lastReportOn: isoDate(addMonths(opt.today, -rng.int(1, 7))),
          nextReportDueOn: isoDate(addMonths(opt.today, rng.int(-1, 5))),
          educationHoursDone: rng.int(0, 24),
          educationHoursRequired: mediatedCare ? 24 : 18,
          respiteDaysUsedThisYear: rng.int(0, 14),
          documentCount: 0,
          unreadIndexCount: 0,
        },
        lifecycle: special === 'archived' ? 'archived' : 'active',
        archivedOn: special === 'archived' ? isoDate(addMonths(opt.today, -2)) : null,
        archivedReason: special === 'archived' ? 'care_ended' : null,
        retentionUntil: null,
      }
      push(p.caseFile(caseFileId), caseFile as unknown as Record<string, unknown>, 'caseFiles')

      buildEntries(caseFileId, agreementId, keyWorkerId, carerIds, children, lastContact)
      buildDocuments(caseFileId, agreementId, keyWorkerId, ref)
      buildObligations(caseFileId, agreementId, ref, keyWorkerId, carerIds, carerNames, children, lastContact)
      buildReport(caseFileId, agreementId, keyWorkerId, carerTown.orpCode, children)
      buildTasksAndEvents(caseFileId, keyWorkerId, ref, agreement.carerDisplayName, nextContactDue)

      // Podatelna a žádost úřadu jen u pár spisů, ať to není u každého.
      if (seq % 4 === 0) buildDictation(caseFileId, keyWorkerId)
      if (seq % 7 === 0) buildSubmission(caseFileId, keyWorkerId, ref)
      if (seq % 9 === 0) buildDraft(caseFileId, keyWorkerId, agreement.carerDisplayName)

      /**
       * Diktáty ve třech stavech, aby šlo testovat okno na úpravu přepisu:
       * jeden s otevřeným oknem, jeden zavřený, jeden zachycený offline
       * a přepsaný až po připojení (okno mu běží od PŘEPISU, ne od nahrání).
       */
      function buildDictation(caseFileId: string, keyWorkerId: string): void {
        const variant = rng.int(0, 2)
        const recorded = addDays(opt.today, variant === 1 ? -9 : -rng.int(0, 2))
        const capturedOffline = variant === 2
        const transcribed = capturedOffline ? addDays(recorded, 1) : recorded
        const windowDays = 3
        const editableUntil = addDays(transcribed, windowDays)
        const storeAudio = rng.bool(0.2)   // ukládání zvuku je Premium

        const d: Dictation = {
          ...sys(keyWorkerId),
          id: `${caseFileId}-dic1`,
          caseFileId,
          recordedByPersonId: keyWorkerId,
          startedAt: isoDateTime(recorded),
          durationSeconds: rng.int(40, 420),
          capturedOffline,
          audio: storeAudio
            ? {
                retention: 'stored',
                storagePath: `demo/${caseFileId}/dic1.m4a`,
                byteSize: rng.int(300, 3000) * 1024,
                mimeType: 'audio/mp4',
                storedUnderEntitlement: 'audio_retention',
                retainUntil: isoDate(addDays(recorded, 90)),
                deletedOn: null,
              }
            : {
                retention: 'not_stored',
                storagePath: null,
                byteSize: null,
                mimeType: null,
                storedUnderEntitlement: null,
                retainUntil: null,
                deletedOn: null,
              },
          transcript: {
            text: rng.pick([
              'Byla jsem u Novákových, doma byla pěstounka a mladší dítě. Starší je na táboře. Probraly jsme přípravu na školu.',
              'Návštěva proběhla v organizaci, pěstoun přijel sám. Řešili jsme kontakt s biologickou matkou a jeho průběh.',
              'Krátká návštěva doma, obě děti přítomné. Pěstounka žádá o respit v září.',
            ]),
            engine: capturedOffline ? 'on_device' : rng.bool(0.6) ? 'on_device' : 'cloud_eu',
            language: 'cs',
            confidence: rng.bool(0.8) ? 0.94 : 0.71,
            transcribedAt: isoDateTime(transcribed),
            editableUntil: isoDateTime(editableUntil),
            editableUntilMs: editableUntil.getTime(),
            editWindowDays: windowDays,
            lastEditedAt: rng.bool(0.4) ? isoDateTime(addDays(transcribed, 1)) : null,
            lastEditedByPersonId: rng.bool(0.4) ? keyWorkerId : null,
            editCount: rng.bool(0.4) ? 1 : 0,
          },
          summary: {
            content: { format: 'blocks', version: 1, blocks: [], plainText: 'Souhrn návštěvy.' },
            proposedPlainText: 'Souhrn návštěvy.',
            modelId: 'demo-model',
            promptVersion: 'demo-1',
            generatedAt: isoDateTime(transcribed),
            pseudonymized: true,
            cost: { amountMinor: 12, currency: 'CZK' },
            lastEditedAt: null,
            lastEditedByPersonId: null,
          },
          resultEntryId: null,
          status: 'ready',
          failureReason: null,
        }
        push(
          p.dictation(caseFileId, d.id),
          d as unknown as Record<string, unknown>,
          'dictations',
        )
      }

      function pushCarerProfile(personId: string, special: string | null): void {
        push(p.personCarer(personId), {
          ...sys(keyWorkerId),
          carerKind: special === 'temporary_no_child' ? 'v_evidenci' : 'pecujici',
          custodyBasisHistory: [{
            basis: special === 'temporary_no_child' ? 'foster_temporary'
                 : special === 'guardian' ? 'guardian_caring' : 'foster',
            from: isoDate(concluded),
            to: null,
            documentId: null,
          }],
          registryEntry: special === 'temporary_no_child'
            ? { krajskyUradId: ku.code, enrolledFrom: '2024-05-01', enrolledUntil: null }
            : null,
          mediatedCare: special === 'temporary_no_child' ? true : rng.bool(0.4),
          spouseOfPersonId: null,
          livesInFamilyHouseholdWithChild: true,
        }, 'carerProfiles')
      }
    }

    /* ---------------------------------------------------------------- */
    /* Obsahové záznamy                                                 */
    /* ---------------------------------------------------------------- */

    function buildEntries(
      caseFileId: string,
      agreementId: string,
      keyWorkerId: string,
      carerIds: string[],
      children: Array<{ id: string; name: ReturnType<typeof makeName> }>,
      lastContact: Date,
    ): void {
      // Osobní styky za posledních 12 měsíců, přibližně každých 6–9 týdnů.
      let when = addMonths(lastContact, -12)
      let n = 0
      while (when <= lastContact) {
        n++
        const entryId = `${caseFileId}-mc${n}`
        // Část dětí občas chybí — a lhůta jim tím neběží od nuly (dok. 11).
        const absent = children.filter(() => rng.bool(0.18))
        const present = children.filter((c) => !absent.includes(c))

        const contact: CaseEntry = {
          ...sys(keyWorkerId),
          id: entryId,
          kind: 'monitoring_contact',
          caseFileId,
          agreementId,
          occurredAt: isoDateTime(when),
          subjectRefs: carerIds.map((id) => ({ kind: 'person' as const, id, label: null })),
          voided: false,
          voidedByPersonId: null,
          voidReason: null,
          place: rng.bool(0.75) ? 'home' : rng.bool(0.5) ? 'organization' : 'other',
          placeNote: rng.bool(0.2) ? 'setkání v kavárně u nádraží' : null,
          presentPersonIds: carerIds.filter(() => rng.bool(0.85)),
          presentChildIds: present.map((c) => c.id),
          absentChildren: absent.map((c) => ({
            childId: c.id,
            reason: rng.pick(['ve škole', 'na táboře', 'u lékaře', 'hospitalizace', 'u kamarádky']),
            justified: rng.bool(0.7),
          })),
          durationMinutes: rng.pick([45, 60, 75, 90, 120]),
          summary: rng.pick([
            'Návštěva v rodině, probrána školní docházka a příprava na prázdniny.',
            'Rozhovor s pečující osobou o kontaktu s biologickou matkou.',
            'Řešeny obtíže se spánkem u mladšího dítěte, doporučena odborná pomoc.',
            'Kontrola plnění individuálního plánu, bez zjištěných nedostatků.',
            'Probrána žádost o respitní péči v období letních prázdnin.',
          ]),
          computedFrom: {
            legalRulesetId: 'cz-2026-01',
            legalRegime: 'CZ-2026-01',
            orgPolicyIds: [`${orgId}-policy-1`],
            computedAt: now,
          },
        }
        push(p.entry(caseFileId, entryId), contact as unknown as Record<string, unknown>, 'entries')
        pushTimeline(caseFileId, entryId, 'monitoring_contact', keyWorkerId, when,
          `Osobní styk · ${present.length} z ${children.length} dětí přítomno`)

        when = addDays(when, rng.int(42, 63))
      }

      // Poznámky a diktáty
      for (let i = 0; i < rng.int(1, 4); i++) {
        const id = `${caseFileId}-note${i + 1}`
        const at = rng.dateBetween(addMonths(opt.today, -10), opt.today)
        push(p.entry(caseFileId, id), {
          ...sys(keyWorkerId),
          id,
          kind: rng.bool(0.5) ? 'note' : 'dictation',
          caseFileId,
          agreementId,
          occurredAt: isoDateTime(at),
          subjectRefs: [],
          voided: false,
          voidedByPersonId: null,
          voidReason: null,
          text: rng.pick([
            'Telefonát s pečující osobou — posun termínu návštěvy.',
            'Zpráva ze školy o zlepšení známek, založena do dokumentů.',
            'Konzultace se sociální pracovnicí OSPOD ohledně styku s otcem.',
            'Pečující osoba žádá o proplacení jazykového kurzu pro dítě.',
          ]),
          aiProposedText: null,
          attachmentDocumentIds: [],
        }, 'entries')
        pushTimeline(caseFileId, id, 'note', keyWorkerId, at, 'Poznámka ve spisu')
      }

      // Výdaje — v časové ose ZÁMĚRNĚ nejsou (dok. 12)
      for (let i = 0; i < rng.int(2, 8); i++) {
        const id = `${caseFileId}-exp${i + 1}`
        const at = rng.dateBetween(addMonths(opt.today, -11), opt.today)
        const child = children.length > 0 && rng.bool(0.6) ? rng.pick(children) : null
        push(p.entry(caseFileId, id), {
          ...sys(keyWorkerId),
          id,
          kind: 'expense',
          caseFileId,
          agreementId,
          occurredAt: isoDateTime(at),
          subjectRefs: [],
          voided: false,
          voidedByPersonId: null,
          voidReason: null,
          amount: { amountMinor: rng.int(15, 900) * 100, currency: 'CZK' },
          categoryCode: rng.pick(['travel', 'education', 'therapy', 'respite', 'leisure', 'material']),
          rightCode: rng.pick(['a', 'b', 'c', 'd', 'e']),
          boundToPersonId: child ? null : carerIds[0]!,
          boundToChildId: child?.id ?? null,
          paymentRoute: rng.pick(['org_paid', 'reimbursed_to_carer']),
          receiptDocumentId: null,
          approvedByPersonId: rng.bool(0.8) ? managerId : null,
          approvedAt: rng.bool(0.8) ? now : null,
        }, 'entries')
      }

      // Vzdělávání
      carerIds.forEach((carerId, ci) => {
        for (let i = 0; i < rng.int(1, 4); i++) {
          const id = `${caseFileId}-edu${ci + 1}-${i + 1}`
          const at = rng.dateBetween(addMonths(opt.today, -11), opt.today)
          push(p.entry(caseFileId, id), {
            ...sys(keyWorkerId),
            id,
            kind: 'education_record',
            caseFileId,
            agreementId,
            occurredAt: isoDateTime(at),
            subjectRefs: [{ kind: 'person', id: carerId, label: null }],
            voided: false,
            voidedByPersonId: null,
            voidReason: null,
            personId: carerId,
            educationPeriodId: `${agreementId}-edu${ci + 1}`,
            title: rng.pick([
              'Attachment a vztahová vazba v náhradní rodině',
              'Komunikace s biologickou rodinou',
              'Dítě s ADHD v pěstounské péči',
              'Trauma a jeho projevy u dětí školního věku',
              'Právní minimum pro pěstouny',
            ]),
            hours: rng.pick([4, 6, 8, 12]),
            form: rng.pick(['in_person', 'online_live', 'elearning']),
            providerLabel: 'Vzdělávací centrum Příklad',
            certificateDocumentId: null,
            importedFromOrganizationId: null,
          }, 'entries')
        }
      })

      // Respity — jednotkou je DEN, i když šlo o hodinu (dok. 03)
      children.forEach((child, i) => {
        if (ageYears(new Date(child.name ? '2020-01-01' : '2020-01-01')) < 0) return
        if (!rng.bool(0.55)) return
        const id = `${caseFileId}-resp${i + 1}`
        const from = rng.dateBetween(addMonths(opt.today, -10), addMonths(opt.today, -1))
        const days = rng.int(1, 7)
        push(p.entry(caseFileId, id), {
          ...sys(keyWorkerId),
          id,
          kind: 'care_episode',
          caseFileId,
          agreementId,
          occurredAt: isoDateTime(from),
          subjectRefs: [{ kind: 'child', id: child.id, label: child.name.displayName }],
          voided: false,
          voidedByPersonId: null,
          voidReason: null,
          childId: child.id,
          from: isoDate(from),
          to: isoDate(addDays(from, days - 1)),
          days,
          providerPersonId: null,
          providerLabel: rng.pick(['babička ze strany pěstounky', 'letní tábor Příklad', 'teta pečující osoby']),
          paid: rng.bool(0.4),
          amount: rng.bool(0.4) ? { amountMinor: days * 45000, currency: 'CZK' } : null,
          overLimit: false,
          justification: null,
          place: rng.pick(['provider', 'camp', 'home']),
        }, 'entries')
      })
    }

    function pushTimeline(
      caseFileId: string,
      refId: string,
      refType: TimelineEntry['refType'],
      actorPersonId: string,
      at: Date,
      summary: string,
    ): void {
      const t: TimelineEntry = {
        id: `${refId}-tl`,
        caseFileId,
        occurredAt: isoDateTime(at),
        recordedAt: isoDateTime(addDays(at, rng.int(0, 2))),
        refType,
        refId,
        actorPersonId,
        subjectRefs: [],
        visibilityClass: 'content',
        summary,
      }
      push(`${p.timeline(caseFileId)}/${t.id}`, t as unknown as Record<string, unknown>, 'timeline')
    }

    /* ---------------------------------------------------------------- */

    function buildDocuments(
      caseFileId: string, agreementId: string, keyWorkerId: string, ref: string,
    ): void {
      const kinds: Array<[Document['category'], string]> = [
        ['agreement', `Dohoda o výkonu pěstounské péče ${ref}`],
        ['agreement_consent', 'Souhlas ORP podle § 154 správního řádu'],
        ['court_decision', 'Rozsudek o svěření do pěstounské péče'],
        ['plan_10c', 'Individuální plán průběhu pěstounské péče'],
        ['report_6m', 'Zpráva o průběhu výkonu pěstounské péče'],
        ['certificate', 'Potvrzení o účasti na vzdělávání'],
        ['receipt', 'Účtenka — jízdné'],
      ]
      const selected = rng.sample(kinds, rng.int(4, kinds.length))

      selected.forEach(([category, title], i) => {
        const id = `${caseFileId}-doc${i + 1}`
        const at = rng.dateBetween(addMonths(opt.today, -14), opt.today)
        const doc: Document = {
          ...sys(keyWorkerId),
          id,
          caseFileId,
          category,
          title,
          origin: category === 'receipt' ? 'checklist_photo' : rng.bool(0.5) ? 'generated' : 'uploaded',
          sourceRefId: null,
          versions: [{
            versionNo: 1,
            storagePath: `demo/${caseFileId}/${id}.pdf`,
            mimeType: 'application/pdf',
            byteSize: rng.int(80, 900) * 1024,
            contentHash: `demo-${id}`,
            createdByPersonId: keyWorkerId,
            createdAt: isoDateTime(at),
            fromDraftId: null,
            supersededByVersionNo: null,
          }],
          currentVersionNo: 1,
          signatureCeremonyId: null,
          retentionBasis: null,
          indexable: true,
          // Část dokumentů čeká na indexaci, aby šlo testovat „kolik Eli nepřečetla“
          indexStatus: rng.bool(0.75) ? 'indexed' : 'queued',
          disposedOn: null,
          disposalRecordId: null,
        }
        push(p.document(caseFileId, id), doc as unknown as Record<string, unknown>, 'documents')
        pushTimeline(caseFileId, id, 'document', keyWorkerId, at, `Dokument: ${title}`)
      })
    }

    /* ---------------------------------------------------------------- */

    function buildObligations(
      caseFileId: string, agreementId: string, ref: string, keyWorkerId: string,
      carerIds: string[], carerNames: string[],
      children: Array<{ id: string; name: ReturnType<typeof makeName> }>,
      lastContact: Date,
    ): void {
      const mk = (
        idSuffix: string, kind: Obligation['kind'], subject: string,
        personId: string | null, childId: string | null, basis: Date, dueOn: Date,
      ) => {
        const overdue = dueOn < opt.today
        const ob: Obligation = {
          id: `${caseFileId}-ob-${idSuffix}`,
          kind,
          agreementId,
          caseFileId,
          personId,
          childId,
          subjectDisplayName: subject,
          caseFileReference: ref,
          assigneePersonId: keyWorkerId,
          basisDate: isoDate(basis),
          dueOn: isoDate(dueOn),
          status: overdue ? 'overdue' : 'open',
          metByRef: null,
          metOn: null,
          justification: null,
          suggestedActions: kind === 'report_6m'
            ? ['create_draft_report']
            : kind === 'personal_contact' ? ['plan_visit', 'record_contact'] : [],
          computedFrom: {
            legalRulesetId: 'cz-2026-01',
            legalRegime: 'CZ-2026-01',
            orgPolicyIds: [`${orgId}-policy-1`],
            computedAt: now,
          },
          recomputedAt: now,
        }
        push(p.obligation(ob.id), ob as unknown as Record<string, unknown>, 'obligations')
      }

      // Lhůta osobního styku běží ZVLÁŠŤ za pěstouna a ZVLÁŠŤ za každé dítě.
      // U osoby v evidenci bez dítěte vzniká jen řádek za osobu (dok. 18).
      carerIds.forEach((id, i) => {
        mk(`pc-p${i + 1}`, 'personal_contact', carerNames[i]!, id, null,
          lastContact, addMonths(lastContact, 2))
      })
      children.forEach((child, i) => {
        // Dítě, které u posledního styku chybělo, má lhůtu starší.
        const childLast = rng.bool(0.25) ? addDays(lastContact, -rng.int(30, 70)) : lastContact
        mk(`pc-c${i + 1}`, 'personal_contact', child.name.displayName, null, child.id,
          childLast, addMonths(childLast, 2))
      })

      const lastReport = addMonths(opt.today, -rng.int(1, 7))
      mk('rep', 'report_6m', carerNames[0]!, carerIds[0]!, null, lastReport, addMonths(lastReport, 6))
    }

    /* ---------------------------------------------------------------- */

    function buildReport(
      caseFileId: string, agreementId: string, keyWorkerId: string,
      carerOrp: string, children: Array<{ id: string; orp: string }>,
    ): void {
      const drafted = addMonths(opt.today, -rng.int(1, 6))
      const childOrp = children[0]?.orp ?? carerOrp
      const r: Report = {
        ...sys(keyWorkerId),
        id: `${caseFileId}-rep1`,
        caseFileId,
        agreementId,
        kind: 'periodic_6m',
        resetsPeriodicCycle: true,
        authorityRequestId: null,
        periodFrom: isoDate(addMonths(drafted, -6)),
        periodTo: isoDate(drafted),
        draftedOn: isoDate(drafted),
        dueBy: isoDate(addDays(drafted, 15)),
        fromDraftId: null,
        documentId: null,
        acknowledgedByCaregiverAt: isoDateTime(addDays(drafted, 3)),
        caregiverStatement: rng.bool(0.4)
          ? 'Se zprávou souhlasím, doplňuji, že dcera začala chodit na atletiku.'
          : null,
        // TŘI adresáti; ORP dítěte je JINÝ úřad než ORP pěstouna (dok. 05).
        deliveries: [
          { recipientKind: 'caregiver', authorityId: null, deliveredOn: isoDate(addDays(drafted, 3)), channel: 'in_person', proofDocumentId: null },
          { recipientKind: 'orp_caregiver', authorityId: carerOrp, deliveredOn: isoDate(addDays(drafted, 8)), channel: 'isds', proofDocumentId: null },
          { recipientKind: 'orp_child_residence', authorityId: childOrp, deliveredOn: rng.bool(0.8) ? isoDate(addDays(drafted, 9)) : null, channel: 'isds', proofDocumentId: null },
        ],
        status: 'delivered',
      }
      push(`${p.reports(caseFileId)}/${r.id}`, r as unknown as Record<string, unknown>, 'reports')
    }

    /* ---------------------------------------------------------------- */

    function buildTasksAndEvents(
      caseFileId: string, keyWorkerId: string, ref: string,
      carerLabel: string, nextContactDue: Date,
    ): void {
      if (rng.bool(0.5)) {
        const t: Task = {
          ...sys(keyWorkerId),
          id: `${caseFileId}-task1`,
          title: rng.pick([
            'Dodat certifikát ze vzdělávání',
            'Ověřit u školy termín schůzky',
            'Doplnit doklad k respitní péči',
            'Připravit podklady k plánu na další období',
          ]),
          detail: null,
          origin: 'manual',
          originRef: null,
          servesObligationId: null,   // úkol NIKDY nezavírá zákonnou lhůtu (dok. 12)
          caseFileId,
          caseFileReference: ref,
          subjectDisplayName: carerLabel,
          assigneePersonId: keyWorkerId,
          createdForRole: null,
          dueOn: isoDate(addDays(opt.today, rng.int(-10, 30))),
          status: rng.bool(0.7) ? 'open' : 'done',
          doneAt: null,
          doneByPersonId: null,
        }
        push(p.task(t.id), t as unknown as Record<string, unknown>, 'tasks')
      }

      // Kalendář: výchozí délka návštěvy 1 hodina (dok. 11)
      const start = addDays(nextContactDue, -rng.int(0, 20))
      start.setUTCHours(rng.int(8, 16), rng.pick([0, 30]), 0, 0)
      const e: CalendarEvent = {
        ...sys(keyWorkerId),
        id: `${caseFileId}-ev1`,
        ownerPersonId: keyWorkerId,
        title: `Návštěva · ${carerLabel}`,
        kind: 'visit',
        startAt: isoDateTime(start),
        endAt: isoDateTime(new Date(start.getTime() + 60 * 60_000)),
        allDay: false,
        place: null,
        caseFileId,
        subjectDisplayName: carerLabel,
        attendeePersonIds: [],
        travelMinutesEstimate: rng.int(10, 55),
        externalCalendarRef: null,
        status: start < opt.today ? 'done' : 'planned',
        resultEntryId: null,
      }
      push(p.event(e.id), e as unknown as Record<string, unknown>, 'events')
    }

    /* ---------------------------------------------------------------- */

    function buildSubmission(caseFileId: string, keyWorkerId: string, ref: string): void {
      const received = addDays(opt.today, -rng.int(1, 12))
      const docId = `${caseFileId}-inbox1`
      push(p.document(caseFileId, docId), {
        ...sys(keyWorkerId),
        id: docId,
        caseFileId,
        category: 'incoming_authority_letter',
        title: 'Vyrozumění soudu — žádost o zprávu',
        origin: 'chat_attachment',
        sourceRefId: null,
        versions: [{
          versionNo: 1,
          storagePath: `demo/${caseFileId}/${docId}.pdf`,
          mimeType: 'application/pdf',
          byteSize: 640 * 1024,
          contentHash: `demo-${docId}`,
          createdByPersonId: keyWorkerId,
          createdAt: isoDateTime(received),
          fromDraftId: null,
          supersededByVersionNo: null,
        }],
        currentVersionNo: 1,
        signatureCeremonyId: null,
        retentionBasis: null,
        indexable: true,
        indexStatus: 'indexed',
        disposedOn: null,
        disposalRecordId: null,
      }, 'documents')

      const s: IncomingSubmission = {
        ...sys(keyWorkerId),
        id: `${caseFileId}-sub1`,
        documentId: docId,
        receivedOn: isoDate(received),
        postedByPersonId: keyWorkerId,
        extracted: {
          senderGuess: 'Okresní soud v Teplicích',
          fileRefGuess: `${rng.int(10, 40)} P ${rng.int(10, 99)}/2026`,
          legalBasisGuess: '§ 128 o. s. ř.',
          deadlineGuess: isoDate(addDays(received, 21)),
          // Úryvek, ze kterého se lhůta čte — potvrzení je pohled, ne čtení dopisu
          deadlineSourceSnippet: '…zprávu zašlete do 21 dnů od doručení tohoto vyrozumění…',
          caseFileGuess: caseFileId,
          hearingDateGuess: isoDate(addDays(received, 60)),
          confidence: rng.bool(0.7) ? 'high' : 'low',
        },
        // Část podání ZÁMĚRNĚ nepotvrzená — do potvrzení nežije v žádném spisu
        confirmedByPersonId: rng.bool(0.5) ? keyWorkerId : null,
        confirmedAt: null,
        authorityRequestId: null,
        status: rng.bool(0.5) ? 'confirmed' : 'inbox',
      }
      push(`${p.submissions()}/${s.id}`, s as unknown as Record<string, unknown>, 'submissions')

      if (s.status === 'confirmed') {
        const ar: AuthorityRequest = {
          ...sys(keyWorkerId),
          id: `${caseFileId}-ar1`,
          caseFileId,
          requester: {
            kind: 'court',
            authorityId: null,
            label: 'Okresní soud v Teplicích',
            fileRef: s.extracted.fileRefGuess,
          },
          legalBasis: '§ 53 odst. 1 písm. e) zákona č. 359/1999 Sb.',
          receivedOn: s.receivedOn,
          dueOn: s.extracted.deadlineGuess,
          requestedScope: 'zpráva o poměrech dítěte pro účely řízení',
          decision: null,
          decidedByPersonId: null,     // schvaluje vedení (dok. 13)
          decidedOn: null,
          refusalReason: null,
          releasedDocumentIds: [],
          releasedSummary: null,
          delivery: null,
          incomingSubmissionId: s.id,
        }
        push(`${p.authorityRequests()}/${ar.id}`, ar as unknown as Record<string, unknown>, 'authorityRequests')
      }
    }

    /* ---------------------------------------------------------------- */

    function buildDraft(caseFileId: string, keyWorkerId: string, carerLabel: string): void {
      const d: DocumentDraft = {
        ...sys(keyWorkerId),
        id: `${caseFileId}-draft1`,
        caseFileId,
        purpose: 'report_6m',
        status: 'in_edit',
        savedAsDocumentId: null,
        discardReason: null,
        // Blokový obsah je pravda, plainText je odvozený mirror (richtext.ts).
        content: {
          format: 'blocks',
          version: 1,
          blocks: [
            { id: 'b1', type: 'heading1', spans: [{ text: 'Zpráva o průběhu výkonu pěstounské péče' }], children: [], attrs: {} },
            { id: 'b2', type: 'paragraph', spans: [{ text: `Pečující osoba: ${carerLabel}` }], children: [], attrs: {} },
            { id: 'b3', type: 'sentence', spans: [{ text: 'Ve sledovaném období proběhly osobní styky v souladu s dohodou.' }], children: [], attrs: { sentenceTemplateId: 'st-contacts-ok' } },
            { id: 'b4', type: 'gap', spans: [], children: [], attrs: { gapLabel: 'počet osobních styků za období' } },
            { id: 'b5', type: 'gap', spans: [], children: [], attrs: { gapLabel: 'hodiny za období' } },
          ],
          plainText: `Zpráva o průběhu výkonu pěstounské péče\nPečující osoba: ${carerLabel}\n`,
        },
        proposedText:
          `Zpráva o průběhu výkonu pěstounské péče\n\n` +
          `Pečující osoba: ${carerLabel}\n` +
          `Ve sledovaném období proběhly osobní styky v souladu s dohodou.\n` +
          `[DOPLNIT: počet osobních styků za období]\n` +
          `Vzdělávání: [DOPLNIT: hodiny za období]\n`,
        currentText:
          `Zpráva o průběhu výkonu pěstounské péče\n\n` +
          `Pečující osoba: ${carerLabel}\n` +
          `Ve sledovaném období proběhly osobní styky v souladu s dohodou.\n` +
          `[DOPLNIT: počet osobních styků za období]\n` +
          `Vzdělávání: [DOPLNIT: hodiny za období]\n`,
        // Mezera místo věrohodné věty — viditelná i v exportu (dok. 14)
        gapMarkers: ['počet osobních styků za období', 'hodiny za období'],
        generation: {
          modelId: 'demo-model',
          promptVersion: 'demo-1',
          generatedAt: now,
          requestedByPersonId: keyWorkerId,
          retrieval: [{ refType: 'case_file', refId: caseFileId }],
          pseudonymized: true,
          creditCostMinor: 40,
        },
      }
      push(p.draft(caseFileId, d.id), d as unknown as Record<string, unknown>, 'drafts')
    }

    /* ---------------------------------------------------------------- */

    function pushLifeBook(
      childId: string, name: ReturnType<typeof makeName>, keyWorkerId: string,
    ): void {
      if (!rng.bool(0.4)) return
      const e: LifeBookEntry = {
        ...sys(keyWorkerId),
        id: `${childId}-lb1`,
        childId,
        occurredOn: isoDate(rng.dateBetween(addMonths(opt.today, -12), opt.today)),
        title: rng.pick(['První den ve škole', 'Výlet na Milešovku', 'Vánoce', 'Vysvědčení']),
        text: `Zápis do knihy života — ${name.givenName}.`,
        documentIds: [],
        authorRole: rng.pick(['child', 'caregiver', 'key_worker']),
        indexable: false,   // Eli knihu života nikdy nečte (dok. 17)
      }
      push(`${p.lifeBook(childId)}/${e.id}`, e as unknown as Record<string, unknown>, 'lifeBook')
    }

    /* ---------------------------------------------------------------- */
    /* Organizační dokumenty                                            */
    /* ---------------------------------------------------------------- */

    function pushSettings(orgId: string, managerId: string): void {
      const p = orgPaths(orgId)
      const s: OrgSettings = {
        ...sys(managerId),
        scope: 'assistant',
        assistant: {
          enabled: true,
          persona: { name: 'Eli', grammaticalGender: 'f', avatarRef: null },
          searchScope: 'organization',   // celá organizace (rozhodnuto, dok. 14)
          actionsEnabled: true,
          learningEnabled: true,
          tierOverrides: {},
        },
        documents: { extractTextLayer: true, ocrScans: true, semanticIndex: true },
        notifications: {
          // Pěstounovi a dítěti nechodí prakticky nic (dok. 18)
          externalOnly: ['upcoming_contact', 'new_message'],
          staffChannels: ['push', 'in_app'],
        },
      }
      push(p.settings('assistant'), s as unknown as Record<string, unknown>, 'settings')
    }

    function pushPolicy(orgId: string, managerId: string, orgIndex: number): void {
      const p = orgPaths(orgId)
      const pol: OrgPolicy = {
        ...sys(managerId),
        id: `${orgId}-policy-1`,
        code: 'smernice-1',
        title: 'Směrnice č. 1 — poskytování pomoci a podpory',
        version: '2026.1',
        effectiveFrom: '2026-01-01',
        effectiveUntil: null,
        supersedesPolicyId: null,
        sourceDocumentId: null,
        parameters: {
          respite: {
            // Ze skutečné Směrnice č. 1: 450 Kč/den, 70 % strop, 6 300 Kč/rok (dok. 05)
            ratePerDayMinor: 45000,
            maxSharePct: 70,
            annualCapMinor: 630000,
            zkpFree: true,
          },
          education: {
            // Vědomě jiná hodnota než zákonná — organizace nese riziko (dok. 07)
            accommodationPerNightMinor: orgIndex === 0 ? 100000 : 150000,
            travelReimbursed: true,
            fuelPriceSeries: [
              { from: '2026-01-01', pricePerLitreMinor: 3890 },
              { from: '2026-07-01', pricePerLitreMinor: 4120 },
            ],
            perDiemMinor: null,
          },
          reimbursements: [
            { code: 'travel', enabled: true, capMinor: null },
            { code: 'therapy', enabled: true, capMinor: 1500000 },
            { code: 'leisure', enabled: orgIndex === 0, capMinor: 500000 },
          ],
          monitoring: { contactIntervalMonths: null, reportIntervalMonths: null },
          vehicles: { leasePerAgreementPerMonthMinor: 50000 },
          // Každé upozornění lze vypnout (charta, dok. 16)
          warnings: { respiteOverLimit: true, expenseOverCap: orgIndex === 0, leaseOverCap: false },
        },
      }
      push(p.policy(pol.id), pol as unknown as Record<string, unknown>, 'policies')
    }

    function pushSubscriptionAndWallet(orgId: string, managerId: string, orgIndex: number): void {
      const p = orgPaths(orgId)
      const sub: Subscription = {
        ...sys(managerId),
        plan: orgIndex === 0 ? 'paid' : 'free',
        billingPeriod: 'annual',
        trialUntil: orgIndex === 1 ? isoDate(addDays(opt.today, 20)) : null,
        pricingRulesetId: 'pricing-2026-01',
        billableAgreementCount: 0,     // dopočítá Function
        measuredOn: isoDate(opt.today),
        status: orgIndex === 0 ? 'active' : 'trial',
        paymentMethod: orgIndex === 0 ? 'invoice' : null,
        externalCustomerId: null,
      }
      push(p.subscription(), sub as unknown as Record<string, unknown>, 'subscriptions')

      const w: CreditWallet = {
        ...sys(managerId),
        balance: { amountMinor: orgIndex === 0 ? 250000 : 20000, currency: 'CZK' },
        autoTopUp: null,
        lastTopUpAt: null,
      }
      push(p.wallet(), w as unknown as Record<string, unknown>, 'wallets')
    }

    function pushMandateObligations(orgId: string, managerId: string, kuCode: string): void {
      const p = orgPaths(orgId)
      const items: Array<[MandateObligation['kind'], Date, boolean]> = [
        ['annual_registry_return', new Date('2027-06-30'), false],
        ['insurance_copy', addDays(opt.today, -3), true],
        ['mandate_change_notice', addDays(opt.today, 9), false],
      ]
      items.forEach(([kind, dueOn, fromAuthority], i) => {
        const m: MandateObligation = {
          ...sys(managerId),
          id: `${orgId}-mob${i + 1}`,
          kind,
          triggerEvent: kind === 'insurance_copy' ? 'obnovení pojistné smlouvy' : 'kalendář',
          triggeredOn: isoDate(addDays(dueOn, -15)),
          dueOn: isoDate(dueOn),
          dueOnFromAuthority: fromAuthority,
          authorityId: kuCode,
          status: dueOn < opt.today ? 'overdue' : 'open',
          submittedOn: null,
          evidenceDocumentId: null,
          note: null,
        }
        push(`${p.mandateObligations()}/${m.id}`, m as unknown as Record<string, unknown>, 'mandateObligations')
      })
    }

    function pushInquiries(orgId: string, managerId: string): void {
      const p = orgPaths(orgId)
      // Bez odmítnutí nelze spočítat roční výkaz § 49c odst. 4 (dok. 13)
      const cases: Array<[ServiceInquiry['outcome'], ServiceInquiry['refusalReason']]> = [
        ['agreement_concluded', null],
        ['refused', 'capacity'],
        ['refused', 'out_of_mandate'],
        ['refused', 'terminated_within_6m'],
        ['withdrew', null],
        ['open', null],
      ]
      cases.forEach(([outcome, refusalReason], i) => {
        const gender: Gender = rng.bool() ? 'f' : 'm'
        const name = makeName(rng, gender)
        const received = rng.dateBetween(addMonths(opt.today, -10), opt.today)
        const inq: ServiceInquiry = {
          ...sys(managerId),
          id: `${orgId}-inq${i + 1}`,
          receivedOn: isoDate(received),
          channel: rng.pick(['phone', 'email', 'in_person', 'referral_ospod']),
          inquirer: { displayName: name.displayName, note: null },
          requestedScope: 'doprovázení pěstounské rodiny',
          outcome,
          agreementId: null,
          refusalReason,
          refusalNote: refusalReason === 'capacity' ? 'obsazená kapacita klíčových osob' : null,
          refusalCommunicatedOn: refusalReason ? isoDate(addDays(received, 4)) : null,
        }
        push(p.inquiry(inq.id), inq as unknown as Record<string, unknown>, 'inquiries')
      })
    }

    /**
     * Vlastní položky organizace — to, co vzniklo z „+ Přidat nové“.
     * Jedna je navržená k adopci pro celý systém, jedna už vyřazená.
     */
    function pushOwnCodebookItems(orgId: string, personId: string, orgIndex: number): void {
      const p = orgPaths(orgId)
      const own: Array<[string, string, string, Record<string, string> | null, 'active' | 'retired', boolean]> = [
        ['expense.category', 'krouzky', 'Zájmové kroužky', { rightCode: 'none' }, 'active', false],
        ['education.topic', 'fasd', 'FASD a prenatální expozice', null, 'active', true],
        ['careEpisode.place', 'chata-org', 'Chata organizace', null, orgIndex === 0 ? 'active' : 'retired', false],
      ]
      own.forEach(([codebookCode, code, label, behavior, status, proposeAdoption], i) => {
        const item: CodebookItem = {
          ...sys(personId),
          id: `${orgId}-cb${i + 1}`,
          codebookCode,
          code,
          label,
          description: null,
          origin: 'organization',
          organizationId: orgId,
          behavior,
          order: 100 + i,
          status,
          retiredOn: status === 'retired' ? isoDate(addMonths(opt.today, -1)) : null,
          retiredByPersonId: status === 'retired' ? managerId : null,
          retiredReason: status === 'retired' ? 'chata se už nepoužívá' : null,
          adoption: proposeAdoption
            ? {
                proposedByOrganizationId: orgId,
                proposedOn: isoDate(addMonths(opt.today, -2)),
                decision: orgIndex === 0 ? 'adopted' : null,
                decidedOn: orgIndex === 0 ? isoDate(addMonths(opt.today, -1)) : null,
                decidedByPersonId: orgIndex === 0 ? 'superadmin' : null,
                platformItemCode: orgIndex === 0 ? code : null,
                rejectionNote: null,
              }
            : null,
        }
        push(p.codebookItem(item.id), item as unknown as Record<string, unknown>, 'ownCodebookItems')
      })
    }

    function pushBranding(
      orgId: string, managerId: string,
      meta: { legal: string; ico: string }, town: Town,
    ): void {
      const p = orgPaths(orgId)
      const b: OrgBranding = {
        ...sys(managerId),
        logo: { lightDocumentId: null, darkDocumentId: null, printHeightMm: 14 },
        accent: { hex: '#0d5c63', contrastOnWhite: 6.4 },
        footer: {
          legalName: meta.legal,
          seatLine: `Nádražní 12, ${town.zip} ${town.city}`,
          ico: meta.ico,
          dic: null,
          registrationNote: 'zapsáno v rejstříku obecně prospěšných společností',
          bankAccount: makeBankAccount(rng),
          isds: `isds-${orgId}`,
          web: `https://www.${orgId}.priklad.test`,
          phone: makePhone(rng),
          email: `info@${orgId}.priklad.test`,
          mandateNote: 'pověření k výkonu SPOD č. 1/2019 vydané Krajským úřadem',
        },
        signatureBlock: {
          defaultSignerPersonId: managerId,
          defaultSignerTitle: rng.bool() ? 'ředitelka' : 'vedoucí služby',
          scannedSignatureDocumentId: null,
          stampDocumentId: null,
        },
        qr: { enabled: true, placement: 'footer_right', sizeMm: 18 },
      }
      push(p.branding(), b as unknown as Record<string, unknown>, 'branding')
    }

    function pushLetterheads(orgId: string, managerId: string): void {
      const p = orgPaths(orgId)
      DEFAULT_LETTERHEADS.forEach((tpl, i) => {
        const l: LetterheadTemplate = {
          ...sys(managerId),
          id: `${orgId}-lh-${tpl.code}`,
          code: tpl.code,
          label: tpl.label,
          version: '2026.1',
          effectiveFrom: '2026-01-01',
          supersedesId: null,
          format: tpl.format,
          orientation: tpl.orientation,
          margins: tpl.margins,
          blocks: [...tpl.blocks],
          addressWindow: { ...tpl.addressWindow },
          pagination: { ...tpl.pagination },
          continuationHeader: tpl.continuationHeader,
        }
        void i
        push(p.letterhead(l.id), l as unknown as Record<string, unknown>, 'letterheads')
      })
    }

    function pushReferenceSeries(orgId: string, managerId: string): void {
      const p = orgPaths(orgId)
      const series: Array<[string, string, string]> = [
        ['zprava', 'Zprávy o průběhu PP', 'ZPR'],
        ['odpoved-urad', 'Odpovědi úřadům', 'ODP'],
        ['obecne', 'Obecná korespondence', 'DOP'],
      ]
      series.forEach(([code, label, prefix], i) => {
        const r: ReferenceNumberSeries = {
          ...sys(managerId),
          id: `${orgId}-rs-${code}`,
          code,
          label,
          pattern: '{PREFIX}-{ROK}/{SEQ}',
          prefix,
          year: 2026,
          lastSequence: rng.int(10, 90),
          resetsYearly: true,
          padTo: 4,
        }
        void i
        push(p.referenceSerie(r.id), r as unknown as Record<string, unknown>, 'referenceSeries')
      })
    }

    /**
     * AI ve třech stavech, aby šlo testovat všechny: zkušební období, kredit
     * po jeho vypršení, a paušál s limitem. Zdarma AI není nikdy.
     */
    function pushAiEntitlement(orgId: string, managerId: string, orgIndex: number): void {
      const p = orgPaths(orgId)
      const trialFrom = addMonths(opt.today, orgIndex === 0 ? -8 : -1)
      const trialUntil = addMonths(trialFrom, 2)
      const expired = trialUntil < opt.today
      const e: AiEntitlement = {
        ...sys(managerId),
        organizationId: orgId,
        trialFrom: isoDate(trialFrom),
        trialUntil: isoDate(trialUntil),
        trialMonths: 2,
        mode: expired ? (orgIndex === 0 ? 'credit' : 'flat') : 'trial',
        flatMonthlyLimit: expired && orgIndex !== 0
          ? { unit: 'token', amount: 2_000_000 }
          : null,
        usedThisPeriod: expired ? rng.int(0, 1_500_000) : rng.int(0, 400_000),
        periodResetsOn: expired ? isoDate(addMonths(opt.today, 1)) : null,
        fallbackNote:
          'Bez AI zůstává editor, knihovna vět a fotografování dokladů; ' +
          'diktát a souhrny ne.',
      }
      push(p.aiEntitlement(), e as unknown as Record<string, unknown>, 'aiEntitlements')
    }

    function pushOrgMemory(orgId: string, personId: string, givenName: string): void {
      const p = orgPaths(orgId)
      const items: Array<Pick<AssistantMemory, 'kind' | 'key' | 'value' | 'humanLabel' | 'origin' | 'scope'>> = [
        { scope: 'person', kind: 'default_value', key: 'visit.duration', value: 90, humanLabel: 'Návštěvy ti trvají 1,5 h', origin: 'learned' },
        { scope: 'person', kind: 'preference', key: 'expense.withVat', value: true, humanLabel: 'Výdaje zapisuješ i s DPH', origin: 'stated' },
        { scope: 'organization', kind: 'fact', key: 'org.parking', value: 'za budovou', humanLabel: 'U kanceláře se parkuje za budovou', origin: 'stated' },
      ]
      items.forEach((m, i) => {
        push(`${p.memory()}/${orgId}-mem${i + 1}`, {
          ...sys(personId),
          id: `${orgId}-mem${i + 1}`,
          ...m,
          ownerId: m.scope === 'person' ? personId : orgId,
          evidenceCount: m.origin === 'learned' ? rng.int(3, 14) : 1,
          firstSeenAt: now,
          lastUsedAt: now,
          active: true,
          forgottenByPersonId: null,
          forgottenAt: null,
        }, 'memory')
      })
      void givenName
    }
  }

  function ageYears(birth: Date): number {
    return Math.floor((opt.today.getTime() - birth.getTime()) / (365.25 * 86_400_000))
  }
}
