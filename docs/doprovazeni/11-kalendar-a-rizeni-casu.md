# 11 — Kalendář a lhůty

Navazuje na [10](./10-prenos-vzdelavani-kniha-zivota-nemazani.md). Rozpracovává modul,
který byl v zadání (M2) i v seznamu MVP, ale nebyl navržen.

---

## 0. Dvě opravy proti první verzi tohoto dokumentu

První verzi jsem napsal špatně ve dvou věcech a obojí zadavatel odmítl. Zaznamenávám to,
protože obě chyby mířily stejným směrem — dělal jsem ze systému víc, než má být.

**1. Systém není docházkový.** Navrhoval jsem, aby se čas přiřazoval k jednotlivým
událostem a z toho vznikal podklad pro poměr uznatelných osobních nákladů. To je špatně.

> **Poměr práce na jiných agendách se nastavuje jako parametr** — na úrovni Klíčové
> osoby (např. 80 % doprovázení / 20 % ostatní), případně na úrovni organizace.

Je to i lepší řešení. Sám jsem v první verzi napsal, že vyplňování musí být „téměř
zdarma, jinak bude údaj nepravdivý“ — a pak jsem navrhl mechanismus, který tu podmínku
nesplňuje. Nastavený poměr ji splňuje bez výjimky.

**2. Systém termíny nesjednává.** Navrhoval jsem, aby systém nabízel, koho navštívit,
podle blížících se lhůt a geografické blízkosti. Také špatně.

> **Termíny si Klíčová osoba domlouvá s pěstounem samostatně, mimo systém.** Systém může
> jen **anotovat**, že se blíží nejzazší termín návštěvy.

Kalendář je tedy **záznam a upozornění**, ne plánovač ani měřič.

---

## 1. Poměr úvazku jako parametr

```ts
// na členství v organizaci (dok. 03), s fallbackem na organizaci
interface AgendaAllocation {
  scope: 'membership' | 'organization'
  spvppSharePct: number        // 80
  otherSharePct: number        // 20
  validFrom: string           // verzované jako všechny parametry (dok. 07)
  validTo: string | null
  note: string | null          // čím je poměr podložen
}
```

Rozlišení podle dvouúrovňového vzoru z dok. 07: **hodnota na členství přebíjí hodnotu
na organizaci**, organizační slouží jako výchozí pro nově přidané pracovníky.

Poměr je **verzovaný a datovaný**, protože se v čase mění (změna úvazku, jiné rozdělení
agend) a vyúčtování za rok se musí umět spočítat podle toho, co platilo kdy.

Do reportu pro účetní (dok. 07 sekce 4) tak jde **jedno číslo za pracovníka a období**,
ne odvozený součet minut. Tím se ten report zjednodušuje.

---

## 2. Motor lhůt — jako anotace

Termíny se **dopočítávají** ze sady pravidel (dok. 07) a z právního režimu dohody
(dok. 01). Jejich výstupem je **anotace u rodiny, dítěte a v kalendáři**, nikoli návrh
schůzky.

```ts
interface Obligation {
  kind: 'personal_contact' | 'report_6m' | 'report_delivery' | 'education_period_end'
      | 'respite_year_end' | 'agreement_conclusion' | 'termination_notice_window'
      | 'orp_consent_pending' | 'transfer_code_window'

  agreementId: string | null
  childId: string | null            // u osobního styku — viz sekce 3
  personId: string | null

  basisDate: string                 // od čeho se lhůta počítá
  dueOn: string                     // NEJZAZŠÍ termín
  status: 'open' | 'met' | 'overdue' | 'justified_exception'

  metByContactId: string | null
  justification: string | null      // povinné u justified_exception

  computedFrom: { rulesetId: string; legalRegime: string }
}
```

Přepočítává se při každé změně, která na lhůtu má vliv. Nikdy se nedopisuje ručně.

| Lhůta | Základ | Rozsah |
| --- | --- | --- |
| Osobní styk | poslední styk | **2 měsíce** (§ 47b odst. 4) |
| Zpráva o průběhu PP | poslední zpráva / uzavření dohody | **6 měsíců** (§ 47b odst. 5) |
| Předání zprávy třem adresátům | vypracování zprávy | **15 dnů** |
| Konec vzdělávacího období | ukotvení období | **12 měsíců** (dok. 10) |
| Konec respitního roku | 31. 12. | kalendářní rok |
| Uzavření dohody | právní moc svěření | **30 dnů** |
| Okno pro výpověď | 30. 6. / 31. 12. | **−30 dnů** |
| Souhlas ORP | žádost | bez zákonné lhůty, ale blokuje aktivaci |

### Podoba anotace

Neutrálně a fakticky, ve stejném duchu jako upozornění na parametry (dok. 07):

```
Rodina Novákova · ROD-2026-001
  Osobní styk        naposledy 14. 6. · nejzazší termín 14. 8. · zbývá 9 dní
  Zpráva             nejzazší termín 30. 9.
```

Bez „měl bys“, bez návrhů termínů. Klíčová osoba ví, kdy se s rodinou vídá; potřebuje
jen vidět, kdy jí utíká lhůta.

---

## 3. Pravidlo dvou měsíců — per dítě, ne per rodina

Tohle zůstává a je to nejpodstatnější věc v celém dokumentu.

§ 47b odst. 4 žádá osobní styk *„s osobou pečující nebo osobou v evidenci **a s dětmi
svěřenými do její péče**“*. Metodika: *„**Vynechání kontaktu s dítětem není možné**“*
(s výjimkou např. hospitalizace) a nedodržení lhůty *„musí být řádně odůvodněno
ve spisu“*.

> **Lhůta tedy neběží jednou za rodinu, ale zvlášť za pěstouna a zvlášť za každé
> svěřené dítě.**

Návštěva, při které bylo jedno ze tří dětí ve škole, **nevynuluje lhůtu tomu dítěti**.
Kdyby systém měl jedno zaškrtávátko „návštěva proběhla“, **vykazoval by soulad tam,
kde není** — a to je u agendy, kterou kontroluje inspekce, ten nejhorší druh chyby.

```ts
interface MonitoringContact {
  agreementId: string
  occurredAt: string
  place: 'home' | 'organization' | 'other'
  placeNote: string | null          // volitelné; 'other' se počítá stejně

  // KDO BYL SKUTEČNĚ PŘÍTOMEN — z toho se počítá plnění
  presentPersonIds: string[]        // pěstoun(i)
  presentChildIds: string[]         // děti
  absentChildren: Array<{
    childId: string
    reason: string                  // hospitalizace, škola, pobyt…
    justified: boolean              // odůvodnění jde do spisu
  }>
  // metadata jsou čitatelná i pro OSPOD; obsah zápisu je v podkolekci (dok. 04)
}
```

Na profilu spisu se proto nezobrazuje jedno číslo, ale **řádek za pěstouna a řádek za
každé dítě** s vlastním „naposledy viděn / zbývá“.

---

## 4. Kalendář jako záznam

```ts
interface CalendarEvent {
  kind: 'monitoring_visit' | 'contact_event' | 'education' | 'respite'
      | 'meeting' | 'deadline' | 'travel' | 'admin' | 'personal'
  startIso: string; endIso: string; allDay: boolean
  assignedPersonIds: string[]
  subjectRefs: Array<{ type: 'family'|'caregiver'|'child'; id: string }>
  recurrenceRule: string | null       // RRULE — „každý druhý čtvrtek“
  location: string | null
}
```

- **Události se zadávají, ne navrhují.** Klíčová osoba zapíše, co si domluvila.
- **Výchozí délka události je 1 hodina.**
- **Cesta je jen plánovací blok** (`kind: 'travel'`) — pomůcka, aby si den šel rozvrhnout.
  **Nenese kilometry ani nic nevykazuje.** Chce-li někdo cestovní náhradu, je to **výdaj**
  (`Expense`), ne položka kalendáře. Kalendář není účetní kniha.
- **Periodické události** (RRULE) — zadání zmiňuje „každý druhý čtvrtek v měsíci“.

### Přehled zátěže pro vedoucího — v povinnostech, ne v hodinách

```
Srpen 2026 · M. Štěpánková
  osobní styky s nejzazším termínem v tomto měsíci   14   (3 po termínu)
  zprávy k vypracování                                4
  konce vzdělávacích období                           2
  asistované kontakty                                 6
```

Počítají se **povinnosti, ne hodiny**. Kapacita „18–23 rodin na FTE“ (dok. 01) je hrubá
metrika — dva pěstouni s pěti dětmi generují víc povinných styků než pět pěstounů
s jedním dítětem, a to počet rodin neukáže.

**Kdo to vidí:** vedoucí a `org_admin` plně za všechny pracovníky, **Klíčová osoba jen
svůj vlastní**. Jinak by z toho bylo srovnávání lidí mezi sebou.

### Mezery v pokrytí při nepřítomnosti

Když je Klíčová osoba nemocná nebo na dovolené, **lhůty jejích rodin běží dál**.
Kalendář proto ukáže, které lhůty spadají do doby nepřítomnosti a kdo je pokrývá
(zástup, dok. 03 scénář A). Je to opět **anotace**, ne přeplánování.

---

## 5. Pohledy a izolovaný scroll

Zadavatel žádá, aby se kalendář **vypadal a chovat jako Google Calendar**. To zdánlivě
naráží na požadavek zadání (M2) na „izolovaný scroll 7:00–20:00 s autoscrollem“ —
ale ve skutečnosti je to totéž: **Google Calendar má právě takovou mřížku.** Drží celý
den a otevírá se na pracovním okně.

> Mřížka nese **celých 24 hodin**, výchozí viditelné okno je **7:00–20:00**.
> Ranní předání i večerní kontakt jsou tedy dosažitelné odrolováním, ne nedostupné.

### Co „jako Google Calendar“ konkrétně znamená

- **výchozí délka události 1 hodina**
- **tažením v mřížce** vytvořit událost, **tažením** přesunout, **tažením za okraj**
  změnit délku
- **klik → rychlé vytvoření v popoveru**, ne odskok na celou stránku
- pohledy **den / 3 dny / týden / měsíc / agenda** + tlačítko **dnes**
- **mini měsíční navigátor** pro rychlý skok
- **barevné odlišení podle typu** události (z Geist tokenů, ne vlastních barev)
- **souběžné události vedle sebe**, ne přes sebe
- **linka aktuálního času**
- **celodenní pás** nahoře, oddělený od mřížky
- **klávesové zkratky** — `d` / `w` / `m` / `a` pro pohledy, `n` / `p` pro další a předchozí

### Kde se mobil chová jinak

- **Svislé gesto koliduje s rolováním stránky.** Mřížka musí gesto zachytit v sobě
  (`overscroll-behavior: contain`, `touch-action` na kontejneru) a stránka pod ní se
  nesmí hýbat. Na desktopu totéž pro kolečko.
- **Tažením vytvořit událost na dotyku** vyžaduje **dlouhý stisk** jako spouštěč —
  jinak nejde odlišit od rolování.
- **Výchozí pohled na mobilu je den nebo agenda**, ne měsíc — v terénu se člověk dívá
  na „co mám teď a co dál“.
- Viditelné okno (7:00–20:00) patří do nastavení organizace i uživatele; terénní
  pracovník s ranními návštěvami má jiný den než kancelář.
- Přes pohled se vrství **lhůty** (sekce 2) — nejzazší termín je vidět v týdnu stejně
  jako schůzka, i když to není událost s časem.

Kvůli tomu specifickému chování potvrzuji doporučení z rešerše: **headless komponenta
nad `dnd-kit`**, ne hotová kalendářová knihovna. Vlastní gesto a vrstvení lhůt by
u hotové knihovny znamenaly boj s jejím vnitřním scrollem.

---

## 6. Export iCal — a jedno riziko, které je snadné přehlédnout

Zadání žádá iCal odkaz pro Outlook a Google Calendar.

> **Pozor: název události v externím kalendáři odchází ke Googlu nebo Microsoftu.**
> „Návštěva – Nováková, Leona (8 let)“ v Google kalendáři znamená předání údajů
> o dítěti v pěstounské péči třetí straně — stejný problém jako u WhatsAppu (dok. 09).

Řešení: **anonymizovaný export jako výchozí.**

| Režim | Titulek v externím kalendáři |
| --- | --- |
| `anonymized` (výchozí) | `Návštěva · ROD-2026-001` |
| `codes_only` | `Doprovázení` + čas a místo |
| `full` | plné jméno — jen po výslovném zapnutí s upozorněním |

- Export je **jednosměrný** (systém → externí kalendář). Dvousměrný sync by tahal cizí
  data do spisu.
- Feed URL je **tajemství** — dlouhý neuhodnutelný token, možnost zneplatnit.
- Adresa domácnosti se v `anonymized` režimu **neexportuje**.

---

## 7. Offline

- **Čtení**: dnešní a nejbližší dny z cache (dok. 02 sekce 5).
- **Zápis**: vlastní události a záznamy o návštěvě do outboxu — jsou jednopisatelské,
  bez konfliktů.
- **Lhůty se počítají na serveru.** Offline se zobrazí poslední spočítaný stav
  s poznámkou „k datu…“, aby si pracovník nemyslel, že vidí aktuální čísla.
- Přidělení události kolegovi offline **nejde** — sdílená entita, server je autorita.

---

## 8. Dopad na model a rozsah

| Přidáno | Poznámka |
| --- | --- |
| `AgendaAllocation` na členství i organizaci | poměr úvazku jako verzovaný parametr |
| `Obligation` jako dopočítaná entita | anotace lhůt, ne připomínky ani plánovač |
| `MonitoringContact.presentChildIds` + `absentChildren` | plnění per dítě, sekce 3 |
| `CalendarEvent.kind: 'travel'` | plánovací blok, bez vykazování |
| Chování a vzhled jako Google Calendar, výchozí délka 1 h | sekce 5 |
| Přehled zátěže v povinnostech, viditelný podle role | pro vedoucí a `org_admin` |
| iCal export s režimy anonymizace | sekce 6 |

**Odstraněno proti první verzi:** přiřazování času k událostem, `actualMinutes`,
odvozování poměru uznatelných nákladů z evidence času, návrh dne podle lhůt
a geografické blízkosti, `journey.km` na události (kilometry patří na `Expense`).

---

## 9. Uzavřená rozhodnutí

| Otázka | Rozhodnutí |
| --- | --- |
| Počítá se styk mimo domácnost? | **ano** — `place: 'other'` se počítá stejně, `placeNote` je volitelné |
| Předpokládaná délka návštěvy | **1 hodina** |
| Chování kalendáře | **jako Google Calendar** (sekce 5) |
| Kdo vidí přehled zátěže | **vedoucí a `org_admin` plně, Klíčová osoba jen svůj** |
| Čas na cestě | **jen pro plánování** — nevykazuje se, kilometry patří na `Expense` |

Jedna věc zůstává jako předpoklad, ne otázka: **vedoucí, která také doprovází rodiny,
má jeden poměr úvazku za celou svou roli** (sekce 1). Kdyby se měl rozpadat dál, je to
změna konfigurace, ne modelu.

Metodická poznámka k prvnímu bodu: styk *„nemůže probíhat formálně“* — metodika výslovně
neuznává případ, kdy se pracovník s pěstounem jen sešel na vzdělávací akci. Systém to
nehlídá a hlídat nemá; `placeNote` je tam proto, aby si to Klíčová osoba mohla
zaznamenat sama, když je to potřeba doložit.
