# 18 — PPPD, EXIT, poručník, archiv a notifikace

Uzavírá čtyři z šesti mezer ze [dok. 00](./00-prehled-a-co-zbyva.md) sekce 2 B.

---

## 1. Zapsaná rozhodnutí

| Téma | Rozhodnutí |
| --- | --- |
| **Notifikace** | řeší se **ad-hoc při stavbě**. Zásada: pěstounovi a dítěti nechodí prakticky nic — upozorňuje je Klíčová osoba. Výjimky: **blížící se kontakt/návštěva** a **„máte zprávu od Klíčové osoby“**. |
| **Zletilost dítěte** | **nic se nestane**; systém běží dál až do ukončení péče |
| **Ukončení péče** | může nastat i před zletilostí (např. návrat dítěte rodičům) a **musí být doprovozeno dokladem** |
| **Po ukončení** | **nic se nemaže, jen odloží do archivu** — dotaz může přijít i mnoho let potom, typicky od dítěte, které v péči bylo |
| **EXIT** | pět druhů (sekce 4); organizace si odnese **jen to nejnutnější, ve formátu PDF** jako zprávy k pěstounům, dětem a Klíčovým osobám |
| **Poručník a další osoby pečující** | vyřešeno ze zákona — sekce 3 |

---

## 2. Přechodná pěstounská péče — provozní model

Tvůj postřeh je přesně ten, na kterém to celé stojí, a stojí za to ho vytáhnout
z textu do vlastního odstavce:

> **Pěstouna lze registrovat i bez svěřeného dítěte.** Rozdíl je jen v tom, jestli je
> to pěstoun **přechodný**, který má povinnosti i bez dítěte, nebo **dlouhodobý či
> příbuzenský**, který má povinnosti jen se svěřeným dítětem.

Zákon to potvrzuje doslova. § 47c odst. 1: dohoda trvá *„po dobu, po kterou je
vykonávána pěstounská péče osobou pečující, **nebo po dobu, po kterou je osoba zařazena
do evidence** osob, které mohou vykonávat pěstounskou péči po přechodnou dobu“*.
U osoby v evidenci tedy dohoda **nevisí na dítěti vůbec** — visí na zápisu v evidenci
krajského úřadu.

### 2.1 Co z toho plyne pro model

**Dohoda se nikdy neváže na dítě.** To už v modelu je (§ 47b odst. 6 — jedna dohoda
bez ohledu na počet dětí), ale u PPPD to je vidět nejostřeji: dohoda může existovat
měsíce bez jediného `Placement`. Prázdný spis není chyba ani nedokončený stav.

```ts
interface Agreement {
  // …
  carerKind: 'pecujici' | 'v_evidenci'      // § 2a písm. c) vs b)
  registryEntry: {                          // jen u 'v_evidenci'
    krajskyUradId: string
    enrolledFrom: string
    enrolledUntil: string | null            // vyřazení z evidence = zánik dohody
  } | null
}
```

### 2.2 Povinnosti bez dítěte

| Povinnost | Přechodný (osoba v evidenci) | Dlouhodobý / příbuzenský |
| --- | --- | --- |
| **Osobní styk 1× za 2 měsíce** | **ano, i bez dítěte** — § 47b odst. 4 mluví o styku *„s osobou pečující nebo osobou v evidenci a s dětmi svěřenými do její péče“* | jen s dítětem (a per dítě) |
| **Zpráva 1× za 6 měsíců** | **ano** | ano |
| **Vzdělávání** | **ano, a vždy 24 h** — PPPD je podle § 47a odst. 1 písm. b) bodu 2 vždy *zprostředkovaná* | 18 h, u zprostředkované 24 h |
| **Respit 14 dní** | **ne, dokud není dítě** — § 47a odst. 2 písm. b) žádá svěřené dítě starší 2 let | ano, per dítě |
| **Připravenost přijmout dítě** | ano — odmítnutí bez vážného důvodu je **výpovědní důvod** (§ 47c odst. 2 písm. c) | netýká se |

Dvě věci, které by se bez tohohle rozdělení rozbily:

- **Vzdělávání u PPPD je vždy 24 hodin**, ne 18. Kdyby to systém odvozoval od toho,
  jestli je právě svěřené dítě, kolísalo by to během roku podle obsazenosti.
  Odvozuje se z `carerKind`, ne z přítomnosti dítěte.
- **Motor lhůt musí umět běžet bez dítěte.** Dnešní `Obligation` v dok. 11 má
  `childId` a u osobního styku se počítá per dítě. U osoby v evidenci bez dítěte
  vzniká jen řádek za osobu — a ten se nesmí přeskočit jako „nemá děti, nic neřeším“.

### 2.3 Střídání dětí

Tohle je ta část, kterou jsi označil za nutnou. Průběh:

```
Dítě přichází      → Placement (od, důvod, doklad = rozhodnutí soudu)
Dítě je v péči     → běží lhůty per dítě, respity, plány
Dítě odchází       → Placement.endedOn + endReason + doklad
                     ├── do trvalé rodiny (i v systému → viz níže)
                     ├── zpět rodičům
                     ├── k poručníkovi
                     └── do ústavního zařízení
Pěstoun bez dítěte → dohoda TRVÁ, lhůty per osoba běží dál
```

```ts
interface Placement {
  childId: string
  agreementId: string
  startedOn: string
  startDocumentId: string | null            // rozhodnutí soudu

  endedOn: string | null
  endReason: null
    | 'to_permanent_foster'   | 'to_parents'      | 'to_guardian'
    | 'to_adoption'           | 'to_institution'  | 'adulthood'
    | 'care_terminated_other' | 'child_died'
  endDocumentId: string | null              // POVINNÝ doklad — rozhodnutí
  endNote: string | null

  transferredToAgreementId: string | null   // když jde k pěstounovi v systému
}
```

**Doklad u ukončení je povinný obsahově, ne blokačně.** Podle charty (dok. 16) nic
neblokuje: ukončení se zapíše i bez dokladu a v přehledu je vidět, že doklad chybí.
Systém jen netvrdí, že doklad má.

### 2.4 Předání dítěte jinému pěstounovi v systému

Nejcennější případ: přechodný pěstoun předává dítě trvalé rodině, která je taky
v systému — v téže organizaci nebo v jiné.

| Co jde s dítětem | Co nejde |
| --- | --- |
| identita dítěte, historie umístění | zápisy z návštěv u předchozího pěstouna |
| **kniha života** (dok. 10) — je dítěte, ne organizace | kontaktní údaje předchozího pěstouna (dok. 09) |
| dokumenty o dítěti: rozsudky, zdravotní, školní | výdaje a hospodaření předchozí rodiny |
| souhrnná zpráva k předání | |

**V rámci jedné organizace** je to jedno `Placement` ukončené a druhé založené; spis
dítěte je jeden a pokračuje. **Mezi organizacemi** se použije stejná mechanika jako
u přechodu pěstouna (Předávací kód, dok. 02) — jen předmětem není pěstoun, ale dítě.
Přijímající organizace dostane identitu, dokumenty o dítěti a souhrnnou zprávu;
nedostane spisové zápisy odesílající organizace.

**Respitní dny a vzdělávací hodiny se u dítěte nepřenášejí** — respit je právo pěstouna
(§ 47a odst. 2 písm. b) vázané na jeho dohodu, ne na dítě. Když dítě přejde k jinému
pěstounovi, tomu běží jeho vlastní čtrnáctidenní nárok. To je opak pravidla u přechodu
*pěstouna* (dok. 09), kde počty jdou s ním, a je snadné to zaměnit.

---

## 3. Poručník a další osoby pečující — vyřešeno

Nebylo to k vymýšlení, je to v § 2a písm. c). **Osoba pečující** není jen pěstoun:

| Bod | Kdo to je | Právo na dohodu |
| --- | --- | --- |
| c) 1 | komu bylo dítě svěřeno do **pěstounské péče**, **PPPD**, **předpěstounské péče** nebo **do péče podle § 953 OZ** | ano |
| c) 2 | kdo osobně pečuje **v průběhu řízení** o svěření do péče / PP / předpěstounské / o jmenování poručníkem, bylo-li zahájeno z moci úřední | ano, **s vyjádřením ORP** |
| c) 3 | kdo osobně pečuje a **podal návrh**, není-li péče zjevně bezdůvodná | ano, **s vyjádřením ORP** |
| c) 4 | **poručník, jestliže o dítě osobně pečuje** | ano |
| b) | **osoba v evidenci** (PPPD) | ano |

Takže **poručník, který o dítě osobně pečuje, je osoba pečující** a doprovázení se ho
týká úplně stejně. Poručník, který o dítě nepečuje (spravuje jen majetek), do systému
nepatří.

### Co je potřeba doplnit do modelu

```ts
custodyBasis:
  | 'foster'            // c) 1 — pěstounská péče
  | 'foster_temporary'  // c) 1 — PPPD (+ b) osoba v evidenci)
  | 'pre_foster'        // c) 1 — předpěstounská
  | 'care_953'          // c) 1 — péče jiné osoby podle § 953 OZ
  | 'pending_ex_officio'// c) 2 — řízení z moci úřední
  | 'pending_on_motion' // c) 3 — na návrh
  | 'guardian_caring'   // c) 4 — poručník s osobní péčí
```

A jeden nový artefakt, který v modelu chybí:

```ts
interface OrpStatement {          // § 10 odst. 3 — vyjádření ORP
  personId: string
  childId: string
  basis: 'pending_ex_officio' | 'pending_on_motion'
  issuedByOrpId: string
  issuedOn: string
  personallyCares: boolean
  manifestlyUnfounded: boolean | null   // jen u c) 3
  documentId: string
}
```

Bez tohohle vyjádření **nelze u kategorií c) 2 a c) 3 dohodu uzavřít** — § 10 odst. 3
ho vydává výslovně *„pro účely uzavírání dohod o výkonu pěstounské péče“*. Je to tedy
druhý dokument vedle souhlasu ORP podle § 154 správního řádu (dok. 01), ne jeho
záměna, a týká se jiných osob.

**Pozn.:** u c) 2 a c) 3 je právní stav dočasný — řízení skončí a osoba se překlopí do
c) 1, c) 4, nebo přestane být osobou pečující. `custodyBasis` proto musí být
**datovaný stav, ne jednorázová vlastnost**.

---

## 4. Archiv místo mazání

Rozhodnutí: **po ukončení péče se nic nemaže, jen odkládá.** Důvod, který jsi uvedl,
je ten nejsilnější — dotaz může přijít mnoho let potom a typicky od dítěte, které
v péči bylo.

```ts
interface CaseFile {
  // …
  lifecycle: 'active' | 'archived'
  archivedOn: string | null
  archivedReason: 'care_ended' | 'agreement_ended' | 'org_exit' | null
  retentionUntil: string | null       // ze skartačního plánu, doplní se později
}
```

| Vlastnost | Aktivní spis | Archivovaný spis |
| --- | --- | --- |
| Zápis nových záznamů | ano | **ne** |
| Čtení | ano | **ano** — na to je archiv |
| Eli odpovídá nad ním | ano | **ano**, ale s příznakem *archiv* |
| V přehledech a statistikách | ano | jen když si o to člověk řekne |
| Lhůty a anotace | ano | **žádné** — archiv nic nehlídá |
| Přístup pěstouna | dle dok. 10 | dle dok. 10 |
| Mazání | neexistuje | jen skartačním řízením (dok. 10) |

**Archiv není jiné úložiště, je to stav.** Vytvářet druhou databázi pro archiv by
znamenalo dvě cesty ke stejným datům, dvakrát oprávnění a dvakrát audit. Spis zůstává,
kde je, jen se přestane chovat jako živý.

**Dotaz po letech je první třídy použití, ne výjimka.** *„Jsem Klára, byla jsem
u Novákových v letech 2026–2031, chci vědět, co je o mně vedené.“* Systém na to musí
umět odpovědět — proto se archiv indexuje (dok. 17) a proto je v `CaseFileViewLog`
vidět, kdo do archivu nahlížel.

---

## 5. EXIT — pět druhů

Společná zásada: **odchod nikdy nemaže historii.** Odchod znamená, že se
komu odebere přístup a co si odnese.

| # | Kdo odchází | Co se stane | Co si odnese |
| --- | --- | --- | --- |
| **E1** | **Organizace** z platformy | všechny spisy → archiv; přístupy zaniknou; data zůstávají | **PDF zprávy** za každého pěstouna, dítě a Klíčovou osobu — jen to nejnutnější pro další práci |
| **E2** | **Klíčová osoba** z organizace | přiřazení se převede (dok. 03); autorství v historii zůstává navždy | nic osobního; na vyžádání potvrzení o rozsahu práce |
| **E3** | **Pěstoun** | přístup zaniká **ihned** při zániku dohody (dok. 10); při přechodu v systému se změní jen organizace a Klíčová osoba a historii vidí dál | **Závěrečná zpráva** (§ 47b odst. 5) |
| **E4** | **Dítě** | ukončením péče spis do archivu; přístup do dětské aplikace se deaktivuje | **kniha života** (dok. 10) — je jeho |
| **E5** | **Vedoucí a ostatní pracovníci** | jako E2; u vedoucího navíc předání nedokončených schválení | nic |

### E1 podrobněji

Organizace odchází k jinému dodavateli nebo končí. Co dostane:

```
export-2026-08-07/
├── prehled.pdf                       # kolik dohod, dětí, období
├── pestouni/
│   ├── ROD-2026-001-Novakovi.pdf      # souhrn: dohoda, děti, vzdělávání,
│   └── …                              #   respity, poslední zpráva, lhůty
├── deti/
│   └── DIT-2026-014-Klara.pdf
└── klicove-osoby/
    └── KO-003-Svobodova.pdf           # rozsah práce, přidělené rodiny
```

Tři důvody, proč **PDF a ne strojový export**, jak jsi rozhodl:

1. **Je to čitelné bez našeho systému** — a to je smysl exportu.
2. **Nejde to naimportovat jinam špatně.** Strojový export do cizího systému by
   znamenal ztrátu kontextu a organizace by pracovala s neúplnými daty, aniž by to
   věděla.
3. **Nesvádí to k tomu, aby se PDF stalo naší veřejnou datovou strukturou** —
   kterou bychom pak museli udržovat.

Co se **nepředává**: úplné spisové zápisy, chatová vlákna, audit, knihy života
(ty jdou dětem, ne organizaci), a data jiných organizací.

**Kam si to organizace nahraje, je její věc** — s tím, že tím se stává správcem
i mimo systém. Do exportu proto patří jedna úvodní stránka s tím, co export obsahuje
a k jakému dni; ne poučování, jen fakt.

---

## 6. Co to mění jinde

| Dokument | Změna |
| --- | --- |
| 01 | k osobě pečující se doplňuje `custodyBasis` se sedmi hodnotami a `OrpStatement` |
| 03 | dohoda může existovat bez `Placement`; prázdný spis je platný stav |
| 09 | k přechodu pěstouna se přidává **přechod dítěte** — jiná pravidla přenosu |
| 10 | archiv jako stav spisu, ne jiné úložiště; dotaz po letech je první třídy |
| 11 | motor lhůt musí umět běžet **bez dítěte** (osoba v evidenci) |
| 13 | vyřazení z evidence KÚ je zánik dohody — patří k lhůtám vůči úřadům |
