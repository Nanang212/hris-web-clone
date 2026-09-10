// src/shared/lib/auth-guard.ts
import { getCookie, setCookie, removeCookie } from '@/shared/lib/utils'

/**
 * Authentication bypass configuration.
 * When enabled, users can access the application without logging in.
 * Default is TRUE for seamless preview & Vercel deployment.
 * Set VITE_AUTH_BYPASS='false' in .env if strict login is required.
 */
export const IS_AUTH_BYPASS_ENABLED =
  import.meta.env.VITE_AUTH_BYPASS !== 'false'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

export const DEFAULT_DEMO_USER: AuthUser = {
  id: 'usr-admin-01',
  name: 'Rama Aditya',
  email: 'admin@hris-demo.com',
  role: 'Super Admin',
}

/**
 * Checks whether the user is authenticated or if bypass is enabled.
 */
export function isAuthenticated(): boolean {
  if (IS_AUTH_BYPASS_ENABLED) {
    return true
  }
  return getCookie('is_signed_in') === 'true'
}

/**
 * Returns current active user (demo user if bypass is active).
 */
export function getCurrentUser(): AuthUser {
  return DEFAULT_DEMO_USER
}

/**
 * Helper to bypass login manually by setting the cookie and redirecting.
 */
export function bypassSignIn(): void {
  setCookie('is_signed_in', 'true', { path: '/' })
}

/**
 * Helper to clear session.
 */
export function bypassSignOut(): void {
  removeCookie('is_signed_in', { path: '/' })
}
