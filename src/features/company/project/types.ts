export type ProjectStatus = 'PLANNING' | 'ONGOING' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'

export interface ProjectAddress {
  id?: string
  address: string
  latitude?: number | null
  longitude?: number | null
  geofenceRadiusMeters?: number | null
}

export interface ProjectAttendancePayrollPolicy {
  /**
   * Apakah absensi (alpa/terlambat) mempengaruhi perhitungan penggajian karyawan di project ini.
   * Default: true. Jika false, absensi tetap dicatat tapi tidak memotong gaji / tidak mengenakan denda telat.
   */
  attendanceAffectsPayroll: boolean
  /** Potong gaji pokok bila ada hari tanpa keterangan / alpa (No Work No Pay) */
  deductAbsence: boolean
  /** Potong denda nominal bila ada keterlambatan masuk kerja */
  deductLate: boolean
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
  employeeIds?: string[]
  assignmentStartDate?: string | null
  assignmentEndDate?: string | null
  attendancePolicy?: ProjectAttendancePayrollPolicy
  createdAt: string
  updatedAt: string
}

