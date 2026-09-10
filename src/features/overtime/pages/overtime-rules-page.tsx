import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { snackbar } from '@/shared/lib/snackbar'
import { OvertimeTabs } from '@/features/overtime/components/overtime-tabs'
import { m } from '@/i18n/paraglide/messages'

export function OvertimeRulesPage() {
  const fields = [
    ['Base Pay Source', 'Monthly Base Salary'],
    ['Hourly Rate Formula', 'Base Pay ÷ Divisor'],
    ['Divisor', '173 hours'],
    ['Rounding Method', '30-minute blocks'],
    ['Minimum Eligible Duration', '30 minutes'],
    ['Maximum Overtime / Day', '4 hours'],
    ['Effective Date', '01 Aug 2026'],
    ['Employee Scope', 'Permanent + Contract'],
  ]
  return (
    <AppMain
      title={m.overtime_rules_title()}
      subtitle={m.overtime_rules_subtitle()}
      breadcrumbs={[
        { label: m.app_layout_nav_time_management() },
        { to: '/overtime', label: m.app_layout_nav_overtime() },
        { to: '/overtime/calculation', label: m.overtime_tab_calculation() },
        { label: m.overtime_rules_title() },
      ]}
      backTo='/overtime/calculation'
      actions={<Badge variant='violet'>HR · Admin · Super Admin</Badge>}
      className='gap-5 bg-muted/30'
    >
      <OvertimeTabs active='calculation' />
      <Card>
        <CardContent className='flex flex-wrap items-center justify-between gap-3 px-4'>
          <div>
            <strong>{m.overtime_active_policy()}</strong>
            <p className='mt-1 text-xs text-muted-foreground'>
              Version OT-2026.08 · Effective 01 Aug 2026 · Scope: All branches
            </p>
          </div>
          <Button onClick={() => snackbar.success(m.overtime_rules_saved())}>
            {m.overtime_save_changes()}
          </Button>
        </CardContent>
      </Card>
      <div className='grid gap-4 xl:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>{m.overtime_general_calculation_basis()}</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 px-4 sm:grid-cols-2'>
            {fields.map(([label, value]) => (
              <label key={label} className='flex flex-col gap-2 text-xs text-muted-foreground'>
                {label}
                <Input defaultValue={value} />
              </label>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex-row items-center justify-between'>
            <CardTitle>{m.overtime_formula_rules()}</CardTitle>
            <Button variant='outline' size='sm'>
              + {m.overtime_add_rule()}
            </Button>
          </CardHeader>
          <CardContent className='flex flex-col gap-3 px-4'>
            {[
              ['1', 'Workday', 'First eligible hour', '1.5×'],
              ['2', 'Workday', 'Next eligible hours', '2.0×'],
              ['3', 'Rest day', 'Eligible hours', '2.0×'],
              ['4', 'National holiday', 'Eligible hours', '3.0×'],
            ].map(([priority, day, segment, factor]) => (
              <div
                key={priority}
                className='grid grid-cols-[30px_1fr_1fr_auto] items-center gap-3 border-b pb-3 text-xs'
              >
                <span>{priority}</span>
                <strong>{day}</strong>
                <span>{segment}</span>
                <Badge variant='blue'>{factor}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
