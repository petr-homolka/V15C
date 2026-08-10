# 25 — Registr entit, profily a název dohody

---

## 1. Každá věc má UID a profil

Zadání: každá živá i neživá entita má **UID** a **profil**, ke kterému se vážou
služby — chat, dokumenty, plnění povinností, vazby, práva.

V modelu to zčásti bylo (`Person`, `Child`, `Agreement`, `Organization`,
`MarketplaceProvider` měly `id`), ale chybělo to podstatné: **jedno místo, kde
se UID dá přeložit na věc.** Odkazy se skládaly z `{kind, id}` a každé místo,
které je použilo, muselo vědět, ve které kolekci hledat.

### 1.1 Registr je index, ne profil

```
entities/{uid}
  kind          'person' | 'child' | 'agreement' | 'organization' | …
  organizationId  komu to patří (null u pořadatele, úřadu)
  profilePath   kde leží profil
  displayName   jak se to jmenuje
  services      které služby se na to vážou
  status        active | inactive | archived
```

Profil **zůstává tam, kde je** — `orgs/{org}/persons/{uid}` a podobně. Registr
říká jen: co to je, komu to patří, kde to leží a jak se to jmenuje. Kdyby držel
i obsah, byly by dvě pravdy o téže věci.

**Proč to musí být na jednom místě:** UID se objevuje v chatu, v odkazech
uvnitř textu (`mention`, dok. 20), v auditu a v paměti Eli. Bez registru by
každé z těch míst muselo znát mapu kolekcí — a při přidání nového druhu entity
by se opravovalo pět míst.

Registr je **kořenová kolekce**, protože UID musí být dohledatelné, aniž by se
vědělo, kde ta věc leží. Zabezpečení stojí na `organizationId` v samotném
dokumentu, takže čtení nestojí žádné další čtení. `list` je zakázaný — kdyby
šel vypsat, dal by se z něj přečíst seznam všech dětí a rodin napříč
organizacemi. Otestované.

### 1.2 Co je entita a co ne

**Entita** je věc, která má profil a vlastní práva:

| Živé | Neživé |
| --- | --- |
| `person` — pěstoun, rodič, zaměstnanec, příbuzný | `agreement` — dohoda, karta rodiny |
| `child` — má vlastní profil i vlastní aplikaci | `organization`, `provider`, `authority` |
| | `device`, `vehicle`, `offer` |

**Entita není** to, co je obsahem profilu — zápis, výdaj, zpráva, dokument.
Ty mají `id`, ale nemají profil ani vlastní práva; patří někomu jinému.

Ta hranice je užitečná právě proto, že se dá porušit: dokument by profil mít
*mohl*, ale pak by se u něj řešila práva zvlášť od spisu, ve kterém leží — a
oprávnění by se rozdvojila.

### 1.3 Tvar UID: sedm znaků, bez předpony

**Rozhodnuto:** sedmimístný kód z malých písmen a číslic, bez předpony.
Příklad: `u6t4f3k`, pro čtení a diktování `u6t 4f3k`. UID dostává i **každý
dokument a sken**, ne jen věci s profilem — prostor je proto jeden pro všechno
a kód nikdy neznamená dvě věci.

**Abeceda má 31 znaků.** Vynechané jsou `o` a `0` (zadání) a k nim `i`, `l`
a `1` ze stejného důvodu: v běžném fontu jsou k nerozeznání a UID se diktuje
po telefonu a opisuje z papíru. Jen malá písmena, takže nevzniká ani otázka,
jestli se rozlišují velká.

#### Proč sedm a ne šest

Kolize se neřídí velikostí prostoru, nýbrž **narozeninovým paradoxem** — tedy
tím, kolik už záznamů existuje, ne tím, kolik kombinací je celkem:

| | kombinací | šance na střet při 10 mil. záznamů | první střet čekaný u |
| --- | --- | --- | --- |
| **6 znaků** | 887 503 681 | 1,13 % → jeden z 89 | ~37 tisíc záznamů |
| **7 znaků** | 27 512 614 111 | 0,04 % → jeden z 2 750 | ~207 tisíc záznamů |

Deset milionů záznamů **dosáhneme**: 300 organizací × 40 dohod × 30 dokumentů
ročně je ~360 tisíc za rok, UID dostává i každý sken a nic se nemaže (dok. 10).

Kontrola při vzniku je nutná v obou případech a je skoro zdarma — **už ji
máme**: zápis do registru se dělá `create`, ne `set`, a `create` na existující
dokument selže sám. Kolize se nehledá, ona se ohlásí, a kód se vygeneruje znovu.

Sedmý znak je tu proto, že **správnost té kontroly závisí na disciplíně
v celém kódu**. Kdo někdy přiřadí UID bez zápisu do registru, obejde jedinou
pojistku, kterou máme. Při šesti znacích by z toho vznikl skutečný duplikát,
protože střety se dějí běžně; při sedmi je stejná chyba o dva řády méně
škodlivá. Jeden znak navíc je za to nízká cena — nadiktovat se dá pořád
(`u6t 4f3k`, jako telefonní číslo).

To je celá podmínka: **UID se nesmí přiřadit bez zápisu do registru.**
Vznik entity je proto vždy dvojice zápisů v jedné dávce — profil a registr —
nikdy dva samostatné.

#### Co se vzdáním předpony ztrácí

Z `u6t4f3k` nepoznáš, jestli je to dítě nebo dokument. Náhrada je jedno čtení
registru, který to řekne — a v UI je druh vidět vedle kódu. Za kód, který se dá
nadiktovat po telefonu, to je dobrá výměna.

#### Kde krátký kód NESTAČÍ

| Krátké | Dlouhé |
| --- | --- |
| UID entity, dokumentu, skenu | **ověřovací token QR kódu** (dok. 21) |
| | **Předávací kód** (dok. 02) |
| | **kód organizace** pro ověření pěstouna (dok. 24) |

UID je bezpečné mít krátké, protože **samo nic neotevírá** — přístup rozhoduje
token přihlášeného a pravidla, takže kdo uhodne cizí UID, nedozví se nic.

Ověřovací stránka QR kódu je ale **čitelná bez přihlášení** a ukazuje
vydavatele, druh dokumentu a jednací číslo. Sedmimístný token by šel zkoušet
hrubou silou a z odpovědí by se dal sestavit přehled, kdo komu co posílá.
Tokeny a kódy jsou **klíče, ne identifikátory**, a klíč se nesmí dát uhodnout —
zůstávají dlouhé (24 znaků).

### 1.4 Profil je způsob, jak se na entitu kouká

Profil není nová kolekce. Skládá se ze tří věcí a všechny už v modelu jsou:

1. **hlavička** — identita z profilového dokumentu;
2. **karty** — služby z `ENTITY_SERVICES`;
3. **práva** — co smí dívající se člověk vidět a dělat (pravidla).

`ENTITY_SERVICES` je tabulka „který druh entity má které služby“. Je v kódu,
protože z ní plyne, **co se na profilu vůbec ukáže** — a nesmysly jako
„respitní dny u zaměstnance“ nebo „kniha života u dohody“ tím padnou samy.

Není to oprávnění. Oprávnění řeší role a pravidla; tohle říká, co má u té věci
smysl.

---

## 2. Název dohody

Zadání: dohoda se jmenuje po příjmení pěstouna; u dvou různých příjmení systém
vybere jedno; Klíčová osoba může přejmenovat; vše je vedené pod UID.

```
Jeden pěstoun               → „Novákovi“
Manželé, stejné příjmení    → „Novákovi“
Dva, různá příjmení         → vybere se jedno a je vidět které
Přejmenováno                → „Novákovi — pěstounská péče“
```

### 2.1 Odvozený název se aktualizuje, přejmenovaný ne

`naming.source` je `derived` nebo `renamed` a ten rozdíl je podstatný:

> **Odvozený název se sám aktualizuje**, když pěstounka změní příjmení
> (svatba, rozvod). **Přejmenovaný zůstane.**

Kdyby se aktualizoval i přejmenovaný, přepsalo by to práci Klíčové osoby a
nikdo by nevěděl proč. Původní názvy se odkládají do `previousNames`, takže se
podle nich dá i hledat a nic se neztratí (dok. 10).

### 2.2 Výběr z dvou příjmení je deterministický

„Náhodně“ ano, ale **reprodukovatelně**. Kdyby to bylo skutečně náhodné,
dohoda by se po každém přepočtu přejmenovala sama a působilo by to jako chyba.
Volající dodá index (u nás číslo dohody) a z něj se vybere.

### 2.3 Čeština si vynutila jednu opravu

Při ověřování testovacích dat vylezlo „**Blažekovi**“ a „**Jelínekovi**“.
Správně je *Blažkovi* a *Jelínkovi* — čeština u příjmení na **-ek, -ec, -el**
vypouští v ohnutých tvarech `-e-`: Marek → **Markovi**, Němec → **Němcovi**.

Řešení je v datech, která už v modelu jsou: **ženský tvar příjmení ten správný
základ obsahuje** (Blažková → Blažk-), takže se odvozuje z něj, ne z mužského.
U přídavných jmen se přidá `-í`: Veselá → **Veselí**, Černá → **Černí**.

```
Novákovi  Svobodovi  Novotní  Dvořákovi  Černí  Procházkovi  Kučerovi
Veselí  Horákovi  Němcovi  Markovi  Pospíšilovi  Pokorní  Hájkovi
Jelínkovi  Královi  Růžičkovi  Benešovi  Fialovi  Sedláčkovi  Blažkovi
Šimkovi  Bartošovi  Malí  Kadlecovi  Vlčkovi
```

Všech 36 příjmení v testovací sadě je teď gramaticky správně. Pravidlo
(`familyPlural`) je **ve schématu, ne v generátoru dat** — potřebuje ho
aplikace, ne jen testy. A je to další důvod, proč má `Person` pole
`grammaticalGender` (dok. 07): bez ženského tvaru v datech to nejde spočítat.

### 2.4 Pravidlo, které je snadné porušit

> **Nic se nesmí vyhledávat, řadit ani párovat podle názvu.**

Název je popisek, který si kdokoli kdykoli přepíše. Drží **UID** a **spisová
značka** (`CaseFile.reference`).

Konkrétně: odkaz v textu ukládá UID a název dokresluje při zobrazení. Kdyby
ukládal název, po přejmenování by v loňské zprávě zůstalo staré jméno bez
vazby — a to je přesně ten druh chyby, který se najde až tehdy, když už na tom
záleží.

---

## 3. Kde to je

| Věc | Soubor |
| --- | --- |
| Tvar UID, abeceda, generátor, normalizace opsaného kódu, dlouhé tokeny | `schema/src/uid.ts` |
| `EntityRecord`, `EntityKind`, `KINDS_WITH_PROFILE`, `ENTITY_SERVICES`, `ProfileView`, `AgreementNaming`, `familyPlural` | `schema/src/entities.ts` |
| `Agreement.naming` | `schema/src/agreements.ts` |
| Cesta `entities/{uid}` | `schema/src/paths.ts` |
| Pravidla: čtení podle organizace v záznamu, `list` zakázaný | `firestore.rules` |
| Testy pravidel (70) | `tests/rules.test.mjs` |
| Testy funkcí schématu (23) — abeceda, kolize, skloňování, název dohody | `tests/schema.test.mjs` |

Testovací data mají **~312 entit** v registru: 2 organizace, 89 osob, 158 dětí,
55 dohod, 8 poskytovatelů. Z 55 dohod má **28 dva pěstouny** — z toho 17 se
stejným příjmením a **11 s různým** — a **14 je přejmenovaných**. Obojí je tam
kvůli tomu, aby šlo otestovat výběr názvu i to, že přejmenování přepočet
nepřepíše. Počty se při změně generátoru posunou (deterministický proud), přesný
stav řekne `npm run seed:dump`.

Kontrola registru odhalila i to, co v něm být nemělo: pořadatelé v marketplace
si drželi čitelná id místo UID a **objednávky kurzů si `offerId` skládaly ze
šablony**, takže ukazovaly na kurz, který v datech nebyl. Odkaz musí vzniknout
z toho, co se opravdu zapsalo — u UID se totiž, na rozdíl od čitelného id,
nedá uhodnout, jak vypadá.

### Co to mění jinde

| Dokument | Změna |
| --- | --- |
| 03 | strom vazeb dostává registr, který UID překládá na věc |
| 12 | `Ref` v časové ose a v úkolech ukazuje na UID z registru |
| 20 | `mention` v editoru ukládá UID, název dokresluje při zobrazení |

### Co ještě chybí

| Chybí | Kdy |
| --- | --- |
| Function, která registr píše spolu se vznikem profilu | s Cloud Functions |
| Přepočet odvozených názvů při změně příjmení | s Cloud Functions |
| Profily pro `vehicle` a `offer` | leasingy jsou odložené (dok. 07) |
| Vyhledávání napříč entitami | s indexací (dok. 17) |
