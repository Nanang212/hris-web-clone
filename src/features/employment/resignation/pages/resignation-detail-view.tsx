// resignation-detail-view.tsx — Detail view with interactive clearance checklist
import { IconCheck, IconClock, IconFileCheck } from '@tabler/icons-react'
import { useState } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Separator } from '@/shared/components/ui/separator'
import { snackbar } from '@/shared/lib/snackbar'
import type {
  EmployeeResignation,
  ResignationClearanceItem,
  ResignationStatus,
} from '@/features/employment/resignation/types'

const STATUS_CONFIG: Record<
  ResignationStatus,
  { label: string; variant: 'amber' | 'green' | 'red' | 'blue' | 'default' }
> = {
  submitted: { label: 'Submitted', variant: 'amber' },
  clearance: { label: 'Clearance', variant: 'blue' },
  exit_interview: { label: 'Exit Interview', variant: 'default' },
  completed: { label: 'Completed', variant: 'green' },
  cancelled: { label: 'Cancelled', variant: 'red' },
}

interface ResignationDetailViewProps {
  resignation: EmployeeResignation
  onReview: () => void
}

interface InfoFieldProps {
  label: string
  value: string
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-xs font-medium text-muted-foreground'>{label}</label>
      <Input value={value} readOnly className='bg-background/50 text-sm text-foreground' />
    </div>
  )
}

export function ResignationDetailView({ resignation, onReview }: ResignationDetailViewProps) {
  const status = STATUS_CONFIG[resignation.status]
  const isActive = resignation.status !== 'completed' && resignation.status !== 'cancelled'

  // ─── Local interactive checklist state ────────────────────────────────────
  const [checklist, setChecklist] = useState<ResignationClearanceItem[]>(
    resignation.clearanceChecklist.map((item) => ({ ...item })),
  )
  // 'idle' | 'draft' | 'completed'
  const [saveState, setSaveState] = useState<'idle' | 'draft' | 'completed'>('idle')

  const completedCount = checklist.filter((c) => c.checked).length
  const totalCount = checklist.length

  const toggleItem = (key: string) => {
    setSaveState('idle')
    setChecklist((prev) =>
      prev.map((item) => (item.key === key ? { ...item, checked: !item.checked } : item)),
    )
  }

  const handleSave = () => {
    setSaveState('draft')
    snackbar.success(`Progress saved as draft. ${completedCount}/${totalCount} items completed.`)
  }

  const handleComplete = () => {
    setSaveState('completed')
    snackbar.success('Case marked as complete.')
  }

  return (
    <>
      {/* Employee Header */}
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 p-5 text-xs'>
        <div>
          <h4 className='text-sm font-bold text-foreground'>{resignation.fullName}</h4>
          <p className='mt-0.5 text-muted-foreground'>
            {resignation.employeeCode} · {resignation.position} · {resignation.department}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {saveState === 'draft' && (
            <span className='inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-400'>
              <IconClock size={11} />
              *Draft · Belum Complete
            </span>
          )}
          {saveState === 'completed' && (
            <span className='inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-400'>
              <IconCheck size={11} />✓ Progress Complete
            </span>
          )}
          <Badge
            variant={status.variant as 'amber' | 'green' | 'red' | 'blue' | 'default'}
            className='px-3 py-1 text-xs font-semibold'
          >
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Main Info Card */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm lg:col-span-2'>
          <div className='border-b border-border/60 px-6 py-4'>
            <h3 className='text-sm font-bold text-foreground'>Resignation Detail</h3>
          </div>

          <div className='grid grid-cols-1 gap-4 p-6 md:grid-cols-2'>
            <InfoField label='Reason' value={resignation.reason} />
            <InfoField label='Submission Date' value={resignation.submissionDate} />
            <InfoField label='Notice Period' value={resignation.noticePeriod} />
            <InfoField label='Last Working Day' value={resignation.lastWorkingDate} />
            <InfoField
              label='Exit Interview'
              value={
                resignation.exitInterviewDate
                  ? `Scheduled · ${resignation.exitInterviewDate}`
                  : 'Not scheduled'
              }
            />
            <InfoField label='Final Status' value={resignation.finalStatus} />
          </div>

          <Separator />

          {/* Clearance Checklist */}
          <div className='p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h4 className='text-sm font-bold text-foreground'>Clearance Checklist</h4>
              <span className='text-xs font-semibold text-muted-foreground'>
                {completedCount}/{totalCount} completed
              </span>
            </div>

            {/* Progress bar */}
            <div className='mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted'>
              <div
                className='h-full rounded-full bg-emerald-500 transition-all duration-500'
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              {checklist.map((item) => (
                <button
                  key={item.key}
                  type='button'
                  onClick={() => isActive && toggleItem(item.key)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                    isActive ? 'cursor-pointer hover:bg-muted/40' : 'cursor-default'
                  } ${
                    item.checked
                      ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-950/20'
                      : 'border-border bg-background'
                  }`}
                >
                  <div
                    className={`flex size-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors duration-150 ${
                      item.checked
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-border bg-background'
                    }`}
                  >
                    {item.checked && <IconCheck size={12} className='text-white' strokeWidth={3} />}
                  </div>
                  <span
                    className={`text-xs transition-colors duration-150 ${
                      item.checked
                        ? 'font-semibold text-emerald-700 dark:text-emerald-300'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer actions — inside card */}
          {isActive && (
            <>
              <Separator />
              <div className='flex items-center justify-end gap-3 px-6 py-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleSave}
                  className={saveState === 'draft' ? 'border-amber-400 text-amber-600' : ''}
                >
                  {saveState === 'draft' ? (
                    <>
                      <IconClock size={13} className='mr-1.5' />
                      Saved (Draft)
                    </>
                  ) : (
                    'Save Progress'
                  )}
                </Button>
                <Button size='sm' onClick={handleComplete}>
                  <IconCheck size={14} data-icon='inline-start' />
                  Complete Case
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Right: Actions card */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <h3 className='border-b pb-3 text-sm font-bold text-foreground'>Resignation Actions</h3>
            <div className='flex flex-col gap-2'>
              {isActive && (
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full justify-start text-xs font-semibold transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground'
                  onClick={onReview}
                >
                  <IconFileCheck size={14} className='mr-2 text-blue-600 group-hover:text-white' />
                  Review Resignation
                </Button>
              )}
            </div>

            {/* Checklist summary */}
            <div className='mt-2 rounded-xl bg-muted/40 px-4 py-3'>
              <p className='mb-2 text-xs font-semibold text-muted-foreground'>Clearance progress</p>
              <div className='flex flex-col gap-1.5'>
                {checklist.map((item) => (
                  <div key={item.key} className='flex items-center gap-2'>
                    <div
                      className={`size-2 flex-shrink-0 rounded-full ${
                        item.checked ? 'bg-emerald-500' : 'bg-border'
                      }`}
                    />
                    <span
                      className={`text-[11px] ${item.checked ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
