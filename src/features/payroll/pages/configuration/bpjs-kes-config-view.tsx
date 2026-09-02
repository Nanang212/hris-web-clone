// src/features/payroll/pages/configuration/bpjs-kes-config-view.tsx — Screen 5: BPJS Kesehatan Config
import { useState } from 'react'
import { initialBpjsKesConfig, formatIDR } from '../../data/mock-payroll-data'
import type { BpjsKesConfig } from '../../types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { snackbar } from '@/shared/lib/snackbar'

export function BpjsKesConfigView() {
  const [config, setConfig] = useState<BpjsKesConfig>(initialBpjsKesConfig)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    snackbar.success('BPJS Kesehatan configuration saved successfully!')
  }

  return (
    <form onSubmit={handleSave} className='space-y-6'>
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>BPJS Kesehatan Contribution Scheme</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Tarif iuran wajib jaminan kesehatan sesuai Perpres No. 64/2020 (Total 5% dari upah)
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Tanggungan Perusahaan (%)
            </label>
            <Input
              type='number'
              step='0.1'
              value={config.companyRatePercent}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, companyRatePercent: parseFloat(e.target.value) || 0 }))
              }
              className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'
            />
            <p className='text-[10px] text-muted-foreground'>Standar regulasi: 4.0%</p>
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Tanggungan Karyawan (%)
            </label>
            <Input
              type='number'
              step='0.1'
              value={config.employeeRatePercent}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, employeeRatePercent: parseFloat(e.target.value) || 0 }))
              }
              className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'
            />
            <p className='text-[10px] text-muted-foreground'>Standar regulasi: 1.0%</p>
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Batas Upah Maksimal (Wage Cap)
            </label>
            <Input
              type='number'
              value={config.maxWageCap}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, maxWageCap: parseFloat(e.target.value) || 0 }))
              }
              className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'
            />
            <p className='text-[10px] text-muted-foreground'>Maksimal: {formatIDR(config.maxWageCap)}</p>
          </div>
        </div>

        <div className='p-4 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between'>
          <div>
            <h4 className='text-xs font-bold text-foreground'>Cakupan Anggota Keluarga (5 Orang)</h4>
            <p className='text-[11px] text-muted-foreground mt-0.5'>
              Termasuk karyawan, suami/istri yang sah, dan maksimal 3 orang anak
            </p>
          </div>
          <input
            type='checkbox'
            checked={config.includeFamilyMembers}
            onChange={(e) => setConfig((prev) => ({ ...prev, includeFamilyMembers: e.target.checked }))}
            className='size-4 accent-primary rounded cursor-pointer'
          />
        </div>
      </div>

      <div className='flex justify-end'>
        <Button type='submit' className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'>
          Save BPJS Kesehatan Config
        </Button>
      </div>
    </form>
  )
}
