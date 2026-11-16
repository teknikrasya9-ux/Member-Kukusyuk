import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { 
  Crown, 
  CheckCircle2, 
  ArrowRight, 
  Truck, 
  Percent, 
  Utensils, 
  Clock, 
  Flame, 
  Users, 
  GraduationCap, 
  Briefcase, 
  Sparkles,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';

export const IntroductionPage: React.FC = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Percent,
      title: 'Diskon Spesial Harian (Up to 25%)',
      description: 'Potongan harga langsung untuk setiap menu katering kukus sehat (Steam Box, Herbal Chicken, Salad Bowl, Quinoa Rice).',
      badge: 'Hemat Tiap Hari',
    },
    {
      icon: Truck,
      title: 'Gratis Biaya Pengiriman (Free Delivery)',
      description: 'Bebas ongkos kirim ke seluruh area kampus, asrama, kos sekitar, fakultas, hingga gedung perkantoran.',
      badge: 'Bebas Ongkir',
    },
    {
      icon: Utensils,
      title: 'Custom Menu & Kalori Konsultasi',
      description: 'Bebas pilih target nutrisi (High Protein, Low Carbs, Vegetarian) dan konsultasi kebutuhan kalori harian.',
      badge: 'Personalized',
    },
    {
      icon: Clock,
      title: 'Slot Prioritas Jam Makan Siang',
      description: 'Antrean pesanan Anda diprioritaskan saat jam sibuk istirahat kuliah & kantor tanpa khawatir kehabisan kuota.',
      badge: 'Priority Rush',
    },
    {
      icon: Flame,
      title: 'Cashback CampusFit Points 2x Lipat',
      description: 'Dapatkan poin ganda pada setiap transaksi untuk ditukarkan dengan merchandise eksklusif atau voucher makan gratis.',
      badge: 'Double Rewards',
    },
    {
      icon: Users,
      title: 'Akses Komunitas Bugar & Meal-Prep Tips',
      description: 'Bergabung di grup WhatsApp eksklusif VIP bersama nutrisionis kampus untuk tips workout & pola makan sehat.',
      badge: 'VIP Community',
    },
  ];

  const personas = [
    {
      icon: GraduationCap,
      label: 'Mahasiswa',
      desc: 'Praktis, hemat waktu & biaya kos, bebas mikir makan siang di sela jam kuliah.',
    },
    {
      icon: Briefcase,
      label: 'Dosen & Tenaga Pendidik',
      desc: 'Asupan nutrisi higienis rendah kolesterol tanpa repot antar kelas dan bimbingan.',
    },
    {
      icon: Users,
      label: 'Pekerja Kantoran & Buruh',
      desc: 'Makan siang berenergi tanpa kantuk gula berlebih (sugar crash) saat jam kerja.',
    },
    {
      icon: HeartHandshake,
      label: 'Masyarakat Umum & Wirausaha',
      desc: 'Pilihan gaya hidup bersih (clean eating) untuk menjaga imun tubuh setiap hari.',
    },
  ];

  return (
    <div className="relative min-h-screen w-full pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-x-hidden">
      {/* Background with Dark Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=2000&q=80"
          alt="Healthy Food Background"
          className="w-full h-full object-cover object-center filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/75" />
      </div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-4xl glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/40 my-6 animate-fadeIn">
        {/* Header & Logo */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <Logo size="md" className="mx-auto" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-900 border border-amber-500/40 mb-3 shadow-sm">
            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
            <span>Official Program • CampusFit VIP Membership</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Tingkatkan Kebugaran Anda Bersama{' '}
            <span className="text-emerald-950 underline decoration-emerald-500 decoration-wavy decoration-2">
              VIP Member
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-800 font-medium max-w-2xl mx-auto mt-3 leading-relaxed">
            Solusi katering kukus sehat, higienis, dan ramah kantong untuk civitas akademika dan masyarakat luas. Nikmati kemudahan makan sehat tanpa repot!
          </p>
        </div>

        {/* Pricing Highlight Glass Box */}
        <div className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-6 mb-8 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Langganan 30 Hari Aktif
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Rp 60.000
              </span>
              <span className="text-sm text-gray-600 font-medium">/ bulan</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 mt-1">
              ✨ <strong className="text-emerald-900">Tips Hemat:</strong> Gunakan kode promo saat checkout untuk potongan harga menjadi <strong className="text-emerald-900">Rp 50.000</strong>!
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={() => navigate('/payment')}
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-bold text-sm sm:text-base rounded-xl px-6 py-3.5 shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Join Sekarang</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Manfaat &amp; Keuntungan Eksklusif Member VIP</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 mt-1">
              Didesain khusus untuk efisiensi waktu, kesehatan pencernaan, dan penghematan biaya bulanan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/50 hover:bg-white/70 transition-all duration-200 backdrop-blur-sm border border-white/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                        {benefit.title}
                      </h3>
                      <span className="text-[10px] font-semibold text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
                        {benefit.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Who is it for? Personas */}
        <div className="mb-10 bg-white/40 border border-white/60 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 text-center">
            Cocok untuk Siapa Saja?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {personas.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="bg-white/60 p-3.5 rounded-xl border border-white/60 text-center">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-gray-900">{p.label}</div>
                  <p className="text-[11px] text-gray-600 mt-1 leading-snug">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-700 font-medium mb-8 pb-6 border-b border-gray-400/30">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>100% Bahan Segar &amp; Higienis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Garansi Tepat Waktu Pengantaran</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Verifikasi Pembayaran Aman via QRIS</span>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/payment')}
            className="w-full sm:w-2/3 mx-auto bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-bold text-base sm:text-lg rounded-2xl py-4 px-8 shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>Join Sekarang — Rp 60.000</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-xs text-gray-600 mt-2.5">
            Punya kode promo? Masukkan di halaman berikutnya untuk potongan harga otomatis.
          </p>
        </div>
      </div>
    </div>
  );
};

