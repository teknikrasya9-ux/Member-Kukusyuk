# Kukusyuk: CampusFit — Modul Autentikasi Member

Modul autentikasi lengkap berbasis **React (Vite)**, **Tailwind CSS**, **Lucide React**, dan **Supabase Auth** dengan estetika **Glassmorphism**, sesuai diagram alir dan audit perbaikan UX.

---

## 🥗 Fitur Utama & Logika Alur (User Flow)

1. **Gaya Visual Glassmorphism Premium**:
   - Kartu frosted glass transparan (`backdrop-blur-md bg-white/40 border border-white/50 shadow-2xl rounded-3xl`).
   - Latar belakang foto makanan sehat meal-prep di atas meja kayu dengan overlay kontras tinggi.
   - Form input bergaris bawah (*underline input style*) sesuai mockup.
   - Tombol Google OAuth resmi dengan logo multi-warna + pembatas `— OR —`.

2. **Perbaikan Audit UX**:
   - **Konsistensi Logo**: Logo lingkaran Kukusyuk tampil konsisten di bagian atas tengah pada halaman **Login** maupun **Register**.
   - **Kontras Warna Tautan (High Contrast)**: Tautan *"Forgot password?"*, *"Sign Up"*, dan *"Sign in"* menggunakan warna hijau tua pekat (`text-emerald-900 hover:text-emerald-700 font-semibold underline`) agar mudah dibaca di atas kartu transparan.
   - **Penyempurnaan Teks Placeholder**:
     - Sub-judul Register diubah menjadi: *"Daftar sekarang untuk mulai hidup sehat bersama Kukusyuk"*.
     - Checkbox S&K diubah menjadi: *"I accept all Terms & Conditions"*.

3. **Komponen Layar & Modal Terpadu**:
   - **Login View ("Welcome back")**: Form login email & password dengan *eye-toggle*, *"Remember me"*, tombol submit charcoal, dan pesan error inline non-dead-end.
   - **Register View ("Sign Up")**: Grid 2-kolom persis mockup (*First Name, Surname, Email, Phone Number (+62), Password, Confirm Password*), validasi lengkap, dan checkbox S&K.
   - **Modal 1: Reset Kata Sandi (Forgot Password)**: 2 tahap (Kirim link/kode ke email & input kata sandi baru).
   - **Modal 2: Verifikasi Akun (Input OTP 6-Digit)**: 6 kotak digit *auto-focus*, *paste-support*, tombol verifikasi, dan hitung mundur 60 detik kirim ulang.
   - **Modal 3: Interseptor No. WhatsApp (+62)**: Khusus pengguna Google OAuth yang berasal dari alur checkout jika belum memiliki nomor telepon.

4. **Logika Post-Auth Redirect**:
   - **Dari Navbar / Home**: Langsung dialihkan ke `/home`.
   - **Dari Checkout (`?redirect=checkout`)**:
     - Jika sudah punya nomor WhatsApp terdaftar -> Langsung ke `/checkout`.
     - Jika belum punya nomor WhatsApp terdaftar (misal login via Google) -> Munculkan pop-up lengkapi nomor WhatsApp, simpan ke tabel `profiles` Supabase, lalu lanjut ke `/checkout`.

---

## 🛠️ Menjalankan Proyek

### 1. Jalankan Development Server
```bash
npm run dev
```

### 2. Kredensial Supabase (Opsional)
Aplikasi telah dilengkapi **Demo Mode Fallback otomatis**. Anda bisa langsung menguji seluruh interaksi form, modal OTP, dan Google OAuth tanpa konfigurasi Supabase awal.

Jika ingin menghubungkan ke database Supabase nyata, buat file `.env` di direktori utama:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Akun Pengujian Demo (Quick Test)
- **Email**: `mahasiswa@campusfit.id`
- **Password**: `password123`
- **Kode OTP Demo**: `123456`
- **Fitur Simulasi**: Terdapat bar kontrol di bagian atas layar untuk menguji simulasi alur Checkout vs Home secara langsung dengan satu klik.

