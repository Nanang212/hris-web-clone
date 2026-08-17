import { IconCircleCheck, IconCurrencyDollar, IconUsers, IconWallet } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { overtimePolicies, overtimeRequests } from '@/features/overtime/components/overtime-data'
import { OvertimeStat } from '@/features/overtime/components/overtime-shared'
import { OvertimeTabs } from '@/features/overtime/components/overtime-tabs'
import { m } from '@/i18n/paraglide/messages'

export function OvertimeCalculationPage() {
  return (
    <AppMain
      title={m.overtime_calculation_title()}
      subtitle={m.overtime_calculation_subtitle()}
      actions={
        <Button asChild>
          <Link to='/overtime/calculation/rules'>{m.overtime_configure_rules()}</Link>
        </Button>
      }
      className='gap-5 bg-muted/30'
    >
      <OvertimeTabs active='calculation' />
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <OvertimeStat
          icon={IconCircleCheck}
          label='Approved Hours'
          value='346.5 h'
          detail='Aug 2026'
          tone='green'
        />
        <OvertimeStat
          icon={IconCurrencyDollar}
          label='Est. Compensation'
          value='Rp 7.84 jt'
          detail='Current period'
          tone='blue'
        />
        <OvertimeStat
          icon={IconUsers}
          label='Employees'
          value='82'
          detail='With approved OT'
          tone='blue'
        />
        <OvertimeStat
          icon={IconWallet}
          label='Ready for Payroll'
          value='70 / 82'
          detail='12 need review'
          tone='amber'
        />
      </div>
      <div className='grid gap-4 xl:grid-cols-[320px_1fr]'>
        <Card>
          <CardHeader>
            <CardTitle>{m.overtime_calculation_policy()}</CardTitle>
            <CardDescription>{m.overtime_calculation_policy_subtitle()}</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3 px-4'>
            {overtimePolicies.map((policy) => (
              <div
                key={policy.name}
                className='flex justify-between rounded-lg bg-muted p-3 text-sm'
              >
                <span>{policy.name}</span>
                <strong className='text-primary'>{policy.factor}</strong>
              </div>
            ))}
            <p className='border-t pt-3 text-xs text-muted-foreground'>
              {m.overtime_rounding()}{' '}
              <strong className='float-right text-foreground'>30-minute blocks</strong>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{m.overtime_monthly_eligible_hours()}</CardTitle>
            <CardDescription>{m.overtime_trend_subtitle()}</CardDescription>
          </CardHeader>
          <CardContent className='px-4'>
            <div className='flex h-40 items-end gap-4 border-b pb-2'>
              {[45, 58, 62, 72, 70, 95].map((value, index) => (
                <div key={value} className='flex flex-1 flex-col items-center gap-2'>
                  <div
                    className='w-full rounded-t-md bg-primary/75'
                    style={{ height: `${value}%` }}
                  />
                  <span className='text-xs text-muted-foreground'>
                    {['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][index]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className='overflow-hidden'>
        <div className='flex items-start justify-between gap-3 p-4 pb-2'>
          <div>
            <h3 className='font-semibold'>{m.overtime_employee_calculation()}</h3>
            <p className='mt-1 text-xs text-muted-foreground'>
              {m.overtime_calculation_subtitle()}
            </p>
          </div>
        </div>
        <CardContent className='p-0'>
          <Table>
            <TableHeader className='bg-muted/40'>
              <TableRow>
                <TableHead>{m.overtime_table_employee()}</TableHead>
                <TableHead>{m.overtime_status_approved()}</TableHead>
                <TableHead>{m.overtime_table_eligible()}</TableHead>
                <TableHead>{m.overtime_factor()}</TableHead>
                <TableHead>{m.overtime_estimate()}</TableHead>
                <TableHead>{m.overtime_payroll_status()}</TableHead>
                <TableHead>{m.overtime_action()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overtimeRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className='text-xs font-medium'>{request.employee}</TableCell>
                  <TableCell className='text-xs'>{request.requestedHours} h</TableCell>
                  <TableCell className='text-xs text-green-700'>
                    {request.eligibleHours} h
                  </TableCell>
                  <TableCell className='text-xs'>1.5×</TableCell>
                  <TableCell className='text-xs'>Rp 112.500</TableCell>
                  <TableCell>
                    <Badge variant='green'>{m.overtime_ready()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size='sm' variant='link' asChild>
                      <Link
                        to='/overtime/calculation/$requestId'
                        params={{ requestId: 'OT-2026-0081' }}
                      >
                        {m.overtime_view()}
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
