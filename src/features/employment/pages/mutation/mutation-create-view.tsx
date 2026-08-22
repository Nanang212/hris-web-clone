// mutation-create-view.tsx — Form to create a new mutation request
import { IconLoader2 } from '@tabler/icons-react'
import { useState } from 'react'
import type { Employee } from '@/features/employment/types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Separator } from '@/shared/components/ui/separator'

interface MutationCreateViewProps {
  employees: Employee[]
  onCancel: () => void
  onReview: (formData: MutationFormData) => void
  isPending?: boolean
}

export interface MutationFormData {
  employeeId: string
  // new org
  newDivision: string
  newDepartment: string
  newPosition: string
  newSupervisor: string
  newLocation: string
  // meta
  effectiveDate: string
  reason: string
  approvalRoute: string
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className='grid grid-cols-2 gap-4'>{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-xs font-semibold text-muted-foreground'>{label}</label>
      {children}
    </div>
  )
}

export function MutationCreateView({ employees, onCancel, onReview, isPending = false }: MutationCreateViewProps) {
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? '')
  const [newDivision, setNewDivision] = useState('')
  const [newDepartment, setNewDepartment] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [newSupervisor, setNewSupervisor] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [reason, setReason] = useState('')
  const [approvalRoute, setApprovalRoute] = useState('')

  const selectedEmployee = employees.find((e) => e.id === employeeId)

  const canSubmit =
    employeeId && newDivision && newDepartment && newPosition &&
    newSupervisor && newLocation && effectiveDate && reason && approvalRoute

  const handleReview = () => {
    if (!canSubmit) return
    onReview({
      employeeId,
      newDivision,
      newDepartment,
      newPosition,
      newSupervisor,
      newLocation,
      effectiveDate,
      reason,
      approvalRoute,
    })
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Employee selector */}
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
              {selectedEmployee.employeeCode} · {selectedEmployee.positionName} · {selectedEmployee.workLocation}
            </p>
          )}
        </div>
      </div>

      {/* Current & New Assignment */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Current Assignment (read-only) */}
        <div className='rounded-2xl border border-border/60 bg-muted/30 shadow-sm p-6'>
          <h3 className='text-sm font-bold text-foreground mb-4'>Current Assignment</h3>
          <div className='flex flex-col gap-3'>
            <FieldGroup>
              <Field label='Division'>
                <Input value={selectedEmployee?.divisionName ?? '-'} readOnly className='bg-background/50 text-muted-foreground' />
              </Field>
              <Field label='Department'>
                <Input value={selectedEmployee?.departmentName ?? '-'} readOnly className='bg-background/50 text-muted-foreground' />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field label='Position'>
                <Input value={selectedEmployee?.positionName ?? '-'} readOnly className='bg-background/50 text-muted-foreground' />
              </Field>
              <Field label='Supervisor'>
                <Input value={selectedEmployee?.managerName ?? '-'} readOnly className='bg-background/50 text-muted-foreground' />
              </Field>
            </FieldGroup>
            <Field label='Location'>
              <Input value={selectedEmployee?.workLocation ?? '-'} readOnly className='bg-background/50 text-muted-foreground' />
            </Field>
          </div>
        </div>

        {/* New Assignment (editable) */}
        <div className='rounded-2xl border border-border/60 bg-card shadow-sm p-6'>
          <h3 className='text-sm font-bold text-foreground mb-4'>New Assignment</h3>
          <div className='flex flex-col gap-3'>
            <FieldGroup>
              <Field label='Division *'>
                <Input
                  placeholder='e.g. Operations'
                  value={newDivision}
                  onChange={(e) => setNewDivision(e.target.value)}
                />
              </Field>
              <Field label='Department *'>
                <Input
                  placeholder='e.g. People Operations'
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field label='Position *'>
                <Input
                  placeholder='e.g. HR Business Partner'
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                />
              </Field>
              <Field label='Supervisor *'>
                <Input
                  placeholder='e.g. Sinta Maharani'
                  value={newSupervisor}
                  onChange={(e) => setNewSupervisor(e.target.value)}
                />
              </Field>
            </FieldGroup>
            <Field label='Location *'>
              <Input
                placeholder='e.g. Bandung Office'
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Effective Date, Reason, Approval Route */}
      <div className='rounded-2xl border border-border/60 bg-card shadow-sm p-6'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          <Field label='Effective Date *'>
            <Input
              type='date'
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </Field>
          <Field label='Reason *'>
            <Input
              placeholder='e.g. Organization restructuring'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <Field label='Approval Route *'>
            <Input
              placeholder='e.g. HR + Manager'
              value={approvalRoute}
              onChange={(e) => setApprovalRoute(e.target.value)}
            />
          </Field>
        </div>
      </div>

      <Separator />

      {/* Footer Actions */}
      <div className='flex items-center justify-end gap-3'>
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleReview} disabled={!canSubmit || isPending}>
          {isPending && <IconLoader2 size={14} className='animate-spin' data-icon='inline-start' />}
          Review Mutation
        </Button>
      </div>
    </div>
  )
}
