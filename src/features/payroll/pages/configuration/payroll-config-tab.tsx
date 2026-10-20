import { useState } from 'react'

import { m } from '@/i18n/paraglide/messages'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

import type { ConfigSubTab } from '../../types'
import { BpjsKesConfigView } from './bpjs-kes-config-view'
import { BpjsTkConfigView } from './bpjs-tk-config-view'
import { EmployeeComponentsView } from './employee-components-view'
import { GeneralConfigView } from './general-config-view'
import { Pph21ConfigView } from './pph21-config-view'
import { SalaryComponentsView } from './salary-components-view'
import { ThrConfigView } from './thr-config-view'

interface PayrollConfigTabProps {
  initialSubTab?: ConfigSubTab
}

export function PayrollConfigTab({ initialSubTab = 'general' }: PayrollConfigTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<ConfigSubTab>(initialSubTab)

  const subTabs: { id: ConfigSubTab; label: string }[] = [
    { id: 'general', label: m.payroll_config_tab_general() },
    { id: 'components', label: m.payroll_config_tab_components() },
    { id: 'employee-components', label: m.payroll_employee_components_tab() },
    { id: 'bpjs-tk', label: m.payroll_config_tab_bpjs_tk() },
    { id: 'bpjs-kes', label: m.payroll_config_tab_bpjs_kes() },
    { id: 'pph21', label: m.payroll_config_tab_pph21() },
    { id: 'thr', label: m.payroll_config_tab_thr() },
  ]

  return (
    <div className='flex flex-col gap-6'>
      {/* ── Sub-Tab Navigation Bar ────────────────────────────────────────── */}
      <Tabs value={activeSubTab} onValueChange={(value) => setActiveSubTab(value as ConfigSubTab)}>
        <TabsList variant='segmented' aria-label={m.payroll_tab_configuration()}>
          {subTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ── Active Sub-View ───────────────────────────────────────────────── */}
      {activeSubTab === 'general' && <GeneralConfigView />}
      {activeSubTab === 'components' && <SalaryComponentsView />}
      {activeSubTab === 'employee-components' && <EmployeeComponentsView />}
      {activeSubTab === 'bpjs-tk' && <BpjsTkConfigView />}
      {activeSubTab === 'bpjs-kes' && <BpjsKesConfigView />}
      {activeSubTab === 'pph21' && <Pph21ConfigView />}
      {activeSubTab === 'thr' && <ThrConfigView />}
    </div>
  )
}
