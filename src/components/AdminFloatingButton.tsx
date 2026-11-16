import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const AdminFloatingButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on admin portal pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => navigate('/admin/login')}
      className="fixed bottom-4 right-4 z-50 bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/25 text-white rounded-full py-2.5 px-4 shadow-2xl hover:shadow-black/50 transition-all duration-300 flex items-center gap-2 group cursor-pointer text-xs font-bold tracking-wide hover:scale-105 active:scale-95"
      title="Akses Portal Administrator"
    >
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
        <ShieldCheck className="w-3.5 h-3.5" />
      </div>
      <span>Admin Panel</span>
    </button>
  );
};
