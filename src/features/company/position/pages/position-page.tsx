import { AppMain } from '@/shared/components/app-layout/app-main'
import { m } from '@/i18n/paraglide/messages'

import { PositionManagementTab } from '../../organization/pages/position/position-management-tab'

export function PositionPage() {
  return (
    <AppMain
      title={m.organization_position_title()}
      subtitle={m.organization_position_subtitle()}
      className='w-full max-w-full min-w-0 gap-6'
    >
      <PositionManagementTab />
    </AppMain>
  )
}
