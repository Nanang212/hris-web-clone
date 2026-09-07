// src/features/travel-expense/business-trip/pages/business-trip-page.tsx
import {
  IconChecklist,
  IconHistory,
  IconPlaneDeparture,
  IconPlus,
  IconReceipt,
  IconRoute,
} from '@tabler/icons-react'
import { useState } from 'react'
import { RejectTripModal } from '../components/reject-trip-modal'
import { TripApprovalTab } from '../components/trip-approval-tab'
import { TripCreateTab } from '../components/trip-create-tab'
import { TripDetailModal } from '../components/trip-detail-modal'
import { TripExpensesTab } from '../components/trip-expenses-tab'
import { TripHistoryTab } from '../components/trip-history-tab'
import { TripItineraryTab } from '../components/trip-itinerary-tab'
import { TripListTab } from '../components/trip-list-tab'
import { ApprovalActionDialog } from '@/shared/components/approval/approval-action-dialog'
import { useApprovalSyncStore } from '@/shared/lib/approval-sync-store'
import type { BusinessTripRecord, TripExpenseItem, TripItineraryDay } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { snackbar } from '@/shared/lib/snackbar'

export function BusinessTripPage() {
  const [activeTab, setActiveTab] = useState<
    'list' | 'create' | 'approvals' | 'itinerary' | 'expenses' | 'history'
  >('list')
  const { trips, approve: syncApprove, reject: syncReject, addTrip: syncAddTrip } = useApprovalSyncStore()

  // Selected trip for modals / deep views
  const [selectedTrip, setSelectedTrip] = useState<BusinessTripRecord | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    trip: BusinessTripRecord | null
    action: 'approve' | 'reject'
  }>({
    open: false,
    trip: null,
    action: 'approve',
  })

  // Handlers
  const handleViewDetail = (trip: BusinessTripRecord) => {
    setSelectedTrip(trip)
    setDetailModalOpen(true)
  }

  const handleOpenItinerary = (trip: BusinessTripRecord) => {
    setSelectedTrip(trip)
    setActiveTab('itinerary')
  }

  const handleOpenExpenses = (trip: BusinessTripRecord) => {
    setSelectedTrip(trip)
    setActiveTab('expenses')
  }

  const handleOpenAction = (trip: BusinessTripRecord, action: 'approve' | 'reject') => {
    setActionDialog({
      open: true,
      trip,
      action,
    })
  }

  const handleConfirmAction = (note: string) => {
    if (!actionDialog.trip) return
    const trip = actionDialog.trip
    if (actionDialog.action === 'approve') {
      syncApprove(trip.id, note || 'Disetujui dari menu Perjalanan Dinas.')
      snackbar.success('Permohonan perjalanan dinas berhasil disetujui!')
    } else {
      syncReject(trip.id, note || 'Ditolak dari menu Perjalanan Dinas.')
      snackbar.error('Permohonan perjalanan dinas telah ditolak.')
    }
  }

  const handleCreateSuccess = (newTrip: BusinessTripRecord) => {
    syncAddTrip(newTrip)
    setActiveTab('list')
    snackbar.success(`Permohonan dinas ${newTrip.tripNumber} ke ${newTrip.destinationCity} berhasil diajukan!`)
  }

  const handleUpdateItinerary = (tripId: string, updatedDays: TripItineraryDay[]) => {
    // optional dummy update
  }

  const handleUpdateExpenses = (tripId: string, updatedExpenses: TripExpenseItem[]) => {
    // optional dummy update
  }

  const pendingCount = trips.filter((t) => t.status === 'pending').length

  return (
    <div className='p-6 space-y-6 max-w-[1600px] mx-auto w-full'>
      {/* ── Detail & Action Confirmation Dialogs ───────────────────────────── */}
      <TripDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        trip={selectedTrip}
        onApprove={(trip) => handleOpenAction(trip, 'approve')}
        onReject={(trip) => handleOpenAction(trip, 'reject')}
        onOpenItinerary={handleOpenItinerary}
        onOpenExpenses={handleOpenExpenses}
      />

      <ApprovalActionDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog((prev) => ({ ...prev, open }))}
        action={actionDialog.action}
        itemName={
          actionDialog.trip
            ? `${actionDialog.trip.tripNumber} - ${actionDialog.trip.employeeName}`
            : undefined
        }
        itemDetail={
          actionDialog.trip
            ? `${actionDialog.trip.destinationCity} (${actionDialog.trip.startDate}) · Estimasi: Rp ${actionDialog.trip.estimatedBudget.total.toLocaleString('id-ID')}`
            : undefined
        }
        onConfirm={handleConfirmAction}
      />

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5'>
        <div>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <IconPlaneDeparture size={22} />
            </div>
            <div>
              <h1 className='text-xl font-bold tracking-tight text-foreground'>
                Business Trip Management
              </h1>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Pengajuan perjalanan dinas, penyusunan agenda kegiatan (itinerary), uang muka, dan settlement realisasi biaya.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Buttons */}
        <div className='flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/80 shrink-0 overflow-x-auto'>
          <button
            type='button'
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'list'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconPlaneDeparture size={14} />
            Daftar Dinas
          </button>

          <button
            type='button'
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
            onClick={() => setActiveTab('itinerary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'itinerary'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconRoute size={14} />
            Itinerary
          </button>

          <button
            type='button'
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'expenses'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconReceipt size={14} />
            Realisasi Biaya
          </button>

          <button
            type='button'
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconHistory size={14} />
            Riwayat
          </button>
        </div>
      </div>

      {/* ── Active Tab View ───────────────────────────────────────────────── */}
      {activeTab === 'list' && (
        <TripListTab
          trips={trips}
          onViewDetail={handleViewDetail}
          onOpenItinerary={handleOpenItinerary}
          onOpenExpenses={handleOpenExpenses}
          onApprove={(trip) => handleOpenAction(trip, 'approve')}
          onReject={(trip) => handleOpenAction(trip, 'reject')}
          onCreateTrip={() => setActiveTab('create')}
        />
      )}

      {activeTab === 'create' && (
        <TripCreateTab
          onSuccess={handleCreateSuccess}
          onCancel={() => setActiveTab('list')}
        />
      )}

      {activeTab === 'approvals' && (
        <TripApprovalTab
          trips={trips}
          onViewDetail={handleViewDetail}
          onApprove={(trip) => handleOpenAction(trip, 'approve')}
          onReject={(trip) => handleOpenAction(trip, 'reject')}
        />
      )}

      {activeTab === 'itinerary' && (
        <TripItineraryTab
          trips={trips}
          selectedTripId={selectedTrip?.id}
          onUpdateItinerary={handleUpdateItinerary}
        />
      )}

      {activeTab === 'expenses' && (
        <TripExpensesTab
          trips={trips}
          selectedTripId={selectedTrip?.id}
          onUpdateExpenses={handleUpdateExpenses}
        />
      )}

      {activeTab === 'history' && (
        <TripHistoryTab trips={trips} onViewDetail={handleViewDetail} />
      )}
    </div>
  )
}
