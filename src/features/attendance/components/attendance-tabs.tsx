import { Link } from '@tanstack/react-router'

import { m } from '@/i18n/paraglide/messages'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

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
    <Tabs value={active}>
      <TabsList variant='segmented' aria-label={m.attendance_navigation_label()}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key} asChild>
            <Link to={tab.to}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
