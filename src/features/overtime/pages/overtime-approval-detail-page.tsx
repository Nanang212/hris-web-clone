import { useNavigate } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Textarea } from '@/shared/components/ui/textarea'
import { snackbar } from '@/shared/lib/snackbar'
import {
  OvertimeKeyValue,
  OvertimeRequestIdentity,
} from '@/features/overtime/components/overtime-shared'
import { OvertimeTabs } from '@/features/overtime/components/overtime-tabs'
import { m } from '@/i18n/paraglide/messages'

export function OvertimeApprovalDetailPage() {
  const navigate = useNavigate()
  const decide = (message: string) => {
    snackbar.success(message)
    navigate({ to: '/overtime/approval' })
  }
  return (
    <AppMain
      title={m.overtime_approval_detail_title()}
      subtitle={m.overtime_approval_detail_subtitle()}
      className='gap-5 bg-muted/30'
    >
      <OvertimeTabs active='approval' />
      <OvertimeRequestIdentity status='pending' />
      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_340px]'>
        <Card>
          <CardHeader>
            <CardTitle>{m.overtime_policy_check()}</CardTitle>
          </CardHeader>
          <CardContent className='px-4'>
            <OvertimeKeyValue label={m.overtime_shift_ended()} value='17:00' />
            <OvertimeKeyValue label={m.overtime_overtime_starts()} value='18:00' />
            <OvertimeKeyValue label={m.overtime_rest_gap()} value='60 min' />
            <OvertimeKeyValue label={m.overtime_overlapping_request()} value='None' />
            <OvertimeKeyValue label={m.overtime_daily_limit()} value='Within policy' />
            <h3 className='mt-5 font-semibold'>{m.overtime_hours_review()}</h3>
            <OvertimeKeyValue label={m.overtime_requested_hours()} value='3.5 h' />
            <OvertimeKeyValue label={m.overtime_break()} value='0.5 h' />
            <OvertimeKeyValue label={m.overtime_eligible_hours()} value='3.0 h' emphasis='green' />
            <OvertimeKeyValue
              label={m.overtime_estimated_compensation()}
              value='Rp 112.500'
              emphasis='blue'
            />
          </CardContent>
        </Card>
        <div className='flex flex-col gap-4'>
          <Card>
            <CardHeader>
              <CardTitle>{m.overtime_approval_timeline()}</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-3 px-4 text-sm'>
              <p>
                ● Submitted <span className='float-right text-primary'>Completed</span>
              </p>
              <p>
                ● Direct Manager <span className='float-right text-green-700'>Approved</span>
              </p>
              <p>
                ● HR Manager <span className='float-right text-amber-700'>Pending</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{m.overtime_decision()}</CardTitle>
            </CardHeader>
            <CardContent className='px-4'>
              <Textarea placeholder={m.overtime_approval_note_placeholder()} />
            </CardContent>
          </Card>
          <div className='grid grid-cols-3 gap-2'>
            <Button variant='destructive' onClick={() => decide(m.overtime_rejected_success())}>
              {m.overtime_reject()}
            </Button>
            <Button variant='outline' onClick={() => decide(m.overtime_revision_success())}>
              {m.overtime_revision()}
            </Button>
            <Button onClick={() => decide(m.overtime_approved_success())}>
              {m.overtime_approve()}
            </Button>
          </div>
        </div>
      </div>
    </AppMain>
  )
}
