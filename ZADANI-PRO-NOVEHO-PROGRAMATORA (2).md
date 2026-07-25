# ZADÁNÍ PRO NOVÉHO AI PROGRAMÁTORA — Doprovázení.com

Datum: 2026-07-17. Tento dokument je **funkční** specifikace — co systém dělá,
jaká jsou data, jaká jsou pravidla a workflow. Vizuál (barvy, typografie,
komponenty, PWA) řeší samostatný `DESIGN_SYSTEM.md` — přečti oba, dohromady
tvoří kompletní zadání. Design se staví **od nuly** (viz DESIGN_SYSTEM.md
§0); funkčnost popsaná zde se **přebírá** — je to podruhé postavený produkt,
poučený z první implementace (a z paralelní implementace u druhého AI
programátora), ne experiment od nuly.

## Jak číst

1. Nejdřív **§8 (lekce a pasti)** a **§11 (metodika práce)** — ušetří nejvíc
   tokenů.
2. Pak **§1–§3** (co a proč, entity, datový model), **§6–§7** (workflow —
   hlavně §7, hlasový zápisník, je nové a nejcennější).
3. **§13 (otevřené otázky)** si projdi s uživatelem HNED na začátku, než
   začneš stavět datový model — týkají se architektury, ne detailů.

---

## 1. Produkt a doména

**CRM/SaaS pro doprovázející organizace pěstounské péče v ČR**
(Doprovázení.com). Case-management systém nad zákonnou agendou (zákon
359/1999 Sb., sociálně-právní ochrana dětí). Multi-tenant: cílově ~1000
organizací, ~10 000 uživatelů. Citlivá data dětí → GDPR, auditovatelnost,
minimalizace dat v logech a AI promptech.

## 2. Persony

| Role | Kdo | Klíčová potřeba |
|---|---|---|
| **Klíčová osoba (KO)** | sociální pracovnice, orientačně ~25 rodin (viz pozn. níže) | terén na mobilu (návštěvy, zápisy, GPS), kancelář na desktopu (reporty, dokumenty) |
| **Vedení DO** (org_admin, vedoucí pobočky, teamleader) | přehledy, schvalování | vedoucí/teamleader jsou READ-ONLY (`isReadOnlyManager`); org_admin i vedení centrály mohou prodlužovat legislativní lhůty (viz §3) |
| **Pěstoun** | doprovázená osoba | vlastní omezená appka `/moje/*` — své děti read-only, chat s KO, dokumenty a sdílené zápisy ke čtení/schválení |
| **Externí účastník (EP)** | OSPOD, biologický rodič, psycholog, škola… | obecný účet BEZ implicitní role; vše řízeno jemnozrnnými, časově verzovanými granty |
| **Poskytovatel** (NOVÝ) | firma/OSVČ nabízející kurzy/hlídání/tábory v e-shopu (§6, A10) | vlastní omezená appka `/poskytovatel/*` — jen objednávky vlastní instituce, potvrzení absolvování, nahrání certifikátu a faktury |
| **Superadmin** | provozovatel SaaS | organizace se registrují SAMY (`/registrace`), superadmin je nezakládá |

Dítě **nemá účet** (závazné pravidlo). Účet dítěte 12+ je modelován jako EP
se `subjectKind='child'` — připraveno, zatím se nepoužívá.

## 3. Klíčové doménové entity

- **Spis (rodinná složka)** — evidenční jednotka rodiny: pěstouni (osoby,
  ne nutně účty), svěřené děti, respit, sociální prostor, časová osa, chat,
  dokumenty.
- **Dohoda o doprovázení** — smluvní vztah MEZI konkrétní doprovázející
  organizací a pěstounem. **Má vlastní UID a legislativní lhůty** (návštěva
  min. 1× za 2 měsíce, 24 h/rok vzdělávání pěstouna — 18 h u příbuzenské
  péče, 72h lhůta na zapsání záznamu z návštěvy). Lhůty smí prodloužit
  vedení (org_admin / vedení centrály).
- **Vztah Spis ↔ Dohoda — VYŘEŠENO, viz §4.5.** Spis rodiny je nezávislý
  na doprovázející organizaci: dítě/rodina může organizaci změnit, ale spis
  s celou historií a UID zůstává. Dohoda naproti tomu vždy patří jedné
  organizaci a má vlastní životnost. **Tohle je architektonická otázka k
  potvrzení, kompletní model a cross-org viditelnost hotové v §4.5.**
- **Dítě** — nezaopatřená osoba v pěstounské péči; RČ je primární
  identifikátor (dopočet data narození), jméno jen fallback.
- **Respit / CPSD (celodenní péče o svěřené dítě)** — právo na min. 14
  **kalendářních dnů v kalendářním roce** (§47a odst. 2 písm. b) ZSPOD,
  dítě musí mít alespoň 2 roky). „I hodina = celý den" — potvrzeno
  doslovně MPSV instrukcí. Nad 14 dní jen s písemným odůvodněním DO
  (zdravotní stav/náročnost péče dítěte). Období je **kalendářní rok**
  (1.1.–31.12.), NE rolující 12 měsíců — jiné ukotvení než u vzdělávání
  (viz níže), nezaměňovat.
- **SPVPP (státní příspěvek na výkon pěstounské péče)** — **NENÍ
  peněženka dítěte.** Je to roční neinvestiční transfer organizaci,
  vázaný na CELKOVÝ počet uzavřených Dohod v daném roce, se závaznými
  procentními koši (vyhláška 477/2024 Sb., §5c): 5–15 % na osobní péči
  + respit (§47a odst. 2 a,b), 10–20 % na poradenství + psychologickou/
  terapeutickou pomoc + kontakt s biologickou rodinou (c–e), 5–10 % na
  vzdělávání (f), zbytek na mzdy/provoz/věcné výdaje organizace. Roční
  cyklus: žádost do 15.1., vyplacení, do 31.3. přehled čerpání, do 30.4.
  vrácení nevyčerpaného. Přesná Kč sazba SPVPP na jednu Dohodu (ta, co
  se v čase mění a může i retroaktivně) není v podkladech, které mám —
  potřeba dohledat konkrétní zdroj (zákon/nařízení vlády), pokud se má
  trackovat historicky.
- **Příspěvek na úhradu potřeb dítěte** — vyplácí ho ÚP ČR přímo osobě
  pečující (ne organizaci), funguje jako obdoba výživného od státu.
  **Stejné rozhodnutí jako u §3.1: systém nepočítá ani neeviduje
  částku** — jen stavový příznak „chodí/nechodí + potřeba intervence"
  (viz §4.4). Znalost mechanismu (pro KO, ne pro výpočet v appce):
  - Sazba dle věku dítěte 6 290/7 750/8 870/9 220 Kč (do 6 / 6–12 /
    12–18 / 18–26 let), vyšší při stupni závislosti I–IV (§47f/3–4
    ZSPOD) — čísla jsou referenční znalost, NE data v systému.
  - Odečet: pouze důchod z důchodového pojištění (sirotčí), náleží jen
    rozdíl. Invalidní důchod III. stupně → nárok zaniká úplně.
  - Nenáleží po dobu plného přímého zaopatření dítěte v ústavu/u jiné
    osoby.
  - **Výživné od biolog. rodiče se NEODEČÍTÁ** — jde o subrogaci
    (§47g/3–4 ZSPOD): právo dítěte na výživné přechází na stát, ÚP si
    ho vymáhá sama; je-li výživné vyšší než příspěvek, rozdíl náleží
    dítěti. Od 1. 1. 2025 (novela 242/2024 Sb.) platí totéž jednotně
    i pro „svěřenectví" (§953 OZ). Organizace ani pěstoun s tím
    aktivně nepracují — je to čistě administrativní vztah ÚP↔rodič.
    Pro KO je důležité jen vědět, že tohle NENÍ důvod, proč by dávka
    „nechodila" — pokud nechodí, příčina je jinde.
- **Vzdělávání pěstounů** — přesný právní pojem je **„zprostředkovaná"
  (24 h/12 měsíců) vs. „nezprostředkovaná" pěstounská péče (18 h)**, ne
  „dlouhodobá/přechodná/příbuzenská" jak používala minulá implementace.
  Dvojí evidence, KTEROU MUSÍ SYSTÉM ROZLIŠOVAT:
  1. **Oficiální/compliance počítadlo** — 12měsíční okno se resetuje při
     KAŽDÉ nové Dohodě (potvrzeno MPSV instrukcí 3/2025: „za počátek...
     se vždy bere datum uzavření dohody"). Přebytek hodin nad rámec
     povinnosti se **započítává do následujícího 12měsíčního období**
     (§47a odst. 3 ZSPOD) — banking mechanismus, ne propadá. Toto číslo
     jde do SPVPP vykazování vůči státu.
  2. **Interní, trvalá evidence** — organizace eviduje VEŠKERÉ
     absolvované vzdělávání pěstouna napříč celou jeho historií, i přes
     změnu DO — i když se „oficiální" počítadlo Dohodou resetuje,
     interní historie zůstává čitelná a nikdy se nemaže. Toto váže se
     na Pěstouna jako nezávislou entitu — konkrétní datový model viz
     §4.4.A (`fosterPersons/{fosterId}`).
  Dále: část hodin nesmí být čistě e-learning (zákon vyžaduje i osobní
  účast s lektorem) — kurz musí mít typ (prezenčně/online/hybrid) a
  systém musí hlídat poměr.
- **Časová osa (timeline)** — deník spisu, JÁDRO dat: návštěvy (GPS,
  délka), poznámky, zápisy (viz §7), systémové záznamy, přijaté dokumenty.
- **Dokumenty** — schvalovací životní cyklus (koncept → pěstoun → vedení →
  uzavření → odeslání OSPOD/soud) s verzemi a auditní stopou.

### 3.1 Ostatní dávky pěstounské péče (ÚP ČR) — POUZE stav, NIKDY výpočet (rozhodnuto)

Zákon (ZSPOD §§47e–47n, 50b–50u) zná ještě další dávky, které **vyplácí
ÚP ČR přímo pěstounovi/mladému dospělému** — organizace do jejich
výpočtu ani výplaty nijak nevstupuje. **Rozhodnutí uživatele: systém
NEPOČÍTÁ ani neeviduje žádné částky těchto dávek** — do výše dávek
organizaci nic není. Práce klíčové osoby (KO) se omezuje na zjištění
při návštěvě: **(a) chodí dávka / nechodí — a která konkrétně, (b) je
potřeba intervence/pomoc ze strany organizace** (např. pomoc s
podáním žádosti, ohlášení změny do 8 dnů ÚP, dotaz proč nechodí).
Datový model viz §4.4 — jde o jednoduchý stavový příznak per dávka +
poznámka, ne finanční modul. Znalost mechanismu dávek (viz níže) je
ale užitečná pro KO, aby uměla poznat, že "něco nesedí", i bez počítání
čísel:

- **Odměna pěstouna** — jen u **zprostředkované** péče (musí být
  „Sdělení/oznámení o vhodnosti" od kraj. úřadu), násobek min. mzdy
  (1,0× za 1 dítě, 2,0× za 3 děti, +0,5×/dítě navíc, vyšší koeficienty
  pro pěstouny na přechodnou dobu a při stupni závislosti II–IV).
  **Je to příjem ze závislé činnosti** — podléhá dani, sociálnímu a
  zdrav. pojištění, možnost ročního zúčtování u ÚP.
- **Příspěvek při pěstounské péči** — jen u **nezprostředkované** péče
  (příbuzenská/§953 OZ), násobek životního minima jednotlivce. Dle
  zákona (§47ja odst. 2–3 ZSPOD) je klíčové kritérium **vyživovací
  povinnost osoby pečující vůči dítěti** (§910 OZ) — má-li ji (typicky
  prarodiče/praprarodiče), koeficient je 1,8×; nemá-li ji (teta,
  strýc, zletilý sourozenec, osoba blízká), koeficient je 2,3×. Vyšší
  při stupni závislosti II–IV (5,5×). **Nepodléhá** dani ani
  pojištění — pěstoun proto typicky NENÍ automaticky sociálně/
  zdravotně pojištěn a musí to řešit jinak (viz náhradní doby pojištění
  a „adaptační bonus" níže).
- **Příspěvek při převzetí dítěte** — jednorázová, dle věku dítěte
  (10 800/12 150/13 500 Kč do 6/6–12/12–18 let), jen jednou na dítě.
  Pěstoun na přechodnou dobu: součet za 12 měsíců max. 40 000 Kč.
- **Příspěvek na zakoupení osobního motorového vozidla** — 70 %
  pořizovací ceny/opravy, max. 100 000 Kč jednorázově, **max. 200 000 Kč
  za posledních 10 let**. Podmínka: min. 3 svěřené děti, auto se
  nesmí užívat k výdělečné činnosti.
- **Zaopatřovací příspěvky** (pro mladé dospělé po 18, resp. po
  zletilosti/plné svéprávnosti, do 26 let, exkluzivně s příspěvkem na
  úhradu potřeb dítěte/odměnou pěstouna/příspěvkem při PP — do
  31.12.2027 lze volit):
  - **opakující se** — 17 250 Kč/měsíc, podmínka: individuální plán
    zpracovaný sociálním kurátorem ORP + součinnost při vyhodnocování.
  - **jednorázový** — 28 750 Kč, jen jednou, pro mladého dospělého bez
    nároku na opakující se.
- **Náhradní doby důchodového/zdravotního pojištění a „adaptační
  bonus"** — u nezprostředkovaných pěstounů (příspěvek při PP,
  nepojištěná dávka) může stát dorovnat zdravotní pojištění a náhradní
  dobu důchodového pojištění, max. 2 roky od vzniku nároku na příspěvek
  na úhradu potřeb dítěte. Netriviální přechodná pravidla dle data
  vzniku péče (před/po 31.12.2021) — pro MVP pravděpodobně mimo
  rozsah, ale zmínit v `docs/domain/` ať se nezapomene.

### 3.2 Legislativní parametry — systémová vrstva (nová, důležitá)

Některé sazby a požadavky (SPVPP procentní koše, hodinové limity
vzdělávání 18/24 h, 14 dní respitu, stropy na stravu/ubytování/leasing)
jsou **celosystémové** — mění je stát, ne jednotlivá organizace. Stát
je může měnit v čase, včetně retroaktivně. Systém proto potřebuje:

- Verzovanou tabulku legislativních parametrů s platností od data
  (`effectiveFrom`), spravovanou **superadminem** (ne org_adminem) —
  je to jedna hodnota pro celý systém, ne per organizace.
- Před nabytím účinnosti změny: **notifikace všem dotčeným
  organizacím** — v rozhraní systému (banner/notifikace) I e-mailem.
  Změna se neaplikuje potichu.
- Historické výpočty (např. kolik SPVPP organizace čerpala v roce X)
  musí použít sazbu platnou v době X, ne aktuální — i po retroaktivní
  úpravě je potřeba umět dopočítat rozdíl, ne jen přepsat historii.

## 4. Datový model (Firestore)

### 4.1 Mapa kolekcí

```
organizations/{orgId}
  └── events/{eventId}          kalendář
  └── codelists/...             vlastní typy událostí organizace
  └── spvpp/{year}              SPVPP roční cyklus — viz §4.4.C
      └── expenses/{id}         doložené výdaje po koších (append-only)
users/{uid}                     role, organizationId, fosterFamilyId(pestoun),
                                fosterPersonRef (→ fosterPersons/{fosterId}),
                                externalParticipantId(external), docApprover
  └── notifications/{id}        per-uživatel oznámení
families/{familyId}             SPIS — org-nezávislá identita (viz §4.5),
                                pěstouni (osoby, fosterPersonRefs[]), svěřené
                                děti (kolekce), socialSpace{}, lastVisitAt(denorm)
  └── agreements/{agreementId}  DOHODA(y) — organizationId, validFrom/To,
                                lhůty (visitIntervalDays, educationHoursTarget,
                                noteDeadlineHours), stav (active/ended)
  └── timeline/{id}             OSA: type note|visit|voice_entry|system|document,
                                title, body, subjectRefs[], occurredAt, pinned(max 3),
                                sharingLevel (viz §7.4 — NOVÉ pole),
                                visit: startedAt/endedAt/durationSeconds/location,
                                voice_entry: originalTranscript, aiSummaryUsed (viz §7)
  └── messages/{id}             chat: body, audience, recipients, authorUid…
  └── documents/{docId}         workflow, verze, audit (viz §6.A1)
  └── respitEvents/{id}         právo DÍTĚTE, eviduje se u rodiny — viz §4.4.B
fosterPersons/{fosterId}        TOP-LEVEL, UID typ 10 — pěstoun jako osoba
                                NEZÁVISLÁ na Dohodě/rodině, viz §4.4.A
  └── courses/{courseId}        trvalá historie vzdělávání (nikdy nemazat)
  └── benefitChecks/{id}        append-only log zjištění KO o dávkách §3.1
children/{childId}              TOP-LEVEL: identita, RČ, adresy, škola,
                                OSPOD, soud, biologická rodina, socialSpace[],
                                organizationId+assignedTo (denorm z aktivní Dohody)
  └── history/{id}, permanentNotes/{id}, previousFosters/{id}, courtVerdicts/{id}
  └── supportExpenses/{id}       tabulka dokladů — viz §4.4.E (NE SPVPP graf!)
  └── supportServicePlans/{id}   volitelný auto-fill plán — viz §4.4.E
external_participants/{epId}
  └── access/{childId}, grants/{grantId}(verzované), audit/{id}
tasks/{id}, institutions/{id}
foster_invitations/{email}, ep_invitations/{email}
```

> Pozn.: `families` (dřív `foster_families`) je zde přejmenováno, protože
> nový model odděluje Spis od Dohody — potvrď pojmenování s uživatelem.
> `fosterPersons` je NOVÝ top-level kolekce (analogie k `children`) —
> nutná proto, aby vzdělávání pěstouna přežilo změnu Dohody/organizace
> (viz §4.4.A). Je to malé rozšíření modelu, ne architektonická otázka
> jako §4.5 — pokud s tím nesouhlasíš, dej vědět, jinak stavíme takto.

### 4.2 Závazná pravidla modelu (porušení = refactor)

1. Dokument = identita + aktuální stav. Cokoli roste v čase = **podkolekce**
   (timeline, dokumenty, audit, kurzy, historie), nikdy pole v dokumentu.
2. Pole v dokumentu max ~20 položek, nesmí růst neomezeně.
3. Vztah „kdo má koho" jen JEDNOU: rodina/Dohoda má `assignedTo`; KO seznam
   rodin NEMÁ — získává se dotazem.
4. Denormalizovaná počítadla (lastVisitAt…) aktualizuje výhradně služba,
   ve `writeBatch` se změnou, která je vyvolala.
5. Seznamové obrazovky čtou JEN hlavní dokumenty; podkolekce až v detailu,
   stránkované (top-level 50, podkolekce 20, cursor).
6. **Záznam o více osobách se ukládá JEDNOU s `subjectRefs[{kind,id}]`** —
   tohle je mechanismus, který přímo řeší „uložit zápis na více míst"
   z §7.3. Nevytvářej duplicitní záznamy per entita.
7. `children` je top-level (org-wide dotazy, přesuny mezi rodinami);
   `organizationId`/`assignedTo` se denormalizují z **aktivní Dohody**
   (ne přímo ze Spisu — viz §4.5).

### 4.3 Identity model — UID politika (závazné, viz `001-IDENTITY_MODEL.md`)

Každá entita v systému má jedinečný, neměnný UID. Toto je samostatný,
uzavřený dokument (`001-IDENTITY_MODEL.md`) — čti ho celý, tady je jen
shrnutí + jak zapadá do datového modelu výše.

**Struktura:** `TT OOOO SSSSSS C` — 13 číslic, nikdy nezačíná nulou.

| Část | Délka | Význam |
|---|---:|---|
| TT | 2 | Typ entity |
| OOOO | 4 | ID doprovázející organizace (přiděleno jednorázově) |
| SSSSSS | 6 | Pořadové číslo v rámci typu a organizace (000001–999999) |
| C | 1 | Kontrolní číslice — algoritmus **EAN-13**, žádný vlastní |

**Typy entit (TT):** 10 Pěstoun · 20 Dítě · 30 Klíčová osoba · 40
Zaměstnanec DO · 50 Externí spolupracovník · 60 Externí organizace · 70
**Poskytovatel vzdělávání pěstounů** · 80 **Poskytovatel služby dítěti**
(přejmenováno z „respitní péče" — zahrnuje i tábory/hlídání/doučování,
ne jen klasický respit) · 90 Dohoda o výkonu pěstounské péče · **99 Spis
(rodinná složka)**. Mezi řadami je záměrně mezera pro budoucí typy
(lékaři, psychologové, školy, soudy). **70 a 80 mají záměrně odlišný
workflow napříč celým systémem — viz §6, A10a/A10b — nejsou to jen dvě
čísla stejné věci, chovají se jinak.**

**Neměnnost:** UID se nikdy nemění, nikdy nerecykluje, zůstává i po
archivaci/logickém smazání. Je to primární identita objektu.

**Dokumenty:** každý systémový dokument (PDF/DOCX export) nese vlastní
UID + číslo verze + datum vytvoření + kryptografický hash + QR kód. QR
nesměřuje na soubor, ale na ověřovací stránku
`https://crm.doprovazeni.cz/d/{UID}`, která podle oprávnění ukáže
potvrzení existence, stav, historii verzí, elektronický originál,
auditní informace.

**Závaznost:** platí pro databázi, API, AI agenty, generování dokumentů,
audit, import/export, QR kódy, elektronické podpisy, vyhledávání — **bez
výjimky**. Nikde v kódu nevytvářej alternativní ID schéma pro nic, co má
odpovídající typ v tabulce výše.

**Implementační poznámky (moje, ne v původním dokumentu — potvrď):**

1. **UID jako pole, ne nutně jako Firestore document ID.** Sekvenční
   číslo v UID (`SSSSSS`) by jako přímý Firestore document ID způsobovalo
   hotspotting při zápisu (sekvenční klíče = zápisy do sousedících
   shardů). Doporučuju: Firestore document ID nech auto-generované
   (náhodné), `uid` ulož jako **pole** v dokumentu + composite index pro
   vyhledávání podle UID. Human-facing (URL, PDF, QR, vyhledávání) vždy
   používá `uid` pole, ne interní document ID.
2. **Sekvenční čítač vyžaduje transakci.** Přidělování `SSSSSS` per typ+
   organizace musí jít přes Firestore transakci (čítač dokument
   `counters/{orgId}_{typ}`) — jinak hrozí kolize při souběžném vytváření
   dvou entit stejného typu ve stejné organizaci ve stejnou chvíli.

---

## 4.4 Respit, Vzdělávání, SPVPP a stavové dávky — konkrétní datový model

Tyto čtyři oblasti jsou navržené jako **propojený systém**: události
respitu a vzdělávání (s volitelnou položkou nákladu v Kč) se dají
přímo přiřadit do SPVPP koše, takže roční vyúčtování (§3.2/§3) není
ruční přepisování čísel, ale součet už zaznamenaných dat.

### A. Vzdělávání — `fosterPersons/{fosterId}`

Pěstoun jako osoba je od teď **top-level entita** (typ 10), ne jen pole
uvnitř rodiny — jinak by se historie vzdělávání ztratila při změně
Dohody nebo přechodu k jiné organizaci (§4.5 řeší totéž pro Spis).

```
fosterPersons/{fosterId}
  uid, name, birthDate,
  familyRef, currentAgreementRef        // denormalizace, aktualizuje služba
  educationOfficial: {                  // OFICIÁLNÍ/compliance počítadlo
    agreementRef, windowStart, windowEnd,   // resetuje se při nové Dohodě
    hoursRequired,                      // 24 (zprostředkovaná) / 18 (ne-)
    hoursCompletedInWindow,
    hoursBankedFromPrevious             // §47a odst. 3 ZSPOD — přebytek
  }
  educationLifetimeHours                // denormalizovaný součet, jen info
  stateBenefits: {                      // §3.1 — POUZE stav, viz sekce D
    odmenaPestouna: {status, needsHelp, note, updatedAt},
    prispevekPriPP: {...}, prispevekPriPrevzeti: {...},
    prispevekNaVozidlo: {...}, zaopatrovaciPrispevek: {...}
  }
  └── courses/{courseId}                // TRVALÁ historie, NIKDY se nemaže
        title, providerRef (typ 70), type: prezencne|online|hybrid,
        hours, occurredAt, cost (Kč, volitelné — pro SPVPP koš),
        certificateFileRef, countsTowardOfficial: bool
  └── benefitChecks/{id}                // append-only, viz sekce D
```

Přidání kurzu do `courses/` transakčně inkrementuje
`educationLifetimeHours` VŽDY a `educationOfficial.hoursCompletedInWindow`
JEN pokud `countsTowardOfficial=true` a kurz spadá do aktuálního okna.
Založení nové Dohody spustí službu, která: (1) spočítá přebytek
předchozího okna → `hoursBankedFromPrevious` nového okna, (2) nastaví
nové `windowStart/End` a `hoursRequired` dle typu péče. Poměr
prezenční/online hodin (zákon vyžaduje osobní účast) se počítá nad
`courses` v okně, ne jako samostatné pole.

### B. Respit — `families/{familyId}/respitEvents/{id}`

Právo je per DÍTĚ (musí mít 2+ roky), ale respit se často čerpá pro
více dětí najednou → používá se **`subjectRefs[]`** stejně jako u
zápisů (§4.2 pravidlo 6), ne duplicitní záznamy.

```
respitEvents/{id}
  subjectRefs: [{kind:'child', id}, ...]   // které děti respit pokrývá
  dateFrom, dateTo,
  daysCount                                // "i hodina = celý den" — pravidlo
                                            // výpočtu: (dateTo-dateFrom)+1,
                                            // min. 1, i pro částečný den
  calendarYear                             // odvozeno z dateFrom — období
                                            // je kalendářní rok, NE rolující
  providerRef (typ 80, volitelné),
  reason                                   // POVINNÉ, pokud součet za rok > 14
  cost (Kč, volitelné — pro SPVPP koš)
```

Denormalizovaný čítač **na každém dítěti** (ne na rodině — právo je
per dítě): `children/{childId}.respitDaysUsed: {[year]: number}`,
aktualizovaný transakčně pro každé dítě v `subjectRefs` při zápisu
respitEvent. UI při zadávání varuje, když by součet přesáhl 14 dní a
vynutí vyplnění `reason`.

### B.1 Naplánované/opakující se aktivity jako další zdroj respitu (NOVÉ)

**Odděleno od A10 (e-shop, viz §6) — tohle řeší plánování/opakování a
respit příznak, ne katalog/objednávky/platby.** Doučování/hlídání
interní lektorkou nebo pravidelný kroužek externí instituce se
nezakládá jako jednorázová objednávka, ale jako **naplánovaná
aktivita s opakováním**:

```
children/{childId}/scheduledActivities/{id}
  activityType: 'doucovani' | 'hlidani' | 'krouzek' | 'jine'
  providerKind: 'interni' | 'externi'
  internalStaffUid                    // pokud interní (existující zaměstnanec,
                                        // vlastní UID, žádná nová entita)
  externalInstitutionRef              // pokud externí (→ institutions/{id}, TT=80)
  isRespit: bool                      // VŽDY explicitní volba, NIKDY odvozeno
                                        // z activityType — hlídání/doučování
                                        // MOHOU být respit, nejsou automaticky.
                                        // Kritérium: PLATÍ ZA TO ORGANIZACE?
                                        // Ano → respit. Ne → jen sledovaná
                                        // aktivita (viz níže).
  confirmationMode: 'potvrzuje_se' | 'presumuje_se'
  schedule: {
    startDate, endDate (volitelné, např. „do konce června"),
    recurrence: {frequency: 'weekly'|'daily', daysOfWeek: [], durationMinutes}
  }
  rate: {amountPerHour}                // VŽDY editovatelné pole ve formuláři,
                                        // PŘEDVYPLNĚNÉ z celoorganizační
                                        // výchozí sazby (viz níže) — ne
                                        // schované za přepínač „vlastní
                                        // cena", prostě přepsatelné číslo
                                        // hned v hlavním formuláři
  rateWasOverridden: bool               // denormalizovaný příznak (pro
                                        // přehled, kolik aktivit se odchýlilo
                                        // od výchozí sazby), nemá vliv na
                                        // výpočet samotný
  └── occurrences/{occurrenceId}
        date, status: 'planovano' | 'probehlo' | 'neprobehlo' | 'presumovano'
        confirmedBy, confirmedAt      // jen pro confirmationMode='potvrzuje_se'
```

**Založení (interní lektorka, typický případ):** přihlásí se do
vlastního účtu → kalendář → najde volný termín, nastaví opakování a
konec (např. „do konce června") a délku → přiřadí dítě (systém
dopočítá rodinu/Dohodu sám z dítěte) → hotovo. Žádné zakládání
katalogové položky ani objednávky netřeba pro interní případ.

**Dva různé režimy potvrzení proběhnutí — záměrně odlišné, ne jedno
univerzální pravidlo:**
- **`potvrzuje_se`** (typicky interní 1:1 — lektorka, hlídání): každý
  termín je `planovano`, dokud ho někdo výslovně neoznačí `probehlo`
  (nebo `neprobehlo`). Čistší varianta — nevzniká nejasnost, co se
  reálně stalo, a je to i výchozí doporučení.
- **`presumuje_se`** (kroužek/pravidelná aktivita externí instituce,
  např. fotbalový trénink 3×/týdně): nedá se čekat, že trenér bude
  po každém tréninku něco klikat. Termín se automaticky považuje za
  `presumovano` (proběhlo) — KO/interní zaměstnanec musí kliknout jen
  na VÝJIMKU (`neprobehlo`, dítě nemohlo/bylo nemocné apod.).

**RESPIT je explicitní příznak, kritérium je PLATBA ORGANIZACÍ:** aby
se aktivita počítala do 14denního konta dítěte, musí mít `isRespit=true`
NASTAVENÝ VĚDOMĚ — a skutečné kritérium je jednoduché: **hradí to
organizace?** Pokud ano → je to respit. Pokud organizace za aktivitu
neplatí (např. si ji platí pěstoun sám, nebo je čistě dobrovolná bez
nákladu), je to **jen „sledovaná aktivita"** — vidět v přehledu
kvality péče o dítě (§8 audit, obecný přehled pro KO/vedení), ale bez
JAKÉKOLI vazby na SPVPP nebo respitní konto. Cena/sazba se u
`isRespit=false` položek vůbec nevyžaduje ani nezobrazuje — je to
čistě informační záznam „tahle aktivita se pro dítě dělá".

U hlídání/doučování, když JE respit, se výchozí sazba předvyplní z
**celoorganizačního nastavení** (`organizations/{orgId}.respitRates:
{hlidaniZaHodinu, doucovaniZaHodinu}` — §5.6/§5.7), ale **formulář
dovoluje cenu rovnou přepsat pro konkrétní aktivitu** — žádné
schovávání za „vlastní cena" přepínač, jen běžné editovatelné pole
s předvyplněnou hodnotou.

**DŮLEŽITÉ TĚŽIŠTĚ: u respitu jde primárně o evidenci VYKÁZANÝCH
HODIN/DNÍ, cena je vedlejší.** Datový model i UI musí tomu odpovídat
— `respitDaysUsed` čítač (den/hodiny) je hlavní pole, na které se
systém ptá a které hlídá zákonný strop; `rate`/cena se eviduje, aby šla
doložit organizaci navenek (SPVPP vyúčtování), ale NENÍ to důvod,
proč záznam vzniká. I u Pobytu (viz níže) je klíčová otázka „kolik dní
se počítá jako respit", ne „kolik to stálo".

**Napojení na existující respit mechanismus — ŽÁDNÝ nový paralelní
čítač:** jakmile je occurrence `probehlo`/`presumovano` A
`isRespit=true`, systém automaticky připíše den do stejného
`children/{childId}.respitDaysUsed` čítače jako klasický vícedenní
`respitEvent` výše — pravidlo „1 hodina = celý den" (§3, MPSV
instrukce) platí stejně, ať respit vznikl z týdenního pobytu, nebo
z jedné 2hodinové lekce doučování označené jako respit.

**Rozsah proplácení — vědomě omezeno na respit, pro tuto verzi:**
organizace může v budoucnu proplácet dítěti víc typů aktivit, ale
**teď (MVP) se do SPVPP koše (§4.4.C) a evidence výdajů dítěte
(§4.4.E) počítá VÝHRADNĚ to, co má `isRespit=true`**. Aktivity bez
respit příznaku se dají naplánovat a mít v přehledu (kalendář, kdo se
o dítě kdy stará), ale nevstupují do žádného finančního vykazování —
to je vědomé omezení rozsahu pro první verzi, ne mezera k dořešení
teď. Rozšíření o další proplácené kategorie je vyloženě budoucí téma.

### B.2 Pobyt (tábor, ležák, rekreace) — druhý typ respitu, ověřeno v zákoně

**Zákonný základ — § 58 odst. 3 písm. h) ZSPOD, ověřeno přímo v textu
zákona:** „Úhradu nákladů... sjednává s pověřenou osobou osoba, jíž...
se sociálně-právní ochrana poskytuje... za stravu **a za ubytování**
při poskytnutí nebo zajištění celodenní péče o svěřené dítě podle
§ 47a odst. 2 písm. b)". **Oprava původního zadání:** není to jen
strava — je to **strava A ubytování společně**, co si hradí pěstoun/
rodina sama (typicky z příspěvku na úhradu potřeb dítěte, §3), zbytek
(vlastní péče/program pobytu) hradí organizace. U klasické denní
péče bez přespání dává smysl řešit jen stravu; u Pobytu (s
ubytováním) se řeší oboje.

**Nuance k přesnosti citace (nižší jistota, poznamenat pro budoucí
právní revizi):** §58 mluví o „pověřené osobě" — subjektu s
akreditací poskytovat sociálně-právní ochranu (typicky DO sama nebo
oficiální respitní zařízení). Jde-li o Pobyt zajištěný běžnou
komerční cestovkou/táborem, který sám není „pověřenou osobou", citace
se na něj doslovně nevztahuje — praktický rozpočtový dopad (SPVPP koš
počítá jen s „osobní péčí a respitem", ne se stravou/ubytováním) by
měl zůstat stejný, ale jde o obecnou konvenci z logiky vyhlášky o
SPVPP, ne přímo vynucené tímto konkrétním ustanovením pro každého
poskytovatele. Systém tohle rozlišení nemusí modelovat (rozdělení
`costCoveredByOrg`/`costStravaUbytovani` platí v obou případech
stejně), jen si to poznamenat jako právní jemnost k případnému
budoucímu ověření.

```
respitEvents/{id}                     // rozšíření existující entity (§4.4.B),
                                       // ne nová paralelní kolekce
  kind: 'celodenni_pece' | 'pobyt'     // NOVÉ pole, výchozí 'celodenni_pece'
                                       // pro zpětnou kompatibilitu
  // -- pole specifická pro kind='pobyt' --
  organizedWith: {koUid, fosterAcknowledgedAt}  // vedení domlouvá VE SPOLUPRÁCI
                                                  // s KO a pěstounem, ne samo
  costCoveredByOrg                     // vlastní péče/program pobytu
  costStravaUbytovani                  // strava + ubytování — hradí
                                        // pěstoun/rodina, NENÍ v SPVPP koši
                                        // organizace (§58/3/h)
  invoiceDocumentRef                    // faktura od poskytovatele pobytu
  paymentProofDocumentRef               // doklad o platbě (PDF z banky)
  daysCounted                           // KONKRÉTNÍ dny počítané jako
                                        // respit — nemusí být celá délka
                                        // pobytu (např. dítě vyzvednuto dřív)
```

**Workflow (přesně dle popisu, vedení jako vlastník procesu):**

1. Vedení řeší Pobyt **ve spojení s KO a pěstounem** (domluva mimo
   systém — kam, kdy, s kým) — systém tohle jednání nenormuje.
2. Vedení zapíše nový **Pobyt (Respit)** záznam (`kind: 'pobyt'`).
3. Vedení nahraje **fakturu** (`invoiceDocumentRef`) a **doklad o
   platbě** (`paymentProofDocumentRef`, typicky PDF výpis z banky) —
   stejný dokumentový mechanismus jako jinde (§6, A4).
4. **Systém odečte Respit dny tam, kde to zákon vyžaduje** — tedy
   `daysCounted` dnů se připíše do `children/{childId}.respitDaysUsed`
   stejným mechanismem jako u §4.4.B — **jde primárně o vykázání
   dnů/hodin, cena (`costCoveredByOrg`/`costStravaUbytovani`) je
   evidovaná vedle toho pro doložitelnost, ne jako hlavní účel
   záznamu.**

Krajské schvalování poskytovatelů pobytů se zde **neřeší** (§13.5,
rozhodnuto mimo rozsah) — stejně jako u ostatních poskytovatelů.

### C. SPVPP — `organizations/{orgId}/spvpp/{year}`

Roční cyklus organizace (ne rodiny/dítěte) — vázaný na celkový počet
Dohod, s procentními koši (vyhláška 477/2024 Sb. §5c, viz §3.2
legislativní parametry — min/max % se ČTOU odtud, ne hardcoded).

```
spvpp/{year}
  agreementsCountBasis            // počet Dohod k rozhodnému datu
  requestedAmount, disbursedAmount (Kč — jakmile budou známé sazby,
                                    viz nedořešený zdroj v §3)
  status: planned|requested|disbursed|reported|closed
  deadlines: {requestBy: '15.1.', reportBy: '31.3.', returnBy: '30.4.'}
  buckets: {
    osobniPeceARespit:      {minPct:5,  maxPct:15, plannedAmount, actualAmount},
    poradenstviPsychoKontakt:{minPct:10, maxPct:20, plannedAmount, actualAmount},
    vzdelavani:             {minPct:5,  maxPct:10, plannedAmount, actualAmount},
    provozMzdy:             {actualAmount}   // zbytek, bez % stropu
  }
  └── expenses/{id}    // append-only — TŘI způsoby vzniku, viz níže
        bucket, amount, date, note,
        documentRef,               // NAHRANÝ DOKLAD — viz §6 dokumentový
                                    // workflow; POVINNÝ, je-li sourceRef
                                    // i childRef prázdné (viz níže)
        sourceRef,                 // volitelný odkaz na respitEvent/course
                                    // (family-level) nebo supportExpense
                                    // (child-level), pokud odtud vzniklo
        childRef                   // volitelné — pro dohledatelnost,
                                    // NEUKAZUJE se agregovaně na dítěti (§4.4.E)
```

**Tři způsoby, jak položka do `spvpp/{year}/expenses` vznikne:**
1. **Automaticky** ze `respitEvent`/`course`/`supportExpense` s
   vyplněným `cost` (`sourceRef` vyplněné, `documentRef` zděděný z
   podkladu, pokud tam je).
2. **Ručně, ale vázaně na konkrétní dítě** — KO otevře organizační
   SPVPP přehled a přidá položku s `childRef`, bez existujícího
   `supportExpense` záznamu (např. dodatečné zaúčtování).
3. **Ručně a celoorganizačně** — výdaj, který se netýká jednoho dítěte
   (např. hromadná faktura za respitní pobyt více rodin, školení
   lektorů, apod.). Formulář „+ Přidat doklad" na úrovni organizace:
   koš, částka, datum, POVINNÉ nahrání dokladu (`documentRef`), volitelná
   poznámka — bez `sourceRef`/`childRef`.

**Automatizace (M7, ne blokující MVP):** při zadání `cost` u
`respitEvent` (koš `osobniPeceARespit`) nebo `course` (koš
`vzdelavani`) systém nabídne rovnou vytvořit odpovídající
`spvpp/{year}/expenses` záznam se `sourceRef` — `actualAmount` koše je
pak SOUČET, ne ruční přepis. `buckets.*.actualAmount` je denormalizovaný
a přepočítává se transakčně při každém přidání/smazání expense.

### D. Ostatní dávky (§3.1) — jen stav, žádný výpočet, součást checklistu při návštěvě

`fosterPersons/{fosterId}.stateBenefits` (viz A výše) je malá bounded
mapa (5 klíčů, pravidlo §4.2 bod 2) s aktuálním stavem. Historie
zjištění jde do append-only podkolekce `benefitChecks/{id}`:
`checkedAt, checkedBy (KO uid), findings{benefit: status},
needsIntervention: bool, note`.

**Není to samostatný formulář — je to součást budoucího checklist
modulu (§11.1, M12)**, který KO vyplňuje při návštěvě rodiny.
**Zákonné minimum periodicity osobního kontaktu KO s rodinou je 1×
za 2 měsíce (§47b odst. 4 ZSPOD)** — to je i nejmenší smysluplná
perioda pro aktualizaci checklistu, protože častěji než při každé
povinné návštěvě stejně KO rodinu nevidí. Checklist se tedy nabídne
jako krok zápisu z návštěvy (`timeline` type `visit`), ne jako
oddělená periodická úloha. (Pro úplnost: §47b odst. 5 žádá navíc
souhrnnou zprávu o průběhu Dohody min. 1× za 6 měsíců — to je vhodný
bod pro export/shrnutí checklistu za období, ne pro každou položku.)

### E. Výdaje dítěte na podporu/respit — profil dítěte (evidence I VKLÁDÁNÍ dokladů, NE SPVPP graf)

**Zásadní pravidlo: profil dítěte NIKDY nezobrazuje procenta ani grafy
čerpání SPVPP.** SPVPP zůstává čistě agregační na úrovni organizace
(sekce C) — slouží jen k tomu, aby organizace věděla, zda a kolik
celkem čerpá, kvůli ročnímu vyúčtování státu. Na dítěti je jen
**tabulka dokladů/výdajů — s aktivní možností nový doklad rovnou
vložit**, ne pasivní přehled bez akce.

```
children/{childId}/supportExpenses/{id}
  category: 'doucovani' | 'hlidani' | 'tabor' | 'jine'
  source: 'interni' | 'smluvni' | 'rucni'
    // interni  = zaměstnanec/lektor organizace, systém dopočítá sám
    //            z odpracovaných hodin (pokud je eviduje jiný modul)
    // smluvni  = externí poskytovatel se smlouvou s DO a dohodnutou
    //            sazbou — systém MŮŽE auto-generovat záznam periodicky
    //            (viz supportServicePlans níže), ne přepisovat ručně
    // rucni    = KO/pěstoun zadá ručně, VŽDY s přiloženým dokladem
  providerRef (volitelné — typ 70/80 nebo interní zaměstnanec),
  amount (Kč),
  periodFrom, periodTo,          // období, ke kterému se výdaj vztahuje
                                  // (den tábora, měsíc doučování…)
  documentRef (povinné pro source='rucni' — odkaz na nahraný doklad,
               viz §6 dokumentový workflow),
  createdBy: 'system' | uid,
  note
```

**Volitelný pomocník pro `interni`/`smluvni`** —
`children/{childId}/supportServicePlans/{id}`: `category, providerRef,
rate (Kč/hodina nebo Kč/měsíc), frequency, validFrom/To`. Existence
plánu spustí periodické (např. měsíční) auto-vytvoření
`supportExpenses` záznamu se `source` odvozeným z plánu —
KO tak nemusí přepisovat stejnou platbu pořád znovu. **Nice-to-have,
ne blokující MVP** — pro první verzi stačí, že `interni`/`smluvni`
záznamy jde založit i ručně stejně jako `rucni`, jen bez povinného
dokladu.

**Prezentace v profilu dítěte (návrh, dolaď v DESIGN_SYSTEM.md):**
- Nahoře **3 souhrnné karty** vedle sebe: „Poslední čtvrtletí" /
  „Posledních 6 měsíců" / „Poslední rok" — každá s částkou (Kč) jako
  odvalující se součet za posledních 90/182/365 dní od dneška (ne
  kalendářní kvartály — jednodušší na pochopení i výpočet).
  Volitelně malé rozdělení dle kategorie pod částkou (doučování X Kč,
  hlídání Y Kč, tábory Z Kč) — drobným písmem, ne graf.
- Pod tím **tabulka záznamů**, řazená od nejnovějšího: datum/období,
  kategorie (barevný štítek dle DESIGN_SYSTEM), zdroj (interní/
  smluvní/ruční — ikona, ne text), částka, poskytovatel, doklad
  (odkaz/náhled, pokud existuje). Filtr nad tabulkou: kategorie,
  zdroj, rozsah data.
- Tlačítko „+ Přidat výdaj" otevře formulář se třemi kartami zdroje
  (interní/smluvní/ruční) — u „ruční" je nahrání dokladu POVINNÝM
  krokem před uložením, ne dodatečnou možností.
- Žádné procento, žádný graf, žádný odkaz na SPVPP koš kdekoli v UI
  dítěte — to je striktně za hranicí toho, co KO/pěstoun potřebuje
  vidět.

Vztah k organizační SPVPP evidenci (sekce C): `supportExpenses`
záznamy jsou volitelně (`sourceRef`) provázané do
`organizations/{orgId}/spvpp/{year}/expenses` stejným mechanismem jako
`respitEvents`/`courses` — organizace tak vidí agregát bez toho, aby
dítě neslo jakoukoli vazbu na organizační vyúčtování ve své vlastní
obrazovce.

### F. Účetní export (budoucí modul, mimo tento build — ale model je na něj připravený)

**Důležité odlišení role:** Doprovázení.com NENÍ účetní software.
Cílem je poskytnout organizaci **strukturovaná data** (doklady + částky
+ kategorie/koš + období), která její vlastní účetní/účetní software
(Pohoda, Money S3, iDoklad, POHODA mServer apod.) zpracuje běžným
způsobem — systém sám nic neúčtuje, nevede podvojné účetnictví, negeneruje
daňové doklady.

**Proč to zmiňuje už teď, i když se stavět nebude:** protože datový
model navržený v sekcích C–E (`documentRef` na každém výdaji, `bucket`/
`category`, `date`/`period`, jasně oddělené `sourceRef`/`childRef` pro
dohledatelnost) je **navržený tak, aby export šel postavit později BEZ
přepracování dat** — bude to v zásadě jen dotaz přes existující
`expenses`/`supportExpenses` podkolekce + generování CSV/XLSX, ne nový
datový model. Až se bude stavět (mimo tento build, samostatné téma k
domyšlení):
- Export pravděpodobně po organizaci a období (měsíc/kvartál/rok),
  se sloupci: datum, částka, koš/kategorie, doklad (odkaz na soubor),
  dodavatel/poskytovatel, poznámka.
- **GDPR minimalizace**: export pro účetnictví pravděpodobně NEPOTŘEBUJE
  jméno ani RČ dítěte — stačí interní UID nebo anonymní odkaz, doklad
  samotný (faktura) už jméno dodavatele obsahuje přirozeně. Toto ověřit
  s uživatelem/účetní organizace až se bude modul reálně navrhovat.
- Zvážit rovnou formát pro import do konkrétního SW (Pohoda XML, iDoklad
  API), pokud uživatel bude vědět, co organizace/účetní reálně používají.
- **Potvrzení, že tohle už z velké části máme:** princip „šablona ×
  příjemce" (verzovaný formát výstupu per instituce — jiný formát pro
  ÚP, jiný pro KÚ, jiný pro konkrétní účetní SW, změna formátu jedné
  instituce = nová verze šablony, ne zásah do kódu) je ve skutečnosti
  totéž, co už řešíme u dokumentových šablon (§5.6, verzované per
  `docType`) — až se tento export bude reálně stavět, stačí použít
  STEJNÝ mechanismus (verzovaná šablona per příjemce), ne vymýšlet
  nový vzor.

---

## 4.5 Spis vs. Dohoda — cross-org viditelnost historie (VYŘEŠENO, viz §13.1)

**Rozhodnutí uživatele: Varianta A.** Spis je org-nezávislá entita
(jako `children`), Dohoda patří jedné organizaci a má vlastní
životnost (`validFrom`/`validTo`). Viditelnost historie napříč
organizacemi, které měly s rodinou/dítětem Dohodu, je **směrová, ne
symetrická**:

- **Vlastní období organizace: vidí VŠE** (zápisy, poznámky, chat,
  hlasové přepisy, dokumenty všech stavů) — natrvalo, i po skončení
  vlastní Dohody.
- **Období PŘED vlastní Dohodou** (organizace, které měly Dohodu
  dřív): vidí jen **„nutné minimum"** = fakta (termíny/délka návštěv,
  systémové záznamy) **+ oficiální dokumenty odeslané OSPOD/soudu**.
  NIKDY poznámky KO, chat, hlasové přepisy, ani dokumenty, které
  nedošly do stavu „odesláno OSPOD/soud".
- **Období PO vlastní Dohodě** (organizace, které převzaly rodinu
  později): **nevidí nic**.

Příklad (DO1 2020–2022 → DO2 2022–2024 → DO3 2024–dosud): DO3 vidí
svoje vše, DO2+DO1 jen nutné minimum. DO2 vidí svoje vše, DO1 jen
nutné minimum, DO3 nevidí vůbec. DO1 vidí svoje vše, DO2+DO3 nevidí
vůbec.

### Proč to NEJDE řešit jako filtr nad stejnými daty

Firestore security rules umožňují jen povolit/zakázat CELÝ dokument —
neumí vrátit „jen některá pole" spolehlivě (klient by musel sám čestně
vybrat, která pole chce, a rules na to nejde spolehnout). Proto:

**Plný záznam** (`timeline/{id}`, `documents/{docId}`, `messages/{id}`)
nese denormalizované, neměnné pole `createdByOrgId` — čitelný VŽDY jen
organizací, která ho vytvořila (bez ohledu na to, jestli má pořád
aktivní Dohodu).

**„Nutné minimum" je SAMOSTATNÝ, redukovaný záznam**, generovaný
službou/Cloud Function automaticky při vzniku kvalifikujícího
originálu — ne filtr nad plným dokumentem:

```
families/{familyId}/historyDigest/{id}
  kind: 'visit' | 'system' | 'document_sent'
  createdByOrgId, segmentValidTo         // konec Dohody, která ho vytvořila
                                          // (nebo null, pokud stále aktivní)
  occurredAt/sentAt
  // POUZE bezpečná pole dle typu:
  visit:          { durationSeconds, location }        // ŽÁDNÝ text poznámky
  system:         { eventType, refIds }                 // celé (compliance)
  document_sent:  { title, sentTo: 'ospod'|'soud', fileRef, sentAt }
```

Vzniká automaticky, když:
- `timeline` záznam typu `visit` se uloží (fakta se zkopírují, tělo
  poznámky/zápisu NE),
- `timeline` záznam typu `system` se uloží (celý, je to compliance),
- `documents/{docId}.status` dosáhne `odeslano_ospod` nebo
  `odeslano_soud` (v tu chvíli se vytvoří/aktualizuje digest s
  finálním souborem).

Poznámky (`type: note`), hlasové zápisy (`voice_entry` vč.
`originalTranscript`), chat (`messages`) a dokumenty ve stavu
konceptu/interního schvalování **nikdy nemají digest** — pro ně
`historyDigest` neexistuje, takže je nemůže vidět nikdo mimo
vytvářející organizaci, ať dělá cokoli.

### Pravidlo čtení (princip pro rules)

Pro organizaci O čtoucí historii Spisu {familyId}:
1. **Vlastní záznamy** (`createdByOrgId == O`) → čti plný dokument
   odkudkoli (`timeline`, `documents`, `messages`).
2. **Cizí záznamy, jejichž `segmentValidTo` (konec Dohody tvůrce) je
   ROVNO NEBO STARŠÍ než `validFrom` vlastní Dohody O** pro tento Spis
   → čti JEN `historyDigest`, nikdy plný `timeline`/`documents`.
3. **Cizí záznamy vzniklé PO konci vlastní Dohody O** (tvůrce má
   `validFrom` pozdější než `validTo` Dohody O) → žádný přístup,
   ani na digest.

Toto vyžaduje v rules načíst vlastní Dohodu organizace O pro daný Spis
(`get()`, jak bylo očekáváno) — přijatelné,
protože se čte jen jednou za request na historii, ne per záznam.
**Zjednodušující předpoklad pro MVP:** jedna organizace má k danému
Spisu nejvýš jednu Dohodu v čase (žádné opakované návraty téže
organizace) — pokud se to v praxi stane, řeší se jako edge case
později, ne jako implicitní pravidlo teď.

Tím je **WF-3 (Předání rodiny jiné DO, §12)** skutečně jen UI nad touto
strukturou: ukončit starou Dohodu, založit novou, `historyDigest`
zpětně dorovnat pro případné retroaktivně odeslané dokumenty.

---

## 5. Role a bezpečnost

- Zaměstnanci (`isStaff`): superadmin, org_admin, vedouci_pobocky,
  teamleader, klicova_osoba, asistent_ko, zamestnanec. Vedoucí
  pobočky + teamleader = read-only (`isReadOnlyManager`).
- Externí role: `pestoun` (Auth účet, vázán přes `users/{uid}.
  fosterFamilyId`), `external` (přes `externalParticipantId`),
  `provider` (přes `providerInstitutionRef`, §6 A10 — NEMÁ
  `organizationId` vůbec, protože typicky obsluhuje víc organizací;
  scoping jde přes `institutionId`, ne přes `sameOrg`).
- Role se čte VÝHRADNĚ z Firestore `users/{uid}`, NIKDY z Custom Claims.
- **Klíčová past:** `sameOrg()` musí být VŽDY gated za `isStaff()` —
  pěstoun i EP mají `organizationId`, holé `sameOrg` by jim otevřelo celou
  organizaci. Vzor: `(isStaff() && sameOrg(...)) || úzký disjunkt pro
  pěstouna/EP přes profil`.
- **List dotaz vs. pole v pravidle:** Firestore zamítne CELÝ list dotaz,
  pokud není staticky dokazatelné, že každý dokument projde pravidlem.
  Rovnostní filtr dotazu musí zrcadlit pole v pravidle; autorský disjunkt
  musí být nepodmíněný. Testuj vždy jako NE-superadmin.
- Append-only podkolekce (audit, historie, verze, EP audit): `update,
  delete: if false`. Granty se nemažou — revoke nastavuje `validTo`.
- Magic linky: invitation-first (pozvánka → e-mail link → `users/{uid}`
  vytvořen z pozvánky). Nejde automatizovaně testovat, ověřuj ručně.
- Citlivá data: žádné údaje dětí do logů; do AI promptů jen nezbytné
  minimum; adresa rodiny se nikdy neposílá třetí straně automaticky;
  hesla AI programátor nikdy nezadává ani nečte.

### 5.1 Externí účastníci — permission engine (nejcennější kus systému)

Žádné speciální role (rodič/psycholog/škola) — jeden obecný účet + popisný
vztah (`relationLabel`, bez právních účinků) + přidělená oprávnění + audit.
Výchozí stav = vše zakázáno.

- Katalog oprávnění: ViewDocuments/Timeline/Photos/School/Medical*/
  Reports/Calendar, Upload/DownloadFiles, SignDocuments*, ChatWith*,
  ReceiveNotifications, ConfirmVisits, VideoCalls* (* = citlivé).
- Granty časově verzované: `validFrom/validTo` (revoke = validTo, nikdy
  delete) + `timeWindows` (daily/weekly, days[], from/to, weekParity
  all/odd/even).
- Citlivá oprávnění = 3 kroky, 3 různí aktéři, vše auditované:
  `requestGrant` (doklad: reasonType+sourceType+důvod) → `approveGrant`
  (vedení) → `activateGrant` (KO). Necitlivá: `grantDirect` jedním krokem.
- Registrace externisty: jméno, telefon, e-mail. **RČ ani WhatsApp
  NEPOŽADOVAT jako povinné** — je to citlivý údaj navíc bez jasného
  právního důvodu; ověření identity řeš magic linkem/e-mailem, ne sběrem
  zbytečných osobních dat (poznámka k odchylce od Antigravity návrhu).

### 5.1.1 Šablony oprávnění pro typy externích účastníků (NOVÉ)

Dnes se každý grant nastavuje ručně per EP — funguje to, ale KO by
u desítek OSPOD kontaktů pořád klikala to samé. Řešení: **organizace
si v nastavení (viz §5.7) připraví šablony** podle `relationLabel`
kategorie (OSPOD, biologický rodič, psycholog, škola, soud…), které
KO při zakládání/upravování konkrétního grantu jen **vybere jako
výchozí stav** — nešetří to schvalovací kroky, jen vyplňování.

```
organizations/{orgId}/externalRoleTemplates/{templateId}
  name                          // „OSPOD — standardní", vlastní název
  category                      // vazba na relationLabel kategorii
  defaultPermissions: {
    viewDocuments, viewTimeline, viewPhotos, viewSchool,
    viewMedical*, viewReports, viewCalendar,
    uploadFiles, downloadFiles,
    signDocuments*, chatWith*, receiveNotifications,
    confirmVisits, videoCalls*             // * = citlivé, viz níže
  }
  defaultTimeWindows                       // volitelné, např. asistovaný
                                            // kontakt jen v určité dny/hodiny
  suggestedReasonType                      // předvyplní se do requestGrant,
                                            // needuje se schválit
  createdBy, updatedAt
```

**Zásadní pravidlo, které se NESMÍ obejít:** šablona je zkratka pro
**vyplnění**, ne zkratka pro **schválení**. Necitlivá oprávnění ze
šablony jdou rovnou (`grantDirect`), ale citlivá (`*`) projdou i
nadále celým tříkrokovým schvalovacím řetězcem (`requestGrant` →
`approveGrant` → `activateGrant`) — šablona jen předvyplní
`reasonType`/`sourceType`, člověk pořád potvrzuje. Kdyby šablona
mohla obejít schvalování citlivých oprávnění, ztratí celý permission
engine smysl auditovatelnosti, na kterém stojí.

## 5.5 Import, Export a Záloha

**Proč tohle rozhoduje o tom, jestli se organizace vůbec zapojí:**
strach z „tep práce, co bychom museli udělat, abychom tam nacvakali
všechny naše dohody, pěstouny, děti" je hlavní důvod, proč by DO
mohla rezignovat na přechod. Systém musí nabídnout **víc cest podle
toho, jakou kapacitu a IT zázemí organizace má** — ne jednu univerzální.

### Společný mechanismus pro cesty A–C: staging → report → commit → undo

Ať data přijdou jakoukoli cestou (AI, šablona, profesionální API), **nikdy
se nezapisují přímo do produkčních kolekcí**. Vždy projdou stejným
kanálem:

```
organizations/{orgId}/importJobs/{jobId}
  method: 'ai_assisted' | 'template' | 'professional_api'
  status: staging|reviewing|confirmed|committed|rolled_back|failed
  sourceFileRef (volitelné), summary: {
    fostersDetected, childrenDetected, agreementsDetected,
    warnings[], errors[]
  }
  committedAt, rollbackDeadline (committedAt + 30 dní)
  createdBy, createdAt
  └── stagingRecords/{id}
        rawRow, mappedEntity: {type, fields{}}, confidence, issues[]
```

Organizace vždy nejdřív vidí **report** („rozpoznali jsme 34 pěstounů,
51 dětí, 34 aktivních Dohod; 3 záznamy chybí RČ, 2 vypadají jako
duplicita"), potvrdí/opraví, teprve pak `commit` skutečně založí
entity v `families`/`fosterPersons`/`children`/`agreements`. Po
`commit` běží **30denní okno na kompletní vrácení** (manifest
vytvořených ID → hromadné smazání), ne že by šlo jen doufat, že se
nic nepokazilo.

### A. AI-asistovaný import (pro organizace bez připraveného formátu)

Nahrají cokoli, co mají (Excel, CSV, i nesourodý Word export ze staré
databáze) — AI navrhne mapování sloupců/textu na entity a naplní
`stagingRecords`. Člověk potvrzuje návrh s náhledem, ne slepě odklikne.

### B. Šablona (pro organizace, co si poradí samy)

Předpřipravený vzor (`.xlsx`, sloupce 1:1 podle entit — list „Pěstouni",
list „Děti", list „Dohody"), organizace jen doplní řádky. Nahrání jde
stejnou `stagingRecords` cestou, ale bez potřeby AI mapování (sloupce
už sedí) — validace je striktní (formát RČ, povinná pole, formát
data) a report po řádcích ukáže přesně, co se nenačetlo a proč.

### C. Profesionální import přes API (pro IT oddělení organizace)

Dokumentovaný JSON/CSV kontrakt zrcadlící `families`/`fosterPersons`/
`children`/`agreements` schéma (viz `001-IDENTITY_MODEL.md` a §4.1) +
autentizovaný batch endpoint (krátkodobý token vydaný superadminem per
organizace). **Nejlepší praxe, kterou dodržet:**
- Idempotence — každý řádek nese `externalId` (ID ze staré databáze
  organizace), opakované spuštění stejného importu nesmí duplikovat.
- Dry-run je POVINNÝ první krok, `commit` je vždy explicitní druhé
  volání, nikdy automatický.
- Firestore batch limit ~500 operací/batch — import chunkuje, ne
  jeden obří zápis.
- Runbook pro IT organizace: mapovací dokument (jejich pole → naše
  pole), staging prostředí k vyzkoušení, kontrolní součty před
  ostrým přechodem (počet pěstounů/dětí/Dohod se musí shodovat).
- Stejný `importJobs`/`stagingRecords` mechanismus jako A/B — jen
  vstup je API volání, ne upload souboru. Nestavět druhý paralelní
  systém.

### D. Ruční zakládání od nuly (bez importu)

Vedení založí organizaci a účty KO (§6, A9) → KO ručně zakládá Spisy,
Dohody, nahrává dokumenty postupně. Žádná nová funkcionalita netřeba —
je to prostě běžné používání M1–M2 bez importu. Vhodné pro malé
organizace nebo ty, co chtějí čistý start.

### E. Postupný přechod „za chodu" (NOVÝ nápad, doporučuji přidat)

Kombinace D s minimalistickým importem jen **aktivních vztahů**
(pěstoun, dítě, aktivní Dohoda — bez historie) přes A/B/C, a **zbytek
detailů (historie, staré dokumenty) se doplňuje postupně, jak KO
rodinu při normální práci navštíví** — ne najednou při přechodu.
Tohle přímo navazuje na princip „vzorek před sweepem" (§11 bod 2) a
je pravděpodobně nejméně odstrašující cesta pro organizace se
starými nebo nepořádnými daty: nemusí hned rozhodnout, co se starou
historií, stačí mít funkční kostru od prvního dne.

### F. Skenování/fotografování šanonů — DVĚ VRSTVY, druhá je citlivá (tvůj nápad)

**Vrstva 1 — bezpečná, levná, hned k dispozici:** fotka/scan stránky
se prostě přiloží k Spisu/dítěti jako `documents/{docId}` typu
`archiv_historicky` — nerozparsovaný obrázek/PDF s ručním popiskem
(datum, stručný obsah). Žádná AI, žádné extra náklady navíc oproti
běžnému nahrání dokumentu (§6, A4 ingest workflow to už řeší). Tohle
lze dělat od začátku bez obav.

**Vrstva 2 — AI extrakce obsahu do strukturovaných dat — SCHVÁLENO
uživatelem, ŘÍZENÝ PROVOZ (ne volně dostupné každé organizaci):**

- **Zapíná to VÝHRADNĚ superadmin, per organizace jednotlivě** —
  žádný self-service přepínač pro org_admina. Funkce je defaultně
  vypnutá pro každou novou organizaci.
  ```
  organizations/{orgId}.scanExtraction: {
    enabled: bool,                    // superadmin přepíná
    enabledBy, enabledAt,
    tokenLimit: {period: 'monthly', amount},  // kvóta v tokenech/Kč
    tokensUsedThisPeriod,             // resetuje se s periodou
    creditBalance                     // volitelné dokoupení kreditu
                                       // NAD rámec limitu — mechanismus
                                       // plateb NENÍ domyšlený, jen pole
                                       // připravené (viz níže)
  }
  ```
- **Limit dojde → funkce se pro organizaci potichu nezastaví bez
  varování** — UI ukáže „došel limit AI zpracování, kontaktujte
  podporu nebo dokupte kredit" PŘED vyčerpáním (např. při 80 % a
  100 %), nikdy ne tichý pád uprostřed dávky.
- **Platba za kredity navíc — VĚDOMĚ NEDOŘEŠENO** (uživatel to
  potvrdil): potřeba bude řešit platební bránu, fakturaci, DPH režim
  — to je celé samostatné téma pro pozdější fázi. Datové pole
  `creditBalance` je připravené, ať se návrh na to nemusí bourat, ale
  žádný platební tok se STAVĚT NEBUDE, dokud nebude byznys model
  vyjasněný (viz §5.8).
- **GDPR zůstává v platnosti jako podmínka provozu, ne jako otevřená
  otázka k řešení znovu:** DPA s poskytovatelem AI na úrovni platformy
  Doprovázení.com, nikdy automatický zápis do timeline bez lidského
  schválení každého záznamu zvlášť — to jsou provozní podmínky, za
  kterých superadmin funkci vůbec organizaci zapne, ne technický detail
  k diskuzi při každé aktivaci.
- Cenové úrovně (jen index vs. plný přepis) zůstávají v platnosti dle
  původního návrhu výše — jen teď navíc s kontrolou kvóty.

### Export — protiváha proti strachu z „uvěznění v systému"

Strach z pracného vstupu je jen polovina problému — druhá polovina je
strach „a co když se nám to nebude líbit, dostaneme svoje data zpátky?".
**Self-service export celé organizace** (podobný formát jako šablona
z cesty B, aby šel teoreticky i zpětně naimportovat jinam) musí být
dostupný od prvního dne, ne až na vyžádání podpoře. Org_admin klikne
„Exportovat všechna data organizace" → dostane strukturovaný archiv
(XLSX/CSV + přiložené dokumenty) e-mailem/ke stažení. Tohle je
psychologicky stejně důležité jako snadný import.

### Bezpečné předání při odchodu MIMO platformu (exit transfer) — NOVÉ

**Pozor na rozlišení, ať nedojde k záměně:** tohle NENÍ mechanismus pro
přechod rodiny mezi dvěma organizacemi UVNITŘ našeho systému — to je
už elegantně vyřešené v §4.5 (UID/Spis zůstává v systému, mění se jen
přístupová práva přes Dohodu, žádný export/import netřeba). Tohle
řeší jinou situaci: **organizace (nebo konkrétní rodina) opouští
platformu úplně** — směrem k subjektu, který naším systémem vůbec
neprochází (jiný software, papírová archivace, zanikající
organizace předává agendu jinam).

Pro tento scénář stojí za převzetí bezpečnější mechanismus předání,
než je prostý e-mailový odkaz ke stažení:

```
organizations/{orgId}/exitTransfers/{id}
  scope: 'family' | 'organization'
  initiatedBy, initiatedAt
  archiveRef                        // šifrovaný ZIP (AES-256, viz §5.5 Záloha)
  manifestHash                      // SHA-256 celého balíčku, pro ověření integrity
  handoffLink: {token, expiresAt}    // platnost např. 7 dní, pak automaticky nedostupné
  secondFactor: {phoneNumber, smsCodeHash}  // SMS kód jako druhý faktor
                                              // k převzetí, ne prosté kliknutí na odkaz
  claimedAt, claimedByPhone
```

Tok: org_admin vytvoří exit transfer → systém vygeneruje odkaz s
omezenou platností → **příjemce ho otevře a musí navíc zadat SMS kód**
poslaný na telefon, který organizace zadala jako ověřený kontakt
příjemce (ne organizace samotné — to je záměrně oddělený kanál) →
teprve pak stažení zašifrovaného balíčku, s manifestem umožňujícím
ověřit integritu (hash). Stažení se zapíše do audit stopy (§8).
Přísnější než běžný self-service export výše, protože jde o
nevratné opuštění platformy s citlivými daty dětí, ne o běžnou
kontrolu vlastnictví dat.

### Lehký přístup pro externí účetní — SMS 2FA + časově omezený token (NOVÉ)

**Jiný vzor než Poskytovatel (§6, A10) nebo Externí účastník (§5.1)** —
externí účetní organizace typicky nepotřebuje trvalý účet s
magic-linkem, jen **jednorázový/opakovaný přístup ke schváleným
finančním exportům**, bez plného přihlášení do systému:

```
organizations/{orgId}/accountantAccessTokens/{id}
  createdBy (org_admin/vedení), createdAt
  validTo                          // krátká platnost, např. 48 hodin
  phoneNumber                      // POVINNÉ — účetní telefon, druhý faktor
  smsCodeHash                      // jednorázový PIN, ne uložený v čitelné podobě
  approvedFileRefs: [...]          // JEN konkrétní schválené soubory,
                                    // ne přístup do celého systému
  usedAt, downloadLog: [{fileRef, downloadedAt}]
```

Tok: vedení/ekonomka vygeneruje balíček schválených exportů + token →
pošle účetní odkaz → účetní klikne → systém pošle SMS PIN na zadané
číslo → po zadání PINu vidí **izolovanou stránku jen se schválenými
soubory ke stažení**, nic jiného ze systému → stažení se loguje.
Vypršení `validTo` znepřístupní odkaz i se správným PINem. Vhodné
tam, kde by plný účet (§2 Poskytovatel/EP) byl zbytečně těžký nástroj
pro to, co účetní skutečně potřebuje — jen stáhnout schválené doklady.

### Záloha — DVĚ VRSTVY: platformní (provozní) a organizační (self-service)

**Vrstva 1 — platformní DR záloha (beze změny, jak bylo navrženo):**
pravidelná automatická záloha celé platformy (noční/týdenní snapshot),
přístup jen superadmin platformy, provozní pojistka proti ztrátě dat
na straně Doprovázení.com — organizace o ní ani nemusí vědět.

**Vrstva 2 — organizační záloha (NOVÉ, self-service, na přání
uživatele):** organizace chce vlastní, ŠIFROVANOU zálohu, kterou má
pod kontrolou a může si ji uložit, kam sama chce.

```
organizations/{orgId}/backupConfig
  schedule: {enabled, dayOfWeek ('FR' apod.), time, timezone}
  destination: {
    type: 'download' | 'gdrive' | 'onedrive' | 'ftp',
    connectionRef (OAuth token/FTP přihlašovací údaje — ŠIFROVANÉ
                    uložení, nikdy plaintext v dokumentu),
    path
  }
  encryption: {method: 'AES-256', keyOwnership: 'organizace'}
    // KLÍČ/HESLO si organizace spravuje SAMA, systém ho neukládá
    // v čitelné podobě (jen salted hash pro ověření správnosti hesla
    // při obnovení) — ztráta hesla = ztráta možnosti zálohu rozšifrovat,
    // to je vědomý kompromis kvůli citlivosti dat dětí
organizations/{orgId}/backupJobs/{jobId}
  triggeredBy: 'schedule' | 'manual'      // manuál = tlačítko "Zálohovat teď"
  requestedAt, startedAt, finishedAt
  status: queued|running|completed|failed
  scope: 'full'                            // stejný obsah jako self-service
                                            // export výše (XLSX/CSV+dokumenty)
  sizeBytes, deliveryConfirmation           // potvrzení doručení na cíl,
                                            // NE samotný soubor v Firestore
```

**UI: dvě tlačítka na jedné obrazovce** — „Nastavit pravidelnou zálohu"
(den v týdnu, čas, cíl) a „Zálohovat teď" (okamžité spuštění mimo
rozvrh, pro before-you-do-something-risky pocit jistoty). Cíl zálohy:
stažení na disk, nebo napojení na Google Disk / OneDrive / FTP přes
uložené přihlašovací spojení (obdoba OAuth konektoru — potřebuje
vlastní autentizační tok per organizace, ne sdílený účet).

### Obnovení ze zálohy — VYSOCE RIZIKOVÁ operace, vlastní staging tok

Obnovení nesmí být „nahrát soubor → hotovo". Jde stejnou cestou jako
profesionální import (cesta C, §5.5 výše), jen ve druhém směru:

1. Nahrání šifrovaného souboru + zadání hesla (rozšifrování).
2. **Automatický pre-restore snapshot** aktuálního stavu organizace
   PŘED čímkoli — pojistka, kdyby se obnovení mělo vrátit.
3. **Dry-run diff report**: co se změní oproti současnému stavu (kolik
   entit přibude, kolik se přepíše, kolik případně zanikne) — ne
   tichý přepis.
4. Explicitní dvojité potvrzení org_adminem („rozumím, že tohle
   nahradí aktuální data organizace zálohou z data X").
5. Commit se zapíše do audit stopy (§8) jako mimořádná událost, ne
   běžná editace.

**Výchozí chování pro MVP: obnovení nahrazuje CELOU organizaci**
(katastrofický scénář — smazaná/poškozená organizace), ne částečné
sloučení jednotlivých záznamů — částečné/výběrové obnovení je
složitější (konflikty se současnými daty) a nechal bych ho jako
budoucí rozšíření, ne řešit v tomto buildu.

### Test obnovy zálohy — POVINNÝ GATE, ne volitelné ověření

**Záloha, která se nikdy nezkusila obnovit, není záloha.** Mechanismus
zálohy a obnovení výše se nepovažuje za hotový jen proto, že kód
existuje — před prvním ostrým nasazením (a pak periodicky, min. 1×
ročně) MUSÍ proběhnout **skutečný test obnovy** na izolovaném/
testovacím prostředí, ne jen na papíře:

```
organizations/{orgId}/backupRestoreTests/{id}
  performedAt, performedBy
  backupJobRef                     // která záloha se testovala
  restoreEnvironment: 'isolated_staging'  // NIKDY test přímo na produkci
  restoreSuccessful: bool
  integrityCheck: {
    recordCountsMatch: bool,       // počty klíčových entit sedí
    sampleRecordsVerified: bool    // namátková kontrola obsahu, ne jen počtů
  }
  measuredDurationMinutes          // reálný čas obnovy — pro odhad RTO
  notes
```

**Gate podmínka pro nasazení modulu M1.5 (Import/Export/Záloha) do
produkce:** existuje alespoň jeden záznam s `restoreSuccessful=true` a
`integrityCheck` oběma poli `true`, provedený PŘED tím, než organizace
začne se zálohou pracovat se skutečnými daty. Bez tohoto záznamu se
zálohovací mechanismus nepovažuje za ověřený, jen za napsaný.

---

## 5.6 Uživatelské nastavení a personalizace — vzhled, branding, šablony

**Důležité rozlišení, které drží design system konzistentní:** ne
všechno je pro každého. Osobní preference vzhledu patří **uživateli**
(mění si to každý sám pro sebe), branding a šablony patří
**organizaci** (mění to jen org_admin, platí pro všechny v organizaci
i navenek — třeba na dokumentech pro OSPOD).

### Osobní preference (per uživatel, `users/{uid}.preferences`)

```
preferences: {
  appearance: 'light' | 'dark' | 'system',   // 'system' = respektuje
                                              // nastavení OS/prohlížeče
  fontScale: 'normal' | 'velky' | 'velmi_velky', // škáluje CELOU
                                              // typografickou stupnici
                                              // proporčně (H1..H6, body),
                                              // NE jednotlivé úrovně
                                              // samostatně — jinak se
                                              // rozbije vizuální
                                              // hierarchie z
                                              // DESIGN_SYSTEM.md
  density: 'comfortable' | 'compact'         // rozestupy v seznamech/
                                              // tabulkách
}
```

**Proč fontScale škáluje celou stupnici, ne H1/H2/.../tučně/kurzívu
zvlášť:** volný výběr velikosti/řezu pro každou úroveň zvlášť by
rychle vedlo k nečitelným kombinacím a rozbité hierarchii (přesně to,
čemu se DESIGN_SYSTEM.md snaží vyhnout — „klid před efektem"). Tři
kroky škálování (normal/velký/velmi velký) pokrývají skutečnou
potřebu (lepší čitelnost, přístupnost) bez rizika ošklivého výsledku.
Tmavý režim respektuje stejné tokeny jako světlý (teplá paleta,
měkké rohy) — jen s tmavým pozadím místo krémového, ne černou/
studenou paletou (dolaď konkrétní barvy v `DESIGN_SYSTEM.md`, ne tady).

### Branding organizace (per organizace, jen `org_admin`)

```
organizations/{orgId}.branding: {
  displayName,                    // zobrazovaný název, pokud jiný
                                   // než právní název organizace
  logoRef,                        // nahrané logo (SVG/PNG)
  accentPreset: enum(...)         // VÝBĚR Z KURÁTOROVANÉ PALETY barev
                                   // (např. 6–8 odstínů prověřených na
                                   // kontrast/přístupnost), NE volný
                                   // barevný picker — jinak organizace
                                   // omylem zvolí barvu, která nesplňuje
                                   // kontrast pro čitelnost
  fontPairing: enum(...)          // VÝBĚR z 3–4 kurátorovaných dvojic
                                   // písem (nadpis+text), NE libovolný
                                   // Google Fonts picker ze stejného
                                   // důvodu jako u barvy
}
```

**Proč kurátorované předvolby, ne volný výběr:** lidé si rádi hrají
(„hračičky"), ale volný RGB picker nebo libovolný font by mohl
snadno vyrobit nečitelnou/neprofesionální kombinaci — obzvlášť u
produktu, který cíleně staví na klidném, důvěryhodném vzhledu
(DESIGN_SYSTEM.md §1). Kurátorovaná paleta dá pocit „je to naše,
přizpůsobili jsme si to" bez rizika ošklivého nebo nepřístupného
výsledku.

### Sazby za respit (per organizace, jen `org_admin`) — ZÁKLADNÍ funkce, ne prémiová

Na rozdíl od brandingu/šablon výše je tohle přímo napojené na
zákonnou evidenci respitu (§4.4.B.1), ne kosmetika — proto zůstává
v základní úrovni (§5.8), i když leží fyzicky ve stejné obrazovce
Nastavení jako ostatní organizační položky.

```
organizations/{orgId}.respitRates: {
  hlidaniZaHodinu: Kč,
  doucovaniZaHodinu: Kč
  // rozšiřitelné o další kategorie, pokud se rozsah proplácení
  // v budoucnu rozšíří (§4.4.B.1)
}
```

Nastaví se jednou, používá se jako výchozí sazba pro každou
`scheduledActivity` s `rate.source='org_default'` — jednotlivá
aktivita může mít výjimku (`'custom'`), ale běžný případ je „nastav
jednou, plať se to všude stejně".

### Šablony dokumentů (per organizace, propojeno s §6 A1/A2 workflow)

```
organizations/{orgId}/documentTemplates/{docType}
  logoOverrideRef                 // pokud jiné než hlavní logo organizace
  headerText, footerText          // volně upravitelné
  introText, closingText          // ohraničené, upravitelné bloky textu
                                   // KOLEM povinného právního obsahu —
                                   // NE plná editace celého dokumentu
  accentOverride                  // volitelně jiná barva jen pro tisk/PDF
  updatedBy, updatedAt, version
```

**Klíčové omezení, na které nezapomenout:** u dokumentů se zákonným
obsahem (report pro OSPOD, Dohoda, apod.) smí organizace upravovat jen
**kosmetické a ohraničené textové bloky** (logo, hlavička/patička,
úvodní/závěrečný text) — NIKDY odstranit nebo přepsat právně
požadovaná pole/formulace uvnitř dokumentu. Šablonový editor proto
musí být „vyplň rámeček kolem", ne WYSIWYG editor celého dokumentu.

### Další nápady k personalizaci (bonus, netřeba řešit vše hned)

- **Preference notifikací** — e-mail vs. jen v appce, „tiché hodiny"
  (nechodit push notifikace v noci) — přirozeně navazuje na již
  navržené `notifications/{id}` (§4.1).
- **Rychlé odkazy / oblíbené** — připíchnuté rodiny/úkoly na
  domovské obrazovce KO, čistě osobní, žádný dopad na data.
### Vlastní názvosloví (NOVÉ, rozpracováno na přání uživatele)

**Klíčový princip: mění se JEN zobrazovaný název, NIKDY skutečná
hodnota.** V databázi zůstává vždy kanonický právní/systémový klíč
(`zprostredkovana`, `nezprostredkovana`, `svěřenectví_953` apod.) —
mění se pouze to, jak se ten klíč vykreslí v UI dané organizace. Je to
stejný princip jako i18n překlad, jen si organizace „překládá" do
vlastní řeči, ne do jiného jazyka. Bez tohoto oddělení by přejmenování
rozbilo SPVPP vykazování, dokumenty pro OSPOD i srovnatelnost mezi
organizacemi.

```
organizations/{orgId}.terminologyOverrides: {
  fosterCareType: {
    zprostredkovana:    {label: 'Typ A', colorPreset?, note?},
    nezprostredkovana:  {label: 'Typ B', ...},
    svěřenectví_953:    {label: 'Typ C', ...}
  },
  sharingLevel: { private: {...}, internal: {...}, foster: {...}, ospod: {...} },
  // další relabelovatelné codelisty dle potřeby — viz whitelist níže
}
```

**Whitelist — co JDE přejmenovat:** enumy/codelisty určené k
zobrazení KO/vedení (typ pěstounské péče, `sharingLevel`, vlastní typy
kalendářních událostí — ty už dnes mají `organizations/{orgId}/
codelists/...`, tohle je jen rozšíření stejného principu). **Co NEJDE
přejmenovat:** cokoli, co se doslovně objevuje v exportovaném/tištěném
právním obsahu (dokumenty pro OSPOD/soud, SPVPP report, jakýkoli export
mimo systém) — tam se VŽDY vykreslí kanonický zákonný termín, nehledě
na nastavení organizace. Vlastní název může být v internním UI
zobrazený navíc v závorce/tooltipu vedle kanonického, ale nikdy ho
nesmí nahradit tam, kde to čte někdo mimo organizaci.

**Praktický dopad na tvůj příklad:** organizace si typ pěstounské péče
přejmenuje na „Typ A/B/C" pro svůj přehled — ale interní report pro
stát nebo dokument pro OSPOD pořád vytiskne „zprostředkovaná
pěstounská péče", protože to čte úředník, který „Typ A" nezná a znát
nemá.

**Historie se neverzuje** — přejmenování je živé promítnutí, ne
snímek v čase. Pokud organizace „Typ A" později přejmenuje na něco
jiného, všechny staré záznamy (i historické) se v UI okamžitě
zobrazí pod novým názvem — nedává smysl u kosmetického štítku
uchovávat, jak se jmenoval kdysi.

**Cross-org viditelnost (návaznost na §4.5):** když si historii Spisu
prohlíží zaměstnanec JINÉ organizace (ať už vlastní segment, nebo
„nutné minimum" u minulosti), kanonická hodnota se vždy zobrazí podle
**TERMINOLOGIE PROHLÍŽEJÍCÍ organizace**, ne organizace, která záznam
vytvořila — je to jen štítek pro čtenáře, ne vlastnost dat.

**UI:** obrazovka „Vlastní názvosloví" v nastavení organizace
(org_admin), seznam relabelovatelných položek s kanonickým názvem +
stručným vysvětlením právního významu vedle prázdného pole na vlastní
název (prázdné = použije se výchozí český termín). Volitelně barevný
štítek z kurátorované palety (§5.6 branding) k vizuálnímu odlišení.

---

## 5.7 Nastavení — obsah podle role (KDO VIDÍ CO)

**Kontejner (modál/svislé záložky/jednosloupcový obsah, viz dodatek
DESIGN_SYSTEM.md) je pro všechny stejný — mění se jen to, které
záložky se vůbec zobrazí a co je uvnitř nich vidět/editovatelné.**
Skrytá záložka se nerenderuje vůbec (ne "vidět, ale disabled") —
zbytečná viditelnost matoucích možností je stejná chyba jako chybějící
oprávnění.

### Zásadní distinkce: Nastavení ≠ Správa entit

Nastavení (tento modál) = **preference a konfigurace** (přepínače,
výběry, malé formuláře). Správa lidí/externistů (seznam zaměstnanců,
seznam externích účastníků a jejich grantů) je plnohodnotná **stránka
appky** (tabulka, filtrování, hromadné akce), ne položka uvnitř
modálu — přesně jako na claude.ai nejsou "členové organizace" uvnitř
Nastavení, ale ve vlastní administrativní sekci. `externalRoleTemplates`
(§5.1.1) JE ale v modálu, protože je to malý, opakovaně používaný
konfigurační seznam (pár šablon), ne velká entita s vlastním
životním cyklem.

### Matice viditelnosti

| Záložka | Superadmin | Org_admin | Vedení (readonly) | KO/zaměstnanec | Pěstoun | Externí účastník |
|---|---|---|---|---|---|---|
| Obecné (účet) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Vzhled (osobní) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Organizace/Branding | — | ✅ plný | 👁️ jen čtení | — | — | — |
| Šablony dokumentů | — | ✅ plný | 👁️ jen čtení | — | — | — |
| Vlastní názvosloví | — | ✅ plný | 👁️ jen čtení | — | — | — |
| Externí přístup — šablony (§5.1.1) | — | ✅ plný | 👁️ jen čtení | — | — | — |
| Oznámení | ✅ osobní | ✅ osobní + org politika | ✅ osobní | ✅ osobní | ✅ osobní | ✅ osobní |
| Zálohy | — | ✅ plný | 👁️ jen stav (kdy proběhla poslední) | — | — | — |
| Import dat | — | ✅ plný | 👁️ jen historie úloh | — | — | — |
| Legislativní parametry (§3.2) | ✅ plný | 👁️ jen čtení | 👁️ jen čtení | — | — | — |
| Organizace v systému (správa DO) | ✅ plný | — | — | — | — | — |
| Platformní záloha (DR, §5.5 vrstva 1) | ✅ plný | — | — | — | — | — |
| Účet (odhlášení, smazání) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

`✅ plný` = vidí i edituje. `👁️ jen čtení` = vidí obsah, žádné
editovatelné prvky (ani disabled tlačítka — rovnou to vykreslit jako
prostý text/přehled, ne needitovatelný formulář). `—` = záložka se
nerenderuje vůbec pro danou roli.

### Proč vedení vidí, ale needituje branding/šablony/názvosloví

Vedoucí pobočky a teamleader jsou strukturně `isReadOnlyManager`
(§5) — to platí i tady. Vidí, jak je organizace nastavená (užitečné
pro přehled a školení nových KO), ale editace zůstává u org_adminů,
kteří nesou odpovědnost za to, co jde ven na dokumentech pro OSPOD.
Výjimka z jinak přísného „read-only": Oznámení jsou vždy osobní
nastavení každého uživatele, tam readonly status nehraje roli —
i vedoucí si nastavuje svoje tiché hodiny sám.

### Proč KO/zaměstnanec nevidí žádnou org záložku vůbec (ne jen needituje)

KO pracuje s tím, co organizace nastavila (branding, šablony,
názvosloví), aniž by o tom vůbec musela přemýšlet — je to schválně
neviditelné, ne uzamčené. Kdyby viděla needitovatelnou verzi
(šedivé/disabled), jen by to matlo pozornost a vyvolávalo zbytečné
dotazy „proč to nejde upravit". Totéž platí pro pěstouna a externího
účastníka — jejich Nastavení je čistě o nich samých, ne o organizaci.

### Pěstoun a externí účastník — obsah „Oznámení" má smysl rozvést

I když je záložka stejná napříč rolemi, obsah **musí** odpovídat
tomu, co daná role vůbec dostává:

- **Pěstoun:** e-mail při novém sdíleném zápisu/dokumentu ke
  schválení, připomínka blížící se návštěvy, tiché hodiny.
- **Externí účastník:** e-mail při novém dokumentu/reportu
  sdíleném podle jeho grantu (`ReceiveNotifications` z §5.1 katalogu
  — pokud tohle oprávnění nemá vůbec, záložka Oznámení pro něj
  buď zmizí, nebo ukáže jen vysvětlení „notifikace nejsou pro váš
  přístup povolené", ne prázdný needitovatelný formulář).

### Superadmin — proč nevidí branding/šablony/názvosloví žádné organizace

Superadmin nemá „svou" organizaci, ke které by se branding vztahoval
— spravuje platformu jako celek (§2 Persony). Pokud potřebuje
nahlédnout do nastavení konkrétní DO kvůli podpoře, jde to přes
samostatný „režim podpory" (impersonace s auditní stopou), ne přes
vlastní Nastavení superadmina — to je jiný mechanismus (mimo rozsah
tohoto buildu, jen si pamatovat, že bude potřeba).

---

## 5.8 Úrovně funkcí (základní/prémiové) a preview/demo účet

### Rozdělení funkcí — návrh, potvrď s uživatelem před stavbou entitlementů

**Princip:** základní úroveň musí pokrýt VŠECHNU zákonnou agendu bez
výjimky — organizace nesmí být nucena platit navíc za to, aby splnila
zákon (ZSPOD, GDPR). Prémiové jsou věci, které usnadňují/zrychlují
práci nad zákonný rámec.

| Základní (nutné pro provoz) | Prémiové (nad rámec) |
|---|---|
| M0–M6: identita, organizace, Dohoda, časová osa, hlasový zápisník, pěstounský účet, dokumenty, report OSPOD | AI-asistovaný import (§5.5.A) — mapování přes AI je nákladnější než šablona |
| M7: Respit/SPVPP/Vzdělávání evidence (§4.4, vč. B.1 plánované aktivity + sazby) — zákonná agenda | Sken vrstva 2 — AI extrakce dokumentů (§5.5.F) — tokenový limit, řídí superadmin |
| Ostatní dávky — jen stav (§3.1) | **E-shop nabídek** (objednávky, slevy, hodnocení, fakturace — §6 A10) — základní adresář institucí (jen kontakt) zůstává zdarma |
| Šablona/API import, ruční zakládání (§5.5 B/C/D) | Checklist framework (§6.12) — nad-zákonná pomůcka pro KO |
| Základní export/záloha (self-service, §5.5) | Účetní export (§4.4.F, M13) |
| Branding (logo, barva, písmo) | Vlastní názvosloví (§5.6) — kosmetika nad rámec nutného |
| Chat, notifikace, úkoly, **instituce (adresář)** | Pokročilé AI funkce (§9) nad rámec přepisu zápisníku |

```
organizations/{orgId}.plan: {
  tier: 'zakladni' | 'premium',
  entitlements: {                    // bounded mapa, feature flag per klíč
    aiAssistedImport: bool,
    scanExtraction: bool,            // duplikuje §5.5.F enabled, ALE
                                      // tady je to entitlement (má na to
                                      // nárok), tam je to superadmin
                                      // přepínač (skutečně zapnuto) —
                                      // obojí musí být true, aby fungovalo
    serviceCatalog: bool,
    checklistFramework: bool,
    customTerminology: bool,
    accountingExport: bool
  },
  billingNote: '— byznys/platební model NENÍ domyšlený, viz otevřená
                otázka níže —'
}
```

**Otevřená otázka, kterou je potřeba vyřešit PŘED M0, ne až za chodu:**
jak se organizace k „premium" dostane — samoobslužně platební branou,
ručně přes superadmina po domluvě, nebo je celý pilotní provoz zatím
zdarma a tiering se zapne až později? Datový model (`plan.tier`,
`entitlements`) je připravený fungovat v každém z těchto scénářů, ale
byznysové rozhodnutí musí padnout dřív, než se UI začne stavět kolem
placení (tlačítko „Upgradovat" vede kam?).

### Preview/demo účet — realistická seed data BEZ opakujících se příjmení

**Proč na tomhle záleží víc, než by se zdálo:** demo účet je první
dojem organizace, která zvažuje přechod. Pokud se ve fiktivních
rodinách objeví dvakrát stejné příjmení (stalo se to už dřív),
působí to jako neotestovaný, nedůvěryhodný systém — přesně opačný
dojem, než chce produkt dělat.

**Řešení — generátor jmen s garancí bez duplicit:**

```
seedData/namePool (konfigurační data pro generátor, ne uživatelská data)
  surnames: [~300 běžných českých příjmení, mužský i ženský tvar]
  firstNamesM: [~150], firstNamesF: [~150]
```

Algoritmus: **příjmení se táhnou bez navracení** (Fisher–Yates shuffle
celého poolu, pak postupné přidělování) — jakmile je příjmení použité
pro jednu rodinu/entitu, jde z dostupného poolu pryč, dokud se
nevyčerpá celý seznam. Pool (~300 příjmení) musí být větší než
očekávaný počet seed entit (desítky rodin), takže se za normálních
okolností nevyčerpá; pokud by seed měl být větší než pool, algoritmus
to nahlásí jako chybu při generování (STOP, ne tichý přechod na
duplicitu). **Výjimka, kterou je nutné explicitně ošetřit:** členové
JEDNÉ rodiny (rodiče + děti) sdílejí příjmení záměrně — to není
duplicita k řešení, jen dedupe je na úrovni RODIN, ne jednotlivých
osob v nich.

Další pravidla pro věrohodnost dema:
- Žádné jméno/příjmení, které by připomínalo skutečné zaměstnance
  Doprovázení.com nebo veřejně známé osoby — čistě syntetický pool.
  Před nahráním pool ručně projít, ne jen náhodně stáhnout seznam
  odněkud bez kontroly.
- RČ demo dětí/pěstounů generovat validní (správný kontrolní součet),
  ale s daty mimo reálný rozsah použitelný k záměně za skutečnou osobu
  (např. smyšlené, ale formátově platné).
- Seed pokrývá záměrně **různé stavy** (aktivní/ukončená Dohoda,
  blížící se lhůta návštěvy, chybějící dokument, dítě se stupněm
  závislosti) — demo má ukázat celou šíři funkcí, ne jen šťastnou
  cestu.
- **Preview účet běží v izolované organizaci** (`demo_org`,
  `isSandbox: true`), **automatický periodický reset** na čistý seed
  stav — konfigurovatelný interval (`sandboxResetIntervalHours`,
  výchozí např. 24h), spouštěný CRON/scheduled function, ne ruční
  akce. Demo prostředí musí jít kdykoliv „zahodit a začít znovu" —
  zájemce si může zkusit cokoliv rozbít/smazat, bez rizika, že se to
  nahromadí nebo že příští zájemce uvidí bordel po předchozím. Reset
  přepíše VŠECHNA data zpět na definovanou seed sadu bez ohledu na to,
  kolik toho mezitím uživatel vytvořil/smazal.

---

## 6. Hlavní workflow

### A1) Schvalovací workflow dokumentu

> Každý dokument nese vlastní UID (typ dle §4.3), verzi, datum, hash a QR
> na ověřovací stránku — to platí od prvního uložení, ne až při odeslání.

Stavy: `draft → foster_review → (commented|approved_foster) → final →
mgmt_review → closed|closed_foster_unapproved|closed_ko_unapproved|
closed_both_unapproved → sent|filed`.

1. KO založí dokument (`draft`) nebo přijme příchozí (ingest, viz A4).
2. KO edituje — nová verze do append-only `versions`.
3. KO → pěstoun (`foster_review`) — notifikace, dokument viditelný
   pěstounovi.
4. Pěstoun schválí NEBO okomentuje (smyčka 3↔4 se opakuje).
5. KO označí Konečný (`final`).
6. KO → vedení, výběr schvalovatele (`mgmt_review`).
7. Vedení schválí (`closed`) / zamítne (zpět `draft` s důvodem) / uzavře
   s výhradou (`closed_*_unapproved`).
8. Po uzavření: odeslat na úřad (`sent` + zápis do osy) nebo uložit do
   spisu (`filed`).

Kdo co smí: editace + kroky 1–6 = KO; krok 7 jen vedení; pěstoun jen krok
4 a jen u viditelných dokumentů. Vynuceno v UI i rules.

### A2) Report pro OSPOD

KO → „Vyplnit report" → vybere období → systém stáhne časovou osu za
období (stránkovaně, early-stop) → sestaví markdown (průběh péče,
návštěvy s délkou, vzdělávání vs. limit, shrnutí k doplnění) → založí
BĚŽNÝ dokument se `subjectRefs` na děti → jede automat A1. Report NENÍ
zvláštní entita.

### A3) Návštěva v rodině (mobil, jádro práce KO)

1. (Volitelně) plán v kalendáři.
2. KO na Ose spisu spustí „Návštěva" → Giant Timer obrazovka. Start:
   `startedAt` + jednorázová GPS do localStorage (rozjetá návštěva NENÍ
   ve Firestore, dokud neskončí — persistentní banner v shellu).
3. Ukončení: **teď vede přímo do hlasového zápisníku (§7)**, ne do
   prostého textového pole — to je hlavní změna oproti první verzi.
4. Po uložení zápisu: `startedAt/endedAt/durationSeconds/location` +
   batch update `lastVisitAt` (denormalizace).
5. Důsledky: „Čeká na vás" = spisy s `lastVisitAt` starším 45 dní (krize
   >60, ideálně navázáno na Dohodu — 2měsíční lhůta z §3); statistika
   návštěv týdne.

### A4) Příjem dokumentu zvenku (ingest)

`ingestDocument` → dokument (kind pdf/image, `draft`) + zápis do osy typu
`document` s přečteným textem. OCR zatím seam (Vertex Vision, TODO).
E-mailový kanál (pestoun.jmeno@…) čeká na MX/parser.

### A5) Chat a notifikace

4 úrovně soukromí (viz §7.4 — sjednoceno se sdílením zápisů): `private`
(sobě), `internal` (tým, pěstoun NIKDY), `foster` (KO↔pěstoun, jediná
úroveň viditelná pěstounovi), `ospod` (podklady pro úřad, pěstoun NIKDY).
Notifikace zakládá KLIENT odesílatele (žádné Cloud Functions — vědomé
zjednodušení). Zvonek = poll 60s, `markNotificationRead` + navigace.

### A6) Pozvání pěstouna (magic link)

KO → „Pozvat pěstouna" → `foster_invitations/{email}` + magic link e-mail
→ pěstoun klikne → `users/{uid}` vytvořen s rolí `pestoun` z pozvánky →
`/moje`. Stejný vzor pro EP (`ep_invitations`).

### A7) Životní cyklus oprávnění externího účastníka

Viz §5.1 pro model; workflow: pozvání → necitlivé `grantDirect` (1 krok)
nebo citlivé `requestGrant → approveGrant → activateGrant` (3 kroky, 3
aktéři) → vyhodnocení přístupu (`hasPermission` = aktivní ∧ v platnosti ∧
v časovém okně) → odebrání = `revokeGrant` (validTo=now, nikdy mazání).

### A8) Úkoly, instituce, vzdělávání

Úkol: termín, řešitel, poznámka → kanban dle termínu → checkbox hotovo.
Instituce: CRUD adresář dle typu. Vzdělávání: kurzy per pěstoun → součet
vs. limit (24/24/18 h) dle typu Dohody → „pod plánem" přehled +
upozornění na blížící se konec platnosti Dohody (nová vazba — viz §3).

### A9) Registrace organizace a zaměstnanci

Self-service `/registrace`. Zaměstnance zakládá org_admin (přes
sekundární Auth instanci). KO dostává rodiny přes `assignedTo` na Dohodě.
**Kapacita ~25 rodin je orientační přání, NE tvrdá vynucená hranice** —
realita provozu (nemoc kolegyně, sezónní výkyv, malá organizace bez
náhrady) běžně tenhle počet přesáhne. Systém proto při dosažení prahu
jen **zobrazí jemné upozornění vedení** ("KO Jana M. má nyní 27
rodin — zvažte přerozdělení"), nikdy nezablokuje přiřazení další
rodiny. Přesný práh je konfigurovatelný per organizace (výchozí 25),
ne natvrdo v kódu.

### A10) Katalog poskytovatelů a služeb — interní, NEVEŘEJNÝ e-shop (PRÉMIOVÁ funkce, §5.8)

Rozšíření entity Instituce (§6, A8) na skutečný e-shop vzor — jen
uzavřený do platformy (žádná veřejná URL, žádné SEO, přístup jen
přihlášeným uživatelům). **Základní adresář institucí (kontakt, typ)
zůstává v základní úrovni zdarma — teprve TOHLE (nabídky, objednávky,
hodnocení) je prémiové.**

**Dva typy poskytovatelů se chovají odlišně — sdílí jen vzhled
katalogu, ne workflow:** typ 70 (vzdělávání pěstounů) má rigidní tok
vázaný na zákonnou evidenci hodin (A10a), typ 80 (služby dítěti —
tábory/hlídání/doučování) má mnohem flexibilnější tok, který navíc
umí poskytovatele „interního" (vlastní zaměstnanec organizace, ne
externí firma) — viz A10b. Toto rozlišení se táhne datovým modelem
od základu (§4.3) — nejsou to dva popisky stejné věci.

```
institutions/{institutionId}          // existující entita, TT=70 nebo TT=80
  └── services/{serviceId}
        title, description,
        price: {amount, unit: 'za_hodinu'|'za_den'|'jednorazove'|'za_mesic'},
        discount: {type: 'percent'|'fixed', amount, validFrom, validTo}, // volitelné
        images: [fileRef...]          // poměr 4:5, galerie
        category: doucovani|hlidani|tabor|vzdelavaci_kurz|jine
        active: bool
        ratingAvg, ratingCount        // denormalizované
        └── reviews/{reviewId}
              rating (1–5), text, byUid, familyRef (volitelné), createdAt
```

**Katalog i hodnocení jsou sdílené napříč VŠEMI organizacemi na
platformě** (víc organizací = víc recenzí = užitečnější signál),
**objednávky a platby jsou vždy jen v rámci jedné organizace.**

- **Dvě zobrazení, přepínatelné** — galerie karet (obrázek 4:5,
  titulek, cena, hvězdičky) NEBO tabulkový seznam.
- **Detail nabídky:** plná galerie, popis, cena (přeškrtnutá původní +
  zvýrazněná zlevněná, pokud běží `discount`), hodnocení a recenze,
  poskytovatel, tlačítko dle typu (A10a/A10b níže).

### Zásadní pravidlo napříč A10a i A10b: platba VŽDY poskytovateli, NIKDY pěstounovi přímo

**Anti-fraud pojistka, ne detail.** Standardní tok je vždy: organizace
platí poskytovateli na základě jím vystavené faktury. **Přímá refundace
pěstounovi (proplacení něčeho, co si zaplatil sám) je výjimka**, ne
alternativní cesta — a musí být:
- explicitně označená vlastním příznakem (`isFosterReimbursement: bool`),
- **vždy** doprovázená povinným zdůvodněním (`reimbursementReason`,
  NENÍ volitelné pole, pokud je příznak true),
- **vždy** schválená bez ohledu na výši částky — žádný „auto-schválit
  malé částky" krok pro refundace, na rozdíl od běžných plateb, kde
  malé částky mohou mít lehčí schvalování.

Toto se vynucuje **na úrovni backendové validace/service layer, ne
jen v UI** — pokus zapsat `isFosterReimbursement=true` bez
`reimbursementReason` musí selhat i při přímém volání API, ne jen
zobrazit varování ve formuláři. Důvod je prostý: refundace přímo
pěstounovi je přesně ten vzor, kterým by šlo zneužít státní dotaci
(SPVPP) obcházením dodavatele — proto je záměrně těžší cestou, ne
zkratkou.

### A10a) Poskytovatel vzdělávání pěstounů (TT=70) — rigidní tok, zákonná vazba

Beze změny oproti předchozímu návrhu — rigidita je tady záměrná,
protože výstup se počítá do POVINNÉHO vzdělávání pěstouna (§3, §4.4.A).

```
fosterPersons/{fosterId}/courseEnrollments/{id}
  serviceRef                        // → institutions/{id}/services/{id}, TT=70
  initiatedBy: 'foster' | 'ko'
  status:
    'navrzeno_KO' | 'zajem_pestoun' | 'ke_schvaleni_vedeni' |
    'schvaleno_vedenim' | 'potvrzeno_pestounem' |
    'potvrzeno_poskytovatelem' | 'absolvovano' | 'faktura_nahrana' |
    'ukonceno' | 'zaplaceno' | 'zamitnuto' | 'zruseno'
  koSentBy, koSentAt
  approvedBy (vedení), approvedAt, rejectionNote
  fosterConfirmToken (jednorázový, expirace ~14 dní), fosterConfirmedAt
  providerConfirmToken (jednorázový), providerConfirmedAt
  completedByProviderUid, completedAt, certificateFileRef
  invoiceDocumentRef, invoiceUploadedAt
  closedBy (vedení), closedAt
  paidBy (vedení), paidAt
  educationHoursApplied: bool        // idempotence — hodiny se připíšou JEN JEDNOU
```

**Krok za krokem:**

1. **Zájem** — pěstoun sám vybere (`zajem_pestoun`), NEBO KO navrhne
   (`navrzeno_KO`) a pěstoun odklikne „mám zájem" → `zajem_pestoun`.
2. **KO odešle ke schválení vedení** (`ke_schvaleni_vedeni`) — vlastní
   akce KO, ne automatický přechod.
3. **Vedení schválí** (`schvaleno_vedenim`) nebo zamítne (`zamitnuto`).
4. **Systém automaticky pošle e-mail #1 pěstounovi** — podrobnosti
   kurzu (text `enrollmentDetailsText` od poskytovatele, jinak
   `description`) + jednorázový odkaz k potvrzení, bez nutnosti
   přihlášení.
5. Pěstoun klikne → `potvrzeno_pestounem` → **systém automaticky
   pošle e-mail #2 poskytovateli**, stejný princip jednorázového
   odkazu.
6. Poskytovatel klikne → `potvrzeno_poskytovatelem` — kurz je
   fakticky objednaný oběma stranami, bez přihlášení.
7. Kurz proběhne mimo systém.
8. **Poskytovatel se přihlásí do `/poskytovatel/*`** a označí
   konkrétního pěstouna jako absolvovaného → `absolvovano` (+
   volitelný `certificateFileRef`).
9. **Okamžitě po kroku 8** systém vyzve k nahrání faktury (adresované
   organizaci) → `faktura_nahrana`.
10. **Vedení** dostane notifikaci, označí `ukonceno` → po platbě
    `zaplaceno`.
11. **Automatický odpočet hodin** v OKAMŽIKU kroku 8 (ne až po
    faktuře) — vytvoří trvalý `fosterPersons/{fosterId}/courses/{id}`
    (§4.4.A) s hodinami/typem ze `services/{id}`, inkrementuje
    `educationOfficial.hoursCompletedInWindow` + lifetime součet.
    `educationHoursApplied=true` hlídá jednorázovost.

### A10b) Poskytovatel služby dítěti (TT=80) — flexibilní tok, interní i externí

**Podstatně jednodušší než A10a** — tábor/hlídání/doučování nenese
zákonnou váhu vzdělávacích hodin, takže dvojité e-mailové potvrzení a
schvalování vedením PŘEDEM by bylo zbytečné tření. Klíčová novinka:
**poskytovatel může být INTERNÍ** — vlastní zaměstnanec organizace
(„interní lektorka" apod.), ne jen externí firma s vlastním portálem.

```
families/{familyId}/serviceRequests/{id}
  serviceRef                        // → institutions/{id}/services/{id}, TT=80
                                     // NEBO null (čistě interní nabídka
                                     // bez katalogové položky)
  childRef
  requestedBy (uid — typicky pěstoun, může i KO)
  status: 'navrzeno' | 'schvaleno_KO' | 'planovano' | 'probehlo' | 'zruseno'
  koReviewedBy, koReviewedAt         // JEDEN lehký gate — je to vhodné?
                                     // ŽÁDNÉ schvalování vedením předem
  providerKind: 'externi' | 'interni'
  externalProviderRef                // → institutions/{id}, pokud externí
  internalStaffUid                   // libovolný zaměstnanec organizace
                                      // (isStaff), pokud interní
  markedDoneBy, markedDoneAt         // BUĎ poskytovatel přes /poskytovatel/*
                                      // (pokud externí), NEBO internalStaffUid
                                      // přímo v hlavní appce (pokud interní) —
                                      // žádný zvláštní portál pro interní případ
  resultingExpenseRef                // → children/{id}/supportExpenses (§4.4.E),
                                      // vytvoří se/nabídne po markedDone
```

**Tok:** pěstoun/KO navrhne službu pro dítě (`navrzeno`) → KO
potvrdí vhodnost (`schvaleno_KO`, jediný gate) → naplánuje se
(`planovano`) → proběhne mimo systém → **kdokoli odpovědný to
označí** (`probehlo`) — externí poskytovatel přes svůj portál
(stejný `/poskytovatel/*`, ale bez rigidních kroků A10a), nebo přímo
interní zaměstnanec v hlavní appce, žádný zvláštní krok navíc. Po
označení `probehlo` se nabídne/vytvoří záznam v `supportExpenses`
dítěte (§4.4.E) se `source` odvozeným z `providerKind` (`externi` →
`smluvni`, `interni` → `interni`) — **žádná nová evidence nákladů,
jen znovupoužití toho, co už §4.4.E umí.** Fakturace/doklad jde
stejnou cestou jako u ostatních `supportExpenses` záznamů, ne novým
mechanismem jako u A10a.

### Poskytovatel — vlastní portál `/poskytovatel/*` (jen pro externí, oba typy)

Nová role (§2), účet zakládaný magic linkem (§6 A6). Vidí VÝHRADNĚ
vlastní nabídky a vlastní objednávky/enrollmenty (podle typu instituce
— A10a nebo A10b tok), nic jiného v systému.

**Bezpečnostní past k ohlídání (analogie k §5 „sameOrg past"):**
pravidlo pro poskytovatele musí filtrovat podle
`serviceRef.institutionId == vlastní institutionId`, NIKDY podle
`organizationId` — poskytovatel typicky obsluhuje víc organizací
najednou.

Rozšíření datového modelu `services/{serviceId}` (jen relevantní pro
TT=70): `courseHours`, `courseType` (`prezencne`/`online`/`hybrid`),
`enrollmentDetailsText` (text pro e-mail #1, volitelný).

Krajské schvalování poskytovatelů se zde **neřeší** (§13.5, rozhodnuto
mimo rozsah).

---

## 6.12 Checklist framework — obecný engine (nahrazuje bespoke M12 nápad)

**Klíčová změna oproti původnímu M12 návrhu:** není to jeden konkrétní
checklist „dávky pěstounské péče" s napevno zadrátovanou logikou —
je to **obecný, znovupoužitelný engine pro větvené dotazníky**, kde
konkrétní „dávky checklist" je JEN JEDNA ŠABLONA mezi mnoha možnými.
Tohle výrazně snižuje náročnost stavby oproti původnímu odhadu
(„vyžaduje vlastní návrh vývojových diagramů" v §11.1) — stavíme
engine jednou, šablony pak vznikají jako data, ne kód.

### Datový model — orientovaný graf, ne strom

Nejlepší praxe pro větvené dotazníky (Typeform logic jumps, klinické
rozhodovací stromy) je modelovat otázky jako **uzly grafu s
přechody podle odpovědi**, ne pevný strom — umožňuje to, aby se různé
větve zase sbíhaly do stejné následující otázky, bez duplikace uzlů.

```
checklistTemplates/{templateId}
  title, description, version, active
  scope: 'platform' | 'organization'   // platformové = superadmin
                                        // (např. oficiální šablona
                                        // „dávky PP"), organizační =
                                        // org_admin (vlastní checklisty)
  nodes: [
    {
      id: 'q1',
      type: 'question' | 'info' | 'end',
      text: 'Chodí vám dávky pěstounské péče?',
      answerType: 'single_choice' | 'multi_choice' | 'yes_no' |
                  'text' | 'number',
      options: [
        {value: 'ano', label: 'Ano', next: 'q2'},
        {value: 'ne', label: 'Ne', next: 'q_intervence'}
      ],
      defaultNext: 'q2'              // fallback, když typ odpovědi
                                      // nemá explicitní větvení (text/číslo)
    },
    ...
    {id: 'end', type: 'end'}
  ]
```

### Průběh vyplňování a výsledný zápis

```
families/{familyId}/checklistRuns/{runId}
  templateId, templateVersion
  startedBy (KO uid), startedAt, completedAt
  answers: [{nodeId, question, answerValue, answerLabel}]
  resultingTimelineEntryRef        // → timeline/{id} po dokončení
```

Engine prochází uzel po uzlu, sbírá odpovědi do `answers[]`, dokud
nedorazí na uzel `type: 'end'`. Při dokončení se **automaticky
vygeneruje standardní zápis do timeline** (stejný mechanismus jako
u hlasového zápisníku, §7) — typ `checklist`, se `subjectRefs` na
rodinu/dítě, `sharingLevel` dle §7.4, obsahující čitelné shrnutí
všech otázek a odpovědí. **Žádná paralelní evidence** — checklist jen
naplní už existující timeline infrastrukturu novým typem záznamu.

### Autorství šablon — KDOKOLI z KO/vedení, bez limitu počtu

- **Platformní šablony** (`scope: 'platform'`) — spravuje superadmin,
  typicky legislativně podložené checklisty (např. „dávky pěstounské
  péče" z §3.1/§4.4.D), platí pro všechny organizace stejně.
  Aktualizace platformní šablony historii vyplněných `checklistRuns`
  nemění (`templateVersion` na běhu zůstává, jen nové běhy použijí
  novou verzi).
- **Organizační šablony** (`scope: 'organization'`) — **kterýkoli KO
  nebo člen vedení** (ne jen org_admin) si může vytvořit vlastní
  checklist, **bez limitu počtu**. `createdBy` eviduje autora pro
  přehled, ale vlastnictví/editace nejsou nijak uzamčené na jednu
  osobu — je to sdílený nástroj organizace, ne osobní poznámky autora.

### Nabídka checklistů — sdílený katalog v rámci organizace (NOVÉ)

Checklist vytvořený jedním KO musí být **použitelný kýmkoli jiným v
organizaci**, ne jen svým autorem — jinak vzniká zbytečná duplicitní
práce napříč týmem. Řešení: samostatná obrazovka „Nabídka checklistů"
(tabulka, podobný vzor jako katalog služeb v A10, jen bez cen):

| Sloupec | Obsah |
|---|---|
| Název | title šablony |
| Zdroj | „Platformní" nebo jméno kolegy, co ji vytvořil |
| Použito × | `usageCount` (denormalizovaný počet spuštěných `checklistRuns`) — pomáhá najít osvědčené šablony |
| Akce | „Spustit" (rovnou založí `checklistRuns` pro vybranou rodinu) |

```
checklistTemplates/{templateId}
  ...(jako výše)
  usageCount        // inkrementuje se transakčně při každém novém
                     // checklistRuns s tímto templateId
```

Viditelnost v nabídce: **všechny platformní šablony + všechny
organizační šablony VLASTNÍ organizace** (ne cizích organizací —
stejná hranice jako všude jinde v systému). Řazení výchozí dle
`usageCount` sestupně, ať se osvědčené šablony objeví nahoře
přirozeně, bez ruční kurace.

### MVP editor

Strukturovaný formulář (přidat otázku, přidat možnosti odpovědi,
vybrat následující uzel z rozbalovacího seznamu existujících uzlů) —
NE vizuální drag-and-drop diagram builder. Vizuální editor grafu je
smysluplné budoucí rozšíření, ne nutnost pro první verzi —
strukturovaný formulář se stejnými daty stačí.

---

## 7. NOVÉ: Hlasový zápisník s AI přepisem

Toto je nejcennější funkční doplněk oproti první implementaci — přímo
řeší hlavní bolest KO (psaní zápisů z terénu na mobilu). Přesný workflow
(potvrzeno s uživatelem, dodržet přesně):

### 7.1 Stavový automat

```
idle
 → [tap mikrofon] → recording (live přepis řeči na text, viditelně roste)
 → [stop] → stopped (doslovný přepis stojí v textovém poli, plně editovatelný)
     → [Uložit doslovný zápis] → uloženo BEZ AI kroku (viz 7.5) — konec
     → [AI přepis] → generating (krátká animace)
         → done: pod původním textem (ten „ustoupí"/opticky zmenší/
           sbalí, ale NEMAZAT z paměti) se objeví NOVÉ pole s AI verzí,
           plně editovatelné
             → [Uložit] → uloží se AI verze jako hlavní obsah zápisu;
               PŮVODNÍ doslovný přepis se NIKDY nezahazuje — putuje do
               historie/auditu (viz 7.6), needuje se do hlavního textu
             → [Zrušit] → ZAHODÍ SE ÚPLNĚ VŠECHNO (doslovný přepis i AI
               verze) — žádná půl-uložená data, žádný draft
```

Poznámka k 7.1: originální flow od uživatele nepočítal s cestou „Uložit
doslovný zápis" bez AI kroku — doplňuji ji jako svůj návrh, protože
občas bude zápis krátký/triviální a AI krok je zbytečný náklad i čas.
**Potvrď s uživatelem, jestli tuhle větev chce, nebo má AI krok být
povinný.**

### 7.2 Živý přepis — technika a cena

Lokální přepis (Web Speech API v prohlížeči) místo cloudového Whisper —
nulový náklad na síť/API během diktování. AI krok (shrnutí/přeformulování)
se volá **jen na explicitní vyžádání** tlačítkem „AI přepis" — ne
automaticky po každém nahrání. Konzistentní s principem provozní
úspornosti (§9): AI náklady jen tam, kde je uživatel explicitně chce.

### 7.3 Uložení na více míst (subjectRefs)

Po dokončení zápisu (ať doslovného nebo AI) se před finálním uložením
zobrazí výběr, KOHO se zápis týká — checkboxy nad seznamem entit s
rozumným předvýběrem podle kontextu:

- Zápis z návštěvy rodiny → **rodina (vždy)** + přiřazení pěstoun(i)
  + přítomné děti — všechny přednastavené jako zaškrtnuté, uživatel může
  odškrtnout.
- Zápis založený jinde (např. z karty konkrétního dítěte) → přednastaví
  se ta entita + rodina.

Technicky to NENÍ více záznamů — je to JEDEN `timeline` dokument s
`subjectRefs[{kind,id}]` na všechny vybrané entity (pravidlo §4.2 bod 6
už na tohle přesně pasuje, žádná změna modelu není nutná). Filtrování
„zápisy týkající se dítěte X" = `subjectRefs array-contains {kind:'child',
id:X}`.

### 7.4 Kdo zápis uvidí — sdílení (NOVÉ pole `sharingLevel`)

Původní datový model (viz starší `06-datovy-model-a-firestore.md`) neměl
u `timeline` žádné pole viditelnosti pro pěstouna — jen dokumenty měly
`visibleToFoster`. Pokud má pěstoun vidět zápis z návštěvy ve své appce
`/moje`, potřebuje časová osa stejnou sémantiku sdílení jako chat.

**Návrh (můj, potvrď): sjednotit** — `timeline` entry dostane pole
`sharingLevel` se STEJNÝMI hodnotami jako `messages.audience`:
`private | internal | foster | ospod`. Výchozí `internal`. UI výběru
sdílení = stejný ovládací prvek jako u chatu (konzistence, žádný nový
vzor navíc). Pěstounova appka `/moje` čte jen záznamy, kde
`sharingLevel IN ('foster')` A zároveň `subjectRefs` obsahuje jeho rodinu/
dítě. Výhoda sjednocení: jeden mentální model „úroveň sdílení" napříč
chatem, zápisy i dokumenty místo tří různých konceptů.

### 7.5 Co se uloží jako hlavní obsah

- Pokud proběhl AI krok a uživatel klikl Uložit → hlavní `body` zápisu =
  finální (možná upravená) AI verze. Bez viditelného upozornění „toto je
  AI" v běžném zobrazení osy — je to prostě zápis.
- Pokud AI krok neproběhl (viz 7.1 volitelná větev) → `body` = doslovný
  přepis.
- Původní doslovný přepis (pokud proběhl AI krok) se uloží VŽDY, i když
  se v hlavním zobrazení nezobrazuje — jde do pole `originalTranscript`
  na zápisu (ne mazat, ne jen do„edits" jako vedlejší diff, ale jako
  plnohodnotné pole, protože jde o jiný druh dat — doslovný přepis, ne
  „předchozí verze textu po editaci").

### 7.6 Detail zápisu — sidebar se dvěma záložkami

Klik na zápis v ose otevře postranní panel (desktop: drawer zprava;
mobil: Modal Bottom Sheet — viz DESIGN_SYSTEM.md §6.6):

- **Záložka „Přehled"**: kdo zápis pořídil, kdy, kde (GPS pokud z
  návštěvy), komu se týká (subjectRefs jako badge), AI shrnutí pokud bylo
  použito je prostě hlavní text (žádné speciální označení — viz 7.5).
- **Záložka „Historie"**: auditní stopa ve stylu už existujícího vzoru
  u dokumentů (append-only, kdo/kdy/odkud) — a NAVÍC, pokud zápis vznikl
  z hlasového vstupu s AI krokem, tady se zobrazí **původní doslovný
  přepis** (`originalTranscript`) jako první položka historie, jasně
  označený jako „Původní záznam (před AI úpravou)". Editace zápisu po
  jeho vzniku (běžná úprava textu KO) se do stejné záložky přidává jako
  další položky historie — sjednocený vzor s dokumentovým auditem.

### 7.7 Immutabilita

Časová osa má dnes „immutabilitu pozastavenou" (editace je možná). To
zůstává — ale **KAŽDÁ editace zápisu vzniklého z hlasového vstupu musí
jít do Historie** stejně jako u dokumentů, ne přepsat beze stopy.

---

## 8. Auditní stopa a historie — obecný princip (napříč systémem)

Zobecnění z §7.6 na celý systém: kdekoli existuje entita, která se dá
upravit (dokument, zápis v ose, karta dítěte…), platí stejný pattern:

1. Append-only podkolekce/pole se záznamy `{kdo, kdy, odkud (IP/pobočka
   pokud dostupné), co bylo předtím}`.
2. UI vzor: detail entity → záložka „Historie" vždy na stejném místě
   (konzistence napříč typy entit — uživatel se to naučí jednou).
3. Nikdy nezobrazovat needitovanou historii jako součást hlavního
   obsahu — je to vždy oddělená záložka, ne inline diff v textu.

---

## 9. AI funkce — plán a cenová disciplína

- **Hlasový zápisník** (§7) — hotovo výše, priorita č. 1.
- **AI OCR dokumentů** — Vertex Vision, zatím seam.
- **RAG generování reportů** nad nahromaděnými daty rodiny — navazuje na
  A2, ale s AI návrhem textu místo čistě šablonového markdownu; AI vstup
  jen z dat, která smí být v reportu (respektovat `sharingLevel`/audience
  filtr z §7.4 a chatu — nikdy netahat `private`/`internal` obsah do
  reportu pro OSPOD).
- **Časové srovnání vývoje dítěte** — nad `history`/`permanentNotes`
  dítěte + časovou osou.
- Principy napříč vším: AI se volá **na vyžádání**, ne automaticky;
  do promptu jde jen nezbytné minimum dat; mock fallback pro dev bez
  účtování; cíl monetizace počítá s FUP a měřičem spotřeby per
  organizace.

### 9.1 Bezpečnostní principy PRO BUDOUCÍ AI-nad-daty funkce (převzato z rozboru starší verze zadání, zapsat teď, stavět až podle potřeby)

Kdyby se v budoucnu přidala jakákoli funkce typu „zeptej se AI na data
organizace" (konverzační BI, chytré vyhledávání napříč rodinami apod.)
— tady jsou dva principy, které se MUSÍ dodržet od první implementace,
protože oprava bezpečnostní architektury dodatečně je mnohem dražší
než ji navrhnout správně hned:

1. **AI nikdy nesmí mít přímý/administrátorský přístup k datům.**
   Cokoli AI vygeneruje (dotaz, filtr, výběr) se MUSÍ vykonat pod
   Firestore pravidly PŘIHLÁŠENÉHO UŽIVATELE, ne servisním/admin
   účtem — bezpečnost je vlastností databázových pravidel (§4/§5),
   ne kroku v aplikační logice ani slibu v promptu. I záměrně
   „útočný" dotaz (zkoušející vylákat data cizí rodiny) musí narazit
   na stejná pravidla jako běžné UI. Otestovat by se to mělo stejným
   způsobem jako §11.2 (adversariální test scénář, ne jen šťastná
   cesta).
2. **Pokud AI někdy bude citovat legislativu** (dávky, lhůty, SPVPP
   koše) — vždy jen z verzované, `validFrom`/`validTo` filtrované
   vrstvy (§3.2 legislativní parametry), NIKDY z obecné znalosti
   modelu nebo nekontrolovaného webového zdroje. Tvrdý filtr platnosti
   MUSÍ proběhnout PŘED tím, než se cokoli dostane do promptu, ne
   spoléhání na to, že model „ví", co aktuálně platí. Tohle není
   teoretické opatrnictví — přesně tenhle typ chyby (zastaralý/nepřesný
   zdroj tvářící se jako aktuální) jsme si prakticky ověřili v §3 této
   konverzace u výživného/§47g ZSPOD, kde i dva „aktuální" webové
   zdroje byly nepřesné a teprve přímá citace zákona to rozsoudila.
   Kdyby AI něco takového citovala nekontrolovaně, byla by to stejná
   chyba, jen automatizovaná a nenápadnější.

**Proč to psát už teď, i bez konkrétní funkce v plánu:** obě zásady
nic nestojí zapsat dopředu, ale hodně stojí objevit je AŽ POTÉ, co se
funkce postaví špatně a musí se předělávat. Nejde o novou funkci k
implementaci teď — jde o mantinel pro tu budoucí, kdyby vznikla.

---

## 10. Provozní úspornost (přebírá se beze změny)

- Žádné realtime listenery na data (jediný `onSnapshot` = vlastní profil
  uživatele). Vše ostatní jednorázové `getDocs` + ruční reload. Zvonek
  = poll 60s.
- Stránkování všude (top-level 50, podkolekce 20, cursor).
- Žádné N+1 na seznamech; denormalizovaná počítadla se zapisují v
  `writeBatch` se změnou, co je vyvolala.
- Žádné Cloud Functions zatím (klient píše notifikace i workflow kroky
  své role) — vědomé zjednodušení prototypu.
- Klientské filtrování malých množin (KO ≤25 spisů) — bez composite
  indexů mimo timeline/events.
- Hosting = statická SPA, code-split lazy routes, PWA cache.
- Média (až bude Storage): klientská komprese před uploadem (WebP
  1920px <400kB, audio Opus 32kb/s), do Firestore jen metadata/extrakty.
- Geokódování bez API klíče (Nominatim on-demand).

---

## 11. Metodika práce AI programátora

1. **Čti mapu, ne území.** Tento dokument + `DESIGN_SYSTEM.md` →
   `CURRENT_STATE.md` (jakmile vznikne) → cílené Grep/Glob. Celé soubory
   čti jen ty, které edituješ.
2. **Vzorek před sweepem** u čehokoli vizuálního — viz DESIGN_SYSTEM.md.
   U funkčnosti totéž pravidlo platí pro §13 otevřené otázky: NEROZHODUJ
   architekturu sám, potvrď nejdřív.
3. Datová vrstva: barrel service (`orgService.js` vzor) — jeden import
   bod, desktop/mobil sdílí hooky bez UI.
4. Lint + build po každé dávce; commit po uceleném bloku. Nikdy repo přes
   noc bez checkpointu.
5. Paralelní subagenti jen na read-only analýzu/review. Hromadné editace
   dělej inline po dávkách — paralelní workflow na to 2× selhalo v
   předchozí implementaci (session limity, napůl editované soubory).
6. Bez přihlášení ověřuj: Login page, computed styles, console/network,
   lint+build. S přihlášením: jen uživatel nebo dev seed účty. NIKDY
   nezadávej hesla.
7. Poctivost nadevše: seam označ jako seam, neověřené jako neověřené.
8. Prod zásahy (deploy, data) VŽDY jen s výslovným souhlasem v dané
   session.

---

### 11.1 Doporučené pořadí modulů (stavební plán)

Stavět postupně po modulech je správně — je to přímé pokračování principu
„vzorek před sweepem" (§11 bod 2) aplikované na funkčnost, ne jen na
vizuál. Menší kontext na modul = levnější a rychlejší session pro AI
programátora, a hlavně: menší blast radius, když se něco pokazí.

**Podmínka, aby to fungovalo:** moduly musí být **svislé řezy** (data
model + rules + UI pro danou oblast dohromady), ne vodorovné vrstvy
(„nejdřív všechny datové modely, pak všechno UI") — jinak se stejně musí
při každém modulu tahat celý kontext databáze. A **architektonická
rozhodnutí z §13 musí být hotová PŘED modulem M0** — je to jediná věc,
kterou nejde donavrhnout cestou, aniž by to rozbilo předchozí moduly.

| Modul | Obsah | Proč v tomto pořadí |
|---|---|---|
| **M0 — Základy** | Firebase Auth, `users/{uid}` + role, UID/identity systém (§4.3, vč. čítače v transakci a EAN-13 kontroly), kostra firestore.rules (`sameOrg` vzory), design tokeny zavedené (bez komponent) | Nic dalšího nejde stavět bez identity a rolí; UID politika se zavádí jednou a natvrdo |
| **M1 — Organizace a lidé** | Registrace organizace, zaměstnanci CRUD, kapacita KO, Spis CRUD (základ), Dítě CRUD (základ), pěstoun jako osoba (ještě bez účtu) | Profily, jak jsi navrhoval — bez nich nejde nic navázat |
| **M1.5 — Import/Export/Záloha** | `importJobs`+`stagingRecords` (§5.5), cesty A/B/C (AI/šablona/API) nad stejným staging→commit→undo mechanismem, self-service export, automatická záloha. Vrstva 1 skenování (příloha bez AI) je jen běžný dokument, netřeba zvlášť | Bez tohohle organizace nemá motivaci se vůbec zapojit — ale potřebuje hotové entity z M1 napřed, proto hned po něm |
| **M2 — Dohoda a přiřazení** | Entita Dohoda (§3, §4.5 vyřešeno), `assignedTo`, legislativní lhůty jako pole (zatím bez upozornění), `createdByOrgId` na timeline/dokumentech, `historyDigest` generování | Přímo řeší Spis↔Dohoda vazbu, dokud je to čerstvé z M1 |
| **M3 — Časová osa a hlasový zápisník** | Timeline podkolekce, návštěva + GPS timer, celý hlasový zápisník (§7) vč. `subjectRefs` a `sharingLevel` | Tohle je hlavní hodnota produktu pro KO — dává smysl ji mít funkční brzy, ne až na konci |
| **M4 — Pěstounský účet** | Magic link pozvánka, `/moje` portál, viditelnost timeline/dokumentů pěstounovi | Navazuje na M3 (sharingLevel) |
| **M5 — Dokumenty a workflow** | Markdown editor, verze, audit, celý automat A1, UID+QR na dokumentech | Složitější stavový automat — lepší až s hotovou identitou a rodinami pod sebou |
| **M6 — Report pro OSPOD** | A2 — generátor nad timeline + dokumentem | Přímo staví na M3 + M5 |
| **M7 — Satelitní moduly** | Respit/SPVPP/Vzdělávání (datový model hotový, viz §4.4), Úkoly, Instituce + Katalog poskytovatelů a služeb (§6, A10), Kalendář | Vzájemně nezávislé, libovolné pořadí, nízké riziko — klidně souběžně |
| **M8 — Externí účastníci** | Permission engine (§5.1), appka `/ucastnik/*` | Samostatný, komplexní podsystém — dává smysl jako izolovaný blok |
| **M9 — Chat a notifikace** | 4 úrovně soukromí, zvonek | Může jet souběžně s M7/M8 |
| **M9.5 — Personalizace a branding** | `preferences` per uživatel (vzhled, fontScale, hustota), `branding`+`documentTemplates` per organizace (§5.6) | Kosmetické, nízké riziko, klidně souběžně s M7–M9; šablony dokumentů potřebují hotový dokumentový workflow z M5 |
| **M10 — AI funkce navíc** | OCR, RAG reporty, časové srovnání vývoje dítěte | Až je nad čím agregovat — potřebuje data z M1–M6 |
| **M11 — PWA dotažení** | Offline stav, instalační prompt, poslední mobilní doladění | Poslední vrstva leštění |

Po každém modulu: lint + build + commit (checkpoint) + krátký zápis do
`CURRENT_STATE.md` („modul M3 hotový, rozhodnutí X, TODO Y") — právě
tenhle zápis je to, co dovolí PŘÍŠTÍ session začít bez znovunačítání
celého kontextu projektu, jen s M-zápisem a kódem daného modulu.

| **M12 — Checklist framework (design hotový, viz §6.12 — NENÍ už "mimo build")** | Obecný engine pro větvené dotazníky (`checklistTemplates`+`checklistRuns`), platformní šablona „dávky PP" jako první instance | Staví na hotové timeline infrastruktuře z M3 — klidně souběžně s M7–M9, žádné vlastní vývojové diagramy už netřeba navrhovat, jsou nahrazené obecným enginem |
| **M13 — Účetní export (budoucí, mimo tento build)** | Strukturovaný export dokladů/výdajů (§4.4.F) pro organizaci — CSV/XLSX případně formát konkrétního účetního SW | Datový model (documentRef, bucket, category, sourceRef) je už teď navržen tak, aby export šel postavit bez přepracování dat — NEŘEŠIT v tomto buildu, jen nerozbít strukturu, která to umožní |

---

## 11.2 Testovací strategie pro dvě nejrizikovější místa (POVINNÉ, ne volitelné)

**Proč tohle není obyčejné „napiš testy":** §4.5 (cross-org viditelnost
historie Spisu) a §5.1 (schvalovací řetězec citlivých oprávnění
externích účastníků) jsou jediná dvě místa v celém systému, kde
chyba v Firestore rules znamená přímý únik citlivých dat dětí mimo
oprávněnou organizaci nebo osobu. U těchto dvou míst **modul se
nepovažuje za hotový bez automatizovaných testů**, bez ohledu na to,
jak jasně vypadá kód při ručním prokliknutí.

### Nástroj a princip

`@firebase/rules-unit-testing` (Firestore emulator) — testy běží
PROTI rules, ne proti mock objektům, protože jediné, co se tu reálně
ověřuje, je chování pravidel samotných. Test = `assertSucceeds()` /
`assertFails()` nad konkrétním čtením/zápisem, vždy s jasně
pojmenovaným scénářem (`test('DO2 nevidí plný zápis DO3 vzniklý po
konci vlastní Dohody', ...)`), ne obecné „funguje to".

### Povinná testovací matice — §4.5 (cross-org viditelnost)

Pro scénář DO1(2020–2022)→DO2(2022–2024)→DO3(2024–dosud) z §4.5,
minimálně tyto případy, každý zvlášť jako test:

1. DO3 čte VLASTNÍ `timeline`/`documents` → `assertSucceeds` (plný obsah).
2. DO3 čte plný `timeline` záznam vytvořený DO2/DO1 → `assertFails`.
3. DO3 čte `historyDigest` záznam vytvořený DO2/DO1 → `assertSucceeds`.
4. DO2 čte plný záznam DO3 (vzniklý PO konci vlastní Dohody DO2) →
   `assertFails` — **i na digest** (bod 3 pravidla čtení, §4.5).
5. DO2 čte vlastní plný záznam → `assertSucceeds`, i po skončení
   vlastní Dohody (própria historie zůstává navždy).
6. Poznámka (`type: note`) nebo hlasový přepis (`voice_entry`) NEMÁ
   vůbec vzniklý `historyDigest` záznam → ověřit, že dotaz nic
   nevrátí, ne že vrátí prázdná pole.
7. Dokument ve stavu konceptu (`draft`) nemá digest; po přechodu do
   `odeslano_ospod` digest vznikne — test na OBĚ fáze zvlášť.
8. Uživatel BEZ `isStaff` (pěstoun, EP) se nedostane k cizímu Spisu
   vůbec, bez ohledu na segmenty — základní `sameOrg`/`isStaff` past
   z §5 testovat tady znovu, ne jen spoléhat na obecné pravidlo.

### Povinná testovací matice — §5.1 (permission engine)

1. Necitlivé oprávnění (`grantDirect`) — jeden krok, jeden aktér →
   `assertSucceeds` rovnou.
2. Citlivé oprávnění (`SignDocuments*`, `Medical*`, `VideoCalls*`) bez
   projití celým řetězcem (rovnou `activateGrant` bez předchozího
   `approveGrant`) → `assertFails` — **i kdyby žadatel byl org_admin**.
3. Citlivé oprávnění řádně přes `requestGrant`→`approveGrant`
   (vedení)→`activateGrant` (KO) → `assertSucceeds` na konci řetězu.
4. Šablona (`externalRoleTemplates`, §5.1.1) s citlivým oprávněním
   pořád vyžaduje celý řetězec — ověřit, že `defaultPermissions` sama
   o sobě NIC neaktivuje bez lidského potvrzení.
5. Vypršelý grant (`validTo` v minulosti) → `assertFails` na čtení,
   i kdyby byl kdysi platně schválený.
6. `timeWindows` mimo povolené okno (jiný den/hodina) → `assertFails`.
7. EP se dvěma souběžnými granty na různé děti stejné rodiny — čtení
   dítěte BEZ grantu selže, i když grant na sourozence existuje.

### Kdy tyto testy vznikají

Součást M2 (Dohoda, `createdByOrgId`, `historyDigest` — testy pro
§4.5) a M8 (Externí účastníci — testy pro §5.1), ne dodatečně na
konci. Testovací soubor je součástí commitu daného modulu, ne
samostatný „testovací sprint" po všem ostatním.

---

## 12. Doménový katalog WF-1..16 (budoucí backlog, zatím neimplementovat)

Zákonné/organizační procesy: WF-1 Exit pěstouna · WF-2 Ochranná lhůta
(60 dní) · WF-3 Předání nové DO (data handover — teď obzvlášť relevantní
kvůli §4.5) · WF-4 Dotaz externí DO před podpisem · WF-5 Návrat pěstouna
· WF-6 Mimořádné pozastavení / podezření na ohrožení dítěte · WF-7
Zletilost / odchod z péče · WF-8 Úmrtí (role-aware) · WF-9 Zánik/fúze DO ·
WF-10 GDPR retence a skartace · WF-11 Žádost subjektu údajů · WF-12
Důkazní balíček pro spor · WF-13 Změna KO (předání spisu) · WF-14
Sloučení duplicit · WF-15 Ad-hoc workflow · WF-16 Rozvod pěstounů se
společnou PP. Až se budou implementovat: navrhni jako stavové automaty ve
stylu A1 (stav v dokumentu, přechody ve službě, audit podkolekce).

---

## 13. Otevřené otázky — potvrď s uživatelem PŘED stavbou datového modelu

### 13.1 [VYŘEŠENO] Spis vs. Dohoda — architektura

Varianta A potvrzena, kompletní datový model a pravidlo cross-org
viditelnosti historie (směrové: vlastní vše, minulost jen nutné
minimum, budoucnost nic) je hotové — viz **§4.5**, ne tady.

### 13.2 Sdílení zápisů (`sharingLevel`) — sjednocení se zprávami

Souhlasí uživatel se sjednocením konceptu „kdo uvidí" napříč chatem
(`audience`), dokumenty (`visibleToFoster`) a nově zápisy (`sharingLevel`)
do jednoho enumu `private|internal|foster|ospod`? Alternativa je nechat
tři oddělené koncepty jako dnes — jednodušší na code review, ale
nekonzistentní pro uživatele.

### 13.3 Povinnost AI kroku u hlasového zápisníku

Má být „Uložit doslovný zápis" bez AI kroku dostupná volba (můj návrh,
§7.1), nebo má být AI přepis vždy povinná mezistanice před uložením?

### 13.4 Registrace externisty — rozsah povinných údajů

Potvrď, že RČ a WhatsApp NEJSOU povinné položky při registraci externího
účastníka (odchylka od Antigravity návrhu, viz §5.1) — jen jméno,
e-mail, telefon, ověření přes magic link.

### 13.5 [MIMO ROZSAH — rozhodnuto] Krajské schvalování poskytovatelů

Uživatel rozhodl: **vícekrajské schvalování poskytovatelů (pověření
dle ZSPOD apod.) se v tomto buildu vůbec neřeší** — není to zákonná
povinnost systému, takže to není blokující otázka. Katalog
poskytovatelů (§6, A10) funguje BEZ kontroly krajského schválení —
organizace odpovídá za výběr poskytovatele sama, systém to
nekontroluje. Nevylučuje se návrat k tématu v budoucnu, ale NEBUDOVAT
nic kolem toho teď, ani jako přípravu.

---

## 14. Vztah k DESIGN_SYSTEM.md

Tento dokument = co systém dělá. `DESIGN_SYSTEM.md` = jak to vypadá.
Nový AI programátor potřebuje OBA. Žádný z nich nenahrazuje `CURRENT_STATE.md`
nebo `docs/domain/*.md`, které vzniknou až během stavby — ty píše sám
postupně, jak se rozhoduje a staví.
