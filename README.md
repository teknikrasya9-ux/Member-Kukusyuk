# Kukusyuk: CampusFit — Modul Autentikasi & Alur Pendaftaran VIP Member

Website katering makanan kukus sehat kampus dengan autentikasi lengkap dan alur pendaftaran VIP Member berbasis **React (Vite)**, **Tailwind CSS**, **Lucide React**, dan **Supabase Auth** dengan estetika **Glassmorphism**.

---

## 🛡️ Keamanan: Server-Side PostgreSQL RPC & RLS

Untuk mencegah manipulasi harga dari sisi client (browser devtools) serta mencegah SQL Injection pada tabel sensitif, aplikasi **TIDAK melakukan query `.select()` langsung ke `promo_codes`** atau **`.insert()` langsung ke `vip_subscriptions`**.

Semua operasi sensitif dijalankan melalui fungsi PostgreSQL Stored Procedures (`supabase.rpc`):
1. `supabase.rpc('verify_promo_code', { input_code: 'CAMPUSFIT' })`:
   - Memvalidasi keabsahan kode promo di server.
   - Mengembalikan `discount` (Rp 10.000) dan `final_price` (Rp 50.000).
2. `supabase.rpc('submit_vip_subscription', { ... })`:
   - Menerima data diri pemohon, nominal, dan bukti transfer.
   - Menyimpan pengajuan dengan status awal `pending`.
3. `supabase.rpc('get_my_vip_subscription')`:
   - Mengambil status verifikasi pengajuan terkini pengguna.
4. `supabase.rpc('get_all_vip_subscriptions')`:
   - Khusus portal admin untuk memantau semua pengajuan.
5. `supabase.rpc('approve_vip_subscription', { p_subscription_id })`:
   - Mengubah status menjadi `approved` dan mengaktifkan status `is_vip = true`.
6. `supabase.rpc('reject_vip_subscription', { p_subscription_id, p_rejection_reason })`:
   - Menolak pengajuan dengan alasan jelas.

---

## 🧭 Halaman & Alur Pengguna (User Flow)

### 1. Halaman Autentikasi (`/`)
- Desain Glassmorphism Frosted Glass (`backdrop-blur-md bg-white/40`).
- Konsistensi Logo Kukusyuk di posisi atas tengah (Login & Register).
- Kontras warna tinggi (`text-emerald-900`) untuk link navigasi.
- Modal Reset Password 2-tahap, Modal OTP 6-Digit (*auto-focus & paste*), dan Modal Interseptor No. WhatsApp (+62).
- Redirect otomatis ke `/introduction` setelah login jika pengguna belum menjadi VIP.

### 2. Halaman Penawaran VIP Membership (`/introduction`)
- Menampilkan penawaran **VIP Membership Kukusyuk: CampusFit** seharga **Rp 60.000/bulan** (bisa menjadi Rp 50.000 dengan kode promo).
- Manfaat eksklusif: Diskon 25%, Gratis Ongkir ke seluruh area kampus/kantor, Custom kalori, Slot prioritas jam makan siang, Poin ganda, dan grup komunitas sehat.
- Target persona: Mahasiswa, Dosen, Pekerja Kantoran, dan Umum.
- Tombol CTA: **"Join Sekarang — Rp 60.000"** menuju `/payment`.

### 3. Halaman Form Pembayaran, Kode Promo & QRIS (`/payment`)
- Layout tersusun dari atas ke bawah:
  - **A. Form Konfirmasi Data Diri**: Auto-fill dari profil (`full_name`, `phone_number` (+628...), `active_email`, `job_status`).
  - **B. Kotak Kode Promo & Tombol Chat Admin**:
    - Input kode promo + tombol **"Terapkan"** via RPC `verify_promo_code`.
    - Tombol WhatsApp: **"Chat Admin untuk Dapatkan Kode Promo"** mengarah ke WA resmi `6285640743918`.
  - **C. Rincian Pembayaran & QRIS Statis**:
    - Perhitungan otomatis: Rp 60.000 - Diskon Promo = Rp 50.000 (atau Rp 60.000).
    - Tampilan grafis QRIS resmi Kukusyuk (NMID: ID1020261109418) + tombol salin nominal.
  - **D. Unggah Bukti Pembayaran & Submit**:
    - Dropzone upload struk transfer (JPG/PNG maks 5MB) dengan image preview.
    - Submit via RPC `submit_vip_subscription` -> Langsung dialihkan ke `/payment/waiting`.

### 4. Halaman Menunggu Verifikasi (`/payment/waiting`)
- Menampilkan status *"Menunggu Konfirmasi Admin"* dengan indikator denyut (*pulse*).
- Rincian pengajuan lengkap (ID, Nama, No. WA, Email, Promo, Nominal).
- Tombol WhatsApp untuk percepat verifikasi ke Admin.
- Real-time auto-polling: Ketika admin menyetujui di `/admin/approvals`, halaman ini otomatis berubah menjadi **VIP Aktif**, memicu selebrasi *confetti*, dan menampilkan **Kartu Member Digital VIP Kukusyuk**.

### 5. Portal Admin Persetujuan (`/admin/approvals`)
- Statistik: Total Pengajuan, Pending, Approved, dan Total Omzet.
- Filter tab: *Semua*, *Pending*, *Approved*, *Rejected*.
- Tabel pengajuan lengkap dengan thumbnail bukti transfer (klik untuk zoom lightbox).
- Aksi: Tombol hijau **"Setujui"** (RPC `approve_vip_subscription`) dan tombol merah **"Tolak"** dengan dialog alasan penolakan.
- Tombol *"Tambah Simulasi Pengajuan"* untuk mempermudah evaluasi berkali-kali.

---

## 🚀 Cara Menjalankan

```bash
npm run dev
```

Buka browser di `http://localhost:5173`.

### Kode Promo untuk Pengujian:
- `CAMPUSFIT` (Potongan Rp 10.000 -> Total Bayar Rp 50.000)
- `KUKUSSEHAT` (Potongan Rp 10.000 -> Total Bayar Rp 50.000)
- `MEMBERHEMAT` (Potongan Rp 10.000 -> Total Bayar Rp 50.000)
