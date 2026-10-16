import { useState } from 'react'
import { BpjsTkProjectCard } from '../../components/bpjs-tk-project-card'
import { WageCapRulesCard } from '../../components/wage-cap-rules-card'
import { formatIDR } from '../../data/mock-payroll-data'
import { usePayrollBpjsStore } from '../../store/payroll-bpjs-store'
import type { BpjsTkConfig } from '../../types'
import { m } from '@/i18n/paraglide/messages'
import { Button } from '@/shared/components/ui/button'
import { FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'

export function BpjsTkConfigView() {
  const { bpjsTkConfig, setBpjsTkConfig } = usePayrollBpjsStore()
  const [config, setConfig] = useState<BpjsTkConfig>(bpjsTkConfig)

  // Sinkronkan form saat config di store berubah (tanpa effect)
  const [syncedConfig, setSyncedConfig] = useState(bpjsTkConfig)
  if (syncedConfig !== bpjsTkConfig) {
    setSyncedConfig(bpjsTkConfig)
    setConfig(bpjsTkConfig)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setBpjsTkConfig(config)
    snackbar.success(m.payroll_bpjs_tk_saved())
  }

  return (
    <div className='space-y-6'>
    <form onSubmit={handleSave} className='space-y-6'>
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-6 pb-4 border-b border-border/60'>
          <h3 className='text-sm font-bold text-foreground'>{m.payroll_bpjs_tk_scheme_title()}</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {m.payroll_bpjs_tk_scheme_description()}
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>{m.payroll_bpjs_tk_col_program()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_bpjs_kes_company_rate()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_bpjs_kes_employee_rate()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_bpjs_tk_col_total_rate()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6'>{m.payroll_bpjs_tk_col_notes()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className='text-xs border-b border-border/40'>
              <TableCell className='py-3.5 pl-6 font-bold text-foreground'>
                {m.payroll_bpjs_tk_jkk()}
              </TableCell>
              <TableCell className='py-3.5'>
                <Input
                  type='number'
                  step='0.01'
                  value={config.jkkRatePercent}
                  onChange={(e) => setConfig((prev) => ({ ...prev, jkkRatePercent: parseFloat(e.target.value) || 0 }))}
                  className='h-8 w-24 text-xs'
                />
              </TableCell>
              <TableCell className='py-3.5 text-muted-foreground'>{m.payroll_bpjs_tk_company_borne()}</TableCell>
              <TableCell className='py-3.5 font-bold text-foreground'>{config.jkkRatePercent}%</TableCell>
              <TableCell className='py-3.5 pr-6 text-muted-foreground text-[11px]'>{m.payroll_bpjs_tk_project_default_hint()}</TableCell>
            </TableRow>

            <TableRow className='text-xs border-b border-border/40'>
              <TableCell className='py-3.5 pl-6 font-bold text-foreground'>
                {m.payroll_bpjs_tk_jkm()}
              </TableCell>
              <TableCell className='py-3.5'>
                <Input
                  type='number'
                  step='0.01'
                  value={config.jkmRatePercent}
                  onChange={(e) => setConfig((prev) => ({ ...prev, jkmRatePercent: parseFloat(e.target.value) || 0 }))}
                  className='h-8 w-24 text-xs'
                />
              </TableCell>
              <TableCell className='py-3.5 text-muted-foreground'>{m.payroll_bpjs_tk_company_borne()}</TableCell>
              <TableCell className='py-3.5 font-bold text-foreground'>{config.jkmRatePercent}%</TableCell>
              <TableCell className='py-3.5 pr-6 text-muted-foreground text-[11px]'>{m.payroll_bpjs_tk_national_regulation()}</TableCell>
            </TableRow>

            <TableRow className='text-xs border-b border-border/40'>
              <TableCell className='py-3.5 pl-6 font-bold text-foreground'>
                {m.payroll_bpjs_tk_jht()}
              </TableCell>
              <TableCell className='py-3.5'>
                <Input
                  type='number'
                  step='0.1'
                  value={config.jhtCompanyPercent}
                  onChange={(e) => setConfig((prev) => ({ ...prev, jhtCompanyPercent: parseFloat(e.target.value) || 0 }))}
                  className='h-8 w-24 text-xs'
                />
              </TableCell>
              <TableCell className='py-3.5'>
                <Input
                  type='number'
                  step='0.1'
                  value={config.jhtEmployeePercent}
                  onChange={(e) => setConfig((prev) => ({ ...prev, jhtEmployeePercent: parseFloat(e.target.value) || 0 }))}
                  className='h-8 w-24 text-xs'
                />
              </TableCell>
              <TableCell className='py-3.5 font-bold text-foreground'>
                {(config.jhtCompanyPercent + config.jhtEmployeePercent).toFixed(1)}%
              </TableCell>
              <TableCell className='py-3.5 pr-6 text-muted-foreground text-[11px]'>{m.payroll_bpjs_tk_no_wage_cap()}</TableCell>
            </TableRow>

            <TableRow className='text-xs border-b border-border/40'>
              <TableCell className='py-3.5 pl-6 font-bold text-foreground'>
                {m.payroll_bpjs_tk_jp()}
              </TableCell>
              <TableCell className='py-3.5'>
                <Input
                  type='number'
                  step='0.1'
                  value={config.jpCompanyPercent}
                  onChange={(e) => setConfig((prev) => ({ ...prev, jpCompanyPercent: parseFloat(e.target.value) || 0 }))}
                  className='h-8 w-24 text-xs'
                />
              </TableCell>
              <TableCell className='py-3.5'>
                <Input
                  type='number'
                  step='0.1'
                  value={config.jpEmployeePercent}
                  onChange={(e) => setConfig((prev) => ({ ...prev, jpEmployeePercent: parseFloat(e.target.value) || 0 }))}
                  className='h-8 w-24 text-xs'
                />
              </TableCell>
              <TableCell className='py-3.5 font-bold text-foreground'>
                {(config.jpCompanyPercent + config.jpEmployeePercent).toFixed(1)}%
              </TableCell>
              <TableCell className='py-3.5 pr-6 text-foreground font-semibold text-[11px]'>
                {m.payroll_bpjs_tk_max_wage({ amount: formatIDR(config.jpMaxWageCap) })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className='p-6 bg-muted/10 border-t border-border/60 flex flex-wrap items-center justify-between gap-4'>
          <div className='space-y-1'>
            <FieldLabel className='text-xs font-semibold text-foreground'>{m.payroll_bpjs_tk_jp_cap()}</FieldLabel>
            <p className='text-xs font-bold text-foreground'>{formatIDR(config.jpMaxWageCap)}</p>
            <p className='text-[10px] text-muted-foreground'>
              {m.payroll_bpjs_kes_wage_cap_hint()}
            </p>
          </div>
          <Button type='submit' className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'>
            {m.payroll_bpjs_tk_save_button()}
          </Button>
        </div>
      </div>
    </form>

    <BpjsTkProjectCard />
    <WageCapRulesCard scope='tk' />
    </div>
  )
}
