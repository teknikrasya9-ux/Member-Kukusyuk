import { createClient, SupabaseClient, User, Session, AuthResponse } from '@supabase/supabase-js';

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

export interface MockProfile {
  id: string;
  first_name: string;
  surname?: string;
  email: string;
  phone_number: string | null;
  created_at: string;
}

// Local mock storage for seamless preview testing without Supabase setup
class MockAuthService {
  private mockUsers: Map<string, { password: string; profile: MockProfile }> = new Map();
  private currentSession: { user: User; session: Session } | null = null;
  private pendingOtps: Map<string, string> = new Map();

  constructor() {
    // Initial demo user
    const demoId = 'mock-user-123';
    this.mockUsers.set('mahasiswa@campusfit.id', {
      password: 'password123',
      profile: {
        id: demoId,
        first_name: 'Budi',
        surname: 'Santoso',
        email: 'mahasiswa@campusfit.id',
        phone_number: '81234567890',
        created_at: new Date().toISOString(),
      }
    });

    // Check localStorage for persisted session in preview
    try {
      const saved = localStorage.getItem('campusfit_mock_session');
      if (saved) {
        this.currentSession = JSON.parse(saved);
      }
    } catch {
      // ignore
    }
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    await new Promise((r) => setTimeout(r, 600));
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
    await new Promise((r) => setTimeout(r, 700));
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
      created_at: new Date().toISOString(),
    };

    this.mockUsers.set(normalized, { password, profile });
    // Generate 6-digit OTP code (default demo code: 123456 or random)
    const demoOtp = '123456';
    this.pendingOtps.set(normalized, demoOtp);

    const user: User = {
      id: newId,
      email: normalized,
      app_metadata: {},
      user_metadata: { first_name: firstName, surname, phone_number: phoneNumber },
      aud: 'authenticated',
      created_at: profile.created_at,
    };

    return {
      data: { user, session: null },
      error: null,
      demoOtp, // helpful for user hint in preview mode
    };
  }

  async verifyOtp({ email, token }: { email: string; token: string; type?: string }) {
    await new Promise((r) => setTimeout(r, 600));
    const normalized = email.toLowerCase().trim();
    const storedOtp = this.pendingOtps.get(normalized) || '123456';

    // Allow token 123456 or storedOtp for easy testing
    if (token === storedOtp || token === '123456') {
      const existing = this.mockUsers.get(normalized);
      const user: User = {
        id: existing?.profile.id || 'user-' + Date.now(),
        email: normalized,
        app_metadata: {},
        user_metadata: existing?.profile || {},
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
      error: { message: 'Kode OTP tidak valid atau telah kedaluwarsa. Gunakan kode 123456 pada Demo Mode.' }
    };
  }

  async resendOtp(email: string) {
    await new Promise((r) => setTimeout(r, 500));
    const normalized = email.toLowerCase().trim();
    const newOtp = '123456';
    this.pendingOtps.set(normalized, newOtp);
    return { data: { message: 'OTP berhasil dikirim ulang' }, error: null };
  }

  async resetPasswordForEmail(email: string) {
    await new Promise((r) => setTimeout(r, 600));
    return { data: {}, error: null };
  }

  async updateUser({ password }: { password?: string }) {
    await new Promise((r) => setTimeout(r, 500));
    if (this.currentSession?.user.email) {
      const u = this.mockUsers.get(this.currentSession.user.email);
      if (u && password) {
        u.password = password;
      }
    }
    return { data: { user: this.currentSession?.user }, error: null };
  }

  async signInWithOAuth({ provider, options }: { provider: string; options?: any }) {
    await new Promise((r) => setTimeout(r, 800));
    // Simulate Google OAuth login
    const googleEmail = 'google.student@campusfit.id';
    const googleId = 'google-user-' + Math.floor(Math.random() * 1000);
    
    // In Google Auth, user profile might initially NOT have phone number
    const profile: MockProfile = {
      id: googleId,
      first_name: 'Google',
      surname: 'User',
      email: googleEmail,
      phone_number: null, // intentionally null to trigger interceptor if redirect=checkout!
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
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        phone_number: null,
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

  // Mock table queries
  from(tableName: string) {
    const self = this;
    return {
      select(columns = '*') {
        return {
          eq(field: string, value: any) {
            return {
              async single() {
                await new Promise((r) => setTimeout(r, 300));
                if (tableName === 'profiles') {
                  const userEntry = Array.from(self.mockUsers.values()).find(
                    (u) => (field === 'id' && u.profile.id === value) || (field === 'email' && u.profile.email === value)
                  );
                  if (userEntry) {
                    return { data: userEntry.profile, error: null };
                  }
                  // Check current session
                  if (self.currentSession && self.currentSession.user.id === value) {
                    return {
                      data: {
                        id: self.currentSession.user.id,
                        first_name: self.currentSession.user.user_metadata?.first_name || 'Member',
                        surname: self.currentSession.user.user_metadata?.surname || '',
                        email: self.currentSession.user.email || '',
                        phone_number: self.currentSession.user.user_metadata?.phone_number || null,
                        created_at: new Date().toISOString(),
                      },
                      error: null
                    };
                  }
                }
                return { data: null, error: { message: 'Row not found' } };
              }
            };
          }
        };
      },
      update(updates: any) {
        return {
          eq(field: string, value: any) {
            return {
              async single() {
                await new Promise((r) => setTimeout(r, 400));
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
        await new Promise((r) => setTimeout(r, 400));
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

// Unified client interface
export const supabase = realClient || (mockAuthService as unknown as SupabaseClient);

// Helper for UI to know state
export const isUsingDemoMode = !isConfigured;
