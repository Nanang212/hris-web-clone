// src/features/payroll/lib/bpjs-kes-billing-match.ts
// Pencocokan tagihan BPJS Kes ke karyawan. Nopeg bisa dobel karena human error, jadi urutan kunci:
// No BPJS Kesehatan → NIK KTP → Nopeg. Konflik / data dobel / identitas tidak konsisten ditandai.
import type { BpjsKesBillingRecord, PayrollEmployeeInput } from '../types'

export const normalizeBillingKey = (value: string) => value.replace(/\s+/g, '').toUpperCase()

export interface BillingIndex {
  byBpjs: Map<string, BpjsKesBillingRecord[]>
  byNik: Map<string, BpjsKesBillingRecord[]>
  byNopeg: Map<string, BpjsKesBillingRecord[]>
}

const push = (map: Map<string, BpjsKesBillingRecord[]>, key: string, record: BpjsKesBillingRecord) => {
  if (!key) return
  const normalized = normalizeBillingKey(key)
  map.set(normalized, [...(map.get(normalized) ?? []), record])
}

export function buildBillingIndex(records: BpjsKesBillingRecord[]): BillingIndex {
  const index: BillingIndex = { byBpjs: new Map(), byNik: new Map(), byNopeg: new Map() }
  for (const record of records) {
    push(index.byBpjs, record.bpjsNumber, record)
    push(index.byNik, record.nik, record)
    push(index.byNopeg, record.nopeg, record)
  }
  return index
}

export interface BillingResolution {
  record?: BpjsKesBillingRecord
  /** Semua baris yang menunjuk karyawan ini (lebih dari 1 = dobel / konflik). */
  candidates: BpjsKesBillingRecord[]
  /** Masalah identitas yang perlu diperiksa sebelum finalisasi. */
  issues: string[]
}

const same = (a: string, b: string) => normalizeBillingKey(a) === normalizeBillingKey(b)

export function resolveBillingForEmployee(
  index: BillingIndex,
  employee: Pick<PayrollEmployeeInput, 'nopeg' | 'nik' | 'bpjs'>,
): BillingResolution {
  const lookups: { label: string; records: BpjsKesBillingRecord[] }[] = [
    {
      label: 'No BPJS',
      records: employee.bpjs.kesParticipantNumber
        ? (index.byBpjs.get(normalizeBillingKey(employee.bpjs.kesParticipantNumber)) ?? [])
        : [],
    },
    {
      label: 'NIK',
      records: employee.nik ? (index.byNik.get(normalizeBillingKey(employee.nik)) ?? []) : [],
    },
    {
      label: 'Nopeg',
      records: employee.nopeg ? (index.byNopeg.get(normalizeBillingKey(employee.nopeg)) ?? []) : [],
    },
  ]

  const candidates = Array.from(new Set(lookups.flatMap((l) => l.records)))
  const issues: string[] = []
  if (candidates.length === 0) return { candidates, issues }

  // Prioritas: baris pertama dari kunci paling kuat (No BPJS > NIK > Nopeg)
  const record = lookups.find((l) => l.records.length > 0)!.records[0]

  if (candidates.length > 1) {
    issues.push(
      `Ditemukan ${candidates.length} baris tagihan untuk karyawan ini (data dobel / konflik identitas) — dipakai baris pertama, periksa.`,
    )
  }

  // Identitas pada baris terpilih harus konsisten dengan master karyawan
  const mismatches: string[] = []
  if (record.nik && employee.nik && !same(record.nik, employee.nik)) mismatches.push('NIK')
  if (
    record.bpjsNumber &&
    employee.bpjs.kesParticipantNumber &&
    !same(record.bpjsNumber, employee.bpjs.kesParticipantNumber)
  ) {
    mismatches.push('No BPJS')
  }
  if (record.nopeg && employee.nopeg && !same(record.nopeg, employee.nopeg)) mismatches.push('Nopeg')
  if (mismatches.length > 0) {
    issues.push(`Identitas tagihan tidak sama dengan master karyawan (${mismatches.join(', ')}) — periksa mapping.`)
  }

  return { record, candidates, issues }
}

export interface BillingMatchRow {
  employee: PayrollEmployeeInput
  record?: BpjsKesBillingRecord
  issues: string[]
}

export interface BillingMatchResult {
  rows: BillingMatchRow[]
  /** Karyawan peserta BPJS Kes yang tagihannya belum ada. */
  missing: PayrollEmployeeInput[]
  /** Baris tagihan yang tidak cocok dengan karyawan mana pun. */
  unmatched: BpjsKesBillingRecord[]
  /** Jumlah karyawan dengan masalah identitas (dobel / tidak konsisten). */
  issueCount: number
}

export function matchBillingToEmployees(
  employees: PayrollEmployeeInput[],
  records: BpjsKesBillingRecord[],
): BillingMatchResult {
  const index = buildBillingIndex(records)
  const used = new Set<BpjsKesBillingRecord>()
  const rows: BillingMatchRow[] = employees
    .filter((emp) => emp.bpjs.kesActive)
    .map((employee) => {
      const { record, candidates, issues } = resolveBillingForEmployee(index, employee)
      candidates.forEach((c) => used.add(c))
      return { employee, record, issues }
    })
  return {
    rows,
    missing: rows.filter((r) => !r.record).map((r) => r.employee),
    unmatched: records.filter((r) => !used.has(r)),
    issueCount: rows.filter((r) => r.issues.length > 0).length,
  }
}
