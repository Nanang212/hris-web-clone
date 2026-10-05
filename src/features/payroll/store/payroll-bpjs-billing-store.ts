// src/features/payroll/store/payroll-bpjs-billing-store.ts
// Tagihan BPJS Kesehatan hasil upload, disimpan per periode payroll (langkah 1).
// Nominal di sini menjadi satu-satunya sumber potongan BPJS Kes karyawan (tidak dihitung ulang dari upah).
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BpjsKesBillingRecord, BpjsKesBillingUpload } from '../types'

interface PayrollBpjsBillingState {
  uploads: Record<string, BpjsKesBillingUpload>
  setUpload: (upload: BpjsKesBillingUpload) => void
  removeUpload: (periodKey: string) => void
  getRecords: (periodKey: string) => BpjsKesBillingRecord[]
}

/** Kunci periode: "2026-07" */
export const toPeriodKey = (year: number | string, month: number | string) =>
  `${year}-${String(month).padStart(2, '0')}`

export const usePayrollBpjsBillingStore = create<PayrollBpjsBillingState>()(
  persist(
    (set, get) => ({
      uploads: {},
      setUpload: (upload) =>
        set((state) => ({ uploads: { ...state.uploads, [upload.periodKey]: upload } })),
      removeUpload: (periodKey) =>
        set((state) => {
          const next = { ...state.uploads }
          delete next[periodKey]
          return { uploads: next }
        }),
      getRecords: (periodKey) => get().uploads[periodKey]?.records ?? [],
    }),
    // v2: bentuk record berubah (Nopeg + Upah BPJS) — data v1 dibuang.
    { name: 'payroll-bpjs-kes-billing', version: 2, migrate: () => ({ uploads: {} }) as never },
  ),
)
