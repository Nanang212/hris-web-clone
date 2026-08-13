// api.ts — Approval Workflow data fetching (dummy/mock)
// Saat API backend sudah siap, ganti fungsi di sini dengan real HTTP calls
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

// Simulate network delay
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

// ─── Workflow List ────────────────────────────────────────────────────────────

export async function fetchWorkflows(): Promise<Workflow[]> {
  await delay()
  return dummyWorkflows
}

// ─── Single Workflow ──────────────────────────────────────────────────────────

export async function fetchWorkflowById(id: string): Promise<Workflow | null> {
  await delay(400)
  return dummyWorkflows.find((w) => w.id === id) ?? null
}

// ─── Approval Levels ──────────────────────────────────────────────────────────

export async function fetchApprovalLevels(workflowId: string): Promise<ApprovalLevel[]> {
  await delay(400)
  return dummyApprovalLevels[workflowId] ?? []
}

export async function saveApprovalLevels(workflowId: string, levels: ApprovalLevel[]): Promise<void> {
  await delay(100)
  dummyApprovalLevels[workflowId] = levels
  // Sync totalLevels in workflow
  const workflow = dummyWorkflows.find((w) => w.id === workflowId)
  if (workflow) {
    workflow.totalLevels = levels.length
  }
}

// ─── Routing Rules ────────────────────────────────────────────────────────────

export async function fetchRoutingRules(workflowId: string): Promise<RoutingRule[]> {
  await delay(400)
  return dummyRoutingRules[workflowId] ?? []
}

// ─── Approval Matrix ──────────────────────────────────────────────────────────

export async function fetchApprovalMatrix(): Promise<MatrixEntry[]> {
  await delay()
  return dummyMatrixEntries
}

// ─── Test Workflow ────────────────────────────────────────────────────────────

export async function testWorkflow(
  workflowId: string,
  scenario: TestScenario,
): Promise<TestResult> {
  void workflowId
  void scenario
  await delay(1200)
  // In real API: POST /api/v1/approval-workflow/{id}/test with scenario body
  return dummyTestResult
}

// ─── Configure Levels Page Data (workflow + levels combined) ─────────────────

export interface ConfigureLevelsData {
  workflow: Workflow
  levels: ApprovalLevel[]
}

export async function fetchConfigureLevelsData(workflowId: string): Promise<ConfigureLevelsData> {
  await delay(500)
  const workflow = dummyWorkflows.find((w) => w.id === workflowId)
  if (!workflow) throw new Error(`Workflow dengan ID "${workflowId}" tidak ditemukan`)
  const levels = dummyApprovalLevels[workflowId] ?? []
  return { workflow, levels }
}

// ─── Conditions Page Data (workflow + rules combined) ────────────────────────

export interface ConditionsData {
  workflow: Workflow
  rules: RoutingRule[]
}

export async function fetchConditionsData(workflowId: string): Promise<ConditionsData> {
  await delay(500)
  const workflow = dummyWorkflows.find((w) => w.id === workflowId)
  if (!workflow) throw new Error(`Workflow dengan ID "${workflowId}" tidak ditemukan`)
  const rules = dummyRoutingRules[workflowId] ?? []
  return { workflow, rules }
}

// ─── Test Page Data ───────────────────────────────────────────────────────────

export interface TestPageData {
  workflow: Workflow
}

export async function fetchTestPageData(workflowId: string): Promise<TestPageData> {
  await delay(300)
  const workflow = dummyWorkflows.find((w) => w.id === workflowId)
  if (!workflow) throw new Error(`Workflow dengan ID "${workflowId}" tidak ditemukan`)
  return { workflow }
}

export async function updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
  await delay(400)
  const idx = dummyWorkflows.findIndex((w) => w.id === id)
  if (idx === -1) throw new Error('Workflow tidak ditemukan')
  
  dummyWorkflows[idx] = {
    ...dummyWorkflows[idx],
    ...updates,
    updatedAt: new Date().toISOString().split('T')[0],
  }
  return dummyWorkflows[idx]
}

export async function createWorkflow(workflowData: Partial<Workflow>): Promise<Workflow> {
  await delay(400)
  const newId = `wf-00${dummyWorkflows.length + 1}`
  const newWorkflow: Workflow = {
    id: newId,
    name: workflowData.name || 'Unnamed Workflow',
    description: workflowData.description || '',
    module: workflowData.module || 'leave',
    status: workflowData.status || 'draft',
    totalLevels: 0,
    totalRequests: 0,
    avgProcessingDays: 0,
    pendingRequests: 0,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    createdBy: 'Admin HR',
  }
  dummyWorkflows.push(newWorkflow)
  return newWorkflow
}

