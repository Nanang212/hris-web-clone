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
    },
    {
      code: 'OT',
      title: m.attendance_menu_overtime_title(),
      description: m.attendance_menu_overtime_description(),
      icon: IconCalendarEvent,
    },
    {
      code: 'CL',
      title: m.attendance_menu_claim_title(),
      description: m.attendance_menu_claim_description(),
      icon: IconFileText,
    },
    {
      code: 'BT',
      title: m.attendance_menu_trip_title(),
      description: m.attendance_menu_trip_description(),
      icon: IconPlane,
    },
    {
      code: 'PAY',
      title: m.attendance_menu_payslip_title(),
      description: m.attendance_menu_payslip_description(),
      icon: IconFileText,
    },
    {
      code: 'CAL',
      title: m.attendance_menu_calendar_title(),
      description: m.attendance_menu_calendar_description(),
      icon: IconCalendarEvent,
    },
    {
      code: 'SH',
      title: m.attendance_menu_shift_title(),
      description: m.attendance_menu_shift_description(),
      icon: IconCalendarEvent,
    },
    {
      code: 'ANN',
      title: m.attendance_menu_announcement_title(),
      description: m.attendance_menu_announcement_description(),
      icon: IconSpeakerphone,
    },
    {
      code: 'SET',
      title: m.attendance_menu_settings_title(),
      description: m.attendance_menu_settings_description(),
      icon: IconSettings,
    },
  ]

  return (
    <AppMain
      title={m.attendance_menu_title()}
      subtitle={m.attendance_menu_subtitle()}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='all-menu' />
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {menus.map(({ code, title, description, icon: Icon, to }) => {
          const content = (
            <>
              <div className='flex items-start justify-between'>
                <span className='flex size-10 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600'>
                  {code}
                </span>
                <IconArrowRight className='mt-2 size-4 text-muted-foreground' />
              </div>
              <div>
                <h3 className='font-semibold'>{title}</h3>
                <p className='mt-1 text-xs text-muted-foreground'>{description}</p>
              </div>
            </>
          )
          return to ? (
            <Link
              key={code}
              to={to}
              className='flex min-h-37 flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50'
            >
              {content}
            </Link>
          ) : (
            <button
              key={code}
              type='button'
              className='flex min-h-37 flex-col justify-between rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/50'
            >
              {content}
            </button>
          )
        })}
      </div>
    </AppMain>
  )
}
