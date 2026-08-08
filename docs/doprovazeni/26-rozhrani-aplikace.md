# 26 — Rozhraní aplikace

Co drží vzhled aplikace pohromadě a proč. Vzniklo ze tří pokusů: první byl
seznam v tabulce, druhý agenda s hodinovou mřížkou, třetí je tenhle.

---

## 1. Eli je první obrazovka

Chat má být ústřední nástroj (dok. 15). Když je ústřední, musí být první —
pomocník schovaný v rohu se otevře třikrát a pak se na něj zapomene.

Prázdný stav je proto skoro prázdný: značka, oslovení, psací pole ve výšce
očí a čtyři návrhy, co se dá říct. Po první odpovědi pole sjede dolů a plochu
dostane rozhovor.

**Odpovědi vedou dál.** Pod textem je karta s řádky, ze kterých se klikne do
rodiny, na dítě nebo do dne. Chat, ze kterého se nedá odejít do práce, je
odpovídač, ne nástroj.

---

## 2. Navigace: jedno menu, čtyři seznamy

Vlevo se vysouvá menu s přepínačem **Dohody / Pěstouni / Děti / Tým**. Spodní
lišta se záložkami zmizela — čtyři záložky dole a čtyři v menu jsou dvě
navigace vedle sebe a člověk pak neví, kde co hledat.

Na širokém displeji menu nezmizí a stojí jako sloupec vedle obsahu. Je to
jedna komponenta se dvěma chováními, ne dvě navigace.

### 2.1 Co je v řádku seznamu

| Je tam | Není tam |
| --- | --- |
| obrázek | **UID** |
| jméno | **spisová značka** |
| **obec** | rodné číslo, adresa, telefon |
| upozornění, když je na co | druh péče u ukončených |

**Obec je tam proto, že se tam jezdí.** Klíčová osoba se v seznamu rozhoduje
podle toho, kam to je daleko — ne podle čísla spisu.

**UID v seznamu nemá co dělat.** Opakovat u každého řádku kód, který se stejně
nedá přečíst od pohledu, je šum; navíc se podle názvu ani značky nic nehledá
(dok. 25). UID je vidět v profilu, kde slouží k dohledání a k nadiktování po
telefonu.

### 2.2 Seskupení se přepíná

Abecedně · podle obce · podle termínu · podle vlastního označení.

Jeden seznam, čtyři způsoby, jak se na něj podívat — levnější než čtyři
obrazovky a člověk se v tom neztratí, protože se mění jen pořadí, ne obsah.

Seskupení podle termínu má vlastní pořadí skupin: **Po termínu, Tento týden,
Do měsíce, Později, Bez termínu.** Abeceda by tu byla k ničemu.

### 2.3 Upozornění je v seznamu, ne až v detailu

Co je po termínu, svítí červeně přímo v řádku. Do dvou týdnů oranžově. Dál
nic — kdyby svítilo všechno, přestane svítit cokoli.

Text štítku je krátký („po termínu", „za 5 dní"). Kolik přesně dní to je, se
řeší v profilu; v seznamu jde o to, aby barva padla do oka a nezabrala půl
řádku.

---

## 3. Obrázky

Každý pěstoun, dítě i kolega má obrázek. Ve třech stupních:

1. **fotka**, kterou si někdo nahraje,
2. **obrázek ze sady** — motiv (kočka, raketa, kytka, srdce…) a barva,
3. **odvozený z UID**, dokud si nikdo nic nevybral.

Ten třetí stupeň je důležitý: prázdný systém nesmí vypadat prázdně. Odvození
je deterministické, takže stejný člověk má vždycky stejnou barvu a seznam se
dá číst i koutkem oka. Dítě dostane rovnou motiv, dospělý iniciály na barevném
podkladu — u dospělého pomáhá jméno víc než obrázek, u dítěte naopak.

**Fotka se zmenšuje na 256 px přes `<canvas>`.** Vedlejší účinek je ten
podstatný: překreslením se zahodí EXIF, tedy i GPS souřadnice domácnosti
(dok. 21).

Mění se v profilu, ne v seznamu — v seznamu by se to přepsalo omylem při
scrollování.

---

## 4. Barevné označení je soukromé

Klíčová osoba si může řádek označit barvou: kroužek kolem obrázku a jméno na
barevném podkladu. Slouží jí k tomu, aby si označila, co potřebuje, aniž by to
musela napsat slovy.

> **Nikdo jiný to nevidí a nikam se to nezapisuje.**

Proto to žije v prohlížeči, ne v databázi. Kdyby to viděli ostatní, vznikl by
z toho nálepkovací systém na rodiny — a to je přesně to, co charta zakazuje
(dok. 16). Rozdíl mezi „poznámka pro mě" a „záznam ve spisu" musí být tvrdý.

---

## 5. Barva

Přízvuk je **fialová** (`--ds-purple-*`): aktivní záložka, tlačítko odeslání,
hlavička profilu, odkazy. Doplňkové barvy nesou význam — červená po termínu,
oranžová blízký termín, tyrkysová kniha života.

Všechno jsou to tokeny. V kódu není jediný hex (CLAUDE.md), takže světlý i
tmavý režim vychází sám a případná změna palety je jedna změna.

---

## 6. Dětská sekce

Karta dítěte je jediné místo v aplikaci, které je záměrně **měkčí**: velký
obrázek, který si dítě vybere samo, věk, škola, bydliště, co se chystá, a
odpočet do narozenin.

**Kniha života** má vlastní blok v jiné barvě než zbytek. Je to sbírka toho
hezkého, ne evidence — a nemá vypadat jako spis.

---

## 7. Co zbývá

| Chybí | Kdy |
| --- | --- |
| přechody a gesta (odsunutí řádku, tah zpět) | až bude tvar obrazovek hotový |
| desktopový režim s dvěma sloupci (seznam + detail) | s soupisem obrazovek |
| skutečné ukládání obrázků a označení | s Firestore a přihlášením |
| kniha života | s ukládáním souborů |
