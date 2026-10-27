// src/features/payroll/pages/configuration/salary-components-view.tsx — Screen 3: Salary Components & Add Modal
import { IconPlus, IconTrash, IconEdit, IconCoins } from '@tabler/icons-react'
import { useState } from 'react'
import { formatIDR } from '../../data/mock-payroll-data'
import { usePayrollComponentStore } from '../../store/payroll-component-store'
import { SalaryComponentEditModal } from '../../components/salary-component-edit-modal'
import { PayrollComponentParameterSummary } from '../../components/payroll-component-parameter-summary'
import type { SalaryComponent } from '../../types'
import { m } from '@/i18n/paraglide/messages'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'

export function SalaryComponentsView() {
  const categoryLabels: Record<SalaryComponent['category'], string> = {
    fixed: m.payroll_salary_category_fixed(),
    variable: m.payroll_salary_category_variable(),
    tax: m.payroll_salary_category_tax(),
    statutory: m.payroll_salary_category_statutory(),
  }
  const calculationLabels: Record<SalaryComponent['calculationType'], string> = {
    fixed_amount: m.payroll_salary_calculation_fixed(),
    attendance_based: m.payroll_salary_calculation_attendance(),
    formula: m.payroll_salary_calculation_formula(),
    percentage: m.payroll_salary_calculation_percentage(),
  }
  const components = usePayrollComponentStore((state) => state.salaryComponents)
  const saveSalaryComponent = usePayrollComponentStore((state) => state.saveSalaryComponent)
  const removeSalaryComponent = usePayrollComponentStore((state) => state.removeSalaryComponent)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingComp, setEditingComp] = useState<SalaryComponent | null>(null)

  const allowances = components.filter((item) => item.type === 'allowance')
  const deductions = components.filter((item) => item.type === 'deduction')
  const handleOpenAdd = () => { setEditingComp(null); setModalOpen(true) }
  const handleOpenEdit = (component: SalaryComponent) => { setEditingComp(component); setModalOpen(true) }
  const handleDelete = (id: string) => { removeSalaryComponent(id); snackbar.success(m.payroll_salary_deleted()) }

  return (
    <div className='space-y-6'>
      {/* Header Actions */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h3 className='text-sm font-bold text-foreground'>{m.payroll_salary_directory_title()}</h3>
          <p className='max-w-2xl text-xs text-muted-foreground'>
            {m.payroll_salary_directory_description()}
          </p>
        </div>
        <Button type='button' size='sm' className='self-start' onClick={handleOpenAdd}>
          <IconPlus data-icon='inline-start' />
          {m.payroll_employee_components_add_button()}
        </Button>
      </div>

      {/* ── Table 1: Allowances / Earnings ─────────────────────────────────── */}
      <Card className='min-w-0 gap-0 overflow-hidden py-0'>
        <CardHeader className='flex flex-row items-center justify-between gap-3 bg-muted/20 py-4'>
          <div className='flex items-center gap-2'>
            <IconCoins size={16} className='text-emerald-600 dark:text-emerald-400' />
            <CardTitle className='text-xs font-bold uppercase tracking-wider'>
              {m.payroll_employee_components_allowance_table_title()}
            </CardTitle>
          </div>
          <Badge variant='green' className='text-[10px]'>
            {m.payroll_employee_components_count({count: allowances.length})}
          </Badge>
        </CardHeader>

        <CardContent className='px-0'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/10 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3 pl-6'>{m.payroll_employee_components_name_field_label()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>{m.payroll_salary_col_category()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>{m.payroll_salary_col_taxable()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>{m.payroll_salary_col_calculation()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>{m.payroll_salary_col_default_amount()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3 pr-6 text-right'>{m.payroll_overview_col_action()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allowances.map((item) => (
              <TableRow key={item.id} className='text-xs hover:bg-muted/20 border-b border-border/40'>
                <TableCell className='py-3.5 pl-6'>
                  <p className='font-bold text-foreground'>{item.name}</p>
                  <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>{item.code}</p>
                </TableCell>
                <TableCell className='py-3.5 text-muted-foreground'>{categoryLabels[item.category]}</TableCell>
                <TableCell className='py-3.5'>
                  <div className='flex items-center gap-1.5'>
                    <PayrollComponentParameterSummary line={item} />
                    {item.isBpjsBase && (
                      <Badge variant='purple' className='text-[9px] px-1.5 py-0'>
                        {m.payroll_salary_bpjs_base()}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className='py-3.5 text-muted-foreground capitalize'>
                  {calculationLabels[item.calculationType]}
                </TableCell>
                <TableCell className='py-3.5 font-semibold text-foreground'>
                  {item.defaultAmount > 0 ? formatIDR(item.defaultAmount) : m.payroll_salary_formula_based()}
                </TableCell>
                <TableCell className='py-3.5 pr-6 text-right'>
                  <div className='flex items-center justify-end gap-1'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleOpenEdit(item)}
                          className='size-8 text-muted-foreground hover:text-primary hover:bg-primary/10'
                          aria-label={m.payroll_salary_edit_button()}
                        >
                          <IconEdit size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='left'>
                        <p>{m.payroll_salary_edit_button()}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDelete(item.id)}
                          className='size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                          aria-label={m.payroll_salary_delete_button()}
                        >
                          <IconTrash size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='left'>
                        <p>{m.payroll_salary_delete_button()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </CardContent>
      </Card>

      {/* ── Table 2: Deductions ────────────────────────────────────────────── */}
      <Card className='min-w-0 gap-0 overflow-hidden py-0'>
        <CardHeader className='flex flex-row items-center justify-between gap-3 bg-muted/20 py-4'>
          <div className='flex items-center gap-2'>
            <IconCoins size={16} className='text-rose-600 dark:text-rose-400' />
            <CardTitle className='text-xs font-bold uppercase tracking-wider'>
              {m.payroll_employee_components_deduction_table_title()}
            </CardTitle>
          </div>
          <Badge variant='red' className='text-[10px]'>
            {m.payroll_employee_components_count({count: deductions.length})}
          </Badge>
        </CardHeader>

        <CardContent className='px-0'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/10 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3 pl-6'>{m.payroll_employee_components_name_field_label()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>{m.payroll_salary_col_category()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>{m.payroll_salary_col_statutory()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>{m.payroll_salary_col_calculation()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>{m.payroll_salary_col_default_amount()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3 pr-6 text-right'>{m.payroll_overview_col_action()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deductions.map((item) => (
              <TableRow key={item.id} className='text-xs hover:bg-muted/20 border-b border-border/40'>
                <TableCell className='py-3.5 pl-6'>
                  <p className='font-bold text-foreground'>{item.name}</p>
                  <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>{item.code}</p>
                </TableCell>
                <TableCell className='py-3.5 text-muted-foreground'>{categoryLabels[item.category]}</TableCell>
                <TableCell className='py-3.5'>
                  <Badge variant={item.category === 'statutory' ? 'purple' : 'gray'} className='text-[9px] px-1.5 py-0'>
                    {item.category === 'statutory' ? m.payroll_salary_statutory() : m.payroll_salary_internal()}
                  </Badge>
                  <PayrollComponentParameterSummary line={item} />
                </TableCell>
                <TableCell className='py-3.5 text-muted-foreground capitalize'>
                  {calculationLabels[item.calculationType]}
                </TableCell>
                <TableCell className='py-3.5 font-semibold text-rose-600 dark:text-rose-400'>
                  {item.defaultAmount > 0 ? `-${formatIDR(item.defaultAmount)}` : m.payroll_salary_formula_rate()}
                </TableCell>
                <TableCell className='py-3.5 pr-6 text-right'>
                  <div className='flex items-center justify-end gap-1'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleOpenEdit(item)}
                          className='size-8 text-muted-foreground hover:text-primary hover:bg-primary/10'
                          aria-label={m.payroll_salary_edit_button()}
                        >
                          <IconEdit size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='left'>
                        <p>{m.payroll_salary_edit_button()}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDelete(item.id)}
                          className='size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                          aria-label={m.payroll_salary_delete_button()}
                        >
                          <IconTrash size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='left'>
                        <p>{m.payroll_salary_delete_button()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </CardContent>
      </Card>

      {/* ── Add / Edit Component Dialog Modal ─────────────────────────────── */}
      {modalOpen && <SalaryComponentEditModal component={editingComp} components={components}
        onClose={() => setModalOpen(false)} onSave={(component) => {
          saveSalaryComponent(component)
          setModalOpen(false)
          snackbar.success(editingComp ? m.payroll_salary_updated() : m.payroll_salary_created())
        }} />}
    </div>
  )
}
