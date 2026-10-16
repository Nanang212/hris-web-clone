// src/features/payroll/pages/configuration/salary-components-view.tsx — Screen 3: Salary Components & Add Modal
import { IconPlus, IconTrash, IconEdit, IconCoins } from '@tabler/icons-react'
import { useState } from 'react'
import { initialSalaryComponents, formatIDR } from '../../data/mock-payroll-data'
import type { SalaryComponent } from '../../types'
import { m } from '@/i18n/paraglide/messages'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { FieldLabel } from '@/shared/components/ui/field'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
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
  const [components, setComponents] = useState<SalaryComponent[]>(initialSalaryComponents)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingComp, setEditingComp] = useState<SalaryComponent | null>(null)

  // Form State
  const [formData, setFormData] = useState<Omit<SalaryComponent, 'id'>>({
    name: '',
    code: '',
    type: 'allowance',
    category: 'fixed',
    isTaxable: true,
    isBpjsBase: false,
    calculationType: 'fixed_amount',
    defaultAmount: 0,
    description: '',
    status: 'active',
  })

  const allowances = components.filter((c) => c.type === 'allowance')
  const deductions = components.filter((c) => c.type === 'deduction')

  const handleOpenAdd = () => {
    setEditingComp(null)
    setFormData({
      name: '',
      code: '',
      type: 'allowance',
      category: 'fixed',
      isTaxable: true,
      isBpjsBase: false,
      calculationType: 'fixed_amount',
      defaultAmount: 0,
      description: '',
      status: 'active',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (comp: SalaryComponent) => {
    setEditingComp(comp)
    setFormData({ ...comp })
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id))
    snackbar.success(m.payroll_salary_deleted())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.code.trim()) {
      snackbar.error(m.payroll_salary_name_code_required())
      return
    }

    if (editingComp) {
      setComponents((prev) =>
        prev.map((c) => (c.id === editingComp.id ? { ...formData, id: editingComp.id } : c)),
      )
      snackbar.success(m.payroll_salary_updated())
    } else {
      const newComp: SalaryComponent = {
        ...formData,
        id: `comp-${Date.now()}`,
      }
      setComponents((prev) => [...prev, newComp])
      snackbar.success(m.payroll_salary_created())
    }
    setModalOpen(false)
  }

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
                    <Badge variant={item.isTaxable ? 'blue' : 'gray'} className='text-[9px] px-1.5 py-0'>
                      {item.isTaxable ? m.payroll_salary_taxable() : m.payroll_salary_non_taxable()}
                    </Badge>
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
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className='!max-w-xl sm:!max-w-xl md:!max-w-2xl w-[92vw] p-7 rounded-3xl border border-border/80 shadow-2xl bg-card gap-0'>
          <DialogHeader className='pb-4 border-b border-border/60'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconCoins size={20} />
              </div>
              <div>
                <DialogTitle className='text-base font-bold text-foreground'>
                  {editingComp ? m.payroll_salary_edit_title() : m.payroll_salary_add_title()}
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                  {m.payroll_salary_form_description()}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-5 pt-5'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <FieldLabel className='text-xs font-semibold text-foreground'>{m.payroll_salary_name_required_label()}</FieldLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={m.payroll_salary_name_placeholder()}
                  className='h-10 text-xs bg-background border border-input rounded-xl'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <FieldLabel className='text-xs font-semibold text-foreground'>{m.payroll_salary_code_required_label()}</FieldLabel>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder='ALLOW_PERF'
                  className='h-10 text-xs bg-background border border-input font-mono rounded-xl'
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <FieldLabel className='text-xs font-semibold text-foreground'>{m.payroll_employee_components_kind_field_label()}</FieldLabel>
                <Select
                  value={formData.type}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, type: val as SalaryComponent['type'] }))
                  }
                >
                  <SelectTrigger className='h-10 text-xs bg-background border border-input rounded-xl'>
                    <SelectValue placeholder={m.payroll_salary_type_placeholder()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value='allowance'>{m.payroll_employee_components_type_allowance()}</SelectItem>
                      <SelectItem value='deduction'>{m.payroll_employee_components_type_deduction()}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <FieldLabel className='text-xs font-semibold text-foreground'>{m.payroll_salary_calculation_type_label()}</FieldLabel>
                <Select
                  value={formData.calculationType}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, calculationType: val as SalaryComponent['calculationType'] }))
                  }
                >
                  <SelectTrigger className='h-10 text-xs bg-background border border-input rounded-xl'>
                    <SelectValue placeholder={m.payroll_salary_calculation_placeholder()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value='fixed_amount'>{m.payroll_salary_calculation_fixed()}</SelectItem>
                      <SelectItem value='attendance_based'>{m.payroll_salary_calculation_attendance()}</SelectItem>
                      <SelectItem value='formula'>{m.payroll_salary_calculation_formula()}</SelectItem>
                      <SelectItem value='percentage'>{m.payroll_salary_calculation_percentage()}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <FieldLabel className='text-xs font-semibold text-foreground'>{m.payroll_salary_default_amount_label()}</FieldLabel>
                {formData.defaultAmount > 0 && (
                  <span className='text-xs font-bold text-primary font-mono'>
                    {formatIDR(formData.defaultAmount)}
                  </span>
                )}
              </div>
              <div className='relative'>
                <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground'>
                  Rp
                </span>
                <Input
                  type='number'
                  value={formData.defaultAmount || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, defaultAmount: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder='0'
                  className='h-10 pl-10 text-xs bg-background border border-input rounded-xl'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <FieldLabel className='text-xs font-semibold text-foreground'>{m.payroll_salary_description_label()}</FieldLabel>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={m.payroll_salary_description_placeholder()}
                className='h-10 text-xs bg-background border border-input rounded-xl'
              />
            </div>

            {/* Checkbox cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
              <FieldLabel
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                  formData.isTaxable
                    ? 'border-blue-500/40 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-border/70 bg-muted/20 hover:bg-muted/30'
                }`}
              >
                <Checkbox
                  checked={formData.isTaxable}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isTaxable: checked === true }))}
                />
                <div>
                  <span className='text-xs font-bold text-foreground block'>{m.payroll_salary_tax_subject()}</span>
                  <span className='text-[10px] text-muted-foreground'>{m.payroll_salary_tax_subject_hint()}</span>
                </div>
              </FieldLabel>

              <FieldLabel
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                  formData.isBpjsBase
                    ? 'border-purple-500/40 bg-purple-50/40 dark:bg-purple-950/20'
                    : 'border-border/70 bg-muted/20 hover:bg-muted/30'
                }`}
              >
                <Checkbox
                  checked={formData.isBpjsBase}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isBpjsBase: checked === true }))}
                />
                <div>
                  <span className='text-xs font-bold text-foreground block'>{m.payroll_salary_bpjs_wage_base()}</span>
                  <span className='text-[10px] text-muted-foreground'>{m.payroll_salary_bpjs_wage_base_hint()}</span>
                </div>
              </FieldLabel>
            </div>

            <div className='flex justify-end gap-3 pt-4 border-t border-border/60'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setModalOpen(false)}
                className='h-10 px-5 text-xs font-semibold rounded-xl'
              >
                {m.payroll_employee_components_cancel_button()}
              </Button>
              <Button type='submit' className='h-10 px-6 text-xs font-semibold rounded-xl shadow-xs'>
                {m.payroll_employee_components_save_button()}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
