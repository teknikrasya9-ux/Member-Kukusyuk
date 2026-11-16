import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Crown, ShieldCheck, CreditCard, Clock, User, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUser(data.user);
      }
    };
    fetchUser();
  }, [location.pathname]);

  const navLinks = [
    { path: '/introduction', label: 'VIP Membership', icon: Crown },
    { path: '/payment', label: 'Form Pembayaran & QRIS', icon: CreditCard },
    { path: '/payment/waiting', label: 'Status Verifikasi', icon: Clock },
    { path: '/admin/approvals', label: 'Admin Portal', icon: ShieldCheck, badge: 'Admin' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/introduction" className="flex items-center gap-3 group">
          <div className="w-10 h-10 transition-transform group-hover:scale-105">
            <Logo size="sm" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              <span>Kukusyuk</span>
              <span className="text-emerald-400 font-medium text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                CampusFit
              </span>
            </span>
            <span className="block text-[10px] text-neutral-400 font-medium tracking-wider">
              Healthy Meal Prep &amp; Steamer
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600/90 text-white shadow-md shadow-emerald-900/30 border border-emerald-400/40'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Info / Auth */}
        <div className="hidden sm:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-neutral-200 font-medium truncate max-w-[120px]">
                {currentUser.user_metadata?.first_name || currentUser.email?.split('@')[0]}
              </span>
              {currentUser.user_metadata?.is_vip ? (
                <span className="bg-amber-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5 fill-current" />
                  <span>VIP</span>
                </span>
              ) : null}
              <button
                onClick={handleLogout}
                title="Keluar"
                className="text-neutral-400 hover:text-red-400 ml-1 p-0.5 rounded transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/"
              className="text-xs font-semibold bg-white text-zinc-900 hover:bg-neutral-100 px-3.5 py-1.5 rounded-xl transition"
            >
              Masuk / Daftar
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-neutral-300 hover:text-white rounded-lg focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950/95 border-b border-white/10 px-4 pt-2 pb-4 space-y-1 animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-neutral-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/10">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center text-xs font-semibold bg-white text-zinc-900 py-2 rounded-xl mt-1"
            >
              Halaman Login / Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

