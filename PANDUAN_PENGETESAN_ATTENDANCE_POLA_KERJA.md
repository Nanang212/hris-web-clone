# Panduan Alur Pengetesan Modul Attendance: Pola Kerja Reguler & Multi-Titik Lokasi

Dokumen ini memuat panduan pengujian end-to-end fitur **Pola Kerja Personalia (Work Patterns)** dan **Lokasi Kehadiran (Attendance Locations)** yang disesuaikan untuk karakteristik operasional perusahaan outsourcing dan multi-site.

---

## 1. Konsep Dasar: Kapan Menggunakan Menu Setting vs Pola Kerja?

| Menu | Kapan Digunakan? | Siapa Penggunanya? | Contoh Aktivitas |
| :--- | :--- | :--- | :--- |
| **Attendance Settings** (`/attendance/settings`) | **Saat inisialisasi awal atau perubahan kebijakan global perusahaan.** (Jarang diubah) | Superadmin / HR Director | Menyalakan GPS Geofencing, validasi Face Recognition, jendela batas waktu absensi (window hours), dan jam auto clock-out malam. |
| **Lokasi Kehadiran** (`/attendance/locations`) | **Saat ada pendaftaran kantor baru, kontrak site klien baru, atau penugasan roaming.** | Admin Operasional / Project PIC | Menambahkan *Client Site Astra Tower* (radius 75m), paste koordinat dari WhatsApp shareloc, dan memilih karyawan yang diizinkan absen di titik tersebut. |
| **Pola Kerja Personalia** (`/attendance/work-patterns`) | **Saat onboarding karyawan baru, rotasi site penempatan, mutasi, atau perpanjangan kontrak.** (Aktivitas rutin) | HR Personalia / Site Supervisor | Menugaskan karyawan ke jadwal 5-2 (Senin–Jumat) atau 6-1 (Senin–Sabtu) dengan tanggal mulai berlaku (*Effective Date*) dan siklus hari awal (*Day _ from Work Pattern*). |

---

## 2. Alur Pengujian Step-by-Step

### Step 1: Verifikasi Kebijakan Global di Menu Setting
* **Tujuan**: Memastikan validasi lokasi GPS dan aturan absensi global aktif di sistem.
1. Buka tab menu **Settings** pada modul Attendance (`/attendance/settings`).
2. Periksa bagian **Validation Rules**:
   - Pastikan **GPS Validation** dan **Geofencing** dalam status aktif.
3. Periksa kartu **Regular Work Time**:
   - Terdapat tombol pintas: `[Kelola Pola Kerja Personalia (5-2, 6-1) →]` untuk navigasi cepat ke master pola kerja.

---

### Step 2: Daftarkan Titik Lokasi Presensi (Lampiran 3)
* **Tujuan**: Menyiapkan lokasi geofence presensi masuk/pulang, di mana 1 karyawan dapat memiliki banyak titik kehadiran.
1. Buka tab menu **Lokasi Kehadiran** (`/attendance/locations`).
2. Klik tombol **`+ Tambah Lokasi Baru`**.
3. **Uji Pengisian Cara 2 (Paste Koordinat dari WhatsApp / Google Maps)**:
   - Masukkan Nama Lokasi: `Client Site Astra Tower`.
   - Pilih tab metode *"Cara 2: Paste Koordinat (WhatsApp / Maps)"*.
   - Masukkan koordinat contoh: `-6.2053, 106.8227` lalu klik tombol **Terapkan**.
   - Titik pin point dan preview lingkaran peta interaktif akan otomatis berpindah ke lokasi tersebut.
4. **Atur Radius Geofence**:
   - Geser slider radius ke `75 Meter` (rekomendasi: 10 ~ 100 meter).
5. **Uji Multi-Titik Assignment untuk Karyawan**:
   - Pilih radio button **"Spesifik Karyawan / Site"**.
   - Centang beberapa karyawan (misal: *Andi Pratama* dan *Siti Rahmawati*).
6. Klik **`Simpan Titik Lokasi`**.
7. *(Opsional - Uji Multi Titik)*: Tambahkan lokasi kedua (misal: *Warehouse Cikarang Barat*) dan centang kembali karyawan *Siti Rahmawati*. Ini membuktikan bahwa **1 karyawan dapat memiliki lebih dari 1 titik kehadiran sekaligus**.

---

### Step 3: Daftarkan Pola Kerja Reguler Baru (Lampiran 1)
* **Tujuan**: Membuat varian jam kerja reguler (bukan sekadar jam kantor statis) untuk kebutuhan operasional site.
1. Buka tab menu **Pola Kerja** (`/attendance/work-patterns`).
2. Klik tombol **`+ Tambah Pola Kerja`**.
3. Isi informasi dasar:
   - **Nama Pola Kerja**: `Reguler 6-1 Operasional Site (Senin-Sabtu)`.
   - **Kode Pola**: `REG-6-1-SITE`.
   - **Jumlah Hari dalam Siklus**: `7` Hari (siklus mingguan Day 1 s/d Day 7).
   - **Toleransi Keterlambatan**: Centang dan masukkan `15 Menit`.
4. **Uji Fitur Ubah Massal (Bulk Apply)**:
   - Centang **Day 1 s/d Day 6** (Senin s/d Sabtu).
   - Masukkan Jam Masuk: `08:00`, Jam Pulang: `16:30`, Istirahat: `12:00 – 13:00`.
   - Klik tombol **`Apply Work Pattern`**. Jam masuk-pulang untuk Day 1 s/d Day 6 langsung terisi serentak.
5. **Ubah Hari Libur (Off)**:
   - Pada baris **Day 7 (Minggu)**, ubah dropdown tipe hari dari *Hari Kerja* menjadi **`Hari Libur (Off)`**.
6. Klik **`Simpan Perubahan`**. Pola kerja baru akan tampil di daftar kartu lengkap dengan ringkasan badge hari kerja dan jam operasional.

---

### Step 4: Pasangkan Pola Kerja ke Karyawan (Lampiran 2)
* **Tujuan**: Menugaskan jadwal reguler ke karyawan dengan tanggal mulai efektif dan pemetaan siklus hari.
1. Pada halaman **Pola Kerja Personalia**, pilih tab **`Pemasangan ke Karyawan`**.
2. Klik tombol **`+ Pasangkan Karyawan Baru`**.
3. **Pilih Metode Pemilihan**:
   - **Add by Personnel**: Pilih karyawan perorangan (mendukung pencarian dan multi-select).
   - Atau **Add by Group**: Pasangkan langsung ke seluruh tim di project penempatan tertentu.
4. **Pilih Pola Kerja**: Pilih pola kerja yang telah dibuat di Step 3 (`Reguler 6-1 Operasional Site`).
5. **Uji Auto-Calculation Siklus Hari (Day _ from Work Pattern)**:
   - Tentukan **Effective Date** (misal pilih tanggal yang jatuh pada hari **Selasa**).
   - Perhatikan kotak panduan sistem: Sistem secara otomatis menghitung dan merekomendasikan siklus kerja dimulai dari **Day 2 (Selasa)** sesuai aturan Lampiran 2.
   - Atur **End Date** (misal durasi kontrak project 1 tahun ke depan).
6. Klik **`Save Personnel (Simpan Penugasan)`**.
7. Data penugasan baru akan langsung masuk ke tabel penugasan dengan status `Active` (atau `Scheduled` jika tanggal efektif di masa depan).

---

### Step 5: Validasi Saat Absensi Harian (Clock In / Out)
* **Tujuan**: Memastikan absensi harian mengacu pada jadwal aktif dan lokasi yang diizinkan.
1. Buka halaman presensi **Clock In / Out** (`/attendance/clock-in-out`).
2. **Pengecekan Geofence GPS**:
   - Sistem GPS membandingkan koordinat perangkat karyawan dengan seluruh titik lokasi yang telah di-assign padanya di Step 2.
   - Jika karyawan berada di dalam radius salah satu titik yang diizinkan (misal di *Site Astra* atau di *Warehouse Cikarang*), status lokasi valid (*Inside Geofence Zone*).
3. **Pengecekan Waktu & Keterlambatan**:
   - Sistem mencocokkan jam absensi dengan pola kerja aktif karyawan pada hari tersebut (misal jadwal masuk 08:00 dengan toleransi 15 menit). Absensi sebelum 08:15 dinyatakan tepat waktu (*On Time*).

---

## 3. Matriks Hasil yang Diharapkan (Expected Results)

| Skenario Pengujian | Hasil yang Diharapkan |
| :--- | :--- |
| Karyawan memiliki 2 titik site (Site A & Site B) | Karyawan dapat clock-in di Site A maupun Site B tanpa ditolak sistem geofence. |
| Input koordinat via Paste dari WhatsApp / Google Maps | Koordinat langsung di-parse otomatis dan titik marker peta langsung bergeser ke posisi akurat. |
| Pemasangan pola kerja dengan effective date hari Rabu | Field *Day _ from work pattern* otomatis terisi **Day 3 (Rabu)**. |
| Karyawan berpindah site / berganti jadwal | Cukup pasangkan pola kerja baru dengan effective date baru tanpa menghapus riwayat log absensi lama. |
| Akses menu All Menus (`/attendance/all-menu`) | Kartu *Pola Kerja* dan *Lokasi Kehadiran* tampil simetris dan rapi tanpa teks meluap (*overflow*). |
