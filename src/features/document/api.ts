// api.ts — Document Center feature API calls with in-memory dummy data
import type {
  AttachmentItem,
  AttachmentStats,
  CertificateItem,
  CertificateStats,
  CreateAttachmentPayload,
  CreateCertificatePayload,
  DocumentOverviewStats,
  EmployeeDocumentCompleteness,
  EmployeeDocumentItem,
  SaveEmployeeDocumentsPayload,
  UpdateAttachmentPayload,
  UpdateCertificatePayload,
} from '@/features/document/types'
import type { Envelope } from '@/shared/types'

const sleep = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

const DEFAULT_DOC_TEMPLATE: Array<Omit<EmployeeDocumentItem, 'id' | 'fieldValue' | 'fileName' | 'fileSize' | 'status' | 'verifiedAt' | 'dueDate'>> = [
  { key: 'ktp', name: 'KTP', required: true, fieldLabel: 'NIK' },
  { key: 'kk', name: 'Kartu Keluarga', required: true, fieldLabel: 'No. KK' },
  { key: 'npwp', name: 'NPWP', required: true, fieldLabel: 'NPWP' },
  { key: 'bpjs_kes', name: 'BPJS Kesehatan', required: true, fieldLabel: 'BPJS No.' },
  { key: 'bpjs_tk', name: 'BPJS Ketenagakerjaan', required: true, fieldLabel: 'BPJS No.' },
  { key: 'ijazah', name: 'Ijazah Terakhir', required: true, fieldLabel: 'Education' },
]

// ─── Mock Data: Employee Document Completeness ──────────────────────────────
let mockEmployeeCompleteness: EmployeeDocumentCompleteness[] = [
  {
    id: 'doc-comp-1',
    employeeId: 'emp-1',
    employeeCode: 'EMP001',
    fullName: 'Rian Wijaya',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'IT & Engineering',
    position: 'Senior Frontend Engineer',
    completedCount: 6,
    totalRequired: 6,
    missingCount: 0,
    expiringCount: 0,
    lastUpdated: 'Today',
    documents: [
      { id: 'd-1-1', key: 'ktp', name: 'KTP', required: true, fieldLabel: 'NIK', fieldValue: '3171012345678901', fileName: 'KTP_Rian.pdf', fileSize: '1.2 MB', status: 'verified', verifiedAt: '2023-01-20' },
      { id: 'd-1-2', key: 'kk', name: 'Kartu Keluarga', required: true, fieldLabel: 'No. KK', fieldValue: '3171019988776655', fileName: 'KK_Rian.pdf', fileSize: '850 KB', status: 'verified', verifiedAt: '2023-01-20' },
      { id: 'd-1-3', key: 'npwp', name: 'NPWP', required: true, fieldLabel: 'NPWP', fieldValue: '01.234.567.8-901.000', fileName: 'NPWP_Rian.pdf', fileSize: '620 KB', status: 'verified', verifiedAt: '2023-01-20' },
      { id: 'd-1-4', key: 'bpjs_kes', name: 'BPJS Kesehatan', required: true, fieldLabel: 'BPJS No.', fieldValue: '98765432109', fileName: 'BPJS-KES_Rian.pdf', fileSize: '480 KB', status: 'verified', verifiedAt: '2023-01-21' },
      { id: 'd-1-5', key: 'bpjs_tk', name: 'BPJS Ketenagakerjaan', required: true, fieldLabel: 'BPJS No.', fieldValue: '12345678901', fileName: 'BPJS-TK_Rian.pdf', fileSize: '510 KB', status: 'verified', verifiedAt: '2023-01-21' },
      { id: 'd-1-6', key: 'ijazah', name: 'Ijazah Terakhir', required: true, fieldLabel: 'Education', fieldValue: 'S1 Teknik Informatika - ITB', fileName: 'Ijazah_Rian.pdf', fileSize: '2.1 MB', status: 'verified', verifiedAt: '2023-01-22' },
    ],
  },
  {
    id: 'doc-comp-2',
    employeeId: 'emp-2',
    employeeCode: 'EMP002',
    fullName: 'Siti Aminah',
    photo: null,
    department: 'Human Resource',
    position: 'HR Specialist',
    completedCount: 5,
    totalRequired: 6,
    missingCount: 1,
    expiringCount: 0,
    lastUpdated: 'Yesterday',
    documents: [
      { id: 'd-2-1', key: 'ktp', name: 'KTP', required: true, fieldLabel: 'NIK', fieldValue: '3273019876543210', fileName: 'KTP_Siti.pdf', fileSize: '980 KB', status: 'verified', verifiedAt: '2026-06-02' },
      { id: 'd-2-2', key: 'kk', name: 'Kartu Keluarga', required: true, fieldLabel: 'No. KK', fieldValue: '3273014455667788', fileName: 'KK_Siti.pdf', fileSize: '740 KB', status: 'verified', verifiedAt: '2026-06-02' },
      { id: 'd-2-3', key: 'npwp', name: 'NPWP', required: true, fieldLabel: 'NPWP', fieldValue: '02.456.789.0-901.000', fileName: 'NPWP_Siti.pdf', fileSize: '560 KB', status: 'verified', verifiedAt: '2026-06-02' },
      { id: 'd-2-4', key: 'bpjs_kes', name: 'BPJS Kesehatan', required: true, fieldLabel: 'BPJS No.', fieldValue: '66778899001', fileName: 'BPJS-KES_Siti.pdf', fileSize: '490 KB', status: 'verified', verifiedAt: '2026-06-03' },
      { id: 'd-2-5', key: 'bpjs_tk', name: 'BPJS Ketenagakerjaan', required: true, fieldLabel: 'BPJS No.', fieldValue: '', fileName: undefined, status: 'missing' },
      { id: 'd-2-6', key: 'ijazah', name: 'Ijazah Terakhir', required: true, fieldLabel: 'Education', fieldValue: 'S1 Psikologi - Universitas Indonesia', fileName: 'Ijazah_Siti.pdf', fileSize: '1.8 MB', status: 'verified', verifiedAt: '2026-06-03' },
    ],
  },
  {
    id: 'doc-comp-3',
    employeeId: 'emp-3',
    employeeCode: 'EMP003',
    fullName: 'Budi Santoso',
    photo: null,
    department: 'IT & Engineering',
    position: 'Engineering Manager',
    completedCount: 4,
    totalRequired: 6,
    missingCount: 2,
    expiringCount: 0,
    lastUpdated: '2 days ago',
    documents: [
      { id: 'd-3-1', key: 'ktp', name: 'KTP', required: true, fieldLabel: 'NIK', fieldValue: '3174011223344556', fileName: 'KTP_Budi.pdf', fileSize: '1.1 MB', status: 'verified', verifiedAt: '2020-03-12' },
      { id: 'd-3-2', key: 'kk', name: 'Kartu Keluarga', required: true, fieldLabel: 'No. KK', fieldValue: '3174019900112233', fileName: 'KK_Budi.pdf', fileSize: '810 KB', status: 'verified', verifiedAt: '2020-03-12' },
      { id: 'd-3-3', key: 'npwp', name: 'NPWP', required: true, fieldLabel: 'NPWP', fieldValue: '03.789.012.3-456.000', fileName: 'NPWP_Budi.pdf', fileSize: '610 KB', status: 'verified', verifiedAt: '2020-03-12' },
      { id: 'd-3-4', key: 'bpjs_kes', name: 'BPJS Kesehatan', required: true, fieldLabel: 'BPJS No.', fieldValue: '', fileName: undefined, status: 'missing' },
      { id: 'd-3-5', key: 'bpjs_tk', name: 'BPJS Ketenagakerjaan', required: true, fieldLabel: 'BPJS No.', fieldValue: '', fileName: undefined, status: 'missing' },
      { id: 'd-3-6', key: 'ijazah', name: 'Ijazah Terakhir', required: true, fieldLabel: 'Education', fieldValue: 'S2 Computer Science - NUS', fileName: 'Ijazah_Budi.pdf', fileSize: '2.4 MB', status: 'verified', verifiedAt: '2020-03-15' },
    ],
  },
  {
    id: 'doc-comp-4',
    employeeId: 'emp-4',
    employeeCode: 'EMP004',
    fullName: 'Dewi Lestari',
    photo: null,
    department: 'Human Resource',
    position: 'HR Manager',
    completedCount: 6,
    totalRequired: 6,
    missingCount: 0,
    expiringCount: 0,
    lastUpdated: '3 days ago',
    documents: [
      { id: 'd-4-1', key: 'ktp', name: 'KTP', required: true, fieldLabel: 'NIK', fieldValue: '3175023344556677', fileName: 'KTP_Dewi.pdf', fileSize: '1.3 MB', status: 'verified', verifiedAt: '2021-05-14' },
      { id: 'd-4-2', key: 'kk', name: 'Kartu Keluarga', required: true, fieldLabel: 'No. KK', fieldValue: '3175028899001122', fileName: 'KK_Dewi.pdf', fileSize: '890 KB', status: 'verified', verifiedAt: '2021-05-14' },
      { id: 'd-4-3', key: 'npwp', name: 'NPWP', required: true, fieldLabel: 'NPWP', fieldValue: '04.123.456.7-890.000', fileName: 'NPWP_Dewi.pdf', fileSize: '650 KB', status: 'verified', verifiedAt: '2021-05-14' },
      { id: 'd-4-4', key: 'bpjs_kes', name: 'BPJS Kesehatan', required: true, fieldLabel: 'BPJS No.', fieldValue: '77889900112', fileName: 'BPJS-KES_Dewi.pdf', fileSize: '530 KB', status: 'verified', verifiedAt: '2021-05-15' },
      { id: 'd-4-5', key: 'bpjs_tk', name: 'BPJS Ketenagakerjaan', required: true, fieldLabel: 'BPJS No.', fieldValue: '33445566778', fileName: 'BPJS-TK_Dewi.pdf', fileSize: '540 KB', status: 'verified', verifiedAt: '2021-05-15' },
      { id: 'd-4-6', key: 'ijazah', name: 'Ijazah Terakhir', required: true, fieldLabel: 'Education', fieldValue: 'S2 Manajemen SDM - UGM', fileName: 'Ijazah_Dewi.pdf', fileSize: '2.0 MB', status: 'verified', verifiedAt: '2021-05-16' },
    ],
  },
  {
    id: 'doc-comp-5',
    employeeId: 'emp-5',
    employeeCode: 'EMP005',
    fullName: 'Andi Pratama',
    photo: null,
    department: 'IT & Engineering',
    position: 'Backend Developer',
    completedCount: 2,
    totalRequired: 6,
    missingCount: 4,
    expiringCount: 0,
    lastUpdated: '5 days ago',
    documents: [
      { id: 'd-5-1', key: 'ktp', name: 'KTP', required: true, fieldLabel: 'NIK', fieldValue: '3172034455667788', fileName: 'KTP_Andi.pdf', fileSize: '1.0 MB', status: 'verified', verifiedAt: '2026-07-01' },
      { id: 'd-5-2', key: 'kk', name: 'Kartu Keluarga', required: true, fieldLabel: 'No. KK', fieldValue: '3172037788990011', fileName: 'KK_Andi.pdf', fileSize: '780 KB', status: 'verified', verifiedAt: '2026-07-01' },
      { id: 'd-5-3', key: 'npwp', name: 'NPWP', required: true, fieldLabel: 'NPWP', fieldValue: '', fileName: undefined, status: 'missing' },
      { id: 'd-5-4', key: 'bpjs_kes', name: 'BPJS Kesehatan', required: true, fieldLabel: 'BPJS No.', fieldValue: '', fileName: undefined, status: 'missing' },
      { id: 'd-5-5', key: 'bpjs_tk', name: 'BPJS Ketenagakerjaan', required: true, fieldLabel: 'BPJS No.', fieldValue: '', fileName: undefined, status: 'missing' },
      { id: 'd-5-6', key: 'ijazah', name: 'Ijazah Terakhir', required: true, fieldLabel: 'Education', fieldValue: '', fileName: undefined, status: 'missing' },
    ],
  },
  {
    id: 'doc-comp-6',
    employeeId: 'emp-6',
    employeeCode: 'EMP006',
    fullName: 'Nita Putri',
    photo: null,
    department: 'Marketing & Design',
    position: 'UI/UX Designer',
    completedCount: 0,
    totalRequired: 6,
    missingCount: 6,
    expiringCount: 0,
    lastUpdated: '1 week ago',
    documents: [
      { id: 'd-6-1', key: 'ktp', name: 'KTP', required: true, fieldLabel: 'NIK', fieldValue: '', fileName: undefined, status: 'missing' },
      { id: 'd-6-2', key: 'kk', name: 'Kartu Keluarga', required: true, fieldLabel: 'No. KK', fieldValue: '', fileName: undefined, status: 'missing' },
      { id: 'd-6-3', key: 'npwp', name: 'NPWP', required: true, fieldLabel: 'NPWP', fieldValue: '', fileName: undefined, status: 'missing' },
      { id: 'd-6-4', key: 'bpjs_kes', name: 'BPJS Kesehatan', required: true, fieldLabel: 'BPJS No.', fieldValue: '', fileName: undefined, status: 'missing' },
      { id: 'd-6-5', key: 'bpjs_tk', name: 'BPJS Ketenagakerjaan', required: true, fieldLabel: 'BPJS No.', fieldValue: '', fileName: undefined, status: 'missing' },
      { id: 'd-6-6', key: 'ijazah', name: 'Ijazah Terakhir', required: true, fieldLabel: 'Education', fieldValue: '', fileName: undefined, status: 'missing' },
    ],
  },
]

// ─── Mock Data: Certificates ────────────────────────────────────────────────
let mockCertificates: CertificateItem[] = [
  {
    id: 'cert-1',
    employeeId: 'emp-1',
    employeeCode: 'EMP001',
    fullName: 'Rian Wijaya',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'IT & Engineering',
    title: 'Project Management Professional',
    issuer: 'PMI',
    issuedDate: '12 Mar 2023',
    expiryDate: '12 Mar 2028',
    status: 'active',
    credentialId: 'PMI-99201',
    fileName: 'CERT_PMP_Rian.pdf',
    fileSize: '1.2 MB',
  },
  {
    id: 'cert-2',
    employeeId: 'emp-2',
    employeeCode: 'EMP002',
    fullName: 'Siti Aminah',
    photo: null,
    department: 'Human Resource',
    title: 'AWS Solutions Architect',
    issuer: 'Amazon Web Services',
    issuedDate: '20 Jun 2024',
    expiryDate: '20 Jun 2027',
    status: 'active',
    credentialId: 'AWS-SA-8831',
    fileName: 'CERT_AWS_Siti.pdf',
    fileSize: '950 KB',
  },
  {
    id: 'cert-3',
    employeeId: 'emp-3',
    employeeCode: 'EMP003',
    fullName: 'Budi Santoso',
    photo: null,
    department: 'IT & Engineering',
    title: 'Tax Brevet A/B Certification',
    issuer: 'IAI',
    issuedDate: '14 Sep 2023',
    expiryDate: '14 Sep 2026',
    status: 'expiring',
    credentialId: 'IAI-TB-5421',
    fileName: 'CERT_Brevet_Budi.pdf',
    fileSize: '1.4 MB',
  },
  {
    id: 'cert-4',
    employeeId: 'emp-4',
    employeeCode: 'EMP004',
    fullName: 'Dewi Lestari',
    photo: null,
    department: 'Human Resource',
    title: 'HR Analytics Professional',
    issuer: 'HRCI',
    issuedDate: '01 Feb 2025',
    expiryDate: 'No Expiry',
    status: 'lifetime',
    credentialId: 'HRCI-AN-3312',
    fileName: 'CERT_HRA_Dewi.pdf',
    fileSize: '840 KB',
  },
  {
    id: 'cert-5',
    employeeId: 'emp-5',
    employeeCode: 'EMP005',
    fullName: 'Andi Pratama',
    photo: null,
    department: 'IT & Engineering',
    title: 'Safety Officer Ahli K3',
    issuer: 'Kemnaker',
    issuedDate: '12 Aug 2020',
    expiryDate: '12 Aug 2024',
    status: 'expired',
    credentialId: 'KM-K3-0091',
    fileName: 'CERT_K3_Andi.pdf',
    fileSize: '1.1 MB',
  },
]

// ─── Mock Data: Attachments ─────────────────────────────────────────────────
let mockAttachments: AttachmentItem[] = [
  {
    id: 'att-1',
    employeeId: 'emp-1',
    employeeCode: 'EMP001',
    fullName: 'Rian Wijaya',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'IT & Engineering',
    fileName: 'Offer_Letter_Rian_Wijaya.pdf',
    category: 'Recruitment',
    uploadedDate: '12 Jan 2023',
    uploadedBy: 'HR Admin',
    fileSize: '1.2 MB',
  },
  {
    id: 'att-1-2',
    employeeId: 'emp-1',
    employeeCode: 'EMP001',
    fullName: 'Rian Wijaya',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'IT & Engineering',
    fileName: 'Confidentiality_NDA_Rian.pdf',
    category: 'Recruitment',
    uploadedDate: '15 Jan 2023',
    uploadedBy: 'Legal Dept',
    fileSize: '890 KB',
  },
  {
    id: 'att-1-3',
    employeeId: 'emp-1',
    employeeCode: 'EMP001',
    fullName: 'Rian Wijaya',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'IT & Engineering',
    fileName: 'Annual_MCU_Health_Checkup_2026.pdf',
    category: 'Medical',
    uploadedDate: '10 Feb 2026',
    uploadedBy: 'HR Clinic',
    fileSize: '1.5 MB',
  },
  {
    id: 'att-2',
    employeeId: 'emp-2',
    employeeCode: 'EMP002',
    fullName: 'Siti Aminah',
    photo: null,
    department: 'Human Resource',
    fileName: 'Training_Record_HRCI.pdf',
    category: 'Training',
    uploadedDate: '20 Jul 2026',
    uploadedBy: 'Siti Aminah',
    fileSize: '2.4 MB',
  },
  {
    id: 'att-2-2',
    employeeId: 'emp-2',
    employeeCode: 'EMP002',
    fullName: 'Siti Aminah',
    photo: null,
    department: 'Human Resource',
    fileName: 'Employment_Contract_Signed_Siti.pdf',
    category: 'Recruitment',
    uploadedDate: '01 Jun 2026',
    uploadedBy: 'HR Admin',
    fileSize: '1.1 MB',
  },
  {
    id: 'att-3',
    employeeId: 'emp-3',
    employeeCode: 'EMP003',
    fullName: 'Budi Santoso',
    photo: null,
    department: 'IT & Engineering',
    fileName: 'Medical_Note_Fit_To_Work.pdf',
    category: 'Medical',
    uploadedDate: '14 Jun 2026',
    uploadedBy: 'HR Admin',
    fileSize: '480 KB',
  },
  {
    id: 'att-3-2',
    employeeId: 'emp-3',
    employeeCode: 'EMP003',
    fullName: 'Budi Santoso',
    photo: null,
    department: 'IT & Engineering',
    fileName: 'Leadership_Workshop_Completion.pdf',
    category: 'Training',
    uploadedDate: '10 May 2025',
    uploadedBy: 'Budi Santoso',
    fileSize: '1.8 MB',
  },
  {
    id: 'att-4',
    employeeId: 'emp-4',
    employeeCode: 'EMP004',
    fullName: 'Dewi Lestari',
    photo: null,
    department: 'Human Resource',
    fileName: 'Award_Excellence_2025.pdf',
    category: 'Recognition',
    uploadedDate: '01 Dec 2025',
    uploadedBy: 'Dewi Lestari',
    fileSize: '890 KB',
  },
  {
    id: 'att-4-2',
    employeeId: 'emp-4',
    employeeCode: 'EMP004',
    fullName: 'Dewi Lestari',
    photo: null,
    department: 'Human Resource',
    fileName: 'Strategic_HR_Summit_Attendance.pdf',
    category: 'Training',
    uploadedDate: '18 Nov 2025',
    uploadedBy: 'HR Operations',
    fileSize: '1.3 MB',
  },
  {
    id: 'att-5',
    employeeId: 'emp-5',
    employeeCode: 'EMP005',
    fullName: 'Andi Pratama',
    photo: null,
    department: 'IT & Engineering',
    fileName: 'Supporting_K3_Compliance_Doc.pdf',
    category: 'Other',
    uploadedDate: '12 Aug 2026',
    uploadedBy: 'HR Admin',
    fileSize: '1.8 MB',
  },
]

// ─── Endpoints: Overview & Completeness ──────────────────────────────────────

export const getDocumentOverviewStats = async (): Promise<Envelope<DocumentOverviewStats>> => {
  await sleep()
  const totalMissing = mockEmployeeCompleteness.reduce((acc, curr) => acc + curr.missingCount, 0)
  const totalExpiring = mockEmployeeCompleteness.reduce((acc, curr) => acc + curr.expiringCount, 0)

  return {
    success: true,
    code: '200',
    data: {
      totalEmployees: 1248, // Global active records metric from design
      completedCount: 1086,
      completedPercentage: 87,
      missingDocumentsCount: totalMissing || 162,
      expiringCount: totalExpiring || 42,
    },
    messages: [],
  }
}

export const getDocumentCompletenessList = async (
  search?: string,
  department?: string,
  status?: string,
  completeness?: string,
): Promise<Envelope<EmployeeDocumentCompleteness[]>> => {
  await sleep()
  let filtered = [...mockEmployeeCompleteness]

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q),
    )
  }

  if (department && department !== 'all') {
    filtered = filtered.filter((e) => e.department.toLowerCase() === department.toLowerCase())
  }

  if (status && status !== 'all') {
    if (status === 'complete') {
      filtered = filtered.filter((e) => e.missingCount === 0)
    } else if (status === 'missing') {
      filtered = filtered.filter((e) => e.missingCount > 0)
    } else if (status === 'expiring') {
      filtered = filtered.filter((e) => e.expiringCount > 0)
    }
  }

  if (completeness && completeness !== 'all') {
    if (completeness === '6/6') {
      filtered = filtered.filter((e) => e.completedCount === 6)
    } else if (completeness === 'incomplete') {
      filtered = filtered.filter((e) => e.completedCount < 6)
    }
  }

  return { success: true, code: '200', data: filtered, messages: [] }
}

export const getEmployeeDocumentDetails = async (
  employeeId: string,
): Promise<Envelope<EmployeeDocumentCompleteness | null>> => {
  await sleep()
  const found = mockEmployeeCompleteness.find((e) => e.employeeId === employeeId)
  if (found) {
    return { success: true, code: '200', data: found, messages: [] }
  }

  // Fallback template for any other employee ID
  const fallbackRecord: EmployeeDocumentCompleteness = {
    id: `doc-comp-${employeeId}`,
    employeeId,
    employeeCode: 'EMP000',
    fullName: 'Employee',
    photo: null,
    department: 'General',
    position: 'Staff',
    completedCount: 0,
    totalRequired: 6,
    missingCount: 6,
    expiringCount: 0,
    lastUpdated: 'Just now',
    documents: DEFAULT_DOC_TEMPLATE.map((tmpl, idx) => ({
      ...tmpl,
      id: `doc-${employeeId}-${idx}`,
      status: tmpl.required ? 'missing' : 'pending',
    })),
  }

  return { success: true, code: '200', data: fallbackRecord, messages: [] }
}

export const saveEmployeeDocuments = async (
  payload: SaveEmployeeDocumentsPayload,
): Promise<Envelope<EmployeeDocumentCompleteness>> => {
  await sleep()
  const targetIndex = mockEmployeeCompleteness.findIndex((e) => e.employeeId === payload.employeeId)

  let record: EmployeeDocumentCompleteness
  if (targetIndex >= 0) {
    record = { ...mockEmployeeCompleteness[targetIndex] }
  } else {
    record = {
      id: `doc-comp-${payload.employeeId}`,
      employeeId: payload.employeeId,
      employeeCode: 'EMP000',
      fullName: 'Employee',
      photo: null,
      department: 'General',
      position: 'Staff',
      completedCount: 0,
      totalRequired: 6,
      missingCount: 6,
      expiringCount: 0,
      lastUpdated: 'Just now',
      documents: DEFAULT_DOC_TEMPLATE.map((t, idx) => ({
        ...t,
        id: `d-${payload.employeeId}-${idx}`,
        status: t.required ? 'missing' : 'pending',
      })),
    }
  }

  // Update documents in record
  const updatedDocs = record.documents.map((doc) => {
    const patch = payload.documents.find((p) => p.key === doc.key)
    if (patch) {
      const hasFile = Boolean(patch.fileName || doc.fileName)
      return {
        ...doc,
        fieldValue: patch.fieldValue !== undefined ? patch.fieldValue : doc.fieldValue,
        fileName: patch.fileName || doc.fileName,
        fileSize: patch.fileSize || doc.fileSize || '1.0 MB',
        fileUrl: patch.fileUrl || doc.fileUrl,
        dueDate: patch.dueDate || doc.dueDate,
        status: patch.status || (hasFile ? 'verified' : (doc.required ? 'missing' : 'pending')),
        verifiedAt: hasFile ? new Date().toISOString().slice(0, 10) : doc.verifiedAt,
      }
    }
    return doc
  })

  // Calculate new counts
  const reqDocs = updatedDocs.filter((d) => d.required)
  const completedCount = reqDocs.filter((d) => d.status === 'verified' && Boolean(d.fileName)).length
  const missingCount = reqDocs.length - completedCount
  const expiringCount = updatedDocs.filter((d) => d.status === 'expiring').length

  const updatedRecord: EmployeeDocumentCompleteness = {
    ...record,
    completedCount,
    missingCount,
    expiringCount,
    lastUpdated: 'Today',
    documents: updatedDocs,
  }

  if (targetIndex >= 0) {
    mockEmployeeCompleteness[targetIndex] = updatedRecord
  } else {
    mockEmployeeCompleteness = [updatedRecord, ...mockEmployeeCompleteness]
  }

  return { success: true, code: '200', data: updatedRecord, messages: [] }
}

// ─── Endpoints: Certificates ────────────────────────────────────────────────

export const getCertificateStats = async (): Promise<Envelope<CertificateStats>> => {
  await sleep()
  const active = mockCertificates.filter((c) => c.status === 'active').length
  const expiring = mockCertificates.filter((c) => c.status === 'expiring').length
  const expired = mockCertificates.filter((c) => c.status === 'expired').length
  const lifetime = mockCertificates.filter((c) => c.status === 'lifetime').length

  return {
    success: true,
    code: '200',
    data: {
      totalCertificates: 486,
      activeCount: active || 398,
      activePercentage: 88,
      expiringCount: expiring || 28,
      expiredCount: expired || 20,
      lifetimeCount: lifetime || 40,
    },
    messages: [],
  }
}

export const getCertificates = async (
  search?: string,
  issuer?: string,
  status?: string,
  _expiryRange?: string,
  employeeId?: string,
): Promise<Envelope<CertificateItem[]>> => {
  await sleep()
  let filtered = [...mockCertificates]

  if (employeeId) {
    filtered = filtered.filter((c) => c.employeeId === employeeId)
  }

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.employeeCode.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q),
    )
  }

  if (issuer && issuer !== 'all') {
    filtered = filtered.filter((c) => c.issuer.toLowerCase() === issuer.toLowerCase())
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((c) => c.status === status)
  }

  return { success: true, code: '200', data: filtered, messages: [] }
}

export const createCertificate = async (
  payload: CreateCertificatePayload,
): Promise<Envelope<CertificateItem>> => {
  await sleep()
  const emp = mockEmployeeCompleteness.find((e) => e.employeeId === payload.employeeId)

  let status: CertificateItem['status'] = 'active'
  let expiryDate = payload.expiryDate || 'No Expiry'

  if (payload.hasNoExpiry) {
    status = 'lifetime'
    expiryDate = 'No Expiry'
  } else if (payload.expiryDate) {
    const expTime = new Date(payload.expiryDate).getTime()
    const now = Date.now()
    const thirtyDays = 30 * 24 * 60 * 60 * 1000

    if (expTime < now) {
      status = 'expired'
    } else if (expTime - now < thirtyDays) {
      status = 'expiring'
    } else {
      status = 'active'
    }
  }

  const newCert: CertificateItem = {
    id: `cert-${Date.now()}`,
    employeeId: payload.employeeId,
    employeeCode: emp?.employeeCode ?? 'EMP000',
    fullName: emp?.fullName ?? 'Employee',
    photo: emp?.photo ?? null,
    department: emp?.department ?? 'IT & Engineering',
    title: payload.title,
    issuer: payload.issuer,
    issuedDate: payload.issuedDate,
    expiryDate,
    status,
    credentialId: payload.credentialId || `CRED-${Math.floor(1000 + Math.random() * 9000)}`,
    fileName: payload.fileName || 'Certificate.pdf',
    fileSize: '1.2 MB',
  }

  mockCertificates = [newCert, ...mockCertificates]
  return { success: true, code: '200', data: newCert, messages: [] }
}

export const updateCertificate = async (
  payload: UpdateCertificatePayload,
): Promise<Envelope<CertificateItem>> => {
  await sleep()
  const idx = mockCertificates.findIndex((c) => c.id === payload.id)
  if (idx < 0) {
    throw new Error('Certificate not found')
  }

  const existing = mockCertificates[idx]
  let status = payload.status || existing.status
  let expiryDate = payload.expiryDate !== undefined ? payload.expiryDate : existing.expiryDate

  if (payload.hasNoExpiry) {
    status = 'lifetime'
    expiryDate = 'No Expiry'
  } else if (payload.expiryDate && payload.expiryDate !== 'No Expiry') {
    const expTime = new Date(payload.expiryDate).getTime()
    const now = Date.now()
    const thirtyDays = 30 * 24 * 60 * 60 * 1000

    if (expTime < now) {
      status = 'expired'
    } else if (expTime - now < thirtyDays) {
      status = 'expiring'
    } else {
      status = 'active'
    }
  }

  const updatedCert: CertificateItem = {
    ...existing,
    title: payload.title ?? existing.title,
    issuer: payload.issuer ?? existing.issuer,
    issuedDate: payload.issuedDate ?? existing.issuedDate,
    expiryDate,
    status,
    credentialId: payload.credentialId !== undefined ? payload.credentialId : existing.credentialId,
    fileName: payload.fileName || existing.fileName,
  }

  mockCertificates[idx] = updatedCert
  return { success: true, code: '200', data: updatedCert, messages: [] }
}

export const deleteCertificates = async (
  ids: string[],
): Promise<Envelope<{ deletedIds: string[] }>> => {
  await sleep()
  mockCertificates = mockCertificates.filter((c) => !ids.includes(c.id))
  return { success: true, code: '200', data: { deletedIds: ids }, messages: [] }
}

// ─── Endpoints: Attachments ─────────────────────────────────────────────────

export const getAttachmentStats = async (): Promise<Envelope<AttachmentStats>> => {
  await sleep()
  return {
    success: true,
    code: '200',
    data: {
      totalAttachments: 1864,
      employeesWithAttachments: 724,
      storageUsed: '8.4 GB',
      uploadedThisMonth: 146,
    },
    messages: [],
  }
}

export const getAttachments = async (
  search?: string,
  category?: string,
  employeeId?: string,
): Promise<Envelope<AttachmentItem[]>> => {
  await sleep()
  let filtered = [...mockAttachments]

  if (employeeId) {
    filtered = filtered.filter((a) => a.employeeId === employeeId)
  }

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (a) =>
        a.fullName.toLowerCase().includes(q) ||
        a.employeeCode.toLowerCase().includes(q) ||
        a.fileName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    )
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((a) => a.category.toLowerCase() === category.toLowerCase())
  }

  return { success: true, code: '200', data: filtered, messages: [] }
}

export const createAttachment = async (
  payload: CreateAttachmentPayload,
): Promise<Envelope<AttachmentItem>> => {
  await sleep()
  const emp = mockEmployeeCompleteness.find((e) => e.employeeId === payload.employeeId)

  const newAttachment: AttachmentItem = {
    id: `att-${Date.now()}`,
    employeeId: payload.employeeId,
    employeeCode: emp?.employeeCode ?? 'EMP000',
    fullName: emp?.fullName ?? 'Employee',
    photo: emp?.photo ?? null,
    department: emp?.department ?? 'General',
    fileName: payload.fileName,
    fileSize: payload.fileSize || '1.1 MB',
    category: payload.category,
    uploadedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    uploadedBy: 'HR Manager',
  }

  mockAttachments = [newAttachment, ...mockAttachments]
  return { success: true, code: '200', data: newAttachment, messages: [] }
}

export const updateAttachment = async (
  payload: UpdateAttachmentPayload,
): Promise<Envelope<AttachmentItem>> => {
  await sleep()
  const idx = mockAttachments.findIndex((a) => a.id === payload.id)
  if (idx < 0) {
    throw new Error('Attachment not found')
  }

  const existing = mockAttachments[idx]
  const updatedAttachment: AttachmentItem = {
    ...existing,
    fileName: payload.fileName || existing.fileName,
    category: payload.category || existing.category,
    fileSize: payload.fileSize || existing.fileSize,
  }

  mockAttachments[idx] = updatedAttachment
  return { success: true, code: '200', data: updatedAttachment, messages: [] }
}

export const deleteAttachments = async (
  ids: string[],
): Promise<Envelope<{ deletedIds: string[] }>> => {
  await sleep()
  mockAttachments = mockAttachments.filter((a) => !ids.includes(a.id))
  return { success: true, code: '200', data: { deletedIds: ids }, messages: [] }
}
