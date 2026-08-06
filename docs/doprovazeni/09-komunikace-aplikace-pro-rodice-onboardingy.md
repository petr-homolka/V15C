# 09 — Komunikace, aplikace pro rodiče a příbuzné, onboardingy

Navazuje na [08](./08-podpisy-detska-aplikace-rozsah-mvp.md).

---

## 1. Zaznamenaná rozhodnutí

| Otázka | Rozhodnutí |
| --- | --- |
| Náhradní cesta podpisu | pěstouni v ČR mají mobil s internetem; kdo ne, **Klíčová osoba zaznamená, že potvrzuje souhlas / nesouhlas** pěstouna nebo dítěte |
| Věkový práh podpisu dítěte | **12 let** ✓ |
| Standardy | **nevynechávat nic** — generují se všechny |
| Asistovaný kontakt | **musí být** → `contactEvents` je v MVP |
| Ukládání vět z plánu | ✓ |
| Tříúrovňový přístup | ✓ potvrzeno |
| Nová plocha | **aplikace pro rodiče a příbuzné** |

### Náhradní podpis jako doložka Klíčové osoby

```ts
signers: [{
  method: 'keyperson_attestation'          // nová metoda
  attestedByPersonId: string               // Klíčová osoba
  attestationText: string                  // „Potvrzuji, že pěstounka … souhlasí s …“
  outcome: 'agreed' | 'disagreed'          // i nesouhlas je platný výsledek
  // biometrika a kód patří KLÍČOVÉ OSOBĚ, ne pěstounovi
  webauthn: {...}; otp: {...}
}]
```

Podstatné: doložka je **podpisem Klíčové osoby o tom, co pěstoun řekl**, nikoli podpisem
pěstouna. V dokumentu se tak i vykreslí — jinak by to bylo zavádějící. A **nesouhlas
musí být zaznamenatelný**, ne jen souhlas; u zprávy má pěstoun právo na vlastní
vyjádření (dok. 05).

---

## 2. WhatsApp, nebo vlastní chat? — doporučení

Ptáš se s dvěma otazníky, takže odpovídám rovnou: **postavit chat v aplikaci a obsah
případu neposílat přes WhatsApp.** WhatsApp použít nejvýš jako *nosič upozornění*.

### Proč ne WhatsApp na obsah

1. **Zvláštní kategorie osobních údajů.** Zprávy o dítěti v pěstounské péči jsou údaje
   podle čl. 9 GDPR. Posílat je přes Metu znamená předat je zpracovateli, kterého
   organizace neovládá, s omezenou zpracovatelskou smlouvou.
2. **Mlčenlivost podle § 57 ZSPOD.** Pověřená osoba má zákonnou povinnost mlčenlivosti.
   Kanál mimo její kontrolu se s tím těžko srovnává.
3. **Spisová dokumentace (standard 13a).** Komunikace o případu **patří do spisu**.
   Co je ve WhatsAppu, není ve spisu — nejde to auditovat, předat při přechodu pěstouna,
   ani předložit inspekci. Přesně tuhle mezeru dnes organizace mají.
4. **Funkční omezení WhatsApp Business API.** Mimo 24hodinové okno jde odeslat jen
   předschválené šablony, každá konverzace se platí, vyžaduje se verifikace firmy —
   a **skupinové konverzace přes Cloud API nejsou**. Rodina + Klíčová osoba + vedoucí
   v jednom vlákně by tedy nefungovala. (Podmínky se mění, před rozhodnutím je potřeba
   ověřit aktuální stav.)
5. **Dítě.** Dětská aplikace na WhatsAppu nemá co dělat — má vlastní věkové podmínky
   a vázala by dětský účet na telefonní číslo.

### Proč to přesto není jednoduché

Pěstouni a pracovníci **už WhatsApp používají**. Proto se ptáš. Když vlastní chat nebude
aspoň stejně dobrý, budou ho používat dál a spis zůstane nekompletní. Vlastní chat tedy
není „bezpečnější alternativa“, ale **musí být lepší v tom, co lidé dělají**: rychlé
posílání fotek (účtenka, certifikát) přímo do správné složky spisu, hledání ve historii,
kontext případu vedle vlákna.

### Návrh

```ts
interface MessageThread {
  id: string
  caseFileId: string
  kind: 'worker_caregiver' | 'worker_child' | 'worker_relative' | 'internal' | 'group'
  participantPersonIds: string[]        // výslovný seznam, NE „všichni na případu“
  visibleTo: string[]                   // kdo vlákno vidí (viz níže)
  createdBy: string
}
```

- **Vlákna jsou součástí spisu** → obsah je `record content`, tedy v omezené podkolekci
  (dok. 04); OSPOD ho nevidí, vidí jen metadata.
- **Zprávy se nemažou.** Spis je append-only; oprava je nová zpráva, ne přepis historie.
- **Offline**: odchozí do outboxu, historie z cache.
- **Přílohy** jdou přímo do dokumentů spisu se správnou kategorií.
- **WhatsApp / SMS / push jen jako upozornění**: „Máte novou zprávu v aplikaci“ —
  bez obsahu. To je běžný vzor v regulovaném prostředí a nevyžaduje zpracovatelskou
  smlouvu na obsah případu.

### Dvě bezpečnostní pravidla, která nejsou volitelná

1. **Vlákno dítě ↔ Klíčová osoba musí být pro pěstouna neviditelné.** Kdyby pěstoun
   viděl, co dítě píše, dítě nemůže bezpečně říct, že se něco děje. Standard **2b**
   ukládá chránit dítě před zneužíváním a týráním — vlákno viditelné pěstounovi tu
   ochranu ruší.
2. **Vlákno rodič ↔ Klíčová osoba není vidět pěstounovi** a naopak. Vztah pěstoun–rodič
   je zprostředkovaný a mediovaný; společné vlákno by ho zkratovalo.

Proto `visibleTo` jako **výslovný seznam**, nikdy „všichni účastníci případu“.

---

## 3. Pátá plocha: aplikace pro rodiče a příbuzné

Sedí to na potvrzený asistovaný kontakt (§ 47a odst. 2 písm. e).

| Plocha | Kdo |
| --- | --- |
| Terénní mobil | Klíčová osoba, vedoucí |
| Desktop | Klíčová osoba, vedoucí, org_admin |
| Portál pěstouna | pěstoun |
| Dětská aplikace | dítě (od 12 let podepisuje) |
| **Rodiče a příbuzní** | **biologický rodič, prarodič, osoba blízká** |

### Co vidí

- **nadcházející kontakt**: datum, čas, **místo konání kontaktu** (nikoli bydliště!)
- potvrzení účasti, žádost o změnu termínu
- praktické informace: jak se na místo dostat, co vzít
- **vlákno s Klíčovou osobou**
- případně příspěvky do **knihy života dítěte** (metodika ji zmiňuje), pokud to
  organizace povolí a je to v zájmu dítěte

### Co nevidí — a jedno pravidlo je kritické

> **Bydliště pěstouna a dítěte se v této aplikaci nezobrazuje nikdy.**

U řady umístění je adresa pěstouna před biologickým rodičem záměrně chráněná — proto se
kontakt koná na neutrálním místě. Kdyby ji aplikace prozradila, systém by aktivně
ohrozil dítě a pěstounskou rodinu. Adresa proto **nesmí být v datech, která tato plocha
načítá**, ne jen skrytá v UI.

Dále nevidí: spis dítěte, zápisy, zprávy, plány, výdaje, jiné děti, kontaktní údaje
pěstouna.

### Co musí model umět

```ts
interface ContactEvent {
  childId: string
  participantPersonIds: string[]        // rodič / příbuzný / osoba blízká
  venueKind: 'neutral' | 'organization' | 'caregiver_home' | 'other'
  venueAddress: string                  // NEsdílí se, je-li venueKind = caregiver_home
  addressVisibleToRelatives: boolean    // výchozí FALSE
  courtRestriction: string | null       // omezení styku rozhodnutím soudu
  assistedBy: string | null             // pracovník zajišťující asistenci
  preparation: { childPreparedAt, relativePreparedAt, caregiverPreparedAt }
  evaluation: string | null             // vyhodnocení, zda kontakt probíhal v zájmu dítěte
}
```

- **`courtRestriction`** musí blokovat pozvání do aplikace: je-li styk soudem omezen
  nebo zakázán, rodič nesmí dostat přístup k termínům.
- **Rodič ve výkonu trestu** (Směrnice to zmiňuje jako typický případ) aplikaci
  používat nemůže — kontakt a jeho organizace musí jít i **bez aplikace**. Aplikace je
  doplněk, ne podmínka.

---

## 4. Onboarding A — jednotlivý pěstoun

Výchozí premisa: **pěstoun nemá nic vyplňovat, co organizace už ví.**

```
1. Klíčová osoba založí osobu a dohodu               (v systému)
2. Odešle pozvánku                                    → SMS nebo e-mail s odkazem/kódem
3. Pěstoun ověří TELEFON a E-MAIL                     ← nutné pro podpisový obřad (dok. 08)
4. Nastaví biometriku (passkey) na svém mobilu
5. Přidá si PWA na plochu
6. Seznámí se se zpracováním osobních údajů           → potvrzení, uloženo s datem
7. Vidí své dvě agendy: vzdělávání a respity + čekající podpisy
```

- **Manželé = dva účty, jedna dohoda.** Každý podepisuje sám za sebe (dok. 01 sekce 2),
  takže pozvánka jde oběma.
- **Pěstoun bez mobilu**: krok 2–5 se přeskočí, systém funguje dál, podpisy jdou
  doložkou Klíčové osoby (sekce 1). Onboarding je **nepovinný** — to je důležité,
  jinak by neúčast pěstouna blokovala agendu organizace.
- Pozvánka má **omezenou platnost** a jde poslat znovu.

## 5. Onboarding B — existující doprovázející organizace

Nejnáročnější ze tří: organizace přichází s desítkami běžících dohod a historií.

### Postup

```
1. Založení organizace + pověření (rozsah, platnost, který KÚ vydal)
2. První org_admin
3. Úřady: místně příslušné ORP, KÚ, datové schránky
4. Standardy: adopce / úpravy 16 standardů (dok. 07)
5. Vnitřní pravidla: jejich směrnice jako orgPolicy v1 s validFrom
6. Sazby a parametry
7. IMPORT dat
8. Přidělení Klíčových osob k rodinám
9. Pozvání pracovníků → pak pěstounů
```

### Import: tři věci, které se snadno pokazí

**a) Právní režim každé dohody.** Dohody uzavřené do 31. 12. 2024 se řídí dosavadními
předpisy, nedohodly-li se strany jinak (dok. 01 sekce 9). Import proto **musí u každé
dohody zaznamenat režim** — jinak systém spočítá starým dohodám nesprávné rozsahy
vzdělávání.

**b) Rozjeté vzdělávací období.** Každý pěstoun je uprostřed svého klouzavého
12měsíčního období a už má nějaké hodiny odchozené. Import proto musí přijmout:

```
- datum uzavření dohody        → ukotvení období
- hodiny splněné v BĚŽÍCÍM období
- převod z předchozího období (§ 47a odst. 3)
```

Bez toho systém při spuštění označí celou organizaci za neplnící zákonnou povinnost.

**c) Vyčerpané respitní dny v běžícím kalendářním roce**, per dítě. Stejný důvod.

### Formát a průběh

- **XLSX šablony** (organizace pracují v Excelu) + CSV; ke každé šabloně validační
  přehled **před** zápisem, s možností suchého běhu.
- **Historické zápisy nemigrovat.** Doporučení: staré zprávy a záznamy **přiložit jako
  PDF** do spisu, ne překlepávat roky textu. Je to levnější a poctivější — překlepaná
  historie vypadá jako data, ale není ověřená.
- UID se alokují při importu transakčně (dok. 01), takže import musí být dávkový
  a idempotentní.

### Kolize s globálním registrem — spojení s onboardingem C

Když organizace importuje pěstouna, který **už v systému je** (nebo má aktivní dohodu
u jiné organizace), registr „1 pěstoun = 1 aktivní dohoda“ (dok. 01 sekce 2) kolizi
odmítne. A správně — protože takový případ **není import, je to přechod**:

```
import → shoda podle národního identifikátoru
       → nalezena aktivní dohoda jinde
       → import se zastaví a nabídne cestu podle onboardingu C (Předávací kód)
```

Systém tedy nesmí kolizi jen ohlásit jako chybu dat, ale **nabídnout správný postup**.

---

## 6. Onboarding C — pěstoun přicházející od jiné organizace

Mechanismus je z dok. 02 sekce 3 (Předávací kód). Tady jde o to, **co se přenáší**.

```
1. Pěstoun přijde s Předávacím kódem
2. Nová organizace kód uplatní                    → uvidí existenci staré dohody a její konec
3. Založí koncept dohody + požádá ORP o souhlas   → smí PŘED koncem staré dohody
4. Konec staré + 1 den                            → nová dohoda účinná
5. Doběhne přenos toho, co pěstoun povolí
```

### Co se přenáší a co ne

| Údaj | Přenos |
| --- | --- |
| existence staré dohody, datum konce, typ PP, pečující/v evidenci | ✓ automaticky po uplatnění kódu |
| název staré organizace | jen s výslovným povolením pěstouna |
| **čítače: vyčerpané respitní dny v roce, hodiny vzdělávání v běžícím období** | ✓ **musí se přenést** — viz níže |
| závěrečná zpráva | pěstoun ji může předat (metodika to doporučuje) |
| vybrané dokumenty ze spisu | jen s výslovným souhlasem |
| zápisy, hodnocení, spis dítěte | ✗ nikdy automaticky |

### Proč se čítače musí přenést

**Respitní dny** jsou „14 kalendářních dnů **v kalendářním roce**“ — tedy per rok a per
dítě, **ne per dohoda**. Dny vyčerpané u staré organizace se do roku počítají. Nová
organizace to ale ze svých dat nevidí. Kdyby se čítač nepřenesl, nová organizace by
poskytla dalších 14 dnů a **překročila zákonný rámec, aniž by to tušila**.

Proto navrhuji, aby zpřístupnění po uplatnění kódu obsahovalo **agregované čítače**
(kolik dnů, kolik hodin), nikoli podkladové záznamy. Je to minimum nutné pro správný
výpočet a zpřístupňuje to sám pěstoun svým kódem.

### Dvě právní otázky, které si nevymyslím

**1. Restartuje se vzdělávací období novou dohodou?**
§ 47a odst. 3 říká: *„První období 12 kalendářních měsíců po sobě jdoucích počíná běžet
ke dni uzavření dohody o výkonu pěstounské péče.“* Čteno doslova, nová dohoda = nové
období. Ale pak by přechod k jiné organizaci **resetoval povinnost** a pěstoun by mohl
takto obcházet 18/24 hodin.

Nevím, jak se to v praxi vykládá, a nechci to rozhodnout za tebe. Navrhuji dotaz na
MPSV nebo krajský úřad. Do té doby: **období restartovat podle doslovného textu, ale
čítač splněných hodin z předchozího období přenést a zobrazit**, aby Klíčová osoba
viděla celý obrázek a mohla se rozhodnout.

**2. Kdo dělá závěrečnou zprávu, když stará organizace nespolupracuje?**
Zprávu při zániku dohody má zpracovat ta organizace, u níž dohoda zanikla (§ 47b odst. 5).
Pokud to neudělá, nová organizace nemá vstupní informace a povinnost není její. Systém
to umí jen zaznamenat jako chybějící dokument — vymáhat ho nemůže.

---

## 7. Dopad na rozsah

Proti dok. 08 sekce 5 se MVP rozšiřuje o:

| Přidáno | Důvod |
| --- | --- |
| **Asistovaný kontakt** (`contactEvents`) | tvé rozhodnutí |
| **Aplikace pro rodiče a příbuzné** | tvé rozhodnutí — pátá plocha |
| **Chat v aplikaci** | rozhodnutí ze sekce 2 |
| **Tři onboardingové průvodce** | sekce 4–6 |
| **Import XLSX/CSV s validací a suchým během** | onboarding B |
| Doložka Klíčové osoby jako metoda podpisu | sekce 1 |

Standardy se generují **všechny** (16), bez vynechání.

---

## 8. Otevřené

1. **Vzdělávací období při přechodu** — restart, nebo pokračování? (sekce 6) Doporučuji
   dotaz na MPSV; návrh mezitím výše.
2. **Kniha života** v aplikaci pro rodiče — má tam být, nebo je to na později?
3. **Skupinová vlákna** — má existovat vlákno pěstoun + Klíčová osoba + vedoucí, nebo
   stačí dvoustranná? Skupinové vlákno komplikuje `visibleTo`.
4. **Jak dlouho zůstane pěstounovi přístup** po zániku dohody? Navrhuji zachovat čtení
   vlastních dokumentů po nastavitelnou dobu, aby si stáhl, co potřebuje k přechodu.
