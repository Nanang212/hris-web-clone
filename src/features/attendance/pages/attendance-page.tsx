import {
  IconAlarm,
  IconArrowRight,
  IconBell,
  IconCalendarEvent,
  IconCalendarTime,
  IconChecklist,
  IconClock,
  IconFileText,
  IconGridDots,
  IconMapPin,
  IconPlane,
  IconReceipt,
  IconRosetteDiscountCheck,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import { m } from '@/i18n/paraglide/messages'

interface AttendanceStatProps {
  icon: typeof IconRosetteDiscountCheck
  iconClassName: string
  label: string
  value: string
  percentage: string
  percentageClassName: string
}

interface QuickMenuItemProps {
  icon: typeof IconCalendarEvent
  label: string
  iconClassName: string
  to:
    | '/leave'
    | '/overtime'
    | '/travel-expense/claim'
    | '/travel-expense/business-trip'
    | '/attendance/history'
    | '/payroll'
    | '/attendance/calendar'
    | '/attendance/all-menu'
}

function AttendanceStat({
  icon: Icon,
  iconClassName,
  label,
  value,
  percentage,
  percentageClassName,
}: Readonly<AttendanceStatProps>) {
  return (
    <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-center gap-3'>
        <div className={cn('flex size-10 items-center justify-center rounded-xl', iconClassName)}>
          <Icon className='size-5' stroke={2} />
        </div>
        <div>
          <p className='text-[26px] leading-7 font-bold tracking-tight'>{value}</p>
          <p className='text-xs text-muted-foreground'>{label}</p>
        </div>
      </div>
      <p className={cn('mt-4 text-xs font-semibold', percentageClassName)}>{percentage}</p>
    </section>
  )
}

function QuickMenuItem({ icon: Icon, label, iconClassName, to }: Readonly<QuickMenuItemProps>) {
  return (
    <Button asChild variant='ghost' className='h-auto min-h-19 w-full justify-start p-0'>
      <Link
        to={to}
        className='flex min-w-0 w-full flex-col items-start justify-between rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-muted/60'
      >
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', iconClassName)}>
          <Icon className='size-4' stroke={2} />
        </span>
        <span className='min-w-0 whitespace-normal break-words text-xs leading-4 font-medium'>
          {label}
        </span>
      </Link>
    </Button>
  )
}

export function AttendancePage() {
  const menuItems = [
    {
      icon: IconCalendarEvent,
      label: m.attendance_quick_menu_leave(),
      iconClassName: 'bg-emerald-50 text-emerald-600',
      to: '/leave',
    },
    {
      icon: IconClock,
      label: m.attendance_quick_menu_overtime(),
      iconClassName: 'bg-orange-50 text-orange-500',
      to: '/overtime',
    },
    {
      icon: IconFileText,
      label: m.attendance_quick_menu_claim(),
      iconClassName: 'bg-blue-50 text-blue-600',
      to: '/travel-expense/claim',
    },
    {
      icon: IconPlane,
      label: m.attendance_quick_menu_business_trip(),
      iconClassName: 'bg-blue-50 text-blue-600',
      to: '/travel-expense/business-trip',
    },
    {
      icon: IconChecklist,
      label: m.attendance_quick_menu_log(),
      iconClassName: 'bg-blue-50 text-blue-600',
      to: '/attendance/history',
    },
    {
      icon: IconReceipt,
      label: m.attendance_quick_menu_payslip(),
      iconClassName: 'bg-cyan-50 text-cyan-600',
      to: '/payroll',
    },
    {
      icon: IconCalendarTime,
      label: m.attendance_quick_menu_calendar(),
      iconClassName: 'bg-slate-100 text-slate-500',
      to: '/attendance/calendar',
    },
    {
      icon: IconGridDots,
      label: m.attendance_quick_menu_all(),
      iconClassName: 'bg-slate-100 text-slate-500',
      to: '/attendance/all-menu',
    },
  ]

  return (
    <AppMain
      title={m.attendance_overview_title()}
      subtitle={m.attendance_overview_subtitle()}
      breadcrumbs={getAttendanceBreadcrumbs()}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='overview' />

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <AttendanceStat
          icon={IconRosetteDiscountCheck}
          iconClassName='bg-emerald-50 text-emerald-600'
          value='1,183'
          label={m.attendance_stat_present()}
          percentage='94.7%'
          percentageClassName='text-emerald-600'
        />
        <AttendanceStat
          icon={IconClock}
          iconClassName='bg-orange-50 text-orange-500'
          value='45'
          label={m.attendance_stat_late()}
          percentage='3.6%'
          percentageClassName='text-orange-500'
        />
        <AttendanceStat
          icon={IconRosetteDiscountCheck}
          iconClassName='bg-rose-50 text-rose-500'
          value='20'
          label={m.attendance_stat_absent()}
          percentage='1.6%'
          percentageClassName='text-rose-500'
        />
        <AttendanceStat
          icon={IconCalendarEvent}
          iconClassName='bg-emerald-50 text-emerald-600'
          value='32'
          label={m.attendance_stat_leave()}
          percentage='2.6%'
          percentageClassName='text-violet-600'
        />
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(430px,1fr)]'>
        <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='font-semibold'>{m.attendance_today_shift_title()}</h3>
            <Button size='sm' variant='outline' className='rounded-lg' asChild>
              <Link to='/attendance/management/shifts'>
                <IconArrowRight />
                {m.attendance_view_schedule()}
              </Link>
            </Button>
          </div>
          <div className='mt-4 flex gap-3'>
            <span className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500'>
              <IconCalendarEvent className='size-4' />
            </span>
            <div>
              <p className='text-[26px] leading-7 font-bold tracking-tight'>09:00 – 18:00</p>
              <p className='mt-1 text-xs text-muted-foreground'>{m.attendance_regular_hours()}</p>
            </div>
          </div>
          <div className='mt-4 flex items-center gap-2 text-sm'>
            <IconCalendarEvent className='size-4 text-slate-500' />
            <span>{m.attendance_office_location()}</span>
          </div>
          <div className='mt-4 flex flex-wrap gap-2'>
            <span className='rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
              {m.attendance_requirement()}
            </span>
            <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'>
              <IconMapPin className='mr-1 inline size-3' />
              {m.attendance_zone()}
            </span>
          </div>
          <div className='mt-4 grid gap-2 sm:grid-cols-2'>
            <Button className='rounded-lg' asChild>
              <Link to='/attendance/clock-in-out'>
                <IconAlarm />
                {m.attendance_clock_in()}
              </Link>
            </Button>
            <Button
              variant='outline'
              className='rounded-lg border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600'
              asChild
            >
              <Link to='/attendance/clock-in-out'>
                <IconClock />
                {m.attendance_clock_out()}
              </Link>
            </Button>
          </div>
        </section>

        <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
          <h3 className='font-semibold'>{m.attendance_quick_menu_title()}</h3>
          <div className='mt-4 grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-4'>
            {menuItems.map((item) => (
              <QuickMenuItem key={item.label} {...item} />
            ))}
          </div>
        </section>
      </div>

      <div className='grid gap-4 xl:grid-cols-2'>
        <section className='flex min-h-28 items-start justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm'>
          <div className='flex gap-3'>
            <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600'>
              <IconBell className='size-5' />
            </span>
            <div>
              <h3 className='font-semibold'>{m.attendance_announcement_title()}</h3>
              <p className='mt-2 text-xs leading-5 text-muted-foreground'>
                {m.attendance_announcement_description()}
              </p>
            </div>
          </div>
          <Button size='sm' variant='outline' className='shrink-0 rounded-lg' asChild>
            <Link to='/attendance/all-menu'>
              <IconArrowRight />
              {m.attendance_view_all()}
            </Link>
          </Button>
        </section>
        <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold'>{m.attendance_today_summary_title()}</h3>
            <Button size='sm' variant='outline' className='rounded-lg' asChild>
              <Link to='/attendance/history'>
                <IconArrowRight />
                {m.attendance_view_detail()}
              </Link>
            </Button>
          </div>
          <dl className='mt-4 grid grid-cols-4 gap-3 text-xs'>
            <div>
              <dt className='text-muted-foreground'>{m.attendance_summary_status()}</dt>
              <dd className='mt-1 font-semibold text-emerald-600'>
                {m.attendance_summary_before_clock_in()}
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{m.attendance_summary_work_hours()}</dt>
              <dd className='mt-1 font-semibold text-orange-500'>08:00</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{m.attendance_summary_duration()}</dt>
              <dd className='mt-1 font-semibold text-blue-600'>–</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{m.attendance_summary_break()}</dt>
              <dd className='mt-1 font-semibold text-blue-600'>–</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <div className='flex items-center justify-between p-4'>
          <h3 className='font-semibold'>{m.attendance_recent_history_title()}</h3>
          <Button size='sm' variant='outline' className='rounded-lg' asChild>
            <Link to='/attendance/history'>
              <IconArrowRight />
              {m.attendance_view_all()}
            </Link>
          </Button>
        </div>
        <Table>
          <TableHeader className='bg-muted/50'>
            <TableRow>
              <TableHead>{m.attendance_table_date()}</TableHead>
              <TableHead>{m.attendance_table_clock_in()}</TableHead>
              <TableHead>{m.attendance_table_clock_out()}</TableHead>
              <TableHead>{m.attendance_table_duration()}</TableHead>
              <TableHead>{m.attendance_table_status()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ['15 Mei 2024', '08:52', '17:30', '8j 38m'],
              ['14 Mei 2024', '08:47', '17:32', '8j 45m'],
            ].map((row) => (
              <TableRow key={row[0]}>
                {row.map((cell) => (
                  <TableCell key={cell} className='text-xs'>
                    {cell}
                  </TableCell>
                ))}
                <TableCell>
                  <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600'>
                    {m.attendance_status_present()}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </AppMain>
  )
}
