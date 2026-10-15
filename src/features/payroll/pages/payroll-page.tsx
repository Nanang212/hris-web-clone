// src/features/payroll/pages/payroll-page.tsx — Main Payroll Page Controller
import {
  IconChevronLeft,
  IconReportMoney,
  IconSettings,
  IconFileText,
  IconChecklist,
  IconChartBar,
  IconCalendarStats,
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AttendancePayrollTab } from './attendance/attendance-payroll-tab'
import { PayrollApprovalTab } from './approval/payroll-approval-tab'
import { PayrollConfigTab } from './configuration/payroll-config-tab'
import { PayrollOverviewTab } from './overview/payroll-overview-tab'
import { PayslipManagementTab } from './payslip/payslip-management-tab'
import { CreatePayrollWizard } from './process/create-payroll-wizard'
import { PayrollProcessDetail } from './process/payroll-process-detail'
import { PayrollProcessTab } from './process/payroll-process-tab'
import { initialPayrollRuns } from '../data/mock-payroll-data'
import type { PayrollTab, PayrollRun, ConfigSubTab } from '../types'
import { m } from '@/i18n/paraglide/messages'
import { useAppLayoutStore } from '@/shared/components/app-layout/app-layout-store'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

interface PayrollPageProps {
  initialTab?: PayrollTab
  initialSubTab?: ConfigSubTab
}

export function PayrollPage({
  initialTab = 'overview',
  initialSubTab = 'general',
}: PayrollPageProps) {
  const [activeTab, setActiveTab] = useState<PayrollTab>(initialTab)
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
    { id: 'overview', label: m.payroll_tab_overview(), icon: IconChartBar },
    { id: 'attendance', label: m.payroll_tab_attendance(), icon: IconCalendarStats },
    { id: 'configuration', label: m.payroll_tab_configuration(), icon: IconSettings },
    { id: 'process', label: m.payroll_tab_process(), icon: IconReportMoney },
    { id: 'approval', label: m.payroll_tab_approval(), icon: IconChecklist },
    { id: 'payslip', label: m.payroll_tab_payslip(), icon: IconFileText },
  ]

  let pageTitle = m.payroll_page_title()
  let pageSubtitle = m.payroll_page_subtitle()

  if (activeTab === 'process') {
    if (processView === 'create_wizard') {
      pageTitle = m.payroll_page_create_title()
      pageSubtitle = m.payroll_page_create_subtitle()
    } else if (processView === 'detail') {
      pageTitle = m.payroll_page_detail_title({ period: selectedRun?.period || '' })
      pageSubtitle = m.payroll_page_detail_subtitle({ code: selectedRun?.code || '' })
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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PayrollTab)}>
          <TabsList
            variant='line'
            aria-label={m.payroll_page_title()}
            className='h-auto max-w-full justify-start overflow-x-auto border-b border-border/80 pb-px'
          >
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className='flex-none rounded-none border-b-2 border-transparent px-4 py-2.5 text-xs font-bold after:hidden data-active:border-primary data-active:text-primary'
                >
                  <Icon data-icon='inline-start' />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      )}

      {/* ── Tab Content Views ──────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <PayrollOverviewTab
          onNavigateToProcess={handleNavigateToProcess}
          onNavigateToConfig={() => setActiveTab('configuration')}
        />
      )}

      {activeTab === 'configuration' && (
        <PayrollConfigTab key={initialSubTab} initialSubTab={initialSubTab} />
      )}

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
              onNavigateToApproval={() => {
                setActiveTab('approval')
                setProcessView('list')
              }}
            />
          )}
        </>
      )}

      {activeTab === 'attendance' && <AttendancePayrollTab />}

      {activeTab === 'approval' && (
        <PayrollApprovalTab runs={runs} onUpdateRuns={setRuns} />
      )}

      {activeTab === 'payslip' && <PayslipManagementTab />}
    </AppMain>
  )
}
