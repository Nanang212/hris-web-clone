import {
  IconCalendarWeek,
  IconCategory,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconCoin,
  IconEye,
  IconFileText,
  IconPlane,
  IconReceipt,
  IconReportMoney,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import { useState } from 'react'

import {
  dummyWorkflows,
  moduleColors,
} from '@/features/settings/approval-workflow/data'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { TablePagination } from '@/shared/components/ui/table-pagination'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { useLocale } from '@/i18n/local-store'
import { m } from '@/i18n/paraglide/messages'

import { useApprovalSyncStore } from '@/shared/lib/approval-sync-store'
import { ApprovalActionDialog } from '@/shared/components/approval/approval-action-dialog'
import { ApprovalDetailDrawer } from './components/detail-drawer'
import type { ApprovalRequest } from './types'

type TabType = string
type StatusFilterType = 'all' | 'pending' | 'approved' | 'rejected'

export function ApprovalPage() {
  const locale = useLocale()
  const { approvals, approve: syncApprove, reject: syncReject } = useApprovalSyncStore()
  const requests = approvals

  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const tabConfig: Record<string, { label: string; icon: typeof IconCategory }> = {
    all: { label: m.approval_tab_all(), icon: IconCategory },
    leave: { label: m.approval_tab_leave(), icon: IconCalendarWeek },
    overtime: { label: m.approval_tab_overtime(), icon: IconClock },
    claim: { label: m.approval_tab_claim(), icon: IconReceipt },
    business_trip: { label: m.approval_tab_business_trip(), icon: IconPlane },
    reimbursement: { label: m.approval_tab_reimbursement(), icon: IconReportMoney },
    loan: { label: m.approval_tab_loan(), icon: IconCoin },
    resignation: { label: m.approval_tab_resignation(), icon: IconFileText },
    promotion: { label: m.approval_tab_promotion(), icon: IconCoin },
  }

  const getModuleLabel = (type: string) => {
    switch (type) {
      case 'leave':
        return m.approval_tab_leave()
      case 'overtime':
        return m.approval_tab_overtime()
      case 'claim':
        return m.approval_tab_claim()
      case 'business_trip':
        return m.approval_tab_business_trip()
      case 'reimbursement':
        return m.approval_tab_reimbursement()
      case 'resignation':
        return m.approval_tab_resignation()
      case 'loan':
        return m.approval_tab_loan()
      case 'promotion':
        return m.approval_tab_promotion()
      default:
        return type.toUpperCase()
    }
  }

  // Derive active tabs dynamically from workflows with active status
  const activeTabs = [
    'all',
    ...dummyWorkflows.filter((w) => w.status === 'active').map((w) => w.module),
  ]

  // Dialog Confirmation State
  const [dialogState, setDialogState] = useState<{
    open: boolean
    request: ApprovalRequest | null
    action: 'approve' | 'reject'
  }>({
    open: false,
    request: null,
    action: 'approve',
  })

  // Handlers
  const handleOpenDialog = (req: ApprovalRequest, action: 'approve' | 'reject') => {
    setDialogState({
      open: true,
      request: req,
      action,
    })
  }

  const handleApprove = async (id: string, note = '') => {
    try {
      syncApprove(id, note || 'Approved from Approval Center.')
      snackbar.success(m.approval_toast_approved())
      setSelectedRequest(null)
    } catch (err) {
      snackbar.exception(err)
    }
  }

  const handleReject = async (id: string, note = '') => {
    try {
      syncReject(id, note || 'Rejected from Approval Center.')
      snackbar.error(m.approval_toast_rejected())
      setSelectedRequest(null)
    } catch (err) {
      snackbar.exception(err)
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
  const activePage = Math.min(currentPage, Math.max(1, Math.ceil(totalItems / pageSize)))
  const paginatedRequests = filteredRequests.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  )

  // Counters
  const countPending = requests.filter((r) => r.status === 'pending').length
  const countApproved = requests.filter((r) => r.status === 'approved').length
  const countRejected = requests.filter((r) => r.status === 'rejected').length

  return (
    <AppMain
      breadcrumbs={[{ to: '.', label: 'Approval' }]}
      title={m.approval_inbox_title()}
      subtitle={m.approval_inbox_subtitle()}
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
            statusKey: 'pending' as StatusFilterType,
            label: m.approval_stat_pending(),
            count: countPending,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-100 dark:bg-amber-900/30',
          },
          {
            statusKey: 'approved' as StatusFilterType,
            label: m.approval_stat_approved(),
            count: countApproved,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          },
          {
            statusKey: 'rejected' as StatusFilterType,
            label: m.approval_stat_rejected(),
            count: countRejected,
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-100 dark:bg-red-900/30',
          },
        ].map((item, idx) => {
          const isSelected = statusFilter === item.statusKey
          return (
            <button
              key={idx}
              type='button'
              onClick={() => {
                setStatusFilter(item.statusKey)
                setCurrentPage(1)
              }}
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-2xl bg-card p-5 text-left shadow-sm transition-all hover:scale-[1.01]',
                isSelected
                  ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-background'
                  : 'ring-1 ring-foreground/5 hover:bg-muted/30',
              )}
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
            </button>
          )
        })}
      </div>

      {/* Tabs Layout Container matching mockup */}
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-2 shadow-sm'>
        {/* Horizontal tabs list - scrollable, no scrollbar */}
        <div className='no-scrollbar flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto pb-1 sm:max-w-[400px] sm:pb-0 md:max-w-[550px] lg:max-w-[700px]'>
          {activeTabs.map((type) => {
            const config = tabConfig[type] || { label: getModuleLabel(type), icon: IconCategory }
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
              placeholder={m.approval_search_placeholder()}
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
              <option value='all'>{m.approval_filter_all_status()}</option>
              <option value='pending'>{m.approval_filter_pending()}</option>
              <option value='approved'>{m.approval_filter_approved()}</option>
              <option value='rejected'>{m.approval_filter_rejected()}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Approval Inbox Table / List */}
      <div className='overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-foreground/5'>
        <div className='w-full overflow-x-auto pb-1'>
          <table className='w-full min-w-[1100px]'>
            <thead>
              <tr className='border-b border-border/50 bg-muted/20 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                <th className='w-12 py-3.5 pr-2 pl-6 text-left whitespace-nowrap'>
                  {m.approval_table_no()}
                </th>
                <th className='px-3 py-3.5 text-left whitespace-nowrap'>
                  {m.approval_table_employee()}
                </th>
                <th className='px-3 py-3.5 text-left whitespace-nowrap'>
                  {m.approval_table_module()}
                </th>
                <th className='px-3 py-3.5 text-left whitespace-nowrap'>
                  {m.approval_table_details()}
                </th>
                <th className='px-3 py-3.5 text-center whitespace-nowrap'>
                  {m.approval_table_workflow_level()}
                </th>
                <th className='px-3 py-3.5 text-center whitespace-nowrap'>
                  {m.approval_table_submitted()}
                </th>
                <th className='px-3 py-3.5 text-center whitespace-nowrap'>
                  {m.approval_table_status()}
                </th>
                <th className='py-3.5 pr-6 pl-3 text-center whitespace-nowrap'>
                  {m.approval_table_action()}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/50'>
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className='py-16 text-center text-sm text-muted-foreground'>
                    <p className='font-semibold text-foreground'>{m.approval_empty_title()}</p>
                    <p className='mt-1 text-xs'>{m.approval_empty_description()}</p>
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
                      <td className='py-4 pr-2 pl-6 text-xs font-semibold text-muted-foreground whitespace-nowrap'>
                        {rowNum}
                      </td>

                      {/* Employee profile */}
                      <td className='px-3 py-4 whitespace-nowrap'>
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
                      <td className='px-3 py-4 whitespace-nowrap'>
                        <span
                          className={cn(
                            'inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                            moduleColorCls,
                          )}
                        >
                          {getModuleLabel(req.requestType)}
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
                      <td className='px-3 py-4 text-center whitespace-nowrap'>
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
                      <td className='px-3 py-4 text-center text-xs text-muted-foreground whitespace-nowrap'>
                        {req.requestDate}
                      </td>

                      {/* Status */}
                      <td className='px-3 py-4 text-center whitespace-nowrap'>
                        <span
                          className={cn(
                            'inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase',
                            req.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : req.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
                          )}
                        >
                          {req.status === 'pending'
                            ? m.approval_status_badge_pending()
                            : req.status === 'approved'
                              ? m.approval_status_badge_approved()
                              : m.approval_status_badge_rejected()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className='py-4 pr-6 pl-3 text-center whitespace-nowrap'>
                        <div className='flex items-center justify-center gap-1.5'>
                          {/* Details */}
                          <button
                            type='button'
                            onClick={() => setSelectedRequest(req)}
                            className='flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                            title={m.approval_action_detail()}
                          >
                            <IconEye size={14} />
                          </button>

                          {req.status === 'pending' && (
                            <>
                              {/* Quick Approve */}
                              <button
                                type='button'
                                onClick={() => handleOpenDialog(req, 'approve')}
                                className='flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100'
                                title={m.approval_action_approve()}
                              >
                                <IconCheck size={14} stroke={2.5} />
                              </button>

                              {/* Quick Reject */}
                              <button
                                type='button'
                                onClick={() => handleOpenDialog(req, 'reject')}
                                className='flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition-colors hover:bg-red-100'
                                title={m.approval_action_reject()}
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
        <TablePagination
          totalItems={totalItems}
          currentPage={activePage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 15, 20]}
        />
      </div>

      {/* Confirmation Dialog */}
      <ApprovalActionDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
        action={dialogState.action}
        itemName={
          dialogState.request
            ? `${dialogState.request.employeeName} - ${getModuleLabel(dialogState.request.requestType)}`
            : undefined
        }
        itemDetail={dialogState.request?.details}
        onConfirm={async (note) => {
          if (!dialogState.request) return
          if (dialogState.action === 'approve') {
            await handleApprove(dialogState.request.id, note)
          } else {
            await handleReject(dialogState.request.id, note)
          }
        }}
      />

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
