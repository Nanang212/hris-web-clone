import {
  IconArrowRight,
  IconCalendarEvent,
  IconCalendarTime,
  IconFileText,
  IconListDetails,
  IconMapPin,
  IconPlane,
  IconSettings,
  IconSpeakerphone,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import { m } from '@/i18n/paraglide/messages'
import { getLocale } from '@/i18n/paraglide/runtime'

export function AllMenuPage() {
  const isEn = getLocale() === 'en'

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
      code: 'WP',
      title: isEn ? 'Work Pattern' : 'Pola Kerja',
      description: isEn ? 'Regular schedule & cycles' : 'Jadwal reguler & penugasan',
      icon: IconCalendarTime,
      to: '/attendance/work-patterns' as const,
    },
    {
      code: 'LOC',
      title: isEn ? 'Attendance Location' : 'Lokasi Kehadiran',
      description: isEn ? 'GPS points & geofence' : 'Titik GPS & geofence',
      icon: IconMapPin,
      to: '/attendance/locations' as const,
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
      to: '/attendance/settings' as const,
    },
  ]

  return (
    <AppMain
      title={m.attendance_menu_title()}
      subtitle={m.attendance_menu_subtitle()}
      breadcrumbs={getAttendanceBreadcrumbs(m.attendance_menu_title())}
      backTo='/attendance'
      className='gap-6 bg-muted/20'
    >
      <AttendanceTabs active='all-menu' />
      <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {menus.map(({ code, title, description, icon: Icon, to }) => (
          <Link
            key={code}
            to={to}
            className='group flex min-h-36 w-full min-w-0 flex-col justify-between rounded-2xl border border-border/80 bg-card p-4.5 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50 hover:bg-muted/30'
          >
            <div className='flex items-start justify-between gap-3'>
              <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
                <Icon className='size-5' />
              </span>
              <IconArrowRight className='size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary' />
            </div>
            <div className='mt-3 min-w-0'>
              <h3 className='text-sm font-bold text-foreground leading-snug truncate'>{title}</h3>
              <p className='text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed'>
                {description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </AppMain>
  )
}
