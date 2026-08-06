# 02 — Architektura řešení

Navazuje na [01 — Právní analýza a korekce zadání](./01-pravni-analyza-a-korekce-zadani.md).
Řeší pět zadaných problémů: **časová proměnnost pravidel**, **vícejurisdikčnost
a lokalizace**, **přechod pěstouna mezi organizacemi**, **mobile-first PWA**
a **AI za nových podmínek**.

---

## 1. Časová proměnnost pravidel — verzované sady

### Problém
Částky, lhůty, rozsahy a dokonce i **číslování písmen zákona** se mění. Zjištěno
konkrétně na těchto změnách:

| Parametr | Bylo | Je | Změnil |
| --- | --- | --- | --- |
| Vzdělávání pěstouna | 24 h / všichni | **18 h** nezprostř., **24 h** zprostř. | z. 242/2024 |
| Období vzdělávání | kalendářní rok (praxe) | **klouzavých 12 měsíců** od uzavření dohody | § 47a odst. 3 |
| Leasing vozu ze SPVPP | 300 Kč / dohodu / měsíc | **500 Kč** | Instrukce 3/2025 |
| Ubytování při vzdělávání | do 1 000 Kč / os. / den | **do 1 500 Kč** | Instrukce 3/2025 |
| Spoluúčast na stravě | 1/30 příspěvku na úhradu potřeb | **§ 5f vyhlášky 473/2012** | Instrukce 3/2025 |
| Odborná pomoc | „alespoň 1× za 6 měsíců“ | bez zákonné frekvence | z. 242/2024 |
| Písmena § 47a odst. 2 | a)–h) | **a)–g)** | z. 242/2024 |

Samo znění ZSPOD je označeno *„Aktuální znění 01.01.2026 – 31.12.2026“*. Nic z toho
nesmí být v kódu.

### Řešení: tři oddělené vrstvy parametrů

Zásadní rozlišení, které zadání nemá:

```
1. legalRulesets/{jurisdiction}/{versionId}   — ZÁKON (globální, sdílený, read-only pro tenanty)
2. orgPolicies/{orgId}/{versionId}            — VNITŘNÍ PRAVIDLA ORGANIZACE (per tenant)
3. agreements/{id}.policyBinding              — CO PLATÍ PRO TUTO DOHODU
```

Proč tři: § 47b odst. 2 výslovně žádá, aby dohoda obsahovala *„ujednání o dodržování
vnitřních pravidel“*. Částky typu 3 800 Kč za letní pobyt nebo 150 Kč/h hlídačce
**nejsou zákon** — jsou vnitřním pravidlem organizace. Zadání je slučovalo do
`organizations.dailyRespiteCapCzk`, což je špatně na obou stranách: strop 600 Kč není
zákonný a zákonné limity nejsou per organizace.

### Struktura sady zákonných pravidel

```ts
interface LegalRuleset {
  id: string                      // 'CZ-2025-01-21'
  jurisdiction: string            // 'CZ'
  validFrom: string               // '2025-01-21'  (date-only, v místní zóně jurisdikce)
  validTo: string | null          // null = dosud platí
  supersedes: string | null

  sources: Array<{                // dohledatelnost je požadavek kontroly ÚP
    kind: 'zakon' | 'vyhlaska' | 'instrukce' | 'metodika'
    ref: string                   // 'z. 359/1999 Sb., § 47a odst. 2 písm. f)'
    binding: boolean              // metodiky = false
    url?: string
    note?: string
  }>

  education: {
    // klíč = typ pěstounské péče
    requiredHours: { mediated: 24, nonMediated: 18 }
    periodMonths: 12
    periodAnchor: 'agreement_start'          // ne 'calendar_year'
    carryOverEnabled: true
    carryOverMaxPeriods: 1
    elearningFullyAllowed: false
  }

  respiteCare: {
    minDaysPerChildPerYear: 14
    childMinAgeYears: 2
    countingUnit: 'day'                      // i několik hodin = 1 den
    overLimitRequiresWrittenJustification: true
    overLimitRequiresIpodAlignment: true
    allowedInZdvop: false
  }

  monitoring: {
    personalContactMaxIntervalMonths: 2      // § 47b odst. 4
    contactMustIncludeChildren: true
    reportIntervalMonths: 6                  // § 47b odst. 5
    reportAlsoOnTermination: true
    reportDeliveryDeadlineDays: 15
    reportRecipients: ['caregiver', 'orp_caregiver', 'orp_child_residence']
  }

  agreementLifecycle: {
    mustConcludeWithinDaysOfPlacement: 30
    terminationBoundary: 'calendar_half_year'   // 30. 6. / 31. 12.
    noticeMinDaysBeforeBoundary: 30
    lateNoticeShiftsToNextBoundary: true
    newAgreementDeadlineDaysAfterTermination: 30
    onePerCaregiver: true
    spousesConcludeJointly: true
  }

  grant: {                                   // SPVPP
    currency: 'CZK'
    annualAmountMinor: { caregiver: 6_600_000, inEvidence: 7_200_000 }
    increaseMinor: 1_800_000
    increaseConditions: { minChildren: 3, dependencyLevels: ['II','III','IV'] }
    proRataUnit: 'month'                     // 1/12
    spendBands: [                            // § 5c vyhlášky 473/2012
      { rights: ['a','b'],       minPct: 5,  maxPct: 15 },
      { rights: ['c','d','e'],   minPct: 10, maxPct: 20 },
      { rights: ['f'],           minPct: 5,  maxPct: 10 },
    ]
    deadlines: {
      nextYearRequestBy: '--01-15'
      payoutBy: '--02-15'
      notifyChangesWithinDays: 15
      spendReportBy: '--03-31'
      returnUnspentBy: '--04-30'
    }
    caps: {
      vehicleLeasePerAgreementPerMonthMinor: 50_000
      trainingAccommodationPerAdultPerDayMinor: 150_000
      trainingAccommodationMinHoursPerDay: 6
      staffTrainingHoursPerYear: 24
      socialWorkerTrainingHoursPerTwoYears: 48
      supervisionHoursPerYear: 12
    }
    nonEligible: ['caregiver_meals', 'leisure_extras', 'capital_assets']
  }

  // Mapa písmen práv — MUSÍ být verzovaná, novela 2024 přečíslovala a)–h) na a)–g)
  rightsCodes: {
    a: 'short_term_care', b: 'full_day_care', c: 'professional_counselling',
    d: 'psychological_therapeutic', e: 'contact_with_relatives',
    f: 'education_duty', g: 'allow_monitoring',
  }

  workerCapacity: { recommendedFamiliesPerFte: { min: 18, max: 23 }, binding: false }
}
```

### Pravidlo vyhodnocování — nejdůležitější invariant celého systému

> **Každý výpočet je čistá funkce `(fakta, sada pravidel rozhodná pro daný okamžik)`.
> Nikdy se nečte „aktuální“ konfigurace pro historický výpočet.**

Rozhodný okamžik určuje **`resolutionPolicy`** pro každou doménu, protože není jednotný:

| Doména | Rozhodný okamžik | Důvod |
| --- | --- | --- |
| Vzdělávací období | sada platná **k počátku období** | období je nedělitelný celek |
| Uznatelnost výdaje | sada platná **ke dni vzniku výdaje** | kontrola ÚP posuzuje k datu |
| Výše SPVPP | sada platná **k 1. 1. roku** + přepočty za měsíce | § 47d odst. 5 |
| Zánik dohody | sada platná **ke dni doručení výpovědi** | § 47c odst. 5 |
| Pásma čerpání | sada platná **pro daný kalendářní rok** | vyúčtování je roční |

### Přechodné režimy jako prvořadý pojem
Čl. II bod 3 přechodných ustanovení z. 242/2024: staré dohody se řídí **dosavadními**
předpisy, nedohodnou-li se strany jinak. Proto:

```ts
interface Agreement {
  policyBinding: {
    legalRegime: string          // id sady pravidel, kterou se dohoda řídí
    harmonizedAt: string | null  // datum dodatku, kterým se strany podřídily novému režimu
    orgPolicyVersion: string     // verze vnitřních pravidel, na která dohoda odkazuje
  }
}
```

Bez tohoto pole systém spočítá starým dohodám 18 h místo 24 h a nesprávná pásma.

### Provozní pravidla
- Sady jsou **immutable a append-only**. Oprava = nová verze, nikdy edit.
- **Žádný výpočet neukládá jen výsledek** — ukládá `{ výsledek, rulesetId, computedAt }`,
  aby byl auditovatelný a reprodukovatelný. To je požadavek veřejnosprávní kontroly.
- **Simulace budoucí sady**: sadu lze vložit s `validFrom` v budoucnosti a spustit
  „co se změní“ report. Organizace se tak připraví na novelu předem.
- Sady zákonných pravidel spravuje **`superadmin`**, tenant je má jen ke čtení.
- Vnitřní pravidla organizace verzuje **`org_admin`**, ale **verze, na kterou odkazuje
  aktivní dohoda, se nesmí měnit** — jen nahradit novou verzí + dodatkem k dohodě
  (a u podstatné změny se souhlasem ORP, viz dok. 01 sekce 4).

---

## 2. Vícejurisdikčnost a lokalizace

Požadavek: systém může jít i do jiných států. Rozdělení do čtyř nezávislých os —
**typická chyba je slévat je do „jazyka“**:

| Osa | Co určuje | Příklad |
| --- | --- | --- |
| **Jurisdikce** | právní pravidla, entity, integrace, validátory | `CZ`, `SK` |
| **Locale (UI)** | jazyk textů, formáty | `cs-CZ`, `uk-UA`, `en` |
| **Měna** | zobrazení a výpočty | `CZK` |
| **Časová zóna** | hranice dnů a lhůt | `Europe/Prague` |

Pěstoun z Ukrajiny doprovázený českou organizací potřebuje **UI v `uk`, ale jurisdikci
`CZ`**. Proto to musí být oddělené. Klientský portál a poskytovatelé péče jsou reálné
kandidáty na jiný jazyk než pracovníci.

### Doménový model: neutrální jádro + jurisdikční nástavba

```
core/          Organization, CaseFile, Person, Child, Agreement, Task, CalendarEvent,
               Document, EducationRecord, CareEpisode, Expense, Report, Consent
               → identifikátory a atributy jurisdikčně neutrální, anglicky
jurisdictions/
  cz/          legalRulesets, terminologie, šablony, ISDS, validátor rodného čísla,
               registr ORP/KÚ, výpočet „kalendářního pololetí“, PPPD/evidence
```

**Zásady:**
- **V kódu nikdy české právní pojmy jako identifikátory.** `Person`, ne `FosterPerson`;
  `careType: 'mediated' | 'non_mediated'`, ne `zprostredkovana`. České pojmy patří do
  překladů — ale v UI se **musí** zobrazovat přesně („osoba pečující“, „osoba v evidenci“,
  „SPVPP“), protože jsou to právní termíny a jejich záměna je věcná chyba.
- **Rodné číslo je jurisdikční, ne univerzální.** Zadání má `birthNumber: string`.
  Nahradit:
  ```ts
  nationalIdentifiers: Array<{ scheme: 'CZ_RC' | 'SK_RC' | 'other'; value: string; verified: boolean }>
  ```
  Ne každá jurisdikce má obdobu; ne každé dítě v ČR ho má hned (cizinci).
- **Peníze v minor units + kód měny**, nikdy `number` v korunách a nikdy float.
  Zadání má `grantAmountCzk: number` — přejmenovat na `amountMinor` + `currency`.
- **Datumy**: ISO 8601 všude (viz dok. 01 — zadání míchá tři formáty). Ale právní
  lhůty jsou **date-only** s hranicemi v zóně jurisdikce; „poslední den kalendářního
  pololetí“ je jurisdikční funkce, ne obecná.
- **Terminologie jako přeložitelný slovník, ne hardcoded**: role, stavy, kategorie
  výdajů a **písmena práv** procházejí překladovou vrstvou napojenou na sadu pravidel
  (protože písmena se změnila).
- **ICU MessageFormat** kvůli českým pluralizacím (`1 hodina / 2 hodiny / 5 hodin`) —
  čeština má tři formy plus genitiv, jednoduchá `{count} hodin` interpolace nestačí.
- **Šablony dokumentů jsou per jurisdikce a verzované** společně se sadou pravidel;
  smlouva podle starého režimu musí jít vygenerovat i po novele.

---

## 3. Přechod pěstouna mezi organizacemi

### Zadaný návrh
Stará organizace označí pěstouna nejdéle měsíc před koncem dohody jako „Uvolněného“,
pěstoun uvidí ve svém profilu kód, s ním hledá novou organizaci, nová dohoda až od
druhého dne po skončení staré.

### Návrh názvu
Doporučuji **„Předávací kód“** (stav pěstouna: **„Uvolněn k přechodu“**).
Alternativy: „Přechodový kód“, „Kód pro převzetí“. Nedoporučuji „Registrační“
(plete se s registrací účtu) ani „Invitation“ (v českém úředním kontextu cizí).

### Tři korekce zadaného návrhu

**a) „Nejdéle měsíc před ukončením“ je právně určité, ale doplň ex-lege zánik.**
Zaniká-li dohoda výpovědí, končí **k 30. 6. nebo 31. 12.** (§ 47c odst. 5), takže měsíc
předem = od **31. 5.**, resp. **30. 11.** Deterministické, dobré. Ale dohoda zaniká i
**ex lege** (zletilost posledního dítěte, skončení PP, vyřazení z evidence) — tam měsíc
předem nemusí existovat vůbec. Pro tyto případy musí být cesta vydat kód **okamžitě**.

**b) Zákaz uzavření nové dohody nesmí zakázat její přípravu.**
Nová dohoda s pověřenou osobou vyžaduje **předchozí souhlas OÚ ORP** podle § 154
správního řádu (dok. 01 sekce 4) a ten trvá. Zároveň musí být nová dohoda uzavřena
**do 30 dnů** od zániku staré. Kdyby nová organizace nesměla nic dělat až do konce
staré dohody, byla by 30denní lhůta v praxi nesplnitelná.

> **Řešení:** zákaz se vztahuje na **účinnost** (`validFrom`), ne na přípravu.
> Nová organizace smí po uplatnění kódu založit dohodu ve stavu `draft` a zažádat
> o souhlas ORP, ale `validFrom` musí být ≥ konec staré dohody + `transitionGapDays`.

**c) Uvolnění nesmí být pákou staré organizace.**
Pěstoun může podle **§ 47c odst. 3 vypovědět dohodu bez udání důvodu** — to je jeho
zákonné právo. Kdyby přechod závisel výhradně na tom, že ho stará organizace „uvolní“,
postavíme nástroj, kterým lze pěstouna držet. To je nepřijatelné právně i eticky.

> **Řešení:** tři nezávislé cesty ke vzniku kódu:
> 1. **`released_by_org`** — standard: organizace uvolní pěstouna.
> 2. **`self_service`** — pěstoun si kód vygeneruje **sám**, je-li v systému zaznamenána
>    jeho doručená výpověď nebo dohoda o zániku. Nevyžaduje souhlas organizace.
> 3. **`issued_by_authority`** — kód vydá `superadmin` nebo ORP při sporu či ex-lege
>    zániku. Vždy s odůvodněním do auditu.
>
> Cesta 2 je pojistka. Bez ní systém nesmí jít do provozu.

### Stavový model

```
Pěstoun (Person, role foster):
  bound                 má aktivní dohodu, přechod neaktivní
  releasable            splněna okenní podmínka (≤ N dní před koncem) — kód lze vydat
  released              kód vydán a aktivní ("Uvolněn k přechodu")
  transferring          kód uplatněn novou organizací, nová dohoda v přípravě
  bound                 nová dohoda účinná → zpět na začátek
```

```ts
interface TransferCode {
  id: string
  code: string                  // zobrazuje se pěstounovi; ukládá se jen HASH
  personId: string
  issuedByOrgId: string | null  // null u self_service
  issueReason: 'released_by_org' | 'self_service' | 'issued_by_authority'
  issuedAt: string
  validFrom: string             // = den vydání
  validTo: string               // konec staré dohody + claimWindowDays
  earliestNewAgreementFrom: string   // konec staré dohody + transitionGapDays
  maxClaims: number             // default 1
  claims: Array<{ orgId: string; claimedAt: string; byUserId: string }>
  revokedAt: string | null
  revokedReason: string | null
  disclosureTier: 'existence' | 'existence_and_org'
}
```

**Formát kódu:** krátký, čitelný nahlas do telefonu, bez záměnných znaků.
Doporučení: **`PRE-XXXX-XXXX`**, abeceda Crockford Base32 bez `I O U L`, s kontrolní
číslicí. Ukládá se **jen hash** — kód je autentizační tajemství, ne identifikátor.
Rate-limit na pokusy o uplatnění; kód se **neváže na e-mail**, aby ho pěstoun mohl
předat osobně.

### Co nová organizace uvidí — odstupňované zpřístupnění

| Fáze | Vidí |
| --- | --- |
| Před uplatněním kódu | **nic**. Vyhledání pěstouna napříč tenanty není možné. |
| Po uplatnění, tier `existence` | že osoba **má aktivní dohodu**, její **datum konce**, nejbližší možný `validFrom` nové dohody, typ PP (zprostředkovaná/ne) a jestli je osobou pečující nebo v evidenci — tedy minimum nutné pro přípravu dohody a souhlasu ORP |
| Po uplatnění, tier `existence_and_org` | navíc **název staré organizace** a jejího kontaktu — jen pokud to pěstoun při generování kódu **výslovně povolí** |
| Kdykoli, se samostatným souhlasem pěstouna | **závěrečná zpráva** a vybrané dokumenty ze spisu (metodika doporučuje, aby je pěstoun novému subjektu předal sám — systém to jen usnadní) |

Osobní údaje dětí se nepředávají nikdy automaticky. Přenos spisu je samostatný,
explicitní, auditovaný úkon s dvojím souhlasem.

**Proč to je GDPR-čisté:** zpřístupnění je iniciováno **subjektem údajů** předáním
tajemství, které drží on. Není to sdílení mezi správci za jeho zády. Právní titul je
jeho jednání, ne oprávněný zájem organizací.

### Dopad na registr aktivních dohod
Registr (`titleRegistry` v zadání) zůstává jediným místem globální unikátnosti, ale:
- **záznam per osoba**, ne per dohoda (kvůli manželům — dok. 01 sekce 2);
- **klientovi nikdy nečitelný** — kontrola jen server-side v transakci
  (Cloud Function). Zadání ho mělo jako běžnou kolekci, což prozrazuje, u koho má
  pěstoun dohodu.
- při přechodu obsahuje **plánovaný konec**, aby šla vyhodnotit okenní podmínka pro
  vydání kódu bez čtení cizí dohody.

### Parametry přechodu (verzované, per jurisdikce)
```ts
transfer: {
  releaseWindowDays: 31          // "nejdéle měsíc před ukončením"
  transitionGapDays: 1           // nejdřívější validFrom = konec + N; viz otevřená otázka
  claimWindowDays: 60            // pokrývá 30denní lhůtu na novou dohodu s rezervou
  allowSelfServiceOnRecordedNotice: true
  allowDraftBeforeOldAgreementEnds: true
}
```

---

## 4. Revidovaný datový model — přehled změn

Jen delta proti `02_DATOVY_MODEL_DB.md`; plné schéma až po odpovědích na otevřené otázky.

### Přejmenování a odstranění
| Bylo | Je | Proč |
| --- | --- | --- |
| `fosterPersons` | `persons` (+ `roles[]`) | pěstoun, hlídající osoba i příbuzný jsou osoby; role je vztah |
| `ChildDoc.birthNumber` | `nationalIdentifiers[]` | jurisdikčnost |
| `AgreementDoc.fosterPersonUid` | `caregiverIds: string[]` (1–2) | § 47b odst. 7 |
| `grantAmountCzk`, `spvppBudgetCzk` | `grant: { amountMinor, currency, computedFrom }` | měna + odvozenost |
| `organizations.dailyRespiteCapCzk` | `orgPolicies/{orgId}/{version}` | vnitřní pravidla jsou verzovaná |
| `EducationLogDoc.year` | `educationPeriods` + `educationRecords` | klouzavé období, převod |
| `timeline.date` „YYYY-MM-DD HH:mm“ | ISO 8601 | konzistence |

### Nové kolekce
| Kolekce | Účel |
| --- | --- |
| `legalRulesets` | zákonné parametry, verzované, globální |
| `orgPolicies` | vnitřní pravidla organizace, verzovaná |
| `agreementConsents` | souhlas OÚ ORP (§ 154 spr. ř.) — blokuje aktivaci dohody |
| `expenses` | výdaje SPVPP s klasifikací na písmena, `paymentRoute`, `invoiceIssuedTo` |
| `careEpisodes` | krátkodobá / celodenní péče: dny, dítě, poskytovatel, vazba na IPOD |
| `careProviders` | FO/PO zajišťující péči: stav hlášení KÚ, bezúhonnost, prohlášení |
| `careLogs` | výkaz hlídání **s podpisem pěstouna** |
| `contactEvents` | styk dítěte s rodiči: příprava, místo, asistence, vyhodnocení |
| `reports` | zpráva o průběhu PP: 6měsíční cyklus, 3 adresáti, lhůta 15 dnů |
| `plans` | IPOD (přijatý od OSPOD), plán průběhu pobytu, plán vzdělávání |
| `authorities` | OSPOD/ORP/KÚ jako entity — u dítěte **dva různé úřady** |
| `transferCodes` | přechod pěstouna |
| `monitoringContacts` | osobní styk (§ 47b odst. 4) — samostatně od timeline, kvůli lhůtě |

### Klíčové nové atributy
```ts
interface Person {
  roles: Array<'caregiver' | 'in_evidence' | 'care_provider' | 'relative'>
  caregiverProfile?: {
    careType: 'mediated' | 'non_mediated'    // → 18 vs 24 h
    statusType: 'caring_person' | 'in_evidence'  // → 66 000 vs 72 000 Kč
    transferState: 'bound' | 'releasable' | 'released' | 'transferring'
  }
  careProviderProfile?: {
    relationToFamily: 'employee' | 'relative' | 'close_person' | 'other_caregiver' | 'external'
    contractType: 'dpp' | 'dpc' | 'tripartite' | 'mandate' | 'invoice'
    kuNotifiedAt: string | null
    integrityStatus: 'presumed' | 'confirmed' | 'failed'   // presumpce bezúhonnosti
    healthDeclarationAt: string | null
    livesInHouseholdWithChild: boolean       // true ⇒ nelze sjednat úplatu
  }
}

interface Child {
  dependencyLevel: null | 'I' | 'II' | 'III' | 'IV'   // II+ → +18 000 Kč
  orpChildResidenceId: string                          // adresát zprávy #3
  turned2At: string | null                             // podmínka respitu
}

interface Expense {
  rightCode: 'a'|'b'|'c'|'d'|'e'|'f'|'g'   // vyhodnocuje se přes rulesetId
  rulesetId: string
  amountMinor: number; currency: string
  incurredOn: string
  paymentRoute: 'direct_to_provider' | 'reimbursed_to_caregiver'
  invoiceIssuedTo: 'organization' | 'caregiver' | 'unknown'
  riskFlags: string[]                       // 'reimbursement_to_caregiver', ...
  childIds: string[]                        // faktura musí uvádět konkrétní dítě
  eligibility: { verdict: 'eligible'|'ineligible'|'needs_review'; reason: string; rulesetId: string }
}
```

---

## 5. Mobile-first PWA a offline provoz

Klíčové osoby pracují **v terénu, v domácnostech, často bez signálu**. Offline tedy
není komfort, ale funkční požadavek — a mění architekturu.

### Rozdělení dat podle režimu zápisu
Toto je jádro řešení a zpřesňuje mé dřívější doporučení („žádné CRDT pro multi-tenant“):

| Třída | Příklad | Režim | Konflikty |
| --- | --- | --- | --- |
| **Terénní záznamy** (append-only, jeden autor) | zápis z návštěvy, diktát, foto účtenky, výkaz hlídání | **plný offline zápis** do lokální fronty | **žádné** — jen se přidává |
| **Vlastní pracovní stav** | moje úkoly, koncepty | offline zápis, last-write-wins per uživatel | zanedbatelné |
| **Sdílené řízené entity** | stav dohody, přidělení pracovníka, výše SPVPP | **jen server** je autorita | offline se **nemění**, jen čte z cache |
| **Právní výpočty** | plnění vzdělávání, pásma čerpání, lhůty | **jen server** | – |

CRDT tedy nepotřebujeme: terénní zápisy jsou **jednopisatelské a přírůstkové**,
sdílené entity jsou server-autoritativní. Tenant boundary zůstává vynucená na serveru.

### Vzor: outbox / offline queue
```
Mobilní zápis → lokální IndexedDB (append-only outbox) → Background Sync →
  server validuje (tenant, role, právní pravidla) → potvrzení → lokální reconcile
```
- Každý záznam má **klientem generované ID** (ULID) → idempotentní opakování.
- Fronta je **viditelná uživateli**: „3 zápisy čekají na odeslání“. Terénní pracovník
  musí vědět, co ještě neodešlo, dřív než odejde od rodiny.
- Média (foto účtenky, audio diktátu) se ukládají lokálně a nahrávají zvlášť,
  s pokračovatelným uploadem — účtenka focená na okraji signálu nesmí blokovat zápis.
- **UID entit (`ROD-2026-001`) se offline nepřiděluje.** Alokace je transakční proti
  registru; offline vzniká záznam s dočasným ID a UID se přiřadí při synchronizaci.
  Zadání to nezmiňuje a je to past: dvě offline zařízení by jinak vyrobila stejné UID.

### Návrh pro terén, ne pro kancelář
- Primární akce dosažitelná **jedním palcem**; „Nový zápis“ a „Diktovat“ do dosahu.
- **Minimum psaní** — diktát je hlavní vstup, klávesnice záložní.
- Cílové plochy ≥ 44 px, čitelnost na slunci (kontrast z Geist tokenů, ne vlastní barvy).
- Funguje **na jedno spojení denně**: ráno stáhnout dnešní rodiny, večer odeslat.
- **Šetřit baterii**: žádný polling, žádné živé listenery na velké kolekce.
- Kalendář: požadavek zadání na izolovaný scroll 7:00–20:00 s autoscrollem je na mobilu
  ještě důležitější (scroll gesta kolidují s rolováním stránky) — proto **headless
  komponenta**, ne hotová knihovna, viz dřívější rešerše.

### Cesta na iOS/Android
PWA jako základ, nativní obal přes **Capacitor** — jedna kódová báze, přístup
k nativnímu STT, kameře, bezpečnému úložišti a spolehlivým push notifikacím
(u iOS PWA jsou notifikace a background sync historicky nespolehlivé, což je pro
terénní nástroj podstatné). Existující vrstva `design-system/pwa/` je pro tohle
připravená — včetně pravidla o inlinovaném `no-flash.js`.

### Bezpečnost mobilního zařízení
Zařízení s daty dětí v pěstounské péči se ztrácí. Proto:
- **žádná trvalá lokální kopie celého spisu** — jen dnešní/nejbližší rodiny, s TTL;
- vynucený zámek zařízení, biometrie pro vstup do aplikace;
- **vzdálené odhlášení** a smazání lokální cache (`active: false` na uživateli musí
  invalidovat i offline session);
- lokální data šifrovaná klíčem v secure enclave (přes Capacitor), ne v čistém IndexedDB.

---

## 6. AI za nových podmínek

### Co se změnilo
Rozhodnutí: **neposílají se nahrávky z návštěvy**, jen to, co klíčová osoba
**sama nadiktuje do systému**. To je významné zlepšení — z přenosu nezpracovaného
rozhovoru s dítětem se stává přenos pracovníkova strukturovaného sdělení.

### Co to nemění
Diktát pořád obsahuje **zvláštní kategorii osobních údajů podle čl. 9 GDPR** —
jde o dítě v náhradní rodinné péči, jeho zdraví a rodinnou situaci. Takže dál platí:
zpracovatelská smlouva, EU lokalita, vylučení trénování na datech, retenční lhůta,
záznam v auditu o každém volání.

### Návrh: dvoustupňová pseudonymizace
```
1. Diktát (text, případně STT)
2. LOKÁLNĚ: detekce a náhrada jmen/adres/RČ → placeholdery  {OSOBA_1}, {DITE_2}
3. Do LLM jde jen pseudonymizovaný text
4. LLM vrátí strukturu s placeholdery
5. LOKÁLNĚ: mapování placeholderů na skutečné entity ze spisu
```
Párování s databází pěstounů a dětí se tak dělá **lokálně**, kde jsou skutečná jména.
Poskytovatel modelu nedostane jméno ani rodné číslo.

### STT
Preferovat **on-device** (nativní STT přes Capacitor / Web Speech API), aby zvuk
neopouštěl zařízení. Až kde to nejde, EU-hostovaný Whisper. On-device má navíc výhodu
pro terén — funguje bez signálu, což se s offline-first architekturou přímo doplňuje.

### Hranice, kterou nepřekročit
AI **navrhuje**, člověk **potvrzuje**. Žádný AI výstup nesmí sám vytvořit záznam
v timeline spisu, úkol ani událost bez explicitního potvrzení pracovníka — zadání to
tak popisuje (`navrhne`) a je to správně. Do auditu se ukládá, co AI navrhla a co
člověk změnil; u spisu dítěte je dohledatelnost autorství podstatná.

---

## 7. Otevřené otázky

Potřebuji je rozhodnout, než začnu implementovat:

1. **Rozsah `key_worker`** (nezodpovězeno z minula, stále blokuje každý dotaz a rule):
   vidí klíčový pracovník **všechny** rodiny své organizace, nebo **jen přidělené**?
2. **`transitionGapDays`** — napsal jsi „od druhého dne po skončení staré Dohody“.
   Znamená to den následující (konec + 1), nebo skutečně přeskočit jeden den (konec + 2)?
   Právně je žádoucí **bez mezery**, takže bych volil konec + 1. Parametr každopádně
   nastavitelný.
3. **Zpřístupnění při přechodu** — má být default tier `existence`, nebo
   `existence_and_org`? Doporučuji `existence` a název organizace až na výslovné
   povolení pěstouna.
4. **Budou systém používat i OÚ ORP** jako doprovázející subjekty, nebo jen pověřené
   osoby? Pokud ano, musíme vynutit oddělení kontrolní a podpůrné role mezi dvěma
   zaměstnanci (dok. 01 sekce 10.11).
5. **Klientský portál pěstouna** — má vidět své výdaje SPVPP a stav pásem čerpání,
   nebo jen vzdělávání a plánované akce? Má finanční dopad na návrh oprávnění.
6. **Chybějící zdroje**: doplnit **vyhlášku 473/2012 Sb.** (§ 4, 4a, 5, 5c, 5f)
   a **OZ 89/2012 část druhou**. Bez § 5c/§ 5f nelze dokončit M3.
7. **Cílová jurisdikce č. 2** — pokud už víš, že to bude SK/jiná, ovlivní to, jak
   agresivně abstrahovat. Zatím navrhuji CZ jako jediný implementovaný pack
   s čistým rozhraním, ne spekulativní abstrakce.
