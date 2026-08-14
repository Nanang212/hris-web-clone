// api.ts — Approval Workflow data fetching via backend API
import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'
import type {
  ApprovalLevel,
  MatrixEntry,
  RoutingRule,
  TestResult,
  TestScenario,
  Workflow,
} from './types'

// ─── Workflow List ────────────────────────────────────────────────────────────

export async function fetchWorkflows(): Promise<Workflow[]> {
  const res = await apiClient.get<Envelope<Workflow[]>>('/api/v1/approval-workflows')
  return res.data.data
}

// ─── Single Workflow ──────────────────────────────────────────────────────────

export async function fetchWorkflowById(id: string): Promise<Workflow> {
  const res = await apiClient.get<Envelope<Workflow>>(`/api/v1/approval-workflows/${id}`)
  return res.data.data
}

export async function createWorkflow(workflowData: Partial<Workflow>): Promise<Workflow> {
  const res = await apiClient.post<Envelope<Workflow>>('/api/v1/approval-workflows', workflowData)
  return res.data.data
}

export async function updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
  const res = await apiClient.put<Envelope<Workflow>>(`/api/v1/approval-workflows/${id}`, updates)
  return res.data.data
}

// ─── Approval Levels ──────────────────────────────────────────────────────────

export async function fetchApprovalLevels(workflowId: string): Promise<ApprovalLevel[]> {
  const res = await apiClient.get<Envelope<ApprovalLevel[]>>(`/api/v1/approval-workflows/${workflowId}/levels`)
  return res.data.data
}

export async function saveApprovalLevels(workflowId: string, levels: ApprovalLevel[]): Promise<void> {
  await apiClient.put<Envelope<void>>(`/api/v1/approval-workflows/${workflowId}/levels`, { levels })
}

// ─── Routing Rules ────────────────────────────────────────────────────────────

export async function fetchRoutingRules(workflowId: string): Promise<RoutingRule[]> {
  const res = await apiClient.get<Envelope<RoutingRule[]>>(`/api/v1/approval-workflows/${workflowId}/routing-rules`)
  return res.data.data
}

export async function saveRoutingRules(workflowId: string, rules: RoutingRule[]): Promise<void> {
  await apiClient.put<Envelope<void>>(`/api/v1/approval-workflows/${workflowId}/routing-rules`, { rules })
}

// ─── Approval Matrix ──────────────────────────────────────────────────────────

export async function fetchApprovalMatrix(): Promise<MatrixEntry[]> {
  const res = await apiClient.get<Envelope<MatrixEntry[]>>('/api/v1/approval-workflows-matrix')
  return res.data.data
}

// ─── Test Workflow ────────────────────────────────────────────────────────────

export async function testWorkflow(
  workflowId: string,
  scenario: TestScenario,
): Promise<TestResult> {
  const res = await apiClient.post<Envelope<TestResult>>(`/api/v1/approval-workflows/${workflowId}/test`, scenario)
  return res.data.data
}

// ─── Combined Data Fetchers (Helper wrappers) ──────────────────────────────────

export interface ConfigureLevelsData {
  workflow: Workflow
  levels: ApprovalLevel[]
}

export async function fetchConfigureLevelsData(workflowId: string): Promise<ConfigureLevelsData> {
  const [workflow, levels] = await Promise.all([
    fetchWorkflowById(workflowId),
    fetchApprovalLevels(workflowId),
  ])
  return { workflow, levels }
}

export interface ConditionsData {
  workflow: Workflow
  rules: RoutingRule[]
}

export async function fetchConditionsData(workflowId: string): Promise<ConditionsData> {
  const [workflow, rules] = await Promise.all([
    fetchWorkflowById(workflowId),
    fetchRoutingRules(workflowId),
  ])
  return { workflow, rules }
}

export interface TestPageData {
  workflow: Workflow
}

export async function fetchTestPageData(workflowId: string): Promise<TestPageData> {
  const workflow = await fetchWorkflowById(workflowId)
  return { workflow }
}
