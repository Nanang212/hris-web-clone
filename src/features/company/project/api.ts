import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'

import type { Project, ProjectAddress, ProjectStatus } from './types'

/**
 * Create a new Project
 * Create a new Project entity
 * Method: POST /v1/projects
 * Tags: Com - Project
 */

export interface CreateProjectInput {
  addresses?: ProjectAddress[]
  clientId: string
  code: string
  description?: string | null
  endDate?: Record<string, unknown>
  industryField?: string | null
  name: string
  startDate: string
  status: ProjectStatus
}

export interface CreateProjectOutput {
  id: string
}

export const createProject = async (
  input: CreateProjectInput,
): Promise<Envelope<CreateProjectOutput>> => {
  const {
    addresses,
    clientId,
    code,
    description,
    endDate,
    industryField,
    name,
    startDate,
    status,
  } = input
  const out = await apiClient.post<Envelope<CreateProjectOutput>>('/api/v1/projects', {
    addresses,
    clientId,
    code,
    description,
    endDate,
    industryField,
    name,
    startDate,
    status,
  })
  return out.data
}

/**
 * Get Projects
 * Retrieve Projects with cursor-based pagination
 * Method: GET /v1/projects
 * Tags: Com - Project
 */

export interface GetProjectsInput {
  cursor?: string
  limit?: number
  direction?: string
  name?: string
  isActive?: boolean
}

export interface GetProjectsOutput {
  hasNext: boolean
  items: Project[]
  nextCursor: string | null
}

export const getProjects = async (
  input: GetProjectsInput,
): Promise<Envelope<GetProjectsOutput>> => {
  const { cursor, limit, direction, name, isActive } = input
  const out = await apiClient.get<Envelope<GetProjectsOutput>>('/api/v1/projects', {
    params: { cursor, limit, direction, name, isActive },
  })
  return out.data
}

/**
 * Update Project
 * Update an existing Project entity
 * Method: PATCH /v1/projects/{projectId}
 * Tags: Com - Project
 */

export interface UpdateProjectInput {
  projectId: string
  addresses?: ProjectAddress[]
  clientId?: string | null
  code?: string | null
  description?: string | null
  endDate?: string | null
  id: string
  industryField?: string | null
  name?: string | null
  startDate?: string | null
  status?: ProjectStatus | null
}

export interface UpdateProjectOutput {
  id: string
}

export const updateProject = async (
  input: UpdateProjectInput,
): Promise<Envelope<UpdateProjectOutput>> => {
  const {
    projectId,
    addresses,
    clientId,
    code,
    description,
    endDate,
    id,
    industryField,
    name,
    startDate,
    status,
  } = input
  const out = await apiClient.patch<Envelope<UpdateProjectOutput>>(
    `/api/v1/projects/${projectId}`,
    {
      addresses,
      clientId,
      code,
      description,
      endDate,
      id,
      industryField,
      name,
      startDate,
      status,
    },
  )
  return out.data
}

/**
 * Delete Project
 * Delete a Project entity by ID
 * Method: DELETE /v1/projects/{projectId}
 * Tags: Com - Project
 */

export interface DeleteProjectInput {
  projectId: string
}

export const deleteProject = async (
  input: DeleteProjectInput,
): Promise<Envelope<Record<string, string>>> => {
  const { projectId } = input
  const out = await apiClient.delete<Envelope<Record<string, string>>>(
    `/api/v1/projects/${projectId}`,
  )
  return out.data
}
