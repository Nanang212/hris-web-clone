export interface Client {
  id: string
  code: string
  name: string
  address?: string | null
  contactPersonName?: string | null
  contactPersonEmail?: string | null
  contactPersonPhone?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  updatedBy?: string | null
}
