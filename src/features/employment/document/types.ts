// types.ts — Document Center domain types

export type DocumentVerificationStatus =
  'verified' | 'valid' | 'missing' | 'expiring' | 'expired' | 'pending'

export type DocumentKey =
  'ktp' | 'kk' | 'npwp' | 'bpjs_kes' | 'bpjs_tk' | 'ijazah' | 'certificate' | 'mcu' | string

export interface EmployeeDocumentItem {
  id: string
  key: DocumentKey
  name: string
  required: boolean
  fieldLabel: string
  fieldValue?: string
  fileName?: string
  fileSize?: string
  fileUrl?: string
  status: DocumentVerificationStatus
  verifiedAt?: string
  dueDate?: string
  notes?: string
}

export interface EmployeeDocumentCompleteness {
  id: string
  employeeId: string
  employeeCode: string
  fullName: string
  photo: string | null
  department: string
  position: string
  completedCount: number
  totalRequired: number
  missingCount: number
  expiringCount: number
  lastUpdated: string
  documents: EmployeeDocumentItem[]
}

export interface DocumentOverviewStats {
  totalEmployees: number
  completedCount: number
  completedPercentage: number
  missingDocumentsCount: number
  expiringCount: number
}

export type CertificateStatus = 'active' | 'expiring' | 'expired' | 'lifetime'

export interface CertificateItem {
  id: string
  employeeId: string
  employeeCode: string
  fullName: string
  photo: string | null
  department: string
  title: string
  issuer: string
  issuedDate: string
  expiryDate: string
  status: CertificateStatus
  credentialId?: string
  fileName?: string
  fileSize?: string
  fileUrl?: string
}

export interface CertificateStats {
  totalCertificates: number
  activeCount: number
  activePercentage: number
  expiringCount: number
  expiredCount: number
  lifetimeCount: number
}

export type AttachmentCategory =
  'Recruitment' | 'Training' | 'Medical' | 'Recognition' | 'Other' | (string & {})

export interface AttachmentItem {
  id: string
  employeeId: string
  employeeCode: string
  fullName: string
  photo: string | null
  department: string
  fileName: string
  fileSize: string
  category: AttachmentCategory
  uploadedDate: string
  uploadedBy: string
  fileUrl?: string
}

export interface AttachmentStats {
  totalAttachments: number
  employeesWithAttachments: number
  storageUsed: string
  uploadedThisMonth: number
}

export interface SaveEmployeeDocumentsPayload {
  employeeId: string
  documents: Array<{
    key: string
    fieldValue?: string
    fileName?: string
    fileSize?: string
    fileUrl?: string
    status?: DocumentVerificationStatus
    dueDate?: string
  }>
}

export interface CreateCertificatePayload {
  employeeId: string
  title: string
  issuer: string
  issuedDate: string
  expiryDate?: string
  hasNoExpiry?: boolean
  credentialId?: string
  fileName?: string
}

export interface UpdateCertificatePayload extends Partial<CreateCertificatePayload> {
  id: string
  status?: CertificateStatus
}

export interface CreateAttachmentPayload {
  employeeId: string
  fileName: string
  category: AttachmentCategory
  fileSize?: string
}

export interface UpdateAttachmentPayload extends Partial<CreateAttachmentPayload> {
  id: string
}
