# Datový model — Firestore

Konsolidace ~60 rozhraní z `docs/doprovazeni/01`–`19` do jednoho modelu.
Technologie a její důsledky: `docs/doprovazeni/19-technologie-prihlaseni-naklady.md`.

Tenhle balíček je **jen typy a cesty** — žádné závislosti, žádný běhový kód.
Klient i Cloud Functions z něj importují stejné tvary.

```
schema/
├── src/
│   ├── common.ts        sdílené typy, auditní pole, měny, id
│   ├── platform.ts      platform/*  — sady pravidel, standardy, ceník
│   ├── org.ts           orgs/{org}  — organizace, členství, směrnice, předplatné
│   ├── people.ts        osoby, děti, zařízení, zájemci
│   ├── agreements.ts    dohody, umístění, souhlasy a vyjádření ORP, vzdělávací období
│   ├── casefile.ts      spis, časová osa, obsahové záznamy
│   ├── documents.ts     dokumenty, verze, index, koncepty, logy
│   ├── obligations.ts   lhůty vůči rodině a vůči úřadům
│   ├── authorities.ts   zprávy, podání, výkazy, žádosti úřadů
│   ├── work.ts          úkoly, vlákna, zprávy
│   ├── assistant.ts     Eli — dotazy, akce, paměť
│   └── paths.ts         cesty ke kolekcím na jednom místě
├── firestore.rules
└── firestore.indexes.json
```

---

## 1. Pět pravidel, ze kterých tvar modelu vyplývá

### 1.1 Nájemcem je organizace a je v cestě

Všechno kromě platformních číselníků žije pod `orgs/{orgId}/…`. Multi-tenancy tak není
podmínkou v každém dotazu, ale **vlastností cesty** — dotaz mimo svou organizaci nejde
ani napsat.

### 1.2 Role jsou v tokenu, ne v databázi

Bezpečnostní pravidla nesmí sahat `get()` na členství — každé takové sáhnutí je
**platba za čtení při každém dotazu** (dok. 19 sekce 1). Role proto žijí ve
**vlastních nárocích tokenu** (custom claims):

```
{ orgs: { "org_abc": "key_worker" }, sa: true? }
```

Nastavuje je Cloud Function při změně `OrgMembership`. Pravidla jsou pak čistě
výpočet nad tokenem a cestou, bez jediného čtení.

### 1.3 Metadata a obsah jsou dvě různá místa

Firestore neumí skrýt pole (dok. 04, potvrzeno v dok. 19). Oddělení proto **není
volba, ale struktura**:

| Co | Kde | Kdo čte |
| --- | --- | --- |
| spis — hlavička, počty, nejbližší lhůta | `caseFiles/{id}` | každý člen organizace |
| obsahové záznamy — zápisy, kontakty, poznámky | `caseFiles/{id}/entries/{id}` | jen role s přístupem k obsahu |
| osoba — jméno, rod, role | `persons/{id}` | každý člen organizace |
| kontaktní údaje osoby | `persons/{id}/private/contact` | jen role s přístupem ke kontaktům |

Kdyby kontakt byl polem osoby, nešel by skrýt komukoli, kdo osobu smí číst — a
dodělávat to později by znamenalo migraci každého záznamu v každém spisu.

### 1.4 Každá obrazovka je jeden dotaz

Skutečné riziko není technologie, ale **počet čtení** (dok. 19). Proto:

- **Zobrazované jméno se denormalizuje** na záznam (`subjectDisplayName`), aby seznam
  nemusel dočítat osoby.
- **Ukazatele jsou uložené, ne dopočítané.** `CaseFile.nextDueOn`, `openObligations`,
  `childCount` píše Cloud Function při změně. Dashboard je tak jeden dotaz, ne
  N+1 čtení.
- **Lhůty jsou vlastní dokumenty** (`obligations`), aby „co mi utíká“ byl jeden
  indexovaný dotaz přes celou organizaci.
- **Časová osa je tenký index** (dok. 12) — malý dokument s odkazem, ne kopie obsahu.

### 1.5 Nic se nemaže

Žádné pravidlo nikde nepovoluje `delete` — ani vlastníkovi, ani `org_admin`.
Zrušení je vždy **nový stav nebo storno záznam** (dok. 10, dok. 16). Jediná výjimka
je skartační řízení, které běží v Cloud Function pod dohledem `superadmin`
a ruší dokument **i jeho index** (dok. 17).

---

## 2. Strom kolekcí

```
platform/registry                      kontejner — cesta k dokumentu musí mít
  ├─ legalRulesets/{rulesetId}         sudý počet částí, proto ten mezistupeň
  ├─ standardTemplates/{templateId}    Příloha 2 — 16 standardů, 30 kritérií
  ├─ authorities/{code}                ORP, krajské úřady, soudy — společné všem
  ├─ sentenceTemplates/{id}            výchozí knihovna vět
  ├─ documentTemplates/{id}            vzory zpráv, plánů, dohody
  ├─ pricingRulesets/{id}              ceník jako datovaná série
  └─ countries/{code}                  příprava na jiné státy (dok. 00 C2)

transfers/{transferCode}               Předávací kód — jediná mezi-org kolekce
                                       zapisuje pouze Cloud Function

orgs/{orgId}
  ├─ (dokument organizace)
  ├─ members/{personId}                OrgMembership + úvazek + agendy
  ├─ subscription/current              předplatné
  ├─ wallet/current                    kredit na AI
  ├─ policies/{policyId}               směrnice jako orgPolicy, verzované
  ├─ standards/{standardId}            přijaté standardy + sebehodnocení
  ├─ sentences/{id}                    knihovna vět organizace
  ├─ checklists/{id}                   šablony checklistů
  ├─ settings/{scope}                  parametry, vypínače, persona Eli
  ├─ persons/{personId}
  │    └─ private/contact              kontaktní údaje (oddělené)
  │    └─ devices/{deviceId}           zařízení pro podpis a push
  ├─ children/{childId}
  │    └─ private/contact
  ├─ inquiries/{inquiryId}             zájemci a odmítnutí (§ 48a odst. 1 d)
  ├─ agreements/{agreementId}
  │    └─ placements/{placementId}     umístění dětí, časové
  │    └─ educationPeriods/{periodId}  klouzavá 12měsíční období
  ├─ caseFiles/{caseFileId}            METADATA
  │    ├─ entries/{entryId}            OBSAH — kontakty, zápisy, výdaje, respity
  │    ├─ timeline/{entryId}           tenký index
  │    ├─ documents/{documentId}
  │    │    └─ index/{versionNo}       extrahovaný text
  │    │         └─ chunks/{n}         vektory pro hledání
  │    ├─ drafts/{draftId}
  │    │    └─ revisions/{n}           auditní stopa úprav
  │    ├─ reports/{reportId}
  │    └─ threads/{threadId}
  │         └─ messages/{messageId}
  ├─ obligations/{obligationId}        lhůty vůči rodině — plochá kolekce
  ├─ mandateObligations/{id}           lhůty vůči úřadům
  ├─ authorityRequests/{id}            žádosti úřadů o údaje
  ├─ submissions/{id}                  podatelna
  ├─ registryReturns/{year}            roční výkaz § 49c odst. 4
  ├─ tasks/{taskId}                    plochá kolekce — „moje úkoly“ jeden dotaz
  ├─ assistant/{sessionId}
  │    └─ turns/{turnId}
  ├─ memory/{memoryId}                 co si Eli pamatuje
  └─ audit/{auditId}                   append-only, nikdy update ani delete
```

### Proč jsou `obligations` a `tasks` ploché

Kdyby byly pod spisem, dotaz „co mi utíká napříč rodinami“ by musel projít každý spis.
Plochá kolekce s indexem na `assigneeId + status + dueOn` je jeden dotaz. Cenu za to
platíme denormalizací (`caseFileId`, `subjectDisplayName` na každé lhůtě) a je to
správná výměna.

### Proč je `entries` jedna kolekce a ne pět

Časová osa a spis se čtou chronologicky přes všechny druhy záznamů. Pět kolekcí by
znamenalo pět dotazů a slučování na klientu. Jedna kolekce s rozlišovačem `kind`
je jeden dotaz — a Firestore stejně nemá schéma, které by nám za pět kolekcí něco
dalo.

---

## 3. Konvence

| Věc | Pravidlo |
| --- | --- |
| Peníze | vždy **minor units** (haléře) v `…Minor: number` + `currency` |
| Datum bez času | `'YYYY-MM-DD'` jako string — lhůty se počítají v kalendářních dnech |
| Datum s časem | ISO 8601 s offsetem; `Timestamp` jen tam, kde se řadí |
| Opakující se datum v roce | `'--MM-DD'` (jako v dok. 02) |
| Id | string, generuje Firestore; nikdy nenese význam |
| Enum | sjednocení stringů, nikdy číslo — čitelné v konzoli |
| Chybějící údaj | `null`, nikdy prázdný string; **prázdno je platný stav** (dok. 16) |
| Autor | `createdByPersonId` je **vždy člověk**; AI je v `via` (dok. 14) |
| Verzování | nová verze je nový podřízený dokument, nikdy přepis |

Každý zápisový dokument nese `AuditFields` z `common.ts`. `via` říká, jestli záznam
vznikl v UI, přes Eli, importem nebo z offline fronty — bez toho nejde odpovědět na
otázku „kolik ze spisu vzniklo přes asistenta“ (dok. 15).

---

## 4. Co tady ještě není

| Chybí | Kde na to dojde |
| --- | --- |
| Obrazovky a dotazy k nim | až bude soupis obrazovek (dok. 00 B5) |
| Limity čerpání SPVPP § 5c | odloženo; pole `rightCode`, `rulesetId`, `paymentRoute` připravená |
| Skartační lhůty | čeká na skartační plán (dok. 00 sekce 3) |
| Dětská aplikace — přihlášení | dok. 19 sekce 5 |
| Notifikace | ad-hoc při stavbě (dok. 18) |
