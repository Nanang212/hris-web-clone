// master-data-dashboard-page.tsx
import {
  IconBuildingStore,
  IconBriefcase,
  IconAward,
  IconClock,
  IconCalendarEvent,
  IconPlaneDeparture,
  IconCoin,
  IconFileSpreadsheet,
  IconArrowRight,
  IconGitBranch,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { useMasterDataStats } from '../hooks'

export function MasterDataDashboardPage() {
  const { data: stats, isPending, error } = useMasterDataStats()
  const [currentPage, setCurrentPage] = useState(1)

  const cardsPerPage = 6

  const cardConfig = [
    {
      title: 'Department',
      count: stats?.departmentsCount ?? 0,
      description: 'Struktur departemen utama organisasi perusahaan.',
      to: '/settings/master-data/departments' as const,
      icon: IconBuildingStore,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100/50 dark:bg-blue-900/30',
    },
    {
      title: 'Division',
      count: stats?.divisionsCount ?? 0,
      description: 'Divisi atau tim kerja spesifik di bawah departemen.',
      to: '/settings/master-data/divisions' as const,
      icon: IconGitBranch,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100/50 dark:bg-purple-900/30',
    },
    {
      title: 'Position',
      count: stats?.positionsCount ?? 0,
      description: 'Daftar nama jabatan dan deskripsi tugas karyawan.',
      to: '/settings/master-data/positions' as const,
      icon: IconBriefcase,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100/50 dark:bg-emerald-900/30',
    },
    {
      title: 'Grade / Level',
      count: stats?.gradesCount ?? 0,
      description: 'Golongan jabatan, batasan gaji pokok, dan benefit.',
      to: '/settings/master-data/grades' as const,
      icon: IconAward,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100/50 dark:bg-amber-900/30',
    },
    {
      title: 'Shift Kerja',
      count: stats?.shiftsCount ?? 0,
      description: 'Jadwal jam kerja standar, toleransi, dan hari libur.',
      to: '/settings/master-data/shifts' as const,
      icon: IconClock,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-100/50 dark:bg-cyan-900/30',
    },
    {
      title: 'Hari Libur (Holiday)',
      count: stats?.holidaysCount ?? 0,
      description: 'Kalender hari libur nasional dan kebijakan kantor.',
      to: '/settings/master-data/holidays' as const,
      icon: IconCalendarEvent,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100/50 dark:bg-red-900/30',
    },
    {
      title: 'Tipe Cuti (Leave Type)',
      count: stats?.leaveTypesCount ?? 0,
      description: 'Jenis pengajuan cuti, kuota, dan hak hari libur.',
      to: '/settings/master-data/leave-types' as const,
      icon: IconPlaneDeparture,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-100/50 dark:bg-indigo-900/30',
    },
    {
      title: 'Komponen Payroll',
      count: stats?.payrollComponentsCount ?? 0,
      description: 'Komponen pendapatan gaji pokok, tunjangan, dan denda.',
      to: '/settings/master-data/payroll-components' as const,
      icon: IconCoin,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-100/50 dark:bg-rose-900/30',
    },
  ]

  const totalPages = Math.ceil(cardConfig.length / cardsPerPage)
  const paginatedCards = cardConfig.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage)

  return (
    <AppMain
      pending={isPending}
      error={error}
      breadcrumbs={[
        { to: '/', label: 'Pengaturan' },
        { to: '.', label: 'Master Data' },
      ]}
      title='Master Data'
      subtitle='Kelola data referensi utama sistem HRIS'
      actions={
        <div className='flex items-center gap-2'>
          <Link
            to='/settings/master-data/import'
            className='inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90'
          >
            <IconFileSpreadsheet size={16} />
            Import Master Data
          </Link>
        </div>
      }
    >
      {/* Top Stats Overview */}
      <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {[
          { label: 'Total Department', count: stats?.departmentsCount ?? 0, color: 'text-blue-600' },
          { label: 'Total Division', count: stats?.divisionsCount ?? 0, color: 'text-purple-600' },
          { label: 'Total Position', count: stats?.positionsCount ?? 0, color: 'text-emerald-600' },
          { label: 'Total Grade / Level', count: stats?.gradesCount ?? 0, color: 'text-amber-600' },
        ].map((item, idx) => (
          <div
            key={idx}
            className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'
          >
            <p className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase'>
              {item.label}
            </p>
            <p className={`mt-2 text-3xl font-extrabold ${item.color}`}>
              {item.count}
            </p>
          </div>
        ))}
      </div>

      {/* Main Grid of Paginated Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {paginatedCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <Link
              key={idx}
              to={card.to}
              className='group flex flex-col justify-between rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 transition-all hover:shadow-md hover:ring-primary/20 min-h-[160px]'
            >
              <div>
                <div className='flex items-center justify-between'>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.bg}`}>
                    <Icon size={22} className={card.color} />
                  </div>
                  <span className='rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground'>
                    {card.count} Data
                  </span>
                </div>
                <h3 className='mt-4 text-sm font-bold text-foreground group-hover:text-primary transition-colors'>
                  {card.title}
                </h3>
                <p className='mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2'>
                  {card.description}
                </p>
              </div>
              <div className='mt-5 flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline'>
                Kelola Data
                <IconArrowRight size={14} className='transition-transform group-hover:translate-x-0.5' />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className='mt-6 flex items-center justify-center gap-2'>
          <button
            type='button'
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className='flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:hover:bg-card'
          >
            <IconChevronLeft size={16} />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type='button'
              onClick={() => setCurrentPage(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                currentPage === page
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type='button'
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className='flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:hover:bg-card'
          >
            <IconChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Tools Section */}
      <div className='mt-6 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
        <h3 className='text-sm font-bold text-foreground'>Alat & Utilitas</h3>
        <p className='text-xs text-muted-foreground'>Gunakan tools di bawah ini untuk mempercepat konfigurasi master data.</p>
        <div className='mt-4 flex flex-wrap gap-3'>
          <Link
            to='/settings/master-data/import'
            className='rounded-xl border border-border px-4 py-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted'
          >
            Import Excel / CSV
          </Link>
          <div className='rounded-xl border border-border px-4 py-3 text-xs text-muted-foreground'>
            Dependency check: <span className='font-semibold text-emerald-600'>Aktif</span>
          </div>
        </div>
      </div>
    </AppMain>
  )
}
