# 06 — Dvouúrovňová nastavitelnost, generátor Standardů a plány

Navazuje na [05](./05-smernice-jako-orgpolicy.md).
Doplněné zdroje: **Individuální vzdělávací plán** a **Individuální plán průběhu
pěstounské péče** z reálné praxe.

---

## 1. Dvouúrovňová nastavitelnost — a proč nesmí být neomezená

Zadání: *„Všechny částky, tarify, sazby, limity, termíny a cokoli, co se může měnit,
musí být nastavitelné na úrovni systému a organizace.“*

Zavádím to — ale s jedním doplněním, bez kterého by to byla past.

> **Kdyby byl každý parametr volně přepisovatelný na úrovni organizace, organizace se
> může sama nakonfigurovat do nesouladu se zákonem.** Nastavila by si ubytování na
> 2 000 Kč (zákonné maximum je 1 500), zánik dohody k 31. 3. (zákon zná jen 30. 6.
> a 31. 12.) nebo osobní styk 1× za 6 měsíců (zákon žádá 1× za 2 měsíce) — a systém
> by ji v tom podpořil. U agendy, kterou kontroluje ÚP a inspekce SPOD, je to
> nepřijatelné.

Řešení: **každý parametr nese pravidlo, jak smí být přepsán.** Nastavitelné je všechno,
ale mantinely drží zákon.

### Řetěz vyhodnocení

```
legalParameter   (jurisdikce, verzované)   ← zákon: strop / minimum / pevná hodnota
      ↓ omezuje
systemDefault    (platforma, verzované)    ← superadmin
      ↓ přepisuje
orgSetting       (organizace, verzované)   ← org_admin
      ↓ přišpendluje
agreement.policyBinding                    ← co platí pro tuto dohodu
```

### Pravidla přepisu

```ts
type OverridePolicy =
  | 'fixed'         // nesmí změnit nikdo pod zákonem
  | 'max'           // zákon dává strop; systém i organizace smí NÍŽ
  | 'min'           // zákon dává minimum; systém i organizace smí VÝŠ
  | 'max_interval'  // zákon dává max. odstup; smí se ČASTĚJI
  | 'free'          // zákon nic neurčuje — plně volné
  | 'reference'     // zákon dává referenční hodnotu, lze doložit i skutečnost
```

| Parametr | Politika | Zákonná hodnota | Smí organizace |
| --- | --- | --- | --- |
| Zánik dohody k pololetí | `fixed` | 30. 6. / 31. 12. | ✗ |
| Výpověď min. dnů před koncem | `fixed` | 30 | ✗ |
| Výše SPVPP | `fixed` | 66 000 / 72 000 / +18 000 | ✗ |
| Pásma čerpání § 5c | `fixed` | 5–15 / 10–20 / 5–10 % | ✗ (má vlastní únikovou klauzuli) |
| Věk dítěte pro respit | `fixed` | 2 roky | ✗ |
| Povinné hodiny vzdělávání | `fixed` | 18 / 24 | ✗ |
| Úhrada za stravu | `max` | 260 / 120 Kč | ↓ méně |
| Úhrada za ubytování dítěte | `max` | 90 Kč/den | ↓ méně |
| Ubytování při vzdělávání | `max` | 1 500 Kč/os./noc | ↓ méně |
| **Leasing vozu** | `max` | **500 Kč / dohoda / měsíc** | ↓ méně |
| Respit — nárok ve dnech | `min` | „alespoň 14“ | ↑ více |
| Osobní styk | `max_interval` | 2 měsíce | ↑ častěji |
| Zpráva o průběhu PP | `max_interval` | 6 měsíců | ↑ častěji |
| Předání zprávy adresátům | `max_interval` | 15 dnů | ↑ dřív |
| **Frekvence odborné pomoci** | **`free`** | — (novela 2024 ji zrušila) | ✓ libovolně |
| **Cena PHM** | **`reference`** | vyhláška MPSV, datovaná řada | ✓ nebo skutečná účtenka |
| Hodinové sazby hlídání | `free` | — | ✓ |
| Příspěvek na respit / den | `free` | — | ✓ |
| Podíl z ceny pobytu (70 %) | `free` | — | ✓ |
| Kapacita rodin na FTE | `free` | 18–23 (doporučení) | ✓ |

### Dvě validace, obě povinné

**1. Při uložení** — hodnota mimo mantinel se neuloží; hlášení uvede, který předpis
mantinel stanoví.

**2. Při publikaci nové zákonné sady** — projede se všechna nastavení organizací:

- **`max` a organizace je pod novým stropem** → informativní upozornění
  *„Ubytování při vzdělávání máte 1 000 Kč, zákonné maximum se od 21. 1. 2025 zvýšilo
  na 1 500 Kč. Krátíte pěstouny o 500 Kč.“*
  ← přesně případ, který jsem našel v reálné Směrnici (dok. 05 sekce 4)
- **`min` / `max_interval` a organizace je pod zákonem** → **tvrdá chyba**, nastavení
  se označí jako nesouladné a musí se opravit
- **`fixed` se změnil** → automatická aktualizace, organizaci se to jen ohlásí

Bez druhé validace zastaralé nastavení přežije roky. Což se v té Směrnici stalo.

---

## 2. Proplácení jako vypínatelné povolení

Zadání: povolení/zákaz na úrovni systému a organizace.

```ts
reimbursement: {
  // Platforma určuje OBÁLKU: smí to organizace vůbec zapnout?
  allowReimbursementToCaregiver: {
    systemPermits: boolean          // superadmin — hard gate
    orgEnabled: boolean             // org_admin, jen když systemPermits
  }
  allowDirectToProvider: boolean               // prakticky vždy zapnuto
  requireInvoiceIssuedToOrganization: boolean  // vynutit odběratele = organizace
  requireJustificationWhenReimbursing: boolean
  cashPayoutAllowed: boolean                   // „hotovostně proti podpisu“
}
```

Dvouúrovňovost tu má konkrétní smysl: platforma může refundaci **zakázat globálně**
(kdyby MPSV výklad zpřísnil na závaznou úroveň) a organizace se pak nemá jak vrátit.
Dokud ji platforma připouští, rozhoduje organizace sama.

Vazba na model výdaje: `paymentRoute: 'reimbursed_to_caregiver'` je **odmítnut při
zápisu**, pokud `orgEnabled = false`. Když je zapnutý, výdaj nese `riskFlags` a
povinné odůvodnění (dok. 04). Reálná Směrnice má refundaci jako **výchozí** režim,
takže tohle přepínání není teoretické.

---

## 3. Kontrola stropu leasingu vozu — návrh

Instrukce 3/2025: *„podíl hrazený ze SPVPP může činit maximálně **500 Kč na uzavřenou
dohodu o výkonu pěstounské péče měsíčně**.“*

### Výpočet — musí být po měsících, ne ročně

Nejčastější chyba by byla vzít `500 × 12 × dnešní počet dohod`. Počet dohod se ale
v průběhu roku mění, takže limit se musí skládat po měsících:

```
limit(období) = Σ  rate(m) × početDohod(m)
              m ∈ období
```

- `rate(m)` — sazba **platná v měsíci m** (verzovaná: měnila se 300 → 500 Kč)
- `početDohod(m)` — dohody účinné v měsíci m

```
čerpáno(období) = Σ  fakturovanáČástka(i) × spvppSharePct(i)
                  i ∈ výdaje na leasing/nájem vozu
```

**Pořadí operací je podstatné.** Je-li vůz používán i k jiné činnosti, ze SPVPP je
uznatelná jen poměrná část — takže **nejdřív poměr, pak strop**. Obráceně by výsledek
byl nadhodnocený.

### Stavy a co zobrazit

| Stav | Podmínka | Zobrazení |
| --- | --- | --- |
| **zelená OK** | čerpáno ≤ 90 % limitu | „V limitu — zbývá 4 200 Kč“ |
| **žlutá** | 90 % < čerpáno ≤ 100 % | „Blížíte se limitu — zbývá 380 Kč“ |
| **červená** | čerpáno > limitu | „**Nad limit o 2 100 Kč** — tuto část nelze hradit ze SPVPP, je nutné ji pokrýt z jiných zdrojů“ |

Přidávám žlutý stupeň, protože binární OK/varování dá informaci až v momentě, kdy je
překročení hotové — a to je pozdě.

**Formulace u červené je záměrná.** Překročení **není účetní chyba**, je to
**neuznatelnost**: částka nad limit prostě nesmí jít ze SPVPP. Hlášení proto říká,
kolik přesunout jinam, ne „chyba“.

### Detaily, které se snadno přehlédnou

1. **Strop je na organizaci, ne na vůz.** Dva vozy se dělí o jeden limit.
2. **Faktura za víc měsíců** (kvartální leasing) se **rozpouští do měsíců**, jinak
   jeden měsíc přeteče a ostatní zůstanou nevyužité.
3. **Dohoda uzavřená v průběhu měsíce** — zákon říká „na uzavřenou dohodu měsíčně“
   a nerozlišuje. Volím výchozí `countBasis: 'any_day_in_month'` (dohoda účinná
   kterýkoli den v měsíci se počítá celá), ale **je to výklad**, proto nastavitelné:
   `'any_day_in_month' | 'active_at_month_start' | 'pro_rata_days'`.
4. **Odkupní cena a sankce** z leasingu jsou **neuznatelné vždy** (Instrukce) —
   nevstupují do čerpání, ale musí jít zaevidovat jako neuznatelné.
5. Ukazatel patří na dashboard `org_admin`, ne Klíčové osoby — je to organizační limit.

```ts
interface VehicleLeaseCompliance {
  organizationId: string
  period: { from: string; to: string }
  months: Array<{
    month: string              // '2026-03'
    rateMinor: number          // sazba platná v tomto měsíci
    agreementCount: number
    allowanceMinor: number     // rate × count
    chargedMinor: number       // po aplikaci spvppSharePct
  }>
  totalAllowanceMinor: number
  totalChargedMinor: number
  status: 'ok' | 'approaching' | 'exceeded'
  excessMinor: number          // > 0 ⇒ pokryjte z jiných zdrojů
  rulesetIds: string[]         // reprodukovatelnost pro kontrolu ÚP
}
```

Stejný vzor („limit × počet nositelů × měsíce“) půjde později použít i pro pásma § 5c,
až je zapneme.

---

## 4. Generátor Standardů kvality

Zadání: systém vygeneruje kapitoly standardních Standardů; plná adopce = OK; změní-li
organizace pasáže, má se podle toho **změnit nastavení systému**; Standardy jsou vždy
platné **„Od…“**.

### Struktura

```ts
interface StandardsTemplate {
  jurisdiction: string
  subjectType: 'delegated_person' | 'orp'   // příloha 2 vs příloha 1 vyhlášky
  version: string
  effectiveFrom: string                      // „platné od…“
  effectiveTo: string | null
  chapters: StandardChapter[]
}

interface StandardSection {
  code: string                 // '10c', '10d', '13a', …
  title: string
  bodyTemplate: string         // prosa se zástupnými hodnotami
  bindings: Array<{
    paramPath: string          // 'monitoring.personalContactMaxIntervalMonths'
    renderAs: string           // '{{ contactInterval }}'
  }>
  requiredEvidence?: string[]  // jaké artefakty systém musí umět vytvořit
}
```

### Adopce a odchylka

Na každou sekci má organizace čtyři možnosti:

| Akce | Co se stane s nastavením |
| --- | --- |
| **`adopt`** | přebírají se hodnoty ze šablony; nastavení = systémový default |
| **`modify`** | edituje se **vázaná hodnota** → mění se `orgSetting` a prosa se **přegeneruje** |
| **`extend`** | přidává se vlastní pasáž; vázané hodnoty zůstávají |
| **`replace`** | vlastní text; **vazba se rozpojí** → organizace musí parametr nastavit výslovně |

### Klíčové rozhodnutí o směru kauzality

> **Parametr je zdroj pravdy, prosa se z něj generuje** — ne naopak.

Vázané hodnoty se needitují psaním do textu, ale **jako pole**. Změna pole zároveň
přepíše `orgSetting` a přegeneruje větu. Tím vzniká přesně to, co zadání žádá —
změna pasáže mění nastavení — ale ve směru, který je spolehlivý. Kdyby zdrojem byla
prosa, museli bychom z textu parsovat čísla a při každé úpravě formulace by se
nastavení rozešlo s textem.

Volná prosa mimo vazby je editovatelná bez dopadu na nastavení.

**Poctivé omezení:** u sekce `replace` systém **nedokáže** ověřit, že vlastní text
odpovídá nastavení — prózu neparsujeme. Taková sekce se proto označí
`unverifiedBinding: true` a jde do přehledu k ruční kontrole. Radši to přiznat než
předstírat kontrolu, která neexistuje.

### Platnost „Od…“ a revize

- Standardy jsou **verzované a datované**, jako zákonné sady.
- Dohoda na ně odkazuje (vzor, čl. VIII) → **přišpendlená verze** na dohodě.
- Publikuje-li platforma novou verzi (např. po změně vyhlášky), organizace dostane
  **diff**: co se změnilo v textu, **která nastavení to mění** a které její vlastní
  úpravy jsou v konfliktu. Adopce nové verze je vědomý úkon s datem účinnosti.
- Inspekce SPOD kontroluje standardy → musí být dohledatelné, **jaká verze platila
  kdy**, včetně kdo a kdy sekci změnil.

### Co ještě nemám

Text **příloh č. 1 a 2 vyhlášky 473/2012 Sb.** stále chybí — v dodaném znění vyhlášky
přílohy nejsou. Mohu tedy postavit **mechanismus** (šablona, adopce, vazby, verzování),
ale **seznam kapitol nemohu vyplnit**, aniž bych si ho vymyslel. Z metodik mám ověřeně
jen kódy: **10c** plán průběhu pobytu, **10d** plán vzdělávání, **13a** spisová
dokumentace pro pověřené osoby, a **15c / 15d** jako jejich obdoby pro OSPOD.
Zbytek doplním, až přílohy dodáš.

---

## 5. Plány — model z reálných dokumentů

Oba dodané plány potvrzují dřívější analýzu a odhalují jednu asymetrii.

### Zjištění: plány mají různý základ období

| Plán | Období v reálném dokumentu | Základ |
| --- | --- | --- |
| **Individuální vzdělávací plán** | **15. 7. 2026 – 15. 7. 2027** | **klouzavých 12 měsíců** od uzavření dohody |
| **Individuální plán průběhu PP** | **1/2025 – 12/2025** | **kalendářní rok** |

To potvrzuje § 47a odst. 3 u vzdělávání (období ukotvené datem dohody, ne rokem) a
zároveň ukazuje, že u plánu pobytu praxe jede po kalendářním roce. **`periodBasis`
proto nemůže být globální nastavení — je per typ plánu**, a podle zadání nastavitelné
na obou úrovních.

### Individuální vzdělávací plán

```ts
interface EducationPlan {
  personId: string                    // per OSOBA — povinnost je osobní
  agreementId: string
  periodFrom: string; periodTo: string
  periodBasis: 'rolling_12m_from_agreement'
  needs: string[]                     // „Vzdělávací potřeby pečující osoby“
  records: EducationRecord[]          // Termín | Téma, název | Realizátor | Rozsah
  review: string                      // „Stručná revize vzdělávacího plánu“
  totalHours: number                  // DOPOČÍTANÉ, ne zadávané
  statutoryFulfilled: boolean         // DOPOČÍTANÉ
  preparedOn: string
  signedByCaregiverAt: string | null
  signedByKeyPersonAt: string | null
}
```

Sloupce tabulky ze vzoru sedí 1:1 na `EducationRecord` z dok. 03 —
`completedOn` / `courseTitle` / `provider` / `hours`.

Věta *„Pečující osoba splnila svou zákonnou povinnost.“* je ve vzoru napsaná ručně.
V systému musí být **dopočítaná** z hodin proti požadavku (18/24 minus převod) —
jinak se do dokumentu dostane tvrzení, které neodpovídá datům.

### Individuální plán průběhu pěstounské péče

```ts
interface PlacementCoursePlan {
  childId: string
  caregiverIds: string[]
  periodFrom: string; periodTo: string
  periodBasis: 'calendar_year'
  ipodId: string | null               // musí striktně vycházet z IPOD
  environmentDescription: string      // bydlení, složení domácnosti, finance, bezpečí
  areas: Array<{
    areaCode: string                  // z nastavitelného číselníku, viz níže
    title: string
    goals: Array<{
      text: string                    // cíl včetně jednotlivých kroků
      targetDate: PartialDate         // ← pozor, viz níže
      status: 'open' | 'met' | 'partially_met' | 'dropped'
    }>
    review: string | null
  }>
  overallReview: string | null
  preparedOn: string
  signedByCaregiverAt: string | null
  signedByKeyPersonAt: string | null
}
```

**Číselník oblastí cílů** — vzor uvádí doporučené domény: *volný čas, péče o zdraví,
kontakty s rodinou, změny v životě dítěte, škola*. Reálný dokument si ale vytvořil
vlastní („Řádný vývoj nezl.“, „Lékařská péče“, „Budování zdravé identity“). Číselník
proto musí být **nastavitelný na obou úrovních** a s možností vlastní oblasti.

**`PartialDate` s přesností na měsíc.** Termíny ve vzoru jsou `12/2025`, jeden dokonce
`12 /2025` (mezera). Skutečná data jsou neuklizená, takže:

```ts
type PartialDate = { year: number; month?: number; day?: number }
```

Ukládat to jako `string` v ISO by vynutilo domýšlení dne, který nikdo nezadal, a
vstup musí tolerovat mezery a obě lomítka. Metodika přitom žádá cíle **„časově
ohraničené“** — měsíc to splňuje, den ne vždy.

### Společné pro oba plány

Metodika: plán je sestavován **za participace** pěstouna (a u plánu pobytu i dítěte)
a **oba ho musí mít k dispozici**. Proto jsou v modelu obě podpisová pole a plán
je viditelný v portálu pěstouna — u vzdělávacího plánu to spadá do agendy, kterou
pěstoun podle rozhodnutí vidět má.

---

## 6. Souhrn dopadu na nastavení systému

Struktura z dok. 03 sekce 4 se rozšiřuje: **každá položka existuje na obou úrovních**
(platforma / organizace) a nese svou `overridePolicy`.

Nové skupiny:

| Skupina | Kde | Obsah |
| --- | --- | --- |
| **Proplácení** | obě | povolení refundace pěstounovi, hotovost, vynucení odběratele, povinné odůvodnění |
| **Sazby a limity** | obě | vše z tabulky v sekci 1, s mantinely |
| **Datované řady** | platforma (org smí přepsat) | cena PHM, sazby cestovních náhrad |
| **Frekvence** | obě | odborná pomoc (volná), osobní styk, zprávy, revize plánů |
| **Vozový park** | organizace | sazba leasingu, `countBasis`, `spvppSharePct` per vůz |
| **Standardy** | platforma šablona, org adopce | verze, `effectiveFrom`, stav adopce po sekcích |
| **Plány** | obě | `periodBasis` per typ plánu, číselník oblastí cílů |

---

## 7. Stav zdrojů a co zbývá

| Zdroj | Stav |
| --- | --- |
| ZSPOD, vyhláška 473/2012 (bez příloh), OZ 89/2012, Instrukce 3/2025 | ✓ |
| Vzor Dohody, Směrnice č. 1, vzdělávací plán, plán pobytu | ✓ |
| **Přílohy č. 1 a 2 vyhlášky** (standardy kvality) | **chybí** — blokuje naplnění generátoru kapitolami |

Otevřené k potvrzení:
1. **Tříúrovňový přístup** z dok. 03 sekce 0 (org-wide čtení + výchozí filtr na vlastní
   rodiny + audit křížového přístupu) — zatím nepotvrzeno.
2. **`countBasis` u leasingu** — přijímáš `any_day_in_month` jako výchozí výklad?
3. **Kdo smí měnit `systemDefault`** u parametrů `free` — jen superadmin, nebo má
   organizace vidět i doporučenou hodnotu platformy jako vodítko?
