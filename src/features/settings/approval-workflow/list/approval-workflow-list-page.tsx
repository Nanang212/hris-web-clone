import {
  IconBolt,
  IconCheck,
  IconChevronRight,
  IconCircleDashed,
  IconClock,
  IconEdit,
  IconEye,
  IconGitBranch,
  IconLayersLinked,
  IconPlus,
  IconSearch,
  IconSettings2,
  IconTrash,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

import { moduleColors, moduleLabels } from '../data'
import { useWorkflows } from '../hooks'
import type { Workflow, WorkflowStatus } from '../types'

const statusConfig: Record<WorkflowStatus, { label: string; icon: typeof IconCheck; cls: string }> =
  {
    active: {
      label: 'Aktif',
      icon: IconCheck,
      cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    inactive: {
      label: 'Nonaktif',
      icon: IconCircleDashed,
      cls: 'bg-muted text-muted-foreground',
    },
    draft: {
      label: 'Draft',
      icon: IconClock,
      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
  }

function WorkflowStatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  iconBg,
}: Readonly<{
  icon: typeof IconBolt
  label: string
  value: string | number
  sublabel?: string
  iconBg: string
}>) {
  return (
    <div className='flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconBg)}>
        <Icon size={20} stroke={1.75} className='text-foreground/70' />
      </div>
      <div>
        <p className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>{label}</p>
        <p className='mt-1 text-3xl font-bold tracking-tight'>{value}</p>
        {sublabel && <p className='mt-0.5 text-xs font-medium text-muted-foreground'>{sublabel}</p>}
      </div>
    </div>
  )
}

function WorkflowRow({ workflow }: { workflow: Workflow }) {
  const status = statusConfig[workflow.status]
  const StatusIcon = status.icon
  const moduleCls = moduleColors[workflow.module] ?? 'bg-muted text-muted-foreground'

  return (
    <tr className='group border-b border-border/50 transition-colors hover:bg-muted/30'>
      <td className='py-3.5 pr-3 pl-5'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10'>
            <IconGitBranch size={18} className='text-primary' />
          </div>
          <div>
            <p className='text-sm font-semibold'>{workflow.name}</p>
            <p className='mt-0.5 max-w-xs truncate text-xs text-muted-foreground'>
              {workflow.description}
            </p>
          </div>
        </div>
      </td>
      <td className='px-3 py-3.5'>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', moduleCls)}>
          {moduleLabels[workflow.module]}
        </span>
      </td>
      <td className='px-3 py-3.5'>
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
      <td className='px-3 py-3.5 text-center text-sm font-medium'>{workflow.totalLevels}</td>
      <td className='px-3 py-3.5 text-center text-sm'>{workflow.totalRequests}</td>
      <td className='px-3 py-3.5 text-center text-sm'>{workflow.avgProcessingDays || '-'}</td>
      <td className='px-3 py-3.5 text-center'>
        {workflow.pendingRequests > 0 ? (
          <span className='rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'>
            {workflow.pendingRequests}
          </span>
        ) : (
          <span className='text-xs text-muted-foreground'>—</span>
        )}
      </td>
      <td className='py-3.5 pr-5 pl-3'>
        <div className='flex items-center justify-end gap-1'>
          <Link
            to='/settings/approval-workflow/$id'
            params={{ id: workflow.id }}
            className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            title='Edit'
          >
            <IconEdit size={15} />
          </Link>
          <Link
            to='/settings/approval-workflow/$id/levels'
            params={{ id: workflow.id }}
            className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            title='Configure Levels'
          >
            <IconSettings2 size={15} />
          </Link>
          <Link
            to='/settings/approval-workflow/$id/test'
            params={{ id: workflow.id }}
            className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            title='Test Workflow'
          >
            <IconBolt size={15} />
          </Link>
          <button
            type='button'
            className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
            title='Delete'
          >
            <IconTrash size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export function ApprovalWorkflowListPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<WorkflowStatus | 'all'>('all')

  const { data: workflows, isPending, error } = useWorkflows()

  if (isPending || error || !workflows) {
    return <AppMain pending={isPending} error={error} notFound={!workflows} />
  }

  const totalActive = workflows.filter((w) => w.status === 'active').length
  const totalRequests = workflows.reduce((s, w) => s + w.totalRequests, 0)
  const totalPending = workflows.reduce((s, w) => s + w.pendingRequests, 0)
  const avgDays =
    workflows.filter((w) => w.avgProcessingDays > 0).reduce((s, w) => s + w.avgProcessingDays, 0) /
    (workflows.filter((w) => w.avgProcessingDays > 0).length || 1)

  const filtered = workflows.filter((w) => {
    const matchSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || w.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: 'Pengaturan' },
        { to: '.', label: 'Approval Workflow' },
      ]}
      title={'Approval Workflow'}
      subtitle={'Kelola alur persetujuan untuk berbagai jenis pengajuan karyawan'}
      actions={
        <Button size='sm' asChild>
          <Link to='/settings/approval-workflow/new'>
            <IconPlus size={16} stroke={2.5} />
            Buat Workflow
          </Link>
        </Button>
      }
    >
      {/* Stats */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <WorkflowStatCard
          icon={IconGitBranch}
          label='Total Workflow'
          value={workflows.length}
          sublabel={`${totalActive} aktif`}
          iconBg='bg-blue-100 dark:bg-blue-900/40'
        />
        <WorkflowStatCard
          icon={IconLayersLinked}
          label='Avg. Level Approval'
          value='3.2'
          sublabel='per workflow'
          iconBg='bg-purple-100 dark:bg-purple-900/40'
        />
        <WorkflowStatCard
          icon={IconClock}
          label='Avg. Processing'
          value={`${avgDays.toFixed(1)}h`}
          sublabel='waktu proses'
          iconBg='bg-emerald-100 dark:bg-emerald-900/40'
        />
        <WorkflowStatCard
          icon={IconBolt}
          label='Pending Requests'
          value={totalPending}
          sublabel={`dari ${totalRequests} total`}
          iconBg='bg-amber-100 dark:bg-amber-900/40'
        />
      </div>

      {/* Table Card */}
      <div className='rounded-2xl bg-card shadow-sm ring-1 ring-foreground/5'>
        {/* Table Header */}
        <div className='flex flex-col gap-3 border-b border-border/50 p-5 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h3 className='text-sm font-semibold'>Daftar Workflow</h3>
            <p className='text-xs text-muted-foreground'>
              {filtered.length} dari {workflows.length} workflow
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {/* Search */}
            <div className='relative'>
              <IconSearch
                size={14}
                className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
              />
              <input
                type='text'
                placeholder='Cari workflow...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='h-8 rounded-lg border border-border bg-background pr-3 pl-8 text-xs focus:ring-2 focus:ring-ring/50 focus:outline-none'
              />
            </div>
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as WorkflowStatus | 'all')}
              className='h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:ring-2 focus:ring-ring/50 focus:outline-none'
            >
              <option value='all'>Semua Status</option>
              <option value='active'>Aktif</option>
              <option value='inactive'>Nonaktif</option>
              <option value='draft'>Draft</option>
            </select>
            {/* Matrix Link */}
            <Link
              to='/settings/approval-workflow/matrix'
              className='inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted'
            >
              <IconEye size={13} />
              Approval Matrix
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-border/50 bg-muted/30'>
                <th className='py-3 pr-3 pl-5 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Nama Workflow
                </th>
                <th className='px-3 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Modul
                </th>
                <th className='px-3 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Status
                </th>
                <th className='px-3 py-3 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Level
                </th>
                <th className='px-3 py-3 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Total Req.
                </th>
                <th className='px-3 py-3 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Avg. Days
                </th>
                <th className='px-3 py-3 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Pending
                </th>
                <th className='py-3 pr-5 pl-3 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className='py-16 text-center text-sm text-muted-foreground'>
                    Tidak ada workflow yang ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((workflow) => <WorkflowRow key={workflow.id} workflow={workflow} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className='border-t border-border/50 px-5 py-3.5'>
          <p className='text-xs text-muted-foreground'>
            Menampilkan {filtered.length} dari {workflows.length} workflow
          </p>
        </div>
      </div>

      {/* Quick access cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Link
          to='/settings/approval-workflow/matrix'
          className='group flex items-center gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 transition-all hover:ring-primary/30'
        >
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40'>
            <IconEye size={22} className='text-blue-600 dark:text-blue-400' />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-semibold'>Approval Matrix</p>
            <p className='text-xs text-muted-foreground'>Lihat status approval semua request</p>
          </div>
          <IconChevronRight
            size={16}
            className='text-muted-foreground transition-transform group-hover:translate-x-0.5'
          />
        </Link>
        <Link
          to='/settings/approval-workflow/new'
          className='group flex items-center gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 transition-all hover:ring-primary/30'
        >
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40'>
            <IconPlus size={22} className='text-emerald-600 dark:text-emerald-400' />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-semibold'>Buat Workflow Baru</p>
            <p className='text-xs text-muted-foreground'>Tambahkan alur persetujuan baru</p>
          </div>
          <IconChevronRight
            size={16}
            className='text-muted-foreground transition-transform group-hover:translate-x-0.5'
          />
        </Link>
        <div className='group flex items-center gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 transition-all hover:ring-primary/30'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40'>
            <IconBolt size={22} className='text-amber-600 dark:text-amber-400' />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-semibold'>Pending Approvals</p>
            <p className='text-xs text-muted-foreground'>{totalPending} request menunggu</p>
          </div>
          <IconChevronRight
            size={16}
            className='text-muted-foreground transition-transform group-hover:translate-x-0.5'
          />
        </div>
      </div>
    </AppMain>
  )
}
