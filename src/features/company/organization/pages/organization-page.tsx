import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconHierarchy,
  IconSitemap,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { m } from '@/i18n/paraglide/messages'

import { DepartmentManagementTab } from '../components/department/department-management-tab'
import { DivisionManagementTab } from '../components/division/division-management-tab'
import { SectionManagementTab } from '../components/section/section-management-tab'
import { OrganizationStructureTab } from '../components/structure/organization-structure-tab'

type OrganizationTab = 'structure' | 'department' | 'division' | 'section'

interface OrganizationPageProps {
  tab?: OrganizationTab
}

const organizationTabs = [
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

function OrganizationTabContent({ tab }: { tab: OrganizationTab }) {
  if (tab === 'department') {
    return <DepartmentManagementTab />
  }

  if (tab === 'division') {
    return <DivisionManagementTab />
  }

  if (tab === 'section') {
    return <SectionManagementTab />
  }

  return <OrganizationStructureTab />
}

export function OrganizationPage({ tab = 'structure' }: Readonly<OrganizationPageProps>) {
  return (
    <AppMain
      title={m.organization_unit_structure_title()}
      subtitle={m.organization_unit_structure_subtitle()}
      className='w-full max-w-full min-w-0 gap-6'
    >
      <Tabs value={tab} className='w-full max-w-full min-w-0 gap-6'>
        <div className='no-scrollbar overflow-x-auto border-b border-border/80'>
          <TabsList className='h-10 w-max gap-6 bg-transparent p-0'>
            {organizationTabs.map((item) => {
              const Icon = item.icon

              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  asChild
                  className='gap-2 rounded-none border-b-2 border-transparent px-2 py-2 text-xs font-semibold transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none'
                >
                  <Link
                    to='/company/organization'
                    search={{ tab: item.value === 'structure' ? undefined : item.value }}
                  >
                    <Icon size={15} />
                    {item.label()}
                  </Link>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        <TabsContent value={tab}>
          <OrganizationTabContent tab={tab} />
        </TabsContent>
      </Tabs>
    </AppMain>
  )
}
