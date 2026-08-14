import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { approveRequest, fetchApprovalRequests, rejectRequest } from './api'
import type { FetchApprovalsParams } from './api'

export const approvalQueryKeys = {
  all: ['approvals'] as const,
  lists: () => [...approvalQueryKeys.all, 'list'] as const,
  list: (params?: FetchApprovalsParams) => [...approvalQueryKeys.lists(), params] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useApprovalRequests(params?: FetchApprovalsParams) {
  return useQuery({
    queryKey: approvalQueryKeys.list(params),
    queryFn: () => fetchApprovalRequests(params),
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useApproveRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => approveRequest(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalQueryKeys.lists() })
    },
  })
}

export function useRejectRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => rejectRequest(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalQueryKeys.lists() })
    },
  })
}
