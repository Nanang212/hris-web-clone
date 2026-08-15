import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svgr(),
    paraglideVitePlugin({
      project: './src/i18n/project.inlang',
      outdir: './src/i18n/paraglide',
      emitTsDeclarations: true,
    }),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      generatedRouteTree: './src/shared/router/route-tree.gen.ts',
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
