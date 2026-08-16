import { Link } from '@tanstack/react-router'

import { Button } from '@/shared/components/ui/button'
import { m } from '@/i18n/paraglide/messages'

interface AttendanceTabsProps {
  active:
    | 'overview'
    | 'clock'
    | 'history'
    | 'requests'
    | 'approval'
    | 'management'
    | 'settings'
    | 'all-menu'
}

export function AttendanceTabs({ active }: Readonly<AttendanceTabsProps>) {
  const tabs = [
    { key: 'overview', label: m.attendance_tab_overview(), to: '/attendance' as const },
    { key: 'clock', label: m.attendance_tab_clock(), to: '/attendance/clock-in-out' as const },
    { key: 'history', label: m.attendance_tab_history(), to: '/attendance/history' as const },
    { key: 'requests', label: m.attendance_tab_requests(), to: '/attendance/requests' as const },
    { key: 'approval', label: m.attendance_tab_approval(), to: '/attendance/approval' as const },
    {
      key: 'management',
      label: m.attendance_tab_management(),
      to: '/attendance/management' as const,
    },
    { key: 'settings', label: m.attendance_tab_settings(), to: '/attendance/settings' as const },
  ]

  return (
    <nav className='flex gap-2 overflow-x-auto pb-1' aria-label={m.attendance_navigation_label()}>
      {tabs.map((tab) =>
        tab.to ? (
          <Button
            key={tab.key}
            size='sm'
            variant={active === tab.key ? 'secondary' : 'outline'}
            asChild
          >
            <Link to={tab.to}>{tab.label}</Link>
          </Button>
        ) : (
          <Button key={tab.key} size='sm' variant='outline'>
            {tab.label}
          </Button>
        ),
      )}
    </nav>
  )
}
