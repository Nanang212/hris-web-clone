import { Link } from '@tanstack/react-router'

import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
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
    <Tabs value={active}>
      <TabsList variant='segmented' aria-label={m.leave_navigation_label()}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key} asChild>
            <Link to={tab.to}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
