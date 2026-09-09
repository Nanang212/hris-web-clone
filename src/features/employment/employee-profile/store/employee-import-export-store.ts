// src/features/employment/employee-profile/store/employee-import-export-store.ts
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ExportHistoryItem {
  id: string
  fileName: string
  filters: string
  format: 'Excel' | 'CSV'
  columnsCount: number
  exportedBy: string
  date: string
  status: 'Completed' | 'Processing' | 'Failed'
}

export interface ImportHistoryItem {
  id: string
  fileName: string
  importedBy: string
  date: string
  status: 'Completed' | 'Partial' | 'Failed'
  totalRows: number
  validRows: number
  errorRows: number
  mode: 'create' | 'bulk_update'
}

export interface ImportErrorItem {
  row: number
  column: string
  errorMessage: string
  value: string
  solution: string
}

export interface ImportPreviewRow {
  no: number
  employeeId: string
  fullName: string
  email: string
  department: string
  position: string
  joinDate: string
  type: string
  status: string
  isValid: boolean
  errors?: string[]
}

export interface ValidationSummary {
  totalRows: number
  validRows: number
  warningRows: number
  errorRows: number
}

export interface ExportColumnDefinition {
  id: string
  label: string
  category:
    'profile' | 'personal' | 'employment' | 'status' | 'bank' | 'npwp' | 'bpjs' | 'documents'
  checked: boolean
}

export const INITIAL_EXPORT_COLUMNS: ExportColumnDefinition[] = [
  // Profile
  { id: 'employeeId', label: 'Employee ID', category: 'profile', checked: true },
  { id: 'employeePhoto', label: 'Employee Photo', category: 'profile', checked: false },
  // Personal
  { id: 'fullName', label: 'Full Name', category: 'personal', checked: true },
  { id: 'email', label: 'Email', category: 'personal', checked: true },
  { id: 'phone', label: 'Phone Number', category: 'personal', checked: true },
  { id: 'dateOfBirth', label: 'Date of Birth', category: 'personal', checked: true },
  // Employment
  { id: 'department', label: 'Department', category: 'employment', checked: true },
  { id: 'position', label: 'Position', category: 'employment', checked: true },
  { id: 'joinDate', label: 'Join Date', category: 'employment', checked: true },
  { id: 'employmentType', label: 'Employment Type', category: 'employment', checked: true },
  // Status
  { id: 'status', label: 'Employee Status', category: 'status', checked: true },
  { id: 'onLeave', label: 'On Leave', category: 'status', checked: true },
  { id: 'resignationDate', label: 'Resignation Date', category: 'status', checked: false },
  // Bank
  { id: 'bankName', label: 'Bank Name', category: 'bank', checked: true },
  { id: 'bankAccountNumber', label: 'Bank Account Number', category: 'bank', checked: true },
  { id: 'accountHolderName', label: 'Account Holder Name', category: 'bank', checked: true },
  // NPWP
  { id: 'npwpNumber', label: 'NPWP Number', category: 'npwp', checked: true },
  { id: 'npwpName', label: 'NPWP Name', category: 'npwp', checked: true },
  // BPJS
  { id: 'bpjsKesehatan', label: 'BPJS Kesehatan Number', category: 'bpjs', checked: true },
  {
    id: 'bpjsKetenagakerjaan',
    label: 'BPJS Ketenagakerjaan Number',
    category: 'bpjs',
    checked: true,
  },
  // Documents
  { id: 'ktpNumber', label: 'KTP Number', category: 'documents', checked: true },
  { id: 'drivingLicense', label: 'Driving License Number', category: 'documents', checked: false },
  { id: 'others', label: 'Others', category: 'documents', checked: false },
]

export const MOCK_EXPORT_HISTORY: ExportHistoryItem[] = [
  {
    id: 'exp-1',
    fileName: 'Employee_Export_May_2024.xlsx',
    filters: 'All Departments, All Status',
    format: 'Excel',
    columnsCount: 20,
    exportedBy: 'Rama Aditya',
    date: '22 May 2024',
    status: 'Completed',
  },
  {
    id: 'exp-2',
    fileName: 'Finance_Employees_Q1.xlsx',
    filters: 'Finance, Active',
    format: 'Excel',
    columnsCount: 16,
    exportedBy: 'Rama Aditya',
    date: '10 Apr 2024',
    status: 'Completed',
  },
  {
    id: 'exp-3',
    fileName: 'All_Employees_Annual_2023.csv',
    filters: 'All Departments, All Status',
    format: 'CSV',
    columnsCount: 22,
    exportedBy: 'HR Admin',
    date: '31 Dec 2023',
    status: 'Completed',
  },
]

export const MOCK_IMPORT_HISTORY: ImportHistoryItem[] = [
  {
    id: 'imp-1',
    fileName: 'Employee_Import_May_2024.xlsx',
    importedBy: 'HR Admin',
    date: '24 May 2024, 14:30',
    status: 'Completed',
    totalRows: 1248,
    validRows: 1186,
    errorRows: 20,
    mode: 'create',
  },
  {
    id: 'imp-2',
    fileName: 'Employee_Import_Apr_2024.xlsx',
    importedBy: 'HR Admin',
    date: '15 Apr 2024, 11:20',
    status: 'Completed',
    totalRows: 1150,
    validRows: 1102,
    errorRows: 18,
    mode: 'create',
  },
  {
    id: 'imp-3',
    fileName: 'Employee_Bulk_Update_Salary_Q2.xlsx',
    importedBy: 'HR Admin',
    date: '02 Apr 2024, 09:15',
    status: 'Completed',
    totalRows: 1050,
    validRows: 1050,
    errorRows: 0,
    mode: 'bulk_update',
  },
]

// Mock existing employees pool for Bulk Update & Export
export const INITIAL_MOCK_EMPLOYEES = [
  {
    employeeId: 'EMP-2023-00126',
    fullName: 'Rama Aditya',
    email: 'rama.aditya@jakarta-hq.com',
    phone: '081234567890',
    dateOfBirth: '1992-08-14',
    department: 'Product Design',
    position: 'Product Designer',
    joinDate: '2023-05-12',
    employmentType: 'Permanent',
    status: 'Active',
    onLeave: 'No',
    resignationDate: '',
    bankName: 'BCA',
    bankAccountNumber: '1234567890',
    accountHolderName: 'Rama Aditya',
    npwpNumber: '12.345.678.9-012.000',
    npwpName: 'Rama Aditya',
    bpjsKesehatan: '0001234567890',
    bpjsKetenagakerjaan: '190001234567890',
    ktpNumber: '3171012345670001',
    drivingLicense: 'SIM-A-987654',
    others: '-',
  },
  {
    employeeId: 'EMP-2023-00127',
    fullName: 'Siti Rahmawati',
    email: 'siti.rahmawati@jakarta-hq.com',
    phone: '081298765432',
    dateOfBirth: '1994-03-21',
    department: 'Engineering',
    position: 'Senior Developer',
    joinDate: '2022-06-05',
    employmentType: 'Permanent',
    status: 'Active',
    onLeave: 'No',
    resignationDate: '',
    bankName: 'Mandiri',
    bankAccountNumber: '9876543210',
    accountHolderName: 'Siti Rahmawati',
    npwpNumber: '12.345.678.9-013.000',
    npwpName: 'Siti Rahmawati',
    bpjsKesehatan: '0001234567891',
    bpjsKetenagakerjaan: '190001234567891',
    ktpNumber: '3171012345670002',
    drivingLicense: 'SIM-A-987655',
    others: '-',
  },
  {
    employeeId: 'EMP-2023-00128',
    fullName: 'Budi Setiawan',
    email: 'budi.setiawan@jakarta-hq.com',
    phone: '081311223344',
    dateOfBirth: '1990-11-09',
    department: 'Finance',
    position: 'Finance Analyst',
    joinDate: '2022-07-18',
    employmentType: 'Permanent',
    status: 'Active',
    onLeave: 'No',
    resignationDate: '',
    bankName: 'BCA',
    bankAccountNumber: '2233445566',
    accountHolderName: 'Budi Setiawan',
    npwpNumber: '12.345.678.9-014.000',
    npwpName: 'Budi Setiawan',
    bpjsKesehatan: '0001234567892',
    bpjsKetenagakerjaan: '190001234567892',
    ktpNumber: '3171012345670003',
    drivingLicense: '-',
    others: '-',
  },
  {
    employeeId: 'EMP-2023-00129',
    fullName: 'Dewi Kartika',
    email: 'dewi.kartika@jakarta-hq.com',
    phone: '081555667788',
    dateOfBirth: '1993-01-30',
    department: 'HR',
    position: 'HR Generalist',
    joinDate: '2023-02-01',
    employmentType: 'Permanent',
    status: 'Active',
    onLeave: 'No',
    resignationDate: '',
    bankName: 'BNI',
    bankAccountNumber: '3344556677',
    accountHolderName: 'Dewi Kartika',
    npwpNumber: '12.345.678.9-015.000',
    npwpName: 'Dewi Kartika',
    bpjsKesehatan: '0001234567893',
    bpjsKetenagakerjaan: '190001234567893',
    ktpNumber: '3171012345670004',
    drivingLicense: 'SIM-C-123456',
    others: '-',
  },
  {
    employeeId: 'EMP-2023-00130',
    fullName: 'Rizky Pratama',
    email: 'rizky.pratama@jakarta-hq.com',
    phone: '081233445566',
    dateOfBirth: '1996-05-15',
    department: 'Marketing',
    position: 'Marketing Specialist',
    joinDate: '2022-11-20',
    employmentType: 'Contract',
    status: 'On Leave',
    onLeave: 'Yes',
    resignationDate: '',
    bankName: 'BCA',
    bankAccountNumber: '4455667788',
    accountHolderName: 'Rizky Pratama',
    npwpNumber: '12.345.678.9-016.000',
    npwpName: 'Rizky Pratama',
    bpjsKesehatan: '0001234567894',
    bpjsKetenagakerjaan: '190001234567894',
    ktpNumber: '3171012345670005',
    drivingLicense: 'SIM-A-987656',
    others: '-',
  },
  {
    employeeId: 'EMP-2023-00131',
    fullName: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@jakarta-hq.com',
    phone: '081809876543',
    dateOfBirth: '1991-12-04',
    department: 'Operations',
    position: 'Operations Officer',
    joinDate: '2021-08-10',
    employmentType: 'Permanent',
    status: 'Active',
    onLeave: 'No',
    resignationDate: '',
    bankName: 'Mandiri',
    bankAccountNumber: '5566778899',
    accountHolderName: 'Ahmad Fauzi',
    npwpNumber: '12.345.678.9-017.000',
    npwpName: 'Ahmad Fauzi',
    bpjsKesehatan: '0001234567895',
    bpjsKetenagakerjaan: '190001234567895',
    ktpNumber: '3171012345670006',
    drivingLicense: 'SIM-A-987657',
    others: '-',
  },
]

interface EmployeeImportExportState {
  exportHistory: ExportHistoryItem[]
  importHistory: ImportHistoryItem[]
  employees: typeof INITIAL_MOCK_EMPLOYEES
  addExportHistory: (item: Omit<ExportHistoryItem, 'id' | 'date'>) => void
  addImportHistory: (item: Omit<ImportHistoryItem, 'id' | 'date'>) => void
  bulkInsertEmployees: (newEmployees: typeof INITIAL_MOCK_EMPLOYEES) => void
  bulkUpdateEmployees: (updatedEmployees: typeof INITIAL_MOCK_EMPLOYEES) => void
}

export const useEmployeeImportExportStore = create<EmployeeImportExportState>()(
  persist(
    (set) => ({
      exportHistory: MOCK_EXPORT_HISTORY,
      importHistory: MOCK_IMPORT_HISTORY,
      employees: INITIAL_MOCK_EMPLOYEES,
      addExportHistory: (item) =>
        set((state) => ({
          exportHistory: [
            {
              ...item,
              id: `exp-${Date.now()}`,
              date: dayjs().format('DD MMM YYYY'),
            },
            ...state.exportHistory,
          ],
        })),
      addImportHistory: (item) =>
        set((state) => ({
          importHistory: [
            {
              ...item,
              id: `imp-${Date.now()}`,
              date: dayjs().format('DD MMM YYYY, HH:mm'),
            },
            ...state.importHistory,
          ],
        })),
      bulkInsertEmployees: (newEmployees) =>
        set((state) => ({
          employees: [...state.employees, ...newEmployees],
        })),
      bulkUpdateEmployees: (updatedEmployees) =>
        set((state) => {
          const updateMap = new Map(updatedEmployees.map((e) => [e.employeeId, e]))
          const next = state.employees.map((emp) => updateMap.get(emp.employeeId) || emp)
          return { employees: next }
        }),
    }),
    {
      name: 'hris_employee_import_export_store',
    },
  ),
)

// ─── TEMPLATE GENERATION & EXCEL HELPERS ──────────────────────────────────────

/**
 * Downloads a blank Excel template for Create/Bulk Insert.
 * Includes column headers, data formats, and 1 row of sample dummy data.
 */
export function downloadBlankEmployeeTemplate() {
  const headers = [
    'Employee ID (Optional)',
    'Full Name *',
    'Email *',
    'Phone Number *',
    'Date of Birth (YYYY-MM-DD)',
    'Department *',
    'Position *',
    'Join Date (YYYY-MM-DD) *',
    'Employment Type (Permanent/Contract/Internship)',
    'Status (Active/On Leave/Probation)',
    'Bank Name',
    'Bank Account Number',
    'Account Holder Name',
    'NPWP Number (15-16 Digits)',
    'BPJS Kesehatan Number',
    'BPJS Ketenagakerjaan Number',
    'KTP Number',
  ]

  const sampleRow = [
    'EMP-2024-00150',
    'John Superman',
    'john.superman@example.com',
    '081234567890',
    '1995-04-12',
    'Engineering',
    'Frontend Engineer',
    '2024-06-01',
    'Permanent',
    'Active',
    'BCA',
    '1234567890',
    'John Superman',
    '12.345.678.9-012.000',
    '0001234567890',
    '190001234567890',
    '3171012345670009',
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow])
  // Set column widths
  ws['!cols'] = headers.map(() => ({ wch: 24 }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Employee_Template')
  XLSX.writeFile(wb, 'Employee_Import_Template_Create.xlsx')
}

/**
 * Downloads an Excel template for Bulk Update pre-filled with existing employee records.
 * HR can edit columns like Department, Position, Status, Phone, Bank, etc., while keeping Employee ID intact.
 */
export function downloadExistingEmployeeTemplate(employees = INITIAL_MOCK_EMPLOYEES) {
  const data = employees.map((emp) => ({
    'Employee ID (DO NOT CHANGE)': emp.employeeId,
    'Full Name': emp.fullName,
    Email: emp.email,
    'Phone Number': emp.phone,
    'Date of Birth': emp.dateOfBirth,
    Department: emp.department,
    Position: emp.position,
    'Join Date': emp.joinDate,
    'Employment Type': emp.employmentType,
    Status: emp.status,
    'Bank Name': emp.bankName,
    'Bank Account Number': emp.bankAccountNumber,
    'Account Holder Name': emp.accountHolderName,
    'NPWP Number': emp.npwpNumber,
    'BPJS Kesehatan Number': emp.bpjsKesehatan,
    'BPJS Ketenagakerjaan Number': emp.bpjsKetenagakerjaan,
    'KTP Number': emp.ktpNumber,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: 24 }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Bulk_Update_Employees')
  XLSX.writeFile(wb, `Employee_Bulk_Update_Template_${dayjs().format('YYYY-MM')}.xlsx`)
}

/**
 * Exports employee directory based on selected columns and format.
 */
export function exportEmployeeData({
  employees = INITIAL_MOCK_EMPLOYEES,
  selectedColumns,
  format = 'Excel',
  fileName = `Employee_Export_${dayjs().format('MMM_YYYY')}`,
}: {
  employees?: typeof INITIAL_MOCK_EMPLOYEES
  selectedColumns: ExportColumnDefinition[]
  format: 'Excel' | 'CSV'
  fileName?: string
}) {
  const activeCols = selectedColumns.filter((c) => c.checked)

  const rows = employees.map((emp) => {
    const rowObj: Record<string, string> = {}
    activeCols.forEach((col) => {
      rowObj[col.label] = (emp as Record<string, string>)[col.id] || '-'
    })
    return rowObj
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Employees')

  if (format === 'CSV') {
    XLSX.writeFile(wb, `${fileName}.csv`, { bookType: 'csv' })
  } else {
    XLSX.writeFile(wb, `${fileName}.xlsx`, { bookType: 'xlsx' })
  }
}

// ─── VALIDATION ENGINE FOR IMPORT FILE ────────────────────────────────────────

const VALID_DEPARTMENTS = [
  'Product Design',
  'Engineering',
  'Finance',
  'HR',
  'Marketing',
  'Operations',
  'Sales',
  'Legal',
]
const VALID_TYPES = ['Permanent', 'Contract', 'Internship', 'Freelance']
const VALID_STATUSES = ['Active', 'On Leave', 'Probation', 'Resigned', 'Inactive']

export interface ParsedImportResult {
  summary: ValidationSummary
  errors: ImportErrorItem[]
  previewRows: ImportPreviewRow[]
  rawValidRows: typeof INITIAL_MOCK_EMPLOYEES
}

export async function parseAndValidateEmployeeFile(
  file: File,
  mode: 'create' | 'bulk_update',
  existingEmployees: typeof INITIAL_MOCK_EMPLOYEES = useEmployeeImportExportStore.getState()
    .employees,
): Promise<ParsedImportResult> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[firstSheetName]

  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  const errors: ImportErrorItem[] = []
  const previewRows: ImportPreviewRow[] = []
  const rawValidRows: typeof INITIAL_MOCK_EMPLOYEES = []

  let warningCount = 0

  // Tracking maps for duplicates inside the uploaded spreadsheet itself
  const seenEmailsInFile = new Map<string, number>()
  const seenIdsInFile = new Map<string, number>()
  const seenPhonesInFile = new Map<string, number>()
  const seenKtpsInFile = new Map<string, number>()

  rawRows.forEach((row, index) => {
    const rowNum = index + 2 // 1-indexed + header row
    const rowErrors: string[] = []

    // Map loose header names
    const getVal = (patterns: string[]): string => {
      for (const key of Object.keys(row)) {
        if (patterns.some((p) => key.toLowerCase().includes(p.toLowerCase()))) {
          return String(row[key]).trim()
        }
      }
      return ''
    }

    const rawEmployeeId = getVal(['employee id', 'nik karyawan', 'id'])
    const employeeId =
      rawEmployeeId || `EMP-${dayjs().format('YYYY')}-${String(index + 100).padStart(5, '0')}`
    const fullName = getVal(['full name', 'name', 'nama'])
    const email = getVal(['email'])
    const phone = getVal(['phone', 'nomor telp', 'no hp'])
    const dob = getVal(['birth', 'lahir', 'dob']) || '1995-01-01'
    const department = getVal(['department', 'departemen'])
    const position = getVal(['position', 'jabatan'])
    const joinDate = getVal(['join', 'masuk']) || dayjs().format('YYYY-MM-DD')
    const employmentType = getVal(['type', 'tipe', 'employment type']) || 'Permanent'
    const status = getVal(['status']) || 'Active'
    const ktp = getVal(['ktp', 'nik ktp', 'ktp number', 'nomor ktp'])

    // 1. Validation checks: Full Name
    if (!fullName) {
      errors.push({
        row: rowNum,
        column: 'Full Name',
        errorMessage: 'Required field is empty',
        value: 'EMPTY',
        solution: 'Fill in employee full name',
      })
      rowErrors.push('Full Name is required')
    }

    // 2. Email format & Duplicate checks
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      errors.push({
        row: rowNum,
        column: 'Email',
        errorMessage: 'Required field is empty',
        value: 'EMPTY',
        solution: 'Enter a valid corporate or personal email',
      })
      rowErrors.push('Email is required')
    } else if (!emailRegex.test(email)) {
      errors.push({
        row: rowNum,
        column: 'Email',
        errorMessage: 'Invalid email format',
        value: email,
        solution: 'Enter a valid email (e.g. user@company.com)',
      })
      rowErrors.push('Invalid email format')
    } else {
      const emailLower = email.toLowerCase()

      // Duplicate check: Within current spreadsheet
      if (seenEmailsInFile.has(emailLower)) {
        const firstSeenRow = seenEmailsInFile.get(emailLower)!
        errors.push({
          row: rowNum,
          column: 'Email',
          errorMessage: `Duplicate email in file: Identical to Row ${firstSeenRow} ("${email}")`,
          value: email,
          solution: `Duplicate found on Row ${firstSeenRow}. Each row in the file must have a unique email.`,
        })
        rowErrors.push(`Duplicate email with Row ${firstSeenRow}`)
      } else {
        seenEmailsInFile.set(emailLower, rowNum)
      }

      // Duplicate check: In Bulk Insert mode, check against existing database
      if (mode === 'create') {
        const existingWithEmail = existingEmployees.find(
          (e) => e.email && e.email.trim().toLowerCase() === emailLower,
        )
        if (existingWithEmail) {
          errors.push({
            row: rowNum,
            column: 'Email',
            errorMessage: `Data duplicate: Email "${email}" already registered to existing employee (${existingWithEmail.fullName} - ${existingWithEmail.employeeId})`,
            value: email,
            solution:
              'Employee data already exists in database. Use a unique email or switch to Bulk Update mode.',
          })
          rowErrors.push(`Duplicate email already registered to ${existingWithEmail.fullName}`)
        }
      }
    }

    // 3. Employee ID checks
    if (rawEmployeeId) {
      const idUpper = rawEmployeeId.toUpperCase()
      // Duplicate check within file
      if (seenIdsInFile.has(idUpper)) {
        const firstSeenRow = seenIdsInFile.get(idUpper)!
        errors.push({
          row: rowNum,
          column: 'Employee ID',
          errorMessage: `Duplicate Employee ID in file: Identical to Row ${firstSeenRow} ("${rawEmployeeId}")`,
          value: rawEmployeeId,
          solution: `Duplicate found on Row ${firstSeenRow}. Each employee must have a unique Employee ID.`,
        })
        rowErrors.push(`Duplicate Employee ID with Row ${firstSeenRow}`)
      } else {
        seenIdsInFile.set(idUpper, rowNum)
      }

      // In Bulk Insert mode, check if ID already exists in DB
      if (mode === 'create') {
        const existingWithId = existingEmployees.find(
          (e) => e.employeeId && e.employeeId.trim().toUpperCase() === idUpper,
        )
        if (existingWithId) {
          errors.push({
            row: rowNum,
            column: 'Employee ID',
            errorMessage: `Data duplicate: Employee ID "${rawEmployeeId}" already exists for ${existingWithId.fullName}`,
            value: rawEmployeeId,
            solution:
              'Employee ID is already taken. Leave blank to auto-generate or use a unique ID.',
          })
          rowErrors.push(`Duplicate Employee ID already taken by ${existingWithId.fullName}`)
        }
      }
    } else if (mode === 'bulk_update') {
      errors.push({
        row: rowNum,
        column: 'Employee ID',
        errorMessage: 'Employee ID is required for bulk update',
        value: 'EMPTY',
        solution: 'Provide existing Employee ID from template',
      })
      rowErrors.push('Missing Employee ID')
    }

    // In Bulk Update mode, verify employee ID exists in DB
    if (mode === 'bulk_update' && rawEmployeeId) {
      const idUpper = rawEmployeeId.toUpperCase()
      const foundInDb = existingEmployees.find(
        (e) => e.employeeId && e.employeeId.trim().toUpperCase() === idUpper,
      )
      if (!foundInDb) {
        errors.push({
          row: rowNum,
          column: 'Employee ID',
          errorMessage: `Employee ID "${rawEmployeeId}" not found in database`,
          value: rawEmployeeId,
          solution: 'Employee does not exist. Check Employee ID or switch to Bulk Insert mode.',
        })
        rowErrors.push('Employee ID not found')
      }
    }

    // 4. Phone format & duplicate checks
    if (phone) {
      if (!/^08\d{8,12}$/g.test(phone.replace(/[-\s]/g, ''))) {
        errors.push({
          row: rowNum,
          column: 'Phone',
          errorMessage: 'Invalid phone number format',
          value: phone,
          solution: 'Use format starting with 08 or standard digits',
        })
        warningCount++
      } else {
        const cleanPhone = phone.replace(/[^0-9]/g, '')
        if (seenPhonesInFile.has(cleanPhone)) {
          const firstSeenRow = seenPhonesInFile.get(cleanPhone)!
          errors.push({
            row: rowNum,
            column: 'Phone',
            errorMessage: `Duplicate phone number in file: Identical to Row ${firstSeenRow} ("${phone}")`,
            value: phone,
            solution: `Check phone number accuracy. Duplicate with Row ${firstSeenRow}.`,
          })
          warningCount++
        } else {
          seenPhonesInFile.set(cleanPhone, rowNum)
        }

        if (mode === 'create') {
          const existingWithPhone = existingEmployees.find(
            (e) => e.phone && e.phone.replace(/[^0-9]/g, '') === cleanPhone,
          )
          if (existingWithPhone) {
            errors.push({
              row: rowNum,
              column: 'Phone',
              errorMessage: `Data duplicate: Phone "${phone}" already used by ${existingWithPhone.fullName} (${existingWithPhone.employeeId})`,
              value: phone,
              solution: 'Verify if phone number belongs to another active employee.',
            })
            warningCount++
          }
        }
      }
    }

    // 5. KTP / NIK duplicate check
    if (ktp) {
      const cleanKtp = ktp.replace(/[^0-9]/g, '')
      if (cleanKtp.length >= 15) {
        if (seenKtpsInFile.has(cleanKtp)) {
          const firstSeenRow = seenKtpsInFile.get(cleanKtp)!
          errors.push({
            row: rowNum,
            column: 'KTP Number',
            errorMessage: `Duplicate NIK/KTP in file: Identical to Row ${firstSeenRow} ("${ktp}")`,
            value: ktp,
            solution: `Duplicate with Row ${firstSeenRow}. NIK/KTP must be unique for each employee.`,
          })
          rowErrors.push(`Duplicate NIK/KTP with Row ${firstSeenRow}`)
        } else {
          seenKtpsInFile.set(cleanKtp, rowNum)
        }

        if (mode === 'create') {
          const existingWithKtp = existingEmployees.find(
            (e) => e.ktpNumber && e.ktpNumber.replace(/[^0-9]/g, '') === cleanKtp,
          )
          if (existingWithKtp) {
            errors.push({
              row: rowNum,
              column: 'KTP Number',
              errorMessage: `Data duplicate: NIK/KTP "${ktp}" already registered to ${existingWithKtp.fullName} (${existingWithKtp.employeeId})`,
              value: ktp,
              solution: 'NIK/KTP already registered. Each citizen has a unique NIK.',
            })
            rowErrors.push(`Data duplicate: NIK/KTP already registered`)
          }
        }
      }
    }

    // 6. Department check
    if (
      department &&
      !VALID_DEPARTMENTS.some((d) => d.toLowerCase() === department.toLowerCase())
    ) {
      errors.push({
        row: rowNum,
        column: 'Department',
        errorMessage: 'Department not found',
        value: department,
        solution: `Use existing department: ${VALID_DEPARTMENTS.slice(0, 4).join(', ')}...`,
      })
      rowErrors.push('Department not found')
    }

    const isValid = rowErrors.length === 0

    if (isValid) {
      rawValidRows.push({
        employeeId,
        fullName,
        email,
        phone: phone || '081234567890',
        dateOfBirth: dob,
        department: department || 'General',
        position: position || 'Staff',
        joinDate,
        employmentType: VALID_TYPES.includes(employmentType) ? employmentType : 'Permanent',
        status: VALID_STATUSES.includes(status) ? status : 'Active',
        onLeave: 'No',
        resignationDate: '',
        bankName: getVal(['bank']) || 'BCA',
        bankAccountNumber: getVal(['account number', 'rekening']) || '1234567890',
        accountHolderName: fullName,
        npwpNumber: getVal(['npwp']) || '12.345.678.9-000.000',
        npwpName: fullName,
        bpjsKesehatan: getVal(['bpjs kesehatan']) || '0001234567890',
        bpjsKetenagakerjaan: getVal(['bpjs ketenagakerjaan']) || '190001234567890',
        ktpNumber: getVal(['ktp', 'nik ktp']) || '3171012345670001',
        drivingLicense: '-',
        others: '-',
      })
    }

    previewRows.push({
      no: index + 1,
      employeeId,
      fullName: fullName || '(Empty)',
      email: email || '(Empty)',
      department: department || '(Empty)',
      position: position || '(Empty)',
      joinDate,
      type: employmentType,
      status,
      isValid,
      errors: rowErrors,
    })
  })

  const totalRows = rawRows.length
  const validRowsCount = rawValidRows.length
  const errorRowsCount = previewRows.filter((r) => !r.isValid).length
  const warningRowsCount = warningCount

  return {
    summary: {
      totalRows,
      validRows: validRowsCount,
      warningRows: warningRowsCount,
      errorRows: errorRowsCount,
    },
    errors: errors.slice(0, 50),
    previewRows: previewRows.slice(0, 10),
    rawValidRows,
  }
}
