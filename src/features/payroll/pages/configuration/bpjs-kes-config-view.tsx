import { useState } from 'react'
import { BpjsKesBillingPanel } from '../../components/bpjs-kes-billing-panel'
import { WageCapRulesCard } from '../../components/wage-cap-rules-card'
import { formatIDR } from '../../data/mock-payroll-data'
import { toPeriodKey } from '../../store/payroll-bpjs-billing-store'
import { usePayrollBpjsStore } from '../../store/payroll-bpjs-store'
import type { BpjsKesConfig } from '../../types'
import { m } from '@/i18n/paraglide/messages'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { snackbar } from '@/shared/lib/snackbar'

export function BpjsKesConfigView() {
  const monthLabels = [
    m.payroll_month_january(), m.payroll_month_february(), m.payroll_month_march(),
    m.payroll_month_april(), m.payroll_month_may(), m.payroll_month_june(),
    m.payroll_month_july(), m.payroll_month_august(), m.payroll_month_september(),
    m.payroll_month_october(), m.payroll_month_november(), m.payroll_month_december(),
  ]
  const { bpjsKesConfig, setBpjsKesConfig } = usePayrollBpjsStore()
  const [config, setConfig] = useState<BpjsKesConfig>(bpjsKesConfig)
  const [periodMonth, setPeriodMonth] = useState('7')
  const [periodYear, setPeriodYear] = useState('2026')

  const periodKey = toPeriodKey(periodYear, periodMonth)
  const periodLabel = `${monthLabels[Number(periodMonth) - 1]} ${periodYear}`

  // Sinkronkan form saat config di store berubah (tanpa effect)
  const [syncedConfig, setSyncedConfig] = useState(bpjsKesConfig)
  if (syncedConfig !== bpjsKesConfig) {
    setSyncedConfig(bpjsKesConfig)
    setConfig(bpjsKesConfig)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setBpjsKesConfig(config)
    snackbar.success(m.payroll_bpjs_kes_saved())
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* ── Upload tagihan per periode: sumber potongan BPJS Kes di payroll (tampil di bawah pengaturan persentase) ── */}
      <div className='space-y-3 order-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h3 className='text-sm font-bold text-foreground'>{m.payroll_bpjs_kes_billing_title()}</h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {m.payroll_bpjs_kes_billing_description()}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Select value={periodMonth} onValueChange={setPeriodMonth}>
              <SelectTrigger className='h-9 w-36 text-xs rounded-xl'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {monthLabels.map((label, index) => (
                    <SelectItem key={index} value={String(index + 1)}>{label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={periodYear} onValueChange={setPeriodYear}>
              <SelectTrigger className='h-9 w-24 text-xs rounded-xl'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {['2025', '2026', '2027', '2028'].map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <BpjsKesBillingPanel periodKey={periodKey} periodLabel={periodLabel} />
      </div>

      <form onSubmit={handleSave} className='space-y-6 order-1'>
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>{m.payroll_bpjs_kes_scheme_title()}</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {m.payroll_bpjs_kes_scheme_description()}{' '}
            <span className='font-semibold text-foreground'>
              {m.payroll_bpjs_kes_scheme_rate_note()}
            </span>
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
          <div className='space-y-1.5'>
            <FieldLabel className='text-xs font-semibold text-foreground'>
              {m.payroll_bpjs_kes_company_rate()}
            </FieldLabel>
            <Input
              type='number'
              step='0.1'
              value={config.companyRatePercent}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, companyRatePercent: parseFloat(e.target.value) || 0 }))
              }
              className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'
            />
            <p className='text-[10px] text-muted-foreground'>{m.payroll_bpjs_kes_standard_company()}</p>
          </div>

          <div className='space-y-1.5'>
            <FieldLabel className='text-xs font-semibold text-foreground'>
              {m.payroll_bpjs_kes_employee_rate()}
            </FieldLabel>
            <Input
              type='number'
              step='0.1'
              value={config.employeeRatePercent}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, employeeRatePercent: parseFloat(e.target.value) || 0 }))
              }
              className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'
            />
            <p className='text-[10px] text-muted-foreground'>{m.payroll_bpjs_kes_standard_employee()}</p>
          </div>

          <div className='space-y-1.5'>
            <FieldLabel className='text-xs font-semibold text-foreground'>
              {m.payroll_bpjs_kes_wage_cap()}
            </FieldLabel>
            <div className='h-10 flex items-center px-3 text-xs rounded-xl border border-input bg-muted/30 font-semibold'>
              {formatIDR(config.maxWageCap)}
            </div>
            <p className='text-[10px] text-muted-foreground'>
              {m.payroll_bpjs_kes_wage_cap_hint()}
            </p>
          </div>
        </div>

        <div className='p-4 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between'>
          <div>
            <h4 className='text-xs font-bold text-foreground'>{m.payroll_bpjs_kes_family_title()}</h4>
            <p className='text-[11px] text-muted-foreground mt-0.5'>
              {m.payroll_bpjs_kes_family_description()}
            </p>
          </div>
          <Checkbox
            checked={config.includeFamilyMembers}
            onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, includeFamilyMembers: checked === true }))}
          />
        </div>
      </div>

      <div className='flex justify-end'>
        <Button type='submit' className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'>
          {m.payroll_bpjs_kes_save_button()}
        </Button>
      </div>
      </form>

      <div className='order-2'>
        <WageCapRulesCard scope='kes' />
      </div>
    </div>
  )
}
