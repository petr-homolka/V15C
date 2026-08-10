# 17 — Eli: učení, práce s dokumenty a jméno

> Navazuje na [14](./14-interni-asistent-koncepty-a-podatelna.md),
> [15](./15-chat-jako-ustredni-nastroj.md) a řídí se
> [chartou 16](./16-charta-chovani-partner.md).
> Tři témata: **jak se asistent zlepšuje**, **jak čte dokumenty** a **jak se jmenuje**.

---

## 1. Jméno

**Výchozí jméno je Eli.** Je krátké, dobře se vyslovuje, funguje jako oslovení
(„Eli, kdy se musím stavit u Nováků?“) i jako zmínka ve vláknu (`@Eli`).

```ts
assistantPersona: {
  name: 'Eli'                       // organizace si může přejmenovat
  grammaticalGender: 'f'            // kvůli češtině: „Eli navrhla“, ne „navrhl“
  avatarRef: string | null
}
```

Gramatický rod tam musí být ze stejného důvodu jako u osob (dok. 07): české texty se
skloňují a „Eli navrhl“ vypadá nedbale. Organizace si jméno může změnit — tón ne, ten
je daný chartou.

### Kde jméno smí být a kde ne

| Smí | Nesmí |
| --- | --- |
| v chatu, v nabídkách, v tlačítkách | jako **autor dokumentu** — autorem je vždy člověk (dok. 14) |
| ve vláknu mezi zaměstnanci (`@Eli`) | ve vláknu, kde je pěstoun, dítě nebo příbuzný |
| v nápovědě a onboardingu | v čemkoli, co odchází ven ze systému |
| v auditu jako `via: 'assistant'` | jako odesílatel zprávy — zprávy posílají lidé |

**Eli se nikdy nevydává za člověka.** Zpráva, kterou napsala, jde pěstounovi pod jménem
Klíčové osoby, protože ji Klíčová osoba odeslala. Kdyby Eli komunikovala navenek sama,
byla by to jiná služba s jinými pravidly.

### Jedna past, kterou jméno přináší

Když má chat jméno, lidé mu začnou věci **říkat místo zapisování** — *„vždyť jsem to
říkal Eli“*. Jenže chat není spis (dok. 15 sekce 5d). Proto: **když někdo Eli sdělí
fakt o rodině, Eli nabídne, že ho zapíše.** Jedním klepnutím, bez poučování.

```
Ty:  Nováková mi říkala, že Honza mění školu od září.
Eli: Poznamenáno v konverzaci. Uložit do spisu Novákových jako poznámku?
     [ uložit ]  [ nechat jen tady ]
```

To je přesně ten partnerský tah: nepoučuje, že „konverzace není spis“, ale nabídne
řešení a nechá rozhodnout.

---

## 2. Práce s dokumenty

### 2.1 Když někdo hodí dokument do chatu

Dvě cesty, obě musí fungovat.

**A. Bez pokynu** — Eli dokument přečte a rovnou udělá tu bezpečnou část (uloží ho),
zbytek nabídne:

```
[PDF] Vyrozumění OkS Teplice, sp. zn. 12 P 45/2026

Eli: Uloženo do dokumentů · Novákovi.
     Rozpoznáno: Okresní soud v Teplicích · sp. zn. 12 P 45/2026 ·
     jednání 3. 10. 2026 v 9:00 · žádost o zprávu do 20. 9. 2026

     [ zapsat jednání do kalendáře ]  [ založit lhůtu 20. 9. ]
     [ koncept zprávy pro soud ]      [ přiřadit k jinému spisu ]
```

Podle charty: uložení proběhne (to je smysl toho, že mi někdo dokument poslal),
zbytek jsou nabídky. Nic nebliká, nic se nevnucuje.

**B. S pokynem** — *„Eli, ulož to Novákům a udělej koncept odpovědi“* — Eli to udělá
a ukáže výsledek s *Vrátit zpět*.

Rozpoznané údaje se ukazují **jako pole s možností přepsat**, ne jako tvrzení. U data
a spisové značky je vidět úryvek, ze kterého to přečetla (dok. 14 sekce 3) — u skenu
je to důležitější než u čistého PDF.

### 2.2 Každý dokument v systému je čitelný pro dotazy

Tohle je ta podstatná změna oproti dok. 14, kde asistent uměl odpovídat nad **záznamy**.
Nově musí umět odpovídat i nad **obsahem nahraných dokumentů** — smlouvy, rozsudky,
certifikáty, lékařské zprávy, staré zápisy z jiné organizace.

```ts
interface DocumentIndex {
  documentId: string
  versionNo: number                   // index patří ke KONKRÉTNÍ verzi
  caseFileId: string | null           // dědí se z dokumentu
  visibilityClass: 'metadata' | 'content'   // dědí se — dok. 04

  status: 'queued' | 'extracted' | 'indexed' | 'failed' | 'skipped'
  method: 'pdf_text_layer' | 'ocr' | 'none'
  language: string | null

  pages: Array<{
    pageNo: number
    text: string
    ocrConfidence: number | null      // null u textové vrstvy
  }>

  detected: {
    docTypeGuess: string | null
    authority: string | null
    fileRef: string | null            // sp. zn. / č. j.
    dates: Array<{ value: string; role: string | null; snippet: string }>
    amounts: Array<{ minor: number; currency: string; snippet: string }>
    legalRefs: string[]
    personNameHits: string[]          // jen pro přiřazení ke spisu, lokálně
  }

  chunks: Array<{ chunkNo: number; pageFrom: number; pageTo: number }>
  indexedAt: string
  indexVersion: string                // aby šlo přeindexovat po zlepšení postupu
}
```

**Běží to na pozadí při nahrání** a u dokumentů z terénu až po synchronizaci outboxu
(dok. 02). Nahrání na nic nečeká.

### 2.3 Sedm věcí, které z toho plynou a nejsou samozřejmé

**1. Index dědí viditelnost dokumentu.** Kdyby index žil vedle, obešel by se jím celý
model oprávnění z dok. 04 a 14 — text ze spisu by se dal najít, aniž by byl přístupný
spis. Index je proto **součástí dokumentu**, ne samostatnou sbírkou.

**2. Index patří ke konkrétní verzi.** Dokumenty se verzují a nikdy nepřepisují
(dok. 12). Odpověď opřená o starou verzi smlouvy by byla nepravdivá, aniž by to bylo
poznat. Nová verze = nový index; ten starý zůstává s ní.

**3. Skartace musí smazat i index.** Dok. 10 říká, že se nic nemaže a skartace je
samostatná auditovaná procedura. Kdyby po skartaci zůstal index, dokument by byl dál
dohledatelný a skartace by byla jen naoko. **Skartační řízení proto ruší dokument
i jeho index jedním úkonem.**

**4. Ne všechno se indexuje.** Kniha života dítěte (dok. 10) je dokument dítěte, ne
organizace — `indexable: false`. Eli do ní nevidí, nečte ji a neodpovídá z ní. Totéž
pro cokoli, co dítě označí jako soukromé v dětské aplikaci (dok. 08).

**5. Skeny se citují včetně stránky a řeknou, že jsou skeny.** Odpověď z OCR nese
`dokument · str. 3` jako odkaz a u nízké spolehlivosti dodá jednu větu: *„z naskenovaného
dokumentu, text nemusí být přesný“*. Není to varování, je to údaj — charta to dovoluje.

**6. Staré dokumenty se doindexují dávkou.** Organizace, která přichází s archivem
(dok. 09 doporučuje historii přiložit jako dokumenty, ne migrovat), dostane indexaci
na pozadí. Do jejího dokončení Eli **říká, kolik toho ještě nepřečetla** — jinak by
tiše odpovídala z poloviny archivu.

**7. Náklady se dají řídit po vrstvách.** Textová vrstva PDF je skoro zadarmo, OCR
skenů stojí, sémantický index stojí nejvíc. Každá vrstva je proto samostatně
zapínatelná na úrovni organizace. Výchozí stav: text a OCR ano, sémantický index ano —
ale organizace ho může vypnout a Eli pak hledá fulltextem.

### 2.4 Co Eli s dokumentem umí

| Pokyn | Výsledek |
| --- | --- |
| „ulož to k Novákům“ | zařazení do spisu, kategorie navržená |
| „co po nás chtějí a do kdy?“ | shrnutí s citací stránky |
| „udělej koncept odpovědi“ | editor (dok. 14) |
| „zapiš to jednání do kalendáře“ | událost |
| „založ na to lhůtu“ | `AuthorityRequest` / `Obligation` |
| „porovnej to s dohodou“ | rozdíly proti dokumentu ve spisu |
| „najdi mi rozsudek o svěření Kláry“ | hledání napříč dokumenty spisu |
| „je v té zprávě něco o škole?“ | odpověď s odkazem na stránku |
| „přejmenuj to a dej to pod certifikáty“ | úprava metadat |

---

## 3. Jak se Eli zlepšuje

Tady je potřeba být přesný, protože „učí se“ znamená čtyři různé věci a jen některé
jsou v tomhle systému možné.

### 3.1 Pravidlo, které to celé drží

> **Eli se učí daty, ne modelem.** Model se netrénuje na ničem, co je v systému.
> Mění se jen to, **co dostane v kontextu** a **v jakém pořadí co nabízí**.

Důvod není opatrnost, ale zadání: data v systému jsou zvláštní kategorie podle čl. 9
GDPR a trénování je vyloučené ve zpracovatelské smlouvě (dok. 02). Navíc má datové
učení tři praktické výhody: jde **vidět**, jde **vrátit** a **nepřelije se** mezi
organizacemi.

### 3.2 Z čeho se učí

| Signál | Co se z něj stane | Kde to je |
| --- | --- | --- |
| **Úprava návrhu před uložením** | nejsilnější signál — co člověk přepsal, se příště navrhne jinak | `DraftRevision`, `payloadAtConfirm` |
| Zamítnutá nabídka akce | ta nabídka klesne v pořadí | `AssistantAction.status` |
| Opakovaně ručně dopsaná věta | nabídne se uložit do knihovny vět organizace | dok. 07 |
| Oprava kategorie dokumentu | zlepší zařazování dalších podobných | `DocumentIndex.detected` |
| Oprava rozpoznané entity | vznikne **alias** („Nováci“ → ROD-2026-001) | níže |
| Četnost použití věty | řazení nabídek | `SentenceTemplate.usageCount` |
| Trvale měněná výchozí hodnota | nová výchozí hodnota pro toho člověka | níže |

**Z přijetí se učí málo, z úprav hodně.** Kdo odklepává bez čtení, dává slabý signál;
kdo něco přepsal, dal silný. Kdyby se systém učil hlavně z přijetí, naučil by se
odklepnutou chybu — a tenhle rozdíl je při implementaci snadné přehlédnout.

### 3.3 Paměť, do které je vidět

Naučené věci nesmějí být skrytý stav. Jsou to záznamy, které jde přečíst, změnit
a zrušit:

```ts
interface AssistantMemory {
  scope: 'person' | 'organization'
  ownerId: string
  kind: 'alias' | 'default_value' | 'preference' | 'fact' | 'phrase'
  key: string                        // 'family.alias.Nováci' | 'visit.duration'
  value: unknown
  origin: 'learned' | 'stated'       // odvozené vs. řečené („pamatuj si, že…“)
  evidenceCount: number
  firstSeenAt: string; lastUsedAt: string
  active: boolean                    // vypnutí je storno, ne mazání (dok. 10)
}
```

V UI to je jedna obrazovka **„Co si Eli pamatuje“** se seznamem vět v lidském jazyce:

```
Návštěvy ti trvají 1,5 h            naučeno z 12 zápisů      [ zapomenout ]
„Nováci“ = Novákovi, ROD-2026-001   naučeno                  [ zapomenout ]
Výdaje zapisuješ i s DPH            řekl jsi 12. 6.          [ zapomenout ]
```

A hlavně: **naučená hodnota se v kartě přiznává.** `délka 1,5 h — podle tvých
předchozích zápisů`. Bez toho by systém tiše měnil chování a nikdo by nevěděl proč —
to je přesně to, co lidi na „chytrých“ systémech nesnášejí.

`origin: 'stated'` znamená, že to Eli někdo řekl přímo: *„Eli, pamatuj si, že
u Svobodových jezdím vždycky odpoledne.“* To je nejjednodušší a nejsrozumitelnější
způsob učení a stojí za to ho mít hned.

### 3.4 Hranice učení

- **Nepřelévá se mezi organizacemi.** Multi-tenancy platí i pro paměť. Co se Eli naučí
  u jedné organizace, nikde jinde nepoužije.
- **Nepřelévá se mezi lidmi bez souhlasu.** Osobní zvyklosti jsou osobní; do
  organizační paměti se povyšují jen vědomě (vedení, nebo autor sám).
- **Neučí se fakta o rodinách.** Fakta patří do spisu, ne do paměti asistenta.
  `kind: 'fact'` je vyhrazený pro provozní věci („u Svobodových se parkuje za domem“),
  ne pro nic o dítěti nebo jeho zdraví.
- **Nikdy se neučí z toho, co pracovník neviděl.** Signál vzniká z lidského úkonu,
  ne z automatu.
- **Jde to celé vypnout** — na úrovni organizace i jednotlivce, jako všechno ostatní
  (charta, dok. 16).

### 3.5 Zlepšování platformy

Nad organizacemi zůstává jedna vrstva, kterou spravuje SuperAdmin ručně: **výchozí
knihovna vět, výchozí pravidla zařazování dokumentů a výchozí nabídky akcí.** Zlepšují
se z **neosobních** podnětů — třeba že se kategorie „usnesení soudu“ opravuje na
„rozsudek“ v každé druhé organizaci. Žádný text ze spisu, žádná osobní data, žádný
automatický přenos. Organizace novou výchozí sadu **přebírá vědomě**, stejně jako
sady pravidel a standardy (dok. 07).

---

## 4. Zapojení do modelu

| Místo | Změna |
| --- | --- |
| **nové** | `DocumentIndex`, `AssistantMemory`, `assistantPersona` |
| `Document` | + `indexable: boolean`, + `indexStatus` |
| Skartace (dok. 10) | ruší dokument **i index** jedním úkonem |
| `MessageThread` (dok. 12) | `@Eli` funguje jen v interních vláknech |
| `AssistantAction` (dok. 15) | + `memoryRefs: string[]` — co se na návrhu podílelo |
| Nastavení organizace | jméno a avatar Eli; vrstvy indexace; učení zap/vyp |
| Nastavení pracovníka | „Co si Eli pamatuje“ — číst, upravit, zapomenout |

---

## 5. Rozsah pro MVP

| Schopnost | MVP |
| --- | --- |
| Jméno a persona (výchozí Eli, přejmenovatelná) | **ano** |
| Dokument do chatu → přečtení → uložení + nabídky | **ano** |
| Dokument do chatu s pokynem | **ano** |
| Indexace textové vrstvy PDF při nahrání | **ano** |
| OCR skenů na pozadí | **ano** |
| Odpovědi nad dokumenty s citací stránky | **ano** |
| Dávkové doindexování archivu + „kolik ještě nepřečteno“ | **ano** |
| Paměť `origin: 'stated'` („Eli, pamatuj si…“) | **ano** |
| Aliasy entit | **ano** |
| Obrazovka „Co si Eli pamatuje“ | **ano** — bez ní je učení skryté chování |
| Učení z úprav konceptů (návrh vět do knihovny) | později |
| Učení výchozích hodnot z opakovaných oprav | později |
| Sémantické vyhledávání napříč archivem | později; fulltext v MVP |
| Zlepšování platformních výchozích sad | později, ručně |

---

## 6. Co se tím mění jinde

| Dokument | Změna |
| --- | --- |
| 09 | historický archiv se nemigruje, ale **je čitelný** — indexuje se |
| 10 | skartace zahrnuje index; kniha života se neindexuje |
| 12 | dokument dostává index vázaný na verzi |
| 14 | asistent odpovídá i nad obsahem dokumentů, nejen nad záznamy |
| 15 | chat má jméno; přijetí faktu v konverzaci nabídne zápis do spisu |
