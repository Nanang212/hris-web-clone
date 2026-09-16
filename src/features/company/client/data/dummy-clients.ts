import { useSyncExternalStore } from 'react'
import type { Client } from '../types'

export const initialClients: Client[] = [
  {
    id: 'client-pertamina-retail',
    code: 'PTR-001',
    name: 'PT Pertamina Retail',
    address: 'Jl. HR Rasuna Said, Jakarta Selatan',
    contactPersonName: 'Dimas Pratama',
    contactPersonEmail: 'dimas.pratama@company.co.id',
    contactPersonPhone: '+62 812 3456 7890',
    isActive: true,
    createdAt: '2026-01-12T09:00:00+07:00',
    updatedAt: '2026-08-19T15:20:00+07:00',
  },
  {
    id: 'client-bfp-a',
    code: 'CLT-002',
    name: 'BFP Client A',
    address: 'Jl. TB Simatupang No. 22, Jakarta Selatan',
    contactPersonName: 'Anita Wijaya',
    contactPersonEmail: 'anita@clienta.co.id',
    contactPersonPhone: '+62 811 2200 4455',
    isActive: true,
    createdAt: '2026-02-04T10:30:00+07:00',
    updatedAt: '2026-07-11T11:45:00+07:00',
  },
  {
    id: 'client-bfp-b',
    code: 'CLT-003',
    name: 'BFP Client B',
    address: 'Kawasan SCBD Lot 8, Jakarta Selatan',
    contactPersonName: 'Raka Putra',
    contactPersonEmail: 'raka@clientb.co.id',
    contactPersonPhone: '+62 813 7788 9012',
    isActive: true,
    createdAt: '2026-03-15T08:15:00+07:00',
    updatedAt: '2026-06-02T14:10:00+07:00',
  },
]

let clientsStore: Client[] = [...initialClients]

export const dummyClients: Client[] = [...initialClients]

function syncDummyClients() {
  dummyClients.length = 0
  dummyClients.push(...clientsStore)
}

type Listener = () => void
const listeners = new Set<Listener>()

function notify() {
  syncDummyClients()
  listeners.forEach((l) => l())
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getClients(): Client[] {
  return clientsStore
}

export function addClient(client: Client) {
  clientsStore = [client, ...clientsStore]
  notify()
}

export function updateClient(id: string, updated: Partial<Client>) {
  clientsStore = clientsStore.map((c) =>
    c.id === id
      ? {
          ...c,
          ...updated,
          updatedAt: new Date().toISOString(),
        }
      : c,
  )
  notify()
}

export function deleteClient(id: string) {
  clientsStore = clientsStore.filter((c) => c.id !== id)
  notify()
}

export function useClients(): Client[] {
  return useSyncExternalStore(subscribe, getClients, getClients)
}
