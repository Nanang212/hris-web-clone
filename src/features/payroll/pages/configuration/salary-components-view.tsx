// src/features/payroll/pages/configuration/salary-components-view.tsx — Screen 3: Salary Components & Add Modal
import { IconPlus, IconTrash, IconEdit, IconCoins } from '@tabler/icons-react'
import { useState } from 'react'
import { initialSalaryComponents, formatIDR } from '../../data/mock-payroll-data'
import type { SalaryComponent } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
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
    snackbar.success('Salary component deleted.')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.code.trim()) {
      snackbar.error('Name and Code are required.')
      return
    }

    if (editingComp) {
      setComponents((prev) =>
        prev.map((c) => (c.id === editingComp.id ? { ...formData, id: editingComp.id } : c)),
      )
      snackbar.success('Component updated successfully!')
    } else {
      const newComp: SalaryComponent = {
        ...formData,
        id: `comp-${Date.now()}`,
      }
      setComponents((prev) => [...prev, newComp])
      snackbar.success('Component created successfully!')
    }
    setModalOpen(false)
  }

  return (
    <div className='space-y-8'>
      {/* Header Actions */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>Salary Components Directory</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Daftar komponen pendapatan (Earnings / Allowances) dan potongan gaji (Deductions)
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className='gap-1.5 text-xs font-semibold rounded-xl h-9 px-4 shadow-xs'
        >
          <IconPlus size={15} />
          Add Component
        </Button>
      </div>

      {/* ── Table 1: Allowances / Earnings ─────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-5 pb-3 bg-muted/20 border-b border-border/60 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <IconCoins size={16} className='text-emerald-600 dark:text-emerald-400' />
            <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
              Pendapatan & Tunjangan (Allowances / Earnings)
            </h4>
          </div>
          <Badge variant='green' className='text-[10px]'>
            {allowances.length} Components
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow className='bg-muted/10 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3 pl-6'>Component Name</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>Category</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>Taxable / BPJS</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>Calculation</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>Default Amount</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3 pr-6 text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allowances.map((item) => (
              <TableRow key={item.id} className='text-xs hover:bg-muted/20 border-b border-border/40'>
                <TableCell className='py-3.5 pl-6'>
                  <p className='font-bold text-foreground'>{item.name}</p>
                  <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>{item.code}</p>
                </TableCell>
                <TableCell className='py-3.5 capitalize text-muted-foreground'>{item.category}</TableCell>
                <TableCell className='py-3.5'>
                  <div className='flex items-center gap-1.5'>
                    <Badge variant={item.isTaxable ? 'blue' : 'gray'} className='text-[9px] px-1.5 py-0'>
                      {item.isTaxable ? 'Taxable' : 'Non-taxable'}
                    </Badge>
                    {item.isBpjsBase && (
                      <Badge variant='purple' className='text-[9px] px-1.5 py-0'>
                        BPJS Base
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className='py-3.5 text-muted-foreground capitalize'>
                  {item.calculationType.replace('_', ' ')}
                </TableCell>
                <TableCell className='py-3.5 font-semibold text-foreground'>
                  {item.defaultAmount > 0 ? formatIDR(item.defaultAmount) : 'Formula-based'}
                </TableCell>
                <TableCell className='py-3.5 pr-6 text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <button
                      type='button'
                      onClick={() => handleOpenEdit(item)}
                      className='text-primary hover:opacity-80 p-1'
                    >
                      <IconEdit size={15} />
                    </button>
                    <button
                      type='button'
                      onClick={() => handleDelete(item.id)}
                      className='text-destructive hover:opacity-80 p-1'
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Table 2: Deductions ────────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-5 pb-3 bg-muted/20 border-b border-border/60 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <IconCoins size={16} className='text-rose-600 dark:text-rose-400' />
            <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
              Potongan Gaji (Deductions)
            </h4>
          </div>
          <Badge variant='red' className='text-[10px]'>
            {deductions.length} Components
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow className='bg-muted/10 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3 pl-6'>Component Name</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>Category</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>Statutory Type</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>Calculation</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3'>Default Amount</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3 pr-6 text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deductions.map((item) => (
              <TableRow key={item.id} className='text-xs hover:bg-muted/20 border-b border-border/40'>
                <TableCell className='py-3.5 pl-6'>
                  <p className='font-bold text-foreground'>{item.name}</p>
                  <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>{item.code}</p>
                </TableCell>
                <TableCell className='py-3.5 capitalize text-muted-foreground'>{item.category}</TableCell>
                <TableCell className='py-3.5'>
                  <Badge variant={item.category === 'statutory' ? 'purple' : 'gray'} className='text-[9px] px-1.5 py-0'>
                    {item.category === 'statutory' ? 'Wajib Regulasi' : 'Internal'}
                  </Badge>
                </TableCell>
                <TableCell className='py-3.5 text-muted-foreground capitalize'>
                  {item.calculationType.replace('_', ' ')}
                </TableCell>
                <TableCell className='py-3.5 font-semibold text-rose-600 dark:text-rose-400'>
                  {item.defaultAmount > 0 ? `-${formatIDR(item.defaultAmount)}` : 'Formula / Rate'}
                </TableCell>
                <TableCell className='py-3.5 pr-6 text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <button
                      type='button'
                      onClick={() => handleOpenEdit(item)}
                      className='text-primary hover:opacity-80 p-1'
                    >
                      <IconEdit size={15} />
                    </button>
                    <button
                      type='button'
                      onClick={() => handleDelete(item.id)}
                      className='text-destructive hover:opacity-80 p-1'
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
                  {editingComp ? 'Edit Salary Component' : 'Add New Salary Component'}
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                  Atur kode, jenis kalkulasi, dan pengenaan pajak/BPJS komponen gaji.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-5 pt-5'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Component Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder='e.g. Tunjangan Kinerja'
                  className='h-10 text-xs bg-background border border-input rounded-xl'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Code *</label>
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
                <label className='text-xs font-semibold text-foreground'>Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, type: val as SalaryComponent['type'] }))
                  }
                >
                  <SelectTrigger className='h-10 text-xs bg-background border border-input rounded-xl'>
                    <SelectValue placeholder='Select type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='allowance'>Allowance (Pendapatan)</SelectItem>
                    <SelectItem value='deduction'>Deduction (Potongan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Calculation Type</label>
                <Select
                  value={formData.calculationType}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, calculationType: val as SalaryComponent['calculationType'] }))
                  }
                >
                  <SelectTrigger className='h-10 text-xs bg-background border border-input rounded-xl'>
                    <SelectValue placeholder='Select calculation' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='fixed_amount'>Fixed Amount (Nominal Tetap)</SelectItem>
                    <SelectItem value='attendance_based'>Attendance Based (Harian Kehadiran)</SelectItem>
                    <SelectItem value='formula'>Formula / Overtime</SelectItem>
                    <SelectItem value='percentage'>Percentage (Persentase %)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <label className='text-xs font-semibold text-foreground'>Default Amount (Nominal Standar)</label>
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
              <label className='text-xs font-semibold text-foreground'>Description / Keterangan</label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder='Keterangan singkat komponen...'
                className='h-10 text-xs bg-background border border-input rounded-xl'
              />
            </div>

            {/* Checkbox cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
              <label
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                  formData.isTaxable
                    ? 'border-blue-500/40 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-border/70 bg-muted/20 hover:bg-muted/30'
                }`}
              >
                <input
                  type='checkbox'
                  checked={formData.isTaxable}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isTaxable: e.target.checked }))}
                  className='size-4 accent-primary rounded'
                />
                <div>
                  <span className='text-xs font-bold text-foreground block'>Objek Pajak PPh 21</span>
                  <span className='text-[10px] text-muted-foreground'>Masuk dalam perhitungan bruto pajak</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                  formData.isBpjsBase
                    ? 'border-purple-500/40 bg-purple-50/40 dark:bg-purple-950/20'
                    : 'border-border/70 bg-muted/20 hover:bg-muted/30'
                }`}
              >
                <input
                  type='checkbox'
                  checked={formData.isBpjsBase}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isBpjsBase: e.target.checked }))}
                  className='size-4 accent-primary rounded'
                />
                <div>
                  <span className='text-xs font-bold text-foreground block'>Dasar Upah BPJS</span>
                  <span className='text-[10px] text-muted-foreground'>Dihitung sebagai pengali tarif BPJS</span>
                </div>
              </label>
            </div>

            <div className='flex justify-end gap-3 pt-4 border-t border-border/60'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setModalOpen(false)}
                className='h-10 px-5 text-xs font-semibold rounded-xl'
              >
                Cancel
              </Button>
              <Button type='submit' className='h-10 px-6 text-xs font-semibold rounded-xl shadow-xs'>
                Save Component
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
