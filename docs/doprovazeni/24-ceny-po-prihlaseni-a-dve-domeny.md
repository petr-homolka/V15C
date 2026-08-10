# 24 — Ceny až po přihlášení, dvě domény

---

## 1. Ceny jen pro přihlášené

Zadání: nepřihlášený vidí názvy, popisy a fotky, ale **ne ceny**. Pro ceny se
musí přihlásit, nebo zaregistrovat a nechat si ověřit, že je pěstoun.

### 1.1 Cenu nejde skrýt v rozhraní

Tohle je ta věc, kvůli které to není úprava obrazovky, ale zásah do modelu.

> **Bezpečnostní pravidla neumí skrýt pole.** Kdyby cena zůstala polem
> veřejné nabídky, nebyla by skrytá — kdokoli by si dokument přečetl přes
> SDK bez ohledu na to, co ukazuje stránka. „Nezobrazit v UI“ není skrytí.

Je to potřetí, co tenhle rys Firestore tvaruje model: poprvé u obsahu spisu
a kontaktů (dok. 04), podruhé u indexu dokumentů (dok. 17), potřetí tady.

Cena proto žije v **`listings/{id}/pricing/current`** — vlastní dokument
s vlastním pravidlem:

```
listings/{id}                    VEŘEJNÉ
  název, perex, popis, fotky, rozsah, kraj, termín
  hasPrice: true
  priceHiddenNote: „Ceny se zobrazují po přihlášení…“

listings/{id}/pricing/current    JEN OVĚŘENÝM
  priceFrom, priceNote, rozpis položek
```

Kdo cenu uvidí:

| Kdo | Jak se pozná |
| --- | --- |
| pracovnice doprovázející organizace | má roli v tokenu |
| pěstoun v systému | má roli v tokenu |
| **ověřený pěstoun mimo systém** | `carer: true` v tokenu |
| poskytovatel u vlastní nabídky | `providers` v tokenu |

Příznak je **v tokenu, ne v databázi**, aby čtení ceny nestálo další čtení
(README sekce 1.2). Otestované — nepřihlášený nabídku přečte, cenu ne.

### 1.2 Předrenderovaný katalog bez cen

Veřejný katalog musí najít vyhledávače, takže se **předrenderuje na serveru** —
klientská aplikace, která si data dotáhne až v prohlížeči, se indexuje špatně.

Do předrenderovaného HTML se ale **cena nedostane**. Kdyby tam byla, byla by
ve zdroji stránky i ve výsledcích vyhledávání a celé skrývání by nemělo smysl.

### 1.3 Jak ověřit, že někdo je pěstoun — a nesebrat přitom údaje o dítěti

Nejjednodušší cesta by byla *„nahrajte rozhodnutí soudu o svěření“*. Jenže to
je listina plná údajů o dítěti podle čl. 9 GDPR a my ji chceme **jen proto,
abychom někomu ukázali ceník.** To je nepřiměřené a nedělal bych to.

Přiměřené jsou tři cesty, seřazené od nejlepší:

| # | Cesta | Co se sbírá |
| --- | --- | --- |
| **1** | **Je v systému.** Pěstoun doprovázené organizace se přihlásí a je ověřený tím, že má dohodu. | nic navíc |
| **2** | **Potvrdí ho organizace.** Zadá kód od své doprovázející organizace, nebo ho organizace potvrdí na vyžádání. | nic se nenahrává |
| **3** | **Ruční posouzení.** Doloží potvrzení své organizace nebo ORP — **ne rozhodnutí o svěření**. Posoudí superadmin. | jeden doklad, dočasně |

A hlavně: **doklad se po rozhodnutí smaže.** Zůstane jen fakt, že ověření
proběhlo, kdy, na jakém základě a kdo ho udělal. Držet potvrzení navždy kvůli
zobrazení ceny nemá žádný důvod — proto je vedle pole na doklad i
`evidenceDeletedOn`.

Ověření má **platnost**. Pěstounem člověk být přestane a věčný přístup k cenám
by to ignoroval.

Neověřený **není odmítnutý** — jen nevidí ceny, a je mu řečeno, co s tím
(charta, dok. 16):

> Ceny se zobrazují po přihlášení. Pěstouni a doprovázející organizace se
> přihlásí; ostatní se mohou registrovat a nechat si ověřit, že jsou pěstouny.

### 1.4 Veřejný účet je jednoúčelový

`publicProfiles/{uid}` existuje kvůli jediné věci: **aby člověk uviděl ceny
a mohl objednat.** Do CRM se s ním nedostane, protože nemá roli v žádné
organizaci — a to není hlídané doménou, ale pravidly.

Jedna věc je v pravidlech vynucená zvlášť: **ověření si uživatel nenastaví
sám.** Registrovat se smí každý, ale `verification.status` z klienta zapsat
nejde a při úpravě profilu se musí shodovat s tím, co už tam je. Jinak by
stačilo poslat si `status: 'verified'` a ceny by byly veřejné. Otestované.

### 1.5 Jedna praktická poznámka

Skrývání cen je běžný postup, ale má dvě daně, se kterými je dobré počítat:
vyhledávače neukážou cenu v náhledu výsledku a část návštěvníků odejde, než
se zaregistruje. Je to tvoje rozhodnutí a implementoval jsem ho celé — jen ať
to není překvapení, až se bude měřit, kolik lidí projde registrací.

---

## 2. Dvě domény

```
doprovazeni.com   CRM — spisy, lhůty, zprávy, Eli
pestouni.com      marketplace — veřejný katalog, účty pěstounů, objednávky
```

Jeden projekt Firebase, jedna databáze, **dva hosting targets**. Konfigurace
je v `firebase.json` a `.firebaserc`.

### 2.1 Hranicí nejsou domény, ale pravidla

Doména rozhoduje o tom, **co se vykreslí**. O tom, **co jde přečíst**, rozhoduje
token. Kdo přijde na `doprovazeni.com` bez role v organizaci, neuvidí nic —
a to je správně, protože jinak by stačilo znát adresu.

Kdyby ochrana stála na doméně, byla by to iluze: obě aplikace mluví se stejnou
databází přes stejné SDK.

### 2.2 Tři věci, které se u dvou domén dělají špatně

**1. Přihlášení se mezi doménami nepřenáší.** Firebase Auth drží relaci per
origin, takže kdo se přihlásí na `pestouni.com`, není přihlášený na
`doprovazeni.com`. **Není to chyba k opravě** — pěstoun se přihlašuje na svém
webu a pracovnice na svém, což je čitelnější než jedna relace na obojím.

**2. Obě domény musí být v Authentication → Authorized domains.** Jinak
přihlášení na jedné z nich mlčky selže a chyba se hledá špatně.

**3. CRM se neindexuje.** `X-Robots-Tag: noindex, nofollow` — není tam nic pro
vyhledávače a spis se hledat nemá. Marketplace naopak indexovaný být má.

### 2.3 Kam patří ověřovací stránky QR kódů

Podle toho, kdo dokument vydal:

| Dokument | Adresa |
| --- | --- |
| zpráva, odpověď úřadu, doklad ze spisu | `doprovazeni.com/overeni/{token}` |
| certifikát z kurzu | `pestouni.com/overeni/{token}` |
| potvrzení služby | `pestouni.com/overeni/{token}` |

Důvod je praktický: certifikát dostane i host, který CRM nikdy neviděl a
`doprovazeni.com` mu nic neříká. Pravidlo z dok. 21 platí na obou —
**QR vede na ověření, ne na obsah.**

---

## 3. Kde to je

| Věc | Soubor |
| --- | --- |
| `Listing` bez ceny, `ListingPricing`, `PublicProfile`, `CarerVerification`, `DOMAINS` | `schema/src/marketplace.ts` |
| Cesta `listings/{id}/pricing/current`, `publicProfiles` | `schema/src/paths.ts` |
| Pravidla: cena jen ověřeným, ověření si uživatel nenastaví sám | `firestore.rules` |
| Dva hosting targets, předrender katalogu, noindex na CRM | `firebase.json`, `.firebaserc` |
| Testy (65, všechny prochází) | `tests/rules.test.mjs` |

### Co to mění jinde

| Dokument | Změna |
| --- | --- |
| 19 | k přihlášení přibývá druhá doména a účty mimo organizace |
| 21 | ověřovací stránka má dvě adresy podle vydavatele |
| 22, 23 | `Listing.priceFrom` → `listings/{id}/pricing/current` |

### Co ještě chybí

| Chybí | Kdy |
| --- | --- |
| Předrenderovací funkce katalogu | se scaffoldem |
| Kód organizace pro ověření pěstouna | s onboardingem (dok. 09) |
| Úklidová funkce, která maže doklad po rozhodnutí | s Cloud Functions |
| Nastavení `carer: true` do tokenu po ověření | s Cloud Functions |
