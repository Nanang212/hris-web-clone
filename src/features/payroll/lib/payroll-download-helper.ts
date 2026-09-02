// src/features/payroll/lib/payroll-download-helper.ts — Client-side Payslip PDF generator, Excel exporter & Bank Batch creator
import JSZip from 'jszip'
import * as XLSX from 'xlsx'
import { formatIDR } from '../data/mock-payroll-data'
import type { PayslipRecord, PayrollRun } from '../types'

/**
 * Escapes characters for PDF literal text strings
 */
function escapePdfText(text: string): string {
  if (!text) return ''
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

/**
 * Generates a valid standard PDF 1.4 binary blob for an official Payslip
 */
export function generatePayslipPdfBlob(payslip: PayslipRecord): Blob {
  const checksum = `AGY-HRIS-${payslip.payslipNumber.replace(/[^A-Za-z0-9]/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  // Compute positions for financial items
  const maxItems = Math.max(payslip.earnings.length, payslip.deductions.length)
  const itemStartY = 590
  const rowHeight = 18
  const earningsEndOffset = payslip.earnings.length * rowHeight
  const deductionsEndOffset = payslip.deductions.length * rowHeight
  const maxTableHeight = (maxItems + 1) * rowHeight + 15

  const yTableBottom = itemStartY - maxTableHeight
  const yNetBox = yTableBottom - 65
  const yFooter = 65

  // Generate earnings text stream lines
  let earningsStream = ''
  payslip.earnings.forEach((e, idx) => {
    const curY = itemStartY - idx * rowHeight
    earningsStream += `
BT /F2 8.5 Tf 0.2 0.25 0.3 rg 45 ${curY} Td (${escapePdfText(e.name)}) Tj ET
BT /F1 8.5 Tf 0.1 0.15 0.25 rg 210 ${curY} Td (${escapePdfText(formatIDR(e.amount))}) Tj ET
q 0.9 0.92 0.95 RG 0.5 w 45 ${curY - 4} m 285 ${curY - 4} l S Q
`
  })

  // Total earnings line
  const yEarnTotal = itemStartY - earningsEndOffset - 8
  earningsStream += `
q 0.93 0.98 0.95 rg 0.7 0.88 0.78 RG 0.75 w 35 ${yEarnTotal - 6} 255 20 re B Q
BT /F1 8 Tf 0.05 0.5 0.25 rg 43 ${yEarnTotal} Td (TOTAL PENDAPATAN KOTOR (A)) Tj ET
BT /F1 8.5 Tf 0.05 0.5 0.25 rg 205 ${yEarnTotal} Td (${escapePdfText(formatIDR(payslip.totalEarnings))}) Tj ET
`

  // Generate deductions text stream lines
  let deductionsStream = ''
  payslip.deductions.forEach((d, idx) => {
    const curY = itemStartY - idx * rowHeight
    deductionsStream += `
BT /F2 8.5 Tf 0.2 0.25 0.3 rg 315 ${curY} Td (${escapePdfText(d.name)}) Tj ET
BT /F1 8.5 Tf 0.8 0.15 0.2 rg 475 ${curY} Td (-${escapePdfText(formatIDR(d.amount))}) Tj ET
q 0.9 0.92 0.95 RG 0.5 w 315 ${curY - 4} m 555 ${curY - 4} l S Q
`
  })

  // Total deductions line
  const yDedTotal = itemStartY - deductionsEndOffset - 8
  deductionsStream += `
q 0.99 0.94 0.94 rg 0.92 0.75 0.78 RG 0.75 w 305 ${yDedTotal - 6} 255 20 re B Q
BT /F1 8 Tf 0.8 0.15 0.2 rg 313 ${yDedTotal} Td (TOTAL POTONGAN (B)) Tj ET
BT /F1 8.5 Tf 0.8 0.15 0.2 rg 470 ${yDedTotal} Td (-${escapePdfText(formatIDR(payslip.totalDeductions))}) Tj ET
`

  // Build the complete PDF graphic and text stream
  const contentStream = `
% Top Accent Strip
q 0.15 0.35 0.75 rg 35 802 525 4 re f Q

% Company Logo Box
q 0.15 0.35 0.75 rg 35 745 42 42 re f Q
BT /F1 16 Tf 1 1 1 rg 46 760 Td (AG) Tj ET

% Company Header Info
BT
/F1 14 Tf 0.12 0.15 0.22 rg 85 772 Td (PT ANTIGRAVITY NUSANTARA) Tj
0 -14 Td
/F2 8 Tf 0.4 0.45 0.5 rg (Sudirman Central Business District (SCBD), Tower 2 Lt. 18, Jakarta Selatan 12190) Tj
0 -12 Td
/F2 8 Tf 0.4 0.45 0.5 rg (NPWP: 01.829.471.2-014.000  |  Telp: (021) 5299-8800) Tj
ET

% Right Document Header
BT
/F1 12.5 Tf 0.15 0.35 0.75 rg 360 772 Td (SLIP GAJI KARYAWAN) Tj
0 -14 Td
/F1 8.5 Tf 0.15 0.18 0.25 rg (Periode: ) Tj
/F2 8.5 Tf (${escapePdfText(payslip.period)}) Tj
0 -12 Td
/F2 8 Tf 0.4 0.45 0.5 rg (No: ${escapePdfText(payslip.payslipNumber)}) Tj
ET

% Status Badge
q 0.9 0.95 0.92 rg 0.2 0.6 0.35 RG 0.5 w 505 746 55 16 re B Q
BT /F1 7.5 Tf 0.1 0.55 0.25 rg 515 751 Td (${escapePdfText(payslip.status.toUpperCase())}) Tj ET

% Header Divider
q 0.85 0.88 0.92 RG 1 w 35 733 m 560 733 l S Q

% Employee Information Card Box
q 0.96 0.97 0.99 rg 0.82 0.86 0.92 RG 0.75 w 35 645 525 76 re B Q

% Employee Info Details Row 1
BT /F2 7 Tf 0.45 0.5 0.55 rg 48 706 Td (Nama Karyawan) Tj ET
BT /F1 8.5 Tf 0.12 0.15 0.22 rg 48 694 Td (${escapePdfText(payslip.employeeName)}) Tj ET

BT /F2 7 Tf 0.45 0.5 0.55 rg 180 706 Td (NIK / Employee ID) Tj ET
BT /F3 8.5 Tf 0.12 0.15 0.22 rg 180 694 Td (${escapePdfText(payslip.employeeCode)}) Tj ET

BT /F2 7 Tf 0.45 0.5 0.55 rg 300 706 Td (Departemen) Tj ET
BT /F1 8.5 Tf 0.12 0.15 0.22 rg 300 694 Td (${escapePdfText(payslip.department)}) Tj ET

BT /F2 7 Tf 0.45 0.5 0.55 rg 425 706 Td (Jabatan / Grade) Tj ET
BT /F1 8.5 Tf 0.12 0.15 0.22 rg 425 694 Td (${escapePdfText(payslip.position)}) Tj ET

% Employee Info Details Row 2
BT /F2 7 Tf 0.45 0.5 0.55 rg 48 672 Td (Status PTKP) Tj ET
BT /F1 8.5 Tf 0.12 0.15 0.22 rg 48 660 Td (${escapePdfText(payslip.ptkpStatus)}) Tj ET

BT /F2 7 Tf 0.45 0.5 0.55 rg 180 672 Td (Nomor NPWP) Tj ET
BT /F3 8 Tf 0.12 0.15 0.22 rg 180 660 Td (${escapePdfText(payslip.npwp)}) Tj ET

BT /F2 7 Tf 0.45 0.5 0.55 rg 300 672 Td (Rekening Bank) Tj ET
BT /F1 8 Tf 0.12 0.15 0.22 rg 300 660 Td (${escapePdfText(payslip.bankName)} - ${escapePdfText(payslip.bankAccountNumber)}) Tj ET

BT /F2 7 Tf 0.45 0.5 0.55 rg 425 672 Td (Tanggal Pembayaran) Tj ET
BT /F1 8.5 Tf 0.12 0.15 0.22 rg 425 660 Td (${escapePdfText(payslip.paymentDate)}) Tj ET

% Section Table Headers
q 0.05 0.6 0.35 rg 35 615 255 18 re f Q
BT /F1 8 Tf 1 1 1 rg 45 621 Td (A. PENDAPATAN (EARNINGS)) Tj 225 621 Td (Nominal (Rp)) Tj ET

q 0.85 0.2 0.25 rg 305 615 255 18 re f Q
BT /F1 8 Tf 1 1 1 rg 315 621 Td (B. POTONGAN (DEDUCTIONS)) Tj 490 621 Td (Nominal (Rp)) Tj ET

% Financial Breakdown Items
${earningsStream}
${deductionsStream}

% Take Home Pay (Net Pay) Banner Box
q 0.93 0.96 1.0 rg 0.2 0.45 0.85 RG 1.5 w 35 ${yNetBox} 525 46 re B Q
BT
/F1 9.5 Tf 0.12 0.35 0.8 rg 50 ${yNetBox + 27} Td (GAJI BERSIH (TAKE HOME PAY)) Tj
0 -14 Td
/F2 7.5 Tf 0.4 0.45 0.55 rg (Jumlah yang ditransfer ke rekening ${escapePdfText(payslip.bankName)} ${escapePdfText(payslip.bankAccountNumber)}) Tj
ET

BT /F1 16 Tf 0.12 0.35 0.8 rg 370 ${yNetBox + 18} Td (${escapePdfText(formatIDR(payslip.netPay))}) Tj ET

% Bottom Divider
q 0.85 0.88 0.92 RG 0.75 w 35 ${yFooter + 75} m 560 ${yFooter + 75} l S Q

% Digital Verification Box
q 0.96 0.97 0.99 rg 0.85 0.88 0.92 RG 0.5 w 35 ${yFooter} 275 60 re B Q
q 0.15 0.35 0.75 rg 45 ${yFooter + 12} 36 36 re f Q
BT /F1 11 Tf 1 1 1 rg 53 ${yFooter + 25} Td (QR) Tj ET

BT
/F1 8 Tf 0.15 0.2 0.3 rg 90 ${yFooter + 44} Td (Verifikasi Digital HRIS) Tj
0 -11 Td
/F2 6.5 Tf 0.4 0.45 0.5 rg (Dokumen ini sah digenerate secara elektronik melalui) Tj
0 -9 Td
/F2 6.5 Tf 0.4 0.45 0.5 rg (Antigravity HRMS dan tidak memerlukan tanda tangan basah.) Tj
0 -10 Td
/F3 6 Tf 0.5 0.55 0.6 rg (ID: ${checksum}) Tj
ET

% Sign-off Column
BT
/F2 7.5 Tf 0.4 0.45 0.5 rg 380 ${yFooter + 48} Td (Jakarta, ${escapePdfText(payslip.paymentDate)}) Tj
0 -16 Td
/F1 8.5 Tf 0.15 0.2 0.3 rg (Finance & Payroll Division) Tj
0 -11 Td
/F2 7.5 Tf 0.4 0.45 0.5 rg (PT Antigravity Nusantara) Tj
ET
`.trim()

  const streamLength = contentStream.length

  // Build standard PDF structure with fonts (Helvetica-Bold, Helvetica, Courier-Bold)
  const obj1 = '1 0 obj\n<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>\nendobj\n'
  const obj2 = '2 0 obj\n<<\n  /Type /Pages\n  /Kids [3 0 R]\n  /Count 1\n>>\nendobj\n'
  const obj3 =
    '3 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 595 842]\n  /Resources <<\n    /Font <<\n      /F1 4 0 R\n      /F2 5 0 R\n      /F3 6 0 R\n    >>\n  >>\n  /Contents 7 0 R\n>>\nendobj\n'
  const obj4 = '4 0 obj\n<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica-Bold\n>>\nendobj\n'
  const obj5 = '5 0 obj\n<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica\n>>\nendobj\n'
  const obj6 = '6 0 obj\n<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Courier-Bold\n>>\nendobj\n'
  const obj7 = `7 0 obj\n<<\n  /Length ${streamLength}\n>>\nstream\n${contentStream}\nendstream\nendobj\n`

  const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'

  const offset1 = header.length
  const offset2 = offset1 + obj1.length
  const offset3 = offset2 + obj2.length
  const offset4 = offset3 + obj3.length
  const offset5 = offset4 + obj4.length
  const offset6 = offset5 + obj5.length
  const offset7 = offset6 + obj6.length
  const xrefOffset = offset7 + obj7.length

  const pad = (n: number) => n.toString().padStart(10, '0')

  const xref = `xref
0 8
0000000000 65535 f 
${pad(offset1)} 00000 n 
${pad(offset2)} 00000 n 
${pad(offset3)} 00000 n 
${pad(offset4)} 00000 n 
${pad(offset5)} 00000 n 
${pad(offset6)} 00000 n 
${pad(offset7)} 00000 n 
trailer
<<
  /Size 8
  /Root 1 0 R
>>
startxref
${xrefOffset}
%%EOF`

  const fullPdfString = header + obj1 + obj2 + obj3 + obj4 + obj5 + obj6 + obj7 + xref
  return new Blob([fullPdfString], { type: 'application/pdf' })
}

/**
 * Triggers a real browser file download
 */
export function triggerFileDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Downloads single Payslip PDF
 */
export function downloadPayslipPdf(payslip: PayslipRecord) {
  const fileName = `Slip_Gaji_${payslip.employeeCode}_${payslip.employeeName.replace(/\s+/g, '_')}_${payslip.period.replace(/\s+/g, '_')}.pdf`
  const blob = generatePayslipPdfBlob(payslip)
  triggerFileDownload(blob, fileName)
}

/**
 * Exports all filtered payslips into a single .ZIP package containing:
 * 1. Excel summary spreadsheet (.xlsx)
 * 2. Individual PDF payslips for each employee in a subfolder
 */
export async function exportPayslipsBulkZip(period: string, payslips: PayslipRecord[]) {
  const zip = new JSZip()

  // 1. Generate Excel Summary
  const headers = [
    'No. Slip Gaji',
    'NIK',
    'Nama Karyawan',
    'Departemen',
    'Jabatan',
    'Status PTKP',
    'NPWP',
    'Bank',
    'No. Rekening',
    'Total Pendapatan (Rp)',
    'Total Potongan (Rp)',
    'Gaji Bersih / Take Home Pay (Rp)',
    'Tanggal Bayar',
    'Status',
  ]

  const rows = payslips.map((p) => [
    p.payslipNumber,
    p.employeeCode,
    p.employeeName,
    p.department,
    p.position,
    p.ptkpStatus,
    p.npwp,
    p.bankName,
    p.bankAccountNumber,
    p.totalEarnings,
    p.totalDeductions,
    p.netPay,
    p.paymentDate,
    p.status,
  ])

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  ws['!cols'] = [
    { wch: 18 },
    { wch: 12 },
    { wch: 24 },
    { wch: 20 },
    { wch: 24 },
    { wch: 12 },
    { wch: 22 },
    { wch: 10 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 24 },
    { wch: 16 },
    { wch: 14 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Gaji')
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  zip.file(`Rekap_Payroll_${period.replace(/\s+/g, '_')}.xlsx`, new Blob([excelBuffer]))

  // 2. Add individual PDF files in a folder
  const pdfFolder = zip.folder('Slip_Gaji_PDF')
  payslips.forEach((p) => {
    const pdfBlob = generatePayslipPdfBlob(p)
    const fileName = `Slip_Gaji_${p.employeeCode}_${p.employeeName.replace(/\s+/g, '_')}.pdf`
    pdfFolder?.file(fileName, pdfBlob)
  })

  // 3. Generate and trigger download
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const zipFileName = `Payroll_Payslips_Batch_${period.replace(/\s+/g, '_')}.zip`
  triggerFileDownload(zipBlob, zipFileName)
}

/**
 * Downloads Bank Transfer Batch File (BCA / Mandiri / Generic)
 */
export function downloadBankBatchTransferFile(
  run: PayrollRun,
  payslips: PayslipRecord[],
  bankFormat: 'bca' | 'mandiri' | 'generic',
) {
  const periodSafe = run.period.replace(/\s+/g, '_')

  if (bankFormat === 'bca') {
    // BCA Corporate KlikBCA Payroll CSV format
    const headers = ['Account Number', 'Beneficiary Name', 'Amount', 'Remark 1', 'Remark 2', 'Email']
    const rows = payslips.map((p) => [
      p.bankAccountNumber,
      p.employeeName.toUpperCase(),
      p.netPay,
      `GAJI ${run.period.toUpperCase()}`,
      p.employeeCode,
      `${p.employeeCode.toLowerCase()}@antigravity.co.id`,
    ])
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    triggerFileDownload(blob, `BCA_Batch_Payroll_${periodSafe}.csv`)
  } else if (bankFormat === 'mandiri') {
    // Mandiri MCM 2.0 format
    const headers = ['Debit Account', 'Beneficiary Account', 'Beneficiary Name', 'Currency', 'Amount', 'Description']
    const rows = payslips.map((p) => [
      '1230009988771', // Company main payroll account
      p.bankAccountNumber,
      p.employeeName.toUpperCase(),
      'IDR',
      p.netPay,
      `PAYROLL ${run.period.toUpperCase()} ${p.employeeCode}`,
    ])
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    triggerFileDownload(blob, `Mandiri_MCM_Payroll_${periodSafe}.csv`)
  } else {
    // Universal Excel Spreadsheet format
    const headers = [
      'No',
      'Employee Code',
      'Employee Name',
      'Bank Name',
      'Account Number',
      'Transfer Amount (IDR)',
      'Reference / Notes',
    ]
    const rows = payslips.map((p, idx) => [
      idx + 1,
      p.employeeCode,
      p.employeeName,
      p.bankName,
      p.bankAccountNumber,
      p.netPay,
      `Salary ${run.period} - ${p.payslipNumber}`,
    ])

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 26 },
      { wch: 12 },
      { wch: 20 },
      { wch: 22 },
      { wch: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Bank Transfer Batch')
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    triggerFileDownload(blob, `Universal_Payroll_Transfer_${periodSafe}.xlsx`)
  }
}
