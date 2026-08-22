// employment-mutation-page.tsx — Mutation list and management page
import {
  IconSearch,
  IconPlus,
  IconChevronLeft,
  IconBriefcase,
  IconCheck,
  IconX,
  IconClock,
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { LinkProps } from '@tanstack/react-router'
import { useAppLayoutStore } from '@/shared/components/app-layout/app-layout-store'

import { useGetMutations, useCreateMutation, useGetEmployees } from '@/features/employment/hooks'
import type { EmployeeMutation } from '@/features/employment/types'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { MutationTable } from '@/features/employment/components/mutation-table'
import type { MutationAction } from '@/features/employment/components/mutation-table'
import { MutationDetailView } from './mutation-detail-view'
import { MutationCreateView } from './mutation-create-view'
import type { MutationFormData } from './mutation-create-view'
import { MutationReviewView } from './mutation-review-view'
import { MutationApproveView } from './mutation-approve-view'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { snackbar } from '@/shared/lib/snackbar'

type ActiveView = 'list' | 'detail' | 'create' | 'review-new' | 'review-existing' | 'approve'

interface EmploymentMutationPageProps {
  preselectedEmployeeId?: string
  preselectedName?: string
}

export function EmploymentMutationPage({
  preselectedEmployeeId,
  preselectedName,
}: EmploymentMutationPageProps = {}) {
  // ─── Filter/Search State ───────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState(preselectedName || '')
  const [searchValue, setSearchValue] = useState(preselectedName || '')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleSearch = () => setSearchValue(searchInput)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') setSearchValue(searchInput)
  }
  const handleReset = () => {
    setSearchInput('')
    setSearchValue('')
    setStatusFilter('all')
  }

  // ─── Sub-page View State ───────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<ActiveView>('list')
  const [activeMutation, setActiveMutation] = useState<EmployeeMutation | null>(null)
  const [backToView, setBackToView] = useState<'list' | 'detail'>('list')
  const [pendingFormData, setPendingFormData] = useState<MutationFormData | null>(null)

  // ─── Data ──────────────────────────────────────────────────────────────────
  const { data: mutations = [], isPending, isFetching, error, refetch } = useGetMutations(
    searchValue || undefined,
    statusFilter !== 'all' ? statusFilter : undefined,
  )

  const { data: employeesResult } = useGetEmployees({})
  const employees = employeesResult?.items ?? []

  const { mutate: submitMutation, isPending: isSubmitting } = useCreateMutation()

  // ─── Back button portal ────────────────────────────────────────────────────
  const setHasBackButton = useAppLayoutStore((state) => state.setHasBackButton)
  const backBtnNode = useAppLayoutStore((state) => state.backBtnNode)

  useEffect(() => {
    if (activeView !== 'list') {
      setHasBackButton(true)
      return () => setHasBackButton(false)
    }
  }, [activeView, setHasBackButton])

  // Auto-open detail for preselected employee when mutations load
  useEffect(() => {
    if (preselectedEmployeeId && mutations.length > 0) {
      const match = mutations.find((m) => m.employeeId === preselectedEmployeeId)
      if (match) {
        setTimeout(() => {
          setActiveMutation(match)
          setActiveView('detail')
        }, 0)
      }
    }
  }, [preselectedEmployeeId, mutations])

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const allMutations = mutations
  const pendingCount = allMutations.filter((m) => m.status === 'pending').length
  const approvedCount = allMutations.filter((m) => m.status === 'approved').length
  const rejectedCount = allMutations.filter((m) => m.status === 'rejected').length
  const scheduledCount = allMutations.filter((m) => m.status === 'scheduled').length

  const statsCards = [
    {
      title: 'Pending Requests',
      value: pendingCount,
      desc: 'Awaiting approval',
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      color: 'text-amber-600',
      icon: IconBriefcase,
    },
    {
      title: 'Approved This Month',
      value: approvedCount,
      desc: 'Completed moves',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      color: 'text-emerald-600',
      icon: IconCheck,
    },
    {
      title: 'Rejected',
      value: rejectedCount,
      desc: 'This month',
      bg: 'bg-rose-50/50 dark:bg-rose-950/20',
      color: 'text-rose-600',
      icon: IconX,
    },
    {
      title: 'Scheduled',
      value: scheduledCount,
      desc: 'Future effective',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      color: 'text-blue-600',
      icon: IconClock,
    },
  ]

  // ─── Action handlers ───────────────────────────────────────────────────────
  const handleTableAction = (
    mutation: EmployeeMutation,
    action: MutationAction,
    source: 'list' | 'detail' = 'list',
  ) => {
    setActiveMutation(mutation)
    if (action === 'detail') {
      setActiveView('detail')
    } else if (action === 'review') {
      setBackToView(source)
      setActiveView('review-existing')
    } else if (action === 'approve') {
      setBackToView(source)
      setActiveView('approve')
    }
  }

  const handleSubmitNew = () => {
    if (!pendingFormData) return
    submitMutation(pendingFormData, {
      onSuccess: () => {
        snackbar.success('Mutation request submitted successfully!')
        setActiveView('list')
        setPendingFormData(null)
        setActiveMutation(null)
      },
      onError: () => snackbar.error('Failed to submit mutation request.'),
    })
  }

  const handleSubmitReviewExisting = () => {
    snackbar.success('Mutation submitted for approval successfully!')
    setActiveView(backToView)
  }

  // ─── AppMain Header Props ──────────────────────────────────────────────────
  let title = 'Mutation'
  let subtitle = 'Request and approve organizational moves with before/after comparison.'
  let breadcrumbs: Array<{ label: string; to?: LinkProps['to'] }> = [
    { to: '/', label: 'Company' },
    { to: '/company/employee', label: 'Employment' },
    { to: '.', label: 'Mutation' },
  ]
  let actions: React.ReactNode = (
    <Button size='sm' onClick={() => setActiveView('create')}>
      <IconPlus data-icon='inline-start' />
      New Mutation
    </Button>
  )

  if (activeView === 'detail') {
    title = 'Mutation Detail · Before & After'
    subtitle = 'View current and proposed organization assignment comparison.'
    breadcrumbs = [...breadcrumbs, { to: '.', label: 'Detail' }]
    actions = null
  } else if (activeView === 'create') {
    title = 'Create Mutation'
    subtitle = "Set the employee's new organization assignment and effective date before review."
    breadcrumbs = [...breadcrumbs, { to: '.', label: 'Create' }]
    actions = null
  } else if (activeView === 'review-new') {
    title = 'Mutation · Review & Confirm'
    subtitle = 'Confirm organization movement before submitting.'
    breadcrumbs = [...breadcrumbs, { label: 'Create' }, { to: '.', label: 'Review' }]
    actions = null
  } else if (activeView === 'review-existing') {
    title = 'Mutation · Review & Confirm'
    subtitle = 'Confirm organization movement before submitting.'
    breadcrumbs =
      backToView === 'detail'
        ? [...breadcrumbs, { label: 'Detail' }, { to: '.', label: 'Review' }]
        : [...breadcrumbs, { to: '.', label: 'Review' }]
    actions = null
  } else if (activeView === 'approve') {
    title = 'Mutation · Approve'
    subtitle = 'Review the organization movement and approve or reject the request.'
    breadcrumbs =
      backToView === 'detail'
        ? [...breadcrumbs, { label: 'Detail' }, { to: '.', label: 'Approve' }]
        : [...breadcrumbs, { to: '.', label: 'Approve' }]
    actions = null
  }

  return (
    <AppMain
      pending={isPending && mutations.length === 0}
      error={error}
      retry={refetch}
      breadcrumbs={breadcrumbs as React.ComponentProps<typeof AppMain>['breadcrumbs']}
      title={title}
      subtitle={subtitle}
      actions={actions}
      backTo={undefined}
    >
      {/* ── Back button portal ─────────────────────────────────────────────── */}
      {activeView !== 'list' &&
        backBtnNode &&
        createPortal(
          <Button
            variant='outline'
            size='icon'
            onClick={() => {
              if (activeView === 'detail' || activeView === 'create') {
                setActiveView('list')
              } else if (activeView === 'review-new') {
                setActiveView('create')
              } else if (activeView === 'approve' || activeView === 'review-existing') {
                setActiveView(backToView)
              } else {
                setActiveView(backToView)
              }
            }}
          >
            <IconChevronLeft size={24} />
          </Button>,
          backBtnNode,
        )}

      {/* ── DETAIL VIEW ───────────────────────────────────────────────────── */}
      {activeView === 'detail' && activeMutation && (
        <MutationDetailView
          mutation={activeMutation}
          onBack={() => setActiveView('list')}
          onAction={(action) => {
            setBackToView('detail')
            if (action === 'review') setActiveView('review-existing')
            else if (action === 'approve') setActiveView('approve')
          }}
        />
      )}

      {/* ── CREATE VIEW ───────────────────────────────────────────────────── */}
      {activeView === 'create' && (
        <MutationCreateView
          employees={employees}
          onCancel={() => setActiveView('list')}
          onReview={(data) => {
            setPendingFormData(data)
            setActiveView('review-new')
          }}
        />
      )}

      {/* ── REVIEW NEW ────────────────────────────────────────────────────── */}
      {activeView === 'review-new' && pendingFormData && (
        <MutationReviewView
          formData={pendingFormData}
          employees={employees}
          onBack={() => setActiveView('create')}
          onSubmit={handleSubmitNew}
          isPending={isSubmitting}
        />
      )}

      {/* ── REVIEW EXISTING ───────────────────────────────────────────────── */}
      {activeView === 'review-existing' && activeMutation && (
        <MutationReviewView
          formData={{
            employeeId: activeMutation.employeeId,
            newDivision: activeMutation.newDivision,
            newDepartment: activeMutation.newDepartment,
            newPosition: activeMutation.newPosition,
            newSupervisor: activeMutation.newSupervisor,
            newLocation: activeMutation.newLocation,
            effectiveDate: activeMutation.effectiveDate,
            reason: activeMutation.reason,
            approvalRoute: activeMutation.approvalRoute,
          }}
          employees={employees}
          onBack={() => setActiveView(backToView)}
          onSubmit={handleSubmitReviewExisting}
        />
      )}
      {/* ── APPROVE VIEW ──────────────────────────────────────────────────── */}
      {activeView === 'approve' && activeMutation && (
        <MutationApproveView
          mutation={activeMutation}
          onBack={() => setActiveView(backToView)}
          onApprove={() => {
            snackbar.success(`Mutation for ${activeMutation.fullName} approved successfully!`)
            setActiveView(backToView)
          }}
          onReject={() => {
            snackbar.error(`Mutation for ${activeMutation.fullName} has been rejected.`)
            setActiveView(backToView)
          }}
        />
      )}

      {/* ── LIST VIEW ─────────────────────────────────────────────────────── */}
      {activeView === 'list' && (
        <>
          {/* Stats Cards */}
          <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {statsCards.map((card, idx) => {
              const Icon = card.icon
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-4 rounded-2xl p-5 border border-border/50 shadow-sm ${card.bg}`}
                >
                  <div className={`rounded-xl p-2.5 bg-white/60 dark:bg-white/10 ${card.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-xs font-semibold text-muted-foreground'>{card.title}</span>
                    <span className={`text-2xl font-extrabold ${card.color}`}>{card.value}</span>
                    <span className='text-[11px] text-muted-foreground'>{card.desc}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Filter and Search */}
          <div className='mb-4 flex flex-wrap items-center gap-3'>
            <div className='flex flex-1 min-w-[320px] gap-2'>
              <div className='relative flex-1'>
                <IconSearch
                  size={16}
                  className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
                />
                <Input
                  placeholder='Search employee or position...'
                  className='pl-9'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
              <Button variant='outline' onClick={handleReset}>Reset</Button>
            </div>

            <Select
              onValueChange={(val) => setStatusFilter(val)}
              value={statusFilter}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='approved'>Approved</SelectItem>
                <SelectItem value='rejected'>Rejected</SelectItem>
                <SelectItem value='scheduled'>Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <MutationTable
            mutations={mutations}
            isPending={isPending && mutations.length === 0}
            isFetching={isFetching}
            onAction={(mut, action) => handleTableAction(mut, action, 'list')}
          />
        </>
      )}
    </AppMain>
  )
}
