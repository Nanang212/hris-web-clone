import { IconFileSpreadsheet, IconInfoCircle, IconPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { ShiftTabs } from '@/features/attendance/components/shift-tabs'

const employees = [
  ['EMP-014 • Andi Pratama', 'BFP Operations · SPBU A', ['M', 'M', 'E', 'E', 'N', 'OFF', 'OFF']],
  ['EMP-021 • Rina Sari', 'BFP Operations · SPBU A', ['E', 'E', 'N', 'N', 'OFF', 'OFF', 'M']],
  ['EMP-032 • Dodi Saputra', 'BFP Operations · SPBU B', ['N', 'N', 'OFF', 'M', 'M', 'E', 'E']],
] as const

const shiftOptions = [
  { value: 'M', label: 'Morning', time: '06:00–14:00', badge: 'green' },
  { value: 'E', label: 'Evening', time: '14:00–23:00', badge: 'green' },
  { value: 'N', label: 'Night', time: '23:00–07:00 (+1)', badge: 'amber' },
  { value: 'OFF', label: 'Day Off', time: '', badge: 'blue' },
] as const

const scheduleDays = ['01 Tue', '02 Wed', '03 Thu', '04 Fri', '05 Sat', '06 Sun', '07 Mon']

const weekdayRules = [
  ['Mon', 'M'],
  ['Tue', 'M'],
  ['Wed', 'E'],
  ['Thu', 'E'],
  ['Fri', 'N'],
  ['Sat', 'OFF'],
  ['Sun', 'OFF'],
] as const

const cycleRules = ['M', 'M', 'E', 'E', 'N', 'N', 'OFF', 'OFF'] as const

function shiftTone(value?: string) {
  if (value === 'N') return 'border-amber-200 bg-amber-500/10 text-amber-700'
  if (value === 'OFF') return 'border-blue-200 bg-blue-500/10 text-blue-700'
  if (value) return 'border-green-200 bg-green-500/10 text-green-700'
  return 'bg-background'
}

export function ShiftSchedulePage() {
  const [modal, setModal] = useState<'upload' | 'add' | 'edit' | 'pattern' | null>(null)
  return (
    <AppMain
      title='Monthly Shift Schedule'
      subtitle='Build, upload, and edit employee shifting schedules by project and period/month.'
      breadcrumbs={getAttendanceBreadcrumbs('Monthly Shift Schedule')}
      backTo='/attendance/management'
      className='gap-5 bg-muted/30'
    >
      <ShiftTabs active='schedule' />
      <Card className='shadow-sm'>
        <CardContent className='grid gap-4 p-4 md:grid-cols-[1fr_1.2fr_1.2fr_auto_auto] md:items-end'>
          <div className='grid gap-1.5'>
            <Label htmlFor='schedule-period' className='text-xs text-muted-foreground'>
              Period
            </Label>
            <Select defaultValue='september-2026'>
              <SelectTrigger id='schedule-period'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='september-2026'>September 2026</SelectItem>
                <SelectItem value='october-2026'>October 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='schedule-project' className='text-xs text-muted-foreground'>
              Project
            </Label>
            <Select defaultValue='bfp-operations'>
              <SelectTrigger id='schedule-project'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='bfp-operations'>BFP Operations</SelectItem>
                <SelectItem value='retail-support'>Retail Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='schedule-search' className='text-xs text-muted-foreground'>
              Search Employee
            </Label>
            <Input id='schedule-search' placeholder='Search name / ID' />
          </div>
          <Button variant='outline' onClick={() => setModal('upload')}>
            <IconFileSpreadsheet />
            Upload Excel
          </Button>
          <Button onClick={() => setModal('add')}>
            <IconPlus />
            Add Schedule
          </Button>
        </CardContent>
      </Card>
      <div className='flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/10 px-4 py-3 text-xs text-primary'>
        <IconInfoCircle className='mt-0.5 size-4 shrink-0' />
        <p>
          Upload Excel (.xlsx) using the template, or add rows manually. Imported cells remain
          editable before and after saving.
        </p>
      </div>
      <Card className='overflow-hidden shadow-sm'>
        <CardHeader className='border-b'>
          <CardTitle>Schedule Preview · September 2026 · BFP Operations</CardTitle>
          <p className='text-xs text-muted-foreground'>
            Multiple project shift masters: Morning 06–14 · Evening 14–23 · Night 23–07.
          </p>
        </CardHeader>
        <CardContent className='overflow-x-auto px-0'>
          <Table className='min-w-[1000px]'>
            <TableHeader className='bg-muted/50'>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Project / Location</TableHead>
                {['01 Tue', '02 Wed', '03 Thu', '04 Fri', '05 Sat', '06 Sun', '07 Mon'].map(
                  (day) => (
                    <TableHead key={day} className='text-center'>
                      {day}
                    </TableHead>
                  ),
                )}
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(([name, project, shifts]) => (
                <TableRow key={name}>
                  <TableCell className='font-semibold whitespace-nowrap'>{name}</TableCell>
                  <TableCell className='whitespace-nowrap text-muted-foreground'>
                    {project}
                  </TableCell>
                  {shifts.map((shift, index) => (
                    <TableCell key={`${name}-${index}`} className='text-center'>
                      <Badge variant={shift === 'OFF' ? 'blue' : shift === 'N' ? 'amber' : 'green'}>
                        {shift}
                      </Badge>
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button variant='link' size='sm' onClick={() => setModal('edit')}>
                      Edit Row
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className='flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground'>
        <span className='font-semibold text-foreground'>Shift legend</span>
        <span className='flex items-center gap-2'>
          <Badge variant='green'>M</Badge>
          Morning 06–14
        </span>
        <span className='flex items-center gap-2'>
          <Badge variant='green'>E</Badge>
          Evening 14–23
        </span>
        <span className='flex items-center gap-2'>
          <Badge variant='amber'>N</Badge>
          Night 23–07 (+1)
        </span>
        <span className='flex items-center gap-2'>
          <Badge variant='blue'>OFF</Badge>
          Day Off
        </span>
        <Button variant='link' size='sm' className='h-auto px-0' asChild>
          <Link to='/attendance/management/shifts/setup'>Edit shift masters</Link>
        </Button>
      </div>
      <ScheduleDialog
        modal={modal}
        onClose={() => setModal(null)}
        onPattern={() => setModal('pattern')}
      />
    </AppMain>
  )
}

function ScheduleDialog({
  modal,
  onClose,
  onPattern,
}: Readonly<{
  modal: 'upload' | 'add' | 'edit' | 'pattern' | null
  onClose: () => void
  onPattern: () => void
}>) {
  const [patternTab, setPatternTab] = useState<'weekday' | 'cycle'>('weekday')

  if (!modal) return null

  const title =
    modal === 'upload'
      ? 'Upload Shift Roster'
      : modal === 'add'
        ? 'Add Monthly Schedule'
        : modal === 'edit'
          ? 'Edit Schedule Row'
          : 'Apply Pattern'
  const isEdit = modal === 'edit'

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-3xl'>
        <DialogHeader className='border-b px-6 py-4 pe-14'>
          <div className='flex items-start justify-between gap-4'>
            <div className='grid gap-1.5'>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className='text-xs'>
                {modal === 'upload'
                  ? 'Import an Excel roster for a project and period.'
                  : modal === 'pattern'
                    ? 'Fill the month based on weekday rules.'
                    : isEdit
                      ? "Update this employee's monthly roster without changing the shift master."
                      : 'Assign shifts for one employee in the selected project and month.'}
              </DialogDescription>
            </div>
            {isEdit && <Badge variant='blue'>Existing roster</Badge>}
          </div>
        </DialogHeader>

        <div className='max-h-[calc(90vh-10rem)] overflow-y-auto px-6 py-5'>
          {modal === 'upload' ? (
            <div className='flex flex-col gap-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='upload-project' className='text-xs text-muted-foreground'>
                    Project <span className='text-destructive'>*</span>
                  </Label>
                  <Select defaultValue='bfp-operations'>
                    <SelectTrigger id='upload-project'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='bfp-operations'>BFP Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='upload-period' className='text-xs text-muted-foreground'>
                    Period <span className='text-destructive'>*</span>
                  </Label>
                  <Select defaultValue='september-2026'>
                    <SelectTrigger id='upload-period'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='september-2026'>September 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='grid gap-1.5'>
                <Label className='text-xs text-muted-foreground'>
                  Excel File <span className='text-destructive'>*</span>
                </Label>
                <div className='flex items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-3'>
                  <div className='flex min-w-0 items-center gap-3'>
                    <div className='grid size-9 shrink-0 place-items-center rounded-lg bg-green-500/10 text-green-700'>
                      <IconFileSpreadsheet className='size-5' />
                    </div>
                    <div className='min-w-0'>
                      <p className='truncate text-xs font-semibold'>shift_roster_sep_2026.xlsx</p>
                      <p className='mt-1 text-[10px] text-muted-foreground'>
                        Ready to import · XLSX file
                      </p>
                    </div>
                  </div>
                  <Button variant='link' size='sm' className='h-auto px-0'>
                    Replace file
                  </Button>
                </div>
              </div>

              <Button variant='link' size='sm' className='h-auto w-fit px-0'>
                Download Excel Template
              </Button>
              <div className='rounded-xl border border-primary/15 bg-primary/10 p-3 text-xs text-primary'>
                <p className='font-semibold'>Validation preview</p>
                <p className='mt-1'>48 employees · 1,440 schedule cells · 3 warnings.</p>
                <p className='mt-1'>Imported cells can be edited after import.</p>
              </div>
            </div>
          ) : modal === 'pattern' ? (
            <div className='flex flex-col gap-4'>
              <Tabs
                value={patternTab}
                onValueChange={(value) => {
                  if (value === 'weekday' || value === 'cycle') setPatternTab(value)
                }}
              >
                <TabsList variant='segmented' className='w-full sm:w-fit'>
                  <TabsTrigger value='weekday'>By Day of Week</TabsTrigger>
                  <TabsTrigger value='cycle'>Rotating Cycle</TabsTrigger>
                </TabsList>
              </Tabs>

              {patternTab === 'weekday' ? (
                <>
                  <div className='grid gap-1.5 sm:max-w-sm'>
                    <Label htmlFor='pattern-scope' className='text-xs text-muted-foreground'>
                      Apply to
                    </Label>
                    <Select defaultValue='whole-month'>
                      <SelectTrigger id='pattern-scope'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='whole-month'>Whole Month</SelectItem>
                        <SelectItem value='selected-dates'>Selected Dates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className='text-xs font-semibold'>Weekday rules</p>
                    <p className='mt-1 text-[10px] text-muted-foreground'>
                      Choose which active project shift should apply to each weekday.
                    </p>
                    <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                      {weekdayRules.map(([day, shift]) => (
                        <div key={day} className='flex items-center gap-3'>
                          <b className='w-8 text-[10px]'>{day}</b>
                          <ShiftSelect defaultValue={shift} />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className='grid gap-1.5 sm:max-w-sm'>
                    <Label htmlFor='cycle-start' className='text-xs text-muted-foreground'>
                      Start pattern from
                    </Label>
                    <Input id='cycle-start' defaultValue='01 Sep 2026' />
                  </div>
                  <div>
                    <p className='text-xs font-semibold'>Cycle days</p>
                    <p className='mt-1 text-[10px] text-muted-foreground'>
                      The cycle repeats continuously until the end of the period.
                    </p>
                    <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                      {cycleRules.map((shift, index) => (
                        <div key={`cycle-${index + 1}`} className='flex items-center gap-3'>
                          <span className='w-12 shrink-0 text-[10px] text-muted-foreground'>
                            Day {index + 1}
                          </span>
                          <ShiftSelect defaultValue={shift} />
                        </div>
                      ))}
                    </div>
                    <Button variant='link' size='sm' className='mt-2 h-auto px-0'>
                      + Add Cycle Day
                    </Button>
                  </div>
                </>
              )}

              <div className='rounded-xl border border-primary/15 bg-primary/10 p-3 text-[10px] text-primary'>
                <span className='font-semibold'>Preview: </span>
                {patternTab === 'weekday'
                  ? 'M → M → E → E → N → OFF → OFF, repeated by weekday for September 2026.'
                  : 'M → M → E → E → N → N → OFF → OFF, then repeat.'}
              </div>
              <div className='flex items-center justify-between gap-4 rounded-xl border bg-muted/20 px-3 py-2.5'>
                <div>
                  <p className='text-xs font-medium'>Overwrite existing schedules</p>
                  <p className='mt-1 text-[10px] text-muted-foreground'>
                    OFF · keep existing manual overrides
                  </p>
                </div>
                <Switch size='sm' aria-label='Overwrite existing schedules' />
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-4'>
              <div className='grid gap-4 sm:grid-cols-3'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='schedule-employee' className='text-xs text-muted-foreground'>
                    Employee <span className='text-destructive'>*</span>
                  </Label>
                  <Select defaultValue={isEdit ? 'emp-014' : undefined}>
                    <SelectTrigger id='schedule-employee'>
                      <SelectValue placeholder='Select employee' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='emp-014'>EMP-014 · Andi Pratama</SelectItem>
                      <SelectItem value='emp-021'>EMP-021 · Rina Sari</SelectItem>
                      <SelectItem value='emp-032'>EMP-032 · Dodi Saputra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='schedule-project-modal' className='text-xs text-muted-foreground'>
                    Project <span className='text-destructive'>*</span>
                  </Label>
                  <Select defaultValue='bfp-operations'>
                    <SelectTrigger id='schedule-project-modal'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='bfp-operations'>BFP Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='schedule-period-modal' className='text-xs text-muted-foreground'>
                    Period <span className='text-destructive'>*</span>
                  </Label>
                  <Select defaultValue='september-2026'>
                    <SelectTrigger id='schedule-period-modal'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='september-2026'>September 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='flex flex-wrap items-end justify-between gap-2'>
                <div>
                  <p className='text-xs font-semibold'>Schedule by Date</p>
                  <p className='mt-1 text-[10px] text-muted-foreground'>
                    Select one shift per date. Scroll horizontally for the remaining dates in the
                    month.
                  </p>
                </div>
                <div className='flex items-center gap-3'>
                  <Button variant='link' size='sm' className='h-auto px-0'>
                    Clear All
                  </Button>
                  <Button variant='outline' size='sm' onClick={onPattern}>
                    Apply Pattern
                  </Button>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                {scheduleDays.map((day, index) => {
                  const selectedShift = isEdit ? employees[0][2][index] : undefined
                  return (
                    <div
                      key={day}
                      className='grid gap-2 rounded-xl border bg-muted/20 p-2.5 text-xs'
                    >
                      <b className='text-center text-[10px]'>{day}</b>
                      <Select defaultValue={selectedShift}>
                        <SelectTrigger size='sm' className={shiftTone(selectedShift)}>
                          <SelectValue placeholder='Select Shift' />
                        </SelectTrigger>
                        <SelectContent>
                          {shiftOptions.map((option) => (
                            <ShiftSelectItem key={option.value} option={option} />
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>

              <div className='rounded-xl border border-primary/15 bg-primary/10 p-3 text-[10px] text-primary'>
                {isEdit
                  ? 'Existing schedule: Morning → Morning → Evening → Evening → Night → OFF → OFF. Changes apply only to this employee.'
                  : 'Tip: use Apply Pattern to fill the whole month faster. Individual dates remain editable afterward.'}
              </div>

              <div>
                <p className='text-xs font-semibold'>Shift source</p>
                <p className='mt-1 text-[10px] text-muted-foreground'>
                  Only active shift masters from BFP Operations can be selected.
                </p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {shiftOptions.map((option) => (
                    <Badge key={option.value} variant={option.badge}>
                      {option.value} · {option.label} {option.time}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='border-t px-6 py-4'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            {modal === 'upload'
              ? 'Import Schedule'
              : modal === 'pattern'
                ? 'Apply Pattern'
                : isEdit
                  ? 'Save Changes'
                  : 'Save Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ShiftSelect({ defaultValue }: Readonly<{ defaultValue: string }>) {
  return (
    <Select defaultValue={defaultValue}>
      <SelectTrigger className={shiftTone(defaultValue)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {shiftOptions.map((option) => (
          <ShiftSelectItem key={option.value} option={option} />
        ))}
      </SelectContent>
    </Select>
  )
}

function ShiftSelectItem({ option }: Readonly<{ option: (typeof shiftOptions)[number] }>) {
  return (
    <SelectItem value={option.value}>
      <span className='flex w-full items-center justify-between gap-4'>
        <span>
          {option.value} · {option.label}
        </span>
        {option.time && <span className='text-[10px] text-muted-foreground'>{option.time}</span>}
      </span>
    </SelectItem>
  )
}
