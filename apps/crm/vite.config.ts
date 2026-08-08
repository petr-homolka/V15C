import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    // 5173 je výchozí port Vite a běží na něm starší prototyp. `strictPort`
    // je tu proto, aby se aplikace při obsazeném portu neodstěhovala jinam —
    // to je přesně ten druh záměny, kvůli kterému se pak ladí nesprávná verze.
    port: 5273,
    strictPort: true,
    // Aplikace sahá na `design-system/`, `schema/` a `tools/seed/` mimo svůj
    // adresář — bez tohohle je Vite ve vývoji odmítne podat.
    fs: { allow: ['../..'] },
  },
  preview: { port: 5274, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true },
})
