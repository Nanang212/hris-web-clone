import {
  IconCalendarWeek,
  IconCategory,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconCoin,
  IconEye,
  IconFileText,
  IconReportMoney,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'

import { useApprovalRequests, useApproveRequest, useRejectRequest } from './hooks'
import { dummyWorkflows, moduleColors, moduleLabels } from '../approval-workflow/data'
import { ApprovalDetailDrawer } from './components/detail-drawer'
import type { ApprovalRequest } from './types'

type TabType = string
type StatusFilterType = 'all' | 'pending' | 'approved' | 'rejected'

const tabConfig: Record<string, { label: string; icon: typeof IconCategory }> = {
  all: { label: 'Semua', icon: IconCategory },
  leave: { label: 'Cuti', icon: IconCalendarWeek },
  overtime: { label: 'Lembur', icon: IconClock },
  reimbursement: { label: 'Reimburse', icon: IconReportMoney },
  loan: { label: 'Pinjaman', icon: IconCoin },
  resignation: { label: 'Resignation', icon: IconFileText },
  promotion: { label: 'Promosi', icon: IconCoin },
}

export function ApprovalPage() {
  const { data, isPending, error } = useApprovalRequests()
  const { mutateAsync: approve } = useApproveRequest()
  const { mutateAsync: reject } = useRejectRequest()

  const requests = data?.items ?? []

  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Derive active tabs dynamically from workflows with active status
  const activeTabs = [
    'all',
    ...dummyWorkflows.filter((w) => w.status === 'active').map((w) => w.module),
  ]

  // Handlers
  const handleApprove = async (id: string, note = '') => {
    try {
      await approve({ id, note })
      snackbar.success('Pengajuan berhasil disetujui!')
      setSelectedRequest(null)
    } catch (err) {
      snackbar.exception(err)
    }
  }

  const handleReject = async (id: string, note = '') => {
    try {
      await reject({ id, note })
      snackbar.success('Pengajuan berhasil ditolak.')
      setSelectedRequest(null)
    } catch (err) {
      snackbar.exception(err)
    }
  }

  if (isPending || error) {
    return <AppMain pending={isPending} error={error} notFound={requests.length === 0} />
  }

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchTab = activeTab === 'all' || r.requestType === activeTab
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const matchSearch =
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.details.toLowerCase().includes(searchQuery.toLowerCase())
    return matchTab && matchStatus && matchSearch
  })

  // Pagination calculations
  const totalItems = filteredRequests.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const paginatedRequests = filteredRequests.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  )

  const startItemIdx = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1
  const endItemIdx = Math.min(activePage * pageSize, totalItems)

  // Counters
  const countPending = requests.filter((r) => r.status === 'pending').length
  const countApproved = requests.filter((r) => r.status === 'approved').length
  const countRejected = requests.filter((r) => r.status === 'rejected').length

  return (
    <AppMain
      breadcrumbs={[{ to: '.', label: 'Approval' }]}
      title={'Approval Inbox'}
      subtitle={'Kelola dan tinjau seluruh pengajuan persetujuan yang ditujukan kepada Anda'}
    >
      {/* Hide scrollbar styles */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Stats Summary Card */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {[
          {
            label: 'Menunggu Persetujuan',
            count: countPending,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-100 dark:bg-amber-900/30',
          },
          {
            label: 'Telah Disetujui',
            count: countApproved,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          },
          {
            label: 'Telah Ditolak',
            count: countRejected,
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-100 dark:bg-red-900/30',
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className='flex items-center justify-between rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'
          >
            <div>
              <p className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                {item.label}
              </p>
              <p className={cn('mt-1.5 text-3xl font-extrabold', item.color)}>{item.count}</p>
            </div>
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', item.bg)}>
              <IconCircleCheck size={22} className={item.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Layout Container matching mockup */}
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-2 shadow-sm'>
        {/* Horizontal tabs list - scrollable, no scrollbar */}
        <div className='no-scrollbar flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto pb-1 sm:max-w-[400px] sm:pb-0 md:max-w-[550px] lg:max-w-[700px]'>
          {activeTabs.map((type) => {
            const config = tabConfig[type] || { label: type, icon: IconCategory }
            const Icon = config.icon
            const isActive = activeTab === type
            return (
              <button
                key={type}
                type='button'
                onClick={() => {
                  setActiveTab(type)
                  setCurrentPage(1)
                }}
                className={cn(
                  'flex flex-shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
              >
                <Icon size={15} />
                <span>{config.label}</span>
              </button>
            )
          })}
        </div>

        {/* Filters and Search inline */}
        <div className='flex w-full flex-wrap items-center gap-3 sm:w-auto'>
          {/* Search bar */}
          <div className='relative flex-1 sm:flex-initial'>
            <IconSearch
              size={14}
              className='absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground'
            />
            <input
              type='text'
              placeholder='Cari karyawan / pengajuan...'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className='h-9 w-full rounded-xl border border-input bg-background pr-4 pl-9.5 text-xs transition-all focus:ring-2 focus:ring-ring/50 focus:outline-none sm:w-60'
            />
          </div>

          {/* Status Filter */}
          <div className='relative'>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilterType)
                setCurrentPage(1)
              }}
              className='h-9 cursor-pointer rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:ring-2 focus:ring-ring/50 focus:outline-none'
            >
              <option value='all'>Semua Status</option>
              <option value='pending'>Menunggu</option>
              <option value='approved'>Disetujui</option>
              <option value='rejected'>Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Approval Inbox Table / List */}
      <div className='overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-foreground/5'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border/50 bg-muted/20'>
                <th className='w-12 py-3.5 pr-2 pl-6 text-left text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                  No.
                </th>
                <th className='px-3 py-3.5 text-left text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                  Karyawan
                </th>
                <th className='px-3 py-3.5 text-left text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                  Modul
                </th>
                <th className='px-3 py-3.5 text-left text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                  Rincian Pengajuan
                </th>
                <th className='px-3 py-3.5 text-center text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                  Workflow Level
                </th>
                <th className='px-3 py-3.5 text-center text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                  Diajukan
                </th>
                <th className='px-3 py-3.5 text-center text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                  Status
                </th>
                <th className='py-3.5 pr-6 pl-3 text-center text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/50'>
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className='py-16 text-center text-sm text-muted-foreground'>
                    Tidak ada pengajuan persetujuan yang ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req, index) => {
                  const rowNum = (activePage - 1) * pageSize + index + 1
                  const moduleColorCls =
                    moduleColors[req.requestType] ?? 'bg-muted text-muted-foreground'

                  return (
                    <tr
                      key={req.id}
                      className='group transition-colors duration-150 hover:bg-muted/10'
                    >
                      {/* Number */}
                      <td className='py-4 pr-2 pl-6 text-xs font-semibold text-muted-foreground'>
                        {rowNum}
                      </td>

                      {/* Employee profile */}
                      <td className='px-3 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary'>
                            {req.employeeName.charAt(0)}
                          </div>
                          <div>
                            <p className='text-xs font-bold text-foreground'>{req.employeeName}</p>
                            <p className='mt-0.5 text-[10px] text-muted-foreground'>
                              {req.department} · {req.position}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Module tag */}
                      <td className='px-3 py-4'>
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                            moduleColorCls,
                          )}
                        >
                          {moduleLabels[req.requestType]}
                        </span>
                      </td>

                      {/* Request details */}
                      <td className='px-3 py-4'>
                        <p className='max-w-xs truncate text-xs font-semibold text-foreground'>
                          {req.details}
                        </p>
                        {req.reason && (
                          <p className='mt-0.5 max-w-xs truncate text-[10px] text-muted-foreground'>
                            {req.reason}
                          </p>
                        )}
                      </td>

                      {/* Level progress */}
                      <td className='px-3 py-4 text-center'>
                        <div className='flex flex-col items-center gap-1.5'>
                          <span className='text-xs font-bold text-primary'>
                            Lvl {req.currentLevel}/{req.totalLevels}
                          </span>
                          <span className='text-[10px] text-muted-foreground'>
                            {req.workflowName}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className='px-3 py-4 text-center text-xs text-muted-foreground'>
                        {req.requestDate}
                      </td>

                      {/* Status */}
                      <td className='px-3 py-4 text-center'>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase',
                            req.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : req.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
                          )}
                        >
                          {req.status === 'pending'
                            ? 'Menunggu'
                            : req.status === 'approved'
                              ? 'Disetujui'
                              : 'Ditolak'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className='py-4 pr-6 pl-3 text-center'>
                        <div className='flex items-center justify-center gap-1.5'>
                          {/* Details */}
                          <button
                            type='button'
                            onClick={() => setSelectedRequest(req)}
                            className='flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                            title='Tinjau Detail'
                          >
                            <IconEye size={14} />
                          </button>

                          {req.status === 'pending' && (
                            <>
                              {/* Quick Approve */}
                              <button
                                type='button'
                                onClick={() => handleApprove(req.id, 'Disetujui cepat.')}
                                className='flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100'
                                title='Setujui Cepat'
                              >
                                <IconCheck size={14} stroke={2.5} />
                              </button>

                              {/* Quick Reject */}
                              <button
                                type='button'
                                onClick={() => handleReject(req.id, 'Ditolak cepat.')}
                                className='flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition-colors hover:bg-red-100'
                                title='Tolak Cepat'
                              >
                                <IconX size={14} stroke={2.5} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className='flex flex-col items-center justify-between gap-4 border-t border-border/50 bg-muted/5 px-6 py-4 sm:flex-row'>
          <div className='flex flex-col items-center gap-4 text-xs text-muted-foreground sm:flex-row'>
            <p>
              Menampilkan <span className='font-semibold text-foreground'>{startItemIdx}</span> -{' '}
              <span className='font-semibold text-foreground'>{endItemIdx}</span> dari{' '}
              <span className='font-semibold text-foreground'>{totalItems}</span> pengajuan
            </p>

            <div className='hidden h-3 w-px bg-border sm:block' />

            <div className='flex items-center gap-1.5'>
              <span>Baris per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className='h-7 cursor-pointer rounded-lg border border-border bg-background px-1.5 text-xs text-foreground transition-colors hover:bg-muted focus:outline-none'
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>
          </div>

          <div className='flex items-center gap-1.5'>
            <button
              type='button'
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={activePage === 1}
              className='h-8 cursor-pointer rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40'
            >
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1
              const isCurrent = activePage === pageNum
              return (
                <button
                  key={pageNum}
                  type='button'
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xs font-bold transition-all',
                    isCurrent
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                      : 'border border-border bg-background text-foreground hover:bg-muted',
                  )}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              type='button'
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={activePage === totalPages}
              className='h-8 cursor-pointer rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40'
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedRequest && (
        <ApprovalDetailDrawer
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAction={async (id, action, note) => {
            if (action === 'approve') {
              await handleApprove(id, note)
            } else {
              await handleReject(id, note)
            }
          }}
        />
      )}
    </AppMain>
  )
}
