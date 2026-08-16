import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { ShiftTabs } from '@/features/attendance/components/shift-tabs'

const employees = [
  ['Rama Aditya', 'Product', 'Regular', 'Regular', '16 May', 'Assigned'],
  ['Sinta Maharani', 'Design', 'Regular', 'Morning', '20 May', 'Scheduled'],
  ['Budi Setiawan', 'Engineering', 'Morning', 'Evening', '20 May', 'Scheduled'],
]
export function ShiftAssignmentsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <AppMain
      title='Shift Assignment'
      subtitle='Assign shift per employee dan tanggal efektif.'
      className='gap-5 bg-muted/30'
    >
      <ShiftTabs active='assignments' />
      <section className='grid gap-3 rounded-2xl border bg-card p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto_auto]'>
        <Input className='rounded-xl border bg-background' defaultValue='All Department' />
        <Input className='rounded-xl border bg-background' defaultValue='All Shift' />
        <Input className='rounded-xl border bg-background' defaultValue='16 May 2024' />
        <Button variant='outline'>Filter</Button>
        <Button onClick={() => setModalOpen(true)}>Bulk Assign Shift</Button>
      </section>
      <div className='rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-primary'>
        3 employees on this page selected{' '}
        <button type='button' className='ml-12 font-semibold'>
          Select all 50 employees
        </button>
        <button type='button' className='float-right text-destructive'>
          Clear selection
        </button>
      </div>
      <section className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
        <Table>
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
                      <span className='rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary'>
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </TableCell>
                ))}
                <TableCell className='text-xs'>Edit</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      <section className='rounded-2xl border bg-card p-5 shadow-sm'>
        <h2 className='font-bold'>Assignment History</h2>
        <Table className='mt-4'>
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
      </section>
      {modalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4'>
          <section className='w-full max-w-2xl rounded-2xl bg-card p-6 shadow-xl'>
            <div className='flex justify-between'>
              <div>
                <h2 className='text-lg font-bold'>Bulk Assign Shift</h2>
                <p className='mt-1 text-xs text-muted-foreground'>
                  From 50 employees in the current filter
                </p>
              </div>
              <span className='rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary'>
                3 employees selected
              </span>
            </div>
            <div className='mt-5 grid grid-cols-2 gap-5'>
              <label className='text-xs text-muted-foreground'>
                New Shift
                <Input
                  className='mt-2 rounded-xl border bg-background'
                  defaultValue='Morning • 07:00–16:00'
                />
              </label>
              <label className='text-xs text-muted-foreground'>
                Effective Date
                <Input
                  className='mt-2 rounded-xl border bg-background'
                  defaultValue='20 May 2024'
                />
              </label>
            </div>
            <label className='mt-5 block text-xs text-muted-foreground'>
              Reason
              <Input
                className='mt-2 rounded-xl border bg-background'
                defaultValue='Team rotation'
              />
            </label>
            <h3 className='mt-6 text-xs font-semibold'>Selected Employees</h3>
            <div className='mt-3 space-y-2'>
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
            <div className='mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700'>
              ● No shift conflicts detected for 3 selected employees
            </div>
            <div className='mt-5 flex justify-end gap-3'>
              <Button variant='outline' onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>Assign Shift</Button>
            </div>
          </section>
        </div>
      )}
    </AppMain>
  )
}
