/**
 * Create a new Client
 * Create a new Client entity
 * Method: POST /v1/clients
 * Tags: Com - Client
 */

import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'

import type { Client } from './types'

export interface CreateClientInput {
  address?: string | null
  code: string
  contactPersonEmail?: string | null
  contactPersonName?: string | null
  contactPersonPhone?: string | null
  isActive?: boolean
  name: string
}

export interface CreateClientOutput {
  id: string
}

export const createClient = async (
  input: CreateClientInput,
): Promise<Envelope<CreateClientOutput>> => {
  const {
    address,
    code,
    contactPersonEmail,
    contactPersonName,
    contactPersonPhone,
    isActive,
    name,
  } = input
  const out = await apiClient.post<Envelope<CreateClientOutput>>('/api/v1/clients', {
    address,
    code,
    contactPersonEmail,
    contactPersonName,
    contactPersonPhone,
    isActive,
    name,
  })
  return out.data
}

/**
 * Get Clients
 * Retrieve Clients with cursor-based pagination
 * Method: GET /v1/clients
 * Tags: Com - Client
 */

export interface GetClientsInput {
  cursor?: string
  limit?: number
  direction?: string
  name?: string
  isActive?: boolean
}

export interface GetClientsOutput {
  hasNext: boolean
  items: Client[]
  nextCursor: string | null
}

export const getClients = async (input: GetClientsInput): Promise<Envelope<GetClientsOutput>> => {
  const { cursor, limit, direction, name, isActive } = input
  const out = await apiClient.get<Envelope<GetClientsOutput>>('/api/v1/clients', {
    params: { cursor, limit, direction, name, isActive },
  })
  return out.data
}

/**
 * Get Client by ID
 * Retrieve a single Client by its ID
 * Method: GET /v1/clients/{clientId}
 * Tags: Com - Client
 */

export interface GetClientInput {
  clientId: string
}

export const getClient = async (input: GetClientInput): Promise<Envelope<Client>> => {
  const { clientId } = input
  const out = await apiClient.get<Envelope<Client>>(`/api/v1/clients/${clientId}`)
  return out.data
}

/**
 * Update Client
 * Update an existing Client entity
 * Method: PATCH /v1/clients/{clientId}
 * Tags: Com - Client
 */

export interface UpdateClientInput {
  clientId: string
  address?: string | null
  code?: string | null
  contactPersonEmail?: string | null
  contactPersonName?: string | null
  contactPersonPhone?: string | null
  id: string
  isActive?: boolean | null
  name?: string | null
}

export interface UpdateClientOutput {
  id: string
}

export const updateClient = async (
  input: UpdateClientInput,
): Promise<Envelope<UpdateClientOutput>> => {
  const {
    clientId,
    address,
    code,
    contactPersonEmail,
    contactPersonName,
    contactPersonPhone,
    id,
    isActive,
    name,
  } = input
  const out = await apiClient.patch<Envelope<UpdateClientOutput>>(`/api/v1/clients/${clientId}`, {
    address,
    code,
    contactPersonEmail,
    contactPersonName,
    contactPersonPhone,
    id,
    isActive,
    name,
  })
  return out.data
}

/**
 * Delete Client
 * Delete a Client entity by ID
 * Method: DELETE /v1/clients/{clientId}
 * Tags: Com - Client
 */

export interface DeleteClientInput {
  clientId: string
}

export const deleteClient = async (
  input: DeleteClientInput,
): Promise<Envelope<Record<string, string>>> => {
  const { clientId } = input
  const out = await apiClient.delete<Envelope<Record<string, string>>>(
    `/api/v1/clients/${clientId}`,
  )
  return out.data
}
