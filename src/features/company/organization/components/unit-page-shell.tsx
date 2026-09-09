import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconHierarchy,
  IconSitemap,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
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
    icon: IconHierarchy,
  },
  {
    value: 'department',
    label: m.organization_unit_tab_department,
    icon: IconBuildingSkyscraper,
  },
  {
    value: 'division',
    label: m.organization_unit_tab_division,
    icon: IconBuilding,
  },
  {
    value: 'section',
    label: m.organization_unit_tab_section,
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
                  <Link
                    to='/company/organization'
                    search={{ tab: tab.value === 'structure' ? undefined : tab.value }}
                  >
                    <Icon size={15} />
                    {tab.label()}
                  </Link>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        <TabsContent value={activeTab}>{children}</TabsContent>
      </Tabs>
    </AppMain>
  )
}
