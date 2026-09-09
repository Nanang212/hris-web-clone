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

interface UnitSectionPageProps {
  standalone?: boolean
}

export function UnitSectionPage({ standalone = false }: UnitSectionPageProps) {
  const content = (
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

  if (standalone) {
    return content
  }

  return <UnitPageShell activeTab='section'>{content}</UnitPageShell>
}
