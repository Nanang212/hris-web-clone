import {
  IconCalendarEvent,
  IconCircleCheck,
  IconClock,
  IconDownload,
  IconFilter,
} from '@tabler/icons-react'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
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

  return (
    <AppMain
      title={m.attendance_history_title()}
      subtitle={m.attendance_history_subtitle()}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='history' />
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map(([Icon, value, label, color]) => (
          <section
            key={label as string}
            className='flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm'
          >
            <span
              className={`flex size-10 items-center justify-center rounded-xl ${color as string}`}
            >
              <Icon className='size-5' />
            </span>
            <div>
              <p className='text-2xl font-bold'>{value}</p>
              <p className='text-xs text-muted-foreground'>{label}</p>
            </div>
          </section>
        ))}
      </div>
      <section className='grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm md:grid-cols-3 xl:grid-cols-[1.1fr_1.1fr_1fr_1fr_auto_auto]'>
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
      </section>
      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <Table>
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
            {rows.map((row) => {
              const item = status[row[5] as keyof typeof status]
              return (
                <TableRow key={row[0]}>
                  {row.slice(0, 5).map((cell) => (
                    <TableCell key={cell} className='text-xs'>
                      {cell}
                    </TableCell>
                  ))}
                  <TableCell>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${item[1]}`}>
                      {item[0]}
                    </span>
                  </TableCell>
                  <TableCell className='text-xs'>{m.attendance_history_view()}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </section>
      <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
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
      </section>
    </AppMain>
  )
}
