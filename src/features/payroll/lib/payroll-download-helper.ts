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
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

/**
 * Generates a valid standard PDF 1.4 binary blob for an official Payslip
 * Matches the visual design of the on-screen preview (payslip-detail-view.tsx)
 */
export function generatePayslipPdfBlob(payslip: PayslipRecord): Blob {
  const checksum = `AGY-HRIS-${payslip.payslipNumber.replace(/[^A-Za-z0-9]/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  // Status Badge styling mapping
  const badgeMap: Record<string, { bg: string; border: string; text: string; label: string }> = {
    sent: {
      bg: '0.86 0.99 0.90',
      border: '0.52 0.94 0.67',
      text: '0.08 0.50 0.24',
      label: 'SENT',
    },
    downloaded: {
      bg: '0.86 0.92 1.0',
      border: '0.58 0.77 0.99',
      text: '0.11 0.31 0.85',
      label: 'DOWNLOADED',
    },
    published: {
      bg: '1.0 0.95 0.78',
      border: '0.99 0.90 0.54',
      text: '0.71 0.33 0.04',
      label: 'PUBLISHED',
    },
    draft: {
      bg: '0.95 0.96 0.98',
      border: '0.79 0.83 0.88',
      text: '0.28 0.33 0.41',
      label: 'DRAFT',
    },
  }
  const badge = badgeMap[payslip.status.toLowerCase()] || badgeMap.draft

  // Compute positions for financial items
  const maxItems = Math.max(payslip.earnings.length, payslip.deductions.length)
  const itemStartY = 582
  const rowHeight = 17

  // Generate earnings text stream lines
  let earningsStream = ''
  payslip.earnings.forEach((e, idx) => {
    const curY = itemStartY - idx * rowHeight
    earningsStream += `
BT /F2 8.5 Tf 0.28 0.33 0.41 rg 40 ${curY} Td (${escapePdfText(e.name)}) Tj ET
BT /F1 8.5 Tf 0.06 0.09 0.16 rg 210 ${curY} Td (${escapePdfText(formatIDR(e.amount))}) Tj ET
`
  })

  // Generate deductions text stream lines
  let deductionsStream = ''
  payslip.deductions.forEach((d, idx) => {
    const curY = itemStartY - idx * rowHeight
    deductionsStream += `
BT /F2 8.5 Tf 0.28 0.33 0.41 rg 310 ${curY} Td (${escapePdfText(d.name)}) Tj ET
BT /F1 8.5 Tf 0.88 0.11 0.28 rg 480 ${curY} Td (-${escapePdfText(formatIDR(d.amount))}) Tj ET
`
  })

  const yTotal = itemStartY - maxItems * rowHeight - 6
  const yNetBox = yTotal - 64
  const yFooter = 60

  // Total earnings & deductions rows matching preview (clean line divider + colored total)
  const totalsStream = `
% Earnings Total Row
q 0.79 0.83 0.88 RG 0.75 w 40 ${yTotal + 11} m 285 ${yTotal + 11} l S Q
BT /F1 8 Tf 0.06 0.09 0.16 rg 40 ${yTotal} Td (TOTAL PENDAPATAN KOTOR (A)) Tj ET
BT /F1 8.5 Tf 0.02 0.59 0.41 rg 205 ${yTotal} Td (${escapePdfText(formatIDR(payslip.totalEarnings))}) Tj ET

% Deductions Total Row
q 0.79 0.83 0.88 RG 0.75 w 310 ${yTotal + 11} m 555 ${yTotal + 11} l S Q
BT /F1 8 Tf 0.06 0.09 0.16 rg 310 ${yTotal} Td (TOTAL POTONGAN (B)) Tj ET
BT /F1 8.5 Tf 0.88 0.11 0.28 rg 475 ${yTotal} Td (-${escapePdfText(formatIDR(payslip.totalDeductions))}) Tj ET
`

  // Build the complete PDF graphic and text stream
  const contentStream = `
% Company Logo Box (Blue rounded icon container)
q 0.15 0.39 0.92 rg 40 735 36 36 re f Q
BT /F1 14 Tf 1 1 1 rg 49 747 Td (AG) Tj ET

% Company Header Info
BT /F1 13 Tf 0.06 0.09 0.16 rg 86 761 Td (PT ANTIGRAVITY NUSANTARA) Tj ET
BT /F2 7.5 Tf 0.39 0.45 0.55 rg 86 748 Td (Sudirman Central Business District (SCBD), Tower 2 Lt. 18, Jakarta Selatan 12190) Tj ET
BT /F2 7.5 Tf 0.39 0.45 0.55 rg 86 737 Td (NPWP: 01.829.471.2-014.000  |  Telp: (021) 5299-8800) Tj ET

% Right Document Header (Cleanly separated & aligned vertically)
BT /F1 11 Tf 0.15 0.39 0.92 rg 380 770 Td (SLIP GAJI KARYAWAN) Tj ET
BT /F1 8.5 Tf 0.06 0.09 0.16 rg 380 754 Td (Periode: ) Tj /F2 8.5 Tf (${escapePdfText(payslip.period)}) Tj ET
BT /F3 8 Tf 0.39 0.45 0.55 rg 380 740 Td (No: ${escapePdfText(payslip.payslipNumber)}) Tj ET

% Status Badge (Positioned below document metadata)
q ${badge.bg} rg ${badge.border} RG 0.75 w 495 721 60 15 re B Q
BT /F1 7.5 Tf ${badge.text} rg 505 725 Td (${escapePdfText(badge.label)}) Tj ET

% Header Divider
q 0.88 0.91 0.94 RG 0.75 w 40 712 m 555 712 l S Q

% Employee Information Card Box (Subtle slate background with thin border)
q 0.97 0.98 0.99 rg 0.88 0.91 0.94 RG 0.75 w 40 634 515 68 re B Q

% Employee Info Details Row 1
BT /F2 7 Tf 0.39 0.45 0.55 rg 52 686 Td (Nama Karyawan) Tj ET
BT /F1 8.5 Tf 0.06 0.09 0.16 rg 52 673 Td (${escapePdfText(payslip.employeeName)}) Tj ET

BT /F2 7 Tf 0.39 0.45 0.55 rg 180 686 Td (NIK / Employee ID) Tj ET
BT /F3 8.5 Tf 0.06 0.09 0.16 rg 180 673 Td (${escapePdfText(payslip.employeeCode)}) Tj ET

BT /F2 7 Tf 0.39 0.45 0.55 rg 305 686 Td (Departemen) Tj ET
BT /F1 8.5 Tf 0.06 0.09 0.16 rg 305 673 Td (${escapePdfText(payslip.department)}) Tj ET

BT /F2 7 Tf 0.39 0.45 0.55 rg 430 686 Td (Jabatan / Grade) Tj ET
BT /F1 8.5 Tf 0.06 0.09 0.16 rg 430 673 Td (${escapePdfText(payslip.position)}) Tj ET

% Employee Info Details Row 2
BT /F2 7 Tf 0.39 0.45 0.55 rg 52 655 Td (Status PTKP) Tj ET
BT /F1 8.5 Tf 0.06 0.09 0.16 rg 52 643 Td (${escapePdfText(payslip.ptkpStatus)}) Tj ET

BT /F2 7 Tf 0.39 0.45 0.55 rg 180 655 Td (Nomor NPWP) Tj ET
BT /F3 8 Tf 0.06 0.09 0.16 rg 180 643 Td (${escapePdfText(payslip.npwp)}) Tj ET

BT /F2 7 Tf 0.39 0.45 0.55 rg 305 655 Td (Rekening Bank) Tj ET
BT /F1 8 Tf 0.06 0.09 0.16 rg 305 643 Td (${escapePdfText(payslip.bankName)} - ${escapePdfText(payslip.bankAccountNumber)}) Tj ET

BT /F2 7 Tf 0.39 0.45 0.55 rg 430 655 Td (Tanggal Pembayaran) Tj ET
BT /F1 8.5 Tf 0.06 0.09 0.16 rg 430 643 Td (${escapePdfText(payslip.paymentDate)}) Tj ET

% Financial Breakdown Section Headers (Clean border lines, no solid blocks)
BT /F1 8.5 Tf 0.02 0.59 0.41 rg 40 612 Td (A. PENDAPATAN (EARNINGS)) Tj ET
BT /F1 7.5 Tf 0.39 0.45 0.55 rg 225 612 Td (Nominal (Rp)) Tj ET
q 0.88 0.91 0.94 RG 0.75 w 40 604 m 285 604 l S Q

BT /F1 8.5 Tf 0.88 0.11 0.28 rg 310 612 Td (B. POTONGAN (DEDUCTIONS)) Tj ET
BT /F1 7.5 Tf 0.39 0.45 0.55 rg 495 612 Td (Nominal (Rp)) Tj ET
q 0.88 0.91 0.94 RG 0.75 w 310 604 m 555 604 l S Q

% Financial Breakdown Rows & Totals
${earningsStream}
${deductionsStream}
${totalsStream}

% Take Home Pay (Net Pay) Banner Box (Light blue tint with blue border)
q 0.94 0.96 1.0 rg 0.58 0.77 0.99 RG 1.5 w 40 ${yNetBox} 515 48 re B Q
BT /F1 9 Tf 0.15 0.39 0.92 rg 52 ${yNetBox + 28} Td (GAJI BERSIH (TAKE HOME PAY)) Tj ET
BT /F2 7.5 Tf 0.39 0.45 0.55 rg 52 ${yNetBox + 14} Td (Jumlah yang ditransfer ke rekening ${escapePdfText(payslip.bankName)} ${escapePdfText(payslip.bankAccountNumber)}) Tj ET
BT /F1 16 Tf 0.15 0.39 0.92 rg 395 ${yNetBox + 18} Td (${escapePdfText(formatIDR(payslip.netPay))}) Tj ET

% Bottom Divider
q 0.88 0.91 0.94 RG 0.75 w 40 ${yFooter + 75} m 555 ${yFooter + 75} l S Q

% Digital Verification Box
q 0.97 0.98 0.99 rg 0.88 0.91 0.94 RG 0.75 w 40 ${yFooter} 275 62 re B Q
q 1 1 1 rg 0.79 0.83 0.88 RG 0.75 w 48 ${yFooter + 12} 38 38 re B Q
BT /F1 10 Tf 0.15 0.39 0.92 rg 60 ${yFooter + 25} Td (QR) Tj ET

BT /F1 8.5 Tf 0.06 0.09 0.16 rg 96 ${yFooter + 46} Td (Verifikasi Digital HRIS) Tj ET
BT /F2 6.5 Tf 0.39 0.45 0.55 rg 96 ${yFooter + 35} Td (Dokumen ini sah digenerate secara elektronik melalui) Tj ET
BT /F2 6.5 Tf 0.39 0.45 0.55 rg 96 ${yFooter + 25} Td (Antigravity HRMS dan tidak memerlukan tanda tangan basah.) Tj ET
BT /F3 6.5 Tf 0.58 0.64 0.72 rg 96 ${yFooter + 14} Td (ID: ${checksum}) Tj ET

% Sign-off Column
BT /F2 7.5 Tf 0.39 0.45 0.55 rg 385 ${yFooter + 48} Td (Jakarta, ${escapePdfText(payslip.paymentDate)}) Tj ET
BT /F1 8.5 Tf 0.06 0.09 0.16 rg 385 ${yFooter + 24} Td (Finance & Payroll Division) Tj ET
BT /F2 7.5 Tf 0.39 0.45 0.55 rg 385 ${yFooter + 12} Td (PT Antigravity Nusantara) Tj ET
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
