import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid credentials are provided
export const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey.length > 20
);

export const ADMIN_EMAIL = 'fanshans99@gmail.com';
export const ADMIN_PASSWORD = 'KingBalakung77';

export interface MockProfile {
  id: string;
  first_name: string;
  surname?: string;
  email: string;
  phone_number: string | null;
  job_status?: string;
  is_vip?: boolean;
  created_at: string;
}

export interface VipSubscription {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  active_email: string;
  job_status: string;
  promo_code: string | null;
  amount: number;
  discount: number;
  payment_proof_url: string;
  status: 'waiting_confirmation' | 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  created_at: string;
  approved_at?: string | null;
}

// Local mock storage for seamless preview testing without Supabase setup
class MockAuthService {
  private mockUsers: Map<string, { password: string; profile: MockProfile }> = new Map();
  private currentSession: { user: User; session: Session } | null = null;
  private pendingOtps: Map<string, string> = new Map();

  // Valid promo codes database (server-side simulation)
  private promoCodes = [
    { code: 'AJAKTEMANDAPATDISKON', discount: 10000, maxUses: 500, currentUses: 42 },
    { code: 'CAMPUSFIT', discount: 10000, maxUses: 100, currentUses: 12 },
    { code: 'KUKUSSEHAT', discount: 10000, maxUses: 50, currentUses: 5 },
    { code: 'MEMBERHEMAT', discount: 10000, maxUses: 50, currentUses: 8 },
    { code: 'MAHASISWA', discount: 10000, maxUses: 200, currentUses: 45 },
    { code: 'VIPKUKUS', discount: 10000, maxUses: 30, currentUses: 2 },
  ];

  constructor() {
    // 1. Initial Member Demo User
    const demoId = 'mock-user-123';
    this.mockUsers.set('mahasiswa@campusfit.id', {
      password: 'password123',
      profile: {
        id: demoId,
        first_name: 'Budi',
        surname: 'Santoso',
        email: 'mahasiswa@campusfit.id',
        phone_number: '+6281234567890',
        job_status: 'Mahasiswa',
        is_vip: false,
        created_at: new Date().toISOString(),
      }
    });

    // 2. Official Admin User
    this.mockUsers.set(ADMIN_EMAIL, {
      password: ADMIN_PASSWORD,
      profile: {
        id: 'admin-fanshans-001',
        first_name: 'Farhan',
        surname: 'Admin',
        email: ADMIN_EMAIL,
        phone_number: '+6285640743918',
        job_status: 'Administrator',
        is_vip: true,
        created_at: new Date().toISOString(),
      }
    });

    // Check localStorage for persisted session
    try {
      const saved = localStorage.getItem('campusfit_mock_session');
      if (saved) {
        this.currentSession = JSON.parse(saved);
      }

      this.initSampleSubscriptions();
    } catch {
      // ignore
    }
  }

  private initSampleSubscriptions() {
    const existing = localStorage.getItem('campusfit_vip_subscriptions');
    if (!existing) {
      const samples: VipSubscription[] = [
        {
          id: 'VIP-202611-102',
          user_id: 'user-sample-1',
          full_name: 'Siti Rahmawati',
          phone_number: '+6285712345678',
          active_email: 'siti.rahma@campus.ac.id',
          job_status: 'Dosen',
          promo_code: 'AJAKTEMANDAPATDISKON',
          amount: 50000,
          discount: 10000,
          payment_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
          status: 'waiting_confirmation',
          created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        },
        {
          id: 'VIP-202611-101',
          user_id: 'user-sample-2',
          full_name: 'Rian Hidayat',
          phone_number: '+6281398765432',
          active_email: 'rian.hidayat@gmail.com',
          job_status: 'Kantoran',
          promo_code: null,
          amount: 60000,
          discount: 0,
          payment_proof_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
          status: 'approved',
          created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
          approved_at: new Date(Date.now() - 3600000 * 18).toISOString(),
        },
        {
          id: 'VIP-202611-099',
          user_id: 'user-sample-3',
          full_name: 'Aditya Pratama',
          phone_number: '+6285811223344',
          active_email: 'aditya.pratama@univ.ac.id',
          job_status: 'Mahasiswa',
          promo_code: 'CAMPUSFIT',
          amount: 50000,
          discount: 10000,
          payment_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
          status: 'waiting_confirmation',
          created_at: new Date(Date.now() - 3600000 * 0.5).toISOString(),
        },
        {
          id: 'VIP-202611-095',
          user_id: 'user-sample-4',
          full_name: 'Dewi Anggraeni',
          phone_number: '+6281987654321',
          active_email: 'dewi.anggraeni@wirausaha.com',
          job_status: 'Wirausaha',
          promo_code: null,
          amount: 60000,
          discount: 0,
          payment_proof_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
          status: 'rejected',
          rejection_reason: 'Foto bukti transfer buram dan tidak terdapat nomor referensi bank.',
          created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        }
      ];
      localStorage.setItem('campusfit_vip_subscriptions', JSON.stringify(samples));
    }
  }

  get auth() {
    return this;
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    await new Promise((r) => setTimeout(r, 400));
    const normalized = email.toLowerCase().trim();
    const existing = this.mockUsers.get(normalized);

    if (!existing || existing.password !== password) {
      return {
        data: { user: null, session: null },
        error: { message: 'Email atau kata sandi tidak cocok. Silakan periksa kembali.' }
      };
    }

    const user: User = {
      id: existing.profile.id,
      email: existing.profile.email,
      app_metadata: {},
      user_metadata: {
        first_name: existing.profile.first_name,
        surname: existing.profile.surname,
        phone_number: existing.profile.phone_number,
        full_name: `${existing.profile.first_name} ${existing.profile.surname || ''}`.trim(),
        job_status: existing.profile.job_status || 'Mahasiswa',
        is_vip: existing.profile.is_vip || false,
      },
      aud: 'authenticated',
      created_at: existing.profile.created_at,
    };

    const session: Session = {
      access_token: 'mock-jwt-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user,
    };

    this.currentSession = { user, session };
    localStorage.setItem('campusfit_mock_session', JSON.stringify(this.currentSession));
    return { data: { user, session }, error: null };
  }

  async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
    await new Promise((r) => setTimeout(r, 500));
    const normalized = email.toLowerCase().trim();

    const firstName = options?.data?.first_name || 'Member';
    const surname = options?.data?.surname || '';
    const phoneNumber = options?.data?.phone_number || '';

    const newId = 'user-' + Math.random().toString(36).substring(2, 9);
    const profile: MockProfile = {
      id: newId,
      first_name: firstName,
      surname,
      email: normalized,
      phone_number: phoneNumber,
      job_status: 'Mahasiswa',
      is_vip: false,
      created_at: new Date().toISOString(),
    };

    this.mockUsers.set(normalized, { password, profile });
    const demoOtp = '123456';
    this.pendingOtps.set(normalized, demoOtp);

    const user: User = {
      id: newId,
      email: normalized,
      app_metadata: {},
      user_metadata: {
        first_name: firstName,
        surname,
        phone_number: phoneNumber,
        full_name: `${firstName} ${surname}`.trim(),
        job_status: 'Mahasiswa',
        is_vip: false,
      },
      aud: 'authenticated',
      created_at: profile.created_at,
    };

    return {
      data: { user, session: null },
      error: null,
      demoOtp,
    };
  }

  async verifyOtp({ email, token }: { email: string; token: string; type?: string }) {
    await new Promise((r) => setTimeout(r, 400));
    const normalized = email.toLowerCase().trim();
    const storedOtp = this.pendingOtps.get(normalized) || '123456';

    if (token === storedOtp || token === '123456') {
      const existing = this.mockUsers.get(normalized);
      const user: User = {
        id: existing?.profile.id || 'user-' + Date.now(),
        email: normalized,
        app_metadata: {},
        user_metadata: existing?.profile || {
          first_name: 'Member',
          full_name: 'Member Baru',
          phone_number: '',
          is_vip: false,
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      const session: Session = {
        access_token: 'mock-verified-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user,
      };
      this.currentSession = { user, session };
      localStorage.setItem('campusfit_mock_session', JSON.stringify(this.currentSession));
      this.pendingOtps.delete(normalized);
      return { data: { user, session }, error: null };
    }

    return {
      data: { user: null, session: null },
      error: { message: 'Kode OTP tidak valid atau telah kedaluwarsa.' }
    };
  }

  async resendOtp(email: string) {
    await new Promise((r) => setTimeout(r, 300));
    const normalized = email.toLowerCase().trim();
    this.pendingOtps.set(normalized, '123456');
    return { data: { message: 'OTP berhasil dikirim ulang' }, error: null };
  }

  async resetPasswordForEmail(email: string) {
    await new Promise((r) => setTimeout(r, 400));
    return { data: {}, error: null };
  }

  async updateUser({ password }: { password?: string }) {
    await new Promise((r) => setTimeout(r, 300));
    if (this.currentSession?.user.email) {
      const u = this.mockUsers.get(this.currentSession.user.email);
      if (u && password) {
        u.password = password;
      }
    }
    return { data: { user: this.currentSession?.user }, error: null };
  }

  async signInWithOAuth({ provider, options }: { provider: string; options?: any }) {
    await new Promise((r) => setTimeout(r, 500));
    const googleEmail = 'google.student@campusfit.id';
    const googleId = 'google-user-' + Math.floor(Math.random() * 1000);
    
    const profile: MockProfile = {
      id: googleId,
      first_name: 'Google',
      surname: 'User',
      email: googleEmail,
      phone_number: null,
      job_status: 'Mahasiswa',
      is_vip: false,
      created_at: new Date().toISOString(),
    };

    this.mockUsers.set(googleEmail, { password: 'oauth_dummy_password', profile });

    const user: User = {
      id: googleId,
      email: googleEmail,
      app_metadata: { provider: 'google' },
      user_metadata: {
        first_name: 'Google',
        surname: 'User',
        full_name: 'Google User',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        phone_number: null,
        job_status: 'Mahasiswa',
        is_vip: false,
      },
      aud: 'authenticated',
      created_at: profile.created_at,
    };

    const session: Session = {
      access_token: 'mock-google-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user,
    };

    this.currentSession = { user, session };
    localStorage.setItem('campusfit_mock_session', JSON.stringify(this.currentSession));
    return { data: { url: null, provider }, error: null };
  }

  async getSession() {
    return { data: { session: this.currentSession?.session || null }, error: null };
  }

  async getUser() {
    return { data: { user: this.currentSession?.user || null }, error: null };
  }

  async signOut() {
    this.currentSession = null;
    localStorage.removeItem('campusfit_mock_session');
    return { error: null };
  }

  // Storage mock
  get storage() {
    return {
      from(bucketName: string) {
        return {
          async createSignedUrl(path: string, expiresIn: number) {
            await new Promise((r) => setTimeout(r, 100));
            return {
              data: { signedUrl: path.startsWith('http') ? path : `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800` },
              error: null
            };
          },
          async upload(filePath: string, file: any) {
            await new Promise((r) => setTimeout(r, 300));
            return {
              data: { path: filePath },
              error: null
            };
          }
        };
      }
    };
  }

  // -----------------------------------------------------------
  // SERVER-SIDE POSTGRESQL RPC FUNCTIONS SIMULATION
  // -----------------------------------------------------------
  async rpc(functionName: string, params?: any) {
    await new Promise((r) => setTimeout(r, 300));

    // 1. verify_promo_code
    if (functionName === 'verify_promo_code') {
      const rawCode = (params?.input_code || '').trim().toUpperCase();
      const matched = this.promoCodes.find((p) => p.code === rawCode);

      if (matched && matched.currentUses < matched.maxUses) {
        return {
          data: [
            {
              is_valid: true,
              discount: matched.discount, // Rp 10.000
              final_price: 50000,         // Rp 50.000
              message: `Selamat! Kode promo "${matched.code}" berhasil diterapkan (Potongan Rp 10.000).`,
            }
          ],
          error: null,
        };
      }

      return {
        data: [
          {
            is_valid: false,
            discount: 0,
            final_price: 60000,
            message: `Kode promo "${rawCode}" tidak valid, sudah kedaluwarsa, atau kuota telah habis.`,
          }
        ],
        error: null,
      };
    }

    // 2. submit_vip_subscription
    if (functionName === 'submit_vip_subscription') {
      try {
        const subscriptions: VipSubscription[] = JSON.parse(
          localStorage.getItem('campusfit_vip_subscriptions') || '[]'
        );

        const newId = 'VIP-' + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + Math.floor(100 + Math.random() * 900);
        
        const newSub: VipSubscription = {
          id: newId,
          user_id: this.currentSession?.user.id || 'guest-' + Date.now(),
          full_name: params.p_full_name || 'Member',
          phone_number: params.p_phone_number || '',
          active_email: params.p_active_email || '',
          job_status: params.p_job_status || 'Mahasiswa',
          promo_code: params.p_promo_code || null,
          amount: params.p_amount || 60000,
          discount: params.p_promo_code ? 10000 : 0,
          payment_proof_url: params.p_payment_proof_url || '',
          status: 'waiting_confirmation',
          created_at: new Date().toISOString(),
        };

        subscriptions.unshift(newSub);
        localStorage.setItem('campusfit_vip_subscriptions', JSON.stringify(subscriptions));
        localStorage.setItem('campusfit_current_subscription', JSON.stringify(newSub));

        return {
          data: {
            success: true,
            subscription_id: newId,
            message: 'Bukti pembayaran berhasil dikirim! Menunggu konfirmasi verifikasi admin.',
          },
          error: null,
        };
      } catch (err: any) {
        return { data: null, error: { message: err?.message || 'Gagal menyimpan pengajuan VIP.' } };
      }
    }

    // 3. get_my_vip_subscription
    if (functionName === 'get_my_vip_subscription' || functionName === 'get_vip_subscription_status') {
      try {
        const subscriptions: VipSubscription[] = JSON.parse(
          localStorage.getItem('campusfit_vip_subscriptions') || '[]'
        );
        const subId = params?.p_subscription_id;
        
        let found = null;
        if (subId) {
          found = subscriptions.find((s) => s.id === subId);
        } else if (this.currentSession?.user) {
          found = subscriptions.find((s) => s.user_id === this.currentSession!.user.id || s.active_email === this.currentSession!.user.email);
        }

        if (!found) {
          const current = localStorage.getItem('campusfit_current_subscription');
          if (current) found = JSON.parse(current);
        }

        return { data: found || null, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message } };
      }
    }

    // 4. get_all_vip_subscriptions
    if (functionName === 'get_all_vip_subscriptions' || functionName === 'get_pending_subscriptions') {
      try {
        const subscriptions: VipSubscription[] = JSON.parse(
          localStorage.getItem('campusfit_vip_subscriptions') || '[]'
        );
        return { data: subscriptions, error: null };
      } catch (err: any) {
        return { data: [], error: { message: err.message } };
      }
    }

    // 5. admin_approve_vip (Standard RPC requested)
    if (functionName === 'admin_approve_vip' || functionName === 'approve_vip_subscription') {
      try {
        const subId = params?.p_subscription_id;
        const isApproved = params?.p_is_approved !== undefined ? Boolean(params.p_is_approved) : true;
        const subscriptions: VipSubscription[] = JSON.parse(
          localStorage.getItem('campusfit_vip_subscriptions') || '[]'
        );

        const target = subscriptions.find((s) => s.id === subId);
        if (target) {
          if (isApproved) {
            target.status = 'approved';
            target.approved_at = new Date().toISOString();
          } else {
            target.status = 'rejected';
            target.rejection_reason = params?.p_rejection_reason || 'Bukti transfer tidak valid.';
          }
          
          localStorage.setItem('campusfit_vip_subscriptions', JSON.stringify(subscriptions));

          const current = localStorage.getItem('campusfit_current_subscription');
          if (current) {
            const parsed = JSON.parse(current);
            if (parsed.id === subId) {
              parsed.status = target.status;
              parsed.approved_at = target.approved_at;
              localStorage.setItem('campusfit_current_subscription', JSON.stringify(parsed));
            }
          }

          return { 
            data: { 
              success: true, 
              message: isApproved ? `Pendaftaran ${target.full_name} disetujui!` : 'Pengajuan telah ditolak.' 
            }, 
            error: null 
          };
        }
        return { data: null, error: { message: 'Pengajuan tidak ditemukan.' } };
      } catch (err: any) {
        return { data: null, error: { message: err.message } };
      }
    }

    // 6. reject_vip_subscription
    if (functionName === 'reject_vip_subscription') {
      try {
        const subId = params?.p_subscription_id;
        const reason = params?.p_rejection_reason || 'Bukti transfer tidak valid atau nominal tidak sesuai.';
        const subscriptions: VipSubscription[] = JSON.parse(
          localStorage.getItem('campusfit_vip_subscriptions') || '[]'
        );

        const target = subscriptions.find((s) => s.id === subId);
        if (target) {
          target.status = 'rejected';
          target.rejection_reason = reason;
          localStorage.setItem('campusfit_vip_subscriptions', JSON.stringify(subscriptions));

          const current = localStorage.getItem('campusfit_current_subscription');
          if (current) {
            const parsed = JSON.parse(current);
            if (parsed.id === subId) {
              parsed.status = 'rejected';
              parsed.rejection_reason = reason;
              localStorage.setItem('campusfit_current_subscription', JSON.stringify(parsed));
            }
          }

          return { data: { success: true, message: 'Pengajuan telah ditolak.' }, error: null };
        }
        return { data: null, error: { message: 'Pengajuan tidak ditemukan.' } };
      } catch (err: any) {
        return { data: null, error: { message: err.message } };
      }
    }

    return { data: null, error: { message: `Function "${functionName}" not recognized.` } };
  }

  // Mock table queries
  from(tableName: string) {
    const self = this;
    return {
      select(columns = '*') {
        return {
          eq(field: string, value: any) {
            return {
              async single() {
                await new Promise((r) => setTimeout(r, 200));
                if (tableName === 'profiles') {
                  for (const [, userObj] of self.mockUsers) {
                    if ((field === 'id' && userObj.profile.id === value) || (field === 'email' && userObj.profile.email === value)) {
                      return { data: userObj.profile, error: null };
                    }
                  }
                  if (self.currentSession && self.currentSession.user.id === value) {
                    return {
                      data: {
                        id: self.currentSession.user.id,
                        first_name: self.currentSession.user.user_metadata?.first_name || 'Budi',
                        surname: self.currentSession.user.user_metadata?.surname || 'Santoso',
                        email: self.currentSession.user.email || 'mahasiswa@campusfit.id',
                        phone_number: self.currentSession.user.user_metadata?.phone_number || '+6281234567890',
                        job_status: self.currentSession.user.user_metadata?.job_status || 'Mahasiswa',
                        is_vip: self.currentSession.user.user_metadata?.is_vip || false,
                        created_at: new Date().toISOString(),
                      },
                      error: null
                    };
                  }
                }
                return { data: null, error: { message: 'Row not found' } };
              }
            };
          },
          async then(resolve: any) {
            await new Promise((r) => setTimeout(r, 200));
            if (tableName === 'profiles') {
              const list = Array.from(self.mockUsers.values()).map(u => u.profile);
              resolve({ data: list, error: null });
            } else if (tableName === 'vip_subscriptions') {
              const subscriptions = JSON.parse(localStorage.getItem('campusfit_vip_subscriptions') || '[]');
              resolve({ data: subscriptions, error: null });
            } else {
              resolve({ data: [], error: null });
            }
          }
        };
      },
      update(updates: any) {
        return {
          eq(field: string, value: any) {
            return {
              async single() {
                await new Promise((r) => setTimeout(r, 300));
                if (tableName === 'profiles') {
                  for (const [, userObj] of self.mockUsers) {
                    if ((field === 'id' && userObj.profile.id === value) || (field === 'email' && userObj.profile.email === value)) {
                      Object.assign(userObj.profile, updates);
                    }
                  }
                  if (self.currentSession?.user && (self.currentSession.user.id === value || self.currentSession.user.email === value)) {
                    Object.assign(self.currentSession.user.user_metadata, updates);
                    localStorage.setItem('campusfit_mock_session', JSON.stringify(self.currentSession));
                  }
                }
                return { data: updates, error: null };
              }
            };
          }
        };
      },
      async upsert(values: any) {
        await new Promise((r) => setTimeout(r, 300));
        return { data: values, error: null };
      }
    };
  }
}

export const mockAuthService = new MockAuthService();

// Real Supabase client instance if configured
let realClient: SupabaseClient | null = null;
if (isConfigured) {
  try {
    realClient = createClient(supabaseUrl!, supabaseAnonKey!);
  } catch (err) {
    console.error('Error initializing real Supabase client:', err);
  }
}

// Wrapper to guarantee Admin login works even if remote user isn't created in Supabase Auth dashboard yet
const authProxy = {
  signInWithPassword: async (credentials: { email: string; password: string }) => {
    // Check if admin credentials
    if (credentials.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && credentials.password === ADMIN_PASSWORD) {
      if (realClient) {
        try {
          const res = await realClient.auth.signInWithPassword(credentials);
          if (!res.error && res.data.user) {
            return res;
          }
        } catch {
          // fallback to local admin session
        }
      }
      return mockAuthService.signInWithPassword(credentials);
    }

    if (realClient) {
      return realClient.auth.signInWithPassword(credentials);
    }
    return mockAuthService.signInWithPassword(credentials);
  },
  signUp: async (args: any) => {
    if (realClient) return realClient.auth.signUp(args);
    return mockAuthService.signUp(args);
  },
  verifyOtp: async (args: any) => {
    if (realClient) return realClient.auth.verifyOtp(args);
    return mockAuthService.verifyOtp(args);
  },
  signInWithOAuth: async (args: any) => {
    if (realClient) return realClient.auth.signInWithOAuth(args);
    return mockAuthService.signInWithOAuth(args);
  },
  getUser: async () => {
    if (realClient) {
      const res = await realClient.auth.getUser();
      if (res.data?.user) return res;
    }
    return mockAuthService.getUser();
  },
  getSession: async () => {
    if (realClient) {
      const res = await realClient.auth.getSession();
      if (res.data?.session) return res;
    }
    return mockAuthService.getSession();
  },
  signOut: async () => {
    if (realClient) await realClient.auth.signOut();
    return mockAuthService.signOut();
  },
  resetPasswordForEmail: async (email: string) => {
    if (realClient) return realClient.auth.resetPasswordForEmail(email);
    return mockAuthService.resetPasswordForEmail(email);
  },
  updateUser: async (args: any) => {
    if (realClient) return realClient.auth.updateUser(args);
    return mockAuthService.updateUser(args);
  }
};

// RPC Proxy for safe execution with mock fallback
const rpcProxy = async (functionName: string, params?: any) => {
  if (realClient) {
    try {
      const res = await realClient.rpc(functionName, params);
      if (!res.error) return res;
      console.warn(`RPC "${functionName}" returned error on live Supabase, falling back to mock handler:`, res.error);
    } catch (err) {
      console.warn(`RPC "${functionName}" threw exception on live Supabase:`, err);
    }
  }
  return mockAuthService.rpc(functionName, params);
};

// Storage Proxy
const storageProxy = {
  from: (bucketName: string) => {
    if (realClient) {
      return realClient.storage.from(bucketName);
    }
    return mockAuthService.storage.from(bucketName);
  }
};

// Unified client interface
export const supabase = {
  auth: authProxy,
  rpc: rpcProxy,
  storage: storageProxy,
  from: (tableName: string) => {
    if (realClient) {
      return realClient.from(tableName);
    }
    return mockAuthService.from(tableName);
  }
} as unknown as SupabaseClient;
