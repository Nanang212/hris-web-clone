import { IconCalendarEvent, IconClock, IconX } from '@tabler/icons-react'
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

export function AttendanceManagementPage() {
  const stats = [
    [IconClock, '45', m.attendance_management_late(), 'bg-orange-50 text-orange-500'],
    [IconCalendarEvent, '8', m.attendance_management_early_leave(), 'bg-violet-50 text-violet-600'],
    [IconX, '6', m.attendance_management_missing_in(), 'bg-rose-50 text-rose-500'],
    [IconX, '11', m.attendance_management_missing_out(), 'bg-rose-50 text-rose-500'],
  ]
  const rows = [
    [
      'Budi Setiawan',
      '16 Mei',
      m.attendance_management_late(),
      '09:24',
      m.attendance_approval_medium(),
      m.attendance_management_needs_review(),
    ],
    [
      'Rama Aditya',
      '10 Mei',
      m.attendance_management_missing_out(),
      '08:55 / –',
      m.attendance_management_high(),
      m.attendance_management_open(),
    ],
    [
      'Sinta Maharani',
      '09 Mei',
      m.attendance_management_early_leave(),
      '16:20',
      m.attendance_approval_low(),
      m.attendance_management_resolved(),
    ],
  ]
  return (
    <AppMain
      title={m.attendance_management_title()}
      subtitle={m.attendance_management_subtitle()}
      className='gap-5 bg-muted/30'
      actions={
        <Button asChild>
          <Link to='/attendance/management/manual'>{m.attendance_management_manual()}</Link>
        </Button>
      }
    >
      <AttendanceTabs active='management' />
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
      <section className='grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm md:grid-cols-4'>
        <Select>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_management_exception_type()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{m.attendance_management_all_types()}</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_management_department()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{m.attendance_management_all_departments()}</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_history_status()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='review'>{m.attendance_management_needs_review()}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant='outline'>{m.attendance_history_filter()}</Button>
      </section>
      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <Table>
          <TableHeader className='bg-muted/50'>
            <TableRow>
              {[
                m.attendance_history_employee(),
                m.attendance_table_date(),
                m.attendance_management_exception(),
                m.attendance_management_recorded_time(),
                m.attendance_approval_risk(),
                m.attendance_history_status(),
                m.attendance_history_action(),
              ].map((label) => (
                <TableHead key={label}>{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row[0]}>
                {row.map((cell, index) => (
                  <TableCell
                    key={cell}
                    className={index === 0 ? 'text-xs font-semibold' : 'text-xs'}
                  >
                    {index === 4 || index === 5 ? (
                      <span className='rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-500'>
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <Link
                    className='text-xs font-medium hover:underline'
                    to='/attendance/management/exceptions/1'
                  >
                    {m.attendance_approval_review()}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </AppMain>
  )
}
