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
  placeNote: string | null          // povinné u 'other' — viz otevřené otázky

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
      | 'meeting' | 'deadline' | 'admin' | 'personal'
  startIso: string; endIso: string; allDay: boolean
  assignedPersonIds: string[]
  subjectRefs: Array<{ type: 'family'|'caregiver'|'child'; id: string }>
  recurrenceRule: string | null       // RRULE — „každý druhý čtvrtek“
  location: string | null
  // volitelně, kvůli cestovním náhradám — NE kvůli měření času
  journey: { km: number; mode: 'car' | 'public' } | null
}
```

- **Události se zadávají, ne navrhují.** Klíčová osoba zapíše, co si domluvila.
- **`journey.km`** je tam jen proto, že cestovní náhrady jsou uznatelný výdaj
  a kilometry se stejně někam zapsat musí (dok. 05 sekce 5, sazba PHM z datované řady).
  Není to podklad pro sledování času.
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

### Mezery v pokrytí při nepřítomnosti

Když je Klíčová osoba nemocná nebo na dovolené, **lhůty jejích rodin běží dál**.
Kalendář proto ukáže, které lhůty spadají do doby nepřítomnosti a kdo je pokrývá
(zástup, dok. 03 scénář A). Je to opět **anotace**, ne přeplánování.

---

## 5. Pohledy a izolovaný scroll

Zadání (M2): měsíční mřížka, týdenní rozvrh, 3denní, denní, chronologická agenda;
svislé rolování kolečkem posouvá **výhradně hodiny uvnitř mřížky** v rozsahu
**7:00–20:00**, při načtení autoscroll na 7:00.

- **Na mobilu je to důležitější než na desktopu** — svislé gesto koliduje s rolováním
  stránky. Mřížka musí gesto zachytit v sobě (`overscroll-behavior: contain`,
  `touch-action` na kontejneru) a stránka pod ní se nesmí hýbat.
- Rozsah 7:00–20:00 patří do nastavení organizace i uživatele; terénní pracovník
  s ranními návštěvami má jiný den než kancelář.
- **Výchozí pohled na mobilu je den nebo agenda**, ne měsíc — v terénu se člověk dívá
  na „co mám teď a co dál“.
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
| `CalendarEvent.journey.km` | kvůli cestovním náhradám |
| Přehled zátěže v povinnostech | pro vedoucí |
| iCal export s režimy anonymizace | sekce 6 |

**Odstraněno proti první verzi:** přiřazování času k událostem, `actualMinutes`,
odvozování poměru uznatelných nákladů z evidence času, návrh dne podle lhůt
a geografické blízkosti.

---

## 9. Otevřené

1. **Osobní styk mimo domácnost.** Metodika ho připouští (herna, prostory organizace),
   ale *nesmí být formální* — účast na vzdělávací akci se za styk nepočítá. Navrhuji
   `place: 'other'` s povinným `placeNote`, aby z toho nebyla klička.
2. **Kdo vidí přehled zátěže?** Navrhuji vedoucí a `org_admin` plně, Klíčová osoba jen
   svůj — jinak to sklouzne ke srovnávání lidí mezi sebou.
3. **Poměr úvazku u vedoucí** — má vedoucí, která také doprovází rodiny, jeden poměr
   za celou svou roli, nebo se rozpadá dál? Zatím počítám s jedním.
