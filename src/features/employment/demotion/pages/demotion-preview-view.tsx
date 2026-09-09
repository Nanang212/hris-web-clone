// demotion-preview-view.tsx — Preview of the proposal (Image 1)
import { IconCheck } from '@tabler/icons-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import type { Employee } from '@/features/employment/demotion/types'

import type { DemotionFormData } from './demotion-create-view'

interface DemotionPreviewViewProps {
  formData: DemotionFormData
  employees: Employee[]
  onEdit: () => void
  onReview: () => void
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-xs font-semibold text-muted-foreground'>{label}</label>
      {children}
    </div>
  )
}

function formatSalary(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function DemotionPreviewView({
  formData,
  employees,
  onEdit,
  onReview,
}: DemotionPreviewViewProps) {
  const employee = employees.find((e) => e.id === formData.employeeId)
  const currentSalary = 18000000 // mock current salary

  return (
    <div className='flex flex-col gap-6'>
      {/* Read-only preview card (Image 1) */}
      <div className='rounded-2xl border border-border/60 bg-card p-6 shadow-sm'>
        <h3 className='mb-4 border-b pb-2 text-sm font-bold text-foreground'>Demotion Proposal</h3>

        <div className='flex flex-col gap-4'>
          <FieldGroup>
            <Field label='Current Position'>
              <Input
                value={employee?.positionName ?? '-'}
                disabled
                className='bg-muted/30 text-muted-foreground'
              />
            </Field>
            <Field label='Proposed Position'>
              <Input
                value={formData.newPosition}
                disabled
                className='bg-muted/30 text-muted-foreground'
              />
            </Field>
            <Field label='Current Grade'>
              <Input
                value={employee?.gradeName ?? 'G3'}
                disabled
                className='bg-muted/30 text-muted-foreground'
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field label='Proposed Grade'>
              <Input
                value={formData.newGrade}
                disabled
                className='bg-muted/30 text-muted-foreground'
              />
            </Field>
            <Field label='Current Salary'>
              <Input
                value={formatSalary(currentSalary)}
                disabled
                className='bg-muted/30 text-muted-foreground'
              />
            </Field>
            <Field label='Proposed Salary'>
              <Input
                value={formatSalary(formData.newSalary)}
                disabled
                className='bg-muted/30 text-muted-foreground'
              />
            </Field>
          </FieldGroup>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Field label='Effective Date'>
              <Input
                value={formData.effectiveDate}
                disabled
                className='bg-muted/30 text-muted-foreground'
              />
            </Field>
            <Field label='Approval Route'>
              <Input
                value={formData.approvalRoute}
                disabled
                className='bg-muted/30 text-muted-foreground'
              />
            </Field>
          </div>

          {/* Validation Notice Check */}
          <div className='mt-2 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20'>
            <div className='text-emerald-600 dark:text-emerald-400'>✔</div>
            <p className='text-xs font-semibold text-emerald-800 dark:text-emerald-300'>
              Demotion is within grade range and approved headcount budget.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className='flex items-center justify-end gap-3'>
        <Button variant='outline' onClick={onEdit}>
          Edit Proposal
        </Button>
        <Button onClick={onReview}>
          <IconCheck size={16} data-icon='inline-start' />
          Review Proposal
        </Button>
      </div>
    </div>
  )
}
