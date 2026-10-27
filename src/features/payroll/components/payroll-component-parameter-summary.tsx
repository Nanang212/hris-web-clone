import { Badge } from '@/shared/components/ui/badge'
import { resolveComponentParameters } from '@/features/payroll/lib/payroll-component-parameters'
import type { PayrollInputLine } from '@/features/payroll/types'
import { m } from '@/i18n/paraglide/messages'

export function PayrollComponentParameterSummary({
  line,
}: {
  line: Pick<PayrollInputLine, 'type' | 'isTaxable' | 'parameters' | 'componentKind' | 'cashImpact'>
}) {
  const parameters = resolveComponentParameters(line)
  const effects = { add: '+', subtract: '−', none: '—' }
  const treatments = {
    regular: m.payroll_revision_tax_regular(),
    final: m.payroll_revision_tax_final(),
    non_taxable: m.payroll_revision_tax_non_taxable(),
  }
  return (
    <div className='flex flex-wrap gap-1'>
      <Badge variant='outline'>
        {m.payroll_revision_cash_effect()}: {effects[parameters.thpEffect]}
      </Badge>
      <Badge variant='outline'>
        {m.payroll_revision_tax_effect()}: {effects[parameters.taxGrossEffect]}
      </Badge>
      <Badge variant={parameters.taxTreatment === 'final' ? 'amber' : 'secondary'}>
        {treatments[parameters.taxTreatment]}
      </Badge>
    </div>
  )
}
