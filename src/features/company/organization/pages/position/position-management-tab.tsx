// src/features/company/organization/pages/position/position-management-tab.tsx
import {
  IconBriefcase,
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconHierarchy,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUser,
  IconUsers,
  IconUserPlus,
  IconEye,
} from '@tabler/icons-react'
import { useState } from 'react'
import { PositionDetailModal } from '../../components/unit-detail-modals'
import { MOCK_POSITIONS, MOCK_DEPARTMENTS } from '../../data/mock-org-data'
import type { PositionRecord, OrgStatus } from '../../types'
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
import { TablePagination } from '@/shared/components/ui/table-pagination'
import { snackbar } from '@/shared/lib/snackbar'

export function PositionManagementTab() {
  const [positions, setPositions] = useState<PositionRecord[]>(MOCK_POSITIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Form Modal State
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedPos, setSelectedPos] = useState<PositionRecord | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [jobLevel, setJobLevel] = useState('Senior')
  const [jobGrade, setJobGrade] = useState('Grade 5')
  const [headcountLimit, setHeadcountLimit] = useState(5)
  const [reportsTo, setReportsTo] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<OrgStatus>('active')

  // Detail Modal State
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedDetailPos, setSelectedDetailPos] = useState<PositionRecord | null>(null)

  // Delete State
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [posToDelete, setPosToDelete] = useState<PositionRecord | null>(null)

  const filteredPositions = positions.filter((pos) => {
    const matchesSearch =
      searchQuery === '' ||
      pos.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pos.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pos.reportsToPositionTitle && pos.reportsToPositionTitle.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesDept = deptFilter === 'all' || pos.departmentId === deptFilter
    const matchesLevel = levelFilter === 'all' || pos.jobLevel === levelFilter
    const matchesStatus = statusFilter === 'all' || pos.status === statusFilter
    return matchesSearch && matchesDept && matchesLevel && matchesStatus
  })

  const paginatedPositions = filteredPositions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  const handleOpenCreate = () => {
    setFormMode('create')
    setSelectedPos(null)
    setTitle('')
    setCode('')
    setDepartmentId(MOCK_DEPARTMENTS[0]?.id || '')
    setJobLevel('Senior')
    setJobGrade('Grade 5')
    setHeadcountLimit(5)
    setReportsTo('')
    setDescription('')
    setStatus('active')
    setFormOpen(true)
  }

  const handleOpenEdit = (pos: PositionRecord) => {
    setFormMode('edit')
    setSelectedPos(pos)
    setTitle(pos.title)
    setCode(pos.code)
    setDepartmentId(pos.departmentId)
    setJobLevel(pos.jobLevel)
    setJobGrade(pos.jobGrade)
    setHeadcountLimit(pos.headcountLimit)
    setReportsTo(pos.reportsToPositionTitle || '')
    setDescription(pos.description || '')
    setStatus(pos.status)
    setFormOpen(true)
  }

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault()
    const parentDept = MOCK_DEPARTMENTS.find((d) => d.id === departmentId)
    const departmentName = parentDept ? parentDept.name : 'Engineering'
    const divisionName = parentDept ? parentDept.divisionName : 'Technology'

    if (formMode === 'create') {
      const newPos: PositionRecord = {
        id: `pos-${Date.now()}`,
        code,
        title,
        departmentId,
        departmentName,
        divisionName,
        jobLevel,
        jobGrade,
        headcountCurrent: 1,
        headcountLimit: Number(headcountLimit) || 1,
        reportsToPositionTitle: reportsTo || undefined,
        status,
        description,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setPositions((prev) => [newPos, ...prev])
      snackbar.success(`Posisi jabatan ${title} berhasil dibuat!`)
    } else if (formMode === 'edit' && selectedPos) {
      setPositions((prev) =>
        prev.map((p) =>
          p.id === selectedPos.id
            ? {
                ...p,
                title,
                code,
                departmentId,
                departmentName,
                divisionName,
                jobLevel,
                jobGrade,
                headcountLimit: Number(headcountLimit) || p.headcountLimit,
                reportsToPositionTitle: reportsTo || undefined,
                status,
                description,
              }
            : p,
        ),
      )
      snackbar.success(`Posisi jabatan ${title} berhasil diperbarui!`)
    }
    setFormOpen(false)
  }

  const handleDelete = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id))
    snackbar.success('Posisi jabatan berhasil dihapus.')
  }

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top Stats Cards ───────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        {[
          { label: 'Total Positions', value: positions.length, sub: 'Katalog Jabatan', icon: IconBriefcase, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
          { label: 'Filled Positions', value: positions.filter((p) => p.headcountCurrent >= p.headcountLimit).length, sub: 'Kapasitas Penuh', icon: IconCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Open Vacancies', value: positions.reduce((acc, p) => acc + Math.max(0, p.headcountLimit - p.headcountCurrent), 0), sub: 'Slot Lowongan', icon: IconUserPlus, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
          { label: 'Total Headcount', value: positions.reduce((acc, p) => acc + p.headcountCurrent, 0), sub: 'Pegawai Aktif', icon: IconUsers, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
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
          <div className='relative w-full sm:w-56'>
            <IconSearch size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder='Search position title or code...'
              className='h-9 pl-9 text-xs bg-background rounded-xl w-full'
            />
          </div>

          <Select
            value={deptFilter}
            onValueChange={(val) => {
              setDeptFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='h-9 w-full sm:w-40 text-xs bg-background rounded-xl'>
              <SelectValue placeholder='All Depts' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Departments</SelectItem>
              {MOCK_DEPARTMENTS.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={levelFilter}
            onValueChange={(val) => {
              setLevelFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='h-9 w-full sm:w-32 text-xs bg-background rounded-xl'>
              <SelectValue placeholder='Job Level' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Levels</SelectItem>
              <SelectItem value='Manager'>Manager</SelectItem>
              <SelectItem value='Lead'>Lead</SelectItem>
              <SelectItem value='Senior'>Senior</SelectItem>
              <SelectItem value='Staff'>Staff</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='h-9 w-full sm:w-28 text-xs bg-background rounded-xl'>
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
          Add Position
        </Button>
      </div>

      {/* ── Position Directory Table ───────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs w-full max-w-full min-w-0'>
        <Table className='min-w-[950px] w-full'>
          <TableHeader className='bg-muted/40'>
            <TableRow>
              <TableHead className='text-xs font-bold'>Position Code</TableHead>
              <TableHead className='text-xs font-bold'>Position Title</TableHead>
              <TableHead className='text-xs font-bold'>Department</TableHead>
              <TableHead className='text-xs font-bold'>Job Grade & Level</TableHead>
              <TableHead className='text-xs font-bold'>Headcount Capacity</TableHead>
              <TableHead className='text-xs font-bold'>Reports To</TableHead>
              <TableHead className='text-xs font-bold text-center'>Status</TableHead>
              <TableHead className='text-xs font-bold text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPositions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='h-32 text-center text-xs text-muted-foreground'>
                  Tidak ada data jabatan posisi yang sesuai filter.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPositions.map((pos) => {
                const percent = Math.min(100, Math.round((pos.headcountCurrent / pos.headcountLimit) * 100))
                return (
                  <TableRow key={pos.id} className='hover:bg-muted/30 transition-colors'>
                    <TableCell className='text-xs font-mono font-bold text-primary'>
                      {pos.code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className='text-xs font-bold text-foreground'>{pos.title}</p>
                        {pos.description && (
                          <p className='text-[11px] text-muted-foreground truncate max-w-xs'>
                            {pos.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className='px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'>
                          {pos.departmentName}
                        </span>
                        <p className='text-[10px] text-muted-foreground mt-0.5'>{pos.divisionName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1.5'>
                        <span className='text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400'>
                          {pos.jobLevel}
                        </span>
                        <span className='text-[10px] font-mono text-muted-foreground'>
                          {pos.jobGrade}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='space-y-1 min-w-[100px]'>
                        <div className='flex items-center justify-between text-[11px] font-semibold'>
                          <span className='text-foreground'>{pos.headcountCurrent} Filled</span>
                          <span className='text-muted-foreground'>Max {pos.headcountLimit}</span>
                        </div>
                        <div className='w-full h-1.5 rounded-full bg-muted overflow-hidden'>
                          <div
                            className={`h-full rounded-full transition-all ${
                              percent >= 100 ? 'bg-emerald-500' : percent >= 75 ? 'bg-primary' : 'bg-amber-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='text-xs text-muted-foreground'>
                      {pos.reportsToPositionTitle ? (
                        <span className='flex items-center gap-1 text-foreground font-medium'>
                          <IconUser size={13} className='text-muted-foreground shrink-0' />
                          <span className='truncate max-w-[140px]'>{pos.reportsToPositionTitle}</span>
                        </span>
                      ) : (
                        <span className='italic opacity-60'>Top Head</span>
                      )}
                    </TableCell>
                    <TableCell className='text-center'>
                      <Badge
                        variant='outline'
                        className={`text-[10px] font-semibold ${
                          pos.status === 'active'
                            ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'border-muted-foreground text-muted-foreground'
                        }`}
                      >
                        {pos.status}
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
                              setSelectedDetailPos(pos)
                              setDetailOpen(true)
                            }}
                            className='text-xs'
                          >
                            <IconEye size={14} className='mr-2 text-primary' /> View Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(pos)} className='text-xs'>
                            <IconEdit size={14} className='mr-2 text-muted-foreground' /> Edit Position
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setPosToDelete(pos)
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
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Table Pagination */}
        <TablePagination
          itemLabel='posisi jabatan'
          totalItems={filteredPositions.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* ── Add / Edit Position Modal ──────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className='sm:max-w-[540px] p-0 overflow-hidden rounded-2xl'>
          <form onSubmit={handleSaveForm}>
            <DialogHeader className='p-6 pb-4 border-b border-border/80 bg-muted/20'>
              <div className='flex items-center gap-2.5'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600'>
                  <IconBriefcase size={20} />
                </div>
                <div>
                  <DialogTitle className='text-sm font-bold text-foreground'>
                    {formMode === 'create' ? 'Add Position' : 'Edit Position'}
                  </DialogTitle>
                  <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                    Definisikan jabatan pekerjaan, grade level, dan batas kuota karyawan
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='p-6 space-y-4 max-h-[70vh] overflow-y-auto'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Department *</label>
                <Select value={departmentId} onValueChange={setDepartmentId} required>
                  <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl'>
                    <SelectValue placeholder='Pilih Departemen' />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_DEPARTMENTS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.divisionName})
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
                    placeholder='POS-ENG-01'
                    className='h-9.5 text-xs bg-background rounded-xl font-mono uppercase'
                    required
                  />
                </div>
                <div className='space-y-1.5 col-span-2'>
                  <label className='text-xs font-semibold text-foreground'>Position Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='e.g. Senior Frontend Engineer'
                    className='h-9.5 text-xs bg-background rounded-xl font-medium'
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-3 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Job Level *</label>
                  <Select value={jobLevel} onValueChange={setJobLevel}>
                    <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl'>
                      <SelectValue placeholder='Level' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Manager'>Manager</SelectItem>
                      <SelectItem value='Lead'>Lead</SelectItem>
                      <SelectItem value='Senior'>Senior</SelectItem>
                      <SelectItem value='Staff'>Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Job Grade *</label>
                  <Select value={jobGrade} onValueChange={setJobGrade}>
                    <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl'>
                      <SelectValue placeholder='Grade' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Grade 7'>Grade 7 (Executive)</SelectItem>
                      <SelectItem value='Grade 6'>Grade 6 (Manager/Lead)</SelectItem>
                      <SelectItem value='Grade 5'>Grade 5 (Senior Specialist)</SelectItem>
                      <SelectItem value='Grade 4'>Grade 4 (Intermediate)</SelectItem>
                      <SelectItem value='Grade 3'>Grade 3 (Junior/Officer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Headcount Max *</label>
                  <Input
                    type='number'
                    min={1}
                    value={headcountLimit}
                    onChange={(e) => setHeadcountLimit(Number(e.target.value))}
                    className='h-9.5 text-xs bg-background rounded-xl font-semibold'
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>Direct Superior (Reports To)</label>
                  <Input
                    value={reportsTo}
                    onChange={(e) => setReportsTo(e.target.value)}
                    placeholder='e.g. Head of Engineering'
                    className='h-9.5 text-xs bg-background rounded-xl'
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
                <label className='text-xs font-semibold text-foreground'>Job Responsibilities & Scope</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Uraian ringkas tugas dan kompetensi jabatan...'
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
                {formMode === 'create' ? 'Create Position' : 'Save Changes'}
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
                Delete Position
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                Hapus posisi jabatan <strong className='text-foreground'>{posToDelete?.title}</strong>?
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
                if (posToDelete) handleDelete(posToDelete.id)
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
      <PositionDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        position={selectedDetailPos}
        onEdit={handleOpenEdit}
      />
    </div>
  )
}
