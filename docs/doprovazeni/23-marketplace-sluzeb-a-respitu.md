# 23 — Marketplace služeb: respit, terapie, doučování

Navazuje na [dok. 22](./22-prepis-dokladu-a-marketplace.md), kde vznikl
marketplace vzdělávání.

---

## 1. Jeden marketplace, dva druhy nabídky

Respit **nedostal vlastní strom**. Profil poskytovatele, nabídka, objednávka,
faktura a potvrzení jsou u kurzu i u tábora totéž — dvě paralelní větve by
znamenaly dvojí správu navždy.

Liší se jen to, co z toho vznikne ve spisu:

| Doména | Nabízí | Potvrzuje | Vzniká ve spisu | Plní |
| --- | --- | --- | --- | --- |
| **vzdělávání** | kurz | certifikát s **hodinami** | vzdělávací záznam | 18 / 24 h ročně |
| **respit** | tábor, hlídání, víkend | potvrzení se **dny** | respitní epizoda | 14 dnů na dítě |
| **terapie** | psycholog, terapeut | potvrzení | záznam odborné pomoci | — |
| **doučování** | doučování, rozvoj | potvrzení | záznam | — |
| **asistovaný kontakt** | asistence při styku | potvrzení | `ContactEvent` | — |
| **poradenství** | odborné poradenství | potvrzení | záznam | — |

### Doména se mapuje na písmeno práva

To není kosmetika. Podle písmene § 47a odst. 2 se výdaj zařadí do **pásma
čerpání státního příspěvku** (§ 5c vyhlášky 473/2012, dok. 02):

```
vzdělávání        → f)     5–15 %
respit            → b)     5–15 %
terapie           → d)    10–20 %
poradenství       → c)    10–20 %
asistovaný kontakt → e)   10–20 %
doučování         → bez písmene
```

Špatné zařazení tedy není chyba v popisku, ale **chyba v čerpání**.

---

## 2. Nález, který u vzdělávání nebyl: kdo smí pečovat o dítě

Tohle je u respitu to podstatné a našel jsem to až při dohledávání v zákoně.

> **§ 49 odst. 4 ZSPOD** — pomoc a podporu při osobní péči o dítě podle
> § 47a odst. 2 písm. a) a b) může poskytovat:
>
> **a)** fyzická osoba **plně svéprávná, zdravotně způsobilá, bezúhonná**
> a splňující další osobnostní předpoklady (posuzuje se obdobně podle
> § 23d odst. 4 písm. b) a d) a § 23e), **nebo**
>
> **b)** osoba **pořádající zotavovací akci** podle zvláštního předpisu —
> tedy tábor.

Prakticky:

- **Tábor je v pořádku tím, že je táborem.** Zotavovací akce se ohlašuje
  hygienické stanici a tím je základ splněný.
- **Paní odvedle, která pohlídá, musí mít doloženou bezúhonnost a zdravotní
  způsobilost.** Výpis z rejstříku trestů, lékařské potvrzení, posouzení
  osobnostních předpokladů.
- **Psycholožka to řešit nemusí** — neposkytuje péči podle písm. a) ani b),
  poskytuje odbornou pomoc podle písm. d).

A teď to nepříjemné: **organizace, která z příspěvku zaplatí neprověřené
hlídání, má problém při kontrole — ne poskytovatel.**

Proto systém **eviduje, na jakém základě poskytovatel péči poskytuje**,
a v nabídce to ukazuje:

```
Hlídání Teplicko            ✓ ověřený poskytovatel
                            ✓ bezúhonnost a zdravotní způsobilost doloženy
                              (platí do 20. 1. 2029)

Doučování Most              ⚠ způsobilost podle § 49 odst. 4 nedoložena
```

**Neblokuje se** (charta, dok. 16). Rozhodnutí patří organizaci — ale systém
za nikoho netvrdí, že je prověřený, když to nikdo nedoložil.

---

## 3. Nabídka může být obecná nebo položková

Psycholog nebude vypisovat termíny, tábor bez termínu nedává smysl. Obojí
proto musí jít:

**Obecná nabídka** — orientační informace a domluva mimo systém:
```
Psychologická poradna Labe · Ústecký kraj
od 900 Kč / konzultace · termíny po domluvě
```

**Položková nabídka** — konkrétní věci, které jdou objednat:
```
Letní pobytový tábor 12.–19. 7.   6 500 Kč / dítě   8 respitních dnů
Příměstský tábor 22.–26. 6.       3 200 Kč / dítě   5 respitních dnů
Víkendová péče (pá–ne)            1 800 Kč / den    3 respitní dny
Hlídání — hodina                    350 Kč / hodina  0 respitních dnů
```

### Poslední řádek je ta zajímavá věc

**Respitní dny nejsou dopočet z jednotky, ale vlastní pole.** Hodinové hlídání
se do čtrnáctidenního nároku obvykle nepočítá vůbec, kdežto tábor po dnech ano.
Kdyby se dny odvozovaly z jednotky, hodinové hlídání by nárok umazávalo — a to
je přesně ta chyba, kterou by nikdo neodhalil, dokud by pěstounce v prosinci
nezbylo pět dnů místo čtrnácti.

A připomínka z dok. 03: **jednotkou je den, i kdyby šlo o hodinu** — u celodenní
péče podle písm. b). Proto obojí: jednotka pro fakturaci, `respiteDays` pro nárok.

---

## 4. Interní poskytovatel

Hlídání nebo doučování dělá zaměstnanec či spolupracovník organizace.
**Nefakturuje se**, protože obě strany jsou tatáž organizace — účtuje se
vnitřně:

```ts
kind: 'internal'
organizationId: Id           // ke které organizaci patří
payment.method: 'internal'   // objednávka rovnou 'confirmed', bez faktury
```

Interní poskytovatel se **nikde nelistuje** — nemá to komu nabízet.

### Co se tím ale nemění

1. **Dny se počítají do nároku stejně.** Hlídání zaměstnankyní organizace je
   pořád zajištěná péče podle § 47a odst. 2 písm. b).
2. **Způsobilost podle § 49 odst. 4 platí i pro zaměstnance.** Bezúhonnost se
   nedokládá podle toho, kdo komu fakturuje.
3. **Vnitřní ocenění je volitelné** — dobrovolnická práce nemusí mít cenu.
   Když ho má, použije se sazba § 5f vyhlášky (260 / 120 / 90 Kč, dok. 04).

A jedna pojistka, která platí i tady: **manžel nebo registrovaný partner
pečující osoby žijící v rodinné domácnosti se podílí na péči ze zákona**
(§ 965 odst. 3 + § 655 odst. 2 OZ), takže mu nelze proplatit ani interně.
To hlídá `CareProviderProfile` (dok. 05), ne marketplace.

---

## 5. Provize a poplatek za listování — v nastavení systému

Podle zadání se obojí nastavuje na úrovni systému. Doplnil jsem k tomu
jednu věc: **nastavuje se zvlášť pro každou doménu.**

Kurz za 1 800 Kč a tábor za 6 500 Kč nemají důvod mít stejnou sazbu, a u služby
za 350 Kč/hodina by procentní provize byla směšná i drahá zároveň.

```ts
defaults: {
  commissionPct, commissionCap, listingFee, listingFeePeriod,
  listingRequiresVerification, listingRequiresEligibility,
}
perDomain: [{ domain: 'respite', listingRequiresEligibility: false }, …]
```

Přidal jsem **strop provize** (`commissionCap`) — bez něj by tábor pro pět dětí
utrhl ucho — a **`listingRequiresEligibility`**: má se nechat listovat
poskytovatele péče, který nedoložil způsobilost? Ve výchozím nastavení **ano**,
protože je to v nabídce vidět a rozhodnutí patří organizaci. Přepínač tam ale je.

V seedu jsou všechny sazby `null`. **O výši rozhoduje vlastník produktu**
(poučení z dok. 21) a mění se to bez nasazení kódu.

---

## 6. Co se o dítěti dostane ven

Nejcitlivější místo celého marketplace. Poskytovatel respitu potřebuje dítě
přijmout, takže se něco vědět musí — ale jen to:

| Dostane | Nedostane |
| --- | --- |
| jméno dítěte | spis, zápisy, diagnózu |
| věk | rodinu, pěstouny, jejich adresu |
| termín a rozsah | důvod umístění, historii |

`ServiceBooking.childId` je **jediné místo, kde se marketplace dotýká dítěte**,
a žije uvnitř objednávky, kterou vidí jen kupující a poskytovatel. Do veřejné
nabídky ani do objednávky hosta se dítě nedostane nikdy.

Potvrzení služby (`confirmations/**`) proto na rozdíl od certifikátu **nesmí
číst každý přihlášený** — je v něm jméno dítěte. Čte ho poskytovatel a
organizace, která ho objednala. Otestované.

---

## 7. Kde to je

| Věc | Soubor |
| --- | --- |
| Poskytovatel obou domén, způsobilost § 49 odst. 4, nabídky, objednávky, potvrzení, interní péče, podmínky | `schema/src/marketplace.ts` |
| Cesty: `providers/*/services`, `confirmations`, `internalDeliveries` | `schema/src/paths.ts` |
| Oprávnění: veřejné nabídky, potvrzení jen svým, dny nepřepíše klient | `firestore.rules` |
| Testy (54, všechny prochází) | `tests/rules.test.mjs` |
| Testovací data | `tools/seed/` |

Testovací data teď obsahují **6 poskytovatelů** ve všech kombinacích, na kterých
se dá testovat to podstatné:

| Poskytovatel | Doména | Způsobilost | K čemu je v sadě |
| --- | --- | --- | --- |
| Akademie NRP | vzdělávání | netýká se | ověřený, s akreditací |
| Most k rodině | vzdělávání, poradenství | netýká se | neověřený |
| Tábory Slunce | respit | **zotavovací akce** | § 49 odst. 4 písm. b) |
| Hlídání Teplicko | respit | **fyzická osoba, doloženo** | § 49 odst. 4 písm. a) |
| Psychologická poradna Labe | terapie | netýká se | obecná nabídka bez termínů |
| Doučování Most | doučování | **nedoloženo** | v nabídce je to vidět |

Plus 9 objednávek respitu, 7 potvrzení služby a 6 interních dodávek.

### Co to mění jinde

| Dokument | Změna |
| --- | --- |
| 03 | „i hodina = jeden den“ platí u celodenní péče; hodinové hlídání nárok neumazává |
| 04 | sazby § 5f se používají i pro vnitřní ocenění interní péče |
| 05 | zákaz úplaty manželovi platí i u interního poskytovatele |
| 09 | respitní dny z marketplace jdou s pěstounem při přechodu jako každé jiné |
| 22 | `CourseProvider` → `MarketplaceProvider` s doménami; `CourseListing` → `Listing` |

### Co ještě chybí

| Chybí | Kdy |
| --- | --- |
| Automatické vytvoření `CareEpisode` z potvrzení | s Cloud Functions |
| Kontrola nároku při objednávce („zbývají 4 dny ze 14“) | s motorem lhůt |
| Registrace poskytovatele a jeho přihlášení | s přihlašováním (dok. 19) |
| Upozornění na propadlou způsobilost | s notifikacemi (dok. 18) |
