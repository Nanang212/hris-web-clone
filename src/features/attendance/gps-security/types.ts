// types.ts — Types for GPS Security & Geofence Management

export type GpsSecurityTab = 'overview' | 'geofences' | 'logs'
export type GeofenceViewMode = 'list' | 'create' | 'edit'

export interface GeofenceItem {
  id: string
  locationName: string
  type: 'Office' | 'Branch' | 'Warehouse' | 'Temporary'
  address: string
  latitude: number
  longitude: number
  radiusMeters: number
  accuracyRequirement: string
  employeeScope: string
  employeesCount: number
  status: 'Active' | 'Inactive'
  policyNote?: string
}

export interface SecurityRule {
  key: string
  label: string
  value: string
  isDestructive?: boolean
}

export interface SecurityEventLog {
  id: string
  timestamp: string
  employeeName: string
  employeeCode: string
  department: string
  eventType: 'Outside Geofence' | 'Fake GPS Blocked' | 'Low Accuracy' | 'Root / Jailbreak' | 'Mock Location'
  locationDetected: string
  accuracy: string
  actionTaken: 'Blocked' | 'Flagged for Review' | 'Allowed with Warning'
  severity: 'high' | 'medium' | 'low'
  officeName?: string
  officeLatitude?: number
  officeLongitude?: number
  officeRadius?: number
  detectedLatitude?: number
  detectedLongitude?: number
  deviceModel?: string
  osVersion?: string
  ipAddress?: string
  distanceFromPerimeter?: string
  isMockLocation?: boolean
  isRooted?: boolean
}
