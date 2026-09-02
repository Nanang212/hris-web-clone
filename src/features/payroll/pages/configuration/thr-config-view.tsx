// src/features/payroll/pages/configuration/thr-config-view.tsx — Screen 7: THR Policy
import { useState } from 'react'
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

export function ThrConfigView() {
  const [minTenureMonths, setMinTenureMonths] = useState(1)
  const [taxDeductionScheme, setTaxDeductionScheme] = useState('combined')
  const [paymentTimingDays, setPaymentTimingDays] = useState(7)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    snackbar.success('THR policy configuration saved successfully!')
  }

  return (
    <form onSubmit={handleSave} className='space-y-6'>
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>Tunjangan Hari Raya (THR) Keagamaan Policy</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Ketentuan perhitungan dan pencairan THR sesuai Permenaker No. 6/2016
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Minimal Masa Kerja Berhak THR (Bulan)
            </label>
            <Input
              type='number'
              value={minTenureMonths}
              onChange={(e) => setMinTenureMonths(parseInt(e.target.value, 10) || 1)}
              className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'
            />
            <p className='text-[10px] text-muted-foreground'>Minimal 1 bulan bekerja terus-menerus</p>
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Batas Waktu Pembayaran (H- Hari)
            </label>
            <Input
              type='number'
              value={paymentTimingDays}
              onChange={(e) => setPaymentTimingDays(parseInt(e.target.value, 10) || 7)}
              className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'
            />
            <p className='text-[10px] text-muted-foreground'>Maksimal H-7 sebelum Hari Raya Keagamaan</p>
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Skema Pemotongan Pajak THR
            </label>
            <Select value={taxDeductionScheme} onValueChange={setTaxDeductionScheme}>
              <SelectTrigger className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'>
                <SelectValue placeholder='Select scheme' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='combined'>Digabung dalam Payroll Bulanan (TER Scheme)</SelectItem>
                <SelectItem value='separate'>Dipisah dalam Batch Khusus Non-Reguler</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-[10px] text-muted-foreground'>Perhitungan pajak sesuai regulasi PMK 168</p>
          </div>
        </div>

        {/* Formula Details Callout */}
        <div className='p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2'>
          <h4 className='text-xs font-bold text-foreground'>Formula Standar Perhitungan THR:</h4>
          <ul className='list-disc list-inside text-xs text-muted-foreground space-y-1'>
            <li>
              <b>Masa Kerja ≥ 12 Bulan:</b> Diberikan 1 bulan upah (Gaji Pokok + Tunjangan Tetap).
            </li>
            <li>
              <b>Masa Kerja 1 – 11 Bulan (Prorata):</b> (Masa Kerja dalam Bulan / 12) × 1 Bulan Upah.
            </li>
          </ul>
        </div>
      </div>

      <div className='flex justify-end'>
        <Button type='submit' className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'>
          Save THR Policy
        </Button>
      </div>
    </form>
  )
}
