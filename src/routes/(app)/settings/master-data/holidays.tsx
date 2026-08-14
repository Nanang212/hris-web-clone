import { createFileRoute } from '@tanstack/react-router'
import { HolidaysPage } from '@/features/master-data/pages/holidays-page'

export const Route = createFileRoute('/(app)/settings/master-data/holidays')({
  component: RouteComponent,
})

function RouteComponent() {
  return <HolidaysPage />
}
