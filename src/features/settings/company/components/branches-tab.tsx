import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconCheck,
  IconEdit,
  IconEye,
  IconGitBranch,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { useCompanyStore } from '../data/company-store'
import { BranchDetailDialog } from './branch-detail-dialog'
import { BranchDialog } from './branch-dialog'
import type { CompanyBranch } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { TablePagination } from '@/shared/components/ui/table-pagination'
import { snackbar } from '@/shared/lib/snackbar'

export function BranchesTab() {
  const { branches, deleteBranch, getStats } = useCompanyStore()
  const stats = getStats()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<CompanyBranch | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      if (typeFilter !== 'all' && b.type !== typeFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          b.picName.toLowerCase().includes(q) ||
          b.linkedOffice.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [branches, typeFilter, searchQuery])

  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredBranches.slice(start, start + pageSize)
  }, [filteredBranches, currentPage, pageSize])

  const totalBranchEmployees = useMemo(() => {
    return branches
      .filter((b) => b.status === 'Active')
      .reduce((sum, b) => sum + b.employeesCount, 0)
  }, [branches])

  const handleOpenDetail = (branch: CompanyBranch) => {
    setSelectedBranch(branch)
    setDetailDialogOpen(true)
  }

  const handleOpenAdd = () => {
    setSelectedBranch(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (branch: CompanyBranch) => {
    setSelectedBranch(branch)
    setDialogOpen(true)
  }

  const handleDelete = (branch: CompanyBranch) => {
    if (confirm(`Apakah Anda yakin ingin menghapus cabang "${branch.name}"?`)) {
      deleteBranch(branch.id)
      snackbar.success(`Cabang ${branch.name} berhasil dihapus.`)
    }
  }

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top Metric Cards ────────────────────────────────────────────── */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Branches</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>{stats.totalBranches}</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>All registered</p>
          </div>
          <div className='size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconGitBranch size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Active Branches</p>
            <h3 className='text-2xl font-black text-emerald-600 mt-0.5'>
              {stats.activeBranches}
            </h3>
            <p className='text-[10px] text-emerald-600 font-semibold mt-0.5'>100% active</p>
          </div>
          <div className='size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconCheck size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Employees</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>
              {stats.totalEmployees.toLocaleString()}
            </h3>
            <p className='text-[10px] text-indigo-600 font-semibold mt-0.5'>Across branches</p>
          </div>
          <div className='size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0'>
            <IconUsers size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Cities Covered</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>{stats.citiesCount}</h3>
            <p className='text-[10px] text-blue-600 font-semibold mt-0.5'>Jakarta + regional</p>
          </div>
          <div className='size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconMapPin size={22} />
          </div>
        </div>
      </div>

      {/* ── Toolbar & Table Card ─────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        {/* Table Top Header with Add Button */}
        <div className='p-4 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div>
            <h4 className='text-sm font-bold text-foreground'>Branch Directory</h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Cabang perusahaan, tipe, lokasi kantor terhubung, PIC, dan jumlah karyawan
            </p>
          </div>
          <Button
            type='button'
            size='sm'
            onClick={handleOpenAdd}
            className='rounded-xl h-9 text-xs font-bold bg-primary text-primary-foreground gap-1.5 shadow-xs'
          >
            <IconPlus size={15} />
            Add Branch
          </Button>
        </div>

        {/* Filter bar */}
        <div className='p-3 bg-muted/20 border-b border-border/60 flex flex-wrap items-center justify-between gap-2.5'>
          <div className='flex flex-wrap items-center gap-2.5 flex-1 min-w-0'>
            <div className='relative w-full sm:w-64'>
              <IconSearch
                size={14}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Cari cabang, kota, PIC, atau kode...'
                className='h-8 pl-9 text-xs bg-background rounded-xl'
              />
            </div>

            <div className='w-full sm:w-44'>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className='h-8 text-xs rounded-xl bg-background'>
                  <SelectValue placeholder='Tipe Cabang' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua Tipe</SelectItem>
                  <SelectItem value='Head Office'>Head Office</SelectItem>
                  <SelectItem value='Branch'>Branch</SelectItem>
                  <SelectItem value='Regional'>Regional</SelectItem>
                  <SelectItem value='Representative'>Representative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className='w-full overflow-x-auto pb-1'>
          <table className='w-full text-left text-xs min-w-[950px] border-collapse'>
            <thead>
              <tr className='border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold'>
                <th className='py-3.5 px-3 text-center whitespace-nowrap w-12'>NO</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>BRANCH</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>TYPE</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>CITY</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>OFFICE</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>PIC</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>EMPLOYEES</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>STATUS</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap w-24'>AKSI</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {paginatedBranches.length === 0 ? (
                <tr>
                  <td colSpan={9} className='text-center py-12 text-muted-foreground italic text-xs'>
                    Tidak ada cabang yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedBranches.map((row, index) => (
                  <tr key={row.id} className='hover:bg-muted/20 transition-colors'>
                    <td className='py-3.5 px-3 text-center font-mono font-medium text-muted-foreground whitespace-nowrap'>
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className='py-3.5 px-4 font-bold text-foreground whitespace-nowrap'>
                      <div className='flex items-center gap-2'>
                        <div className='size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-[10px]'>
                          {row.code}
                        </div>
                        <div>
                          <p>{row.name}</p>
                          <span className='text-[10px] text-muted-foreground font-mono'>
                            {row.code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className='py-3.5 px-4 whitespace-nowrap'>
                      <Badge
                        variant='outline'
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          row.type === 'Head Office'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : row.type === 'Regional'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-muted/60 text-muted-foreground border-border/80'
                        }`}
                      >
                        {row.type}
                      </Badge>
                    </td>
                    <td className='py-3.5 px-4 text-foreground font-medium whitespace-nowrap'>
                      {row.city}
                    </td>
                    <td className='py-3.5 px-4 text-muted-foreground whitespace-nowrap'>
                      {row.linkedOffice}
                    </td>
                    <td className='py-3.5 px-4 whitespace-nowrap'>
                      <div>
                        <p className='font-semibold text-foreground'>{row.picName}</p>
                        <span className='text-[10px] text-muted-foreground'>{row.picEmail}</span>
                      </div>
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-bold text-foreground whitespace-nowrap'>
                      {row.employeesCount} org
                    </td>
                    <td className='py-3.5 px-4 text-center whitespace-nowrap'>
                      <Badge
                        variant='outline'
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap ${
                          row.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-muted text-muted-foreground border-border/80'
                        }`}
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className='py-3.5 px-4 text-center whitespace-nowrap'>
                      <div className='flex items-center justify-center gap-1'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => handleOpenDetail(row)}
                          className='size-7 rounded-lg text-muted-foreground hover:text-primary'
                          title='Lihat Detail'
                        >
                          <IconEye size={14} />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => handleOpenEdit(row)}
                          className='size-7 rounded-lg text-muted-foreground hover:text-foreground'
                          title='Edit Cabang'
                        >
                          <IconEdit size={14} />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDelete(row)}
                          className='size-7 rounded-lg text-muted-foreground hover:text-rose-600'
                          title='Hapus Cabang'
                        >
                          <IconTrash size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Summary Bar & Pagination */}
        <div className='p-3 bg-muted/10 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-2 px-4'>
          <p className='font-medium'>
            Company workforce:{' '}
            <span className='font-bold text-foreground font-mono'>
              {stats.totalEmployees.toLocaleString()} total active employees
            </span>
          </p>
          <span className='text-[11px] text-muted-foreground'>
            Employee counts per branch are calculated automatically
          </span>
        </div>

        <TablePagination
          itemLabel='cabang'
          totalItems={filteredBranches.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* Detail Dialog */}
      <BranchDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        branch={selectedBranch}
        onEdit={handleOpenEdit}
      />

      {/* Add / Edit Dialog */}
      <BranchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        branchToEdit={selectedBranch}
      />
    </div>
  )
}
