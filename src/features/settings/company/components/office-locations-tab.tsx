import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconEdit,
  IconEye,
  IconFilter,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconTarget,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { useCompanyStore } from '../data/company-store'
import { OfficeLocationDetailDialog } from './office-location-detail-dialog'
import { OfficeLocationDialog } from './office-location-dialog'
import type { OfficeLocation } from '../types'
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

export function OfficeLocationsTab() {
  const { locations, deleteLocation, getStats } = useCompanyStore()
  const stats = getStats()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<OfficeLocation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (statusFilter !== 'all' && loc.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.city.toLowerCase().includes(q) ||
          loc.branchName.toLowerCase().includes(q) ||
          loc.code.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [locations, statusFilter, searchQuery])

  const paginatedLocations = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLocations.slice(start, start + pageSize)
  }, [filteredLocations, currentPage, pageSize])

  const totalAssignedEmployees = useMemo(() => {
    return locations
      .filter((l) => l.status === 'Active')
      .reduce((sum, l) => sum + l.employeesCount, 0)
  }, [locations])

  const handleOpenDetail = (loc: OfficeLocation) => {
    setSelectedLocation(loc)
    setDetailDialogOpen(true)
  }

  const handleOpenAdd = () => {
    setSelectedLocation(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (loc: OfficeLocation) => {
    setSelectedLocation(loc)
    setDialogOpen(true)
  }

  const handleDelete = (loc: OfficeLocation) => {
    if (confirm(`Apakah Anda yakin ingin menghapus lokasi kantor "${loc.name}"?`)) {
      deleteLocation(loc.id)
      snackbar.success(`Lokasi ${loc.name} berhasil dihapus.`)
    }
  }

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top Metric Cards ────────────────────────────────────────────── */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Locations</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>{stats.totalLocations}</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>
              Across {stats.citiesCount} cities
            </p>
          </div>
          <div className='size-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0'>
            <IconMapPin size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Head Offices</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>
              {stats.headOfficeCount}
            </h3>
            <p className='text-[10px] text-blue-600 font-semibold mt-0.5'>Jakarta HQ</p>
          </div>
          <div className='size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconBuildingSkyscraper size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Active Locations</p>
            <h3 className='text-2xl font-black text-emerald-600 mt-0.5'>
              {stats.activeLocations}
            </h3>
            <p className='text-[10px] text-emerald-600 font-semibold mt-0.5'>Total live offices</p>
          </div>
          <div className='size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconBuilding size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Employees</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>
              {stats.totalEmployees.toLocaleString()}
            </h3>
            <p className='text-[10px] text-indigo-600 font-semibold mt-0.5'>Assigned workforce</p>
          </div>
          <div className='size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0'>
            <IconUsers size={22} />
          </div>
        </div>
      </div>

      {/* ── Toolbar & Table Card ─────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        {/* Table Top Header with Add Button */}
        <div className='p-4 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div>
            <h4 className='text-sm font-bold text-foreground'>Location Directory</h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Kelola lokasi kerja, alamat, radius presensi geofence, dan jumlah karyawan
            </p>
          </div>
          <Button
            type='button'
            size='sm'
            onClick={handleOpenAdd}
            className='rounded-xl h-9 text-xs font-bold bg-primary text-primary-foreground gap-1.5 shadow-xs'
          >
            <IconPlus size={15} />
            Add Office Location
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
                placeholder='Cari nama lokasi, cabang, atau kota...'
                className='h-8 pl-9 text-xs bg-background rounded-xl'
              />
            </div>

            <div className='w-full sm:w-40'>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='h-8 text-xs rounded-xl bg-background'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua Status</SelectItem>
                  <SelectItem value='Active'>Active Saja</SelectItem>
                  <SelectItem value='Inactive'>Inactive</SelectItem>
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
                <th className='py-3.5 px-4 whitespace-nowrap'>LOCATION</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>BRANCH</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>CITY</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>EMPLOYEES</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>GEOFENCE</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>STATUS</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap w-24'>AKSI</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {paginatedLocations.length === 0 ? (
                <tr>
                  <td colSpan={8} className='text-center py-12 text-muted-foreground italic text-xs'>
                    Tidak ada lokasi kantor yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedLocations.map((row, index) => (
                  <tr key={row.id} className='hover:bg-muted/20 transition-colors'>
                    <td className='py-3.5 px-3 text-center font-mono font-medium text-muted-foreground whitespace-nowrap'>
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className='py-3.5 px-4 font-bold text-foreground whitespace-nowrap'>
                      <div className='flex items-center gap-2'>
                        <div className='size-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[10px]'>
                          {row.code}
                        </div>
                        <div>
                          <p>{row.name}</p>
                          <span className='text-[10px] text-muted-foreground font-normal'>
                            {row.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className='py-3.5 px-4 text-muted-foreground whitespace-nowrap'>
                      {row.branchName}
                    </td>
                    <td className='py-3.5 px-4 text-foreground font-medium whitespace-nowrap'>
                      {row.city}
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-bold text-foreground whitespace-nowrap'>
                      {row.employeesCount} org
                    </td>
                    <td className='py-3.5 px-4 text-center whitespace-nowrap'>
                      <span className='inline-flex items-center gap-1 font-mono text-xs px-2.5 py-0.5 rounded-full bg-muted/60 text-foreground'>
                        <IconTarget size={12} className='text-amber-600' />
                        {row.geofenceRadius} m
                      </span>
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
                          title='Edit Lokasi'
                        >
                          <IconEdit size={14} />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDelete(row)}
                          className='size-7 rounded-lg text-muted-foreground hover:text-rose-600'
                          title='Hapus Lokasi'
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
            Total employees assigned across active locations:{' '}
            <span className='font-bold text-foreground font-mono'>
              {totalAssignedEmployees.toLocaleString()}
            </span>
          </p>
        </div>

        <TablePagination
          itemLabel='lokasi kantor'
          totalItems={filteredLocations.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* Detail Dialog */}
      <OfficeLocationDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        location={selectedLocation}
        onEdit={handleOpenEdit}
      />

      {/* Add / Edit Dialog */}
      <OfficeLocationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        locationToEdit={selectedLocation}
      />
    </div>
  )
}
