// demotion-create-view.tsx — Form to create a new demotion request
import { IconLoader2 } from '@tabler/icons-react'
import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Separator } from '@/shared/components/ui/separator'
import type { Employee } from '@/features/employment/demotion/types'

interface DemotionCreateViewProps {
  employees: Employee[]
  onCancel: () => void
  onReview: (formData: DemotionFormData) => void
  isPending?: boolean
  initialData?: DemotionFormData
}

export interface DemotionFormData {
  employeeId: string
  newPosition: string
  newGrade: string
  newSalary: number
  effectiveDate: string
  reason: string
  approvalRoute: string
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

export function DemotionCreateView({
  employees,
  onCancel,
  onReview,
  isPending = false,
  initialData,
}: DemotionCreateViewProps) {
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId ?? employees[0]?.id ?? '')
  const [newPosition, setNewPosition] = useState(initialData?.newPosition ?? '')
  const [newGrade, setNewGrade] = useState(initialData?.newGrade ?? '')
  const [newSalaryInput, setNewSalaryInput] = useState(
    initialData?.newSalary ? String(initialData.newSalary) : '',
  )
  const [effectiveDate, setEffectiveDate] = useState(initialData?.effectiveDate ?? '')
  const [reason, setReason] = useState(initialData?.reason ?? '')
  const [approvalRoute, setApprovalRoute] = useState(
    initialData?.approvalRoute ?? 'Manager → HR → Director',
  )

  const selectedEmployee = employees.find((e) => e.id === employeeId)
  const currentSalary = 18000000 // mock current salary

  const canSubmit =
    employeeId &&
    newPosition &&
    newGrade &&
    newSalaryInput &&
    effectiveDate &&
    reason &&
    approvalRoute

  const handleReview = () => {
    if (!canSubmit) return
    onReview({
      employeeId,
      newPosition,
      newGrade,
      newSalary: parseFloat(newSalaryInput) || 0,
      effectiveDate,
      reason,
      approvalRoute,
    })
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Employee Selector */}
      <div className='rounded-2xl border border-border/60 bg-card p-6 shadow-sm'>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-semibold text-muted-foreground'>Employee</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className='h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none'
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}
              </option>
            ))}
          </select>
          {selectedEmployee && (
            <p className='mt-1 text-xs text-muted-foreground'>
              {selectedEmployee.employeeCode} · {selectedEmployee.positionName} ·{' '}
              {selectedEmployee.departmentName}
            </p>
          )}
        </div>
      </div>

      {/* Demotion Proposal Section */}
      <div className='rounded-2xl border border-border/60 bg-card p-6 shadow-sm'>
        <h3 className='mb-4 border-b pb-2 text-sm font-bold text-foreground'>Demotion Proposal</h3>

        <div className='flex flex-col gap-4'>
          <FieldGroup>
            <Field label='Current Position'>
              <Input
                value={selectedEmployee?.positionName ?? '-'}
                readOnly
                className='bg-background/50 text-muted-foreground'
              />
            </Field>
            <Field label='Proposed Position *'>
              <Input
                placeholder='e.g. Senior Product Designer'
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
              />
            </Field>
            <Field label='Current Grade'>
              <Input
                value={selectedEmployee?.gradeName ?? 'G3'}
                readOnly
                className='bg-background/50 text-muted-foreground'
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field label='Proposed Grade *'>
              <Input
                placeholder='e.g. G4'
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
              />
            </Field>
            <Field label='Current Salary'>
              <Input
                value={formatSalary(currentSalary)}
                readOnly
                className='bg-background/50 text-muted-foreground'
              />
            </Field>
            <Field label='Proposed Salary *'>
              <Input
                type='number'
                placeholder='e.g. 21500000'
                value={newSalaryInput}
                onChange={(e) => setNewSalaryInput(e.target.value)}
              />
            </Field>
          </FieldGroup>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Field label='Effective Date *'>
              <Input
                type='date'
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </Field>
            <Field label='Reason *'>
              <Input
                placeholder='e.g. Annual performance review'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
          </div>

          {/* Validation Notice Check */}
          <div className='mt-2 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20'>
            <div className='text-emerald-600 dark:text-emerald-400'>✔</div>
            <p className='text-xs font-semibold text-emerald-800 dark:text-emerald-300'>
              Within grade range and approved headcount budget.
            </p>
          </div>
        </div>
      </div>

      {/* Approval Route Section */}
      <div className='rounded-2xl border border-border/60 bg-card p-6 shadow-sm'>
        <h3 className='mb-4 border-b pb-2 text-sm font-bold text-foreground'>Approval Route</h3>
        <Field label='Approver Path *'>
          <Input
            placeholder='e.g. Manager → HR → Director'
            value={approvalRoute}
            onChange={(e) => setApprovalRoute(e.target.value)}
          />
        </Field>
      </div>

      <Separator />

      {/* Footer Actions */}
      <div className='flex items-center justify-end gap-3'>
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button variant='outline' onClick={() => {}} disabled={isPending}>
          Save Draft
        </Button>
        <Button onClick={handleReview} disabled={!canSubmit || isPending}>
          {isPending && <IconLoader2 size={14} className='animate-spin' data-icon='inline-start' />}
          Review Demotion
        </Button>
      </div>
    </div>
  )
}
