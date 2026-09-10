import { Link } from '@tanstack/react-router'

import { m } from '@/i18n/paraglide/messages'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

const calendarTabs = [
  {
    key: 'overview',
    label: m.attendance_calendar_tab_overview(),
    to: '/attendance/calendar' as const,
  },
  {
    key: 'holidays',
    label: m.attendance_calendar_tab_holidays(),
    to: '/attendance/calendar/holidays' as const,
  },
  {
    key: 'settings',
    label: m.attendance_calendar_tab_settings(),
    to: '/attendance/calendar/settings' as const,
  },
] as const

export function CalendarTabs({
  active,
}: Readonly<{ active: (typeof calendarTabs)[number]['key'] }>) {
  return (
    <Tabs value={active}>
      <TabsList variant='segmented' aria-label={m.attendance_calendar_navigation_label()}>
        {calendarTabs.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key} asChild>
            <Link to={tab.to}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
