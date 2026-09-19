import { z } from 'zod'

export interface SelectOption {
  value: string
  label: string
}

export const employeeCreateValues = {
  bloodTypes: ['A', 'B', 'AB', 'O'],
  citizenships: ['WNI', 'WNA'],
  contactTypes: ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'EMERGENCY'],
  contractStatuses: ['ACTIVE', 'EXPIRED', 'TERMINATED'],
  contractTypes: ['PKWT', 'PKWTT', 'INTERNSHIP', 'FREELANCE'],
  educationLevels: ['SD', 'SMP', 'SMA', 'DIPLOMA', 'S1', 'S2', 'S3'],
  employeeStatuses: ['ACTIVE', 'INACTIVE', 'RESIGNED'],
  employmentTypes: ['PERMANENT', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'],
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
      bankAccountHolderName: schema.string(),
      bankAccountNumber: schema.string(),
      bankId: schema.string(),
      bloodType: schema.string(),
      bpjsKesehatanNumber: schema.string(),
      bpjsKetenagakerjaanNumber: schema.string(),
      citizenshipStatus: schema.string(),
      city: schema.string(),
      country: schema.string(),
      dateOfBirth: schema.string(),
      district: schema.string(),
      domicileAddress: schema.string(),
      drivingLicenseNumber: schema.string(),
      employeeNumber: schema.string().trim().min(1, { message: messages.required }),
      employeeStatus: schema.string(),
      employmentType: schema.string(),
      fullName: schema.string().trim().min(1, { message: messages.required }),
      gender: schema.string(),
      heightCm: schema.string(),
      hireDate: schema.string().min(1, { message: messages.required }),
      kkNumber: schema.string(),
      ktpNumber: schema.string(),
      lastEducationLevel: schema.string(),
      latitude: schema.string(),
      longitude: schema.string(),
      maritalStatus: schema.string(),
      motherMaidenName: schema.string(),
      npwpNumber: schema.string(),
      personalEmail: schema.email({ message: messages.email }),
      phoneNumber: schema.string(),
      photoFileId: schema.string(),
      placeOfBirth: schema.string(),
      postalCode: schema.string(),
      province: schema.string(),
      religion: schema.string(),
      resignDate: schema.string(),
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
        divisionUnitId: schema.string(),
        effectiveEndDate: schema.string(),
        effectiveStartDate: schema.string().min(1, { message: messages.required }),
        gradeId: schema.string(),
        positionId: schema.string(),
        sectionUnitId: schema.string(),
        supervisorEmployeeId: schema.string(),
        workLocation: schema.string(),
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
    documents: schema.array(
      schema.object({
        documentFileId: schema.string(),
        documentNumber: schema.string(),
        documentTypeId: schema.string(),
        expiryDate: schema.string(),
        issuedDate: schema.string(),
        verificationStatus: schema.string(),
        verifiedAt: schema.string(),
        verifiedBy: schema.string(),
      }),
    ),
    educations: schema.array(
      schema.object({
        certificateFileId: schema.string(),
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
        employeeId: schema.string(),
        isPrimary: schema.boolean(),
        projectId: schema.string(),
        roleInProject: schema.string(),
      }),
    ),
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
  gradeId: '',
  positionId: '',
  sectionUnitId: '',
  supervisorEmployeeId: '',
  workLocation: '',
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

export const emptyDocument = (): EmployeeCreateFormValues['documents'][number] => ({
  documentFileId: '',
  documentNumber: '',
  documentTypeId: '',
  expiryDate: '',
  issuedDate: '',
  verificationStatus: 'PENDING',
  verifiedAt: '',
  verifiedBy: '',
})

export const emptyEducation = (): EmployeeCreateFormValues['educations'][number] => ({
  certificateFileId: '',
  educationLevel: 'SD',
  gpa: '',
  graduationYear: '',
  institutionName: '',
  major: '',
})

export const emptyProject = (): EmployeeCreateFormValues['projects'][number] => ({
  effectiveEndDate: '',
  effectiveStartDate: '',
  employeeId: '',
  isPrimary: false,
  projectId: '',
  roleInProject: '',
})

export const employeeCreateDefaultValues: EmployeeCreateFormValues = {
  employee: {
    address: '',
    attendanceMachineNumber: '',
    bankAccountHolderName: '',
    bankAccountNumber: '',
    bankId: '',
    bloodType: '',
    bpjsKesehatanNumber: '',
    bpjsKetenagakerjaanNumber: '',
    citizenshipStatus: 'WNI',
    city: '',
    country: 'Indonesia',
    dateOfBirth: '',
    district: '',
    domicileAddress: '',
    drivingLicenseNumber: '',
    employeeNumber: '',
    employeeStatus: 'ACTIVE',
    employmentType: 'PERMANENT',
    fullName: '',
    gender: '',
    heightCm: '',
    hireDate: '',
    kkNumber: '',
    ktpNumber: '',
    lastEducationLevel: '',
    latitude: '',
    longitude: '',
    maritalStatus: '',
    motherMaidenName: '',
    npwpNumber: '',
    personalEmail: '',
    phoneNumber: '',
    photoFileId: '',
    placeOfBirth: '',
    postalCode: '',
    province: '',
    religion: '',
    resignDate: '',
    terminationReason: '',
    village: '',
    weightKg: '',
    whatsappNumber: '',
    workPermitNumber: '',
  },
  assignments: [emptyAssignment()],
  contacts: [{ ...emptyContact(), isDependent: true, isEmergency: true }],
  contracts: [emptyContract()],
  documents: [emptyDocument()],
  educations: [emptyEducation()],
  projects: [],
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
    EMERGENCY: 'Emergency',
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
  }

  return items.map((item) => ({ label: labels[item] ?? item, value: item }))
}
