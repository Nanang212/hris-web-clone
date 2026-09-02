// src/features/payroll/pages/configuration/payroll-config-tab.tsx — Parent tab for Payroll Configurations
import { useState } from 'react'
import { BpjsKesConfigView } from './bpjs-kes-config-view'
import { BpjsTkConfigView } from './bpjs-tk-config-view'
import { GeneralConfigView } from './general-config-view'
import { Pph21ConfigView } from './pph21-config-view'
import { SalaryComponentsView } from './salary-components-view'
import { ThrConfigView } from './thr-config-view'
import type { ConfigSubTab } from '../../types'
import { Button } from '@/shared/components/ui/button'

export function PayrollConfigTab() {
  const [activeSubTab, setActiveSubTab] = useState<ConfigSubTab>('general')

  const subTabs: { id: ConfigSubTab; label: string }[] = [
    { id: 'general', label: 'General / Cycle' },
    { id: 'components', label: 'Salary Components' },
    { id: 'bpjs-tk', label: 'BPJS Ketenagakerjaan' },
    { id: 'bpjs-kes', label: 'BPJS Kesehatan' },
    { id: 'pph21', label: 'PPh 21 & TER' },
    { id: 'thr', label: 'THR Policy' },
  ]

  return (
    <div className='flex flex-col gap-6'>
      {/* ── Sub-Tab Navigation Bar ────────────────────────────────────────── */}
      <div className='flex items-center gap-2 overflow-x-auto pb-1'>
        {subTabs.map((tab) => (
          <Button
            key={tab.id}
            size='sm'
            variant={activeSubTab === tab.id ? 'default' : 'outline'}
            onClick={() => setActiveSubTab(tab.id)}
            className='h-8 px-4 text-xs font-semibold rounded-xl shadow-2xs'
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* ── Active Sub-View ───────────────────────────────────────────────── */}
      {activeSubTab === 'general' && <GeneralConfigView />}
      {activeSubTab === 'components' && <SalaryComponentsView />}
      {activeSubTab === 'bpjs-tk' && <BpjsTkConfigView />}
      {activeSubTab === 'bpjs-kes' && <BpjsKesConfigView />}
      {activeSubTab === 'pph21' && <Pph21ConfigView />}
      {activeSubTab === 'thr' && <ThrConfigView />}
    </div>
  )
}
