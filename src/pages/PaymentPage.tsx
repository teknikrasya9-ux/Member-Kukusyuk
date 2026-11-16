import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Tag, 
  MessageCircle, 
  QrCode, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Copy, 
  Download, 
  Sparkles,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State: Data Diri
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeEmail, setActiveEmail] = useState('');
  const [jobStatus, setJobStatus] = useState('Mahasiswa');

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number>(60000);
  const [promoStatus, setPromoStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [promoMessage, setPromoMessage] = useState<string>('');
  const [isCheckingPromo, setIsCheckingPromo] = useState<boolean>(false);

  // Payment Proof Upload State
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedAmount, setCopiedAmount] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill from active user session
  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const u = userData.user;
        const meta = u.user_metadata || {};
        const name = meta.full_name || `${meta.first_name || ''} ${meta.surname || ''}`.trim();
        setFullName(name || 'Budi Santoso');
        
        let phone = meta.phone_number || '';
        if (phone && !phone.startsWith('+62')) {
          phone = phone.startsWith('0') ? `+62${phone.substring(1)}` : `+62${phone}`;
        }
        setPhoneNumber(phone || '+6281234567890');
        setActiveEmail(u.email || 'mahasiswa@campusfit.id');
        setJobStatus(meta.job_status || 'Mahasiswa');
      } else {
        // Default sample values for easy testing
        setFullName('Budi Santoso');
        setPhoneNumber('+6281234567890');
        setActiveEmail('mahasiswa@campusfit.id');
        setJobStatus('Mahasiswa');
      }
    };
    loadUserProfile();
  }, []);

  // --------------------------------------------------------------------------
  // LOGIKA RPC: VALIDASI KODE PROMO (verify_promo_code)
  // --------------------------------------------------------------------------
  const handleCheckPromo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const inputCode = promoInput.trim().toUpperCase();

    if (!inputCode) {
      setPromoStatus('invalid');
      setPromoMessage('Masukkan kode promo terlebih dahulu.');
      return;
    }

    setIsCheckingPromo(true);
    setPromoMessage('');

    try {
      const { data, error } = await supabase.rpc('verify_promo_code', {
        input_code: inputCode,
      });

      if (error || !data || data.length === 0) {
        setPromoStatus('invalid');
        setPromoMessage('Gagal memvalidasi kode promo.');
        return;
      }

      const result = data[0];
      if (result.is_valid) {
        setDiscount(result.discount);          // Potongan Rp 10.000
        setFinalPrice(result.final_price);     // Berubah menjadi Rp 50.000
        setAppliedPromo(inputCode);
        setPromoStatus('valid');
        setPromoMessage(result.message);
      } else {
        setDiscount(0);
        setFinalPrice(60000);                  // Tetap Rp 60.000
        setAppliedPromo(null);
        setPromoStatus('invalid');
        setPromoMessage(result.message);
      }
    } catch (err: any) {
      setPromoStatus('invalid');
      setPromoMessage(err?.message || 'Terjadi kesalahan sistem saat memeriksa promo.');
    } finally {
      setIsCheckingPromo(false);
    }
  };

  // Handle phone change formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+62')) {
      if (val.startsWith('0')) val = '+62' + val.substring(1);
      else if (val.startsWith('62')) val = '+' + val;
      else if (val === '' || val === '+') val = '+62';
      else val = '+62' + val.replace(/\D/g, '');
    }
    setPhoneNumber(val);
  };

  // Handle file select for payment proof
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSubmitError('File bukti transfer harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Ukuran file maksimal 5MB.');
      return;
    }

    setPaymentProofFile(file);
    setSubmitError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Copy transfer amount
  const handleCopyAmount = () => {
    navigator.clipboard.writeText(finalPrice.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  // --------------------------------------------------------------------------
  // LOGIKA RPC: SUBMIT VIP SUBSCRIPTION (submit_vip_subscription)
  // --------------------------------------------------------------------------
  const handleSubmitSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation 1: Full Name
    if (!fullName.trim() || fullName.trim().length < 3) {
      setSubmitError('Nama Lengkap wajib diisi (minimal 3 karakter).');
      return;
    }

    // Validation 2: Phone Number (+628...)
    const phoneRegex = /^\+628[1-9][0-9]{7,11}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setSubmitError('Nomor WhatsApp harus berformat +628... dan valid (contoh: +628123456789).');
      return;
    }

    // Validation 3: Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(activeEmail.trim())) {
      setSubmitError('Alamat email aktif tidak valid.');
      return;
    }

    // Validation 4: Payment proof
    if (!paymentProofPreview) {
      setSubmitError('Anda wajib mengunggah foto / tangkapan layar bukti transfer pembayaran.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call server-side RPC function directly to prevent client-side price tampering
      const { data, error } = await supabase.rpc('submit_vip_subscription', {
        p_full_name: fullName.trim(),
        p_phone_number: phoneNumber.trim(),
        p_active_email: activeEmail.trim(),
        p_job_status: jobStatus,
        p_promo_code: appliedPromo,
        p_payment_proof_url: paymentProofPreview, // Base64 or uploaded URL
        p_amount: finalPrice,
      });

      if (error) throw error;

      // Successfully submitted -> Navigate to /payment/waiting
      navigate('/payment/waiting');
    } catch (err: any) {
      console.error('Error submitting subscription:', err);
      setSubmitError(err?.message || 'Gagal mengirim bukti pembayaran. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-x-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=2000&q=80"
          alt="Healthy Food Background"
          className="w-full h-full object-cover object-center filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/80" />
      </div>

      {/* Main Glassmorphism Form Container */}
      <div className="relative z-10 w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-9 shadow-2xl border border-white/50 my-6 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-7">
          <Logo size="sm" className="mx-auto mb-2" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Form Pendaftaran &amp; Pembayaran VIP
          </h1>
          <p className="text-xs sm:text-sm text-gray-700 font-medium mt-1">
            Lengkapi data diri, gunakan kode promo jika ada, lalu transfer sesuai nominal QRIS.
          </p>
        </div>

        {/* Global Error Banner */}
        {submitError && (
          <div className="mb-6 bg-red-100/95 border border-red-300 text-red-900 text-xs sm:text-sm rounded-2xl p-4 flex items-start gap-2.5 shadow-md animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">Periksa Formulir Anda:</span>
              <span>{submitError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitSubscription} className="space-y-8">
          {/* ========================================================================= */}
          {/* SECTION A: FORM KONFIRMASI DATA DIRI                                      */}
          {/* ========================================================================= */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/70 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-300/70 pb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                A
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Konfirmasi Data Diri
                </h2>
                <p className="text-[11px] text-gray-600">
                  Data otomatis terisi dari akun Anda (dapat diedit bila perlu).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* 1. Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                  Nama Lengkap <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    required
                    className="mockup-underline-input w-full pl-2 pr-7 font-medium"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute right-1 top-2.5" />
                </div>
              </div>

              {/* 2. No. WhatsApp Aktif (+628...) */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                  No. WhatsApp Aktif <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="+628123456789"
                    required
                    className="mockup-underline-input w-full pl-2 pr-7 font-medium"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-1 top-2.5" />
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Format wajib: <code className="bg-gray-200/70 px-1 py-0.2 rounded">+628...</code>
                </span>
              </div>

              {/* 3. Alamat Email Aktif */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                  Alamat Email Aktif <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={activeEmail}
                    onChange={(e) => setActiveEmail(e.target.value)}
                    placeholder="nama@campusfit.id"
                    required
                    className="mockup-underline-input w-full pl-2 pr-7 font-medium"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute right-1 top-2.5" />
                </div>
              </div>

              {/* 4. Status Pekerjaan (Dropdown) */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                  Status Pekerjaan <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <select
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value)}
                    className="mockup-underline-input w-full pr-8 bg-transparent font-medium cursor-pointer"
                  >
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Dosen">Dosen</option>
                    <option value="Kantoran">Kantoran</option>
                    <option value="Buruh">Buruh</option>
                    <option value="Wirausaha">Wirausaha</option>
                    <option value="Masyarakat Umum">Masyarakat Umum</option>
                  </select>
                  <Briefcase className="w-4 h-4 text-gray-400 absolute right-1 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION B: KOTAK KODE PROMO & TOMBOL CHAT ADMIN                          */}
          {/* ========================================================================= */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/70 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 border-b border-gray-300/70 pb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                B
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Punya Kode Promo?
                </h2>
                <p className="text-[11px] text-gray-600">
                  Terapkan kode promo terlebih dahulu sebelum mentransfer dana.
                </p>
              </div>
            </div>

            {/* Input Promo & Tombol Terapkan */}
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value.toUpperCase());
                      setPromoStatus('idle');
                    }}
                    placeholder="Masukkan Kode Promo (e.g. CAMPUSFIT)"
                    className="mockup-underline-input w-full uppercase tracking-wider font-bold text-gray-900 pl-2 pr-7 placeholder:normal-case placeholder:font-normal"
                  />
                  <Tag className="w-4 h-4 text-gray-400 absolute right-1 top-2.5" />
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckPromo()}
                  disabled={isCheckingPromo || !promoInput.trim()}
                  className="bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {isCheckingPromo ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Terapkan</span>
                  )}
                </button>
              </div>

              {/* Promo Result Message */}
              {promoStatus === 'valid' && (
                <div className="mt-2 text-xs font-semibold text-emerald-900 bg-emerald-100/90 border border-emerald-300 p-2.5 rounded-xl flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{promoMessage}</span>
                </div>
              )}

              {promoStatus === 'invalid' && (
                <div className="mt-2 text-xs font-semibold text-red-900 bg-red-100/90 border border-red-300 p-2.5 rounded-xl flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{promoMessage}</span>
                </div>
              )}
            </div>

            {/* Tombol WhatsApp: "Chat Admin untuk Dapatkan Kode Promo" */}
            <div className="pt-2 border-t border-gray-200/70">
              <a
                href="https://wa.me/6285640743918?text=Halo%20Admin%20Kukusyuk-CampusFit,%20saya%20ingin%20tanya%20syarat%20mendapatkan%20kode%20promo%20VIP%20Member"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-900 hover:text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200/80 border border-emerald-300 px-3.5 py-2 rounded-xl transition duration-200 cursor-pointer shadow-sm group"
              >
                <MessageCircle className="w-4 h-4 text-emerald-700 transition-transform group-hover:scale-110" />
                <span>Chat Admin untuk Dapatkan Kode Promo</span>
              </a>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION C: RINCIAN PEMBAYARAN & QRIS STATIS                              */}
          {/* ========================================================================= */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/70 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-300/70 pb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                C
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Rincian Tagihan &amp; QRIS Statis
                </h2>
                <p className="text-[11px] text-gray-600">
                  Transfer tepat nominal di bawah ini ke QRIS resmi Kukusyuk.
                </p>
              </div>
            </div>

            {/* Rincian Harga */}
            <div className="bg-white/70 rounded-xl p-4 border border-white/80 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Harga Normal VIP Member (30 Hari)</span>
                <span className="font-semibold text-gray-900">Rp 60.000</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Diskon Kode Promo ({appliedPromo})</span>
                  </span>
                  <span>- Rp {discount.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="pt-2 border-t border-gray-300/80 flex items-center justify-between text-base sm:text-lg font-extrabold text-gray-900">
                <span>Total Pembayaran</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-950 font-black">
                    Rp {finalPrice.toLocaleString('id-ID')}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAmount}
                    className="p-1 rounded-md text-gray-500 hover:text-black hover:bg-gray-200 transition"
                    title="Salin nominal transfer"
                  >
                    {copiedAmount ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* QRIS Display Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-300 shadow-md text-center">
              {/* QRIS Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                    Metode Pembayaran
                  </span>
                  <span className="font-extrabold text-sm text-gray-900">
                    QRIS Universal (Semua E-Wallet &amp; Bank)
                  </span>
                </div>
                <div className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-md tracking-wider">
                  QRIS
                </div>
              </div>

              {/* QR Image Box */}
              <div className="w-56 h-56 mx-auto bg-gray-50 border-2 border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center shadow-inner relative group">
                {/* Authentic QR Vector Graphic */}
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <rect width="200" height="200" fill="#ffffff" rx="8"/>
                  {/* Outer corner blocks */}
                  <rect x="15" y="15" width="45" height="45" fill="#18181b" rx="4"/>
                  <rect x="23" y="23" width="29" height="29" fill="#ffffff"/>
                  <rect x="29" y="29" width="17" height="17" fill="#18181b"/>

                  <rect x="140" y="15" width="45" height="45" fill="#18181b" rx="4"/>
                  <rect x="148" y="23" width="29" height="29" fill="#ffffff"/>
                  <rect x="154" y="29" width="17" height="17" fill="#18181b"/>

                  <rect x="15" y="140" width="45" height="45" fill="#18181b" rx="4"/>
                  <rect x="23" y="148" width="29" height="29" fill="#ffffff"/>
                  <rect x="29" y="154" width="17" height="17" fill="#18181b"/>

                  {/* QR Pattern dots */}
                  <rect x="70" y="20" width="12" height="12" fill="#18181b"/>
                  <rect x="90" y="20" width="12" height="12" fill="#18181b"/>
                  <rect x="110" y="20" width="12" height="12" fill="#18181b"/>

                  <rect x="70" y="40" width="12" height="12" fill="#18181b"/>
                  <rect x="100" y="40" width="12" height="12" fill="#18181b"/>

                  <rect x="20" y="70" width="12" height="12" fill="#18181b"/>
                  <rect x="40" y="70" width="12" height="12" fill="#18181b"/>
                  <rect x="70" y="70" width="12" height="12" fill="#18181b"/>
                  <rect x="90" y="70" width="12" height="12" fill="#18181b"/>
                  <rect x="120" y="70" width="12" height="12" fill="#18181b"/>
                  <rect x="150" y="70" width="12" height="12" fill="#18181b"/>
                  <rect x="170" y="70" width="12" height="12" fill="#18181b"/>

                  <rect x="30" y="90" width="12" height="12" fill="#18181b"/>
                  <rect x="60" y="90" width="12" height="12" fill="#18181b"/>
                  <rect x="100" y="90" width="12" height="12" fill="#18181b"/>
                  <rect x="140" y="90" width="12" height="12" fill="#18181b"/>
                  <rect x="170" y="90" width="12" height="12" fill="#18181b"/>

                  {/* Center Brand Badge */}
                  <circle cx="100" cy="100" r="18" fill="#10b981"/>
                  <circle cx="100" cy="100" r="15" fill="#ffffff"/>
                  <text x="100" y="104" text-anchor="middle" font-size="10" font-weight="900" fill="#047857">KY</text>

                  {/* Bottom QR dots */}
                  <rect x="70" y="120" width="12" height="12" fill="#18181b"/>
                  <rect x="100" y="120" width="12" height="12" fill="#18181b"/>
                  <rect x="130" y="120" width="12" height="12" fill="#18181b"/>
                  <rect x="160" y="120" width="12" height="12" fill="#18181b"/>

                  <rect x="70" y="140" width="12" height="12" fill="#18181b"/>
                  <rect x="90" y="140" width="12" height="12" fill="#18181b"/>
                  <rect x="120" y="140" width="12" height="12" fill="#18181b"/>
                  <rect x="150" y="140" width="12" height="12" fill="#18181b"/>

                  <rect x="70" y="165" width="12" height="12" fill="#18181b"/>
                  <rect x="100" y="165" width="12" height="12" fill="#18181b"/>
                  <rect x="130" y="165" width="12" height="12" fill="#18181b"/>
                  <rect x="170" y="165" width="12" height="12" fill="#18181b"/>
                </svg>
              </div>

              <div className="mt-3">
                <span className="font-extrabold text-sm text-gray-900 block">
                  NMID: ID1020261109418
                </span>
                <span className="text-xs text-gray-600 block">
                  A.N. KUKUSYUK CAMPUSFIT OFFICIAL
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                  Dukung: GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI, BNI &amp; Livin
                </span>
              </div>

              {/* Warning Notice */}
              <div className="mt-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs p-3 rounded-xl text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>PENTING:</strong> Pastikan nominal yang Anda transfer persis{' '}
                  <strong className="underline font-bold text-amber-950">
                    Rp {finalPrice.toLocaleString('id-ID')}
                  </strong>{' '}
                  agar verifikasi oleh admin tidak tertunda.
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION D: UNGGAH BUKTI PEMBAYARAN & SUBMIT                              */}
          {/* ========================================================================= */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/70 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-300/70 pb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                D
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Unggah Bukti Pembayaran
                </h2>
                <p className="text-[11px] text-gray-600">
                  Kirimkan tangkapan layar struk / bukti sukses transfer QRIS.
                </p>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Dropzone area */}
            {!paymentProofPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-400 hover:border-zinc-900 bg-white/50 hover:bg-white/80 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-gray-900 block">
                  Klik untuk Memilih File atau Drag &amp; Drop Bukti Transfer
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Mendukung format JPG, PNG, WEBP (Maksimal 5MB)
                </span>
              </div>
            ) : (
              <div className="bg-white/80 rounded-2xl p-4 border border-emerald-300 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={paymentProofPreview}
                  alt="Bukti Transfer Preview"
                  className="w-24 h-28 object-cover rounded-xl shadow-md border border-gray-300 shrink-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-800 font-bold text-xs sm:text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Bukti Transfer Siap Dikirim</span>
                  </div>
                  <p className="text-xs text-gray-600 truncate max-w-xs">
                    {paymentProofFile?.name || 'struk_pembayaran_qris.jpg'}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-emerald-950 underline mt-2 hover:text-emerald-700 cursor-pointer"
                  >
                    Ganti Foto Bukti Transfer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !paymentProofPreview}
              className="w-full bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-bold text-base rounded-2xl py-4 px-6 shadow-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi &amp; Mengirim Bukti...</span>
                </>
              ) : (
                <>
                  <span>Kirim Bukti Pembayaran (Rp {finalPrice.toLocaleString('id-ID')})</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-gray-600 mt-2.5">
              🔒 Dilindungi Server-Side RPC &amp; Enkripsi Supabase. Data Anda aman.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

