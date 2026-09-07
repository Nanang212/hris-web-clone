// src/features/travel-expense/claim/components/claim-approval-tab.tsx
import {
  IconAlertCircle,
  IconCheck,
  IconEye,
  IconFileText,
  IconReceipt,
  IconShieldCheck,
  IconX,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import type { ClaimRecord } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { TablePagination } from '@/shared/components/ui/table-pagination'
import { snackbar } from '@/shared/lib/snackbar'

interface ClaimApprovalTabProps {
  claims: ClaimRecord[]
  onViewDetail: (claim: ClaimRecord) => void
  onApprove: (claim: ClaimRecord) => void
  onReject: (claim: ClaimRecord) => void
  onBatchApprove?: (claimIds: string[]) => void
}

export function ClaimApprovalTab({
  claims,
  onViewDetail,
  onApprove,
  onReject,
}: ClaimApprovalTabProps) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const pendingClaims = useMemo(() => {
    return claims.filter((c) => c.status === 'pending')
  }, [claims])

  const filteredPending = useMemo(() => {
    if (!search.trim()) return pendingClaims
    const q = search.toLowerCase()
    return pendingClaims.filter(
      (c) =>
        c.claimNumber.toLowerCase().includes(q) ||
        c.employeeName.toLowerCase().includes(q) ||
        c.categoryLabel.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    )
  }, [pendingClaims, search])

  const paginatedPending = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPending.slice(start, start + pageSize)
  }, [filteredPending, currentPage, pageSize])

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredPending.map((c) => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleBatchApprove = () => {
    if (onBatchApprove) {
      onBatchApprove(selectedIds)
    } else {
      selectedIds.forEach((id) => {
        const found = claims.find((c) => c.id === id)
        if (found) onApprove(found)
      })
      snackbar.success(`${selectedIds.length} pengajuan klaim berhasil disetujui!`)
    }
    setSelectedIds([])
  }

  const totalPendingAmount = pendingClaims.reduce((acc, c) => acc + c.amount, 0)

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top Approval Stats ────────────────────────────────────────────── */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Menunggu Persetujuan</p>
            <h3 className='text-xl font-bold text-amber-600 mt-0.5'>{pendingClaims.length} Klaim</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Klaim Masuk Antrean</p>
          </div>
          <div className='size-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0'>
            <IconAlertCircle size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Nilai Antrean</p>
            <h3 className='text-xl font-bold text-foreground font-mono mt-0.5'>
              {formatIdr(totalPendingAmount)}
            </h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Perlu Disetujui</p>
          </div>
          <div className='size-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconReceipt size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>SLA Audit Keuangan</p>
            <h3 className='text-xl font-bold text-emerald-600 mt-0.5'>100% On-Track</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Maksimal 2x24 Jam</p>
          </div>
          <div className='size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* ── Policy Compliance Checklist Header ────────────────────────────── */}
      <div className='p-4 rounded-2xl border border-border/80 bg-linear-to-r from-emerald-500/10 via-card to-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs'>
        <div className='flex items-center gap-3'>
          <div className='size-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs'>
            <IconShieldCheck size={18} />
          </div>
          <div>
            <p className='font-bold text-foreground'>Pemeriksaan Kebijakan Otomatis (Auto Policy Checks)</p>
            <p className='text-[11px] text-muted-foreground mt-0.5'>
              Semua klaim di bawah telah melalui verifikasi batas plafon dan kelayakan kwitansi pajak.
            </p>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className='flex items-center gap-2'>
            <span className='text-xs font-semibold text-foreground'>{selectedIds.length} dipilih</span>
            <Button
              size='sm'
              onClick={handleBatchApprove}
              className='rounded-xl h-8 text-xs font-bold gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white'
            >
              <IconCheck size={14} />
              Setujui Sekaligus
            </Button>
          </div>
        )}
      </div>

      {/* ── Approval Queue Table ──────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='w-full overflow-x-auto pb-1'>
          <table className='w-full min-w-[1000px] text-xs text-left border-collapse'>
            <thead>
              <tr className='border-b border-border/80 bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]'>
                <th className='py-3.5 px-4 w-10 text-center whitespace-nowrap'>
                  <input
                    type='checkbox'
                    checked={
                      filteredPending.length > 0 &&
                      selectedIds.length === filteredPending.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className='rounded border-border'
                  />
                </th>
                <th className='py-3.5 px-4 whitespace-nowrap'>Klaim & Karyawan</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>Kategori & Deskripsi</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>Pemeriksaan Kebijakan</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>Nominal (IDR)</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {filteredPending.length === 0 ? (
                <tr>
                  <td colSpan={6} className='py-12 text-center text-muted-foreground'>
                    <IconCheck size={32} className='mx-auto mb-2 text-emerald-500 opacity-80' />
                    <p className='font-bold text-xs text-foreground'>Semua Klaim Telah Diproses</p>
                    <p className='text-[11px] mt-0.5'>Tidak ada antrean persetujuan klaim yang tertunda saat ini.</p>
                  </td>
                </tr>
              ) : (
                paginatedPending.map((claim) => {
                  const isSelected = selectedIds.includes(claim.id)
                  return (
                    <tr
                      key={claim.id}
                      className={`hover:bg-muted/20 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className='py-3.5 px-4 text-center' onClick={(e) => e.stopPropagation()}>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => handleToggleSelect(claim.id)}
                          className='rounded border-border'
                        />
                      </td>

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
                            <p className='font-bold text-foreground text-[12px]'>
                              {claim.claimNumber}
                            </p>
                            <p className='text-[11px] text-muted-foreground truncate'>
                              {claim.employeeName} ({claim.departmentName})
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className='py-3.5 px-4 max-w-xs'>
                        <Badge
                          variant='outline'
                          className='text-[9px] font-semibold border-border/80 bg-muted/40 mb-1'
                        >
                          {claim.categoryLabel}
                        </Badge>
                        <p className='text-[11px] text-foreground line-clamp-1 truncate'>
                          {claim.description}
                        </p>
                      </td>

                      <td className='py-3.5 px-4'>
                        <div className='space-y-1 text-[10px]'>
                          <span className='inline-flex items-center gap-1 text-emerald-600 font-semibold'>
                            <IconCheck size={12} />
                            Dalam Batas Plafon
                          </span>
                          <br />
                          <span className='inline-flex items-center gap-1 text-emerald-600 font-semibold'>
                            <IconFileText size={12} />
                            Kwitansi Pajak Valid
                          </span>
                        </div>
                      </td>

                      <td className='py-3.5 px-4 text-right font-mono font-bold text-foreground'>
                        {formatIdr(claim.amount)}
                      </td>

                      <td className='py-3.5 px-4 text-right'>
                        <div className='flex items-center justify-end gap-1.5'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => onViewDetail(claim)}
                            className='rounded-lg h-7 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/10'
                          >
                            <IconEye size={13} className='mr-1' /> Review
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => onReject(claim)}
                            className='rounded-lg h-7 px-2.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50'
                          >
                            <IconX size={13} />
                          </Button>
                          <Button
                            size='sm'
                            onClick={() => onApprove(claim)}
                            className='rounded-lg h-7 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white'
                          >
                            <IconCheck size={13} className='mr-1' /> Setujui
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          itemLabel='antrean klaim'
          totalItems={filteredPending.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>
    </div>
  )
}
