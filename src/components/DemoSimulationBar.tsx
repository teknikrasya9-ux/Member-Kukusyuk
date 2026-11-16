import React, { useState } from 'react';
import { Settings, Check, ExternalLink, Zap, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { isConfigured } from '../lib/supabaseClient';

interface DemoSimulationBarProps {
  isFromCheckout: boolean;
  onToggleFromCheckout: (val: boolean) => void;
  onQuickFillLogin: () => void;
  onQuickFillRegister: () => void;
  currentView: 'login' | 'register';
  onSwitchView: (view: 'login' | 'register') => void;
}

export const DemoSimulationBar: React.FC<DemoSimulationBarProps> = ({
  isFromCheckout,
  onToggleFromCheckout,
  onQuickFillLogin,
  onQuickFillRegister,
  currentView,
  onSwitchView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl">
      <div className="bg-black/80 backdrop-blur-md border border-white/20 text-white rounded-2xl shadow-2xl px-4 py-2.5 transition-all text-xs">
        <div className="flex items-center justify-between gap-2">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="font-semibold text-neutral-200">
              {isConfigured ? 'Supabase Live' : 'Demo Fallback Mode'}
            </span>
          </div>

          {/* Quick source toggle: Checkout vs Home */}
          <div className="flex items-center gap-1.5 bg-white/10 p-0.5 rounded-lg">
            <button
              onClick={() => onToggleFromCheckout(false)}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                !isFromCheckout ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Navbar / Home
            </button>
            <button
              onClick={() => onToggleFromCheckout(true)}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                isFromCheckout ? 'bg-amber-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              From Checkout (?redirect=checkout)
            </button>
          </div>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-neutral-400 hover:text-white transition rounded-md"
            title="Buka panel simulasi pengujian"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Controls for easy grading/testing */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5 animate-fadeIn">
            <div className="text-neutral-300 text-[11px] leading-relaxed">
              <strong>Simulasi Alur Pengguna (User Flow):</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-neutral-400">
                <li>
                  <span className="text-amber-300 font-semibold">Mode Checkout Aktif:</span> Login via Google OAuth akan otomatis memicu <em>Pop-up Lengkapi No. WhatsApp (+62)</em> jika nomor belum ada.
                </li>
                <li>
                  <span className="text-emerald-300 font-semibold">Mode Navbar/Home:</span> Login langsung mengarahkan ke halaman <em>/home</em>.
                </li>
                <li>
                  <span className="text-teal-300 font-semibold">Register:</span> Submit form valid langsung membuka <em>Pop-up OTP 6-Digit</em> (kode demo: <code>123456</code>).
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onQuickFillLogin}
                className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Auto-fill Kredensial Login Demo</span>
              </button>

              <button
                type="button"
                onClick={onQuickFillRegister}
                className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-300" />
                <span>Auto-fill Form Register Demo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

