# 14 — Interní asistent: koncepty do editoru, příchozí podání, dotazy

> Rozšíření pravidla z dok. 02 sekce 6 („AI navrhuje, člověk potvrzuje“) na tři nové
> role: **koncept dokumentu**, **zpracování příchozího podání** a **interní dotazovací
> asistent** pro kohokoli z organizace.

---

## 0. Jedna věta, ze které plyne zbytek

**Asistent nikdy nevytvoří záznam. Vytvoří jen koncept, který má autora-člověka
od okamžiku uložení.**

Z toho plyne všechno ostatní v tomhle dokumentu — datový model, auditní stopa
i to, co asistent smí a nesmí. Rozšiřuji přitom pravidlo z dok. 12 o úkolech:

> **Koncept nikdy neplní lhůtu.** `Obligation` ani `MandateObligation` se nezavírá
> vygenerováním konceptu, ale až uložením dokumentu člověkem a jeho doručením.
> Kdyby koncept lhůtu zavíral, systém by vykazoval soulad na základě textu, který
> nikdo nečetl — a to je přesně ta chyba, které se u kontrolované agendy vyhýbáme.

---

## 1. Koncept dokumentu v interním editoru

Pořadí je vždycky stejné, ať jde o zprávu, odpověď úřadu nebo plán:

```
1. Systém složí KONCEPT ze záznamů ve spisu          → DocumentDraft, status: proposed
2. Klíčová osoba nebo vedení ho přečte a upraví      → DraftRevision (každá úprava)
3. Uloží                                              → Document verze 1, autor = ČLOVĚK
4. Kdykoli později lze editovat                       → Document verze 2, 3, …
```

Krok 4 je to, na čem jsi trval, a v modelu už pro něj místo je: `Document.versions`
z dok. 12 se nikdy nepřepisuje. Editace po uložení není výjimka, je to normální stav.

```ts
interface DocumentDraft {
  organizationId: string
  caseFileId: string | null
  purpose: 'report_6m' | 'report_on_request' | 'final_report' | 'authority_reply'
         | 'plan_10c' | 'plan_10d' | 'visit_note' | 'handover_summary'
         | 'standard_self_assessment' | 'free'

  status: 'proposed' | 'in_edit' | 'saved' | 'discarded'
  savedAsDocumentId: string | null
  discardReason: string | null            // i zahození je informace

  proposedText: string                    // PRVNÍ návrh, neměnný
  currentText: string
  gapMarkers: string[]                    // viz sekce 2

  generation: {
    modelId: string                       // konkrétní verze modelu
    promptVersion: string                 // verzované jako všechno ostatní
    generatedAt: string
    requestedByPersonId: string
    retrieval: Array<{ refType: string; refId: string }>   // z ČEHO to vzniklo
    pseudonymized: true                   // dok. 02 sekce 6 — vždy
  } | null                                // null = člověk psal od nuly
}

interface DraftRevision {                 // append-only, nikdy se nemaže
  draftId: string
  revisionNo: number
  editedByPersonId: string
  editedAt: string
  textAfter: string
  charsAdded: number
  charsRemoved: number
}
```

### Co ta auditní stopa musí unést

Otázka, kterou při inspekci nebo u soudu někdo položí, zní: **„kolik z té zprávy
napsal člověk?“** Odpověď musí být doložitelná, ne odhadnutá. Proto se drží
`proposedText` **navždy** vedle uloženého textu — rozdíl mezi nimi je ta odpověď.

Tři důsledky, které je snazší zavést hned než dodělat:

1. **Autorem dokumentu je vždy člověk.** Asistent není v `createdByPersonId`, je
   v `generation`. Dokument s AI autorem by nešlo podepsat a u zprávy podle
   § 47b odst. 5 by to bylo nepravdivé.
2. **Příznak „vzniklo z konceptu“ přežívá do všech dalších verzí dokumentu.**
   Uložením se stopa nezahazuje.
3. **Zahození konceptu se zapisuje.** Když si Klíčová osoba nechá navrhnout odpověď
   úřadu a pak ji zahodí, je to jiná situace než když si ji nenechala navrhnout vůbec.

---

## 2. Grounding — proti čemu se to musí bránit

Tohle je nejrizikovější část celého systému a stojí za to ji pojmenovat naplno.
Dokument, který jde na OSPOD a k soudu a týká se dítěte v pěstounské péči, si
**nemůže dovolit ani jednu vymyšlenou větu**. Dvě selhání, která se dějí, a co proti
nim stavím:

### a) Vymyšlený fakt o rodině

Model, který má napsat zprávu a nemá k dispozici počet návštěv, s naprostou jistotou
napíše, že návštěvy probíhaly pravidelně. Proti tomu:

- **Každá faktická věta v konceptu nese odkaz na záznam**, ze kterého vznikla.
  V editoru je to podtržení s odkazem do spisu; v uloženém dokumentu odkazy mizí,
  ale zůstávají v `generation.retrieval`.
- **Když podklad chybí, koncept napíše mezeru, ne větu.** `[DOPLNIT: počet osobních
  styků za období]`, ne „návštěvy probíhaly pravidelně“. Mezera je viditelná i
  v náhledu PDF a v exportu — ne jen v editoru — aby nemohla vypadnout ven tiše.
- **Dopočítané věty zůstávají dopočítané.** Věta „Pečující osoba splnila svou zákonnou
  povinnost“ se počítá z `EducationPeriod`, jak stojí v dok. 06 a 07, a asistent do ní
  nesmí. Nedeterministicky generovat něco, co je deterministicky spočitatelné, je
  zbytečné riziko.
- Upozornění na neuzavřené mezery při ukládání je **zapnuté a organizace ho může
  vypnout** — stejné pravidlo jako u parametrů (dok. 07). Blokace ne. Ale viditelnost
  mezery v exportu vypnout **nejde**, protože to není upozornění, to je obsah.

### b) Vymyšlená citace předpisu

Odpověď soudu s neexistujícím paragrafem je horší než odpověď žádná.

- **Citace se nevytiskne z textu modelu, ale vyrenderuje ze záznamu** — z verzované
  sady pravidel (dok. 02), standardů (dok. 07) nebo `orgPolicy` (dok. 05). Model může
  navrhnout, *že* se má citovat; znění dodá systém.
- Paragraf, který v korpusu není, se z konceptu **odstraní a označí**, ne opraví.

### c) Věty z knihovny mají přednost

Knihovna obvyklých vět (dok. 07) je deterministická, česky správně skloňovaná a
odsouhlasená organizací. Kde na obsah sedí věta z knihovny, použije se **ona**, ne
generovaný text. Asistent je až druhá volba — a v terénu bez signálu jediná dostupná
(knihovna funguje offline, asistent ne).

---

## 3. Podatelna — dopis od úřadu „hozený do chatu“

Přesně ten scénář, který jsi popsal, i s tím, co se u něj snadno rozbije.

```
Klíčová osoba vyfotí dopis a pošle ho do vlákna PODATELNA
   ↓
Document (category: 'incoming_authority_letter', origin: 'chat_attachment')
   ↓
OCR  →  extrakce: odesílatel · jednací číslo · právní titul · lhůta · čeho se týká
   ↓
NÁVRH AuthorityRequest (dok. 13)  — člověk potvrdí, teprve pak vznikne
   ↓
Koncept odpovědi v editoru, složený ze záznamů spisu
   ↓
Schválí vedoucí (dok. 13: vydání údajů ven neschvaluje Klíčová osoba sama)
   ↓
Odešle ČLOVĚK · doručenka do dokumentů · AuthorityRequest se uzavře
```

```ts
interface IncomingSubmission {
  organizationId: string
  documentId: string                      // sken/PDF, jak přišel
  receivedOn: string                      // kdy fyzicky došlo — zadá člověk
  postedByPersonId: string

  extracted: {
    senderGuess: string | null
    fileRefGuess: string | null
    legalBasisGuess: string | null
    deadlineGuess: string | null
    deadlineSourceSnippet: string | null  // úryvek, ze kterého se to četlo
    caseFileGuess: string | null
    confidence: 'high' | 'low'
  }

  confirmedByPersonId: string | null
  confirmedAt: string | null
  authorityRequestId: string | null       // vznikne AŽ potvrzením
}
```

### Tři místa, kde by se to rozbilo, a co s nimi

**1. Špatně přečtená lhůta.** OCR spolehlivě zamění 3. a 8. Kdyby se z toho rovnou
stala `dueOn`, systém by hlídal špatný termín — a to je horší než nehlídat žádný.
Proto: lhůta z OCR je **nepotvrzená** a vedle ní je vidět **úryvek textu, ze kterého
se četla**. Potvrzení je pak pohled, ne opětovné čtení dopisu. Do potvrzení běží
povinnost od `receivedOn` se stavem „lhůta nepotvrzena“.

**2. Špatně přiřazený spis.** Založit dopis o Kláře do spisu Honzy je zároveň ztráta
dopisu i bezpečnostní incident. Proto podání **do potvrzení nežije v žádném spisu**,
ale ve **schránce organizace**. Do spisu ho vloží člověk.

**3. Podatelna nesmí být obyčejné vlákno.** Vlákna z dok. 09 a 12 můžou mít mezi
účastníky pěstouna. Dopis od soudu o jiné rodině v takovém vlákně je únik. Podatelna
je proto **vyhrazený interní kanál**: účastníky mohou být jen zaměstnanci organizace,
pěstouna ani dítě do ní nelze přidat, a systém to nepovolí ani omylem.

Mimochodem tenhle tok uzavírá i mezeru z dok. 13: `AuthorityRequest` tam vznikal
„nějak“. Teď má vstupní bránu.

---

## 4. Interní asistent — „zeptat se na cokoli“

Tady je celá obtížnost v jedné věci: **asistent, který odpovídá na cokoli, musí mít
stejné hranice jako uživatel, který se ptá.** Ne podobné. Stejné.

```ts
interface AssistantQuery {
  organizationId: string
  askedByPersonId: string
  askedAt: string
  question: string

  // rozsah se určuje PŘED vyhledáním, ne filtrováním odpovědi
  scope: {
    caseFileIds: string[]                 // co je pro tazatele viditelné
    visibilityClasses: Array<'metadata' | 'content'>   // dok. 04 / 12
    crossCaseIncluded: boolean            // dok. 03 sekce 0 → jde do auditu
  }

  retrieved: Array<{ refType: string; refId: string; caseFileId: string | null }>
  answerText: string
  citedRefIds: string[]
  producedDraftId: string | null          // když z dotazu vznikl koncept
}
```

### Pravidla, která tenhle model vynucuje

- **Filtruje se vyhledávání, ne odpověď.** Index nese stejnou třídu viditelnosti jako
  záznam. Co tazatel nesmí vidět, se do kontextu modelu nikdy nedostane. Post-filtrace
  odpovědi je nefunkční obrana — model už ta data viděl a prosákne to formulací.
- **Asistent neprozrazuje ani existenci.** Neříká „k tomu nemáš přístup“, protože i to
  je informace o rodině. Místo toho **na začátku deklaruje svůj rozsah**: *„Odpovídám
  z 12 spisů, které máš přidělené.“* Rozsah je vlastnost relace, ne odpovědi na dotaz.
- **Dotaz na nepřidělený spis je `CROSS_CASE_ACCESS`** (dok. 03 sekce 0) a připisuje
  se do `CaseFileViewLog` (dok. 12) stejně jako otevření spisu. Ptát se asistenta
  nesmí být cesta, jak obejít stopu.
- **Každá odpověď cituje zdroje jako odkazy do spisu.** Odpověď bez zdroje je názor,
  a názor od systému nikdo nechce.
- **Pseudonymizace platí i tady.** Dvoustupňové schéma z dok. 02 se rozšiřuje z diktátu
  na vyhledané úryvky: ven jde text s placeholdery, mapování zpět je lokální.
- **Jen zaměstnanecké aplikace.** V MVP asistent není v aplikaci pěstouna, dítěte ani
  příbuzných. Jiný korpus, jiná rizika, a u dětské aplikace (dok. 08) je to samostatné
  téma, které se nemá řešit mimochodem.
- **Organizace ho může celý vypnout.** Parametrizovatelnost platí i pro asistenta.

### Na co se lidé budou ptát

| Typ dotazu | Nad čím běží | Kdo se smí ptát |
| --- | --- | --- |
| „Kdy jsem byla naposled u Novákových a kdy mi utíká lhůta?“ | metadata vlastních spisů | Klíčová osoba |
| „Kolik hodin vzdělávání zbývá paní Novákové?“ | dopočítané ukazatele | Klíčová osoba |
| „Co říká směrnice o respitu nad 14 dní?“ | `orgPolicy`, sady pravidel | kdokoli z organizace |
| „Kolik dětí máme v respitu tenhle měsíc?“ | agregace nad metadaty | vedení |
| „Shrň mi spis Novákových před předáním kolegyni.“ | obsah jednoho spisu | Klíčová osoba, vedení |
| „Jak jsme na tom se standardem 7?“ | sebehodnocení, dok. 07 | vedení |

Poslední řádek stojí za zmínku zvlášť: **dotaz nad směrnicí a nad zákonem je ta
nejbezpečnější a nejužitečnější část celého asistenta.** Nejsou v něm žádná osobní
data, odpověď je citovatelná ze záznamu a zodpovídá otázky, které dnes Klíčová osoba
řeší telefonátem na vedení. Kdyby se z celého asistenta měla postavit jen jedna věc
jako první, je to tahle.

---

## 5. Kde všude se koncept hodí

| Koncept | Skládá se z | Poznámka |
| --- | --- | --- |
| Zpráva o průběhu PP (6m, na vyžádání, závěrečná) | styky, plány, vzdělávání, respity, události | pěstounovo vyjádření se **nikdy** negeneruje |
| Odpověď na podání úřadu | podání + záznamy spisu | schvaluje vedení (dok. 13) |
| Záznam z návštěvy | diktát | už v dok. 02 |
| Plán 10c / 10d | předchozí plán, dopočty, knihovna vět | knihovna má přednost |
| Shrnutí spisu při předání | celý spis | scénáře odchodu Klíčové osoby, dok. 03 |
| Komentářová část ročního výkazu | agregace | dok. 13 |
| Podklad k sebehodnocení standardu | důkazy ve spisech | dok. 07 |

Dvě věci, které koncept **nikdy** negeneruje:

- **Vyjádření pěstouna ke zprávě** (dok. 05). Je to jeho projev vůle, ne text
  k předvyplnění.
- **Zápis do knihy života dítěte** (dok. 10). To je dokument dítěte, ne organizace.

---

## 6. Zapojení do existujícího modelu

| Místo | Změna |
| --- | --- |
| **nové** | `DocumentDraft`, `DraftRevision`, `IncomingSubmission`, `AssistantQuery` |
| `Document.category` | + `'incoming_authority_letter'` |
| `Document.versions[]` | + `fromDraftId: string \| null` — stopa přežívá do všech verzí |
| `TimelineEntry.refType` (dok. 12) | + `'incoming_submission'`; **koncept v ose není**, dokud není uložený |
| `CaseFileViewLog` (dok. 12) | dotaz asistenta se započítává jako nahlédnutí |
| `MessageThread` (dok. 12) | + `kind: 'registry'` — podatelna, jen zaměstnanci |
| `AuthorityRequest` (dok. 13) | + `incomingSubmissionId` |
| Nastavení organizace | asistent zap/vyp, upozornění na mezery zap/vyp, model a region |

Poznámka k časové ose: **koncepty do ní nepatří.** Osa je záznam toho, co se stalo,
ne toho, co si někdo nechal navrhnout. Do osy jde až uložený dokument — stejná úvaha,
kvůli které v ní nejsou výdaje (dok. 12 sekce 9).

---

## 7. Provoz, náklady a hranice

- **Asistent je online-only.** Terénní zápis zůstává offline-first (dok. 02) a
  knihovna vět je jeho offline náhrada. Koncept se v terénu bez signálu nevygeneruje
  a to je v pořádku — koncept není nic, co by muselo vzniknout hned.
- **Model je připnutý na verzi** a verze se ukládá ke konceptu. Změna modelu nemění
  nic zpětně, protože koncepty jsou uložený text, ne odkaz na výpočet.
- **Podmínky z dok. 02 platí beze změny**: zpracovatelská smlouva, EU lokalita,
  vyloučené trénování na datech, retence, záznam každého volání v auditu (`AiUsageLog`
  s tazatelem, účelem, počtem tokenů a modelem — kvůli nákladům i kvůli GDPR).
- **Systém nic neodesílá ven.** Ani odpověď úřadu, ani zprávu. Připraví a zaznamená
  doručení; odesílá člověk. Beze změny oproti dok. 05 a 13.

---

## 8. Rozsah pro MVP

| Položka | MVP |
| --- | --- |
| Koncept zprávy o průběhu PP do editoru + auditní stopa úprav | **ano** |
| Editovatelnost dokumentu po uložení (verze) | **ano** — už v dok. 12 |
| Podatelna: dopis → OCR → návrh `AuthorityRequest` → koncept odpovědi | **ano** |
| Asistent nad předpisy, směrnicemi a standardy (bez osobních dat) | **ano** — první |
| Asistent nad vlastními spisy (metadata + dopočty) | **ano** |
| Asistent nad obsahem spisů | ano, s citacemi a logováním |
| Agregační dotazy pro vedení | později |
| Koncepty plánů 10c/10d | později — knihovna vět stačí |
| Asistent v aplikaci pěstouna, dítěte, příbuzných | **ne** |

---

## 9. Co je potřeba rozhodnout

1. **Smí asistent při dotazu sáhnout i do nepřidělených spisů?** Podle dok. 03 je
   hranicí organizace a nepřidělený spis je dostupný se stopou. U asistenta to ale
   znamená, že se do kontextu dostanou rodiny, které tazatel neřeší, aniž by o to
   výslovně požádal. Navrhuji **výchozí rozsah = moje spisy**, s vědomým přepnutím
   „hledat v celé organizaci“, které se loguje.
2. **Má se koncept generovat sám, jakmile se blíží lhůta zprávy, nebo až na vyžádání?**
   Navrhuji **až na vyžádání** — automatické generování by vyrobilo hromadu textu,
   který nikdo nečetl, a to je přesně to, co koncept nemá být.
3. **Jak dlouho se drží `proposedText`?** Navrhuji **stejně jako dokument** — je to
   součást doložení autorství, ne provozní mezivýsledek.
