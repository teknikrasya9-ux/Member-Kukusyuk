import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Crown, 
  Clock, 
  DollarSign, 
  Search, 
  Filter, 
  RotateCw, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  MessageCircle, 
  Eye, 
  ShieldCheck, 
  Download, 
  X, 
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { supabase, VipSubscription, ADMIN_EMAIL } from '../lib/supabaseClient';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Authentication Guard State
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Data State
  const [subscriptions, setSubscriptions] = useState<VipSubscription[]>([]);
  const [profilesCount, setProfilesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'approved' | 'rejected'>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');

  // Modal Lightbox for Payment Proof Zoom
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);
  const [previewProofLoading, setPreviewProofLoading] = useState<boolean>(false);

  // Rejection Dialog State
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Bukti transfer tidak valid atau nominal tidak sesuai.');

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Verify Admin Session on Mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;

        if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
          // If not logged in as admin, redirect to admin login
          navigate('/admin/login', { replace: true });
          return;
        }

        setAdminUser(user);
      } catch (err) {
        navigate('/admin/login', { replace: true });
      } finally {
        setIsVerifyingAuth(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  // 2. Fetch Subscriptions and Profiles
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch subscriptions
      const { data: subData } = await supabase.rpc('get_all_vip_subscriptions');
      if (subData) {
        setSubscriptions(subData as VipSubscription[]);
      }

      // Fetch profiles count
      const { data: profileList } = await supabase.from('profiles').select('id');
      if (profileList) {
        setProfilesCount(profileList.length || 0);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isVerifyingAuth && adminUser) {
      fetchData();
    }
  }, [isVerifyingAuth, adminUser]);

  // 3. Admin Approve VIP Subscription
  const handleApprove = async (subId: string) => {
    setActionLoading(subId);
    try {
      const { data, error } = await supabase.rpc('admin_approve_vip', {
        p_subscription_id: subId,
        p_is_approved: true,
      });

      if (error) throw error;

      showToast(`Pendaftaran ${subId} berhasil disetujui! Status user kini VIP Aktif.`, 'success');
      await fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menyetujui pengajuan.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 4. Admin Reject VIP Subscription
  const handleRejectConfirm = async () => {
    if (!rejectDialogId) return;
    setActionLoading(rejectDialogId);
    try {
      const { data, error } = await supabase.rpc('admin_approve_vip', {
        p_subscription_id: rejectDialogId,
        p_is_approved: false,
        p_rejection_reason: rejectionReason,
      });

      if (error) throw error;

      showToast(`Pendaftaran ${rejectDialogId} telah ditolak.`, 'error');
      setRejectDialogId(null);
      await fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menolak pengajuan.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 5. Open Proof with Signed URL
  const handleViewProof = async (proofUrl: string) => {
    setPreviewProofLoading(true);
    setPreviewProofUrl(proofUrl);

    try {
      // If image is a storage path rather than direct http
      if (!proofUrl.startsWith('http') && !proofUrl.startsWith('data:')) {
        const { data } = await supabase.storage
          .from('payment-proofs')
          .createSignedUrl(proofUrl, 3600);
        if (data?.signedUrl) {
          setPreviewProofUrl(data.signedUrl);
        }
      }
    } catch (err) {
      console.warn('Error creating signed url:', err);
    } finally {
      setPreviewProofLoading(false);
    }
  };

  // 6. Admin Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Calculate Summary Statistics
  const totalSubscribers = Math.max(profilesCount, subscriptions.length);
  const activeVipCount = subscriptions.filter((s) => s.status === 'approved').length;
  const waitingConfirmationCount = subscriptions.filter(
    (s) => s.status === 'waiting_confirmation' || (s.status as any) === 'pending'
  ).length;
  const totalVipRevenue = subscriptions
    .filter((s) => s.status === 'approved')
    .reduce((acc, curr) => acc + (curr.amount || 60000), 0);

  // Filter & Search Logic
  const filteredSubscriptions = subscriptions.filter((sub) => {
    // 1. Text Search query (Name, Email, Phone)
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = (sub.full_name || '').toLowerCase().includes(q);
      const matchEmail = (sub.active_email || '').toLowerCase().includes(q);
      const matchPhone = (sub.phone_number || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }

    // 2. Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'waiting') {
        const isWaiting = sub.status === 'waiting_confirmation' || (sub.status as any) === 'pending';
        if (!isWaiting) return false;
      } else if (sub.status !== statusFilter) {
        return false;
      }
    }

    // 3. Job Filter
    if (jobFilter !== 'all') {
      if (sub.job_status !== jobFilter) return false;
    }

    return true;
  });

  if (isVerifyingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-neutral-400 font-semibold tracking-wide">
            Memverifikasi otentikasi administrator...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-neutral-100 pb-16 pt-6 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden font-sans">
      {/* Background Gradient & Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Top Header */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo-kukusyuk.png"
              alt="Logo Kukusyuk"
              className="w-12 h-12 object-contain rounded-full shadow-md border border-white/20"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/images/logo-kukusyuk.png')) {
                  target.src = '/images/logo-kukusyuk.png';
                }
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Admin Master
                </span>
                <span className="text-xs text-neutral-400 truncate max-w-[200px]">
                  {adminUser?.email}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Dashboard Monitoring Membership VIP
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="bg-white/10 hover:bg-white/15 text-neutral-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/10 shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-semibold px-3.5 py-2 rounded-xl border border-red-500/30 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-xl animate-fadeIn ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/90 border border-red-500/40 text-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. SUMMARY CARDS AT TOP                                                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Pelanggan */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Pelanggan</span>
              <Users className="w-4 h-4 text-neutral-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalSubscribers}</div>
            <p className="text-[11px] text-neutral-400 mt-1">Data akun terdaftar</p>
          </div>

          {/* Card 2: Total Member VIP Aktif */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>VIP Aktif</span>
              <Crown className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{activeVipCount}</div>
            <p className="text-[11px] text-emerald-300/80 mt-1">Langganan disetujui</p>
          </div>

          {/* Card 3: Menunggu Konfirmasi */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Menunggu Konfirmasi</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{waitingConfirmationCount}</div>
            <p className="text-[11px] text-amber-300/80 mt-1">Perlu dicek admin</p>
          </div>

          {/* Card 4: Total Pendapatan VIP */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Pendapatan</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              Rp {totalVipRevenue.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Akumulasi pembayaran</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SEARCH & FILTER CONTROLS                                               */}
        {/* ========================================================================= */}
        <div className="bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan Nama, Email, atau No. WhatsApp..."
                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 outline-none transition"
              />
            </div>

            {/* Job Status Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 whitespace-nowrap">Pekerjaan:</span>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                <option value="all" className="bg-zinc-900">Semua Pekerjaan</option>
                <option value="Mahasiswa" className="bg-zinc-900">Mahasiswa</option>
                <option value="Dosen" className="bg-zinc-900">Dosen</option>
                <option value="Kantoran" className="bg-zinc-900">Kantoran</option>
                <option value="Buruh" className="bg-zinc-900">Buruh</option>
                <option value="Wirausaha" className="bg-zinc-900">Wirausaha</option>
                <option value="Masyarakat Umum" className="bg-zinc-900">Masyarakat Umum</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-white/5">
            {[
              { id: 'all', label: 'Semua Status', count: subscriptions.length },
              { id: 'waiting', label: 'Menunggu Konfirmasi (Waiting)', count: waitingConfirmationCount, alert: true },
              { id: 'approved', label: 'VIP Aktif (Approved)', count: activeVipCount },
              { id: 'rejected', label: 'Ditolak (Rejected)', count: subscriptions.filter(s => s.status === 'rejected').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id
                      ? 'bg-zinc-950/20 text-zinc-950 font-bold'
                      : tab.alert && tab.count > 0
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse'
                      : 'bg-white/10 text-neutral-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MONITORING TABLE                                                       */}
        {/* ========================================================================= */}
        <div className="bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Users className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Tidak ada data pelanggan yang cocok</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Silakan sesuaikan filter pencarian Anda atau periksa kembali data pendaftaran.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 text-[11px] uppercase tracking-wider bg-white/5">
                    <th className="py-3.5 px-4">Tanggal Transaksi</th>
                    <th className="py-3.5 px-4">Pelanggan</th>
                    <th className="py-3.5 px-4">No. WhatsApp</th>
                    <th className="py-3.5 px-4">Status Pekerjaan</th>
                    <th className="py-3.5 px-4">Kode Promo &amp; Tagihan</th>
                    <th className="py-3.5 px-4 text-center">Bukti QRIS</th>
                    <th className="py-3.5 px-4 text-center">Status Membership</th>
                    <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSubscriptions.map((sub) => {
                    const isWaiting = sub.status === 'waiting_confirmation' || (sub.status as any) === 'pending';
                    const isApproved = sub.status === 'approved';
                    const isRejected = sub.status === 'rejected';

                    // Format clean phone for WA link
                    const cleanPhone = sub.phone_number.replace(/\D/g, '');
                    const waLink = `https://wa.me/${cleanPhone}?text=Halo%20kak%20${encodeURIComponent(sub.full_name)},%20kami%20dari%20Kukusyuk-CampusFit%20terkait%20pembayaran%20VIP%20Member...`;

                    return (
                      <tr key={sub.id} className="hover:bg-white/[0.03] transition">
                        {/* Tanggal */}
                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                          <span className="font-mono text-xs text-neutral-300 block font-semibold">
                            {new Date(sub.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[11px] text-neutral-500 block">
                            {new Date(sub.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                        {/* Nama & Email */}
                        <td className="py-4 px-4 align-middle">
                          <span className="font-bold text-white block truncate max-w-[180px]">
                            {sub.full_name}
                          </span>
                          <span className="text-xs text-neutral-400 block truncate max-w-[180px]">
                            {sub.active_email}
                          </span>
                        </td>

                        {/* WhatsApp (+62) with direct chat button */}
                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition"
                            title="Chat WhatsApp Pelanggan"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{sub.phone_number}</span>
                          </a>
                        </td>

                        {/* Status Pekerjaan */}
                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                          <span className="bg-white/10 text-neutral-300 px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/5">
                            {sub.job_status || 'Umum'}
                          </span>
                        </td>

                        {/* Kode Promo & Tagihan */}
                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                          <span className="font-extrabold text-white block">
                            Rp {(sub.amount || 60000).toLocaleString('id-ID')}
                          </span>
                          {sub.promo_code ? (
                            <span className="inline-block text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded mt-0.5">
                              {sub.promo_code} (-10K)
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-500 block mt-0.5">
                              Normal (Rp 60.000)
                            </span>
                          )}
                        </td>

                        {/* Bukti Transfer QRIS */}
                        <td className="py-4 px-4 align-middle text-center whitespace-nowrap">
                          {sub.payment_proof_url ? (
                            <button
                              type="button"
                              onClick={() => handleViewProof(sub.payment_proof_url)}
                              className="inline-flex items-center gap-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-neutral-200 px-2.5 py-1.5 rounded-lg border border-white/15 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-neutral-300" />
                              <span>Lihat Bukti</span>
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-500">-</span>
                          )}
                        </td>

                        {/* Status Membership */}
                        <td className="py-4 px-4 align-middle text-center whitespace-nowrap">
                          {isWaiting && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2.5 py-1 rounded-full animate-pulse">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Waiting Confirmation</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Approved (VIP Aktif)</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-300 bg-red-500/15 border border-red-500/30 px-2.5 py-1 rounded-full">
                              <XCircle className="w-3 h-3 text-red-400" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </td>

                        {/* Aksi Admin */}
                        <td className="py-4 px-4 align-middle text-right whitespace-nowrap">
                          {isWaiting ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Tombol Approve */}
                              <button
                                type="button"
                                onClick={() => handleApprove(sub.id)}
                                disabled={actionLoading === sub.id}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {actionLoading === sub.id ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Setujui</span>
                                  </>
                                )}
                              </button>

                              {/* Tombol Reject */}
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectDialogId(sub.id);
                                  setRejectionReason('Bukti transfer tidak valid atau nominal tidak sesuai.');
                                }}
                                disabled={actionLoading === sub.id}
                                className="bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-500 font-medium">
                              {isApproved ? 'Selesai (Aktif)' : 'Telah Ditolak'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PREVIEW BUKTI TRANSFER QRIS                                      */}
      {/* ========================================================================= */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-lg w-full bg-zinc-900 border border-white/20 rounded-3xl p-6 shadow-2xl text-white">
            <button
              onClick={() => setPreviewProofUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Bukti Pembayaran QRIS Pelanggan
              </h3>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-2xl border border-white/10 bg-black/50 p-2 flex items-center justify-center">
              {previewProofLoading ? (
                <div className="py-12 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-neutral-400">Memuat berkas dari Supabase Storage...</span>
                </div>
              ) : (
                <img
                  src={previewProofUrl}
                  alt="Bukti Transfer"
                  className="max-h-[60vh] object-contain rounded-xl"
                />
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewProofUrl(null)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-5 rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: KONFIRMASI ALASAN PENOLAKAN                                      */}
      {/* ========================================================================= */}
      {rejectDialogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full bg-zinc-900 border border-white/20 rounded-3xl p-6 shadow-2xl text-white">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
              <XCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">
              Tolak Pembayaran ({rejectDialogId})
            </h3>
            <p className="text-xs text-neutral-400 mt-1 mb-4">
              Masukkan alasan penolakan agar pelanggan dapat melihat penyebab kendala dan mengunggah ulang bukti yang valid.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Alasan Penolakan:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full bg-black/40 border border-white/15 focus:border-red-400 rounded-xl p-3 text-xs text-white outline-none transition"
              />
            </div>

            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setRejectDialogId(null)}
                className="w-1/2 bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={actionLoading === rejectDialogId}
                className="w-1/2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading === rejectDialogId ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Konfirmasi Tolak</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

