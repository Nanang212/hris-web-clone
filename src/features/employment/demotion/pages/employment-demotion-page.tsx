// employment-demotion-page.tsx — Demotion list and management page
import {
  IconCheck,
  IconChevronLeft,
  IconClock,
  IconPlus,
  IconSearch,
  IconTrendingUp,
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
  DemotionTable,
  type DemotionAction,
} from '@/features/employment/demotion/components/demotion-table'
import {
  useCreateDemotion,
  useGetDemotions,
  useGetEmployees,
} from '@/features/employment/demotion/hooks'
import type { EmployeeDemotion } from '@/features/employment/demotion/types'

import { DemotionCreateView, type DemotionFormData } from './demotion-create-view'
import { DemotionDetailView } from './demotion-detail-view'
import { DemotionPreviewView } from './demotion-preview-view'
import { DemotionReviewView } from './demotion-review-view'

type ActiveView =
  | 'list'
  | 'detail'
  | 'create'
  | 'preview-new'
  | 'preview-existing'
  | 'review-new'
  | 'review-existing'
  | 'edit-existing'

interface EmploymentDemotionPageProps {
  preselectedEmployeeId?: string
  preselectedName?: string
}

export function EmploymentDemotionPage({
  preselectedEmployeeId,
  preselectedName,
}: EmploymentDemotionPageProps = {}) {
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
  const [activeDemotion, setActiveDemotion] = useState<EmployeeDemotion | null>(null)
  const [backToView, setBackToView] = useState<'list' | 'detail'>('list')
  const [pendingFormData, setPendingFormData] = useState<DemotionFormData | null>(null)

  // ─── Data ──────────────────────────────────────────────────────────────────
  const {
    data: demotions = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useGetDemotions(searchValue || undefined, statusFilter !== 'all' ? statusFilter : undefined)

  const { data: employeesResult } = useGetEmployees({})
  const employees = employeesResult?.items ?? []

  const { mutate: submitDemotion, isPending: isSubmitting } = useCreateDemotion()

  // ─── Back button portal ────────────────────────────────────────────────────
  const setHasBackButton = useAppLayoutStore((state) => state.setHasBackButton)
  const backBtnNode = useAppLayoutStore((state) => state.backBtnNode)

  useEffect(() => {
    if (activeView !== 'list') {
      setHasBackButton(true)
      return () => setHasBackButton(false)
    }
  }, [activeView, setHasBackButton])

  // Auto-open detail for preselected employee when demotions load
  useEffect(() => {
    if (preselectedEmployeeId && demotions.length > 0) {
      const match = demotions.find((p) => p.employeeId === preselectedEmployeeId)
      if (match) {
        setTimeout(() => {
          setActiveDemotion(match)
          setActiveView('detail')
        }, 0)
      }
    }
  }, [preselectedEmployeeId, demotions])

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const pendingCount = demotions.filter((p) => p.status === 'pending').length
  const approvedCount = demotions.filter((p) => p.status === 'approved').length
  const rejectedCount = demotions.filter((p) => p.status === 'rejected').length
  const scheduledCount = demotions.filter((p) => p.status === 'scheduled').length

  const statsCards = [
    {
      title: 'Pending Proposals',
      value: pendingCount,
      desc: 'Awaiting approval',
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      color: 'text-amber-600',
      icon: IconTrendingUp,
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
    demotion: EmployeeDemotion,
    action: DemotionAction,
    source: 'list' | 'detail' = 'list',
  ) => {
    setActiveDemotion(demotion)
    if (action === 'detail') {
      setActiveView('detail')
    } else if (action === 'review') {
      setBackToView(source)
      setActiveView('review-existing')
    } else if (action === 'edit') {
      setBackToView(source)
      setPendingFormData({
        employeeId: demotion.employeeId,
        newPosition: demotion.newPosition,
        newGrade: demotion.newGrade,
        newSalary: demotion.newSalary,
        effectiveDate: demotion.effectiveDate,
        reason: demotion.reason,
        approvalRoute: demotion.approvalRoute,
      })
      setActiveView('preview-existing')
    }
  }

  const handleSubmitNew = () => {
    if (!pendingFormData) return
    submitDemotion(pendingFormData, {
      onSuccess: () => {
        snackbar.success('Demotion proposal submitted successfully!')
        setActiveView('list')
        setPendingFormData(null)
        setActiveDemotion(null)
      },
      onError: () => snackbar.error('Failed to submit demotion proposal.'),
    })
  }

  const handleSubmitReviewExisting = () => {
    snackbar.success('Demotion submitted for approval successfully!')
    setActiveView(backToView)
  }

  // ─── AppMain Header Props ──────────────────────────────────────────────────
  let title = 'Demotion'
  let subtitle = 'Manage employee position, grade level, and salary packages adjustments.'
  let breadcrumbs: Array<{ label: string; to?: LinkProps['to'] }> = [
    { to: '/', label: 'Company' },
    { to: '/employment', label: 'Employment' },
    { to: '.', label: 'Demotion' },
  ]
  let actions: React.ReactNode = (
    <Button
      size='sm'
      onClick={() => {
        setPendingFormData(null)
        setActiveView('create')
      }}
    >
      <IconPlus data-icon='inline-start' />
      New Demotion
    </Button>
  )

  if (activeView === 'detail') {
    title = 'Demotion Detail · Before & After'
    subtitle = 'View current and proposed position adjustments comparison.'
    breadcrumbs = [...breadcrumbs, { to: '.', label: 'Detail' }]
    actions = null
  } else if (activeView === 'create') {
    title = 'Create Demotion'
    subtitle = 'Prepare position, grade, and compensation changes before review and approval.'
    breadcrumbs = [...breadcrumbs, { to: '.', label: 'Create' }]
    actions = null
  } else if (activeView === 'edit-existing') {
    title = 'Edit Demotion'
    subtitle = 'Prepare position, grade, and compensation changes before review and approval.'
    breadcrumbs =
      backToView === 'detail'
        ? [...breadcrumbs, { label: 'Detail' }, { to: '.', label: 'Edit' }]
        : [...breadcrumbs, { to: '.', label: 'Edit' }]
    actions = null
  } else if (activeView === 'preview-new') {
    title = 'Demotion Proposal'
    subtitle = 'Verify the position, grade, and compensation adjustments.'
    breadcrumbs = [...breadcrumbs, { label: 'Create' }, { to: '.', label: 'Preview' }]
    actions = null
  } else if (activeView === 'preview-existing') {
    title = 'Demotion Proposal'
    subtitle = 'Verify the position, grade, and compensation adjustments.'
    breadcrumbs =
      backToView === 'detail'
        ? [...breadcrumbs, { label: 'Detail' }, { label: 'Edit' }, { to: '.', label: 'Preview' }]
        : [...breadcrumbs, { label: 'Edit' }, { to: '.', label: 'Preview' }]
    actions = null
  } else if (activeView === 'review-new') {
    title = 'Demotion · Review & Confirm'
    subtitle = 'Confirm new position and grade before submitting.'
    breadcrumbs = [
      ...breadcrumbs,
      { label: 'Create' },
      { label: 'Preview' },
      { to: '.', label: 'Review' },
    ]
    actions = null
  } else if (activeView === 'review-existing') {
    title = 'Demotion · Review & Confirm'
    subtitle = 'Confirm new position and grade before submitting.'
    breadcrumbs =
      backToView === 'detail'
        ? [
            ...breadcrumbs,
            { label: 'Detail' },
            { label: 'Edit' },
            { label: 'Preview' },
            { to: '.', label: 'Review' },
          ]
        : [...breadcrumbs, { label: 'Edit' }, { label: 'Preview' }, { to: '.', label: 'Review' }]
    actions = null
  }

  return (
    <AppMain
      pending={isPending && demotions.length === 0}
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
              } else if (activeView === 'edit-existing') {
                setActiveView('preview-existing')
              } else if (activeView === 'preview-new') {
                setActiveView('create')
              } else if (activeView === 'preview-existing') {
                setActiveView(backToView)
              } else if (activeView === 'review-new') {
                setActiveView('preview-new')
              } else if (activeView === 'review-existing') {
                setActiveView('preview-existing')
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
      {activeView === 'detail' && activeDemotion && (
        <DemotionDetailView
          demotion={activeDemotion}
          onBack={() => setActiveView('list')}
          onAction={(action) => {
            setBackToView('detail')
            if (action === 'review') {
              setPendingFormData({
                employeeId: activeDemotion.employeeId,
                newPosition: activeDemotion.newPosition,
                newGrade: activeDemotion.newGrade,
                newSalary: activeDemotion.newSalary,
                effectiveDate: activeDemotion.effectiveDate,
                reason: activeDemotion.reason,
                approvalRoute: activeDemotion.approvalRoute,
              })
              setActiveView('review-existing')
            } else if (action === 'edit') {
              setPendingFormData({
                employeeId: activeDemotion.employeeId,
                newPosition: activeDemotion.newPosition,
                newGrade: activeDemotion.newGrade,
                newSalary: activeDemotion.newSalary,
                effectiveDate: activeDemotion.effectiveDate,
                reason: activeDemotion.reason,
                approvalRoute: activeDemotion.approvalRoute,
              })
              setActiveView('preview-existing')
            }
          }}
        />
      )}

      {/* ── CREATE VIEW ───────────────────────────────────────────────────── */}
      {activeView === 'create' && (
        <DemotionCreateView
          employees={employees}
          onCancel={() => setActiveView('list')}
          onReview={(data) => {
            setPendingFormData(data)
            setActiveView('preview-new')
          }}
        />
      )}

      {/* ── EDIT EXISTING VIEW ─────────────────────────────────────────────── */}
      {activeView === 'edit-existing' && pendingFormData && (
        <DemotionCreateView
          employees={employees}
          initialData={pendingFormData}
          onCancel={() => setActiveView(backToView)}
          onReview={(data) => {
            setPendingFormData(data)
            setActiveView('preview-existing')
          }}
        />
      )}

      {/* ── PREVIEW NEW VIEW ──────────────────────────────────────────────── */}
      {activeView === 'preview-new' && pendingFormData && (
        <DemotionPreviewView
          formData={pendingFormData}
          employees={employees}
          onEdit={() => setActiveView('create')}
          onReview={() => setActiveView('review-new')}
        />
      )}

      {/* ── PREVIEW EXISTING VIEW ─────────────────────────────────────────── */}
      {activeView === 'preview-existing' && pendingFormData && (
        <DemotionPreviewView
          formData={pendingFormData}
          employees={employees}
          onEdit={() => setActiveView('edit-existing')}
          onReview={() => setActiveView('review-existing')}
        />
      )}

      {/* ── REVIEW NEW VIEW ───────────────────────────────────────────────── */}
      {activeView === 'review-new' && pendingFormData && (
        <DemotionReviewView
          formData={pendingFormData}
          employees={employees}
          onBack={() => setActiveView('preview-new')}
          onSubmit={handleSubmitNew}
          isPending={isSubmitting}
        />
      )}

      {/* ── REVIEW EXISTING VIEW ──────────────────────────────────────────── */}
      {activeView === 'review-existing' && pendingFormData && (
        <DemotionReviewView
          formData={pendingFormData}
          employees={employees}
          onBack={() => setActiveView('preview-existing')}
          onSubmit={handleSubmitReviewExisting}
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

          {/* Search/Filters */}
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
          <DemotionTable
            demotions={demotions}
            isPending={isPending && demotions.length === 0}
            isFetching={isFetching}
            onAction={(pro, action) => handleTableAction(pro, action, 'list')}
          />
        </>
      )}
    </AppMain>
  )
}
