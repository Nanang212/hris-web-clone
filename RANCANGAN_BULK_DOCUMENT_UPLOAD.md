# 📦 Rancangan Fitur: Bulk Document Upload dengan ZIP + Excel Mapping

> **Status**: Draft / Perancangan  
> **Tanggal**: 2 Oktober 2026  
> **Module**: Employment → Employee Profile → Import  

---

## 1. Latar Belakang

Saat ini fitur import pegawai (Bulk Insert & Bulk Update) hanya mendukung **data text** melalui Excel.  
Untuk dokumen seperti KTP, NPWP, Ijazah, dll — HR harus upload **satu per satu** di halaman profil masing-masing pegawai.

Ini tidak efisien ketika onboarding banyak pegawai sekaligus (misal: 50-100 karyawan baru).

### Masalah
- Excel tidak bisa menyimpan/mengirim file PDF/gambar secara langsung
- Upload dokumen satu-satu per pegawai memakan waktu lama
- Tidak ada mekanisme bulk untuk assign dokumen ke banyak pegawai sekaligus

---

## 2. Solusi: Flow 3 Step (ZIP → Excel → Import)

### Konsep Utama
> **Upload file dulu, mapping belakangan.**

File dokumen diupload terlebih dahulu dalam bentuk ZIP.  
Kemudian Excel template di-generate dengan **dropdown** berisi nama file yang sudah diupload.  
HR tinggal pilih file mana untuk pegawai mana di Excel, lalu upload kembali.

---

## 3. Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   STEP 1: Upload ZIP                                         │
│   ┌────────────────────────────────────────────────┐         │
│   │  📦 dokumen_pegawai.zip                        │         │
│   │  ├── KTP - Nanang Aditya Sutahar.pdf           │         │
│   │  ├── KTP - Hanif Arya.jpg                      │         │
│   │  ├── NPWP - Nanang Aditya Sutahar.pdf          │         │
│   │  ├── NPWP - Hanif Arya.pdf                     │         │
│   │  ├── IJAZAH - Nanang Aditya Sutahar.pdf        │         │
│   │  └── FOTO - Hanif Arya.png                     │         │
│   └────────────────────────────────────────────────┘         │
│   ✅ 6 files extracted → stored in temporary storage         │
│                                                              │
│   ⬇️ Setelah upload berhasil, tombol Download Excel muncul   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   STEP 2: Download & Isi Excel Template                      │
│   ┌──────────────────────────────────────────────────────┐   │
│   │  Nama *    │ Dept *  │ File KTP (▾)  │ File NPWP (▾)│   │
│   ├────────────┼─────────┼───────────────┼──────────────┤   │
│   │  Nanang    │  IT     │ ▾ Dropdown:   │ ▾ Dropdown:  │   │
│   │            │         │  KTP-Nanang.. │  NPWP-Nana.. │   │
│   │            │         │  KTP-Hanif..  │  NPWP-Hani.. │   │
│   │  Hanif     │  HR     │  KTP-Hanif..  │  NPWP-Hani.. │   │
│   └────────────┴─────────┴───────────────┴──────────────┘   │
│   Dropdown per kolom difilter otomatis berdasarkan prefix:   │
│   - Kolom "File KTP" → hanya file ber-prefix "KTP - ..."    │
│   - Kolom "File NPWP" → hanya file ber-prefix "NPWP - ..."  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   STEP 3: Upload Excel → Validate → Import                   │
│   ┌──────────────────────────────────────────────────────┐   │
│   │  Validation Results:                                 │   │
│   │  ✅ Nanang → KTP matched → NPWP matched             │   │
│   │  ✅ Hanif  → KTP matched → NPWP matched             │   │
│   │  ⚠️ IJAZAH-Nanang.pdf → tidak di-mapping (skip)     │   │
│   │  ⚠️ FOTO-Hanif.png → tidak di-mapping (skip)        │   │
│   │                                                      │   │
│   │  🗑️ 2 file tidak terpakai → akan dihapus otomatis   │   │
│   │  [Confirm & Import]                                  │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Aturan & Batasan

### 4.1 Format Nama File di ZIP

```
{TIPE_DOKUMEN} - {NAMA_LENGKAP_PEGAWAI}.{ext}
```

| Contoh Nama File | Tipe | Pegawai |
|---|---|---|
| `KTP - Nanang Aditya Sutahar.pdf` | KTP | Nanang Aditya Sutahar |
| `NPWP - Hanif Arya.pdf` | NPWP | Hanif Arya |
| `IJAZAH - Citra Dewi.jpg` | Ijazah | Citra Dewi |
| `FOTO - Nanang Aditya Sutahar.png` | Foto Profil | Nanang Aditya Sutahar |

> **Catatan**: Jika ada nama pegawai yang sama, bisa ditambah identifier.  
> Contoh: `KTP - Andi Pratama (EMP-001).pdf`

### 4.2 Tipe Dokumen yang Didukung

| Kode Prefix | Nama Dokumen | Wajib? | Kolom di Excel |
|---|---|---|---|
| `KTP` | Kartu Tanda Penduduk | ✅ Ya | `File KTP` |
| `NPWP` | Nomor Pokok Wajib Pajak | ❌ Opsional | `File NPWP` |
| `IJAZAH` | Ijazah Terakhir | ❌ Opsional | `File Ijazah` |
| `FOTO` | Foto Profil | ❌ Opsional | `File Foto` |
| `KK` | Kartu Keluarga | ❌ Opsional | `File KK` |
| `SERTIFIKAT` | Sertifikat/Lisensi | ❌ Opsional | `File Sertifikat` |
| `BPJS-KES` | Kartu BPJS Kesehatan | ❌ Opsional | `File BPJS Kes` |
| `BPJS-TK` | Kartu BPJS Ketenagakerjaan | ❌ Opsional | `File BPJS TK` |
| `REKENING` | Buku Rekening/Cover | ❌ Opsional | `File Rekening` |

> Tipe dokumen bisa ditambah sesuai kebutuhan perusahaan.

### 4.3 Format File yang Diterima

- **Gambar**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **Dokumen**: `.pdf`
- **Max per file**: 5 MB
- **Max total ZIP**: 200 MB

### 4.4 Temporary Storage

- File dari ZIP disimpan di **temporary storage** dengan session ID
- **Expiry**: 24 jam sejak upload (jika belum di-import, otomatis dihapus)
- Setelah import berhasil, file dipindah ke **permanent storage** (di-assign ke masing-masing pegawai)
- File yang **tidak ter-mapping** di Excel → otomatis dihapus setelah import selesai

---

## 5. Detail per Step

### Step 1: Upload ZIP

**UI Components:**
- Drag & drop zone untuk file ZIP
- Progress bar upload
- Setelah extract: tampilkan daftar file yang berhasil di-extract
- Validasi saat extract:
  - ✅ File format valid (pdf/jpg/png/webp)
  - ⚠️ File tidak sesuai naming convention → warning, tetap disimpan tapi ditandai
  - ❌ File corrupt / tidak bisa dibaca → error, di-skip
  - ❌ File melebihi max size → error, di-skip

**Hasil Extract Preview:**
```
┌───────────────────────────────────────────────────────────┐
│  📦 dokumen_pegawai.zip — 6 files extracted               │
├────┬──────────────────────────────────┬───────┬───────────┤
│ No │ Nama File                        │ Tipe  │ Status    │
├────┼──────────────────────────────────┼───────┼───────────┤
│ 1  │ KTP - Nanang Aditya Sutahar.pdf  │ KTP   │ ✅ Valid  │
│ 2  │ KTP - Hanif Arya.jpg             │ KTP   │ ✅ Valid  │
│ 3  │ NPWP - Nanang Aditya Sutahar.pdf │ NPWP  │ ✅ Valid  │
│ 4  │ NPWP - Hanif Arya.pdf            │ NPWP  │ ✅ Valid  │
│ 5  │ IJAZAH - Nanang.pdf              │ IJAZ  │ ✅ Valid  │
│ 6  │ random-document.docx             │ ???   │ ⚠️ Warn  │
└────┴──────────────────────────────────┴───────┴───────────┘
│  ✅ 5 valid files  │  ⚠️ 1 warning  │  ❌ 0 errors       │
│                                                           │
│  [Download Excel Template]  ← muncul setelah upload OK    │
└───────────────────────────────────────────────────────────┘
```

### Step 2: Download Excel Template

**Logika Generate Template:**

1. Ambil daftar file yang sudah di-extract dari Step 1
2. Kelompokkan file berdasarkan prefix (tipe dokumen)
3. Generate Excel dengan:
   - Kolom data pegawai biasa (Nama, Email, Dept, Position, dll)
   - **Kolom tambahan** per tipe dokumen (`File KTP`, `File NPWP`, dll)
   - Setiap kolom dokumen memiliki **Data Validation (Dropdown)** berisi nama file yang sesuai tipe-nya

**Contoh Excel yang di-generate:**

| Nama * | Email * | Dept * | Position * | File KTP (▾) | File NPWP (▾) | File Ijazah (▾) |
|---|---|---|---|---|---|---|
| | | | | _(dropdown)_ | _(dropdown)_ | _(dropdown)_ |

**Dropdown isi-nya:**

- `File KTP` → `KTP - Nanang Aditya Sutahar.pdf`, `KTP - Hanif Arya.jpg`
- `File NPWP` → `NPWP - Nanang Aditya Sutahar.pdf`, `NPWP - Hanif Arya.pdf`
- `File Ijazah` → `IJAZAH - Nanang.pdf`

**Implementasi Dropdown di XLSX:**
```typescript
// Menggunakan library xlsx / exceljs
// Data Validation with list type
worksheet.dataValidations.add('E2:E1000', {
  type: 'list',
  formulae: ['"KTP - Nanang.pdf,KTP - Hanif.jpg"'],
  showDropDown: true
})
```

> **Note**: Library `xlsx` (SheetJS) support Data Validation terbatas.  
> Alternatif: gunakan `exceljs` yang lebih lengkap support-nya untuk dropdown.

### Step 3: Upload Excel & Validate

**Proses Validasi:**
1. Parse Excel yang diupload
2. Untuk setiap baris:
   - Validasi data text (nama, email, dept — sama seperti import biasa)
   - Validasi kolom dokumen:
     - Apakah nama file yang dipilih ada di temporary storage?
     - Apakah file tersebut sudah dipakai pegawai lain? (1 file = 1 pegawai)
3. Tampilkan preview dengan status mapping

**Preview Validasi:**
```
┌────┬────────────────┬─────────────┬─────────────┬──────────┐
│ No │ Nama           │ KTP         │ NPWP        │ Status   │
├────┼────────────────┼─────────────┼─────────────┼──────────┤
│ 1  │ Nanang Aditya  │ ✅ Matched  │ ✅ Matched  │ ✅ Valid │
│ 2  │ Hanif Arya     │ ✅ Matched  │ ✅ Matched  │ ✅ Valid │
│ 3  │ Citra Dewi     │ ❌ No file  │ —           │ ⚠️ Warn │
└────┴────────────────┴─────────────┴─────────────┴──────────┘

📊 Summary:
  ✅ 2 pegawai fully matched
  ⚠️ 1 pegawai partial (dokumen wajib kosong)
  🗑️ 1 file tidak terpakai (IJAZAH-Nanang.pdf) → akan dihapus

[Confirm & Import]
```

**Setelah Confirm:**
1. Data text pegawai di-import ke database
2. File dokumen dipindah dari temp → permanent storage, di-assign ke pegawai
3. File yang tidak ter-mapping di Excel → **dihapus otomatis**
4. Catat di Import History

---

## 6. Integrasi dengan Fitur Existing

### 6.1 Halaman Import yang Sudah Ada

Saat ini sudah ada halaman `ImportEmployeeInformationPage` dengan 2 mode:
- `Create New` (Bulk Insert)
- `Bulk Update`

**Opsi integrasi:**

| Opsi | Deskripsi |
|---|---|
| **A. Tambah mode ke-3** | Tambah toggle `With Documents` di halaman import yang ada |
| **B. Halaman terpisah** | Buat halaman baru khusus "Import with Documents" |
| **C. Sub-step opsional** | Di halaman import existing, tambah Step 0 (Upload ZIP) yang opsional |

**Rekomendasi: Opsi C** — Tambah step opsional di awal flow existing.  
Jika user upload ZIP dulu → kolom dokumen muncul di Excel template.  
Jika user skip ZIP → flow tetap sama seperti sekarang (text only).

### 6.2 Document Center

File yang sudah di-import akan muncul di:
- `Document Center` → tab sesuai tipe dokumen
- `Employee Profile` → section dokumen per pegawai

### 6.3 Storage Structure

```
/storage/
  /employees/
    /{employee_id}/
      /documents/
        /ktp/
          ktp_nanang_aditya.pdf
        /npwp/
          npwp_nanang_aditya.pdf
        /ijazah/
          ijazah_nanang_aditya.pdf
  /temp/
    /{session_id}/         ← temporary, 24h expiry
      KTP - Nanang Aditya.pdf
      NPWP - Nanang Aditya.pdf
      ...
```

---

## 7. Komponen UI yang Dibutuhkan

| Komponen | Deskripsi | Status |
|---|---|---|
| `ZipUploadDropzone` | Drag & drop zone khusus file ZIP | 🆕 Baru |
| `ExtractedFilePreview` | Tabel preview file yang di-extract dari ZIP | 🆕 Baru |
| `DocumentMappingPreview` | Preview hasil mapping file ↔ pegawai | 🆕 Baru |
| `FileUploader` | Generic file upload component | ✅ Sudah ada |
| `ImportPreviewTable` | Tabel preview data import | ✅ Sudah ada (perlu extend) |
| `ValidationSummaryCard` | Kartu ringkasan validasi | ✅ Sudah ada (perlu extend) |

---

## 8. Pertimbangan Teknis

### 8.1 Library

| Kebutuhan | Library | Catatan |
|---|---|---|
| Extract ZIP di browser | `jszip` | Parse ZIP file client-side |
| Generate Excel + Dropdown | `exceljs` | Lebih lengkap dari `xlsx` untuk Data Validation |
| Parse Excel upload | `xlsx` (SheetJS) | Sudah dipakai di project |
| File storage temp | Browser `IndexedDB` / Memory | Untuk FE-only demo |

### 8.2 Ukuran & Performa

- ZIP di-extract di **client-side** (browser) menggunakan `jszip`
- File disimpan di memory/IndexedDB selama session
- Untuk production (BE): file dikirim ke server, disimpan di S3/cloud storage

### 8.3 Edge Cases

| Case | Handling |
|---|---|
| Nama pegawai sama | Tambah identifier di nama file: `KTP - Andi Pratama (EMP-001).pdf` |
| File duplikat di ZIP | Warning, ambil yang terakhir |
| 1 file di-assign ke 2 pegawai | ❌ Error — 1 file hanya bisa di-assign ke 1 pegawai |
| Kolom dokumen kosong di Excel | ⚠️ Warning jika dokumen wajib, skip jika opsional |
| ZIP berisi subfolder | Flatten — ambil semua file dari semua level folder |
| File tanpa prefix valid | Masuk ke kategori "Uncategorized", tetap bisa di-mapping manual |
| User refresh halaman setelah Step 1 | Data hilang (FE-only) / Tetap ada jika pakai IndexedDB |

---

## 9. Milestone Implementasi

### Phase 1: Core Flow (FE Only)
- [ ] Install `jszip` dan setup
- [ ] Buat `ZipUploadDropzone` component
- [ ] Buat `ExtractedFilePreview` component  
- [ ] Extend Excel template generator → tambah kolom dokumen + dropdown
- [ ] Extend Excel parser → baca kolom dokumen
- [ ] Buat `DocumentMappingPreview` component
- [ ] Integrasikan ke halaman import existing (Opsi C: sub-step opsional)
- [ ] Auto-cleanup file yang tidak ter-mapping

### Phase 2: Polish & UX
- [ ] Progress bar saat extract ZIP
- [ ] Thumbnail preview untuk file gambar
- [ ] Drag & drop reorder/reassign di preview
- [ ] Batch download summary report (PDF)
- [ ] Import History mencatat dokumen yang di-attach

### Phase 3: Backend Integration (Future)
- [ ] API endpoint untuk upload ZIP ke server
- [ ] Temporary storage di S3 dengan TTL 24h
- [ ] API endpoint untuk assign dokumen ke pegawai
- [ ] Webhook/notification setelah import selesai

---

## 10. Keputusan yang Perlu Diambil

| # | Keputusan | Opsi | Status |
|---|---|---|---|
| 1 | Format nama file di ZIP | `{TIPE} - {NAMA}.ext` vs `{TIPE} - {EMP_ID}.ext` | ⏳ Belum diputuskan |
| 2 | Tipe dokumen yang wajib | Hanya KTP? Atau KTP + NPWP? | ⏳ Belum diputuskan |
| 3 | Integrasi ke halaman existing | Opsi A / B / C (rekomendasi C) | ⏳ Belum diputuskan |
| 4 | Library Excel | Tetap `xlsx` atau migrasi ke `exceljs` | ⏳ Belum diputuskan |
| 5 | Temporary storage (FE) | Memory vs IndexedDB | ⏳ Belum diputuskan |
| 6 | Max file size per dokumen | 5 MB? 10 MB? | ⏳ Belum diputuskan |
| 7 | Max total ZIP size | 100 MB? 200 MB? | ⏳ Belum diputuskan |

---

> **Next Step**: Setelah keputusan di atas diambil, lanjut ke implementasi Phase 1.
