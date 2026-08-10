# 00 — Přehled dokumentů a co ještě zbývá

Stav k dnešku: **17 dokumentů, ~5 900 řádků.** Tenhle je rozcestník a zároveň odpověď
na otázku „co nám ještě zbývá“.

---

## 1. Co je hotové

| # | Dokument | O čem je |
| --- | --- | --- |
| 01 | Právní analýza a korekce zadání | ZSPOD, čtyři opravy zadání; vzdělávání 18/24 h, dohoda manželů společně, zánik jen k 30. 6. / 31. 12., souhlas ORP jako podmínka |
| 02 | Architektura řešení | tři vrstvy parametrů, Předávací kód, offline outbox, AI a pseudonymizace |
| 03 | Strom vazeb, profily, nastavení | ER diagramy, sedm profilů, tři úrovně nastavení, scénáře odchodu Klíčové osoby |
| 04 | Oprávnění, parametry, vzor dohody | matice oprávnění; **oddělení metadat od obsahu**; tři vady vzoru dohody |
| 05 | Směrnice jako `orgPolicy` | tři adresáti zprávy, § 965 + § 655 OZ, parametry ze Směrnice č. 1 |
| 06 | Nastavitelnost, standardy, plány | zčásti nahrazeno dokumentem 07 |
| 07 | Flexibilita, editor, podpisy | generátor standardů, knihovna vět, reporty, dva druhy podpisu |
| 08 | Podpisy, dětská aplikace, MVP | podpis jen online, dětská PWA, rozsah MVP |
| 09 | Komunikace, aplikace pro rodiče, onboardingy | WhatsApp jen jako upozornění, tři onboardingy, adresa pěstouna se nezobrazuje |
| 10 | Přenos vzdělávání, kniha života, nemazání | hodiny přecházejí, kniha života s trojím souhlasem, **nikdy se nic nemaže** |
| 11 | Kalendář a řízení času | poměr agend jako parametr, motor lhůt jako anotace, **dva měsíce per dítě** |
| 12 | Úkoly, časová osa, dokumenty, chat | osa jako tenký index, verzované dokumenty, logy nahlížení a exportu |
| 13 | Výkaznictví vůči orgánům | roční výkaz, `ServiceInquiry`, `AuthorityRequest`, `MandateObligation` |
| 14 | Interní asistent, koncepty, podatelna | koncept do editoru s auditní stopou, příchozí podání, grounding |
| 15 | Chat jako ústřední nástroj | čtyři druhy tahu, stupně potvrzení, katalog schopností |
| 16 | **Charta chování** | nadřazená: nic neblokuje, *Vrátit zpět* místo dotazů, systém nehlídá lidi |
| 17 | Eli: učení a dokumenty | jméno, indexace všech dokumentů, učení daty a viditelná paměť |

---

## 2. Co zbývá — návrhové mezery

Seřazeno podle toho, jak moc blokují stavbu.

### A. Blokující

| # | Téma | Proč to blokuje |
| --- | --- | --- |
| **A1** | **Přihlášení, identita, zařízení** | v žádném dokumentu není, jak se kdo do systému dostane. Zaměstnanec, pěstoun, dítě od 12 let, příbuzný — každý jinak. Navíc podpis (dok. 08) stojí na biometrice zařízení, takže **evidence a obnova zařízení je jeho předpoklad**: ztracený telefon dnes znamená ztracenou možnost podepsat. |
| **A2** | **Konsolidovaný datový model** | napříč 17 dokumenty je kolem padesáti rozhraní. Nikde nejsou pohromadě, chybí kolekce, indexy a náčrt bezpečnostních pravidel. Bez toho se nedá začít. |
| **A3** | **Volba technologie** | není rozhodnutá. Není to detail: **celé oddělení metadat od obsahu v dok. 04 vzniklo z toho, že Firestore neumí skrýt pole.** S Postgres a RLS ten důvod mizí a model by vypadal jinak. Rozhodnout dřív než A2. |

### B. Potřebné před spuštěním, ale ne pro první kód

| # | Téma | Co chybí |
| --- | --- | --- |
| **B1** | **Notifikace** | roztroušené ve 02 a 09, nikde souvisle: co komu chodí, kterým kanálem, a jak to sedí s chartou („žádné výtky, jednou a dost“) |
| **B2** | **Zletilost dítěte a konec péče** | co se stane s účtem dítěte, s knihou života, se spisem a s přístupem v den, kdy mu je 18 nebo péče skončí. Dnes to model neumí. |
| **B3** | **Pěstounská péče na přechodnou dobu — provozně** | dohoda trvá, děti se střídají; dítě přichází během hodin a odchází do trvalé rodiny. Datově to `Placement` unese, ale terénní postup navržený není. |
| **B4** | **Poručník a další osoby pečující** | § 2a písm. b) není jen pěstoun. Ověřit, jestli profily a dohoda pokrývají poručníka a osobu, které bylo dítě svěřeno do péče — a doplnit. |
| **B5** | **Obrazovky a informační architektura** | dok. 03 má dashboard a „Moje agenda“; chybí soupis obrazovek pro všech pět povrchů a mobilní navigace |
| **B6** | **Odchod organizace z platformy** | co si odnese, v jakém formátu, co zůstane. Dok. 03 řeší zánik pověření, ne odchod k jinému dodavateli. |

### C. Odložené vědomě

| # | Téma | Stav |
| --- | --- | --- |
| **C1** | **Limity čerpání SPVPP podle § 5c** | odloženo tvým rozhodnutím; datová pole připravená (dok. 03) |
| **C2** | **Jiné státy** | sady pravidel jsou verzované a vázané na `legalRegime`; chybí jazyk rozhraní, šablony dokumentů a otázka, co je v jiné zemi vůbec obdoba doprovázení |
| **C3** | **Moduly mimo první rozsah** | stížnosti (14a), mimořádné situace (15a), zpětná vazba (16b), vzdělávání zaměstnanců (8b), leasingy — tvoje rozhodnutí z dok. 07 |

---

## 3. Co zbývá mimo návrh

Tohle nejsou dokumenty o systému, ale věci, bez kterých systém nesmí jít do provozu.
Zmiňuji je, protože v žádném z předchozích sedmnácti nejsou.

| Téma | Poznámka |
| --- | --- |
| **DPIA — posouzení vlivu na ochranu údajů** | u čl. 9 dat o dětech ve velkém rozsahu je **povinné**, ne doporučené. Je to podmínka spuštění, ne papír navíc. |
| **Záznamy o činnostech zpracování (ROPA)** | správce = organizace, zpracovatel = platforma; role je potřeba mít popsané |
| **Zpracovatelská smlouva s organizacemi** a smlouva s poskytovatelem modelu | dok. 02 s nimi počítá; nikdo je nenapsal |
| **Informace pro subjekty údajů** | pěstoun, dítě, příbuzný — každý jinou řečí; dítěti srozumitelně |
| **Skartační plán a retenční lhůty** | dok. 10 popisuje mechaniku, ne konkrétní lhůty podle zákona 499/2004 |
| **Provoz: zálohy, obnova, region, šifrování, klíče, incidenty, dostupnost** | zmíněno jen okrajově v dok. 02 |
| **Přístupnost a výkon na starých telefonech** | terénní pracovníci nemají nové mobily; nikde to není zohledněné |
| **Obchodní model platformy** | cena, tarify, zakládání organizací, ověření pověření — netknuto |

---

## 4. Doporučené pořadí

1. **A3 — volba technologie.** Jedno rozhodnutí, které mění tvar datového modelu.
2. **A1 — přihlášení a zařízení.** Bez toho nejde postavit ani první obrazovku.
3. **A2 — konsolidovaný model** včetně kolekcí a bezpečnostních pravidel.
4. **B5 — soupis obrazovek**, aspoň pro terénní mobil a spis.
5. **Scaffold**: Geist a PWA vrstva jsou v repozitáři hotové, takže od tohohle bodu
   už jde stavět a ukazovat.
6. B1–B4, B6 průběžně; C a sekce 3 před ostrým spuštěním.

---

## 5. Jedna poznámka k rozsahu

Sedmnáct dokumentů je hodně a je v nich rozhodnuto víc, než kolik se vejde do první
verze. **Rozsah MVP je rozepsaný v dok. 08 sekce „rozsah MVP“ a doplněný v 12–17**;
při stavbě se řídit jím, ne úplností těchhle dokumentů. To, co je navržené nad rámec
MVP, není zpoždění — je to zajištění, že se na to při stavbě nezapomene tak, aby to
později znamenalo migraci historie.
