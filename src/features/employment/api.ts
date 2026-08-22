// api.ts — Employment feature API calls with in-memory dummy data

import type {
  CreateEmployeePayload,
  Employee,
  EmployeeDocument,
  EmployeeEmploymentInfo,
  EmployeeFilterParams,
  EmployeeLeaveBalance,
  EmployeePayrollInfo,
  EmployeePersonalInfo,
  EmployeeStats,
  UpdateEmployeePayload,
  EmployeeContract,
  EmployeeMutation,
  CreateMutationPayload,
} from '@/features/employment/types'
import type { Envelope, PaginatedData } from '@/shared/types'

// In-Memory Data Store
let mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    employeeCode: 'EMP001',
    fullName: 'Rian Wijaya',
    email: 'rian.wijaya@company.com',
    phone: '081234567890',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    departmentId: 'dept-1',
    departmentName: 'IT & Engineering',
    divisionId: 'div-1',
    divisionName: 'Web Platform',
    positionId: 'pos-1',
    positionName: 'Senior Frontend Engineer',
    gradeId: 'grade-3',
    gradeName: 'Grade 3',
    status: 'active',
    contractType: 'permanent',
    joinDate: '2023-01-15',
    endDate: null,
    managerId: 'emp-3',
    managerName: 'Budi Santoso',
    workLocation: 'Head Office Jakarta',
    createdAt: '2023-01-15T08:00:00Z',
    updatedAt: '2023-01-15T08:00:00Z',
  },
  {
    id: 'emp-2',
    employeeCode: 'EMP002',
    fullName: 'Siti Aminah',
    email: 'siti.aminah@company.com',
    phone: '087712345678',
    photo: null,
    departmentId: 'dept-2',
    departmentName: 'Human Resource',
    divisionId: null,
    divisionName: null,
    positionId: 'pos-2',
    positionName: 'HR Specialist',
    gradeId: 'grade-2',
    gradeName: 'Grade 2',
    status: 'probation',
    contractType: 'contract',
    joinDate: '2026-06-01',
    endDate: '2027-06-01',
    managerId: 'emp-4',
    managerName: 'Dewi Lestari',
    workLocation: 'Bandung Office',
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'emp-3',
    employeeCode: 'EMP003',
    fullName: 'Budi Santoso',
    email: 'budi.santoso@company.com',
    phone: '081122334455',
    photo: null,
    departmentId: 'dept-1',
    departmentName: 'IT & Engineering',
    divisionId: null,
    divisionName: null,
    positionId: 'pos-3',
    positionName: 'Engineering Manager',
    gradeId: 'grade-4',
    gradeName: 'Grade 4',
    status: 'active',
    contractType: 'permanent',
    joinDate: '2020-03-10',
    endDate: null,
    managerId: null,
    managerName: null,
    workLocation: 'Head Office Jakarta',
    createdAt: '2020-03-10T08:00:00Z',
    updatedAt: '2020-03-10T08:00:00Z',
  },
  {
    id: 'emp-4',
    employeeCode: 'EMP004',
    fullName: 'Dewi Lestari',
    email: 'dewi.lestari@company.com',
    phone: '082233445566',
    photo: null,
    departmentId: 'dept-2',
    departmentName: 'Human Resource',
    divisionId: null,
    divisionName: null,
    positionId: 'pos-4',
    positionName: 'HR Manager',
    gradeId: 'grade-4',
    gradeName: 'Grade 4',
    status: 'active',
    contractType: 'permanent',
    joinDate: '2021-05-12',
    endDate: null,
    managerId: null,
    managerName: null,
    workLocation: 'Head Office Jakarta',
    createdAt: '2021-05-12T08:00:00Z',
    updatedAt: '2021-05-12T08:00:00Z',
  },
]

const mockPersonalInfos: Record<string, EmployeePersonalInfo> = {
  'emp-1': {
    employeeId: 'emp-1',
    nik: '3171012345678901',
    birthPlace: 'Jakarta',
    birthDate: '1995-08-20',
    gender: 'male',
    maritalStatus: 'single',
    religion: 'Islam',
    bloodType: 'O',
    address: 'Jl. Kemang Raya No. 12',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12730',
    emergencyContactName: 'Indah Lestari',
    emergencyContactRelation: 'Ibu Kandung',
    emergencyContactPhone: '081299998888',
  },
  'emp-2': {
    employeeId: 'emp-2',
    nik: '3273019876543210',
    birthPlace: 'Bandung',
    birthDate: '1998-04-12',
    gender: 'female',
    maritalStatus: 'single',
    religion: 'Islam',
    bloodType: 'A',
    address: 'Jl. Dago Pakar No. 45',
    city: 'Bandung',
    province: 'Jawa Barat',
    postalCode: '40135',
    emergencyContactName: 'Agus Setiawan',
    emergencyContactRelation: 'Ayah Kandung',
    emergencyContactPhone: '087766665555',
  },
}

const mockEmploymentInfos: Record<string, EmployeeEmploymentInfo> = {
  'emp-1': {
    employeeId: 'emp-1',
    contractType: 'permanent',
    contractStart: '2023-01-15',
    contractEnd: null,
    shiftId: 'shift-1',
    shiftName: 'Shift Pagi (08:00 - 17:00)',
    workLocation: 'Head Office Jakarta',
    managerId: 'emp-3',
    managerName: 'Budi Santoso',
    bpjsKetenagakerjaanNo: '12345678901',
    bpjsKesehatanNo: '98765432109',
    npwp: '01.234.567.8-901.000',
    taxStatus: 'TK/0',
  },
  'emp-2': {
    employeeId: 'emp-2',
    contractType: 'contract',
    contractStart: '2026-06-01',
    contractEnd: '2027-06-01',
    shiftId: 'shift-1',
    shiftName: 'Shift Pagi (08:00 - 17:00)',
    workLocation: 'Bandung Office',
    managerId: 'emp-4',
    managerName: 'Dewi Lestari',
    bpjsKetenagakerjaanNo: '11223344556',
    bpjsKesehatanNo: '66778899001',
    npwp: '02.456.789.0-901.000',
    taxStatus: 'TK/0',
  },
}

const mockDocuments: Record<string, EmployeeDocument[]> = {
  'emp-1': [
    {
      id: 'doc-1',
      employeeId: 'emp-1',
      name: 'KTP_Rian_Wijaya.pdf',
      type: 'Identity Card (KTP)',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: 102450,
      uploadedAt: '2023-01-15T09:00:00Z',
      uploadedBy: 'System Admin',
    },
    {
      id: 'doc-2',
      employeeId: 'emp-1',
      name: 'Kontrak_Kerja_Rian.pdf',
      type: 'Employment Contract',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: 2048500,
      uploadedAt: '2023-01-15T09:10:00Z',
      uploadedBy: 'HR Specialist',
    },
  ],
}

const mockPayrolls: Record<string, EmployeePayrollInfo> = {
  'emp-1': {
    employeeId: 'emp-1',
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '1234567890',
    accountHolderName: 'RIAN WIJAYA',
    npwp: '01.234.567.8-901.000',
    bpjsKetenagakerjaanNo: '12345678901',
    bpjsKesehatanNo: '98765432109',
    basicSalary: 12000000,
    components: [
      {
        componentId: 'comp-1',
        componentName: 'Gaji Pokok',
        componentType: 'earning',
        amount: 12000000,
        isFormula: false,
        formula: null,
      },
      {
        componentId: 'comp-2',
        componentName: 'Tunjangan Transport',
        componentType: 'earning',
        amount: 1000000,
        isFormula: false,
        formula: null,
      },
      {
        componentId: 'comp-3',
        componentName: 'Potongan BPJS Kesehatan (1%)',
        componentType: 'deduction',
        amount: 120000,
        isFormula: true,
        formula: 'basic_salary * 0.01',
      },
    ],
  },
}

const mockLeaveBalances: Record<string, EmployeeLeaveBalance[]> = {
  'emp-1': [
    {
      leaveTypeId: 'lt-1',
      leaveTypeName: 'Cuti Tahunan',
      leaveTypeCode: 'AL',
      totalBalance: 12,
      used: 4,
      remaining: 8,
      isPaid: true,
      canCarryForward: true,
    },
    {
      leaveTypeId: 'lt-2',
      leaveTypeName: 'Cuti Sakit',
      leaveTypeCode: 'SL',
      totalBalance: 30,
      used: 2,
      remaining: 28,
      isPaid: true,
      canCarryForward: false,
    },
  ],
}

// Helper to simulate network latency
const sleep = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const getEmployees = async (params?: EmployeeFilterParams): Promise<Envelope<PaginatedData<Employee>>> => {
  await sleep()
  let filtered = [...mockEmployees]

  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q),
    )
  }

  if (params?.status) {
    filtered = filtered.filter((e) => e.status === params.status)
  }

  if (params?.departmentId) {
    filtered = filtered.filter((e) => e.departmentId === params.departmentId)
  }

  return {
    success: true,
    code: '200',
    data: {
      items: filtered,
      hasNext: false,
      nextCursor: null,
    },
    messages: [],
  }
}

export const getEmployeeStats = async (): Promise<Envelope<EmployeeStats>> => {
  await sleep()
  const total = mockEmployees.length
  const active = mockEmployees.filter((e) => e.status === 'active').length
  const probation = mockEmployees.filter((e) => e.status === 'probation').length
  const inactive = mockEmployees.filter((e) => e.status === 'inactive').length

  return {
    success: true,
    code: '200',
    data: {
      total,
      active,
      inactive,
      probation,
      newThisMonth: 1,
    },
    messages: [],
  }
}

export const getEmployeeById = async (id: string): Promise<Envelope<Employee>> => {
  await sleep()
  const emp = mockEmployees.find((e) => e.id === id)
  if (!emp) {
    throw new Error('Employee not found')
  }
  return {
    success: true,
    code: '200',
    data: emp,
    messages: [],
  }
}

export const createEmployee = async (payload: CreateEmployeePayload): Promise<Envelope<Employee>> => {
  await sleep()
  const newId = `emp-${mockEmployees.length + 1}`
  const newCode = `EMP${String(mockEmployees.length + 1).padStart(3, '0')}`

  const newEmp: Employee = {
    id: newId,
    employeeCode: newCode,
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    photo: null,
    departmentId: payload.departmentId,
    departmentName: payload.departmentId === 'dept-1' ? 'IT & Engineering' : 'Human Resource',
    divisionId: payload.divisionId ?? null,
    divisionName: payload.divisionId ? 'Web Platform' : null,
    positionId: payload.positionId,
    positionName: payload.positionId === 'pos-1' ? 'Software Engineer' : 'HR Specialist',
    gradeId: payload.gradeId,
    gradeName: `Grade ${payload.gradeId.split('-')[1] || '1'}`,
    status: 'active',
    contractType: payload.contractType,
    joinDate: payload.joinDate,
    endDate: payload.endDate ?? null,
    managerId: payload.managerId ?? null,
    managerName: payload.managerId ? 'Budi Santoso' : null,
    workLocation: payload.workLocation,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockEmployees.push(newEmp)

  // Seed default detail views for this new employee
  mockPersonalInfos[newId] = {
    employeeId: newId,
    nik: '1234567890123456',
    birthPlace: 'Jakarta',
    birthDate: '2000-01-01',
    gender: 'male',
    maritalStatus: 'single',
    religion: 'Islam',
    bloodType: 'AB',
    address: 'Jl. Sudirman No. 1',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postalCode: '10000',
    emergencyContactName: 'Emergency Contact',
    emergencyContactRelation: 'Kerabat',
    emergencyContactPhone: '08123456789',
  }

  mockEmploymentInfos[newId] = {
    employeeId: newId,
    contractType: payload.contractType,
    contractStart: payload.joinDate,
    contractEnd: payload.endDate ?? null,
    shiftId: payload.shiftId,
    shiftName: 'Shift Kerja Pagi',
    workLocation: payload.workLocation,
    managerId: payload.managerId ?? null,
    managerName: payload.managerId ? 'Budi Santoso' : null,
    bpjsKetenagakerjaanNo: '-',
    bpjsKesehatanNo: '-',
    npwp: '-',
    taxStatus: 'TK/0',
  }

  return {
    success: true,
    code: '201',
    data: newEmp,
    messages: [],
  }
}

export const updateEmployee = async (
  id: string,
  payload: UpdateEmployeePayload,
): Promise<Envelope<Employee>> => {
  await sleep()
  const idx = mockEmployees.findIndex((e) => e.id === id)
  if (idx === -1) {
    throw new Error('Employee not found')
  }

  const updated: Employee = {
    ...mockEmployees[idx],
    ...payload,
    fullName: payload.fullName ?? mockEmployees[idx].fullName,
    email: payload.email ?? mockEmployees[idx].email,
    phone: payload.phone ?? mockEmployees[idx].phone,
    departmentId: payload.departmentId ?? mockEmployees[idx].departmentId,
    positionId: payload.positionId ?? mockEmployees[idx].positionId,
    gradeId: payload.gradeId ?? mockEmployees[idx].gradeId,
    contractType: payload.contractType ?? mockEmployees[idx].contractType,
    joinDate: payload.joinDate ?? mockEmployees[idx].joinDate,
    endDate: payload.endDate !== undefined ? payload.endDate : mockEmployees[idx].endDate,
    workLocation: payload.workLocation ?? mockEmployees[idx].workLocation,
    managerId: payload.managerId !== undefined ? payload.managerId : mockEmployees[idx].managerId,
    status: payload.status ?? mockEmployees[idx].status,
    updatedAt: new Date().toISOString(),
  }

  mockEmployees[idx] = updated
  return {
    success: true,
    code: '200',
    data: updated,
    messages: [],
  }
}

export const deleteEmployee = async (id: string): Promise<Envelope<null>> => {
  await sleep()
  mockEmployees = mockEmployees.filter((e) => e.id !== id)
  return {
    success: true,
    code: '200',
    data: null,
    messages: [],
  }
}

export const getEmployeePersonalInfo = async (id: string): Promise<Envelope<EmployeePersonalInfo>> => {
  await sleep()
  const info = mockPersonalInfos[id] || {
    employeeId: id,
    nik: '—',
    birthPlace: '—',
    birthDate: '—',
    gender: 'male',
    maritalStatus: 'single',
    religion: '—',
    bloodType: '—',
    address: '—',
    city: '—',
    province: '—',
    postalCode: '—',
    emergencyContactName: '—',
    emergencyContactRelation: '—',
    emergencyContactPhone: '—',
  }
  return {
    success: true,
    code: '200',
    data: info,
    messages: [],
  }
}

export const updateEmployeePersonalInfo = async (
  id: string,
  payload: Partial<EmployeePersonalInfo>,
): Promise<Envelope<EmployeePersonalInfo>> => {
  await sleep()
  const current = mockPersonalInfos[id] || {
    employeeId: id,
    nik: '',
    birthPlace: '',
    birthDate: '',
    gender: 'male',
    maritalStatus: 'single',
    religion: '',
    bloodType: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
  }
  const updated = { ...current, ...payload }
  mockPersonalInfos[id] = updated
  return {
    success: true,
    code: '200',
    data: updated,
    messages: [],
  }
}

export const getEmployeeEmploymentInfo = async (id: string): Promise<Envelope<EmployeeEmploymentInfo>> => {
  await sleep()
  const info = mockEmploymentInfos[id] || {
    employeeId: id,
    contractType: 'permanent',
    contractStart: '—',
    contractEnd: null,
    shiftId: 'shift-1',
    shiftName: 'Shift Standard',
    workLocation: '—',
    managerId: null,
    managerName: '—',
    bpjsKetenagakerjaanNo: '—',
    bpjsKesehatanNo: '—',
    npwp: '—',
    taxStatus: '—',
  }
  return {
    success: true,
    code: '200',
    data: info,
    messages: [],
  }
}

export const updateEmployeeEmploymentInfo = async (
  id: string,
  payload: Partial<EmployeeEmploymentInfo>,
): Promise<Envelope<EmployeeEmploymentInfo>> => {
  await sleep()
  const current = mockEmploymentInfos[id] || {
    employeeId: id,
    contractType: 'permanent',
    contractStart: '',
    contractEnd: null,
    shiftId: '',
    shiftName: '',
    workLocation: '',
    managerId: null,
    managerName: '',
    bpjsKetenagakerjaanNo: '',
    bpjsKesehatanNo: '',
    npwp: '',
    taxStatus: '',
  }
  const updated = { ...current, ...payload }
  mockEmploymentInfos[id] = updated
  return {
    success: true,
    code: '200',
    data: updated,
    messages: [],
  }
}

export const getEmployeeDocuments = async (id: string): Promise<Envelope<EmployeeDocument[]>> => {
  await sleep()
  return {
    success: true,
    code: '200',
    data: mockDocuments[id] || [],
    messages: [],
  }
}

export const getEmployeePayrollInfo = async (id: string): Promise<Envelope<EmployeePayrollInfo>> => {
  await sleep()
  const info = mockPayrolls[id] || {
    employeeId: id,
    bankName: '—',
    accountNumber: '—',
    accountHolderName: '—',
    npwp: '—',
    bpjsKetenagakerjaanNo: '—',
    bpjsKesehatanNo: '—',
    basicSalary: 0,
    components: [],
  }
  return {
    success: true,
    code: '200',
    data: info,
    messages: [],
  }
}

export const getEmployeeLeaveBalance = async (id: string): Promise<Envelope<EmployeeLeaveBalance[]>> => {
  await sleep()
  return {
    success: true,
    code: '200',
    data: mockLeaveBalances[id] || [
      {
        leaveTypeId: 'lt-1',
        leaveTypeName: 'Cuti Tahunan',
        leaveTypeCode: 'AL',
        totalBalance: 12,
        used: 0,
        remaining: 12,
        isPaid: true,
        canCarryForward: true,
      },
    ],
    messages: [],
  }
}

const mockContracts: EmployeeContract[] = [
  {
    id: 'ctr-1',
    employeeId: 'emp-1',
    fullName: 'Rian Wijaya',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    contractNumber: 'CTR-2025-00421',
    contractType: 'PKWTT',
    startDate: '1 September 2025',
    endDate: 'Indefinite',
    probation: 'Passed',
    workLocation: 'Head Office Jakarta',
    positionName: 'Senior Frontend Engineer',
    salaryGrade: 'G5',
    status: 'active',
    documentName: 'Employment_Contract_Rian_Wijaya.pdf',
    documentSize: '1.2 MB',
    reminderActive: false,
  },
  {
    id: 'ctr-2',
    employeeId: 'emp-2',
    fullName: 'Siti Aminah',
    photo: null,
    contractNumber: 'CTR-2025-00422',
    contractType: 'PKWTT',
    startDate: '1 August 2025',
    endDate: 'Indefinite',
    probation: 'Passed',
    workLocation: 'Bandung Office',
    positionName: 'HR Specialist',
    salaryGrade: 'G6',
    status: 'active',
    documentName: 'Employment_Contract_Siti_Aminah.pdf',
    documentSize: '1.4 MB',
    reminderActive: false,
  },
  {
    id: 'ctr-3',
    employeeId: 'emp-3',
    fullName: 'Budi Santoso',
    photo: null,
    contractNumber: 'CTR-2025-00423',
    contractType: 'PKWT',
    startDate: '1 September 2025',
    endDate: '31 August 2026',
    probation: '—',
    workLocation: 'Head Office Jakarta',
    positionName: 'Engineering Manager',
    salaryGrade: 'G5',
    status: 'expiring',
    documentName: 'Employment_Contract_Budi_Santoso.pdf',
    documentSize: '1.1 MB',
    reminderActive: true,
  },
  {
    id: 'ctr-4',
    employeeId: 'emp-4',
    fullName: 'Dewi Lestari',
    photo: null,
    contractNumber: 'CTR-2025-00424',
    contractType: 'PKWT',
    startDate: '1 October 2025',
    endDate: '30 September 2026',
    probation: '—',
    workLocation: 'Head Office Jakarta',
    positionName: 'HR Manager',
    salaryGrade: 'G4',
    status: 'draft',
    documentName: 'Draft_Contract_Dewi_Lestari.pdf',
    documentSize: '890 KB',
    reminderActive: false,
  },
  {
    id: 'ctr-5',
    employeeId: 'emp-5',
    fullName: 'Andi Pratama',
    photo: null,
    contractNumber: 'CTR-2025-00425',
    contractType: 'PKWTT',
    startDate: '15 September 2025',
    endDate: 'Indefinite',
    probation: '3 Months',
    workLocation: 'Surabaya Office',
    positionName: 'Backend Developer',
    salaryGrade: 'G4',
    status: 'unsigned',
    documentName: 'Employment_Contract_Andi_Pratama.pdf',
    documentSize: '1.3 MB',
    reminderActive: false,
  },
]

export const getContracts = async (search?: string, status?: string): Promise<Envelope<EmployeeContract[]>> => {
  await sleep()
  let filtered = [...mockContracts]

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter((c) => c.fullName.toLowerCase().includes(q) || c.contractNumber.toLowerCase().includes(q))
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((c) => c.status === status)
  }

  return {
    success: true,
    code: '200',
    data: filtered,
    messages: [],
  }
}

export const renewContract = async (id: string, startDate: string, endDate: string): Promise<Envelope<EmployeeContract>> => {
  await sleep()
  const idx = mockContracts.findIndex((c) => c.id === id)
  if (idx === -1) {
    throw new Error('Contract not found')
  }

  mockContracts[idx] = {
    ...mockContracts[idx],
    startDate,
    endDate,
    status: 'active',
  }

  return {
    success: true,
    code: '200',
    data: mockContracts[idx],
    messages: [],
  }
}

// ─── Mutation Dummy Data ─────────────────────────────────────────────────────
let mockMutations: EmployeeMutation[] = [
  {
    id: 'mut-1',
    employeeId: 'emp-1',
    employeeCode: 'EMP001',
    fullName: 'Rian Wijaya',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    currentDivision: 'Product',
    currentDepartment: 'Design',
    currentPosition: 'Product Designer',
    currentSupervisor: 'Budi Setiawan',
    currentLocation: 'Jakarta HQ',
    newDivision: 'Product',
    newDepartment: 'Product Management',
    newPosition: 'Senior Product Designer',
    newSupervisor: 'Sinta Maharani',
    newLocation: 'Jakarta HQ',
    effectiveDate: '2026-09-01',
    reason: 'Organization restructuring',
    approvalRoute: 'HR + Manager',
    status: 'pending',
    submittedAt: '2026-08-15T08:00:00Z',
    approvedAt: null,
  },
  {
    id: 'mut-2',
    employeeId: 'emp-2',
    employeeCode: 'EMP002',
    fullName: 'Siti Aminah',
    photo: null,
    currentDivision: 'Engineering',
    currentDepartment: 'Backend',
    currentPosition: 'Backend Developer',
    currentSupervisor: 'Rian Wijaya',
    currentLocation: 'Jakarta HQ',
    newDivision: 'Engineering',
    newDepartment: 'Platform',
    newPosition: 'Senior Backend Developer',
    newSupervisor: 'Rian Wijaya',
    newLocation: 'Bandung Office',
    effectiveDate: '2026-09-15',
    reason: 'Team expansion',
    approvalRoute: 'HR + Manager',
    status: 'approved',
    submittedAt: '2026-08-10T08:00:00Z',
    approvedAt: '2026-08-12T10:00:00Z',
  },
  {
    id: 'mut-3',
    employeeId: 'emp-3',
    employeeCode: 'EMP003',
    fullName: 'Dewi Kartika',
    photo: null,
    currentDivision: 'HR',
    currentDepartment: 'Recruitment',
    currentPosition: 'HR Specialist',
    currentSupervisor: 'Siti Aminah',
    currentLocation: 'Jakarta HQ',
    newDivision: 'HR',
    newDepartment: 'Corporate',
    newPosition: 'HR Business Partner',
    newSupervisor: 'Siti Aminah',
    newLocation: 'Jakarta HQ',
    effectiveDate: '2026-10-01',
    reason: 'Role alignment',
    approvalRoute: 'HR Director',
    status: 'scheduled',
    submittedAt: '2026-08-20T08:00:00Z',
    approvedAt: '2026-08-21T14:00:00Z',
  },
  {
    id: 'mut-4',
    employeeId: 'emp-4',
    employeeCode: 'EMP004',
    fullName: 'Budi Santoso',
    photo: null,
    currentDivision: 'Finance',
    currentDepartment: 'Accounting',
    currentPosition: 'Finance Analyst',
    currentSupervisor: 'Dewi Kartika',
    currentLocation: 'Jakarta HQ',
    newDivision: 'Finance',
    newDepartment: 'Operations',
    newPosition: 'Senior Finance Analyst',
    newSupervisor: 'Dewi Kartika',
    newLocation: 'Surabaya Branch',
    effectiveDate: '2026-09-01',
    reason: 'Branch assignment',
    approvalRoute: 'Finance Director',
    status: 'rejected',
    submittedAt: '2026-08-05T08:00:00Z',
    approvedAt: null,
  },
  {
    id: 'mut-5',
    employeeId: 'emp-5',
    employeeCode: 'EMP005',
    fullName: 'Ahmad Fauzi',
    photo: null,
    currentDivision: 'IT',
    currentDepartment: 'Infrastructure',
    currentPosition: 'System Engineer',
    currentSupervisor: 'Budi Santoso',
    currentLocation: 'Bandung Office',
    newDivision: 'IT',
    newDepartment: 'Cloud & DevOps',
    newPosition: 'DevOps Engineer',
    newSupervisor: 'Budi Santoso',
    newLocation: 'Jakarta HQ',
    effectiveDate: '2026-09-20',
    reason: 'Skill match & project need',
    approvalRoute: 'HR + IT Manager',
    status: 'pending',
    submittedAt: '2026-08-18T08:00:00Z',
    approvedAt: null,
  },
]

export const getMutations = async (
  search?: string,
  status?: string,
): Promise<Envelope<EmployeeMutation[]>> => {
  await sleep()
  let filtered = [...mockMutations]
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.employeeCode.toLowerCase().includes(q) ||
        m.currentPosition.toLowerCase().includes(q) ||
        m.newPosition.toLowerCase().includes(q),
    )
  }
  if (status && status !== 'all') {
    filtered = filtered.filter((m) => m.status === status)
  }
  return { success: true, code: '200', data: filtered, messages: [] }
}

export const createMutation = async (payload: CreateMutationPayload): Promise<Envelope<EmployeeMutation>> => {
  await sleep()
  const employee = mockEmployees.find((e) => e.id === payload.employeeId)
  const newMutation: EmployeeMutation = {
    id: `mut-${Date.now()}`,
    employeeId: payload.employeeId,
    employeeCode: employee?.employeeCode ?? 'EMP000',
    fullName: employee?.fullName ?? 'Unknown',
    photo: employee?.photo ?? null,
    currentDivision: employee?.divisionName ?? '-',
    currentDepartment: employee?.departmentName ?? '-',
    currentPosition: employee?.positionName ?? '-',
    currentSupervisor: employee?.managerName ?? '-',
    currentLocation: employee?.workLocation ?? '-',
    newDivision: payload.newDivision,
    newDepartment: payload.newDepartment,
    newPosition: payload.newPosition,
    newSupervisor: payload.newSupervisor,
    newLocation: payload.newLocation,
    effectiveDate: payload.effectiveDate,
    reason: payload.reason,
    approvalRoute: payload.approvalRoute,
    status: 'pending',
    submittedAt: null,
    approvedAt: null,
  }
  mockMutations = [newMutation, ...mockMutations]
  return { success: true, code: '200', data: newMutation, messages: [] }
}
