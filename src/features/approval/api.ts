import { apiClient } from '@/shared/lib/axios'
import { approvalSyncStore } from '@/shared/lib/approval-sync-store'
import type { Envelope, PaginatedData } from '@/shared/types'
import type { ApprovalRequest } from './types'

export interface FetchApprovalsParams {
  requestType?: string
  status?: string
  search?: string
  cursor?: string
  limit?: number
}

// ─── Fetch Approvals List (Paginated) ──────────────────────────────────────────

export async function fetchApprovalRequests(params?: FetchApprovalsParams): Promise<PaginatedData<ApprovalRequest>> {
  try {
    const res = await apiClient.get<Envelope<PaginatedData<ApprovalRequest>>>('/api/v1/approvals', {
      params,
    })
    return res.data.data
  } catch {
    const allApprovals = approvalSyncStore.getApprovals()
    let filtered = [...allApprovals]
    if (params?.requestType && params.requestType !== 'all') {
      filtered = filtered.filter((r) => r.requestType === params.requestType)
    }
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((r) => r.status === params.status)
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.details.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q),
      )
    }
    return {
      items: filtered,
      cursor: null,
      total: filtered.length,
    }
  }
}

// ─── Approve Request ──────────────────────────────────────────────────────────

export async function approveRequest(id: string, note?: string): Promise<ApprovalRequest> {
  try {
    const res = await apiClient.post<Envelope<ApprovalRequest>>(`/api/v1/approvals/${id}/approve`, { note })
    return res.data.data
  } catch {
    approvalSyncStore.approveItem(id, note)
    const found = approvalSyncStore.getApprovals().find((r) => r.id === id)
    return found || approvalSyncStore.getApprovals()[0]
  }
}

// ─── Reject Request ───────────────────────────────────────────────────────────

export async function rejectRequest(id: string, note?: string): Promise<ApprovalRequest> {
  try {
    const res = await apiClient.post<Envelope<ApprovalRequest>>(`/api/v1/approvals/${id}/reject`, { note })
    return res.data.data
  } catch {
    approvalSyncStore.rejectItem(id, note)
    const found = approvalSyncStore.getApprovals().find((r) => r.id === id)
    return found || approvalSyncStore.getApprovals()[0]
  }
}
