import {
  IconAlertTriangle,
  IconArrowRight,
  IconFileText,
  IconLoader2,
  IconPlayerPlay,
} from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { snackbar } from '@/shared/lib/snackbar'

import { ErrorLogDialog } from '../components/error-log-dialog'
import { RunNowDialog } from '../components/run-now-dialog'
import { SchedulerJobFormDialog } from '../components/scheduler-job-form-dialog'
import {
  useGetExecutionRecords,
  useGetScheduledJobById,
  useUpdateScheduledJob,
} from '../hooks'
import type { CreateScheduledJobInput } from '../types'

interface SchedulerDetailPageProps {
  scheduleId: string
}

export function SchedulerDetailPage({ scheduleId }: Readonly<SchedulerDetailPageProps>) {
  const navigate = useNavigate()

  const { data: job, isLoading, refetch } = useGetScheduledJobById(scheduleId)
  const { data: executionRecords = [] } = useGetExecutionRecords(scheduleId)
  const updateMutation = useUpdateScheduledJob()

  const [editOpen, setEditOpen] = useState(false)
  const [runNowOpen, setRunNowOpen] = useState(false)
  const [errorLogOpen, setErrorLogOpen] = useState(false)
  const [showHistorySection, setShowHistorySection] = useState(true)

  if (isLoading) {
    return (
      <AppMain title='Memuat Scheduler...' backTo='/settings/scheduler'>
        <div className='flex h-64 items-center justify-center'>
          <IconLoader2 className='size-8 animate-spin text-primary' />
        </div>
      </AppMain>
    )
  }

  if (!job) {
    return (
      <AppMain title='Scheduler Tidak Ditemukan' backTo='/settings/scheduler'>
        <div className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
          <p className='text-muted-foreground'>
            Scheduler dengan ID &quot;{scheduleId}&quot; tidak ditemukan.
          </p>
          <Button variant='outline' asChild>
            <Link to='/settings/scheduler'>Kembali ke Daftar Scheduler</Link>
          </Button>
        </div>
      </AppMain>
    )
  }

  const handleEditSubmit = async (data: CreateScheduledJobInput) => {
    try {
      await updateMutation.mutateAsync({ id: job.id, input: data })
      snackbar.success('Scheduler berhasil diperbarui!')
      setEditOpen(false)
    } catch {
      snackbar.error('Gagal memperbarui scheduler.')
    }
  }

  const schedulerCode = `SCH-${job.module.substring(0, 3).toUpperCase()}-001`
  const latestRun = executionRecords[0]
  const isJobFailed = job.result === 'failed' || job.status === 'failed' || latestRun?.result === 'Failed'

  return (
    <AppMain
      title={job.name}
      subtitle={`${job.module} · Scheduler ID ${schedulerCode}`}
      breadcrumbs={[
        { to: '/', label: 'Dashboard' },
        { to: '/settings/scheduler', label: 'Scheduler Management' },
        { to: '.', label: job.name },
      ]}
      backTo='/settings/scheduler'
      className='w-full max-w-full min-w-0 gap-6'
      actions={
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            asChild
            className='text-xs font-semibold'
          >
            <Link
              to='/settings/scheduler/$id/history'
              params={{ id: job.id }}
            >
              Execution History
            </Link>
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => setEditOpen(true)}
            className='text-xs font-semibold'
          >
            Edit
          </Button>

          <Button
            size='sm'
            onClick={() => setRunNowOpen(true)}
            className='gap-1.5 bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700'
          >
            <IconPlayerPlay size={14} className='fill-white' />
            Run Now
          </Button>
        </div>
      }
    >
      {/* ── 4 Stat Cards (Matching Screenshot) ── */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {/* Module */}
        <div className='flex flex-col justify-between rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
          <div>
            <p className='text-xs font-medium text-muted-foreground'>Module</p>
            <p className='mt-1 text-2xl font-bold tracking-tight text-foreground'>{job.module}</p>
          </div>
          <div className='mt-3'>
            <span className='inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'>
              Configured
            </span>
          </div>
        </div>

        {/* Frequency */}
        <div className='flex flex-col justify-between rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
          <div>
            <p className='text-xs font-medium text-muted-foreground'>Frequency</p>
            <p className='mt-1 text-2xl font-bold tracking-tight text-foreground'>
              {job.frequency}
            </p>
          </div>
          <div className='mt-3'>
            <span className='inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'>
              Configured
            </span>
          </div>
        </div>

        {/* Next Run */}
        <div className='flex flex-col justify-between rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
          <div>
            <p className='text-xs font-medium text-muted-foreground'>Next Run</p>
            <p className='mt-1 text-2xl font-bold tracking-tight text-foreground'>
              {job.nextRun}
            </p>
          </div>
          <div className='mt-3'>
            <span className='inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'>
              Configured
            </span>
          </div>
        </div>

        {/* Last Result */}
        <div className='flex flex-col justify-between rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
          <div>
            <p className='text-xs font-medium text-muted-foreground'>Last Result</p>
            <p className='mt-1 text-2xl font-bold tracking-tight text-foreground capitalize'>
              {isJobFailed ? 'Failed' : job.result}
            </p>
          </div>
          <div className='mt-3'>
            {isJobFailed ? (
              <span className='inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900'>
                Attention
              </span>
            ) : (
              <span className='inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'>
                Healthy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 2 Column Grid (Matching Screenshot) ── */}
      <div className='grid gap-6 lg:grid-cols-[1fr_360px]'>
        {/* Left Card: Scheduler Information */}
        <Card className='rounded-2xl shadow-sm ring-1 ring-foreground/5'>
          <CardHeader className='border-b border-border/50 pb-4'>
            <CardTitle className='text-base font-bold text-foreground'>
              Scheduler Information
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='divide-y divide-border/40 text-xs'>
              <div className='grid grid-cols-[160px_1fr] px-6 py-4'>
                <span className='text-muted-foreground'>Description</span>
                <span className='text-foreground font-medium'>
                  {job.description || 'Memproses rekonsiliasi presensi harian seluruh karyawan aktif.'}
                </span>
              </div>

              <div className='grid grid-cols-[160px_1fr] px-6 py-4'>
                <span className='text-muted-foreground'>Trigger type</span>
                <span className='text-foreground font-medium'>Scheduled · Cron</span>
              </div>

              <div className='grid grid-cols-[160px_1fr] px-6 py-4'>
                <span className='text-muted-foreground'>Timezone</span>
                <span className='text-foreground font-medium'>Asia/Jakarta (WIB)</span>
              </div>

              <div className='grid grid-cols-[160px_1fr] px-6 py-4'>
                <span className='text-muted-foreground'>Retry policy</span>
                <span className='text-foreground font-medium'>
                  {job.retryPolicy ?? '3 attempts · exponential backoff'}
                </span>
              </div>

              <div className='grid grid-cols-[160px_1fr] px-6 py-4'>
                <span className='text-muted-foreground'>Created by</span>
                <span className='text-foreground font-medium'>Super Admin</span>
              </div>

              <div className='grid grid-cols-[160px_1fr] px-6 py-4'>
                <span className='text-muted-foreground'>Last updated</span>
                <span className='text-foreground font-medium'>05 Sep 2026 - 19:42</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Card: Latest Execution */}
        <Card className='rounded-2xl shadow-sm ring-1 ring-foreground/5'>
          <CardHeader className='border-b border-border/50 pb-4'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base font-bold text-foreground'>
                Latest Execution
              </CardTitle>
              {isJobFailed ? (
                <span className='inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-300'>
                  Failed
                </span>
              ) : (
                <span className='inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300'>
                  Success
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className='pt-5 space-y-4 text-xs'>
            <div>
              <p className='text-sm font-bold text-foreground'>
                {latestRun?.startedAt || job.lastRun || '05 Sep 2026 · 01:02'}
              </p>
              <p className='mt-0.5 text-muted-foreground'>
                Duration {latestRun?.duration || '1m 48s'} · {(latestRun?.processed || 1248).toLocaleString()} employees processed
              </p>
            </div>

            {/* Execution Result Box */}
            <div className='rounded-2xl border border-border/70 bg-muted/25 p-4'>
              <p className='text-muted-foreground font-medium'>Execution result</p>
              <p className='mt-1 text-2xl font-bold tracking-tight text-foreground'>
                {isJobFailed
                  ? `${latestRun?.processed || 802} / ${(latestRun?.totalRecords || 1241).toLocaleString()} processed`
                  : `${(latestRun?.processed || 1248).toLocaleString()} processed`}
              </p>
              <p className='mt-0.5 text-muted-foreground'>
                {isJobFailed
                  ? `${latestRun?.failed || 1} failed · ${job.errorLog?.code || 'ATTENDANCE_PROCESSING_ERROR'}`
                  : '0 failed · 6 warnings'}
              </p>
            </div>

            {isJobFailed ? (
              <div className='flex flex-col gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    if (job.errorLog) {
                      setErrorLogOpen(true)
                    } else if (latestRun) {
                      navigate({
                        to: '/settings/scheduler/$id/error/$runId',
                        params: { id: job.id, runId: latestRun.runId },
                      })
                    }
                  }}
                  className='w-full rounded-xl text-xs font-semibold border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30'
                >
                  <IconAlertTriangle className='mr-1.5 h-3.5 w-3.5 text-rose-600' />
                  View Error Log
                </Button>
                <Button
                  variant='ghost'
                  asChild
                  className='w-full rounded-xl text-xs text-muted-foreground hover:text-foreground'
                >
                  <Link
                    to='/settings/scheduler/$id/history'
                    params={{ id: job.id }}
                  >
                    View All Execution History →
                  </Link>
                </Button>
              </div>
            ) : (
              <Button
                variant='outline'
                asChild
                className='w-full rounded-xl text-xs font-semibold'
              >
                <Link
                  to='/settings/scheduler/$id/history'
                  params={{ id: job.id }}
                >
                  View Execution History
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Execution History Section ── */}
      {showHistorySection && (
        <Card className='rounded-2xl shadow-sm ring-1 ring-foreground/5'>
          <CardHeader className='border-b border-border/50 pb-4'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-base font-bold text-foreground'>
                  Execution History Logs
                </CardTitle>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  Riwayat eksekusi scheduler {job.name} (termasuk status Failed & Success)
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  asChild
                  className='text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900/60 dark:text-blue-400'
                >
                  <Link
                    to='/settings/scheduler/$id/history'
                    params={{ id: job.id }}
                  >
                    Lihat Semua (42) <IconArrowRight size={14} className='ml-1' />
                  </Link>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowHistorySection(false)}
                  className='text-xs text-muted-foreground hover:text-foreground'
                >
                  Tutup
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full text-xs'>
                <thead>
                  <tr className='border-b border-border/40 bg-muted/20 text-muted-foreground font-semibold uppercase'>
                    <th className='px-6 py-3 text-left'>RUN ID</th>
                    <th className='px-6 py-3 text-left'>Waktu Mulai</th>
                    <th className='px-4 py-3 text-left'>Durasi</th>
                    <th className='px-4 py-3 text-left'>Diproses</th>
                    <th className='px-4 py-3 text-left'>Status</th>
                    <th className='px-6 py-3 text-left'>Keterangan / Aksi</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/30'>
                  {executionRecords.map((record) => {
                    const isRecordFailed = record.result === 'Failed'

                    return (
                      <tr
                        key={record.runId}
                        className={
                          isRecordFailed
                            ? 'bg-rose-50/50 hover:bg-rose-50/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 transition-colors'
                            : 'hover:bg-muted/20 transition-colors'
                        }
                      >
                        <td className='px-6 py-3.5 font-mono font-medium text-foreground whitespace-nowrap'>
                          <Link
                            to='/settings/scheduler/$id/execution/$runId'
                            params={{ id: job.id, runId: record.runId }}
                            className='hover:text-blue-600 hover:underline'
                          >
                            {record.runId}
                          </Link>
                        </td>
                        <td className='px-6 py-3.5 font-mono text-muted-foreground whitespace-nowrap'>
                          {record.startedFormatted || record.startedAt}
                        </td>
                        <td className='px-4 py-3.5 font-mono'>{record.duration}</td>
                        <td className='px-4 py-3.5 font-semibold text-foreground'>
                          {isRecordFailed
                            ? `${record.processed.toLocaleString()} / ${record.totalRecords.toLocaleString()}`
                            : `${record.processed.toLocaleString()} records`}
                        </td>
                        <td className='px-4 py-3.5'>
                          {isRecordFailed ? (
                            <span className='inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 uppercase dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-300'>
                              FAILED
                            </span>
                          ) : (
                            <span className='inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300'>
                              SUCCESS
                            </span>
                          )}
                        </td>
                        <td className='px-6 py-3.5'>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='truncate text-foreground max-w-xs'>
                              {isRecordFailed
                                ? record.bannerError || 'Attendance calculation failed at batch 17'
                                : 'Execution completed successfully'}
                            </span>
                            <div className='flex items-center gap-1.5 flex-shrink-0'>
                              {isRecordFailed && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  asChild
                                  className='h-7 px-2 text-[11px] font-semibold border-rose-200 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:text-rose-300'
                                >
                                  <Link
                                    to='/settings/scheduler/$id/error/$runId'
                                    params={{ id: job.id, runId: record.runId }}
                                  >
                                    <IconAlertTriangle size={12} className='mr-1' />
                                    View Error Log
                                  </Link>
                                </Button>
                              )}
                              <Button
                                variant='ghost'
                                size='sm'
                                asChild
                                className='h-7 px-2 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                              >
                                <Link
                                  to='/settings/scheduler/$id/execution/$runId'
                                  params={{ id: job.id, runId: record.runId }}
                                >
                                  <IconFileText size={12} className='mr-1' />
                                  Detail
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Dialog Modals ── */}
      <RunNowDialog
        open={runNowOpen}
        onOpenChange={setRunNowOpen}
        job={job}
        onSuccess={() => {
          refetch()
          snackbar.success(`Scheduler "${job.name}" selesai dijalankan.`)
        }}
        onViewLog={() => {
          navigate({
            to: '/settings/scheduler/$id/history',
            params: { id: job.id },
          })
        }}
      />

      <SchedulerJobFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={job}
        onSubmit={handleEditSubmit}
        isPending={updateMutation.isPending}
      />

      <ErrorLogDialog open={errorLogOpen} onOpenChange={setErrorLogOpen} job={job} />
    </AppMain>
  )
}
