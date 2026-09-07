import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CompanyBranch,
  CompanyProfile,
  CompanyStats,
  CorporateSettings,
  OfficeLocation,
} from '../types'

interface CompanyState {
  profile: CompanyProfile
  corporateSettings: CorporateSettings
  locations: OfficeLocation[]
  branches: CompanyBranch[]

  // Actions
  updateProfile: (data: Partial<CompanyProfile>) => void
  updateCorporateSettings: (data: Partial<CorporateSettings>) => void

  // Location Actions
  addLocation: (location: Omit<OfficeLocation, 'id'>) => void
  updateLocation: (id: string, data: Partial<OfficeLocation>) => void
  deleteLocation: (id: string) => void

  // Branch Actions
  addBranch: (branch: Omit<CompanyBranch, 'id'>) => void
  updateBranch: (id: string, data: Partial<CompanyBranch>) => void
  deleteBranch: (id: string) => void

  // Helper selectors
  getStats: () => CompanyStats
}

const initialProfile: CompanyProfile = {
  name: 'Bintang Fajar Persada',
  legalName: 'PT Bintang Fajar Persada',
  code: 'COMP-001',
  industry: 'Technology & Professional Services',
  establishedDate: '12 March 2010',
  taxId: '01.234.567.6-081.000',
  email: 'info@bintangfajar.co.id',
  phone: '+62 21 1234 5678',
  website: 'www.bintangfajar.co.id',
  description:
    'Integrated SDM and workforce solutions company focused on operational excellence.',
  headOfficeName: 'Jakarta HQ',
  cityProvince: 'Jakarta - DKI Jakarta',
  country: 'Indonesia',
  address: 'Jl. Sudirman No. 123, Jakarta 12190, Indonesia',
  status: 'Active',
  profileCompletion: 92,
  totalEmployees: 1248,
}

const initialCorporateSettings: CorporateSettings = {
  timezone: 'Asia/Jakarta (GMT+7)',
  workingWeek: 'Monday - Friday',
  defaultCurrency: 'IDR - Indonesian Rupiah',
  payrollCutoff: '25th of each month',
  fiscalYear: 'January - December',
  language: 'Bahasa Indonesia / English',
}

const initialLocations: OfficeLocation[] = [
  {
    id: 'loc-1',
    name: 'Jakarta HQ',
    code: 'HQ',
    branchName: 'Jakarta HQ',
    type: 'Head Office',
    city: 'Jakarta',
    address: 'Jl. Sudirman No. 123, Lantai 15-18, Jakarta Selatan',
    employeesCount: 245,
    geofenceRadius: 150,
    status: 'Active',
    latitude: -6.2088,
    longitude: 106.8456,
  },
  {
    id: 'loc-2',
    name: 'Surabaya Office',
    code: 'SBY',
    branchName: 'Surabaya Branch',
    type: 'Branch',
    city: 'Surabaya',
    address: 'Jl. Pemuda No. 45, Gubeng, Surabaya',
    employeesCount: 89,
    geofenceRadius: 100,
    status: 'Active',
    latitude: -7.2575,
    longitude: 112.7521,
  },
  {
    id: 'loc-3',
    name: 'Bandung Office',
    code: 'BDG',
    branchName: 'Bandung Branch',
    type: 'Branch',
    city: 'Bandung',
    address: 'Jl. Asia Afrika No. 88, Sumur Bandung',
    employeesCount: 58,
    geofenceRadius: 100,
    status: 'Active',
    latitude: -6.9175,
    longitude: 107.6191,
  },
  {
    id: 'loc-4',
    name: 'Singapore Office',
    code: 'SG',
    branchName: 'Singapore Regional Office',
    type: 'Regional',
    city: 'Singapore',
    address: '1 Raffles Place, #20-01 One Raffles Place',
    employeesCount: 32,
    geofenceRadius: 200,
    status: 'Active',
    latitude: 1.2843,
    longitude: 103.8519,
  },
  {
    id: 'loc-5',
    name: 'Warehouse Cikarang',
    code: 'CKR',
    branchName: 'Jakarta HQ',
    type: 'Warehouse',
    city: 'Bekasi',
    address: 'Kawasan Industri GIIC Blok AA No. 12, Cikarang',
    employeesCount: 42,
    geofenceRadius: 150,
    status: 'Inactive',
    latitude: -6.3688,
    longitude: 107.1685,
  },
  {
    id: 'loc-6',
    name: 'Bali Creative Hub',
    code: 'DPS',
    branchName: 'Surabaya Branch',
    type: 'Remote Hub',
    city: 'Denpasar',
    address: 'Jl. Sunset Road No. 108, Kuta, Bali',
    employeesCount: 26,
    geofenceRadius: 120,
    status: 'Active',
    latitude: -8.6705,
    longitude: 115.2126,
  },
  {
    id: 'loc-7',
    name: 'Medan Representative',
    code: 'MDN',
    branchName: 'Jakarta HQ',
    type: 'Branch',
    city: 'Medan',
    address: 'Jl. Balai Kota No. 1, Kesawan, Medan',
    employeesCount: 18,
    geofenceRadius: 100,
    status: 'Active',
    latitude: 3.5952,
    longitude: 98.6722,
  },
]

const initialBranches: CompanyBranch[] = [
  {
    id: 'br-1',
    name: 'Jakarta HQ - JKT',
    code: 'JKT',
    type: 'Head Office',
    city: 'Jakarta',
    linkedOffice: 'Jakarta HQ',
    picName: 'Vania Yulius',
    picEmail: 'vania.yulius@bintangfajar.co.id',
    employeesCount: 245,
    status: 'Active',
  },
  {
    id: 'br-2',
    name: 'Surabaya - SBY',
    code: 'SBY',
    type: 'Branch',
    city: 'Surabaya',
    linkedOffice: 'Surabaya Office',
    picName: 'Dinta Maharani',
    picEmail: 'dinta.maharani@bintangfajar.co.id',
    employeesCount: 89,
    status: 'Active',
  },
  {
    id: 'br-3',
    name: 'Bandung - BDG',
    code: 'BDG',
    type: 'Branch',
    city: 'Bandung',
    linkedOffice: 'Bandung Office',
    picName: 'Budi Setiawan',
    picEmail: 'budi.setiawan@bintangfajar.co.id',
    employeesCount: 58,
    status: 'Active',
  },
  {
    id: 'br-4',
    name: 'Singapore - SG',
    code: 'SG',
    type: 'Regional',
    city: 'Singapore',
    linkedOffice: 'Singapore Office',
    picName: 'Dewi Sartika',
    picEmail: 'dewi.sartika@bintangfajar.co.id',
    employeesCount: 32,
    status: 'Active',
  },
]

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      corporateSettings: initialCorporateSettings,
      locations: initialLocations,
      branches: initialBranches,

      updateProfile: (data) =>
        set((state) => ({
          profile: { ...state.profile, ...data },
        })),

      updateCorporateSettings: (data) =>
        set((state) => ({
          corporateSettings: { ...state.corporateSettings, ...data },
        })),

      addLocation: (locationData) =>
        set((state) => ({
          locations: [
            ...state.locations,
            {
              ...locationData,
              id: `loc-${Date.now()}`,
            },
          ],
        })),

      updateLocation: (id, data) =>
        set((state) => ({
          locations: state.locations.map((loc) => (loc.id === id ? { ...loc, ...data } : loc)),
        })),

      deleteLocation: (id) =>
        set((state) => ({
          locations: state.locations.filter((loc) => loc.id !== id),
        })),

      addBranch: (branchData) =>
        set((state) => ({
          branches: [
            ...state.branches,
            {
              ...branchData,
              id: `br-${Date.now()}`,
            },
          ],
        })),

      updateBranch: (id, data) =>
        set((state) => ({
          branches: state.branches.map((b) => (b.id === id ? { ...b, ...data } : b)),
        })),

      deleteBranch: (id) =>
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== id),
        })),

      getStats: () => {
        const { profile, locations, branches } = get()
        const uniqueCities = new Set([
          ...locations.map((l) => l.city),
          ...branches.map((b) => b.city),
        ])

        return {
          profileCompletion: profile.profileCompletion,
          totalBranches: branches.length,
          activeBranches: branches.filter((b) => b.status === 'Active').length,
          totalLocations: locations.length,
          activeLocations: locations.filter((l) => l.status === 'Active').length,
          headOfficeCount: locations.filter((l) => l.type === 'Head Office').length,
          totalEmployees: profile.totalEmployees,
          citiesCount: uniqueCities.size,
        }
      },
    }),
    {
      name: 'hris-company-settings-storage',
    },
  ),
)
