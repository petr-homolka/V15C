# 15 — Chat jako ústřední nástroj Klíčové osoby

> Navazuje na [dok. 14](./14-interni-asistent-koncepty-a-podatelna.md). Ten popisoval
> asistenta, který **odpovídá a navrhuje texty**. Tenhle dokument z něj dělá **pracovní
> plochu**: místo, odkud se dá udělat prakticky všechno, co Klíčová osoba za den dělá —
> zjistit, zapsat, naplánovat, připravit, poslat k potvrzení.

---

## 0. Oprava mého předchozího zúžení

V minulé odpovědi jsem doporučil postavit nejdřív dotazy nad předpisy, protože jsou
bez osobních dat. To je pravda o riziku, ale je to **špatná rada o produktu**. Asistent,
který umí jen předpisy, je nápověda. Nápovědu si člověk otevře třikrát a pak na ni
zapomene. Nástroj, který používá pořád, je ten, kterým **odbaví práci** — a ta práce
je z devadesáti procent o konkrétní rodině, konkrétním termínu a konkrétním zápisu.

Rozsah je tedy: **cokoli, co Klíčová osoba smí udělat v UI, musí jít udělat i z chatu.**
UI zůstává — pro přehledy, tabulky, kalendář, editor. Ale nic není *jen* v UI.

---

## 1. Invariant, který se nemění (a jak přežije akce)

Z dok. 02 a 14: **AI nikdy nezapisuje bez potvrzení člověka.**

Zdálo by se, že „zapiš mi návštěvu do kalendáře“ ho porušuje. Neporušuje — jen se mění
podoba potvrzení:

> **Potvrzení může být jedno klepnutí na kartu s vyplněnými poli. Nemusí to být
> přepsání formuláře.**

A to je zároveň podmínka, aby to lidé používali. Kdyby chat po každé větě otevřel
formulář, byl by pomalejší než formulář samotný a nikdo by ho nepoužil. Nic z toho ale
neznamená, že potvrzení odpadá — jen že jeho cena odpovídá tomu, co se zapisuje.
Odtud stupně v sekci 3.

---

## 2. Tři druhy tahu v chatu

| Tah | Co se stane | Zapisuje? |
| --- | --- | --- |
| **Otázka** | odpověď s odkazy do spisů | ne |
| **Akce** | karta s vyplněnými poli → potvrzení → provedeno | ano, po potvrzení |
| **Koncept** | otevře se interní editor s návrhem (dok. 14) | až uložením |

Čtvrtý, který se snadno zapomene a je nejlevnější na postavení:

| **Navigace** | „otevři spis Nováků“, „ukaž kalendář na příští týden“ | ne |

Navigace z chatu je nulové riziko, dvě hodiny práce a je to to, co uživatele naučí
chat vůbec otevírat. Stojí za to ji mít od začátku.

---

## 3. Stupně potvrzení — jádro celého návrhu

> **Upraveno dokumentem [16 — Charta chování](./16-charta-chovani-partner.md).**
> Stupně 1 a 2 se **neptají předem** — akce proběhne a vedle ní je *Vrátit zpět*.
> Karta se stále ukazuje, ale jako **výsledek**, ne jako otázka. Nic z toho, co je
> níže popsané jako „potvrzení“, nesmí práci zastavit. Stupeň 3 zůstává.

Ne všechno smí stát stejně. Rozdělení je podle **následku**, ne podle složitosti.

### Stupeň 0 — bez potvrzení

Čtení, hledání, souhrny, návrhy textu, navigace. Nic nepřetrvá, co si člověk nevyžádal.
Zůstává jen `AssistantQuery` v auditu (dok. 14).

### Stupeň 1 — provede se, karta ukáže výsledek, vedle ní *Vrátit zpět*

Interní, snadno vratné, bez právního ani finančního následku.

- kalendářní událost (vytvořit, přesunout, zrušit)
- úkol (dok. 12) — vytvořit, přiřadit, dokončit
- poznámka do spisu, štítek, připnutí zprávy
- zpráva pěstounovi nebo do vlákna (návrh textu + odeslat)
- upozornění kolegovi, žádost o zástup
- filtr, uložený pohled, připomínka sobě

Karta ukazuje **vyplněná pole, ne shrnutí větou**. Kontrola je v tom, že člověk vidí
`pátek 15. 8., 15:00–16:00 · Novákovi (ROD-2026-001) · Ledvice`, ne v tom, že by četl
odstavec.

### Stupeň 2 — provede se, ale karta je podrobnější

Záznamy s **právním nebo finančním následkem**. Zapíše se totéž co u stupně 1; rozdíl
je jen v tom, že karta rozepisuje pole, kterých se následek týká — u osobního styku
řádek za každé dítě. **Nic se neblokuje a nic se nemusí vyplnit.** Co nebylo řečeno,
zůstane prázdné a lhůta tomu dítěti prostě běží dál.

| Záznam | Proč stupeň 2 |
| --- | --- |
| **`MonitoringContact`** | plní dvouměsíční lhůtu — **zvlášť za pěstouna a zvlášť za každé dítě** (dok. 11) |
| `Expense` | peníze; jde do podkladů pro účetní a do čerpání SPVPP |
| `EducationRecord` | hodiny plní zákonnou povinnost pěstouna (dok. 01) |
| `CareEpisode` (respit) | dny se počítají proti limitu a přenášejí se při přechodu (dok. 09) |
| `Placement`, změna dohody | mění právní stav |
| zápis do spisu s obsahem | je to část spisové dokumentace |

**Osobní styk je jediné místo, kde na podrobnosti karty záleží** — ne kvůli přísnosti,
ale proto, že lhůta běží zvlášť za každé dítě (dok. 11). Věta „byl jsem u Nováků, Honza
byl ve škole“ se zapíše celá a hned; karta pak ukáže:

```
Osobní styk · Novákovi · dnes                              [ Vrátit zpět ]
  paní Nováková    přítomna
  Klára            přítomna
  Honza            nepřítomen — ve škole        [ omluvit ]  [ nechat tak ]
```

Honzovi lhůta běží dál a nikdo se ho na nic neptá; kdo chce, jedním klepnutím dopíše
důvod. **Systém tedy nic nevyžaduje — jen za tebe netvrdí, že jsi u Honzy byl.**
To je rozdíl mezi partnerem a buzerantem: partner nelže tvým jménem, ale ani tě
nezdržuje.

### Stupeň 3 — z chatu nikdy

Chat smí připravit, ne provést:

- **podpis** čehokoli (dok. 08 — biometrie + kód, vždy vlastní obřad)
- **odeslání ven** — zprávy adresátům, odpovědi úřadu, výkazu
- **vydání údajů úřadu** (dok. 13 — schvaluje vedení ve svém rozhraní)
- **zánik dohody, výpověď, uvolnění pěstouna, Předávací kód**
- **změna oprávnění, rolí, parametrů organizace, sad pravidel**
- **skartace** (dok. 10 — samostatná auditovaná procedura)
- cokoli v **knize života dítěte** (dok. 10)

Rozdělení je nastavitelné směrem k **přísnějšímu**: organizace může posunout položku
ze stupně 1 na 2. Opačně ne — stupeň 3 je platformní.

Stupeň 3 není omezení pracovníka, ale **ochrana před cizím jménem**: podpis a odeslání
ven musí být vlastní úkon, jinak by šlo něčím jménem podepsat nebo odeslat cokoli.
Nejde o nedůvěru v pracovníka, jde o to, aby za ním nikdo jiný nemohl.

---

## 4. Katalog schopností

Nejde o výčet příkazů; jazyk je volný. Jde o to, **co všechno musí být dosažitelné**.

### 4.1 Lhůty a stav

| Co se člověk zeptá | Co musí přijít |
| --- | --- |
| „Kdy se nejpozději musím stavit u Nováků?“ | **rozpad na osoby, ne jedno datum** — viz níže |
| „Komu mi tenhle měsíc utíká lhůta?“ | seznam rodin a dětí s nejzazšími termíny |
| „Kolik hodin vzdělávání zbývá paní Novákové a do kdy?“ | hodiny, konec období, doklady, co chybí |
| „Kolik respitních dnů zbývá Kláře?“ | vyčerpáno / limit / do konce roku |
| „Kdy je nejbližší okno na výpověď dohody Novákových?“ | 30. 6. / 31. 12. minus 30 dnů (dok. 01) |
| „Máme souhlas ORP u Dvořákových?“ | stav, a že bez něj nejde příspěvek (dok. 01) |
| „Kdy má být další zpráva a komu se posílá?“ | termín + tři adresáti (dok. 05) |
| „Co se dělo u Novákových od minulé návštěvy?“ | souhrn časové osy s odkazy |
| „Kdo zastupuje Svobodovou?“ | přidělení, zástupy (dok. 03) |

**První řádek je zkouška, jestli je asistent postavený správně.** Naivní odpověď je
jedno datum. Správná odpověď je:

```
Novákovi · ROD-2026-001
  paní Nováková    naposledy 14. 6.   nejzazší 14. 8.   zbývá 9 dní
  Honza (9)        naposledy 14. 6.   nejzazší 14. 8.   zbývá 9 dní
  Klára (4)        naposledy 12. 4.   nejzazší 12. 6.   PO LHŮTĚ 54 dní
                   (12. 6. nebyla přítomna — hospitalizace, omluveno)
```

Kdyby asistent vrátil „do 14. 8.“, zamlčel by to podstatné. Odpověď na dotaz na lhůtu
se proto **nikdy neagreguje na rodinu** — stejné pravidlo jako u záznamu.

### 4.2 Plánování a čas

- „Zapiš návštěvu u Nováků v Ledvicích na pátek ve tři.“ → událost, výchozí délka
  **1 hodina** (dok. 11), místo z adresy rodiny nebo z věty, čas na cestu jen orientačně
- „Přesuň to na čtvrtek.“ / „Zruš to.“ / „Posuň o hodinu.“
- „Co mám zítra?“ / „Ukaž mi příští týden.“
- „Připrav mi podklady na zítřek.“ → briefing k rodinám v kalendáři: co je otevřené,
  co se řešilo minule, co se má podepsat, co chybí do zprávy
- „Kolik mám tenhle měsíc naplánováno návštěv?“
- „Zablokuj mi čtvrtek dopoledne na administrativu.“

Systém **nenavrhuje termíny sám** a nesestavuje trasy — to bylo rozhodnuto v dok. 11.
Zapíše, co mu člověk řekne, a anotuje, kdy lhůta utíká.

### 4.3 Zápis z terénu

- „Byl jsem u Nováků, byly tam obě děti, Honza byl ve škole.“ → **stupeň 2**, formulář
  s dětmi
- diktát zápisu z návštěvy (dok. 02, pseudonymizace)
- „Přidej výdaj 340 Kč benzín k Novákovým“ + vyzve na foto účtenky
- „Zapiš Novákové 4 hodiny vzdělávání ze semináře Attachment 12. 8.“ + doklad
- „Zapiš respit 12.–14. 8., Klára, u babičky.“
- „Ulož tuhle fotku do spisu jako doklad.“
- „Založ úkol dodat certifikát do konce měsíce.“

### 4.4 Dokumenty a texty

- „Vytvoř koncept šestiměsíční zprávy pro Novákovy.“ → editor (dok. 14)
- „Odpověz na ten dopis od soudu.“ → podatelna (dok. 14 sekce 3)
- „Připrav plán na další období pro Kláru.“
- „Shrň mi spis Novákových pro kolegyni, přebírá ho od září.“
- „Napiš pěstounce, že přijedu ve tři.“ → **stupeň 1**, návrh + odeslat
- „Kde mám tu dohodu z loňska?“ → hledání v dokumentech

### 4.5 Předpisy, směrnice, standardy

- „Co říká naše směrnice o respitu nad 14 dní?“
- „Můžu proplatit hlídání manželovi pěstounky?“ → **ne** (§ 965 odst. 3 + § 655 odst. 2,
  dok. 05) — a s citací, ne z hlavy
- „Kolik je sazba na ubytování při vzdělávání?“ → **z platné sady k datu**, ne obecně
- „Jak jsme na tom se standardem 7?“

### 4.6 Vedení organizace

- „Kolik máme dohod, dětí, kolik dohod končí do konce roku?“
- „Které rodiny jsou po lhůtě osobního styku?“
- „Kolik jsme letos vyčerpali na vzdělávání?“
- „Kdo má kolik rodin?“ → rozložení zátěže (dok. 11)
- „Připrav podklady pro účetní za druhé čtvrtletí.“ → report (dok. 07)
- „Co nám běží za lhůty vůči úřadům?“ → `MandateObligation` (dok. 13)

---

## 5. Co musí být pod tím, aby to nebylo nebezpečné

### a) Rozpoznání entit se nikdy nehádá

„U Nováků“ musí být jednoznačné. Když jsou v organizaci dvě rodiny Novákových,
asistent **se zeptá**; nevybere bližší, častější ani naposledy otevřenou. Zápis do
špatného spisu je zároveň ztráta záznamu a bezpečnostní incident, a je špatně
odhalitelný — nikdo ho nehledá tam, kde omylem je.

Totéž u dětí (dvě Kláry), u data („v pátek“ na přelomu měsíce) a u částky.

Místo se **nesmí splést s rodinou**: „u Nováků v Ledvicích“ je rodina *Novákovi*, místo
*Ledvice*. Do `MonitoringContact.placeNote` nebo do místa události, ne do názvu.

### b) Karta ukazuje pole, ne větu

Kontrola se dělá pohledem na hodnoty. Žádné „rozumím tomu tak, že…“ — vypsaná pole,
u každého zdroj, když nebyl řečený (`délka 1 h — výchozí`, `místo z adresy rodiny`).

### c) Rozeznat otázku od příkazu

„Kdy se musím stavit u Nováků?“ není žádost o vytvoření události. Když je věta na
hraně, asistent **odpoví a nabídne akci** — neprovede ji. Chybný zápis je dražší než
klepnutí navíc.

### d) Chat není spis

Konverzace s asistentem **není součástí spisové dokumentace**. Kdyby byla, každá úvaha
nahlas by se stala částí materiálu, který čte inspekce a soud. Do spisu se dostane jen
to, co člověk potvrdil jako záznam, nebo výslovně připnul.

`AssistantQuery` a `AssistantAction` se přitom **drží v auditu** — to je jiná vrstva
než spis. Rozdíl je podstatný: audit odpovídá na otázku „kdo se na co díval a co
zapsal“, spis na otázku „co se s rodinou dělo“.

### e) Původ záznamu se zapisuje

Každý záznam vzniklý z chatu nese `via: 'assistant'` vedle autora-člověka. Umožní to
odpovědět na otázku, která přijde: *„kolik ze spisu vzniklo přes asistenta?“* — a taky
zpětně najít, co opravit, kdyby se ukázalo, že nějaký druh příkazu systém chápal špatně.

### f) Offline

Asistent je **online-only** (dok. 14). V terénu bez signálu se chat nechová jako by
rozuměl — přepne se na **záchyt**: diktát, foto, výdaj a zápis návštěvy jdou do
outboxu přes běžné formuláře (dok. 02), ostatní vstup se uloží jako nezpracovaný a
zpracuje se po připojení. Předstírat offline inteligenci by znamenalo tiše ztrácet
příkazy — to je horší než viditelné „zpracuji, až bude signál“.

---

## 6. Anotace lhůty s nabídkou akce

Podle rozhodnutí: **negenerovat nic samo, ale nabídnout.** Anotace z dok. 11 dostává
vedle textu tlačítka — a nic víc.

```
Novákovi · zpráva o průběhu PP    nejzazší termín 30. 9. · zbývá 21 dní
                                  [ vytvořit koncept ]  [ naplánovat návštěvu ]
```

Tón zůstává, jak byl rozhodnutý u parametrů (dok. 07): fakticky, bez „měl bys“.
Nabídka je nabídka; nikdo se jí nemusí řídit a systém to nekomentuje.

---

## 7. Datový model

```ts
interface AssistantAction {
  organizationId: string
  sessionId: string
  proposedAt: string
  proposedForPersonId: string          // kdo si o to řekl

  intent: string                        // 'calendar.create' | 'contact.record' | …
  tier: 0 | 1 | 2 | 3
  payload: Record<string, unknown>      // vyplněná pole karty
  resolvedRefs: Array<{                 // rozpoznané entity a jak jistě
    slot: string                        // 'family' | 'child' | 'date' | 'amount'
    refType: string; refId: string
    resolution: 'explicit' | 'inferred' | 'defaulted'
  }>

  status: 'proposed' | 'confirmed' | 'edited_then_confirmed' | 'rejected' | 'expired'
  confirmedByPersonId: string | null
  confirmedAt: string | null
  payloadAtConfirm: Record<string, unknown> | null   // co člověk případně změnil
  resultRefType: string | null          // co z toho vzniklo
  resultRefId: string | null
}
```

| Místo | Změna |
| --- | --- |
| **nové** | `AssistantAction`, `AssistantSession` |
| všechny záznamy | + `via: 'ui' \| 'assistant' \| 'import' \| 'outbox'` |
| `MessageThread` (dok. 12) | + `kind: 'assistant'` — soukromé vlákno osoby, ne skupinové |
| `Obligation` (dok. 11) | + `suggestedActions: string[]` — sekce 6 |
| Nastavení organizace | zpřísnění stupňů, zap/vyp asistenta, zap/vyp akcí |

`payloadAtConfirm` je tam ze stejného důvodu jako `proposedText` u konceptů (dok. 14):
rozdíl mezi tím, co systém navrhl, a tím, co člověk potvrdil, je doklad o kontrole.

---

## 8. Rozsah pro MVP

| Schopnost | MVP |
| --- | --- |
| Navigace z chatu | **ano** — nejlevnější a učí to zvyk |
| Dotazy na lhůty, stav rodiny, dopočty (s rozpadem na děti) | **ano** |
| Dotazy nad směrnicemi, standardy, sadami pravidel | **ano** |
| Kalendář: vytvořit, přesunout, zrušit (stupeň 1) | **ano** |
| Úkoly a poznámky (stupeň 1) | **ano** |
| Zápis osobního styku (stupeň 2, formulář s dětmi) | **ano** |
| Výdaj, vzdělávání, respit (stupeň 2) | **ano** |
| Koncept zprávy a odpovědi na podání | **ano** (dok. 14) |
| Zpráva pěstounovi z chatu | ano |
| Briefing „připrav mi podklady na zítřek“ | později |
| Agregace pro vedení | později |
| Hlasové ovládání celého chatu | později; diktát zápisu je v MVP |

---

## 9. Co tenhle dokument mění jinde

| Dokument | Změna |
| --- | --- |
| 11 | anotace lhůty dostává akce; **nic negeneruje sama** |
| 12 | `MessageThread.kind` + `'assistant'`; chat s asistentem není v časové ose |
| 13 | vydání údajů úřadu je **stupeň 3** — chat připraví, vedení provede |
| 14 | potvrzení má stupně; „AI nezapisuje“ se upřesňuje na „nezapisuje bez potvrzení“ |

A jedna věc na závěr, protože je to ta hlavní past celého tohohle směru: **chat snižuje
cenu zápisu, a tím i cenu chybného zápisu.** Věta „byl jsem u Nováků“ napsaná
z kanceláře vytvoří záznam, který plní zákonnou lhůtu. Systém není a nemá být docházkový
(rozhodnuto v dok. 11), takže přítomnost neověřuje nikdo — ale právě proto má u záznamů
se zákonným následkem zůstat formulář, ve kterém se každé dítě potvrdí zvlášť. Všude
jinde ať je to jedno klepnutí.
