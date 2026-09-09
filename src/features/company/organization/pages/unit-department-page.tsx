import { UnitPageShell } from '../components/unit-page-shell'
import { DepartmentManagementTab } from './department/department-management-tab'

export function UnitDepartmentPage() {
  return (
    <UnitPageShell activeTab='department'>
      <DepartmentManagementTab />
    </UnitPageShell>
  )
}
