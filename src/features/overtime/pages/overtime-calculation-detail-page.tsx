import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  OvertimeKeyValue,
  OvertimeRequestIdentity,
} from '@/features/overtime/components/overtime-shared'
import { OvertimeTabs } from '@/features/overtime/components/overtime-tabs'
import { m } from '@/i18n/paraglide/messages'

export function OvertimeCalculationDetailPage() {
  return (
    <AppMain
      title={m.overtime_calculation_detail_title()}
      subtitle={m.overtime_calculation_detail_subtitle()}
      className='gap-5 bg-muted/30'
    >
      <OvertimeTabs active='calculation' />
      <OvertimeRequestIdentity status='approved' />
      <div className='grid gap-4 xl:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>{m.overtime_approved_overtime()}</CardTitle>
          </CardHeader>
          <CardContent className='px-4'>
            <OvertimeKeyValue label={m.overtime_date()} value='15 Aug 2026' />
            <OvertimeKeyValue label={m.overtime_work_schedule()} value='09:00–17:00' />
            <OvertimeKeyValue label={m.overtime_requested_overtime()} value='18:00–21:30 · 3.5 h' />
            <OvertimeKeyValue label={m.overtime_break()} value='0.5 h' />
            <OvertimeKeyValue label={m.overtime_eligible_hours()} value='3.0 h' emphasis='green' />
            <OvertimeKeyValue label={m.overtime_day_type()} value='Workday' />
            <OvertimeKeyValue label={m.overtime_approval_reference()} value='OT-2026-0081' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{m.overtime_calculation_breakdown()}</CardTitle>
          </CardHeader>
          <CardContent className='px-4'>
            <OvertimeKeyValue label={m.overtime_base_hourly_rate()} value='Rp 25.000' />
            <OvertimeKeyValue label={m.overtime_eligible_hours()} value='3.0 h' emphasis='green' />
            <OvertimeKeyValue label={m.overtime_multiplier()} value='1.5×' />
            <OvertimeKeyValue
              label={m.overtime_gross_compensation()}
              value='Rp 112.500'
              emphasis='blue'
            />
            <div className='mt-4 rounded-lg bg-primary/10 p-4 text-sm'>
              <p className='text-xs text-primary'>{m.overtime_formula()}</p>
              <strong>Rp 25.000 × 3.0 h × 1.5</strong>
            </div>
            <div className='mt-4 flex justify-between'>
              <span className='text-sm text-muted-foreground'>{m.overtime_payroll_status()}</span>
              <Badge variant='green'>{m.overtime_ready_for_payroll()}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className='flex items-center justify-between px-4'>
          <div>
            <strong>{m.overtime_audit_trail()}</strong>
            <p className='mt-1 text-xs text-muted-foreground'>
              Approved by Maya Putri · HR Manager · 15 Aug 2026 18:12
            </p>
          </div>
          <Button variant='outline'>{m.overtime_export_detail()}</Button>
        </CardContent>
      </Card>
    </AppMain>
  )
}
