/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module '@/i18n/paraglide/messages' {
  type MessageFunction = ((inputs?: any, options?: { locale?: string }) => string)

  export const m: Record<string, MessageFunction> & typeof import('@/i18n/paraglide/messages/_index.js')
  export * from '@/i18n/paraglide/messages/_index.js'
}

