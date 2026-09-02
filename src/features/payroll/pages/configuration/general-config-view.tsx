// src/features/payroll/pages/configuration/general-config-view.tsx — Screen 2: General Payroll Config
import { useState } from 'react'
import { initialGeneralConfig } from '../../data/mock-payroll-data'
import type { GeneralPayrollConfig } from '../../types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { snackbar } from '@/shared/lib/snackbar'

export function GeneralConfigView() {
  const [config, setConfig] = useState<GeneralPayrollConfig>(initialGeneralConfig)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    snackbar.success('Payroll general configuration saved successfully!')
  }

  return (
    <form onSubmit={handleSave} className='space-y-6'>
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>Cut-off & Payment Cycle</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Tentukan periode perhitungan absensi dan jadwal pembayaran gaji rutin
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Cut-off Start Day (Tanggal Mulai)
            </label>
            <Input
              type='number'
              min={1}
              max={31}
              value={config.cutoffStartDay}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, cutoffStartDay: parseInt(e.target.value, 10) || 1 }))
              }
              className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'
            />
            <p className='text-[10px] text-muted-foreground'>Contoh: 21 (Bulan sebelumnya)</p>
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Cut-off End Day (Tanggal Selesai)
            </label>
            <Input
              type='number'
              min={1}
              max={31}
              value={config.cutoffEndDay}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, cutoffEndDay: parseInt(e.target.value, 10) || 20 }))
              }
              className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'
            />
            <p className='text-[10px] text-muted-foreground'>Contoh: 20 (Bulan berjalan)</p>
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Pay Day (Tanggal Pembayaran Gaji)
            </label>
            <Input
              type='number'
              min={1}
              max={31}
              value={config.payDay}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, payDay: parseInt(e.target.value, 10) || 25 }))
              }
              className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'
            />
            <p className='text-[10px] text-muted-foreground'>Contoh: 25 (Setiap bulan)</p>
          </div>
        </div>
      </div>

      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>Prorate & Overtime Calculation Rules</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Formula perhitungan gaji prorata karyawan baru/resign dan tarif upah lembur
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Metode Prorata Gaji
            </label>
            <Select
              value={config.prorateMethod}
              onValueChange={(val) =>
                setConfig((prev) => ({ ...prev, prorateMethod: val as GeneralPayrollConfig['prorateMethod'] }))
              }
            >
              <SelectTrigger className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'>
                <SelectValue placeholder='Pilih metode prorata' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='working_days'>Hari Kerja Aktual (Working Days: e.g. 21/22 hari)</SelectItem>
                <SelectItem value='calendar_days'>Hari Kalender (Calendar Days: e.g. 30/31 hari)</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-[10px] text-muted-foreground'>
              (Hari Kerja Karyawan / Total Hari Kerja Sebulan) × Gaji Pokok
            </p>
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Pembagi Upah Lembur Per Jam (Overtime Divider)
            </label>
            <Input
              type='number'
              value={config.overtimeHourlyRateDivider}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, overtimeHourlyRateDivider: parseInt(e.target.value, 10) || 173 }))
              }
              className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'
            />
            <p className='text-[10px] text-muted-foreground'>
              Standar Depnaker RI: 1/173 × Upah Bulanan
            </p>
          </div>
        </div>

        <div className='p-4 rounded-xl border border-blue-200/80 bg-blue-50/60 dark:border-blue-900/50 dark:bg-blue-950/20 flex items-center justify-between'>
          <div>
            <h4 className='text-xs font-bold text-blue-950 dark:text-blue-300'>PPh 21 Ditanggung Perusahaan (Nett Method)</h4>
            <p className='text-[11px] text-blue-900/80 dark:text-blue-400/80 mt-0.5'>
              Bila diaktifkan, perusahaan menanggung seluruh kewajiban pajak karyawan secara otomatis
            </p>
          </div>
          <input
            type='checkbox'
            checked={config.taxBorneByCompany}
            onChange={(e) => setConfig((prev) => ({ ...prev, taxBorneByCompany: e.target.checked }))}
            className='size-4 accent-primary rounded cursor-pointer'
          />
        </div>
      </div>

      <div className='flex justify-end'>
        <Button type='submit' className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'>
          Save Configuration
        </Button>
      </div>
    </form>
  )
}
