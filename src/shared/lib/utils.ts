import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
    ?.split('=')[1]
}

export function setCookie(
  name: string,
  value: string,
  optionsOrDays: number | { expires?: number | Date; path?: string } = 7
) {
  let path = '/'
  let expiresStr = ''
  if (typeof optionsOrDays === 'number') {
    const expires = new Date(Date.now() + optionsOrDays * 864e5).toUTCString()
    expiresStr = `; expires=${expires}`
  } else if (typeof optionsOrDays === 'object') {
    if (optionsOrDays.path) path = optionsOrDays.path
    if (optionsOrDays.expires) {
      const exp =
        optionsOrDays.expires instanceof Date
          ? optionsOrDays.expires
          : new Date(Date.now() + optionsOrDays.expires * 864e5)
      expiresStr = `; expires=${exp.toUTCString()}`
    }
  }
  document.cookie = `${name}=${encodeURIComponent(value)}${expiresStr}; path=${path}; SameSite=Lax`
}

export function removeCookie(name: string, options?: { path?: string }) {
  const path = options?.path ?? '/'
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`
}
