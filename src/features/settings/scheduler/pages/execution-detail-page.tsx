import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  Copy,
  FileText,
  Play,
  RotateCcw,
} from 'lucide-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { snackbar } from '@/shared/lib/snackbar'

import { RunNowDialog } from '../components/run-now-dialog'
import {
  useGetExecutionRecordById,
  useGetScheduledJobById,
  useRetryExecutionRun,
} from '../hooks'

interface ExecutionDetailPageProps {
  scheduleId?: string
  runId: string
}

export function ExecutionDetailPage({
  scheduleId = 'job-01',
  runId,
}: ExecutionDetailPageProps) {
  const navigate = useNavigate()
  const { data: run, isLoading } = useGetExecutionRecordById(runId)
  const { data: job } = useGetScheduledJobById(run?.schedulerId || scheduleId)
  const retryMutation = useRetryExecutionRun()
  const [runNowOpen, setRunNowOpen] = React.useState(false)

  if (isLoading || !run) {
    return (
      <AppMain
        title="Execution Detail"
        breadcrumbs={[
          { to: '/', label: 'Dashboard' },
          { to: '/settings/scheduler', label: 'Scheduler Management' },
          {
            to: '/settings/scheduler/$id/history',
            params: { id: scheduleId },
            label: 'Execution History',
          },
          { to: '.', label: runId },
        ]}
        backTo="/settings/scheduler/$id/history"
        backParams={{ id: scheduleId }}
      >
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Memuat detail execution...
        </div>
      </AppMain>
    )
  }

  const isFailed = run.result === 'Failed'
  const isSuccess = run.result === 'Success'
  const targetId = run.schedulerId || scheduleId

  const handleRetry = async () => {
    try {
      const res = await retryMutation.mutateAsync(run.runId)
      snackbar.success(`Retry run berhasil dijadwalkan (New Run ID: ${res.newRunId})`)
    } catch {
      snackbar.error('Gagal melakukan retry execution.')
    }
  }

  return (
    <AppMain
      title="Execution Detail"
      subtitle={
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {run.runId} · {run.schedulerName}
          </span>
          {isFailed ? (
            <Badge
              variant="outline"
              className="border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
            >
              Failed
            </Badge>
          ) : isSuccess ? (
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              Success
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
            >
              Running
            </Badge>
          )}
        </div>
      }
      breadcrumbs={[
        { to: '/', label: 'Dashboard' },
        { to: '/settings/scheduler', label: 'Scheduler Management' },
        { to: '/settings/scheduler/$id', params: { id: targetId }, label: run.schedulerName },
        { to: '/settings/scheduler/$id/history', params: { id: targetId }, label: 'Execution History' },
        { to: '.', label: run.runId },
      ]}
      backTo="/settings/scheduler/$id/history"
      backParams={{ id: targetId }}
      className="w-full max-w-full min-w-0 gap-6"
      actions={
        <div className="flex items-center gap-2">
          {isFailed ? (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  navigate({
                    to: '/settings/scheduler/$id/error/$runId',
                    params: { id: run.schedulerId || scheduleId, runId: run.runId },
                  })
                }
                className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-semibold"
              >
                <FileText className="h-4 w-4" />
                View Error Log
              </Button>
              <Button
                onClick={handleRetry}
                disabled={retryMutation.isPending}
                className="gap-2 bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-sm"
              >
                <RotateCcw className={`h-4 w-4 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
                Retry Run
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-semibold"
              >
                <FileText className="h-4 w-4" />
                View Logs
              </Button>
              <Button
                onClick={() => setRunNowOpen(true)}
                className="gap-2 bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-sm"
              >
                <Play className="h-4 w-4 fill-white" />
                Run Again
              </Button>
            </>
          )}
        </div>
      }
    >
      {/* ─── Top 4 Metric Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Result Card */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Result
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {run.result}
              </p>
            </div>
            {isFailed ? (
              <Badge
                variant="outline"
                className="border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
              >
                Attention
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                Healthy
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Duration Card */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Duration
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {run.duration}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
            >
              Normal
            </Badge>
          </CardContent>
        </Card>

        {/* Records Card */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Records
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {isFailed
                  ? `${run.processed.toLocaleString()} / ${run.totalRecords.toLocaleString()}`
                  : run.totalRecords.toLocaleString()}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
            >
              Processed
            </Badge>
          </CardContent>
        </Card>

        {/* Trigger Card */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Trigger
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {run.trigger}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              {run.trigger === 'Scheduled' ? 'Automatic' : 'Manual'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* ─── Failed Alert Banner ───────────────────────────────────────────── */}
      {isFailed && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
          <p className="font-semibold text-rose-700 dark:text-rose-400">
            Execution failed during attendance processing
          </p>
          <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-300">
            {run.bannerError ||
              'ATTENDANCE_PROCESSING_ERROR · Failed while processing employee attendance record EMP-01842.'}
          </p>
        </div>
      )}

      {/* ─── 2x2 Grid Section ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Execution Information */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold text-foreground">
              Execution Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Run ID</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {run.runId}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(run.runId)
                      snackbar.success(`Run ID ${run.runId} berhasil disalin!`)
                    }}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    title="Copy Run ID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Scheduler</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {run.schedulerName}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Module</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {run.module}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Trigger</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {run.trigger}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Started At</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {run.startedAt}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Finished At</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {run.finishedAt}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Processing Result */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold text-foreground">
              Processing Result
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-y-5 gap-x-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Records</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  {run.totalRecords.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Processed</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  {run.processed.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Succeeded</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  {run.succeeded.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Skipped</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  {run.skipped}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Failed</p>
                <p
                  className={`mt-1 text-2xl font-bold tracking-tight ${
                    run.failed > 0 ? 'text-rose-600' : 'text-foreground'
                  }`}
                >
                  {run.failed}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  {run.remaining.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Execution Timeline */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold text-foreground">
              Execution Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="relative space-y-6 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
              {run.timeline.map((step, idx) => {
                let dotColor = 'bg-blue-500 ring-blue-100'
                if (step.color === 'green') dotColor = 'bg-emerald-500 ring-emerald-100'
                if (step.color === 'purple') dotColor = 'bg-purple-500 ring-purple-100'
                if (step.color === 'amber') dotColor = 'bg-amber-500 ring-amber-100'
                if (step.color === 'red') dotColor = 'bg-rose-500 ring-rose-100'

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    <span
                      className={`absolute -left-[19px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ${dotColor}`}
                    />
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-muted-foreground">{step.time}</span>
                      <span className="font-medium text-foreground">{step.title}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Error Context (if Failed) OR Execution Logs (if Success) */}
        {isFailed && run.errorContext ? (
          <Card className="border border-border/80 bg-card shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold text-foreground">
                Error Context
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Badge
                  variant="outline"
                  className="border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  {run.errorContext.code}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Employee</p>
                  <p className="mt-1 text-xs font-semibold text-foreground">
                    {run.errorContext.employee || 'EMP-01842 - Andi Pratama'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Record Date</p>
                  <p className="mt-1 text-xs font-semibold text-foreground">
                    {run.errorContext.recordDate || '03 Sep 2026'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  ERROR MESSAGE
                </p>
                <p className="mt-1 text-xs text-foreground leading-relaxed">
                  {run.errorContext.errorMessage}
                </p>
              </div>

              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                Suggested check: {run.errorContext.suggestedCheck || 'verify shift assignment and rerun this execution.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border/80 bg-card shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold text-foreground">
                Execution Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {(run.logs && run.logs.length > 0 ? run.logs : [
                { time: '01:02:04', level: 'INFO', message: 'Attendance processing started' },
                { time: '01:02:06', level: 'INFO', message: 'Found 1,248 employee records' },
                { time: '01:02:28', level: 'INFO', message: 'Processing attendance records' },
                { time: '01:03:49', level: 'INFO', message: '1,248 records processed successfully' },
                { time: '01:03:51', level: 'INFO', message: 'Job completed' },
              ]).map((log, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-muted-foreground">{log.time}</span>
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                  >
                    {log.level}
                  </Badge>
                  <span className="text-foreground">{log.message}</span>
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View full log <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Run Now Dialog */}
      {job && (
        <RunNowDialog
          job={job}
          open={runNowOpen}
          onOpenChange={setRunNowOpen}
          onSuccess={() => {
            snackbar.success(`Scheduler ${job.name} berhasil dijalankan`)
          }}
        />
      )}
    </AppMain>
  )
}
