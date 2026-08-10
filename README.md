# V15C

## Spuštění u sebe (Windows, PowerShell)

Potřebujete **Node.js 20.19 nebo novější** (doporučeně LTS 22) a **Git**.
Verzi ověříte `node -v`. Nic dalšího — databáze ani Firebase pro prohlížení
prototypu není potřeba, testovací data se staví v prohlížeči.

Každý příkaz na samostatný řádek (starší PowerShell neumí `&&`):

```powershell
git clone https://github.com/petr-homolka/V15C.git
cd V15C
git checkout claude/github-design-resources-erjstg
npm run dev
```

Poprvé to trvá minutu — `npm run dev` si sám doinstaluje závislosti aplikace.
Pak otevřete **http://localhost:5373**.

Port je připíchnutý schválně (`strictPort` ve `vite.config.ts`): když ho něco
obsadí, Vite se neodstěhuje jinam a zahlásí chybu. To je lepší než ladit
omylem starší prototyp na 5173, 5175 nebo 5273.

Aplikaci zastavíte `Ctrl+C`. Novou verzi si stáhnete takto:

```powershell
git pull origin claude/github-design-resources-erjstg
npm run dev
```

### Když to spadne

**„Failed to resolve import ‚@keenthemes/ktui'"** (nebo jiný balíček) znamená,
že v `node_modules` chybí závislost, která do `package.json` přibyla později —
typicky po `git pull` na starším naklonovaném repozitáři. Spusťte:

```powershell
npm install --prefix apps/crm
npm run dev
```

Od nynějška si to `npm run dev` udělá sám (skript `predev`), a to i když ho
spustíte z adresáře `apps/crm`. Co je nainstalované, ověříte:

```powershell
npm ls --prefix apps/crm @keenthemes/ktui
```

Když ani to nepomůže, smažte `apps\crm\node_modules` a spusťte `npm run dev`
znovu — instalace se udělá celá od začátku.

### Co si prohlédnout

- Vpravo nahoře je **přepínač person** — Klíčová osoba vidí svoje dohody,
  vedení celou organizaci. Data se tím mění, ne jen popisek.
- Vlevo je **dvojpanel**: lišta oblastí a navigace, ve které se Dohody,
  Pěstouni, Děti a Tým rozbalí na jména. Šipka dole panel zúží.
- Vpravo je lišta **připnutých lidí** (od šířky okna 1024 px).
- Tmavý režim a další volby jsou v **Nastavení → Pohled a vzhled**.

### Další příkazy

Tyhle potřebují závislosti i v korunu repozitáře (`npm install` v `V15C`):

| Příkaz | K čemu |
| --- | --- |
| `npm run build` | produkční build aplikace do `apps/crm/dist` |
| `npm run typecheck` | kontrola typů v `schema/` a `tools/seed/` |
| `npm test` | testy schématu a pravidel Firestore (potřebuje emulátor) |
| `npm run emulator` | Firestore + Auth emulátor |
| `npm run seed` | naplnění emulátoru testovacími daty |

## Design system

This repo uses **Geist** — Vercel's design system — vendored in
[`design-system/`](./design-system).

It is not an approximation. The `--ds-*` tokens are copied verbatim from
`@vercel/geistdocs` (the same values that paint vercel.com), and the typefaces
are the `.woff2` binaries Vercel ships in the `geist` package.

```css
@import "./design-system/geist.css";
```

Then build with the tokens:

```css
.card {
  background: var(--ds-background-100);
  color: var(--ds-gray-1000);
  box-shadow: var(--ds-shadow-border-small);
  border-radius: 6px;
}
```

Dark mode is a `.dark` class on `<html>`.

- **[`design-system/README.md`](./design-system/README.md)** — the full reference:
  colour scales and what each step means, shadows, radii, breakpoints, the four
  typography families, materials, and how to sync with upstream.
- **[`design-system/preview.html`](./design-system/preview.html)** — open it in a
  browser (no server needed) to see every token rendered in both themes.
- **[`design-system/pwa/README.md`](./design-system/pwa/README.md)** — the
  installed-app layer: safe areas, status-bar colour that tracks the theme, no
  flash on cold start, and a service worker that precaches the visual layer.
- **[`design-system/NOTICE.md`](./design-system/NOTICE.md)** — licences.
  Tokens are Apache-2.0, fonts are SIL OFL 1.1.

Anything visual in this repo should be built from these tokens rather than
hard-coded values.
