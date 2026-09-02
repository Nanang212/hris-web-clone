// src/features/payroll/pages/payroll-page.tsx — Main Payroll Page Controller
import {
  IconChevronLeft,
  IconReportMoney,
  IconSettings,
  IconFileText,
  IconChecklist,
  IconChartBar,
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { PayrollApprovalTab } from './approval/payroll-approval-tab'
import { PayrollConfigTab } from './configuration/payroll-config-tab'
import { PayrollOverviewTab } from './overview/payroll-overview-tab'
import { PayslipManagementTab } from './payslip/payslip-management-tab'
import { CreatePayrollWizard } from './process/create-payroll-wizard'
import { PayrollProcessDetail } from './process/payroll-process-detail'
import { PayrollProcessTab } from './process/payroll-process-tab'
import { initialPayrollRuns } from '../data/mock-payroll-data'
import type { PayrollTab, PayrollRun } from '../types'
import { useAppLayoutStore } from '@/shared/components/app-layout/app-layout-store'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'

export function PayrollPage() {
  const [activeTab, setActiveTab] = useState<PayrollTab>('overview')
  const [runs, setRuns] = useState<PayrollRun[]>(initialPayrollRuns)

  // Process sub-views: 'list' | 'create_wizard' | 'detail'
  const [processView, setProcessView] = useState<'list' | 'create_wizard' | 'detail'>('list')
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null)

  // Back button portal
  const setHasBackButton = useAppLayoutStore((state) => state.setHasBackButton)
  const backBtnNode = useAppLayoutStore((state) => state.backBtnNode)

  useEffect(() => {
    if (processView !== 'list') {
      setHasBackButton(true)
      return () => setHasBackButton(false)
    }
  }, [processView, setHasBackButton])

  const handleNavigateToProcess = (runId?: string) => {
    setActiveTab('process')
    if (runId) {
      const match = runs.find((r) => r.id === runId)
      if (match) {
        setSelectedRun(match)
        setProcessView('detail')
        return
      }
    }
    setProcessView('list')
  }

  const tabs: { id: PayrollTab; label: string; icon: React.ComponentType<{ size: number }> }[] = [
    { id: 'overview', label: 'Overview', icon: IconChartBar },
    { id: 'configuration', label: 'Configuration', icon: IconSettings },
    { id: 'process', label: 'Process', icon: IconReportMoney },
    { id: 'approval', label: 'Approval & Disbursement', icon: IconChecklist },
    { id: 'payslip', label: 'Payslip', icon: IconFileText },
  ]

  let pageTitle = 'Payroll Management'
  let pageSubtitle = 'Sistem kalkulasi gaji, kepatuhan pajak PPh 21, iuran BPJS, dan distribusi slip gaji.'

  if (activeTab === 'process') {
    if (processView === 'create_wizard') {
      pageTitle = 'Create Payroll Process'
      pageSubtitle = 'Buat proses kalkulasi penggajian baru dengan sinkronisasi presensi dan lembur.'
    } else if (processView === 'detail') {
      pageTitle = `Payroll Detail: ${selectedRun?.period || ''}`
      pageSubtitle = `Rincian kalkulasi gaji per karyawan untuk batch ${selectedRun?.code || ''}.`
    }
  }

  return (
    <AppMain
      title={pageTitle}
      subtitle={pageSubtitle}
      className='gap-6'
    >
      {/* ── Back button portal ─────────────────────────────────────────────── */}
      {processView !== 'list' &&
        backBtnNode &&
        createPortal(
          <Button
            variant='outline'
            size='icon'
            onClick={() => {
              setProcessView('list')
              setSelectedRun(null)
            }}
            className='size-9 rounded-xl'
          >
            <IconChevronLeft size={20} />
          </Button>,
          backBtnNode,
        )}

      {/* ── Main Tab Navigation Bar ────────────────────────────────────────── */}
      {processView === 'list' && (
        <div className='flex items-center gap-1.5 border-b border-border/80 pb-px overflow-x-auto'>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type='button'
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Tab Content Views ──────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <PayrollOverviewTab
          onNavigateToProcess={handleNavigateToProcess}
          onNavigateToConfig={() => setActiveTab('configuration')}
        />
      )}

      {activeTab === 'configuration' && <PayrollConfigTab />}

      {activeTab === 'process' && (
        <>
          {processView === 'list' && (
            <PayrollProcessTab
              runs={runs}
              onOpenCreate={() => setProcessView('create_wizard')}
              onViewDetail={(run) => {
                setSelectedRun(run)
                setProcessView('detail')
              }}
            />
          )}

          {processView === 'create_wizard' && (
            <CreatePayrollWizard
              onCancel={() => setProcessView('list')}
              onSuccess={(newRun) => {
                setRuns((prev) => [newRun, ...prev])
                setSelectedRun(newRun)
                setProcessView('detail')
              }}
            />
          )}

          {processView === 'detail' && selectedRun && (
            <PayrollProcessDetail
              run={selectedRun}
              onBack={() => {
                setProcessView('list')
                setSelectedRun(null)
              }}
              onSubmitForApproval={(runId) => {
                setRuns((prev) =>
                  prev.map((r) =>
                    r.id === runId
                      ? {
                          ...r,
                          status: 'in_review',
                          approvalStage: 'finance_approval',
                        }
                      : r,
                  ),
                )
                setActiveTab('approval')
                setProcessView('list')
              }}
            />
          )}
        </>
      )}

      {activeTab === 'approval' && <PayrollApprovalTab />}

      {activeTab === 'payslip' && <PayslipManagementTab />}
    </AppMain>
  )
}
