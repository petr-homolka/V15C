# 05 — Vysvětlení adresátů zprávy, § 965 OZ a Směrnice jako referenční `orgPolicy`

Navazuje na [04](./04-opravneni-parametry-a-vzor-dohody.md).
Doplněné zdroje: **zákon č. 89/2012 Sb.** a **Směrnice č. 1 „Poskytování finančních
náhrad pečujícím osobám“** (skenovaný PDF, 3 strany, platnost od 1. 1. 2025).

---

## 1. Vysvětlení bodu 2 z dokumentu 04 — adresáti zprávy

Formuloval jsem to zkratkovitě. Rozepisuji.

### Co říká zákon

§ 47b odst. 5 ZSPOD, doslovně:

> „Obecní úřad obce s rozšířenou působností nebo pověřená osoba **zpracují nejméně
> jednou za 6 měsíců a při zániku dohody** o výkonu pěstounské péče zprávu o průběhu
> výkonu pěstounské péče a naplňování dohody o výkonu pěstounské péče a **předají ji**
> **osobě pečující, osobě v evidenci**, **obecnímu úřadu obce s rozšířenou působností,
> který je místně příslušný k podání návrhu na uzavření dohody** o výkonu pěstounské
> péče, **a obecnímu úřadu obce s rozšířenou působností, v jehož obvodu má trvalý pobyt
> dítě** svěřené do pěstounské péče, a to **do 15 dnů ode dne vypracování této zprávy**.“

Tedy tři adresáti:

| # | Adresát | Kdo to je v praxi |
| --- | --- | --- |
| 1 | **osoba pečující / osoba v evidenci** | **sám pěstoun** |
| 2 | OÚ ORP místně příslušný k podání návrhu na dohodu | ORP podle **trvalého pobytu pěstouna** |
| 3 | OÚ ORP, v jehož obvodu má trvalý pobyt **dítě** | ORP **dítěte** — může to být **jiný úřad** než #2 |

Plus **lhůta 15 dnů** od vypracování a plus povinnost zpracovat zprávu **také při zániku
dohody**, nejen v šestiměsíčním cyklu.

### Co říká vzor Dohody

Čl. VI, poslední odstavec:

> „Klíčový pracovník zpracovává 1x za 6 měsíců zprávu o průběhu výkonu
> pěstounské/poručenské péče, kterou poskytuje **místně příslušnému OSPOD**.“

Jmenuje tedy **jen adresáta #2**. Chybí #1 (pěstoun) a #3 (ORP dítěte), chybí lhůta
15 dnů a chybí zpráva při zániku dohody. Když jsem napsal „vzor dva adresáty i lhůtu
vynechává“, mínil jsem: ze tří zákonných adresátů vzor jmenuje jeden, dva chybí.

### Kde jsem byl v hodnocení příliš tvrdý

Označil jsem to jako „chybu ve vzoru“. To si zaslouží korekci, protože **Informace MPSV
k dohodám** výslovně říká, že dohoda nemusí opakovat povinnosti plynoucí přímo ze zákona
— a jako příklad používá právě tuhle zprávu:

> „Není nutné, aby dohoda obsahovala úpravu závazků vyplývajících přímo z právní úpravy
> (není např. třeba výslovně uvádět, že smluvní partner bude podávat místně příslušnému
> orgánu sociálně-právní ochrany dětí každých 6 měsíců zprávu o výkonu pěstounské péče,
> jak vyplývá z § 47b odst. 5 ZSPOD…).“

Takže **kdyby vzor o zprávě nemluvil vůbec, bylo by to v pořádku** a povinnost by platila
dál. Problém není v tom, že vzor něco vynechal, ale že o věci mluví **částečně**:

1. **Nepřesné částečné znění je zavádějící víc než mlčení.** Pěstoun si z čl. VI přečte,
   že zpráva jde „na OSPOD“, a nedozví se, že **on sám je jejím adresátem**.
2. **A to není formalita.** Metodika doprovázení k tomu: pěstoun *„musí být s obsahem
   zprávy seznámen a má právo se k ní vyjádřit (jeho vyjádření se stane součástí závěrů)
   a vyžádat si kopii.“* Pěstounovo vyjádření se tedy stává **součástí závěrů zprávy** —
   je to krok v procesu, ne rozeslání kopie na vědomí.
3. **Pro systém je to jedno.** Povinnost je zákonná, takže workflow musí mít tři adresáty
   a lhůtu 15 dnů **bez ohledu na to, co je ve dohodě napsáno.**

### Co z toho plyne pro implementaci

Workflow zprávy není „vygeneruj a odešli“, ale:

```
1. Klíčová osoba sestaví zprávu                     → status: draft
2. Pěstoun se s obsahem seznámí                     → acknowledgedByCaregiverAt
3. Pěstoun se může vyjádřit                         → caregiverStatement (nepovinné)
4. Vyjádření se vloží do závěrů zprávy              → status: final
5. Předání třem adresátům, každý zvlášť sledovaný   → do 15 dnů od vypracování
   ├── pěstoun (kopie na vyžádání i bez toho)
   ├── ORP pěstouna
   └── ORP dítěte (jiný úřad!)
```

```ts
interface Report {
  kind: 'periodic_6m' | 'on_termination'
  drafitedOn: string                    // od tohoto dne běží 15 dnů
  dueBy: string                         // draftedOn + 15 dnů
  acknowledgedByCaregiverAt: string | null
  caregiverStatement: string | null     // vstupuje do závěrů
  deliveries: Array<{
    recipientKind: 'caregiver' | 'orp_caregiver' | 'orp_child_residence'
    authorityId: string | null
    deliveredOn: string | null
    channel: 'isds' | 'email' | 'in_person' | 'post'
    proofDocumentId: string | null      // doručenka
  }>
}
```

Tři samostatné `deliveries` jsou důležité: **ORP dítěte je jiný úřad než ORP pěstouna**,
takže „odesláno“ nemůže být jedno pole. A při stěhování dítěte se adresát #3 mění.

---

## 2. § 965 odst. 3 a § 655 odst. 2 OZ — potvrzeno

Tím se zavírá poslední právní mezera u poskytovatelů péče.

> **§ 965 odst. 3:** „Na osobní péči o dítě v pěstounské péči **se podílí i manžel
> pěstouna, pokud žije v rodinné domácnosti**.“

> **§ 655 odst. 2:** „Partnerství je trvalý svazek dvou lidí stejného pohlaví… Nestanoví-li
> zákon nebo jiný právní předpis jinak, **vztahují se na partnerství a práva a povinnosti
> partnerů ustanovení o manželství, právech a povinnostech manželů** … **obdobně**.“

Ve spojení: povinnost podílet se na osobní péči má **manžel i registrovaný partner**
pěstouna, žije-li v **rodinné domácnosti**. Proto jim **nelze** proplatit hlídání jako
službu — plní vlastní zákonnou povinnost. Jiná osoba žijící ve společné domácnosti
takovou povinnost **nemá** (Instrukce 3/2025), takže u ní úplata možná je.

**Terminologická přesnost pro model:** OZ používá **„rodinná domácnost“**, metodiky
mluví o „společné domácnosti“. Rozhodující je test podle OZ. Pole proto pojmenovat
`livesInFamilyHouseholdWithChild` a v UI popsat jako „žije v rodinné domácnosti“.

```ts
careProviderProfile: {
  relationToCaregiver: 'spouse' | 'registered_partner' | 'other_household_member'
                     | 'relative' | 'close_person' | 'employee' | 'external'
  livesInFamilyHouseholdWithChild: boolean
  // Blokace úplaty: spouse|registered_partner ∧ livesInFamilyHousehold ⇒ nelze proplatit
}
```

Dále z § 965 odst. 1: dítě lze svěřit do pěstounské péče **jen jednoho z manželů se
souhlasem druhého** — souvisí s výjimkou podle § 47b odst. 7 (oddělené dohody manželů).
A § 966 odst. 3: ustanovení o pěstounovi platí **obdobně pro předpěstounskou péči**,
což potvrzuje `custodyType: 'pre_foster'`.

---

## 3. Směrnice č. 1 jako referenční instance `orgPolicy`

Skvělý nález — je to **reálný doklad, že tříúrovňový model parametrů odpovídá praxi.**
Dohoda na tuto směrnici odkazuje slovem „aktuální“ a směrnice sama nese číslo, platnost
a počet stran, tedy je to **verzovaný dokument**.

### Struktura směrnice → struktura `orgPolicy`

| Čl. | Oblast | Odpovídá právu |
| --- | --- | --- |
| I. | obecná ustanovení, způsob proplácení, žádost | — |
| II. | zprostředkování odborné péče | § 47a odst. 2 písm. c), d) |
| III. | respit | písm. b) |
| IV. | krátkodobá péče (ZKP) | písm. a) |
| V. | vzdělávání | písm. f) |
| VI. | kontakt (styk) s rodinou | písm. e) |
| VII. | přebírání a předávání dítěte z přechodné péče | § 47a odst. 2, PPPD |

Šest z sedmi písmen platného § 47a odst. 2 — což potvrzuje, že klasifikace výdajů
**na písmena** je správná osa (dok. 04 sekce 2).

### Vytěžené parametry

```ts
// orgPolicy: Host. pro NelhoStejnost z.s., verze 'smernice-1', validFrom 2025-01-01
{
  payout: {
    timing: 'after_event',              // "zpravidla až po uskutečnění události"
    advanceAllowed: 'individual_justified_with_binding_order',
    methods: ['cash_against_signature', 'bank_transfer'],
    approvedBy: ['authorized_worker', 'management'],
    requiresWrittenApplication: true,   // "Žadatel vyplňuje písemnou žádost"
  },

  professionalHelp: {                   // čl. II
    minFrequencyPerMonths: 6,           // POZOR: zastaralé, viz sekce 4
    coverage: 'up_to_full_amount',
    assessedBy: ['key_person', 'service_lead'],
    assessmentInputs: ['individual_plan', 'ipod'],
  },

  respite: {                            // čl. III
    childMinAgeYears: 2,
    maxDaysPerCalendarYear: 14,
    countingUnit: 'day',                // "lze čerpat za 1 den, i když akce trvala jen několika hodin"
    perChildPerDayMaxMinor: 45_000,     // 450 Kč
    maxShareOfPricePct: 70,             // příspěvek ≤ 70 % ceny pobytu
    annualTotalMaxMinor: 630_000,       // 6 300 Kč  (= 14 × 450, vnitřně konzistentní)
  },

  shortTermCare: {                      // čl. IV
    providedBy: ['own_employee', 'babysitter_employee'],
    costToCaregiver: 'free',
  },

  education: {                          // čl. V
    internal: 'free',
    externalContribution: 'discretionary_key_person',
    maxHoursPerYear: 24,                // "24 (příp. 18)"
    reducedByInternalHoursAttended: true,   // ← vlastní pravidlo, zákon nezná
    evidenceRequired: ['payment_proof', 'certificate'],
    accommodation: {
      perPersonPerNightMaxMinor: 100_000,   // 1 000 Kč — viz sekce 4
      minHoursPerDay: 6,
      onlyNightBetweenTwoDays: true,
    },
    travel: { publicTransportFromResidence: true, evidence: 'marked_tickets' },
  },

  contact: {                            // čl. VI
    coversAssistingEmployee: true,
    assistantMustDifferFromFamilyKeyPerson: true,   // ← organizační pravidlo oddělení rolí
    childTransportInJustifiedCases: true,
    carTravel: {
      basis: 'avg_consumption_km_fuelprice',
      fuelPriceSource: 'receipt_or_mpsv_decree_for_period',   // ← viz sekce 5
    },
  },

  transitionalCareHandover: {           // čl. VII
    transportJustifiedOverKm: 30,
    accommodationJustifiedOverKm: 50,
    accommodationMaxDays: 5,
    accommodationPerNightMaxMinorForBothCaregivers: 100_000,  // 1 000 Kč pro oba včetně
    evidence: 'accommodation_receipt_showing_days_and_persons',
  },
}
```

---

## 4. Tři napětí ve Směrnici

**1. Hotovostní proplácení pěstounovi je zde výchozí režim.**
Čl. I: *„Finance se proplácí **zpravidla hotovostně proti podpisu na výdajový doklad**,
případně převodem na účet.“*

To je přesně **refundační princip**, který metodický materiál MPSV z 10. 2. 2025
označuje za nepřípustný. Ale směrnice je platná **od 1. 1. 2025**, tedy **před** tím
výkladem, a **právně závazná Instrukce VŘ2 3/2025 tento způsob nadále připouští**
(„úhrada samotné osobě pečující, která doloží úhradu a využití“). Podle zápisu MPSV–ADaR
je jediným závazným materiálem Instrukce, metodiky jsou doporučující.

**Není to tedy protizákonné, ale je to přesně ten rizikový režim, pro který jsem
navrhoval `paymentRoute`.** Reálná směrnice tuto část návrhu potvrzuje — a zároveň
ukazuje, že organizace bude potřebovat **cestu k harmonizaci**: systém by měl umět
vykázat, jaký podíl výdajů šel kterým režimem, aby se organizace mohla rozhodnout
a případně směrnici upravit před kontrolou ÚP.

**2. Ubytování 1 000 Kč je zastaralé, a to směrem k horšímu pro pěstouna.**
Čl. V: max. **1 000 Kč/osoba/noc**. Instrukce 3/2025 ale zvedla „přiměřené“ ubytování
na **1 500 Kč**. Směrnice je z téhož měsíce, ale nese ještě částku ze zrušené
Instrukce 8/2019. Jako vnitřní pravidlo být striktnější **může** — ale pokud chtěla
kopírovat Instrukci, je o 500 Kč pozadu a pěstoun je krácen.

> Odtud plyne konkrétní funkce, kterou systém musí mít: **porovnání vnitřního pravidla
> se zákonným stropem** ze sady pravidel a upozornění, když organizace zůstala pod ním
> po novele. Bez toho tahle chyba přežije roky — což se právě stalo.

**3. „1× za 6 měsíců“ u odborné pomoci je zastaralé na dvou místech.**
Táž neplatná frekvence je v Dohodě (čl. IV/C) **i** ve Směrnici (čl. II). Zmizela
novelou 2024 z § 47a odst. 2 písm. d). Jeden zastaralý fakt zduplikovaný do dvou
dokumentů — přesně to, čemu parametrizovaný systém předchází: **jedna hodnota, jeden
zdroj, obojí se generuje.**

---

## 5. Dvě zpřesnění architektury, která Směrnice vynutila

### a) Některé parametry jsou datované řady, ne verzované skaláry

Čl. VI: *„cena PHM daná **aktuální vyhláškou MPSV pro dané období**“.*
Průměrná cena pohonných hmot se vyhláškou mění **minimálně jednou ročně**, někdy
i v průběhu roku. Modelovat ji jako pole v sadě pravidel je špatně — vznikla by nová
verze celé sady kvůli jednomu číslu.

```ts
// vedle skalárních parametrů: datované řady
parameterSeries: {
  'cz.fuel_price.petrol_95': [
    { validFrom: '2025-01-01', valueMinor: 3_570, unit: 'CZK/l', source: 'vyhláška …' },
    { validFrom: '2026-01-01', valueMinor: 3_450, unit: 'CZK/l', source: '…' },
  ],
  'cz.mileage_rate.car': [ … ],
}
```
Vyhodnocení: hodnota platná **ke dni cesty**, ne k dnešku. Stejný invariant jako
u sad pravidel, jen jemnější granularita.

### b) Před výdajem stojí žádost — chybí mi entita

Čl. I: *„Žadatel o příspěvek **vyplňuje písemnou žádost**.“* Model v dok. 03 začínal
až u `Expense`, tedy u hotového výdaje. Reálný proces má krok předtím:

```
BenefitRequest (žádost)  →  schválení  →  plnění  →  Expense (výdaj)  →  proplacení
```

```ts
interface BenefitRequest {
  id: string
  agreementId: string
  requestedByPersonId: string        // pěstoun
  rightCode: 'a'|'b'|'c'|'d'|'e'|'f'
  requestedForChildIds: string[]
  requestedAmountMinor: number | null
  justification: string
  status: 'submitted' | 'approved' | 'partially_approved' | 'rejected' | 'settled'
  decidedByPersonId: string | null
  decidedOn: string | null
  approvedAmountMinor: number | null
  orgPolicyVersion: string           // podle jaké směrnice se rozhodovalo
  expenseIds: string[]
}
```

To má i praktický důsledek pro **portál pěstouna**: podání žádosti o respit nebo
proplacení vzdělávání je přirozeně věc pěstouna a spadá do dvou agend, které podle
rozhodnutí vidět má (vzdělávání a respit). Doplňuji tedy do portálu **„Podat žádost“** —
což je koherentní s tím, že výdaje jako takové nevidí: vidí **svou žádost a její stav**,
ne rozpočet organizace.

---

## 6. Stav zdrojů

| Zdroj | Stav |
| --- | --- |
| ZSPOD 359/1999 Sb. | ✓ |
| Vyhláška 473/2012 Sb. | ✓ (bez příloh — standardy kvality) |
| OZ 89/2012 Sb. | ✓ |
| Instrukce VŘ2 3/2025 | ✓ |
| Vzor Dohody | ✓ |
| Směrnice č. 1 (vnitřní pravidla) | ✓ |
| **Standardy kvality** (přílohy č. 1 a 2 vyhlášky) | ✓ **byly v souboru** — mylně jsem je označil za chybějící, viz dok. 07 sekce 0 |

Standardy kvality jsou poslední chybějící kus a jsou potřeba pro model plánů a spisu.
Vzor Dohody se na ně v čl. VIII odvolává a podléhají inspekci SPOD.
