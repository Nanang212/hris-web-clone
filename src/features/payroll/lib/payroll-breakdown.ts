import type { EmployeePayrollDetail, PayrollInputLine } from '@/features/payroll/types'
import { componentEffectAmount, resolveComponentParameters } from './payroll-component-parameters'

export interface PayrollBreakdownLine extends PayrollInputLine {
  source?: 'fixed' | 'variable' | 'attendance' | 'system'
}

/** Project both payload generations into the existing grouped payroll detail design. */
export function buildPayrollBreakdown(detail: EmployeePayrollDetail) {
  const usesSystemComponents = Boolean(detail.systemComponents?.length)
  const systemLines: PayrollBreakdownLine[] = usesSystemComponents
    ? detail.systemComponents!.map((line) => ({ ...line, source: 'system' }))
    : []
  const lines = detail.lines ?? []
  const effect = (line: PayrollInputLine) => resolveComponentParameters(line).thpEffect
  const systemLine = (code: string) => systemLines.find((line) => line.code === code)
  const systemDeduction = (code: string) => {
    const line = systemLine(code)
    return line ? -componentEffectAmount(line.amount, effect(line)) : 0
  }
  const nonCashAmount = (code: string, legacyAmount = 0) => {
    if (!usesSystemComponents) return legacyAmount
    const line = systemLine(code)
    return line && effect(line) === 'none' ? line.amount : 0
  }

  const base: PayrollBreakdownLine | undefined = usesSystemComponents
    ? systemLine('BASIC_SALARY')
    : { code: 'BASIC_SALARY', name: '', amount: detail.baseSalary, type: 'allowance', isTaxable: true, source: 'system' }
  const baseSalaryLine = base && effect(base) === 'add' ? base : undefined
  const taxCodes = ['DED_PPH21', 'THR_TAX_INSTALLMENT']
  const groupedDeductionCodes = ['DED_BPJS_KES', 'DED_BPJS_TK', ...taxCodes]
  const companyCodes = ['BPJS_KES_EMPLOYER', 'JKK_EMPLOYER', 'JKM_EMPLOYER', 'JHT_EMPLOYER', 'JP_EMPLOYER']

  const fixedLines: PayrollBreakdownLine[] = [
    ...lines.filter((line) => effect(line) === 'add' && !['variable', 'attendance'].includes(line.source ?? '') && line.componentKind !== 'overtime'),
    ...systemLines.filter((line) => effect(line) === 'add' && line.code !== 'BASIC_SALARY' && !taxCodes.includes(line.code)),
  ]
  const variableLines: PayrollBreakdownLine[] = lines.filter((line) => effect(line) === 'add' &&
    (line.source === 'variable' || line.source === 'attendance' || line.componentKind === 'overtime'))
  const employeeDeductionLines: PayrollBreakdownLine[] = [
    ...lines.filter((line) => effect(line) === 'subtract'),
    ...systemLines.filter((line) => effect(line) === 'subtract' && !groupedDeductionCodes.includes(line.code)),
  ]
  const nonCashLines: PayrollBreakdownLine[] = [
    ...lines.filter((line) => effect(line) === 'none' && (usesSystemComponents || resolveComponentParameters(line).taxGrossEffect === 'add')),
    ...systemLines.filter((line) => effect(line) === 'none' && !companyCodes.includes(line.code)),
  ].filter((line) => line.amount !== 0)

  const healthLine = systemLine('DED_BPJS_KES')
  const pensionLine = systemLine('DED_BPJS_TK')
  const employeeHealthDeduction = usesSystemComponents
    ? healthLine && effect(healthLine) === 'subtract' ? healthLine.amount : 0
    : detail.bpjsKesEmployee
  const employeePensionDeduction = usesSystemComponents
    ? pensionLine && effect(pensionLine) === 'subtract' ? pensionLine.amount : 0
    : detail.bpjsTkEmployee
  const familyDeduction = Math.min(employeeHealthDeduction, detail.bpjsKesFamilyExtra ?? 0)
  const jhtEmployeeDeduction = Math.min(employeePensionDeduction, detail.bpjsTkJhtEmployee ?? 0)
  const jpEmployeeDeduction = employeePensionDeduction - jhtEmployeeDeduction

  const companyHealthAmount = nonCashAmount('BPJS_KES_EMPLOYER', detail.bpjsKesEmployer)
  const companyJkkAmount = nonCashAmount('JKK_EMPLOYER', detail.bpjsTkJkk ?? 0)
  const companyJkmAmount = nonCashAmount('JKM_EMPLOYER', detail.bpjsTkJkm ?? 0)
  // Historical payloads and current engine results keep these employer-only pension costs separately.
  const companyJhtAmount = systemLine('JHT_EMPLOYER')
    ? nonCashAmount('JHT_EMPLOYER') : detail.bpjsTkJhtEmployer ?? 0
  const companyJpAmount = systemLine('JP_EMPLOYER')
    ? nonCashAmount('JP_EMPLOYER') : detail.bpjsTkJpEmployer ?? 0
  const companyTkTotal = companyJkkAmount + companyJkmAmount + companyJhtAmount + companyJpAmount

  return {
    usesSystemComponents, baseSalaryLine, fixedLines, variableLines, employeeDeductionLines,
    nonCashLines, employeeHealthDeduction, employeePensionDeduction,
    healthBaseDeduction: employeeHealthDeduction - familyDeduction,
    familyDeduction, jhtEmployeeDeduction, jpEmployeeDeduction,
    employeeTaxDeduction: usesSystemComponents ? systemDeduction('DED_PPH21') : detail.pph21EmployeeDeduction ?? detail.pph21Tax,
    thrDeduction: usesSystemComponents ? systemDeduction('THR_TAX_INSTALLMENT') : detail.thrTaxInstallment ?? 0,
    companyHealthAmount, companyJkkAmount, companyJkmAmount, companyJhtAmount, companyJpAmount, companyTkTotal,
    nonCashTotal: companyHealthAmount + companyTkTotal + nonCashLines.reduce((sum, line) => sum + line.amount, 0),
  }
}
