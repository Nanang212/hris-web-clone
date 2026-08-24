// resignation-create-view.tsx — Form to create a new resignation request
import { IconLoader2 } from '@tabler/icons-react'
import { useState } from 'react'
import type { Employee } from '@/features/employment/types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Separator } from '@/shared/components/ui/separator'

interface ResignationCreateViewProps {
  employees: Employee[]
  onCancel: () => void
  onReview: (formData: ResignationFormData) => void
  isPending?: boolean
  initialData?: ResignationFormData
}

export interface ResignationFormData {
  employeeId: string
  submissionDate: string
  resignationType: string
  noticePeriod: string
  lastWorkingDate: string
  handoverOwner: string
  exitInterviewDate: string
  reason: string
  accessRevocation: string
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-xs font-semibold text-muted-foreground'>
        {label} {required && <span className='text-rose-500'>*</span>}
      </label>
      {children}
    </div>
  )
}

export function ResignationCreateView({
  employees,
  onCancel,
  onReview,
  isPending = false,
  initialData,
}: ResignationCreateViewProps) {
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId ?? employees[0]?.id ?? '')
  const [submissionDate, setSubmissionDate] = useState(initialData?.submissionDate ?? '')
  const [resignationType, setResignationType] = useState(initialData?.resignationType ?? 'Voluntary')
  const [noticePeriod, setNoticePeriod] = useState(initialData?.noticePeriod ?? '30 days')
  const [lastWorkingDate, setLastWorkingDate] = useState(initialData?.lastWorkingDate ?? '')
  const [handoverOwner, setHandoverOwner] = useState(initialData?.handoverOwner ?? '')
  const [exitInterviewDate, setExitInterviewDate] = useState(initialData?.exitInterviewDate ?? '')
  const [reason, setReason] = useState(initialData?.reason ?? '')
  const [accessRevocation, setAccessRevocation] = useState(initialData?.accessRevocation ?? 'After last working date')

  const selectedEmployee = employees.find((e) => e.id === employeeId)

  const canSubmit = employeeId && submissionDate && resignationType && noticePeriod &&
    lastWorkingDate && handoverOwner && reason && accessRevocation

  const handleReview = () => {
    if (!canSubmit) return
    onReview({
      employeeId,
      submissionDate,
      resignationType,
      noticePeriod,
      lastWorkingDate,
      handoverOwner,
      exitInterviewDate,
      reason,
      accessRevocation,
    })
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Employee Card */}
      <div className='rounded-2xl border border-border/60 bg-card shadow-sm p-6'>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-semibold text-muted-foreground'>Employee</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className='h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}
              </option>
            ))}
          </select>
          {selectedEmployee && (
            <p className='text-xs text-muted-foreground mt-1'>
              NIP {selectedEmployee.employeeCode} · {selectedEmployee.positionName} · {selectedEmployee.workLocation}
            </p>
          )}
        </div>
      </div>

      {/* Resignation Information */}
      <div className='rounded-2xl border border-border/60 bg-card shadow-sm p-6'>
        <h3 className='text-sm font-bold text-foreground mb-4 border-b pb-2'>Resignation Information</h3>

        <div className='flex flex-col gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Field label='Submission Date' required>
              <Input
                type='date'
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
              />
            </Field>
            <Field label='Resignation Type' required>
              <select
                value={resignationType}
                onChange={(e) => setResignationType(e.target.value)}
                className='h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'
              >
                <option value='Voluntary'>Voluntary</option>
                <option value='Involuntary'>Involuntary</option>
                <option value='Retirement'>Retirement</option>
              </select>
            </Field>
            <Field label='Notice Period' required>
              <select
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                className='h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'
              >
                <option value='14 days'>14 days</option>
                <option value='30 days'>30 days</option>
                <option value='60 days'>60 days</option>
                <option value='90 days'>90 days</option>
              </select>
            </Field>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Field label='Last Working Date' required>
              <Input
                type='date'
                value={lastWorkingDate}
                onChange={(e) => setLastWorkingDate(e.target.value)}
              />
            </Field>
            <Field label='Handover Owner' required>
              <Input
                placeholder='e.g. Andi Pratama'
                value={handoverOwner}
                onChange={(e) => setHandoverOwner(e.target.value)}
              />
            </Field>
            <Field label='Exit Interview Date'>
              <Input
                type='date'
                value={exitInterviewDate}
                onChange={(e) => setExitInterviewDate(e.target.value)}
              />
            </Field>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Field label='Reason' required>
              <Input
                placeholder='e.g. Career opportunity'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
            <Field label='Access Revocation'>
              <select
                value={accessRevocation}
                onChange={(e) => setAccessRevocation(e.target.value)}
                className='h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'
              >
                <option value='After last working date'>After last working date</option>
                <option value='On last working date'>On last working date</option>
                <option value='Immediately'>Immediately</option>
              </select>
            </Field>
          </div>

          {/* Warning notice */}
          <div className='mt-2 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3 dark:border-rose-800/40 dark:bg-rose-950/20'>
            <p className='text-xs text-rose-700 dark:text-rose-300'>
              Submitting schedules offboarding and access revocation. The employee stays Active until the last working date.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Footer */}
      <div className='flex items-center justify-end gap-3'>
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button variant='outline' onClick={() => {}} disabled={isPending}>
          Save Draft
        </Button>
        <Button
          onClick={handleReview}
          disabled={!canSubmit || isPending}
        >
          {isPending && <IconLoader2 size={14} className='animate-spin' data-icon='inline-start' />}
          Review Resignation
        </Button>
      </div>
    </div>
  )
}
