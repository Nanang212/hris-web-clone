import { Link } from '@tanstack/react-router'

import { Button } from '@/shared/components/ui/button'
import { m } from '@/i18n/paraglide/messages'

interface LeaveTabsProps {
  active: 'overview' | 'requests' | 'approval' | 'balance' | 'history'
}

export function LeaveTabs({ active }: Readonly<LeaveTabsProps>) {
  const tabs = [
    { key: 'overview', label: m.leave_tab_overview(), to: '/leave' as const },
    { key: 'requests', label: m.leave_tab_requests(), to: '/leave/requests' as const },
    { key: 'approval', label: m.leave_tab_approval(), to: '/leave/approval' as const },
    { key: 'balance', label: m.leave_tab_balance(), to: '/leave/balance' as const },
    { key: 'history', label: m.leave_tab_history(), to: '/leave/history' as const },
  ]

  return (
    <nav className='flex gap-2 overflow-x-auto pb-1' aria-label={m.leave_navigation_label()}>
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          size='sm'
          variant={active === tab.key ? 'secondary' : 'outline'}
          asChild
        >
          <Link to={tab.to}>{tab.label}</Link>
        </Button>
      ))}
    </nav>
  )
}
