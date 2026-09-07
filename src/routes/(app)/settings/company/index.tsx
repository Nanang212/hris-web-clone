import { createFileRoute } from '@tanstack/react-router'
import { CompanySettingsPage } from '@/features/settings/company/company-settings-page'

export const Route = createFileRoute('/(app)/settings/company/')({
  component: CompanySettingsPage,
})
