import { useSyncExternalStore } from 'react'
import type { Project } from '../types'

export const initialProjects: Project[] = [
  {
    id: 'project-retail-hris-rollout',
    clientId: 'client-nusantara-retail',
    code: 'PRJ-001',
    name: 'Retail HRIS Rollout',
    description: 'Implementation of attendance, payroll, and employee self-service workflows.',
    industryField: 'Retail',
    startDate: '2026-07-01',
    endDate: '2026-12-20',
    status: 'ONGOING',
    addresses: [
      {
        id: 'addr-retail-hq',
        address: 'Jl. Jenderal Sudirman Kav. 52-53, Jakarta Selatan',
        latitude: -6.2247,
        longitude: 106.8099,
        geofenceRadiusMeters: 150,
      },
    ],
    createdAt: '2026-06-18T09:00:00+07:00',
    updatedAt: '2026-08-25T16:30:00+07:00',
  },
  {
    id: 'project-logistics-shift-ops',
    clientId: 'client-samudra-logistics',
    code: 'PRJ-002',
    name: 'Warehouse Shift Operations',
    description: 'Shift scheduling and site attendance setup for warehouse operations.',
    industryField: 'Logistics',
    startDate: '2026-08-05',
    endDate: null,
    status: 'PLANNING',
    addresses: [
      {
        id: 'addr-mm2100',
        address: 'Kawasan Industri MM2100, Cikarang Barat, Bekasi',
        latitude: -6.2989,
        longitude: 107.0617,
        geofenceRadiusMeters: 250,
      },
    ],
    createdAt: '2026-07-22T13:10:00+07:00',
    updatedAt: '2026-08-22T10:10:00+07:00',
  },
]

let projectsStore: Project[] = [...initialProjects]

export const dummyProjects: Project[] = [...initialProjects]

function syncDummyProjects() {
  dummyProjects.length = 0
  dummyProjects.push(...projectsStore)
}

type Listener = () => void
const listeners = new Set<Listener>()

function notify() {
  syncDummyProjects()
  listeners.forEach((l) => l())
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getProjects(): Project[] {
  return projectsStore
}

export function addProject(project: Project) {
  projectsStore = [project, ...projectsStore]
  notify()
}

export function updateProject(id: string, updated: Partial<Project>) {
  projectsStore = projectsStore.map((p) =>
    p.id === id
      ? {
          ...p,
          ...updated,
          updatedAt: new Date().toISOString(),
        }
      : p,
  )
  notify()
}

export function deleteProject(id: string) {
  projectsStore = projectsStore.filter((p) => p.id !== id)
  notify()
}

export function useProjects(): Project[] {
  return useSyncExternalStore(subscribe, getProjects, getProjects)
}


