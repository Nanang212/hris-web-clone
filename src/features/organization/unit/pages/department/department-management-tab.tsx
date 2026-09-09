// src/features/organization/unit/pages/department/department-management-tab.tsx
import {
  IconAlertTriangle,
  IconBuilding,
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconHierarchy,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'
import { useState } from 'react'

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
import { TablePagination } from '@/shared/components/ui/table-pagination'
import { Textarea } from '@/shared/components/ui/textarea'
import { snackbar } from '@/shared/lib/snackbar'

import { DepartmentDetailModal } from '../../components/unit-detail-modals'
import { MOCK_DEPARTMENTS, MOCK_DIVISIONS } from '../../data/mock-org-data'
import type { DepartmentRecord, OrgStatus } from '../../types'

export function DepartmentManagementTab() {
  const [departments, setDepartments] = useState<DepartmentRecord[]>(MOCK_DEPARTMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [divisionFilter, setDivisionFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

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
      (dept.headOfDepartment?.name &&
        dept.headOfDepartment.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesDivision = divisionFilter === 'all' || dept.divisionId === divisionFilter
    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter
    return matchesSearch && matchesDivision && matchesStatus
  })

  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

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
    <div className='w-full max-w-full min-w-0 space-y-6'>
      {/* ── Top Stats Cards ───────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {[
          {
            label: 'Total Departments',
            value: departments.length,
            sub: 'Departemen Operasional',
            icon: IconHierarchy,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
          },
          {
            label: 'Active Depts',
            value: departments.filter((d) => d.status === 'active').length,
            sub: 'Aktif Berjalan',
            icon: IconCheck,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
          },
          {
            label: 'Total Headcount',
            value: departments.reduce((acc, d) => acc + d.totalEmployees, 0),
            sub: 'Total Staf',
            icon: IconUsers,
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40',
          },
          {
            label: 'Understaffed',
            value: departments.filter((d) => d.status === 'inactive').length,
            sub: 'Butuh Rekrutmen',
            icon: IconAlertTriangle,
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className='flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-xs'
          >
            <div>
              <p className='text-xs font-semibold text-muted-foreground'>{stat.label}</p>
              <h3 className='mt-0.5 text-xl font-bold text-foreground'>{stat.value}</h3>
              <p className='mt-0.5 text-[10px] font-medium text-muted-foreground'>{stat.sub}</p>
            </div>
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${stat.color}`}
            >
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter and Action Bar ───────────────────────────────────────────── */}
      <div className='flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 lg:flex-row lg:items-center'>
        <div className='flex min-w-0 flex-1 flex-wrap items-center gap-2'>
          <div className='relative w-full sm:w-60'>
            <IconSearch
              size={14}
              className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder='Search department name or code...'
              className='h-9 w-full rounded-xl bg-background pl-9 text-xs'
            />
          </div>

          <Select
            value={divisionFilter}
            onValueChange={(val) => {
              setDivisionFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='h-9 w-full rounded-xl bg-background text-xs sm:w-44'>
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

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='h-9 w-full rounded-xl bg-background text-xs sm:w-32'>
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
          className='h-9 w-full shrink-0 gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs lg:w-auto'
        >
          <IconPlus size={15} />
          Add Department
        </Button>
      </div>

      {/* ── Department Directory Table ──────────────────────────────────────── */}
      <div className='w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs'>
        <Table className='w-full min-w-[900px]'>
          <TableHeader className='bg-muted/40'>
            <TableRow>
              <TableHead className='text-xs font-bold'>Dept Code</TableHead>
              <TableHead className='text-xs font-bold'>Department Name</TableHead>
              <TableHead className='text-xs font-bold'>Parent Division</TableHead>
              <TableHead className='text-xs font-bold'>Head of Department</TableHead>
              <TableHead className='text-center text-xs font-bold'>Positions</TableHead>
              <TableHead className='text-center text-xs font-bold'>Headcount</TableHead>
              <TableHead className='text-center text-xs font-bold'>Status</TableHead>
              <TableHead className='text-right text-xs font-bold'>Action</TableHead>
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
              paginatedDepartments.map((dept) => (
                <TableRow key={dept.id} className='transition-colors hover:bg-muted/30'>
                  <TableCell className='font-mono text-xs font-bold text-primary'>
                    {dept.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className='text-xs font-bold text-foreground'>{dept.name}</p>
                      <p className='mt-0.5 font-mono text-[10px] text-muted-foreground'>
                        CC: {dept.costCenter}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className='rounded-lg bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-400'>
                      {dept.divisionName}
                    </span>
                  </TableCell>
                  <TableCell>
                    {dept.headOfDepartment ? (
                      <div className='flex items-center gap-2'>
                        <div className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-[10px] font-bold text-emerald-700 dark:text-emerald-400'>
                          {dept.headOfDepartment.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className='text-xs font-bold text-foreground'>
                            {dept.headOfDepartment.name}
                          </p>
                          <p className='text-[10px] text-muted-foreground'>
                            {dept.headOfDepartment.title}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className='text-xs text-muted-foreground italic'>Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className='text-center text-xs font-bold text-foreground'>
                    {dept.totalPositions} Posisi
                  </TableCell>
                  <TableCell className='text-center text-xs font-semibold text-primary'>
                    {dept.totalEmployees} Org
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge
                      variant='outline'
                      className={`text-[10px] font-semibold ${
                        dept.status === 'active'
                          ? 'border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20'
                          : 'border-muted-foreground text-muted-foreground'
                      }`}
                    >
                      {dept.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className='inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted'>
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
                          <IconEdit size={14} className='mr-2 text-muted-foreground' /> Edit
                          Department
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

        {/* Table Pagination */}
        <TablePagination
          itemLabel='departemen'
          totalItems={filteredDepartments.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* ── Add / Edit Department Modal ────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className='overflow-hidden rounded-2xl p-0 sm:max-w-[520px]'>
          <form onSubmit={handleSaveForm}>
            <DialogHeader className='border-b border-border/80 bg-muted/20 p-6 pb-4'>
              <div className='flex items-center gap-2.5'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600'>
                  <IconHierarchy size={20} />
                </div>
                <div>
                  <DialogTitle className='text-sm font-bold text-foreground'>
                    {formMode === 'create' ? 'Add Department' : 'Edit Department'}
                  </DialogTitle>
                  <DialogDescription className='mt-0.5 text-xs text-muted-foreground'>
                    Tambahkan departemen baru di bawah divisi yang dipilih
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='space-y-4 p-6'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Parent Division *</label>
                <Select value={divisionId} onValueChange={setDivisionId} required>
                  <SelectTrigger className='h-9.5 rounded-xl bg-background text-xs'>
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
                <div className='col-span-1 space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Code *</label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder='DEP-SE'
                    className='h-9.5 rounded-xl bg-background font-mono text-xs uppercase'
                    required
                  />
                </div>
                <div className='col-span-2 space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Department Name *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='e.g. Software Engineering'
                    className='h-9.5 rounded-xl bg-background text-xs font-medium'
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>
                    Head of Department
                  </label>
                  <Input
                    value={headName}
                    onChange={(e) => setHeadName(e.target.value)}
                    placeholder='e.g. Rizky Pratama'
                    className='h-9.5 rounded-xl bg-background text-xs'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Leader Job Title</label>
                  <Input
                    value={headTitle}
                    onChange={(e) => setHeadTitle(e.target.value)}
                    placeholder='e.g. Head of Engineering'
                    className='h-9.5 rounded-xl bg-background text-xs'
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
                    className='h-9.5 rounded-xl bg-background font-mono text-xs'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Status *</label>
                  <Select value={status} onValueChange={(val: OrgStatus) => setStatus(val)}>
                    <SelectTrigger className='h-9.5 rounded-xl bg-background text-xs'>
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
                <label className='text-xs font-semibold text-foreground'>
                  Description & Objectives
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Fungsi dan tanggung jawab departemen...'
                  className='min-h-[70px] rounded-xl bg-background text-xs'
                />
              </div>
            </div>

            <DialogFooter className='gap-2 border-t border-border/70 bg-muted/10 p-6 pt-3 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setFormOpen(false)}
                className='h-9 rounded-xl text-xs font-semibold'
              >
                Cancel
              </Button>
              <Button type='submit' className='h-9 rounded-xl px-5 text-xs font-semibold shadow-xs'>
                {formMode === 'create' ? 'Create Department' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className='rounded-2xl p-6 sm:max-w-[400px]'>
          <div className='flex items-start gap-3.5'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive'>
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
          <DialogFooter className='mt-2 border-t border-border/70 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDeleteOpen(false)}
              className='h-9 rounded-xl text-xs font-semibold'
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
              className='h-9 rounded-xl text-xs font-semibold'
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
