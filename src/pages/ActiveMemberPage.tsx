import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Crown,
  LayoutDashboard,
  Utensils,
  Bot,
  BookOpen,
  Bell,
  CheckCircle2,
  Droplets,
  Plus,
  Send,
  X,
  Menu,
  LogOut,
  History,
  Clock,
  RotateCcw
} from 'lucide-react';
import { supabase, ADMIN_EMAIL } from '../lib/supabaseClient';

export interface PoItem {
  id: string | number;
  title: string;
  schedule: string;
  categoryBadge: string;
  categoryColor: string;
  calories: string;
  desc: string;
  priceOriginal: number;
  priceVip: number;
  img: string;
}

export interface ELibraryItem {
  id: string;
  icon: string;
  badge: string;
  badgeColorClass: string;
  title: string;
  desc: string;
  actionText: string;
  fileUrl?: string;
}

export interface PoConfig {
  batchNumber: number;
  durationHours: number;
  durationMinutes: number;
  targetDate: string;
  totalSlots: number;
  remainingSlots: number;
  isOpen: boolean;
}

export const DEFAULT_PO_CONFIG: PoConfig = {
  batchNumber: 1,
  durationHours: 24,
  durationMinutes: 0,
  targetDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  totalSlots: 30,
  remainingSlots: 30,
  isOpen: true,
};

export interface WaterLog {
  id: string;
  time: string;
  glassNumber: number;
  amountMl: number;
  note: string;
}

export interface DailyWaterState {
  date: string;
  logs: WaterLog[];
}

const MAX_WATER_GLASSES = 8;
const GLASS_SIZE_ML = 250;

const getTodayDateKey = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayDateFormatted = (): string => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const loadInitialWaterData = (): DailyWaterState => {
  const today = getTodayDateKey();
  try {
    const saved = localStorage.getItem('campusfit_water_tracker_v2');
    if (saved) {
      const parsed: DailyWaterState = JSON.parse(saved);
      if (parsed.date === today && Array.isArray(parsed.logs)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  const fresh: DailyWaterState = { date: today, logs: [] };
  localStorage.setItem('campusfit_water_tracker_v2', JSON.stringify(fresh));
  return fresh;
};

export const ActiveMemberPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  // Navigation & UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'early-batch' | 'asisten-tracker' | 'elibrary'>('dashboard');

  // Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  // Profile State
  const [memberProfile, setMemberProfile] = useState({
    name: 'Member VIP',
    email: '',
    phone: '',
    university: 'Civitas Kampus',
    campus: 'Surabaya',
    daysLeft: 30,
    validUntil: '30 Hari Kedepan',
    mealsLeft: '20 / 20',
    promoCode: 'UPNSEHAT'
  });

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editUniv, setEditUniv] = useState('');

  // PO Batch Config & Items State (Initialized empty as requested)
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

  // E-Library Resources State (Initialized empty as requested)
  const [eLibraryItems, setELibraryItems] = useState<ELibraryItem[]>(() => {
    try {
      const saved = localStorage.getItem('campusfit_elibrary_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 24,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  // Live countdown calculation
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!poConfig.isOpen) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const target = new Date(poConfig.targetDate).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isExpired: false });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [poConfig]);

  // Listen for admin storage changes in real time
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedConfig = localStorage.getItem('campusfit_po_config');
        if (savedConfig) setPoConfig(JSON.parse(savedConfig));

        const savedItems = localStorage.getItem('campusfit_po_items');
        if (savedItems) setPoItems(JSON.parse(savedItems));

        const savedLib = localStorage.getItem('campusfit_elibrary_items');
        if (savedLib) setELibraryItems(JSON.parse(savedLib));
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Access Verification: Only users with an active VIP subscription can view
  useEffect(() => {
    const verifyMemberAccess = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          alert('Halaman ini khusus untuk member VIP aktif Kukusyuk. Silakan masuk terlebih dahulu.');
          navigate('/login');
          return;
        }

        const user = data.user;
        const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        let isVip = Boolean(user.user_metadata?.is_vip) || isAdmin;

        // Double check subscription record in database
        try {
          const res = await supabase.rpc('get_my_vip_subscription');
          const sub = res?.data;
          if (sub && sub.status === 'approved') {
            isVip = true;
          } else if (sub && (sub.status === 'waiting_confirmation' || sub.status === 'pending')) {
            alert('Pembayaran Anda sedang dalam proses verifikasi admin. Menuju ke halaman status...');
            navigate('/payment/waiting');
            return;
          }
        } catch {
          // fallback
        }

        if (!isVip) {
          alert('Halaman ini hanya dapat diakses oleh member yang telah membayar biaya membership. Silakan lakukan pendaftaran.');
          navigate('/introduction');
          return;
        }

        const fullName =
          user.user_metadata?.full_name ||
          `${user.user_metadata?.first_name || ''} ${user.user_metadata?.surname || ''}`.trim() ||
          user.email?.split('@')[0] ||
          'Member VIP';

        const phone = user.user_metadata?.phone_number || '-';
        const univ = user.user_metadata?.job_status || 'Civitas Kampus';

        setMemberProfile((prev) => ({
          ...prev,
          name: fullName,
          email: user.email || '',
          phone,
          university: univ,
        }));

        setEditName(fullName);
        setEditPhone(phone);
        setEditUniv(univ);
        setIsVerifying(false);
      } catch {
        navigate('/login');
      }
    };

    verifyMemberAccess();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Water Tracker State (Mulai dari 0, reset otomatis setiap 00:00)
  const [waterState, setWaterState] = useState<DailyWaterState>(loadInitialWaterData);
  const waterCount = waterState.logs.length;
  const maxWater = MAX_WATER_GLASSES;

  // Cek berkala jika pergantian hari (00:00) terjadi saat halaman sedang dibuka
  useEffect(() => {
    const checkMidnightReset = () => {
      const today = getTodayDateKey();
      setWaterState((prev) => {
        if (prev.date !== today) {
          const fresh: DailyWaterState = { date: today, logs: [] };
          localStorage.setItem('campusfit_water_tracker_v2', JSON.stringify(fresh));
          return fresh;
        }
        return prev;
      });
    };

    const interval = setInterval(checkMidnightReset, 20000);
    return () => clearInterval(interval);
  }, []);

  const addWaterGlass = () => {
    const today = getTodayDateKey();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const currentLogs = waterState.date === today ? waterState.logs : [];
    const nextGlassNum = currentLogs.length + 1;

    let note = 'Hidrasi Harian';
    if (nextGlassNum === 1) note = 'Bangun Tidur & Pagi';
    else if (nextGlassNum === 2) note = 'Sebelum Sarapan';
    else if (nextGlassNum === 3) note = 'Sesi Kuliah Pagi';
    else if (nextGlassNum === 4) note = 'Sebelum Makan Siang';
    else if (nextGlassNum === 5) note = 'Setelah Makan Siang';
    else if (nextGlassNum === 6) note = 'Sore Nugas Kosan';
    else if (nextGlassNum === 7) note = 'Makan Malam';
    else if (nextGlassNum >= 8) note = 'Malam Hari (Target Tercapai)';

    const newLog: WaterLog = {
      id: 'w-' + Date.now(),
      time: timeStr,
      glassNumber: nextGlassNum,
      amountMl: GLASS_SIZE_ML,
      note,
    };

    const updatedLogs = [...currentLogs, newLog];
    const updatedState: DailyWaterState = { date: today, logs: updatedLogs };
    setWaterState(updatedState);
    localStorage.setItem('campusfit_water_tracker_v2', JSON.stringify(updatedState));

    if (nextGlassNum === MAX_WATER_GLASSES) {
      confetti({ particleCount: 80, spread: 75 });
      alert('🎉 Luar biasa! Target hidrasi 2 liter (8 gelas) harianmu sudah tercapai sempurna!');
    }
  };

  const removeLastWaterGlass = () => {
    if (waterState.logs.length === 0) return;
    const updatedLogs = waterState.logs.slice(0, -1);
    const updatedState: DailyWaterState = { ...waterState, logs: updatedLogs };
    setWaterState(updatedState);
    localStorage.setItem('campusfit_water_tracker_v2', JSON.stringify(updatedState));
  };

  // Meal Reminders State
  const [mealReminders, setMealReminders] = useState({
    sarapan: true,
    lunch: true,
    snack: true,
    dinner: true,
  });

  const toggleMealReminder = (meal: keyof typeof mealReminders) => {
    setMealReminders((prev) => {
      const updated = { ...prev, [meal]: !prev[meal] };
      alert(`Pengingat ${meal.toUpperCase()} berhasil di-${updated[meal] ? 'aktifkan' : 'nonaktifkan'}.`);
      return updated;
    });
  };

  // AI Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Halo Nabila! 👋 Saya asisten nutrisi pribadimu di Kukusyuk CampusFit. Ada yang bisa saya bantu seputar kalori, menu diet kosan, atau jam makan hari ini?',
    },
    {
      sender: 'user',
      text: 'Kalau makan siang dada ayam rempah jahe + ubi kukus, nutrisi dan kalorinya cukup gak ya buat nugas sampai malam?',
    },
    {
      sender: 'ai',
      text: 'Sangat cukup dan ideal! Kombinasi dada ayam kukus (38g protein) dan karbohidrat kompleks dari ubi kukus menjaga energi tetap stabil tanpa menyebabkan kantuk (sugar crash). Total kalori sekitar 340 Kkal.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSendChat = (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const query = customMsg || chatInput.trim();
    if (!query) return;

    const newMsgs = [...chatMessages, { sender: 'user' as const, text: query }];
    setChatMessages(newMsgs);
    if (!customMsg) setChatInput('');

    setTimeout(() => {
      let reply = 'Pilihan bagus! Mengonsumsi makanan kukus menjaga energi tetap stabil tanpa membuat begah saat kuliah.';
      const lower = query.toLowerCase();

      if (lower.includes('resep') || lower.includes('kilat') || lower.includes('kos')) {
        reply = 'Resep kukus kilat 10 menit kosan: Tahu Sutra Siram Jamur Enoki & Dada Ayam Suwir Jahe Garam! Cukup kukus 8-10 menit, sangat praktis tanpa minyak.';
      } else if (lower.includes('kalori') || lower.includes('dimsum') || lower.includes('gorengan')) {
        reply = 'Perbandingannya signifikan! 4 pcs Dimsum Oat Kukus hanya 190 Kkal (0% trans fat). Sedangkan 2 pcs gorengan bakwan bisa mencapai 380 Kkal dengan minyak jenuh!';
      } else if (lower.includes('maag') || lower.includes('asam lambung') || lower.includes('begadang')) {
        reply = 'Tips cegah maag saat begadang: 1) Jangan kosongkan lambung lebih dari 4 jam, 2) Siapkan camilan karbo halus seperti ubi kukus hangat, 3) Hindari kopi pekat di atas jam 9 malam.';
      }

      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleOrderPo = (item: PoItem) => {
    // 1. Cek apakah PO sedang dibuka oleh admin
    if (!poConfig.isOpen) {
      alert('Mohon maaf, status pemesanan PO Batch saat ini sedang ditutup oleh admin.');
      return;
    }

    // 2. Cek apakah countdown telah habis
    if (timeLeft.isExpired) {
      alert('Mohon maaf, waktu pemesanan untuk PO Batch ini telah berakhir.');
      return;
    }

    // 3. Cek apakah slot masih tersedia
    if (poConfig.remainingSlots <= 0) {
      alert('Mohon maaf, kuota slot VIP untuk PO Batch ini sudah habis terisi!');
      return;
    }

    // Kurangi 1 slot dari kuota batch
    const newRemaining = Math.max(0, poConfig.remainingSlots - 1);
    const updatedConfig: PoConfig = {
      ...poConfig,
      remainingSlots: newRemaining,
    };

    setPoConfig(updatedConfig);
    localStorage.setItem('campusfit_po_config', JSON.stringify(updatedConfig));

    // Catat data pesanan member ke daftar pesanan PO
    try {
      const existingOrders = JSON.parse(localStorage.getItem('campusfit_po_orders') || '[]');
      const newOrder = {
        id: 'PO-' + Date.now().toString().slice(-6),
        batchNumber: poConfig.batchNumber,
        memberName: memberProfile.name,
        memberEmail: memberProfile.email,
        memberPhone: memberProfile.phone,
        itemTitle: item.title,
        itemPrice: item.priceVip,
        orderedAt: new Date().toISOString(),
      };
      existingOrders.unshift(newOrder);
      localStorage.setItem('campusfit_po_orders', JSON.stringify(existingOrders));
    } catch {
      // ignore
    }

    // Trigger sync ke seluruh tab dan halaman admin
    window.dispatchEvent(new Event('storage'));

    confetti({ particleCount: 80, spread: 75 });
    alert(
      `🎉 Pesanan Berhasil!\n\n` +
      `Menu: "${item.title}"\n` +
      `Harga VIP: Rp ${item.priceVip.toLocaleString('id-ID')}\n\n` +
      `Sisa kuota slot berkurang 1 (Tersisa: ${newRemaining} dari ${poConfig.totalSlots} slot).`
    );
  };

  // Extend Membership Confirmation
  const handleConfirmExtend = () => {
    confetti({ particleCount: 90, spread: 80 });
    setMemberProfile((prev) => ({
      ...prev,
      daysLeft: prev.daysLeft + 30,
    }));
    setExtendModalOpen(false);
    alert('Permintaan perpanjangan VIP 30 hari berhasil dikirim! Silakan tunggu konfirmasi admin via WhatsApp.');
  };

  // Save Profile Edit
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberProfile((prev) => ({
      ...prev,
      name: editName,
      phone: editPhone,
      university: editUniv,
    }));
    setEditProfileModalOpen(false);
    alert('Profil berhasil diperbarui!');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">Memverifikasi keanggotaan VIP Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white pb-20">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-emerald-100 text-xs py-2 px-4 sm:px-8 text-center font-medium flex items-center justify-center gap-3 border-b border-emerald-800/40 relative z-50">
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-400/30 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          PORTAL KHUSUS MEMBER
        </span>
        <span className="truncate sm:overflow-visible">
          Selamat datang kembali! Early Batch #{poConfig.batchNumber} resmi dibuka dengan diskon PO otomatis 15% untuk civitas UPN.
        </span>
        <a href="#early-batch" className="underline hover:text-white font-bold ml-1 transition whitespace-nowrap">
          Lihat Menu PO →
        </a>
      </div>

      {/* CampusFit Sub Header Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 gap-4">
          {/* Logo & VIP Label */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-emerald-600 p-0.5 flex items-center justify-center shadow-md shrink-0 overflow-hidden">
              <img
                src="/logo-kukusyuk.png"
                alt="Logo Kukusyuk"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/images/logo-kukusyuk.png')) {
                    target.src = '/images/logo-kukusyuk.png';
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">KUKUSYUK</span>
                <span className="text-emerald-400 text-xs font-bold tracking-wider">CAMPUSFIT</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded text-[9px] font-black uppercase">
                  👑 VIP ACTIVE
                </span>
                <span className="text-[10px] text-slate-400">• Sisa {memberProfile.daysLeft} Hari</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-2 text-xs font-bold">
            <a
              href="#dashboard"
              onClick={() => setActiveSection('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                activeSection === 'dashboard'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
            <a
              href="#early-batch"
              onClick={() => setActiveSection('early-batch')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                activeSection === 'early-batch'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Early Batch PO</span>
            </a>
            <a
              href="#asisten-tracker"
              onClick={() => setActiveSection('asisten-tracker')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                activeSection === 'asisten-tracker'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Asisten AI & Tracker</span>
            </a>
            <a
              href="#elibrary"
              onClick={() => setActiveSection('elibrary')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                activeSection === 'elibrary'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>E-Library</span>
            </a>
          </nav>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-2xl p-1.5 pr-3.5 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-bold text-xs">
                {memberProfile.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{memberProfile.name}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-[10px] text-emerald-400">{memberProfile.university}</div>
              </div>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 space-y-2 text-sm font-semibold">
            <a href="#dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-emerald-400 hover:bg-slate-800 rounded-lg">
              Dashboard
            </a>
            <a href="#early-batch" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">
              Early Batch PO
            </a>
            <a href="#asisten-tracker" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">
              Asisten AI & Tracker
            </a>
            <a href="#elibrary" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">
              E-Library PDF Hack
            </a>
          </div>
        )}
      </header>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
        {/* SECTION 1: DASHBOARD WELCOME & QUICK STATS */}
        <section id="dashboard" className="scroll-mt-24">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                  <span>🎓 Mahasiswa Terverifikasi</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>VIP Member</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  Selamat Datang di VIP Dashboard, <br />
                  <span className="text-emerald-400">{memberProfile.name}!</span> 🥗
                </h1>

                <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                  Paket aktifmu: <strong>VIP Fitur + Katering Sehat Bulanan</strong>. Nikmati kemudahan memesan PO menu lebih awal, alarm jam makan kuliah, konsultasi bot AI nutrisi, dan akses bebas ke koleksi panduan E-Library!
                </p>

                {/* 3 Quick Stats Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Masa Aktif</span>
                    <span className="text-xl font-extrabold text-emerald-400">{memberProfile.daysLeft} Hari</span>
                    <span className="text-[10px] text-slate-400 block">s/d {memberProfile.validUntil}</span>
                  </div>

                  <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Sisa Jatah Makan</span>
                    <span className="text-xl font-extrabold text-white">{memberProfile.mealsLeft}</span>
                    <span className="text-[10px] text-slate-400 block">Porsi Siang Kampus</span>
                  </div>

                  <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Kode Promo Kamu</span>
                    <span className="text-sm font-extrabold text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/30 inline-block">
                      {memberProfile.promoCode}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">Diskon 15% PO Otomatis</span>
                  </div>
                </div>
              </div>

              {/* Quick Reminder & Water Card */}
              <div className="lg:col-span-4 bg-slate-900/90 border border-emerald-500/30 p-5 rounded-3xl space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5" />
                      <span>REMINDER JAM MAKAN</span>
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-2 py-0.5 rounded-full">
                      AKTIF
                    </span>
                  </div>

                  <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🍱</span>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Jadwal Terdekat</span>
                        <h4 className="text-sm font-bold text-white">Makan Siang (Lunch)</h4>
                        <span className="text-[11px] text-slate-400">Ready at Drop Point Kantin</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-400/30 block">
                        12:30 WIB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-sky-400" />
                      <span>Target Hidrasi Air</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-400">
                      {waterCount} / {maxWater} Gelas ({waterCount * 250} ml)
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-2.5">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-blue-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (waterCount / maxWater) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={addWaterGlass}
                      className="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Catat 1 Gelas</span>
                    </button>
                    <a
                      href="#asisten-tracker"
                      className="bg-white/10 hover:bg-white/15 text-sky-300 text-xs font-semibold py-2.5 px-3 rounded-xl border border-sky-400/30 transition flex items-center gap-1.5 whitespace-nowrap"
                      title="Buka Riwayat & Jam Minum di Tracker"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Riwayat</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: EARLY BATCH PRE-ORDER */}
        <section id="early-batch" className="scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black px-3 py-1 rounded-full uppercase mb-2">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>VIP EXCLUSIVE: EARLY BATCH PRE-ORDER</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Menu PO Batch #{poConfig.batchNumber}
              </h2>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Sebagai member VIP, Anda mendapatkan akses 24 jam lebih awal sebelum kuota katering dibuka ke publik.
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center gap-4">
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Slot Eksklusif VIP</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {poConfig.remainingSlots} / {poConfig.totalSlots} Tersisa
                </span>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Sisa Waktu PO</span>
                {!poConfig.isOpen || timeLeft.isExpired ? (
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 block mt-0.5">
                    Ditutup
                  </span>
                ) : (
                  <span className="text-sm font-mono font-bold text-amber-300">
                    {timeLeft.hours} Jam : {timeLeft.minutes} Mnt : {timeLeft.seconds} Dtk
                  </span>
                )}
              </div>
            </div>
          </div>

          {poItems.length === 0 ? (
            <div className="py-14 px-6 sm:px-10 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-3xl text-center max-w-2xl mx-auto shadow-inner">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl">
                <Utensils className="w-8 h-8" />
              </div>
              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-black px-3 py-1 rounded-full uppercase mb-3">
                Pre-Order Belum Dibuka
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                Belum Ada Menu untuk PO Batch #{poConfig.batchNumber}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
                Admin dapur Kukusyuk belum menambahkan varian menu kukus untuk batch ini. Silakan pantau pengumuman resmi atau tunggu notifikasi WhatsApp saat batch resmi dimulai.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {poItems.map((item) => (
                <div key={item.id} className="bg-slate-800/90 rounded-2xl overflow-hidden border border-slate-700 shadow-md flex flex-col justify-between group hover:border-emerald-500/40 transition">
                  <div className="relative h-44 bg-slate-700 overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <span className={`absolute top-2 left-2 ${item.categoryColor || 'bg-emerald-600 text-white'} text-[10px] font-black px-2 py-0.5 rounded-full uppercase`}>
                      {item.categoryBadge}
                    </span>
                    <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {item.calories}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase">{item.schedule}</span>
                      <h3 className="font-bold text-base text-white mt-1 group-hover:text-emerald-300 transition">{item.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-700/80 mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] line-through text-slate-500 block">Rp {item.priceOriginal.toLocaleString('id-ID')}</span>
                        <span className="text-base font-extrabold text-emerald-400">Rp {item.priceVip.toLocaleString('id-ID')}</span>
                      </div>
                      <button
                        onClick={() => handleOrderPo(item)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition cursor-pointer"
                      >
                        Pesan PO
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 3: ASISTEN AI & TRACKER */}
        <section id="asisten-tracker" className="scroll-mt-24">
          <div className="mb-8">
            <span className="text-emerald-400 text-xs font-extrabold uppercase tracking-wider block">
              CAMPUSFIT SMART ASSISTANT & TRACKER
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Tracker Hidrasi Air, Alarm Makan & Asisten AI
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Pantau hidrasi air 2 liter harian dengan catatan jam otomatis, aktifkan alarm jam makan kuliah, dan konsultasikan gizi bersama bot AI nutrisi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Water Tracker & Meal Reminder */}
            <div className="lg:col-span-7 space-y-6">
              {/* CARD A: TRACKER HIDRASI AIR LENGKAP */}
              <div id="tracker-hidrasi" className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-5">
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                        <span>Tracker Hidrasi Air 2 Liter</span>
                        <span className="text-xs bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                          8 Gelas
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        <span>Mulai dari 0 & reset otomatis setiap 00:00 WIB</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Hari Ini</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {getTodayDateFormatted()}
                    </span>
                  </div>
                </div>

                {/* Counter & Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
                        {waterCount}
                        <span className="text-base font-normal text-slate-400"> / {maxWater} Gelas</span>
                      </span>
                      <span className="text-xs text-slate-300 ml-2 font-medium">
                        ({waterCount * GLASS_SIZE_ML} ml dari 2.000 ml)
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-sky-300 bg-sky-950/60 border border-sky-500/30 px-2.5 py-1 rounded-xl">
                      {Math.min(100, Math.round((waterCount / maxWater) * 100))}% Tercapai
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-sky-400 via-blue-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${Math.min(100, (waterCount / maxWater) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 8 Glass Visual Grid */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                    Indikator 8 Gelas Harian
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {Array.from({ length: maxWater }).map((_, idx) => {
                      const glassNum = idx + 1;
                      const isFilled = idx < waterCount;
                      const log = isFilled ? waterState.logs[idx] : null;

                      return (
                        <div
                          key={idx}
                          className={`flex flex-col items-center justify-between p-2 rounded-xl text-center border transition ${
                            isFilled
                              ? 'bg-sky-500/20 border-sky-400/40 text-white shadow-sm'
                              : 'bg-slate-900/40 border-slate-700 text-slate-500'
                          }`}
                        >
                          <span className="text-lg">{isFilled ? '🥛' : '🥤'}</span>
                          <span className={`text-[10px] font-bold mt-1 ${isFilled ? 'text-sky-300' : 'text-slate-400'}`}>
                            #{glassNum}
                          </span>
                          <span className="text-[9px] font-mono mt-0.5 truncate w-full">
                            {log ? log.time.split(' ')[0] : '250ml'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={addWaterGlass}
                    className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Catat Minum 1 Gelas (+250 ml)</span>
                  </button>

                  {waterCount > 0 && (
                    <button
                      onClick={removeLastWaterGlass}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold py-3 px-3.5 rounded-2xl border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                      title="Batalkan catatan minum terakhir"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Batalkan Terakhir</span>
                    </button>
                  )}
                </div>

                {/* RIWAYAT CATATAN MINUM & DETAIL JAM */}
                <div className="pt-4 border-t border-slate-700/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-sky-400" />
                      <span>Riwayat Catatan Minum Hari Ini</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {waterCount} Catatan
                    </span>
                  </div>

                  {waterCount === 0 ? (
                    <div className="bg-slate-900/50 rounded-2xl border border-dashed border-slate-700/80 p-5 text-center">
                      <Droplets className="w-8 h-8 text-slate-600 mx-auto mb-1.5" />
                      <h4 className="text-xs font-bold text-slate-300">Belum ada riwayat minum hari ini</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                        Counter dimulai dari 0 dan otomatis kereset setiap jam 00:00 WIB. Klik tombol di atas saat kamu minum segelas air.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                      {waterState.logs.map((log) => (
                        <div
                          key={log.id}
                          className="bg-slate-900/70 border border-slate-700/70 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs hover:border-sky-500/30 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                              #{log.glassNumber}
                            </span>
                            <div>
                              <div className="font-semibold text-white">
                                Minum 1 Gelas (+{log.amountMl} ml)
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {log.note}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-sky-400 bg-sky-950/70 border border-sky-500/30 px-2 py-0.5 rounded-lg text-[11px]">
                              <Clock className="w-3 h-3 text-sky-400" />
                              <span>{log.time}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CARD B: ALARM JAM MAKAN KULIAH */}
              <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-base text-white">Alarm Jam Makan Kuliah</h3>
                  </div>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">Sinkron WA</span>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'sarapan', label: 'Sarapan Berenergi', time: '07:15 WIB', desc: 'Oatmeal / Telur Kukus & Buah', icon: '🍳' },
                    { key: 'lunch', label: 'Makan Siang (Lunch)', time: '12:30 WIB', desc: 'Drop Point Kantin Kampus', icon: '🍱' },
                    { key: 'snack', label: 'Snack Sore Nugas', time: '16:15 WIB', desc: 'Dimsum Oat / Ubi Cilembu', icon: '🥟' },
                    { key: 'dinner', label: 'Makan Malam Ringan', time: '19:00 WIB', desc: 'Tofu Kukus & Sayur Rebus', icon: '🥗' },
                  ].map((meal) => (
                    <div key={meal.key} className="bg-slate-800 p-3 rounded-2xl border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{meal.icon}</span>
                        <div>
                          <h5 className="text-xs font-bold text-white">{meal.label}</h5>
                          <p className="text-[11px] text-slate-400">{meal.time} • {meal.desc}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={mealReminders[meal.key as keyof typeof mealReminders]}
                        onChange={() => toggleMealReminder(meal.key as keyof typeof mealReminders)}
                        className="accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: AI Nutrition Chatbot */}
            <div className="lg:col-span-5 bg-slate-800/90 rounded-3xl p-6 border border-slate-700 flex flex-col justify-between h-[640px] shadow-xl">
              <div className="pb-3 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">CampusFit AI Nutrition Assistant</h3>
                    <p className="text-[11px] text-slate-400">Konsultasi kalori & tips menu diet kosan</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Chat Message Window */}
              <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        AI
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[80%] ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-slate-700/80 text-slate-200 border border-slate-600/50 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-slate-700 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {memberProfile.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts & Input */}
              <div className="pt-3 border-t border-slate-700 space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
                  <button
                    onClick={() => handleSendChat(undefined, 'Berapa kalori dimsum oat kukus vs gorengan?')}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer"
                  >
                    🥟 Cek Kalori Dimsum vs Gorengan
                  </button>
                  <button
                    onClick={() => handleSendChat(undefined, 'Tips makan sehat anak kos tanpa kompor?')}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer"
                  >
                    🥗 Resep Kukus 10 Menit Kosan
                  </button>
                </div>

                <form onSubmit={handleSendChat} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tanyakan kalori menu, tips maag, atau resep kukus..."
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: E-LIBRARY PDF GUIDES */}
        <section id="elibrary" className="scroll-mt-24">
          <div className="mb-8">
            <span className="text-sky-400 text-xs font-extrabold uppercase tracking-wider block">REPOSITORI PANDUAN & EDUKASI</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">E-Library: PDF Hack Food Kos</h2>
          </div>

          {eLibraryItems.length === 0 ? (
            <div className="py-14 px-6 sm:px-10 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-3xl text-center max-w-2xl mx-auto shadow-inner">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-3xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <span className="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-300 border border-sky-500/30 text-[11px] font-black px-3 py-1 rounded-full uppercase mb-3">
                Koleksi Belum Diunggah
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                Saat ini belum ada panduan PDF yang tersedia
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
                Admin sedang menyiapkan modul resep kukus kilat dan cheatsheet kalori makanan kos terbaru. Materi edukasi akan segera tampil di sini setelah admin mengunggah dokumen baru.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eLibraryItems.map((item) => (
                <div key={item.id} className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 shadow-md flex flex-col justify-between hover:border-sky-500/40 transition">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{item.icon || '📑'}</span>
                      <span className={`${item.badgeColorClass || 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'} text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase`}>
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                  </div>

                  <a
                    href={item.fileUrl || '#'}
                    target={item.fileUrl ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!item.fileUrl) {
                        e.preventDefault();
                        alert(`Mengunduh file: "${item.title}". File akan segera tersimpan.`);
                      }
                    }}
                    className="mt-6 w-full text-center bg-slate-700 hover:bg-sky-600 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer block"
                  >
                    {item.actionText || 'Download PDF'}
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL 1: PROFIL MEMBER & KARTU DIGITAL */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-slate-700">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                {memberProfile.name.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-white">{memberProfile.name}</h3>
              <p className="text-xs text-emerald-400 font-semibold">{memberProfile.university} • Surabaya</p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">ID Member VIP:</span>
                <span className="font-mono font-bold text-white">#VIP-2026-8891</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-medium text-white">{memberProfile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WhatsApp:</span>
                <span className="font-medium text-white">{memberProfile.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Masa Aktif VIP:</span>
                <span className="font-bold text-emerald-400">{memberProfile.daysLeft} Hari (s/d {memberProfile.validUntil})</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setProfileModalOpen(false);
                    setEditProfileModalOpen(true);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Edit Profil
                </button>
                <button
                  onClick={() => {
                    setProfileModalOpen(false);
                    setExtendModalOpen(true);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Perpanjang VIP
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold py-2.5 rounded-xl transition mt-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Sign Out)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PROFIL */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setEditProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Edit Data Profil</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kampus / Universitas</label>
                <input
                  type="text"
                  value={editUniv}
                  onChange={(e) => setEditUniv(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition mt-2 cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PERPANJANG VIP (QRIS) */}
      {extendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white text-center shadow-2xl relative">
            <button
              onClick={() => setExtendModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white">Perpanjang VIP CampusFit</h3>
            <p className="text-xs text-slate-400 mt-1">Paket 30 Hari — Rp 60.000</p>

            <div className="my-5 p-4 bg-white rounded-2xl inline-block shadow-md">
              <img
                src="/qris-kukusyuk.png"
                alt="QRIS Kukusyuk"
                className="w-48 h-48 object-contain mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <p className="text-[10px] text-slate-700 font-bold mt-2">Scan QRIS via BCA, GoPay, OVO, Dana</p>
            </div>

            <button
              onClick={handleConfirmExtend}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
            >
              Konfirmasi Pembayaran (Tambah 30 Hari)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
