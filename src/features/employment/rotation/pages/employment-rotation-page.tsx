// employment-rotation-page.tsx — Rotation list and management page
import {
  IconBriefcase,
  IconCheck,
  IconChevronLeft,
  IconClock,
  IconPlus,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import type { LinkProps } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { useAppLayoutStore } from '@/shared/components/app-layout/app-layout-store'
import { AppMain } from '@/shared/components/app-layout/app-main'
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
import {
  useCreateRotation,
  useGetEmployees,
  useGetRotations,
} from '@/features/employment/rotation/hooks'
import type { EmployeeRotation } from '@/features/employment/rotation/types'
import {
  RotationTable,
  type RotationAction,
} from '@/features/employment/rotation/components/rotation-table'

import { RotationApproveView } from './rotation-approve-view'
import { RotationCreateView, type RotationFormData } from './rotation-create-view'
import { RotationDetailView } from './rotation-detail-view'
import { RotationReviewView } from './rotation-review-view'

type ActiveView = 'list' | 'detail' | 'create' | 'review-new' | 'review-existing' | 'approve'

interface EmploymentRotationPageProps {
  preselectedEmployeeId?: string
  preselectedName?: string
}

export function EmploymentRotationPage({
  preselectedEmployeeId,
  preselectedName,
}: EmploymentRotationPageProps = {}) {
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
  const [activeRotation, setActiveRotation] = useState<EmployeeRotation | null>(null)
  const [backToView, setBackToView] = useState<'list' | 'detail'>('list')
  const [pendingFormData, setPendingFormData] = useState<RotationFormData | null>(null)

  // ─── Data ──────────────────────────────────────────────────────────────────
  const {
    data: rotations = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useGetRotations(searchValue || undefined, statusFilter !== 'all' ? statusFilter : undefined)

  const { data: employeesResult } = useGetEmployees({})
  const employees = employeesResult?.items ?? []

  const { mutate: submitRotation, isPending: isSubmitting } = useCreateRotation()

  // ─── Back button portal ────────────────────────────────────────────────────
  const setHasBackButton = useAppLayoutStore((state) => state.setHasBackButton)
  const backBtnNode = useAppLayoutStore((state) => state.backBtnNode)

  useEffect(() => {
    if (activeView !== 'list') {
      setHasBackButton(true)
      return () => setHasBackButton(false)
    }
  }, [activeView, setHasBackButton])

  // Auto-open detail for preselected employee when rotations load
  useEffect(() => {
    if (preselectedEmployeeId && rotations.length > 0) {
      const match = rotations.find((m) => m.employeeId === preselectedEmployeeId)
      if (match) {
        setTimeout(() => {
          setActiveRotation(match)
          setActiveView('detail')
        }, 0)
      }
    }
  }, [preselectedEmployeeId, rotations])

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const allRotations = rotations
  const pendingCount = allRotations.filter((m) => m.status === 'pending').length
  const approvedCount = allRotations.filter((m) => m.status === 'approved').length
  const rejectedCount = allRotations.filter((m) => m.status === 'rejected').length
  const scheduledCount = allRotations.filter((m) => m.status === 'scheduled').length

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
    rotation: EmployeeRotation,
    action: RotationAction,
    source: 'list' | 'detail' = 'list',
  ) => {
    setActiveRotation(rotation)
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
    submitRotation(pendingFormData, {
      onSuccess: () => {
        snackbar.success('Rotation request submitted successfully!')
        setActiveView('list')
        setPendingFormData(null)
        setActiveRotation(null)
      },
      onError: () => snackbar.error('Failed to submit rotation request.'),
    })
  }

  const handleSubmitReviewExisting = () => {
    snackbar.success('Rotation submitted for approval successfully!')
    setActiveView(backToView)
  }

  // ─── AppMain Header Props ──────────────────────────────────────────────────
  let title = 'Rotation'
  let subtitle = 'Request and approve organizational moves with before/after comparison.'
  let breadcrumbs: Array<{ label: string; to?: LinkProps['to'] }> = [
    { to: '/', label: 'Company' },
    { to: '/employment', label: 'Employment' },
    { to: '.', label: 'Rotation' },
  ]
  let actions: React.ReactNode = (
    <Button size='sm' onClick={() => setActiveView('create')}>
      <IconPlus data-icon='inline-start' />
      New Rotation
    </Button>
  )

  if (activeView === 'detail') {
    title = 'Rotation Detail · Before & After'
    subtitle = 'View current and proposed organization assignment comparison.'
    breadcrumbs = [...breadcrumbs, { to: '.', label: 'Detail' }]
    actions = null
  } else if (activeView === 'create') {
    title = 'Create Rotation'
    subtitle = "Set the employee's new organization assignment and effective date before review."
    breadcrumbs = [...breadcrumbs, { to: '.', label: 'Create' }]
    actions = null
  } else if (activeView === 'review-new') {
    title = 'Rotation · Review & Confirm'
    subtitle = 'Confirm organization movement before submitting.'
    breadcrumbs = [...breadcrumbs, { label: 'Create' }, { to: '.', label: 'Review' }]
    actions = null
  } else if (activeView === 'review-existing') {
    title = 'Rotation · Review & Confirm'
    subtitle = 'Confirm organization movement before submitting.'
    breadcrumbs =
      backToView === 'detail'
        ? [...breadcrumbs, { label: 'Detail' }, { to: '.', label: 'Review' }]
        : [...breadcrumbs, { to: '.', label: 'Review' }]
    actions = null
  } else if (activeView === 'approve') {
    title = 'Rotation · Approve'
    subtitle = 'Review the organization movement and approve or reject the request.'
    breadcrumbs =
      backToView === 'detail'
        ? [...breadcrumbs, { label: 'Detail' }, { to: '.', label: 'Approve' }]
        : [...breadcrumbs, { to: '.', label: 'Approve' }]
    actions = null
  }

  return (
    <AppMain
      pending={isPending && rotations.length === 0}
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
      {activeView === 'detail' && activeRotation && (
        <RotationDetailView
          rotation={activeRotation}
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
        <RotationCreateView
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
        <RotationReviewView
          formData={pendingFormData}
          employees={employees}
          onBack={() => setActiveView('create')}
          onSubmit={handleSubmitNew}
          isPending={isSubmitting}
        />
      )}

      {/* ── REVIEW EXISTING ───────────────────────────────────────────────── */}
      {activeView === 'review-existing' && activeRotation && (
        <RotationReviewView
          formData={{
            employeeId: activeRotation.employeeId,
            newDivision: activeRotation.newDivision,
            newDepartment: activeRotation.newDepartment,
            newPosition: activeRotation.newPosition,
            newSupervisor: activeRotation.newSupervisor,
            newLocation: activeRotation.newLocation,
            effectiveDate: activeRotation.effectiveDate,
            reason: activeRotation.reason,
            approvalRoute: activeRotation.approvalRoute,
          }}
          employees={employees}
          onBack={() => setActiveView(backToView)}
          onSubmit={handleSubmitReviewExisting}
        />
      )}
      {/* ── APPROVE VIEW ──────────────────────────────────────────────────── */}
      {activeView === 'approve' && activeRotation && (
        <RotationApproveView
          rotation={activeRotation}
          onBack={() => setActiveView(backToView)}
          onApprove={() => {
            snackbar.success(`Rotation for ${activeRotation.fullName} approved successfully!`)
            setActiveView(backToView)
          }}
          onReject={() => {
            snackbar.error(`Rotation for ${activeRotation.fullName} has been rejected.`)
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
                  className={`flex items-center gap-4 rounded-2xl border border-border/50 p-5 shadow-sm ${card.bg}`}
                >
                  <div className={`rounded-xl bg-white/60 p-2.5 dark:bg-white/10 ${card.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-xs font-semibold text-muted-foreground'>
                      {card.title}
                    </span>
                    <span className={`text-2xl font-extrabold ${card.color}`}>{card.value}</span>
                    <span className='text-[11px] text-muted-foreground'>{card.desc}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Filter and Search */}
          <div className='mb-4 flex flex-wrap items-center gap-3'>
            <div className='flex min-w-[320px] flex-1 gap-2'>
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
              <Button variant='outline' onClick={handleReset}>
                Reset
              </Button>
            </div>

            <Select onValueChange={(val) => setStatusFilter(val)} value={statusFilter}>
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
          <RotationTable
            rotations={rotations}
            isPending={isPending && rotations.length === 0}
            isFetching={isFetching}
            onAction={(mut, action) => handleTableAction(mut, action, 'list')}
          />
        </>
      )}
    </AppMain>
  )
}
