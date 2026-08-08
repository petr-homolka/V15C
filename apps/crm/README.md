# CRM — kostra aplikace

Mobilní aplikace pro Klíčovou osobu (doprovazeni.com). Zatím kostra: pohledy,
data a několik obrazovek. Slouží k tomu, aby se dalo klikat, ne k provozu.

```bash
npm run install:app     # jednou
npm run dev             # http://localhost:5173
npm run build           # tsc + vite build → apps/crm/dist
```

## Tři věci, které jsou tu schválně

**1. Data se negenerují ze serveru, ale v prohlížeči.** `src/demo/store.ts`
volá `build()` z `tools/seed` — tentýž generátor, který sype data do emulátoru.
Důvod: přihlášení zatím není a pravidla nepřihlášenému čtení nic nepovolí (a to
je správně), takže cesta přes Firestore by teď znamenala buď vypnutá pravidla,
nebo přihlášení. Navíc se sada a obrazovky nemohou rozejít.

Až bude přihlášení, vymění se `store.ts` za dotazy do Firestore. `demo/data.ts`
je proto úzké a cesty skládá výhradně přes `schema/src/paths.ts`.

**2. Přihlášení nahrazuje přepínač pohledů.** `src/persona.tsx` staví seznam
person z dat, ne z pevného seznamu — vedení, Klíčové osoby, pečující osoba a
dítě z každé organizace, plus správce systému. Persona drží přesně to, co bude
po přihlášení v tokenu: kdo, v jaké organizaci, s jakou rolí.

**3. Motiv vlastní `theme.js` z PWA vrstvy.** Je importovaný přes bundler
(`main.tsx`), ne vlastním `<script>` — jinak by v aplikaci běžely dvě kopie
modulu, každá s vlastním stavem. Skript proti probliknutí v `index.html`
naopak vložený **zůstat musí**; externí se načte až po prvním vykreslení.

## Obrazovky

| Cesta | Co je |
| --- | --- |
| `#/` | domů podle pohledu — rodiny a lhůty, u pěstouna vlastní rodina, u dítěte profil, u správce seznam organizací |
| `#/dohoda/{uid}` | karta dohody: přehled, záznamy, lhůty, dokumenty |
| `#/prepnout` | výběr pohledu a motivu |

Směrování je přes hash, bez knihovny. Až bude soupis obrazovek, přibude router.

## Co tu ještě není

| Chybí | Proč |
| --- | --- |
| service worker | `design-system/pwa/sw.js` má seznam souborů k předcachování; Vite jména hashuje, takže se musí generovat při buildu |
| Firestore a přihlášení | dok. 19 — až po prvních testech |
| editor, diktování, Eli | dok. 15, 17, 20 |
| zápis čehokoli | kostra jen čte |
