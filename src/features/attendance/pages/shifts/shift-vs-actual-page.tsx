import { IconDownload } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
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

const rows = [
  ['01 Sep', 'Andi Pratama', 'Morning', '07:00–15:00', '06:58', '15:04', '+2m / +4m', 'Matched'],
  ['02 Sep', 'Rina Sari', 'Evening', '15:00–23:00', '15:14', '23:02', 'Late 14m', 'Late In'],
  ['03 Sep', 'Dodi Saputra', 'Night', '22:00–06:00', '21:55', '05:37', 'Early 23m', 'Early Out'],
  ['04 Sep', 'Salsa Putri', 'Morning', '07:00–15:00', '—', '—', 'No clock in', 'Missing Clock'],
]

export function ShiftVsActualPage() {
  return (
    <AppMain
      title='Shift vs Actual'
      subtitle='Compare scheduled shifts with actual Clock In / Clock Out attendance results.'
      breadcrumbs={getAttendanceBreadcrumbs('Shift vs Actual')}
      backTo='/attendance/management/shifts'
      className='gap-5 bg-muted/30'
    >
      <ShiftTabs active='actual' />
      <Card className='shadow-sm'>
        <CardContent className='grid gap-4 p-4 md:grid-cols-[1fr_1.15fr_1.15fr_1fr_auto] md:items-end'>
          <div className='grid gap-1.5'>
            <Label htmlFor='actual-period' className='text-xs text-muted-foreground'>
              Period
            </Label>
            <Select defaultValue='september-2026'>
              <SelectTrigger id='actual-period'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='september-2026'>September 2026</SelectItem>
                <SelectItem value='october-2026'>October 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='actual-employee' className='text-xs text-muted-foreground'>
              Employee
            </Label>
            <Input id='actual-employee' placeholder='All employees' />
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='actual-project' className='text-xs text-muted-foreground'>
              Project
            </Label>
            <Select defaultValue='all-projects'>
              <SelectTrigger id='actual-project'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all-projects'>All projects</SelectItem>
                <SelectItem value='bfp-operations'>BFP Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='actual-result' className='text-xs text-muted-foreground'>
              Result
            </Label>
            <Select defaultValue='all-results'>
              <SelectTrigger id='actual-result'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all-results'>All results</SelectItem>
                <SelectItem value='matched'>Matched</SelectItem>
                <SelectItem value='exceptions'>Exceptions only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant='outline'>
            <IconDownload />
            Export
          </Button>
        </CardContent>
      </Card>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          ['238', 'Matched', 'green'],
          ['17', 'Late In', 'amber'],
          ['9', 'Early Out', 'amber'],
          ['4', 'Missing Clock', 'red'],
        ].map(([value, label, variant]) => (
          <Card key={label} className='shadow-sm'>
            <CardContent className='flex items-center justify-between p-5'>
              <div>
                <p className='text-3xl font-bold'>{value}</p>
                <p className='text-xs text-muted-foreground'>{label}</p>
              </div>
              <Badge variant={variant as 'green' | 'amber' | 'red'}>{label}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className='overflow-hidden'>
        <CardHeader className='border-b'>
          <CardTitle>Comparison Detail</CardTitle>
          <p className='text-xs text-muted-foreground'>
            Scheduled roster compared with verified attendance events.
          </p>
        </CardHeader>
        <CardContent className='overflow-x-auto px-0'>
          <Table className='min-w-[820px]'>
            <TableHeader className='bg-muted/50'>
              <TableRow>
                {[
                  'Date',
                  'Employee',
                  'Scheduled Shift',
                  'Scheduled',
                  'Clock In',
                  'Clock Out',
                  'Variance',
                  'Result',
                ].map((head) => (
                  <TableHead key={head}>{head}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row[0]}>
                  {row.map((cell, index) => (
                    <TableCell
                      key={`${row[0]}-${index}`}
                      className={index === 1 ? 'font-semibold' : undefined}
                    >
                      {index === 7 ? (
                        <Badge
                          variant={
                            cell === 'Matched'
                              ? 'green'
                              : cell === 'Missing Clock'
                                ? 'red'
                                : 'amber'
                          }
                        >
                          {cell}
                        </Badge>
                      ) : (
                        cell
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppMain>
  )
}
