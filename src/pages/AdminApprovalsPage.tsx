import React, { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  MessageCircle, 
  Filter, 
  RotateCw, 
  DollarSign, 
  Users, 
  FileText, 
  AlertCircle,
  X,
  PlusCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { supabase, VipSubscription } from '../lib/supabaseClient';

export const AdminApprovalsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<VipSubscription[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal Lightbox for Payment Proof Zoom
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // Modal for Rejection Reason
  const [rejectingSubId, setRejectingSubId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Bukti transfer tidak terbaca jelas atau nominal tidak cocok.');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_vip_subscriptions');
      if (data) {
        setSubscriptions(data as VipSubscription[]);
      }
    } catch (err) {
      console.error('Error fetching admin subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --------------------------------------------------------------------------
  // LOGIKA RPC: APPROVE VIP SUBSCRIPTION
  // --------------------------------------------------------------------------
  const handleApprove = async (subId: string) => {
    setActionLoading(subId);
    try {
      const { data, error } = await supabase.rpc('approve_vip_subscription', {
        p_subscription_id: subId,
      });

      if (error) throw error;

      showToast(`Pengajuan ${subId} berhasil disetujui! Status user kini VIP Aktif.`, 'success');
      await fetchSubscriptions();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menyetujui pengajuan.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // --------------------------------------------------------------------------
  // LOGIKA RPC: REJECT VIP SUBSCRIPTION
  // --------------------------------------------------------------------------
  const handleConfirmReject = async () => {
    if (!rejectingSubId) return;
    setActionLoading(rejectingSubId);
    try {
      const { data, error } = await supabase.rpc('reject_vip_subscription', {
        p_subscription_id: rejectingSubId,
        p_rejection_reason: rejectionReason,
      });

      if (error) throw error;

      showToast(`Pengajuan ${rejectingSubId} telah ditolak.`, 'error');
      setRejectingSubId(null);
      await fetchSubscriptions();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menolak pengajuan.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Add dummy test subscription
  const handleAddSamplePending = async () => {
    const names = ['Ahmad Fauzi', 'Dina Lestari', 'Kevin Wijaya', 'Nadia Putri', 'Surya Saputra'];
    const jobs = ['Mahasiswa', 'Kantoran', 'Dosen', 'Wirausaha'];
    const chosenName = names[Math.floor(Math.random() * names.length)];
    const chosenJob = jobs[Math.floor(Math.random() * jobs.length)];

    await supabase.rpc('submit_vip_subscription', {
      p_full_name: chosenName,
      p_phone_number: '+6281' + Math.floor(10000000 + Math.random() * 90000000),
      p_active_email: chosenName.toLowerCase().replace(' ', '.') + '@campus.ac.id',
      p_job_status: chosenJob,
      p_promo_code: Math.random() > 0.5 ? 'CAMPUSFIT' : null,
      p_payment_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      p_amount: 50000,
    });

    showToast('Simulasi pengajuan VIP baru berhasil ditambahkan!', 'success');
    await fetchSubscriptions();
  };

  // Filter subscriptions
  const filteredList = subscriptions.filter((sub) => {
    if (filterStatus === 'all') return true;
    return sub.status === filterStatus;
  });

  // Calculate statistics
  const totalCount = subscriptions.length;
  const pendingCount = subscriptions.filter((s) => s.status === 'pending').length;
  const approvedCount = subscriptions.filter((s) => s.status === 'approved').length;
  const totalRevenue = subscriptions
    .filter((s) => s.status === 'approved')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="relative min-h-screen w-full pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start overflow-x-hidden">
      {/* Background with Dark Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=2000&q=80"
          alt="Healthy Food Background"
          className="w-full h-full object-cover object-center filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/80" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl my-6 animate-fadeIn space-y-6">
        {/* Header Bar */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/50">
          <div className="flex items-center gap-4 text-center md:text-left">
            <Logo size="sm" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Backoffice</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Verifikasi &amp; Persetujuan VIP Member
              </h1>
              <p className="text-xs sm:text-sm text-gray-700">
                Kelola mutasi QRIS dan verifikasi bukti transfer pendaftar secara real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddSamplePending}
              className="bg-white/80 hover:bg-white text-gray-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-gray-300 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Tambah Simulasi Pengajuan</span>
            </button>
            <button
              onClick={fetchSubscriptions}
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-md transition cursor-pointer"
              title="Perbarui data"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg animate-fadeIn ${
              toastMessage.type === 'success'
                ? 'bg-emerald-100 border border-emerald-300 text-emerald-950'
                : 'bg-red-100 border border-red-300 text-red-950'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/60">
            <div className="flex items-center justify-between text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Total Pengajuan</span>
              <Users className="w-4 h-4 text-gray-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900">{totalCount}</div>
            <span className="text-[11px] text-gray-600">Semua pendaftar</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-amber-300/60 bg-amber-50/40">
            <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Menunggu (Pending)</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900">{pendingCount}</div>
            <span className="text-[11px] text-amber-700 font-semibold">Perlu dicek admin</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-emerald-300/60 bg-emerald-50/40">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Disetujui (Approved)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900">{approvedCount}</div>
            <span className="text-[11px] text-emerald-700 font-semibold">VIP Member Aktif</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/60">
            <div className="flex items-center justify-between text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Total Omzet</span>
              <DollarSign className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-950">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-gray-600">Dari membership aktif</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="glass-panel rounded-2xl p-2 border border-white/60 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'Semua Pengajuan', count: totalCount },
            { id: 'pending', label: 'Menunggu (Pending)', count: pendingCount, highlight: true },
            { id: 'approved', label: 'Disetujui', count: approvedCount },
            { id: 'rejected', label: 'Ditolak', count: subscriptions.filter((s) => s.status === 'rejected').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'text-gray-700 hover:text-black hover:bg-white/50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  filterStatus === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.highlight && tab.count > 0
                    ? 'bg-amber-400 text-zinc-900 font-black animate-pulse'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Subscriptions List */}
        <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-white/60 shadow-xl overflow-hidden">
          {filteredList.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-800">
                Tidak ada data pengajuan pada filter ini.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Klik tombol "Tambah Simulasi Pengajuan" di atas untuk menambahkan data baru.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-600 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3">ID &amp; Tanggal</th>
                    <th className="py-3 px-3">Data Member</th>
                    <th className="py-3 px-3">Nominal &amp; Promo</th>
                    <th className="py-3 px-3 text-center">Bukti Transfer</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/70">
                  {filteredList.map((sub) => {
                    const isPending = sub.status === 'pending';
                    const isApproved = sub.status === 'approved';
                    const isRejected = sub.status === 'rejected';

                    return (
                      <tr key={sub.id} className="hover:bg-white/40 transition">
                        {/* ID & Date */}
                        <td className="py-4 px-3 align-middle">
                          <span className="font-mono font-bold text-gray-900 block text-xs">
                            {sub.id}
                          </span>
                          <span className="text-[11px] text-gray-500 block mt-0.5">
                            {new Date(sub.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                        {/* Member Info */}
                        <td className="py-4 px-3 align-middle">
                          <span className="font-bold text-gray-900 block">
                            {sub.full_name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <a
                              href={`https://wa.me/${sub.phone_number.replace(/\+/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline inline-flex items-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span>{sub.phone_number}</span>
                            </a>
                            <span className="text-gray-400">•</span>
                            <span className="text-[11px] text-gray-600 bg-gray-200/70 px-1.5 py-0.2 rounded">
                              {sub.job_status}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 block mt-0.5">
                            {sub.active_email}
                          </span>
                        </td>

                        {/* Amount & Promo */}
                        <td className="py-4 px-3 align-middle">
                          <span className="font-extrabold text-emerald-950 block text-sm">
                            Rp {sub.amount.toLocaleString('id-ID')}
                          </span>
                          {sub.promo_code ? (
                            <span className="inline-block mt-0.5 text-[10px] font-bold uppercase text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                              Kode: {sub.promo_code} (-10K)
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-500">Harga Normal</span>
                          )}
                        </td>

                        {/* Payment Proof Thumbnail */}
                        <td className="py-4 px-3 align-middle text-center">
                          {sub.payment_proof_url ? (
                            <button
                              type="button"
                              onClick={() => setSelectedProofUrl(sub.payment_proof_url)}
                              className="relative group inline-block rounded-xl overflow-hidden border border-gray-300 shadow-sm hover:shadow-md transition cursor-pointer"
                            >
                              <img
                                src={sub.payment_proof_url}
                                alt="Proof"
                                className="w-12 h-14 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                                <Eye className="w-4 h-4" />
                              </div>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">Tidak ada</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-3 align-middle text-center">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Approved</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-900 bg-red-100 px-2.5 py-1 rounded-full border border-red-300">
                              <XCircle className="w-3 h-3 text-red-600" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-3 align-middle text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              {/* Approve Button */}
                              <button
                                type="button"
                                onClick={() => handleApprove(sub.id)}
                                disabled={actionLoading === sub.id}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {actionLoading === sub.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Setujui</span>
                                  </>
                                )}
                              </button>

                              {/* Reject Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingSubId(sub.id);
                                  setRejectionReason('Bukti transfer tidak terbaca jelas atau nominal tidak cocok.');
                                }}
                                disabled={actionLoading === sub.id}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 font-medium">
                              {isApproved ? 'Selesai (VIP Aktif)' : 'Telah Ditolak'}
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
      {/* MODAL 1: LIGHTBOX ZOOM BUKTI PEMBAYARAN                                    */}
      {/* ========================================================================= */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-5 shadow-2xl border border-gray-300">
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-gray-900 mb-3">
              Foto Bukti Transfer QRIS
            </h3>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-gray-200">
              <img
                src={selectedProofUrl}
                alt="Zoomed Payment Proof"
                className="w-full object-contain"
              />
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: KONFIRMASI ALASAN PENOLAKAN                                      */}
      {/* ========================================================================= */}
      {rejectingSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full glass-modal rounded-3xl p-6 shadow-2xl border border-white/80">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Tolak Pengajuan VIP ({rejectingSubId})
            </h3>
            <p className="text-xs text-gray-600 mt-1 mb-4">
              Silakan tuliskan alasan penolakan agar pemohon dapat memperbaiki data atau mengunggah ulang bukti transfer.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                Alasan Penolakan:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full bg-white/90 border border-gray-300 rounded-xl p-3 text-xs text-gray-900 outline-none focus:border-zinc-900 shadow-inner"
              />
            </div>

            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setRejectingSubId(null)}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold py-3 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading === rejectingSubId}
                className="w-1/2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                {actionLoading === rejectingSubId ? (
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

