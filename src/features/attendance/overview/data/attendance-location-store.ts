import { create } from 'zustand'
import dayjs from 'dayjs'

export interface AttendanceLocationEmployee {
  id: string
  nik: string
  name: string
  department: string
  project: string
}

export interface AttendanceLocation {
  id: string
  code: string
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
  radius: number // in meters (min 10, max 500)
  scope: 'all' | 'specific' // 'all' = Berlaku Semua Karyawan, 'specific' = Karyawan Spesifik
  assignedEmployees: AttendanceLocationEmployee[]
  assignedProjects: string[]
  status: 'Active' | 'Inactive'
  createdAt: string
}

const mockAllEmployees: AttendanceLocationEmployee[] = [
  { id: 'EMP-014', nik: 'EMP-014', name: 'Andi Pratama', department: 'Site Operations', project: 'Outsourcing - Astra Tower Site' },
  { id: 'EMP-021', nik: 'EMP-021', name: 'Rina Sari', department: 'Site Operations', project: 'Outsourcing - Astra Tower Site' },
  { id: 'EMP-032', nik: 'EMP-032', name: 'Dodi Saputra', department: 'Facility Management', project: 'Outsourcing - Warehouse Cikarang' },
  { id: 'EMP-045', nik: 'EMP-045', name: 'Maya Savitri', department: 'Human Resources', project: 'Corporate Backoffice HQ' },
  { id: 'EMP-056', nik: 'EMP-056', name: 'Bambang Wicaksono', department: 'Customer Care & Outlet', project: 'Retail Outlet Surabaya' },
  { id: 'EMP-067', nik: 'EMP-067', name: 'Siti Rahmawati', department: 'Field Service Dispatch', project: 'Mobile Field Inspector' },
  { id: 'EMP-078', nik: 'EMP-078', name: 'Hendra Gunawan', department: 'Security & Safety', project: 'Outsourcing - Astra Tower Site' },
  { id: 'EMP-089', nik: 'EMP-089', name: 'Dian Permana', department: 'Logistics Operations', project: 'Outsourcing - Warehouse Cikarang' },
]

const initialLocations: AttendanceLocation[] = [
  {
    id: 'loc-hq-jakarta',
    code: 'LOC-HQ-01',
    name: 'Kantor Pusat - Menara Sudirman',
    address: 'Menara Sudirman Lt. 18, Jl. Jend. Sudirman Kav. 60, Kebayoran Baru, Jakarta Selatan',
    city: 'Jakarta Selatan',
    latitude: -6.2238,
    longitude: 106.8095,
    radius: 50,
    scope: 'all',
    assignedEmployees: [],
    assignedProjects: ['Corporate Backoffice HQ'],
    status: 'Active',
    createdAt: '2026-01-01',
  },
  {
    id: 'loc-site-astra',
    code: 'LOC-ASTRA-01',
    name: 'Client Site - Menara Astra',
    address: 'Menara Astra, Jl. Jend. Sudirman No. Kav 5-6, Karet Tengsin, Tanah Abang, Jakarta Pusat',
    city: 'Jakarta Pusat',
    latitude: -6.2053,
    longitude: 106.8227,
    radius: 75,
    scope: 'specific',
    assignedEmployees: [
      mockAllEmployees[0], // Andi Pratama
      mockAllEmployees[1], // Rina Sari
      mockAllEmployees[5], // Siti Rahmawati (Multi-site!)
      mockAllEmployees[6], // Hendra Gunawan
    ],
    assignedProjects: ['Outsourcing - Astra Tower Site'],
    status: 'Active',
    createdAt: '2026-01-15',
  },
  {
    id: 'loc-warehouse-cikarang',
    code: 'LOC-CKR-01',
    name: 'Client Site - Warehouse Cikarang Barat',
    address: 'Kawasan Industri MM2100 Blok C-3, Cikarang Barat, Kabupaten Bekasi, Jawa Barat',
    city: 'Bekasi',
    latitude: -6.3051,
    longitude: 107.1422,
    radius: 100,
    scope: 'specific',
    assignedEmployees: [
      mockAllEmployees[2], // Dodi Saputra
      mockAllEmployees[5], // Siti Rahmawati (Multi-site: bisa absen di Astra dan Cikarang!)
      mockAllEmployees[7], // Dian Permana
    ],
    assignedProjects: ['Outsourcing - Warehouse Cikarang'],
    status: 'Active',
    createdAt: '2026-02-01',
  },
  {
    id: 'loc-branch-surabaya',
    code: 'LOC-SBY-01',
    name: 'Kantor Cabang - Intiland Tower Surabaya',
    address: 'Intiland Tower Lt. 5, Jl. Panglima Sudirman No. 101-103, Genteng, Kota Surabaya',
    city: 'Surabaya',
    latitude: -7.2575,
    longitude: 112.7521,
    radius: 60,
    scope: 'specific',
    assignedEmployees: [
      mockAllEmployees[4], // Bambang Wicaksono
    ],
    assignedProjects: ['Retail Outlet Surabaya'],
    status: 'Active',
    createdAt: '2026-02-15',
  },
]

interface AttendanceLocationStore {
  locations: AttendanceLocation[]
  availableEmployees: AttendanceLocationEmployee[]

  addLocation: (data: Omit<AttendanceLocation, 'id' | 'createdAt'>) => void
  updateLocation: (id: string, data: Partial<AttendanceLocation>) => void
  deleteLocation: (id: string) => void
  assignEmployeesToLocation: (locationId: string, employees: AttendanceLocationEmployee[]) => void
  parseCoordinatesInput: (rawText: string) => { lat: number; lng: number } | null
}

export const useAttendanceLocationStore = create<AttendanceLocationStore>((set, get) => ({
  locations: initialLocations,
  availableEmployees: mockAllEmployees,

  addLocation: (data) => {
    const id = `loc-${Date.now()}`
    const newLocation: AttendanceLocation = {
      ...data,
      id,
      createdAt: dayjs().format('YYYY-MM-DD'),
    }
    set({ locations: [newLocation, ...get().locations] })
  },

  updateLocation: (id, data) => {
    set({
      locations: get().locations.map((loc) => (loc.id === id ? { ...loc, ...data } : loc)),
    })
  },

  deleteLocation: (id) => {
    set({
      locations: get().locations.filter((loc) => loc.id !== id),
    })
  },

  assignEmployeesToLocation: (locationId, employees) => {
    set({
      locations: get().locations.map((loc) =>
        loc.id === locationId ? { ...loc, assignedEmployees: employees } : loc,
      ),
    })
  },

  parseCoordinatesInput: (rawText: string) => {
    if (!rawText || !rawText.trim()) return null
    // Clean string e.g. "-6.2088, 106.8456" or "-6.2088 106.8456" or "lat: -6.2088, lng: 106.8456"
    const cleaned = rawText.replace(/[^\d.,\-+ ]/g, ' ')
    const parts = cleaned
      .split(/[, ]+/)
      .map((s) => s.trim())
      .filter(Boolean)

    if (parts.length >= 2) {
      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng }
      }
    }
    return null
  },
}))
