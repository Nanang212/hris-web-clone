// src/features/payroll/lib/pph21-calc.ts
// Engine perhitungan PPh 21 sesuai PMK 168/2023 (TER Bulanan Kategori A, B, C)
// dan opsi metode Progresif Tahunan Pasal 17 UU HPP / Gross Up / Nett.

import type { Pph21Config } from '../types'

export type TerCategory = 'A' | 'B' | 'C'

interface TerBracket {
  upTo: number
  ratePercent: number
}

/**
 * Matriks resmi TER Bulanan Kategori A (PMK 168/2023)
 * Berlaku untuk PTKP: TK/0 (Rp 54 jt), TK/1 (Rp 58.5 jt), K/0 (Rp 58.5 jt)
 */
const TER_A_BRACKETS: TerBracket[] = [
  { upTo: 5_400_000, ratePercent: 0 },
  { upTo: 5_650_000, ratePercent: 0.25 },
  { upTo: 5_950_000, ratePercent: 0.5 },
  { upTo: 6_300_000, ratePercent: 0.75 },
  { upTo: 6_750_000, ratePercent: 1.0 },
  { upTo: 7_500_000, ratePercent: 1.25 },
  { upTo: 8_550_000, ratePercent: 1.5 },
  { upTo: 9_650_000, ratePercent: 1.75 },
  { upTo: 10_050_000, ratePercent: 2.0 },
  { upTo: 10_350_000, ratePercent: 2.25 },
  { upTo: 10_700_000, ratePercent: 2.5 },
  { upTo: 12_500_000, ratePercent: 3.0 },
  { upTo: 13_750_000, ratePercent: 4.0 },
  { upTo: 15_100_000, ratePercent: 5.0 },
  { upTo: 16_950_000, ratePercent: 6.0 },
  { upTo: 19_750_000, ratePercent: 7.0 },
  { upTo: 24_100_000, ratePercent: 8.0 },
  { upTo: 26_450_000, ratePercent: 9.0 },
  { upTo: 28_000_000, ratePercent: 10.0 },
  { upTo: 30_050_000, ratePercent: 11.0 },
  { upTo: 32_400_000, ratePercent: 12.0 },
  { upTo: 35_400_000, ratePercent: 13.0 },
  { upTo: 39_100_000, ratePercent: 14.0 },
  { upTo: 43_850_000, ratePercent: 15.0 },
  { upTo: 47_800_000, ratePercent: 16.0 },
  { upTo: 51_400_000, ratePercent: 17.0 },
  { upTo: 56_300_000, ratePercent: 18.0 },
  { upTo: 62_200_000, ratePercent: 19.0 },
  { upTo: 68_600_000, ratePercent: 20.0 },
  { upTo: 77_500_000, ratePercent: 21.0 },
  { upTo: 89_000_000, ratePercent: 22.0 },
  { upTo: 101_900_000, ratePercent: 23.0 },
  { upTo: 120_200_000, ratePercent: 24.0 },
  { upTo: 147_700_000, ratePercent: 25.0 },
  { upTo: 188_700_000, ratePercent: 26.0 },
  { upTo: 250_300_000, ratePercent: 27.0 },
  { upTo: 356_500_000, ratePercent: 28.0 },
  { upTo: 496_200_000, ratePercent: 29.0 },
  { upTo: 678_800_000, ratePercent: 30.0 },
  { upTo: 950_400_000, ratePercent: 31.0 },
  { upTo: 1_400_000_000, ratePercent: 32.0 },
  { upTo: Number.POSITIVE_INFINITY, ratePercent: 34.0 },
]

/**
 * Matriks resmi TER Bulanan Kategori B (PMK 168/2023)
 * Berlaku untuk PTKP: TK/2, TK/3, K/1, K/2 (Rp 63 jt s.d. Rp 67.5 jt)
 */
const TER_B_BRACKETS: TerBracket[] = [
  { upTo: 6_200_000, ratePercent: 0 },
  { upTo: 6_500_000, ratePercent: 0.25 },
  { upTo: 6_850_000, ratePercent: 0.5 },
  { upTo: 7_300_000, ratePercent: 0.75 },
  { upTo: 9_200_000, ratePercent: 1.0 },
  { upTo: 10_750_000, ratePercent: 1.5 },
  { upTo: 11_250_000, ratePercent: 2.0 },
  { upTo: 11_600_000, ratePercent: 2.5 },
  { upTo: 12_600_000, ratePercent: 3.0 },
  { upTo: 13_600_000, ratePercent: 4.0 },
  { upTo: 14_950_000, ratePercent: 5.0 },
  { upTo: 16_400_000, ratePercent: 6.0 },
  { upTo: 18_450_000, ratePercent: 7.0 },
  { upTo: 21_850_000, ratePercent: 8.0 },
  { upTo: 26_000_000, ratePercent: 9.0 },
  { upTo: 27_700_000, ratePercent: 10.0 },
  { upTo: 29_350_000, ratePercent: 11.0 },
  { upTo: 31_450_000, ratePercent: 12.0 },
  { upTo: 33_950_000, ratePercent: 13.0 },
  { upTo: 37_100_000, ratePercent: 14.0 },
  { upTo: 41_100_000, ratePercent: 15.0 },
  { upTo: 45_800_000, ratePercent: 16.0 },
  { upTo: 49_500_000, ratePercent: 17.0 },
  { upTo: 53_800_000, ratePercent: 18.0 },
  { upTo: 58_500_000, ratePercent: 19.0 },
  { upTo: 64_000_000, ratePercent: 20.0 },
  { upTo: 71_000_000, ratePercent: 21.0 },
  { upTo: 80_000_000, ratePercent: 22.0 },
  { upTo: 93_000_000, ratePercent: 23.0 },
  { upTo: 109_000_000, ratePercent: 24.0 },
  { upTo: 129_000_000, ratePercent: 25.0 },
  { upTo: 163_000_000, ratePercent: 26.0 },
  { upTo: 211_000_000, ratePercent: 27.0 },
  { upTo: 274_000_000, ratePercent: 28.0 },
  { upTo: 382_000_000, ratePercent: 29.0 },
  { upTo: 524_000_000, ratePercent: 30.0 },
  { upTo: 715_000_000, ratePercent: 31.0 },
  { upTo: 1_000_000_000, ratePercent: 32.0 },
  { upTo: 1_405_000_000, ratePercent: 33.0 },
  { upTo: Number.POSITIVE_INFINITY, ratePercent: 34.0 },
]

/**
 * Matriks resmi TER Bulanan Kategori C (PMK 168/2023)
 * Berlaku untuk PTKP: K/3 (Kawin + 3 Tanggungan: Rp 72 jt)
 */
const TER_C_BRACKETS: TerBracket[] = [
  { upTo: 6_600_000, ratePercent: 0 },
  { upTo: 6_950_000, ratePercent: 0.25 },
  { upTo: 7_350_000, ratePercent: 0.5 },
  { upTo: 7_800_000, ratePercent: 0.75 },
  { upTo: 8_850_000, ratePercent: 1.0 },
  { upTo: 9_800_000, ratePercent: 1.25 },
  { upTo: 10_950_000, ratePercent: 1.5 },
  { upTo: 11_200_000, ratePercent: 1.75 },
  { upTo: 12_050_000, ratePercent: 2.0 },
  { upTo: 12_950_000, ratePercent: 3.0 },
  { upTo: 14_150_000, ratePercent: 4.0 },
  { upTo: 15_550_000, ratePercent: 5.0 },
  { upTo: 17_050_000, ratePercent: 6.0 },
  { upTo: 19_500_000, ratePercent: 7.0 },
  { upTo: 22_700_000, ratePercent: 8.0 },
  { upTo: 26_600_000, ratePercent: 9.0 },
  { upTo: 28_100_000, ratePercent: 10.0 },
  { upTo: 30_100_000, ratePercent: 11.0 },
  { upTo: 32_600_000, ratePercent: 12.0 },
  { upTo: 35_400_000, ratePercent: 13.0 },
  { upTo: 38_900_000, ratePercent: 14.0 },
  { upTo: 43_000_000, ratePercent: 15.0 },
  { upTo: 47_400_000, ratePercent: 16.0 },
  { upTo: 51_200_000, ratePercent: 17.0 },
  { upTo: 55_800_000, ratePercent: 18.0 },
  { upTo: 60_800_000, ratePercent: 19.0 },
  { upTo: 66_700_000, ratePercent: 20.0 },
  { upTo: 74_500_000, ratePercent: 21.0 },
  { upTo: 83_200_000, ratePercent: 22.0 },
  { upTo: 95_600_000, ratePercent: 23.0 },
  { upTo: 110_000_000, ratePercent: 24.0 },
  { upTo: 134_000_000, ratePercent: 25.0 },
  { upTo: 169_500_000, ratePercent: 26.0 },
  { upTo: 221_000_000, ratePercent: 27.0 },
  { upTo: 290_000_000, ratePercent: 28.0 },
  { upTo: 400_000_000, ratePercent: 29.0 },
  { upTo: 546_000_000, ratePercent: 30.0 },
  { upTo: 745_000_000, ratePercent: 31.0 },
  { upTo: 1_050_000_000, ratePercent: 32.0 },
  { upTo: 1_419_000_000, ratePercent: 33.0 },
  { upTo: Number.POSITIVE_INFINITY, ratePercent: 34.0 },
]

/** Normalisasi status PTKP (misal: "k/1", "K / 1" -> "K/1") */
export function normalizePtkp(status: string): string {
  return status.replace(/\s+/g, '').toUpperCase()
}

/** Menentukan Kategori TER (A, B, atau C) berdasarkan status PTKP */
export function getTerCategory(ptkpStatus: string): TerCategory {
  const norm = normalizePtkp(ptkpStatus)
  switch (norm) {
    case 'TK/0':
    case 'TK/1':
    case 'K/0':
      return 'A'
    case 'TK/2':
    case 'TK/3':
    case 'K/1':
    case 'K/2':
      return 'B'
    case 'K/3':
      return 'C'
    default:
      return 'A'
  }
}

/** Mengambil persentase tarif TER (%) berdasarkan kategori dan penghasilan bruto bulanan */
export function getTerRatePercent(category: TerCategory, grossMonthly: number): number {
  if (grossMonthly <= 0) return 0
  const brackets =
    category === 'A' ? TER_A_BRACKETS : category === 'B' ? TER_B_BRACKETS : TER_C_BRACKETS

  for (const b of brackets) {
    if (grossMonthly <= b.upTo) {
      return b.ratePercent
    }
  }
  return 34.0
}

const PTKP_PER_DEPENDENT = 4_500_000
const JOB_COST_RATE = 0.05
const JOB_COST_MAX_MONTHLY = 500_000

export function getPtkpAnnualAmount(status: string, cfg: Pph21Config): number {
  const norm = normalizePtkp(status)
  switch (norm) {
    case 'TK/1':
      return cfg.ptkpTK0 + PTKP_PER_DEPENDENT
    case 'TK/2':
      return cfg.ptkpTK0 + PTKP_PER_DEPENDENT * 2
    case 'TK/3':
      return cfg.ptkpTK0 + PTKP_PER_DEPENDENT * 3
    case 'K/0':
      return cfg.ptkpK0
    case 'K/1':
      return cfg.ptkpK1
    case 'K/2':
      return cfg.ptkpK2
    case 'K/3':
      return cfg.ptkpK3
    default:
      return cfg.ptkpTK0
  }
}

/** Tarif progresif Pasal 17 UU HPP */
function progressiveTax(pkp: number): number {
  const brackets: { upTo: number; rate: number }[] = [
    { upTo: 60_000_000, rate: 0.05 },
    { upTo: 250_000_000, rate: 0.15 },
    { upTo: 500_000_000, rate: 0.25 },
    { upTo: 5_000_000_000, rate: 0.3 },
    { upTo: Number.POSITIVE_INFINITY, rate: 0.35 },
  ]
  let remaining = pkp
  let lower = 0
  let tax = 0
  for (const { upTo, rate } of brackets) {
    if (remaining <= 0) break
    const slice = Math.min(remaining, upTo - lower)
    tax += slice * rate
    remaining -= slice
    lower = upTo
  }
  return tax
}

/**
 * Menghitung PPh 21 bulanan secara komprehensif:
 * - Jika `useTERScheme` = true: menggunakan tarif TER Bulanan PMK 168/2023.
 * - Jika `useTERScheme` = false: menggunakan tarif progresif tahunan / 12 (anualisasi).
 * - Mendukung metode:
 *   - 'gross': dipotong dari gaji karyawan (mengurangi THP)
 *   - 'nett': ditanggung perusahaan (tidak mengurangi THP)
 *   - 'gross_up': diberikan tunjangan pajak (net pay terjaga, pajak disubsidi tunjangan)
 */
export function calculateMonthlyPph21(params: {
  taxableGrossMonthly: number
  employeeJhtJp: number
  ptkpStatus: string
  cfg: Pph21Config
}): {
  taxAmount: number
  ratePercent: number
  method: Pph21Config['taxMethod']
  scheme: 'TER_PMK168' | 'PROGRESSIVE_PASAL17'
  terCategory?: TerCategory
  taxAllowance: number
} {
  const { taxableGrossMonthly, employeeJhtJp, ptkpStatus, cfg } = params
  if (taxableGrossMonthly <= 0) {
    return {
      taxAmount: 0,
      ratePercent: 0,
      method: cfg.taxMethod,
      scheme: cfg.useTERScheme ? 'TER_PMK168' : 'PROGRESSIVE_PASAL17',
      taxAllowance: 0,
    }
  }

  const category = getTerCategory(ptkpStatus)

  if (cfg.useTERScheme) {
    const ratePercent = getTerRatePercent(category, taxableGrossMonthly)
    let taxAmount = Math.round((taxableGrossMonthly * ratePercent) / 100)
    let taxAllowance = 0

    if (cfg.taxMethod === 'gross_up') {
      // Gross up TER: jika tarif t%, tunjangan = Pajak / (1 - t%)
      const rateDecimal = ratePercent / 100
      if (rateDecimal < 1) {
        taxAllowance = Math.round(taxAmount / (1 - rateDecimal)) - taxAmount
        taxAmount = taxAmount + taxAllowance
      }
    } else if (cfg.taxMethod === 'nett') {
      taxAllowance = taxAmount // ditanggung perusahaan
    }

    return {
      taxAmount,
      ratePercent,
      method: cfg.taxMethod,
      scheme: 'TER_PMK168',
      terCategory: category,
      taxAllowance,
    }
  }

  // Metode Progresif Pasal 17 Anualisasi
  const jobCost = Math.min(taxableGrossMonthly * JOB_COST_RATE, JOB_COST_MAX_MONTHLY)
  const netMonthly = taxableGrossMonthly - jobCost - employeeJhtJp
  const annualNet = netMonthly * 12
  const ptkp = getPtkpAnnualAmount(ptkpStatus, cfg)
  const pkp = Math.max(0, Math.floor((annualNet - ptkp) / 1000) * 1000)
  const annualTax = progressiveTax(pkp)
  const taxAmount = Math.round(annualTax / 12)
  const ratePercent = taxableGrossMonthly > 0 ? (taxAmount / taxableGrossMonthly) * 100 : 0

  return {
    taxAmount,
    ratePercent: Number(ratePercent.toFixed(2)),
    method: cfg.taxMethod,
    scheme: 'PROGRESSIVE_PASAL17',
    terCategory: category,
    taxAllowance: cfg.taxMethod === 'nett' ? taxAmount : 0,
  }
}
