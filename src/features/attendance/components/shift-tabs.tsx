import { Link } from '@tanstack/react-router'

import { m } from '@/i18n/paraglide/messages'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

const tabs = [
  ['schedule', m.attendance_shift_tab_schedule, '/attendance/management/shifts'],
  ['setup', m.attendance_shift_tab_setup, '/attendance/management/shifts/setup'],
  ['assignments', m.attendance_shift_tab_assignments, '/attendance/management/shifts/assignments'],
  ['swaps', m.attendance_shift_tab_swaps, '/attendance/management/shifts/swaps'],
] as const

export function ShiftTabs({ active }: Readonly<{ active: (typeof tabs)[number][0] }>) {
  return (
    <Tabs value={active}>
      <TabsList variant='segmented' aria-label={m.attendance_shift_navigation_label()}>
        {tabs.map(([key, getLabel, to]) => (
          <TabsTrigger key={key} value={key} asChild>
            <Link to={to}>{getLabel()}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
