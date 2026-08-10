# 04 — Oprávnění, doplněné parametry a analýza vzoru Dohody

Navazuje na [01](./01-pravni-analyza-a-korekce-zadani.md), [02](./02-architektura-reseni.md)
a [03](./03-strom-vazeb-profily-nastaveni.md).

Doplněné zdroje: **vyhláška č. 473/2012 Sb.** (chybějící díl skládačky) a **anonymizovaný
vzor Dohody o výkonu pěstounské péče** z reálné praxe.

---

## 1. Oprávnění — zaznamenaná rozhodnutí

| Otázka | Rozhodnutí |
| --- | --- |
| Vidí pěstoun výdaje vázané k němu? | **Ne.** Vidí je **Klíčová osoba** a **Vedení**. |
| Co pěstoun v portálu vidí? | **Jen vzdělávání a RESPIT.** |
| Používá systém OSPOD / OÚ ORP? | Zpočátku **ne**, v budoucnosti **ano**. |
| Co uvidí sociální pracovnice OSPOD? | profily pěstounů a dětí, **reporty, zprávy a četnosti kontaktů**. **Nikoli samotné zápisy.** |

### Matice oprávnění

| Data | `foster_parent` | `key_person` | `org_admin` (Vedení) | `ospod` (budoucí) | `guest` |
| --- | --- | --- | --- | --- | --- |
| Profil pěstouna | vlastní | ✓ | ✓ | **✓** | čtení |
| Profil dítěte | — | ✓ | ✓ | **✓** | čtení |
| **Vzdělávání** (hodiny, certifikáty) | **✓ vlastní** | ✓ | ✓ | **✓** | čtení |
| **Respity** (dny, plnění) | **✓ vlastní** | ✓ | ✓ | **✓** | čtení |
| **Zápisy z návštěv** (obsah) | — | ✓ | ✓ | **✗ nikdy** | čtení |
| **Četnost kontaktů** (kdy, zda lhůta splněna) | — | ✓ | ✓ | **✓** | čtení |
| **Zprávy o průběhu PP** | ✓ vlastní | ✓ | ✓ | **✓** (je zákonným adresátem) | čtení |
| **Výdaje SPVPP** | **✗** | **✓** | **✓** | ✗ | — |
| Dohoda, dodatky, souhlas ORP | ✓ vlastní | ✓ | ✓ | ✓ | čtení |
| Plány (IPOD, plán pobytu) | ✓ vlastní | ✓ | ✓ | ✓ | čtení |
| Nastavení organizace | — | — | ✓ | — | — |

Přístup OSPOD ke zprávám je mimochodem **nejlépe odůvodněná položka v celé matici** —
podle § 47b odst. 5 je OSPOD jejím **zákonným adresátem**. Zpřístupnění v systému
jen digitalizuje to, co už dnes dostává poštou.

### Architektonický důsledek, který je nutné rozhodnout nyní

Hranice „**četnost kontaktů ano, obsah zápisu ne**“ nejde ve Firestore vyřešit
oprávněním na pole. **Security rules neumí skrýt pole dokumentu** — buď dokument
přečteš celý, nebo vůbec. Proto:

> **Metadata kontaktu a obsah zápisu musí být od začátku ve dvou oddělených
> dokumentech.** Ne jeden dokument s polem `content`.

```
monitoringContacts/{id}              ← metadata: datum, typ, kdo, s kým, zda splnilo lhůtu
                                       čitatelné i pro OSPOD
monitoringContacts/{id}/records/{r}  ← obsah zápisu, audio, diktát
                                       NIKDY pro OSPOD
```

Totéž platí pro časovou osu: `timelineEntries` nesou obsah a jsou pro OSPOD zavřené;
derivovaná projekce `contactFrequency` (agregát za dohodu a období) je otevřená.

Toto je typ rozhodnutí, které se dodatečně mění velmi drahě — po roce provozu by to
znamenalo migraci každého zápisu ve všech spisech. Proto to zavádíme hned, i když roli
`ospod` zapneme až později (feature flag `ospodAccessEnabled: false`).

Vedlejší efekt je příznivý: oddělení obsahu od metadat pomáhá i **mobilnímu offline
provozu** — seznam kontaktů se synchronizuje jako malá metadata, těžký obsah se táhne
jen pro otevřený spis.

### Pěstounský portál — co tedy zobrazit

Podle rozhodnutí zúženo na dvě agendy, obě „vlastní“:

- **Vzdělávání**: běžící 12měsíční období, potřeba (18 nebo 24 h), splněno, převedeno
  z minulého období, seznam kurzů, **nahrání certifikátu z mobilu**.
- **RESPIT**: vyčerpané a zbývající dny za kalendářní rok **per dítě**, věková podmínka
  2 let, plánované akce.

Nezobrazuje se: výdaje, zápisy, interní poznámky, kapacita pracovníků.
Profil 3.2 v dok. 03 se tímto pro roli `foster_parent` zužuje.

---

## 2. Doplněné parametry z vyhlášky 473/2012 Sb.

Tím se zavírá mezera, která blokovala M3.

### § 5f — maximální úhrada za stravu a ubytování

Nahrazuje dřívější pravidlo „1/30 příspěvku na úhradu potřeb dítěte“ **fixními
částkami**:

| Plnění | Právní základ | Max. úhrada |
| --- | --- | --- |
| Celodenní strava | § 5f písm. a) bod 1 | **260 Kč** |
| Oběd | § 5f písm. a) bod 2 | **120 Kč** |
| Ubytování dítěte | § 5f písm. b) | **90 Kč / den** |

**Zásadní detail, který se snadno přehlédne:** strava se hradí u **obou** forem péče
(§ 47a odst. 2 písm. a) i b)), ale **ubytování jen u celodenní péče** podle písm. b).
U krátkodobé péče nárok na úhradu ubytování nevzniká vůbec.

```ts
caregiverContribution: {
  meals: { fullDayMinor: 26_000, lunchMinor: 12_000 },
  accommodation: { perDayMinor: 9_000, appliesTo: ['full_day_care'] },   // NE short_term
  mealsApplyTo: ['short_term_care', 'full_day_care'],
  note: 'maximální výše; při nikoli celodenním plnění se krátí úměrně',
}
```

### § 5c — pásma čerpání potvrzena

| Práva | Pásmo |
| --- | --- |
| § 47a odst. 2 písm. **a) + b)** | **5–15 %** |
| § 47a odst. 2 písm. **c) až e)** | **10–20 %** |
| § 47a odst. 2 písm. **f)** | **5–10 %** |

Odst. 5 obsahuje **únikovou klauzuli**: nelze-li prokazatelně vyčerpat, lze prostředky
použít jinak v souladu s účelem. Takže pásma nejsou tvrdé limity, ale **pásma
s odůvodnitelnou výjimkou** — implementace musí umět zaznamenat odůvodnění, ne jen
zablokovat. (Zapneme až po zúžené fázi, `spvppLimitsEnabled`.)

### § 4, § 4a, § 5 — číselníky jako verzované slovníky

Vyhláška dává tři uzavřené výčty, které jsou v systému **klasifikačními číselníky**,
ne volným textem:

- **§ 4** — odborné poradenství, **13 oblastí** a)–m)
- **§ 4a odst. 1** — psychologická/terapeutická pomoc, **8 zaměření** a)–h);
  odst. 2 navíc připouští **individuální dohled**
- **§ 5 odst. 1** — vzdělávání, **7 témat** a)–g), přičemž g) je vyhrazeno
  nezprostředkované péči (témata přípravy podle § 3)
- **§ 5 odst. 2** — způsoby zajištění vzdělávání: přednášky, kurzy, školicí akce
  s osobní účastí **nebo vzdáleným přístupem**, skupinová setkávání, **supervize**,
  individuální konzultace

Praktický dopad: `EducationRecord` dostane `topicCodes: string[]` z § 5 odst. 1 a
`form` z § 5 odst. 2. Umožní to vykázat, že vzdělávání bylo tematicky relevantní —
což Instrukce výslovně požaduje („aby témata byla pro ně přínosná a aktuální“).
Číselníky patří do **verzované sady pravidel**, protože se s vyhláškou mění.

### Vedlejší nález — § 5b

Úhrady v ZDVOP mají **stejné částky** (260 / 120 / 90 Kč) jako § 5f. Sjednoceno záměrně;
v sadě pravidel je proto sdílený blok, ne duplikát.

---

## 3. Analýza vzoru Dohody

### Struktura pro šablonovací systém

Reálná dohoda má devět článků. Z nich vyplývá model šablony:

| Článek | Obsah | Zdroj dat |
| --- | --- | --- |
| hlavička | poskytovatel (název, forma, sídlo, IČ, statutár) + pěstoun (jméno, nar., adresa, tel., e-mail) | `Organization`, `Person` |
| právní základ | § 47b ZSPOD, OZ 89/2012, spr. ř. 500/2004 | sada pravidel |
| I. Důvody dohody | **vyjádření ORP podle § 154 spr. ř.** s datem, § 16a odst. 3,4, **usnesení soudu s č.j.**, dítě, „fakticky osobně pečuje“ | `AgreementConsent`, `Placement.courtDecisionRef` |
| II. Čas, místo, forma | ambulantní adresa **dle pověření**, terénní v domácnosti | `Organization.mandate` |
| III. Předmět spolupráce | osobní kontakt **min. 1× za 2 měsíce**, „z každého kontaktu je veden **písemný záznam**“, zástup při absenci **> 1 měsíc** | sada pravidel + `orgPolicy` |
| IV. Práva | A. krátkodobá péče, B. respit, C. odborná pomoc, D. vzdělávání, E. všeobecná | sada pravidel + `orgPolicy` |
| V. Povinnosti | A. kontakt s biologickou rodinou, B. vzdělávání, C. umožnit sledování | sada pravidel |
| VI. Dohled | odpovědnost Klíčové osoby, hovor **osobně s dítětem**, zpráva 1×/6 měsíců | sada pravidel |
| VII. Ukončení | výpověď, § 47c odst. 2, § 167 spr. ř. | sada pravidel |
| VIII.–IX. | mlčenlivost, standardy, účinnost **dnem podpisu poslední strany**, dva stejnopisy, **sken pro ORP a kopie pro ÚP** | šablona |

Poslední bod je konkrétní požadavek na výstup: dohoda se generuje **ve dvou originálech**,
sken jde do dokumentace ORP a **kopie na Úřad práce** (podklad k žádosti o SPVPP podle
§ 47d odst. 4 písm. b).

### Tři chyby ve vzoru — hlásím, protože se přenesou do šablony

**1. „kalendářního čtvrtletí“ místo pololetí.** Čl. VII: *„…výpověď … min. 30 dnů před
koncem kalendářního **čtvrtletí**.“* Tatáž věta ale správně omezuje zánik na
30. 6. nebo 31. 12., což je **pololetí**. § 47c odst. 6 ZSPOD hovoří výhradně
o **kalendářním pololetí**. Vnitřně si to protiřečí a je to věcná chyba —
při čtvrtletním výkladu by pěstoun mohl doručit výpověď do 1. 9. a domáhat se zániku
k 30. 9., což zákon nezná. **Šablona to musí opravit.**

**2. Zpráva má v dohodě jednoho adresáta, zákon tři.** Čl. VI: *„…zprávu … poskytuje
místně příslušnému OSPOD.“* § 47b odst. 5 ale žádá předání **osobě pečující**,
**ORP místně příslušnému** k návrhu dohody **a ORP trvalého pobytu dítěte** —
a to **do 15 dnů** od vypracování. Vzor dva adresáty a lhůtu vynechává.

**3. „alespoň jednou za 6 měsíců“ u odborné pomoci je zastaralé.** Čl. IV/C tuto
frekvenci uvádí, ale platné § 47a odst. 2 písm. d) **žádnou frekvenci nestanoví** —
zmizela novelou 2024. Jako **smluvní nadstandard** je to legitimní (organizace může
nabídnout víc než zákon), ale pokud měl vzor jen citovat zákon, je citace neplatná.
V šabloně to musí být označené jako **vnitřní závazek**, ne jako zákonný požadavek.

### Co je ve vzoru naopak správně a potvrzuje analýzu

- **Vzdělávání 18 / 24 h** je rozlišené správně, včetně výjimky pro zprostředkované
  a přechodné pěstouny. Organizace novelu zapracovala.
- **„za každých 12 měsíců po sobě jdoucích od data uzavření dohody“** — přesně § 47a
  odst. 3. Potvrzuje, že období je klouzavé a ukotvené datem dohody, ne kalendářním rokem.
- **Poručenství** je vedeno paralelně s pěstounskou péčí („pěstounská/poručenská“) —
  odpovídá § 2a písm. c) bodu 4. `custodyType: 'guardianship'` v modelu je potřebné.
- **§ 16a odst. 3, 4 a „fakticky osobně pečuje“** — potvrzuje potřebu
  `custodyType: 'factual_care'` pro péči v průběhu soudního řízení.

### Vnitřní pravidla, která vzor odhalil

Toto jsou **parametry `orgPolicy`**, nikoli zákon — a přesně to potvrzuje tříúrovňový
model parametrů z dok. 02:

| Pravidlo ze vzoru | Parametr | Poznámka |
| --- | --- | --- |
| Respit se při dohodě kratší než rok **poměrně krátí** | `respiteProRataForPartialYear` | Zákon říká „**alespoň** 14 dnů“; krácení je zúžení. Zaznamenat jako vědomé vnitřní pravidlo. |
| Oba pěstouni musí respit čerpat **současně** | `respiteMustBeConsumedJointly` | organizační omezení |
| Nevyčerpané dny respitu se **nepřevádějí** | `respiteCarryOver: false` | **Asymetrie proti vzdělávání**, kde § 47a odst. 3 převod výslovně dovoluje |
| Zástup se hlásí rodině při absenci **> 1 měsíc** | `substituteNotifyAfterDays: 31` | dok. 03, scénář A |
| **Z každého kontaktu písemný záznam** | `recordRequiredPerContact: true` | smluvní povinnost → systém ji musí vynucovat, ne jen umožňovat |
| Sazby respitů a odborné pomoci dle **„aktuální směrnice č. 1“** | `orgPolicy.reference` | viz níže |

### Problém „aktuální směrnice“

Vzor na dvou místech odkazuje na *„aktuální směrnici č. 1 – Poskytování finančních
náhrad pečujícím osobám“*. Slovo **aktuální** znamená, že dohoda následuje vždy poslední
verzi směrnice. To má dva důsledky:

1. Systém musí směrnice **verzovat a datovat**, aby bylo při kontrole dohledatelné,
   jaká sazba platila v den plnění. Odkaz „aktuální“ sám o sobě auditní stopu nedává.
2. **Zhorší-li nová verze rozsah plnění, je to podle metodiky pravděpodobně podstatná
   změna** dohody („mění se dohodnutý rozsah plnění závazku“), která vyžaduje
   **souhlas ORP** — nikoli tichá výměna dokumentu.

Proto do modelu přidávám kontrolu: při publikaci nové verze `orgPolicy` systém
**vyhodnotí, které aktivní dohody se zhoršují**, a označí je jako
`requiresAmendmentReview`. Nechat to na lidech znamená, že se to neudělá.

---

## 4. Aktualizace předchozích dokumentů

| Dokument | Změna |
| --- | --- |
| 02, sekce 1 | sada pravidel doplněna: `caregiverContribution` (§ 5f), pásma § 5c s únikovou klauzulí, číselníky § 4 / 4a / 5 |
| 03, sekce 0 | matice oprávnění zpřesněna dle sekce 1 |
| 03, profil 3.2 | portál pěstouna zúžen na vzdělávání + respity |
| 03, sekce 2.2 | `monitoringContacts` **rozdělené** na metadata a obsah |
| 01, sekce 6 | spoluúčast pěstouna už není TODO — jsou to fixní částky, ne 1/30 |

---

## 5. Co ještě chybí

1. **OZ 89/2012 Sb., část druhá** — pořád chybí. Potřebuji § 965 odst. 3 ve spojení
   s § 655 odst. 2 (povinnost manžela/partnera pečovat), protože na něm stojí pravidlo,
   komu **nelze** proplatit hlídání.
2. **Standardy kvality** (příloha č. 1 a 2 vyhlášky 473/2012) — vzor se na ně
   v čl. VIII odvolává a podléhají inspekci. **OPRAVENO v dok. 07:** přílohy v dodaném souboru jsou, jen jsem je přehlédl.
   Standardy 10c (plán průběhu pobytu), 10d (plán vzdělávání) a 13a (spisová
   dokumentace) mají přímý dopad na model plánů a spisu.
3. **Směrnice č. 1** organizace ze vzoru — jako reálný příklad `orgPolicy` by pomohla
   nastavit výchozí strukturu sazeb.
