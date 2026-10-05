import { useState } from 'react'
import { BpjsKesBillingPanel } from '../../components/bpjs-kes-billing-panel'
import { WageCapRulesCard } from '../../components/wage-cap-rules-card'
import { formatIDR } from '../../data/mock-payroll-data'
import { toPeriodKey } from '../../store/payroll-bpjs-billing-store'
import { usePayrollBpjsStore } from '../../store/payroll-bpjs-store'
import type { BpjsKesConfig } from '../../types'
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

const MONTH_LABELS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

export function BpjsKesConfigView() {
  const { bpjsKesConfig, setBpjsKesConfig } = usePayrollBpjsStore()
  const [config, setConfig] = useState<BpjsKesConfig>(bpjsKesConfig)
  const [periodMonth, setPeriodMonth] = useState('7')
  const [periodYear, setPeriodYear] = useState('2026')

  const periodKey = toPeriodKey(periodYear, periodMonth)
  const periodLabel = `${MONTH_LABELS[Number(periodMonth) - 1]} ${periodYear}`

  // Sinkronkan form saat config di store berubah (tanpa effect)
  const [syncedConfig, setSyncedConfig] = useState(bpjsKesConfig)
  if (syncedConfig !== bpjsKesConfig) {
    setSyncedConfig(bpjsKesConfig)
    setConfig(bpjsKesConfig)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setBpjsKesConfig(config)
    snackbar.success('BPJS Kesehatan configuration saved and synchronized with Employee BPJS!')
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* ── Upload tagihan per periode: sumber potongan BPJS Kes di payroll (tampil di bawah pengaturan persentase) ── */}
      <div className='space-y-3 order-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h3 className='text-sm font-bold text-foreground'>Tagihan BPJS Kesehatan per Periode</h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Upload Upah BPJS bulanan — menjadi dasar potongan BPJS Kesehatan di calculate payroll.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Select value={periodMonth} onValueChange={setPeriodMonth}>
              <SelectTrigger className='h-9 w-36 text-xs rounded-xl'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_LABELS.map((label, index) => (
                  <SelectItem key={label} value={String(index + 1)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={periodYear} onValueChange={setPeriodYear}>
              <SelectTrigger className='h-9 w-24 text-xs rounded-xl'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['2025', '2026', '2027', '2028'].map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <BpjsKesBillingPanel periodKey={periodKey} periodLabel={periodLabel} />
      </div>

      <form onSubmit={handleSave} className='space-y-6 order-1'>
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>BPJS Kesehatan Contribution Scheme</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Tarif iuran wajib jaminan kesehatan sesuai Perpres No. 64/2020 (Total 5% dari upah).{' '}
            <span className='font-semibold text-foreground'>
              Persentase dan batas upah di sini dipakai untuk menghitung tagihan dari Upah BPJS yang
              diupload.
            </span>
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
            <div className='h-10 flex items-center px-3 text-xs rounded-xl border border-input bg-muted/30 font-semibold'>
              {formatIDR(config.maxWageCap)}
            </div>
            <p className='text-[10px] text-muted-foreground'>
              Diatur di kartu &quot;Batas Upah Maksimal&quot; di bawah (dengan tanggal berlaku).
            </p>
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

      <div className='order-2'>
        <WageCapRulesCard scope='kes' />
      </div>
    </div>
  )
}
