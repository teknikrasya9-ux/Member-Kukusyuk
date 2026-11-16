import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  initialEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = '',
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState(initialEmail);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError('Silakan masukkan alamat email akun Anda.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError('Format email tidak valid. Periksa kembali.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(emailTrimmed);
      if (resetErr) throw resetErr;

      setSuccessNotice(`Tautan & kode konfirmasi reset sandi telah dikirim ke ${emailTrimmed}.`);
      setStep(2);
    } catch (err: any) {
      setError(err?.message || 'Gagal mengirim email reset. Pastikan email terdaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) throw updateErr;

      setSuccessNotice('Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.');
      setTimeout(() => {
        onSuccess(email);
        onClose();
        // Reset state
        setStep(1);
        setNewPassword('');
        setConfirmPassword('');
        setSuccessNotice(null);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Gagal mengubah kata sandi. Silakan coba beberapa saat lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 z-10 text-gray-900 transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-black/5 transition"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-4 shadow-sm border border-emerald-200">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          {step === 1 ? 'Reset Kata Sandi' : 'Buat Sandi Baru'}
        </h3>
        <p className="text-sm text-gray-600 mt-1 mb-5">
          {step === 1
            ? 'Masukkan email akun CampusFit Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.'
            : 'Masukkan kata sandi baru untuk akun Kukusyuk Anda.'}
        </p>


        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-100/90 border border-red-300 text-red-900 text-xs sm:text-sm rounded-xl p-3 flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {successNotice && (
          <div className="mb-4 bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs sm:text-sm rounded-xl p-3 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: Email Form */
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@campusfit.id"
                  className="mockup-underline-input w-full pl-2 pr-8"
                  autoFocus
                  required
                />
                <Mail className="w-4 h-4 text-gray-400 absolute right-1 top-2.5" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl py-3 px-4 font-medium flex items-center justify-center gap-2 shadow-md transition disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Kirim Kode / Tautan Reset</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: New Password Form */
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password Baru *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="mockup-underline-input w-full pl-2 pr-9"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-2 text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Konfirmasi Password Baru *
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="mockup-underline-input w-full pl-2 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-1 top-2 text-gray-500 hover:text-gray-800"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl py-3 font-medium transition cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl py-3 px-4 font-medium flex items-center justify-center gap-2 shadow-md transition disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Simpan Password Baru</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

