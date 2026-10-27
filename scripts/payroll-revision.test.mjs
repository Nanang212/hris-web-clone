import ts from 'typescript'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)

if (process.argv.includes('--check-types')) {
  const config = ts.readConfigFile(path.join(root, 'tsconfig.app.json'), ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  const program = ts.createProgram(parsed.fileNames, parsed.options)
  const files = program.getSourceFiles().filter((file) => {
    const name = file.fileName.replaceAll('\\', '/')
    return (
      name.includes('/src/features/payroll/') ||
      /employee-(rejoin-dialog|employment-history|employment-document-dialog|employment-screening-dialog)\.tsx$/.test(name)
    )
  })
  const diagnostics = files.flatMap((file) => [
    ...program.getSyntacticDiagnostics(file),
    ...program.getSemanticDiagnostics(file),
  ])
  if (diagnostics.length) {
    console.error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (name) => name,
        getCurrentDirectory: () => root,
        getNewLine: () => '\n',
      }),
    )
    process.exit(1)
  }
  console.log(`Payroll revision: ${files.length} source files passed scoped TypeScript validation.`)
  process.exit(0)
}

// Compile domain TS in memory: these tests require no browser or generated locale files.
const modules = new Map()
function load(relative) {
  const filename = path.resolve(root, relative)
  if (modules.has(filename)) return modules.get(filename).exports
  const module = { exports: {} }
  modules.set(filename, module)
  const output = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText
  const localRequire = (specifier) => {
    if (specifier === '@/i18n/paraglide/messages')
      return { m: new Proxy({}, { get: (_, key) => () => String(key) }) }
    if (specifier.startsWith('.') || specifier.startsWith('@/')) {
      const base = specifier.startsWith('@/')
        ? path.join(root, 'src', specifier.slice(2))
        : path.resolve(path.dirname(filename), specifier)
      const dependency = [base, `${base}.ts`, path.join(base, 'index.ts')].find(
        (candidate) => existsSync(candidate) && candidate.endsWith('.ts'),
      )
      assert.ok(dependency, `Cannot resolve ${specifier}`)
      return load(dependency)
    }
    return require(specifier)
  }
  new Function('require', 'module', 'exports', output)(localRequire, module, module.exports)
  return module.exports
}

const { calculatePayroll } = load('src/features/payroll/lib/calculate-payroll.ts')
const { usePayrollRunStore } = load('src/features/payroll/store/payroll-run-store.ts')
const { payrollTaxIdentityKey } = load('src/features/payroll/store/payroll-tax-input-store.ts')
const { detailToPayslip } = load('src/features/payroll/lib/payroll-payslip-helper.ts')
const { buildPayrollBreakdown } = load('src/features/payroll/lib/payroll-breakdown.ts')

function fixture(lines = []) {
  return {
    periodKey: '2026-07',
    billing: [],
    wageCapRules: [],
    bpjsKesConfig: {
      companyRatePercent: 4,
      employeeRatePercent: 1,
      maxWageCap: 12000000,
      includeFamilyMembers: false,
    },
    bpjsTkConfig: {
      jkkRatePercent: 0,
      jkmRatePercent: 0,
      jhtCompanyPercent: 0,
      jhtEmployeePercent: 0,
      jpCompanyPercent: 0,
      jpEmployeePercent: 0,
      jpMaxWageCap: 12000000,
    },
    tkProjectSettings: [
      {
        id: 'p',
        projectId: 'p',
        effectiveFrom: '2026-01',
        jkkRatePercent: 0,
        jhtActive: false,
        jpActive: false,
      },
    ],
    pph21Config: {
      taxMethod: 'gross',
      useTERScheme: true,
      ptkpTK0: 54000000,
      ptkpK0: 58500000,
      ptkpK1: 63000000,
      ptkpK2: 67500000,
      ptkpK3: 72000000,
    },
    generalConfig: {
      cutoffStartDay: 21,
      cutoffEndDay: 20,
      payDay: 25,
      prorateMethod: 'working_days',
      standardWorkDaysPerMonth: 22,
      overtimeHourlyRateDivider: 173,
      taxBorneByCompany: false,
    },
    employees: [
      {
        employeeId: 'e1',
        nopeg: 'E1',
        nik: '3171000000000001',
        name: 'Employee',
        department: 'HR',
        position: 'HR',
        projectId: 'p',
        project: 'Project',
        workLocation: 'HQ',
        employmentType: 'Permanent',
        ptkpStatus: 'TK/0',
        bankName: 'Bank',
        bankAccountNumber: '123',
        bankAccountHolder: 'Employee',
        baseSalary: 10000000,
        fixedComponents: [],
        variableComponents: lines,
        bpjs: { kesActive: false, kesParticipantNumber: '' },
        attendance: {
          workingDays: 22,
          actualPresent: 22,
          absentCount: 0,
          lateCount: 0,
          overtimeHours: 0,
        },
      },
    ],
  }
}
const line = (thpEffect, taxGrossEffect, taxTreatment = 'regular') => ({
  code: 'TEST',
  name: 'Test',
  amount: 100000,
  type: 'allowance',
  isTaxable: true,
  parameters: { thpEffect, taxGrossEffect, taxTreatment },
})
const result = (params) => calculatePayroll(params).details[0]

test('cash and tax gross contributions are independent', () => {
  const baseline = result(fixture())
  const payment = result(fixture([line('add', 'none', 'non_taxable')]))
  assert.equal(payment.totalGross, baseline.totalGross + 100000)
  assert.equal(payment.taxableIncome, baseline.taxableIncome)
  assert.equal(payment.netTakeHomePay, baseline.netTakeHomePay + 100000)
  const benefit = result(fixture([line('none', 'add')]))
  assert.equal(benefit.totalGross, baseline.totalGross)
  assert.equal(benefit.taxableIncome, baseline.taxableIncome + 100000)
  const loan = result(fixture([line('subtract', 'none')]))
  assert.equal(loan.taxableIncome, baseline.taxableIncome)
  assert.equal(loan.netTakeHomePay, baseline.netTakeHomePay - 100000)
  const absence = result(fixture([line('subtract', 'subtract')]))
  assert.equal(absence.totalDeductions, absence.pph21Tax + 100000)
  assert.equal(absence.taxableIncome, baseline.taxableIncome - 100000)
})

test('zero overrides replace automatic overtime and absence values', () => {
  const params = fixture([
    { ...line('add', 'add'), componentKind: 'overtime', amount: 0 },
    {
      ...line('subtract', 'subtract'),
      code: 'ABSENCE',
      componentKind: 'attendance_reduction',
      amount: 0,
    },
  ])
  params.employees[0].attendance.overtimeHours = 10
  params.employees[0].attendance.absentCount = 2
  const detail = result(params)
  assert.equal(detail.overtimePay, 0)
  assert.equal(detail.unpaidLeaveDeduction, 0)
  assert.equal(detail.lines.length, 2)
})

test('unsupported Final rules and inconsistent non-taxable parameters cannot silently calculate', () => {
  assert.throws(() => result(fixture([line('add', 'add', 'final')])), /final_pending/)
  assert.throws(() => result(fixture([line('add', 'add', 'non_taxable')])), /invalid_parameters/)
  assert.throws(() => result(fixture([{ ...line('add', 'add'), amount: -1 }])), /numeric_invalid/)
})

test('final-period tax refunds remain negative and increase take-home pay', () => {
  const params = fixture()
  params.employees[0].baseSalary = 1000000
  params.employees[0].taxYearToDate = {
    isFinalTaxPeriod: true,
    verified: true,
    priorTaxableGross: 0,
    priorEmployeePensionContributions: 0,
    priorQualifiedZakat: 0,
    priorPph21Paid: 100000,
    monthsWorked: 1,
  }
  const detail = result(params)
  assert.equal(detail.pph21Tax, -100000)
  assert.equal(detail.netTakeHomePay, 1100000)
})

test('recalculation is repeatable, updates summaries, and preserves edits after failure', () => {
  const calculation = fixture()
  const original = calculatePayroll(calculation)
  const run = { id: 'run-test', status: 'draft', totalGrossPay: original.summary.totalGross }
  const store = usePayrollRunStore
  store.setState({ runs: [run], resultsByRunId: { 'run-test': { ...original, calculation } } })
  const override = {
    baseSalary: 12000000,
    ptkpStatus: 'TK/0',
    fixedComponents: [],
    variableComponents: [line('add', 'none', 'non_taxable')],
    statutoryAmounts: {},
    thrTaxInstallmentAmount: 0,
    note: 'Correction',
    updatedAt: '2026-10-27',
  }
  store.getState().saveOverride(run.id, 'e1', override)
  assert.deepEqual(store.getState().resultsByRunId[run.id].dirtyEmployeeIds, ['e1'])
  assert.equal(store.getState().resultsByRunId[run.id].details[0].baseSalary, 10000000)
  const firstRun = store.getState().recalculate(run)
  const firstDetails = structuredClone(store.getState().resultsByRunId[run.id].details)
  const secondRun = store.getState().recalculate(firstRun)
  assert.deepEqual(store.getState().resultsByRunId[run.id].details, firstDetails)
  assert.equal(firstRun.totalGrossPay, secondRun.totalGrossPay)
  assert.equal(firstRun.totalGrossPay, 12100000)
  assert.equal(store.getState().resultsByRunId[run.id].dirtyEmployeeIds.length, 0)
  store
    .getState()
    .saveOverride(run.id, 'e1', { ...override, variableComponents: [line('add', 'add', 'final')] })
  assert.throws(() => store.getState().recalculate(secondRun))
  assert.deepEqual(store.getState().resultsByRunId[run.id].details, firstDetails)
  assert.deepEqual(store.getState().resultsByRunId[run.id].dirtyEmployeeIds, ['e1'])
  store.getState().saveOverride(run.id, 'e1', null)
  store.getState().recalculate(secondRun)
  assert.deepEqual(store.getState().resultsByRunId[run.id].details, original.details)
})

test('tax identity survives same-year re-join and separates different tax years', () => {
  assert.equal(
    payrollTaxIdentityKey(2026, 'first-employment', '3171000000000001'),
    payrollTaxIdentityKey(2026, 'second-employment', '3171000000000001'),
  )
  assert.notEqual(
    payrollTaxIdentityKey(2026, 'same-account', '3171000000000001'),
    payrollTaxIdentityKey(2027, 'same-account', '3171000000000001'),
  )
})

test('master parameters affect base salary, statutory deductions, and generated tax cash impact', () => {
  const params = fixture()
  params.employees[0].bpjs.kesActive = true
  const baseline = result(params)
  params.componentParameters = {
    DED_BPJS_KES: { thpEffect: 'none', taxGrossEffect: 'none', taxTreatment: 'non_taxable' },
  }
  const employerPays = result(params)
  assert.equal(employerPays.taxableIncome, baseline.taxableIncome)
  assert.equal(employerPays.netTakeHomePay, baseline.netTakeHomePay + baseline.bpjsKesEmployee)
  params.componentParameters.DED_PPH21 = {
    thpEffect: 'none',
    taxGrossEffect: 'none',
    taxTreatment: 'non_taxable',
  }
  const noTaxWithholding = result(params)
  assert.equal(noTaxWithholding.pph21Tax, employerPays.pph21Tax)
  assert.equal(noTaxWithholding.netTakeHomePay, employerPays.netTakeHomePay + employerPays.pph21Tax)
  const withoutBase = fixture()
  withoutBase.componentParameters = {
    BASIC_SALARY: { thpEffect: 'none', taxGrossEffect: 'none', taxTreatment: 'non_taxable' },
  }
  assert.equal(result(withoutBase).totalGross, 0)
  assert.equal(result(withoutBase).taxableIncome, 0)
})

test('payslip lines reconcile to take-home pay for gross, nett, non-cash benefits, and tax refunds', () => {
  const gross = fixture([line('none', 'add'), line('subtract', 'none')])
  const nett = fixture([line('add', 'none', 'non_taxable')])
  nett.pph21Config.taxMethod = 'nett'
  const refund = fixture()
  refund.employees[0].baseSalary = 1000000
  refund.employees[0].taxYearToDate = {
    isFinalTaxPeriod: true,
    verified: true,
    priorTaxableGross: 0,
    priorEmployeePensionContributions: 0,
    priorQualifiedZakat: 0,
    priorPph21Paid: 100000,
    monthsWorked: 1,
  }
  for (const params of [gross, nett, refund]) {
    const detail = result(params)
    const slip = detailToPayslip(detail, 'run', 'July 2026', '2026-07-25')
    assert.equal(slip.totalEarnings - slip.totalDeductions, detail.netTakeHomePay)
    assert.equal(slip.netPay, detail.netTakeHomePay)
  }
})

test('existing breakdown groups reconcile for configurable cash and non-cash components', () => {
  for (const thpEffect of ['add', 'subtract', 'none']) {
    const params = fixture([line('add', 'add'), { ...line('none', 'add'), code: 'BENEFIT' }])
    params.employees[0].bpjs.kesActive = true
    params.componentParameters = {
      BPJS_KES_EMPLOYER: { thpEffect, taxGrossEffect: 'add', taxTreatment: 'regular' },
      DED_BPJS_KES: { thpEffect, taxGrossEffect: 'none', taxTreatment: 'non_taxable' },
      BASIC_SALARY: { thpEffect, taxGrossEffect: 'add', taxTreatment: 'regular' },
    }
    const detail = result(params)
    const grouped = buildPayrollBreakdown(detail)
    const earnings = [grouped.baseSalaryLine, ...grouped.fixedLines, ...grouped.variableLines]
      .reduce((sum, entry) => sum + (entry?.amount ?? 0), 0)
    const deductions = grouped.employeeDeductionLines.reduce((sum, entry) => sum + entry.amount, 0)
      + grouped.employeeHealthDeduction + grouped.employeePensionDeduction
      + grouped.employeeTaxDeduction + grouped.thrDeduction
    assert.equal(earnings, detail.totalGross)
    assert.equal(deductions, detail.totalDeductions)
    assert.equal(earnings - deductions, detail.netTakeHomePay)
    assert.equal(grouped.companyHealthAmount, thpEffect === 'none' ? detail.bpjsKesEmployer : 0)
    assert.equal(grouped.nonCashLines.filter((entry) => entry.code === 'BENEFIT').length, 1)
  }
})

test('existing breakdown keeps refunds signed and supports historical payloads', () => {
  const detail = result(fixture())
  const refund = {
    ...detail,
    systemComponents: detail.systemComponents.map((entry) => entry.code === 'DED_PPH21'
      ? { ...entry, amount: 100000, parameters: { thpEffect: 'add', taxGrossEffect: 'none', taxTreatment: 'regular' } }
      : entry),
  }
  const grouped = buildPayrollBreakdown(refund)
  assert.equal(grouped.employeeTaxDeduction, -100000)
  assert.equal(grouped.fixedLines.some((entry) => entry.code === 'DED_PPH21'), false)
  for (const systemComponents of [undefined, []]) {
    const legacy = buildPayrollBreakdown({ ...detail, systemComponents })
    assert.equal(legacy.usesSystemComponents, false)
    assert.equal(legacy.baseSalaryLine.amount, detail.baseSalary)
    assert.equal(legacy.employeeTaxDeduction, detail.pph21EmployeeDeduction)
  }
})
