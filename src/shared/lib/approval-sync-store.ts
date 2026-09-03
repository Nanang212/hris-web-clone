// src/shared/lib/approval-sync-store.ts
// Unified Reactive Approval Synchronization Store for HRIS
// Synchronizes Claim, Business Trip, Leave, Overtime, and Approval Inbox

import { useSyncExternalStore } from 'react'
import type { ApprovalRequest, ApprovalTimelineStep } from '@/features/approval/types'
import { leaveRequests as initialLeaveRequests } from '@/features/leave/components/leave-data'
import type { LeaveRequest } from '@/features/leave/types'
import { MOCK_CLAIMS } from '@/features/travel-expense/data/mock-claim-data'
import { MOCK_BUSINESS_TRIPS } from '@/features/travel-expense/data/mock-trip-data'
import type { BusinessTripRecord, ClaimRecord } from '@/features/travel-expense/types'

const STORAGE_KEY_CLAIMS = 'hris_sync_claims_v1'
const STORAGE_KEY_TRIPS = 'hris_sync_trips_v1'
const STORAGE_KEY_LEAVES = 'hris_sync_leaves_v1'
const STORAGE_KEY_OVERTIME = 'hris_sync_overtime_v1'

const initialOvertimes: ApprovalRequest[] = [
  {
    id: 'req-ot-001',
    employeeName: 'Wahyu Prasetyo',
    employeeAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    department: 'Cloud & Infrastructure',
    position: 'DevOps Engineer',
    requestType: 'overtime',
    requestDate: '2026-04-24',
    details: 'Lembur Hari Kerja — 4 Jam (18:00 - 22:00)',
    status: 'pending',
    currentLevel: 1,
    totalLevels: 2,
    workflowName: 'Overtime Approval Workflow',
    days: 4,
    reason: 'Maintenance server database cluster & upgrade kernel production di luar jam sibuk.',
    timeline: [
      {
        level: 1,
        name: 'Direct Supervisor',
        approverName: 'Rizky Pratama (Anda)',
        status: 'pending',
      },
      {
        level: 2,
        name: 'HR Operations',
        approverName: 'Amanda Putri',
        status: 'waiting',
      },
    ],
  },
  {
    id: 'req-ot-002',
    employeeName: 'Diana Lestari',
    employeeAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    department: 'Brand Marketing',
    position: 'Event Coordinator Lead',
    requestType: 'overtime',
    requestDate: '2026-04-19',
    details: 'Lembur Akhir Pekan — 8 Jam (Sabtu, 20 Apr)',
    status: 'pending',
    currentLevel: 1,
    totalLevels: 2,
    workflowName: 'Overtime Approval Workflow',
    days: 8,
    reason: 'Penyelenggaraan Booth Tech Expo & Workshop di JCC Senayan.',
    timeline: [
      {
        level: 1,
        name: 'Direct Supervisor',
        approverName: 'Dewi Rahayu (Anda)',
        status: 'pending',
      },
      {
        level: 2,
        name: 'HR Operations',
        approverName: 'Amanda Putri',
        status: 'waiting',
      },
    ],
  },
]

// ─── In-Memory Cache with LocalStorage Fallback ────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch {
    // ignore
  }
}

let claimsState: ClaimRecord[] = loadFromStorage(STORAGE_KEY_CLAIMS, MOCK_CLAIMS)
let tripsState: BusinessTripRecord[] = loadFromStorage(STORAGE_KEY_TRIPS, MOCK_BUSINESS_TRIPS)
let leavesState: LeaveRequest[] = loadFromStorage(STORAGE_KEY_LEAVES, initialLeaveRequests)
let overtimesState: ApprovalRequest[] = loadFromStorage(STORAGE_KEY_OVERTIME, initialOvertimes)

// Listeners
type Listener = () => void
const listeners = new Set<Listener>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// ─── Data Helpers ─────────────────────────────────────────────────────────────

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function getLeaveLabel(type: string): string {
  switch (type) {
    case 'annual':
      return 'Cuti Tahunan'
    case 'sick':
      return 'Cuti Sakit'
    case 'personal':
      return 'Izin Pribadi'
    case 'maternity':
      return 'Cuti Melahirkan'
    default:
      return 'Cuti'
  }
}

let cachedApprovals: ApprovalRequest[] | null = null

function invalidateCache() {
  cachedApprovals = null
}

export function getDerivedApprovalRequests(): ApprovalRequest[] {
  if (cachedApprovals) return cachedApprovals

  const result: ApprovalRequest[] = []

  // 1. Business Trips
  tripsState.forEach((trip) => {
    const isApproved =
      trip.status === 'approved' || trip.status === 'on_trip' || trip.status === 'completed'
    const isRejected = trip.status === 'rejected' || trip.status === 'cancelled'

    const timeline: ApprovalTimelineStep[] = trip.approvalFlow.map((step, idx) => ({
      level: idx + 1,
      name: step.role,
      approverName: step.approverName + (idx === 1 ? ' (Anda)' : ''),
      status:
        step.status === 'approved'
          ? 'approved'
          : step.status === 'rejected'
            ? 'rejected'
            : isApproved
              ? 'approved'
              : isRejected
                ? 'rejected'
                : 'pending',
      approvedAt: step.date,
      note: step.notes,
    }))

    result.push({
      id: trip.id,
      employeeName: trip.employeeName,
      employeeAvatar: trip.employeeAvatar,
      department: trip.departmentName,
      position: trip.jobTitle,
      requestType: 'business_trip',
      requestDate: trip.createdAt.slice(0, 10),
      details: `${trip.title} — ${trip.destinationCity} (${trip.totalDays} Hari)`,
      status: isApproved ? 'approved' : isRejected ? 'rejected' : 'pending',
      currentLevel: isApproved ? 3 : isRejected ? 1 : 2,
      totalLevels: trip.approvalFlow.length || 3,
      workflowName: 'Business Trip Approval Workflow',
      days: trip.totalDays,
      amount: trip.estimatedBudget.total,
      advanceMoney: trip.cashAdvanceAmount,
      destination: `${trip.destinationCity}, ${trip.destinationCountry}`,
      travelDates: `${trip.startDate} s.d ${trip.endDate}`,
      transportType:
        trip.flightAirline ||
        (trip.transportType === 'flight' ? 'Pesawat Terbang' : 'Kereta / Transport Darat'),
      reason: trip.purpose,
      attachmentUrl:
        trip.expenses[0]?.receiptUrl ||
        'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      timeline,
    })
  })

  // 2. Claims
  claimsState.forEach((claim) => {
    const isApproved = claim.status === 'approved' || claim.status === 'paid'
    const isRejected = claim.status === 'rejected'

    const timeline: ApprovalTimelineStep[] = claim.approvalFlow.map((step, idx) => ({
      level: idx + 1,
      name: step.role,
      approverName: step.approverName + (idx === 1 ? ' (Anda)' : ''),
      status:
        step.status === 'approved'
          ? 'approved'
          : step.status === 'rejected'
            ? 'rejected'
            : isApproved
              ? 'approved'
              : isRejected
                ? 'rejected'
                : 'pending',
      approvedAt: step.date,
      note: step.notes,
    }))

    result.push({
      id: claim.id,
      employeeName: claim.employeeName,
      employeeAvatar: claim.employeeAvatar,
      department: claim.departmentName,
      position: 'Team Member',
      requestType: 'claim',
      requestDate: claim.claimDate,
      details: `${claim.categoryLabel} — ${formatIDR(claim.amount)}`,
      status: isApproved ? 'approved' : isRejected ? 'rejected' : 'pending',
      currentLevel: isApproved ? 3 : isRejected ? 1 : 2,
      totalLevels: claim.approvalFlow.length || 3,
      workflowName: 'Claim & Reimbursement Approval',
      amount: claim.amount,
      reason: claim.description,
      attachmentUrl: claim.receiptUrl,
      categoryLabel: claim.categoryLabel,
      costCenter: claim.costCenter,
      paymentMethod: claim.paymentMethod,
      bankAccount: claim.bankAccount,
      timeline,
    })
  })

  // 3. Leaves
  leavesState.forEach((leave) => {
    const isApproved = leave.status === 'approved'
    const isRejected = leave.status === 'rejected'

    const dept = leave.employeeRole.split('·')[1]?.trim() || 'General'
    const pos = leave.employeeRole.split('·')[0]?.trim() || 'Staff'

    const timeline: ApprovalTimelineStep[] = [
      {
        level: 1,
        name: 'Direct Line Manager',
        approverName: 'Manager Tim',
        status: 'approved',
        approvedAt: leave.submittedAt.slice(0, 10) + ' 09:00',
        note: 'Disetujui untuk delegasi pekerjaan.',
      },
      {
        level: 2,
        name: 'Department Head',
        approverName: 'Dewi Rahayu (Anda)',
        status: isApproved ? 'approved' : isRejected ? 'rejected' : 'pending',
        approvedAt: isApproved ? leave.submittedAt.slice(0, 10) + ' 10:30' : undefined,
        note: isApproved ? 'Disetujui.' : isRejected ? 'Ditolak karena overlap agenda.' : undefined,
      },
      {
        level: 3,
        name: 'HR Operations',
        approverName: 'Amanda Putri',
        status: isApproved ? 'approved' : isRejected ? 'rejected' : 'waiting',
      },
    ]

    result.push({
      id: leave.id,
      employeeName: leave.employee,
      department: dept,
      position: pos,
      requestType: 'leave',
      requestDate: leave.submittedAt.slice(0, 10),
      details: `${getLeaveLabel(leave.leaveType)} — ${leave.duration} Hari (${leave.startDate} s.d ${leave.endDate})`,
      status: leave.status,
      currentLevel: isApproved ? 3 : isRejected ? 2 : 2,
      totalLevels: 3,
      workflowName: 'Leave Approval Workflow',
      days: parseInt(leave.duration) || 1,
      reason: leave.reason,
      attachmentUrl:
        leave.leaveType === 'sick'
          ? 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80'
          : undefined,
      timeline,
    })
  })

  // 4. Overtime
  overtimesState.forEach((ot) => {
    result.push(ot)
  })

  cachedApprovals = result
  return cachedApprovals
}

// ─── Actions & Sync Operations ────────────────────────────────────────────────

const nowStr = () => new Date().toISOString().slice(0, 16).replace('T', ' ')

export const approvalSyncStore = {
  // Getters
  getClaims: () => claimsState,
  getTrips: () => tripsState,
  getLeaves: () => leavesState,
  getOvertimes: () => overtimesState,
  getApprovals: () => getDerivedApprovalRequests(),

  // Approve Any Item by ID
  approveItem: (id: string, note = 'Disetujui.') => {
    invalidateCache()
    // 1. Check Claims
    const claimIdx = claimsState.findIndex((c) => c.id === id)
    if (claimIdx !== -1) {
      claimsState = claimsState.map((c, i) =>
        i === claimIdx
          ? {
              ...c,
              status: 'approved',
              approvalFlow: c.approvalFlow.map((step) => ({
                ...step,
                status: 'approved',
                date: step.date || nowStr(),
                notes: step.notes || note,
              })),
            }
          : c,
      )
      saveToStorage(STORAGE_KEY_CLAIMS, claimsState)
      notifyListeners()
      return
    }

    // 2. Check Trips
    const tripIdx = tripsState.findIndex((t) => t.id === id)
    if (tripIdx !== -1) {
      tripsState = tripsState.map((t, i) =>
        i === tripIdx
          ? {
              ...t,
              status: 'approved',
              approvalFlow: t.approvalFlow.map((step) => ({
                ...step,
                status: 'approved',
                date: step.date || nowStr(),
                notes: step.notes || note,
              })),
            }
          : t,
      )
      saveToStorage(STORAGE_KEY_TRIPS, tripsState)
      notifyListeners()
      return
    }

    // 3. Check Leaves
    const leaveIdx = leavesState.findIndex((l) => l.id === id)
    if (leaveIdx !== -1) {
      leavesState = leavesState.map((l, i) =>
        i === leaveIdx
          ? {
              ...l,
              status: 'approved',
            }
          : l,
      )
      saveToStorage(STORAGE_KEY_LEAVES, leavesState)
      notifyListeners()
      return
    }

    // 4. Check Overtimes
    const otIdx = overtimesState.findIndex((o) => o.id === id)
    if (otIdx !== -1) {
      overtimesState = overtimesState.map((o, i) =>
        i === otIdx
          ? {
              ...o,
              status: 'approved',
              currentLevel: o.totalLevels,
              timeline: o.timeline.map((step) => ({
                ...step,
                status: 'approved',
                approvedAt: step.approvedAt || nowStr(),
                note: step.note || note,
              })),
            }
          : o,
      )
      saveToStorage(STORAGE_KEY_OVERTIME, overtimesState)
      notifyListeners()
      return
    }
  },

  // Reject Any Item by ID
  rejectItem: (id: string, note = 'Ditolak.') => {
    invalidateCache()
    // 1. Check Claims
    const claimIdx = claimsState.findIndex((c) => c.id === id)
    if (claimIdx !== -1) {
      claimsState = claimsState.map((c, i) =>
        i === claimIdx
          ? {
              ...c,
              status: 'rejected',
              rejectionReason: note,
              approvalFlow: c.approvalFlow.map((step) =>
                step.status === 'pending'
                  ? {
                      ...step,
                      status: 'rejected',
                      notes: note,
                      date: nowStr(),
                    }
                  : step,
              ),
            }
          : c,
      )
      saveToStorage(STORAGE_KEY_CLAIMS, claimsState)
      notifyListeners()
      return
    }

    // 2. Check Trips
    const tripIdx = tripsState.findIndex((t) => t.id === id)
    if (tripIdx !== -1) {
      tripsState = tripsState.map((t, i) =>
        i === tripIdx
          ? {
              ...t,
              status: 'rejected',
              approvalFlow: t.approvalFlow.map((step) =>
                step.status === 'pending'
                  ? {
                      ...step,
                      status: 'rejected',
                      notes: note,
                      date: nowStr(),
                    }
                  : step,
              ),
            }
          : t,
      )
      saveToStorage(STORAGE_KEY_TRIPS, tripsState)
      notifyListeners()
      return
    }

    // 3. Check Leaves
    const leaveIdx = leavesState.findIndex((l) => l.id === id)
    if (leaveIdx !== -1) {
      leavesState = leavesState.map((l, i) =>
        i === leaveIdx
          ? {
              ...l,
              status: 'rejected',
            }
          : l,
      )
      saveToStorage(STORAGE_KEY_LEAVES, leavesState)
      notifyListeners()
      return
    }

    // 4. Check Overtimes
    const otIdx = overtimesState.findIndex((o) => o.id === id)
    if (otIdx !== -1) {
      overtimesState = overtimesState.map((o, i) =>
        i === otIdx
          ? {
              ...o,
              status: 'rejected',
              timeline: o.timeline.map((step) =>
                step.status === 'pending'
                  ? {
                      ...step,
                      status: 'rejected',
                      note,
                    }
                  : step,
              ),
            }
          : o,
      )
      saveToStorage(STORAGE_KEY_OVERTIME, overtimesState)
      notifyListeners()
      return
    }
  },

  // Create new claim
  addClaim: (claim: ClaimRecord) => {
    invalidateCache()
    claimsState = [claim, ...claimsState]
    saveToStorage(STORAGE_KEY_CLAIMS, claimsState)
    notifyListeners()
  },

  // Create new trip
  addTrip: (trip: BusinessTripRecord) => {
    invalidateCache()
    tripsState = [trip, ...tripsState]
    saveToStorage(STORAGE_KEY_TRIPS, tripsState)
    notifyListeners()
  },

  // Create new leave
  addLeave: (leave: LeaveRequest) => {
    invalidateCache()
    leavesState = [leave, ...leavesState]
    saveToStorage(STORAGE_KEY_LEAVES, leavesState)
    notifyListeners()
  },

  // Reset to initial dummy data
  resetAll: () => {
    invalidateCache()
    claimsState = [...MOCK_CLAIMS]
    tripsState = [...MOCK_BUSINESS_TRIPS]
    leavesState = [...initialLeaveRequests]
    overtimesState = [...initialOvertimes]
    saveToStorage(STORAGE_KEY_CLAIMS, claimsState)
    saveToStorage(STORAGE_KEY_TRIPS, tripsState)
    saveToStorage(STORAGE_KEY_LEAVES, leavesState)
    saveToStorage(STORAGE_KEY_OVERTIME, overtimesState)
    notifyListeners()
  },

  subscribe,
}

// ─── React Hook for React Components ──────────────────────────────────────────

export function useApprovalSyncStore() {
  const approvals = useSyncExternalStore(
    approvalSyncStore.subscribe,
    approvalSyncStore.getApprovals,
    approvalSyncStore.getApprovals,
  )

  const claims = useSyncExternalStore(
    approvalSyncStore.subscribe,
    approvalSyncStore.getClaims,
    approvalSyncStore.getClaims,
  )

  const trips = useSyncExternalStore(
    approvalSyncStore.subscribe,
    approvalSyncStore.getTrips,
    approvalSyncStore.getTrips,
  )

  const leaves = useSyncExternalStore(
    approvalSyncStore.subscribe,
    approvalSyncStore.getLeaves,
    approvalSyncStore.getLeaves,
  )

  return {
    approvals,
    claims,
    trips,
    leaves,
    approve: approvalSyncStore.approveItem,
    reject: approvalSyncStore.rejectItem,
    addClaim: approvalSyncStore.addClaim,
    addTrip: approvalSyncStore.addTrip,
    addLeave: approvalSyncStore.addLeave,
    resetAll: approvalSyncStore.resetAll,
  }
}
