import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    // Vyhýbáme se 5173 (výchozí port Vite), 5175 i 5273 — na těch u nás běží
    // starší prototypy. `strictPort` je tu proto, aby se aplikace při obsazeném
    // portu neodstěhovala jinam; to je přesně ten druh záměny, kvůli které se
    // pak ladí nesprávná verze.
    port: 5373,
    strictPort: true,
    // Aplikace sahá na `design-system/`, `schema/` a `tools/seed/` mimo svůj
    // adresář — bez tohohle je Vite ve vývoji odmítne podat.
    fs: { allow: ['../..'] },
  },
  preview: { port: 5374, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true },
})
