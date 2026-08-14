import { IconCheck, IconClock, IconSearch, IconX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

import { useApprovalMatrix } from '../hooks'
import { moduleColors, moduleLabels } from '../data'
import type { MatrixEntry, ModuleType } from '../types'

type EntryStatus = MatrixEntry['status']

const statusConfig: Record<EntryStatus, { label: string; cls: string; icon: typeof IconCheck }> = {
  pending: {
    label: 'Menunggu',
    cls: 'bg-muted text-muted-foreground',
    icon: IconClock,
  },
  in_progress: {
    label: 'Proses',
    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    icon: IconClock,
  },
  approved: {
    label: 'Disetujui',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: IconCheck,
  },
  rejected: {
    label: 'Ditolak',
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    icon: IconX,
  },
}

function LevelProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className='flex items-center gap-1.5'>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full',
            i < current
              ? 'bg-primary'
              : i === current - 1 && current < total
                ? 'bg-primary/60'
                : 'bg-muted',
          )}
        />
      ))}
      <span className='ml-1 text-[10px] text-muted-foreground'>
        {current}/{total}
      </span>
    </div>
  )
}

export function ApprovalMatrixPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<EntryStatus | 'all'>('all')
  const [filterModule, setFilterModule] = useState<ModuleType | 'all'>('all')

  const { data: entries, isPending, error } = useApprovalMatrix()

  if (isPending || error || !entries) {
    return <AppMain pending={isPending} error={error} notFound={!entries} />
  }

  const filtered = entries.filter((e) => {
    const matchSearch =
      e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      e.workflowName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    const matchModule = filterModule === 'all' || e.requestType === filterModule
    return matchSearch && matchStatus && matchModule
  })

  const totalPending = entries.filter((e) => e.status === 'pending').length
  const totalInProgress = entries.filter((e) => e.status === 'in_progress').length
  const totalApproved = entries.filter((e) => e.status === 'approved').length
  const totalRejected = entries.filter((e) => e.status === 'rejected').length

  return (
    <AppMain
      backTo='/settings/approval-workflow'
      breadcrumbs={[
        { to: '/', label: 'Pengaturan' },
        { to: '/settings/approval-workflow', label: 'Approval Workflow' },
        { to: '.', label: 'Matrix' },
      ]}
      title={'Approval Matrix'}
      subtitle={'Pantau status seluruh pengajuan yang sedang berjalan'}
      actions={
        <Button size='sm' asChild>
          <Link to='/settings/approval-workflow'>Kelola Workflow</Link>
        </Button>
      }
    >
      {/* Stats bar */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {[
          {
            label: 'Menunggu',
            count: totalPending,
            cls: 'text-muted-foreground',
            bg: 'bg-muted/60',
          },
          {
            label: 'Sedang Proses',
            count: totalInProgress,
            cls: 'text-blue-700 dark:text-blue-400',
            bg: 'bg-blue-100 dark:bg-blue-900/40',
          },
          {
            label: 'Disetujui',
            count: totalApproved,
            cls: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-900/40',
          },
          {
            label: 'Ditolak',
            count: totalRejected,
            cls: 'text-red-700 dark:text-red-400',
            bg: 'bg-red-100 dark:bg-red-900/40',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className='flex flex-col gap-1 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5'
          >
            <span className='text-xs text-muted-foreground'>{stat.label}</span>
            <span className={cn('text-2xl font-bold', stat.cls)}>{stat.count}</span>
            <div className={cn('h-1 w-8 rounded-full', stat.bg)} />
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className='rounded-2xl bg-card shadow-sm ring-1 ring-foreground/5'>
        {/* Filters */}
        <div className='flex flex-col gap-3 border-b border-border/50 p-5 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h3 className='text-sm font-semibold'>Daftar Pengajuan</h3>
            <p className='text-xs text-muted-foreground'>
              {filtered.length} dari {entries.length} pengajuan
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {/* Search */}
            <div className='relative'>
              <IconSearch
                size={14}
                className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
              />
              <input
                type='text'
                placeholder='Cari karyawan...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='h-8 rounded-lg border border-border bg-background pr-3 pl-8 text-xs focus:ring-2 focus:ring-ring/50 focus:outline-none'
              />
            </div>
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as EntryStatus | 'all')}
              className='h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-none'
            >
              <option value='all'>Semua Status</option>
              <option value='pending'>Menunggu</option>
              <option value='in_progress'>Proses</option>
              <option value='approved'>Disetujui</option>
              <option value='rejected'>Ditolak</option>
            </select>
            {/* Module Filter */}
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value as ModuleType | 'all')}
              className='h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-none'
            >
              <option value='all'>Semua Modul</option>
              {Object.entries(moduleLabels).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border/50 bg-muted/30'>
                <th className='py-3 pr-3 pl-5 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Karyawan
                </th>
                <th className='px-3 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Tipe
                </th>
                <th className='px-3 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Workflow
                </th>
                <th className='px-3 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Progress Level
                </th>
                <th className='px-3 py-3 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Hari
                </th>
                <th className='px-3 py-3 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className='py-16 text-center text-sm text-muted-foreground'>
                    Tidak ada data yang ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => {
                  const status = statusConfig[entry.status]
                  const StatusIcon = status.icon
                  const moduleCls =
                    moduleColors[entry.requestType] ?? 'bg-muted text-muted-foreground'

                  return (
                    <tr
                      key={entry.id}
                      className='border-b border-border/50 transition-colors hover:bg-muted/30'
                    >
                      <td className='py-3.5 pr-3 pl-5'>
                        <div className='flex items-center gap-2.5'>
                          <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                            {entry.employeeName.charAt(0)}
                          </div>
                          <div>
                            <p className='text-xs font-semibold'>{entry.employeeName}</p>
                            <p className='text-[11px] text-muted-foreground'>
                              {entry.department} · {entry.position}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-3 py-3.5'>
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-medium',
                            moduleCls,
                          )}
                        >
                          {moduleLabels[entry.requestType]}
                        </span>
                      </td>
                      <td className='px-3 py-3.5'>
                        <p className='text-xs font-medium'>{entry.workflowName}</p>
                      </td>
                      <td className='px-3 py-3.5'>
                        <div className='w-32'>
                          <LevelProgressBar
                            current={entry.currentLevel}
                            total={entry.totalLevels}
                          />
                        </div>
                      </td>
                      <td className='px-3 py-3.5 text-center'>
                        <span
                          className={cn(
                            'text-xs font-medium',
                            entry.daysElapsed > 3
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-foreground',
                          )}
                        >
                          {entry.daysElapsed}h
                          {entry.daysElapsed > 3 && (
                            <span className='ml-1 text-[10px] text-red-500'>!</span>
                          )}
                        </span>
                      </td>
                      <td className='px-3 py-3.5 text-center'>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            status.cls,
                          )}
                        >
                          <StatusIcon size={10} stroke={2.5} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className='border-t border-border/50 px-5 py-3.5'>
          <p className='text-xs text-muted-foreground'>
            Data diperbarui secara real-time. Pengajuan dengan waktu &gt; 3 hari ditandai merah.
          </p>
        </div>
      </div>
    </AppMain>
  )
}
