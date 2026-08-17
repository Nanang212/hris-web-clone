import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClockHour4,
  IconClockPause,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { overtimeRequests } from '@/features/overtime/components/overtime-data'
import { OvertimeStat } from '@/features/overtime/components/overtime-shared'
import { OvertimeTabs } from '@/features/overtime/components/overtime-tabs'
import { m } from '@/i18n/paraglide/messages'

export function OvertimeApprovalPage() {
  return (
    <AppMain
      title={m.overtime_approval_title()}
      subtitle={m.overtime_approval_subtitle()}
      className='gap-5 bg-muted/30'
    >
      <OvertimeTabs active='approval' />
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <OvertimeStat
          icon={IconClockHour4}
          label='Pending Review'
          value='18'
          detail='Need action'
          tone='amber'
        />
        <OvertimeStat
          icon={IconAlertTriangle}
          label='Conflict Flag'
          value='3'
          detail='Schedule / overlap'
          tone='red'
        />
        <OvertimeStat
          icon={IconCircleCheck}
          label='Approved Today'
          value='12'
          detail='Processed'
          tone='green'
        />
        <OvertimeStat
          icon={IconClockPause}
          label='Avg. Review'
          value='14 min'
          detail='This week'
          tone='blue'
        />
      </div>
      <Card>
        <CardContent className='grid gap-3 px-4 md:grid-cols-[1.4fr_1fr_auto]'>
          <Input placeholder={m.overtime_search_placeholder()} />
          <Input defaultValue='Aug 2026' />
          <Button variant='outline'>{m.overtime_filter()}</Button>
        </CardContent>
      </Card>
      <Card className='overflow-hidden'>
        <div className='flex items-start justify-between gap-3 p-4 pb-2'>
          <div>
            <h3 className='font-semibold'>{m.overtime_waiting_approval()}</h3>
            <p className='mt-1 text-xs text-muted-foreground'>{m.overtime_approval_subtitle()}</p>
          </div>
        </div>
        <CardContent className='p-0'>
          <Table>
            <TableHeader className='bg-muted/40'>
              <TableRow>
                <TableHead>{m.overtime_table_employee()}</TableHead>
                <TableHead>{m.overtime_table_date()}</TableHead>
                <TableHead>{m.overtime_table_schedule()}</TableHead>
                <TableHead>{m.overtime_table_requested()}</TableHead>
                <TableHead>{m.overtime_table_eligible()}</TableHead>
                <TableHead>{m.overtime_check()}</TableHead>
                <TableHead>{m.overtime_action()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overtimeRequests.map((request, index) => (
                <TableRow key={request.id}>
                  <TableCell className='text-xs font-medium'>{request.employee}</TableCell>
                  <TableCell className='text-xs'>15 Aug</TableCell>
                  <TableCell className='text-xs'>{request.schedule}</TableCell>
                  <TableCell className='text-xs'>{request.requestedHours} h</TableCell>
                  <TableCell className='text-xs'>{request.eligibleHours} h</TableCell>
                  <TableCell>
                    <Badge variant={index === 0 ? 'red' : index === 3 ? 'amber' : 'green'}>
                      {index === 0 ? 'Conflict' : index === 3 ? 'Need review' : 'Clear'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size='sm' asChild>
                      <Link to='/overtime/approval/$requestId' params={{ requestId: 'x' }}>
                        {m.overtime_review()}
                      </Link>
                    </Button>
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
