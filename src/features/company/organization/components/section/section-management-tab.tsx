import { IconSitemap } from '@tabler/icons-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/ui/empty'
import { m } from '@/i18n/paraglide/messages'

export function SectionManagementTab() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <IconSitemap />
        </EmptyMedia>
        <EmptyTitle>{m.organization_unit_section_title()}</EmptyTitle>
        <EmptyDescription>{m.organization_unit_section_description()}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
