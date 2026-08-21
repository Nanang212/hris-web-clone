// create-contract-page.tsx — Page to create a new employment contract

import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconArrowLeft,
  IconLoader2,
  IconUpload,
} from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { snackbar } from '@/shared/lib/snackbar'
import { useSchema } from '@/shared/lib/schema'
import { Badge } from '@/shared/components/ui/badge'

export function CreateContractPage() {
  const navigate = useNavigate()

  const formSchema = useSchema((z) => ({
    contractNumber: z.string().min(1, { message: 'Contract number is required' }),
    contractType: z.string().min(1, { message: 'Contract type is required' }),
    effectiveDate: z.string().min(1, { message: 'Effective date is required' }),
    startDate: z.string().min(1, { message: 'Start date is required' }),
    endDate: z.string().optional(),
    probation: z.string().optional(),
    departmentId: z.string().min(1, { message: 'Department is required' }),
    positionId: z.string().min(1, { message: 'Position is required' }),
    gradeId: z.string().optional(),
    workLocation: z.string().min(1, { message: 'Work location is required' }),
    signatory: z.string().min(1, { message: 'Signatory is required' }),
    approvalWorkflow: z.string().optional(),
  }))

  type FormValues = z.infer<typeof formSchema>

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractNumber: 'CTR-2026-00128',
      contractType: 'PKWT',
      effectiveDate: '2026-08-12',
      startDate: '2026-08-12',
      endDate: '2027-08-11',
      probation: '3-months',
      departmentId: 'dept-1',
      positionId: 'pos-1',
      gradeId: 'grade-7',
      workLocation: 'jakarta-hq',
      signatory: 'dir-1',
      approvalWorkflow: 'workflow-1',
    },
  })

  const onSubmit = (values: FormValues) => {
    snackbar.success(`Contract ${values.contractNumber} created successfully!`)
    navigate({ to: '/company/employee/contract' })
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: 'Company' },
        { to: '/company/employee/contract', label: 'Contract' },
        { to: '.', label: 'Create' },
      ]}
      title='Create Employment Contract'
      subtitle='Create or edit the employment terms and contract document before approval.'
      actions={
        <Link to='/company/employee/contract'>
          <Button variant='outline' size='sm'>
            <IconArrowLeft data-icon='inline-start' />
            Back to Contracts
          </Button>
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className='flex flex-col gap-6'>
          {/* Employee summary card */}
          <Card className='border-border/50 shadow-sm'>
            <CardContent className='pt-6 flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                  Employee
                </span>
                <div className='flex items-baseline gap-3 mt-1'>
                  <h3 className='text-lg font-bold text-foreground'>Rama Aditya</h3>
                  <span className='text-xs text-muted-foreground'>
                    EMP-2023-00128 · HR Supervisor · Human Resources
                  </span>
                </div>
              </div>
              <Badge variant='gray' className='px-3 py-1 font-semibold text-xs'>
                Draft
              </Badge>
            </CardContent>
          </Card>

          {/* Contract Information Form */}
          <Card className='border-border/50 shadow-sm'>
            <CardHeader className='pb-4 border-b border-border/40'>
              <CardTitle className='text-base font-bold'>Contract Information</CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
              <FieldGroup>
                <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                  {/* Row 1 */}
                  <Field data-invalid={!!errors.contractNumber}>
                    <FieldLabel htmlFor='contractNumber'>Contract Number</FieldLabel>
                    <Input
                      id='contractNumber'
                      placeholder='e.g. CTR-2026-00128'
                      aria-invalid={!!errors.contractNumber}
                      {...register('contractNumber')}
                    />
                    <FieldError errors={errors.contractNumber ? [errors.contractNumber] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.contractType}>
                    <FieldLabel htmlFor='contractType'>Contract Type *</FieldLabel>
                    <Controller
                      name='contractType'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='contractType' aria-invalid={!!errors.contractType}>
                            <SelectValue placeholder='Select contract type' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='PKWT'>PKWT / Fixed-term</SelectItem>
                            <SelectItem value='PKWTT'>PKWTT / Permanent</SelectItem>
                            <SelectItem value='magang'>Magang / Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={errors.contractType ? [errors.contractType] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.effectiveDate}>
                    <FieldLabel htmlFor='effectiveDate'>Effective Date *</FieldLabel>
                    <Input
                      id='effectiveDate'
                      type='date'
                      aria-invalid={!!errors.effectiveDate}
                      {...register('effectiveDate')}
                    />
                    <FieldError errors={errors.effectiveDate ? [errors.effectiveDate] : undefined} />
                  </Field>

                  {/* Row 2 */}
                  <Field data-invalid={!!errors.startDate}>
                    <FieldLabel htmlFor='startDate'>Start Date *</FieldLabel>
                    <Input
                      id='startDate'
                      type='date'
                      aria-invalid={!!errors.startDate}
                      {...register('startDate')}
                    />
                    <FieldError errors={errors.startDate ? [errors.startDate] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.endDate}>
                    <FieldLabel htmlFor='endDate'>End Date *</FieldLabel>
                    <Input
                      id='endDate'
                      type='date'
                      aria-invalid={!!errors.endDate}
                      {...register('endDate')}
                    />
                    <FieldError errors={errors.endDate ? [errors.endDate] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.probation}>
                    <FieldLabel htmlFor='probation'>Probation</FieldLabel>
                    <Controller
                      name='probation'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='probation'>
                            <SelectValue placeholder='None' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='none'>None</SelectItem>
                            <SelectItem value='3-months'>3 months</SelectItem>
                            <SelectItem value='6-months'>6 months</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>

                  {/* Row 3 */}
                  <Field data-invalid={!!errors.departmentId}>
                    <FieldLabel htmlFor='departmentId'>Department *</FieldLabel>
                    <Controller
                      name='departmentId'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='departmentId' aria-invalid={!!errors.departmentId}>
                            <SelectValue placeholder='Select department' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='dept-1'>Human Resources</SelectItem>
                            <SelectItem value='dept-2'>IT & Engineering</SelectItem>
                            <SelectItem value='dept-3'>Finance & Accounting</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={errors.departmentId ? [errors.departmentId] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.positionId}>
                    <FieldLabel htmlFor='positionId'>Position *</FieldLabel>
                    <Controller
                      name='positionId'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='positionId' aria-invalid={!!errors.positionId}>
                            <SelectValue placeholder='Select position' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='pos-1'>HR Supervisor</SelectItem>
                            <SelectItem value='pos-2'>Software Engineer</SelectItem>
                            <SelectItem value='pos-3'>Finance Specialist</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={errors.positionId ? [errors.positionId] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.gradeId}>
                    <FieldLabel htmlFor='gradeId'>Grade</FieldLabel>
                    <Controller
                      name='gradeId'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='gradeId'>
                            <SelectValue placeholder='Select grade' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='grade-6'>G6</SelectItem>
                            <SelectItem value='grade-7'>G7</SelectItem>
                            <SelectItem value='grade-8'>G8</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>

                  {/* Row 4 */}
                  <Field data-invalid={!!errors.workLocation}>
                    <FieldLabel htmlFor='workLocation'>Work Location *</FieldLabel>
                    <Controller
                      name='workLocation'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='workLocation' aria-invalid={!!errors.workLocation}>
                            <SelectValue placeholder='Select location' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='jakarta-hq'>Jakarta HQ</SelectItem>
                            <SelectItem value='bandung-office'>Bandung Office</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={errors.workLocation ? [errors.workLocation] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.signatory}>
                    <FieldLabel htmlFor='signatory'>Signatory *</FieldLabel>
                    <Controller
                      name='signatory'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='signatory' aria-invalid={!!errors.signatory}>
                            <SelectValue placeholder='Select signatory' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='dir-1'>HR Director</SelectItem>
                            <SelectItem value='ceo'>Chief Executive Officer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={errors.signatory ? [errors.signatory] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.approvalWorkflow}>
                    <FieldLabel htmlFor='approvalWorkflow'>Approval Workflow</FieldLabel>
                    <Controller
                      name='approvalWorkflow'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='approvalWorkflow'>
                            <SelectValue placeholder='Select workflow' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='workflow-1'>HR Manager → Director</SelectItem>
                            <SelectItem value='workflow-2'>Director Only</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                </div>
              </FieldGroup>

              {/* Informational Alert */}
              <div className='mt-6 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 p-4 text-xs text-blue-700 dark:text-blue-300'>
                Contract template and employee details will be merged into the final document after approval.
              </div>
            </CardContent>
          </Card>

          {/* Contract Document Card */}
          <Card className='border-border/50 shadow-sm'>
            <CardContent className='pt-6 flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <h4 className='text-sm font-bold text-foreground'>Contract Document</h4>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Upload draft PDF/DOCX or generate from the company contract template.
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                className='border-dashed border-2 hover:bg-muted text-xs h-9'
                onClick={() => snackbar.success('Dokumen draf berhasil digenerate!')}
              >
                <IconUpload size={14} className='mr-1.5' />
                Upload / Generate
              </Button>
            </CardContent>
          </Card>

          {/* Bottom Actions Bar */}
          <div className='flex items-center justify-between border-t pt-4'>
            <Link to='/company/employee/contract'>
              <Button type='button' variant='outline' disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <div className='flex items-center gap-3'>
              <Button
                type='button'
                variant='outline'
                disabled={isSubmitting}
                onClick={() => {
                  snackbar.success('Draf kontrak berhasil disimpan!')
                  navigate({ to: '/company/employee/contract' })
                }}
              >
                Save Draft
              </Button>
              <Button type='submit' disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700 text-white font-semibold'>
                {isSubmitting && <IconLoader2 className='mr-1.5 animate-spin' />}
                Review Contract
              </Button>
            </div>
          </div>
        </div>
      </form>
    </AppMain>
  )
}
