import {
  IconArrowLeft,
  IconCalendarCheck,
  IconCalendarWeek,
  IconClockHour4,
  IconLayoutGrid,
  IconPlaneTilt,
  IconReceiptTax,
  IconReportAnalytics,
  IconReportMoney,
  IconUsers,
} from '@tabler/icons-react'
import { useState } from 'react'
import { AttendanceReportTab } from './components/attendance-report-tab'
import { EmployeeReportTab } from './components/employee-report-tab'
import { LeaveReportTab } from './components/leave-report-tab'
import { OvertimeReportTab } from './components/overtime-report-tab'
import { PayrollReportTab } from './components/payroll-report-tab'
import { ReportCenterHub } from './components/report-center-hub'
import { TravelExpenseReportTab } from './components/travel-expense-report-tab'
import type { ReportCategoryKey } from './types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'

export function ReportPage() {
  const [activeTab, setActiveTab] = useState<ReportCategoryKey>('hub')

  const tabList = [
    { key: 'hub' as ReportCategoryKey, label: 'Report Center', icon: IconLayoutGrid },
    { key: 'attendance' as ReportCategoryKey, label: 'Attendance', icon: IconCalendarCheck },
    { key: 'payroll' as ReportCategoryKey, label: 'Payroll', icon: IconReportMoney },
    { key: 'leave' as ReportCategoryKey, label: 'Leave', icon: IconCalendarWeek },
    { key: 'employee' as ReportCategoryKey, label: 'Employee', icon: IconUsers },
    { key: 'overtime' as ReportCategoryKey, label: 'Overtime', icon: IconClockHour4 },
    { key: 'travel_expense' as ReportCategoryKey, label: 'Travel & Expense', icon: IconReceiptTax },
  ]

  const getPageTitle = () => {
    switch (activeTab) {
      case 'attendance':
        return 'Attendance Report'
      case 'payroll':
        return 'Payroll Report'
      case 'leave':
        return 'Leave & Time-Off Report'
      case 'employee':
        return 'Employee & Demographics Report'
      case 'overtime':
        return 'Overtime & Compensation Report'
      case 'travel_expense':
        return 'Travel & Expense Report'
      default:
        return 'Executive Report Center'
    }
  }

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'attendance':
        return 'Laporan analitik presensi harian, rasio kehadiran, keterlambatan, dan absensi per departemen.'
      case 'payroll':
        return 'Rekapitulasi beban gaji kotor, tunjangan, potongan PPh21, BPJS, dan net payroll transfer.'
      case 'leave':
        return 'Utilisasi kuota cuti tahunan, cuti sakit, izin khusus, dan tracking sisa saldo hak cuti pegawai.'
      case 'employee':
        return 'Statistik demografi, komposisi status PKWTT/PKWT/Probasi, sebaran gender, dan turnover karyawan.'
      case 'overtime':
        return 'Analisis beban jam kerja lembur weekday vs weekend serta realisasi biaya upah lembur.'
      case 'travel_expense':
        return 'Realisasi klaim operasional reimbursement dan monitoring penyerapan anggaran perjalanan dinas SPPD.'
      default:
        return 'Pusat laporan analitik terpadu SDM, kehadiran, kompensasi, saldo cuti, dan operasional perusahaan.'
    }
  }

  return (
    <div className='p-6 space-y-6 max-w-[1600px] mx-auto w-full'>
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/80 pb-5'>
        <div>
          <div className='flex items-center gap-2.5'>
            {activeTab !== 'hub' && (
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={() => setActiveTab('hub')}
                className='size-9 rounded-xl text-muted-foreground hover:text-foreground shrink-0'
                title='Kembali ke Report Center'
              >
                <IconArrowLeft size={16} />
              </Button>
            )}
            <div className='flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0'>
              <IconReportAnalytics size={22} />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-xl font-bold tracking-tight text-foreground'>
                  {getPageTitle()}
                </h1>
                {activeTab !== 'hub' && (
                  <Badge variant='outline' className='rounded-full text-[10px] font-bold px-2 py-0.2 uppercase bg-primary/10 text-primary border-primary/20'>
                    Live Report
                  </Badge>
                )}
              </div>
              <p className='text-xs text-muted-foreground mt-0.5 max-w-3xl'>
                {getPageSubtitle()}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Buttons */}
        <div className='flex items-center gap-1 p-1 rounded-2xl bg-muted/40 border border-border/80 shrink-0 overflow-x-auto max-w-full'>
          {tabList.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type='button'
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-card text-foreground shadow-xs border border-border/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-primary' : ''} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Active Tab View ───────────────────────────────────────────────── */}
      {activeTab === 'hub' && <ReportCenterHub onSelectCategory={setActiveTab} />}
      {activeTab === 'attendance' && <AttendanceReportTab />}
      {activeTab === 'payroll' && <PayrollReportTab />}
      {activeTab === 'leave' && <LeaveReportTab />}
      {activeTab === 'employee' && <EmployeeReportTab />}
      {activeTab === 'overtime' && <OvertimeReportTab />}
      {activeTab === 'travel_expense' && <TravelExpenseReportTab />}
    </div>
  )
}
