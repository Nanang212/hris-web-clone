import { UnitPageShell } from '../components/unit-page-shell'
import { DivisionManagementTab } from './division/division-management-tab'

export function UnitDivisionPage() {
  return (
    <UnitPageShell activeTab='division'>
      <DivisionManagementTab />
    </UnitPageShell>
  )
}
