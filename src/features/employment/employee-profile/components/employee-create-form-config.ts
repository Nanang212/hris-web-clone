import { z } from 'zod'

export interface SelectOption {
  value: string
  label: string
}

export const employeeCreateValues = {
  bloodTypes: ['A', 'B', 'AB', 'O'],
  citizenships: ['WNI', 'WNA'],
  contactTypes: ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER'],
  contractStatuses: ['ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED'],
  contractTypes: ['PKWT', 'PKWTT', 'NON_EMPLOYMENT'],
  educationLevels: ['SD', 'SMP', 'SMA', 'DIPLOMA', 'BACHELOR', 'MASTER', 'DOCTOR'],
  employeeStatuses: ['ACTIVE', 'INACTIVE', 'RESIGNED'],
  employmentTypes: ['PERMANENT', 'CONTRACT', 'OUTSOURCING', 'INTERN', 'FREELANCE'],
  maritalStatuses: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'],
  religions: ['ISLAM', 'PROTESTANT', 'CATHOLIC', 'HINDU', 'BUDDHIST', 'CONFUCIAN'],
  verificationStatuses: ['PENDING', 'VERIFIED', 'REJECTED'],
} as const

export function getDummyEmployeeCreateOptions() {
  return {
    documentTypes: [
      { id: 'document-ktp', name: 'KTP' },
      { id: 'document-npwp', name: 'NPWP' },
      { id: 'document-ijazah', name: 'Diploma' },
    ],
    files: [
      { id: 'file-identity', name: 'Identity File' },
      { id: 'file-contract', name: 'Contract File' },
      { id: 'file-certificate', name: 'Certificate File' },
    ],
    projects: [
      { id: 'project-hris', name: 'HRIS Project' },
      {
        id: 'project-recruitment',
        name: 'Recruitment Project',
      },
    ],
    sections: [
      { id: 'section-general', name: 'General' },
      { id: 'section-operations', name: 'Operations' },
    ],
  }
}

export const dummyEmployeeCreateOptions = getDummyEmployeeCreateOptions()

// Seeded from the master-data example supplied by the backend.
export const examplePayrollComponents = [
  { id: '95000000-0000-4000-8000-000000000001', name: 'Gaji Pokok' },
  { id: '95000000-0000-4000-8000-000000000002', name: 'Tunjangan Tetap' },
  { id: '95000000-0000-4000-8000-000000000003', name: 'Tunjangan Non-Pajak' },
  { id: '95000000-0000-4000-8000-000000000004', name: 'Upah Lembur' },
  { id: '95000000-0000-4000-8000-000000000005', name: 'Tunjangan Hari Raya' },
  { id: '95000000-0000-4000-8000-000000000006', name: 'PPh 21' },
  { id: '95000000-0000-4000-8000-000000000007', name: 'BPJS Kesehatan (Pekerja)' },
  { id: '95000000-0000-4000-8000-000000000008', name: 'BPJS TK JHT (Pekerja)' },
  { id: '95000000-0000-4000-8000-000000000009', name: 'BPJS TK JP (Pekerja)' },
  { id: '95000000-0000-4000-8000-000000000010', name: 'BPJS TK JHT (Pemberi Kerja)' },
  { id: '95000000-0000-4000-8000-000000000011', name: 'BPJS TK JKK (Pemberi Kerja)' },
  { id: '95000000-0000-4000-8000-000000000012', name: 'BPJS TK JKM (Pemberi Kerja)' },
  { id: '95000000-0000-4000-8000-000000000013', name: 'BPJS TK JP (Pemberi Kerja)' },
  { id: '95000000-0000-4000-8000-000000000014', name: 'BPJS Kesehatan (Pemberi Kerja)' },
] as const

interface EmployeeCreateValidationMessages {
  required?: string
  email?: string
}

export function employeeCreateFormShape(
  schema: typeof z,
  messages: EmployeeCreateValidationMessages = {},
) {
  return {
    employee: schema.object({
      address: schema.string(),
      attendanceMachineNumber: schema.string(),
      bloodType: schema.string(),
      citizenshipStatus: schema.string(),
      city: schema.string(),
      country: schema.string(),
      dateOfBirth: schema.string(),
      district: schema.string(),
      domicileAddress: schema.string(),
      drivingLicenseNumber: schema.string(),
      employeeNumber: schema.string().trim().min(1, { message: messages.required }),
      employeeStatus: schema.string(),
      fullName: schema.string().trim().min(1, { message: messages.required }),
      gender: schema.string(),
      heightCm: schema.string(),
      hireDate: schema.string().min(1, { message: messages.required }),
      kkFileId: schema.string(),
      kkNumber: schema.string(),
      ktpNumber: schema.string(),
      ktpFileId: schema.string(),
      lastEducationLevel: schema.string(),
      latitude: schema.string(),
      longitude: schema.string(),
      maritalStatus: schema.string(),
      motherMaidenName: schema.string(),
      personalEmail: schema.email({ message: messages.email }),
      phoneNumber: schema.string(),
      photoFileId: schema.string(),
      placeOfBirth: schema.string(),
      postalCode: schema.string(),
      province: schema.string(),
      religion: schema.string(),
      resignDate: schema.string(),
      simFileId: schema.string(),
      terminationReason: schema.string(),
      village: schema.string(),
      weightKg: schema.string(),
      whatsappNumber: schema.string(),
      workPermitNumber: schema.string(),
    }),
    assignments: schema.array(
      schema.object({
        changeReason: schema.string(),
        departmentUnitId: schema.string(),
        divisionUnitId: schema.string().min(1, { message: messages.required }),
        effectiveEndDate: schema.string(),
        effectiveStartDate: schema.string().min(1, { message: messages.required }),
        employmentType: schema.string().min(1, { message: messages.required }),
        gradeId: schema.string(),
        positionId: schema.string().min(1, { message: messages.required }),
        sectionUnitId: schema.string(),
        supervisorEmployeeId: schema.string(),
        workLocation: schema.string(),
      }),
    ),
    bankAccounts: schema.array(
      schema.object({
        accountHolderName: schema.string(),
        accountNumber: schema.string(),
        bankId: schema.string(),
        effectiveStartDate: schema.string().min(1, { message: messages.required }),
        employeeId: schema.string(),
      }),
    ),
    bpjs: schema.array(
      schema.object({
        documentFileId: schema.string(),
        effectiveEndDate: schema.string(),
        effectiveStartDate: schema.string().min(1, { message: messages.required }),
        employeeId: schema.string(),
        facilityName: schema.string(),
        membershipClass: schema.string(),
        participantNumber: schema.string(),
        program: schema.string(),
      }),
    ),
    contacts: schema.array(
      schema.object({
        address: schema.string(),
        birthDate: schema.string(),
        contactType: schema.string(),
        effectiveEndDate: schema.string(),
        email: schema.union([schema.literal(''), schema.email({ message: messages.email })]),
        fullName: schema.string().trim().min(1, { message: messages.required }),
        isDependent: schema.boolean(),
        isEmergency: schema.boolean(),
        ktpFileId: schema.string(),
        ktpNumber: schema.string(),
        occupation: schema.string(),
        phone: schema.string(),
        startDate: schema.string().min(1, { message: messages.required }),
      }),
    ),
    contracts: schema.array(
      schema.object({
        contractFileId: schema.string(),
        contractNumber: schema.string(),
        contractType: schema.string(),
        effectiveEndDate: schema.string(),
        maxExtensionDate: schema.string(),
        probationEffectiveEndDate: schema.string(),
        startDate: schema.string().min(1, { message: messages.required }),
        status: schema.string(),
      }),
    ),
    educations: schema.array(
      schema.object({
        certificateFileId: schema.string(),
        employeeId: schema.string(),
        educationLevel: schema.string(),
        gpa: schema.string(),
        graduationYear: schema.string(),
        institutionName: schema.string(),
        major: schema.string(),
      }),
    ),
    projects: schema.array(
      schema.object({
        effectiveEndDate: schema.string(),
        effectiveStartDate: schema.string().min(1, { message: messages.required }),
        isPrimary: schema.boolean(),
        projectId: schema.string(),
        roleInProject: schema.string(),
      }),
    ),
    payrollComponents: schema.array(
      schema.object({
        amount: schema.string(),
        componentId: schema.string().min(1, { message: messages.required }),
        customFormulaExpression: schema.string(),
        effectiveEndDate: schema.string(),
        effectiveStartDate: schema.string().min(1, { message: messages.required }),
        notes: schema.string(),
        percentage: schema.string(),
      }),
    ),
    taxProfile: schema.object({
      effectiveStartDate: schema.string().min(1, { message: messages.required }),
      isDtpEligible: schema.boolean(),
      isKtpUsedAsNpwp: schema.boolean(),
      npwpNumber: schema.string(),
      ptkpStatus: schema.string().min(1, { message: messages.required }),
    }),
  }
}

type EmployeeCreateFormSchema = z.ZodObject<ReturnType<typeof employeeCreateFormShape>>
export type EmployeeCreateFormValues = z.infer<EmployeeCreateFormSchema>

export const emptyAssignment = (): EmployeeCreateFormValues['assignments'][number] => ({
  changeReason: '',
  departmentUnitId: '',
  divisionUnitId: '',
  effectiveEndDate: '',
  effectiveStartDate: '',
  employmentType: 'PERMANENT',
  gradeId: '',
  positionId: '',
  sectionUnitId: '',
  supervisorEmployeeId: '',
  workLocation: '',
})

export const emptyBankAccount = (): EmployeeCreateFormValues['bankAccounts'][number] => ({
  accountHolderName: '',
  accountNumber: '',
  bankId: '',
  effectiveStartDate: '',
  employeeId: '',
})

export const emptyBpjs = (
  program: 'KESEHATAN' | 'KETENAGAKERJAAN',
): EmployeeCreateFormValues['bpjs'][number] => ({
  documentFileId: '',
  effectiveEndDate: '',
  effectiveStartDate: '',
  employeeId: '',
  facilityName: '',
  membershipClass: '',
  participantNumber: '',
  program,
})

export const emptyContact = (): EmployeeCreateFormValues['contacts'][number] => ({
  address: '',
  birthDate: '',
  contactType: 'SPOUSE',
  effectiveEndDate: '',
  email: '',
  fullName: '',
  isDependent: false,
  isEmergency: false,
  ktpFileId: '',
  ktpNumber: '',
  occupation: '',
  phone: '',
  startDate: '',
})

export const emptyContract = (): EmployeeCreateFormValues['contracts'][number] => ({
  contractFileId: '',
  contractNumber: '',
  contractType: 'PKWT',
  effectiveEndDate: '',
  maxExtensionDate: '',
  probationEffectiveEndDate: '',
  startDate: '',
  status: 'ACTIVE',
})

export const emptyEducation = (): EmployeeCreateFormValues['educations'][number] => ({
  certificateFileId: '',
  employeeId: '',
  educationLevel: 'SD',
  gpa: '',
  graduationYear: '',
  institutionName: '',
  major: '',
})

export const emptyProject = (): EmployeeCreateFormValues['projects'][number] => ({
  effectiveEndDate: '',
  effectiveStartDate: '',
  isPrimary: false,
  projectId: '',
  roleInProject: '',
})

export const emptyPayrollComponent = (): EmployeeCreateFormValues['payrollComponents'][number] => ({
  amount: '',
  componentId: '',
  customFormulaExpression: '',
  effectiveEndDate: '',
  effectiveStartDate: '',
  notes: '',
  percentage: '',
})

export const employeeCreateDefaultValues: EmployeeCreateFormValues = {
  employee: {
    address: '',
    attendanceMachineNumber: '',
    bloodType: '',
    citizenshipStatus: 'WNI',
    city: '',
    country: 'Indonesia',
    dateOfBirth: '',
    district: '',
    domicileAddress: '',
    drivingLicenseNumber: '',
    employeeNumber: '',
    employeeStatus: 'ACTIVE',
    fullName: '',
    gender: '',
    heightCm: '',
    hireDate: '',
    kkFileId: '',
    kkNumber: '',
    ktpNumber: '',
    ktpFileId: '',
    lastEducationLevel: '',
    latitude: '',
    longitude: '',
    maritalStatus: '',
    motherMaidenName: '',
    personalEmail: '',
    phoneNumber: '',
    photoFileId: '',
    placeOfBirth: '',
    postalCode: '',
    province: '',
    religion: '',
    resignDate: '',
    simFileId: '',
    terminationReason: '',
    village: '',
    weightKg: '',
    whatsappNumber: '',
    workPermitNumber: '',
  },
  assignments: [emptyAssignment()],
  bankAccounts: [emptyBankAccount()],
  bpjs: [emptyBpjs('KESEHATAN'), emptyBpjs('KETENAGAKERJAAN')],
  contacts: [{ ...emptyContact(), isDependent: true, isEmergency: true }],
  contracts: [emptyContract()],
  educations: [emptyEducation()],
  projects: [],
  payrollComponents: [],
  taxProfile: {
    effectiveStartDate: '',
    isDtpEligible: false,
    isKtpUsedAsNpwp: false,
    npwpNumber: '',
    ptkpStatus: 'TK/0',
  },
}

export function toSelectOptions(items: Array<{ id: string; name: string }>): SelectOption[] {
  return items.map((item) => ({ label: item.name, value: item.id }))
}

export function toValueOptions(items: readonly string[]): SelectOption[] {
  const labels: Record<string, string> = {
    Male: 'Male',
    Female: 'Female',
    WNI: 'WNI',
    WNA: 'WNA',
    SINGLE: 'Single',
    MARRIED: 'Married',
    DIVORCED: 'Divorced',
    WIDOWED: 'Widowed',
    ISLAM: 'Islam',
    PROTESTANT: 'Protestant',
    CATHOLIC: 'Catholic',
    HINDU: 'Hindu',
    BUDDHIST: 'Buddhist',
    CONFUCIAN: 'Confucian',
    SPOUSE: 'Spouse',
    CHILD: 'Child',
    PARENT: 'Parent',
    SIBLING: 'Sibling',
    OTHER: 'Other',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    RESIGNED: 'Resigned',
    EXPIRED: 'Expired',
    TERMINATED: 'Terminated',
    PENDING: 'Pending',
    VERIFIED: 'Verified',
    REJECTED: 'Rejected',
    PERMANENT: 'Permanent',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
    FREELANCE: 'Freelance',
    OUTSOURCING: 'Outsourcing',
    INTERN: 'Intern',
    NON_EMPLOYMENT: 'Non-employment',
    RENEWED: 'Renewed',
    BACHELOR: 'Bachelor',
    MASTER: 'Master',
    DOCTOR: 'Doctor',
  }

  return items.map((item) => ({ label: labels[item] ?? item, value: item }))
}
