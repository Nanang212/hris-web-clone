import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  Copy,
  FileText,
  MoreHorizontal,
  Play,
  RotateCcw,
  Search,
} from 'lucide-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'

import { RunNowDialog } from '../components/run-now-dialog'
import {
  useGetExecutionHistoryStats,
  useGetExecutionRecords,
  useGetScheduledJobById,
  useRetryExecutionRun,
} from '../hooks'
import type { ExecutionRecord } from '../types'

interface ExecutionHistoryPageProps {
  scheduleId?: string
}

export function ExecutionHistoryPage({ scheduleId = 'job-01' }: ExecutionHistoryPageProps) {
  const navigate = useNavigate()
  const { data: job } = useGetScheduledJobById(scheduleId)
  const { data: records = [], isLoading } = useGetExecutionRecords(scheduleId)
  const { data: stats } = useGetExecutionHistoryStats(scheduleId)
  const retryMutation = useRetryExecutionRun()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [triggerFilter, setTriggerFilter] = React.useState<string>('all')
  const [dateRangeFilter, setDateRangeFilter] = React.useState<string>('30d')
  const [runNowOpen, setRunNowOpen] = React.useState(false)

  const schedulerTitle = job?.name || 'Daily Attendance Processing'

  const filteredRecords = React.useMemo(() => {
    return records.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchId = r.runId.toLowerCase().includes(q)
        const matchScheduler = r.schedulerName.toLowerCase().includes(q)
        if (!matchId && !matchScheduler) return false
      }
      if (statusFilter !== 'all') {
        if (r.result.toLowerCase() !== statusFilter.toLowerCase()) return false
      }
      if (triggerFilter !== 'all') {
        if (r.trigger.toLowerCase() !== triggerFilter.toLowerCase()) return false
      }
      return true
    })
  }, [records, searchQuery, statusFilter, triggerFilter])

  const handleCopyRunId = (runId: string) => {
    navigator.clipboard.writeText(runId)
    snackbar.success(`Run ID ${runId} berhasil disalin ke clipboard`)
  }

  const handleRetryRun = async (record: ExecutionRecord) => {
    try {
      const res = await retryMutation.mutateAsync(record.runId)
      snackbar.success(`Retry run berhasil dijadwalkan (New Run ID: ${res.newRunId})`)
    } catch {
      snackbar.error('Gagal melakukan retry execution.')
    }
  }

  return (
    <AppMain
      title="Execution History"
      subtitle="Pantau hasil setiap execution, trigger source, duration, dan record yang diproses."
      breadcrumbs={[
        { to: '/', label: 'Dashboard' },
        { to: '/settings/scheduler', label: 'Scheduler Management' },
        { to: '/settings/scheduler/$id', params: { id: scheduleId }, label: schedulerTitle },
        { to: '.', label: 'Execution History' },
      ]}
      backTo="/settings/scheduler/$id"
      backParams={{ id: scheduleId }}
      className="w-full max-w-full min-w-0 gap-6"
      actions={
        <Button
          onClick={() => setRunNowOpen(true)}
          className="gap-2 bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-sm"
        >
          <Play className="h-4 w-4 fill-white" />
          Run Now
        </Button>
      }
    >
      {/* ─── Top 4 Metric Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Runs */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Runs
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {stats?.totalRuns ?? 42}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
            >
              Healthy
            </Badge>
          </CardContent>
        </Card>

        {/* Card 2: Success Rate */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Success Rate
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {stats?.successRate ?? 95.2}%
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              Healthy
            </Badge>
          </CardContent>
        </Card>

        {/* Card 3: Avg Duration */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Avg Duration
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {stats?.avgDuration ?? '1m 49s'}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
            >
              Healthy
            </Badge>
          </CardContent>
        </Card>

        {/* Card 4: Failed */}
        <Card className="border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Failed
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {stats?.failed ?? 2}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
            >
              Attention
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* ─── Filters Row ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search run ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-card text-xs">
              <SelectValue placeholder="Status - All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status - All</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          {/* Trigger Filter */}
          <Select value={triggerFilter} onValueChange={setTriggerFilter}>
            <SelectTrigger className="w-[140px] bg-card text-xs">
              <SelectValue placeholder="Trigger - All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Trigger - All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
            <SelectTrigger className="w-[140px] bg-card text-xs">
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ─── Execution Records Table ───────────────────────────────────────── */}
      <Card className="border border-border/80 bg-card shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[200px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  RUN ID
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  TRIGGER
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  STARTED
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  DURATION
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  RESULT
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  RECORDS
                </TableHead>
                <TableHead className="w-[80px] text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Memuat data execution history...
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Tidak ada record execution yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const isFailed = record.result === 'Failed'

                  return (
                    <TableRow
                      key={record.runId}
                      className={
                        isFailed
                          ? 'bg-rose-50/50 hover:bg-rose-50/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 transition-colors'
                          : 'hover:bg-muted/30 transition-colors'
                      }
                    >
                      {/* Run ID */}
                      <TableCell className="font-mono text-xs font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              navigate({
                                to: '/settings/scheduler/$id/execution/$runId',
                                params: { id: scheduleId, runId: record.runId },
                              })
                            }
                            className="text-left font-mono font-semibold text-foreground hover:text-blue-600 hover:underline cursor-pointer"
                          >
                            {record.runId}
                          </button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyRunId(record.runId)
                            }}
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                            title="Copy Run ID"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>

                      {/* Trigger */}
                      <TableCell className="text-xs text-foreground">
                        {record.trigger}
                      </TableCell>

                      {/* Started */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {record.startedFormatted}
                      </TableCell>

                      {/* Duration */}
                      <TableCell className="text-xs font-medium text-foreground whitespace-nowrap">
                        {record.duration}
                      </TableCell>

                      {/* Result Badge */}
                      <TableCell>
                        {record.result === 'Success' ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            Success
                          </Badge>
                        ) : record.result === 'Failed' ? (
                          <Badge
                            variant="outline"
                            className="border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                          >
                            Failed
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                          >
                            Running
                          </Badge>
                        )}
                      </TableCell>

                      {/* Records */}
                      <TableCell className="text-xs text-foreground">
                        {isFailed
                          ? `${record.processed.toLocaleString()} / ${record.totalRecords.toLocaleString()}`
                          : `${record.processed.toLocaleString()} processed`}
                      </TableCell>

                      {/* Action Menu */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            {/* Option 1: View Execution Detail */}
                            <DropdownMenuItem
                              onClick={() =>
                                navigate({
                                  to: '/settings/scheduler/$id/execution/$runId',
                                  params: { id: scheduleId, runId: record.runId },
                                })
                              }
                              className="cursor-pointer text-xs"
                            >
                              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                              View Execution Detail
                            </DropdownMenuItem>

                            {/* Option 2: View Logs / View Error Log */}
                            {isFailed ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate({
                                    to: '/settings/scheduler/$id/error/$runId',
                                    params: { id: scheduleId, runId: record.runId },
                                  })
                                }
                                className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 font-medium"
                              >
                                <AlertTriangle className="mr-2 h-4 w-4 text-rose-600" />
                                View Error Log
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate({
                                    to: '/settings/scheduler/$id/execution/$runId',
                                    params: { id: scheduleId, runId: record.runId },
                                  })
                                }
                                className="cursor-pointer text-xs"
                              >
                                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                View Logs
                              </DropdownMenuItem>
                            )}

                            {/* Option 3: Retry Run / Run Again */}
                            {isFailed ? (
                              <DropdownMenuItem
                                onClick={() => handleRetryRun(record)}
                                className="cursor-pointer text-xs text-blue-600 focus:text-blue-600 font-medium"
                              >
                                <RotateCcw className="mr-2 h-4 w-4 text-blue-600" />
                                Retry Run
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setRunNowOpen(true)}
                                className="cursor-pointer text-xs text-blue-600 focus:text-blue-600 font-medium"
                              >
                                <RotateCcw className="mr-2 h-4 w-4 text-blue-600" />
                                Run Again
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {/* Option 4: Copy Run ID */}
                            <DropdownMenuItem
                              onClick={() => handleCopyRunId(record.runId)}
                              className="cursor-pointer text-xs"
                            >
                              <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                              Copy Run ID
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Footer Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row text-xs text-muted-foreground">
            <div>Showing 1-{filteredRecords.length} of {stats?.totalRuns ?? 42} executions</div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs text-muted-foreground">
                ‹
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-xs font-semibold bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400"
              >
                1
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs text-muted-foreground">
                2
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs text-muted-foreground">
                3
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs text-muted-foreground">
                ›
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
