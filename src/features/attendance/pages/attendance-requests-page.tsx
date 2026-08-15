import { IconCircleCheck, IconClock, IconPlus, IconX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

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

export function AttendanceRequestsPage() {
  const stats = [
    [IconClock, '12', m.attendance_requests_pending(), 'bg-orange-50 text-orange-500'],
    [IconCircleCheck, '38', m.attendance_requests_approved(), 'bg-emerald-50 text-emerald-600'],
    [IconX, '4', m.attendance_requests_rejected(), 'bg-rose-50 text-rose-500'],
  ]
  const rows = [
    [
      'REQ-0241',
      '16 Mei',
      'Rama Aditya',
      m.attendance_requests_forgot_clock_in(),
      '08:52',
      m.attendance_requests_application_error(),
      'pending',
    ],
    [
      'REQ-0239',
      '14 Mei',
      'Sinta Maharani',
      m.attendance_requests_forgot_clock_out(),
      '17:35',
      m.attendance_requests_battery_low(),
      'approved',
    ],
    [
      'REQ-0232',
      '10 Mei',
      'Budi Setiawan',
      m.attendance_requests_correction(),
      '09:00',
      m.attendance_requests_gps_issue(),
      'rejected',
    ],
  ]
  const status = {
    pending: [m.attendance_requests_pending(), 'bg-orange-50 text-orange-500'],
    approved: [m.attendance_requests_approved(), 'bg-emerald-50 text-emerald-600'],
    rejected: [m.attendance_requests_rejected(), 'bg-rose-50 text-rose-600'],
  } as const
  return (
    <AppMain
      title={m.attendance_requests_title()}
      subtitle={m.attendance_requests_subtitle()}
      className='gap-5 bg-muted/30'
      actions={
        <Button asChild>
          <Link to='/attendance/requests/new'>
            <IconPlus />
            {m.attendance_requests_create()}
          </Link>
        </Button>
      }
    >
      <AttendanceTabs active='requests' />
      <div className='grid gap-3 sm:grid-cols-3'>
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
      <div className='flex gap-8 rounded-2xl border border-border bg-card px-4 shadow-sm'>
        <span className='border-b-2 border-primary py-3 text-sm font-semibold text-primary'>
          {m.attendance_requests_all()}
        </span>
        <span className='py-3 text-sm text-muted-foreground'>
          {m.attendance_requests_pending()}
        </span>
        <span className='py-3 text-sm text-muted-foreground'>
          {m.attendance_requests_approved()}
        </span>
        <span className='py-3 text-sm text-muted-foreground'>
          {m.attendance_requests_rejected()}
        </span>
      </div>
      <section className='grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm md:grid-cols-4'>
        <Select>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_requests_type()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{m.attendance_requests_all_types()}</SelectItem>
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
        <Select>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_history_period()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='may'>{m.attendance_requests_may()}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant='outline'>{m.attendance_history_filter()}</Button>
      </section>
      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <Table>
          <TableHeader className='bg-muted/50'>
            <TableRow>
              {[
                m.attendance_requests_id(),
                m.attendance_table_date(),
                m.attendance_history_employee(),
                m.attendance_requests_type(),
                m.attendance_requests_requested_time(),
                m.attendance_requests_reason(),
                m.attendance_table_status(),
                m.attendance_history_action(),
              ].map((label) => (
                <TableHead key={label}>{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const item = status[row[6] as keyof typeof status]
              return (
                <TableRow key={row[0]}>
                  {row.slice(0, 6).map((cell) => (
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
    </AppMain>
  )
}
