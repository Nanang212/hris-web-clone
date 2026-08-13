import { dummyApprovalLevels, dummyWorkflows } from '../approval-workflow/data'
import { dummyApprovalRequests } from './data'
import type { ApprovalRequest } from './types'

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchApprovalRequests(): Promise<ApprovalRequest[]> {
  await delay(500)

  // Map and enrich dummy requests dynamically based on the active workflows in approval-workflow
  const enrichedRequests = dummyApprovalRequests.map((req) => {
    const workflow = dummyWorkflows.find(
      (w) => w.module === req.requestType && w.status === 'active',
    )

    if (workflow) {
      const levels = dummyApprovalLevels[workflow.id] || []
      const newTotalLevels = levels.length || req.totalLevels
      const currentLevel = Math.min(req.currentLevel, newTotalLevels)

      // Map timeline steps dynamically
      const timeline = levels.map((lvl) => {
        const existingStep = req.timeline.find((t) => t.level === lvl.level)

        let status: 'approved' | 'pending' | 'waiting' | 'rejected' = 'waiting'
        if (req.status === 'approved') {
          status = 'approved'
        } else if (lvl.level < currentLevel) {
          status = 'approved'
        } else if (lvl.level === currentLevel) {
          status = req.status === 'rejected' ? 'rejected' : 'pending'
        }

        return {
          level: lvl.level,
          name: lvl.name,
          approverName: existingStep?.approverName || `${lvl.name} (Anda)`,
          status: existingStep?.status || status,
          approvedAt: existingStep?.approvedAt,
          note: existingStep?.note,
        }
      })

      return {
        ...req,
        workflowName: workflow.name,
        totalLevels: newTotalLevels,
        currentLevel,
        timeline,
      }
    }

    return req
  })

  return enrichedRequests
}

export async function approveRequest(id: string, note?: string): Promise<{ success: boolean; request: ApprovalRequest }> {
  await delay(800)
  const reqIndex = dummyApprovalRequests.findIndex((r) => r.id === id)
  if (reqIndex === -1) throw new Error('Request tidak ditemukan')

  const request = dummyApprovalRequests[reqIndex]
  // Update timeline status for current level
  const currentStep = request.timeline.find((t) => t.level === request.currentLevel)
  if (currentStep) {
    currentStep.status = 'approved'
    currentStep.approvedAt = new Date().toISOString().replace('T', ' ').substring(0, 16)
    currentStep.note = note || 'Disetujui.'
  }

  // Move to next level if available
  if (request.currentLevel < request.totalLevels) {
    request.currentLevel += 1
    const nextStep = request.timeline.find((t) => t.level === request.currentLevel)
    if (nextStep) {
      nextStep.status = 'pending'
    }
  } else {
    // End of workflow, set request status to approved
    request.status = 'approved'
  }

  return { success: true, request }
}

export async function rejectRequest(id: string, note?: string): Promise<{ success: boolean; request: ApprovalRequest }> {
  await delay(800)
  const reqIndex = dummyApprovalRequests.findIndex((r) => r.id === id)
  if (reqIndex === -1) throw new Error('Request tidak ditemukan')

  const request = dummyApprovalRequests[reqIndex]
  // Update timeline status for current level
  const currentStep = request.timeline.find((t) => t.level === request.currentLevel)
  if (currentStep) {
    currentStep.status = 'approved' // technically user acted
    currentStep.approvedAt = new Date().toISOString().replace('T', ' ').substring(0, 16)
    currentStep.note = note || 'Ditolak.'
  }

  // Set request status to rejected
  request.status = 'rejected'

  return { success: true, request }
}
