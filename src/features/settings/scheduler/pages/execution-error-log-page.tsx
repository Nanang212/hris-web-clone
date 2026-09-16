import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AlertTriangle, RotateCcw } from 'lucide-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { snackbar } from '@/shared/lib/snackbar'

import { useGetExecutionRecordById, useRetryExecutionRun } from '../hooks'

interface ExecutionErrorLogPageProps {
  scheduleId?: string
  runId: string
}

export function ExecutionErrorLogPage({
  scheduleId = 'job-01',
  runId,
}: ExecutionErrorLogPageProps) {
  const navigate = useNavigate()
  const { data: run, isLoading } = useGetExecutionRecordById(runId)
  const retryMutation = useRetryExecutionRun()

  const targetId = run?.schedulerId || scheduleId

  if (isLoading || !run) {
    return (
      <AppMain
        title="Execution Error Log"
        breadcrumbs={[
          { to: '/', label: 'Dashboard' },
          { to: '/settings/scheduler', label: 'Scheduler Management' },
          {
            to: '/settings/scheduler/$id/history',
            params: { id: scheduleId },
            label: 'Execution History',
          },
          { to: '.', label: 'Error Log' },
        ]}
        backTo="/settings/scheduler/$id/history"
        backParams={{ id: scheduleId }}
      >
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Memuat error log...
        </div>
      </AppMain>
    )
  }

  const handleRetryJob = async () => {
    try {
      const res = await retryMutation.mutateAsync(run.runId)
      snackbar.success(`Retry job berhasil dijalankan (New Run ID: ${res.newRunId})`)
      navigate({
        to: '/settings/scheduler/$id/history',
        params: { id: targetId },
      })
    } catch {
      snackbar.error('Gagal menjalankan retry job.')
    }
  }

  const errorCtx = run.errorContext

  // Specific error timeline steps matching Screenshot 5
  const errorTimeline = [
    {
      time: '01:00:01',
      title: 'Job started',
      subtext: 'Initialize attendance calculation',
      status: 'success',
    },
    {
      time: '01:00:12',
      title: 'Load attendance data',
      subtext: '1,241 employees loaded',
      status: 'success',
    },
    {
      time: '01:01:24',
      title: 'Calculate status',
      subtext: 'Failed at employee batch 17',
      status: 'failed',
    },
    {
      time: '01:01:39',
      title: 'Retry attempt 2',
      subtext: 'Same calculation error',
      status: 'failed',
    },
    {
      time: '01:02:01',
      title: 'Retry attempt 3',
      subtext: 'Max retry reached',
      status: 'failed',
    },
  ]

  return (
    <AppMain
      title="Execution Error Log"
      subtitle={`${run.runId} · ${run.schedulerName}`}
      breadcrumbs={[
        { to: '/', label: 'Dashboard' },
        { to: '/settings/scheduler', label: 'Scheduler Management' },
        { to: '/settings/scheduler/$id', params: { id: targetId }, label: run.schedulerName },
        { to: '/settings/scheduler/$id/history', params: { id: targetId }, label: 'Execution History' },
        { to: '.', label: 'Error Log' },
      ]}
      backTo="/settings/scheduler/$id/history"
      backParams={{ id: targetId }}
      className="w-full max-w-full min-w-0 gap-6"
      actions={
        <Button
          onClick={handleRetryJob}
          disabled={retryMutation.isPending}
          className="gap-2 bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-sm"
        >
          <RotateCcw className={`h-4 w-4 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
          Retry Job
        </Button>
      }
    >
      {/* ─── Red Alert Banner ──────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
        <div>
          <p className="font-semibold text-rose-700 dark:text-rose-400">
            Execution failed after 3 attempts
          </p>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">
            Failure occurred while calculating attendance status, {run.processed} of{' '}
            {run.totalRecords} records were processed.
          </p>
        </div>
      </div>

      {/* ─── 4 Diagnostic Metric Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Error Code */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Error Code
              </p>
              <p className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground">
                {errorCtx?.errorCodeShort || 'ATT-CALC-500'}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
            >
              Issue
            </Badge>
          </CardContent>
        </Card>

        {/* Failed Step */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Failed Step
              </p>
              <p className="mt-2 text-xl font-bold tracking-tight text-foreground">
                {errorCtx?.failedStep || 'Calculate status'}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
            >
              Issue
            </Badge>
          </CardContent>
        </Card>

        {/* Attempt */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Attempt
              </p>
              <p className="mt-2 text-xl font-bold tracking-tight text-foreground">
                {errorCtx?.attempt || '3 of 3'}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
            >
              Retry
            </Badge>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              <p className="mt-2 text-xl font-bold tracking-tight text-foreground">
                Failed
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
            >
              Issue
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* ─── 2 Columns Layout: Timeline & Error Detail ───────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Execution Timeline */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold text-foreground">
              Execution Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="relative space-y-6 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
              {errorTimeline.map((step, idx) => {
                const isPassed = step.status === 'success'
                const dotColor = isPassed
                  ? 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-950'
                  : 'bg-rose-500 ring-rose-100 dark:ring-rose-950'

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    <span
                      className={`absolute -left-[19px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ${dotColor}`}
                    />
                    <div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-muted-foreground">{step.time}</span>
                        <span className="font-semibold text-foreground">{step.title}</span>
                      </div>
                      {step.subtext && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{step.subtext}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Error Detail */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold text-foreground">
              Error Detail
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Error Message Box */}
            <div>
              <p className="text-xs text-muted-foreground">Error message</p>
              <div className="mt-1.5 rounded-lg border border-rose-200 bg-rose-50/60 p-3 font-mono text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300 leading-relaxed">
                {errorCtx?.errorMessage ||
                  'AttendanceCalculationException: Unable to resolve work pattern for employee batch 17.'}
              </div>
            </div>

            {/* Stack / Context Box */}
            <div>
              <p className="text-xs text-muted-foreground">Stack / context</p>
              <div className="mt-1.5 rounded-lg border border-border/80 bg-muted/40 p-3.5 font-mono text-xs text-foreground/80 space-y-1">
                {(errorCtx?.stackContext || [
                  'AttendanceService.calculateStatus()',
                  'WorkPatternResolver.resolve()',
                  'Employee batch: 17',
                  'Company timezone: Asia/Jakarta',
                  'Retry attempt: 3/3',
                ]).map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>

            {/* Suggested Check Box */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
              <p className="font-semibold text-blue-700 dark:text-blue-300">Suggested check</p>
              <p className="mt-1 text-blue-800 dark:text-blue-300">
                {errorCtx?.suggestedCheck ||
                  'Verify employee work pattern mapping, then Retry Job.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
