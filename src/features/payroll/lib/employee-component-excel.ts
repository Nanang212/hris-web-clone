import ExcelJS from 'exceljs'
import * as XLSX from 'xlsx'

import { m } from '@/i18n/paraglide/messages'

import { initialPayrollEmployeeInputs } from '../data/mock-payroll-inputs'
import { employeeComponentKinds } from '../store/payroll-component-store'

export const employeeComponentExcelColumns = [
  'employeeCode',
  'name',
  'code',
  'type',
  'componentKind',
  'amount',
  'frequency',
  'startPeriod',
  'endPeriod',
  'originalAmount',
  'remainingBalance',
  'notes',
  'thpEffect',
  'taxGrossEffect',
  'taxTreatment',
] as const

export async function readEmployeeComponentWorkbook(
  file: File,
): Promise<Record<string, unknown>[]> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []
  const preview = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  })
  const headerIndex = preview.findIndex((row) => row.includes('employeeCode'))
  if (headerIndex < 0) return []
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    range: headerIndex,
    defval: '',
    raw: true,
  })
    .map((row, index): Record<string, unknown> => ({
      ...row,
      __rowNumber: Number(row.__rowNum__ ?? headerIndex + index + 1) + 1,
    }))
    .filter((row) => String(row.note ?? '').trim().toUpperCase() !== 'CONTOH')
}

export async function downloadEmployeeComponentTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'HRIS Payroll'
  const sheet = workbook.addWorksheet('Employee Components', {
    views: [{ state: 'frozen', ySplit: 4, showGridLines: false }],
  })
  const columns = ['note', ...employeeComponentExcelColumns]
  sheet.columns = columns.map((key) => ({
    key,
    width: key === 'name' || key === 'notes' ? 28 : Math.max(17, key.length + 5),
  }))
  sheet.mergeCells(1, 1, 1, columns.length)
  const title = sheet.getCell('A1')
  title.value = m.payroll_employee_components_import_template_title()
  title.font = { name: 'Segoe UI', bold: true, size: 15, color: { argb: 'FFFFFFFF' } }
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } }
  title.alignment = { vertical: 'middle', indent: 1 }
  sheet.getRow(1).height = 36

  sheet.mergeCells(2, 1, 2, columns.length)
  const instruction = sheet.getCell('A2')
  instruction.value = m.payroll_employee_components_import_template_instruction()
  instruction.font = { name: 'Segoe UI', italic: true, size: 10, color: { argb: 'FF1E3A8A' } }
  instruction.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } }
  instruction.alignment = { vertical: 'middle', indent: 1 }
  sheet.getRow(2).height = 27
  sheet.getRow(3).height = 10

  const header = sheet.getRow(4)
  header.values = columns
  header.height = 30
  header.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
    cell.alignment = { vertical: 'middle', wrapText: true, indent: 1 }
    cell.border = { bottom: { style: 'thin', color: { argb: 'FF93C5FD' } } }
  })

  const example = sheet.getRow(5)
  example.values = [
    'CONTOH',
    initialPayrollEmployeeInputs[0]?.nopeg ?? 'EMP001',
    m.payroll_employee_components_import_example_name(),
    'BONUS_EXAMPLE',
    'allowance',
    'variable_allowance',
    500000,
    'one_time',
    '2026-10',
    '',
    0,
    0,
    '',
    'add',
    'add',
    'regular',
  ]
  example.height = 26
  example.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', italic: true, size: 10, color: { argb: 'FF92400E' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }
  })
  for (let row = 6; row <= 55; row++) {
    const line = sheet.getRow(row)
    line.height = 23
    for (let column = 1; column <= columns.length; column++) {
      const cell = line.getCell(column)
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row % 2 ? 'FFFFFFFF' : 'FFF8FAFC' } }
      cell.border = { bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } } }
    }
    line.getCell(5).dataValidation = { type: 'list', allowBlank: true, formulae: ['"allowance,deduction"'] }
    line.getCell(8).dataValidation = { type: 'list', allowBlank: true, formulae: ['"one_time,recurring,installment"'] }
    for (const column of [14, 15]) line.getCell(column).dataValidation = { type: 'list', allowBlank: true, formulae: ['"add,subtract,none"'] }
    line.getCell(16).dataValidation = { type: 'list', allowBlank: true, formulae: ['"regular,final,non_taxable"'] }
  }
  for (const column of [7, 11, 12]) {
    sheet.getColumn(column).numFmt = '#,##0'
  }

  const guide = workbook.addWorksheet(m.payroll_employee_components_import_guide_sheet(), {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: false }],
  })
  guide.columns = [{ width: 34 }, { width: 85 }]
  guide.addRow([
    m.payroll_employee_components_import_guide_field(),
    m.payroll_employee_components_import_guide_allowed(),
  ])
  const guideRows = [
    ['employeeCode', initialPayrollEmployeeInputs.map((employee) => employee.nopeg).join(', ')],
    ['type', 'allowance | deduction'],
    ['componentKind (allowance)', employeeComponentKinds.allowance.join(' | ')],
    ['componentKind (deduction)', employeeComponentKinds.deduction.join(' | ')],
    ['frequency', 'one_time | recurring | installment'],
    ['thpEffect, taxGrossEffect', 'add | subtract | none'],
    ['taxTreatment', 'regular | final | non_taxable'],
    ['startPeriod, endPeriod', 'YYYY-MM'],
    ['amount, originalAmount, remainingBalance', '> 0'],
  ]
  guideRows.forEach((row) => guide.addRow(row))
  guide.getRow(1).eachCell((cell) => {
    cell.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
  })
  guide.eachRow((row, index) => {
    if (index === 1) return
    row.height = 26
    row.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10 }
      cell.alignment = { vertical: 'middle', wrapText: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 ? 'FFFFFFFF' : 'FFEFF6FF' } }
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'employee-components-template.xlsx'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
