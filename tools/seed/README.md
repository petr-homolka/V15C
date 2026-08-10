# Testovací data

Generátor sady, kterou jde **nahrát, upravit, smazat a nahrát znovu**.

```bash
# 1. emulátor (v jiném terminálu)
npm run emulator

# 2. data
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
npm run seed            # nahraje
npm run seed:stats      # co v databázi je
npm run seed:reseed     # smaže a nahraje znovu
npm run seed:clear      # smaže
npm run seed:dump       # vypíše do JSON, do databáze nezapisuje
```

Volby: `--seed=jina-sada`, `--orgs=3`, `--max-agreements=19`,
`--today=2026-12-01`, `--out=soubor.json`.

---

## Co sada obsahuje

Výchozí nastavení dá **~4 300 dokumentů**: 2 organizace, každá vedoucí a 2 Klíčové
osoby, každá Klíčová osoba 8–19 dohod, každá dohoda 1–2 pěstouny a 0–5 dětí.

| | |
| --- | --- |
| organizace | 2 |
| osoby / kontakty | ~89 |
| děti | ~158 |
| dohody | ~55 |
| spisy | ~55 |
| obsahové záznamy | ~1 020 |
| lhůty | ~296, z toho 39 % po termínu |
| dokumenty | ~316 |
| úřady (ORP, KÚ, soudy) | 14 |
| entity v registru | ~312 |

Čísla jsou orientační: sada je deterministická podle semínka, ale **při změně
generátoru se posune celý náhodný proud**, takže se počty mění. Přesný stav
řekne `npm run seed:dump`.

---

## Proč jsou data taková, jaká jsou

Nejde o „nějaká data“. Každá vlastnost sady existuje proto, aby se na ní dalo
otestovat konkrétní místo, kde je návrh choulostivý.

| Vlastnost sady | Co se tím dá otestovat |
| --- | --- |
| **Příjmení má mužský a ženský tvar** (Novák / Nováková) | knihovna vět se skloňováním (dok. 07); mužský tvar u ženy by v dokumentu na OSPOD vypadal nedbale |
| **Pěstoun a dítě mají VŽDY jiné příjmení** | v UI se pozná, kde chybí rozlišení osob; v sadě je 0 dětí se stejným příjmením jako pěstoun |
| **Sourozenci příjmení i bydliště sdílejí** | seskupování dětí ve spisu |
| **ORP pěstouna a ORP dítěte se u části rodin liší** | tři adresáti zprávy podle § 47b odst. 5 — ORP dítěte je jiný úřad (dok. 05) |
| **Manželé mají jednu společnou dohodu** (~polovina) | § 47b odst. 7 — dohoda nemůže mít jednoho vlastníka |
| **Jeden pěstoun je osoba v evidenci BEZ DÍTĚTE** | dohoda visí na zápisu v evidenci KÚ, ne na dítěti (§ 47c odst. 1); spis bez dítěte je platný stav |
| **Jeden je poručník s osobní péčí** | § 2a písm. c) bod 4 — je to osoba pečující (dok. 18) |
| **Jedna dohoda čeká na souhlas ORP** | bez souhlasu nelze vyplatit státní příspěvek (dok. 01) |
| **Jeden spis je archivovaný po ukončení péče** | archiv je stav, ne jiné úložiště (dok. 18) |
| **Ukončené umístění BEZ dokladu** | nic neblokuje; chybějící doklad je vidět, ne vynucený (dok. 16) |
| **Asi třetina lhůt je po termínu** | je co zobrazovat na stavovém pásu |
| **Lhůta osobního styku zvlášť za osobu i za každé dítě** | § 47b odst. 4 — jedno zaškrtávátko by vykazovalo soulad tam, kde není (dok. 11) |
| **U některých návštěv děti chybí, s důvodem a omluvitelností** | rozpad lhůty na děti |
| **Část dokumentů má `indexStatus: 'queued'`** | „kolik toho Eli ještě nepřečetla“ (dok. 17) |
| **Podání v podatelně, část nepotvrzená** | do potvrzení nežije v žádném spisu (dok. 14) |
| **Koncept zprávy s mezerami `[DOPLNIT: …]`** | mezera místo věrohodné věty (dok. 14) |
| **Odmítnutí zájemců ve všech třech zákonných důvodech** | roční výkaz § 49c odst. 4 se z nich počítá (dok. 13) |
| **Dvě organizace s jinou směrnicí** | jedna má ubytování 1 000 Kč, druhá 1 500 Kč — parametry na úrovni organizace (dok. 07) |
| **Jedna organizace ve zkušebním období, druhá platí fakturou** | tarify a měření (dok. 19) |
| **Paměť Eli: naučená i řečená** | obrazovka „Co si Eli pamatuje“ (dok. 17) |

---

## Tři vlastnosti, na kterých záleží při testování

**0. Id jsou skutečná UID.** Sedmimístné kódy z 31znakové abecedy bez `o`,
`0`, `i`, `l` a `1` (`schema/src/uid.ts`), generované s kontrolou jedinečnosti
— stejným sítem, jakým v aplikaci prochází zápis do registru entit. Nejsou to
čitelné popisky: testovat na `demo-org-1-ag-3` by skrylo právě ty chyby, které
se objeví, až když někdo z id něco vyčte. Orientace v datech je přes
`entities/{uid}`, kde je u každého UID druh a název.

Platí to **bez výjimky** a stálo to tři nalezené chyby: pořadatelé
v marketplace si drželi čitelná id (`prov-akademie`), objednávky kurzů si
`offerId` **skládaly ze šablony** a ukazovaly na kurz, který v datech nebyl,
a ověřovací tokeny se odvozovaly z čísla objednávky (`cert-<uid>`) — což je
z klíče, který se nesmí dát uhodnout, dělá dopočitatelný údaj. Odkaz proto
vzniká z toho, co se opravdu zapsalo, nikdy ze skládaného řetězce. Kontroluje
se to na výpisu: `npm run seed:dump` a projít pole `*Id` proti existujícím
dokumentům.

**1. Sada je deterministická.** Stejné semínko dá stejná data — jinak by se nedala
reprodukovat chyba, kterou někdo viděl. Jiná sada: `--seed=neco-jineho`.

**2. Kontakty jsou nepoužitelné.** E-maily jsou na doménách `.test`, které se podle
RFC 6761 nikdy nerozřeší, takže testovací zpráva nemá kam odejít. Telefony mají
prostřední blok vždy `000`. Rodná čísla mají nemožný kontrolní zbytek, takže
neprojdou validací jako platná. Testovací data nemají obsahovat použitelné
identifikátory.

**3. Datum „dnes“ se dá posunout.** `--today=2026-12-01` přepočítá celou sadu k jinému
dni. Hodí se na testování konce roku (respitní rok, výpovědní okno k 31. 12.).

---

## Mazání a pravidlo, že se nic nemaže

V systému se **nikdy nic nemaže** (dok. 10) a bezpečnostní pravidla to nepovolují
**nikomu** — ani `org_admin`. Tenhle skript maže přes Admin SDK, které pravidla
obchází, a maže **výhradně dokumenty se značkou `demo: true`**. Na skutečná data
nemá jak dosáhnout a to pravidlo tím zůstává celé.

Značka je na každém dokumentu (`demo`, `demoBatchId`), ne jen v cestě — takže i
kdyby někdo testovací spis přesunul, pozná se.

**Bezpečnostní zámek:** bez `FIRESTORE_EMULATOR_HOST` skript odmítne běžet. Proti
skutečnému projektu jen s `--force`. Testovací data v produkci by byla horší než
žádná — nedají se rozeznat od pravých.

---

## Co v sadě ještě není

| Chybí | Proč |
| --- | --- |
| soubory v Cloud Storage | dokumenty mají `storagePath`, ale samotné PDF ne — až bude co zobrazovat |
| index dokumentů a vektory | vzniká z Cloud Function při nahrání (dok. 17) |
| ověřovací záznamy QR kódů | `verifications/{token}` vzniká při vydání dokumentu (dok. 21); certifikáty a potvrzení už svůj token mají |
| podpisové obřady | vyžadují zařízení a WebAuthn (dok. 08) |
| vlákna a zprávy | až bude chat |
| přepočítané ukazatele u dohod | `nextObligationDueOn` píše Function; v sadě je kostra |
