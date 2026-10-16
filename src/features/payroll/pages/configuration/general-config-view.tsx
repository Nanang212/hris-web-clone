// src/features/payroll/pages/configuration/general-config-view.tsx — Screen 2: General Payroll Config
import { useState } from 'react'
import { initialGeneralConfig } from '../../data/mock-payroll-data'
import type { GeneralPayrollConfig } from '../../types'
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

export function GeneralConfigView() {
  const [config, setConfig] = useState<GeneralPayrollConfig>(initialGeneralConfig)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    snackbar.success(m.payroll_general_saved())
  }

  return (
    <form onSubmit={handleSave} className='space-y-6'>
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>{m.payroll_general_cycle_title()}</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {m.payroll_general_cycle_description()}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
          <div className='space-y-1.5'>
            <FieldLabel className='text-xs font-semibold text-foreground'>
              {m.payroll_general_cutoff_start()}
            </FieldLabel>
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
            <p className='text-[10px] text-muted-foreground'>{m.payroll_general_cutoff_start_hint()}</p>
          </div>

          <div className='space-y-1.5'>
            <FieldLabel className='text-xs font-semibold text-foreground'>
              {m.payroll_general_cutoff_end()}
            </FieldLabel>
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
            <p className='text-[10px] text-muted-foreground'>{m.payroll_general_cutoff_end_hint()}</p>
          </div>

          <div className='space-y-1.5'>
            <FieldLabel className='text-xs font-semibold text-foreground'>
              {m.payroll_general_payday()}
            </FieldLabel>
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
            <p className='text-[10px] text-muted-foreground'>{m.payroll_general_payday_hint()}</p>
          </div>
        </div>
      </div>

      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>{m.payroll_general_calculation_title()}</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {m.payroll_general_calculation_description()}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <div className='space-y-1.5'>
            <FieldLabel className='text-xs font-semibold text-foreground'>
              {m.payroll_general_prorate_method()}
            </FieldLabel>
            <Select
              value={config.prorateMethod}
              onValueChange={(val) =>
                setConfig((prev) => ({ ...prev, prorateMethod: val as GeneralPayrollConfig['prorateMethod'] }))
              }
            >
              <SelectTrigger className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'>
                <SelectValue placeholder={m.payroll_general_prorate_placeholder()} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='working_days'>{m.payroll_general_prorate_working_days()}</SelectItem>
                  <SelectItem value='calendar_days'>{m.payroll_general_prorate_calendar_days()}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className='text-[10px] text-muted-foreground'>
              {m.payroll_general_prorate_formula()}
            </p>
          </div>

          <div className='space-y-1.5'>
            <FieldLabel className='text-xs font-semibold text-foreground'>
              {m.payroll_general_overtime_divider()}
            </FieldLabel>
            <Input
              type='number'
              value={config.overtimeHourlyRateDivider}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, overtimeHourlyRateDivider: parseInt(e.target.value, 10) || 173 }))
              }
              className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'
            />
            <p className='text-[10px] text-muted-foreground'>
              {m.payroll_general_overtime_divider_hint()}
            </p>
          </div>
        </div>

        <div className='p-4 rounded-xl border border-blue-200/80 bg-blue-50/60 dark:border-blue-900/50 dark:bg-blue-950/20 flex items-center justify-between'>
          <div>
            <h4 className='text-xs font-bold text-blue-950 dark:text-blue-300'>{m.payroll_general_company_tax_title()}</h4>
            <p className='text-[11px] text-blue-900/80 dark:text-blue-400/80 mt-0.5'>
              {m.payroll_general_company_tax_description()}
            </p>
          </div>
          <Checkbox
            checked={config.taxBorneByCompany}
            onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, taxBorneByCompany: checked === true }))}
          />
        </div>
      </div>

      <div className='flex justify-end'>
        <Button type='submit' className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'>
          {m.payroll_general_save_button()}
        </Button>
      </div>
    </form>
  )
}
