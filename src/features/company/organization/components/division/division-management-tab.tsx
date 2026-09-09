// src/features/company/organization/components/division/division-management-tab.tsx
import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
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

import { DivisionDetailModal } from '../unit-detail-modals'
import { MOCK_DIVISIONS } from '../../data/mock-org-data'
import type { DivisionRecord, OrgStatus } from '../../types'

export function DivisionManagementTab() {
  const [divisions, setDivisions] = useState<DivisionRecord[]>(MOCK_DIVISIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Form Modal State
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedDiv, setSelectedDiv] = useState<DivisionRecord | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [headName, setHeadName] = useState('')
  const [headTitle, setHeadTitle] = useState('')
  const [costCenter, setCostCenter] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<OrgStatus>('active')

  // Detail Modal State
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedDetailDiv, setSelectedDetailDiv] = useState<DivisionRecord | null>(null)

  // Delete State
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [divToDelete, setDivToDelete] = useState<DivisionRecord | null>(null)

  const filteredDivisions = divisions.filter((div) => {
    const matchesSearch =
      searchQuery === '' ||
      div.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      div.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (div.headOfDivision?.name &&
        div.headOfDivision.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || div.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const paginatedDivisions = filteredDivisions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  const handleOpenCreate = () => {
    setFormMode('create')
    setSelectedDiv(null)
    setName('')
    setCode('')
    setHeadName('')
    setHeadTitle('')
    setCostCenter('')
    setDescription('')
    setStatus('active')
    setFormOpen(true)
  }

  const handleOpenEdit = (div: DivisionRecord) => {
    setFormMode('edit')
    setSelectedDiv(div)
    setName(div.name)
    setCode(div.code)
    setHeadName(div.headOfDivision?.name || '')
    setHeadTitle(div.headOfDivision?.title || '')
    setCostCenter(div.costCenter)
    setDescription(div.description || '')
    setStatus(div.status)
    setFormOpen(true)
  }

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (formMode === 'create') {
      const newDiv: DivisionRecord = {
        id: `div-${Date.now()}`,
        code,
        name,
        costCenter: costCenter || 'CC-DIV-00',
        totalDepartments: 0,
        totalEmployees: 0,
        status,
        description,
        createdAt: new Date().toISOString().split('T')[0],
        headOfDivision: headName
          ? {
              id: `emp-${Date.now()}`,
              name: headName,
              title: headTitle || `VP of ${name}`,
            }
          : undefined,
      }
      setDivisions((prev) => [newDiv, ...prev])
      snackbar.success(`Divisi ${name} berhasil ditambahkan!`)
    } else if (formMode === 'edit' && selectedDiv) {
      setDivisions((prev) =>
        prev.map((d) =>
          d.id === selectedDiv.id
            ? {
                ...d,
                name,
                code,
                costCenter,
                status,
                description,
                headOfDivision: headName
                  ? {
                      id: d.headOfDivision?.id || `emp-${Date.now()}`,
                      name: headName,
                      title: headTitle || `VP of ${name}`,
                    }
                  : undefined,
              }
            : d,
        ),
      )
      snackbar.success(`Divisi ${name} berhasil diperbarui!`)
    }
    setFormOpen(false)
  }

  const handleDelete = (id: string) => {
    setDivisions((prev) => prev.filter((d) => d.id !== id))
    snackbar.success('Divisi berhasil dihapus.')
  }

  return (
    <div className='w-full max-w-full min-w-0 space-y-6'>
      {/* ── Top Stats Cards ───────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {[
          {
            label: 'Total Divisions',
            value: divisions.length,
            sub: 'Unit Bisnis Utama',
            icon: IconBuilding,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
          },
          {
            label: 'Active Divisions',
            value: divisions.filter((d) => d.status === 'active').length,
            sub: 'Beroperasi Penuh',
            icon: IconCheck,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
          },
          {
            label: 'Total Headcount',
            value: divisions.reduce((acc, d) => acc + d.totalEmployees, 0),
            sub: 'Karyawan',
            icon: IconUsers,
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40',
          },
          {
            label: 'Head Vacancies',
            value: divisions.filter((d) => !d.headOfDivision).length,
            sub: 'Semua Terisi',
            icon: IconBuildingSkyscraper,
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
              placeholder='Search division name or code...'
              className='h-9 w-full rounded-xl bg-background pl-9 text-xs'
            />
          </div>

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
          Add Division
        </Button>
      </div>

      {/* ── Division Directory Table ───────────────────────────────────────── */}
      <div className='w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs'>
        <Table className='w-full min-w-[850px]'>
          <TableHeader className='bg-muted/40'>
            <TableRow>
              <TableHead className='text-xs font-bold'>Division Code</TableHead>
              <TableHead className='text-xs font-bold'>Division Name</TableHead>
              <TableHead className='text-xs font-bold'>Head of Division</TableHead>
              <TableHead className='text-xs font-bold'>Cost Center</TableHead>
              <TableHead className='text-center text-xs font-bold'>Total Depts</TableHead>
              <TableHead className='text-center text-xs font-bold'>Headcount</TableHead>
              <TableHead className='text-center text-xs font-bold'>Status</TableHead>
              <TableHead className='text-right text-xs font-bold'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDivisions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='h-32 text-center text-xs text-muted-foreground'>
                  Tidak ada data divisi yang sesuai filter.
                </TableCell>
              </TableRow>
            ) : (
              paginatedDivisions.map((div) => (
                <TableRow key={div.id} className='transition-colors hover:bg-muted/30'>
                  <TableCell className='font-mono text-xs font-bold text-primary'>
                    {div.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className='text-xs font-bold text-foreground'>{div.name}</p>
                      {div.description && (
                        <p className='max-w-xs truncate text-[11px] text-muted-foreground'>
                          {div.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {div.headOfDivision ? (
                      <div className='flex items-center gap-2'>
                        <div className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary'>
                          {div.headOfDivision.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className='text-xs font-bold text-foreground'>
                            {div.headOfDivision.name}
                          </p>
                          <p className='text-[10px] text-muted-foreground'>
                            {div.headOfDivision.title}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className='text-xs text-muted-foreground italic'>Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className='font-mono text-xs text-muted-foreground'>
                    {div.costCenter}
                  </TableCell>
                  <TableCell className='text-center text-xs font-bold text-foreground'>
                    {div.totalDepartments} Depts
                  </TableCell>
                  <TableCell className='text-center text-xs font-semibold text-primary'>
                    {div.totalEmployees} Org
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge
                      variant='outline'
                      className={`text-[10px] font-semibold ${
                        div.status === 'active'
                          ? 'border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20'
                          : 'border-muted-foreground text-muted-foreground'
                      }`}
                    >
                      {div.status}
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
                            setSelectedDetailDiv(div)
                            setDetailOpen(true)
                          }}
                          className='text-xs'
                        >
                          <IconEye size={14} className='mr-2 text-primary' /> View Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEdit(div)} className='text-xs'>
                          <IconEdit size={14} className='mr-2 text-muted-foreground' /> Edit
                          Division
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDivToDelete(div)
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
          itemLabel='divisi'
          totalItems={filteredDivisions.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* ── Add / Edit Division Modal ──────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className='overflow-hidden rounded-2xl p-0 sm:max-w-[500px]'>
          <form onSubmit={handleSaveForm}>
            <DialogHeader className='border-b border-border/80 bg-muted/20 p-6 pb-4'>
              <div className='flex items-center gap-2.5'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600'>
                  <IconBuilding size={20} />
                </div>
                <div>
                  <DialogTitle className='text-sm font-bold text-foreground'>
                    {formMode === 'create' ? 'Add Division' : 'Edit Division'}
                  </DialogTitle>
                  <DialogDescription className='mt-0.5 text-xs text-muted-foreground'>
                    Kelola data divisi bisnis dan penanggung jawab unit
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='space-y-4 p-6'>
              <div className='grid grid-cols-3 gap-3'>
                <div className='col-span-1 space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Code *</label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder='DIV-TECH'
                    className='h-9.5 rounded-xl bg-background font-mono text-xs uppercase'
                    required
                  />
                </div>
                <div className='col-span-2 space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Division Name *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='e.g. Technology & Digital'
                    className='h-9.5 rounded-xl bg-background text-xs font-medium'
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Head of Division</label>
                  <Input
                    value={headName}
                    onChange={(e) => setHeadName(e.target.value)}
                    placeholder='e.g. Ir. Budi Wicaksono'
                    className='h-9.5 rounded-xl bg-background text-xs'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Leader Title</label>
                  <Input
                    value={headTitle}
                    onChange={(e) => setHeadTitle(e.target.value)}
                    placeholder='e.g. VP of Technology'
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
                    placeholder='CC-TECH-100'
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
                <label className='text-xs font-semibold text-foreground'>Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Ringkasan tugas divisi...'
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
                {formMode === 'create' ? 'Create Division' : 'Save Changes'}
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
                Delete Division
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                Hapus divisi <strong className='text-foreground'>{divToDelete?.name}</strong>?
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
                if (divToDelete) handleDelete(divToDelete.id)
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
      <DivisionDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        division={selectedDetailDiv}
        onEdit={handleOpenEdit}
      />
    </div>
  )
}
