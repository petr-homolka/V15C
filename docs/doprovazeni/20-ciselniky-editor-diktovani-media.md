# 20 — Číselníky, editor, diktování a média

Čtyři doplnění. Všechna jsou **implementovaná**, ne jen navržená — kde je co,
je v tabulce na konci.

---

## 1. Číselníky: nabídka nikdy nekončí

Zadání: kde se z něčeho vybírá, je na konci **„+ Přidat nové“**. Nové položky
vznikají na úrovni organizace, superadmin je může adoptovat pro celý systém,
v nastavení organizace je lze smazat.

### 1.1 Jedna věc, která se tím nesmí rozbít

Kdyby byl rozšiřitelný **každý** výběr, přestane fungovat motor lhůt a výkazy:

- organizace si přidá vlastní **právní důvod péče** → výpočet vzdělávacích hodin
  pro něj nemá větev a nebude vědět, jestli je to 18 nebo 24 hodin;
- přidá si vlastní **důvod odmítnutí zájemce** → roční výkaz podle § 49c odst. 4
  ho nemá kam zařadit, a zákon zná právě tři;
- přidá si čtvrtého **adresáta zprávy** → zpráva se nedoručí tomu, komu má.

Řešení není rozšiřování zakázat, ale rozdělit ho na tři druhy:

| Druh | Co to je | Rozšiřuje se? |
| --- | --- | --- |
| **Uzavřený výběr** | vyjmenovává ho zákon, nebo na něm větví motor | **ne** |
| **Otevřený číselník** | slovník — témata, poskytovatelé, místa, druhy úkolů | **ano, volně** |
| **Mapovaný číselník** | rozšiřuje se, ale nová položka musí říct, **jak se chová** | **ano, s mapováním** |

Mapování je ta podstatná část. Nová kategorie výdaje musí říct, pod které
**písmeno práva** podle § 47a odst. 2 patří. Nová forma vzdělávání musí říct,
jestli se počítá jako **e-learning**. Nové místo styku musí říct, jestli je to
`home`, `organization` nebo `other`. Tím zůstane nová položka pro motor
předvídatelná, i když ji systém nikdy neviděl.

**Patnáct číselníků** je v `schema/src/codebooks.ts` v konstantě `CODEBOOKS`,
**deset uzavřených výběrů** v `CLOSED_CHOICES` — každý s důvodem, proč uzavřený
je. Seznam je v kódu záměrně: je to rozhodnutí o tom, kde smí flexibilita být,
a má být vidět v diffu, ne zahrabané v databázi.

### 1.2 Kdo smí přidávat

**Každý, kdo pracuje se spisem.** Kdyby Klíčová osoba musela na novou kategorii
výdaje čekat na admina, přestane ji používat a napíše to do poznámky — a to je
horší než volná nabídka.

Vyřadit položku z nabídky smí **vedení**, protože to je změna pro celou
organizaci. Obojí je vynucené v `firestore.rules` a otestované.

### 1.3 „Smazat“ — a jak se to potká s tím, že se nic nemaže

V UI je jedno tlačítko **Smazat**. Co se stane, závisí na tom, jestli se položka
někde použila:

| Stav | Co se stane |
| --- | --- |
| **nepoužitá** | skutečně se odstraní — nic se tím neztrácí |
| **použitá** | **vyřadí se z nabídky** a v historii zůstane čitelná |

Kdyby se použitá položka odstranila, záznamy by ukazovaly na nic a v časové ose
i ve zprávě by zůstalo prázdné místo. Je to totéž pravidlo jako všude jinde
(dok. 10) — jen tady stojí za to říct nahlas, protože uživatel klikl na
„Smazat“ a musí se dozvědět, co se stalo. Text je faktický, bez poučování
(dok. 16).

**Použití se nepočítá průběžně.** Počítadlo na každém záznamu by byl zápis
navíc při každém zápisu do spisu; místo toho se při pokusu o smazání spustí
jeden `count()` dotaz. Ten je ve Firestore účtovaný jako jedno čtení za tisíc
dokumentů, takže je to výrazně levnější než počítadlo (README sekce 1.4).

To je zároveň **jediné místo v celém modelu, kde `delete` existuje** —
a i tam ho klient nemá, rozhoduje o tom Cloud Function, která umí použití
spočítat. V `paths.ts` je to vyjmenované jako `REMOVABLE_IF_UNUSED`.

### 1.4 Adopce superadminem

Organizační položka se **nekopíruje ani neruší**. Vznikne platformní položka
se **stejným kódem** a u organizační se zaznamená, že se to stalo. Ve výběru
se položky sjednotí podle kódu a platformní vyhrává — takže se nezdvojí.
Funkce `mergeCodebook()` to dělá na jednom místě a dá se otestovat.

Superadmin má tedy frontu: položky s `origin: 'organization'` a nerozhodnutou
`adoption`. Rozhodnutí je `adopted` nebo `rejected` s poznámkou — odmítnutí
organizaci nic nebere, položku dál používá u sebe.

---

## 2. Editor: blokový, s „/“ příkazy

**Jak se to jmenuje.** V Routine je to **„/“ příkaz**: na začátku řádku napíšeš
`/` a vypíše se nabídka bloků. K tomu patří **úchyt `⋮⋮`** vlevo u každého bloku
(výběr, přetažení, kontextová nabídka), **sbalitelné nadpisy** H1–H3, výběr více
bloků pomocí `⇧↑`/`⇧↓` a **markdownové zkratky** (`#`, `##`, `1.`, `-`, `>`).
Panel nad označeným textem se jmenuje **bubble menu**.

### 2.1 Důsledek pro model, který se snadno přehlédne

**Blokový editor neukládá text jako string.** `DocumentDraft.currentText` byl
string — kdyby tak zůstal, každé uložení by rozházelo strukturu a auditní stopa
„kolik z toho napsal člověk“ (dok. 14) by porovnávala jinak zformátovaný text,
ne obsah.

Ukládá se proto **obojí**: `content` jako bloky (to je pravda) a `plainText`
jako **odvozený mirror** pro diff, hledání, vektory a PDF. Mirror se generuje
z bloků, nikdy naopak.

### 2.2 Čtyři bloky, které nemá žádný obecný editor

Tohle je to, co odlišuje editor spisu od editoru poznámek:

| Blok | Co dělá |
| --- | --- |
| `computed` | **dopočítaná hodnota** — needitovatelná, přepočítá se. Věta „splnila zákonnou povinnost“ se počítá z `EducationPeriod` (dok. 06, 07), ne píše. |
| `sentence` | **věta z knihovny** — je poznat, co je předvyplněné, a drží se skloňování (dok. 07) |
| `gap` | **místo k doplnění** `[DOPLNIT: …]` — viditelné i v exportu PDF, aby nemohlo vypadnout tiše (dok. 14) |
| `mention` | odkaz na osobu, dítě, dokument nebo osobní styk — `@` |

### 2.3 Kontext editoru není kosmetika

Každý „/“ příkaz má seznam kontextů, ve kterých se nabízí. V poznámce nemá co
dělat „dopočítaná hodnota z dohody“ a **v knize života dítěte se nenabízí Eli**,
protože je to dokument dítěte (dok. 17).

### 2.4 Co použít

**TipTap** (nad ProseMirror) — má oficiální blokovou šablonu,
`@tiptap/extension-drag-handle-react` pro úchyt bloku a je udržovaná. To je
přesně zadání z dok. 19: žádná vlastní knihovna tam, kde existuje udržovaná.
Ikony **lucide**, jména jsou přímo u příkazů.

Co se z TipTapu **nebere**: placené cloudové doplňky. Spolupráci v reálném čase
nepotřebujeme — spis píše jeden autor a záznamy jsou append-only (dok. 02),
takže by to byla složitost bez užitku.

Klávesové zkratky vycházejí z Notionu a Routine. Vymýšlet vlastní by znamenalo
učit uživatele něco, co nikde jinde neplatí.

---

## 3. Diktování, přepis a souhrn

Zadání: zvuk se ukládat nemusí (ukládání může být Premium), ale **přepis se
ukládat musí** a je editovatelný v okamžiku nahrávání a **3 dny** potom.
**Souhrn od AI** je editovatelný.

### 3.1 Proč je to okno právě tři dny — a proč to není přísnost

Zvuk se neukládá. Tím se ale ztrácí možnost přepis později zkontrolovat proti
tomu, co bylo řečeno — a přepis je **primární záznam** o tom, co pracovnice
v rodině viděla.

> **Okno neexistuje kvůli přísnosti. Existuje proto, že zvuk zmizel.**
> Dokud si pracovnice návštěvu pamatuje, může přepis opravit. Potom už by
> opravovala podle ničeho.

Po uplynutí okna se **nic nezakazuje** — oprava je nový záznam ve spisu, jako
všude jinde (dok. 10). Souhrn zůstává editovatelný **trvale**, protože to není
záznam o řečeném, ale pracovní výstup.

Délka okna je **parametr organizace**, výchozí 3 dny.

### 3.2 Okno vynucuje databáze, ne klient

`transcript.editableUntilMs` je strojový zrcadlový údaj v milisekundách.
Existuje z jediného důvodu: bezpečnostní pravidla umí srovnat
`request.time.toMillis()` s číslem, ale s ISO stringem ne. Kdyby okno hlídal
jen klient, šlo by ho obejít úpravou požadavku. Otestované — souhrn se po
zavření okna upravit dá, přepis ne.

### 3.3 Offline: okno běží od přepisu, ne od nahrání

Diktát nahraný v terénu bez signálu se přepíše až po připojení. Kdyby se okno
počítalo od nahrání, pracovnice by o část přišla, aniž by o tom věděla.
`transcribedAt` je proto základ, ne `startedAt`.

### 3.4 Diktát je vstup, ne záznam

Výsledkem je obsahový záznam ve spisu (`resultEntryId`). Dokud ho člověk
nepotvrdí, je to jen diktát — AI navrhuje, člověk potvrzuje (dok. 02 sekce 6).

### 3.5 Co je v jakém tarifu

**Diktát a přepis jsou v bezplatné variantě záměrně.** Je to ta nejužitečnější
věc pro terén (dok. 02: *„minimum psaní — diktát je hlavní vstup“*) a schovat ji
za tarif by znamenalo, že systém v terénu nepomůže tomu, kdo neplatí.

Premium je až **uchování zvuku** — což je náklad a riziko, ne užitek.

---

## 4. Videa

**Zakázaná, v Premium s limitem.** Důvod není jen cena: video z rodiny je
nejcitlivější možný obsah, indexovat se nedá a v archivu by leželo desítky let
(dok. 10). Zákaz je proto výchozí stav, ne šetření.

Zpráva při pokusu je faktická, jak žádá charta (dok. 16):

> Video se do spisu nenahrává. Popis situace patří do zápisu, snímek jako
> fotografie.

### Co v `UploadPolicy` ještě je

- **Normalizace obrázků při nahrání** — sken z mobilu má 1–3 MB, po převodu
  ~150 KB. To je pětinásobná až dvacetinásobná úspora a rychlejší OCR; je to
  jediná věc kolem úložiště, kterou stojí za to naprogramovat (dok. 19 sekce 6.1).
- **Kvóta 10 GB** s příplatkovými bloky, a `archiveCountsToQuota: false` —
  do kvóty se počítají jen aktivní spisy, protože cena nesmí tlačit organizaci
  k mazání.
- Povolené typy souborů a limity zvlášť pro obrázky, dokumenty, zvuk a video.

---

## 5. Kde to je

| Věc | Soubor |
| --- | --- |
| Definice číselníků, uzavřené výběry, sjednocení, mazání | `schema/src/codebooks.ts` |
| Formát obsahu, katalog „/“ příkazů, zkratky, volba knihovny | `schema/src/richtext.ts` |
| Diktát, přepis, souhrn, `UploadPolicy`, kvóta, tarify | `schema/src/media.ts` |
| Cesty ke kolekcím | `schema/src/paths.ts` |
| Oprávnění a vynucení okna přepisu | `firestore.rules` |
| Testy (25, všechny prochází) | `tests/rules.test.mjs` |
| Testovací data: 15 definic, 20 platformních a 6 vlastních položek, 12 diktátů | `tools/seed/` |

### Co to mění v dřívějších dokumentech

| Dokument | Změna |
| --- | --- |
| 02 | diktát dostává model: okno na přepis, volitelné uchování zvuku |
| 07 | knihovna vět je blok v editoru, ne jen nabídka |
| 14 | koncept má strukturovaný obsah; `proposedText` je odvozený mirror |
| 16 | „Smazat“ u položky číselníku má dva výsledky a oba se řeknou |
| 19 | doplněna `UploadPolicy` a počítadlo kvóty |
