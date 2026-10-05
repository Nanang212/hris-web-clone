// src/features/payroll/lib/payroll-export-excel.ts
// Export lengkap rincian payroll, rekonsiliasi BPJS Kesehatan, dan BPJS TK per project ke format Excel .xlsx.

import ExcelJS from 'exceljs'
import type { BpjsKesReconciliationRow, BpjsKesReconciliationSummary } from './payroll-reconciliation'
import type { EmployeePayrollDetail, PayrollRun } from '../types'

function triggerDownload(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function exportPayrollRunToExcel(params: {
  run: PayrollRun
  details: EmployeePayrollDetail[]
  reconciliationRows: BpjsKesReconciliationRow[]
  reconciliationSummary: BpjsKesReconciliationSummary
}) {
  const { run, details, reconciliationRows } = params
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Antigravity HRIS'
  workbook.lastModifiedBy = 'Antigravity HRIS'
  workbook.created = new Date()

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 1: REKAP PAYROLL & TAKE HOME PAY
  // ══════════════════════════════════════════════════════════════════════════
  const sheet1 = workbook.addWorksheet('Rekap Payroll', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 4 }],
  })

  // Header Judul Sheet 1
  sheet1.mergeCells('A1:O1')
  const title1 = sheet1.getCell('A1')
  title1.value = `LAPORAN REKAPITULASI PAYROLL KARYAWAN — ${run.period.toUpperCase()}`
  title1.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
  title1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }
  title1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  sheet1.getRow(1).height = 36

  sheet1.mergeCells('A2:O2')
  const sub1 = sheet1.getCell('A2')
  sub1.value = `Batch Code: ${run.code}  |  Cut-off: ${run.cutoffStartDate} s/d ${run.cutoffEndDate}  |  Tanggal Pembayaran: ${run.paymentDate}`
  sub1.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF94A3B8' } }
  sub1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
  sub1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  sheet1.getRow(2).height = 20

  sheet1.addRow([]) // Baris kosong pembatas (Row 3)
  sheet1.getRow(3).height = 8

  // Header Kolom Tabel (Row 4)
  const headers1 = [
    'No',
    'Nopeg',
    'Nama Karyawan',
    'Departemen',
    'Jabatan',
    'Project',
    'PTKP',
    'Gaji Pokok',
    'Tunj. Tetap',
    'Tunj. Variabel',
    'Lembur',
    'Total Gross',
    'BPJS Kes Karyawan',
    'BPJS TK Karyawan',
    'PPh 21',
    'Potongan Lain',
    'Total Potongan',
    'Take Home Pay (THP)',
    'Bank',
    'No. Rekening',
  ]
  const row4 = sheet1.addRow(headers1)
  row4.height = 26
  row4.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0F172A' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    }
  })

  // Baris Data Sheet 1
  details.forEach((d, idx) => {
    const row = sheet1.addRow([
      idx + 1,
      d.employeeCode,
      d.employeeName,
      d.department,
      d.position,
      d.project || '-',
      d.ptkpStatus,
      d.baseSalary,
      d.fixedAllowances,
      d.variableAllowances,
      d.overtimePay,
      d.totalGross,
      d.bpjsKesEmployee,
      d.bpjsTkEmployee,
      d.pph21Tax,
      d.unpaidLeaveDeduction + d.lateDeduction + d.loanDeduction + (d.thrTaxInstallment || 0),
      d.totalDeductions,
      d.netTakeHomePay,
      d.bankName,
      d.bankAccountNumber,
    ])
    row.height = 20
    const isEven = idx % 2 === 0
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9 }
      if (!isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
      }
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      }

      // Kolom angka mata uang
      if (colNum >= 8 && colNum <= 18) {
        cell.numFmt = '#,##0'
        cell.alignment = { vertical: 'middle', horizontal: 'right' }
      } else if (colNum === 1 || colNum === 2 || colNum === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' }
      }

      // Format teks rekening bank agar nomor tidak rusak
      if (colNum === 20 || colNum === 2) {
        cell.numFmt = '@'
      }

      // Warna khusus THP
      if (colNum === 18) {
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF047857' } }
      }
    })
  })

  // Baris Total Sheet 1
  const startRow1 = 5
  const endRow1 = 4 + details.length
  const totalRow1 = sheet1.addRow([
    'TOTAL',
    '',
    '',
    '',
    '',
    '',
    '',
    { formula: `SUM(H${startRow1}:H${endRow1})` },
    { formula: `SUM(I${startRow1}:I${endRow1})` },
    { formula: `SUM(J${startRow1}:J${endRow1})` },
    { formula: `SUM(K${startRow1}:K${endRow1})` },
    { formula: `SUM(L${startRow1}:L${endRow1})` },
    { formula: `SUM(M${startRow1}:M${endRow1})` },
    { formula: `SUM(N${startRow1}:N${endRow1})` },
    { formula: `SUM(O${startRow1}:O${endRow1})` },
    { formula: `SUM(P${startRow1}:P${endRow1})` },
    { formula: `SUM(Q${startRow1}:Q${endRow1})` },
    { formula: `SUM(R${startRow1}:R${endRow1})` },
    '',
    '',
  ])
  totalRow1.height = 24
  sheet1.mergeCells(`A${endRow1 + 1}:G${endRow1 + 1}`)
  totalRow1.eachCell((cell, colNum) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF0F172A' } },
      bottom: { style: 'double', color: { argb: 'FF0F172A' } },
    }
    if (colNum >= 8 && colNum <= 18) {
      cell.numFmt = '#,##0'
      cell.alignment = { vertical: 'middle', horizontal: 'right' }
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    }
  })

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 2: REKONSILIASI BPJS KESEHATAN (UPLOAD VS PAYROLL)
  // ══════════════════════════════════════════════════════════════════════════
  const sheet2 = workbook.addWorksheet('Rekonsiliasi BPJS Kes', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 4 }],
  })

  // Header Judul Sheet 2
  sheet2.mergeCells('A1:Q1')
  const title2 = sheet2.getCell('A1')
  title2.value = `REKONSILIASI & AUDIT TAGIHAN BPJS KESEHATAN VS REPORT PAYROLL — ${run.period.toUpperCase()}`
  title2.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
  title2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E1B4B' } }
  title2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  sheet2.getRow(1).height = 36

  sheet2.mergeCells('A2:Q2')
  const sub2 = sheet2.getCell('A2')
  sub2.value = `Kontrol audit pencocokan NIK, No BPJS & Nopeg | Tagihan BPJS vs Angka Payroll | Mendeteksi selisih & karyawan resign/belum terdaftar`
  sub2.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FFCBD5E1' } }
  sub2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF312E81' } }
  sub2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  sheet2.getRow(2).height = 20

  sheet2.addRow([]) // Baris kosong pembatas
  sheet2.getRow(3).height = 8

  const headers2 = [
    'No',
    'Nopeg',
    'NIK KTP',
    'No. BPJS Kesehatan',
    'Nama Karyawan / Peserta',
    'Project',
    'Status Master',
    'Upah Tagihan BPJS',
    'Upah di Payroll',
    '1% Tagihan',
    '1% Payroll',
    'Kel. Tambahan Tagihan',
    'Kel. Tambahan Payroll',
    'Total Tagihan BPJS',
    'Total di Payroll',
    'Selisih (+/-)',
    'Status & Keterangan Audit',
  ]
  const row4_2 = sheet2.addRow(headers2)
  row4_2.height = 26
  row4_2.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4338CA' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF312E81' } },
      bottom: { style: 'medium', color: { argb: 'FF312E81' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    }
  })

  reconciliationRows.forEach((r, idx) => {
    const row = sheet2.addRow([
      idx + 1,
      r.nopeg,
      r.nik,
      r.bpjsNumber,
      r.employeeName,
      r.project,
      r.statusInMaster,
      r.billingWage,
      r.payrollWage,
      r.billingEmployee1Pct,
      r.payrollEmployee1Pct,
      r.billingFamilyExtra,
      r.payrollFamilyExtra,
      r.billingTotal,
      r.payrollTotal,
      r.totalDifference,
      r.statusLabel + ' — ' + r.diagnosis,
    ])
    row.height = 20
    const isEven = idx % 2 === 0
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9 }
      if (!isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
      }
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      }

      // Format identitas string (agar tidak terpotong leading zero)
      if (colNum === 2 || colNum === 3 || colNum === 4) {
        cell.numFmt = '@'
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      } else if (colNum >= 8 && colNum <= 16) {
        cell.numFmt = '#,##0'
        cell.alignment = { vertical: 'middle', horizontal: 'right' }
      } else if (colNum === 1 || colNum === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' }
      }

      // Highlight warna selisih
      if (colNum === 16 && r.totalDifference !== 0) {
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFDC2626' } }
      }
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 3: DASAR BPJS TK PER PROJECT
  // ══════════════════════════════════════════════════════════════════════════
  const sheet3 = workbook.addWorksheet('Dasar BPJS TK Project', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 4 }],
  })

  sheet3.mergeCells('A1:L1')
  const title3 = sheet3.getCell('A1')
  title3.value = `DASAR PROGRAM BPJS KETENAGAKERJAAN PER PROJECT — ${run.period.toUpperCase()}`
  title3.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
  title3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF064E3B' } }
  title3.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  sheet3.getRow(1).height = 36

  sheet3.mergeCells('A2:L2')
  const sub3 = sheet3.getCell('A2')
  sub3.value = `Tarif JKK menempel ke project | JKM wajib | JHT & JP aktif/nonaktif sesuai ketentuan project | Hanya JHT 2% & JP 1% potong THP`
  sub3.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FFD1FAE5' } }
  sub3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF047857' } }
  sub3.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  sheet3.getRow(2).height = 20

  sheet3.addRow([])
  sheet3.getRow(3).height = 8

  const headers3 = [
    'No',
    'Nopeg',
    'Nama Karyawan',
    'Project',
    'Gaji Dasar Upah',
    'JKK Perusahaan',
    'JKM Perusahaan (0.3%)',
    'JHT Perusahaan (3.7%)',
    'JHT Karyawan (2%) [THP]',
    'JP Perusahaan (2%)',
    'JP Karyawan (1%) [THP]',
    'Total Beban Perusahaan',
  ]
  const row4_3 = sheet3.addRow(headers3)
  row4_3.height = 26
  row4_3.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })

  details.forEach((d, idx) => {
    const jkk = d.bpjsTkJkk ?? 0
    const jkm = d.bpjsTkJkm ?? 0
    const jhtEr = d.bpjsTkJhtEmployer ?? 0
    const jhtEe = d.bpjsTkJhtEmployee ?? 0
    const jpEr = d.bpjsTkJpEmployer ?? 0
    const jpEe = d.bpjsTkJpEmployee ?? 0
    const totalCompany = jkk + jkm + jhtEr + jpEr

    const row = sheet3.addRow([
      idx + 1,
      d.employeeCode,
      d.employeeName,
      d.project || '-',
      d.baseSalary,
      jkk,
      jkm,
      jhtEr,
      jhtEe,
      jpEr,
      jpEe,
      totalCompany,
    ])
    row.height = 20
    const isEven = idx % 2 === 0
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9 }
      if (!isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
      }
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      }
      if (colNum >= 5 && colNum <= 12) {
        cell.numFmt = '#,##0'
        cell.alignment = { vertical: 'middle', horizontal: 'right' }
      } else if (colNum === 1 || colNum === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' }
      }

      if (colNum === 9 || colNum === 11) {
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFD97706' } }
      }
    })
  })

  // Auto-fit kolom di semua sheet
  ;[sheet1, sheet2, sheet3].forEach((ws) => {
    ws.columns.forEach((column) => {
      let maxLen = 12
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const val = cell.value ? String(cell.value) : ''
        if (!val.startsWith('=') && !val.includes('\n')) {
          maxLen = Math.max(maxLen, Math.min(val.length + 3, 40))
        }
      })
      column.width = maxLen
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const cleanPeriod = run.period.replace(/\s+/g, '_')
  triggerDownload(buffer, `Payroll_Complete_Report_${cleanPeriod}_${run.code}.xlsx`)
}
