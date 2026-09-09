import { AppMain } from '@/shared/components/app-layout/app-main'
import { m } from '@/i18n/paraglide/messages'

export function ClientPage() {
  return (
    <AppMain
      title={m.organization_client_title()}
      subtitle={m.organization_client_subtitle()}
      className='w-full max-w-full min-w-0 gap-6'
    />
  )
}
