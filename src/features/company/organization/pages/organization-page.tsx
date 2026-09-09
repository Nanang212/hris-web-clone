import { UnitPageShell } from '../components/unit-page-shell'
import { DepartmentManagementTab } from './department/department-management-tab'
import { DivisionManagementTab } from './division/division-management-tab'
import { OrganizationStructureTab } from './structure/organization-structure-tab'
import { UnitSectionPage } from './unit-section-page'

type OrganizationTab = 'structure' | 'department' | 'division' | 'section'

interface OrganizationPageProps {
  tab?: OrganizationTab
}

function OrganizationTabContent({ tab }: { tab: OrganizationTab }) {
  if (tab === 'department') {
    return <DepartmentManagementTab />
  }

  if (tab === 'division') {
    return <DivisionManagementTab />
  }

  if (tab === 'section') {
    return <UnitSectionPage standalone />
  }

  return <OrganizationStructureTab />
}

export function OrganizationPage({ tab = 'structure' }: OrganizationPageProps) {
  return (
    <UnitPageShell activeTab={tab}>
      <OrganizationTabContent tab={tab} />
    </UnitPageShell>
  )
}
