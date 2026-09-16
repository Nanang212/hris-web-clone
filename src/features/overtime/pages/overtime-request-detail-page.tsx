import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  OvertimeKeyValue,
  OvertimeRequestIdentity,
} from '@/features/overtime/components/overtime-shared'
import { OvertimeTabs } from '@/features/overtime/components/overtime-tabs'
import { m } from '@/i18n/paraglide/messages'

export function OvertimeRequestDetailPage() {
  return (
    <AppMain
      title={m.overtime_request_detail_title()}
      subtitle={m.overtime_request_detail_subtitle()}
      breadcrumbs={[
        { label: m.app_layout_nav_time_management() },
        { to: '/overtime', label: m.app_layout_nav_overtime() },
        { label: m.overtime_request_detail_title() },
      ]}
      backTo='/overtime'
      className='gap-5 bg-muted/30'
    >
      <OvertimeTabs active='requests' />
      <OvertimeRequestIdentity status='pending' />
      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_340px]'>
        <Card>
          <CardHeader>
            <CardTitle>{m.overtime_request_information()}</CardTitle>
          </CardHeader>
          <CardContent className='px-4'>
            <OvertimeKeyValue label={m.overtime_work_schedule()} value='09:00–17:00' />
            <OvertimeKeyValue label={m.overtime_requested_overtime()} value='18:00–21:30' />
            <OvertimeKeyValue label={m.overtime_requested_hours()} value='3.5 h' />
            <OvertimeKeyValue label={m.overtime_break()} value='0.5 h' />
            <OvertimeKeyValue label={m.overtime_day_type()} value='Workday' />
            <OvertimeKeyValue label={m.overtime_project()} value='Payroll System' />
            <OvertimeKeyValue
              label={m.overtime_reason()}
              value='Maintenance server and backup validation'
            />
          </CardContent>
        </Card>
        <div className='flex flex-col gap-4'>
          <Card>
            <CardHeader>
              <CardTitle>{m.overtime_calculation_preview()}</CardTitle>
            </CardHeader>
            <CardContent className='px-4'>
              <OvertimeKeyValue label={m.overtime_requested_hours()} value='3.5 h' />
              <OvertimeKeyValue label={m.overtime_break()} value='0.5 h' />
              <OvertimeKeyValue
                label={m.overtime_eligible_hours()}
                value='3.0 h'
                emphasis='green'
              />
              <OvertimeKeyValue label={m.overtime_factor()} value='1.5×' />
              <OvertimeKeyValue label={m.overtime_estimate()} value='Rp 112.500' emphasis='blue' />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{m.overtime_approval_progress()}</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-3 px-4 text-sm'>
              <p>
                • {m.overtime_submitted()}{' '}
                <span className='float-right text-green-700'>{m.overtime_completed()}</span>
              </p>
              <p>
                • Direct Manager{' '}
                <span className='float-right text-green-700'>{m.overtime_status_approved()}</span>
              </p>
              <p>
                • HR Manager{' '}
                <span className='float-right text-amber-700'>{m.overtime_status_pending()}</span>
              </p>
            </CardContent>
          </Card>
          <Button asChild>
            <Link to='/overtime/requests/$requestId' params={{ requestId: 'OT-2026-0081' }}>
              {m.overtime_edit_request()}
            </Link>
          </Button>
        </div>
      </div>
    </AppMain>
  )
}
