// src/features/travel-expense/claim/components/claim-list-tab.tsx
import {
  IconAlertCircle,
  IconCheck,
  IconDotsVertical,
  IconEye,
  IconFileText,
  IconFilter,
  IconPlus,
  IconReceipt,
  IconSearch,
  IconSparkles,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { MOCK_CLAIM_POLICIES } from '../../data/mock-claim-data'
import type { ClaimRecord, ClaimCategory, ClaimStatus } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import { Progress } from '@/shared/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { TablePagination } from '@/shared/components/ui/table-pagination'

interface ClaimListTabProps {
  claims: ClaimRecord[]
  onViewDetail: (claim: ClaimRecord) => void
  onApprove: (claimId: string) => void
  onReject: (claim: ClaimRecord) => void
  onCreateClaim: () => void
}

export function ClaimListTab({
  claims,
  onViewDetail,
  onApprove,
  onReject,
  onCreateClaim,
}: ClaimListTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchSearch =
        claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.employeeNik.toLowerCase().includes(searchQuery.toLowerCase())

      const matchCategory =
        categoryFilter === 'all' || claim.category === categoryFilter
      const matchStatus = statusFilter === 'all' || claim.status === statusFilter

      return matchSearch && matchCategory && matchStatus
    })
  }, [claims, searchQuery, categoryFilter, statusFilter])

  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredClaims.slice(start, start + pageSize)
  }, [filteredClaims, currentPage, pageSize])

  // Top metric counters
  const totalClaimsCount = claims.length
  const pendingCount = claims.filter((c) => c.status === 'pending').length
  const approvedCount = claims.filter((c) => c.status === 'approved' || c.status === 'paid').length
  const rejectedCount = claims.filter((c) => c.status === 'rejected').length

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top Metric Cards ──────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Claims</p>
            <h3 className='text-xl font-bold text-foreground mt-0.5'>{totalClaimsCount}</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Semua Pengajuan</p>
          </div>
          <div className='size-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconReceipt size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Approved & Paid</p>
            <h3 className='text-xl font-bold text-emerald-600 mt-0.5'>{approvedCount}</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Disetujui / Selesai</p>
          </div>
          <div className='size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconCheck size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Pending Review</p>
            <h3 className='text-xl font-bold text-amber-600 mt-0.5'>{pendingCount}</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Perlu Verifikasi</p>
          </div>
          <div className='size-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0'>
            <IconAlertCircle size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Rejected</p>
            <h3 className='text-xl font-bold text-rose-600 mt-0.5'>{rejectedCount}</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Ditolak Kebijakan</p>
          </div>
          <div className='size-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0'>
            <IconX size={20} />
          </div>
        </div>
      </div>

      {/* ── Main Layout: 2 Columns (Left Table + Right Remaining Quota) ────── */}
      <div className='grid grid-cols-1 xl:grid-cols-12 gap-6 items-start'>
        {/* Left Column: Filter Bar & Table (8 cols on XL) */}
        <div className='xl:col-span-8 space-y-4 min-w-0'>
          {/* Action & Filter Toolbar */}
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/80 bg-card'>
            <div className='flex flex-wrap items-center gap-2 flex-1 min-w-0'>
              <div className='relative w-full sm:w-56'>
                <IconSearch
                  size={14}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder='Cari nomor klaim, nama, deskripsi...'
                  className='h-9 pl-9 text-xs bg-background rounded-xl w-full'
                />
              </div>

              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className='h-9 text-xs w-full sm:w-40 rounded-xl bg-background'>
                  <SelectValue placeholder='Kategori' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua Kategori</SelectItem>
                  <SelectItem value='medical'>Medical & Dental</SelectItem>
                  <SelectItem value='transport'>Transport & Taxi</SelectItem>
                  <SelectItem value='meal'>Meal & Entertain</SelectItem>
                  <SelectItem value='accommodation'>Hotel & Lodging</SelectItem>
                  <SelectItem value='office'>Office & Internet</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className='h-9 text-xs w-full sm:w-36 rounded-xl bg-background'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua Status</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='approved'>Approved</SelectItem>
                  <SelectItem value='paid'>Paid</SelectItem>
                  <SelectItem value='rejected'>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              size='sm'
              onClick={onCreateClaim}
              className='rounded-xl h-9 text-xs font-bold gap-1.5 shrink-0 shadow-xs'
            >
              <IconPlus size={15} />
              Ajukan Klaim Baru
            </Button>
          </div>

          {/* Claims Data Table */}
          <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
            <div className='w-full overflow-x-auto pb-1'>
              <table className='w-full min-w-[950px] text-xs text-left border-collapse'>
                <thead>
                  <tr className='border-b border-border/80 bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]'>
                    <th className='py-3.5 px-4 whitespace-nowrap'>Klaim & Karyawan</th>
                    <th className='py-3.5 px-4 whitespace-nowrap'>Kategori & Tanggal</th>
                    <th className='py-3.5 px-4 text-right whitespace-nowrap'>Nominal (IDR)</th>
                    <th className='py-3.5 px-4 text-center whitespace-nowrap'>Status</th>
                    <th className='py-3.5 px-4 text-center whitespace-nowrap'>Bukti</th>
                    <th className='py-3.5 px-4 text-right whitespace-nowrap'>Aksi</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/60'>
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='py-12 text-center text-muted-foreground'>
                        <IconReceipt size={32} className='mx-auto mb-2 opacity-40' />
                        <p className='font-semibold text-xs'>Tidak ada data klaim yang ditemukan</p>
                        <p className='text-[11px] mt-0.5'>Coba ubah kata kunci pencarian atau filter status.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedClaims.map((claim) => (
                      <tr
                        key={claim.id}
                        className='hover:bg-muted/20 transition-colors group cursor-pointer'
                        onClick={() => onViewDetail(claim)}
                      >
                        <td className='py-3.5 px-4'>
                          <div className='flex items-center gap-2.5'>
                            {claim.employeeAvatar ? (
                              <img
                                src={claim.employeeAvatar}
                                alt={claim.employeeName}
                                className='size-8 rounded-lg object-cover border border-border shrink-0'
                              />
                            ) : (
                              <div className='size-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0'>
                                {claim.employeeName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className='min-w-0'>
                              <p className='font-bold text-foreground text-[12px] group-hover:text-primary transition-colors'>
                                {claim.claimNumber}
                              </p>
                              <p className='text-[11px] text-muted-foreground truncate'>
                                {claim.employeeName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className='py-3.5 px-4'>
                          <Badge
                            variant='outline'
                            className='text-[9px] font-semibold border-border/80 bg-muted/40 mb-0.5'
                          >
                            {claim.categoryLabel}
                          </Badge>
                          <p className='text-[11px] text-muted-foreground'>{claim.claimDate}</p>
                        </td>

                        <td className='py-3.5 px-4 text-right font-mono font-bold text-foreground'>
                          {formatIdr(claim.amount)}
                        </td>

                        <td className='py-3.5 px-4 text-center'>
                          <Badge
                            variant='outline'
                            className={`text-[9px] font-bold ${
                              claim.status === 'paid'
                                ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                                : claim.status === 'approved'
                                ? 'border-blue-500/30 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                                : claim.status === 'pending'
                                ? 'border-amber-500/30 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20'
                                : 'border-rose-500/30 text-rose-600 bg-rose-50/50 dark:bg-rose-950/20'
                            }`}
                          >
                            {claim.status === 'paid'
                              ? 'Paid'
                              : claim.status === 'approved'
                              ? 'Approved'
                              : claim.status === 'pending'
                              ? 'Pending'
                              : 'Rejected'}
                          </Badge>
                        </td>

                        <td className='py-3.5 px-4 text-center'>
                          {claim.receiptUrl ? (
                            <span className='inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full'>
                              <IconFileText size={11} />
                              Ada Struk
                            </span>
                          ) : (
                            <span className='text-[10px] text-muted-foreground italic'>-</span>
                          )}
                        </td>

                        <td className='py-3.5 px-4 text-right' onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='size-7 rounded-lg hover:bg-muted'
                              >
                                <IconDotsVertical size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-40 rounded-xl'>
                              <DropdownMenuItem
                                onClick={() => onViewDetail(claim)}
                                className='text-xs font-semibold'
                              >
                                <IconEye size={14} className='mr-2 text-primary' /> Detail Klaim
                              </DropdownMenuItem>

                              {claim.status === 'pending' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onApprove(claim.id)}
                                    className='text-xs font-semibold text-emerald-600'
                                  >
                                    <IconCheck size={14} className='mr-2' /> Setujui
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => onReject(claim)}
                                    className='text-xs font-semibold text-rose-600'
                                  >
                                    <IconX size={14} className='mr-2' /> Tolak
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            <TablePagination
              itemLabel='pengajuan klaim'
              totalItems={filteredClaims.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20]}
            />
          </div>
        </div>

        {/* Right Column: Remaining Quota & Policy Balance (4 cols on XL) */}
        <div className='xl:col-span-4 space-y-4'>
          <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4'>
            <div className='flex items-center justify-between border-b border-border/70 pb-3'>
              <div>
                <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                  Plafon & Sisa Kuota Klaim
                </h4>
                <p className='text-[11px] text-muted-foreground mt-0.5'>Periode Berjalan: April 2024</p>
              </div>
              <Badge variant='outline' className='text-[10px] font-bold text-primary border-primary/30'>
                Auto-Reset Bulanan
              </Badge>
            </div>

            {/* Quota Items List */}
            <div className='space-y-3.5'>
              {MOCK_CLAIM_POLICIES.map((policy, idx) => {
                const percent = Math.min(
                  100,
                  Math.round((policy.spentThisMonth / policy.monthlyLimit) * 100),
                )
                return (
                  <div key={idx} className='space-y-1.5 p-3 rounded-xl border border-border/60 bg-muted/20 text-xs'>
                    <div className='flex items-center justify-between'>
                      <span className='font-bold text-foreground'>{policy.label}</span>
                      <span className='font-mono font-semibold text-[11px] text-muted-foreground'>
                        {percent}% Terpakai
                      </span>
                    </div>

                    <Progress value={percent} className='h-1.5 rounded-full' />

                    <div className='flex items-center justify-between text-[10px] text-muted-foreground pt-0.5'>
                      <span>Terpakai: {formatIdr(policy.spentThisMonth)}</span>
                      <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                        Sisa: {formatIdr(policy.remainingMonthly)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Info Box */}
            <div className='p-3 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-700 dark:text-blue-300 space-y-1'>
              <p className='font-bold flex items-center gap-1.5'>
                <IconSparkles size={14} className='text-blue-600' />
                Kebijakan Reimbursement:
              </p>
              <p className='text-[11px] leading-relaxed'>
                Kwitansi/struk transaksi wajib diunggah maksimal 30 hari kalender setelah tanggal transaksi. Struk di atas Rp 5.000.000 wajib bermaterai 10.000.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
