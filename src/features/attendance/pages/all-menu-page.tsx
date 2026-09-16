import {
  IconArrowRight,
  IconCalendarEvent,
  IconFileText,
  IconListDetails,
  IconPlane,
  IconSettings,
  IconSpeakerphone,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import { m } from '@/i18n/paraglide/messages'

export function AllMenuPage() {
  const menus = [
    {
      code: 'CI',
      title: m.attendance_menu_clock_title(),
      description: m.attendance_menu_clock_description(),
      icon: IconCalendarEvent,
      to: '/attendance/clock-in-out' as const,
    },
    {
      code: 'LOG',
      title: m.attendance_menu_history_title(),
      description: m.attendance_menu_history_description(),
      icon: IconListDetails,
      to: '/attendance/history' as const,
    },
    {
      code: 'REQ',
      title: m.attendance_menu_request_title(),
      description: m.attendance_menu_request_description(),
      icon: IconFileText,
      to: '/attendance/requests' as const,
    },
    {
      code: 'LV',
      title: m.attendance_menu_leave_title(),
      description: m.attendance_menu_leave_description(),
      icon: IconCalendarEvent,
      to: '/leave' as const,
    },
    {
      code: 'OT',
      title: m.attendance_menu_overtime_title(),
      description: m.attendance_menu_overtime_description(),
      icon: IconCalendarEvent,
      to: '/overtime' as const,
    },
    {
      code: 'CL',
      title: m.attendance_menu_claim_title(),
      description: m.attendance_menu_claim_description(),
      icon: IconFileText,
      to: '/travel-expense/claim' as const,
    },
    {
      code: 'BT',
      title: m.attendance_menu_trip_title(),
      description: m.attendance_menu_trip_description(),
      icon: IconPlane,
      to: '/travel-expense/business-trip' as const,
    },
    {
      code: 'PAY',
      title: m.attendance_menu_payslip_title(),
      description: m.attendance_menu_payslip_description(),
      icon: IconFileText,
      to: '/payroll' as const,
    },
    {
      code: 'CAL',
      title: m.attendance_menu_calendar_title(),
      description: m.attendance_menu_calendar_description(),
      icon: IconCalendarEvent,
      to: '/attendance/calendar' as const,
    },
    {
      code: 'SH',
      title: m.attendance_menu_shift_title(),
      description: m.attendance_menu_shift_description(),
      icon: IconCalendarEvent,
      to: '/attendance/management/shifts' as const,
    },
    {
      code: 'ANN',
      title: m.attendance_menu_announcement_title(),
      description: m.attendance_menu_announcement_description(),
      icon: IconSpeakerphone,
      to: '/settings/notification' as const,
    },
    {
      code: 'SET',
      title: m.attendance_menu_settings_title(),
      description: m.attendance_menu_settings_description(),
      icon: IconSettings,
      to: '/employment/employee-profile' as const,
    },
  ]

  return (
    <AppMain
      title={m.attendance_menu_title()}
      subtitle={m.attendance_menu_subtitle()}
      breadcrumbs={getAttendanceBreadcrumbs(m.attendance_menu_title())}
      backTo='/attendance'
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='all-menu' />
      <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {menus.map(({ code, title, description, icon: Icon, to }) => {
          return (
            <Button key={code} asChild variant='ghost' className='h-auto min-h-37 w-full justify-start p-0'>
              <Link
                to={to}
                className='flex min-w-0 w-full flex-col justify-between rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/50'
              >
                <div className='flex min-w-0 items-start justify-between gap-4'>
                  <div className='flex min-w-0 flex-1 flex-col items-start gap-2'>
                    <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600'>
                      <Icon className='size-5' />
                    </span>
                    <h3 className='break-words font-semibold leading-5'>{title}</h3>
                    <p className='break-words text-xs leading-5 text-muted-foreground'>
                      {description}
                    </p>
                  </div>
                  <IconArrowRight className='mt-1 size-4 shrink-0 text-muted-foreground' />
                </div>
              </Link>
            </Button>
          )
        })}
      </div>
    </AppMain>
  )
}
