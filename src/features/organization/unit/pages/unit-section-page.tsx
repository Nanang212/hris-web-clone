import { IconSitemap } from '@tabler/icons-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/ui/empty'
import { m } from '@/i18n/paraglide/messages'

import { UnitPageShell } from '../components/unit-page-shell'

export function UnitSectionPage() {
  return (
    <UnitPageShell activeTab='section'>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <IconSitemap />
          </EmptyMedia>
          <EmptyTitle>{m.organization_unit_section_title()}</EmptyTitle>
          <EmptyDescription>{m.organization_unit_section_description()}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </UnitPageShell>
  )
}
