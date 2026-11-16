import React from 'react';
import { ShoppingBag, ArrowLeft, CheckCircle2, User, Phone, Mail, LogOut, UtensilsCrossed, Sparkles } from 'lucide-react';

interface DestinationViewProps {
  type: 'home' | 'checkout';
  user: any;
  onLogout: () => void;
  onBackToAuth: () => void;
}

export const DestinationViews: React.FC<DestinationViewProps> = ({
  type,
  user,
  onLogout,
  onBackToAuth,
}) => {
  const isCheckout = type === 'checkout';

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 text-neutral-100">
        {/* Top bar with back and logout */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <button
            onClick={onBackToAuth}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Autentikasi</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Sign Out)</span>
          </button>
        </div>

        {/* Destination Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            {isCheckout ? <ShoppingBag className="w-8 h-8" /> : <UtensilsCrossed className="w-8 h-8" />}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isCheckout ? 'Post-Auth Redirect: /checkout' : 'Post-Auth Redirect: /home'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isCheckout ? 'Halaman Checkout & Pembayaran' : 'Selamat Datang di Kukusyuk: CampusFit!'}
          </h1>
          <p className="text-sm text-neutral-300 mt-2 max-w-md mx-auto">
            {isCheckout
              ? 'Autentikasi dan data kontak WhatsApp Anda telah berhasil diverifikasi. Lanjutkan pemesanan menu sehat Anda.'
              : 'Akun Anda aktif. Nikmati meal prep sehat, higienis, dan terjangkau khusus mahasiswa kampus.'}
          </p>
        </div>

        {/* User Card Info */}
        <div className="bg-black/30 border border-white/10 rounded-2xl p-5 mb-6 space-y-3">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Data Profil Pengguna Aktif
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nama Pengguna</span>
              </div>
              <div className="font-semibold text-white truncate">
                {user?.user_metadata?.first_name || 'Member'} {user?.user_metadata?.surname || ''}
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>Alamat Email</span>
              </div>
              <div className="font-semibold text-white truncate">{user?.email || '-'}</div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>No. WhatsApp</span>
              </div>
              <div className="font-semibold text-emerald-400 truncate">
                {user?.user_metadata?.phone_number
                  ? user.user_metadata.phone_number.startsWith('+62')
                    ? user.user_metadata.phone_number
                    : `+62${user.user_metadata.phone_number}`
                  : 'Belum diisi'}
              </div>
            </div>
          </div>
        </div>

        {/* Sample checkout or home content */}
        {isCheckout ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="font-medium text-emerald-200">Paket Langganan 5 Hari CampusFit Steam Box</span>
              <span className="font-bold text-emerald-400">Rp 125.000</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pengiriman langsung dikonfirmasi ke WhatsApp terdaftar.</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-center text-xs sm:text-sm">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-emerald-500/40 transition">
              <div className="font-bold text-white mb-1">🥗 Menu Hari Ini</div>
              <div className="text-neutral-400 text-xs">Ayam Kukus Herbal & Quinoa Merah</div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-emerald-500/40 transition">
              <div className="font-bold text-white mb-1">⚡ CampusFit Points</div>
              <div className="text-emerald-400 font-bold">150 Poin Aktif</div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={onBackToAuth}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-3 px-4 shadow-lg transition cursor-pointer"
          >
            Uji Coba Alur Autentikasi Lagi
          </button>
        </div>
      </div>
    </div>
  );
};

