# 26 — Rozhraní aplikace

Co drží vzhled aplikace pohromadě a proč. Vzniklo ze čtyř pokusů: seznam
v tabulce, agenda s hodinovou mřížkou, vlastní „barevná" verze — a tenhle.

---

## 0. Dvě knihovny, jeden zdroj barev

| | Co drží |
| --- | --- |
| **Geist** (vendorovaný, CLAUDE.md) | barvy, písmo, tmavý režim |
| **KtUI** (`@keenthemes/ktui`, MIT) | komponenty: karty, tabulky, tlačítka, štítky, nabídky, hlášky |

KtUI dělají Keenthemes — autoři Metronicu. Je to jeho dnešní podoba
a **je open source**, takže se dá použít, ne jen okoukat.

Spojení není „dvě knihovny vedle sebe". KtUI si barvy bere z proměnných
(`--primary`, `--card`, `--border`, `--radius`); ty **přepisujeme na tokeny
Geistu** (`apps/crm/src/app.css`). Z toho plyne:

- v kódu není jediný hex,
- tmavý režim vychází sám — tokeny Geistu se překlápí na `.dark` a KtUI
  ten stejný přepínač používá,
- změna palety je změna na jednom místě.

**Pořadí importů je nosné.** KtUI je předpřeložený Tailwind a nese i vlastní
utility (`.hidden`, `.flex`). Musí jít **první**, jinak přebije naše — a
`hidden sm:block`, kterým se na mobilu přepíná tabulka za seznam, by zůstalo
schované i na širokém displeji. (Stálo to jedno hledání, proč zmizela
tabulka.)

Z KtUI se bere i chování, ne jen vzhled: nabídka pohledu v liště je
`data-kt-dropdown` (umístění, zavření klikem vedle i klávesou Esc) a potvrzení
akcí jsou `KTToast`.

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

### 2.1 Seznam na plochu je tabulka

Panel vlevo nese **krátký** seznam a hledání; celý seznam se otevírá na plochu
jako tabulka se sloupci (kde to je, kdo to má, do kdy). Dvacet rodin se
porovnává po sloupcích a v pruhu 320 px to nejde.

Na mobilu se tatáž data vykreslí jako řádky — šest sloupců na 390 px není
tabulka, ale hlavolam.

### 2.2 Co je v řádku seznamu

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

### 2.3 Seskupení se přepíná

Abecedně · podle obce · podle termínu · podle vlastního označení.

Jeden seznam, čtyři způsoby, jak se na něj podívat — levnější než čtyři
obrazovky a člověk se v tom neztratí, protože se mění jen pořadí, ne obsah.

Seskupení podle termínu má vlastní pořadí skupin: **Po termínu, Tento týden,
Do měsíce, Později, Bez termínu.** Abeceda by tu byla k ničemu.

### 2.4 Upozornění je v seznamu, ne až v detailu

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

## 5. Barva — a proč jí je málo

První pokus o „barevnější" verzi obarvil všechno: fialové hlavičky, barevné
avatary u každého řádku, bubliny u každého údaje. Vypadalo to jako hračka.
Platí proto tvrdé pravidlo:

> **Barva něco znamená, jinak tam není.**

| Kde | Co |
| --- | --- |
| fialová | hlavní akce, aktivní položka, odkaz — **nic víc** |
| červená | po termínu |
| jantarová | termín do čtrnácti dnů |
| šedá | všechno ostatní |

Z toho plyne i to, co barevné **není**: hlavička profilu, karty, avatary
dospělých, štítky stavu. Termín se štítkem označí jen tehdy, když hoří —
datum za půl roku je údaj, ne varování.

Plochu drží zapuštěná šeď, karta je světlá s vlasovou linkou. Žádné velké
stíny: stín říká „tohle pluje nad stránkou", a v administraci nepluje nic.

Všechno jsou to tokeny. V kódu není jediný hex (CLAUDE.md), takže světlý i
tmavý režim vychází sám a případná změna palety je jedna změna.

## 5.1 Hustota

Pracovní, ne prezentační: řádek 44 px, popisek 13 px šedý, hodnota 14 px
tmavá. Klíčová osoba se dívá na dvacet rodin, ne na jednu — a čím víc se jich
vejde na obrazovku, tím míň scrolluje.

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


---

## 8. Rozvržení B — spis jako dokument

Rozvržení A (všechno výš) je **rejstřík**: navigace vlevo → seznam → karta.
Vedle něj stojí druhá cesta, aby šlo porovnat klikáním, ne z popisu:

| | A | B |
| --- | --- | --- |
| navigace | panel vlevo, seznamy | **žádná** — píše se |
| obrazovka je | rejstřík | **jeden spis** |
| obsah spisu | čtyři záložky | **jedna časová osa** |
| přepnutí rodiny | seznam → řádek | příkazový řádek nebo poslední otevřené |

**Příkazový řádek** (⌘K / Ctrl+K) je jediná navigace. Rozhoduje první slovo:
co vypadá jako jméno, hledá; co vypadá jako věta, jde na Eli. Klíčová osoba
nezná strukturu aplikace, ale zná jména — menu ji nutí překládat si jméno na
cestu, řádek to přeskakuje.

**Časová osa** míchá návštěvy, poznámky, výdaje, dokumenty, lhůty i schůzky
podle data, protože tak se ta práce odehrála. Budoucí věci jsou nad linkou
„Dnes", minulost pod ní. V rozvržení A jsou tytéž věci ve čtyřech záložkách
a pořadí si musí člověk složit v hlavě.

Osa hned odhalila chybu v datech: **všechny dokumenty seděly na dnešku**,
protože se jim `createdAt` bral z okamžiku generování sady, ne z data, ke
kterému jsou datované. V rozvržení A to nebylo poznat — dokumenty jsou tam
v tabulce s vlastním sloupcem.

Kde to je: `apps/crm/src/workspace/`, cesta `#/b`. Přepínač je v Pohledu.


---

## 9. Černý panel, graf, zvonek

Trojí doplnění, které dělá rozdíl mezi „kostrou" a „systémem":

**Panel je černý v obou režimech.** Není to zapsaná barva — na `<aside>` je
třída `dark`, takže se uvnitř přepnou tokeny Geistu na tmavé hodnoty
(`background-100` je tam skoro černá, `gray-1000` skoro bílá). V tmavém režimu
se nemění nic, panel už tmavý je. Nikde tím nepřibyl hex.

**Grafy jsou ručně kreslené SVG** (`src/charts.tsx`), ne knihovna. Knihovna na
grafy váží víc než celá aplikace a uměla by dvacet druhů grafů, z nichž
potřebujeme dva. Navíc by si nesla vlastní barvy; takhle jdou z tokenů.
Oba grafy mají u sebe čísla — graf, ze kterého se nedá odečíst hodnota, je
obrázek, ne údaj.

**Zvonek ukazuje počet lhůt po termínu.** Notifikace se teprve navrhují
(dok. 00), tak zatím ukazuje to jediné, co v systému opravdu „přišlo"
a nepočká.


---

## 10. Rám podle Luminaux

Z dodané šablony (True Black Sidebar) se převzalo **rozvržení rámu**, ne kód:

| Prvek | Luminaux | U nás |
| --- | --- | --- |
| panel | `app-rail` 4 rem + `app-secondary` | totéž — lišta oblastí a navigace oblasti |
| panel v tmavém | `sidebar-oled` s vlastními hexy | třída `dark` a tokeny Geistu |
| lišta | 4 rem, hledání, ikony vpravo | 3,5 rem, jinak stejně |
| drobečky | `page-header`, lepící, 2,75 rem | totéž |
| rádius | `--border-radius: .75rem` | 12 px na kartách, 8 px na ovládání |
| písmo | Inter / Plus Jakarta Sans | **Geist** (CLAUDE.md) |

**Dvousloupcový panel je ta podstatná změna.** Předtím jsme měli jeden sloupec,
ve kterém se míchala navigace se seznamem dat; po přepnutí oblasti se změnil
celý obsah pod rukou. Teď lišta drží oblasti (Eli, Přehled, Agenda, Lidé,
Nastavení) a sloupec vedle ní jen navigaci té jedné oblasti s počty.

Písmo zůstává Geist schválně: šablona si vozí Inter z Google Fonts, ale
CLAUDE.md říká Geist a fonty už jsou vendorované lokálně (bez CDN, což je
u aplikace s citlivými daty správně).


---

## 11. Co se vzalo z DashQ

DashQ je administrátorská šablona na **Bootstrapu 5 a jQuery** (ApexCharts,
Bootstrap Icons, přepínání motivu přes `data-bs-theme` a proměnné `--bs-*`).
Kód se z ní použít nedá — máme Tailwind 4, React 19 a KtUI; přenášet dva
konkurenční CSS rámce v jedné aplikaci se nedělá. Přenesly se **tři nápady**:

**Měkčí karta.** DashQ nemá tvrdou linku okolo karty, ale větší rádius (1 rem)
a jemný stín. Vzniklo `.kt-card-soft` v `app.css` — linka zůstává, jen se
ztlumí na 60 %, a pod ní je stín. V tmavém režimu je stín silnější, protože
na černém podkladu je slabý stín stejně nevidět.

**Jiskřička v dlaždici.** Číslo řekne kolik, jiskřička řekne kam to jde.
`Spark` v `charts.tsx` je čára bez os a popisků — tvar, nic víc. Kreslí se
**jen tam, kde je skutečná řada**: u dohod počet uzavřených ke konci každého
měsíce, u lhůt jejich rozložení den po dni na týden dopředu, u návštěv počty
po měsících. Dlaždice „Po termínu" jiskřičku nemá, protože historii stavu
povinností nemáme a dokreslovat ji by byla lež.

**Ovládání u nadpisu.** DashQ má v `page-header` volbu období a vývozy.
U nás je to volba 3 / 6 / 12 měsíců (mění grafy i dlaždici návštěv) a tlačítko
**Vývoz**, které stáhne otevřené lhůty jako CSV — středníky a s BOM, aby to
otevřel český Excel bez rozsypaných sloupců.

Zvolené období je bílá pilulka v zapuštěné liště, ne podtržítko: podtržítko
se ztratí na statickém obrázku a stav ovladače má být vidět na první pohled.


---

## 12. Panel má dvě šířky

Luminaux má obě podoby jako dvě stránky dema (`sidebar-black` a `minified`).
U nás je to **jeden panel a přepínač**, ne dva návrhy:

- **celý** — lišta oblastí (4 rem) plus navigace oblasti s počty (13 rem),
- **zúžený** — jen lišta oblastí; navigace zmizí a obsah se rozšíří o 13 rem.

Přepíná se šipkou na spodku lišty a volba se pamatuje (`v15c.panel`
v prohlížeči). Je to volba práce, ne vzhledu: kdo čte tabulku o šesti
sloupcích, chce šířku; kdo přeskakuje mezi oblastmi, chce rozcestník.

Na mobilu přepínač není — tam je panel šuplík a vždy se otevře celý.
V zúženém stavu není vidět karta osoby na spodku panelu; přepnutí person
i odhlášení zůstává v liště nahoře, takže se nic neztratí.


---

## 13. Dvojpanel a připnutí lidé

Luminaux má v „dual sidebar" dvě svislé lišty vlevo a messenger vpravo.
U nás z toho vzniklo tohle:

**Vlevo: menu, které se rozbalí na jména.** Položky Dohody, Pěstouni, Děti
a Tým mají u sebe šipku. Kliknutí na název jde do plného seznamu ve střední
části, šipka rozbalí **rychlý seznam** přímo v panelu: avatar, jméno, obec
a tečka, když něco přeteklo. Deset jmen a nad nimi filtr, ne víc.

Dělení práce je záměrné: **panel je rozcestník, tabulka je nástroj.** Řazení,
seskupení podle obce, stránkování a hledání zůstávají v seznamu ve středu —
to je pohled pro vedení a pro dávkovou práci. Panel řeší jinou úlohu: „vím,
koho hledám, chci se tam dostat na dvě kliknutí."

**Vpravo: připnutí lidé.** Tam, kde má Luminaux chat, máme lištu avatarů
těch, se kterými má člověk zrovna co dělat. Kliknutím se otevře karta: obec,
nejbližší lhůta, telefon jako odkaz `tel:`, e-mail, otevření karty
a odepnutí. Do prázdné lišty se napoprvé připnou ti, u kterých je lhůta po
termínu — prázdný pruh by nikdo nezaplnil.

**Chat tam nebude.** S pěstounem se mluví telefonem a osobně; psané slovo
o dítěti patří do spisu, kde má datum, autora a dohledatelnost. Bublina, která
se nikam nezapíše, je u téhle agendy krok zpátky (dok. 16, 21). Připnutí je
proto soukromé a leží v prohlížeči (`v15c.pins`), stejně jako barevné
označení řádku — „koho mám připnutého" je pracovní poznámka, ne údaj o rodině.

Lišta se ukazuje od 1280 px. Na užším displeji by ubrala šířku tabulce,
a to je horší obchod než přijít o zkratku.


---

## 14. Rozměry přeměřené podle šablony

Ze stránky `page-layouts/dual-sidebar` (uložená stránka dema, ne koupený
balík) šla poprvé přečíst skutečná geometrie. Rám se podle ní srovnal:

| Rozměr | Luminaux | dřív u nás | teď |
| --- | --- | --- | --- |
| panel celkem | `--sidebar-width: 19rem` | 17 rem | **19 rem** |
| lišta oblastí | `.app-rail` 4 rem | 4 rem | 4 rem |
| sloupec navigace | zbytek, tj. 15 rem | 13 rem | **15 rem** |
| zúžený panel | `--sidebar-width-min: 4rem` | 4 rem | 4 rem |
| horní lišta | `h-16`, tj. 4 rem | 3,5 rem | **4 rem** |
| řádek navigace | `px-3 py-2.5`, 14 px | `py-2` | **`py-2.5`** |
| podseznam | `pl-5` | `pl-3` | **`pl-5`** |
| pravá lišta | `--chat-rail-width: 4rem`, od 1024 px, `z-45` | 3,5 rem, od 1280 px | **4 rem, od 1024 px** |

Potvrdilo se i to, co jsme uhodli správně: `.app-sidebar__inner > .app-rail
+ .app-secondary` je přesně naše struktura, tlačítko „Hide panel" je v šabloně
taky **dole v liště**, a lišta je o odstín tmavší než sloupec navigace
(`color-mix(surface-muted 92%, foreground 8%)`; u nás to samé dělají
`--ds-background-100` a `--ds-background-200`).

**Převzatý prvek: špendlík na řádku.** Šablona má u každé položky navigace
tlačítko `nav-fav`, které se objeví při přejetí a přidá položku do oblíbených.
U nás je to totéž s jiným cílem: špendlík na řádku rychlého seznamu **připne
člověka do pravé lišty**. Připnutý špendlík zůstává vidět, aby se dalo
odepnout, a odznak lhůty při přejetí ustoupí, aby se netlačily.

Co se **nepřevzalo**: písmo (šablona veze Inter a JetBrains Mono z Google
Fonts, my máme Geist lokálně), zelená barevnost, a `data-*` atributy na
`.app-shell` — režimy panelu držíme ve stavu Reactu, ne v atributech na `body`.

Soubory šablony do repozitáře nepatří (licencovaný cizí kód). Rozměry v téhle
tabulce jsou přeměřená čísla, ne převzatý kód — proto smí být tady.
