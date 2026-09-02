// src/features/company/organization/pages/department/department-management-tab.tsx
import {
  IconBuilding,
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconHierarchy,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUser,
  IconUsers,
  IconAlertTriangle,
  IconEye,
} from '@tabler/icons-react'
import { useState } from 'react'
import { DepartmentDetailModal } from '../../components/unit-detail-modals'
import { MOCK_DEPARTMENTS, MOCK_DIVISIONS } from '../../data/mock-org-data'
import type { DepartmentRecord, OrgStatus } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
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
import { Textarea } from '@/shared/components/ui/textarea'
import { snackbar } from '@/shared/lib/snackbar'

export function DepartmentManagementTab() {
  const [departments, setDepartments] = useState<DepartmentRecord[]>(MOCK_DEPARTMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [divisionFilter, setDivisionFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Form Modal State
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedDept, setSelectedDept] = useState<DepartmentRecord | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [divisionId, setDivisionId] = useState('')
  const [headName, setHeadName] = useState('')
  const [headTitle, setHeadTitle] = useState('')
  const [costCenter, setCostCenter] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<OrgStatus>('active')

  // Detail Modal State
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedDetailDept, setSelectedDetailDept] = useState<DepartmentRecord | null>(null)

  // Delete State
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deptToDelete, setDeptToDelete] = useState<DepartmentRecord | null>(null)

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      searchQuery === '' ||
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dept.headOfDepartment?.name && dept.headOfDepartment.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesDivision = divisionFilter === 'all' || dept.divisionId === divisionFilter
    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter
    return matchesSearch && matchesDivision && matchesStatus
  })

  const handleOpenCreate = () => {
    setFormMode('create')
    setSelectedDept(null)
    setName('')
    setCode('')
    setDivisionId(MOCK_DIVISIONS[0]?.id || '')
    setHeadName('')
    setHeadTitle('')
    setCostCenter('')
    setDescription('')
    setStatus('active')
    setFormOpen(true)
  }

  const handleOpenEdit = (dept: DepartmentRecord) => {
    setFormMode('edit')
    setSelectedDept(dept)
    setName(dept.name)
    setCode(dept.code)
    setDivisionId(dept.divisionId)
    setHeadName(dept.headOfDepartment?.name || '')
    setHeadTitle(dept.headOfDepartment?.title || '')
    setCostCenter(dept.costCenter)
    setDescription(dept.description || '')
    setStatus(dept.status)
    setFormOpen(true)
  }

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault()
    const parentDiv = MOCK_DIVISIONS.find((d) => d.id === divisionId)
    const divisionName = parentDiv ? parentDiv.name : 'Corporate'

    if (formMode === 'create') {
      const newDept: DepartmentRecord = {
        id: `dept-${Date.now()}`,
        code,
        name,
        divisionId,
        divisionName,
        costCenter: costCenter || 'CC-DEPT-00',
        totalPositions: 0,
        totalEmployees: 0,
        status,
        description,
        createdAt: new Date().toISOString().split('T')[0],
        headOfDepartment: headName
          ? {
              id: `emp-${Date.now()}`,
              name: headName,
              title: headTitle || `Head of ${name}`,
            }
          : undefined,
      }
      setDepartments((prev) => [newDept, ...prev])
      snackbar.success(`Departemen ${name} berhasil ditambahkan!`)
    } else if (formMode === 'edit' && selectedDept) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === selectedDept.id
            ? {
                ...d,
                name,
                code,
                divisionId,
                divisionName,
                costCenter,
                status,
                description,
                headOfDepartment: headName
                  ? {
                      id: d.headOfDepartment?.id || `emp-${Date.now()}`,
                      name: headName,
                      title: headTitle || `Head of ${name}`,
                    }
                  : undefined,
              }
            : d,
        ),
      )
      snackbar.success(`Departemen ${name} berhasil diperbarui!`)
    }
    setFormOpen(false)
  }

  const handleDelete = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id))
    snackbar.success('Departemen berhasil dihapus.')
  }

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top Stats Cards ───────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        {[
          { label: 'Total Departments', value: departments.length, sub: 'Departemen Operasional', icon: IconHierarchy, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Active Depts', value: departments.filter((d) => d.status === 'active').length, sub: 'Aktif Berjalan', icon: IconCheck, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
          { label: 'Total Headcount', value: departments.reduce((acc, d) => acc + d.totalEmployees, 0), sub: 'Total Staf', icon: IconUsers, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
          { label: 'Understaffed', value: departments.filter((d) => d.status === 'inactive').length, sub: 'Butuh Rekrutmen', icon: IconAlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
        ].map((stat, idx) => (
          <div key={idx} className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
            <div>
              <p className='text-xs font-semibold text-muted-foreground'>{stat.label}</p>
              <h3 className='text-xl font-bold text-foreground mt-0.5'>{stat.value}</h3>
              <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>{stat.sub}</p>
            </div>
            <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter and Action Bar ───────────────────────────────────────────── */}
      <div className='flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl border border-border/80 bg-card'>
        <div className='flex flex-wrap items-center gap-2 flex-1 min-w-0'>
          <div className='relative w-full sm:w-60'>
            <IconSearch size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search department name or code...'
              className='h-9 pl-9 text-xs bg-background rounded-xl w-full'
            />
          </div>

          <Select value={divisionFilter} onValueChange={setDivisionFilter}>
            <SelectTrigger className='h-9 w-full sm:w-44 text-xs bg-background rounded-xl'>
              <SelectValue placeholder='All Divisions' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Divisions</SelectItem>
              {MOCK_DIVISIONS.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='h-9 w-full sm:w-32 text-xs bg-background rounded-xl'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type='button'
          onClick={handleOpenCreate}
          className='h-9 text-xs font-bold rounded-xl shadow-xs px-4 bg-primary text-primary-foreground gap-1.5 w-full lg:w-auto shrink-0'
        >
          <IconPlus size={15} />
          Add Department
        </Button>
      </div>

      {/* ── Department Directory Table ──────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs w-full max-w-full min-w-0'>
        <Table className='min-w-[900px] w-full'>
          <TableHeader className='bg-muted/40'>
            <TableRow>
              <TableHead className='text-xs font-bold'>Dept Code</TableHead>
              <TableHead className='text-xs font-bold'>Department Name</TableHead>
              <TableHead className='text-xs font-bold'>Parent Division</TableHead>
              <TableHead className='text-xs font-bold'>Head of Department</TableHead>
              <TableHead className='text-xs font-bold text-center'>Positions</TableHead>
              <TableHead className='text-xs font-bold text-center'>Headcount</TableHead>
              <TableHead className='text-xs font-bold text-center'>Status</TableHead>
              <TableHead className='text-xs font-bold text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='h-32 text-center text-xs text-muted-foreground'>
                  Tidak ada data departemen yang sesuai filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((dept) => (
                <TableRow key={dept.id} className='hover:bg-muted/30 transition-colors'>
                  <TableCell className='text-xs font-mono font-bold text-primary'>
                    {dept.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className='text-xs font-bold text-foreground'>{dept.name}</p>
                      <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>CC: {dept.costCenter}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className='px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400'>
                      {dept.divisionName}
                    </span>
                  </TableCell>
                  <TableCell>
                    {dept.headOfDepartment ? (
                      <div className='flex items-center gap-2'>
                        <div className='size-7 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0'>
                          {dept.headOfDepartment.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className='text-xs font-bold text-foreground'>{dept.headOfDepartment.name}</p>
                          <p className='text-[10px] text-muted-foreground'>{dept.headOfDepartment.title}</p>
                        </div>
                      </div>
                    ) : (
                      <span className='text-xs text-muted-foreground italic'>Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className='text-xs text-center font-bold text-foreground'>
                    {dept.totalPositions} Posisi
                  </TableCell>
                  <TableCell className='text-xs text-center font-semibold text-primary'>
                    {dept.totalEmployees} Org
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge
                      variant='outline'
                      className={`text-[10px] font-semibold ${
                        dept.status === 'active'
                          ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-muted-foreground text-muted-foreground'
                      }`}
                    >
                      {dept.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className='size-7 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground transition-colors'>
                          <IconDotsVertical size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-40 rounded-xl'>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDetailDept(dept)
                            setDetailOpen(true)
                          }}
                          className='text-xs'
                        >
                          <IconEye size={14} className='mr-2 text-primary' /> View Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEdit(dept)} className='text-xs'>
                          <IconEdit size={14} className='mr-2 text-muted-foreground' /> Edit Department
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDeptToDelete(dept)
                            setDeleteOpen(true)
                          }}
                          className='text-xs text-destructive focus:text-destructive'
                        >
                          <IconTrash size={14} className='mr-2' /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Add / Edit Department Modal ────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className='sm:max-w-[520px] p-0 overflow-hidden rounded-2xl'>
          <form onSubmit={handleSaveForm}>
            <DialogHeader className='p-6 pb-4 border-b border-border/80 bg-muted/20'>
              <div className='flex items-center gap-2.5'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600'>
                  <IconHierarchy size={20} />
                </div>
                <div>
                  <DialogTitle className='text-sm font-bold text-foreground'>
                    {formMode === 'create' ? 'Add Department' : 'Edit Department'}
                  </DialogTitle>
                  <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                    Tambahkan departemen baru di bawah divisi yang dipilih
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='p-6 space-y-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Parent Division *</label>
                <Select value={divisionId} onValueChange={setDivisionId} required>
                  <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl'>
                    <SelectValue placeholder='Pilih Divisi Induk' />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_DIVISIONS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid grid-cols-3 gap-3'>
                <div className='space-y-1.5 col-span-1'>
                  <label className='text-xs font-semibold text-foreground'>Code *</label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder='DEP-SE'
                    className='h-9.5 text-xs bg-background rounded-xl font-mono uppercase'
                    required
                  />
                </div>
                <div className='space-y-1.5 col-span-2'>
                  <label className='text-xs font-semibold text-foreground'>Department Name *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='e.g. Software Engineering'
                    className='h-9.5 text-xs bg-background rounded-xl font-medium'
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Head of Department</label>
                  <Input
                    value={headName}
                    onChange={(e) => setHeadName(e.target.value)}
                    placeholder='e.g. Rizky Pratama'
                    className='h-9.5 text-xs bg-background rounded-xl'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Leader Job Title</label>
                  <Input
                    value={headTitle}
                    onChange={(e) => setHeadTitle(e.target.value)}
                    placeholder='e.g. Head of Engineering'
                    className='h-9.5 text-xs bg-background rounded-xl'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Cost Center</label>
                  <Input
                    value={costCenter}
                    onChange={(e) => setCostCenter(e.target.value)}
                    placeholder='CC-TECH-101'
                    className='h-9.5 text-xs bg-background rounded-xl font-mono'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Status *</label>
                  <Select value={status} onValueChange={(val: OrgStatus) => setStatus(val)}>
                    <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl'>
                      <SelectValue placeholder='Status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>Active</SelectItem>
                      <SelectItem value='inactive'>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Description & Objectives</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Fungsi dan tanggung jawab departemen...'
                  className='text-xs bg-background rounded-xl min-h-[70px]'
                />
              </div>
            </div>

            <DialogFooter className='p-6 pt-3 border-t border-border/70 bg-muted/10 gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setFormOpen(false)}
                className='h-9 text-xs font-semibold rounded-xl'
              >
                Cancel
              </Button>
              <Button type='submit' className='h-9 text-xs font-semibold rounded-xl shadow-xs px-5'>
                {formMode === 'create' ? 'Create Department' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className='sm:max-w-[400px] rounded-2xl p-6'>
          <div className='flex items-start gap-3.5'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive shrink-0'>
              <IconTrash size={22} />
            </div>
            <div className='space-y-1.5'>
              <DialogTitle className='text-sm font-bold text-foreground'>
                Delete Department
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                Hapus departemen <strong className='text-foreground'>{deptToDelete?.name}</strong>?
              </DialogDescription>
            </div>
          </div>
          <DialogFooter className='pt-4 border-t border-border/70 mt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDeleteOpen(false)}
              className='h-9 text-xs font-semibold rounded-xl'
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={() => {
                if (deptToDelete) handleDelete(deptToDelete.id)
                setDeleteOpen(false)
              }}
              className='h-9 text-xs font-semibold rounded-xl'
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      <DepartmentDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        department={selectedDetailDept}
        onEdit={handleOpenEdit}
      />
    </div>
  )
}
