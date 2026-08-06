# 08 — Podpisový obřad, dětská aplikace a rozsah MVP

Navazuje na [07](./07-flexibilita-standardy-editor-podpisy.md). **Přepisuje sekci 6
dokumentu 07** (podepisování) a stanoví rozsah prvního nasazení.

---

## 1. Zaznamenaná rozhodnutí

| # | Otázka | Rozhodnutí |
| --- | --- | --- |
| 1 | Vedoucí u plánů | **může vše** — editovat, komentovat, schvalovat, podepisovat |
| 2 | Podpis dítěte | **ano, podle věku, ve své verzi PWA** |
| 2 | Podpisový obřad | **vždy na mobilu**, navázaný na **biometriku** + **zaslaný kód**, kód se **vkládá do podpisu** |
| 3 | Knihovna vět | **na počátku prázdná**; v nastavení musí být možnost ji naplnit |
| 4 | Rozsah | na počátku **jen to nejnutnější**; stížnosti, mimořádné situace, zpětná vazba, vzdělávání zaměstnanců, leasingy aut a podobné až později |

---

## 2. Podpisový obřad — a oprava mého offline návrhu

### Co se mění proti dok. 07

V dok. 07 jsem navrhl, že podpis lze **zachytit offline** a odeslat outboxem. **To s
biometrikou a zaslaným kódem nejde:**

- kód se musí **doručit** (SMS / e-mail) — bez sítě se nedoručí,
- ověření biometrického potvrzení proti serveru **potřebuje odpověď serveru**.

> **Oprava: podpis je online operace.** Příprava dokumentu zůstává plně offline, samotné
> podepsání vyžaduje připojení.

To není omezení, které bych obcházel — je to **správně**. Průkaznost obřadu stojí právě
na tom druhém kanálu a na serverovém ověření. „Offline podpis“ by byl obrázek bez
důkazní hodnoty.

### Návrh obřadu

```
1. Dokument je hotový a uzamčený k podpisu   → spočítá se kanonický hash obsahu
2. Podepisující otevře dokument na MOBILU     → vidí, co podepisuje (název, období, subjekt)
3. Biometrika                                 → WebAuthn assertion, challenge = HASH OBSAHU
4. Server odešle kód na ověřený kanál         → SMS nebo e-mail podepisujícího
5. Podepisující kód zadá                      → potvrzení druhým kanálem
6. Server podpis uloží a kód VLOŽÍ do podpisového bloku dokumentu
```

**Krok 3 je to podstatné.** Biometrika sama o sobě dokument nepodepisuje — jen ověří
osobu proti zařízení. Průkazný je až **WebAuthn assertion, jehož challenge je hash
podepisovaného obsahu**. Tím se kryptograficky sváže konkrétní osoba, konkrétní zařízení
a **konkrétní verze dokumentu**. Změní-li se obsah, assertion na něj nepasuje a podpis
padá.

Platí dál z dok. 07: **podepisuje se kanonický hash strukturovaných dat, ne PDF
byte-stream.** PDF je jen vykreslení.

### Podpisový blok v dokumentu

```
Podepsal:        Marie Nováková (osoba pečující)
Datum a čas:     6. 8. 2026 14:32:07 SELČ
Způsob:          biometrické potvrzení na mobilním zařízení + kód
Ověřovací kód:   7F3K-2Q98
Kontrolní součet dokumentu: a91c4f…
```

Kód v bloku je ta „vložená“ část — je to lidsky ověřitelná stopa: kdo dostal kód na svůj
kanál, ten podpis provedl.

### Model

```ts
interface SignatureCeremony {
  documentKind: 'plan_10c' | 'plan_10d' | 'checklist_run' | 'care_log' | 'report_ack'
  documentId: string
  contentHash: string                 // kanonický hash dat, = WebAuthn challenge
  lockedAt: string                    // od uzamčení se obsah nesmí změnit

  signers: Array<{
    personId: string
    role: 'caregiver' | 'key_person' | 'supervisor' | 'child' | 'care_provider' | 'other'
    required: boolean

    status: 'pending' | 'signed' | 'declined'
    signedAt: string | null

    // faktory
    webauthn: { credentialId: string; assertionId: string; verifiedAt: string } | null
    otp: { channel: 'sms' | 'email'; sentTo: string; code: string; confirmedAt: string } | null

    evidence: { deviceLabel: string; platform: string; appVersion: string; ip: string }
  }>

  status: 'open' | 'complete' | 'invalidated'
  invalidatedReason?: 'content_changed' | 'signer_declined' | 'expired'
}
```

### Detaily, které je nutné dořešit

1. **Ověřený kanál je předpoklad.** Kód nelze poslat na neověřený telefon. Do modelu
   `Person` proto přidávám `verifiedPhone` a `verifiedEmail` se stavem ověření a datem.
   Bez toho obřad nemá kam doručit a průkaznost padá.
2. **Zápisní obřad není podpis Dohody.** Dohoda je veřejnoprávní smlouva a vzor ji
   podepisuje na papíře ve dvou originálech. Tenhle obřad je pro **interní artefakty**
   (plány, výkazy, seznámení se zprávou).
3. **Vypršení.** Obřad má platnost (výchozí návrh 14 dní); po ní se `expired` a musí se
   spustit znovu — jinak by v systému visely rozpodepsané dokumenty měsíce.
4. **Odmítnutí podpisu je legitimní stav**, ne chyba. Pěstoun se může se zprávou
   neshodnout — a metodika mu dává právo na vlastní vyjádření (dok. 05). `declined`
   proto s povinným důvodem.
5. **Kdo nemá mobil nebo biometriku?** Ne každý pěstoun má zařízení s Face ID.
   Potřebujeme **náhradní cestu**: podpis na zařízení Klíčové osoby s kódem zaslaným
   pěstounovi (tedy biometrika pracovníka + kód pěstouna), zaznamenaný jako jiný způsob.
   Bez toho systém vylučuje část pěstounů — a u prarodičů-pěstounů to bude častý případ.
   **Tohle potřebuju potvrdit.**

---

## 3. Dětská aplikace — čtvrtá plocha

Rozhodnutí „ve své verzi PWA“ znamená, že produkt má **čtyři plochy**, ne tři:

| Plocha | Kdo | Charakter |
| --- | --- | --- |
| Terénní mobil | Klíčová osoba, vedoucí | offline-first, diktát, checklisty |
| Desktop | Klíčová osoba, vedoucí, org_admin | správa, nastavení, reporty |
| Portál pěstouna | pěstoun | vzdělávání, respity, žádosti, podpisy |
| **Dětská aplikace** | **dítě** | **svůj plán, svůj názor, podpis podle věku** |

### Co dítě vidí

Vychází to ze standardu **2a.3** („pověřená osoba **vždy zjišťuje názor dítěte
a přikládá mu váhu**“) a z metodiky, podle níž plán vzniká **za participace dítěte**
a dítě ho **musí mít k dispozici**:

- **svůj plán průběhu pobytu** (10c) — jazykem přiměřeným věku
- **možnost vyjádřit svůj názor** k plánu a k jeho cílům; názor se ukládá jako záznam
  s autorstvím dítěte, ne jako přepis pracovníkem
- **nadcházející věci, které se ho týkají** — plánované kontakty, respitní akce
- **podpis** plánu, je-li nad nastaveným věkem

### Co dítě nevidí — a to je návrhově nejcitlivější část

Nevidí zápisy Klíčové osoby o sobě, hodnocení pěstouna, výdaje, zprávy pro OSPOD ani
interní poznámky. Důvod: jsou to pracovní hodnocení třetích osob a dítě je jejich
předmětem, ne adresátem.

To je stejná hranice jako u OSPOD (dok. 04), jen jinde vedená — a dobře na ní vidět,
proč bylo správné rozdělit **metadata kontaktu** a **obsah zápisu** do oddělených
dokumentů. Bez toho rozdělení by dětská aplikace nešla postavit bezpečně.

### Věkový práh

`childSigningMinAgeYears` — nastavitelné na úrovni systému i organizace (výchozí návrh
**12 let**, což odpovídá běžné praxi zjišťování názoru dítěte). Pod prahem dítě
aplikaci mít může, ale nepodepisuje.

### Co doporučuji, ale respektuji odklad

Nejbezpečnostně nejcitlivější věc, kterou by dětská aplikace mohla mít, je **cesta, jak
říct, že se něco děje** — standard **2b** ukládá pověřené osobě chránit dítě před
zneužíváním, zanedbáváním a týráním a mít písemný postup. Rozhodl jsi odložit stížnosti
i zpětnou vazbu, což respektuji. Zmiňuji to proto, že u dětské aplikace to není
administrativní modul, ale bezpečnostní funkce — navrhuji ji zvážit hned, jakmile
dětská plocha vznikne, i v minimální podobě „chci mluvit se svou Klíčovou osobou“.

---

## 4. Knihovna vět: prázdná, ale musí se umět naplnit

Rozhodnutí: **žádná výchozí sada.** Nastavení organizace dostane správu knihovny.

Z toho plyne jedna věc, kterou je nutné navrhnout dobře, jinak zůstane prázdná navždy:

> **Věty se nesmí přidávat jen v nastavení. Musí se dát uložit z místa, kde vznikají —
> tedy přímo při psaní plánu.**

- Klíčová osoba napíše větu do plánu → tlačítko **„Uložit do knihovny“** vedle odstavce.
- Systém při ukládání nabídne **rozpoznání jmen a nahrazení tokeny** — „Pěstounka
  zajistila“ → `{{caregiver}} {{v:zajistit_past}}`, aby věta byla použitelná i pro jiné
  rodiny a správně se skloňovala (dok. 07 sekce 5).
- Zařazení do kontextu (`contextTags`) se předvyplní podle toho, ve které sekci plánu
  věta stála.
- Vedoucí knihovnu **kurátoruje** — schvaluje, upravuje, sjednocuje duplicity.
  (Vedoucí smí vše, takže to sedí k rozhodnutí 1.)

Nastavení pak obsahuje jen správu: seznam, hledání, úpravy, sloučení, archivace.
Prvních pár měsíců se knihovna plní z provozu, ne administrativně.

---

## 5. Rozsah MVP

### V prvním nasazení

| Oblast | Obsah |
| --- | --- |
| **Organizace a lidé** | organizace, členství s FTE a platností, role, přidělení Klíčové osoby, předávací protokol |
| **Osoby** | pěstouni (pečující / v evidenci), děti, ověřený telefon a e-mail |
| **Spis** | spis rodiny, `orgAccessList`, `Placement` s historií |
| **Dohody** | životní cyklus, souhlas OÚ ORP, pololetní zánik, výpovědní pravidla, právní režim |
| **Přechod pěstouna** | Předávací kód včetně self-service cesty |
| **Kontakty** | osobní styk: metadata + oddělený obsah zápisu, lhůta 2 měsíců |
| **Zápisy a diktát** | časová osa, AI diktát s pseudonymizací |
| **Checklisty** | knihovna na úrovni organizace, offline vyplnění, `mapsTo` do plánu a zprávy |
| **Úkoly a kalendář** | včetně izolovaného scrollu 7:00–20:00 |
| **Vzdělávání** | klouzavá 12měsíční období, 18/24 h, převod přebytku, certifikáty |
| **Respity** | dny per dítě a rok, věková podmínka, „i hodina = den“ |
| **Výdaje** | jednoduchá evidence: částka + ke komu se váže |
| **Plány** | 10c a 10d, editor, předvyplnění, knihovna vět (prázdná) |
| **Zprávy** | 6měsíční cyklus + při zániku, tři adresáti, lhůta 15 dnů |
| **Podpisy** | mobilní obřad: biometrika + kód |
| **Dokumenty** | generování PDF, podepsané verze, spisová dokumentace |
| **Standardy** | generátor 16 standardů / 30 kritérií, adopce, sebehodnocení 0–3 |
| **Nastavení** | systém + organizace, verzované, upozornění vypínatelná |
| **Reporty** | základní pro účetní: 4 dimenze, XLSX |
| **Audit** | včetně `CROSS_CASE_ACCESS` |
| **Plochy** | terénní mobil, desktop, portál pěstouna, dětská aplikace |

### Odloženo

| Oblast | Poznámka |
| --- | --- |
| Pásma čerpání § 5c a výpočet výše SPVPP | za `spvppLimitsEnabled` |
| **Leasingy aut** | návrh hotový v dok. 06 sekce 3, modul se nestaví |
| **Stížnosti** (14a) | |
| **Mimořádné situace** (15a) | |
| **Zpětná vazba** (16b) | |
| **Vzdělávání zaměstnanců** (8b) | |
| ISDS | zprávy zatím PDF + doručení mimo systém, ale s evidencí předání |
| Role OSPOD | za `ospodAccessEnabled`; oddělení metadat a obsahu ale stavíme hned |
| Zapůjčení spisu (13a) | stav spisu, doplníme s modulem dokumentace |

### Jedno upřesnění k odloženým standardům

Standardy 8b, 14a, 15a a 16b jsou pro pověřenou osobu **povinné** a inspekce je hodnotí.
Odkládáme **pracovní modul**, ne povinnost — organizace je zatím plní mimo systém.

**Generátor Standardů proto tyto kapitoly generuje dál**, včetně jejich textu a
sebehodnocení. Je to jen text a nastavení, ne workflow. Kdybychom kapitoly vynechali,
vygenerované Standardy by byly nekompletní a nepoužitelné pro inspekci — což by z celé
funkce udělalo poloviční nástroj.

---

## 6. Otevřené

1. **Náhradní cesta podpisu** pro pěstouna bez mobilu nebo biometriky (sekce 2, bod 5).
   Prarodiče-pěstouni to budou potřebovat.
2. **Věkový práh podpisu dítěte** — potvrzuješ 12 let jako výchozí?
3. **Co přesně znamená „jiné nepodstatnosti“** — z mého modelu bych ještě zvažoval
   odložení: `contactEvents` (asistované kontakty s biologickou rodinou jako samostatný
   modul) a `BenefitRequest` (žádosti pěstouna o příspěvek). Obojí jde v MVP zjednodušit
   na záznam v timeline a ruční výdaj. Mám je odložit?
4. **Tříúrovňový přístup** — pořád „asi ano“. Zavádím jako nastavitelnou politiku
   s výchozím zapnutím, takže to nebrání, ale rád bych to uzavřel.
