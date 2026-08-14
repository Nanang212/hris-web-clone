import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createWorkflow,
  fetchApprovalLevels,
  fetchApprovalMatrix,
  fetchRoutingRules,
  fetchWorkflowById,
  fetchWorkflows,
  saveApprovalLevels,
  saveRoutingRules,
  testWorkflow,
  updateWorkflow,
} from './api'
import type { ApprovalLevel, RoutingRule, TestScenario, Workflow } from './types'

export const approvalWorkflowQueryKeys = {
  all: ['approval-workflows'] as const,
  lists: () => [...approvalWorkflowQueryKeys.all, 'list'] as const,
  details: () => [...approvalWorkflowQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...approvalWorkflowQueryKeys.details(), id] as const,
  levels: (workflowId: string) => [...approvalWorkflowQueryKeys.detail(workflowId), 'levels'] as const,
  routingRules: (workflowId: string) => [...approvalWorkflowQueryKeys.detail(workflowId), 'routing-rules'] as const,
  matrix: () => [...approvalWorkflowQueryKeys.all, 'matrix'] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useWorkflows() {
  return useQuery({
    queryKey: approvalWorkflowQueryKeys.lists(),
    queryFn: fetchWorkflows,
  })
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: approvalWorkflowQueryKeys.detail(id),
    queryFn: () => fetchWorkflowById(id),
    enabled: !!id,
  })
}

export function useWorkflowLevels(workflowId: string) {
  return useQuery({
    queryKey: approvalWorkflowQueryKeys.levels(workflowId),
    queryFn: () => fetchApprovalLevels(workflowId),
    enabled: !!workflowId,
  })
}

export function useWorkflowRoutingRules(workflowId: string) {
  return useQuery({
    queryKey: approvalWorkflowQueryKeys.routingRules(workflowId),
    queryFn: () => fetchRoutingRules(workflowId),
    enabled: !!workflowId,
  })
}

export function useApprovalMatrix() {
  return useQuery({
    queryKey: approvalWorkflowQueryKeys.matrix(),
    queryFn: fetchApprovalMatrix,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Workflow>) => createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalWorkflowQueryKeys.lists() })
    },
  })
}

export function useUpdateWorkflow(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<Workflow>) => updateWorkflow(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalWorkflowQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalWorkflowQueryKeys.detail(id) })
    },
  })
}

export function useSaveWorkflowLevels(workflowId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (levels: ApprovalLevel[]) => saveApprovalLevels(workflowId, levels),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalWorkflowQueryKeys.levels(workflowId) })
      // We also invalidate detail because totalLevels count might have changed in the parent workflow
      queryClient.invalidateQueries({ queryKey: approvalWorkflowQueryKeys.detail(workflowId) })
    },
  })
}

export function useTestWorkflow(workflowId: string) {
  return useMutation({
    mutationFn: (scenario: TestScenario) => testWorkflow(workflowId, scenario),
  })
}

export function useSaveWorkflowRoutingRules(workflowId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rules: RoutingRule[]) => saveRoutingRules(workflowId, rules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalWorkflowQueryKeys.routingRules(workflowId) })
    },
  })
}
