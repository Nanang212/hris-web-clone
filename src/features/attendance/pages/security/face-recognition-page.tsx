import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconAlertTriangle,
  IconChartBar,
  IconCircleCheck,
  IconSearch,
  IconSettings,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'

interface FaceEmployee {
  id: string
  name: string
  department: string
  enrollment: string
  quality: number
  samples: number
  lastUpdate: string
  status: 'Enrolled' | 'Re-enroll' | 'Not Enrolled'
}

type FaceSection = 'overview' | 'enrollment' | 'verification' | 'logs' | 'reset'

const people: FaceEmployee[] = [
  {
    id: 'emp-1',
    name: 'Rama Aditya',
    department: 'Product Design',
    enrollment: '3 face samples',
    quality: 96,
    samples: 3,
    lastUpdate: '12 May 2026',
    status: 'Enrolled',
  },
  {
    id: 'emp-2',
    name: 'Sinta Maharani',
    department: 'Engineering',
    enrollment: '3 face samples',
    quality: 93,
    samples: 3,
    lastUpdate: '10 May 2026',
    status: 'Enrolled',
  },
  {
    id: 'emp-3',
    name: 'Budi Setiawan',
    department: 'Finance',
    enrollment: '1 face sample',
    quality: 71,
    samples: 1,
    lastUpdate: '03 May 2026',
    status: 'Re-enroll',
  },
  {
    id: 'emp-4',
    name: 'Dewi Kartika',
    department: 'Human Resources',
    enrollment: 'No samples',
    quality: 0,
    samples: 0,
    lastUpdate: '-',
    status: 'Not Enrolled',
  },
]

const faceSections: Array<{ value: FaceSection; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'enrollment', label: 'Enrollment' },
  { value: 'verification', label: 'Verification' },
  { value: 'logs', label: 'Logs' },
  { value: 'reset', label: 'Reset' },
]

function StatusBadge({ status }: { status: FaceEmployee['status'] }) {
  return (
    <Badge
      variant={status === 'Enrolled' ? 'green' : status === 'Re-enroll' ? 'amber' : 'secondary'}
    >
      {status}
    </Badge>
  )
}

export function FaceRecognitionPage() {
  const [activeSection, setActiveSection] = useState<FaceSection>('overview')
  const [query, setQuery] = useState('')
  const [selectedPerson, setSelectedPerson] = useState<FaceEmployee | null>(null)
  const [enrollmentOpen, setEnrollmentOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<FaceEmployee | null>(null)
  const enrollmentSchema = useSchema((z) => ({
    employee: z.string().min(1, { message: 'Employee is required.' }),
    note: z.string(),
  }))
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<z.infer<typeof enrollmentSchema>>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { employee: '', note: '' },
  })

  const filteredPeople = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return people
    return people.filter((person) =>
      `${person.name} ${person.department} ${person.status}`
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [query])

  const submitEnrollment = () => {
    setEnrollmentOpen(false)
    reset()
    snackbar.success('Face enrollment session started successfully.')
  }

  const statItems = [
    {
      value: '1,172',
      label: 'Enrolled',
      description: 'Active biometric profiles',
      icon: IconCircleCheck,
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      value: '76',
      label: 'Not Enrolled',
      description: 'Enrollment required',
      icon: IconUserPlus,
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      value: '8',
      label: 'Needs Re-enroll',
      description: 'Quality below threshold',
      icon: IconAlertTriangle,
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      value: '94.8%',
      label: 'Average Quality',
      description: 'Across enrolled users',
      icon: IconChartBar,
      className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
  ]

  const directoryTable = (
    <Card className='gap-0 py-0'>
      <CardHeader className='border-b py-5'>
        <CardTitle>
          {activeSection === 'reset' ? 'Reset Enrollment' : 'Employee Enrollment'}
        </CardTitle>
        <CardDescription>
          {activeSection === 'reset'
            ? 'Remove an existing biometric profile and require enrollment again.'
            : 'Monitor face samples, quality score, and enrollment status.'}
        </CardDescription>
      </CardHeader>
      <CardContent className='px-0'>
        <div className='border-b p-4'>
          <div className='relative max-w-md'>
            <IconSearch className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search employee, department, or status...'
              className='pl-9'
            />
          </div>
        </div>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  'Employee',
                  'Enrollment',
                  'Quality',
                  'Samples',
                  'Last Update',
                  'Status',
                  'Action',
                ].map((label) => (
                  <TableHead key={label}>{label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPeople.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className='min-w-48'>
                    <p className='text-xs font-semibold'>{person.name}</p>
                    <p className='mt-1 text-[11px] text-muted-foreground'>{person.department}</p>
                  </TableCell>
                  <TableCell className='text-xs whitespace-nowrap'>{person.enrollment}</TableCell>
                  <TableCell className='text-xs'>
                    {person.quality ? `${person.quality} / 100` : '-'}
                  </TableCell>
                  <TableCell className='text-xs'>{person.samples}</TableCell>
                  <TableCell className='text-xs whitespace-nowrap'>{person.lastUpdate}</TableCell>
                  <TableCell>
                    <StatusBadge status={person.status} />
                  </TableCell>
                  <TableCell>
                    {activeSection === 'reset' ? (
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={person.status === 'Not Enrolled'}
                        onClick={() => setResetTarget(person)}
                      >
                        Reset
                      </Button>
                    ) : (
                      <Button size='sm' variant='ghost' onClick={() => setSelectedPerson(person)}>
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <AppMain
      title='Face Enrollment & Management'
      subtitle='Kelola enrollment, quality, reset, dan status biometric employee.'
      breadcrumbs={getAttendanceBreadcrumbs('Face Recognition')}
      backTo='/attendance'
      className='gap-5 bg-muted/30'
      actions={
        <Button onClick={() => setEnrollmentOpen(true)}>
          <IconUserPlus />
          Enroll Employee
        </Button>
      }
    >
      <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as FaceSection)}>
        <TabsList variant='segmented'>
          {faceSections.map((section) => (
            <TabsTrigger key={section.value} value={section.value}>
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {activeSection === 'overview' && (
        <>
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {statItems.map((item) => (
              <Card key={item.label} size='sm'>
                <CardContent className='flex items-center gap-3'>
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.className}`}
                  >
                    <item.icon className='size-5' />
                  </span>
                  <div className='min-w-0'>
                    <p className='text-xs text-muted-foreground'>{item.label}</p>
                    <p className='text-2xl font-bold tracking-tight'>{item.value}</p>
                    <p className='mt-1 truncate text-[11px] text-muted-foreground'>
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {directoryTable}
          <Card size='sm'>
            <CardHeader>
              <div className='flex items-start gap-3'>
                <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                  <IconSettings className='size-5' />
                </span>
                <div>
                  <CardTitle>Face Recognition Settings</CardTitle>
                  <CardDescription>Current biometric verification policy.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {[
                ['Similarity Threshold', '85%'],
                ['Liveness Detection', 'Enabled'],
                ['Blink Detection', 'Enabled'],
                ['Head Movement', 'Enabled'],
                ['Face Quality Minimum', '75 / 100'],
                ['Photo Retention', '30 days'],
              ].map(([label, value]) => (
                <div key={label} className='rounded-lg border bg-muted/20 p-3'>
                  <p className='text-xs text-muted-foreground'>{label}</p>
                  <p className='mt-1 text-sm font-semibold'>{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {(activeSection === 'enrollment' || activeSection === 'reset') && directoryTable}

      {activeSection === 'verification' && (
        <Card className='gap-0 py-0'>
          <CardHeader className='border-b py-5'>
            <CardTitle>Recent Verification Attempts</CardTitle>
            <CardDescription>Review face-match results and liveness checks.</CardDescription>
          </CardHeader>
          <CardContent className='px-0'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Employee', 'Time', 'Match Score', 'Liveness', 'Result', 'Action'].map(
                      (label) => (
                        <TableHead key={label}>{label}</TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {people.slice(0, 3).map((person, index) => (
                    <TableRow key={person.id}>
                      <TableCell className='min-w-44 font-semibold'>{person.name}</TableCell>
                      <TableCell className='whitespace-nowrap'>
                        {index === 0
                          ? 'Today, 08:12'
                          : index === 1
                            ? 'Today, 07:56'
                            : 'Yesterday, 17:42'}
                      </TableCell>
                      <TableCell>{person.quality} / 100</TableCell>
                      <TableCell>
                        <Badge variant='green'>Passed</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={index === 2 ? 'amber' : 'green'}>
                          {index === 2 ? 'Manual Check' : 'Verified'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size='sm' variant='ghost' onClick={() => setSelectedPerson(person)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'logs' && (
        <Card className='gap-0 py-0'>
          <CardHeader className='border-b py-5'>
            <CardTitle>Face Recognition Activity Logs</CardTitle>
            <CardDescription>Enrollment, verification, and reset activity.</CardDescription>
          </CardHeader>
          <CardContent className='px-0'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Employee', 'Activity', 'Performed By', 'Timestamp', 'Action'].map(
                      (label) => (
                        <TableHead key={label}>{label}</TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {people.slice(0, 3).map((person, index) => (
                    <TableRow key={person.id}>
                      <TableCell className='min-w-44 font-semibold'>{person.name}</TableCell>
                      <TableCell>
                        {index === 0
                          ? 'Verification passed'
                          : index === 1
                            ? 'Enrollment updated'
                            : 'Re-enrollment requested'}
                      </TableCell>
                      <TableCell>{index === 0 ? 'System' : 'HR Administrator'}</TableCell>
                      <TableCell className='whitespace-nowrap'>{person.lastUpdate}</TableCell>
                      <TableCell>
                        <Button size='sm' variant='ghost' onClick={() => setSelectedPerson(person)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedPerson} onOpenChange={(open) => !open && setSelectedPerson(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Face Recognition Detail</DialogTitle>
            <DialogDescription>{selectedPerson?.name}</DialogDescription>
          </DialogHeader>
          {selectedPerson && (
            <div className='grid gap-4'>
              <div className='flex items-center justify-between gap-4 rounded-xl border bg-muted/20 p-4'>
                <div className='flex items-center gap-3'>
                  <span className='flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <IconUsers className='size-5' />
                  </span>
                  <div>
                    <p className='font-semibold'>{selectedPerson.name}</p>
                    <p className='text-xs text-muted-foreground'>{selectedPerson.department}</p>
                  </div>
                </div>
                <StatusBadge status={selectedPerson.status} />
              </div>
              <dl className='grid gap-3 rounded-xl border p-4 text-sm sm:grid-cols-2'>
                {[
                  ['Enrollment', selectedPerson.enrollment],
                  ['Quality', selectedPerson.quality ? `${selectedPerson.quality} / 100` : '-'],
                  ['Samples', String(selectedPerson.samples)],
                  ['Last Update', selectedPerson.lastUpdate],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className='text-xs text-muted-foreground'>{label}</dt>
                    <dd className='mt-1 font-medium'>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setSelectedPerson(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={enrollmentOpen} onOpenChange={setEnrollmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Employee</DialogTitle>
            <DialogDescription>
              Choose an employee and start a guided face enrollment session.
            </DialogDescription>
          </DialogHeader>
          <form
            id='face-enrollment-form'
            className='grid gap-4'
            onSubmit={handleSubmit(submitEnrollment)}
          >
            <Controller
              control={control}
              name='employee'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Employee</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select employee' />
                    </SelectTrigger>
                    <SelectContent>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name} - {person.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Field data-invalid={!!errors.note}>
              <FieldLabel htmlFor='face-enrollment-note'>Enrollment Note</FieldLabel>
              <Input
                id='face-enrollment-note'
                placeholder='Optional note'
                aria-invalid={!!errors.note}
                {...register('note')}
              />
              <FieldError errors={[errors.note]} />
            </Field>
          </form>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEnrollmentOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' form='face-enrollment-form'>
              Start Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset face enrollment?</AlertDialogTitle>
            <AlertDialogDescription>
              Existing biometric samples for {resetTarget?.name} will be removed and the employee
              must enroll again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={() => {
                setResetTarget(null)
                snackbar.success('Face enrollment reset successfully.')
              }}
            >
              Reset Enrollment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppMain>
  )
}
