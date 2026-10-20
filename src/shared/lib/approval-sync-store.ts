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
import type { OvertimeWorkOrder } from '@/features/report/types'
import type { OvertimeRequest } from '@/features/overtime/types'

const STORAGE_KEY_CLAIMS = 'hris_sync_claims_v1'
const STORAGE_KEY_TRIPS = 'hris_sync_trips_v1'
const STORAGE_KEY_LEAVES = 'hris_sync_leaves_v1'
const STORAGE_KEY_OVERTIME = 'hris_sync_overtime_v2'
const STORAGE_KEY_TIMESHEET = 'hris_sync_timesheets_v2'
const STORAGE_KEY_SPKL = 'hris_sync_spkl_orders_v2'
const STORAGE_KEY_OVERTIME_LIST = 'hris_sync_overtime_list_v2'

const initialTimesheets: ApprovalRequest[] = [
  {
    id: 'req-ts-ATT-000',
    employeeName: 'Yosep Fendi Seda',
    employeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    department: 'Operations & Logistics',
    position: 'Security Officer',
    requestType: 'timesheet',
    requestDate: '2026-08-31',
    details: 'Timesheet & Form Absensi Agustus 2026 (22 Hadir, 89 Jam Lembur)',
    status: 'pending',
    currentLevel: 1,
    totalLevels: 2,
    workflowName: 'Timesheet & Presensi Bulanan',
    days: 31,
    reason: 'Pengajuan Form Absensi Harian, Rekap Lembur (89 Jam), dan Form SPKL Proyek AFT Tambolaka.',
    timeline: [
      {
        level: 1,
        name: 'Head of Department',
        approverName: 'Oktavianus Taufan Juwa (HO AFT Tambolaka)',
        status: 'pending',
      },
      {
        level: 2,
        name: 'Head of Division / Direktur',
        approverName: 'Joko Priyambodo (Direktur Pemasaran & Operasi)',
        status: 'waiting',
      },
    ],
  },
  {
    id: 'req-ts-ATT-001',
    employeeName: 'Ahmad Fauzi',
    employeeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    department: 'Engineering & Technology',
    position: 'Field Operator',
    requestType: 'timesheet',
    requestDate: '2026-08-28',
    details: 'Timesheet & Form Absensi Agustus 2026 (22 Hadir, 14.5 Jam Lembur)',
    status: 'pending',
    currentLevel: 2,
    totalLevels: 2,
    workflowName: 'Timesheet & Presensi Bulanan',
    days: 31,
    reason: 'Presensi Bulanan & Tugas Operasional TBBM Plumpang.',
    timeline: [
      {
        level: 1,
        name: 'Head of Department',
        approverName: 'Rizky Pratama, S.Kom.',
        status: 'approved',
        approvedAt: '2026-08-29 10:15',
        note: 'ACC Head Departemen: Log absensi & lembur valid.',
      },
      {
        level: 2,
        name: 'Head of Division / VP',
        approverName: 'Ir. Budi Wicaksono, M.Sc.',
        status: 'pending',
      },
    ],
  },
  {
    id: 'req-ts-ATT-002',
    employeeName: 'Siti Rahmawati',
    employeeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    department: 'Human Resources & GA',
    position: 'HR Operations Lead',
    requestType: 'timesheet',
    requestDate: '2026-08-30',
    details: 'Timesheet & Form Absensi Agustus 2026 (21 Hadir, 1 Sakit, 6 Jam Lembur)',
    status: 'approved',
    currentLevel: 2,
    totalLevels: 2,
    workflowName: 'Timesheet & Presensi Bulanan',
    days: 31,
    reason: 'Pengajuan Absensi Bulanan dengan Surat Keterangan Dokter (Dispensasi 1 Hari).',
    timeline: [
      {
        level: 1,
        name: 'Head of Department',
        approverName: 'Amanda Putri, S.Psi.',
        status: 'approved',
        approvedAt: '2026-08-31 09:00',
        note: 'ACC: Surat keterangan sakit terverifikasi klinik.',
      },
      {
        level: 2,
        name: 'Head of Division / VP',
        approverName: 'Sarah Melati, S.Psi., M.M.',
        status: 'approved',
        approvedAt: '2026-08-31 16:30',
        note: 'Disetujui penuh oleh VP People & Culture.',
      },
    ],
  },
]

const initialOvertimes: ApprovalRequest[] = [
  {
    id: 'OT-2026-0081',
    employeeName: 'Budi Santoso',
    employeeAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    department: 'Engineering & Maintenance',
    position: 'Field Technician',
    requestType: 'overtime',
    requestDate: '2026-08-15',
    details: 'Lembur Hari Libur — 3.5 Jam (18:00–21:30)',
    status: 'pending',
    currentLevel: 1,
    totalLevels: 2,
    workflowName: 'Overtime Approval Workflow',
    days: 3.5,
    reason: 'Perbaikan genset darurat dan pompa avtur TBBM.',
    timeline: [
      {
        level: 1,
        name: 'Direct Supervisor',
        approverName: 'Rizky Pratama (Anda)',
        status: 'pending',
      },
      {
        level: 2,
        name: 'Head of Department',
        approverName: 'Ir. Budi Wicaksono',
        status: 'waiting',
      },
    ],
  },
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
  {
    id: 'OT-2026-0080',
    employeeName: 'Dewi Lestari',
    employeeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    department: 'Finance & Accounting',
    position: 'Accountant',
    requestType: 'overtime',
    requestDate: '2026-08-14',
    details: 'Lembur Closing Bulanan — 2 Jam (18:00–20:00)',
    status: 'approved',
    currentLevel: 2,
    totalLevels: 2,
    workflowName: 'Overtime Approval Workflow',
    days: 2,
    reason: 'Rekonsiliasi invoice vendor dan penutupan buku akhir bulan.',
    timeline: [
      {
        level: 1,
        name: 'Direct Supervisor',
        approverName: 'Cindy Claudia',
        status: 'approved',
        approvedAt: '2026-08-14 20:30',
        note: 'Disetujui untuk closing bulanan.',
      },
      {
        level: 2,
        name: 'Head of Division',
        approverName: 'Hendra Setiawan',
        status: 'approved',
        approvedAt: '2026-08-15 08:30',
        note: 'Approved.',
      },
    ],
  },
  {
    id: 'OT-2026-0079',
    employeeName: 'Andi Pratama',
    employeeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    department: 'Operations',
    position: 'Operator Lapangan',
    requestType: 'overtime',
    requestDate: '2026-08-13',
    details: 'Lembur Bongkar Muat — 3 Jam (19:00–22:00)',
    status: 'approved',
    currentLevel: 2,
    totalLevels: 2,
    workflowName: 'Overtime Approval Workflow',
    days: 3,
    reason: 'Penerimaan kargo logistik kapal tanker.',
    timeline: [
      {
        level: 1,
        name: 'Direct Supervisor',
        approverName: 'Oktavianus Taufan Juwa',
        status: 'approved',
        approvedAt: '2026-08-13 22:15',
        note: 'Disetujui.',
      },
    ],
  },
  {
    id: 'OT-2026-0078',
    employeeName: 'Rina Ayu',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    department: 'Human Resources',
    position: 'Talent Acquisition Staff',
    requestType: 'overtime',
    requestDate: '2026-08-12',
    details: 'Lembur Screening Kandidat — 2 Jam (18:30–20:30)',
    status: 'rejected',
    currentLevel: 1,
    totalLevels: 2,
    workflowName: 'Overtime Approval Workflow',
    days: 2,
    reason: 'Interview online batch MT.',
    timeline: [
      {
        level: 1,
        name: 'Direct Supervisor',
        approverName: 'Amanda Putri',
        status: 'rejected',
        approvedAt: '2026-08-12 19:00',
        note: 'Ditolak: Kegiatan interview dialihkan ke hari kerja reguler.',
      },
    ],
  },
]

const initialSpklOrders: OvertimeWorkOrder[] = [
  {
    id: 'SPKL-ATT-001-01',
    orderNumber: 'SPKL/BFP-PLP/VIII/2026/001',
    employeeName: 'Ahmad Fauzi',
    employeeId: 'ATT-001',
    nip: '20261600101',
    position: 'Field Operator',
    department: 'Engineering & Technology',
    location: 'Depot TBBM Plumpang',
    periodLabel: '2026-08-01 s.d. 2026-08-31',
    date: '14/08/2026',
    eventDescription: 'Operasional Tambahan & Percepatan Proyek',
    taskDescription: 'PENGAMANAN SHIFT MALAM & MONITORING PIPA',
    isHoliday: false,
    startTime: '17:00',
    endTime: '21:00',
    actualStartTime: '17:00',
    actualEndTime: '21:00',
    totalHours: 4,
    approvedBy: 'Rizky Pratama, S.Kom.',
    approverTitle: 'Head of Software Engineering',
    approvedAt: '14 Agustus 2026 21:15 WIB',
  },
  {
    id: 'SPKL-ATT-000-01',
    orderNumber: 'SPKL/BFP-AFT/VIII/2026/001',
    employeeName: 'Yosep Fendi Seda',
    employeeId: 'ATT-000',
    nip: '20261600475',
    position: 'Security',
    department: 'Operations & Logistics',
    location: 'AFT Tambolaka',
    periodLabel: '2026-08-01 s.d. 2026-08-31',
    date: '17/08/2026',
    eventDescription: 'HUT Republik Indonesia',
    taskDescription: 'PATROLI AREA KANTOR AFT TAMBOLAKA',
    isHoliday: true,
    startTime: '07:00',
    endTime: '19:00',
    actualStartTime: '07:00',
    actualEndTime: '19:00',
    totalHours: 12,
    approvedBy: 'Oktavianus Taufan Juwa',
    approverTitle: 'HO AFT Tambolaka',
    approvedAt: '17 Agustus 2026 19:30 WIB',
  },
  {
    id: 'SPKL-ATT-000-02',
    orderNumber: 'SPKL/BFP-AFT/VIII/2026/002',
    employeeName: 'Yosep Fendi Seda',
    employeeId: 'ATT-000',
    nip: '20261600475',
    position: 'Security',
    department: 'Operations & Logistics',
    location: 'AFT Tambolaka',
    periodLabel: '2026-08-01 s.d. 2026-08-31',
    date: '25/08/2026',
    eventDescription: 'Maulid Nabi Muhammad SAW',
    taskDescription: 'PATROLI AREA KANTOR AFT TAMBOLAKA',
    isHoliday: true,
    startTime: '20:00',
    endTime: '00:00',
    actualStartTime: '20:00',
    actualEndTime: '00:00',
    totalHours: 5,
    approvedBy: 'Oktavianus Taufan Juwa',
    approverTitle: 'HO AFT Tambolaka',
    approvedAt: '25 Agustus 2026 00:30 WIB',
  },
  {
    id: 'SPKL-ATT-002-01',
    orderNumber: 'SPKL/BFP-HQ/VIII/2026/001',
    employeeName: 'Siti Rahmawati',
    employeeId: 'ATT-002',
    nip: '20261600102',
    position: 'Finance Specialist',
    department: 'Finance & Accounting',
    location: 'Headquarter BFP',
    periodLabel: '2026-08-01 s.d. 2026-08-31',
    date: '20/08/2026',
    eventDescription: 'Closing Rekonsiliasi & Pelaporan Bulanan',
    taskDescription: 'REKONSILIASI LAPORAN KEUANGAN BULAN AGUSTUS',
    isHoliday: false,
    startTime: '18:00',
    endTime: '22:00',
    actualStartTime: '18:00',
    actualEndTime: '22:00',
    totalHours: 4,
    approvedBy: 'Cindy Claudia, S.E., M.Ak.',
    approverTitle: 'Head of Financial Accounting & Tax',
    approvedAt: '20 Agustus 2026 22:15 WIB',
  },
]

const initialOvertimeList: OvertimeRequest[] = [
  {
    id: 'OT-2026-0082',
    employee: 'Ahmad Fauzi',
    date: '2026-08-14',
    schedule: '17:00–21:00',
    requestedHours: 4,
    eligibleHours: 4,
    status: 'pending',
  },
  {
    id: 'OT-2026-0081',
    employee: 'Budi Santoso',
    date: '2026-08-15',
    schedule: '18:00–21:30',
    requestedHours: 3.5,
    eligibleHours: 3,
    status: 'pending',
  },
  {
    id: 'OT-2026-0080',
    employee: 'Dewi Lestari',
    date: '2026-08-14',
    schedule: '18:00–20:00',
    requestedHours: 2,
    eligibleHours: 2,
    status: 'approved',
  },
  {
    id: 'OT-2026-0079',
    employee: 'Andi Pratama',
    date: '2026-08-13',
    schedule: '19:00–22:00',
    requestedHours: 3,
    eligibleHours: 3,
    status: 'approved',
  },
  {
    id: 'OT-2026-0078',
    employee: 'Rina Ayu',
    date: '2026-08-12',
    schedule: '18:30–20:30',
    requestedHours: 2,
    eligibleHours: 1.5,
    status: 'rejected',
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
let timesheetsState: ApprovalRequest[] = loadFromStorage(STORAGE_KEY_TIMESHEET, initialTimesheets)
let spklOrdersState: OvertimeWorkOrder[] = loadFromStorage(STORAGE_KEY_SPKL, initialSpklOrders)
let overtimeListState: OvertimeRequest[] = loadFromStorage(
  STORAGE_KEY_OVERTIME_LIST,
  initialOvertimeList,
)

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

  // 5. Timesheet
  timesheetsState.forEach((ts) => {
    result.push(ts)
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
      const targetOt = overtimesState[otIdx]
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
      // Sync to overtimeListState
      overtimeListState = overtimeListState.map((ot) =>
        ot.id === id || ot.id === targetOt?.id || ot.employee === targetOt?.employeeName
          ? { ...ot, status: 'approved' }
          : ot,
      )
      saveToStorage(STORAGE_KEY_OVERTIME, overtimesState)
      saveToStorage(STORAGE_KEY_OVERTIME_LIST, overtimeListState)
      notifyListeners()
      return
    }

    // 5. Check Timesheets (Sequential 2-tier approval: Head Dept -> Head Divisi)
    const tsIdx = timesheetsState.findIndex((t) => t.id === id)
    if (tsIdx !== -1) {
      timesheetsState = timesheetsState.map((ts, i) => {
        if (i !== tsIdx) return ts

        // Tier 1 Approved -> Move to Tier 2
        if (ts.currentLevel === 1) {
          const updatedTimeline = ts.timeline.map((step, sIdx) => {
            if (sIdx === 0) {
              return {
                ...step,
                status: 'approved' as const,
                approvedAt: step.approvedAt || nowStr(),
                note: note || `Disetujui oleh Head Departemen (${step.approverName})`,
              }
            }
            if (sIdx === 1) {
              return {
                ...step,
                status: 'pending' as const,
              }
            }
            return step
          })

          return {
            ...ts,
            currentLevel: 2,
            status: 'pending' as const,
            timeline: updatedTimeline,
          }
        }

        // Tier 2 Approved -> FULLY APPROVED
        const updatedTimeline = ts.timeline.map((step, sIdx) => {
          if (sIdx === 1) {
            return {
              ...step,
              status: 'approved' as const,
              approvedAt: step.approvedAt || nowStr(),
              note: note || `Disetujui penuh oleh Head Divisi (${step.approverName})`,
            }
          }
          return step
        })

        return {
          ...ts,
          status: 'approved' as const,
          timeline: updatedTimeline,
        }
      })
      saveToStorage(STORAGE_KEY_TIMESHEET, timesheetsState)
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
      // Sync to overtimeListState
      const targetOt = overtimesState[otIdx]
      overtimeListState = overtimeListState.map((ot) =>
        ot.id === id || ot.id === targetOt?.id || ot.employee === targetOt?.employeeName
          ? { ...ot, status: 'rejected' }
          : ot,
      )
      saveToStorage(STORAGE_KEY_OVERTIME, overtimesState)
      saveToStorage(STORAGE_KEY_OVERTIME_LIST, overtimeListState)
      notifyListeners()
      return
    }

    // 5. Check Timesheets Rejection
    const tsIdx = timesheetsState.findIndex((t) => t.id === id)
    if (tsIdx !== -1) {
      timesheetsState = timesheetsState.map((ts, i) =>
        i === tsIdx
          ? {
              ...ts,
              status: 'rejected' as const,
              timeline: ts.timeline.map((step) =>
                step.status === 'pending'
                  ? {
                      ...step,
                      status: 'rejected' as const,
                      note,
                      approvedAt: nowStr(),
                    }
                  : step,
              ),
            }
          : ts,
      )
      saveToStorage(STORAGE_KEY_TIMESHEET, timesheetsState)
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

  // ── SPKL Work Orders ───────────────────────────────────────────────
  getSpklOrders: () => spklOrdersState,
  getSpklOrdersForEmployee: (empNameOrId: string): OvertimeWorkOrder[] => {
    const q = empNameOrId.toLowerCase().trim()
    return spklOrdersState.filter(
      (order) =>
        (order.employeeName && order.employeeName.toLowerCase().includes(q)) ||
        (order.employeeId && order.employeeId.toLowerCase().includes(q)) ||
        (order.nip && order.nip.toLowerCase().includes(q)),
    )
  },
  addSpklOrder: (
    order: OvertimeWorkOrder,
    approvalReq?: ApprovalRequest,
    overtimeReq?: OvertimeRequest,
  ) => {
    invalidateCache()
    spklOrdersState = [order, ...spklOrdersState]
    saveToStorage(STORAGE_KEY_SPKL, spklOrdersState)

    if (overtimeReq) {
      overtimeListState = [overtimeReq, ...overtimeListState]
      saveToStorage(STORAGE_KEY_OVERTIME_LIST, overtimeListState)
    }

    if (approvalReq) {
      overtimesState = [approvalReq, ...overtimesState]
      saveToStorage(STORAGE_KEY_OVERTIME, overtimesState)
    }

    notifyListeners()
  },

  // ── Overtime List for /overtime ──────────────────────────────────────
  getOvertimeList: () => overtimeListState,
  addOvertimeRequest: (request: OvertimeRequest) => {
    overtimeListState = [request, ...overtimeListState]
    saveToStorage(STORAGE_KEY_OVERTIME_LIST, overtimeListState)
    notifyListeners()
  },

  // Reset to initial dummy data
  resetAll: () => {
    invalidateCache()
    claimsState = [...MOCK_CLAIMS]
    tripsState = [...MOCK_BUSINESS_TRIPS]
    leavesState = [...initialLeaveRequests]
    overtimesState = [...initialOvertimes]
    timesheetsState = [...initialTimesheets]
    spklOrdersState = [...initialSpklOrders]
    overtimeListState = [...initialOvertimeList]
    saveToStorage(STORAGE_KEY_CLAIMS, claimsState)
    saveToStorage(STORAGE_KEY_TRIPS, tripsState)
    saveToStorage(STORAGE_KEY_LEAVES, leavesState)
    saveToStorage(STORAGE_KEY_OVERTIME, overtimesState)
    saveToStorage(STORAGE_KEY_TIMESHEET, timesheetsState)
    saveToStorage(STORAGE_KEY_SPKL, spklOrdersState)
    saveToStorage(STORAGE_KEY_OVERTIME_LIST, overtimeListState)
    notifyListeners()
  },

  getTimesheets: () => timesheetsState,
  getTimesheetByEmployee: (empIdOrCode: string) => {
    return timesheetsState.find(
      (ts) =>
        ts.id === `req-ts-${empIdOrCode}` ||
        ts.id.endsWith(empIdOrCode) ||
        ts.employeeName.toLowerCase().includes(empIdOrCode.toLowerCase()),
    )
  },
  approveTimesheetByEmployee: (empIdOrCode: string, note?: string) => {
    const ts = timesheetsState.find(
      (t) =>
        t.id === `req-ts-${empIdOrCode}` ||
        t.id.endsWith(empIdOrCode) ||
        t.employeeName.toLowerCase().includes(empIdOrCode.toLowerCase()),
    )
    if (ts) {
      approvalSyncStore.approveItem(ts.id, note)
    }
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

  const timesheets = useSyncExternalStore(
    approvalSyncStore.subscribe,
    approvalSyncStore.getTimesheets,
    approvalSyncStore.getTimesheets,
  )

  const spklOrders = useSyncExternalStore(
    approvalSyncStore.subscribe,
    approvalSyncStore.getSpklOrders,
    approvalSyncStore.getSpklOrders,
  )

  const overtimeList = useSyncExternalStore(
    approvalSyncStore.subscribe,
    approvalSyncStore.getOvertimeList,
    approvalSyncStore.getOvertimeList,
  )

  return {
    approvals,
    claims,
    trips,
    leaves,
    timesheets,
    spklOrders,
    overtimeList,
    getTimesheetByEmployee: approvalSyncStore.getTimesheetByEmployee,
    approveTimesheetByEmployee: approvalSyncStore.approveTimesheetByEmployee,
    getSpklOrdersForEmployee: approvalSyncStore.getSpklOrdersForEmployee,
    addSpklOrder: approvalSyncStore.addSpklOrder,
    addOvertimeRequest: approvalSyncStore.addOvertimeRequest,
    approve: approvalSyncStore.approveItem,
    reject: approvalSyncStore.rejectItem,
    addClaim: approvalSyncStore.addClaim,
    addTrip: approvalSyncStore.addTrip,
    addLeave: approvalSyncStore.addLeave,
    resetAll: approvalSyncStore.resetAll,
  }
}
