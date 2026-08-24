// employment-resignation-page.tsx — Resignation list, create, review orchestration
import {
  IconSearch,
  IconPlus,
  IconChevronLeft,
  IconUsers,
  IconClock,
  IconCheck,
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { LinkProps } from '@tanstack/react-router'
import { useAppLayoutStore } from '@/shared/components/app-layout/app-layout-store'

import { useGetResignations, useCreateResignation, useGetEmployees } from '@/features/employment/hooks'
import type { EmployeeResignation } from '@/features/employment/types'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { ResignationTable } from '@/features/employment/components/resignation-table'
import type { ResignationAction } from '@/features/employment/components/resignation-table'
import { ResignationDetailView } from './resignation-detail-view'
import { ResignationCreateView } from './resignation-create-view'
import type { ResignationFormData } from './resignation-create-view'
import { ResignationReviewView } from './resignation-review-view'
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

type ActiveView =
  | 'list'
  | 'detail'
  | 'create'
  | 'review-new'
  | 'review-existing'

interface EmploymentResignationPageProps {
  preselectedEmployeeId?: string
  preselectedName?: string
}

export function EmploymentResignationPage({
  preselectedEmployeeId,
  preselectedName,
}: EmploymentResignationPageProps = {}) {
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
  const [activeResignation, setActiveResignation] = useState<EmployeeResignation | null>(null)
  const [backToView, setBackToView] = useState<'list' | 'detail'>('list')
  const [pendingFormData, setPendingFormData] = useState<ResignationFormData | null>(null)

  // ─── Data ──────────────────────────────────────────────────────────────────
  const { data: resignations = [], isPending, isFetching, error, refetch } = useGetResignations(
    searchValue || undefined,
    statusFilter !== 'all' ? statusFilter : undefined,
    preselectedEmployeeId,
  )
  const { data: employeesResult } = useGetEmployees({})
  const employees = employeesResult?.items ?? []
  const createResignationMutation = useCreateResignation()

  // ─── Back button portal ────────────────────────────────────────────────────
  const setHasBackButton = useAppLayoutStore((state) => state.setHasBackButton)
  const backBtnNode = useAppLayoutStore((state) => state.backBtnNode)

  useEffect(() => {
    if (activeView !== 'list') {
      setHasBackButton(true)
      return () => setHasBackButton(false)
    }
  }, [activeView, setHasBackButton])

  // Auto-open detail for preselected employee when resignations load
  useEffect(() => {
    if (preselectedEmployeeId && resignations.length > 0) {
      const match = resignations.find((r) => r.employeeId === preselectedEmployeeId)
      if (match) {
        setTimeout(() => {
          setActiveResignation(match)
          setActiveView('detail')
        }, 0)
      }
    } else if (preselectedEmployeeId && !isPending && resignations.length === 0) {
      // No existing resignation → open create form
      setTimeout(() => setActiveView('create'), 0)
    }
  }, [preselectedEmployeeId, resignations, isPending])

  // ─── Action handlers ───────────────────────────────────────────────────────
  const goBackToList = () => {
    setActiveView('list')
    setActiveResignation(null)
    setPendingFormData(null)
  }

  const handleTableAction = (resignation: EmployeeResignation, action: ResignationAction) => {
    setActiveResignation(resignation)
    if (action === 'detail') {
      setActiveView('detail')
    } else if (action === 'review') {
      setBackToView('list')
      setActiveView('review-existing')
    }
  }

  const handleDetailReview = () => {
    if (!activeResignation) return
    setBackToView('detail')
    setActiveView('review-existing')
  }

  const handleCreateReview = (formData: ResignationFormData) => {
    setPendingFormData(formData)
    setActiveView('review-new')
  }

  const handleBackButton = () => {
    if (activeView === 'detail' || activeView === 'create') {
      goBackToList()
    } else if (activeView === 'review-new') {
      setActiveView('create')
    } else if (activeView === 'review-existing') {
      if (backToView === 'detail') {
        setActiveView('detail')
      } else {
        goBackToList()
      }
    }
  }

  const handleSubmitNew = async () => {
    if (!pendingFormData) return
    try {
      await createResignationMutation.mutateAsync(pendingFormData)
      snackbar.success('Resignation submitted successfully.')
      goBackToList()
    } catch {
      snackbar.error('Failed to submit resignation. Please try again.')
    }
  }

  const handleSubmitExisting = async () => {
    snackbar.success('Resignation reviewed and confirmed.')
    goBackToList()
  }

  // ─── Title & breadcrumbs per view ─────────────────────────────────────────
  let title = 'Resignation'
  let subtitle = 'Manage employee offboarding and resignation cases.'
  let breadcrumbs: Array<{ label: string; to?: LinkProps['to'] }> = [
    { to: '/', label: 'Company' },
    { to: '/company/employee', label: 'Employment' },
    { to: '.', label: 'Resignation' },
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
      Create Resignation
    </Button>
  )

  if (activeView === 'detail') {
    title = 'Resignation Detail'
    subtitle = 'View resignation details and clearance progress.'
    breadcrumbs = [...breadcrumbs, { to: '.', label: 'Detail' }]
    actions = null
  } else if (activeView === 'create') {
    title = 'Create Resignation'
    subtitle = 'Fill in resignation details for review and confirmation.'
    breadcrumbs = [...breadcrumbs, { to: '.', label: 'Create' }]
    actions = null
  } else if (activeView === 'review-new') {
    title = 'Review Resignation'
    subtitle = 'Confirm details before final submission.'
    breadcrumbs = [...breadcrumbs, { label: 'Create' }, { to: '.', label: 'Review' }]
    actions = null
  } else if (activeView === 'review-existing') {
    title = 'Review Resignation'
    subtitle = 'Confirm details before final submission.'
    breadcrumbs =
      backToView === 'detail'
        ? [...breadcrumbs, { label: 'Detail' }, { to: '.', label: 'Review' }]
        : [...breadcrumbs, { to: '.', label: 'Review' }]
    actions = null
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const total = resignations.length
  const clearance = resignations.filter((r) => r.status === 'clearance').length
  const completed = resignations.filter((r) => r.status === 'completed').length
  const exiting = resignations.filter((r) => r.status === 'exit_interview').length

  return (
    <AppMain
      pending={isPending && resignations.length === 0}
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
          <Button variant='outline' size='icon' onClick={handleBackButton}>
            <IconChevronLeft size={24} />
          </Button>,
          backBtnNode,
        )}

      {/* ── LIST VIEW ───────────────────────────────────────────────────── */}
      {activeView === 'list' && (
        <div className='flex flex-col gap-6'>
          {/* Stats Cards */}
          <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
            {[
              { label: 'Total', value: total, icon: <IconUsers size={18} />, color: 'bg-rose-600' },
              { label: 'Clearance', value: clearance, icon: <IconClock size={18} />, color: 'bg-amber-500' },
              { label: 'Exit Interview', value: exiting, icon: <IconClock size={18} />, color: 'bg-blue-500' },
              { label: 'Completed', value: completed, icon: <IconCheck size={18} />, color: 'bg-emerald-500' },
            ].map((stat) => (
              <div
                key={stat.label}
                className='flex items-center gap-4 rounded-2xl border border-border/60 bg-card shadow-sm p-5'
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-xl ${stat.color} text-white`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className='text-2xl font-bold text-foreground'>{stat.value}</p>
                  <p className='text-xs text-muted-foreground'>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            <div className='relative flex-1'>
              <IconSearch
                size={15}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
              />
              <Input
                className='pl-9 pr-4 h-9 text-sm'
                placeholder='Search employee or department...'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button variant='outline' size='sm' onClick={handleSearch}>
              Search
            </Button>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-40 h-9 text-sm'>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='submitted'>Submitted</SelectItem>
                <SelectItem value='clearance'>Clearance</SelectItem>
                <SelectItem value='exit_interview'>Exit Interview</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='cancelled'>Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='sm' onClick={handleReset}>
              Reset
            </Button>
          </div>

          <ResignationTable
            resignations={resignations}
            isPending={isPending}
            isFetching={isFetching}
            onAction={handleTableAction}
          />
        </div>
      )}

      {/* ── DETAIL VIEW ─────────────────────────────────────────────────── */}
      {activeView === 'detail' && activeResignation && (
        <ResignationDetailView
          resignation={activeResignation}
          onReview={handleDetailReview}
        />
      )}

      {/* ── CREATE VIEW ─────────────────────────────────────────────────── */}
      {activeView === 'create' && (
        <ResignationCreateView
          employees={employees}
          onCancel={goBackToList}
          onReview={handleCreateReview}
          isPending={createResignationMutation.isPending}
          initialData={
            pendingFormData ??
            (preselectedEmployeeId
              ? {
                  employeeId: preselectedEmployeeId,
                  submissionDate: '',
                  resignationType: 'Voluntary',
                  noticePeriod: '30 days',
                  lastWorkingDate: '',
                  handoverOwner: '',
                  exitInterviewDate: '',
                  reason: '',
                  accessRevocation: 'After last working date',
                }
              : undefined)
          }
        />
      )}

      {/* ── REVIEW NEW ──────────────────────────────────────────────────── */}
      {activeView === 'review-new' && pendingFormData && (
        <ResignationReviewView
          formData={pendingFormData}
          employees={employees}
          onBack={() => setActiveView('create')}
          onSubmit={handleSubmitNew}
          isPending={createResignationMutation.isPending}
        />
      )}

      {/* ── REVIEW EXISTING ─────────────────────────────────────────────── */}
      {activeView === 'review-existing' && activeResignation && (
        <ResignationReviewView
          formData={{
            employeeId: activeResignation.employeeId,
            submissionDate: activeResignation.submissionDate,
            resignationType: activeResignation.resignationType,
            noticePeriod: activeResignation.noticePeriod,
            lastWorkingDate: activeResignation.lastWorkingDate,
            handoverOwner: activeResignation.handoverOwner,
            exitInterviewDate: activeResignation.exitInterviewDate ?? '',
            reason: activeResignation.reason,
            accessRevocation: activeResignation.accessRevocation,
          }}
          employees={employees}
          onBack={handleBackButton}
          onSubmit={handleSubmitExisting}
          isPending={createResignationMutation.isPending}
        />
      )}
    </AppMain>
  )
}
