# Kukusyuk: CampusFit — Modul Autentikasi & Portal Administrator Membership VIP

Website katering makanan kukus sehat kampus dengan autentikasi lengkap, alur pendaftaran VIP Member, dan portal monitoring dashboard khusus Administrator berbasis **React (Vite)**, **Tailwind CSS**, **Lucide React**, dan **Supabase**.

---

## 🔐 Kredensial Akses Administrator Resmi

- **URL Halaman Login Admin**: `/admin/login`
- **Tombol Pintas Publik**: Floating button *"Admin Panel"* dengan ikon gembok/shield di **pojok kanan bawah** halaman Login/Register (`fixed bottom-4 right-4 z-50`).
- **Email Resmi**: `fanshans99@gmail.com`
- **Password Resmi**: `KingBalakung77`
- **Validasi Keamanan Khusus**:
  - Hanya email `fanshans99@gmail.com` yang diizinkan masuk ke portal admin. Jika ada email lain mencoba login, sistem menolak dengan pesan: *"Akses Ditolak: Hanya email Admin resmi yang diizinkan masuk."*
  - Dashboard `/admin/dashboard` terproteksi penuh; jika sesi belum terotentikasi sebagai Admin, otomatis dialihkan kembali ke `/admin/login`.

---

## 📊 Fitur Dashboard Monitoring Admin (`/admin/dashboard`)

1. **Kartu Ringkasan Statistik (Summary Cards)**:
   - **Total Pelanggan Terdaftar**: Jumlah data akun/pelanggan di tabel `profiles`.
   - **Total Member VIP Aktif**: Jumlah pelanggan dengan status `approved` (`is_vip = true`).
   - **Menunggu Konfirmasi (Waiting)**: Pengajuan yang memerlukan verifikasi bukti transfer (`waiting_confirmation`).
   - **Total Pendapatan VIP**: Akumulasi nominal rupiah pembayaran yang telah disetujui.

2. **Pencarian & Multi-Filter**:
   - Kolom pencarian instan berdasarkan **Nama Lengkap**, **Email**, atau **Nomor WhatsApp**.
   - Tab Filter Status Transaksi: *Semua*, *Menunggu Konfirmasi (Waiting)*, *VIP Aktif (Approved)*, dan *Ditolak (Rejected)*.
   - Filter Kategori Pekerjaan: *Mahasiswa, Dosen, Kantoran, Buruh, Wirausaha, Masyarakat Umum*.

3. **Tabel Data Monitoring Pelanggan & Transaksi VIP**:
   - Tanggal pendaftaran & jam transaksi.
   - Data lengkap pemohon (Nama, Email aktif, Pekerjaan).
   - Nomor WhatsApp (+62) dengan tombol klik langsung membuka obrolan ke WhatsApp pelanggan (`https://wa.me/...`).
   - Rincian kode promo (apakah menggunakan `AJAKTEMANDAPATDISKON` / `CAMPUSFIT` Rp 50.000 atau Normal Rp 60.000).
   - Tombol **"Lihat Bukti"** yang membuka modal preview struk QRIS beresolusi tinggi menggunakan `createSignedUrl` Supabase Storage bucket `'payment-proofs'`.
   - Tombol Aksi:
     - **"Setujui (Approve)"**: Memanggil RPC `admin_approve_vip` untuk mengaktifkan status VIP.
     - **"Tolak (Reject)"**: Menolak pengajuan dengan dialog input alasan penolakan.

4. **Navigasi Bersih Tanpa Banner Demo**:
   - Seluruh banner demo/simulasi di bagian atas layar telah dihapus secara permanen.
   - Tampilan bersih dengan latar belakang foto lokal `/bg-auth.jpg` dan logo asli `/logo-kukusyuk.png`.

---

## 🚀 Cara Menjalankan

```bash
npm run dev
```

Buka `http