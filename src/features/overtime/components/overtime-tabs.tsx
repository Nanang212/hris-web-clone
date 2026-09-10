import { Link } from '@tanstack/react-router'

import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { m } from '@/i18n/paraglide/messages'

interface OvertimeTabsProps {
  active: 'requests' | 'approval' | 'calculation' | 'history'
}

export function OvertimeTabs({ active }: Readonly<OvertimeTabsProps>) {
  const tabs = [
    { key: 'requests', label: m.overtime_tab_requests(), to: '/overtime' as const },
    { key: 'approval', label: m.overtime_tab_approval(), to: '/overtime/approval' as const },
    {
      key: 'calculation',
      label: m.overtime_tab_calculation(),
      to: '/overtime/calculation' as const,
    },
    { key: 'history', label: m.overtime_tab_history(), to: '/overtime/history' as const },
  ]

  return (
    <Tabs value={active}>
      <TabsList variant='segmented' aria-label={m.overtime_navigation_label()}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key} asChild>
            <Link to={tab.to}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
