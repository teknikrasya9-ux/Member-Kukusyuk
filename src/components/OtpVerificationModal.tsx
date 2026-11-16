import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase, isUsingDemoMode } from '../lib/supabaseClient';

interface OtpVerificationModalProps {
  isOpen: boolean;
  email: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  email,
  onSuccess,
  onCancel,
}) => {
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resending OTP
  useEffect(() => {
    let timer: any;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  // Focus first input on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
      setOtpDigits(['', '', '', '', '', '']);
      setError(null);
      setIsSuccess(false);
      setCountdown(60);
      setCanResend(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric value
    const cleanValue = value.replace(/\D/g, '');

    // Handle multi-character paste or typed string
    if (cleanValue.length > 1) {
      const chars = cleanValue.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newDigits[index + i] = char;
        }
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);
    setError(null);

    // Auto-advance to next input
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);

    const targetFocus = Math.min(pastedData.length, 5);
    inputRefs.current[targetFocus]?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = otpDigits.join('');

    if (token.length < 6) {
      setError('Masukkan seluruh 6 digit kode OTP verifikasi.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      if (verifyErr) throw verifyErr;

      setIsSuccess(true);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if confetti fails
      }

      // Small delay for user satisfaction before triggering post-auth flow
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setError(
        err?.message ||
          'Kode OTP tidak cocok atau sudah kedaluwarsa. Gunakan tombol Kirim Ulang untuk mendapatkan kode baru.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setError(null);

    try {
      // In demo mode or supabase real resend
      if (typeof (supabase.auth as any).resendOtp === 'function') {
        await (supabase.auth as any).resendOtp(email);
      } else {
        await supabase.auth.resend({
          type: 'signup',
          email,
        });
      }
      setCountdown(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.message || 'Gagal mengirim ulang kode OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Container */}
      <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 z-10 text-gray-900">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900">
            Verifikasi Akun Anda
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Kami telah mengirimkan 6-digit kode OTP ke alamat email:
          </p>
          <div className="mt-1 font-semibold text-emerald-950 bg-emerald-50 inline-block px-3 py-1 rounded-full text-xs sm:text-sm border border-emerald-200">
            {email}
          </div>
        </div>

        {/* Demo Mode Helper Hint */}
        {isUsingDemoMode && (
          <div className="mb-5 text-xs bg-amber-50/90 border border-amber-200 text-amber-900 rounded-xl p-3 flex items-start gap-2">
            <span className="font-bold shrink-0">Demo Mode:</span>
            <span>
              Masukkan kode OTP <span className="font-mono font-bold text-amber-950 bg-amber-200/60 px-1 py-0.5 rounded">123456</span> untuk verifikasi langsung.
            </span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-5 bg-red-100/90 border border-red-300 text-red-900 text-xs sm:text-sm rounded-xl p-3 flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Notice */}
        {isSuccess && (
          <div className="mb-5 bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs sm:text-sm rounded-xl p-3 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">Akun Terverifikasi! Mengalihkan...</span>
          </div>
        )}

        {/* 6 Digit Inputs */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading || isSuccess}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-white/90 border-2 border-gray-300 focus:border-zinc-900 focus:bg-white rounded-xl shadow-inner text-gray-900 outline-none transition-all disabled:opacity-50"
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess || otpDigits.join('').length < 6}
            className="w-full bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white rounded-xl py-3.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Verifikasi Akun</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend OTP Section */}
        <div className="mt-6 text-center border-t border-gray-200/70 pt-4">
          <p className="text-xs text-gray-500 mb-2">Tidak menerima kode OTP di email?</p>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-900 hover:text-emerald-700 underline transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Kirim Ulang Kode OTP Sekarang</span>
            </button>
          ) : (
            <span className="text-xs text-gray-500 font-medium">
              Kirim ulang kode dalam <span className="font-bold text-gray-800">{countdown} detik</span>
            </span>
          )}
        </div>

        {/* Cancel / Edit email option */}
        {onCancel && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-gray-500 hover:text-gray-800 underline transition"
            >
              Ubah data pendaftaran / kembali
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

