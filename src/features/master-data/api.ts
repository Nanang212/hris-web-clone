// api.ts — Master Data API and simulated in-memory store

import type {
  Department,
  Division,
  Position,
  Grade,
  Shift,
  Holiday,
  LeaveType,
  PayrollComponent,
  MasterDataStats,
} from './types'

// --- In-Memory Seed Data ---
let departments: Department[] = [
  { id: 'dept-01', code: 'IT-ENG', name: 'Engineering', managerName: 'Budi Santoso', parentDepartmentName: '-', status: 'active' },
  { id: 'dept-02', code: 'HR-OPS', name: 'Human Resource', managerName: 'Siti Aminah', parentDepartmentName: '-', status: 'active' },
  { id: 'dept-03', code: 'MKT-SAL', name: 'Marketing', managerName: 'Dian Kurniawan', parentDepartmentName: '-', status: 'active' },
  { id: 'dept-04', code: 'FIN-ACC', name: 'Finance & Accounting', managerName: 'Siti Rahayu', parentDepartmentName: '-', status: 'active' },
  { id: 'dept-05', code: 'OPS-GEN', name: 'Operations', managerName: 'Bambang Utomo', parentDepartmentName: '-', status: 'active' },
]

let divisions: Division[] = [
  { id: 'div-01', code: 'ENG-BE', name: 'Backend Engineering', departmentName: 'Engineering', description: 'Tim Backend Service & Core API', status: 'active' },
  { id: 'div-02', code: 'ENG-FE', name: 'Frontend Engineering', departmentName: 'Engineering', description: 'Tim Web App & Interface', status: 'active' },
  { id: 'div-03', code: 'HR-REC', name: 'Recruitment', departmentName: 'Human Resource', description: 'Tim Akuisisi Talenta & Interview', status: 'active' },
  { id: 'div-04', code: 'FIN-TAX', name: 'Taxation & Treasury', departmentName: 'Finance & Accounting', description: 'Perpajakan (PPh21) dan arus kas', status: 'active' },
]

let positions: Position[] = [
  { id: 'pos-01', code: 'ENG-SWE', name: 'Software Engineer', departmentName: 'Engineering', divisionName: 'Backend Engineering', jobDescription: 'Membangun API, database schema, dan optimasi query backend.', status: 'active' },
  { id: 'pos-02', code: 'ENG-FE', name: 'Frontend Developer', departmentName: 'Engineering', divisionName: 'Frontend Engineering', jobDescription: 'Mengimplementasikan UI design mockup menjadi halaman interaktif.', status: 'active' },
  { id: 'pos-03', code: 'MKT-MGR', name: 'Marketing Manager', departmentName: 'Marketing', divisionName: '-', jobDescription: 'Merencanakan kampanye promosi produk dan peningkatan profit.', status: 'active' },
  { id: 'pos-04', code: 'FIN-ANL', name: 'Finance Analyst', departmentName: 'Finance & Accounting', divisionName: 'Taxation & Treasury', jobDescription: 'Menganalisa cashflow bulanan dan kepatuhan pajak TER/PTKP.', status: 'active' },
]

let grades: Grade[] = [
  { id: 'grd-01', code: 'GR-01', name: 'Junior Associate', level: 1, minSalary: 5000000, maxSalary: 8000000, status: 'active' },
  { id: 'grd-02', code: 'GR-02', name: 'Senior Associate', level: 2, minSalary: 8000000, maxSalary: 15000000, status: 'active' },
  { id: 'grd-03', code: 'GR-03', name: 'Lead / Specialist', level: 3, minSalary: 15000000, maxSalary: 25000000, status: 'active' },
  { id: 'grd-04', code: 'GR-04', name: 'Manager / VP', level: 4, minSalary: 25000000, maxSalary: 45000000, status: 'active' },
]

let shifts: Shift[] = [
  { id: 'shf-01', code: 'SH-PGI', name: 'Shift Pagi Standard', startTime: '08:00', endTime: '17:00', gracePeriod: 15, status: 'active' },
  { id: 'shf-02', code: 'SH-SLS', name: 'Shift Sore', startTime: '14:00', endTime: '22:00', gracePeriod: 15, status: 'active' },
  { id: 'shf-03', code: 'SH-MLM', name: 'Shift Malam', startTime: '22:00', endTime: '06:00', gracePeriod: 10, status: 'active' },
]

let holidays: Holiday[] = [
  { id: 'hol-01', name: 'Tahun Baru Masehi', date: '2026-01-01', type: 'national', description: 'Perayaan tahun baru masehi sedunia.', status: 'active' },
  { id: 'hol-02', name: 'Hari Raya Idul Fitri', date: '2026-03-30', type: 'national', description: 'Lebaran / Idul Fitri umat muslim.', status: 'active' },
  { id: 'hol-03', name: 'Hari Kemerdekaan RI', date: '2026-08-17', type: 'national', description: 'Hari Ulang Tahun Kemerdekaan Republik Indonesia.', status: 'active' },
]

let leaveTypes: LeaveType[] = [
  { id: 'lv-01', code: 'L-ANN', name: 'Cuti Tahunan', defaultAllowance: 12, isPaid: true, canCarryForward: true, status: 'active' },
  { id: 'lv-02', code: 'L-SKT', name: 'Cuti Sakit', defaultAllowance: 30, isPaid: true, canCarryForward: false, status: 'active' },
  { id: 'lv-03', code: 'L-MLR', name: 'Cuti Melahirkan', defaultAllowance: 90, isPaid: true, canCarryForward: false, status: 'active' },
]

let payrollComponents: PayrollComponent[] = [
  { id: 'pay-01', code: 'C-GP', name: 'Gaji Pokok', type: 'earning', defaultValue: 5000000, isFormula: false, formula: '', status: 'active' },
  { id: 'pay-02', code: 'C-TJB', name: 'Tunjangan Jabatan', type: 'earning', defaultValue: 1500000, isFormula: false, formula: '', status: 'active' },
  { id: 'pay-03', code: 'C-POT', name: 'Potongan Keterlambatan', type: 'deduction', defaultValue: 50000, isFormula: true, formula: 'late_minutes * 2000', status: 'active' },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// --- API Implementation ---

export async function fetchMasterDataStats(): Promise<MasterDataStats> {
  await delay(300)
  return {
    departmentsCount: departments.length,
    divisionsCount: divisions.length,
    positionsCount: positions.length,
    gradesCount: grades.length,
    shiftsCount: shifts.length,
    holidaysCount: holidays.length,
    leaveTypesCount: leaveTypes.length,
    payrollComponentsCount: payrollComponents.length,
  }
}

// 1. Departments CRUD
export async function fetchDepartments(): Promise<Department[]> {
  await delay(300)
  return [...departments]
}

export async function createDepartment(data: Omit<Department, 'id'>): Promise<Department> {
  await delay(300)
  const newDept: Department = { ...data, id: `dept-${Date.now()}` }
  departments.push(newDept)
  return newDept
}

export async function updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
  await delay(300)
  departments = departments.map((d) => (d.id === id ? { ...d, ...updates } : d))
  const updated = departments.find((d) => d.id === id)
  if (!updated) throw new Error('Department not found')
  return updated
}

export async function deleteDepartment(id: string): Promise<void> {
  await delay(300)
  departments = departments.filter((d) => d.id !== id)
}

// 2. Divisions CRUD
export async function fetchDivisions(): Promise<Division[]> {
  await delay(300)
  return [...divisions]
}

export async function createDivision(data: Omit<Division, 'id'>): Promise<Division> {
  await delay(300)
  const newDiv: Division = { ...data, id: `div-${Date.now()}` }
  divisions.push(newDiv)
  return newDiv
}

export async function updateDivision(id: string, updates: Partial<Division>): Promise<Division> {
  await delay(300)
  divisions = divisions.map((d) => (d.id === id ? { ...d, ...updates } : d))
  const updated = divisions.find((d) => d.id === id)
  if (!updated) throw new Error('Division not found')
  return updated
}

export async function deleteDivision(id: string): Promise<void> {
  await delay(300)
  divisions = divisions.filter((d) => d.id !== id)
}

// 3. Positions CRUD
export async function fetchPositions(): Promise<Position[]> {
  await delay(300)
  return [...positions]
}

export async function createPosition(data: Omit<Position, 'id'>): Promise<Position> {
  await delay(300)
  const newPos: Position = { ...data, id: `pos-${Date.now()}` }
  positions.push(newPos)
  return newPos
}

export async function updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
  await delay(300)
  positions = positions.map((d) => (d.id === id ? { ...d, ...updates } : d))
  const updated = positions.find((d) => d.id === id)
  if (!updated) throw new Error('Position not found')
  return updated
}

export async function deletePosition(id: string): Promise<void> {
  await delay(300)
  positions = positions.filter((d) => d.id !== id)
}

// 4. Grades CRUD
export async function fetchGrades(): Promise<Grade[]> {
  await delay(300)
  return [...grades]
}

export async function createGrade(data: Omit<Grade, 'id'>): Promise<Grade> {
  await delay(300)
  const newGrade: Grade = { ...data, id: `grd-${Date.now()}` }
  grades.push(newGrade)
  return newGrade
}

export async function updateGrade(id: string, updates: Partial<Grade>): Promise<Grade> {
  await delay(300)
  grades = grades.map((d) => (d.id === id ? { ...d, ...updates } : d))
  const updated = grades.find((d) => d.id === id)
  if (!updated) throw new Error('Grade not found')
  return updated
}

export async function deleteGrade(id: string): Promise<void> {
  await delay(300)
  grades = grades.filter((d) => d.id !== id)
}

// 5. Shifts CRUD
export async function fetchShifts(): Promise<Shift[]> {
  await delay(300)
  return [...shifts]
}

export async function createShift(data: Omit<Shift, 'id'>): Promise<Shift> {
  await delay(300)
  const newShift: Shift = { ...data, id: `shf-${Date.now()}` }
  shifts.push(newShift)
  return newShift
}

export async function updateShift(id: string, updates: Partial<Shift>): Promise<Shift> {
  await delay(300)
  shifts = shifts.map((d) => (d.id === id ? { ...d, ...updates } : d))
  const updated = shifts.find((d) => d.id === id)
  if (!updated) throw new Error('Shift not found')
  return updated
}

export async function deleteShift(id: string): Promise<void> {
  await delay(300)
  shifts = shifts.filter((d) => d.id !== id)
}

// 6. Holidays CRUD
export async function fetchHolidays(): Promise<Holiday[]> {
  await delay(300)
  return [...holidays]
}

export async function createHoliday(data: Omit<Holiday, 'id'>): Promise<Holiday> {
  await delay(300)
  const newHoliday: Holiday = { ...data, id: `hol-${Date.now()}` }
  holidays.push(newHoliday)
  return newHoliday
}

export async function updateHoliday(id: string, updates: Partial<Holiday>): Promise<Holiday> {
  await delay(300)
  holidays = holidays.map((d) => (d.id === id ? { ...d, ...updates } : d))
  const updated = holidays.find((d) => d.id === id)
  if (!updated) throw new Error('Holiday not found')
  return updated
}

export async function deleteHoliday(id: string): Promise<void> {
  await delay(300)
  holidays = holidays.filter((d) => d.id !== id)
}

// 7. Leave Types CRUD
export async function fetchLeaveTypes(): Promise<LeaveType[]> {
  await delay(300)
  return [...leaveTypes]
}

export async function createLeaveType(data: Omit<LeaveType, 'id'>): Promise<LeaveType> {
  await delay(300)
  const newLeave: LeaveType = { ...data, id: `lv-${Date.now()}` }
  leaveTypes.push(newLeave)
  return newLeave
}

export async function updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<LeaveType> {
  await delay(300)
  leaveTypes = leaveTypes.map((d) => (d.id === id ? { ...d, ...updates } : d))
  const updated = leaveTypes.find((d) => d.id === id)
  if (!updated) throw new Error('Leave type not found')
  return updated
}

export async function deleteLeaveType(id: string): Promise<void> {
  await delay(300)
  leaveTypes = leaveTypes.filter((d) => d.id !== id)
}

// 8. Payroll Components CRUD
export async function fetchPayrollComponents(): Promise<PayrollComponent[]> {
  await delay(300)
  return [...payrollComponents]
}

export async function createPayrollComponent(data: Omit<PayrollComponent, 'id'>): Promise<PayrollComponent> {
  await delay(300)
  const newPay: PayrollComponent = { ...data, id: `pay-${Date.now()}` }
  payrollComponents.push(newPay)
  return newPay
}

export async function updatePayrollComponent(id: string, updates: Partial<PayrollComponent>): Promise<PayrollComponent> {
  await delay(300)
  payrollComponents = payrollComponents.map((d) => (d.id === id ? { ...d, ...updates } : d))
  const updated = payrollComponents.find((d) => d.id === id)
  if (!updated) throw new Error('Payroll component not found')
  return updated
}

export async function deletePayrollComponent(id: string): Promise<void> {
  await delay(300)
  payrollComponents = payrollComponents.filter((d) => d.id !== id)
}
