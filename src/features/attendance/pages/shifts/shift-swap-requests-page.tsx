import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
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

const requests = [
  ['Rama Aditya', 'Budi Setiawan', 'Regular', 'Morning', '20 May'],
  ['Sinta Maharani', 'Dewi Kartika', 'Regular', 'Evening', '22 May'],
]
export function ShiftSwapRequestsPage() {
  return (
    <AppMain
      title='Shift Swap Requests'
      subtitle='Review permintaan pertukaran shift antar employee.'
      breadcrumbs={getAttendanceBreadcrumbs('Shift Swap Requests')}
      backTo='/attendance/management/shifts'
      className='gap-5 bg-muted/30'
    >
      <ShiftTabs active='swaps' />
      <div className='grid gap-3 sm:grid-cols-3'>
        {[
          ['6', 'Pending', 'amber'],
          ['21', 'Approved', 'green'],
          ['3', 'Rejected', 'red'],
        ].map(([value, label, variant]) => (
          <Card key={label}>
            <CardContent className='p-5'>
            <Badge className='float-right' variant={variant as 'amber' | 'green' | 'red'}>
              {label}
            </Badge>
            <p className='text-2xl font-bold'>{value}</p>
            <p className='mt-1 text-xs text-muted-foreground'>swap requests</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className='min-w-0 overflow-hidden py-0'>
        <CardContent className='overflow-x-auto px-0'>
        <Table className='min-w-[840px]'>
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
                  <Badge variant='green'>No</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant='amber'>Pending</Badge>
                </TableCell>
                <TableCell>
                  <Button asChild variant='link' size='sm' className='px-0'>
                    <Link
                      to='/attendance/management/shifts/swaps/$swapId'
                      params={{ swapId: row[0] === 'Rama Aditya' ? '1' : '2' }}
                    >
                      Review
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </CardContent>
      </Card>
    </AppMain>
  )
}
