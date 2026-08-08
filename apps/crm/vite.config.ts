import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    // Aplikace sahá na `design-system/`, `schema/` a `tools/seed/` mimo svůj
    // adresář — bez tohohle je Vite ve vývoji odmítne podat.
    fs: { allow: ['../..'] },
  },
  build: { outDir: 'dist', emptyOutDir: true },
})
