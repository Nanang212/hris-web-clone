import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconCalendarEvent,
  IconCalendarStats,
  IconMapPin,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
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
import { DatePicker } from '@/shared/components/ui/date-picker'
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
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { CalendarTabs } from '@/features/attendance/components/calendar-tabs'

interface Holiday {
  id: string
  date: string
  name: string
  type: 'National' | 'Regional' | 'Company'
  region: 'All' | 'Jakarta' | 'Bandung' | 'Surabaya'
  observed: string
  status: 'Active' | 'Scheduled' | 'Inactive'
}

const initialHolidays: Holiday[] = [
  {
    id: '1',
    date: '2026-01-01',
    name: "New Year's Day",
    type: 'National',
    region: 'All',
    observed: '2026-01-01',
    status: 'Active',
  },
  {
    id: '2',
    date: '2026-03-20',
    name: 'Eid al-Fitr',
    type: 'National',
    region: 'All',
    observed: '2026-03-20',
    status: 'Active',
  },
  {
    id: '3',
    date: '2026-05-01',
    name: 'Labour Day',
    type: 'National',
    region: 'All',
    observed: '2026-05-01',
    status: 'Active',
  },
  {
    id: '4',
    date: '2026-05-31',
    name: 'Vesak Day',
    type: 'National',
    region: 'All',
    observed: '2026-05-31',
    status: 'Scheduled',
  },
  {
    id: '5',
    date: '2026-08-17',
    name: 'Independence Day',
    type: 'National',
    region: 'All',
    observed: '2026-08-17',
    status: 'Scheduled',
  },
  {
    id: '6',
    date: '2026-06-22',
    name: 'Jakarta Anniversary',
    type: 'Regional',
    region: 'Jakarta',
    observed: '2026-06-22',
    status: 'Scheduled',
  },
]

const emptyHoliday: Holiday = {
  id: '',
  date: '',
  name: '',
  type: 'National',
  region: 'All',
  observed: '',
  status: 'Active',
}

const holidayTypes = ['National', 'Regional', 'Company'] as const
const holidayRegions = ['All', 'Jakarta', 'Bandung', 'Surabaya'] as const
const holidayStatuses = ['Active', 'Scheduled', 'Inactive'] as const

export function PublicHolidaysPage() {
  const [holidays, setHolidays] = useState(initialHolidays)
  const [query, setQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('2026')
  const [typeFilter, setTypeFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Holiday | null>(null)
  const holidaySchema = useSchema((z) => ({
    id: z.string(),
    date: z.string().min(1, { message: 'Date is required.' }),
    name: z.string().min(1, { message: 'Holiday name is required.' }),
    type: z.enum(holidayTypes),
    region: z.enum(holidayRegions),
    observed: z.string().min(1, { message: 'Observed date is required.' }),
    status: z.enum(holidayStatuses),
  }))
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<z.infer<typeof holidaySchema>>({
    resolver: zodResolver(holidaySchema),
    defaultValues: emptyHoliday,
  })

  const filteredHolidays = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return holidays.filter((holiday) => {
      const matchesQuery = !normalizedQuery || holiday.name.toLowerCase().includes(normalizedQuery)
      const matchesYear = dayjs(holiday.date).format('YYYY') === yearFilter
      const matchesType = typeFilter === 'all' || holiday.type === typeFilter
      const matchesRegion = regionFilter === 'all' || holiday.region === regionFilter
      return matchesQuery && matchesYear && matchesType && matchesRegion
    })
  }, [holidays, query, regionFilter, typeFilter, yearFilter])

  const openEditor = (holiday?: Holiday) => {
    const nextHoliday = holiday ?? { ...emptyHoliday, id: crypto.randomUUID() }
    reset(nextHoliday)
    setEditingHoliday(nextHoliday)
  }

  const saveHoliday = (draft: z.infer<typeof holidaySchema>) => {
    setHolidays((current) => {
      const exists = current.some((holiday) => holiday.id === draft.id)
      return exists
        ? current.map((holiday) => (holiday.id === draft.id ? draft : holiday))
        : [draft, ...current]
    })
    setEditingHoliday(null)
    snackbar.success('Public holiday saved successfully.')
  }

  const deleteHoliday = () => {
    if (!deleteTarget) return
    setHolidays((current) => current.filter((holiday) => holiday.id !== deleteTarget.id))
    setDeleteTarget(null)
    snackbar.success('Public holiday deleted successfully.')
  }

  const statItems = [
    {
      label: 'Total Holidays',
      value: holidays.length,
      icon: IconCalendarStats,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      label: 'Upcoming',
      value: holidays.filter((holiday) => holiday.status === 'Scheduled').length,
      icon: IconCalendarEvent,
      iconClassName: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Regional',
      value: holidays.filter((holiday) => holiday.type === 'Regional').length,
      icon: IconMapPin,
      iconClassName: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
  ]

  return (
    <AppMain
      title='Public Holidays'
      subtitle='Kelola hari libur nasional, regional, dan kebijakan pengganti.'
      breadcrumbs={getAttendanceBreadcrumbs('Public Holidays')}
      backTo='/attendance/calendar'
      className='gap-5 bg-muted/30'
      actions={
        <Button onClick={() => openEditor()}>
          <IconPlus />
          Add Public Holiday
        </Button>
      }
    >
      <CalendarTabs active='holidays' />

      <div className='grid gap-4 sm:grid-cols-3'>
        {statItems.map((item) => (
          <Card key={item.label} size='sm'>
            <CardContent className='flex items-center gap-3'>
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.iconClassName}`}
              >
                <item.icon className='size-5' />
              </span>
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>{item.label}</p>
                <p className='text-2xl font-bold tracking-tight'>{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className='gap-0 py-0'>
        <CardHeader className='border-b py-5'>
          <CardTitle>Holiday Directory</CardTitle>
          <CardDescription>Search and filter the organization holiday calendar.</CardDescription>
        </CardHeader>
        <CardContent className='px-0'>
          <div className='grid gap-3 border-b p-4 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_160px_180px_180px]'>
            <div className='relative sm:col-span-2 xl:col-span-1'>
              <IconSearch className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Search holiday name...'
                className='pl-9'
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Calendar year' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='2025'>2025</SelectItem>
                <SelectItem value='2026'>2026</SelectItem>
                <SelectItem value='2027'>2027</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Holiday type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All holiday types</SelectItem>
                {holidayTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Region' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All regions</SelectItem>
                {holidayRegions
                  .filter((region) => region !== 'All')
                  .map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  {['Date', 'Holiday Name', 'Type', 'Region', 'Observed', 'Status', 'Action'].map(
                    (value) => (
                      <TableHead key={value}>{value}</TableHead>
                    ),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className='text-xs whitespace-nowrap'>
                      {dayjs(holiday.date).format('DD MMM YYYY')}
                    </TableCell>
                    <TableCell className='min-w-48 text-xs font-semibold'>{holiday.name}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>{holiday.type}</Badge>
                    </TableCell>
                    <TableCell className='text-xs'>{holiday.region}</TableCell>
                    <TableCell className='text-xs whitespace-nowrap'>
                      {dayjs(holiday.observed).format('DD MMM YYYY')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          holiday.status === 'Active'
                            ? 'green'
                            : holiday.status === 'Scheduled'
                              ? 'amber'
                              : 'secondary'
                        }
                      >
                        {holiday.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-1'>
                        <Button size='sm' variant='ghost' onClick={() => openEditor(holiday)}>
                          Edit
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          className='text-destructive hover:text-destructive'
                          onClick={() => setDeleteTarget(holiday)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredHolidays.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='py-10 text-center text-sm text-muted-foreground'
                    >
                      No holidays match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingHoliday} onOpenChange={(open) => !open && setEditingHoliday(null)}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              {editingHoliday && holidays.some((holiday) => holiday.id === editingHoliday.id)
                ? 'Edit Public Holiday'
                : 'Add Public Holiday'}
            </DialogTitle>
            <DialogDescription>Complete the holiday information before saving.</DialogDescription>
          </DialogHeader>
          <form
            id='holiday-form'
            className='grid gap-4 sm:grid-cols-2'
            onSubmit={handleSubmit(saveHoliday)}
          >
            <Controller
              control={control}
              name='date'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Date</FieldLabel>
                  <DatePicker
                    mode='single'
                    selected={field.value ? dayjs(field.value).toDate() : undefined}
                    onSelect={(date) =>
                      field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                    }
                    className='w-full'
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='holiday-name'>Holiday Name</FieldLabel>
              <Input id='holiday-name' aria-invalid={!!errors.name} {...register('name')} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Controller
              control={control}
              name='type'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Type</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {holidayTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='region'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Region</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {holidayRegions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='observed'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Observed Date</FieldLabel>
                  <DatePicker
                    mode='single'
                    selected={field.value ? dayjs(field.value).toDate() : undefined}
                    onSelect={(date) =>
                      field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                    }
                    className='w-full'
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='status'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {holidayStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </form>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditingHoliday(null)}>
              Cancel
            </Button>
            <Button type='submit' form='holiday-form'>
              Save Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete public holiday?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} will be removed from the working calendar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant='destructive' onClick={deleteHoliday}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppMain>
  )
}
