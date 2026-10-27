import type {
  PayrollComponentEffect,
  PayrollComponentParameters,
  PayrollInputLine,
} from '@/features/payroll/types'

/** Compatibility defaults apply only to legacy records without explicit parameters. */
export function resolveComponentParameters(
  line: Pick<
    PayrollInputLine,
    'type' | 'isTaxable' | 'cashImpact' | 'componentKind' | 'parameters'
  >,
): PayrollComponentParameters {
  if (line.parameters) return line.parameters
  const attendanceReduction = line.componentKind === 'attendance_reduction'
  return {
    thpEffect: line.cashImpact === false ? 'none' : line.type === 'allowance' ? 'add' : 'subtract',
    taxGrossEffect: attendanceReduction ? 'subtract' : line.isTaxable ? 'add' : 'none',
    taxTreatment: attendanceReduction || line.isTaxable ? 'regular' : 'non_taxable',
  }
}

export function componentEffectAmount(amount: number, effect: PayrollComponentEffect): number {
  if (effect === 'none') return 0
  return effect === 'add' ? amount : -amount
}

export function validateComponentParameters(parameters: PayrollComponentParameters): boolean {
  return parameters.taxTreatment !== 'non_taxable' || parameters.taxGrossEffect === 'none'
}
