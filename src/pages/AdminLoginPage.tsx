import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase, ADMIN_EMAIL, ADMIN_PASSWORD } from '../lib/supabaseClient';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('fanshans99@gmail.com');
  const [password, setPassword] = useState('KingBalakung77');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = email.trim().toLowerCase();

    // 1. Strict validation: Only official admin email is allowed
    if (emailTrimmed !== ADMIN_EMAIL.toLowerCase()) {
      setError('Akses Ditolak: Hanya email Admin resmi yang diizinkan masuk.');
      return;
    }

    if (!password) {
      setError('Kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Authenticate using supabase.auth.signInWithPassword
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password: password,
      });

      if (authError) {
        throw authError;
      }

      if (!data.user) {
        throw new Error('Sesi admin gagal dibuat.');
      }

      // 3. Direct to Admin Dashboard
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err?.message || 'Email atau kata sandi admin tidak cocok. Periksa kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-x-hidden">
      {/* Background Image with Dark Mood Overlay */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat min-h-screen w-full"
        style={{ backgroundImage: "url('/bg-auth.jpg'), url('/images/bg-auth.jpg')" }}
      >
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm pointer-events-none" />
      </div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white animate-fadeIn">
        {/* Back Link */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Member</span>
          </button>
        </div>

        {/* Header Icon & Logo */}
        <div className="text-center mb-6">
          <img
            src="/logo-kukusyuk.png"
            alt="Logo Kukusyuk"
            className="w-16 h-16 object-contain mx-auto mb-3 rounded-full shadow-lg border border-white/20"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('/images/logo-kukusyuk.png')) {
                target.src = '/images/logo-kukusyuk.png';
              }
            }}
          />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Portal Khusus Administrator</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Sign In
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Masukkan kredensial administrator resmi Kukusyuk untuk mengelola data keanggotaan.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-5 bg-red-950/80 border border-red-500/40 text-red-200 text-xs sm:text-sm rounded-xl p-3.5 flex items-start gap-2.5 shadow-md animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1">
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
              Email Administrator
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="fanshans99@gmail.com"
                required
                className="w-full bg-white/5 border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 text-sm outline-none transition"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
              Password Administrator
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Masukkan kata sandi admin"
                required
                className="w-full bg-white/5 border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 text-sm outline-none transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 text-zinc-950 font-bold text-sm rounded-xl py-3 px-4 shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Masuk ke Dashboard Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-neutral-500">
            Halaman ini diproteksi khusus tim operasional Kukusyuk: CampusFit.
          </p>
        </div>
      </div>
    </div>
  );
};

