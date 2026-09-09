export type ProjectStatus = 'PLANNING' | 'ONGOING' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'

export interface ProjectAddress {
  id?: string
  address: string
  latitude?: number | null
  longitude?: number | null
  geofenceRadiusMeters?: number | null
}

export interface Project {
  id: string
  clientId: string
  code: string
  name: string
  description?: string | null
  industryField?: string | null
  startDate: string
  endDate?: string | null
  status: ProjectStatus
  addresses: ProjectAddress[]
  createdAt: string
  updatedAt: string
}
