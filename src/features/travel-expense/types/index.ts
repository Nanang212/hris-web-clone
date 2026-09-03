// src/features/travel-expense/types/index.ts

export type ClaimCategory =
  | 'medical'
  | 'transport'
  | 'meal'
  | 'accommodation'
  | 'office'
  | 'training'
  | 'other'

export type ClaimStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'paid'

export interface ApprovalStep {
  role: string
  approverName: string
  approverAvatar?: string
  status: 'pending' | 'approved' | 'rejected'
  date?: string
  notes?: string
}

export interface ClaimRecord {
  id: string
  claimNumber: string
  employeeId: string
  employeeName: string
  employeeNik: string
  employeeAvatar?: string
  departmentName: string
  category: ClaimCategory
  categoryLabel: string
  claimDate: string
  amount: number
  costCenter: string
  description: string
  paymentMethod: string
  bankName: string
  bankAccount: string
  receiptUrl?: string
  receiptFilename?: string
  receiptMerchant?: string
  status: ClaimStatus
  rejectionReason?: string
  approvalFlow: ApprovalStep[]
  createdAt: string
}

export interface ClaimQuotaPolicy {
  category: ClaimCategory
  label: string
  monthlyLimit: number
  yearlyLimit: number
  spentThisMonth: number
  spentThisYear: number
  remainingMonthly: number
  icon: string
  color: string
}

export interface OCRLineItem {
  description: string
  quantity: number
  price: number
  amount: number
}

export interface OCRReceiptData {
  merchantName: string
  taxId?: string
  receiptDate: string
  invoiceNumber: string
  items: OCRLineItem[]
  subtotal: number
  taxAmount: number
  serviceCharge?: number
  totalAmount: number
  confidenceScore: number
}

// ─── Business Trip Types ─────────────────────────────────────────────────────

export type TripStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'on_trip'
  | 'completed'
  | 'rejected'
  | 'cancelled'

export type TransportationType =
  | 'flight'
  | 'train'
  | 'car_rental'
  | 'company_car'
  | 'bus'

export type AccommodationType =
  | 'hotel_4star'
  | 'hotel_3star'
  | 'guest_house'
  | 'none'

export interface TripActivity {
  id: string
  time: string
  title: string
  location: string
  contactPerson?: string
  contactPhone?: string
  notes?: string
  completed?: boolean
}

export interface TripItineraryDay {
  dayNumber: number
  date: string
  title: string
  activities: TripActivity[]
}

export interface TripExpenseItem {
  id: string
  category: 'flight' | 'hotel' | 'per_diem' | 'local_transport' | 'client_meeting' | 'other'
  categoryLabel: string
  date: string
  description: string
  estimatedAmount: number
  actualAmount: number
  receiptUrl?: string
  receiptFilename?: string
  isSettled: boolean
}

export interface BusinessTripRecord {
  id: string
  tripNumber: string
  employeeId: string
  employeeName: string
  employeeNik: string
  employeeAvatar?: string
  departmentName: string
  jobTitle: string
  title: string
  purpose: string
  originCity: string
  destinationCity: string
  destinationCountry: string
  startDate: string
  endDate: string
  totalDays: number
  transportType: TransportationType
  flightBookingCode?: string
  flightAirline?: string
  accommodationType: AccommodationType
  hotelName?: string
  hotelBookingCode?: string
  cashAdvanceRequested: boolean
  cashAdvanceAmount: number
  cashAdvanceDisbursed: boolean
  costCenter: string
  estimatedBudget: {
    transport: number
    accommodation: number
    perDiem: number
    localExpenses: number
    total: number
  }
  actualExpensesTotal?: number
  settlementBalance?: number
  settlementStatus?: 'not_submitted' | 'submitted' | 'verified' | 'paid'
  status: TripStatus
  approvalFlow: ApprovalStep[]
  itinerary: TripItineraryDay[]
  expenses: TripExpenseItem[]
  createdAt: string
}
