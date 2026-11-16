import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  RotateCw, 
  Crown, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  ExternalLink,
  Sparkles,
  User,
  Phone,
  Mail,
  Briefcase,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase, VipSubscription } from '../lib/supabaseClient';

export const PaymentWaitingPage: React.FC = () => {
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState<VipSubscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState<boolean>(false);

  // Fetch current user's subscription
  const fetchStatus = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const { data, error } = await supabase.rpc('get_my_vip_subscription');
      if (data) {
        setSubscription(data as VipSubscription);

        // If approved and confetti not yet triggered
        if (data.status === 'approved' && !hasTriggeredConfetti) {
          setHasTriggeredConfetti(true);
          try {
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Auto-poll status every 4 seconds so when Admin approves on `/admin/approvals`,
    // this page instantly reflects the APPROVED status!
    const interval = setInterval(() => {
      fetchStatus(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [hasTriggeredConfetti]);

  // WhatsApp quick confirmation message
  const getWhatsAppMessage = () => {
    const id = subscription?.id || 'VIP-202611-BARU';
    const name = subscription?.full_name || 'Member';
    const amount = (subscription?.amount || 60000).toLocaleString('id-ID');
    return `Halo%20Admin%20Kukusyuk-CampusFit,%20saya%20(${name})%20sudah%20melakukan%20pembayaran%20VIP%20Member%20sebesar%20Rp${amount}%20dengan%20ID%20${id}.%20Mohon%20bantuannya%20untuk%20verifikasi.%20Terima%20kasih!`;
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

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-9 shadow-2xl border border-white/50 my-6 animate-fadeIn">
        <div className="text-center mb-6">
          <Logo size="sm" className="mx-auto mb-2" />
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* CASE 1: PENDING (MENUNGGU VERIFIKASI ADMIN)                           */}
        {/* --------------------------------------------------------------------- */}
        {(!subscription || subscription.status === 'pending') && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-100/90 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-300 shadow-md">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-900 border border-amber-500/40 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Status: Menunggu Konfirmasi Admin</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Bukti Pembayaran Sedang Diverifikasi
              </h1>
              <p className="text-xs sm:text-sm text-gray-700 mt-2 max-w-md mx-auto leading-relaxed">
                Terima kasih! Bukti transfer Anda telah diterima sistem. Tim admin Kukusyuk akan memvalidasi keaslian mutasi QRIS Anda dalam 5–15 menit.
              </p>
            </div>

            {/* Stepper Timeline */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/70">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="space-y-1">
                  <div className="w-7 h-7 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    ✓
                  </div>
                  <span className="font-bold text-gray-900 block">Form &amp; Bukti</span>
                  <span className="text-[10px] text-emerald-800 font-medium">Terkirim</span>
                </div>

                <div className="space-y-1">
                  <div className="w-7 h-7 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm animate-pulse">
                    2
                  </div>
                  <span className="font-bold text-gray-900 block">Verifikasi</span>
                  <span className="text-[10px] text-amber-800 font-medium">Sedang Dicek</span>
                </div>

                <div className="space-y-1">
                  <div className="w-7 h-7 mx-auto rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <span className="font-medium text-gray-500 block">Aktivasi VIP</span>
                  <span className="text-[10px] text-gray-400">Menunggu</span>
                </div>
              </div>
            </div>

            {/* Transaction Details Box */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/80 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">ID Pengajuan:</span>
                <span className="font-mono font-bold text-gray-900">
                  {subscription?.id || 'VIP-202611-PROSES'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Nama Lengkap:</span>
                <span className="font-bold text-gray-900">{subscription?.full_name || 'Budi Santoso'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">No. WhatsApp:</span>
                <span className="font-bold text-emerald-900">{subscription?.phone_number || '+6281234567890'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Alamat Email:</span>
                <span className="font-medium text-gray-800">{subscription?.active_email || 'mahasiswa@campusfit.id'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Kode Promo:</span>
                <span className="font-bold text-emerald-800">
                  {subscription?.promo_code || 'Tanpa Promo'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-700 font-bold">Total Pembayaran:</span>
                <span className="text-base font-extrabold text-emerald-950">
                  Rp {(subscription?.amount || 60000).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* WhatsApp Fast Track Button */}
              <a
                href={`https://wa.me/6285640743918?text=${getWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl py-3.5 px-4 shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Hubungi Admin via WhatsApp untuk Percepat Verifikasi</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => fetchStatus(true)}
                disabled={isRefreshing}
                className="w-full bg-white/70 hover:bg-white text-gray-800 font-semibold text-xs sm:text-sm rounded-xl py-3 px-4 border border-gray-300 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Memeriksa Status...' : 'Perbarui Status Pembayaran'}</span>
              </button>
            </div>

          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* CASE 2: APPROVED (PEMBAYARAN DISETUJUI / VIP AKTIF)                    */}
        {/* --------------------------------------------------------------------- */}
        {subscription && subscription.status === 'approved' && (
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
              <Crown className="w-10 h-10 fill-current text-amber-300" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-900 border border-emerald-500/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Selamat! VIP Membership Anda Telah Aktif</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Selamat Bergabung, VIP Member!
            </h1>
            <p className="text-xs sm:text-sm text-gray-700 max-w-md mx-auto leading-relaxed">
              Pembayaran Anda telah diverifikasi oleh tim admin Kukusyuk. Seluruh keuntungan diskon katering harian, gratis ongkir, dan konsultasi kalori siap Anda nikmati.
            </p>

            {/* Digital VIP Membership Card */}
            <div className="w-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950 rounded-2xl p-6 text-white text-left shadow-2xl border border-amber-400/30 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-15 transform translate-x-6 -translate-y-6">
                <Crown className="w-48 h-48 text-amber-400" />
              </div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-amber-400">
                    KUKUSYUK CAMPUSFIT
                  </span>
                  <h3 className="text-xl font-black text-white">VIP HEALTHY PASS</h3>
                </div>
                <div className="bg-amber-400 text-zinc-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-current" />
                  <span>ACTIVE VIP</span>
                </div>
              </div>

              <div className="space-y-1 relative z-10 mb-6">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Nama Member
                </span>
                <p className="text-lg font-bold text-white tracking-wide">
                  {subscription.full_name}
                </p>
                <p className="text-xs text-emerald-400 font-mono">
                  ID: {subscription.id}
                </p>
              </div>

              <div className="flex justify-between items-end text-[11px] text-gray-300 pt-3 border-t border-white/10 relative z-10">
                <div>
                  <span className="block text-gray-400 text-[10px]">Masa Berlaku</span>
                  <span className="font-semibold text-white">30 Hari Kedepan</span>
                </div>
                <div className="text-right">
                  <span className="block text-gray-400 text-[10px]">Benefit</span>
                  <span className="font-semibold text-amber-300">Free Ongkir &amp; Diskon 25%</span>
                </div>
              </div>
            </div>

            {/* Action to Start Ordering */}
            <div className="pt-2">
              <button
                onClick={() => navigate('/introduction')}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base rounded-2xl py-4 px-6 shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Mulai Nikmati Manfaat VIP Member</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* CASE 3: REJECTED (PEMBAYARAN DITOLAK)                                 */}
        {/* --------------------------------------------------------------------- */}
        {subscription && subscription.status === 'rejected' && (
          <div className="space-y-6 text-center animate-shake">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-300 shadow-md">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-900 border border-red-500/40">
              <span>Status: Verifikasi Gagal / Ditolak</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Bukti Pembayaran Belum Dapat Diterima
            </h1>

            <div className="bg-red-50/90 border border-red-300 text-red-900 text-xs sm:text-sm rounded-2xl p-4 text-left">
              <strong>Alasan Penolakan dari Admin:</strong>
              <p className="mt-1 text-red-800">
                "{subscription.rejection_reason || 'Bukti transfer tidak terbaca jelas atau nominal transfer tidak sesuai dengan total tagihan.'}"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate('/payment')}
                className="w-full sm:w-1/2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm rounded-xl py-3.5 px-4 shadow-md transition cursor-pointer"
              >
                Unggah Ulang Bukti Pembayaran
              </button>

              <a
                href={`https://wa.me/6285640743918?text=Halo%20Admin%20Kukusyuk-CampusFit,%20pengajuan%20VIP%20saya%20dengan%20ID%20${subscription.id}%20ditolak.%20Mohon%20bantuannya.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-1/2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl py-3.5 px-4 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Admin WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

