# 07 — Flexibilita parametrů, generátor Standardů, editor plánů a podpisy

Navazuje na [06](./06-nastavitelnost-standardy-plany.md). Tento dokument **přepisuje**
sekce 1, 3 a 4 dokumentu 06 podle rozhodnutí zadavatele.

---

## 0. Oprava: přílohy vyhlášky v souboru byly

V dokumentech 04–06 jsem tvrdil, že přílohy č. 1 a 2 vyhlášky 473/2012 Sb. chybí a
blokují generátor Standardů. **To byla moje chyba** — v dodaném souboru jsou:
příloha 1 (standardy pro orgány SPO) a **příloha 2 (standardy pro pověřené osoby)**,
plus přílohy 3–9. Přehlédl jsem je, protože jsem soubor prohledával jen po `§`.

Generátor Standardů tedy naplnit můžu a v sekci 3 to dělám. Žádný právní zdroj už
nechybí.

---

## 1. Parametry: plná volnost organizace, upozornění jako informace

**Rozhodnutí zadavatele:** organizace si zvolí limity, jaké chce, a nese riziko.
Systém nemá vodit za ručičku, má umožnit flexibilní provoz. Při překročení vygeneruje
upozornění — a i to upozornění musí být možné na úrovni organizace **vypnout**.

Ruším proto vynucování mantinelů z dok. 06 sekce 1. `overridePolicy` se nemění na
blokaci, ale **jen na typ srovnání**:

```ts
type LegalComparison =
  | 'ceiling'    // zákon dává strop  → hlásíme, je-li nastaveno výš
  | 'floor'      // zákon dává minimum → hlásíme, je-li nastaveno níž
  | 'interval'   // zákon dává max. odstup → hlásíme, je-li nastaveno delší
  | 'exact'      // zákon dává jednu hodnotu → hlásíme při odlišnosti
  | 'none'       // zákon nic neurčuje → nehlásíme nikdy
```

**Žádné uložení se neblokuje.** Hodnota se uloží vždy; srovnání se zákonnou referencí
vytvoří nejvýš záznam v přehledu.

### Podoba upozornění

Bez hodnocení, bez moralizování, bez e-mailu. Jen srovnávací řádek v nastavení:

```
Ubytování při vzdělávání
  Vaše nastavení        1 000 Kč / osoba / noc
  Zákonná reference     1 500 Kč (od 21. 1. 2025, Instrukce VŘ2 3/2025)
```

Žádné „krátíte pěstouny o 500 Kč“. Uživatel vidí dvě čísla a zdroj; závěr si udělá sám.

### Vypínání

```ts
notices: {
  enabled: boolean                    // hlavní vypínač organizace
  channels: { inApp: boolean; email: boolean }   // e-mail výchozí FALSE
  mutedCodes: string[]                // vypnutí konkrétních upozornění
}
```

E-mail je **vypnutý ve výchozím stavu**. Upozornění žije v nastavení a na dashboardu,
nikoli v poštovní schránce.

### Jedna faktická poznámka, ne námitka

U většiny parametrů je „zvolím si a nesu riziko“ přesné — sazby, stropy, frekvence,
příspěvky. U malé skupiny hodnot ale jiná hodnota **riziko nepřesouvá, jen rozbije
výpočet systému**:

| Hodnota | Co se stane při jiném nastavení |
| --- | --- |
| Zánik dohody k pololetí (30. 6. / 31. 12.) | systém dopočítá datum zániku, které právně nemůže nastat |
| Výše SPVPP (66 000 / 72 000 / +18 000) | stát vyplatí svoje; naše čísla přestanou odpovídat realitě |
| Povinné hodiny vzdělávání (18 / 24) | systém označí povinnost za splněnou, i když splněná není |

Nejde tu o limit, který organizace poskytuje ze svého, ale o **fakt, ze kterého systém
počítá**. Proto tyhle tři necháváme žít **na úrovni systému** (spravuje superadmin,
viz sekce 2) a v nastavení organizace se zobrazují jako převzaté. Přepsat je lze,
protože jsi to tak chtěl — jen se u nich zobrazí, co daná změna ovlivní. Nic se
neblokuje.

### Doporučená hodnota platformy — potvrzeno

U parametrů s `'none'` (volných) organizace **vidí doporučenou hodnotu platformy jako
vodítko**, vedle své vlastní. Potvrzeno.

---

## 2. Kdo publikuje zákonné sady — oprava mého znění

Ptal ses správně. Psal jsem „při publikaci nové zákonné sady“, což mohlo znít, jako
by systém změny zákona **sám zjišťoval**. Nezjišťuje a zjišťovat nemůže.

Skutečný postup:

```
1. Novela / nová instrukce vyjde                    ← mimo systém
2. SUPERADMIN ji ručně zadá jako novou verzi sady   ← lidský úkon, s validFrom a zdrojem
3. Publikací se spustí srovnání proti nastavením organizací
4. Organizace uvidí srovnávací řádky (pokud je nemá vypnuté)
```

Krok 3 je jediné, co je automatické — a je to **důsledek úkonu superadmina**, ne
detekce změny zákona. Systém nesleduje Sbírku a nic si nedomýšlí.

---

## 3. Generátor Standardů kvality — naplněný

### Zdroj

**Příloha č. 2 vyhlášky 473/2012 Sb.** — standardy pro pověřené osoby podle § 48 odst. 2
písm. b) a d): **16 standardů, 30 kritérií**. (Příloha č. 1 obsahuje obdobu pro orgány
SPO — proto ta jiná číselná řada, kterou metodiky zmiňují.)

| # | Standard | Kritéria |
| --- | --- | --- |
| 1 | Cíle a způsoby činnosti pověřené osoby | 1a, 1b |
| 2 | Ochrana práv a chráněných zájmů | 2a, 2b |
| 3 | Prostředí a podmínky | 3a |
| 4 | Informovanost o výkonu SPOD a činnosti pověřené osoby | 4a, 4b, 4c |
| 5 | Podpora přirozeného sociálního prostředí | 5a, 5b |
| 6 | Personální zabezpečení | 6a, 6b, 6c |
| 7 | Přijímání a zaškolování zaměstnanců | 7a, 7b, 7c |
| 8 | Profesní rozvoj zaměstnanců | 8a, 8b, 8c, 8d |
| 9 | Pracovní postupy pověřené osoby | 9a, 9b, 9c |
| 10 | Dohoda o výkonu pěstounské péče | 10a, 10b, 10c, 10d |
| 11 | Předávání informací | 11a, 11b, 11c |
| 12 | Změna situace | 12a |
| 13 | Dokumentace o výkonu SPOD | 13a |
| 14 | Vyřizování a podávání stížností | 14a |
| 15 | Rizikové, havarijní a nouzové situace | 15a |
| 16 | Zvyšování kvality výkonu SPOD | 16a, 16b |

### Bodové hodnocení je v zákoně

Vyhláška (§ k standardům) stanoví hodnocení **po kritériích, 0–3 body**:
3 = splněno výborně, 2 = dobře, 1 = částečně, 0 = nesplněno.

To znamená, že modul standardů není jen textový generátor — má nést **sebehodnocení**
podle téže stupnice, kterou používá inspekce. To organizaci umožní jít do inspekce
připravená. Kritérium 16a navíc **přímo vyžaduje** „systém pravidelné revize naplňování
standardů kvality“, takže sebehodnotící cyklus je splněním standardu, ne nadstavbou.

### Vazba kritérií na funkce systému

Tohle je ta část, kterou jsi chtěl — „změní-li organizace pasáž, změní se jí podle toho
nastavení“. Konkrétně:

| Kritérium | Nastavení / funkce, kterou řídí |
| --- | --- |
| 1b | pravidla střetu zájmů u přidělení Klíčové osoby |
| 2a.3 | „vždy zjišťuje názor dítěte“ → pole pro názor dítěte v zápisu i v plánu, povinné |
| 4b | důvody, kdy lze odmítnout uzavření dohody |
| 5b | pravidla kontaktu: kde probíhá, jak se na něj připravují aktéři |
| 6a–6c | organizační struktura, počty míst, FTE, kvalifikace, oprávnění rolí |
| 7a | odborná způsobilost a bezúhonnost zaměstnanců i poskytovatelů péče |
| 7c | dobrovolníci a stážisté jako samostatné typy osob |
| 8b | **individuální plány vzdělávání zaměstnanců** — jiná entita než plán pěstouna |
| 9c | „vždy určeného sociálního pracovníka“ → přidělení Klíčové osoby je povinné |
| 10a | pravidla uzavírání, změny a zrušení dohod; přílohy předávané klientovi |
| 10b | způsob hodnocení naplňování cílů dohody |
| **10c** | **plán průběhu pobytu dítěte** |
| **10d** | **následný vzdělávací plán pěstouna** |
| 11a | pravidelné informování → rozesílání zpráv a jejich adresáti |
| **11b** | **pravidla předávání případů mezi zaměstnanci** → předávací protokol z dok. 03 |
| 12a | postupy při významných změnách, včetně ukončení pobytu dítěte |
| **13a** | spisová dokumentace: založení, uzavření, **zapůjčení**, nahlížení, kopie, odmítnutí |
| 14a | **stížnosti** — evidence, lhůty, kdo vyřizuje |
| 15a | **rizikové, havarijní a nouzové situace** |
| 16a, 16b | revize standardů a **zpětná vazba od cílové skupiny** |

### Tři moduly, které z toho vyplynuly a v modelu nebyly

1. **Stížnosti (14a)** — podání, evidence, kdo vyřizuje, **lhůta**, zveřejněná pravidla.
   Musí být dostupné i pěstounovi v portálu.
2. **Mimořádné situace (15a)** — definice rizikových/havarijních/nouzových situací,
   postup, **prokazatelné seznámení zaměstnanců** (tedy evidence seznámení).
3. **Zpětná vazba (16b)** — od cílové skupiny, od ORP i od spolupracujících subjektů.

Plus **plány vzdělávání zaměstnanců (8b)**, které jsou jiná entita než vzdělávací plán
pěstouna, a **zapůjčení spisu (13a)**, což je stav spisu, který model neměl.

### Mechanismus adopce zůstává z dok. 06

Čtyři akce na kritérium (`adopt` / `modify` / `extend` / `replace`), parametr je zdroj
pravdy a prosa se z něj generuje, `replace` rozpojí vazbu a označí kritérium jako
neověřitelné. Standardy jsou **verzované s `effectiveFrom`** („platné od…“), dohoda
na ně odkazuje přišpendlenou verzí.

---

## 4. Leasing a reporty pro účetní

**Oprava rozsahu:** kontrola leasingu je **pouze informace**. Systém není účetní systém
a nemá ambici jím být — každá organizace má interní nebo externí účetní. Ukazatel
zůstává (zelená/žlutá/červená dle dok. 06 sekce 3), ale je to údaj na dashboardu, ne
účetní kontrola.

### Reportovací modul

Čtyři dimenze, jak jsi zadal:

| Dimenze | Typický obsah |
| --- | --- |
| **Organizace** | souhrn čerpání za období, po kategoriích a písmenech práv, leasing, cestovní náhrady |
| **Klíčová osoba** | výdaje a aktivity za její rodiny, počty kontaktů, splněné lhůty |
| **Pěstoun** | výdaje vázané k němu, vzdělávání (hodiny + doklady), respity |
| **Dítě** | výdaje vázané k němu, respitní dny, odborná pomoc |

```ts
interface ReportDefinition {
  id: string
  dimension: 'organization' | 'key_person' | 'caregiver' | 'child'
  scope: { subjectId?: string; all?: boolean }
  period: { kind: 'month'|'quarter'|'year'|'custom'; from: string; to: string }
  schedule: null | { cron: string; recipients: string[] }   // pravidelné i ad-hoc
  sections: string[]          // 'expenses'|'education'|'respite'|'vehicle'|'contacts'
  format: 'xlsx' | 'pdf' | 'csv'
  // reprodukovatelnost pro kontrolu
  generatedAt: string
  rulesetIds: string[]
  orgPolicyVersions: string[]
}
```

Poznámky k návrhu:

- **XLSX je primární formát.** Účetní pracují v Excelu; PDF je pro založení do spisu,
  CSV pro import do jejich systému.
- **Pravidelné i ad-hoc** — ad-hoc vždy s volitelným rozsahem dat.
- Každý report nese **verze sad a směrnic**, podle kterých byl spočítán, a čas
  vygenerování. Bez toho není při kontrole ÚP reprodukovatelný.
- **Co reporty nejsou:** účetnictví. Žádné podvojné zápisy, žádná hlavní kniha, žádné
  párování bankovních výpisů. Systém je **poskytovatel podkladů**, účetní si je
  zaúčtuje sama.
- Statutární „Přehled čerpání SPVPP“ k 31. 3. je také report — ale protože limity §5c
  jsou odložené, zatím to je surový export a součty si sestaví účetní.

---

## 5. Plány: standardizace, editor, předvyplnění

### Standardizace období — reakce na „lidské mezery“

Máš pravdu, že dodané dokumenty nesou lidské nekonzistence a systém musí být
jednoznačný. Rozdíl v obdobích ale **není nekonzistence** — je to rozdíl mezi zákonem
a praxí:

| Plán | Období | Základ |
| --- | --- | --- |
| Vzdělávací plán (10d) | klouzavých 12 měsíců od uzavření dohody | **§ 47a odst. 3 to přikazuje** |
| Plán průběhu pobytu (10c) | kalendářní rok | **žádný zákonný základ** → volíme standard |

Takže: u vzdělávání zůstává klouzavé období, protože jinak by systém počítal špatně.
U plánu pobytu **zavádíme jeden standard** (výchozí kalendářní rok, nastavitelný), ne
improvizaci po dokumentech. V obou případech je období **explicitní pole**, nikdy volný
text — to je ta standardizace.

### Editor a výstup

- Plány se **tvoří v systému** v editoru (bohatý text v mezích šablony, ne libovolné
  formátování — dokument jde na OSPOD a musí být jednotný).
- Výstup je **PDF v sekci „Dokumenty“**, opatřené podpisy (sekce 6).
- Editor musí fungovat **na mobilu i offline** — plán se často dopisuje po návštěvě.

### Předvyplnění — co jde odvodit z dat

Systém předvyplní vše, co už ví, aby Klíčová osoba psala jen to, co je vlastně nové:

| Oblast plánu | Zdroj předvyplnění |
| --- | --- |
| hlavička, období, subjekty | dohoda, `Placement`, osoby |
| složení domácnosti | osoby v rodině a jejich role |
| věk dítěte, škola, právní status, datum svěření | `Child`, `Placement` |
| plnění vzdělávání (hodiny / požadavek) | `EducationPeriod` — dopočítané |
| vyčerpané respitní dny | `CareEpisode` — dopočítané |
| datum posledního osobního styku a dodržení lhůty | `MonitoringContact` |
| cíle z předchozího období a jejich stav | předchozí plán |
| doporučení z odborné pomoci | `contactEvents`, timeline |

Věta *„Pečující osoba splnila svou zákonnou povinnost“* je proto **dopočítaná**, ne
psaná — jak jsem uvedl v dok. 06.

### Knihovna obvyklých vět

Tohle je ta „velká pomoc pro Klíčové osoby“. Nabízené věty místo psaní od nuly.

```ts
interface SentenceTemplate {
  id: string
  scope: 'platform' | 'organization'
  contextTags: string[]        // 'plan.area.health', 'plan.review', 'visit.note'
  text: string                 // "Pečující osoba {{v:zajistit_past}} pravidelné lékařské prohlídky."
  slots: Array<{
    token: string              // 'v:zajistit_past'
    agreesWith: 'caregiver' | 'child' | 'caregivers'
    forms: { m: string; f: string; pl: string }   // zajistil / zajistila / zajistili
  }>
  usageCount: number           // řazení podle četnosti v organizaci
}
```

**Čeština si tu vynucuje pozornost.** V reálném plánu stojí *„Pěstounka zajistila“* —
tedy ženský rod. Kdyby systém generoval „Pěstoun zajistil“ pro pěstounku, dokument, který
jde na OSPOD a k soudu, bude vypadat nedbale. Proto:

- `Person` a `Child` dostanou **`grammaticalGender`** (`m` / `f`), oddělené od
  administrativního údaje o pohlaví, protože slouží jen ke skloňování.
- U manželů-pěstounů se použije **množné číslo** (`pl`).
- Věty se ukládají s tokeny a tvary, ne jako hotový text. Alternativa „zajistil(a)“
  je pro úřední dokument nevhodná.

Řazení nabídek: **nejčastěji použité v organizaci** → naposledy použité mnou → zbytek.
Knihovna je na úrovni organizace, platforma dodá výchozí sadu.

**Pravidlo:** knihovna **nabízí**, člověk **potvrzuje a upravuje**. Stejné pravidlo jako
u AI (dok. 02). Věta se do plánu nedostane bez potvrzení.

Knihovna vět je zároveň **deterministická a offline** alternativa k AI diktátu —
funguje bez signálu a bez odesílání dat kamkoli. V terénu se to hodí víc.

### Checklisty pro návštěvy

```ts
interface ChecklistTemplate {
  id: string; organizationId: string
  version: string; effectiveFrom: string       // verzované jako vše ostatní
  title: string
  purpose: 'visit' | 'contact' | 'plan_review' | 'handover' | 'emergency'
  items: Array<{
    code: string
    prompt: string
    type: 'bool' | 'scale' | 'text' | 'photo' | 'select'
    required: boolean
    mapsTo?: { planAreaCode?: string; reportSection?: string }   // ← klíčové
  }>
}
```

- Knihovna checklistů je **na úrovni organizace**, jak jsi zadal.
- Klíčová osoba si na návštěvě vybere checklist a vyplní ho **offline**.
- `mapsTo` je to podstatné: vyplněný checklist **předplní revizi plánu a části
  šestiměsíční zprávy**. Vyplním checklist na návštěvě a zpráva je z poloviny hotová.
- Kritérium **2a.3** („vždy zjišťuje názor dítěte“) se dá do checklistu zapracovat jako
  povinná položka — pak je splnění standardu vidět v datech.
- Obsah vyplněného checklistu je **záznam**, takže patří do omezené podkolekce
  (dok. 04) — OSPOD ho nevidí, vidí jen metadata kontaktu.

---

## 6. Podepisování v PWA

### Dvě úrovně, ne jedna

| Úroveň | Kdo a co | Kde |
| --- | --- | --- |
| **A — jednoduchý podpis v aplikaci** | pěstoun, Klíčová osoba, vedoucí, případně dítě: plány, checklisty, **výkazy hlídání**, seznámení se zprávou | na zařízení, i offline |
| **B — kvalifikovaná pečeť organizace** | dokumenty odcházející úřadům (zprávy pro OSPOD přes ISDS) | server, nikdy na zařízení |

Úroveň A je podle eIDAS **prostý elektronický podpis**. Pro interní artefakty
(plány 10c/10d, výkazy) je to obhajitelné a jeho průkaznost stojí na auditní stopě.
Úroveň B je nutná tam, kde dokument opouští organizaci do úřední sféry.

**Dohodu samotnou to nenahrazuje** — vzor ji podepisuje na papíře ve dvou originálech
a je to veřejnoprávní smlouva.

### Zásadní rozhodnutí: podepisuje se datový obsah, ne PDF

```
podepisuje se  =  kanonický hash strukturovaných dat plánu
PDF            =  jedno z vykreslení téhož obsahu
```

Kdyby se podepisoval PDF byte-stream, muselo by se PDF vygenerovat **na zařízení
a offline**, deterministicky, se stejnými fonty — což je křehké. Podpisem dat se
offline podpis zjednoduší na spočítání hashe a PDF se vykreslí až na serveru při
synchronizaci, bez porušení podpisu.

**Změna obsahu po podpisu podpis zneplatní** — proto `signedContentHash` a přepočet
při každé editaci.

```ts
interface SignatureRound {
  documentKind: 'plan_10c' | 'plan_10d' | 'checklist_run' | 'care_log' | 'report_ack'
  documentId: string
  contentHash: string
  signers: Array<{
    personId: string
    role: 'caregiver' | 'key_person' | 'supervisor' | 'child' | 'care_provider' | 'other'
    required: boolean
    method: 'drawn' | 'typed_consent' | 'qualified'
    signedAt: string | null
    signatureImageId: string | null      // SVG dráha, ne bitmapa
    evidence: {
      capturedOffline: boolean
      deviceLabel: string
      appVersion: string
      syncedAt: string | null
    }
  }>
  status: 'open' | 'complete' | 'invalidated'
  invalidatedReason?: 'content_changed'
}
```

### Praktické detaily pro terén

- **Plátno na dotyk** (pointer events), ukládat jako **SVG dráhu** — je menší než
  bitmapa a škáluje do PDF v jakémkoli rozlišení.
- Nad plátnem **vždy vidět, co se podepisuje** — název dokumentu, období, subjekt.
  Podpis „naslepo“ je u dokumentu o dítěti nepřijatelný.
- Vymazat / opakovat; podpis se needituje.
- **Vícestranný podpis**: pěstoun i Klíčová osoba (oba plány to mají), volitelně
  vedoucí, dítě, poskytovatel péče u výkazu hlídání. Nezávisle, v libovolném pořadí;
  dokument je `complete`, až podepíšou všichni `required`.
- **Výkaz hlídání** má podpis pěstouna jako **povinný** — metodika ho vyžaduje jako
  potvrzení faktického přijetí služby (dok. 01 sekce 8).
- **Alternativa pro toho, kdo nemůže podepsat rukou**: jméno + výslovné potvrzení,
  uložené jako `typed_consent` — jiná metoda, ne předstírání podpisu.
- Offline podpisy jdou do outboxu jako vše ostatní (dok. 02 sekce 5) a uživatel vidí,
  že ještě nejsou odeslané.

---

## 7. Zaznamenaná rozhodnutí

| Otázka | Rozhodnutí |
| --- | --- |
| Mantinely parametrů | **zrušeny** — plná volnost organizace, upozornění jen informativní |
| Vypínání upozornění | ano, na úrovni organizace; **e-mail výchozí vypnutý** |
| Tón upozornění | neutrální srovnání dvou hodnot, žádné hodnocení |
| Kdo zadává zákonné sady | **superadmin ručně**; systém změny zákona nedetekuje |
| Leasing | pouze informace; systém není účetní systém |
| Reporty pro účetní | ano — 4 dimenze, pravidelné i ad-hoc, XLSX/PDF/CSV |
| `countBasis` u leasingu | **`any_day_in_month`** ✓ |
| Doporučená hodnota platformy u volných parametrů | **ano, zobrazit jako vodítko** ✓ |
| Tříúrovňový přístup | „nevím, asi ano“ → zavádím jako **výchozí nastavitelnou politiku**, ne zadrátovaně, aby se dala změnit bez přepisu modelu |

---

## 8. Co zbývá

Právní zdroje jsou **kompletní**. Otevřené jsou návrhové věci:

1. **Kdo píše texty plánů kromě Klíčové osoby** — zmínil jsi „její vedoucí“. Má vedoucí
   editovat přímo, nebo komentovat a schvalovat? Ovlivňuje to podpisová pole a workflow.
2. **Podepisuje dítě?** Standard 2a.3 žádá zjišťovat názor dítěte a plán se tvoří s jeho
   participací. Podpis dítěte navrhuji jako **volitelný od nastavitelného věku**.
3. **Výchozí sada vět** — mám ji navrhnout z dodaných dokumentů (reálné formulace
   z plánu pobytu jsou dobrý základ), nebo ji dodá organizace?
4. **Stížnosti, mimořádné situace, zpětná vazba** (standardy 14a, 15a, 16b) — patří do
   prvních milníků, nebo později? Ze standardů plynou povinně, ale nejsou na kritické
   cestě spisu.
