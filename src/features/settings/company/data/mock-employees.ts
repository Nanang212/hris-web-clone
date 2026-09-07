import type { LocationEmployee } from '../types'

const firstNames = [
  'Ahmad', 'Budi', 'Siti', 'Dewi', 'Rian', 'Maya', 'Fajar', 'Nadia',
  'Hendra', 'Andi', 'Dian', 'Dimas', 'Rina', 'Bambang', 'Eko', 'Yogi',
  'Wayan', 'Made', 'Anisa', 'Guntur', 'Vania', 'Dinta', 'Kevin', 'Reza',
  'Putri', 'Rizky', 'Sarah', 'Wahyu', 'Denny', 'Citra', 'Arif', 'Tri',
  'Agung', 'Bayu', 'Indah', 'Nur', 'Bagus', 'Ratna', 'Yoga', 'Tari',
  'Farhan', 'Laras', 'Doni', 'Mega', 'Ilham', 'Tiara', 'Aris', 'Gita',
  'Taufik', 'Annisa', 'Rico', 'Sinta', 'Ade', 'Fikri', 'Wulan', 'Gilang'
]

const lastNames = [
  'Fauzi', 'Santoso', 'Rahmawati', 'Lestari', 'Pratama', 'Putri', 'Nugraha',
  'Savitri', 'Gunawan', 'Kusuma', 'Wicaksono', 'Pamungkas', 'Prasetyo', 'Saputra',
  'Suardana', 'Ayu', 'Rahma', 'Yulius', 'Maharani', 'Hidayat', 'Permana',
  'Wijaya', 'Siregar', 'Nasution', 'Setiawan', 'Kurniawan', 'Wibowo', 'Utomo',
  'Wardhana', 'Hartanto', 'Saputro', 'Ramadhan', 'Firmansyah', 'Salsabila', 'Puspitasari'
]

const deptPositions: { dept: string; positions: string[] }[] = [
  {
    dept: 'Engineering & Technology',
    positions: [
      'Senior Software Engineer',
      'Frontend Developer',
      'Backend Engineer',
      'Mobile App Developer',
      'QA & Automation Engineer',
      'DevOps Specialist',
      'Cloud Solution Architect',
      'UI/UX Product Designer',
    ],
  },
  {
    dept: 'Human Resources',
    positions: [
      'HR Specialist',
      'Talent Acquisition Lead',
      'People Operations Officer',
      'Learning & Dev Specialist',
      'Compensation & Benefit Staff',
    ],
  },
  {
    dept: 'Finance & Accounting',
    positions: [
      'Senior Accountant',
      'Tax & Compliance Officer',
      'Financial Analyst',
      'Accounts Payable Staff',
      'Payroll Specialist',
    ],
  },
  {
    dept: 'Sales & Business Dev',
    positions: [
      'Account Executive Lead',
      'Enterprise Sales Manager',
      'Business Development Officer',
      'Partnership Specialist',
      'Key Account Executive',
    ],
  },
  {
    dept: 'Operations & Supply',
    positions: [
      'Operations Supervisor',
      'Logistics Coordinator',
      'Inventory Control Lead',
      'Fleet & Dispatch Officer',
      'Supply Chain Specialist',
    ],
  },
  {
    dept: 'Customer Experience',
    positions: [
      'Customer Support Lead',
      'Technical Support Specialist',
      'Customer Success Specialist',
      'Quality Assurance CX',
    ],
  },
  {
    dept: 'Marketing & Comms',
    positions: [
      'Digital Marketing Lead',
      'SEO & Performance Specialist',
      'Brand Communications Officer',
      'Creative Content Specialist',
    ],
  },
]

const contractTypes: ('PKWTT' | 'PKWT' | 'Probation')[] = [
  'PKWTT',
  'PKWTT',
  'PKWTT',
  'PKWT',
  'PKWT',
  'Probation',
]

/**
 * Generate exact employee list based on location parameters
 */
export function getEmployeesForLocation(
  locationId: string,
  locationName: string,
  totalCount?: number,
): LocationEmployee[] {
  // Determine count
  const count = totalCount && totalCount > 0 ? totalCount : 245

  const list: LocationEmployee[] = []
  const seedPrefix = locationName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'EMP'

  for (let i = 1; i <= count; i++) {
    const fIdx = (i * 7 + 13) % firstNames.length
    const lIdx = (i * 11 + 23) % lastNames.length
    const deptIdx = (i * 3 + 5) % deptPositions.length
    const deptObj = deptPositions[deptIdx]
    const posIdx = (i * 2 + 7) % deptObj.positions.length
    const contractIdx = (i * 5) % contractTypes.length

    const firstName = firstNames[fIdx]
    const lastName = lastNames[lIdx]
    const fullName = `${firstName} ${lastName}`
    const empCode = `${seedPrefix}-${String(i).padStart(3, '0')}`

    const year = 2020 + (i % 5)
    const month = String((i % 12) + 1).padStart(2, '0')
    const day = String((i % 28) + 1).padStart(2, '0')

    list.push({
      id: `${locationId}-EMP-${i}`,
      name: fullName,
      empCode,
      position: deptObj.positions[posIdx],
      department: deptObj.dept,
      contractType: contractTypes[contractIdx],
      joinDate: `${day}/${month}/${year}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@bintangfajar.co.id`,
    })
  }

  return list
}

/**
 * Generate employee list for branches
 */
export function getEmployeesForBranch(
  branchCode: string,
  totalCount?: number,
): LocationEmployee[] {
  const count = totalCount && totalCount > 0 ? totalCount : 245
  const list: LocationEmployee[] = []
  const prefix = branchCode.toUpperCase().trim() || 'BRN'

  for (let i = 1; i <= count; i++) {
    const fIdx = (i * 13 + 7) % firstNames.length
    const lIdx = (i * 17 + 11) % lastNames.length
    const deptIdx = (i * 5 + 3) % deptPositions.length
    const deptObj = deptPositions[deptIdx]
    const posIdx = (i * 3 + 1) % deptObj.positions.length
    const contractIdx = (i * 4) % contractTypes.length

    const firstName = firstNames[fIdx]
    const lastName = lastNames[lIdx]
    const fullName = `${firstName} ${lastName}`
    const empCode = `${prefix}-${String(i).padStart(3, '0')}`

    const year = 2020 + (i % 5)
    const month = String((i % 12) + 1).padStart(2, '0')
    const day = String((i % 28) + 1).padStart(2, '0')

    list.push({
      id: `BRN-${prefix}-EMP-${i}`,
      name: fullName,
      empCode,
      position: deptObj.positions[posIdx],
      department: deptObj.dept,
      contractType: contractTypes[contractIdx],
      joinDate: `${day}/${month}/${year}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@bintangfajar.co.id`,
    })
  }

  return list
}
