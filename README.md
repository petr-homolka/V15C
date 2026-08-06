# Doprovázení.com — CRM Portál Pěstounské Péče (v10G HLAVNÍ VERZE)

Tento repozitář obsahuje **hlavní produkční verzi** CRM/SaaS systému **Doprovázení.com** pro doprovázející organizace pěstounské péče v ČR (zákon č. 359/1999 Sb.).

---

## Hlavní modul: Titulní Denní Agenda & Úkoly

Hlavním výchozím rozhraním pro klíčové osoby a administrátory je **`RoutineAgendaView`**:

1. **1denní Časová Osa (Timeline Kalendář)**:
   - 24hodinový denní kalendář s ukazatelem aktuálního času v reálném čase.
   - Integrovaný kalendář svátků (jmenin) a narozenin sledovaných dětí, pěstounů a pracovníků.
   - Celodenní události a podpora Drag & Drop přetahování schůzek.

2. **Panel Úkolů & Rychlý Zápisník**:
   - Rychlé přidávání úkolů (včetně klávesové zkratky Ctrl+K / Cmd+K).
   - Členění podle priorit, termínů a klientských spisů.
   - Přímé propojení úkolů s entitami rodin a dětí.

---

## Architektura a Datové Služby

- **UID Model**: Jedinečné generování identifikátorů spisů a dohod (`src/services/uid.js`).
- **Data & Firestore**: Podpora Firebase Firestore a offline simulovaných dat pro vývoj (`src/services/seedDataService.js`).
- **PWA Podpora**: Automatická registrace Service Workeru (`vite-plugin-pwa`) s offline kešováním.

---

## Spuštění v lokálním prostředí

```bash
# Instalace závislostí
npm install

# Spuštění vývojového serveru
npm run dev

# Sestavení produkčního balíčku
npm run build
```
