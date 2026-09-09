import { UnitPageShell } from '../components/unit-page-shell'
import { OrganizationStructureTab } from './structure/organization-structure-tab'

export function UnitStructurePage() {
  return (
    <UnitPageShell activeTab='structure'>
      <OrganizationStructureTab />
    </UnitPageShell>
  )
}
