import {
  IconArrowRight,
  IconCalendarCheck,
  IconCalendarWeek,
  IconClockHour4,
  IconPlaneTilt,
  IconReceiptTax,
  IconReportMoney,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { ReportCategoryKey } from '../types'

export interface ReportCenterHubProps {
  onSelectCategory: (category: ReportCategoryKey) => void
}

export function ReportCenterHub({ onSelectCategory }: ReportCenterHubProps) {
  const reportCards = [
    {
      key: 'attendance' as ReportCategoryKey,
      title: 'Attendance Report',
      titleId: 'Laporan Kehadiran & Absensi',
      description:
        'Pantau tingkat kehadiran harian, keterlambatan, absensi, dan jam kerja efektif seluruh departemen.',
      statHighlight: '94.2%',
      statLabel: 'Rata-rata Kehadiran',
      trend: '+1.4% vs bulan lalu',
      icon: IconCalendarCheck,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'hover:border-blue-500/50',
    },
    {
      key: 'payroll' as ReportCategoryKey,
      title: 'Payroll Report',
      titleId: 'Laporan Gaji & Kompensasi',
      description:
        'Rekapitulasi gaji pokok, tunjangan, potongan pajak, BPJS Ketenagakerjaan/Kesehatan, dan net payout.',
      statHighlight: 'Rp 5.57 M',
      statLabel: 'Total Net Payout (Agu 2026)',
      trend: '1,246 Pegawai diproses',
      icon: IconReportMoney,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'hover:border-emerald-500/50',
    },
    {
      key: 'leave' as ReportCategoryKey,
      title: 'Leave Report',
      titleId: 'Laporan Cuti & Izin',
      description:
        'Laporan utilisasi cuti tahunan, sakit, izin khusus, dan tracking sisa saldo cuti per karyawan.',
      statHighlight: '1,284',
      statLabel: 'Total Pengajuan Cuti (YTD)',
      trend: '3,420 hari diambil',
      icon: IconCalendarWeek,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'hover:border-amber-500/50',
    },
    {
      key: 'employee' as ReportCategoryKey,
      title: 'Employee & Demographics',
      titleId: 'Laporan Karyawan & Demografi',
      description:
        'Distribusi karyawan tetap, kontrak, probasi, sebaran usia/gender, masa kerja, dan rasio turnover.',
      statHighlight: '1,246',
      statLabel: 'Karyawan Aktif',
      trend: 'Turnover rendah (2.4%)',
      icon: IconUsers,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'hover:border-indigo-500/50',
    },
    {
      key: 'overtime' as ReportCategoryKey,
      title: 'Overtime Report',
      titleId: 'Laporan Lembur & Upah',
      description:
        'Analisis jam lembur weekday vs weekend, biaya kompensasi lembur, dan alokasi cost center.',
      statHighlight: '4,584 Jam',
      statLabel: 'Total Jam Lembur (Rp 412 Jt)',
      trend: '235 Pegawai berpartisipasi',
      icon: IconClockHour4,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      border: 'hover:border-violet-500/50',
    },
    {
      key: 'travel_expense' as ReportCategoryKey,
      title: 'Travel & Expense Report',
      titleId: 'Laporan Klaim & Dinas',
      description:
        'Realisasi pengeluaran klaim operasional, voucher reimbursement, dan total budget perjalanan dinas SPPD.',
      statHighlight: 'Rp 512.8 Jt',
      statLabel: 'Realisasi Dinas & Klaim',
      trend: '44 Perjalanan & 178 Klaim',
      icon: IconReceiptTax,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'hover:border-rose-500/50',
    },
  ]

  return (
    <div className='space-y-6'>
      {/* Overview Banner */}
      <div className='relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 sm:p-8 shadow-sm'>
        <div className='max-w-2xl space-y-2'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary'>
            <IconTrendingUp size={14} />
            Analytics & Executive Intelligence
          </span>
          <h2 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
            HRIS Centralized Reporting Hub
          </h2>
          <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
            Akses seluruh laporan analitik SDM, kehadiran, kompensasi gaji, sisa saldo cuti, jam lembur, serta audit biaya operasional dalam satu dashboard terintegrasi.
          </p>
        </div>
      </div>

      {/* Grid of Report Category Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {reportCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.key}
              onClick={() => onSelectCategory(card.key)}
              className={cn(
                'group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
                card.border,
              )}
            >
              <div>
                {/* Header Icon + Title */}
                <div className='flex items-start justify-between gap-3 mb-4'>
                  <div
                    className={cn(
                      'flex size-12 items-center justify-center rounded-2xl shrink-0 transition-transform group-hover:scale-105',
                      card.bg,
                      card.color,
                    )}
                  >
                    <Icon size={24} />
                  </div>
                  <span className='text-[10px] font-bold text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded-full uppercase'>
                    {card.key.replace('_', ' ')}
                  </span>
                </div>

                <h3 className='text-base font-bold text-foreground group-hover:text-primary transition-colors'>
                  {card.title}
                </h3>
                <p className='text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed'>
                  {card.description}
                </p>

                {/* Key Metric Highlight */}
                <div className='mt-5 p-3.5 rounded-2xl bg-muted/25 border border-border/50'>
                  <p className='text-[11px] font-semibold text-muted-foreground'>{card.statLabel}</p>
                  <div className='flex items-baseline justify-between mt-0.5'>
                    <span className='text-xl font-extrabold text-foreground'>{card.statHighlight}</span>
                    <span className='text-[10px] font-bold text-primary'>{card.trend}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className='mt-6 pt-4 border-t border-border/50 flex items-center justify-between'>
                <span className='text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform'>
                  Buka Laporan
                  <IconArrowRight size={14} />
                </span>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectCategory(card.key)
                  }}
                  className='rounded-xl h-8 px-3 text-xs font-semibold'
                >
                  Lihat Detail
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
