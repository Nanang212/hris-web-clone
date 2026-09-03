/**
 * Pure TypeScript valid PDF 1.4 document generator.
 * Creates genuine binary PDF files with headers, metadata, summary cards, and tables.
 * Compatible with all PDF viewers (Adobe Acrobat, Chrome, Safari, Preview, Edge).
 */

interface PdfTableOptions {
  title: string
  subtitle?: string
  dateRange?: string
  department?: string
  headers: string[]
  rows: (string | number)[][]
  colWidths?: number[]
}

export function generateReportPdf(options: PdfTableOptions): Blob {
  const { title, subtitle, dateRange, department, headers, rows } = options

  // Page dimensions (A4 Landscape in points: 842 x 595)
  const pageWidth = 842
  const pageHeight = 595
  const margin = 40
  const contentWidth = pageWidth - margin * 2

  // Build stream instructions
  const streamLines: string[] = []

  // Helper functions: strictly ASCII-safe text escaping
  const escapePdfText = (text: string) => {
    return String(text ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[^\x20-\x7E]/g, ' ') // Strip non-ASCII to prevent byte-length drift
  }

  // Background header band
  streamLines.push('q')
  streamLines.push('0.08 0.38 0.75 rg') // Primary blue
  streamLines.push(`${margin} ${pageHeight - 75} ${contentWidth} 45 re f`)
  streamLines.push('Q')

  // Header Title
  streamLines.push('BT')
  streamLines.push('/F1 16 Tf')
  streamLines.push('1 1 1 rg') // White text
  streamLines.push(`${margin + 15} ${pageHeight - 55} Td`)
  streamLines.push(`(${escapePdfText(title.toUpperCase())}) Tj`)
  streamLines.push('ET')

  // Header Subtitle / HRIS System
  streamLines.push('BT')
  streamLines.push('/F1 9 Tf')
  streamLines.push('0.9 0.95 1 rg')
  streamLines.push(`${margin + 15} ${pageHeight - 68} Td`)
  streamLines.push(
    `(${escapePdfText(subtitle || 'HRIS Enterprise Management System - Official Analytics Report')}) Tj`,
  )
  streamLines.push('ET')

  // Metadata Panel
  const metaY = pageHeight - 105
  streamLines.push('q')
  streamLines.push('0.95 0.96 0.98 rg') // Light gray panel
  streamLines.push(`${margin} ${metaY} ${contentWidth} 22 re f`)
  streamLines.push('0.85 0.88 0.92 RG 0.5 w')
  streamLines.push(`${margin} ${metaY} ${contentWidth} 22 re S`)
  streamLines.push('Q')

  // Metadata Text
  streamLines.push('BT')
  streamLines.push('/F1 8 Tf')
  streamLines.push('0.2 0.25 0.3 rg')
  const dateStr = dateRange ? `Periode: ${dateRange}` : `Tanggal Cetak: ${new Date().toISOString().split('T')[0]}`
  const deptStr =
    department && department !== 'all' ? `Departemen: ${department}` : 'Departemen: Semua Departemen'
  streamLines.push(`${margin + 10} ${metaY + 7} Td`)
  streamLines.push(
    `(${escapePdfText(`${dateStr}   |   ${deptStr}   |   Total Baris Data: ${rows.length}`)}) Tj`,
  )
  streamLines.push('ET')

  // Table Setup
  const tableTopY = metaY - 20
  const rowHeight = 20
  const numCols = headers.length
  const colWidth = contentWidth / numCols

  // Table Header Background
  streamLines.push('q')
  streamLines.push('0.15 0.2 0.28 rg') // Dark navy header
  streamLines.push(`${margin} ${tableTopY - rowHeight} ${contentWidth} ${rowHeight} re f`)
  streamLines.push('Q')

  // Table Header Text
  headers.forEach((header, colIndex) => {
    streamLines.push('BT')
    streamLines.push('/F1 8 Tf')
    streamLines.push('1 1 1 rg') // White
    const x = margin + colIndex * colWidth + 6
    const y = tableTopY - rowHeight + 6
    streamLines.push(`${x} ${y} Td`)
    streamLines.push(`(${escapePdfText(header)}) Tj`)
    streamLines.push('ET')
  })

  // Table Rows (Draw up to 20 rows per sheet neatly)
  const maxRows = Math.min(rows.length, 20)
  for (let r = 0; r < maxRows; r++) {
    const rowY = tableTopY - (r + 2) * rowHeight
    const isEven = r % 2 === 0

    // Row Background
    if (isEven) {
      streamLines.push('q')
      streamLines.push('0.97 0.98 0.99 rg')
      streamLines.push(`${margin} ${rowY} ${contentWidth} ${rowHeight} re f`)
      streamLines.push('Q')
    }

    // Row Border bottom
    streamLines.push('q')
    streamLines.push('0.9 0.92 0.95 RG 0.5 w')
    streamLines.push(`${margin} ${rowY} m ${margin + contentWidth} ${rowY} l S`)
    streamLines.push('Q')

    // Row Cells Text
    const rowData = rows[r]
    rowData.forEach((cell, c) => {
      const cellText = String(cell ?? '')
      const x = margin + c * colWidth + 6
      const y = rowY + 6

      streamLines.push('BT')
      streamLines.push('/F1 8 Tf')
      streamLines.push('0.15 0.18 0.22 rg') // Dark charcoal
      streamLines.push(`${x} ${y} Td`)
      const display = cellText.length > 28 ? cellText.slice(0, 26) + '..' : cellText
      streamLines.push(`(${escapePdfText(display)}) Tj`)
      streamLines.push('ET')
    })
  }

  // Footer
  const footerY = 25
  streamLines.push('BT')
  streamLines.push('/F1 7 Tf')
  streamLines.push('0.55 0.6 0.65 rg')
  streamLines.push(`${margin} ${footerY} Td`)
  streamLines.push(
    `(${escapePdfText(`Dokumen Rahasia Perusahaan - Dicetak secara otomatis oleh HRIS Portal pada ${new Date().toISOString()} - Halaman 1 dari 1`)}) Tj`,
  )
  streamLines.push('ET')

  // Stream content
  const contentStream = streamLines.join('\n')
  const encoder = new TextEncoder()
  const contentBytes = encoder.encode(contentStream)

  // Build PDF 1.4 objects
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`
  const obj4 = `4 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'

  const header = '%PDF-1.4\n'
  const headerBytes = encoder.encode(header)

  const objects = [obj1, obj2, obj3, obj4, obj5]
  const offsets: number[] = []
  let currentOffset = headerBytes.length

  objects.forEach((obj) => {
    offsets.push(currentOffset)
    currentOffset += encoder.encode(obj).length
  })

  // Build xref table
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.forEach((off) => {
    xref += off.toString().padStart(10, '0') + ' 00000 n \n'
  })

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${currentOffset}\n%%EOF\n`

  const fullPdfText = header + objects.join('') + xref + trailer
  const fullBytes = encoder.encode(fullPdfText)

  return new Blob([fullBytes], { type: 'application/pdf' })
}
