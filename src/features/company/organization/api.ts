import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'

type UnitType = 'DIVISION' | 'DEPARTMENT' | 'SECTION' | 'TEAM' | 'BRANCH' | 'PROJECT' | 'GROUP'

/**
 * Create a new Unit
 * Create a new Unit entity
 * Method: POST /v1/units
 * Tags: Organization - Unit
 */

export interface CreateUnitInput {
  code: string
  headEmployeeId?: string | null
  isActive?: boolean
  name: string
  parentUnitId?: string | null
  unitType: UnitType
}

export interface CreateUnitOutput {
  id: string
}

export const createUnit = async (input: CreateUnitInput): Promise<Envelope<CreateUnitOutput>> => {
  const { code, headEmployeeId, isActive, name, parentUnitId, unitType } = input
  const out = await apiClient.post<Envelope<CreateUnitOutput>>('/v1/units', {
    code,
    headEmployeeId,
    isActive,
    name,
    parentUnitId,
    unitType,
  })
  return out.data
}

/**
 * Get Units
 * Retrieve Units with cursor-based pagination
 * Method: GET /v1/units
 * Tags: Organization - Unit
 */

export interface GetUnitsInput {
  cursor?: string
  limit?: number
  direction?: string
  name?: string
  isActive?: boolean
}

export interface GetUnitsOutput {
  hasNext: boolean
  items: {
    code: string
    createdAt: string
    headEmployee?: { employeeNumber: string; fullName: string; id: string } | null
    id: string
    isActive: boolean
    name: string
    parentUnit?: { code: string; id: string; name: string; unitType: string } | null
    unitType: UnitType
    updatedAt: string
  }[]
  nextCursor: string
}

export const getUnits = async (input: GetUnitsInput): Promise<Envelope<GetUnitsOutput>> => {
  const { cursor, limit, direction, name, isActive } = input
  const out = await apiClient.get<Envelope<GetUnitsOutput>>('/v1/units', {
    params: { cursor, limit, direction, name, isActive },
  })
  return out.data
}

/**
 * Get Unit by ID
 * Retrieve a single Unit by its ID
 * Method: GET /v1/units/{unitId}
 * Tags: Organization - Unit
 */

export interface GetUnitInput {
  unitId: string
}

export interface GetUnitOutput {
  code: string
  createdAt: string
  headEmployee?: { employeeNumber: string; fullName: string; id: string } | null
  id: string
  isActive: boolean
  name: string
  parentUnit?: { code: string; id: string; name: string; unitType: string } | null
  unitType: UnitType
  updatedAt: string
}

export const getUnit = async (input: GetUnitInput): Promise<Envelope<GetUnitOutput>> => {
  const { unitId } = input
  const out = await apiClient.get<Envelope<GetUnitOutput>>(`/v1/units/${unitId}`)
  return out.data
}

/**
 * Update Unit
 * Update an existing Unit entity
 * Method: PATCH /v1/units/{unitId}
 * Tags: Organization - Unit
 */

export interface UpdateUnitInput {
  unitId: string
  code?: string | null
  headEmployeeId?: string | null
  id: string
  isActive?: boolean | null
  name?: string | null
  parentUnitId?: string | null
  unitType?: UnitType | null
}

export interface UpdateUnitOutput {
  id: string
}

export const updateUnit = async (input: UpdateUnitInput): Promise<Envelope<UpdateUnitOutput>> => {
  const { unitId, code, headEmployeeId, id, isActive, name, parentUnitId, unitType } = input
  const out = await apiClient.patch<Envelope<UpdateUnitOutput>>(`/v1/units/${unitId}`, {
    code,
    headEmployeeId,
    id,
    isActive,
    name,
    parentUnitId,
    unitType,
  })
  return out.data
}

/**
 * Delete Unit
 * Delete a Unit entity by ID
 * Method: DELETE /v1/units/{unitId}
 * Tags: Organization - Unit
 */

export interface DeleteUnitInput {
  unitId: string
}

export const deleteUnit = async (input: DeleteUnitInput): Promise<Envelope> => {
  const { unitId } = input
  const out = await apiClient.delete<Envelope>(`/v1/units/${unitId}`)
  return out.data
}
