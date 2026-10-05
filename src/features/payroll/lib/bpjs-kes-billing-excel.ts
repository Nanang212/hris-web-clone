// src/features/payroll/lib/bpjs-kes-billing-excel.ts
// Template & parser Excel untuk tagihan BPJS Kesehatan. Dicocokkan ke karyawan via No BPJS / NIK / Nopeg.
// Template didesain profesional dan ber-style warna rapi dengan exceljs; parsing memakai xlsx.
import ExcelJS from 'exceljs'
import * as XLSX from 'xlsx'
import type { BpjsKesBillingRecord, BpjsKesConfig } from '../types'

const COL = {
  note: 'Keterangan',
  nopeg: 'Nopeg *',
  nik: 'NIK KTP *',
  bpjs: 'No BPJS Kesehatan *',
  name: 'Nama Karyawan',
  wage: 'Upah BPJS (Rp) *',
  family: 'Pot Keluarga Tambahan (Rp)',
} as const

const EXAMPLE_MARKER = 'CONTOH'

export interface ParsedBillingResult {
  records: BpjsKesBillingRecord[]
  errors: string[]
}

/** Mengubah "120.000", "Rp 120.000,50", 120000 menjadi angka. NaN bila tidak valid. */
function parseAmount(raw: unknown): number {
  if (typeof raw === 'number') return raw
  const text = String(raw ?? '')
    .replace(/rp/gi, '')
    .replace(/\s/g, '')
  if (text === '') return 0
  const normalized = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text.replace(/\./g, '')
  return Number(normalized)
}

export async function downloadBillingTemplate(periodLabel: string, config: BpjsKesConfig) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'HRIS Payroll'

  const PRIMARY_BLUE = 'FF1E40AF' // Deep Corporate Navy
  const HEADER_BLUE = 'FF2563EB'  // Vibrant Royal Blue
  const LIGHT_BLUE = 'FFEFF6FF'   // Soft Ice Blue
  const SECTION_BLUE = 'FFDBEAFE' // Light Section Blue
  const BORDER_COLOR = 'FFCBD5E1' // Slate-300
  const LIGHT_BORDER = 'FFE2E8F0' // Slate-200
  const EXAMPLE_BG = 'FFFEF9C3'   // Amber-100 Tint
  const EXAMPLE_BADGE = 'FFFDE68A' // Amber-200 Badge

  const BORDER_THIN = {
    top: { style: 'thin' as const, color: { argb: BORDER_COLOR } },
    left: { style: 'thin' as const, color: { argb: BORDER_COLOR } },
    bottom: { style: 'thin' as const, color: { argb: BORDER_COLOR } },
    right: { style: 'thin' as const, color: { argb: BORDER_COLOR } },
  }

  const BORDER_LIGHT = {
    top: { style: 'thin' as const, color: { argb: LIGHT_BORDER } },
    left: { style: 'thin' as const, color: { argb: LIGHT_BORDER } },
    bottom: { style: 'thin' as const, color: { argb: LIGHT_BORDER } },
    right: { style: 'thin' as const, color: { argb: LIGHT_BORDER } },
  }

  // ── Sheet 1: Tagihan BPJS Kes (yang di-upload) ───────────────────────────────
  const sheet = wb.addWorksheet('Tagihan BPJS Kes', {
    views: [{ state: 'frozen', ySplit: 4, showGridLines: true }],
  })

  sheet.columns = [
    { key: 'note', width: 15 },
    { key: 'nopeg', width: 16 },
    { key: 'nik', width: 22 },
    { key: 'bpjs', width: 22 },
    { key: 'name', width: 30 },
    { key: 'wage', width: 20 },
    { key: 'family', width: 26 },
    { key: 'gap', width: 3 },
    { key: 'guideKey', width: 22 },
    { key: 'guideVal', width: 62 },
  ]

  // Baris 1: Judul Utama
  sheet.mergeCells('A1:G1')
  const titleCell = sheet.getCell('A1')
  titleCell.value = `TEMPLATE TAGIHAN BPJS KESEHATAN — ${periodLabel.toUpperCase()}`
  titleCell.font = { name: 'Segoe UI', bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PRIMARY_BLUE } }
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  sheet.getRow(1).height = 32

  // Baris 2: Sub-judul / Petunjuk Pengisian
  sheet.mergeCells('A2:G2')
  const subCell = sheet.getCell('A2')
  subCell.value =
    'ℹ️  Petunjuk: Isi data karyawan mulai baris 6 (di bawah baris CONTOH). Baris CONTOH otomatis diabaikan sistem dan tidak ikut ter-upload.'
  subCell.font = { name: 'Segoe UI', italic: true, size: 9.5, color: { argb: 'FF1E3A8A' } }
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_BLUE } }
  subCell.alignment = { vertical: 'middle', indent: 1 }
  subCell.border = { bottom: { style: 'thin' as const, color: { argb: 'FF93C5FD' } } }
  sheet.getRow(2).height = 24

  // Baris 3: Pemisah
  sheet.getRow(3).height = 8

  // Baris 4: Header Kolom Tabel
  const headers = [
    COL.note,
    COL.nopeg,
    COL.nik,
    COL.bpjs,
    COL.name,
    COL.wage,
    COL.family,
  ]
  const headerRow = sheet.getRow(4)
  headerRow.height = 28
  headers.forEach((text, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = text
    cell.font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BLUE } }
    cell.alignment = {
      vertical: 'middle',
      horizontal: i >= 5 ? 'right' : (i <= 3 ? 'center' : 'left'),
      wrapText: true,
    }
    cell.border = BORDER_THIN
  })

  // Baris 5: Baris CONTOH Format
  const exampleRow = sheet.getRow(5)
  exampleRow.height = 22
  const exampleData = [
    EXAMPLE_MARKER,
    'EMP-001',
    '3171234567890001',
    '0001234567890',
    'Nama Karyawan Contoh',
    8_500_000,
    0,
  ]
  exampleData.forEach((val, i) => {
    const cell = exampleRow.getCell(i + 1)
    cell.value = val
    cell.font = {
      name: 'Segoe UI',
      italic: true,
      size: 9.5,
      color: { argb: i === 0 ? 'FF92400E' : 'FF713F12' },
      bold: i === 0,
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: i === 0 ? EXAMPLE_BADGE : EXAMPLE_BG },
    }
    cell.alignment = {
      vertical: 'middle',
      horizontal: i >= 5 ? 'right' : (i <= 3 ? 'center' : 'left'),
    }
    cell.border = BORDER_THIN
    if (i >= 1 && i <= 4) cell.numFmt = '@'
    if (i >= 5) cell.numFmt = '#,##0'
  })

  // Baris 6 - 80: Format Baris Kosong (Siap Diisi)
  for (let r = 6; r <= 80; r++) {
    const row = sheet.getRow(r)
    row.height = 20
    const isEven = r % 2 === 0
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC'
    for (let c = 1; c <= 7; c++) {
      const cell = row.getCell(c)
      cell.border = BORDER_LIGHT
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } }
      if (c >= 2 && c <= 5) {
        cell.numFmt = '@'
        cell.alignment = { vertical: 'middle', horizontal: c <= 4 ? 'center' : 'left' }
      } else if (c >= 6) {
        cell.numFmt = '#,##0'
        cell.alignment = { vertical: 'middle', horizontal: 'right' }
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      }
    }
  }

  // Panel Panduan di Samping (Kolom I & J, Mulai Baris 4)
  sheet.mergeCells('I4:J4')
  const guideHeader = sheet.getCell('I4')
  guideHeader.value = '📘 CARA MENGISI & PANDUAN KOLOM'
  guideHeader.font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
  guideHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PRIMARY_BLUE } }
  guideHeader.alignment = { vertical: 'middle', horizontal: 'center' }
  guideHeader.border = BORDER_THIN

  const guideItems: [string, string][] = [
    ['Nopeg *', 'Nomor pegawai karyawan. Minimal isi salah satu: Nopeg, NIK, atau BPJS.'],
    ['NIK KTP *', '16 digit NIK sesuai KTP karyawan untuk pencocokan database.'],
    ['No BPJS Kes *', '13 digit nomor kartu BPJS Kesehatan (kunci pencocokan utama).'],
    ['Nama Karyawan', 'Nama karyawan (hanya untuk memudahkan verifikasi visual).'],
    ['Upah BPJS *', 'Nominal upah dari tagihan resmi BPJS (dasar hitungan 1% & 4%).'],
    ['Pot Keluarga', 'Iuran peserta tambahan/keluarga (isi 0 jika tidak ada).'],
    ['Pencocokan', 'Sistem mencocokkan otomatis: No BPJS -> NIK KTP -> Nopeg.'],
    ['Batas Upah (Cap)', `Upah otomatis dibatasi maks. cap Rp ${config.maxWageCap.toLocaleString('id-ID')}.`],
  ]

  guideItems.forEach(([label, desc], idx) => {
    const r = 5 + idx
    const cellKey = sheet.getCell(`I${r}`)
    const cellVal = sheet.getCell(`J${r}`)

    cellKey.value = label
    cellKey.font = { name: 'Segoe UI', bold: true, size: 9, color: { argb: 'FF1E3A8A' } }
    cellKey.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_BLUE } }
    cellKey.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    cellKey.border = BORDER_THIN

    cellVal.value = desc
    cellVal.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF334155' } }
    cellVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
    cellVal.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
    cellVal.border = BORDER_THIN
    sheet.getRow(r).height = 20
  })

  // ── Sheet 2: Petunjuk & Regulasi ─────────────────────────────────────────────
  const guideSheet = wb.addWorksheet('Petunjuk & Regulasi', {
    views: [{ showGridLines: true }],
  })
  guideSheet.columns = [{ width: 28 }, { width: 85 }]

  guideSheet.mergeCells('A1:B1')
  const gTitle = guideSheet.getCell('A1')
  gTitle.value = 'PETUNJUK & ATURAN PERHITUNGAN BPJS KESEHATAN'
  gTitle.font = { name: 'Segoe UI', bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
  gTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PRIMARY_BLUE } }
  gTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  guideSheet.getRow(1).height = 32

  guideSheet.mergeCells('A2:B2')
  const gSub = guideSheet.getCell('A2')
  gSub.value = `Periode Payroll: ${periodLabel} | Sumber Regulasi: PP No. 82/2018 & Perpres No. 64/2020`
  gSub.font = { name: 'Segoe UI', italic: true, size: 9.5, color: { argb: 'FF1E3A8A' } }
  gSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_BLUE } }
  gSub.alignment = { vertical: 'middle', indent: 1 }
  guideSheet.getRow(2).height = 22

  const guideRows: [string, string, 'section' | 'row'][] = [
    ['1. DATA DI TEMPLATE EXCEL', '', 'section'],
    ['Sheet yang di-upload', 'Hanya sheet pertama ("Tagihan BPJS Kes"). Sheet lainnya hanya petunjuk & penjelasan.', 'row'],
    ['Baris CONTOH (Kuning)', 'Hanya contoh format. Otomatis diabaikan dan tidak akan masuk ke hitungan payroll.', 'row'],
    ['Upah BPJS', 'Isi sesuai tagihan/sistem BPJS yang asli (bukan dari gaji pokok di HRIS).', 'row'],
    ['Keluarga Tambahan', 'Iuran peserta tambahan ke-5 dst. (1% per orang). Isi 0 jika tidak ada.', 'row'],
    ['2. RUMUS PERHITUNGAN OTOMATIS OLEH SISTEM', '', 'section'],
    ['Upah Dasar Iuran', `MIN(Upah BPJS, Plafon/Cap Rp ${config.maxWageCap.toLocaleString('id-ID')})`, 'row'],
    ['Potongan Karyawan', `Upah Dasar × ${config.employeeRatePercent}%  → MENGURANGI Take Home Pay (gaji bersih)`, 'row'],
    ['Porsi Perusahaan', `Upah Dasar × ${config.companyRatePercent}%  → TIDAK mengurangi gaji (ditanggung perusahaan; dasar PPh 21)`, 'row'],
    ['Keluarga Tambahan', 'Nominal Pot. Keluarga Tambahan  → MENGURANGI Take Home Pay, tidak memengaruhi pajak', 'row'],
    ['Total Tagihan BPJS', 'Potongan Karyawan + Porsi Perusahaan + Keluarga Tambahan (yang disetor ke BPJS)', 'row'],
    ['Total Potongan THP', 'Potongan Karyawan + Keluarga Tambahan (yang dipotong dari slip gaji)', 'row'],
  ]

  let curRow = 4
  guideRows.forEach(([a, b, kind]) => {
    const row = guideSheet.getRow(curRow)
    if (kind === 'section') {
      guideSheet.mergeCells(`A${curRow}:B${curRow}`)
      const c = row.getCell(1)
      c.value = a
      c.font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: PRIMARY_BLUE } }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SECTION_BLUE } }
      c.alignment = { vertical: 'middle', indent: 1 }
      c.border = BORDER_THIN
      row.height = 26
    } else {
      const c1 = row.getCell(1)
      const c2 = row.getCell(2)
      c1.value = a
      c1.font = { name: 'Segoe UI', bold: true, size: 9.5, color: { argb: 'FF1E293B' } }
      c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
      c1.alignment = { vertical: 'middle', indent: 1 }
      c1.border = BORDER_LIGHT

      c2.value = b
      c2.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF334155' } }
      c2.alignment = { vertical: 'middle', wrapText: true }
      c2.border = BORDER_LIGHT
      row.height = 22
    }
    curRow++
  })

  // ── Sheet 3: Simulasi Hitungan (Rumus Excel Hidup) ───────────────────────────
  const simSheet = wb.addWorksheet('Simulasi Hitungan', {
    views: [{ showGridLines: true }],
  })
  simSheet.columns = [
    { width: 26 },
    { width: 18 },
    { width: 22 },
    { width: 24 },
    { width: 24 },
    { width: 22 },
    { width: 20 },
    { width: 22 },
  ]

  simSheet.mergeCells('A1:H1')
  const sTitle = simSheet.getCell('A1')
  sTitle.value = 'SIMULASI HITUNGAN DENGAN RUMUS EXCEL AKTIF'
  sTitle.font = { name: 'Segoe UI', bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
  sTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PRIMARY_BLUE } }
  sTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  simSheet.getRow(1).height = 32

  simSheet.mergeCells('A2:H2')
  const sSub = simSheet.getCell('A2')
  sSub.value = '💡 Tip: Ubah nilai nominal di kolom "Upah BPJS" untuk mencoba simulasi potongan secara dinamis.'
  sSub.font = { name: 'Segoe UI', italic: true, size: 9.5, color: { argb: 'FF1E3A8A' } }
  sSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_BLUE } }
  sSub.alignment = { vertical: 'middle', indent: 1 }
  simSheet.getRow(2).height = 22

  const simHead = [
    'Contoh Skenario',
    'Upah BPJS',
    'Upah Dasar (Cap)',
    `Pot. Karyawan (${config.employeeRatePercent}%)`,
    `Porsi Perusahaan (${config.companyRatePercent}%)`,
    'Pot. Keluarga',
    'Total Tagihan BPJS',
    'Dipotong dari Gaji (THP)',
  ]
  const simHeadRow = simSheet.getRow(4)
  simHeadRow.height = 28
  simHead.forEach((text, i) => {
    const cell = simHeadRow.getCell(i + 1)
    cell.value = text
    cell.font = { name: 'Segoe UI', bold: true, size: 9.5, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i === 7 ? 'FF059669' : HEADER_BLUE } }
    cell.alignment = { vertical: 'middle', horizontal: i === 0 ? 'left' : 'right', wrapText: true }
    cell.border = BORDER_THIN
  })

  const simSamples: [string, number, number][] = [
    ['Upah di bawah plafon cap', 8_500_000, 0],
    ['Upah di atas plafon cap', 16_500_000, 0],
    ['Dengan keluarga tambahan', 10_000_000, 150_000],
  ]

  simSamples.forEach(([label, wage, family], i) => {
    const r = 5 + i
    const row = simSheet.getRow(r)
    row.height = 24

    row.getCell(1).value = label
    row.getCell(1).font = { name: 'Segoe UI', bold: true, size: 9.5, color: { argb: 'FF1E293B' } }
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    row.getCell(1).border = BORDER_THIN

    row.getCell(2).value = wage
    row.getCell(3).value = { formula: `MIN(B${r},${config.maxWageCap})` }
    row.getCell(4).value = { formula: `ROUND(C${r}*${config.employeeRatePercent}/100,0)` }
    row.getCell(5).value = { formula: `ROUND(C${r}*${config.companyRatePercent}/100,0)` }
    row.getCell(6).value = family
    row.getCell(7).value = { formula: `D${r}+E${r}+F${r}` }
    row.getCell(8).value = { formula: `D${r}+F${r}` }

    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c)
      cell.numFmt = '#,##0'
      cell.border = BORDER_THIN
      cell.alignment = { vertical: 'middle', horizontal: 'right' }
      if (c === 8) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }
        cell.font = { name: 'Segoe UI', bold: true, color: { argb: 'FF15803D' } }
      }
    }
  })

  // Trigger Download di Browser
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const safeLabel = periodLabel.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_')
  link.download = `template-tagihan-bpjs-kes-${safeLabel}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function parseBillingFile(file: File): Promise<ParsedBillingResult> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheetName = wb.SheetNames[0]
  if (!sheetName) return { records: [], errors: ['File Excel tidak memiliki sheet.'] }

  // Cari baris header (template punya judul di atasnya) — baris pertama yang memuat "nopeg"/"upah".
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], { header: 1, defval: '' })
  const headerIndex = matrix.findIndex((cells) => {
    const joined = cells.map((c) => String(c).toLowerCase()).join('|')
    return joined.includes('nopeg') && joined.includes('upah')
  })
  if (headerIndex < 0) {
    return { records: [], errors: ['Header tidak ditemukan. Gunakan template yang diunduh dari halaman ini.'] }
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName], {
    defval: '',
    range: headerIndex,
  })

  const findKey = (row: Record<string, unknown>, matcher: (header: string) => boolean) =>
    Object.keys(row).find((key) => matcher(key.toLowerCase()))

  const records: BpjsKesBillingRecord[] = []
  const errors: string[] = []

  rows.forEach((row, index) => {
    const excelRow = headerIndex + index + 2
    const noteKey = findKey(row, (h) => h.includes('keterangan'))
    const nopegKey = findKey(row, (h) => h.includes('nopeg') || h.includes('no peg'))
    const nikKey = findKey(row, (h) => h.includes('nik'))
    const bpjsKey = findKey(row, (h) => h.includes('bpjs') && !h.includes('upah'))
    const nameKey = findKey(row, (h) => h.includes('nama'))
    const wageKey = findKey(row, (h) => h.includes('upah'))
    const familyKey = findKey(row, (h) => h.includes('keluarga'))

    // Baris contoh tidak ikut ter-upload
    const note = String(noteKey ? row[noteKey] : '').trim().toUpperCase()
    if (note.includes(EXAMPLE_MARKER) || note.includes('EXAMPLE')) return

    const nopeg = String(nopegKey ? row[nopegKey] : '').trim()
    const nik = String(nikKey ? row[nikKey] : '').trim()
    const bpjsNumber = String(bpjsKey ? row[bpjsKey] : '').trim()
    const name = String(nameKey ? row[nameKey] : '').trim()
    const bpjsWage = parseAmount(wageKey ? row[wageKey] : 0)
    const familyExtra = parseAmount(familyKey ? row[familyKey] : 0)

    // Lewati baris kosong total
    if (!nopeg && !nik && !bpjsNumber && !name && bpjsWage === 0 && familyExtra === 0) return

    if (!nopeg && !nik && !bpjsNumber) {
      errors.push(`Baris ${excelRow}: isi minimal salah satu: Nopeg, NIK KTP, atau No BPJS Kesehatan.`)
      return
    }
    if (Number.isNaN(bpjsWage) || Number.isNaN(familyExtra)) {
      errors.push(`Baris ${excelRow}: nominal tidak valid.`)
      return
    }
    if (bpjsWage < 0 || familyExtra < 0) {
      errors.push(`Baris ${excelRow}: nominal tidak boleh negatif.`)
      return
    }

    records.push({ nopeg, nik, bpjsNumber, name, bpjsWage, familyExtra })
  })

  return { records, errors }
}
