import {
  IconDots,
  IconLoader2,
  IconPlus,
  IconRotateClockwise,
  IconSearch,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { TablePagination } from '@/shared/components/ui/table-pagination'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'

import { ErrorLogDialog } from '../components/error-log-dialog'
import {
  ResetDefaultConfirmDialog,
  ResetDefaultSuccessDialog,
} from '../components/reset-default-dialog'
import { RunNowDialog } from '../components/run-now-dialog'
import { SchedulerJobFormDialog } from '../components/scheduler-job-form-dialog'
import { moduleBadgeColors } from '../data'
import {
  useCreateScheduledJob,
  useGetScheduledJobs,
  useGetSchedulerManagementStats,
  useResetAllSchedulersToDefault,
  useRetryScheduledJob,
  useToggleScheduledJobStatus,
  useUpdateScheduledJob,
} from '../hooks'
import type {
  CreateScheduledJobInput,
  ScheduledJob,
  SchedulerJobResult,
  SchedulerJobStatus,
  SchedulerModule,
} from '../types'

// ─── Stat Card Component ───────────────────────────────────────────────────

function StatCard({
  avatar,
  avatarBg,
  avatarText,
  label,
  value,
  sub,
}: Readonly<{
  avatar: string
  avatarBg: string
  avatarText: string
  label: string
  value: number | string
  sub?: string
}>) {
  return (
    <div className='flex items-start gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold',
          avatarBg,
          avatarText,
        )}
      >
        {avatar}
      </div>
      <div>
        <p className='text-xs font-medium text-muted-foreground'>{label}</p>
        <p className='mt-0.5 text-2xl font-bold tracking-tight'>{value}</p>
        {sub && <p className='mt-0.5 text-xs text-muted-foreground'>{sub}</p>}
      </div>
    </div>
  )
}

// ─── Status & Result Badges ───────────────────────────────────────────────

function JobStatusBadge({ status }: Readonly<{ status: SchedulerJobStatus }>) {
  if (status === 'active') {
    return (
      <span className='inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300'>
        Active
      </span>
    )
  }
  if (status === 'running') {
    return (
      <span className='inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300'>
        Running
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span className='inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300'>
        Failed
      </span>
    )
  }
  return (
    <span className='inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
      Inactive
    </span>
  )
}

function JobResultBadge({ result }: Readonly<{ result: SchedulerJobResult }>) {
  if (result === 'success') {
    return (
      <span className='inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300'>
        Success
      </span>
    )
  }
  if (result === 'running') {
    return (
      <span className='inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300'>
        Running
      </span>
    )
  }
  if (result === 'failed') {
    return (
      <span className='inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300'>
        Failed
      </span>
    )
  }
  return <span className='text-xs text-muted-foreground font-mono'>—</span>
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function SchedulerPage() {
  const { data: jobs = [], isLoading } = useGetScheduledJobs()
  const { data: stats } = useGetSchedulerManagementStats()

  const createMutation = useCreateScheduledJob()
  const updateMutation = useUpdateScheduledJob()
  const toggleMutation = useToggleScheduledJobStatus()
  const retryMutation = useRetryScheduledJob()
  const resetAllMutation = useResetAllSchedulersToDefault()

  // Filters
  const [search, setSearch] = useState('')
  const [filterModule, setFilterModule] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterFreq, setFilterFreq] = useState<string>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(7)

  // Dialogs
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [resetSuccessOpen, setResetSuccessOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ScheduledJob | undefined>()
  const [errorLogOpen, setErrorLogOpen] = useState(false)
  const [errorLogJob, setErrorLogJob] = useState<ScheduledJob | null>(null)
  const [runNowOpen, setRunNowOpen] = useState(false)
  const [runNowJob, setRunNowJob] = useState<ScheduledJob | null>(null)

  // Filter logic
  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.module.toLowerCase().includes(search.toLowerCase()) ||
      (j.description ?? '').toLowerCase().includes(search.toLowerCase())
    const matchModule = filterModule === 'all' || j.module === filterModule
    const matchStatus = filterStatus === 'all' || j.status === filterStatus
    const matchFreq =
      filterFreq === 'all' ||
      (filterFreq === 'daily' && j.frequency.toLowerCase().includes('daily')) ||
      (filterFreq === 'hourly' && j.frequency.toLowerCase().includes('hourly')) ||
      (filterFreq === 'monthly' && j.frequency.toLowerCase().includes('monthly')) ||
      (filterFreq === 'weekly' && j.frequency.toLowerCase().includes('weekly')) ||
      (filterFreq === '15min' && j.frequency.toLowerCase().includes('15 min'))
    return matchSearch && matchModule && matchStatus && matchFreq
  })

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((activePage - 1) * pageSize, activePage * pageSize)

  const handleClearFilters = () => {
    setSearch('')
    setFilterModule('all')
    setFilterStatus('all')
    setFilterFreq('all')
    setCurrentPage(1)
  }

  // Reset All default
  const handleConfirmResetAll = async () => {
    try {
      await resetAllMutation.mutateAsync()
      setResetConfirmOpen(false)
      setResetSuccessOpen(true)
    } catch {
      snackbar.error('Gagal mereset scheduler ke default.')
    }
  }

  // Toggle status
  const handleToggle = async (job: ScheduledJob) => {
    try {
      await toggleMutation.mutateAsync(job.id)
      snackbar.success(
        job.status === 'active'
          ? `Scheduler "${job.name}" dinonaktifkan.`
          : `Scheduler "${job.name}" diaktifkan.`,
      )
    } catch {
      snackbar.error('Gagal mengubah status scheduler.')
    }
  }

  // Retry job
  const handleRetry = async (job: ScheduledJob) => {
    try {
      await retryMutation.mutateAsync(job.id)
      snackbar.success(`Job "${job.name}" berhasil dijalankan ulang.`)
    } catch {
      snackbar.error('Gagal menjalankan ulang job.')
    }
  }

  // Add / Edit form submit
  const handleFormSubmit = async (data: CreateScheduledJobInput) => {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, input: data })
        snackbar.success('Scheduler berhasil diperbarui!')
      } else {
        await createMutation.mutateAsync(data)
        snackbar.success('Scheduler baru berhasil ditambahkan!')
      }
      setFormOpen(false)
      setEditTarget(undefined)
    } catch {
      snackbar.error('Gagal menyimpan scheduler.')
    }
  }

  const handleOpenEdit = (job: ScheduledJob) => {
    setEditTarget(job)
    setFormOpen(true)
  }

  const handleOpenErrorLog = (job: ScheduledJob) => {
    setErrorLogJob(job)
    setErrorLogOpen(true)
  }

  const handleOpenRunNow = (job: ScheduledJob) => {
    setRunNowJob(job)
    setRunNowOpen(true)
  }

  const allModulesList: SchedulerModule[] = [
    'Attendance',
    'Leave',
    'Payroll',
    'Employee',
    'Workflow',
    'System',
    'Overtime',
    'Claim',
    'Business Trip',
  ]

  return (
    <AppMain
      title='Scheduler Management'
      subtitle='Kelola proses otomatis HRIS, jadwal eksekusi, dan status job per modul.'
      breadcrumbs={[
        { to: '/', label: 'Dashboard' },
        { to: '/settings/scheduler', label: 'Scheduler' },
      ]}
      className='w-full max-w-full min-w-0 gap-6'
      actions={
        <div className='flex items-center gap-2.5'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setResetConfirmOpen(true)}
            className='gap-1.5 border-border bg-background text-xs font-semibold text-foreground shadow-xs hover:bg-muted'
          >
            <IconRotateClockwise size={15} />
            Reset Default
          </Button>

          <Button
            size='sm'
            onClick={() => {
              setEditTarget(undefined)
              setFormOpen(true)
            }}
            className='gap-1.5 bg-blue-600 text-xs font-semibold text-white shadow-xs hover:bg-blue-700'
          >
            <IconPlus size={15} />
            Add Scheduler
          </Button>
        </div>
      }
    >
      {/* ── Stat Cards ── */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          avatar='J'
          avatarBg='bg-blue-100 dark:bg-blue-950/50'
          avatarText='text-blue-700 dark:text-blue-300'
          label='Total Jobs'
          value={stats?.totalJobs ?? jobs.length}
          sub={`${stats?.totalModules ?? 12} HRIS modules`}
        />
        <StatCard
          avatar='A'
          avatarBg='bg-emerald-100 dark:bg-emerald-950/50'
          avatarText='text-emerald-700 dark:text-emerald-300'
          label='Active'
          value={stats?.active ?? jobs.filter((j) => j.status === 'active').length}
          sub={`${stats?.activePercentage ?? 84.6}% enabled`}
        />
        <StatCard
          avatar='R'
          avatarBg='bg-amber-100 dark:bg-amber-950/50'
          avatarText='text-amber-700 dark:text-amber-300'
          label='Running'
          value={stats?.running ?? jobs.filter((j) => j.status === 'running').length}
          sub={stats?.runningLabel ?? 'Device sync'}
        />
        <StatCard
          avatar='I'
          avatarBg='bg-red-100 dark:bg-red-950/50'
          avatarText='text-red-700 dark:text-red-300'
          label='Failed'
          value={stats?.failed ?? jobs.filter((j) => j.status === 'failed').length}
          sub={stats?.failedLabel ?? 'Needs attention'}
        />
      </div>

      {/* ── Filter Bar ── */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Search */}
        <div className='relative min-w-[240px] flex-1'>
          <IconSearch
            size={15}
            className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
          />
          <input
            type='text'
            placeholder='Search scheduler...'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className='h-9 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30'
          />
        </div>

        {/* Module filter */}
        <select
          value={filterModule}
          onChange={(e) => {
            setFilterModule(e.target.value)
            setCurrentPage(1)
          }}
          className='h-9 cursor-pointer rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30'
        >
          <option value='all'>Module · All</option>
          {allModulesList.map((m) => (
            <option key={m} value={m}>
              Module · {m}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value)
            setCurrentPage(1)
          }}
          className='h-9 cursor-pointer rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30'
        >
          <option value='all'>Status · All</option>
          <option value='active'>Status · Active</option>
          <option value='running'>Status · Running</option>
          <option value='inactive'>Status · Inactive</option>
          <option value='failed'>Status · Failed</option>
        </select>

        {/* Frequency filter */}
        <select
          value={filterFreq}
          onChange={(e) => {
            setFilterFreq(e.target.value)
            setCurrentPage(1)
          }}
          className='h-9 cursor-pointer rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30'
        >
          <option value='all'>Frequency · All</option>
          <option value='daily'>Frequency · Daily</option>
          <option value='hourly'>Frequency · Hourly</option>
          <option value='15min'>Frequency · Every 15 min</option>
          <option value='weekly'>Frequency · Weekly</option>
          <option value='monthly'>Frequency · Monthly</option>
        </select>

        {/* Clear filters */}
        {(search || filterModule !== 'all' || filterStatus !== 'all' || filterFreq !== 'all') && (
          <button
            type='button'
            onClick={handleClearFilters}
            className='text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400'
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Table Card ── */}
      <div className='overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-foreground/5'>
        <div className='flex items-center justify-between border-b border-border/50 px-6 py-4'>
          <div className='flex items-center gap-2.5'>
            <h3 className='text-sm font-bold text-foreground'>Scheduled Jobs</h3>
            <span className='rounded-full bg-blue-100/70 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'>
              {totalItems} total
            </span>
          </div>
          <span className='text-xs text-muted-foreground'>Last refreshed · 20:43</span>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full min-w-[960px] text-xs'>
            <thead>
              <tr className='border-b border-border/50 bg-muted/20 text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
                <th className='px-6 py-3.5 text-left'>SCHEDULER</th>
                <th className='px-4 py-3.5 text-left'>MODULE</th>
                <th className='px-4 py-3.5 text-left'>FREQUENCY</th>
                <th className='px-4 py-3.5 text-left'>LAST RUN</th>
                <th className='px-4 py-3.5 text-left'>NEXT RUN</th>
                <th className='px-4 py-3.5 text-left'>STATUS</th>
                <th className='px-4 py-3.5 text-left'>RESULT</th>
                <th className='px-6 py-3.5 text-center'>ACTION</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/35'>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className='py-16 text-center text-muted-foreground'>
                    <IconLoader2 className='mx-auto size-6 animate-spin text-primary' />
                    <p className='mt-2'>Memuat daftar scheduler...</p>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className='py-16 text-center text-muted-foreground'>
                    <p className='font-semibold text-foreground'>Tidak ada scheduler ditemukan</p>
                    <p className='mt-1 text-xs'>
                      Coba sesuaikan kata kunci pencarian atau filter modul
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((job) => (
                  <tr key={job.id} className='transition-colors hover:bg-muted/20'>
                    {/* Scheduler Name */}
                    <td className='px-6 py-4'>
                      <Link
                        to='/settings/scheduler/$id'
                        params={{ id: job.id }}
                        className='font-bold text-foreground transition-colors hover:text-blue-600'
                      >
                        {job.name}
                      </Link>
                    </td>

                    {/* Module */}
                    <td className='px-4 py-4'>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                          moduleBadgeColors[job.module],
                        )}
                      >
                        {job.module}
                      </span>
                    </td>

                    {/* Frequency */}
                    <td className='px-4 py-4 font-medium text-foreground'>{job.frequency}</td>

                    {/* Last Run */}
                    <td className='px-4 py-4 font-mono text-[11px] text-muted-foreground'>
                      {job.lastRun}
                    </td>

                    {/* Next Run */}
                    <td className='px-4 py-4 font-mono text-[11px] text-muted-foreground'>
                      {job.nextRun}
                    </td>

                    {/* Status */}
                    <td className='px-4 py-4'>
                      <JobStatusBadge status={job.status} />
                    </td>

                    {/* Result */}
                    <td className='px-4 py-4'>
                      <JobResultBadge result={job.result} />
                    </td>

                    {/* Action Dropdown Menu */}
                    <td className='px-6 py-4 text-center'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type='button'
                            title='Menu Aksi'
                            className='inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                          >
                            <IconDots size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-48 p-1.5'>
                          {/* View Detail */}
                          <DropdownMenuItem asChild>
                            <Link
                              to='/settings/scheduler/$id'
                              params={{ id: job.id }}
                              className='cursor-pointer text-xs font-medium'
                            >
                              View Detail
                            </Link>
                          </DropdownMenuItem>

                          {/* View Error Log */}
                          {(job.status === 'failed' || job.result === 'failed' || job.errorLog) && (
                            <DropdownMenuItem
                              onClick={() => handleOpenErrorLog(job)}
                              className='cursor-pointer rounded-lg bg-red-50 text-xs font-semibold text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300'
                            >
                              View Error Log
                            </DropdownMenuItem>
                          )}

                          {/* Retry Job / Run Now */}
                          {(job.status === 'failed' || job.status === 'running') ? (
                            <DropdownMenuItem
                              onClick={() => handleOpenRunNow(job)}
                              className='cursor-pointer rounded-lg bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300'
                            >
                              Retry Job
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleOpenRunNow(job)}
                              className='cursor-pointer text-xs font-medium'
                            >
                              Run Now
                            </DropdownMenuItem>
                          )}

                          {/* Edit Scheduler */}
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(job)}
                            className='cursor-pointer text-xs font-medium'
                          >
                            Edit Scheduler
                          </DropdownMenuItem>

                          {/* Execution History */}
                          <DropdownMenuItem asChild>
                            <Link
                              to='/settings/scheduler/$id'
                              params={{ id: job.id }}
                              className='cursor-pointer text-xs font-medium'
                            >
                              Execution History
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* Disable / Enable Scheduler */}
                          <DropdownMenuItem
                            onClick={() => handleToggle(job)}
                            className={cn(
                              'cursor-pointer text-xs font-semibold',
                              job.status === 'active'
                                ? 'text-red-600 hover:text-red-700 dark:text-red-400'
                                : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400',
                            )}
                          >
                            {job.status === 'active' ? 'Disable Scheduler' : 'Enable Scheduler'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='flex items-center justify-between border-t border-border/50 px-6 py-3.5'>
          <p className='text-xs text-muted-foreground'>
            Showing {(activePage - 1) * pageSize + 1}–
            {Math.min(activePage * pageSize, totalItems)} of {totalItems} schedulers
          </p>
          <div className='flex items-center gap-1.5'>
            <button
              type='button'
              disabled={activePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className='flex size-7 items-center justify-center rounded-lg border border-border text-xs transition-colors hover:bg-muted disabled:opacity-40'
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type='button'
                onClick={() => setCurrentPage(idx + 1)}
                className={cn(
                  'flex size-7 items-center justify-center rounded-lg text-xs font-semibold transition-colors',
                  activePage === idx + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-border hover:bg-muted text-muted-foreground',
                )}
              >
                {idx + 1}
              </button>
            ))}
            <button
              type='button'
              disabled={activePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className='flex size-7 items-center justify-center rounded-lg border border-border text-xs transition-colors hover:bg-muted disabled:opacity-40'
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ── Dialog Modals ── */}
      <ResetDefaultConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        onConfirm={handleConfirmResetAll}
        isPending={resetAllMutation.isPending}
      />

      <ResetDefaultSuccessDialog
        open={resetSuccessOpen}
        onOpenChange={setResetSuccessOpen}
        totalRestored={stats?.totalJobs ?? 26}
      />

      <SchedulerJobFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editTarget}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <ErrorLogDialog open={errorLogOpen} onOpenChange={setErrorLogOpen} job={errorLogJob} />

      <RunNowDialog
        open={runNowOpen}
        onOpenChange={setRunNowOpen}
        job={runNowJob}
        onSuccess={() => {
          if (runNowJob) {
            retryMutation.mutate(runNowJob.id)
          }
        }}
      />
    </AppMain>
  )
}
