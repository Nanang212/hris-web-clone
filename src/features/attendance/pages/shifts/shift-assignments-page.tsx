import { IconCircleCheck } from '@tabler/icons-react'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Alert, AlertDescription, AlertIcon } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { ShiftTabs } from '@/features/attendance/components/shift-tabs'

const employees = [
  ['EMP-014 · Andi Pratama', 'BFP Operations', 'Regular', 'Morning', '01 Sep 2026', 'Assigned'],
  ['EMP-021 · Rina Sari', 'BFP Operations', 'Regular', 'Evening', '01 Sep 2026', 'Scheduled'],
  ['EMP-032 · Dodi Saputra', 'BFP Operations', 'Morning', 'Night', '02 Sep 2026', 'Scheduled'],
]
export function ShiftAssignmentsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <AppMain
      title='Shift Assignment'
      subtitle='Assign shift per employee dan tanggal efektif.'
      breadcrumbs={getAttendanceBreadcrumbs('Shift Assignment')}
      backTo='/attendance/management/shifts'
      className='gap-5 bg-muted/30'
    >
      <ShiftTabs active='assignments' />
      <Card className='shadow-sm'>
        <CardContent className='grid gap-4 p-4 md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-end'>
          <div className='grid gap-1.5'>
            <Label htmlFor='assignment-department' className='text-xs text-muted-foreground'>
              Department / Project
            </Label>
            <Select defaultValue='bfp-operations'>
              <SelectTrigger id='assignment-department'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='bfp-operations'>BFP Operations</SelectItem>
                <SelectItem value='all-departments'>All departments</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='assignment-shift' className='text-xs text-muted-foreground'>
              Shift
            </Label>
            <Select defaultValue='all-shifts'>
              <SelectTrigger id='assignment-shift'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all-shifts'>All shifts</SelectItem>
                <SelectItem value='morning'>Morning · 06:00–14:00</SelectItem>
                <SelectItem value='evening'>Evening · 14:00–23:00</SelectItem>
                <SelectItem value='night'>Night · 23:00–07:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='assignment-effective-date' className='text-xs text-muted-foreground'>
              Effective Date
            </Label>
            <Input
              id='assignment-effective-date'
              className='bg-background'
              defaultValue='01 Sep 2026'
            />
          </div>
          <Button variant='outline'>Filter</Button>
          <Button onClick={() => setModalOpen(true)}>Bulk Assign Shift</Button>
        </CardContent>
      </Card>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-primary/10 px-4 py-3 text-xs text-primary'>
        <span className='font-medium'>3 employees on this page selected</span>
        <Button type='button' variant='link' size='sm' className='h-auto px-0'>
          Select all 50 employees
        </Button>
        <Button type='button' variant='link' size='sm' className='h-auto px-0 text-destructive'>
          Clear selection
        </Button>
      </div>
      <section className='overflow-x-auto rounded-2xl border bg-card shadow-sm'>
        <Table className='min-w-[860px]'>
          <TableHeader className='bg-muted/50'>
            <TableRow>
              {[
                'Employee',
                'Department',
                'Current Shift',
                'New Shift',
                'Effective Date',
                'Status',
                'Action',
              ].map((v) => (
                <TableHead key={v}>{v}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((row) => (
              <TableRow key={row[0]}>
                {row.map((cell, index) => (
                  <TableCell
                    key={cell}
                    className={index === 0 ? 'text-xs font-semibold' : 'text-xs'}
                  >
                    {index === 5 ? (
                      <Badge variant={cell === 'Assigned' ? 'green' : 'blue'}>{cell}</Badge>
                    ) : (
                      cell
                    )}
                  </TableCell>
                ))}
                <TableCell className='text-xs'>
                  <Button variant='link' size='sm' className='px-0'>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      <section className='rounded-2xl border bg-card p-5 shadow-sm'>
        <h2 className='font-bold'>Assignment History</h2>
        <div className='mt-4 overflow-x-auto'>
          <Table className='min-w-[640px]'>
            <TableHeader>
              <TableRow>
                {['Effective', 'Employee', 'From', 'To', 'Changed By', 'Reason'].map((v) => (
                  <TableHead key={v}>{v}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>20 May</TableCell>
                <TableCell>Sinta Maharani</TableCell>
                <TableCell>Regular</TableCell>
                <TableCell>Morning</TableCell>
                <TableCell>Dewi Kartika</TableCell>
                <TableCell>Operational need</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Bulk Assign Shift</DialogTitle>
              <DialogDescription>From 50 employees in the current filter</DialogDescription>
            </DialogHeader>
            <div className='flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/30 px-3 py-2'>
              <span className='text-xs text-muted-foreground'>Selected employees</span>
              <Badge variant='blue'>3 employees selected</Badge>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='grid gap-1.5'>
                <Label htmlFor='bulk-new-shift' className='text-xs text-muted-foreground'>
                  New Shift
                </Label>
                <Select defaultValue='morning'>
                  <SelectTrigger id='bulk-new-shift'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='morning'>Morning · 06:00–14:00</SelectItem>
                    <SelectItem value='evening'>Evening · 14:00–23:00</SelectItem>
                    <SelectItem value='night'>Night · 23:00–07:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-1.5'>
                <Label htmlFor='bulk-effective-date' className='text-xs text-muted-foreground'>
                  Effective Date
                </Label>
                <Input
                  id='bulk-effective-date'
                  className='bg-background'
                  defaultValue='01 Sep 2026'
                />
              </div>
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor='bulk-reason' className='text-xs text-muted-foreground'>
                Reason
              </Label>
              <Input id='bulk-reason' className='bg-background' defaultValue='Team rotation' />
            </div>
            <h3 className='pt-1 text-xs font-semibold'>Selected Employees</h3>
            <div className='flex flex-col gap-2'>
              {employees.map(([name, dept]) => (
                <div
                  key={name}
                  className='flex justify-between rounded-xl border bg-muted/30 px-4 py-3 text-xs'
                >
                  <b>{name}</b>
                  <span className='text-muted-foreground'>{dept}</span>
                </div>
              ))}
            </div>
            <Alert variant='success'>
              <AlertIcon>
                <IconCircleCheck />
              </AlertIcon>
              <AlertDescription>
                No shift conflicts detected for 3 selected employees
              </AlertDescription>
            </Alert>
            <DialogFooter className='flex-col-reverse gap-2 sm:flex-row'>
              <Button variant='outline' onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>Assign Shift</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppMain>
  )
}
