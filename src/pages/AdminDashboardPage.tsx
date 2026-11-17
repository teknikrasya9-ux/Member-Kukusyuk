import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Crown, 
  Clock, 
  DollarSign, 
  Search, 
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
  Utensils,
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Upload,
  FileText,
  Check
} from 'lucide-react';
import { supabase, VipSubscription, ADMIN_EMAIL } from '../lib/supabaseClient';
import { PoItem, ELibraryItem, PoConfig, DEFAULT_PO_CONFIG } from './ActiveMemberPage';

export interface PoOrder {
  id: string;
  batchNumber: number;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  itemTitle: string;
  itemPrice: number;
  orderedAt: string;
}

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Authentication Guard State
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Tab State: 'verifikasi' | 'menu-po' | 'elibrary'
  const [activeAdminTab, setActiveAdminTab] = useState<'verifikasi' | 'menu-po' | 'elibrary'>('verifikasi');

  // =========================================================================
  // DATA STATE: VIP SUBSCRIPTIONS & VERIFICATION
  // =========================================================================
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

  // =========================================================================
  // DATA STATE: PO BATCH MANAGEMENT
  // =========================================================================
  const [poConfig, setPoConfig] = useState<PoConfig>(() => {
    try {
      const saved = localStorage.getItem('campusfit_po_config');
      return saved ? JSON.parse(saved) : DEFAULT_PO_CONFIG;
    } catch {
      return DEFAULT_PO_CONFIG;
    }
  });

  const [poItems, setPoItems] = useState<PoItem[]>(() => {
    try {
      const saved = localStorage.getItem('campusfit_po_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Form State: Add PO Menu Item
  const [newPoTitle, setNewPoTitle] = useState('');
  const [newPoSchedule, setNewPoSchedule] = useState('Senin & Kamis');
  const [newPoCategoryBadge, setNewPoCategoryBadge] = useState('Early VIP Pick');
  const [newPoCalories, setNewPoCalories] = useState('🔥 340 Kkal | 38g Protein');
  const [newPoDesc, setNewPoDesc] = useState('');
  const [newPoPriceOriginal, setNewPoPriceOriginal] = useState<number>(32000);
  const [newPoDiscountPercent, setNewPoDiscountPercent] = useState<number>(30);
  const [newPoImg, setNewPoImg] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');

  // Perhitungan otomatis harga VIP berdasarkan persentase diskon
  const calculatedPoVipPrice = Math.max(
    0,
    Math.round((Number(newPoPriceOriginal) || 0) * (1 - (Number(newPoDiscountPercent) || 0) / 100))
  );
  const calculatedPoSavings = Math.max(0, (Number(newPoPriceOriginal) || 0) - calculatedPoVipPrice);

  const [poOrders, setPoOrders] = useState<PoOrder[]>(() => {
    try {
      const saved = localStorage.getItem('campusfit_po_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep PO Config, slots, and incoming orders in sync across tabs in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedConfig = localStorage.getItem('campusfit_po_config');
        if (savedConfig) {
          const parsed: PoConfig = JSON.parse(savedConfig);
          setPoConfig(parsed);
          setBatchRemainingSlots(parsed.remainingSlots);
          setBatchTotalSlots(parsed.totalSlots);
          setBatchNumInput(parsed.batchNumber);
          setBatchIsOpen(parsed.isOpen);
        }

        const savedOrders = localStorage.getItem('campusfit_po_orders');
        if (savedOrders) {
          setPoOrders(JSON.parse(savedOrders));
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Form State: PO Batch Settings
  const [batchNumInput, setBatchNumInput] = useState<number>(poConfig.batchNumber || 1);
  const [batchDurationHours, setBatchDurationHours] = useState<number>(poConfig.durationHours || 24);
  const [batchTotalSlots, setBatchTotalSlots] = useState<number>(poConfig.totalSlots || 30);
  const [batchRemainingSlots, setBatchRemainingSlots] = useState<number>(poConfig.remainingSlots || 30);
  const [batchIsOpen, setBatchIsOpen] = useState<boolean>(poConfig.isOpen !== undefined ? poConfig.isOpen : true);

  // =========================================================================
  // DATA STATE: E-LIBRARY MANAGEMENT
  // =========================================================================
  const [eLibraryItems, setELibraryItems] = useState<ELibraryItem[]>(() => {
    try {
      const saved = localStorage.getItem('campusfit_elibrary_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Form State: Add E-Library PDF
  const [newElibTitle, setNewElibTitle] = useState('');
  const [newElibBadge, setNewElibBadge] = useState('Cheatsheet PDF');
  const [newElibDesc, setNewElibDesc] = useState('');
  const [newElibIcon, setNewElibIcon] = useState('📑');
  const [newElibFileUrl, setNewElibFileUrl] = useState('');
  const [newElibFileName, setNewElibFileName] = useState('');

  // 1. Verify Admin Session on Mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;

        if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
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
      const { data: subData } = await supabase.rpc('get_all_vip_subscriptions');
      if (subData) {
        setSubscriptions(subData as VipSubscription[]);
      }

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

  // 3. Approve VIP Subscription
  const handleApprove = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      const { data, error } = await supabase.rpc('admin_approve_vip', {
        p_subscription_id: id,
        p_is_approved: true,
      });

      if (error) throw error;

      showToast(`Pendaftaran VIP untuk "${name}" berhasil disetujui!`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menyetujui pendaftaran VIP.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 4. Reject VIP Subscription Confirmation
  const handleRejectConfirm = async () => {
    if (!rejectDialogId) return;
    const id = rejectDialogId;
    setActionLoading(id);
    try {
      const { data, error } = await supabase.rpc('admin_approve_vip', {
        p_subscription_id: id,
        p_is_approved: false,
        p_rejection_reason: rejectionReason,
      });

      if (error) throw error;

      showToast(`Pengajuan ${id} berhasil ditolak dengan catatan.`, 'error');
      setRejectDialogId(null);
      fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menolak pengajuan.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 5. Open Payment Proof Modal
  const handleViewProof = async (proofUrl: string) => {
    setPreviewProofLoading(true);
    setPreviewProofUrl(proofUrl);

    try {
      if (!proofUrl.startsWith('http')) {
        const { data, error } = await supabase.storage
          .from('payment-proofs')
          .createSignedUrl(proofUrl, 300);

        if (!error && data?.signedUrl) {
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

  // =========================================================================
  // ACTIONS: PO BATCH MANAGEMENT
  // =========================================================================
  const handleSavePoSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget = new Date(Date.now() + batchDurationHours * 3600 * 1000).toISOString();
    const updated: PoConfig = {
      batchNumber: Number(batchNumInput) || 1,
      durationHours: Number(batchDurationHours) || 24,
      durationMinutes: 0,
      targetDate: newTarget,
      totalSlots: Number(batchTotalSlots) || 30,
      remainingSlots: Number(batchRemainingSlots) || 0,
      isOpen: batchIsOpen,
    };

    setPoConfig(updated);
    localStorage.setItem('campusfit_po_config', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    showToast(`Pengaturan PO Batch #${updated.batchNumber} berhasil disimpan!`, 'success');
  };

  const handleAddPoItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoTitle.trim()) {
      showToast('Nama menu makanan wajib diisi.', 'error');
      return;
    }

    const newItem: PoItem = {
      id: 'po-' + Date.now(),
      title: newPoTitle.trim(),
      schedule: newPoSchedule.trim(),
      categoryBadge: newPoCategoryBadge.trim(),
      categoryColor: 'bg-emerald-600 text-white',
      calories: newPoCalories.trim() || '🔥 340 Kkal | 30g Protein',
      desc: newPoDesc.trim() || 'Menu sehat kukus higienis fresh untuk civitas kampus.',
      priceOriginal: Number(newPoPriceOriginal) || 30000,
      priceVip: calculatedPoVipPrice,
      img: newPoImg.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    };

    const updated = [newItem, ...poItems];
    setPoItems(updated);
    localStorage.setItem('campusfit_po_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    // Reset form
    setNewPoTitle('');
    setNewPoDesc('');
    showToast(`Menu "${newItem.title}" berhasil ditambahkan ke PO Batch #${poConfig.batchNumber}!`, 'success');
  };

  const handleDeletePoItem = (id: string | number, title: string) => {
    if (!window.confirm(`Hapus menu "${title}" dari daftar PO Batch?`)) return;
    const updated = poItems.filter((item) => item.id !== id);
    setPoItems(updated);
    localStorage.setItem('campusfit_po_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    showToast(`Menu "${title}" telah dihapus.`, 'success');
  };

  const handleClearAllPoItems = () => {
    if (!window.confirm('Kosongkan semua menu di PO Batch ini?')) return;
    setPoItems([]);
    localStorage.setItem('campusfit_po_items', JSON.stringify([]));
    window.dispatchEvent(new Event('storage'));
    showToast('Semua item menu PO Batch telah dikosongkan.', 'success');
  };

  const handleDeleteOrder = (orderId: string, itemTitle: string) => {
    if (!window.confirm(`Batalkan pesanan "${itemTitle}" dan kembalikan 1 slot kuota ke batch?`)) return;
    const updatedOrders = poOrders.filter((o) => o.id !== orderId);
    setPoOrders(updatedOrders);
    localStorage.setItem('campusfit_po_orders', JSON.stringify(updatedOrders));

    // Restore 1 slot
    const newRemaining = Math.min(poConfig.totalSlots, poConfig.remainingSlots + 1);
    const updatedConfig: PoConfig = {
      ...poConfig,
      remainingSlots: newRemaining,
    };
    setPoConfig(updatedConfig);
    setBatchRemainingSlots(newRemaining);
    localStorage.setItem('campusfit_po_config', JSON.stringify(updatedConfig));
    window.dispatchEvent(new Event('storage'));
    showToast(`Pesanan dibatalkan. Kuota slot tersisa bertambah 1 menjadi ${newRemaining}.`, 'success');
  };

  const handleClearOrders = () => {
    if (!window.confirm('Bersihkan semua riwayat pesanan PO masuk? (Catatan: jumlah sisa slot saat ini tidak akan diubah)')) return;
    setPoOrders([]);
    localStorage.setItem('campusfit_po_orders', JSON.stringify([]));
    window.dispatchEvent(new Event('storage'));
    showToast('Riwayat pesanan PO telah dibersihkan.', 'success');
  };

  // Image Upload Handler for PO Menu
  const handlePoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewPoImg(reader.result);
          showToast('Gambar berhasil diunggah!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================================================================
  // ACTIONS: E-LIBRARY MANAGEMENT
  // =========================================================================
  const handleAddELibraryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newElibTitle.trim()) {
      showToast('Judul materi panduan E-Library wajib diisi.', 'error');
      return;
    }

    const newItem: ELibraryItem = {
      id: 'elib-' + Date.now(),
      title: newElibTitle.trim(),
      badge: newElibBadge.trim(),
      badgeColorClass: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30',
      icon: newElibIcon,
      desc: newElibDesc.trim() || 'Panduan nutrisi dan gaya hidup sehat praktis anak kos.',
      actionText: 'Download PDF',
      fileUrl: newElibFileUrl.trim(),
    };

    const updated = [newItem, ...eLibraryItems];
    setELibraryItems(updated);
    localStorage.setItem('campusfit_elibrary_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    // Reset Form
    setNewElibTitle('');
    setNewElibDesc('');
    setNewElibFileUrl('');
    setNewElibFileName('');
    showToast(`Materi "${newItem.title}" berhasil dipublikasikan ke E-Library!`, 'success');
  };

  const handleDeleteELibraryItem = (id: string, title: string) => {
    if (!window.confirm(`Hapus panduan "${title}" dari E-Library?`)) return;
    const updated = eLibraryItems.filter((item) => item.id !== id);
    setELibraryItems(updated);
    localStorage.setItem('campusfit_elibrary_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    showToast(`Panduan "${title}" telah dihapus dari E-Library.`, 'success');
  };

  const handleClearAllELibrary = () => {
    if (!window.confirm('Kosongkan semua item di repositori E-Library?')) return;
    setELibraryItems([]);
    localStorage.setItem('campusfit_elibrary_items', JSON.stringify([]));
    window.dispatchEvent(new Event('storage'));
    showToast('Seluruh repositori E-Library telah dikosongkan.', 'success');
  };

  // PDF File Upload Handler
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewElibFileName(file.name);
      const fakeUrl = URL.createObjectURL(file);
      setNewElibFileUrl(fakeUrl);
      if (!newElibTitle) {
        setNewElibTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      showToast(`Berkas PDF "${file.name}" siap dipublikasikan.`, 'success');
    }
  };

  // Summary Statistics
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
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = (sub.full_name || '').toLowerCase().includes(q);
      const matchEmail = (sub.active_email || '').toLowerCase().includes(q);
      const matchPhone = (sub.phone_number || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'waiting') {
        const isWaiting = sub.status === 'waiting_confirmation' || (sub.status as any) === 'pending';
        if (!isWaiting) return false;
      } else if (sub.status !== statusFilter) {
        return false;
      }
    }

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
                Portal Kontrol Admin Kukusyuk CampusFit
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
        {/* MAIN NAVIGATION TABS FOR ADMIN                                            */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveAdminTab('verifikasi')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'verifikasi'
                ? 'bg-amber-500 text-zinc-950 shadow-amber-500/20 shadow-lg'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-neutral-300 border border-white/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verifikasi Pendaftaran VIP</span>
            {waitingConfirmationCount > 0 && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  activeAdminTab === 'verifikasi'
                    ? 'bg-zinc-950 text-amber-400'
                    : 'bg-amber-400 text-zinc-950 animate-pulse'
                }`}
              >
                {waitingConfirmationCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('menu-po')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'menu-po'
                ? 'bg-amber-500 text-zinc-950 shadow-amber-500/20 shadow-lg'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-neutral-300 border border-white/10'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Kelola Menu PO Batch #{poConfig.batchNumber}</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                activeAdminTab === 'menu-po' ? 'bg-zinc-950 text-amber-400' : 'bg-white/10 text-neutral-300'
              }`}
            >
              {poItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('elibrary')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'elibrary'
                ? 'bg-amber-500 text-zinc-950 shadow-amber-500/20 shadow-lg'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-neutral-300 border border-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kelola E-Library PDF</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                activeAdminTab === 'elibrary' ? 'bg-zinc-950 text-amber-400' : 'bg-white/10 text-neutral-300'
              }`}
            >
              {eLibraryItems.length}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: VERIFIKASI PEMBAYARAN VIP                                         */}
        {/* ========================================================================= */}
        {activeAdminTab === 'verifikasi' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Summary Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Total Pelanggan</span>
                  <Users className="w-4 h-4 text-neutral-300" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{totalSubscribers}</div>
                <p className="text-[11px] text-neutral-400 mt-1">Data akun terdaftar</p>
              </div>

              <div className="bg-zinc-900/70 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>VIP Aktif</span>
                  <Crown className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{activeVipCount}</div>
                <p className="text-[11px] text-emerald-300/80 mt-1">Langganan disetujui</p>
              </div>

              <div className="bg-zinc-900/70 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Menunggu Konfirmasi</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400">{waitingConfirmationCount}</div>
                <p className="text-[11px] text-amber-300/80 mt-1">Perlu dicek admin</p>
              </div>

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

            {/* 2. Filters & Search */}
            <div className="bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
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

              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-white/5">
                {[
                  { id: 'all', label: 'Semua Status', count: subscriptions.length },
                  { id: 'waiting', label: 'Menunggu Konfirmasi', count: waitingConfirmationCount, alert: true },
                  { id: 'approved', label: 'VIP Aktif (Approved)', count: activeVipCount },
                  { id: 'rejected', label: 'Ditolak (Rejected)', count: subscriptions.filter((s) => s.status === 'rejected').length },
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

            {/* 3. Monitoring Table */}
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
                        <th className="py-3.5 px-4 font-bold">Pelanggan</th>
                        <th className="py-3.5 px-4 font-bold">WhatsApp / Kontak</th>
                        <th className="py-3.5 px-4 font-bold">Pekerjaan</th>
                        <th className="py-3.5 px-4 font-bold">Nominal Transfer</th>
                        <th className="py-3.5 px-4 font-bold">Bukti QRIS</th>
                        <th className="py-3.5 px-4 font-bold">Status</th>
                        <th className="py-3.5 px-4 font-bold text-right">Aksi Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredSubscriptions.map((sub) => {
                        const isWaiting = sub.status === 'waiting_confirmation' || (sub.status as any) === 'pending';
                        const isApproved = sub.status === 'approved';
                        const isRejected = sub.status === 'rejected';

                        return (
                          <tr key={sub.id} className="hover:bg-white/[0.02] transition">
                            <td className="py-4 px-4">
                              <div className="font-bold text-white">{sub.full_name}</div>
                              <div className="text-neutral-400 text-[11px]">{sub.active_email}</div>
                              <div className="text-neutral-500 text-[10px] font-mono mt-0.5">ID: {sub.id}</div>
                            </td>
                            <td className="py-4 px-4 font-mono text-neutral-200">{sub.phone_number || '-'}</td>
                            <td className="py-4 px-4">
                              <span className="bg-white/10 text-neutral-300 text-xs px-2.5 py-1 rounded-lg">
                                {sub.job_status || 'Umum'}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-bold text-emerald-400">
                              Rp {(sub.amount || 60000).toLocaleString('id-ID')}
                            </td>
                            <td className="py-4 px-4">
                              {sub.payment_proof_url ? (
                                <button
                                  onClick={() => handleViewProof(sub.payment_proof_url)}
                                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Lihat Bukti</span>
                                </button>
                              ) : (
                                <span className="text-xs text-neutral-500 italic">Tidak ada foto</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {isApproved && (
                                <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-1 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>VIP Aktif</span>
                                </span>
                              )}
                              {isWaiting && (
                                <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Menunggu ACC</span>
                                </span>
                              )}
                              {isRejected && (
                                <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-bold px-2.5 py-1 rounded-full">
                                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                                  <span>Ditolak</span>
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              {isWaiting ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleApprove(sub.id, sub.full_name)}
                                    disabled={actionLoading === sub.id}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Setujui</span>
                                  </button>
                                  <button
                                    onClick={() => setRejectDialogId(sub.id)}
                                    disabled={actionLoading === sub.id}
                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Tolak</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-neutral-500 font-medium">
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
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KELOLA MENU PO BATCH                                               */}
        {/* ========================================================================= */}
        {activeAdminTab === 'menu-po' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Pengaturan Wewenang Admin: Nomor Batch & Durasi Countdown */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase mb-1">
                    Wewenang Admin Master
                  </div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span>Pengaturan Jadwal & Countdown PO Batch</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 font-semibold">Status PO:</span>
                  <button
                    type="button"
                    onClick={() => setBatchIsOpen(!batchIsOpen)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      batchIsOpen
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${batchIsOpen ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}`} />
                    <span>{batchIsOpen ? 'PO BUKA (AKTIF)' : 'PO TUTUP (OFF)'}</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSavePoSettings} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Nomor Batch PO:</label>
                  <div className="flex items-center">
                    <span className="bg-white/10 border border-r-0 border-white/15 px-3 py-2 rounded-l-xl text-neutral-400 font-bold">
                      #
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={batchNumInput}
                      onChange={(e) => setBatchNumInput(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/15 rounded-r-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">Akan tampil: "Menu PO Batch #{batchNumInput}"</span>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Durasi Countdown (Jam):</label>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={batchDurationHours}
                    onChange={(e) => setBatchDurationHours(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Hitung mundur otomatis dimulai dari sekarang</span>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Total Kuota Slot VIP:</label>
                  <input
                    type="number"
                    min={1}
                    value={batchTotalSlots}
                    onChange={(e) => setBatchTotalSlots(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Contoh: 30 slot per batch</span>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Sisa Slot Tersedia:</label>
                  <input
                    type="number"
                    min={0}
                    max={batchTotalSlots}
                    value={batchRemainingSlots}
                    onChange={(e) => setBatchRemainingSlots(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Tampil di counter sisa slot member</span>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 pt-2">
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Pengaturan Jadwal & Countdown Batch</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Form Tambah Menu Makanan PO Baru */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Tambah Varian Menu PO Batch #{poConfig.batchNumber}</span>
              </h2>

              <form onSubmit={handleAddPoItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Nama Menu Makanan:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dada Ayam Kukus Rempah Jahe"
                    value={newPoTitle}
                    onChange={(e) => setNewPoTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Jadwal Pengambilan:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Senin & Kamis / Jam Makan Siang"
                    value={newPoSchedule}
                    onChange={(e) => setNewPoSchedule(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Kategori / Badge:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Early VIP Pick / Healthy Snack"
                    value={newPoCategoryBadge}
                    onChange={(e) => setNewPoCategoryBadge(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Info Kalori & Nutrisi:</label>
                  <input
                    type="text"
                    placeholder="Contoh: 🔥 340 Kkal | 38g Protein"
                    value={newPoCalories}
                    onChange={(e) => setNewPoCalories(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Harga Normal (Rp):</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={newPoPriceOriginal}
                    onChange={(e) => setNewPoPriceOriginal(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Harga asli sebelum diskon VIP</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-300 font-semibold">Diskon Khusus VIP (%):</label>
                    <span className="text-[11px] font-bold text-amber-400">{newPoDiscountPercent}% OFF</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newPoDiscountPercent}
                    onChange={(e) => setNewPoDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-amber-300 font-bold outline-none focus:border-emerald-500"
                  />
                  {/* Preset Diskon Cepat */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[10, 15, 20, 25, 30, 35].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setNewPoDiscountPercent(pct)}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold transition cursor-pointer ${
                          newPoDiscountPercent === pct
                            ? 'bg-amber-400 text-zinc-950 shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Harga VIP Member <span className="text-emerald-400 font-bold">(Dihitung Otomatis Sistem)</span>:
                  </label>
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-3 py-2 flex items-center justify-between">
                    <div>
                      <div className="text-base font-extrabold text-emerald-400">
                        Rp {calculatedPoVipPrice.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-emerald-300/80">
                        Member hemat Rp {calculatedPoSavings.toLocaleString('id-ID')} ({newPoDiscountPercent}%)
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-md border border-emerald-500/30 uppercase tracking-wider">
                      Auto System
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Rumus: Normal × (100% - {newPoDiscountPercent}%)
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-300 font-semibold mb-1">Deskripsi Menu:</label>
                  <textarea
                    rows={2}
                    placeholder="Keterangan bahan, lauk pendamping, nasi merah/ubi..."
                    value={newPoDesc}
                    onChange={(e) => setNewPoDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Foto Menu Makanan:</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="URL Gambar (Unsplash / Link web)"
                      value={newPoImg}
                      onChange={(e) => setNewPoImg(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    />
                    <label className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-neutral-300 py-1.5 px-3 rounded-xl cursor-pointer text-[11px] font-bold border border-white/10">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Atau Pilih File Foto Komputer</span>
                      <input type="file" accept="image/*" onChange={handlePoImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-3 pt-2">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambahkan Menu ke PO Batch #{poConfig.batchNumber}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 3. Daftar Menu PO Aktif Saat Ini */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Daftar Menu Aktif di PO Batch #{poConfig.batchNumber} ({poItems.length} Varian)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Menu ini akan langsung muncul di halaman dashboard member VIP.
                  </p>
                </div>

                {poItems.length > 0 && (
                  <button
                    onClick={handleClearAllPoItems}
                    className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl border border-red-500/20 font-semibold cursor-pointer"
                  >
                    Kosongkan Semua Menu
                  </button>
                )}
              </div>

              {poItems.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                  <Utensils className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-neutral-300">Belum ada item menu yang diinput</h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Silakan gunakan form di atas untuk menambahkan menu katering kukus sehat ke dalam batch ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {poItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden"
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">{item.schedule}</span>
                          <h4 className="font-bold text-white text-sm truncate">{item.title}</h4>
                          <p className="text-neutral-400 text-[11px] line-clamp-2 mt-0.5">{item.desc}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-500 line-through block">
                            Rp {item.priceOriginal.toLocaleString('id-ID')}
                          </span>
                          <span className="font-bold text-emerald-400">
                            Rp {item.priceVip.toLocaleString('id-ID')} (VIP)
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeletePoItem(item.id, item.title)}
                          className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-xl transition cursor-pointer"
                          title="Hapus Menu Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Daftar Pesanan PO Masuk dari Member */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">
                      Daftar Pesanan PO Masuk (Batch #{poConfig.batchNumber})
                    </h3>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
                      {poOrders.length} Pesanan Masuk
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Setiap pelanggan memesan di dashboard member, slot kuota berkurang 1 otomatis dan detail pesanan tercatat di sini.
                  </p>
                </div>

                {poOrders.length > 0 && (
                  <button
                    onClick={handleClearOrders}
                    className="text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 font-semibold cursor-pointer transition"
                  >
                    Bersihkan Riwayat Pesanan
                  </button>
                )}
              </div>

              {poOrders.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                  <Clock className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-neutral-300">Belum ada pesanan PO yang masuk</h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Saat member mengklik tombol "Pesan PO" di dashboard VIP, data pemesanan akan otomatis tercatat dan mengurangi slot di tabel ini.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-neutral-400 text-[11px] uppercase tracking-wider bg-white/5">
                        <th className="py-3 px-4 font-bold">No. Order</th>
                        <th className="py-3 px-4 font-bold">Nama Member</th>
                        <th className="py-3 px-4 font-bold">Kontak / WA</th>
                        <th className="py-3 px-4 font-bold">Menu yang Dipesan</th>
                        <th className="py-3 px-4 font-bold">Harga VIP</th>
                        <th className="py-3 px-4 font-bold">Waktu Pesan</th>
                        <th className="py-3 px-4 font-bold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {poOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{ord.id}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{ord.memberName}</div>
                            <div className="text-[11px] text-neutral-400">{ord.memberEmail}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-neutral-300">{ord.memberPhone || '-'}</td>
                          <td className="py-3.5 px-4 font-medium text-white">{ord.itemTitle}</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-400">
                            Rp {ord.itemPrice.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400 text-xs">
                            {new Date(ord.orderedAt).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteOrder(ord.id, ord.itemTitle)}
                              className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                              title="Batalkan & Kembalikan 1 Slot"
                            >
                              Batal (+1 Slot)
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: KELOLA E-LIBRARY PDF                                              */}
        {/* ========================================================================= */}
        {activeAdminTab === 'elibrary' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Form Unggah / Tambah Panduan PDF */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <BookOpen className="w-5 h-5 text-sky-400" />
                <span>Unggah Materi Baru ke E-Library PDF</span>
              </h2>

              <form onSubmit={handleAddELibraryItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-neutral-300 font-semibold mb-1">Judul Panduan / E-Book:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hack Food Kos: Makan Enak & Sehat Tanpa Kompor"
                    value={newElibTitle}
                    onChange={(e) => setNewElibTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Kategori / Badge:</label>
                  <select
                    value={newElibBadge}
                    onChange={(e) => setNewElibBadge(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    <option value="Cheatsheet PDF" className="bg-zinc-900">Cheatsheet PDF</option>
                    <option value="Panduan Medis PDF" className="bg-zinc-900">Panduan Medis PDF</option>
                    <option value="Resep Kilat PDF" className="bg-zinc-900">Resep Kilat PDF</option>
                    <option value="E-Book Eksklusif" className="bg-zinc-900">E-Book Eksklusif</option>
                    <option value="Manual Steamer" className="bg-zinc-900">Manual Steamer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Pilihan Ikon Emoji:</label>
                  <div className="flex gap-2">
                    {['📑', '🥗', '⚡', '📖', '🍱'].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewElibIcon(icon)}
                        className={`text-xl p-2 rounded-xl border transition ${
                          newElibIcon === icon
                            ? 'bg-sky-500/20 border-sky-400 shadow-md'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-300 font-semibold mb-1">Berkas PDF atau Link Download URL:</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan Link URL File PDF (Google Drive, Cloudinary, dsb)..."
                      value={newElibFileUrl}
                      onChange={(e) => setNewElibFileUrl(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                    />
                    <label className="flex items-center justify-center gap-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 py-2 px-3 rounded-xl cursor-pointer font-bold whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{newElibFileName ? 'File Terpilih' : 'Unggah File PDF'}</span>
                      <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                    </label>
                  </div>
                  {newElibFileName && (
                    <span className="text-[11px] text-emerald-400 mt-1 block font-mono">
                      ✓ Berkas: {newElibFileName}
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-neutral-300 font-semibold mb-1">Deskripsi Singkat Panduan:</label>
                  <textarea
                    rows={2}
                    placeholder="Ulasan ringkas isi materi panduan untuk anak kos..."
                    value={newElibDesc}
                    onChange={(e) => setNewElibDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 pt-2">
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publikasikan ke E-Library Member VIP</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Daftar Panduan E-Library Aktif */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Koleksi E-Library Saat Ini ({eLibraryItems.length} Dokumen)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Materi ini dapat langsung diunduh oleh member VIP di halaman CampusFit.
                  </p>
                </div>

                {eLibraryItems.length > 0 && (
                  <button
                    onClick={handleClearAllELibrary}
                    className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl border border-red-500/20 font-semibold cursor-pointer"
                  >
                    Kosongkan Semua Panduan
                  </button>
                )}
              </div>

              {eLibraryItems.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                  <BookOpen className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-neutral-300">Belum ada panduan E-Library yang diunggah</h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Gunakan form di atas untuk menambahkan e-book atau modul PDF tips nutrisi kosan.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eLibraryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{item.icon || '📑'}</span>
                          <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                        <p className="text-neutral-400 text-xs mt-1 line-clamp-2">{item.desc}</p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        {item.fileUrl ? (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 underline font-semibold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka Dokumen</span>
                          </a>
                        ) : (
                          <span className="text-neutral-500 text-[11px] italic">Tanpa link eksternal</span>
                        )}

                        <button
                          onClick={() => handleDeleteELibraryItem(item.id, item.title)}
                          className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-xl transition cursor-pointer"
                          title="Hapus Panduan Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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
