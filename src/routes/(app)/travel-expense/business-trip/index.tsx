import { createFileRoute } from '@tanstack/react-router'
import { BusinessTripPage } from '@/features/travel-expense/business-trip/pages/business-trip-page'

export const Route = createFileRoute('/(app)/travel-expense/business-trip/')({
  component: BusinessTripPage,
})
