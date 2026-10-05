// src/features/payroll/lib/bpjs-effective.ts
// Resolusi setting BPJS yang berlaku untuk suatu periode payroll ("YYYY-MM").
// Periode lama tidak ikut berubah saat tarif / cap diganti karena dipilih berdasar tanggal berlaku.
import type { BpjsKesConfig, BpjsTkConfig, BpjsTkProjectSetting, WageCapRule } from '../types'

const latestEffective = <T extends { effectiveFrom: string }>(items: T[], periodKey: string) =>
  items
    .filter((item) => item.effectiveFrom <= periodKey)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]

export function resolveWageCaps(
  rules: WageCapRule[],
  periodKey: string,
  fallback: { kes: number; jp: number },
): { kes: number; jp: number } {
  const rule = latestEffective(rules, periodKey)
  return rule ? { kes: rule.kesMaxWageCap, jp: rule.jpMaxWageCap } : fallback
}

export function resolveTkProjectSetting(
  settings: BpjsTkProjectSetting[],
  projectId: string,
  periodKey: string,
): BpjsTkProjectSetting | undefined {
  return latestEffective(
    settings.filter((s) => s.projectId === projectId),
    periodKey,
  )
}

/** Config BPJS Kes untuk periode tertentu (cap mengikuti tanggal berlaku). */
export function bpjsKesConfigForPeriod(
  config: BpjsKesConfig,
  rules: WageCapRule[],
  periodKey: string,
): BpjsKesConfig {
  const caps = resolveWageCaps(rules, periodKey, { kes: config.maxWageCap, jp: 0 })
  return { ...config, maxWageCap: caps.kes }
}

/** Config BPJS TK untuk periode tertentu (cap JP mengikuti tanggal berlaku). */
export function bpjsTkConfigForPeriod(
  config: BpjsTkConfig,
  rules: WageCapRule[],
  periodKey: string,
): BpjsTkConfig {
  const caps = resolveWageCaps(rules, periodKey, { kes: 0, jp: config.jpMaxWageCap })
  return { ...config, jpMaxWageCap: caps.jp }
}
