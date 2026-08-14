// api.ts — Approval Inbox data fetching via backend API
import { apiClient } from '@/shared/lib/axios'
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
  const res = await apiClient.get<Envelope<PaginatedData<ApprovalRequest>>>('/api/v1/approvals', {
    params,
  })
  return res.data.data
}

// ─── Approve Request ──────────────────────────────────────────────────────────

export async function approveRequest(id: string, note?: string): Promise<ApprovalRequest> {
  const res = await apiClient.post<Envelope<ApprovalRequest>>(`/api/v1/approvals/${id}/approve`, { note })
  return res.data.data
}

// ─── Reject Request ───────────────────────────────────────────────────────────

export async function rejectRequest(id: string, note?: string): Promise<ApprovalRequest> {
  const res = await apiClient.post<Envelope<ApprovalRequest>>(`/api/v1/approvals/${id}/reject`, { note })
  return res.data.data
}
