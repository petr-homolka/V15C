# 11 — Kalendář a řízení času Klíčové osoby

Navazuje na [10](./10-prenos-vzdelavani-kniha-zivota-nemazani.md). Rozpracovává modul,
který byl v zadání (M2) i v seznamu MVP, ale nebyl navržen.

---

## 1. Proč to není obyčejný kalendář

Tři důvody, a třetí je ten, který jsem si při psaní uvědomil a je nejsilnější:

1. **Většinu obsazenosti negeneruje člověk, ale zákon.** Osobní styk každé 2 měsíce,
   zpráva každých 6 měsíců, předání do 15 dnů, konec vzdělávacího období, konec
   respitního roku, výpovědní okno k 30. 6. / 31. 12. Klíčová osoba si to nevymýšlí —
   dostává to.
2. **Je to terénní práce.** Návštěvy jsou v domácnostech, geograficky rozptýlené.
   Kalendář, který neumí cestu, je pro tuhle práci k ničemu.
3. **Je to důkazní základ pro uznatelnost osobních nákladů.** Instrukce VŘ2 3/2025:
   *„V případě zaměstnanců, u kterých dochází ke kumulaci pracovní náplně … je nutné
   na základě **prokazatelného kritéria** jednoznačně určit, v jakém rozsahu pracovního
   úvazku se tito zaměstnanci zabývají činnostmi souvisejícími se zajištěním pomoci
   osobám pečujícím/v evidenci a svěřeným dětem.“*

Bod 3 mění povahu věci. Pracuje-li Klíčová osoba i na jiných agendách organizace,
**ze SPVPP je uznatelná jen poměrná část jejích osobních nákladů** — a ten poměr je
třeba prokázat. Evidence času v kalendáři je nejpřirozenější „prokazatelné kritérium“,
jaké organizace může mít. Kalendář tedy není produktivitní nadstavba, ale **vstup do
vyúčtování**.

---

## 2. Motor povinností

Termíny se **nezadávají, ale dopočítávají** ze sady pravidel (dok. 07) a z právního
režimu dané dohody (dok. 01).

```ts
interface Obligation {
  id: string
  kind: 'personal_contact' | 'report_6m' | 'report_delivery' | 'education_period_end'
      | 'respite_year_end' | 'agreement_conclusion' | 'termination_notice_window'
      | 'orp_consent_pending' | 'transfer_code_window'

  agreementId: string | null
  childId: string | null            // u osobního styku — viz sekce 3
  personId: string | null

  basisDate: string                 // od čeho se lhůta počítá
  dueOn: string                     // dopočítané
  status: 'open' | 'met' | 'overdue' | 'justified_exception'

  metByContactId: string | null
  justification: string | null      // povinné u justified_exception

  // reprodukovatelnost pro kontrolu
  computedFrom: { rulesetId: string; legalRegime: string }
}
```

Povinnosti se přepočítávají při každé změně, která na ně má vliv (nový kontakt, nová
dohoda, nové svěření dítěte, nová sada pravidel). Nikdy se nedopisují ručně.

### Přehled generovaných termínů

| Povinnost | Základ | Lhůta |
| --- | --- | --- |
| Osobní styk | poslední styk | **2 měsíce** (§ 47b odst. 4) |
| Zpráva o průběhu PP | poslední zpráva / uzavření dohody | **6 měsíců** (§ 47b odst. 5) |
| Předání zprávy třem adresátům | vypracování zprávy | **15 dnů** |
| Konec vzdělávacího období | ukotvení období | **12 měsíců** (dok. 10) |
| Konec respitního roku | 31. 12. | kalendářní rok |
| Uzavření dohody | právní moc svěření | **30 dnů** |
| Okno pro výpověď | 30. 6. / 31. 12. | **−30 dnů** |
| Souhlas ORP | žádost | bez zákonné lhůty, ale blokuje aktivaci |

---

## 3. Pravidlo dvou měsíců — per dítě, ne per rodina

Tady je snadné udělat chybu, která by systém udělala právně nespolehlivým.

§ 47b odst. 4 žádá osobní styk *„s osobou pečující nebo osobou v evidenci **a s dětmi
svěřenými do její péče**“*. Metodika k tomu: *„**Vynechání kontaktu s dítětem není
možné**“* (s výjimkou např. hospitalizace) a jakékoli nedodržení lhůty *„musí být řádně
odůvodněno ve spisu“*.

> **Z toho plyne: lhůta neběží jednou za rodinu, ale zvlášť za pěstouna a zvlášť za
> každé svěřené dítě.**

Návštěva, při které bylo jedno ze tří dětí ve škole, **nevynuluje hodiny tomu dítěti**.
Kdyby systém měl jedno zaškrtávátko „návštěva proběhla“, vykazoval by soulad tam, kde
není.

```ts
interface MonitoringContact {
  agreementId: string
  occurredAt: string
  place: 'home' | 'organization' | 'other'
  // KDO BYL SKUTEČNĚ PŘÍTOMEN — z toho se počítá plnění
  presentPersonIds: string[]        // pěstoun(i)
  presentChildIds: string[]         // děti
  absentChildren: Array<{
    childId: string
    reason: string                  // hospitalizace, škola, pobyt…
    justified: boolean              // odůvodnění do spisu
  }>
  // metadata jsou čitatelná i pro OSPOD; obsah zápisu je v podkolekci (dok. 04)
}
```

Na profilu spisu se pak nezobrazuje jedno číslo, ale **řádek za pěstouna a řádek za
každé dítě** s vlastním „naposledy viděn / zbývá“.

---

## 4. Řízení času: den, cesta, zátěž

### Plánování dne s cestou

```ts
interface CalendarEvent {
  kind: 'monitoring_visit' | 'contact_event' | 'education' | 'respite'
      | 'meeting' | 'deadline' | 'travel' | 'admin' | 'personal'
  startIso: string; endIso: string; allDay: boolean
  assignedPersonIds: string[]
  subjectRefs: Array<{ type: 'family'|'caregiver'|'child'; id: string }>
  recurrenceRule: string | null       // RRULE — „každý druhý čtvrtek“
  location: string | null

  // řízení času
  plannedMinutes: number
  actualMinutes: number | null
  travel: { minutes: number; km: number; mode: 'car'|'public'|'none' } | null
}
```

- **Cesta je samostatná událost**, ne odhad v hlavě. Bez ní se den se čtyřmi návštěvami
  ve třech obcích naplánovat nedá.
- Cesta zároveň nese `km`, což je vstup pro cestovní náhrady a pro sazbu PHM
  z datované řady (dok. 05 sekce 5) — údaj se tak zadává jednou.
- **Návrh dne**: systém umí nabídnout, koho navštívit, podle blížících se lhůt
  a geografické blízkosti. Nabízí, člověk rozhoduje — stejné pravidlo jako u AI a vět.

### Pohled na zátěž

Kapacita „18–23 rodin na 1,0 FTE“ (dok. 01) je hrubá metrika. Skutečný tlak nedělá počet
rodin, ale **počet povinností v daném měsíci**:

```
Srpen 2026 · Klíčová osoba: M. Štěpánková · 0,8 FTE
  povinné osobní styky      14   (z toho 3 po termínu)
  zprávy k vypracování       4
  konce vzdělávacích období  2
  asistované kontakty        6
  odhad času s cestou      ~47 h
```

Tohle je informace, kterou vedoucí potřebuje k rozdělení práce a kterou počet rodin
neukáže. Dva pěstouni s pěti dětmi generují víc povinných styků než pět pěstounů
s jedním dítětem.

### Zástup a mezery v pokrytí

Když je Klíčová osoba nemocná nebo na dovolené, **lhůty jejích rodin běží dál**.
Kalendář proto musí umět zobrazit **mezeru v pokrytí**: které povinnosti spadají do doby
nepřítomnosti a kdo je převezme (zástup podle dok. 03 scénář A). Bez toho se termíny
prošvihnou právě v době, kdy si toho nikdo nevšimne.

---

## 5. Přiřazení času → podklad pro uznatelnost

Z bodu 3 v sekci 1. Každá událost může nést, čemu se čas věnoval:

```ts
attribution: {
  spvppEligible: boolean
  rightCode: 'a'|'b'|'c'|'d'|'e'|'f'|'g' | null   // které právo § 47a odst. 2
  caseFileId: string | null
  otherActivity: string | null      // jiná agenda organizace
}
```

Z toho vznikne report (dok. 07 sekce 4): za období a pracovníka **podíl času na
činnostech hrazených ze SPVPP vs ostatní**. To je právě to „prokazatelné kritérium“,
které Instrukce žádá.

**Dvě upozornění, aby to nesklouzlo špatným směrem:**

1. **Není to sledování zaměstnanců.** Cílem je poměr agend za období, ne minutová
   kontrola. Report by měl umět jen agregát; detail slouží pracovníkovi, ne k hodnocení.
2. **Vyplňování musí být téměř zdarma.** Když bude přiřazení času vyžadovat zvláštní
   krok, nikdo ho dělat nebude a údaj bude nepravdivý — a nepravdivý podklad pro
   vyúčtování je horší než žádný. Proto se `attribution` **předvyplní z typu události
   a z vazby na spis** a mění se jen výjimečně.

---

## 6. Pohledy a izolovaný scroll

Zadání (M2) žádá: měsíční mřížka, týdenní rozvrh, 3denní, denní, chronologická agenda;
svislé rolování kolečkem posouvá **výhradně hodiny uvnitř mřížky** v rozsahu
**7:00–20:00** a při načtení se automaticky odroluje na 7:00.

- **Na mobilu je to důležitější než na desktopu**, protože svislé gesto koliduje
  s rolováním stránky. Mřížka proto musí zachytávat gesto v sobě
  (`overscroll-behavior: contain`, `touch-action` na kontejneru) a stránka pod ní
  se nesmí hýbat.
- Rozsah 7:00–20:00 patří do nastavení organizace i uživatele — terénní pracovník
  s ranními návštěvami má jiný den než kancelář.
- **Výchozí pohled na mobilu je den nebo agenda**, ne měsíc. V terénu se člověk dívá na
  „co mám teď a co dál“, ne na mřížku měsíce.
- Přes celý pohled se vrství **povinnosti** (sekce 2) — termín zprávy je vidět v týdnu
  stejně jako schůzka, i když to není událost s časem.

Kvůli tomu specifickému chování dávám znovu doporučení z rešerše: **headless komponenta
nad `dnd-kit`**, ne hotová kalendářová knihovna. Vlastní gesto a vrstvení povinností
by u hotové knihovny znamenaly boj s jejím vnitřním scrollem.

---

## 7. Export iCal — a jedno riziko, které je snadné přehlédnout

Zadání žádá iCal odkaz pro synchronizaci s Outlookem a Google Calendarem.

> **Pozor: název události v externím kalendáři odchází ke Googlu nebo Microsoftu.**
> „Návštěva – Nováková, Leona (8 let)“ v Google kalendáři znamená předání údajů
> o dítěti v pěstounské péči třetí straně — stejný problém jako u WhatsAppu (dok. 09).

Řešení: **anonymizovaný export jako výchozí.**

| Režim | Titulek v externím kalendáři |
| --- | --- |
| `anonymized` (výchozí) | `Návštěva · ROD-2026-001` |
| `codes_only` | `Doprovázení` + čas a místo |
| `full` | plné jméno — jen po výslovném zapnutí s upozorněním |

Další zásady:
- Export je **jednosměrný** (systém → externí kalendář). Dvousměrný sync by tahal cizí
  data do spisu a otevřel otázku, čí jsou.
- Feed URL je **tajemství** — dlouhý neuhodnutelný token, možnost zneplatnit.
- Místo (adresa domácnosti) se v `anonymized` režimu **neexportuje**.

---

## 8. Offline

- **Čtení**: dnešní a nejbližší dny z cache (dok. 02 sekce 5).
- **Zápis**: vlastní události a záznamy o návštěvě jdou do outboxu — jsou
  jednopisatelské, takže bez konfliktů.
- **Povinnosti se počítají na serveru.** Offline se zobrazí naposledy spočítaný stav
  s poznámkou „k datu…“, aby si pracovník nemyslel, že vidí aktuální lhůty.
- Vytvoření události na cizí kalendář (přidělení kolegovi) offline **nejde** — je to
  sdílená entita, server je autorita.

---

## 9. Dopad na model a rozsah

| Přidáno | Poznámka |
| --- | --- |
| `Obligation` jako dopočítaná entita | motor termínů, ne ruční připomínky |
| `MonitoringContact.presentChildIds` + `absentChildren` | plnění per dítě, sekce 3 |
| `CalendarEvent.travel`, `plannedMinutes`, `actualMinutes` | řízení času |
| `CalendarEvent.attribution` | podklad pro uznatelnost osobních nákladů |
| Pohled na zátěž a mezery v pokrytí | pro vedoucí |
| iCal export s režimy anonymizace | sekce 7 |

Vše v MVP — kalendář a lhůty jsou na kritické cestě spisu.

---

## 10. Otevřené

1. **Počítá se osobní styk jen v domácnosti?** Metodika říká, že kontakt může proběhnout
   i jinde (herna, prostory organizace) a **nesmí být formální** — účast na vzdělávací
   akci se za styk nepočítá. Navrhuji: `place` je povinné a `place: 'other'` vyžaduje
   krátké odůvodnění, aby se z toho nestala klička.
2. **Odhad délky návštěvy** — má se `plannedMinutes` předvyplňovat z historie u té
   rodiny, nebo z jedné organizační výchozí hodnoty?
3. **Kdo vidí zátěžový pohled?** Navrhuji vedoucí a org_admin plně, Klíčová osoba jen
   svůj — jinak to sklouzne ke srovnávání lidí mezi sebou.
4. **Cesta jako součást pracovní doby** pro účely přiřazení: má se čas na cestě
   přiřazovat k rodině, kam se jede, nebo zvlášť? Pro vyúčtování se to může lišit.
