# 22 — Přepis vyfocených dokladů a marketplace vzdělávání

---

## 1. Každý vyfocený doklad má editovatelný přepis

Účtenka, faktura, certifikát, vysvědčení, známky, recept, žádanka, výsledek
vyšetření — všechno, co do systému přijde jako fotka nebo sken, dostane
**přepis, se kterým se dá pracovat**. Originál zůstává a je vždycky dostupný.

### 1.1 Proč se tady přepis smí opravovat navždy, a u diktátu ne

Vypadá to jako nedůslednost, ale je to totéž pravidlo:

> **Text se smí měnit, dokud existuje, proti čemu ho ověřit.**

U diktátu zvuk zmizí, takže po třech dnech by pracovnice opravovala podle
ničeho (dok. 20). Tady **originál zůstává navždy** — přepis se dá kdykoli
porovnat s fotkou. Proto žádné okno.

Co se ale nemění nikdy: **`ocrText`, surový výstup stroje.** Je to doklad
o tom, co OCR přečetlo, a rozdíl proti opravenému textu je odpověď na otázku
„co člověk změnil“. Stejný princip jako `proposedText` u konceptů (dok. 14),
a pravidla to vynucují — otestované.

### 1.2 Kvůli čemu se to vyplatí: doklad předvyplní záznam

Přepis není jen text. Vytáhnou se z něj **pole, která založí záznam**:

| Doklad | Co se přečte | Co z toho vznikne |
| --- | --- | --- |
| účtenka | datum, částka, dodavatel, DPH | **výdaj** ve spisu |
| faktura | vystaveno, splatnost, částka, IČO, VS | výdaj + doklad k SPVPP |
| certifikát | název, **hodiny**, datum, pořadatel, akreditace | **vzdělávací záznam** |
| vysvědčení | školní rok, pololetí, škola, známky | příloha ke spisu dítěte |
| recept, žádanka, zpráva lékaře | datum, vystavil, závěr | příloha, bez rozpisu diagnóz |

Každé pole nese **úryvek, ze kterého se hodnota přečetla** — potvrzení je pak
pohled, ne opětovné čtení dokladu. Je to stejný postup jako u lhůty
v podatelně (dok. 14) a funguje ze stejného důvodu: člověk nemá kontrolovat
stroj tím, že celou práci udělá znovu.

Záznam se **založí s možností *Vrátit zpět***, ne s otázkou — je to
deterministické přenesení přečtených polí, ne rozhodnutí (charta, dok. 16).

### 1.3 Bez AI se přepis napíše ručně

OCR je AI, takže podléhá oprávnění `ai.document_index` (dok. 21). Bez něj se
fotka uloží pořád a přepis se dá **napsat rukou** — `manual_entry` je zdarma.
To je zase ta samá věta: ruční cesta musí být úplná, ne trpěná.

### 1.4 Odkaz na originál z pozdějšího dokumentu

Když se ve zprávě mluví o účtence, musí být originál dohledatelný.
V aplikaci je to odkaz, na papíře **QR kód**.

Platí přitom totéž, co v dok. 21: **QR vede na ověření, ne na obsah.**
Účtenka je ještě neškodná, ale **vysvědčení dítěte nebo lékařská zpráva jsou
údaje podle čl. 9 GDPR** a QR na papíře vidí každý, komu ten papír projde
rukama. Ověřovací stránka ukáže, že doklad existuje, jakého je druhu a kdy
vznikl; samotný obrázek jen přihlášenému, kdo má na spis právo.

A jedno pravidlo pro sazbu: **v dokumentu, který odchází úřadu, se příloha
přikládá, ne odkazuje.** QR je pomůcka pro toho, kdo dokument čte v organizaci;
úřad má dostat kopii, ne odkaz, který mu bez přihlášení nic neukáže.

---

## 2. Marketplace vzdělávání

### 2.1 Odpověď na tvou otázku: e-shop nestavět

Ptal ses, jestli dělat e-shopové řešení. **Ne.** Katalog, objednávku, fakturu
a certifikát ano — platební bránu ne. Čtyři důvody:

1. **Zprostředkování platby mezi dvěma cizími stranami** z nás dělá platebního
   zprostředkovatele se vším, co k tomu patří. Na trh o velikosti České
   republiky je to nepoměrná složitost.
2. **České neziskovky platí fakturou převodem**, ne kartou (dok. 19).
3. **Vzdělávání se hradí ze státního příspěvku** a při kontrole ÚP se dokládá
   fakturou od pořadatele organizaci. Přesně ten doklad tak vzniká sám od sebe —
   a rovnou se vyfotí a přepíše (sekce 1).
4. **Kurz běží na cizí platformě.** Nejsme LMS a nemá smysl jím být.

Model je ale postavený tak, aby se karta dala doplnit **bez migrace**:
`Order.payment.method` má od začátku i hodnotu `'card'`. Není to slib, že to
bude — je to zajištění, aby to nestálo přepis objednávek.

### 2.2 Jak to funguje

```
POŘADATEL                          ORGANIZACE / PĚSTOUN
─────────                          ────────────────────
profil + sklad kurzů
   │
   ├─ vylistuje kurz  ─────────►   MARKETPLACE
   │                                  │
   │                                  ├─ pěstoun si kurz vybere a POŽÁDÁ
   │                                  └─ nebo ho vybere Klíčová osoba
   │                                        │
   │                                  objednávka → schválí vedení
   │                                        │
   ├─ potvrdí místo  ◄──────────────────────┘
   ├─ vystaví FAKTURU  ──────────►  organizace zaplatí převodem
   ├─ sdělí PŘÍSTUP    ──────────►  pěstoun absolvuje (na cizí platformě)
   │
   └─ vystaví CERTIFIKÁT ────────►  vzdělávací záznam ve spisu
                                     s hodinami potvrzenými pořadatelem
```

### 2.3 Hodiny jsou nosné pole celého marketplace

Certifikát plní **zákonnou povinnost 18 nebo 24 hodin za dvanáct měsíců**
(§ 47a odst. 2 písm. f). Z toho plyne víc, než je na první pohled vidět:

- **Forma kurzu se mapuje na číselník `education.form`** a ten na chování —
  e-learning má v sadě pravidel vlastní limit (dok. 02). Kdyby forma byla jen
  text, limit by se nedal hlídat. Přesně proto jsou mapované číselníky
  (dok. 20).
- **Když pořadatel hodiny nadsadí, u inspekce to odnese organizace**, ne on.
  Systém hodiny nepřepočítává a neověřuje — jen je **zřetelně označí jako
  tvrzení pořadatele**.
- Právě to je ale **lepší důkaz než dnešní stav**: dnes Klíčová osoba opisuje
  hodiny z papíru a při inspekci se dokládá sken. Tady hodiny potvrdil ten,
  kdo kurz vedl, a je to dohledatelné.

Vzdělávací záznam z certifikátu vzniká **automaticky s možností vrátit zpět** —
je to přenesení potvrzených hodin, ne rozhodnutí.

### 2.4 Veřejná část a co v ní nesmí být

Nabídka má být k nalezení **na internetu**, aby si kurz mohl koupit i pěstoun
nebo organizace mimo systém. Veřejné jsou tedy tři věci:

| Veřejné | Neveřejné |
| --- | --- |
| profil pořadatele | kdo za pořadatele pracuje |
| **vylistovaný** kurz | rozpracovaný kurz |
| nabídka s cenou a termínem | objednávky, účastníci, certifikáty |

Z toho plyne tvrdé pravidlo: **v `listings/**` a `providers/**` nesmí být nic
osobního.** Je to výkladní skříň — co se prodává a za kolik. Vše ostatní je
za přihlášením. Otestované: rozpracovaný kurz se bez přihlášení nenačte,
nabídku „jen v systému“ anonym nevidí a objednávku vidí jen kupující
a pořadatel.

### 2.5 Kupující mimo systém

Pěstoun nebo organizace, které v systému nejsou, objednávají jako **host**.
Vedeme o nich jen to nejnutnější k fakturaci a k vystavení certifikátu:
jméno, e-mail, fakturační údaje. Nic víc — nemáme důvod ani titul.

Bez téhle cesty by marketplace neměl pro pořadatele smysl: listoval by kurzy
pro pár set organizací místo pro celý trh.

### 2.6 Pět hranic, které marketplace nesmí překročit

1. **Žádná data o dětech.** Objednávka se váže na pěstouna a jeho vzdělávací
   období, ne na spis.
2. **Pořadatel nevidí do organizace.** Jméno, e-mail, fakturační údaje. Nic
   o rodině, dohodě ani dítěti. Předání jména a e-mailu je nutné k poskytnutí
   služby, ale zůstává to předání osobních údajů třetí straně — proto je
   evidované.
3. **Veřejná část bez osobních údajů.**
4. **Nejsme LMS ani platební brána.**
5. **Hodiny jsou tvrzení pořadatele** a je vidět, odkud přišly.

### 2.7 Ověřený pořadatel

Pořadatel vystavuje certifikát, kterým se plní zákonná povinnost — takže je
rozdíl mezi kýmkoli, kdo se zaregistruje, a subjektem, u kterého někdo ověřil,
že existuje. Ověřuje superadmin, u pořadatele se to zobrazí.

**Neověřeného ale neblokujeme.** Ve výpisu je to vidět a rozhodnutí patří
organizaci (dok. 16). Totéž s akreditací MPSV — je to údaj, ne podmínka.

### 2.8 Provize se nerozhoduje v kódu

Jestli si platforma bere provizi a kolik, **rozhoduje vlastník produktu**.
`MarketplaceTerms` je datovaný záznam s `commissionPct` a `listingFee`,
oboje v seedu `null`. Poučení z dok. 21.

---

## 3. Kde to je

| Věc | Soubor |
| --- | --- |
| Přepis dokladu, extrahovaná pole, odkaz na originál | `schema/src/scans.ts` |
| Pořadatel, kurz, nabídka, objednávka, přístup, certifikát, podmínky | `schema/src/marketplace.ts` |
| Cesty včetně kořenových `providers`, `listings`, `orders`, `certificates` | `schema/src/paths.ts` |
| Oprávnění: veřejná nabídka, neměnný `ocrText`, objednávky jen svým | `firestore.rules` |
| Testy (47, všechny prochází) | `tests/rules.test.mjs` |
| Testovací data: 2 pořadatelé, 5 kurzů, 4 nabídky, 9 objednávek, 4 certifikáty, 82 přepisů | `tools/seed/` |

### Co to mění jinde

| Dokument | Změna |
| --- | --- |
| 07 | vzdělávací hodiny mohou přijít z certifikátu, ne jen z klávesnice |
| 10 | při přechodu pěstouna jdou s ním i hodiny z marketplace |
| 17 | přepis dokladu je vedle indexu druhá čtená vrstva dokumentu |
| 20 | `education.form` má nového uživatele: kurzy v marketplace |
| 21 | QR odkaz na originál dokladu používá totéž ověření |

### Co ještě chybí

| Chybí | Kdy |
| --- | --- |
| Registrace pořadatele a jeho přihlášení | s přihlašováním obecně (dok. 19) |
| Vystavení PDF certifikátu ze šablony pořadatele | s vysázením dokumentů (dok. 21) |
| Karta jako platba | až bude důvod; model to unese bez migrace |
| Hodnocení kurzů | záměrně ne v první verzi — hodnocení vzdělávání pro pěstouny by bylo veřejné hodnocení služby v citlivé oblasti |
