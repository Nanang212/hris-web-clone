import { IconPlus } from '@tabler/icons-react'

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

const holidays = [
  ['01 Jan', 'New Year’s Day', 'National', 'All', '01 Jan', 'Active'],
  ['10 Apr', 'Eid al-Fitr', 'National', 'All', '10–11 Apr', 'Active'],
  ['01 May', 'Labour Day', 'National', 'All', '01 May', 'Active'],
  ['23 May', 'Vesak Day', 'National', 'All', '23 May', 'Active'],
  ['17 Aug', 'Independence Day', 'National', 'All', '17 Aug', 'Scheduled'],
]
export function PublicHolidaysPage() {
  return (
    <AppMain
      title='Public Holidays'
      subtitle='Kelola hari libur nasional, regional, dan kebijakan pengganti.'
      className='gap-5 bg-muted/30'
      actions={
        <Button>
          <IconPlus />
          Add Public Holiday
        </Button>
      }
    >
      <div className='flex gap-2'>
        <Button size='sm' variant='outline'>
          Overview
        </Button>
        <Button size='sm'>Public Holidays</Button>
        <Button size='sm' variant='outline'>
          Settings
        </Button>
      </div>
      <div className='grid gap-3 sm:grid-cols-3'>
        {[
          ['14', 'Total Holidays', 'text-primary'],
          ['3', 'Upcoming', 'text-emerald-600'],
          ['2', 'Regional', 'text-violet-600'],
        ].map(([value, label, color]) => (
          <section key={label} className='rounded-2xl border bg-card p-4'>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className='text-xs text-muted-foreground'>{label}</p>
          </section>
        ))}
      </div>
      <section className='grid gap-3 rounded-2xl border bg-card p-3 md:grid-cols-3'>
        <Input defaultValue='2024' className='rounded-xl border bg-background' />
        <Input defaultValue='All holiday types' className='rounded-xl border bg-background' />
        <Input defaultValue='All regions' className='rounded-xl border bg-background' />
      </section>
      <section className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
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
            {holidays.map((row) => (
              <TableRow key={row[0]}>
                {row.map((value, index) => (
                  <TableCell
                    key={value}
                    className={index === 1 ? 'text-xs font-semibold' : 'text-xs'}
                  >
                    {value}
                  </TableCell>
                ))}
                <TableCell className='text-xs text-primary'>
                  Edit <span className='ml-5 text-destructive'>Delete</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </AppMain>
  )
}
