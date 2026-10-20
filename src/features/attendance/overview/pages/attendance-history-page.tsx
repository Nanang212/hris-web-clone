import {
  IconCalendarEvent,
  IconCircleCheck,
  IconClock,
  IconDownload,
  IconFilter,
} from '@tabler/icons-react'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import { m } from '@/i18n/paraglide/messages'

export function AttendanceHistoryPage() {
  const [scope, setScope] = useState('own')
  const stats = [
    [IconCalendarEvent, '22', m.attendance_history_workdays(), 'bg-blue-50 text-blue-600'],
    [IconCircleCheck, '20', m.attendance_stat_present(), 'bg-emerald-50 text-emerald-600'],
    [IconClock, '2', m.attendance_stat_late(), 'bg-orange-50 text-orange-500'],
    [IconCircleCheck, '0', m.attendance_stat_absent(), 'bg-emerald-50 text-emerald-600'],
  ]
  const rows = [
    ['16 Mei', 'Rama Aditya', '–', '–', '–', 'pending'],
    ['15 Mei', 'Rama Aditya', '08:52', '17:30', '8j 38m', 'present'],
    ['14 Mei', 'Rama Aditya', '08:47', '17:32', '8j 45m', 'present'],
    ['13 Mei', 'Rama Aditya', '09:18', '17:25', '8j 07m', 'late'],
    ['10 Mei', 'Rama Aditya', '08:55', '–', '–', 'missing'],
  ]
  const status = {
    pending: [m.attendance_history_not_clocked(), 'bg-orange-50 text-orange-500'],
    present: [m.attendance_status_present(), 'bg-emerald-50 text-emerald-600'],
    late: [m.attendance_history_late(), 'bg-orange-50 text-orange-500'],
    missing: [m.attendance_history_missing_clock_out(), 'bg-rose-50 text-rose-600'],
  } as const
  const displayRows = rows.map(([date, employee, clockIn, clockOut, duration, rowStatus]) => [
    date,
    employee,
    'Regular',
    clockIn,
    clockOut,
    duration,
    rowStatus,
  ])
  const [selectedRow, setSelectedRow] = useState<string[] | null>(null)

  return (
    <AppMain
      title={m.attendance_history_title()}
      subtitle={m.attendance_history_subtitle()}
      breadcrumbs={getAttendanceBreadcrumbs(m.attendance_history_title())}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='history' />
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map(([Icon, value, label, color]) => (
          <Card
            key={label as string}
          >
            <CardContent className='flex items-center gap-3 p-4'>
            <span
              className={`flex size-10 items-center justify-center rounded-xl ${color as string}`}
            >
              <Icon className='size-5' />
            </span>
            <div>
              <p className='text-2xl font-bold'>{value}</p>
              <p className='text-xs text-muted-foreground'>{label}</p>
            </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className='grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-[1.1fr_1.1fr_1fr_1fr_auto_auto] xl:items-end'>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_history_scope()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='own'>{m.attendance_history_scope_own()}</SelectItem>
            <SelectItem value='subordinate'>{m.attendance_history_scope_subordinate()}</SelectItem>
            <SelectItem value='all'>{m.attendance_history_scope_all()}</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_history_period()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='may'>{m.attendance_history_period_value()}</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_history_employee()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{m.attendance_history_all_employee()}</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_history_status()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{m.attendance_history_all_status()}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant='outline'>
          <IconFilter />
          {m.attendance_history_filter()}
        </Button>
        <Button variant='outline'>
          <IconDownload />
          {m.attendance_history_export()}
        </Button>
        </CardContent>
      </Card>
      <Card className='min-w-0 overflow-hidden py-0'>
        <CardContent className='overflow-x-auto px-0'>
        <Table className='min-w-[860px]'>
          <TableHeader className='bg-muted/50'>
            <TableRow>
              {[
                m.attendance_table_date(),
                m.attendance_history_employee(),
                m.attendance_history_shift(),
                m.attendance_table_clock_in(),
                m.attendance_table_clock_out(),
                m.attendance_table_duration(),
                m.attendance_table_status(),
                m.attendance_history_action(),
              ].map((label) => (
                <TableHead key={label}>{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map((row) => {
              const item = status[row[6] as keyof typeof status]
              return (
                <TableRow key={row[0]}>
                  {row.slice(0, 6).map((cell) => (
                    <TableCell key={cell} className='text-xs'>
                      {cell}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Badge variant={row[6] === 'late' ? 'amber' : row[6] === 'missing' ? 'red' : 'green'}>
                      {item[0]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size='sm' variant='ghost' onClick={() => setSelectedRow(row)}>
                      {m.attendance_history_view()}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </CardContent>
      </Card>
      <Card>
        <CardContent className='p-4'>
        <h3 className='font-semibold'>{m.attendance_history_monthly_recap()}</h3>
        <div className='mt-4 grid gap-3 sm:grid-cols-5'>
          {[
            [m.attendance_stat_present(), '20', 'text-emerald-600'],
            [m.attendance_stat_late(), '2', 'text-orange-500'],
            [m.attendance_history_leave(), '1', 'text-violet-600'],
            [m.attendance_history_permission(), '1', 'text-blue-600'],
            [m.attendance_history_missing(), '1', 'text-rose-600'],
          ].map(([label, value, color]) => (
            <div key={label} className='rounded-xl border border-border p-3'>
              <p className='text-xs text-muted-foreground'>{label}</p>
              <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        </CardContent>
      </Card>
      <Dialog open={!!selectedRow} onOpenChange={(open) => !open && setSelectedRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.attendance_history_view()}</DialogTitle>
            <DialogDescription>
              {selectedRow?.[1]} · {selectedRow?.[0]}
            </DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <dl className='grid gap-3 rounded-xl border bg-muted/30 p-4 text-sm sm:grid-cols-2'>
              <div>
                <dt className='text-xs text-muted-foreground'>{m.attendance_table_date()}</dt>
                <dd className='mt-1 font-medium'>{selectedRow[0]}</dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>{m.attendance_history_shift()}</dt>
                <dd className='mt-1 font-medium'>{selectedRow[2]}</dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>{m.attendance_table_clock_in()}</dt>
                <dd className='mt-1 font-medium'>{selectedRow[3]}</dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>{m.attendance_table_clock_out()}</dt>
                <dd className='mt-1 font-medium'>{selectedRow[4]}</dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>{m.attendance_table_duration()}</dt>
                <dd className='mt-1 font-medium'>{selectedRow[5]}</dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>{m.attendance_table_status()}</dt>
                <dd className='mt-1 font-medium'>
                  {status[selectedRow[6] as keyof typeof status][0]}
                </dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </AppMain>
  )
}
