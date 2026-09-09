import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconHierarchy,
  IconSitemap,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { m } from '@/i18n/paraglide/messages'

type UnitTab = 'structure' | 'department' | 'division' | 'section'

interface UnitPageShellProps {
  activeTab: UnitTab
  children: ReactNode
}

const unitTabs = [
  {
    value: 'structure',
    label: m.organization_unit_tab_structure,
    to: '/organization/unit',
    icon: IconHierarchy,
  },
  {
    value: 'department',
    label: m.organization_unit_tab_department,
    to: '/organization/unit/department',
    icon: IconBuildingSkyscraper,
  },
  {
    value: 'division',
    label: m.organization_unit_tab_division,
    to: '/organization/unit/division',
    icon: IconBuilding,
  },
  {
    value: 'section',
    label: m.organization_unit_tab_section,
    to: '/organization/unit/section',
    icon: IconSitemap,
  },
] as const

export function UnitPageShell({ activeTab, children }: UnitPageShellProps) {
  return (
    <AppMain
      title={m.organization_unit_structure_title()}
      subtitle={m.organization_unit_structure_subtitle()}
      className='w-full max-w-full min-w-0 gap-6'
    >
      <Tabs value={activeTab} className='w-full max-w-full min-w-0 gap-6'>
        <div className='no-scrollbar overflow-x-auto border-b border-border/80'>
          <TabsList className='h-10 w-max gap-6 bg-transparent p-0'>
            {unitTabs.map((tab) => {
              const Icon = tab.icon

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  asChild
                  className='gap-2 rounded-none border-b-2 border-transparent px-2 py-2 text-xs font-semibold transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none'
                >
                  <Link to={tab.to}>
                    <Icon size={15} />
                    {tab.label()}
                  </Link>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {children}
      </Tabs>
    </AppMain>
  )
}
