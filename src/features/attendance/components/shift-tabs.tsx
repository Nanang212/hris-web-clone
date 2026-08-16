import { Link } from '@tanstack/react-router'

import { Button } from '@/shared/components/ui/button'

const tabs = [
  ['schedule', 'Schedule', '/attendance/management/shifts'],
  ['setup', 'Shift Setup', '/attendance/management/shifts/setup'],
  ['assignments', 'Assignments', '/attendance/management/shifts/assignments'],
  ['swaps', 'Swap Requests', '/attendance/management/shifts/swaps'],
] as const

export function ShiftTabs({ active }: Readonly<{ active: (typeof tabs)[number][0] }>) {
  return (
    <nav className='flex gap-2 overflow-x-auto pb-1'>
      {tabs.map(([key, label, to]) => (
        <Button key={key} size='sm' variant={key === active ? 'secondary' : 'outline'} asChild>
          <Link to={to}>{label}</Link>
        </Button>
      ))}
    </nav>
  )
}
