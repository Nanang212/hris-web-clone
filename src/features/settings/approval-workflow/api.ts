import {
  dummyApprovalLevels,
  dummyMatrixEntries,
  dummyRoutingRules,
  dummyTestResult,
  dummyWorkflows,
} from './data'
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
  try {
    const res = await apiClient.get<Envelope<Workflow[]>>('/api/v1/approval-workflows')
    return res.data.data
  } catch {
    return dummyWorkflows
  }
}

// ─── Single Workflow ──────────────────────────────────────────────────────────

export async function fetchWorkflowById(id: string): Promise<Workflow> {
  try {
    const res = await apiClient.get<Envelope<Workflow>>(`/api/v1/approval-workflows/${id}`)
    return res.data.data
  } catch {
    const found = dummyWorkflows.find((w) => w.id === id)
    if (found) return found
    return dummyWorkflows[0]
  }
}

export async function createWorkflow(workflowData: Partial<Workflow>): Promise<Workflow> {
  try {
    const res = await apiClient.post<Envelope<Workflow>>('/api/v1/approval-workflows', workflowData)
    return res.data.data
  } catch {
    const newWf: Workflow = {
      id: `wf-${Date.now()}`,
      name: workflowData.name || 'New Workflow',
      description: workflowData.description || '',
      module: workflowData.module || 'leave',
      status: workflowData.status || 'draft',
      totalLevels: 2,
      totalRequests: 0,
      avgProcessingDays: 0,
      pendingRequests: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: 'Admin User',
    }
    dummyWorkflows.unshift(newWf)
    return newWf
  }
}

export async function updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
  try {
    const res = await apiClient.put<Envelope<Workflow>>(`/api/v1/approval-workflows/${id}`, updates)
    return res.data.data
  } catch {
    const idx = dummyWorkflows.findIndex((w) => w.id === id)
    if (idx !== -1) {
      dummyWorkflows[idx] = { ...dummyWorkflows[idx], ...updates, updatedAt: new Date().toISOString().split('T')[0] }
      return dummyWorkflows[idx]
    }
    return dummyWorkflows[0]
  }
}

// ─── Approval Levels ──────────────────────────────────────────────────────────

export async function fetchApprovalLevels(workflowId: string): Promise<ApprovalLevel[]> {
  try {
    const res = await apiClient.get<Envelope<ApprovalLevel[]>>(`/api/v1/approval-workflows/${workflowId}/levels`)
    return res.data.data
  } catch {
    return dummyApprovalLevels[workflowId] || dummyApprovalLevels['wf-001'] || []
  }
}

export async function saveApprovalLevels(workflowId: string, levels: ApprovalLevel[]): Promise<void> {
  try {
    await apiClient.put<Envelope<void>>(`/api/v1/approval-workflows/${workflowId}/levels`, { levels })
  } catch {
    dummyApprovalLevels[workflowId] = levels
  }
}

// ─── Routing Rules ────────────────────────────────────────────────────────────

export async function fetchRoutingRules(workflowId: string): Promise<RoutingRule[]> {
  try {
    const res = await apiClient.get<Envelope<RoutingRule[]>>(`/api/v1/approval-workflows/${workflowId}/routing-rules`)
    return res.data.data
  } catch {
    return dummyRoutingRules[workflowId] || dummyRoutingRules['wf-001'] || []
  }
}

export async function saveRoutingRules(workflowId: string, rules: RoutingRule[]): Promise<void> {
  try {
    await apiClient.put<Envelope<void>>(`/api/v1/approval-workflows/${workflowId}/routing-rules`, { rules })
  } catch {
    dummyRoutingRules[workflowId] = rules
  }
}

// ─── Approval Matrix ──────────────────────────────────────────────────────────

export async function fetchApprovalMatrix(): Promise<MatrixEntry[]> {
  try {
    const res = await apiClient.get<Envelope<MatrixEntry[]>>('/api/v1/approval-workflows-matrix')
    return res.data.data
  } catch {
    return dummyMatrixEntries
  }
}

// ─── Test Workflow ────────────────────────────────────────────────────────────

export async function testWorkflow(
  workflowId: string,
  scenario: TestScenario,
): Promise<TestResult> {
  try {
    const res = await apiClient.post<Envelope<TestResult>>(`/api/v1/approval-workflows/${workflowId}/test`, scenario)
    return res.data.data
  } catch {
    const wf = dummyWorkflows.find((w) => w.id === workflowId) || dummyWorkflows[0]
    return {
      ...dummyTestResult,
      workflowName: wf.name,
      matchedConditions: [
        `${scenario.requestType} request`,
        scenario.requestDays ? `duration = ${scenario.requestDays} days` : '',
        scenario.requestValue ? `amount = Rp ${scenario.requestValue.toLocaleString('id-ID')}` : '',
      ].filter(Boolean),
    }
  }
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
