import React, { useState } from 'react';
import { Phone, ArrowRight, AlertCircle, MessageCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface WhatsAppInterceptorModalProps {
  isOpen: boolean;
  userId: string;
  userEmail: string;
  onSuccess: (savedPhone: string) => void;
}

export const WhatsAppInterceptorModal: React.FC<WhatsAppInterceptorModalProps> = ({
  isOpen,
  userId,
  userEmail,
  onSuccess,
}) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only numeric digits, strip leading 0 or +62 if accidentally pasted
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('62')) {
      val = val.substring(2);
    } else if (val.startsWith('0')) {
      val = val.substring(1);
    }
    setPhone(val);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setError('Nomor WhatsApp wajib diisi.');
      return;
    }

    if (cleanPhone.length < 9 || cleanPhone.length > 13) {
      setError('Nomor WhatsApp tidak valid (masukkan antara 9–13 digit setelah +62).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fullPhoneNumber = `+62${cleanPhone}`;

      // Update Supabase profiles table
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          phone_number: cleanPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .single();

      if (profileErr) {
        // If profile row didn't exist yet, try upsert
        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: userEmail,
            phone_number: cleanPhone,
            updated_at: new Date().toISOString(),
          });
        if (upsertErr) throw upsertErr;
      }

      onSuccess(fullPhoneNumber);
    } catch (err: any) {
      console.error('Error saving phone number:', err);
      setError(err?.message || 'Gagal menyimpan nomor WhatsApp. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 z-10 text-gray-900">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
          <MessageCircle className="w-8 h-8" />
        </div>

        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            Langkah Terakhir Checkout
          </span>
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 mt-3">
            Lengkapi No. WhatsApp (+62)
          </h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Untuk mengonfirmasi pesanan katering sehat kampus dan pengiriman kurir ke asrama/kos, mohon masukkan nomor WhatsApp aktif Anda.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-100/90 border border-red-300 text-red-900 text-xs sm:text-sm rounded-xl p-3 flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Nomor WhatsApp *
            </label>
            <div className="flex items-center gap-2 border-b border-gray-700/60 pb-1.5 focus-within:border-black transition">
              {/* Pill +62 prefix with white circle as shown in mockup */}
              <div className="flex items-center gap-1.5 bg-white/95 px-2.5 py-1 rounded-full shadow-sm border border-gray-200">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">
                  ✓
                </div>
                <span className="text-sm font-bold text-gray-800">+62</span>
              </div>
              <span className="text-gray-400 font-light">~</span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="812345678"
                autoFocus
                required
                className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 font-medium py-1 text-base tracking-wide"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Hanya digunakan untuk notifikasi pengiriman & konfirmasi menu.</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || phone.length < 9}
            className="w-full bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white rounded-xl py-3.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Simpan & Lanjut ke Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

