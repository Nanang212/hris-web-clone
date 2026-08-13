import { useState } from 'react'
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

import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { dummyWorkflows, moduleColors, moduleLabels } from '../approval-workflow/data'
import { approveRequest, rejectRequest } from './api'
import { ApprovalDetailDrawer } from './components/detail-drawer'
import type { ApprovalRequest } from './types'

interface ApprovalPageProps {
  initialRequests: ApprovalRequest[]
}

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

export function ApprovalPage({ initialRequests }: ApprovalPageProps) {
  const [requests, setRequests] = useState<ApprovalRequest[]>(initialRequests)
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
    ...dummyWorkflows
      .filter((w) => w.status === 'active')
      .map((w) => w.module),
  ]

  // Handlers
  const handleApprove = async (id: string, note = '') => {
    try {
      const res = await approveRequest(id, note)
      if (res.success) {
        setRequests((prev) => prev.map((r) => (r.id === id ? res.request : r)))
        snackbar.success('Pengajuan berhasil disetujui!')
      }
    } catch {
      snackbar.error('Gagal memproses persetujuan.')
    }
  }

  const handleReject = async (id: string, note = '') => {
    try {
      const res = await rejectRequest(id, note)
      if (res.success) {
        setRequests((prev) => prev.map((r) => (r.id === id ? res.request : r)))
        snackbar.success('Pengajuan berhasil ditolak.')
      }
    } catch {
      snackbar.error('Gagal memproses penolakan.')
    }
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
  const paginatedRequests = filteredRequests.slice((activePage - 1) * pageSize, activePage * pageSize)

  const startItemIdx = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1
  const endItemIdx = Math.min(activePage * pageSize, totalItems)

  // Counters
  const countPending = requests.filter((r) => r.status === 'pending').length
  const countApproved = requests.filter((r) => r.status === 'approved').length
  const countRejected = requests.filter((r) => r.status === 'rejected').length

  return (
    <div className='flex flex-col gap-6 p-5 lg:p-6'>
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
      {/* Header */}
      <div>
        <p className='text-xs text-muted-foreground'>Persetujuan Mandiri / Approval</p>
        <h2 className='text-2xl font-bold tracking-tight'>Approval Inbox</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Kelola dan tinjau seluruh pengajuan persetujuan yang ditujukan kepada Anda
        </p>
      </div>

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
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                {item.label}
              </p>
              <p className={cn('text-3xl font-extrabold mt-1.5', item.color)}>{item.count}</p>
            </div>
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', item.bg)}>
              <IconCircleCheck size={22} className={item.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Layout Container matching mockup */}
      <div className='flex flex-wrap items-center justify-between gap-4 border border-border/50 bg-card p-2 rounded-2xl shadow-sm'>
        {/* Horizontal tabs list - scrollable, no scrollbar */}
        <div className='flex items-center overflow-x-auto flex-nowrap gap-1 pb-1 sm:pb-0 max-w-full sm:max-w-[400px] md:max-w-[550px] lg:max-w-[700px] no-scrollbar'>
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
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer flex-shrink-0',
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
        <div className='flex flex-wrap items-center gap-3 w-full sm:w-auto'>
          {/* Search bar */}
          <div className='relative flex-1 sm:flex-initial'>
            <IconSearch
              size={14}
              className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground'
            />
            <input
              type='text'
              placeholder='Cari karyawan / pengajuan...'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className='h-9 w-full sm:w-60 rounded-xl border border-input bg-background pl-9.5 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all'
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
              className='h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 cursor-pointer'
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
      <div className='rounded-2xl bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border/50 bg-muted/20'>
                <th className='py-3.5 pl-6 pr-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground w-12'>
                  No.
                </th>
                <th className='py-3.5 px-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Karyawan
                </th>
                <th className='px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Modul
                </th>
                <th className='px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Rincian Pengajuan
                </th>
                <th className='px-3 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Workflow Level
                </th>
                <th className='px-3 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Diajukan
                </th>
                <th className='px-3 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Status
                </th>
                <th className='py-3.5 pl-3 pr-6 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground'>
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
                      className='group hover:bg-muted/10 transition-colors duration-150'
                    >
                      {/* Number */}
                      <td className='py-4 pl-6 pr-2 text-xs font-semibold text-muted-foreground'>
                        {rowNum}
                      </td>

                      {/* Employee profile */}
                      <td className='py-4 px-3'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary'>
                            {req.employeeName.charAt(0)}
                          </div>
                          <div>
                            <p className='text-xs font-bold text-foreground'>{req.employeeName}</p>
                            <p className='text-[10px] text-muted-foreground mt-0.5'>
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
                        <p className='text-xs font-semibold text-foreground truncate max-w-xs'>
                          {req.details}
                        </p>
                        {req.reason && (
                          <p className='text-[10px] text-muted-foreground truncate max-w-xs mt-0.5'>
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
                      <td className='py-4 pl-3 pr-6 text-center'>
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
                                className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors'
                                title='Setujui Cepat'
                              >
                                <IconCheck size={14} stroke={2.5} />
                              </button>

                              {/* Quick Reject */}
                              <button
                                type='button'
                                onClick={() => handleReject(req.id, 'Ditolak cepat.')}
                                className='flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors'
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
        <div className='border-t border-border/50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/5'>
          <div className='flex flex-col sm:flex-row items-center gap-4 text-xs text-muted-foreground'>
            <p>
              Menampilkan <span className='font-semibold text-foreground'>{startItemIdx}</span> - <span className='font-semibold text-foreground'>{endItemIdx}</span> dari <span className='font-semibold text-foreground'>{totalItems}</span> pengajuan
            </p>
            
            <div className='hidden sm:block h-3 w-px bg-border' />
            
            <div className='flex items-center gap-1.5'>
              <span>Baris per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className='h-7 rounded-lg border border-border bg-background px-1.5 text-xs text-foreground focus:outline-none cursor-pointer hover:bg-muted transition-colors'
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
              className='h-8 px-3 rounded-lg border border-border text-xs font-semibold bg-background text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer'
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
                    'h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer',
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
              className='h-8 px-3 rounded-lg border border-border text-xs font-semibold bg-background text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer'
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
    </div>
  )
}
