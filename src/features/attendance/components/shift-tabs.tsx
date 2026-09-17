import { Link } from '@tanstack/react-router'

import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { m } from '@/i18n/paraglide/messages'

const tabs = [
  ['schedule', m.attendance_shift_tab_schedule, '/attendance/management/shifts'],
  ['actual', () => 'vs Actual', '/attendance/management/shifts/vs-actual'],
  ['setup', m.attendance_shift_tab_setup, '/attendance/management/shifts/setup'],
  ['assignments', m.attendance_shift_tab_assignments, '/attendance/management/shifts/assignments'],
  ['swaps', m.attendance_shift_tab_swaps, '/attendance/management/shifts/swaps'],
] as const

export function ShiftTabs({ active }: Readonly<{ active: (typeof tabs)[number][0] }>) {
  const visibleTabs = tabs.filter(([key]) => key !== 'setup' || active === 'setup')

  return (
    <Tabs value={active}>
      <TabsList variant='segmented' aria-label={m.attendance_shift_navigation_label()}>
        {visibleTabs.map(([key, getLabel, to]) => (
          <TabsTrigger key={key} value={key} asChild>
            <Link to={to}>{getLabel()}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
