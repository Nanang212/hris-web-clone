import dayjs from 'dayjs'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { overtimeRequests } from '@/features/overtime/components/overtime-data'
import { OvertimeStatus } from '@/features/overtime/components/overtime-shared'
import { OvertimeTabs } from '@/features/overtime/components/overtime-tabs'
import { m } from '@/i18n/paraglide/messages'

export function OvertimeHistoryPage() {
  return (
    <AppMain
      title={m.overtime_history_title()}
      subtitle={m.overtime_history_subtitle()}
      breadcrumbs={[
        { label: m.app_layout_nav_time_management() },
        { to: '/overtime', label: m.app_layout_nav_overtime() },
        { label: m.overtime_tab_history() },
      ]}
      className='gap-5 bg-muted/30'
    >
      <OvertimeTabs active='history' />
      <Card className='overflow-hidden'>
        <div className='p-4 pb-2'>
          <h3 className='font-semibold'>{m.overtime_history_list()}</h3>
          <p className='mt-1 text-xs text-muted-foreground'>{m.overtime_history_subtitle()}</p>
        </div>
        <CardContent className='overflow-x-auto p-0'>
          <Table className='min-w-[720px]'>
            <TableHeader className='bg-muted/40'>
              <TableRow>
                <TableHead>{m.overtime_table_employee()}</TableHead>
                <TableHead>{m.overtime_table_date()}</TableHead>
                <TableHead>{m.overtime_table_schedule()}</TableHead>
                <TableHead>{m.overtime_table_requested()}</TableHead>
                <TableHead>{m.overtime_table_eligible()}</TableHead>
                <TableHead>{m.overtime_table_status()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overtimeRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className='text-xs font-medium'>{request.employee}</TableCell>
                  <TableCell className='text-xs'>
                    {dayjs(request.date).format('DD MMM YYYY')}
                  </TableCell>
                  <TableCell className='text-xs'>{request.schedule}</TableCell>
                  <TableCell className='text-xs'>{request.requestedHours} h</TableCell>
                  <TableCell className='text-xs'>{request.eligibleHours} h</TableCell>
                  <TableCell>
                    <OvertimeStatus status={request.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppMain>
  )
}
