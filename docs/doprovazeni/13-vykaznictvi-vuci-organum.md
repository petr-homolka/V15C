# 13 — Výkaznictví vůči orgánům: co bylo pokryté a co chybělo

> Odpověď na otázku, jestli je v návrhu **generování pravidelných reportů pro OSPOD
> a jiné orgány**. Krátká odpověď: **jeden ano, zbytek ne.** Tenhle dokument doplňuje
> ten zbytek.

---

## 0. Stav před tímhle dokumentem

| Výstup | Adresát | Pokryto? | Kde |
| --- | --- | --- | --- |
| **Zpráva o průběhu výkonu PP** — 1×/6 měsíců a při zániku dohody | pěstoun + ORP pěstouna + ORP dítěte | **✓ podrobně** | dok. 01, 02, 05, 11, 12 |
| Reporty pro účetní — 4 dimenze, plánované i ad-hoc | dovnitř organizace | **✓** | dok. 07 sekce 4 |
| Přehled čerpání SPVPP k 31. 3. | ÚP ČR | ✓ jako surový export | dok. 07 |
| **Roční výkaz do registru pověřených osob** (§ 49c odst. 4) | krajský úřad → MPSV | **✗ chybí** | — |
| **Zobecněné údaje na výzvu KÚ do 8 dnů** (§ 49c odst. 5) | krajský úřad | **✗ chybí** | — |
| **Údaje na výzvu orgánu SPOD** (§ 53 odst. 1 písm. e) | OSPOD, soud, policie, SZ | **✗ chybí** | — |
| **Zpráva mimo šestiměsíční cyklus** (na vyžádání OSPOD nebo soudu) | OSPOD / soud | **✗ chybí** | — |
| **Oznámení změn rozhodných pro pověření** (§ 48a odst. 1 písm. a) | KÚ, který vydal pověření | **✗ chybí** | — |
| **Kopie pojistné smlouvy do 15 dnů** (§ 48a odst. 3) | KÚ, který vydal pověření | **✗ chybí** | — |
| **Opatření uložená kontrolou** (§ 49b odst. 3) | kontrolní orgán | **✗ chybí** | — |

Sedm chybějících položek má společnou vlastnost, kvůli které je nešlo přehlédnout jen
tak: **všechny nesou lhůtu** a u tří z nich je sankcí za nesplnění odnětí pověření
(§ 50 odst. 1 písm. c) a g). Celá dosavadní práce s lhůtami přitom končila na hranici
spisu — motor lhůt v dok. 11 zná jen povinnosti vůči rodině. **Povinnosti organizace
vůči úřadu v modelu neexistovaly.**

Rozdíl je i věcný, ne jen výčtový. Zpráva podle § 47b odst. 5 je **výstup ze spisu**:
jmenná, o jedné rodině, s obsahem. Výkazy podle § 49c jsou **zobecněné údaje za celou
organizaci** — bez jmen, agregované, pro analytickou činnost ministerstva. To jsou dva
různé režimy oprávnění, dvě různé cesty ven ze systému a nemá je generovat tentýž kód.

---

## 1. Zpráva o vyžádání — chybějící třetí druh zprávy

`Report.kind` má dnes `periodic_6m | on_termination`. V praxi je nejčastější třetí:
OSPOD nebo soud si vyžádá zprávu **mimo cyklus**, typicky před jednáním o poměrech
dítěte nebo při prodlužování pěstounské péče na přechodnou dobu.

```ts
kind: 'periodic_6m' | 'on_termination' | 'on_request'
```

U `on_request` platí jinak dvě věci:

- **Lhůtu neurčuje zákon, ale žádost.** `dueOn` se opisuje z výzvy, nedopočítává se.
- **Nevynuluje šestiměsíční cyklus.** Zpráva na vyžádání v srpnu neposouvá řádnou
  zprávu ze září. Kdyby ji motor lhůt počítal jako „poslední zprávu“, organizace by
  legálně vypadla z cyklu. Proto `resetsPeriodicCycle: false` natvrdo u tohoto druhu.

Zbytek workflow je stejný — včetně **seznámení pěstouna a jeho práva se vyjádřit**
(dok. 05). To právo se neváže na druh zprávy, ale na to, že je o něm zpráva psána.

---

## 2. Roční výkaz do registru pověřených osob — § 49c odst. 4

> „Pověřená osoba, která je zapsána v registru, je povinna údaje … **za kalendářní rok
> sdělovat krajskému úřadu prostřednictvím elektronického systému na tiskopisu
> předepsaném ministerstvem, a to do 30. června** kalendářního roku, který následuje
> po kalendářním roce, za který jsou údaje sdělovány.“

Obsah podle téhož odstavce:

| Blok | Zdroj v systému | Máme? |
| --- | --- | --- |
| Kapacita | nastavení organizace | doplnit pole |
| Materiální a technické zabezpečení | nastavení organizace | doplnit |
| Personální zabezpečení | `OrgMembership` + úvazky (dok. 03) | **✓ máme** |
| Zobecněné údaje o žadatelích | — | podle rozsahu pověření |
| Zobecněné údaje o osobách, kterým je SPOD poskytována | spisy, dohody, děti | **✓ máme** |
| **Osoby, se kterými nemohla být uzavřena smlouva** podle § 48a odst. 1 písm. d) | — | **✗ nemáme vůbec** |

Poslední řádek je ten podstatný nález. **Systém dnes neví o nikom, kdo se klientem
nestal.** Spis vzniká až uzavřením dohody. Jenže výkaz se ptá právě na odmítnuté —
a zákon dovoluje odmítnout jen ze tří důvodů:

```ts
interface ServiceInquiry {          // ZÁJEMCE — existuje před spisem a nezávisle na něm
  organizationId: string
  receivedOn: string
  channel: 'phone' | 'email' | 'in_person' | 'referral_ospod' | 'other'
  inquirerRef: { kind: 'unregistered'; displayName: string }   // minimum údajů
  requestedScope: string

  outcome: 'agreement_concluded' | 'refused' | 'withdrew' | 'referred_elsewhere' | 'open'
  agreementId: string | null

  // § 48a odst. 1 písm. d) — jiný důvod odmítnutí zákon nezná
  refusalReason: null
    | 'out_of_mandate'        // 1. neposkytuje tu činnost / mimo rozsah pověření
    | 'capacity'              // 2. nedostatečná kapacita
    | 'terminated_within_6m'  // 3. téže osobě vypověděl smlouvu před méně než 6 měsíci
  refusalNote: string | null
  refusalCommunicatedOn: string | null
}
```

Tři poznámky k tomu, proč to takhle a ne jinak:

1. **Zájemce není osoba v systému.** Zakládat plnohodnotný profil někomu, kdo jen
   zavolal, by bylo zpracování osobních údajů bez právního titulu. Proto
   `inquirerRef.kind: 'unregistered'` a jen jméno; teprve při uzavření dohody vzniká
   profil a `ServiceInquiry` se na něj naváže.
2. **Kapacita musí být číslo, ne pocit.** Odmítnutí „pro kapacitu“ je ve výkazu
   sledovaná položka a při kontrole se porovnává s kapacitou v registru. Organizace
   tedy potřebuje mít kapacitu nastavenou a systém jí ukazovat obsazenost — jinak nemá
   čím to odmítnutí doložit.
3. **Odmítnutí se nemaže** — jako všechno ostatní (dok. 10). Oprava je nový záznam.

```ts
interface AnnualRegistryReturn {
  organizationId: string
  year: number                          // rok, ZA který se vykazuje
  dueOn: string                         // vždy YYYY+1-06-30
  status: 'draft' | 'submitted' | 'corrected'
  submittedOn: string | null
  submissionChannel: 'kú_electronic_system'      // tiskopis MPSV, ne náš formát
  figures: Record<string, number | string>       // vypočtené hodnoty
  computedAt: string
  snapshotDocumentId: string            // PDF toho, co bylo odesláno — kvůli kontrole
}
```

**Systém výkaz neodesílá.** Podává se elektronickým systémem kraje na tiskopisu
předepsaném ministerstvem — což je cizí formulář, jehož podobu neřídíme a která se
mění. Systém spočítá čísla, ukáže je k opsání nebo exportuje, a uloží snímek toho, co
bylo podáno. Pokus o strojové plnění cizího formuláře by byl ta nejkřehčí věc v celé
aplikaci.

---

## 3. Zobecněné údaje na výzvu KÚ — § 49c odst. 5

> „…sdělit krajskému úřadu na jeho výzvu zobecněné údaje o počtu osob, kterým poskytuje
> sociálně-právní ochranu, a to **ve lhůtě do 8 dnů** ode dne doručení žádosti, pokud
> krajský úřad neurčí lhůtu delší.“

Osm dní je krátká lhůta a týká se údaje, který systém umí spočítat okamžitě. Řeší se
tedy jako **tlačítko, ne jako projekt**: `AuthorityRequest` s `kind: 'aggregate_counts'`
a jedním předpočítaným přehledem k datu. Důležité je jen to, aby šlo doložit, **k jakému
dni** čísla platila — proto se ukládá snímek, ne dotaz.

---

## 4. Žádosti orgánů o údaje ze spisu — § 53 odst. 1 písm. e)

> Na výzvu orgánů sociálně-právní ochrany jsou … **pověřené osoby** … povinny sdělit
> **bezplatně** údaje potřebné podle tohoto zákona pro poskytnutí sociálně-právní
> ochrany…

A proti tomu stojí § 57 odst. 2: povinnost mlčenlivosti **platí obdobně i pro pověřené
osoby**. Vydání údajů ven tedy vždycky potřebuje titul — a ten je potřeba mít zapsaný,
ne odhadnutý zpětně.

```ts
interface AuthorityRequest {
  organizationId: string
  caseFileId: string | null            // null u zobecněných dotazů (sekce 3)

  requester: {
    kind: 'ospod' | 'kraj_ky' | 'court' | 'police' | 'prosecutor'
        | 'labour_office' | 'ombudsman' | 'other'
    authorityId: string | null
    fileRef: string | null             // jejich jednací číslo
  }
  legalBasis: string                   // § 53 odst. 1 písm. e), § 128 o.s.ř., …
  receivedOn: string
  dueOn: string | null                 // z výzvy, ne dopočítané
  requestedScope: string

  decision: 'provided' | 'partially_provided' | 'refused' | null
  decidedByPersonId: string | null     // schvaluje vedoucí, ne Klíčová osoba sama
  refusalReason: string | null

  releasedDocumentIds: string[]
  releasedSummary: string | null       // co bylo sděleno, když to nebyl dokument
  deliveredOn: string | null
  channel: 'isds' | 'email' | 'post' | 'in_person' | null
  proofDocumentId: string | null
}
```

Čtyři věci, které z toho plynou:

- **Schvaluje vedoucí.** Vydat údaje o dítěti ven ze systému není běžný úkon Klíčové
  osoby. `decidedByPersonId` je povinné a je to jiná osoba než autor podkladu.
- **Odmítnutí je legitimní výstup** a musí být zapsatelné. Ne každá výzva je oprávněná
  a ne každý rozsah je nezbytný; § 53 mluví o údajích *potřebných*.
- **Toto není `InspectionRequest` z dok. 12.** Ten je o nahlížení **do** spisu zevnitř
  systému. `AuthorityRequest` je o vydání údajů **ven**. Splynout nesmějí, protože
  odpovídají na dvě různé otázky při kontrole.
- **Vydání je vždycky i `DocumentExportLog`** (dok. 12) — export se loguje sám, tady
  se navíc připojuje titul.

---

## 5. Povinnosti vázané na pověření

Tohle je agenda **organizace**, ne spisu, a v systému pro ni dosud nebylo místo.

| Povinnost | Lhůta | Základ |
| --- | --- | --- |
| Oznámit změny skutečností rozhodných pro vydání pověření nebo pozastavení činnosti | **do 15. dne měsíce následujícího** po měsíci, kdy změna nastala | § 48a odst. 1 písm. a) |
| Zaslat kopii pojistné smlouvy odpovědnosti | **do 15 dnů** od uzavření | § 48a odst. 3 |
| Splnit opatření uložená kontrolním orgánem | **ve lhůtě určené orgánem** | § 49b odst. 3 |

Sankce nejsou teoretické: neoznámení nevykonávání činnosti je důvod k odnětí pověření
podle § 50 odst. 1 písm. c), nesplnění uložených opatření podle písm. g).

```ts
interface MandateObligation {
  organizationId: string
  kind: 'mandate_change_notice' | 'insurance_copy' | 'corrective_measure'
      | 'annual_registry_return'

  triggerEvent: string                 // co ji vyvolalo
  triggeredOn: string
  dueOn: string
  status: 'open' | 'submitted' | 'overdue' | 'closed'

  authorityId: string                  // KÚ, který pověření vydal
  submittedOn: string | null
  evidenceDocumentId: string | null    // doručenka, potvrzení, protokol
}
```

Pojištění stojí za zvláštní zmínku, protože je to **opakující se past**: povinnost
zaslat kopii nevzniká jednou, ale při každé nové pojistné smlouvě. Systém proto drží
`insuranceValidUntil` a při obnově vygeneruje novou `MandateObligation` — jinak si na
to nikdo nevzpomene, dokud nepřijde kontrola.

### Inspekce kvality a body

§ 50 odst. 1 písm. h) váže odnětí pověření na **bodové hodnocení při hloubkové
inspekci**: pod jednou třetinou maxima, nebo dvakrát po sobě pod polovinou. Bodování
standardů 0–3 z dok. 07 tím dostává druhý význam — není to jen interní sebehodnocení,
ale odhad té veličiny, na které visí pověření. V přehledu standardů proto vedle
vlastního skóre patří i **prahy**, ať je vidět, kde organizace stojí. Bez komentáře
a bez varovných hlášek — stejné pravidlo jako u parametrů (dok. 07).

---

## 6. Co do výkaznictví vůči orgánům **nepatří**

Aby se to nerozlilo:

- **Reporty pro účetní** (dok. 07 sekce 4) jsou interní. Ven nejdou.
- **Přehled čerpání SPVPP** jde na **Úřad práce**, ne na KÚ ani OSPOD, a je to podklad
  k zúčtování státního příspěvku — jiná agenda, jiný adresát, jiná lhůta.
- **Systém není podatelna.** Nic neodesílá do datové schránky sám; připraví dokument
  a doručení zaznamená. Odeslání dělá člověk. To platí i pro zprávu podle § 47b odst. 5
  a bylo to tak už v dok. 05.

---

## 7. Zapojení do existujícího modelu

| Místo | Změna |
| --- | --- |
| `Report.kind` | + `'on_request'`, + `resetsPeriodicCycle: boolean` |
| `Obligation.kind` (dok. 11) | beze změny — zůstává agendou spisu |
| **nový** `MandateObligation` | povinnosti organizace vůči úřadu; vlastní přehled |
| `Document.category` (dok. 12) | + `'authority_release'`, `'registry_return'`, `'inspection_protocol'`, `'corrective_measure'` |
| `TimelineEntry.refType` (dok. 12) | + `'authority_request'` — patří do spisu, týká se toho dítěte |
| Oprávnění (dok. 04) | vydání ven schvaluje **vedoucí**; zobecněné výkazy vidí **org_admin**, ne Klíčová osoba |
| Nastavení organizace | kapacita, materiální a technické zabezpečení, pojištění a jeho platnost |
| Dashboard | druhý pás lhůt — **organizační**, vedle rodinného z dok. 03 |

`AnnualRegistryReturn` a agregované výstupy se počítají **nad metadaty, ne nad obsahem**
— dělení z dok. 04 tady vychází podruhé. Výkaz o počtu dětí nesmí potřebovat přístup
k zápisům, jinak by ho nemohl spustit nikdo, kdo do spisů nevidí.

---

## 8. Rozsah pro MVP

| Položka | MVP |
| --- | --- |
| Zpráva 6m + při zániku, tři adresáti, 15 dnů | **ano** — už v plánu |
| Zpráva `on_request` | **ano** — jen třetí druh téhož workflow |
| `ServiceInquiry` s důvody odmítnutí | **ano** — bez toho nelze roční výkaz nikdy dopočítat zpětně |
| `AuthorityRequest` | **ano** — je to i doklad o dodržení mlčenlivosti |
| `MandateObligation` | **ano** — tři typy, jednoduchý seznam s termíny |
| `AnnualRegistryReturn` — výpočet a snímek | ano, ale **až po prvním roce provozu**; dřív není z čeho počítat |
| Strojové plnění tiskopisu MPSV | **ne** — cizí formulář, mění se |
| Prahy bodů inspekce u standardů | ano, jako údaj |

`ServiceInquiry` je jediná položka, která **musí být hned**, i když se výkaz podává až
za rok a půl: odmítnutí, které se nezapsalo v okamžiku, kdy se stalo, se do výkazu
nedostane nikdy.

---

## 9. Co tenhle dokument opravuje

| Dokument | Co v něm bylo nepřesné |
| --- | --- |
| 05 | `Report.kind` má tři hodnoty, ne dvě |
| 08 | v rozsahu MVP chyběly povinnosti vůči úřadu úplně |
| 11 | motor lhůt kryl jen spis; organizační lhůty jsou druhá řada |
| 12 | `InspectionRequest` řeší nahlížení dovnitř, ne vydání ven — chyběl protějšek |

A jedna věc k celkovému obrázku: dosavadních dvanáct dokumentů popisovalo systém pro
**doprovázení rodin**. Tenhle přidává tenkou vrstvu, která popisuje **organizaci jako
subjekt s pověřením** — a ta vrstva má vlastní lhůty, vlastní adresáty a vlastní
sankce. Je malá, ale nemá kam jinam patřit.
