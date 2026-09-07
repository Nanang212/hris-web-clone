import {
  IconBuilding,
  IconChevronLeft,
  IconChevronRight,
  IconGitBranch,
  IconMail,
  IconMapPin,
  IconSearch,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { getEmployeesForBranch } from '../data/mock-employees'
import type { CompanyBranch } from '../types'
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
import { Input } from '@/shared/components/ui/input'

interface BranchDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch: CompanyBranch | null
}

export function BranchDetailDialog({
  open,
  onOpenChange,
  branch,
}: BranchDetailDialogProps) {
  const [empSearch, setEmpSearch] = useState('')
  const [empPage, setEmpPage] = useState(1)
  const pageSize = 10

  // Get employee list matching the exact branch employeesCount
  const allEmployees = useMemo(() => {
    if (!branch) return []
    return getEmployeesForBranch(branch.code, branch.employeesCount)
  }, [branch])

  const filteredEmployees = useMemo(() => {
    if (!empSearch.trim()) return allEmployees
    const q = empSearch.toLowerCase()
    return allEmployees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.empCode.toLowerCase().includes(q),
    )
  }, [allEmployees, empSearch])

  const totalEmpPages = Math.ceil(filteredEmployees.length / pageSize) || 1
  const paginatedEmployees = useMemo(() => {
    const start = (empPage - 1) * pageSize
    return filteredEmployees.slice(start, start + pageSize)
  }, [filteredEmployees, empPage, pageSize])

  const handleSearchChange = (val: string) => {
    setEmpSearch(val)
    setEmpPage(1)
  }

  if (!branch) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[560px] p-0 rounded-3xl overflow-hidden border-border/80'>
        {/* Header with extra padding-right (pr-14) so close button doesn't collide */}
        <div className='p-6 pr-14 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background border-b border-border/80'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3 min-w-0'>
              <div className='size-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs font-bold'>
                <IconGitBranch size={24} />
              </div>
              <div className='min-w-0'>
                <DialogTitle className='text-base font-bold text-foreground truncate'>
                  {branch.name}
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                  Kode Cabang: {branch.code} · {branch.city}
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant='outline'
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase shrink-0 ${
                branch.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-muted text-muted-foreground border-border/80'
              }`}
            >
              {branch.status}
            </Badge>
          </div>
        </div>

        {/* Content Body */}
        <div className='p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto'>
          {/* Main Info Grid */}
          <div className='grid grid-cols-2 gap-3.5 p-4 rounded-2xl bg-muted/30 border border-border/70'>
            <div>
              <span className='text-muted-foreground text-[11px] block font-medium'>
                Tipe Cabang
              </span>
              <p className='font-bold text-foreground mt-0.5'>{branch.type}</p>
            </div>
            <div>
              <span className='text-muted-foreground text-[11px] block font-medium'>
                Kota / Wilayah
              </span>
              <p className='font-bold text-foreground mt-0.5'>{branch.city}</p>
            </div>
            <div>
              <span className='text-muted-foreground text-[11px] block font-medium'>
                Kantor Terhubung
              </span>
              <p className='font-bold text-foreground mt-0.5'>{branch.linkedOffice}</p>
            </div>
            <div>
              <span className='text-muted-foreground text-[11px] block font-medium'>
                Total Karyawan
              </span>
              <p className='font-bold text-foreground mt-0.5 font-mono text-emerald-600'>
                {branch.employeesCount} orang
              </p>
            </div>
          </div>

          {/* PIC Section */}
          <div className='p-4 rounded-2xl border border-border/70 bg-card space-y-2'>
            <span className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider block'>
              Kepala Cabang / Person in Charge (PIC)
            </span>
            <div className='flex items-center gap-3 pt-1'>
              <div className='size-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm'>
                {branch.picName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className='font-bold text-foreground text-xs'>{branch.picName}</p>
                <div className='flex items-center gap-1.5 text-muted-foreground text-[11px] mt-0.5'>
                  <IconMail size={12} />
                  <span>{branch.picEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Assigned Employees Section ──────────────────────────────── */}
          <div className='p-4 rounded-2xl bg-card border border-border/80 space-y-3'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <div className='size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold'>
                  <IconUsers size={15} />
                </div>
                <div>
                  <h4 className='font-bold text-foreground text-xs'>Daftar Karyawan di Cabang Ini</h4>
                  <p className='text-[10px] text-muted-foreground'>
                    Karyawan yang terdaftar di {branch.name}
                  </p>
                </div>
              </div>
              <Badge
                variant='outline'
                className='font-mono font-bold text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-300 shrink-0'
              >
                Total: {allEmployees.length} Karyawan
              </Badge>
            </div>

            {/* Mini Search Input */}
            <div className='relative'>
              <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
              <Input
                value={empSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder='Cari nama, NIP, jabatan, atau divisi karyawan...'
                className='h-8 pl-8 text-[11px] rounded-xl bg-muted/20'
              />
            </div>

            {/* Scrollable Employee List */}
            <div className='divide-y divide-border/60 max-h-56 overflow-y-auto rounded-xl border border-border/70 bg-muted/10'>
              {filteredEmployees.length === 0 ? (
                <div className='py-6 text-center text-muted-foreground italic text-[11px]'>
                  Tidak ada karyawan yang sesuai kata kunci pencarian.
                </div>
              ) : (
                paginatedEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className='flex items-center justify-between p-2.5 hover:bg-muted/30 transition-colors'
                  >
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <div className='size-8 rounded-full bg-emerald-500/15 text-emerald-700 font-bold flex items-center justify-center text-[11px] shrink-0 border border-emerald-500/20'>
                        {emp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className='min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <p className='font-bold text-foreground text-[11px] truncate'>{emp.name}</p>
                          <span className='font-mono text-[9px] text-muted-foreground'>
                            ({emp.empCode})
                          </span>
                        </div>
                        <p className='text-[10px] text-muted-foreground truncate'>
                          {emp.position} · <span className='text-foreground font-medium'>{emp.department}</span>
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 shrink-0 ml-2'>
                      <Badge
                        variant='outline'
                        className={`text-[9px] px-1.5 py-0 font-bold rounded-md ${
                          emp.contractType === 'PKWTT'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : emp.contractType === 'PKWT'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {emp.contractType}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mini Employee Pagination Toolbar */}
            {filteredEmployees.length > pageSize && (
              <div className='flex items-center justify-between pt-1 text-[10px] text-muted-foreground'>
                <span>
                  Menampilkan {(empPage - 1) * pageSize + 1}-
                  {Math.min(empPage * pageSize, filteredEmployees.length)} dari{' '}
                  <strong className='text-foreground font-mono font-bold'>{filteredEmployees.length}</strong> karyawan
                </span>
                <div className='flex items-center gap-1'>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    disabled={empPage <= 1}
                    onClick={() => setEmpPage((p) => Math.max(1, p - 1))}
                    className='size-6 rounded-md'
                  >
                    <IconChevronLeft size={12} />
                  </Button>
                  <span className='px-1.5 font-mono font-medium'>
                    {empPage} / {totalEmpPages}
                  </span>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    disabled={empPage >= totalEmpPages}
                    onClick={() => setEmpPage((p) => Math.min(totalEmpPages, p + 1))}
                    className='size-6 rounded-md'
                  >
                    <IconChevronRight size={12} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer (Only Tutup button for read-only detail) */}
        <DialogFooter className='p-4 px-6 border-t border-border/80 bg-muted/10 flex items-center justify-end'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='rounded-xl h-9 text-xs px-5'
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
