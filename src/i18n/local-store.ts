import { useSyncExternalStore } from 'react'
import {
  getLocale,
  setLocale as setParaglideLocale,
  type Locale,
} from '@/i18n/paraglide/runtime'

type Listener = () => void
const listeners = new Set<Listener>()

export function subscribeLocale(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getLocaleSnapshot(): Locale {
  return getLocale()
}

export async function switchLocale(locale: Locale) {
  await setParaglideLocale(locale, { reload: false })
  for (const listener of listeners) listener()
}

export function useLocale() {
  return useSyncExternalStore(subscribeLocale, getLocaleSnapshot)
}
