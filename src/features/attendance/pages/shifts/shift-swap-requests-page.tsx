import { AppMain } from '@/shared/components/app-layout/app-main'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { ShiftTabs } from '@/features/attendance/components/shift-tabs'

const requests = [
  ['Rama Aditya', 'Budi Setiawan', 'Regular', 'Morning', '20 May'],
  ['Sinta Maharani', 'Dewi Kartika', 'Regular', 'Evening', '22 May'],
]
export function ShiftSwapRequestsPage() {
  return (
    <AppMain
      title='Shift Swap Requests'
      subtitle='Review permintaan pertukaran shift antar employee.'
      className='gap-5 bg-muted/30'
    >
      <ShiftTabs active='swaps' />
      <div className='grid gap-3 sm:grid-cols-3'>
        {[
          ['6', 'Pending', 'bg-orange-500'],
          ['21', 'Approved', 'bg-emerald-500'],
          ['3', 'Rejected', 'bg-rose-500'],
        ].map(([value, label, color]) => (
          <section key={label} className='rounded-2xl border bg-card p-5 shadow-sm'>
            <i className={`float-right size-2 rounded-full ${color}`} />
            <p className='text-2xl font-bold'>{value}</p>
            <p className='text-xs text-muted-foreground'>{label}</p>
          </section>
        ))}
      </div>
      <section className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
        <Table>
          <TableHeader className='bg-muted/50'>
            <TableRow>
              {[
                'Requester',
                'Swap With',
                'From Shift',
                'To Shift',
                'Date',
                'Conflict',
                'Status',
                'Action',
              ].map((v) => (
                <TableHead key={v}>{v}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((row) => (
              <TableRow key={row[0]}>
                {row.map((cell, index) => (
                  <TableCell
                    key={cell}
                    className={index === 0 ? 'text-xs font-semibold' : 'text-xs'}
                  >
                    {cell}
                  </TableCell>
                ))}
                <TableCell>
                  <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-600'>
                    No
                  </span>
                </TableCell>
                <TableCell>
                  <span className='rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-600'>
                    Pending
                  </span>
                </TableCell>
                <TableCell className='text-xs font-medium'>Review</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </AppMain>
  )
}
