// src/features/travel-expense/claim/pages/claim-management-page.tsx
import {
  IconChecklist,
  IconHistory,
  IconPlus,
  IconReceipt,
  IconReceiptTax,
  IconSparkles,
} from '@tabler/icons-react'
import { useState } from 'react'
import { ClaimApprovalTab } from '../components/claim-approval-tab'
import { ClaimCreateTab } from '../components/claim-create-tab'
import { ClaimDetailModal } from '../components/claim-detail-modal'
import { ClaimHistoryTab } from '../components/claim-history-tab'
import { ClaimListTab } from '../components/claim-list-tab'
import { ApprovalActionDialog } from '@/shared/components/approval/approval-action-dialog'
import { useApprovalSyncStore } from '@/shared/lib/approval-sync-store'
import type { ClaimRecord } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { snackbar } from '@/shared/lib/snackbar'

export function ClaimManagementPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'approvals' | 'history'>('list')
  const { claims, approve: syncApprove, reject: syncReject, addClaim: syncAddClaim } = useApprovalSyncStore()

  // Modals state
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    claim: ClaimRecord | null
    action: 'approve' | 'reject'
  }>({
    open: false,
    claim: null,
    action: 'approve',
  })

  // Handlers
  const handleViewDetail = (claim: ClaimRecord) => {
    setSelectedClaim(claim)
    setDetailModalOpen(true)
  }

  const handleOpenAction = (claim: ClaimRecord, action: 'approve' | 'reject') => {
    setActionDialog({
      open: true,
      claim,
      action,
    })
  }

  const handleConfirmAction = (note: string) => {
    if (!actionDialog.claim) return
    const claim = actionDialog.claim
    if (actionDialog.action === 'approve') {
      syncApprove(claim.id, note || 'Disetujui dari menu Claim & Reimbursement.')
      snackbar.success('Pengajuan klaim berhasil disetujui!')
    } else {
      syncReject(claim.id, note || 'Ditolak dari menu Claim & Reimbursement.')
      snackbar.error('Pengajuan klaim telah ditolak.')
    }
  }

  const handleCreateSuccess = (newClaim: ClaimRecord) => {
    syncAddClaim(newClaim)
    setActiveTab('list')
    snackbar.success(`Klaim ${newClaim.claimNumber} berhasil diajukan!`)
  }

  const pendingCount = claims.filter((c) => c.status === 'pending').length

  return (
    <div className='p-6 space-y-6 max-w-[1600px] mx-auto w-full'>
      {/* ── Detail & Action Confirmation Dialogs ───────────────────────────── */}
      <ClaimDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        claim={selectedClaim}
        onApprove={(claim) => handleOpenAction(claim, 'approve')}
        onReject={(claim) => handleOpenAction(claim, 'reject')}
      />

      <ApprovalActionDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog((prev) => ({ ...prev, open }))}
        action={actionDialog.action}
        itemName={
          actionDialog.claim
            ? `${actionDialog.claim.claimNumber} - ${actionDialog.claim.employeeName}`
            : undefined
        }
        itemDetail={
          actionDialog.claim
            ? `${actionDialog.claim.categoryLabel} · Rp ${actionDialog.claim.amount.toLocaleString('id-ID')}`
            : undefined
        }
        onConfirm={handleConfirmAction}
      />

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5'>
        <div>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <IconReceiptTax size={22} />
            </div>
            <div>
              <h1 className='text-xl font-bold tracking-tight text-foreground'>
                Expense & Claim Management
              </h1>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Pengajuan reimbursement, scan otomatis struk kwitansi dengan OCR, dan alur persetujuan multi-level.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Buttons */}
        <div className='flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/80 shrink-0 overflow-x-auto'>
          <button
            type='button'
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'list'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconReceipt size={14} />
            Daftar Klaim
          </button>

          <button
            type='button'
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconPlus size={14} />
            Pengajuan Baru
          </button>

          <button
            type='button'
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'approvals'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconChecklist size={14} />
            Persetujuan
            {pendingCount > 0 && (
              <Badge className='size-4 p-0 flex items-center justify-center text-[9px] bg-amber-500 text-white rounded-full'>
                {pendingCount}
              </Badge>
            )}
          </button>

          <button
            type='button'
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconHistory size={14} />
            Riwayat & Laporan
          </button>
        </div>
      </div>

      {/* ── Active Tab View ───────────────────────────────────────────────── */}
      {activeTab === 'list' && (
        <ClaimListTab
          claims={claims}
          onViewDetail={handleViewDetail}
          onApprove={(claim) => handleOpenAction(claim, 'approve')}
          onReject={(claim) => handleOpenAction(claim, 'reject')}
          onCreateClaim={() => setActiveTab('create')}
        />
      )}

      {activeTab === 'create' && (
        <ClaimCreateTab
          onSuccess={handleCreateSuccess}
          onCancel={() => setActiveTab('list')}
        />
      )}

      {activeTab === 'approvals' && (
        <ClaimApprovalTab
          claims={claims}
          onViewDetail={handleViewDetail}
          onApprove={(claim) => handleOpenAction(claim, 'approve')}
          onReject={(claim) => handleOpenAction(claim, 'reject')}
        />
      )}

      {activeTab === 'history' && (
        <ClaimHistoryTab claims={claims} onViewDetail={handleViewDetail} />
      )}
    </div>
  )
}
