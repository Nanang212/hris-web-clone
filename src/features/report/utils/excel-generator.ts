import * as XLSX from 'xlsx'

interface ExcelTableOptions {
  sheetName?: string
  title: string
  dateRange?: string
  department?: string
  headers: string[]
  rows: (string | number)[][]
}

export function generateReportExcel(options: ExcelTableOptions): Blob {
  const { sheetName = 'Laporan HRIS', title, dateRange, department, headers, rows } = options

  // Build sheet data with header metadata and main table
  const sheetData: (string | number)[][] = [
    [`LAPORAN HRIS - ${title.toUpperCase()}`],
    [`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`],
    [`Periode: ${dateRange || 'Semua'} | Departemen: ${department || 'Semua Departemen'}`],
    [], // Blank row
    headers, // Table Headers
    ...rows, // Table Data Rows
  ]

  // Create workbook & worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31))

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
